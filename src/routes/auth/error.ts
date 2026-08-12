import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getAgenda } from '../../jobs/agenda.js';
import {
  SLACK_ERROR_REPORTER_CHANNEL_ID,
  SLACK_REPORT_TYPES,
} from '../../utils/constants.js';

const AUTH0_CLIENT_IDS = {
  '33TQ5PuLfvnKO4wySmtAstzXJnrRGhJU': {
    name: 'Hupo Core',
    url: 'https://app.hupo.co',
  },
  xB26uY6fRypJXgXTUpmU7n8Hvu20qNhl: {
    name: 'Hupo AI',
    url: 'https://ai.hupo.co',
  },
  '5CJSpwcZX9SatQ5CegbxjfNRpZmJMSx0': {
    name: 'Hupo Connect',
    url: 'https://connect.hupo.co',
  },
  mkYm1h3ULp5hKGAMGmY45TCXt6r5ByAK: {
    name: 'Hupo Sales',
    url: 'https://train.hupo.co',
  },
  '6ZpGtXowkUDEQUyMSKwDRdCno5Mscxiz': {
    name: 'Hupo Sales manage app',
    url: 'https://train.hupo.co',
  },
} as Record<string, { name: string; url: string }>;

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.get(
    '/auth0-error',
    {
      schema: {
        querystring: z.object({
          client_id: z.string().optional(),
          connection: z.string().optional(),
          lang: z.string().optional(),
          error: z.string(),
          error_description: z.string(),
          tracking: z.string().optional(),
          log_url: z.string().optional(),
        }),
      },
    },
    async (req, reply) => {
      const params = req.query;
      let clientUrl = 'https://train.hupo.co';

      if (!params.client_id) {
        return reply.send({ ok: false, message: 'App ID is missing' });
      }

      if (params.client_id in AUTH0_CLIENT_IDS) {
        clientUrl = AUTH0_CLIENT_IDS[params.client_id].url;
      }

      const agenda = getAgenda();
      await agenda.now('post-slack-report', {
        type: SLACK_REPORT_TYPES.AUTH0_ERROR,
        payload: {
          channel: SLACK_ERROR_REPORTER_CHANNEL_ID,
          error: params.error,
          error_description: params.error_description,
          client_id: params.client_id,
          connection: params.connection,
          lang: params.lang,
          tracking: params.tracking,
        },
      });

      return reply.redirect(
        `${clientUrl}/auth/error?error=${params.error}&error_description=${params.error_description}`,
      );
    },
  );

  app.log.info('[auth/error.ts] router registered');
};

export default router;
