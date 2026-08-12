import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { IUserStanding, UserStanding } from '../../models/UserStanding.js';
import {
  getStandingConfigurationById,
  getStandingConfigurationByModuleAndProduct,
  enrichSessionStanding,
} from '../../utils/prudential-standing.js';
import { Types } from 'mongoose';
import { getLanguageHeader } from '../../locale/request.js';
import { setupUniversalAuth } from '../../middleware/conditionalAuth.js';
import { StandingConfiguration } from '../../types/standings.js';
import { getLocalizedStanding } from '../../data/standings/common.js';
import {
  CallType,
  ISalesSession,
  SalesSession,
} from '../../models/SalesSession.js';
import { parseJsonSafely } from '../../utils/json.js';
import {
  calculateMSIGOverallScore,
  getMSIGTierName,
  hasFailedMandatory,
  isMsigDataIncomplete,
} from '../../utils/assessment/msig.js';
import {
  calculateManulifeOverallScore,
  getManulifeTierLevel,
  getManulifeTierName,
} from '../../utils/assessment/manulife.js';

type EnrichedStanding = IUserStanding & {
  sessionData: ISalesSession;
  config: StandingConfiguration;
};

const transformEnrichedStandingToResponse = (
  standing: EnrichedStanding,
  languageCode: string,
) => {
  // Use the shared enrichment logic for current session standing
  return enrichSessionStanding(standing, standing.sessionData, languageCode);
};

// Helper function to create virtual MSIG standing from session data
const createMSIGVirtualStanding = (
  session: ISalesSession,
  languageCode: string,
) => {
  if (
    session.assessmentType !== 'msig' ||
    !session.roleplay?.feedback?.salesTechniques
  ) {
    return null;
  }

  const salesTechniques = parseJsonSafely(
    session.roleplay.feedback.salesTechniques,
  );
  const sections = salesTechniques?.sections;

  if (!sections) {
    return null;
  }

  const overallScore = calculateMSIGOverallScore(sections);
  const tierName = getMSIGTierName(sections);
  const hasMandatoryFailures = hasFailedMandatory(sections);

  // Map tier name to tier level for consistency
  let tierLevel = 0;
  if (!hasMandatoryFailures) {
    if (tierName === 'Sales Novice') {
      tierLevel = 1;
    } else if (tierName === 'Emerging Seller') {
      tierLevel = 2;
    } else if (tierName === 'Skilled Advisor') {
      tierLevel = 3;
    } else if (tierName === 'Strategic Consultant') {
      tierLevel = 4;
    }
  }

  // Create virtual standing object that matches the expected interface
  const virtualStanding = {
    _id: session._id,
    user: session.user,
    persona: session.persona?._id || session.persona,
    session: session._id,
    tierLevel,
    tierName,
    overallScore,
    standingConfigurationId: 'msig-general-v1', // MSIG configuration ID
    createdAt: session.endedAt || session.startedAt,
    updatedAt: session.endedAt || session.startedAt,
  };

  // Use enrichSessionStanding to get properly formatted assessment details
  return enrichSessionStanding(virtualStanding, session, languageCode);
};

// Helper function to create virtual MSIG Product Positioning standing from session data
const createMSIG3FVirtualStanding = (
  session: ISalesSession,
  languageCode: string,
) => {
  if (
    session.assessmentType !== 'msig-3f' ||
    (!session.roleplay?.feedback?.salesTechniques &&
      !session.roleplay?.feedback?.productKnowledge)
  ) {
    return null;
  }

  const salesTechniques = parseJsonSafely(
    session.roleplay.feedback.salesTechniques || '{}',
  );
  const productKnowledge = parseJsonSafely(
    session.roleplay.feedback.productKnowledge || '{}',
  );

  const salesTechScore = salesTechniques?.overallScore || 0;
  const productKnowledgeScore = productKnowledge?.overallScore || 0;

  // For MSIG Product Positioning, combine both scores with equal weight
  let overallScore = 0;
  if (salesTechScore > 0 && productKnowledgeScore > 0) {
    overallScore = Math.round((salesTechScore + productKnowledgeScore) / 2);
  } else if (salesTechScore > 0) {
    overallScore = salesTechScore;
  } else if (productKnowledgeScore > 0) {
    overallScore = productKnowledgeScore;
  }

  // Map score to tier based on msig-3f standing configuration
  let tierName = 'Sales Novice';
  let tierLevel = 1;

  if (overallScore >= 80) {
    tierName = 'Strategic Consultant';
    tierLevel = 4;
  } else if (overallScore >= 60) {
    tierName = 'Skilled Advisor';
    tierLevel = 3;
  } else if (overallScore >= 40) {
    tierName = 'Emerging Seller';
    tierLevel = 2;
  }

  // Create virtual standing object that matches the expected interface
  const virtualStanding = {
    _id: session._id,
    user: session.user,
    persona: session.persona?._id || session.persona,
    session: session._id,
    tierLevel,
    tierName,
    overallScore,
    standingConfigurationId: 'msig-dentiplus-v1', // MSIG Product Positioning configuration ID
    createdAt: session.endedAt || session.startedAt,
    updatedAt: session.endedAt || session.startedAt,
  };

  // Use enrichSessionStanding to get properly formatted assessment details
  return enrichSessionStanding(virtualStanding, session, languageCode);
};

// Helper function to create virtual MSIG standing from session data
const createManulifeVirtualStanding = (
  session: ISalesSession,
  languageCode: string,
) => {
  if (
    session.assessmentType !== 'manulife' ||
    !session.roleplay?.feedback?.salesTechniques
  ) {
    return null;
  }

  const salesTechniques = parseJsonSafely(
    session.roleplay.feedback.salesTechniques,
  );
  const sections = salesTechniques?.sections;

  if (!sections) {
    return null;
  }

  const overallScore = calculateManulifeOverallScore(sections);
  const tierName = getManulifeTierName(sections, languageCode);
  const tierLevel = getManulifeTierLevel(tierName);

  // Create virtual standing object that matches the expected interface
  const virtualStanding = {
    _id: session._id,
    user: session.user,
    persona: session.persona?._id || session.persona,
    session: session._id,
    tierLevel,
    tierName,
    overallScore,
    standingConfigurationId: 'manulife-fna', // Manulife configuration ID
    createdAt: session.endedAt || session.startedAt,
    updatedAt: session.endedAt || session.startedAt,
  };

  // Use enrichSessionStanding to get properly formatted assessment details
  return enrichSessionStanding(virtualStanding, session, languageCode);
};

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  setupUniversalAuth(app);

  app.get('/summary', {
    schema: {
      querystring: z.object({
        sessionId: z.string().optional(),
        personaId: z.string().optional(),
        moduleId: z.string().optional(),
        productId: z.string().optional(),
      }),
    },
    handler: async (req, reply) => {
      const { sessionId, personaId, moduleId, productId } = req.query;
      const userId = req.user?._id?.toString();
      const languageCode = getLanguageHeader(req) || 'en';

      let currentStanding: EnrichedStanding | null = null;
      let latestStanding: EnrichedStanding | null = null;
      let personalBestStanding: EnrichedStanding | null = null;

      // Fetch currentSessionStanding from session if sessionId is provided
      if (sessionId) {
        try {
          // First try to find traditional UserStanding record
          const standing = await UserStanding.findOne({
            user: new Types.ObjectId(userId),
            persona: personaId,
            session: new Types.ObjectId(sessionId),
          }).populate('sessionData');

          if (standing) {
            const config = getStandingConfigurationById(
              standing.standingConfigurationId,
            );
            if (config) {
              currentStanding = {
                ...standing.toObject({ virtuals: true }),
                config,
              } as unknown as EnrichedStanding;
            }
          } else {
            // If no UserStanding found, check if it's an MSIG or MSIG-3F or Manulife session
            const session = await SalesSession.findOne({
              _id: new Types.ObjectId(sessionId),
              user: new Types.ObjectId(userId),
              assessmentType: { $in: ['msig', 'msig-3f', 'manulife'] },
              endedAt: { $exists: true },
            });

            if (session) {
              let virtualStanding = null;

              if (session.assessmentType === 'msig') {
                virtualStanding = createMSIGVirtualStanding(
                  session,
                  languageCode,
                );
              } else if (session.assessmentType === 'msig-3f') {
                virtualStanding = createMSIG3FVirtualStanding(
                  session,
                  languageCode,
                );
              } else if (session.assessmentType === 'manulife') {
                virtualStanding = createManulifeVirtualStanding(
                  session,
                  languageCode,
                );
              }

              if (virtualStanding) {
                currentStanding = virtualStanding;
              }
            }
          }
        } catch (err) {
          req.log?.error(
            { err },
            'Error fetching session for currentBaseStanding:',
          );
        }
      }

      // Fetch latestStanding and personalBest if personaId, moduleId, and productId are provided
      if (userId && personaId && moduleId && productId) {
        try {
          // Check if this is an MSIG module (telesales or product-positioning)
          if (moduleId === 'telesales') {
            // For MSIG telesales, query SalesSession directly instead of UserStanding
            const msigSessions = await SalesSession.find({
              user: new Types.ObjectId(userId),
              'persona.id': personaId,
              callType: CallType.MSIG_TELESALES,
              assessmentType: 'msig',
              endedAt: { $exists: true },
              'roleplay.feedback.salesTechniques': { $exists: true },
            })
              .sort({ endedAt: -1 })
              .lean();

            if (msigSessions.length > 0) {
              // Create virtual standings for each session
              const virtualStandings = msigSessions
                .map((session) =>
                  createMSIGVirtualStanding(session, languageCode),
                )
                .filter(Boolean);

              if (virtualStandings.length > 0) {
                // Latest is the most recent session
                latestStanding = virtualStandings[0];

                // Personal best is the highest tier level, then most recent
                const personalBestVirtual = virtualStandings
                  .slice()
                  .sort((a, b) => {
                    if (b.tierLevel !== a.tierLevel) {
                      return b.tierLevel - a.tierLevel;
                    }
                    return (
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  })[0];

                personalBestStanding = personalBestVirtual;
              }
            }
          } else if (moduleId === 'product-positioning') {
            // For MSIG product positioning (3F), query SalesSession for msig-3f
            const msig3fSessions = await SalesSession.find({
              user: new Types.ObjectId(userId),
              'persona.id': personaId,
              callType: CallType.PRODUCT_POSITIONING,
              assessmentType: 'msig-3f',
              endedAt: { $exists: true },
              $or: [
                { 'roleplay.feedback.salesTechniques': { $exists: true } },
                { 'roleplay.feedback.productKnowledge': { $exists: true } },
              ],
            })
              .sort({ endedAt: -1 })
              .lean();

            if (msig3fSessions.length > 0) {
              // Create virtual standings for each session
              const virtualStandings = msig3fSessions
                .map((session) =>
                  createMSIG3FVirtualStanding(session, languageCode),
                )
                .filter(Boolean);

              if (virtualStandings.length > 0) {
                // Latest is the most recent session
                latestStanding = virtualStandings[0];

                // Personal best is the highest tier level, then most recent
                const personalBestVirtual = virtualStandings
                  .slice()
                  .sort((a, b) => {
                    if (b.tierLevel !== a.tierLevel) {
                      return b.tierLevel - a.tierLevel;
                    }
                    return (
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  })[0];

                personalBestStanding = personalBestVirtual;
              }
            }
          }
          if (moduleId === 'fna') {
            // For MSIG telesales, query SalesSession directly instead of UserStanding
            const manulifeSessions = await SalesSession.find({
              user: new Types.ObjectId(userId),
              'persona.id': personaId,
              callType: CallType.MANULIFE_FNA,
              assessmentType: 'manulife',
              endedAt: { $exists: true },
              'roleplay.feedback.salesTechniques': { $exists: true },
            })
              .sort({ endedAt: -1 })
              .lean();

            if (manulifeSessions.length > 0) {
              // Create virtual standings for each session
              const virtualStandings = manulifeSessions
                .map((session) =>
                  createManulifeVirtualStanding(session, languageCode),
                )
                .filter(Boolean);

              if (virtualStandings.length > 0) {
                // Latest is the most recent session
                latestStanding = virtualStandings[0];

                // Personal best is the highest tier level, then most recent
                const personalBestVirtual = virtualStandings
                  .slice()
                  .sort((a, b) => {
                    if (b.tierLevel !== a.tierLevel) {
                      return b.tierLevel - a.tierLevel;
                    }
                    return (
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                    );
                  })[0];

                personalBestStanding = personalBestVirtual;
              }
            }
          } else {
            // Traditional UserStanding logic for non-MSIG modules
            const standingConfiguration =
              getStandingConfigurationByModuleAndProduct(moduleId, productId);
            if (standingConfiguration) {
              // Get all standings for this user/persona/module/product
              const standings = await UserStanding.aggregate([
                {
                  $match: {
                    user: new Types.ObjectId(userId),
                    persona: personaId,
                    standingConfigurationId:
                      standingConfiguration.base.friendlyId,
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
                { $unwind: '$sessionData' },
              ]);

              if (standings.length > 0) {
                // Find latestStanding (most recent by sessionData.createdAt)
                const latest = standings.slice().sort((a, b) => {
                  return (
                    new Date(b.sessionData.createdAt).getTime() -
                    new Date(a.sessionData.createdAt).getTime()
                  );
                })[0];
                // Find personalBest (highest tierLevel, then most recent)
                const personal = standings.slice().sort((a, b) => {
                  if (b.tierLevel !== a.tierLevel) {
                    return b.tierLevel - a.tierLevel;
                  }
                  return (
                    new Date(b.sessionData.createdAt).getTime() -
                    new Date(a.sessionData.createdAt).getTime()
                  );
                })[0];

                latestStanding = {
                  ...latest,
                  config: standingConfiguration,
                };
                personalBestStanding = {
                  ...personal,
                  config: standingConfiguration,
                };
              }
            }
          }
        } catch (err) {
          req.log?.error(
            { err },
            'Error fetching latestStanding/personalBest:',
          );
        }
      }

      return reply.send({
        currentSessionStanding: currentStanding
          ? (currentStanding as any).assessmentDetails
            ? currentStanding
            : transformEnrichedStandingToResponse(currentStanding, languageCode)
          : null,
        latestStanding: latestStanding
          ? (latestStanding as any).assessmentDetails
            ? latestStanding
            : transformEnrichedStandingToResponse(latestStanding, languageCode)
          : null,
        personalBest: personalBestStanding
          ? (personalBestStanding as any).assessmentDetails
            ? personalBestStanding
            : transformEnrichedStandingToResponse(
                personalBestStanding,
                languageCode,
              )
          : null,
      });
    },
  });
};

export default router;
