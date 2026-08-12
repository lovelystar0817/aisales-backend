import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.post('/debug-sentry', {}, async (request, reply) => {
    // This is a test route to crash the server
    // It should be removed in production
    // @ts-ignore
    throw new Error('This is a test error');
  });

  app.get('/test', {}, async (request, reply) => {
    console.log('Test');

    return { test: 'test' };
  });
};

export default router;
