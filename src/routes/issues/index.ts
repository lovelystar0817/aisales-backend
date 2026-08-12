import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { setupUniversalAuth } from '../../middleware/conditionalAuth.js';
import {
  createIssueHandler,
  issueBodySchema,
} from '../../utils/issue-reporter.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Middleware to check if the user is authenticated
   */
  setupUniversalAuth(app);

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
      return createIssueHandler(req, reply, 'user');
    },
  });

  app.log.info('[issues/index.ts] routes registered');
};

export default router;
