import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * @method GET /elevenlabs/get-signed-url
   * @description Internal endpoint for ElevenLabs to get signed URL
   */
  app.get('/get-signed-url', {
    schema: {
      querystring: z.object({
        agentId: z.string().optional(), // Optional if you want to use env var
      }),
    },
    async handler(req, reply) {
      console.log('[ELEVENLABS] Generating signed URL');
      const { agentId } = req.query;
      try {
        if (!agentId) {
          return reply.status(400).send({
            error: 'Agent ID is required either as  parameter',
          });
        }

        if (!process.env.ELEVENLABS_API_KEY) {
          app.log.error(
            'ELEVENLABS_API_KEY not found in environment variables',
          );
          return reply.status(500).send({
            error: 'ElevenLabs API key not configured',
          });
        }

        app.log.info(`Generating signed URL for agent: ${agentId}`);

        // Call ElevenLabs API to get signed URL
        const response = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
          {
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY,
            },
          },
        );

        if (!response.ok) {
          app.log.error(
            `Failed to get signed URL: ${response.status} ${response.statusText} ${await response.text()}`,
          );
          return reply.status(500).send('Failed to get signed URL');
        }

        const body: any = await response.json();
        app.log.info('Signed URL generated successfully');

        return reply.send({
          signedUrl: body?.signed_url,
        });
      } catch (error: unknown) {
        app.log.error({ err: error }, 'Error getting signed URL:');
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        return reply.status(500).send({
          error: 'Failed to get signed URL',
          details: errorMessage,
        });
      }
    },
  });

  app.log.info(
    '[elevenlabs/signed-url.ts] ElevenLabs signed URL routes registered',
  );
};

export default router;
