import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import {
  createIssueHandler,
  issueBodySchema,
} from '../../utils/issue-reporter.js';
import { logAdminAction } from '../../utils/adminLogger.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Auth: reuse manage auth like other routes
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  /**
   * @method POST /issues
   * @description Create new issue report
   */
  app.route({
    url: '/',
    method: 'POST',
    schema: {
      body: issueBodySchema,
    },
    preHandler: app.authenticate,
    async handler(req, reply) {
      const result = await createIssueHandler(req, reply, 'admin');

      // Log admin action (fire-and-forget, don't block response)
      logAdminAction(req, {
        action: 'issue_reported',
        category: 'system',
        targetType: 'Issue',
        targetName: (req.body as any)?.type || 'Issue Report',
        details: {
          type: (req.body as any)?.type,
          category: (req.body as any)?.category,
        },
      }).catch((err) => req.log.error({ err }, 'Failed to log admin action'));

      return result;
    },
  });

  app.log.info('[issues/index.ts] routes registered');
};

export default router;
