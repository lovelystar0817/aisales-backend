import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.get('/heartbeat', {
    schema: {},
    async handler(request, reply) {
      // Intentional. Used for uptime monitoring
      return {};
    },
  });

  app.log.info('[monitoring/monitoring.ts] routes registered');
};

export default router;
