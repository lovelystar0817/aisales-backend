import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  await app.register(import('./call-analysis.js'), {
    prefix: '/call-analysis',
  });

  await app.register(import('./wipe-users-usage.js'), {
    prefix: '/wipe-users-usage',
  });

  await app.register(import('./delete-user.js'), {
    prefix: '/delete-user',
  });

  await app.register(import('./translate.js'), {
    prefix: '/translate',
  });

  await app.register(import('./migrate-scorecard-fields.js'), {
    prefix: '/migrate-scorecard-fields',
  });

  app.log.info('[admin/index.ts] router registered');
};

export default router;
