import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  await app.register(import('./auth/success.js'), {
    prefix: '/auth',
  });

  await app.register(import('./auth/me.js'), {
    prefix: '/auth/me',
  });

  await app.register(import('./dashboard.js'), {
    prefix: '/dashboard',
  });

  await app.register(import('./users.js'), {
    prefix: '/users',
  });

  await app.register(import('./report.js'), {
    prefix: '/report',
  });

  await app.register(import('./feedback.js'), {
    prefix: '/feedback',
  });

  await app.register(import('./products.js'), {
    prefix: '/products',
  });

  await app.register(import('./issues.js'), {
    prefix: '/issues',
  });

  await app.register(import('./persona.js'), {
    prefix: '/persona',
  });

  await app.register(import('./voice.js'), {
    prefix: '/voice',
  });

  await app.register(import('./scorecard.js'), {
    prefix: '/scorecard',
  });

  await app.register(import('./scenario.js'), {
    prefix: '/scenario',
  });

  await app.register(import('./settings/users.js'), {
    prefix: '/settings/users',
  });

  await app.register(import('./settings/teams.js'), {
    prefix: '/settings/teams',
  });

  await app.register(import('./settings/bulkInvite.js'), {
    prefix: '/settings/bulk-invite',
  });

  await app.register(import('./leaderboard.js'), {
    prefix: '/leaderboard',
  });

  await app.register(import('./call-analysis.js'), {
    prefix: '/call-analysis',
  });

  app.log.info('[manage/index.ts] router registered');
};

export default router;
