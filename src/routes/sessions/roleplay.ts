import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ALL_SALES_MODULES } from '../../constants/modules.js';
import { getSalesActions } from '../../constants/sales-actions.js';
import {
  DEFAULT_FRAMEWORK,
  getTranslatedFramework,
} from '../../frameworks/common.js';
import { getAgenda } from '../../jobs/agenda.js';
import { getLanguageHeader } from '../../locale/request.js';
import { setupUniversalAuth } from '../../middleware/conditionalAuth.js';
import { Company } from '../../models/Company.js';
import { Message } from '../../models/Message.js';
import { PersonaDocument, PersonaLocalization } from '../../models/Persona.js';
import { Voice, VoiceDocument } from '../../models/Voice.js';
import { SalesProductDocument } from '../../models/SalesProduct.js';
import { SalesSession } from '../../models/SalesSession.js';
import {
  getSalesVoicePrompt,
  getScenarioVoicePrompt,
} from '../../prompts/sales-voice.js';
import {
  getCompetitiveIntelligence,
  getCompetitiveIntelligenceForProduct,
} from '../../utils/competitive-intelligence.js';
import { getProcessReference } from '../../utils/process-reference.js';
import {
  AGENDA_JOB_TYPES,
  DEFAULT_CHARACTER_NAME,
  SLACK_REPORTER_CHANNEL_ID,
  SLACK_REPORT_TYPES,
} from '../../utils/constants.js';
import { getProductByFriendlyId } from '../../utils/product.js';
import { generateMessageFeedback } from '../../utils/realtime-feedback.js';
import { generateRoleplayOverview } from '../../utils/assessment/regular.js';
import { createSalesActionDetector } from '../../utils/sales-action-detector.js';
import { checkBriefRoleplay, processTranscript } from '../../utils/session.js';
import { sanitizeTranscriptLanguage } from '../../utils/transcript-sanitizer.js';
import { queueAllMSIGSections } from '../../utils/assessment/msig.js';
import { getModules } from '../../utils/module.js';
import {
  analyzeStandingProgression,
  enrichSessionStanding,
} from '../../utils/prudential-standing.js';
import {
  queueAllManulifeSections,
  assessGoalReadySession,
} from '../../utils/assessment/manulife.js';
import {
  verifySessionOwnership,
  verifyAndPopulateSession,
} from '../../utils/session-auth.js';
import { HttpError } from '../../utils/errors.js';
import {
  IScenario,
  Scenario,
  ScenarioDocument,
} from '../../models/Scenario.js';
import { ModuleDocument } from '../../models/Module.js';
import { ScorecardDocument } from '../../models/Scorecard.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Set up universal authentication for both Auth0 and guest tokens
   */
  setupUniversalAuth(app);

  /**
   * @method GET /sessions/:sessionId/roleplay
   * @description Retrieve session details with dynamically generated voice prompts (following coaching app pattern)
   */
  app.get('/:sessionId/roleplay', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
      querystring: z.object({
        medium: z.enum(['voice']).optional().default('voice'), // Sales app is voice-only
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;
      const { medium } = req.query;
      const languageCode = getLanguageHeader(req);

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'standing',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('standing')
        .populate<{
          scenario: Omit<
            IScenario,
            'persona' | 'module' | 'product' | 'scorecard'
          > & {
            persona?: PersonaDocument;
            module?: ModuleDocument;
            product?: SalesProductDocument;
            scorecard?: ScorecardDocument;
          };
        }>({
          path: 'scenario',
          populate: [
            { path: 'product' },
            {
              path: 'persona',
              populate: { path: 'voice' },
            },
            { path: 'module' },
            { path: 'scorecard' },
          ],
        })
        .orFail(app.httpErrors.notFound('Session not found'));

      // Populate localization voices - convert to plain object to iterate language keys
      const personaLocalizations: Record<string, any> | null = session?.scenario
        ?.persona?.localizations
        ? JSON.parse(JSON.stringify(session.scenario.persona.localizations))
        : null;
      let localizationVoiceMap: Map<string, VoiceDocument> | null = null;
      if (personaLocalizations) {
        const voiceIds: string[] = [];
        for (const [lang, loc] of Object.entries(personaLocalizations)) {
          const voiceRef = loc?.voice;
          if (
            voiceRef &&
            !(typeof voiceRef === 'object' && 'providerId' in voiceRef)
          ) {
            voiceIds.push(String(voiceRef));
          }
        }
        if (voiceIds.length > 0) {
          const voices = await Voice.find({ _id: { $in: voiceIds } });
          localizationVoiceMap = new Map(
            voices.map((v) => [v._id!.toString(), v]),
          );

          // Populate voice objects back into the localizations
          for (const [lang, loc] of Object.entries(personaLocalizations)) {
            if (loc?.voice && typeof loc.voice === 'string') {
              const voiceDoc = localizationVoiceMap.get(loc.voice);
              if (voiceDoc) {
                personaLocalizations[lang].voice = voiceDoc;
              }
            }
          }
        }
      }

      const moduleFromScenario = session?.scenario?.module;

      const localizedModuleFromScenario = moduleFromScenario
        ? {
            ...moduleFromScenario.toObject(),
            ...moduleFromScenario.getLocalizedContent?.(languageCode),
          }
        : null;

      const module =
        moduleFromScenario ??
        ALL_SALES_MODULES.find(
          (module) => module.friendlyId === session.callType,
        );

      const framework = module?.framework ?? DEFAULT_FRAMEWORK;

      // Get localized module to include translated objectives
      const localizedModules = getModules(
        req.user?.company?.toString(),
        languageCode,
      );

      const localizedModule =
        localizedModuleFromScenario ??
        localizedModules.find((m) => m.friendlyId === session.callType);

      // Ensure session has objectives from module if not already set
      let sessionObjectives = session.roleplay?.objectives || [];
      if (sessionObjectives.length === 0 && localizedModule?.objectives) {
        sessionObjectives = localizedModule.objectives;
        // Update the session in the database if it doesn't have objectives
        if (session.roleplay) {
          await session.updateOne({
            $set: { 'roleplay.objectives': localizedModule.objectives },
          });
        }
      }

      // Generate voice prompts dynamically (sales app is voice-only)
      let voice = null;
      // Prefer scenario.product/persona if present
      const personaFromScenario = session?.scenario?.persona;
      const productFromScenario = session?.scenario?.product;

      if (
        medium === 'voice' &&
        (personaFromScenario || session.persona) &&
        (productFromScenario || session.product)
      ) {
        if (session.scenario) {
          voice = getScenarioVoicePrompt(
            session.scenario,
            req.user?.name ?? '',
            languageCode,
          );
        } else {
          const persona = personaFromScenario || session.persona;
          const product = productFromScenario || session.product;

          voice = getSalesVoicePrompt({
            persona: persona!,
            product: product!,
            callType: session.callType,
            userName: req.user?.name || 'there',
            framework,
            languageCode,
            companyId: req.user?.company?.toString(),
            assessmentType: session.assessmentType,
            moduleFriendlyId: module?.friendlyId,
            selectedObjections: session.roleplay?.selectedObjections,
            scenario: session.scenario,
          });
        }
      }

      // Get competitive intelligence data
      // First try to get from database for dynamic products, then fall back to hardcoded configs
      let competitiveIntelligence = null;
      const productId = productFromScenario?._id ?? session.product?._id;
      const productFriendlyId =
        productFromScenario?.friendlyId ?? session.product?.friendlyId;

      if (productId) {
        // Try database first (for dynamic products)
        competitiveIntelligence = await getCompetitiveIntelligenceForProduct(
          req.user?.company?.toString(),
          productId,
          languageCode,
        );
      }

      // Fall back to hardcoded configs if no database CI found
      if (!competitiveIntelligence && productFriendlyId) {
        competitiveIntelligence = getCompetitiveIntelligence(
          req.user?.company?.toString(),
          productFriendlyId,
          languageCode,
        );
      }

      // Get process reference data (for BBL assessments)
      const processReference = getProcessReference(
        req.user?.company?.toString(),
        session.callType,
        languageCode,
      );

      let enrichedStanding: any = session.standing || null;
      if (session.standing && session.roleplay?.feedback) {
        enrichedStanding = enrichSessionStanding(
          session.standing,
          session,
          languageCode,
        );
      }

      // Add standing progression analysis for Prudential sessions
      let standingProgression = null;
      if (session.assessmentType === 'prudential' && req.user?._id) {
        try {
          standingProgression = await analyzeStandingProgression(
            sessionId,
            req.user._id.toString(),
            session.callType,
            session?.scenario?.persona?.friendlyId ??
              session.persona?.friendlyId ??
              '',
            languageCode,
            session?.scenario?.product?.friendlyId ??
              session.product?.friendlyId ??
              '',
          );
        } catch (error) {
          console.error('Error analyzing standing progression:', error);
        }
      }

      // Extract voiceId from persona - prioritize localized voice for the requested language
      const persona = personaFromScenario || session.persona;
      let personaVoiceId: string | undefined;
      let localizedVoice: VoiceDocument | undefined;

      if (persona) {
        const localized = personaLocalizations?.[languageCode];

        if (localized?.voice) {
          if (
            typeof localized.voice === 'object' &&
            'providerId' in localized.voice
          ) {
            localizedVoice = localized.voice as VoiceDocument;
          } else if (localizationVoiceMap) {
            localizedVoice = localizationVoiceMap.get(String(localized.voice));
          }
        }

        // Fallback to getLocalizedContent (handles 'en' default)
        if (!localizedVoice) {
          const localizedContent = persona.getLocalizedContent?.(languageCode);
          if (localizedContent?.voice) {
            if (
              typeof localizedContent.voice === 'object' &&
              'providerId' in localizedContent.voice
            ) {
              localizedVoice = localizedContent.voice as VoiceDocument;
            } else if (localizationVoiceMap) {
              localizedVoice = localizationVoiceMap.get(
                String(localizedContent.voice),
              );
            }
          }
        }

        const mainVoice = persona.voice as VoiceDocument | undefined;
        personaVoiceId =
          localizedVoice?.providerId ||
          mainVoice?.providerId ||
          persona.voiceId;
      }

      const sessionData = {
        ...session.toObject(),
        ...(voice ? { voice } : {}),
        standing: enrichedStanding,
        standingProgression,
        module: localizedModule,
        framework: getTranslatedFramework(
          framework,
          languageCode,
          session.persona?.name,
        ),
        competitiveIntelligence: competitiveIntelligence ?? { competitors: [] },
        ...(processReference ? { processReference } : {}),
        // Ensure persona has voiceId and localized voice for frontend
        ...(persona && personaVoiceId
          ? {
              persona: {
                ...(personaFromScenario ? personaFromScenario.toObject() : {}),
                ...(languageCode !== 'en' &&
                personaLocalizations?.[languageCode]
                  ? personaLocalizations[languageCode]
                  : session.persona),
                voiceId: personaVoiceId,
                ...(localizedVoice ? { voice: localizedVoice } : {}),
              },
            }
          : {}),
        ...(session.scenario
          ? {
              scenario: {
                ...(session.scenario as ScenarioDocument)?.toObject(),
                scenarioDetails: (
                  session.scenario as ScenarioDocument
                )?.getLocalizedContent?.(languageCode),
              },
            }
          : {}),
      };

      // Ensure the session data includes the populated objectives
      if (sessionData.roleplay) {
        sessionData.roleplay.objectives = sessionObjectives;
      }

      return reply.send({
        session: sessionData,
        status: session.endedAt ? 'ended' : 'active',
      });
    },
  });

  app.post('/:sessionId/end', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
      body: z.object({
        transcript: z.array(
          z.object({
            role: z.string(),
            content: z.string(),
            sent: z.string(),
            feedback: z
              .object({
                type: z.string(),
                content: z.string(),
              })
              .optional(),
            responseTimeSec: z.number().optional(),
          }),
        ),
        duration: z.number().optional(),
        conversation: z.string().nullable().optional(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;
      const { transcript, conversation } = req.body;

      try {
        await verifyAndPopulateSession(sessionId, req.user!, app, 'product');

        const session = await SalesSession.findById(sessionId)
          .populate({
            path: 'scenario',
            populate: [{ path: 'product' }, { path: 'persona' }],
          })
          .select('roleplay scenario callType product assessmentType')
          .orFail(app.httpErrors.notFound('Session not found'));

        const framework = session.roleplay?.framework ?? DEFAULT_FRAMEWORK;

        // Calculate duration from transcript: latest message - first message
        let duration = 0;
        if (transcript.length > 0) {
          const sortedTranscript = [...transcript].sort(
            (a, b) => new Date(a.sent).getTime() - new Date(b.sent).getTime(),
          );
          const firstMessageTime = new Date(sortedTranscript[0].sent).getTime();
          const lastMessageTime = new Date(
            sortedTranscript[sortedTranscript.length - 1].sent,
          ).getTime();
          duration = Math.max(0, (lastMessageTime - firstMessageTime) / 1000);
        }

        const languageCode = getLanguageHeader(req);
        const sanitizedTranscript = await sanitizeTranscriptLanguage(
          transcript,
          languageCode,
          session.assessmentType,
        );

        const { messageIds, messages } =
          await processTranscript(sanitizedTranscript);

        await session.updateOne({
          $set: {
            messages: messageIds,
            endedAt: new Date(),
            'roleplay.duration': duration,
            'roleplay.conversation': conversation,
          },
        });
        const isBrief = await checkBriefRoleplay(messages);
        let summary = null;

        if (!isBrief) {
          const agenda = getAgenda();

          // Set sales technique generating flag and queue job
          if (session.assessmentType === 'bbl') {
            const flags = [
              'advisoryTechniqueGenerating',
              'processAdherenceGenerating',
            ];
            // Set BBL-specific generating flag
            await session.updateOne({
              $set: {
                ...flags.reduce(
                  (acc, flag) => ({
                    ...acc,
                    [`roleplay.feedback.${flag}`]: true,
                  }),
                  {},
                ),
              },
            });
          } else if (session.assessmentType === 'hsbc') {
            const flags = [
              'isHsbcRelationshipManagementGenerating',
              'isHsbcProcessAdherenceGenerating',
              'isHsbcRepresentationGenerating',
              'communicationAndPresenceGenerating',
            ];
            // Set HSBC-specific generating flags
            await session.updateOne({
              $set: {
                ...flags.reduce(
                  (acc, flag) => ({
                    ...acc,
                    [`roleplay.feedback.${flag}`]: true,
                  }),
                  {},
                ),
              },
            });
          } else {
            // Only set salesTechniquesGenerating for types that actually use
            // GENERATE_SALES_TECHNIQUE or GENERATE_PRUDENTIAL_SALES_TECHNIQUE.
            // Types with their own flag management handle flags in their own branches below.
            const typesWithOwnFlags = [
              'prudential-objection-handling',
              'prudential-ph-appointment-setting',
              'msig',
              'manulife',
              'manulife-goalready',
              'msig-travel-easy',
              'grab-mex',
              'scorecard',
              'axa-ph-recruitment',
              'axa-ph-objection-handling',
              'kt-axa-recruitment',
              'kt-axa-fna',
              'kt-axa-wealthplus',
              'aia-ko-opening-objection-call',
              'aia-ko-product-pitch',
              'aia-ko-end-to-end-outbound-call',
            ];
            if (!typesWithOwnFlags.includes(session.assessmentType || '')) {
              await session.updateOne({
                $set: { 'roleplay.feedback.salesTechniquesGenerating': true },
              });
            }
          }

          if (session.assessmentType === 'bbl') {
            // BBL assessment: Generate advisory technique and process adherence (simple like regular)
            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_BBL_ADVISORY_TECHNIQUE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue BBL advisory technique job:',
                  error,
                );
                // Clear flag if queueing fails
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.advisoryTechniqueGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_BBL_PROCESS_ADHERENCE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue BBL process adherence job:',
                  error,
                );
                // Clear flag if queueing fails
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.processAdherenceGenerating': false,
                    },
                  })
                  .catch(console.error);
              });
          } else if (session.assessmentType === 'hsbc') {
            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_HSBC_RELATIONSHIP_MANAGEMENT, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue HSBC relationship management job:',
                  error,
                );
                // Clear flag if queueing fails
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.isHsbcRelationshipManagementGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_HSBC_PROCESS_ADHERENCE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue HSBC process adherence job:',
                  error,
                );
                // Clear flag if queueing fails
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.isHsbcProcessAdherenceGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_HSBC_REPRESENTATION, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue HSBC representation job:',
                  error,
                );
                // Clear flag if queueing fails
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.isHsbcRepresentationGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_HSBC_COMMUNICATION_AND_PRESENCE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue HSBC communication and presence job:',
                  error,
                );
                // Clear flag if queueing fails
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.communicationAndPresenceGenerating': false,
                    },
                  })
                  .catch(console.error);
              });
          } else if (session.assessmentType === 'prudential') {
            await session.updateOne({
              $set: { 'roleplay.feedback.isStandingGenerating': true },
            });

            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_SALES_TECHNIQUE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  `[Prudential] Failed to queue assessment job for session ${sessionId}:`,
                  error,
                );
                // Clear flag if queueing fails
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.salesTechniquesGenerating': false,
                    },
                  })
                  .catch(console.error);
              });
          } else if (
            session.assessmentType === 'prudential-objection-handling'
          ) {
            // Prudential Objection Handling: Generate 3F Sales Technique + LAPR Objection Handling separately
            await session.updateOne({
              $set: {
                'roleplay.feedback.isStandingGenerating': true,
                'roleplay.feedback.prudentialOHSalesTechniqueGenerating': true,
                'roleplay.feedback.prudentialOHObjectionHandlingGenerating': true,
              },
            });

            // Queue 3F Sales Technique assessment
            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_OH_SALES_TECHNIQUE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  `[Prudential OH] Failed to queue Sales Technique job for session ${sessionId}:`,
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.prudentialOHSalesTechniqueGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            // Queue LAPR Objection Handling assessment
            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_OH_OBJECTION_HANDLING, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  `[Prudential OH] Failed to queue Objection Handling job for session ${sessionId}:`,
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.prudentialOHObjectionHandlingGenerating': false,
                    },
                  })
                  .catch(console.error);
              });
          } else if (
            session.assessmentType === 'prudential-ph-appointment-setting'
          ) {
            // Prudential PH Appointment Setting: Generate assessment
            await session.updateOne({
              $set: {
                'roleplay.feedback.prudentialPHAppointmentSettingGenerating': true,
              },
            });

            agenda
              .now(
                AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_PH_APPOINTMENT_SETTING,
                {
                  sessionId,
                  languageCode,
                },
              )
              .catch((error) => {
                console.error(
                  `[Prudential PH] Failed to queue Appointment Setting job for session ${sessionId}:`,
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.prudentialPHAppointmentSettingGenerating': false,
                    },
                  })
                  .catch(console.error);
              });
          } else if (session.assessmentType === 'msig') {
            try {
              await queueAllMSIGSections(sessionId, languageCode);
              console.log(
                `Successfully queued all MSIG sections in parallel for session: ${sessionId}`,
              );
            } catch (error) {
              console.error(
                `Failed to queue MSIG sections for session ${sessionId}:`,
                error,
              );
            }
          } else if (session.assessmentType === 'manulife') {
            try {
              await queueAllManulifeSections(sessionId, languageCode);
              console.log(
                `Successfully queued all Manulife sections in parallel for session: ${sessionId}`,
              );
            } catch (error) {
              console.error(
                `Failed to queue Manulife sections for session ${sessionId}:`,
                error,
              );
            }
          } else if (session.assessmentType === 'manulife-goalready') {
            // For Manulife GoalReady, generate all three assessments in parallel: Sales & Negotiation Skills, Soft Skills, Product Knowledge
            // Set generating flags
            await session.updateOne({
              $set: {
                'roleplay.feedback.manulifeSalesAndNegotiationSkillsGenerating': true,
                'roleplay.feedback.manulifeSoftSkillsGenerating': true,
                'roleplay.feedback.manulifeProductKnowledgeGenerating': true,
              },
            });

            // Queue sales and negotiation skills assessment job
            agenda
              .now(
                AGENDA_JOB_TYPES.GENERATE_MANULIFE_SALES_AND_NEGOTIATION_SKILLS,
                {
                  sessionId,
                  languageCode,
                },
              )
              .catch((error) => {
                console.error(
                  'Failed to queue Manulife sales and negotiation skills job:',
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.manulifeSalesAndNegotiationSkillsGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            // Queue soft skills assessment job
            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_MANULIFE_SOFT_SKILLS, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue Manulife soft skills job:',
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.manulifeSoftSkillsGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            // Queue product knowledge assessment job
            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_MANULIFE_PRODUCT_KNOWLEDGE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue Manulife product knowledge job:',
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.manulifeProductKnowledgeGenerating': false,
                    },
                  })
                  .catch(console.error);
              });
          } else if (session.assessmentType === 'msig-travel-easy') {
            // For MSIG TravelEasy, generate all three assessments: soft skills (30), knowledge skills (30), and product knowledge (40)
            // Set generating flags
            await session.updateOne({
              $set: {
                'roleplay.feedback.msigTravelEasySoftSkillsGenerating': true,
                'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': true,
                'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': true,
              },
            });

            // Queue soft skills assessment job
            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_MSIG_TRAVEL_EASY_SOFT_SKILLS, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue MSIG TravelEasy soft skills job:',
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.msigTravelEasySoftSkillsGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            // Queue knowledge skills assessment job
            agenda
              .now(
                AGENDA_JOB_TYPES.GENERATE_MSIG_TRAVEL_EASY_KNOWLEDGE_SKILLS,
                {
                  sessionId,
                  languageCode,
                },
              )
              .catch((error) => {
                console.error(
                  'Failed to queue MSIG TravelEasy knowledge skills job:',
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            // Queue product knowledge assessment job
            agenda
              .now(
                AGENDA_JOB_TYPES.GENERATE_MSIG_TRAVEL_EASY_PRODUCT_KNOWLEDGE,
                {
                  sessionId,
                  languageCode,
                },
              )
              .catch((error) => {
                console.error(
                  'Failed to queue MSIG TravelEasy product knowledge job:',
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': false,
                    },
                  })
                  .catch(console.error);
              });
          } else if (session.assessmentType === 'grab-mex') {
            // For grab-mex, generate all three assessments: sales technique, product knowledge, and soft skills
            // Set ALL generating flags BEFORE queuing any jobs to prevent race conditions
            await session.updateOne({
              $set: {
                'roleplay.feedback.salesTechniquesGenerating': true,
                'roleplay.feedback.productKnowledgeGenerating': true,
                'roleplay.feedback.grabMexSoftSkillsGenerating': true,
              },
            });

            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_SALES_TECHNIQUE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error('Failed to queue sales technique job:', error);
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.salesTechniquesGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_PRODUCT_KNOWLEDGE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error('Failed to queue product knowledge job:', error);
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.productKnowledgeGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_GRAB_MEX_SOFT_SKILLS, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  'Failed to queue grab-mex soft skills job:',
                  error,
                );
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.grabMexSoftSkillsGenerating': false,
                    },
                  })
                  .catch(console.error);
              });
          } else if (session.assessmentType === 'great-eastern') {
            // Great Eastern assessment - uses custom evaluation prompts
            // Product knowledge is only generated for Stage 2 (product-pitch)
            const updateFlags: any = {
              'roleplay.feedback.greatEasternAssessmentGenerating': true,
            };

            // Only set product knowledge flag for product pitch module
            if (session.callType === 'great-eastern-product-pitch') {
              updateFlags['roleplay.feedback.productKnowledgeGenerating'] =
                true;
            }

            await session.updateOne({
              $set: updateFlags,
            });

            // Queue Great Eastern sales technique assessment (Soft Skills + Knowledge Skills)
            agenda
              .now(AGENDA_JOB_TYPES.GENERATE_GREAT_EASTERN_SALES_TECHNIQUE, {
                sessionId,
                languageCode,
              })
              .catch((error) => {
                console.error(
                  `[Great Eastern] Failed to queue assessment job for session ${sessionId}:`,
                  error,
                );
                // Clear flag if queueing fails
                session
                  .updateOne({
                    $set: {
                      'roleplay.feedback.greatEasternAssessmentGenerating': false,
                    },
                  })
                  .catch(console.error);
              });

            // Queue standard product knowledge assessment only for product pitch module (Stage 2)
            if (session.callType === 'great-eastern-product-pitch') {
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_PRODUCT_KNOWLEDGE, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    '[Great Eastern] Failed to queue product knowledge job:',
                    error,
                  );
                  // Clear flag if queueing fails
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.productKnowledgeGenerating': false,
                      },
                    })
                    .catch(console.error);
                });
            }
          } else if (session.assessmentType === 'scorecard') {
            // Get scenario with scorecard sections
            const scenario = await Scenario.findById(session.scenario)
              .populate('scorecard')
              .select('scorecard');

            const scorecard = scenario?.scorecard as ScorecardDocument;

            const baseSections = scorecard?.sections ?? [];

            // Check if there are localized sections for the current language
            const localizations = scorecard?.localizations as
              | Map<string, { name: string; sections?: any[] }>
              | undefined;
            const localizedData = localizations?.get?.(languageCode);
            const localizedSections = localizedData?.sections;

            const scorecardSections = baseSections.map((baseSection, index) => {
              const localizedSection = localizedSections?.[index];

              if (localizedSection) {
                return {
                  ...localizedSection,
                  prompt: baseSection.prompt,
                };
              }

              return baseSection;
            });

            // Only trigger generation if there are custom scorecards defined
            if (scorecardSections.length > 0) {
              // Initialize scorecards array with isGenerating flags
              const initialScorecards = scorecardSections.map(
                (section: any) => ({
                  name: section.name,
                  sectionType: section.sectionType,
                  isGenerating: true,
                  overallScore: undefined,
                  maxScore: undefined,
                  criteria: undefined,
                }),
              );

              await session.updateOne({
                $set: {
                  'roleplay.feedback.scorecards': initialScorecards,
                },
              });

              // Queue the generation job
              agenda
                .now(AGENDA_JOB_TYPES.EVALUATE_SCORECARDS, {
                  sessionId,
                  scorecards: scorecardSections,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue custom scorecards evaluation job:',
                    error,
                  );
                  // Clear generating flags if queueing fails
                  const failedScorecards = scorecardSections.map(
                    (section: any) => ({
                      name: section.name,
                      sectionType: section.sectionType,
                      isGenerating: false,
                      overallScore: undefined,
                      maxScore: undefined,
                      criteria: undefined,
                    }),
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.scorecards': failedScorecards,
                      },
                    })
                    .catch(console.error);
                });
            }
          } else {
            // For AXA-PH scenarios, generate soft skills and knowledge skills instead of sales technique
            if (
              session.assessmentType === 'axa-ph-recruitment' ||
              session.assessmentType === 'axa-ph-objection-handling'
            ) {
              // Set AXA-PH soft skills generating flag and queue job
              await session.updateOne({
                $set: { 'roleplay.feedback.axaPhSoftSkillsGenerating': true },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_AXA_PH_SOFT_SKILLS, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue AXA-PH soft skills job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.axaPhSoftSkillsGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Set AXA-PH knowledge skills generating flag and queue job
              await session.updateOne({
                $set: {
                  'roleplay.feedback.axaPhKnowledgeSkillsGenerating': true,
                },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_AXA_PH_KNOWLEDGE_SKILLS, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue AXA-PH knowledge skills job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.axaPhKnowledgeSkillsGenerating': false,
                      },
                    })
                    .catch(console.error);
                });
            } else if (session.assessmentType === 'kt-axa-recruitment') {
              // For KT-AXA recruitment, generate soft skills and knowledge skills
              await session.updateOne({
                $set: { 'roleplay.feedback.ktAxaSoftSkillsGenerating': true },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_KT_AXA_SOFT_SKILLS, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue KT-AXA soft skills job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.ktAxaSoftSkillsGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Set KT-AXA knowledge skills generating flag and queue job
              await session.updateOne({
                $set: {
                  'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': true,
                },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_KT_AXA_KNOWLEDGE_SKILLS, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue KT-AXA knowledge skills job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': false,
                      },
                    })
                    .catch(console.error);
                });
            } else if (session.assessmentType === 'kt-axa-fna') {
              // For KT-AXA FNA, generate soft skills (reused), knowledge skills (FNA prompt), and product knowledge
              await session.updateOne({
                $set: { 'roleplay.feedback.ktAxaSoftSkillsGenerating': true },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_KT_AXA_SOFT_SKILLS, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue KT-AXA FNA soft skills job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.ktAxaSoftSkillsGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Set KT-AXA knowledge skills generating flag and queue job (uses FNA prompt internally)
              await session.updateOne({
                $set: {
                  'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': true,
                },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_KT_AXA_KNOWLEDGE_SKILLS, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue KT-AXA FNA knowledge skills job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Set product knowledge generating flag and queue FNA product knowledge job
              await session.updateOne({
                $set: {
                  'roleplay.feedback.ktAxaProductKnowledgeGenerating': true,
                },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_KT_AXA_PRODUCT_KNOWLEDGE, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue KT-AXA product knowledge job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.ktAxaProductKnowledgeGenerating': false,
                      },
                    })
                    .catch(console.error);
                });
            } else if (session.assessmentType === 'kt-axa-wealthplus') {
              // For KT-AXA WealthPlus, generate soft skills, knowledge skills, and product knowledge
              await session.updateOne({
                $set: { 'roleplay.feedback.ktAxaSoftSkillsGenerating': true },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_KT_AXA_SOFT_SKILLS, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue KT-AXA WealthPlus soft skills job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.ktAxaSoftSkillsGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Set KT-AXA knowledge skills generating flag and queue job (uses WealthPlus prompt internally)
              await session.updateOne({
                $set: {
                  'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': true,
                },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_KT_AXA_KNOWLEDGE_SKILLS, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue KT-AXA WealthPlus knowledge skills job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Set product knowledge generating flag and queue WealthPlus product knowledge job
              await session.updateOne({
                $set: {
                  'roleplay.feedback.ktAxaProductKnowledgeGenerating': true,
                },
              });

              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_KT_AXA_PRODUCT_KNOWLEDGE, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue KT-AXA WealthPlus product knowledge job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.ktAxaProductKnowledgeGenerating': false,
                      },
                    })
                    .catch(console.error);
                });
            } else if (
              session.assessmentType === 'aia-ko-opening-objection-call'
            ) {
              // For AIA KO Opening & Objection Call, generate all three assessments: Introduction, Objection Handling, Needs Exploration
              // Set generating flags
              await session.updateOne({
                $set: {
                  'roleplay.feedback.aiaKoIntroductionGenerating': true,
                  'roleplay.feedback.aiaKoObjectionHandlingGenerating': true,
                  'roleplay.feedback.aiaKoNeedsExplorationGenerating': true,
                },
              });

              // Queue introduction assessment job
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_INTRODUCTION, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue AIA KO introduction job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.aiaKoIntroductionGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Queue objection handling assessment job
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_OBJECTION_HANDLING, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue AIA KO objection handling job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.aiaKoObjectionHandlingGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Queue needs exploration assessment job
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_NEEDS_EXPLORATION, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue AIA KO needs exploration job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.aiaKoNeedsExplorationGenerating': false,
                      },
                    })
                    .catch(console.error);
                });
            } else if (session.assessmentType === 'aia-ko-product-pitch') {
              // For AIA KO Product Pitch, generate all three assessments: Needs Analysis, Product Pitch, Objection Handling
              // Set generating flags
              await session.updateOne({
                $set: {
                  'roleplay.feedback.aiaKoNeedsAnalysisGenerating': true,
                  'roleplay.feedback.aiaKoProductPitchGenerating': true,
                  'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': true,
                },
              });

              // Queue needs analysis assessment job
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_NEEDS_ANALYSIS, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue AIA KO needs analysis job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.aiaKoNeedsAnalysisGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Queue product pitch assessment job
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_PRODUCT_PITCH, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue AIA KO product pitch job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.aiaKoProductPitchGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Queue product pitch objection handling assessment job
              agenda
                .now(
                  AGENDA_JOB_TYPES.GENERATE_AIA_KO_PRODUCT_PITCH_OBJECTION_HANDLING,
                  {
                    sessionId,
                    languageCode,
                  },
                )
                .catch((error) => {
                  console.error(
                    'Failed to queue AIA KO product pitch objection handling job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': false,
                      },
                    })
                    .catch(console.error);
                });
            } else if (
              session.assessmentType === 'aia-ko-end-to-end-outbound-call'
            ) {
              // For AIA KO End-To-End Outbound Call, generate a single comprehensive assessment
              await session.updateOne({
                $set: {
                  'roleplay.feedback.aiaKoE2EAssessmentGenerating': true,
                },
              });

              // Queue E2E assessment job
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_E2E_ASSESSMENT, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error(
                    'Failed to queue AIA KO E2E assessment job:',
                    error,
                  );
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.aiaKoE2EAssessmentGenerating': false,
                      },
                    })
                    .catch(console.error);
                });
            } else {
              // Generate sales technique for other assessment types
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_SALES_TECHNIQUE, {
                  sessionId,
                  languageCode,
                })
                .catch((error) => {
                  console.error('Failed to queue sales technique job:', error);
                  // Clear flag if queueing fails
                  session
                    .updateOne({
                      $set: {
                        'roleplay.feedback.salesTechniquesGenerating': false,
                      },
                    })
                    .catch(console.error);
                });

              // Set product knowledge generating flag and queue job (for non-cold-calls, excluding MTL recruitment and prospect practice)
              if (
                session.callType !== 'cold-call' &&
                session.assessmentType !== 'mtl-recruitment' &&
                session.assessmentType !== 'mtl-prospect-practice'
              ) {
                await session.updateOne({
                  $set: {
                    'roleplay.feedback.productKnowledgeGenerating': true,
                  },
                });

                agenda
                  .now(AGENDA_JOB_TYPES.GENERATE_PRODUCT_KNOWLEDGE, {
                    sessionId,
                    languageCode,
                  })
                  .catch((error) => {
                    console.error(
                      'Failed to queue product knowledge job:',
                      error,
                    );
                    // Clear flag if queueing fails
                    session
                      .updateOne({
                        $set: {
                          'roleplay.feedback.productKnowledgeGenerating': false,
                        },
                      })
                      .catch(console.error);
                  });
              }
            }
          }

          summary = await generateRoleplayOverview({
            callType: session.callType,
            scenario: session.roleplay?.title || '',
            objectives: session.roleplay?.objectives ?? [],
            framework,
            messages,
            characterName: DEFAULT_CHARACTER_NAME,
            sessionId,
            languageCode,
            assessmentType: session.assessmentType,
          });

          const company = await Company.findById(req.user?.company).select(
            'name',
          );

          await getAgenda().now('post-slack-report', {
            type: SLACK_REPORT_TYPES.ROLEPLAY_ENDED,
            payload: {
              channel: SLACK_REPORTER_CHANNEL_ID,
              user: req.user,
              company,
              callType: session?.callType,
              product: (
                (session as any)?.scenario?.product || (session as any).product
              )?.name,
              link: `<https://train.hupo.co/roleplay/${sessionId}/assessment?fromPast=1|View Summary>`,
              conversation,
            },
          });
        }

        if (summary) {
          await session.updateOne({
            $set: {
              'roleplay.feedback.overview': JSON.stringify(summary),
            },
          });
        }

        return reply.send({
          success: true,
          isBrief,
        });
      } catch (error) {
        if (error instanceof HttpError) {
          throw error;
        }
        console.error('Error ending roleplay:', error);
        return reply.status(500).send({ error: 'Error ending roleplay' });
      }
    },
  });

  app.post('/:sessionId/get-message-feedback', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
      body: z.object({
        transcript: z.array(
          z.object({
            role: z.string(),
            content: z.string(),
            sent: z.string(),
            feedback: z
              .object({
                type: z.string(),
                content: z.string(),
              })
              .optional(),
            tempId: z.string().optional(),
          }),
        ),
        message: z.object({
          role: z.string(),
          content: z.string(),
          sent: z.string(),
          feedback: z
            .object({
              type: z.enum([
                'praise',
                'suggestion',
                'insight',
                'warning',
                'error',
                'none',
              ]),
              content: z.string(),
            })
            .optional(),
          tempId: z.string().optional(),
        }),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;
      const { transcript, message } = req.body;

      try {
        await verifyAndPopulateSession(sessionId, req.user!, app, [
          'persona',
          'product',
        ]);

        const session = await SalesSession.findById(sessionId)
          .select('roleplay scenario assessmentType callType product persona')
          .populate<{
            scenario: Omit<ScenarioDocument, 'product' | 'persona'> & {
              product?: SalesProductDocument;
              persona?: PersonaDocument;
            };
          }>({
            path: 'scenario',
            populate: [{ path: 'product' }, { path: 'persona' }],
          })
          .orFail(app.httpErrors.notFound('Session not found'));

        const languageCode = getLanguageHeader(req);

        // Only generate feedback if the latest message is from user
        if (!message || message.role !== 'user') {
          return reply.send({
            success: true,
            feedback: null,
            tempId: null,
          });
        }

        try {
          const productInfo = session?.scenario
            ? session?.scenario!.product
            : getProductByFriendlyId(
                req.user?.company?._id?.toString(),
                session?.product!.friendlyId,
                languageCode,
              );

          const feedback = await generateMessageFeedback({
            message: {
              ...message,
              sent: new Date(message.sent),
            },
            messages: transcript as any, // Full transcript with existing feedbacks
            characterName:
              ((session as any)?.scenario?.persona || (session as any).persona)
                ?.name ?? DEFAULT_CHARACTER_NAME,
            scenario: {
              title: session.roleplay?.title,
              objective: session.roleplay?.objectives?.[0],
            },
            languageCode,
            productInfo,
            assessmentType: session.assessmentType,
            moduleFriendlyId: session.callType,
            sessionMeta: session.persona?.meta as
              | Record<string, unknown>
              | undefined,
          });

          return reply.send({
            success: true,
            feedback,
            tempId: message.tempId,
          });
        } catch (error) {
          console.error('Error generating feedback for latest message:', error);
          return reply.send({
            success: true,
            feedback: null,
          });
        }
      } catch (error) {
        console.error('Error generating feedback:', error);
        return reply.status(500).send({ error: 'Error generating feedback' });
      }
    },
  });

  app.route({
    url: '/:sessionId/report-roleplay-started',
    method: 'POST',
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      try {
        const { sessionId } = req.params;

        await verifyAndPopulateSession(sessionId, req.user!, app, 'product');

        const session = await SalesSession.findById(sessionId)
          .populate({
            path: 'scenario',
            populate: [{ path: 'product' }, { path: 'persona' }],
          })
          .orFail();

        const company = await Company.findById(req.user?.company).select(
          'name',
        );

        await getAgenda().now('post-slack-report', {
          type: SLACK_REPORT_TYPES.ROLEPLAY_STARTED,
          payload: {
            channel: SLACK_REPORTER_CHANNEL_ID,
            user: req.user,
            company,
            callType: session?.callType,
            product: (
              (session as any)?.scenario?.product || (session as any).product
            )?.name,
            link: `https://train.hupo.co/roleplay/${sessionId}`,
          },
        });

        return reply.send({ success: true });
      } catch (error) {
        return reply.status(500).send({
          error: 'Error reporting roleplay started',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  // Sales Action Tracking Endpoints

  app.get('/:sessionId/action-progress', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      try {
        const session = await verifySessionOwnership(sessionId, req.user!, app);

        const allActions = getSalesActions(
          session.callType,
          session.product?.friendlyId,
        );
        const completedActionIds =
          session.actionTracking?.completedActions?.map((a) => a.actionId) ||
          [];
        const progressPercentage =
          session.actionTracking?.progressPercentage || 0;

        return reply.send({
          success: true,
          data: {
            allActions,
            completedActions: session.actionTracking?.completedActions || [],
            completedActionIds,
            progressPercentage,
            callType: session.callType,
          },
        });
      } catch (error) {
        if (error instanceof HttpError) {
          throw error;
        }

        console.error('Error getting action progress:', error);
        return reply
          .status(500)
          .send({ error: 'Error getting action progress' });
      }
    },
  });

  app.post('/:sessionId/detect-actions', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
      body: z.object({
        message: z.object({
          role: z.string(),
          content: z.string(),
          tempId: z.string().optional(),
        }),
        messageId: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;
      const { message, messageId } = req.body;

      try {
        // Only process user messages
        if (message.role !== 'user') {
          return reply.send({
            success: true,
            detectedActions: [],
            progressPercentage: 0,
          });
        }

        const session = await verifySessionOwnership(sessionId, req.user!, app);

        // Initialize action tracking if it doesn't exist
        if (!session.actionTracking) {
          session.actionTracking = {
            completedActions: [],
            progressPercentage: 0,
            lastUpdated: new Date(),
          };
        }

        const detector = createSalesActionDetector(
          session.callType,
          session.product?.friendlyId,
        );
        const completedActionIds = session.actionTracking.completedActions.map(
          (a) => a.actionId,
        );

        // Detect new actions
        const detectedActions = await detector.detectActions(
          message.content,
          completedActionIds,
        );

        // Update session with newly detected actions
        const newCompletedActions = detectedActions.map((detected) => ({
          actionId: detected.action.id,
          completedAt: detected.detectedAt,
          confidence: detected.confidence,
          detectionMethod: detected.detectionMethod,
          triggerText: detected.triggerText,
          messageId: messageId || undefined,
        }));

        if (newCompletedActions.length > 0) {
          session.actionTracking.completedActions.push(...newCompletedActions);

          // Recalculate progress
          const allActionIds = detector.getAllActions().map((a) => a.id);
          const allCompletedIds = session.actionTracking.completedActions.map(
            (a) => a.actionId,
          );
          const uniqueCompletedIds = [...new Set(allCompletedIds)];
          session.actionTracking.progressPercentage = Math.round(
            (uniqueCompletedIds.length / allActionIds.length) * 100,
          );
          session.actionTracking.lastUpdated = new Date();

          console.log(
            `[Action Detection] Session: ${sessionId}, New actions detected:`,
            detectedActions.map((d) => d.action.id),
          );
          console.log(
            `[Action Detection] Updated progress: ${session.actionTracking.progressPercentage}%, Total completed: ${uniqueCompletedIds.length}/${allActionIds.length}`,
          );

          await session.save();
        }

        return reply.send({
          success: true,
          detectedActions: detectedActions.map((d) => ({
            actionId: d.action.id,
            title: d.action.title,
            confidence: d.confidence,
            triggerText: d.triggerText,
            detectionMethod: d.detectionMethod,
          })),
          progressPercentage: session.actionTracking.progressPercentage,
          newActionsCount: detectedActions.length,
        });
      } catch (error) {
        if (error instanceof HttpError) {
          throw error;
        }
        console.error('Error detecting actions:', error);
        return reply.status(500).send({ error: 'Error detecting actions' });
      }
    },
  });

  app.get('/:sessionId/action-suggestions', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
      querystring: z.object({
        limit: z.string().optional().default('3'),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;
      const limit = parseInt(req.query.limit);

      try {
        const session = await verifySessionOwnership(sessionId, req.user!, app);

        const detector = createSalesActionDetector(
          session.callType,
          session.product?.friendlyId,
        );
        const completedActionIds =
          session.actionTracking?.completedActions?.map((a) => a.actionId) ||
          [];

        console.log(
          `[Action Suggestions] Session: ${sessionId}, Completed: ${completedActionIds.length}, CompletedIds:`,
          completedActionIds,
        );

        const suggestedActions = detector.getNextSuggestedActions(
          completedActionIds,
          limit,
        );

        console.log(
          `[Action Suggestions] Suggested actions:`,
          suggestedActions.map((a) => ({
            id: a.id,
            title: a.title,
            priority: a.priority,
          })),
        );

        return reply.send({
          success: true,
          data: {
            suggestedActions,
            totalPendingActions:
              detector.getAllActions().length - completedActionIds.length,
          },
        });
      } catch (error) {
        if (error instanceof HttpError) {
          throw error;
        }
        console.error('Error getting action suggestions:', error);
        return reply
          .status(500)
          .send({ error: 'Error getting action suggestions' });
      }
    },
  });

  app.log.info('[sessions/roleplay.ts] routes registered');
};

export default router;
