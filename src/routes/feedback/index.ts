import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getAgenda } from '../../jobs/agenda.js';
import { setupUniversalAuth } from '../../middleware/conditionalAuth.js';
import { Company } from '../../models/Company.js';
import { SalesFeedback } from '../../models/SalesFeedback.js';
import { SalesSession } from '../../models/SalesSession.js';
import {
  SLACK_FEEDBACK_CHANNEL_ID,
  SLACK_REPORT_TYPES,
} from '../../utils/constants.js';
import { getLanguageHeader } from '../../locale/request.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Middleware to check if the user is authenticated
   */
  setupUniversalAuth(app);

  /**
   * @method POST /feedback
   * @description Create new feedback
   */
  app.route({
    url: '/',
    method: 'POST',
    schema: {
      body: z.object({
        sessionId: z.string(),
        responses: z
          .array(
            z.object({
              question: z.string().min(1),
              answer: z.string().min(1),
            }),
          )
          .min(1),
      }),
    },
    preHandler: app.authenticate,
    async handler(req, reply) {
      const { sessionId, responses } = req.body;
      const language = getLanguageHeader(req);

      await SalesFeedback.create({
        user: req.user!._id,
        session: sessionId,
        responses,
        language,
      });

      const session = await SalesSession.findById(sessionId)
        .select('roleplay.conversation scenario persona product')
        .populate({
          path: 'scenario',
          populate: [
            { path: 'module', select: 'title friendlyId' },
            { path: 'persona', select: 'name friendlyId' },
            { path: 'product', select: 'name friendlyId' },
          ],
        });
      const company = await Company.findById(req.user?.company).select('name');

      // Extract persona, module, and product names
      let personaName: string | undefined;
      let moduleName: string | undefined;
      let productName: string | undefined;

      // Try to get from new scenario structure first
      if (session?.scenario) {
        const scenario = session.scenario as any;
        personaName = scenario.persona?.name;
        moduleName = scenario.module?.title;
        productName = scenario.product?.name;
      }
      // Fallback to legacy fields if scenario is not available
      if (!personaName && session?.persona) {
        personaName = (session.persona as any).name;
      }
      if (!productName && session?.product) {
        productName = (session.product as any).name;
      }

      await getAgenda().now('post-slack-report', {
        type: SLACK_REPORT_TYPES.SESSION_FEEDBACK_SUBMITTED,
        payload: {
          channel: SLACK_FEEDBACK_CHANNEL_ID,
          user: req.user,
          company,
          responses,
          conversation: session?.roleplay?.conversation,
          link: `https://train.hupo.co/roleplay/${sessionId}`,
          language,
          persona: personaName,
          module: moduleName,
          product: productName,
        },
      });

      return reply.send({ success: true });
    },
  });

  app.log.info('[feedback/index.ts] routes registered');
};

export default router;
