import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { User } from '../../models/User.js';
import { Company } from '../../models/Company.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Endpoint for Auth0 Action to check user status
  app.get(
    '/check-status',
    {
      schema: {
        querystring: z.object({
          auth0Id: z.string(),
          email: z.string().email(),
        }),
      },
    },
    async (req, reply) => {
      const { auth0Id, email } = req.query;

      // Find user by auth0Id
      const user = await User.findOne({
        auth0Id,
        email,
      });

      if (!user) {
        app.log.info(
          `[auth/check-status.ts] User not found, auth0Id=${auth0Id}, email=${email}`,
        );
        // User doesn't exist yet (new signup) - allow it
        return reply.send({
          status: 'new_user',
          isDeleted: false,
        });
      }

      app.log.info(
        `[auth/check-status.ts] User found, auth0Id=${auth0Id}, email=${email}, status=${user.status}, isDeleted=${user.isDeleted}`,
      );

      // Return user status
      return reply.send({
        status: user.status,
        isDeleted: user.isDeleted || false,
        userId: user._id,
      });
    },
  );

  app.log.info('[auth/check-status.ts] router registered');
};

export default router;
