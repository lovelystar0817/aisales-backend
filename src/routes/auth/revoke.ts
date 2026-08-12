import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import crypto from 'node:crypto';

import { User } from '../../models/User.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.post(
    '/revoke',
    {
      schema: {
        body: z.object({
          userId: z.string().min(1),
        }),
      },
    },
    async (req, reply) => {
      const apiKey = req.headers['x-api-key'];

      if (typeof apiKey !== 'string') {
        throw app.httpErrors.unauthorized('Unauthorized (missing API key)');
      }

      const isValid = crypto.timingSafeEqual(
        Buffer.from(apiKey),
        Buffer.from(app.config.AUTH0_TRIGGER_TOKEN),
      );

      if (!isValid) {
        throw app.httpErrors.unauthorized('Unauthorized (invalid API key)');
      }

      const { userId } = req.body;
      const user = await User.findOne({ auth0Id: userId }).orFail(
        app.httpErrors.notFound('User not found'),
      );

      user.hasChangedPassword = true;
      await user.save();

      return reply.send({ ok: true });
    },
  );

  app.log.info('[auth/revoke.ts] router registered');
};

export default router;
