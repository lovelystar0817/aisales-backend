import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { AccessToken, AgentDispatchClient } from 'livekit-server-sdk';
import { LANGUAGE_CODE_TO_NAME } from '../../utils/languages.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.get(
    '/token',
    {
      schema: {
        querystring: z.object({
          username: z.string(),
          room: z.string(),
          language: z.string().optional(),
          voiceConfig: z.string().optional(),
          firstMessage: z.string().optional(),
        }),
      },
    },
    async (req, reply) => {
      const { username, room, language, voiceConfig, firstMessage } = req.query;
      const agentName = process.env.LIVEKIT_AGENT_NAME;

      try {
        // Validate required environment variables
        if (
          !process.env.LIVEKIT_API_KEY ||
          !process.env.LIVEKIT_API_SECRET ||
          !process.env.LIVEKIT_URL
        ) {
          throw new Error('Missing required environment variables');
        }

        const at = new AccessToken(
          process.env.LIVEKIT_API_KEY,
          process.env.LIVEKIT_API_SECRET,
          {
            identity: username,
            ttl: '1h',
            metadata: language ? JSON.stringify({ language }) : undefined,
          },
        );

        at.addGrant({ roomJoin: true, room });
        const token = await at.toJwt();

        const agentDispatchClient = new AgentDispatchClient(
          process.env.LIVEKIT_URL,
          process.env.LIVEKIT_API_KEY,
          process.env.LIVEKIT_API_SECRET,
        );

        console.log('AGENT_NAME:', agentName);

        // Create dispatch and get the dispatch ID
        const dispatch = await agentDispatchClient.createDispatch(
          room,
          agentName!,
          {
            metadata: language
              ? JSON.stringify({ language, voiceConfig, firstMessage })
              : undefined,
          },
        );

        return reply.send({
          token,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error in token generation:');
        throw app.httpErrors.badRequest(
          'Failed to generate token or dispatch agent',
        );
      }
    },
  );
};

export default router;
