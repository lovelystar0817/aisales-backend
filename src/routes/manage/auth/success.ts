import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { ManageUser } from '../../../models/ManageUser.js';
import { AllowlistManageUser } from '../../../models/AllowlistManageUser.js';
import { User } from '../../../models/User.js';
import { getAgenda } from '../../../jobs/agenda.js';
import {
  SLACK_REPORTER_CHANNEL_ID,
  SLACK_REPORT_TYPES,
} from '../../../utils/constants.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.post(
    '/success',
    {
      schema: {
        body: z.object({
          auth0_org_id: z.string(),
        }),
      },
    },
    async (req, reply) => {
      const headers = req.headers;
      const auth = headers.authorization;
      const token = auth?.split(' ')[1];

      if (!token) {
        throw app.httpErrors.unauthorized('Unauthorized (no token provided)');
      }

      const result = await app.userInfo.getUserInfo(token);
      const data = result.data;

      let user = await ManageUser.findOne({ email: data.email }).populate(
        'company',
        'name trialEndsAt',
      );

      if (user && (user.status === 'inactive' || user.isDeleted)) {
        app.log.warn(
          `[auth/success] ManageUser account deactivated, email=${data.email}, status=${user.status}, isDeleted=${user.isDeleted}`,
        );
        throw app.httpErrors.unauthorized('User account has been deactivated');
      }

      const userCheck = await User.findOne({ email: data.email });

      if (
        userCheck &&
        (userCheck.status === 'inactive' || userCheck.isDeleted)
      ) {
        app.log.warn(
          `[auth/success] User account deactivated, email=${data.email}, status=${userCheck.status}, isDeleted=${userCheck.isDeleted}`,
        );
        throw app.httpErrors.unauthorized('User account has been deactivated');
      }

      if (!user) {
        // Check if user is allowlisted
        const allowlistEntry = await AllowlistManageUser.findOne({
          email: data.email,
        }).populate('company', 'name trialEndsAt');

        if (allowlistEntry) {
          const invitedUser = await ManageUser.findOne({
            email: data.email,
            company: allowlistEntry.company,
            status: 'invited',
          }).populate('company', 'name trialEndsAt');

          if (invitedUser) {
            // Update the fields directly
            invitedUser.auth0Id = data.sub;
            invitedUser.status = 'active';
            invitedUser.name = allowlistEntry.name || data.name || '';

            // Save the changes
            user = await invitedUser.save();

            // Sync with User collection
            const existingUser = await User.findOne({ email: data.email });
            if (existingUser) {
              // Extract company ObjectId if it's populated
              const companyId =
                typeof user.company === 'object' && '_id' in user.company
                  ? user.company._id
                  : user.company;

              // Update existing User with auth0Id and teams
              existingUser.auth0Id = data.sub;
              existingUser.company = companyId;
              existingUser.teams = user.teams || [];
              existingUser.status = 'active';
              existingUser.name = user.name;
              existingUser.role = user.role;
              existingUser.isDeleted = false;
              await existingUser.save();
            }
          } else {
            // Create new ManageUser from allowlist entry
            user = await ManageUser.create({
              auth0Id: data.sub,
              email: data.email,
              name: allowlistEntry.name || data.name || '',
              company: allowlistEntry.company,
              role: allowlistEntry.role || 'admin',
              ...(allowlistEntry.teams?.length && { teams: allowlistEntry.teams }),
              status: 'active',
            });
            await user.populate('company', 'name trialEndsAt');
          }

          // Remove from allowlist after successful registration
          await AllowlistManageUser.deleteOne({ _id: allowlistEntry._id });
        } else {
          // No allowlisted user found, reject login
          throw app.httpErrors.unauthorized('Unauthorized (not allowlisted)');
        }
      } else {
        // Update the ManageUser
        user.auth0Id = data.sub;
        user.name = user.name || data.name || '';
        user.status = 'active';
        user = await user.save();
        await user.populate('company', 'name trialEndsAt');
      }

      return reply.send({
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        picture: data.picture,
        role: user.role,
        teams: user.teams,
        status: 'active',
      });
    },
  );

  app.route({
    url: '/update-name',
    method: 'POST',
    schema: {
      body: z.object({
        name: z.string().min(1),
      }),
    },
    async handler(req, reply) {
      const { name } = req.body;

      const headers = req.headers;
      const auth = headers.authorization;
      const token = auth?.split(' ')[1];

      if (!token) {
        throw app.httpErrors.unauthorized('Unauthorized (no token provided)');
      }

      const result = await app.userInfo.getUserInfo(token);
      const data = result.data;

      const user = await ManageUser.findOneAndUpdate(
        { auth0Id: data.sub },
        { name },
        { new: true },
      )
        .populate('company')
        .orFail();

      const agenda = getAgenda();
      await agenda.now('post-slack-report', {
        type: SLACK_REPORT_TYPES.ADMIN_USER_ONBOARDED_REPORT,
        payload: {
          channel: SLACK_REPORTER_CHANNEL_ID,
          user,
          company: user.company,
        },
      });

      return reply.send({ name: user.name });
    },
  });

  app.log.info('[manage/auth/success.ts] router registered');
};

export default router;
