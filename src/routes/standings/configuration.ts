import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getLocalizedStanding } from '../../data/standings/common.js';
import { manulifeStandings } from '../../data/standings/manulife.js';
import { msigStandings } from '../../data/standings/msig.js';
import { prudentialStandings } from '../../data/standings/prudential.js';
import { getLanguageHeader } from '../../locale/request.js';
import { setupUniversalAuth } from '../../middleware/conditionalAuth.js';
import { MANULIFE_COMPANY_ID, MSIG_COMPANY_ID } from '../../utils/constants.js';
import { getModuleById } from '../../utils/module.js';
import { getProductById } from '../../utils/product.js';
import { shouldUsePrudentialData } from '../../utils/prudential-standing.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Set up universal authentication for both Auth0 and guest tokens
   */
  setupUniversalAuth(app);

  app.get('/configuration', {
    schema: {
      querystring: z.object({
        moduleId: z.string(),
        productId: z.string(),
      }),
    },
    handler: async (req, reply) => {
      try {
        const companyId = req.user?.company?.toString();
        const { moduleId, productId } = req.query;
        const languageCode = getLanguageHeader(req) || 'en';

        const foundModule = getModuleById(moduleId);
        const foundProduct = getProductById(companyId, productId);

        // Get standings configurations based on company
        let standings;
        if (companyId && shouldUsePrudentialData(companyId)) {
          standings = prudentialStandings;
        } else if (companyId === MSIG_COMPANY_ID) {
          standings = msigStandings;
        } else if (companyId === MANULIFE_COMPANY_ID) {
          standings = manulifeStandings;
        } else {
          return reply.send({ configuration: null });
        }

        console.log({
          companyId,
          moduleId,
          productId,
          languageCode,
          standings,
        });

        // Find the matching configuration
        const configuration = standings.find((config) => {
          // First match by module
          if (config.base.module !== foundModule?.friendlyId) {
            return false;
          }

          // If the config specifies a product, it must match the provided product
          if (config.base.product) {
            return (
              foundProduct &&
              config.base.product.toString() === foundProduct.friendlyId
            );
          }

          // If config has no product, only match if no product was provided in the query
          return !foundProduct;
        });

        if (!configuration) {
          return reply.send({ configuration: null });
        }

        // Get localized standing data
        const localizedStanding = getLocalizedStanding(
          configuration,
          languageCode,
        );
        if (!localizedStanding) {
          return reply
            .status(500)
            .send({ error: 'Failed to get localized standing data' });
        }

        // Merge level information from base configuration with localized tier data
        const tiersWithLevel = localizedStanding.tiers.map(
          (localizedTier, index) => ({
            ...localizedTier,
            level: configuration.base.tiers[index].level,
            // Add scoreRange if it exists (for score-based standings)
            ...(configuration.base.tiers[index].scoreRange && {
              scoreRange: configuration.base.tiers[index].scoreRange,
            }),
          }),
        );

        // Return the configuration data (excluding sensitive fields like company ObjectId)
        return reply.send({
          configuration: {
            name: localizedStanding.name,
            module: configuration.base.module,
            type:
              localizedStanding.type || configuration.base.type || 'tier-based',
            tiers: tiersWithLevel,
            // Include shared criteria for score-based standings
            ...(localizedStanding.sharedCriteria && {
              sharedCriteria: localizedStanding.sharedCriteria,
            }),
          },
        });
      } catch (error) {
        console.error('Error fetching standings configuration:', error);
        return reply
          .status(500)
          .send({ error: 'Failed to fetch standings configuration' });
      }
    },
  });
};

export default router;
