import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { Company } from '../../models/Company.js';
import { User } from '../../models/User.js';
import { getAgenda } from '../../jobs/agenda.js';
import {
  SLACK_REPORTER_CHANNEL_ID,
  SLACK_REPORT_TYPES,
} from '../../utils/constants.js';
import { ManageUser } from '../../models/ManageUser.js';

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
        app.log.warn('[auth/success] No token provided');
        throw app.httpErrors.unauthorized('Unauthorized (no token provided)');
      }

      const body = req.body;
      app.log.info(
        `[auth/success] Processing auth success, auth0_org_id=${body.auth0_org_id}`,
      );

      let data;
      try {
        const result = await app.userInfo.getUserInfo(token);
        data = result.data;
        app.log.info(
          `[auth/success] Got user info from Auth0, email=${data.email}, sub=${data.sub}`,
        );
      } catch (err) {
        app.log.error(
          `[auth/success] Failed to get user info from Auth0: ${err instanceof Error ? err.message : err}`,
        );
        throw app.httpErrors.unauthorized('Failed to verify token with Auth0');
      }

      const company = await Company.findOne({
        auth0OrgId: body.auth0_org_id,
      }).select('name trialEndsAt languages');

      if (!company) {
        app.log.error(
          `[auth/success] Company not found for auth0_org_id=${body.auth0_org_id}, email=${data.email}`,
        );
        throw app.httpErrors.badRequest(
          `Company not found for organization. Please contact support.`,
        );
      }

      app.log.info(
        `[auth/success] Found company=${company.name} for auth0_org_id=${body.auth0_org_id}`,
      );

      let user = await User.findOne({ email: data.email, company: company._id }).populate(
        'company',
        'name trialEndsAt languages',
      );

      if (user && (user.status === 'inactive' || user.isDeleted)) {
        app.log.warn(
          `[auth/success] User account deactivated, email=${data.email}, status=${user.status}, isDeleted=${user.isDeleted}`,
        );
        throw app.httpErrors.unauthorized('User account has been deactivated');
      }

      // Check if there's a ManageUser with this email
      const manageUser = await ManageUser.findOne({
        email: data.email,
        company: company._id
      });

      if (manageUser) {
        app.log.info(
          `[auth/success] Found ManageUser record for email=${data.email}, role=${manageUser.role}`,
        );
      }

      if (
        manageUser &&
        (manageUser.status === 'inactive' || manageUser.isDeleted)
      ) {
        app.log.warn(
          `[auth/success] ManageUser account deactivated, email=${data.email}, status=${manageUser.status}, isDeleted=${manageUser.isDeleted}`,
        );
        throw app.httpErrors.unauthorized('User account has been deactivated');
      }

      if (!user) {
        app.log.info(
          `[auth/success] User not found in DB, creating new user, email=${data.email}, auth0_org_id=${body.auth0_org_id}`,
        );

        try {
          user = await User.create({
            auth0Id: data.sub,
            email: data.email,
            name: data.name,
            firstName: data.given_name,
            lastName: data.family_name,
            company: company._id,
            teams: manageUser?.teams?.length ? manageUser.teams : undefined,
            status: 'active',
            emailVerified: true,
          });
          app.log.info(
            `[auth/success] Created new user, id=${user._id}, email=${data.email}, company=${company.name}`,
          );
        } catch (err) {
          app.log.error(
            `[auth/success] Failed to create user, email=${data.email}, error=${err instanceof Error ? err.message : err}`,
          );
          throw err;
        }

        user = await user.populate('company', 'name trialEndsAt languages');

        // Handle ManageUser based on role
        if (manageUser) {
          if (manageUser.role === 'user') {
            await ManageUser.findByIdAndDelete(manageUser._id);
            app.log.info(
              `[auth/success] Deleted ManageUser record with role=user for email=${data.email}`,
            );
          } else if (
            manageUser.role === 'superadmin' ||
            manageUser.role === 'admin'
          ) {
            await ManageUser.findByIdAndUpdate(manageUser._id, {
              status: 'active',
              auth0Id: data.sub,
              email: data.email,
              name: data.name,
            });
            app.log.info(
              `[auth/success] Updated ManageUser record with role=${manageUser.role} for email=${data.email}`,
            );
          }
        }
      } else {
        app.log.info(
          `[auth/success] Existing user found, id=${user._id}, email=${data.email}`,
        )

        user.auth0Id = data.sub;
        user.name = data.name;
        user.firstName = data.given_name || '';
        user.lastName = data.family_name || '';
        user.teams = manageUser?.teams || [];
        user.status = 'active';
        user.emailVerified = true;
        await user.save();
      }

      app.log.info(
        `[auth/success] Auth success completed, userId=${user._id}, email=${user.email}`,
      );

      return reply.send({
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        picture: data.picture,
        emailVerified: true,
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

      const user = await User.findOneAndUpdate(
        { auth0Id: data.sub },
        { name },
        { new: true },
      )
        .populate('company')
        .orFail();

      const agenda = getAgenda();
      await agenda.now('post-slack-report', {
        type: SLACK_REPORT_TYPES.USER_ONBOARDED_REPORT,
        payload: {
          channel: SLACK_REPORTER_CHANNEL_ID,
          user,
          company: user.company,
        },
      });

      return reply.send({ name: user.name });
    },
  });

  app.log.info('[auth/success.ts] router registered');
};

export default router;
