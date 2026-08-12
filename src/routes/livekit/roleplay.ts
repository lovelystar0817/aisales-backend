import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ALL_SALES_MODULES } from '../../constants/modules.js';
import { DEFAULT_FRAMEWORK } from '../../frameworks/common.js';
import { getLanguageHeader } from '../../locale/request.js';
import { PersonaDocument } from '../../models/Persona.js';
import { SalesProductDocument } from '../../models/SalesProduct.js';
import { SalesSession } from '../../models/SalesSession.js';
import { getSalesVoicePrompt } from '../../prompts/sales-voice.js';
import {
  getCompetitiveIntelligence,
  getCompetitiveIntelligenceForProduct,
} from '../../utils/competitive-intelligence.js';
import { getTranslatedFramework } from '../../frameworks/common.js';
import { UserDocument } from '../../models/User.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Helper function to check if request is from LiveKit agent
   */
  const isLiveKitAgentRequest = (req: any) => {
    return (
      req.headers['x-internal-service'] === 'livekit-agent' ||
      req.headers['user-agent']?.includes('httpx') ||
      req.headers['user-agent']?.includes('LiveKit-Agent') ||
      req.headers['x-service-token'] === process.env.LIVEKIT_SERVICE_TOKEN
    );
  };

  /**
   * @method GET /livekit/:sessionId/roleplay/agent
   * @description Internal endpoint for LiveKit agent to fetch session data
   */
  app.get('/:sessionId/roleplay', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
      querystring: z.object({
        medium: z.enum(['voice']).optional().default('voice'),
      }),
    },
    async handler(req, reply) {
      const startTime = Date.now();
      const { sessionId } = req.params;
      const { medium } = req.query;

      console.log(
        `[ROLEPLAY] Starting request for sessionId: ${sessionId}, medium: ${medium}`,
      );

      try {
        // Verify this is actually a LiveKit agent request
        console.log('[ROLEPLAY] Verifying LiveKit agent request...');
        if (!isLiveKitAgentRequest(req)) {
          console.log(
            '[ROLEPLAY] ERROR: Request rejected - not from LiveKit agent',
          );
          throw app.httpErrors.forbidden(
            'This endpoint is only for internal LiveKit services',
          );
        }
        console.log('[ROLEPLAY] ✓ LiveKit agent request verified');

        const languageCode = getLanguageHeader(req);
        console.log(`[ROLEPLAY] Language code extracted: ${languageCode}`);

        // Fetch session
        console.log(`[ROLEPLAY] Fetching session with ID: ${sessionId}`);
        const session = await SalesSession.findById(sessionId)
          .populate<{ user: UserDocument }>({
            path: 'user',
            populate: { path: 'company', select: 'friendlyId name' },
          })
          .orFail(app.httpErrors.notFound('Session not found'));
        console.log(
          `[ROLEPLAY] ✓ Session found - callType: ${session.callType}, status: ${session.endedAt ? 'ended' : 'active'}`,
        );

        // Find module
        console.log(
          `[ROLEPLAY] Looking for module with friendlyId: ${session.callType}`,
        );
        const module = ALL_SALES_MODULES.find(
          (module) => module.friendlyId === session.callType,
        );

        const framework = module?.framework ?? DEFAULT_FRAMEWORK;
        console.log(`[ROLEPLAY] Using framework: ${framework}`);

        // Generate voice prompts for the agent
        let voice = null;
        if (medium === 'voice' && session.persona && session.product) {
          console.log('[ROLEPLAY] Generating voice prompts...');
          const persona = session.persona!;
          const product = session.product!;

          // Use actual user name if available, fallback to 'User' for backward compatibility
          const userName = session.user?.name || 'User';
          console.log(`[ROLEPLAY] Using userName: ${userName}`);

          voice = getSalesVoicePrompt({
            persona,
            product,
            callType: session.callType,
            userName,
            framework,
            languageCode,
            companyId: session.user.company.toString(),
            assessmentType: session.assessmentType,
            moduleFriendlyId: module?.friendlyId,
            selectedObjections: session.roleplay?.selectedObjections,
          });

          console.log('[ROLEPLAY] Voice prompt generated successfully');
          console.log(
            `[ROLEPLAY] Voice prompt preview: ${voice.prompt.main.substring(0, 200)}...`,
          );

          // Legacy logs (keeping your existing ones)
          console.log('persona ::: ', persona);
          console.log('product ::: ', product);
          console.log('voice prompt ::: ', voice.prompt.main);
        } else {
          if (medium !== 'voice') {
            console.log(
              `[ROLEPLAY] Skipping voice prompt generation - medium is: ${medium}`,
            );
          } else if (!session.persona) {
            console.log(
              '[ROLEPLAY] Skipping voice prompt generation - no persona found',
            );
          } else if (!session.product) {
            console.log(
              '[ROLEPLAY] Skipping voice prompt generation - no product found',
            );
          }
        }

        // Get competitive intelligence data
        console.log('[ROLEPLAY] Fetching competitive intelligence...');
        // First try to get from database for dynamic products, then fall back to hardcoded configs
        let competitiveIntelligence = null;
        const productId = session.product?._id?.toString();
        const productFriendlyId = session.product?.friendlyId;

        if (productId) {
          // Try database first (for dynamic products)
          competitiveIntelligence = await getCompetitiveIntelligenceForProduct(
            undefined, // LiveKit agent doesn't have user context
            productId,
            languageCode,
          );
        }

        // Fall back to hardcoded configs if no database CI found
        if (!competitiveIntelligence && productFriendlyId) {
          competitiveIntelligence = getCompetitiveIntelligence(
            undefined, // LiveKit agent doesn't have user context
            productFriendlyId,
            languageCode,
          );
        }

        if (competitiveIntelligence) {
          console.log(
            `[ROLEPLAY] ✓ Competitive intelligence loaded for product: ${productFriendlyId}`,
          );
          console.log(
            `[ROLEPLAY] CI data keys: ${Object.keys(competitiveIntelligence)}`,
          );
        } else {
          console.log('[ROLEPLAY] No competitive intelligence data available');
        }

        // Get company data from populated user (top-level for easier access)
        const userCompany = session.user?.company as any;
        const company = userCompany
          ? { friendlyId: userCompany.friendlyId, name: userCompany.name }
          : null;

        // Get the session data that will be sent to the agent
        const sessionData = {
          ...session.toObject(),
          ...(voice ? { voice } : {}),
          module,
          framework: getTranslatedFramework(
            framework,
            languageCode,
            session.persona?.name,
          ),
          competitiveIntelligence: competitiveIntelligence ?? {
            competitors: [],
          },
          company,
        };

        const responseStatus = session.endedAt ? 'ended' : 'active';
        const processingTime = Date.now() - startTime;

        console.log(
          `[ROLEPLAY] ✓ Request completed successfully in ${processingTime}ms`,
        );
        console.log(`[ROLEPLAY] Response status: ${responseStatus}`);
        console.log(
          `[ROLEPLAY] Session data keys: ${Object.keys(sessionData)}`,
        );

        return reply.send({
          session: sessionData,
          status: responseStatus,
        });
      } catch (error: unknown) {
        const processingTime = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error(
          `[ROLEPLAY] ❌ Error occurred after ${processingTime}ms:`,
          {
            sessionId,
            medium,
            error: errorMessage,
            stack: errorStack,
          },
        );

        // Re-throw the error with proper typing
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`Unexpected error: ${String(error)}`);
      }
    },
  });

  app.log.info('[livekit/roleplay.ts] LiveKit agent routes registered');
};

export default router;
