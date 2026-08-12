import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import { z } from 'zod';
import { getPersonaSpecificDifficulty } from '../../data/personas/difficulty-specific.js';
import { getLanguageHeader } from '../../locale/request.js';
import { setupUniversalAuth } from '../../middleware/conditionalAuth.js';
import { Company } from '../../models/Company.js';
import { UserStanding } from '../../models/UserStanding.js';
import {
  HUPO_DEMO_COMPANY_ID,
  MANULIFE_COMPANY_ID,
  MSIG_COMPANY_ID,
} from '../../utils/constants.js';
import { GREAT_EASTERN_SALES_MODULES } from '../../constants/modules.js';
import { getModuleById } from '../../utils/module.js';
import { getPersonas, getPersonasV2 } from '../../utils/persona.js';
import { getProductById } from '../../utils/product.js';
import {
  enrichStandingsWithDetails,
  getStandingConfigurationByModuleAndProduct,
  shouldUsePrudentialData,
} from '../../utils/prudential-standing.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Set up universal authentication for both Auth0 and guest tokens
   */
  setupUniversalAuth(app);

  app.get('/personas', {
    schema: {
      querystring: z.object({
        moduleId: z.string(),
        productId: z.string(),
        scenarioId: z.string().optional(),
      }),
    },
    handler: async (req, reply) => {
      try {
        const languageCode = getLanguageHeader(req);
        const companyId = req.user!.company!.toString();
        const { moduleId, productId, scenarioId } = req.query;
        const userId = req.user?._id?.toString();

        const company = await Company.findById(companyId);

        let personas;
        let productFriendlyId: string | undefined;
        if (company?.selfServiceEnabled && scenarioId) {
          personas = await getPersonasV2({
            companyId,
            languageCode,
            moduleId,
            productId,
          });
        } else {
          console.log('/personas GET', {
            moduleId,
            productId,
            companyId,
            languageCode,
          });

          productFriendlyId = getProductById(
            companyId,
            productId,
            languageCode,
          ).friendlyId;

          // Apply difficulty enhancements
          const foundModule = getModuleById(moduleId);
          const moduleFriendlyId = foundModule?.friendlyId;

          const hiddenFields = foundModule?.fields?.hidden || [];

          personas = getPersonas(
            languageCode,
            companyId,
            moduleFriendlyId,
            productFriendlyId,
          );

          // Filter out hidden fields from persona details
          if (hiddenFields.length > 0) {
            personas = personas.map((persona: any) => {
              if (persona.details) {
                const filteredDetails = { ...persona.details };
                for (const field of hiddenFields) {
                  delete filteredDetails[field];
                }
                return { ...persona, details: filteredDetails };
              }
              return persona;
            });
          }

          personas = personas.map((persona: any) => {
            try {
              if (!moduleFriendlyId) {
                console.warn(
                  `Module friendly ID not found for moduleId: ${moduleId} (${moduleFriendlyId})`,
                );
                return persona;
              }

              const difficultyInfo = getPersonaSpecificDifficulty(
                persona.friendlyId,
                moduleFriendlyId,
                productFriendlyId,
              );

              if (difficultyInfo && companyId !== HUPO_DEMO_COMPANY_ID) {
                const uiDescription =
                  difficultyInfo.uiDescription[
                    languageCode as keyof typeof difficultyInfo.uiDescription
                  ];

                const mainObjection = difficultyInfo.mainObjection
                  ? difficultyInfo.mainObjection[
                      languageCode as keyof typeof difficultyInfo.mainObjection
                    ]
                  : undefined;

                const isGreatEasternModule = GREAT_EASTERN_SALES_MODULES.some(
                  (m) => m.friendlyId === moduleFriendlyId,
                );

                // Enhance persona details with difficulty-specific information
                return {
                  ...persona,
                  details: {
                    ...persona.details,
                    difficultyLevel: difficultyInfo.level,
                    salesDescription:
                      uiDescription || persona.details.salesDescription,
                    mainObjection:
                      mainObjection || persona.details.mainObjection,
                    ...(isGreatEasternModule ? {} : { salesGoal: '' }),
                  },
                };
              }
            } catch (error) {
              console.warn(
                `No difficulty info found for persona ${persona.friendlyId}:`,
                error,
              );
            }

            return persona;
          });
        }

        const moduleFriendlyIdForStandings =
          getModuleById(moduleId)?.friendlyId;
        let productFriendlyIdForStandings: string | undefined =
          productFriendlyId;
        if (productFriendlyIdForStandings === undefined) {
          try {
            productFriendlyIdForStandings = getProductById(
              companyId,
              productId,
              languageCode,
            )?.friendlyId;
          } catch {
            productFriendlyIdForStandings = undefined;
          }
        }

        if (userId && companyId && shouldUsePrudentialData(companyId)) {
          // Get the appropriate standing configuration ID for this module/product
          const moduleFriendlyId = moduleFriendlyIdForStandings;
          if (!moduleFriendlyId) {
            return reply.send(
              personas.map((p) => ({
                ...p,
                standings: {
                  type: 'none',
                  latestStanding: null,
                  personalBest: null,
                },
              })),
            );
          }

          const personaIds = personas.map((p: any) => p._id.toString());
          const standingConfiguration =
            getStandingConfigurationByModuleAndProduct(
              moduleFriendlyId,
              productId,
            );
          const standingConfigurationId =
            standingConfiguration?.base.friendlyId;

          // Only query standings if there's a valid configuration for this module/product
          if (standingConfigurationId) {
            const standings = await UserStanding.aggregate([
              {
                $match: {
                  user: new Types.ObjectId(userId),
                  persona: { $in: personaIds },
                  standingConfigurationId: standingConfigurationId,
                },
              },
              {
                $lookup: {
                  from: 'salessessions',
                  localField: 'session',
                  foreignField: '_id',
                  as: 'sessionData',
                },
              },
              {
                $unwind: '$sessionData',
              },
              {
                $sort: { 'sessionData.createdAt': -1 },
              },
              {
                $group: {
                  _id: '$persona',
                  latestStanding: { $first: '$$ROOT' },
                  standings: { $push: '$$ROOT' },
                },
              },
              { $unwind: '$standings' },
              {
                $sort: {
                  'standings.tierLevel': -1,
                  'standings.sessionData.createdAt': -1,
                },
              },
              {
                $group: {
                  _id: '$_id',
                  latestStanding: { $first: '$latestStanding' },
                  personalBest: { $first: '$standings' },
                },
              },
            ]);

            // Enrich standings with assessment details
            const enrichedStandings = await enrichStandingsWithDetails(
              standings,
              moduleFriendlyId,
              languageCode,
              productId,
            );

            const standingsByPersona = new Map(
              enrichedStandings.map((s, index) => [
                standings[index]._id.toString(),
                s,
              ]),
            );

            const personasWithStandings = personas.map((persona: any) => {
              const standing = standingsByPersona.get(persona._id.toString());
              return {
                ...persona,
                standings: {
                  type: 'prudential',
                  latestStanding: standing?.latestStanding || null,
                  personalBest: standing?.personalBest || null,
                },
              };
            });

            return reply.send(personasWithStandings);
          } else {
            // No standings available for this module/product combination
            return reply.send(
              personas.map((p) => ({
                ...p,
                standings: {
                  type: 'prudential',
                  latestStanding: null,
                  personalBest: null,
                },
              })),
            );
          }
        } else if (
          userId &&
          companyId === MSIG_COMPANY_ID &&
          productFriendlyId
        ) {
          return reply.send(
            personas.map((p) => ({
              ...p,
              standings: {
                type: 'msig',
                latestStanding: null,
                personalBest: null,
              },
            })),
          );
        } else if (userId && companyId === MANULIFE_COMPANY_ID) {
          return reply.send(
            personas.map((p) => ({
              ...p,
              standings: {
                type: 'manulife',
                latestStanding: null,
                personalBest: null,
              },
            })),
          );
        }

        return reply.send(
          personas.map((p) => ({
            ...p,
            standings: {
              type: 'none',
              latestStanding: null,
              personalBest: null,
            },
          })),
        );
      } catch (error) {
        console.error('Error fetching personas:', error);
        return reply.status(500).send({ error: 'Failed to fetch personas' });
      }
    },
  });
};

export default router;
