import axios from 'axios';
import { createHash } from 'crypto';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { z } from 'zod';
import { DEFAULT_FRAMEWORK } from '../../frameworks/common.js';
import { getAgenda } from '../../jobs/agenda.js';
import { getLanguageHeader } from '../../locale/request.js';
import {
  setupUniversalAuth,
  setupUniversalAuthWithManage,
} from '../../middleware/conditionalAuth.js';
import { Message } from '../../models/Message.js';
import { getManulifeAvailableSections } from '../../prompts/manulife-fna-assessment.js';
import { getAvailableSections } from '../../prompts/msig-assessment.js';
import { AGENDA_JOB_TYPES, CLOUDFRONT_DOMAIN } from '../../utils/constants.js';
import { HttpError } from '../../utils/errors.js';
import { parseJsonSafely } from '../../utils/json.js';
import {
  getManulifeAssessmentData,
  setManulifeSectionGenerating,
} from '../../utils/assessment/manulife.js';
import {
  getMSIGAssessmentData,
  setSectionGenerating,
} from '../../utils/assessment/msig.js';
import { generateRoleplayOverview } from '../../utils/assessment/regular.js';
import {
  verifySessionOwnership,
  verifyAndPopulateSession,
} from '../../utils/session-auth.js';
import { checkBriefRoleplay, isSessionTooBrief } from '../../utils/session.js';
import { IScenario, Scenario } from '../../models/Scenario.js';
import { ScorecardDocument, ScorecardSection } from '../../models/Scorecard.js';
import { SalesSession } from '../../models/SalesSession.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Set up authentication for routes that need Auth0, guest, and admin support
   * This allows the route to be accessed by regular users, guest users, and admins
   */
  setupUniversalAuthWithManage(app);

  app.get('/:sessionId/sales-overview', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;
      const languageCode = getLanguageHeader(request);

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      const framework = session.roleplay?.framework ?? DEFAULT_FRAMEWORK;

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      let salesOverview = {};
      const tooBrief = isSessionTooBrief(messages);

      if (!tooBrief) {
        if (session.roleplay.feedback?.overview) {
          salesOverview = parseJsonSafely(session.roleplay.feedback.overview);
        } else {
          salesOverview = await generateRoleplayOverview({
            callType: session.callType,
            scenario: session.roleplay.title || '',
            objectives: session.roleplay.objectives,
            messages,
            framework,
            characterName: session.persona?.name || 'Prospect',
            sessionId: session._id.toString(),
            languageCode,
            productInfo: '', //TODO: session.product?.description || '',
            assessmentType: session.assessmentType,
          });

          if (salesOverview) {
            await session.updateOne({
              $set: {
                'roleplay.feedback.overview': JSON.stringify(salesOverview),
              },
            });
          }
        }
      }

      return {
        salesOverview,
        tooBrief,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  app.get('/:sessionId/sales-technique', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          salesTechniques: null,
          tooBrief: true,
          generating: false,
        };
      }

      // AIA KO assessment types don't use salesTechniques - they have their own assessment endpoints
      if (
        session.assessmentType === 'aia-ko-opening-objection-call' ||
        session.assessmentType === 'aia-ko-product-pitch' ||
        session.assessmentType === 'aia-ko-end-to-end-outbound-call'
      ) {
        return {
          salesTechniques: null,
          tooBrief: false,
          generating: false,
        };
      }

      // KT AXA assessment types don't use salesTechniques - they have their own custom assessments
      if (
        session.assessmentType === 'kt-axa-recruitment' ||
        session.assessmentType === 'kt-axa-fna' ||
        session.assessmentType === 'kt-axa-wealthplus'
      ) {
        return {
          salesTechniques: null,
          tooBrief: false,
          generating: false,
        };
      }

      // Manulife GoalReady assessment types don't use salesTechniques - they have their own assessment endpoints
      if (
        session.assessmentType === 'manulife-goalready'
      ) {
        return {
          salesTechniques: null,
          tooBrief: false,
          generating: false,
        };
      }

      // Handle Great Eastern assessments
      if (session.assessmentType === 'great-eastern') {
        // If data exists, return it
        if (session.roleplay.feedback?.greatEasternAssessment) {
          return {
            greatEasternAssessment: parseJsonSafely(
              session.roleplay.feedback.greatEasternAssessment,
            ),
            tooBrief: false,
            generating: false,
          };
        }

        // Check if currently generating
        const isGenerating =
          session.roleplay.feedback?.greatEasternAssessmentGenerating || false;

        // If not generating and no data, trigger generation
        if (!isGenerating) {
          console.log(
            `[Great Eastern] Triggering assessment generation for session: ${sessionId}`,
          );

          const languageCode = getLanguageHeader(request);
          const agenda = getAgenda();

          // Set generating flag and queue job
          await session.updateOne({
            $set: {
              'roleplay.feedback.greatEasternAssessmentGenerating': true,
            },
          });

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
        }

        return {
          greatEasternAssessment: null,
          tooBrief: false,
          generating: true,
        };
      }

      // Handle MSIG assessments
      if (session.assessmentType === 'msig') {
        let currentAssessment = await getMSIGAssessmentData(sessionId);

        // Initialize empty structure if no assessment exists
        if (!currentAssessment) {
          currentAssessment = {
            sections: {},
            overallScore: 0,
          };
        }

        // Ensure all sections exist in the structure with default values
        const availableSections = getAvailableSections();
        availableSections.forEach((sectionType) => {
          if (!currentAssessment.sections[sectionType]) {
            currentAssessment.sections[sectionType] = {
              isGenerating: false,
              evaluations: [],
              sectionWeight: 0,
              description: '',
            };
          }
        });

        // Check for missing sections and queue them
        if (currentAssessment.sections) {
          const languageCode = getLanguageHeader(request);
          const agenda = getAgenda();

          let hasQueuedSections = false;

          for (const sectionType of availableSections) {
            const section = currentAssessment.sections[sectionType];

            // Queue section if it has no evaluations and is not currently generating
            if (
              !section ||
              ((!section.evaluations || section.evaluations.length === 0) &&
                !section.isGenerating)
            ) {
              console.log(
                `Auto-regenerating missing MSIG section ${sectionType} for session: ${sessionId}`,
              );

              // Mark as generating
              await setSectionGenerating(sessionId, sectionType, true);

              // Queue the generation job
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_MSIG_SECTION_ASSESSMENT, {
                  sessionId,
                  languageCode,
                  sectionType,
                })
                .catch((error) => {
                  console.error(
                    `Failed to queue MSIG section ${sectionType}:`,
                    error,
                  );
                  // Clear generating flag on error
                  setSectionGenerating(sessionId, sectionType, false);
                });

              hasQueuedSections = true;
            }
          }

          // Get updated assessment data after potential queuing
          currentAssessment = await getMSIGAssessmentData(sessionId);

          // Check if any sections are currently generating
          const hasGeneratingSections = Object.values(
            currentAssessment.sections || {},
          ).some((section: any) => section.isGenerating === true);

          return {
            salesTechniques: currentAssessment,
            tooBrief: false,
            generating: hasGeneratingSections || hasQueuedSections,
            lastUpdated: new Date().toISOString(),
          };
        }
      }

      // Handle Manulife FNA assessments
      if (session.assessmentType === 'manulife') {
        let currentAssessment = await getManulifeAssessmentData(sessionId);

        // Initialize empty structure if no assessment exists
        if (!currentAssessment) {
          currentAssessment = {
            sections: {},
          };
        }

        // Ensure all sections exist in the structure with default values
        const availableSections = getManulifeAvailableSections();
        availableSections.forEach((sectionType) => {
          if (!currentAssessment.sections[sectionType]) {
            currentAssessment.sections[sectionType] = {
              isGenerating: false,
              evaluations: [],
              description: '',
            };
          }
        });

        // Check for missing sections and queue them
        if (currentAssessment.sections) {
          const languageCode = getLanguageHeader(request);
          const agenda = getAgenda();

          let hasQueuedSections = false;

          for (const sectionType of availableSections) {
            const section = currentAssessment.sections[sectionType];

            // Queue section if it has no evaluations and is not currently generating
            if (
              !section ||
              ((!section.evaluations || section.evaluations.length === 0) &&
                !section.isGenerating)
            ) {
              console.log(
                `Auto-regenerating missing Manulife section ${sectionType} for session: ${sessionId}`,
              );

              // Mark as generating
              await setManulifeSectionGenerating(sessionId, sectionType, true);

              // Queue the generation job
              agenda
                .now(AGENDA_JOB_TYPES.GENERATE_MANULIFE_SECTION_ASSESSMENT, {
                  sessionId,
                  languageCode,
                  sectionType,
                })
                .catch((error) => {
                  console.error(
                    `Failed to queue Manulife section ${sectionType}:`,
                    error,
                  );
                  // Clear generating flag on error
                  setManulifeSectionGenerating(sessionId, sectionType, false);
                });

              hasQueuedSections = true;
            }
          }

          // Get updated assessment data after potential queuing
          currentAssessment = await getManulifeAssessmentData(sessionId);

          // Check if any sections are currently generating
          const hasGeneratingSections = Object.values(
            currentAssessment.sections || {},
          ).some((section: any) => section.isGenerating === true);

          return {
            salesTechniques: currentAssessment,
            tooBrief: false,
            generating: hasGeneratingSections || hasQueuedSections,
            lastUpdated: new Date().toISOString(),
          };
        }
      }

      // Scorecard sessions don't have sales techniques — return early
      if (session.assessmentType === 'scorecard') {
        return {
          salesTechniques: null,
          tooBrief: false,
          generating: false,
        };
      }

      // If data exists, return it (for other assessment types)
      if (session.roleplay.feedback?.salesTechniques) {
        return {
          salesTechniques: parseJsonSafely(
            session.roleplay.feedback.salesTechniques,
          ),
          tooBrief: false,
          generating: false,
          isStandingGenerating:
            session.roleplay.feedback?.isStandingGenerating || false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.salesTechniquesGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering sales technique generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: { 'roleplay.feedback.salesTechniquesGenerating': true },
        });

        if (session.assessmentType === 'prudential') {
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
        } else {
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
        }
      }

      return {
        salesTechniques: null,
        tooBrief: false,
        generating: true,
        isStandingGenerating:
          session.roleplay.feedback?.isStandingGenerating || false,
      };
    },
  });

  app.get('/:sessionId/scorecards', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params as { sessionId: string };
      const languageCode = getLanguageHeader(request);

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          scorecards: [],
          tooBrief: true,
          generating: false,
        };
      }

      const scenario = (await Scenario.findById(session.scenario)
        .populate('scorecard')
        .orFail()) as Omit<IScenario, 'scorecard'> & {
        scorecard: ScorecardDocument;
      } & Document;

      const baseSections = scenario?.scorecard?.sections ?? [];

      // Check if there are localized sections for the current language
      const localizations = scenario?.scorecard?.localizations as
        | Map<string, { name: string; sections?: ScorecardSection[] }>
        | undefined;
      const localizedData = localizations?.get?.(languageCode);
      const localizedSections = localizedData?.sections;

      const scorecardSections: ScorecardSection[] = baseSections.map(
        (baseSection, index) => {
          const localizedSection = localizedSections?.[index];

          if (localizedSection) {
            return {
              ...localizedSection,
              prompt: baseSection.prompt,
            };
          }

          return baseSection;
        },
      );

      // No custom scorecards defined in scenario
      if (scorecardSections.length === 0) {
        return {
          scorecards: [],
          tooBrief: false,
          generating: false,
        };
      }

      // Get session's generated scorecards
      const sessionScorecards: any =
        session.roleplay.feedback?.scorecards ?? [];

      // Create a map for quick lookup
      const generatedMap = new Map(
        sessionScorecards.map((sc: any) => [sc.name, sc]),
      );

      // Build response with status for each scorecard
      const scorecardsWithStatus = scorecardSections.map(
        (section: ScorecardSection) => {
          const existing = generatedMap.get(section.name);

          if (existing) {
            // Return existing scorecard (whether generating, complete, or failed)
            return existing;
          }

          // Doesn't exist yet - will need to generate
          return {
            name: section.name,
            sectionType: section.sectionType,
            isGenerating: false,
            overallScore: undefined,
            maxScore: undefined,
            criteria: undefined,
          };
        },
      );

      // Check if any scorecards are currently generating
      const anyGenerating = scorecardsWithStatus.some(
        (sc: any) => sc.isGenerating,
      );

      // Check if all scorecards are complete (have criteria)
      const allComplete = scorecardsWithStatus.every(
        (sc: any) => sc.criteria?.length > 0,
      );

      // If all complete, return them
      if (allComplete) {
        return {
          scorecards: scorecardsWithStatus,
          tooBrief: false,
          generating: false,
        };
      }

      // If some are generating, return current state without triggering new jobs
      if (anyGenerating) {
        return {
          scorecards: scorecardsWithStatus,
          tooBrief: false,
          generating: true,
        };
      }

      // Need to trigger generation for scorecards that:
      // 1. Don't exist yet, OR
      // 2. Exist but have no criteria (generation failed/incomplete)
      const scorecardsToGenerate = scorecardSections.filter(
        (section: ScorecardSection) => {
          const existing: any = generatedMap.get(section.name);
          // Generate if doesn't exist OR exists but incomplete
          return !existing || !existing.criteria;
        },
      );

      if (scorecardsToGenerate.length > 0) {
        const agenda = getAgenda();
        agenda.now(AGENDA_JOB_TYPES.EVALUATE_SCORECARDS, {
          sessionId,
          scorecards: scorecardsToGenerate,
          languageCode,
        });

        // Mark these scorecards as generating in the response
        const responseWithGenerating = scorecardsWithStatus.map((sc: any) => {
          const needsGeneration = scorecardsToGenerate.find(
            (section) => section.name === sc.name,
          );
          if (needsGeneration) {
            return {
              ...sc,
              isGenerating: true,
            };
          }
          return sc;
        });

        return {
          scorecards: responseWithGenerating,
          tooBrief: false,
          generating: true,
        };
      }

      // Edge case: nothing generating, not all complete, but nothing to generate?
      // This shouldn't happen, but return current state
      return {
        scorecards: scorecardsWithStatus,
        tooBrief: false,
        generating: false,
      };
    },
  });

  app.get('/:sessionId/product-knowledge', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          productKnowledge: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // AIA KO assessment types don't use productKnowledge - they have their own assessment endpoints
      if (
        session.assessmentType === 'aia-ko-opening-objection-call' ||
        session.assessmentType === 'aia-ko-product-pitch' ||
        session.assessmentType === 'aia-ko-end-to-end-outbound-call'
      ) {
        return {
          productKnowledge: {},
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // KT AXA assessment types don't use regular productKnowledge - they have their own custom assessment
      if (
        session.assessmentType === 'kt-axa-recruitment' ||
        session.assessmentType === 'kt-axa-fna' ||
        session.assessmentType === 'kt-axa-wealthplus'
      ) {
        return {
          productKnowledge: {},
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.productKnowledge) {
        return {
          productKnowledge: parseJsonSafely(
            session.roleplay.feedback.productKnowledge,
          ),
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.productKnowledgeGenerating || false;

      // 🆕 Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering product knowledge generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: { 'roleplay.feedback.productKnowledgeGenerating': true },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_PRODUCT_KNOWLEDGE, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error('Failed to queue product knowledge job:', error);
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: { 'roleplay.feedback.productKnowledgeGenerating': false },
              })
              .catch(console.error);
          });
      }

      return {
        productKnowledge: {},
        tooBrief: false,
        characterName: session.persona?.name || 'Prospect',
        generating: true,
      };
    },
  });

  app.get('/:sessionId/technical-knowledge', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          technicalKnowledge: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.technicalKnowledge) {
        const technicalKnowledge = parseJsonSafely(
          session.roleplay.feedback.technicalKnowledge,
        );

        const response: any = {
          technicalKnowledge,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };

        return response;
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.technicalKnowledgeGenerating || false;

      // 🆕 Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering technical knowledge generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: { 'roleplay.feedback.technicalKnowledgeGenerating': true },
        });

        if (session.assessmentType === 'prudential') {
          agenda
            .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_TECHNICAL_KNOWLEDGE, {
              sessionId,
              languageCode,
            })
            .catch((error) => {
              console.error(
                `[Prudential] Failed to queue technical knowledge job for session ${sessionId}:`,
                error,
              );
              // Clear flag if queueing fails
              session
                .updateOne({
                  $set: {
                    'roleplay.feedback.technicalKnowledgeGenerating': false,
                  },
                })
                .catch(console.error);
            });
        } else {
          // For non-Prudential sessions, use regular product knowledge
          agenda
            .now(AGENDA_JOB_TYPES.GENERATE_PRODUCT_KNOWLEDGE, {
              sessionId,
              languageCode,
            })
            .catch((error) => {
              console.error('Failed to queue product knowledge job:', error);
              // Clear flag if queueing fails
              session
                .updateOne({
                  $set: {
                    'roleplay.feedback.technicalKnowledgeGenerating': false,
                  },
                })
                .catch(console.error);
            });
        }
      }

      return {
        technicalKnowledge: {},
        tooBrief: false,
        characterName: session.persona?.name || 'Prospect',
        generating: true,
      };
    },
  });

  app.get('/:sessionId/audio-feedback', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      try {
        const session = await verifySessionOwnership(
          sessionId,
          request.user!,
          app,
        );

        if (!session.roleplay) {
          throw app.httpErrors.badRequest('Roleplay not started yet');
        }

        // Check if we have overview data to generate audio from
        if (!session.roleplay.feedback?.overview) {
          throw app.httpErrors.badRequest('Overview not available yet');
        }

        const overviewData = parseJsonSafely(
          session.roleplay.feedback.overview,
        );
        if (!overviewData || !overviewData.summary) {
          throw app.httpErrors.badRequest('Overview data not valid');
        }

        // Generate the feedback text (same logic as frontend)
        const feedbackText = `${overviewData.summary} Next steps: ${overviewData.suggestedNextSteps?.join('. ') || ''}`;

        // Create a hash of the feedback text for caching
        const contentHash = createHash('sha256')
          .update(feedbackText)
          .digest('hex');
        const audioFileName = `audio-feedback/${sessionId}-${contentHash}.mp3`;

        // Check if audio file already exists in S3
        try {
          const audioBuffer = await app.s3.getFileBuffer(audioFileName);
          app.log.info(
            `Returning cached audio from S3 for session ${sessionId}`,
          );

          // Generate CloudFront URL for cached audio
          const publicUrl = `${CLOUDFRONT_DOMAIN}/${audioFileName}`;

          // Update session with cached audio URL if not already set
          if (!session.roleplay.feedback?.audioUrl) {
            await session.updateOne({
              $set: {
                'roleplay.feedback.audioUrl': publicUrl,
              },
            });
          }

          reply.header('Content-Type', 'audio/mpeg');
          reply.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
          return reply.send(audioBuffer);
        } catch (error) {
          // File doesn't exist in S3, need to generate it
          app.log.info(
            `Audio not found in S3 for session ${sessionId}, generating new audio`,
          );
        }

        app.log.info(
          `Generating audio for session ${sessionId}, text length: ${feedbackText.length}`,
        );

        // Generate audio using ElevenLabs
        if (!process.env.ELEVENLABS_API_KEY) {
          throw app.httpErrors.badRequest('ElevenLabs API key not configured');
        }

        const response = await axios({
          method: 'POST',
          url: 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Default voice
          headers: {
            Accept: 'audio/mpeg',
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          data: {
            text: feedbackText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true,
            },
          },
          responseType: 'arraybuffer',
        });

        const audioBuffer = Buffer.from(response.data);

        // Save audio to temp file
        const tempFileName = `audio-${sessionId}-${contentHash}.mp3`;
        const tempFilePath = path.join(os.tmpdir(), tempFileName);
        await fs.writeFile(tempFilePath, audioBuffer);

        // Queue background S3 upload job - don't wait for it
        const agenda = getAgenda();
        agenda
          .now(AGENDA_JOB_TYPES.UPLOAD_AUDIO_TO_S3, {
            sessionId: sessionId,
            tempFilePath: tempFilePath, // Pass temp file path instead of buffer
            audioFileName: audioFileName,
            contentHash: contentHash,
          })
          .catch((error: any) => {
            app.log.error(
              `Failed to queue S3 upload job for session ${sessionId}:`,
              error,
            );
            // Cleanup temp file if job queueing fails
            fs.unlink(tempFilePath).catch((cleanupError) => {
              app.log.warn(
                `Failed to cleanup temp file after job queue error: ${tempFilePath}`,
                cleanupError,
              );
            });
          });

        app.log.info(
          `Audio generated for session ${sessionId}, saved to temp file and S3 upload queued in background`,
        );

        // Return audio immediately to user (no waiting for S3 upload)
        reply.header('Content-Type', 'audio/mpeg');
        reply.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        return reply.send(audioBuffer);
      } catch (error: any) {
        if (error instanceof HttpError) {
          throw error;
        }

        app.log.error('Error generating audio feedback:', error);
        const message =
          error.response?.data?.detail?.message ||
          error.message ||
          'Failed to generate audio feedback';
        const statusCode = error.response?.status || 500;
        return reply.code(statusCode).send({ error: message });
      }
    },
  });

  // BBL Advisory Technique endpoint
  app.get('/:sessionId/bbl-advisory-technique', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      if (session.assessmentType !== 'bbl') {
        throw app.httpErrors.badRequest('Not a BBL session');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          salesTechniques: null,
          tooBrief: true,
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.advisoryTechnique) {
        return {
          salesTechniques: parseJsonSafely(
            session.roleplay.feedback.advisoryTechnique,
          ),
          tooBrief: false,
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.advisoryTechniqueGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering BBL advisory technique generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        await session.updateOne({
          $set: { 'roleplay.feedback.advisoryTechniqueGenerating': true },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_BBL_ADVISORY_TECHNIQUE, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error('Failed to queue BBL advisory technique job:', error);
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.advisoryTechniqueGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        salesTechniques: null,
        tooBrief: false,
        generating: true,
      };
    },
  });

  // BBL Process Adherence endpoint
  app.get('/:sessionId/bbl-process-adherence', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      if (session.assessmentType !== 'bbl') {
        throw app.httpErrors.badRequest('Not a BBL session');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          productKnowledge: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.processAdherence) {
        return {
          productKnowledge: parseJsonSafely(
            session.roleplay.feedback.processAdherence,
          ),
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.processAdherenceGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering BBL process adherence generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        await session.updateOne({
          $set: { 'roleplay.feedback.processAdherenceGenerating': true },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_BBL_PROCESS_ADHERENCE, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error('Failed to queue BBL process adherence job:', error);
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.processAdherenceGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        productKnowledge: {},
        tooBrief: false,
        characterName: session.persona?.name || 'Prospect',
        generating: true,
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/grab-mex-soft-skills
   * @description Get grab-mex soft skills assessment using LAER framework
   */
  app.get('/:sessionId/grab-mex-soft-skills', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for grab-mex assessment type
      if (
        session.assessmentType !== 'grab-mex' &&
        session.callType !== 'grab-mex'
      ) {
        throw app.httpErrors.badRequest(
          'Soft skills assessment only available for grab-mex sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          grabMexSoftSkills: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.grabMexSoftSkills) {
        const grabMexSoftSkills = parseJsonSafely(
          session.roleplay.feedback.grabMexSoftSkills,
        );

        const response: any = {
          grabMexSoftSkills,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };

        return response;
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.grabMexSoftSkillsGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering grab-mex soft skills generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: { 'roleplay.feedback.grabMexSoftSkillsGenerating': true },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_GRAB_MEX_SOFT_SKILLS, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error('Failed to queue grab-mex soft skills job:', error);
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.grabMexSoftSkillsGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        grabMexSoftSkills: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/axa-ph-soft-skills
   * @description Get AXA-PH soft skills assessment
   */
  app.get('/:sessionId/axa-ph-soft-skills', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for AXA-PH assessment types
      if (
        session.assessmentType !== 'axa-ph-recruitment' &&
        session.assessmentType !== 'axa-ph-objection-handling'
      ) {
        throw app.httpErrors.badRequest(
          'Soft skills assessment only available for AXA-PH sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          axaPhSoftSkills: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.axaPhSoftSkills) {
        const axaPhSoftSkills = parseJsonSafely(
          session.roleplay.feedback.axaPhSoftSkills,
        );

        const response: any = {
          axaPhSoftSkills,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };

        return response;
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.axaPhSoftSkillsGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering AXA-PH soft skills generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: { 'roleplay.feedback.axaPhSoftSkillsGenerating': true },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_AXA_PH_SOFT_SKILLS, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error('Failed to queue AXA-PH soft skills job:', error);
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.axaPhSoftSkillsGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        axaPhSoftSkills: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/axa-ph-knowledge-skills
   * @description Get AXA-PH knowledge skills assessment
   */
  app.get('/:sessionId/axa-ph-knowledge-skills', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for AXA-PH assessment types
      if (
        session.assessmentType !== 'axa-ph-recruitment' &&
        session.assessmentType !== 'axa-ph-objection-handling'
      ) {
        throw app.httpErrors.badRequest(
          'Knowledge skills assessment only available for AXA-PH sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          axaPhKnowledgeSkills: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.axaPhKnowledgeSkills) {
        const axaPhKnowledgeSkills = parseJsonSafely(
          session.roleplay.feedback.axaPhKnowledgeSkills,
        );

        const response: any = {
          axaPhKnowledgeSkills,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };

        return response;
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.axaPhKnowledgeSkillsGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering AXA-PH knowledge skills generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: { 'roleplay.feedback.axaPhKnowledgeSkillsGenerating': true },
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
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.axaPhKnowledgeSkillsGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        axaPhKnowledgeSkills: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/kt-axa-soft-skills
   * @description Get KT-AXA soft skills assessment
   */
  app.get('/:sessionId/kt-axa-soft-skills', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for KT-AXA assessment types
      if (
        session.assessmentType !== 'kt-axa-recruitment' &&
        session.assessmentType !== 'kt-axa-fna' &&
        session.assessmentType !== 'kt-axa-wealthplus'
      ) {
        throw app.httpErrors.badRequest(
          'Soft skills assessment only available for KT-AXA sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          ktAxaSoftSkills: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.ktAxaSoftSkills) {
        const ktAxaSoftSkills = parseJsonSafely(
          session.roleplay.feedback.ktAxaSoftSkills,
        );

        return {
          ktAxaSoftSkills,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.ktAxaSoftSkillsGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering KT-AXA soft skills generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: { 'roleplay.feedback.ktAxaSoftSkillsGenerating': true },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_KT_AXA_SOFT_SKILLS, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error('Failed to queue KT-AXA soft skills job:', error);
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.ktAxaSoftSkillsGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        ktAxaSoftSkills: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/kt-axa-knowledge-skills
   * @description Get KT-AXA knowledge skills assessment
   */
  app.get('/:sessionId/kt-axa-knowledge-skills', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for KT-AXA assessment types
      if (
        session.assessmentType !== 'kt-axa-recruitment' &&
        session.assessmentType !== 'kt-axa-fna' &&
        session.assessmentType !== 'kt-axa-wealthplus'
      ) {
        throw app.httpErrors.badRequest(
          'Knowledge skills assessment only available for KT-AXA sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          ktAxaKnowledgeSkills: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.ktAxaKnowledgeSkills) {
        const ktAxaKnowledgeSkills = parseJsonSafely(
          session.roleplay.feedback.ktAxaKnowledgeSkills,
        );

        return {
          ktAxaKnowledgeSkills,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.ktAxaKnowledgeSkillsGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering KT-AXA knowledge skills generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: { 'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': true },
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
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.ktAxaKnowledgeSkillsGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        ktAxaKnowledgeSkills: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/kt-axa-product-knowledge
   * @description Get KT-AXA product knowledge assessment (for FNA and WealthPlus)
   */
  app.get('/:sessionId/kt-axa-product-knowledge', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for KT-AXA FNA and WealthPlus assessment types
      if (
        session.assessmentType !== 'kt-axa-fna' &&
        session.assessmentType !== 'kt-axa-wealthplus'
      ) {
        throw app.httpErrors.badRequest(
          'Product knowledge assessment only available for KT-AXA FNA and WealthPlus sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          ktAxaProductKnowledge: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.ktAxaProductKnowledge) {
        const ktAxaProductKnowledge = parseJsonSafely(
          session.roleplay.feedback.ktAxaProductKnowledge,
        );

        return {
          ktAxaProductKnowledge,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.ktAxaProductKnowledgeGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering KT-AXA product knowledge generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: { 'roleplay.feedback.ktAxaProductKnowledgeGenerating': true },
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
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.ktAxaProductKnowledgeGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        ktAxaProductKnowledge: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  // HSBC Relationship Management endpoint
  app.get('/:sessionId/hsbc-relationship-management', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      if (session.assessmentType !== 'hsbc') {
        throw app.httpErrors.badRequest('Not a HSBC session');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          salesTechniques: null,
          tooBrief: true,
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.relationshipManagement) {
        return {
          salesTechniques: parseJsonSafely(
            session.roleplay.feedback.relationshipManagement,
          ),
          tooBrief: false,
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.isHsbcRelationshipManagementGenerating ||
        false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering HSBC relationship management generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        await session.updateOne({
          $set: {
            'roleplay.feedback.isHsbcRelationshipManagementGenerating': true,
          },
        });

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
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.isHsbcRelationshipManagementGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        salesTechniques: null,
        tooBrief: false,
        generating: true,
      };
    },
  });

  // HSBC Process Adherence endpoint
  app.get('/:sessionId/hsbc-process-adherence', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      if (session.assessmentType !== 'hsbc') {
        throw app.httpErrors.badRequest('Not a HSBC session');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          productKnowledge: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.processAdherence) {
        return {
          productKnowledge: parseJsonSafely(
            session.roleplay.feedback.processAdherence,
          ),
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.isHsbcProcessAdherenceGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering HSBC process adherence generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        await session.updateOne({
          $set: {
            'roleplay.feedback.isHsbcProcessAdherenceGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_HSBC_PROCESS_ADHERENCE, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error('Failed to queue HSBC process adherence job:', error);
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.isHsbcProcessAdherenceGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        productKnowledge: {},
        tooBrief: false,
        characterName: session.persona?.name || 'Prospect',
        generating: true,
      };
    },
  });

  // HSBC Representation endpoint
  app.get('/:sessionId/hsbc-representation', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      if (session.assessmentType !== 'hsbc') {
        throw app.httpErrors.badRequest('Not a HSBC session');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          productKnowledge: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.representation) {
        return {
          productKnowledge: parseJsonSafely(
            session.roleplay.feedback.representation,
          ),
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.isHsbcRepresentationGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering HSBC representation generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        await session.updateOne({
          $set: { 'roleplay.feedback.isHsbcRepresentationGenerating': true },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_HSBC_REPRESENTATION, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error('Failed to queue HSBC representation job:', error);
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.isHsbcRepresentationGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        productKnowledge: {},
        tooBrief: false,
        characterName: session.persona?.name || 'Prospect',
        generating: true,
      };
    },
  });

  // HSBC Communication and Presence endpoint
  app.get('/:sessionId/hsbc-communication-and-presence', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      if (session.assessmentType !== 'hsbc') {
        throw app.httpErrors.badRequest('Not a HSBC session');
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          productKnowledge: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.communicationAndPresence) {
        return {
          productKnowledge: parseJsonSafely(
            session.roleplay.feedback.communicationAndPresence,
          ),
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.communicationAndPresenceGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering HSBC communication and presence generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        await session.updateOne({
          $set: {
            'roleplay.feedback.communicationAndPresenceGenerating': true,
          },
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
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.communicationAndPresenceGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        productKnowledge: {},
        tooBrief: false,
        characterName: session.persona?.name || 'Prospect',
        generating: true,
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/prudential-oh-sales-technique
   * @description Get Prudential Objection Handling 3F Sales Technique assessment
   */
  app.get('/:sessionId/prudential-oh-sales-technique', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for prudential-objection-handling assessment type
      if (session.assessmentType !== 'prudential-objection-handling') {
        throw app.httpErrors.badRequest(
          'Sales technique assessment only available for Prudential Objection Handling sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          salesTechnique: null,
          tooBrief: true,
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.prudentialOHSalesTechnique) {
        return {
          salesTechnique: parseJsonSafely(
            session.roleplay.feedback.prudentialOHSalesTechnique,
          ),
          tooBrief: false,
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.prudentialOHSalesTechniqueGenerating ||
        false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering Prudential OH Sales Technique generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: {
            'roleplay.feedback.prudentialOHSalesTechniqueGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_OH_SALES_TECHNIQUE, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error(
              'Failed to queue Prudential OH Sales Technique job:',
              error,
            );
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.prudentialOHSalesTechniqueGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        salesTechnique: null,
        tooBrief: false,
        generating: true,
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/prudential-oh-objection-handling
   * @description Get Prudential Objection Handling LAPR Objection Handling assessment
   */
  app.get('/:sessionId/prudential-oh-objection-handling', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for prudential-objection-handling assessment type
      if (session.assessmentType !== 'prudential-objection-handling') {
        throw app.httpErrors.badRequest(
          'Objection handling assessment only available for Prudential Objection Handling sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          objectionHandling: null,
          tooBrief: true,
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.prudentialOHObjectionHandling) {
        return {
          objectionHandling: parseJsonSafely(
            session.roleplay.feedback.prudentialOHObjectionHandling,
          ),
          tooBrief: false,
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.prudentialOHObjectionHandlingGenerating ||
        false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering Prudential OH Objection Handling generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: {
            'roleplay.feedback.prudentialOHObjectionHandlingGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_OH_OBJECTION_HANDLING, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error(
              'Failed to queue Prudential OH Objection Handling job:',
              error,
            );
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.prudentialOHObjectionHandlingGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        objectionHandling: null,
        tooBrief: false,
        generating: true,
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/prudential-ph-appointment-setting
   * @description Get Prudential PH Appointment Setting assessment
   */
  app.get('/:sessionId/prudential-ph-appointment-setting', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for prudential-ph-appointment-setting assessment type
      if (session.assessmentType !== 'prudential-ph-appointment-setting') {
        throw app.httpErrors.badRequest(
          'Appointment setting assessment only available for Prudential PH Appointment Setting sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          appointmentSetting: null,
          tooBrief: true,
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.prudentialPHAppointmentSetting) {
        console.log(JSON.stringify(session.roleplay, null, 2));
        return {
          appointmentSetting: parseJsonSafely(
            session.roleplay.feedback.prudentialPHAppointmentSetting,
          ),
          tooBrief: false,
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.prudentialPHAppointmentSettingGenerating ||
        false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering Prudential PH Appointment Setting generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: {
            'roleplay.feedback.prudentialPHAppointmentSettingGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_PH_APPOINTMENT_SETTING, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error(
              'Failed to queue Prudential PH Appointment Setting job:',
              error,
            );
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.prudentialPHAppointmentSettingGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        appointmentSetting: null,
        tooBrief: false,
        generating: true,
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/prudential-ph-fact-finding-technique
   * @description Get Prudential PH Fact Finding Technique (SPIN) assessment
   */
  app.get('/:sessionId/prudential-ph-fact-finding-technique', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      if (session.assessmentType !== 'prudential-ph-fact-finding') {
        throw app.httpErrors.badRequest(
          'Fact finding technique assessment only available for Prudential PH Fact Finding sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          factFindingTechnique: null,
          tooBrief: true,
          generating: false,
        };
      }

      if (session.roleplay.feedback?.prudentialPHFactFindingTechnique) {
        return {
          factFindingTechnique: parseJsonSafely(
            session.roleplay.feedback.prudentialPHFactFindingTechnique,
          ),
          tooBrief: false,
          generating: false,
        };
      }

      const isGenerating =
        session.roleplay.feedback?.prudentialPHFactFindingTechniqueGenerating ||
        false;

      if (!isGenerating) {
        console.log(
          `Triggering Prudential PH Fact Finding Technique generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        await session.updateOne({
          $set: {
            'roleplay.feedback.prudentialPHFactFindingTechniqueGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_PH_FACT_FINDING_TECHNIQUE, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error(
              'Failed to queue Prudential PH Fact Finding Technique job:',
              error,
            );
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.prudentialPHFactFindingTechniqueGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        factFindingTechnique: null,
        tooBrief: false,
        generating: true,
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/prudential-ph-product-knowledge
   * @description Get Prudential PH Product Knowledge (FAB) assessment
   */
  app.get('/:sessionId/prudential-ph-product-knowledge', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      if (session.assessmentType !== 'prudential-ph-fact-finding') {
        throw app.httpErrors.badRequest(
          'Product knowledge assessment only available for Prudential PH Fact Finding sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          productKnowledge: null,
          tooBrief: true,
          generating: false,
        };
      }

      if (session.roleplay.feedback?.prudentialPHProductKnowledge) {
        return {
          productKnowledge: parseJsonSafely(
            session.roleplay.feedback.prudentialPHProductKnowledge,
          ),
          tooBrief: false,
          generating: false,
        };
      }

      const isGenerating =
        session.roleplay.feedback?.prudentialPHProductKnowledgeGenerating ||
        false;

      if (!isGenerating) {
        console.log(
          `Triggering Prudential PH Product Knowledge generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        await session.updateOne({
          $set: {
            'roleplay.feedback.prudentialPHProductKnowledgeGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_PH_PRODUCT_KNOWLEDGE, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error(
              'Failed to queue Prudential PH Product Knowledge job:',
              error,
            );
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.prudentialPHProductKnowledgeGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        productKnowledge: null,
        tooBrief: false,
        generating: true,
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/prudential-ph-closing-call-technique
   * @description Get Prudential PH Closing Call Technique assessment
   */
  app.get('/:sessionId/prudential-ph-closing-call-technique', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      if (session.assessmentType !== 'prudential-ph-closing-call') {
        throw app.httpErrors.badRequest(
          'Closing call technique assessment only available for Prudential PH Closing Call sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          closingCallTechnique: null,
          tooBrief: true,
          generating: false,
        };
      }

      if (session.roleplay.feedback?.prudentialPHClosingCallTechnique) {
        return {
          closingCallTechnique: parseJsonSafely(
            session.roleplay.feedback.prudentialPHClosingCallTechnique,
          ),
          tooBrief: false,
          generating: false,
        };
      }

      const isGenerating =
        session.roleplay.feedback?.prudentialPHClosingCallTechniqueGenerating ||
        false;

      if (!isGenerating) {
        console.log(
          `Triggering Prudential PH Closing Call Technique generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        await session.updateOne({
          $set: {
            'roleplay.feedback.prudentialPHClosingCallTechniqueGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_PH_CLOSING_CALL_TECHNIQUE, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error(
              'Failed to queue Prudential PH Closing Call Technique job:',
              error,
            );
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.prudentialPHClosingCallTechniqueGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        closingCallTechnique: null,
        tooBrief: false,
        generating: true,
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/msig-travel-easy-soft-skills
   * @description Get MSIG TravelEasy soft skills assessment
   */
  app.get('/:sessionId/msig-travel-easy-soft-skills', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for MSIG TravelEasy assessment type
      if (session.assessmentType !== 'msig-travel-easy') {
        throw app.httpErrors.badRequest(
          'Soft skills assessment only available for MSIG TravelEasy sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          msigTravelEasySoftSkills: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.msigTravelEasySoftSkills) {
        const msigTravelEasySoftSkills = parseJsonSafely(
          session.roleplay.feedback.msigTravelEasySoftSkills,
        );

        return {
          msigTravelEasySoftSkills,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.msigTravelEasySoftSkillsGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering MSIG TravelEasy soft skills generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: {
            'roleplay.feedback.msigTravelEasySoftSkillsGenerating': true,
          },
        });

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
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.msigTravelEasySoftSkillsGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        msigTravelEasySoftSkills: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/msig-travel-easy-knowledge-skills
   * @description Get MSIG TravelEasy knowledge skills assessment
   */
  app.get('/:sessionId/msig-travel-easy-knowledge-skills', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for MSIG TravelEasy assessment type
      if (session.assessmentType !== 'msig-travel-easy') {
        throw app.httpErrors.badRequest(
          'Knowledge skills assessment only available for MSIG TravelEasy sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          msigTravelEasyKnowledgeSkills: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.msigTravelEasyKnowledgeSkills) {
        const msigTravelEasyKnowledgeSkills = parseJsonSafely(
          session.roleplay.feedback.msigTravelEasyKnowledgeSkills,
        );

        return {
          msigTravelEasyKnowledgeSkills,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.msigTravelEasyKnowledgeSkillsGenerating ||
        false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering MSIG TravelEasy knowledge skills generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: {
            'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_MSIG_TRAVEL_EASY_KNOWLEDGE_SKILLS, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error(
              'Failed to queue MSIG TravelEasy knowledge skills job:',
              error,
            );
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.msigTravelEasyKnowledgeSkillsGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        msigTravelEasyKnowledgeSkills: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/msig-travel-easy-product-knowledge
   * @description Get MSIG TravelEasy product knowledge assessment
   */
  app.get('/:sessionId/msig-travel-easy-product-knowledge', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(request, reply) {
      const { sessionId } = request.params;

      const session = await verifySessionOwnership(
        sessionId,
        request.user!,
        app,
      );

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Only available for MSIG TravelEasy assessment type
      if (session.assessmentType !== 'msig-travel-easy') {
        throw app.httpErrors.badRequest(
          'Product knowledge assessment only available for MSIG TravelEasy sessions',
        );
      }

      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      const tooBrief = isSessionTooBrief(messages);

      if (tooBrief) {
        return {
          msigTravelEasyProductKnowledge: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.msigTravelEasyProductKnowledge) {
        const msigTravelEasyProductKnowledge = parseJsonSafely(
          session.roleplay.feedback.msigTravelEasyProductKnowledge,
        );

        return {
          msigTravelEasyProductKnowledge,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.msigTravelEasyProductKnowledgeGenerating ||
        false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering MSIG TravelEasy product knowledge generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(request);
        const agenda = getAgenda();

        // Set generating flag and queue job
        await session.updateOne({
          $set: {
            'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_MSIG_TRAVEL_EASY_PRODUCT_KNOWLEDGE, {
            sessionId,
            languageCode,
          })
          .catch((error) => {
            console.error(
              'Failed to queue MSIG TravelEasy product knowledge job:',
              error,
            );
            // Clear flag if queueing fails
            session
              .updateOne({
                $set: {
                  'roleplay.feedback.msigTravelEasyProductKnowledgeGenerating': false,
                },
              })
              .catch(console.error);
          });
      }

      return {
        msigTravelEasyProductKnowledge: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/aia-ko-introduction
   * @description Get AIA KO introduction assessment
   */
  app.get('/:sessionId/aia-ko-introduction', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for AIA KO assessment type
      if (session.assessmentType !== 'aia-ko-opening-objection-call') {
        throw app.httpErrors.badRequest(
          'Introduction assessment only available for AIA KO Opening & Objection Call sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          introduction: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.aiaKoIntroduction) {
        const introduction = parseJsonSafely(
          session.roleplay.feedback.aiaKoIntroduction,
        );

        return {
          introduction,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.aiaKoIntroductionGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering AIA KO introduction generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.aiaKoIntroductionGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_INTRODUCTION, {
            sessionId,
            languageCode,
          })
          .then(() => {
            console.log('AIA KO introduction job queued');
          })
          .catch((error) => {
            console.error('Error queueing AIA KO introduction job:', error);
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.aiaKoIntroductionGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        introduction: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/aia-ko-objection-handling
   * @description Get AIA KO objection handling assessment
   */
  app.get('/:sessionId/aia-ko-objection-handling', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for AIA KO assessment type
      if (session.assessmentType !== 'aia-ko-opening-objection-call') {
        throw app.httpErrors.badRequest(
          'Objection handling assessment only available for AIA KO Opening & Objection Call sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          objectionHandling: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.aiaKoObjectionHandling) {
        const objectionHandling = parseJsonSafely(
          session.roleplay.feedback.aiaKoObjectionHandling,
        );

        return {
          objectionHandling,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.aiaKoObjectionHandlingGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering AIA KO objection handling generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.aiaKoObjectionHandlingGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_OBJECTION_HANDLING, {
            sessionId,
            languageCode,
          })
          .then(() => {
            console.log('AIA KO objection handling job queued');
          })
          .catch((error) => {
            console.error(
              'Error queueing AIA KO objection handling job:',
              error,
            );
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.aiaKoObjectionHandlingGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        objectionHandling: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/aia-ko-needs-exploration
   * @description Get AIA KO needs exploration assessment
   */
  app.get('/:sessionId/aia-ko-needs-exploration', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for AIA KO assessment type
      if (session.assessmentType !== 'aia-ko-opening-objection-call') {
        throw app.httpErrors.badRequest(
          'Needs exploration assessment only available for AIA KO Opening & Objection Call sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          needsExploration: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.aiaKoNeedsExploration) {
        const needsExploration = parseJsonSafely(
          session.roleplay.feedback.aiaKoNeedsExploration,
        );

        return {
          needsExploration,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.aiaKoNeedsExplorationGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering AIA KO needs exploration generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.aiaKoNeedsExplorationGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_NEEDS_EXPLORATION, {
            sessionId,
            languageCode,
          })
          .then(() => {
            console.log('AIA KO needs exploration job queued');
          })
          .catch((error) => {
            console.error(
              'Error queueing AIA KO needs exploration job:',
              error,
            );
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.aiaKoNeedsExplorationGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        needsExploration: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/aia-ko-needs-analysis
   * @description Get AIA KO Product Pitch needs analysis assessment
   */
  app.get('/:sessionId/aia-ko-needs-analysis', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for AIA KO Product Pitch assessment type
      if (session.assessmentType !== 'aia-ko-product-pitch') {
        throw app.httpErrors.badRequest(
          'Needs analysis assessment only available for AIA KO Product Pitch sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          needsAnalysis: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.aiaKoNeedsAnalysis) {
        const needsAnalysis = parseJsonSafely(
          session.roleplay.feedback.aiaKoNeedsAnalysis,
        );

        return {
          needsAnalysis,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.aiaKoNeedsAnalysisGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering AIA KO needs analysis generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.aiaKoNeedsAnalysisGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_NEEDS_ANALYSIS, {
            sessionId,
            languageCode,
          })
          .then(() => {
            console.log('AIA KO needs analysis job queued');
          })
          .catch((error) => {
            console.error('Error queueing AIA KO needs analysis job:', error);
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.aiaKoNeedsAnalysisGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        needsAnalysis: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/aia-ko-product-pitch
   * @description Get AIA KO Product Pitch assessment
   */
  app.get('/:sessionId/aia-ko-product-pitch', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for AIA KO Product Pitch assessment type
      if (session.assessmentType !== 'aia-ko-product-pitch') {
        throw app.httpErrors.badRequest(
          'Product pitch assessment only available for AIA KO Product Pitch sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          productPitch: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.aiaKoProductPitch) {
        const productPitch = parseJsonSafely(
          session.roleplay.feedback.aiaKoProductPitch,
        );

        return {
          productPitch,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.aiaKoProductPitchGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering AIA KO product pitch generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.aiaKoProductPitchGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_PRODUCT_PITCH, {
            sessionId,
            languageCode,
          })
          .then(() => {
            console.log('AIA KO product pitch job queued');
          })
          .catch((error) => {
            console.error('Error queueing AIA KO product pitch job:', error);
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.aiaKoProductPitchGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        productPitch: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/aia-ko-product-pitch-objection-handling
   * @description Get AIA KO Product Pitch objection handling assessment
   */
  app.get('/:sessionId/aia-ko-product-pitch-objection-handling', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for AIA KO Product Pitch assessment type
      if (session.assessmentType !== 'aia-ko-product-pitch') {
        throw app.httpErrors.badRequest(
          'Objection handling assessment only available for AIA KO Product Pitch sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          objectionHandling: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.aiaKoProductPitchObjectionHandling) {
        const objectionHandling = parseJsonSafely(
          session.roleplay.feedback.aiaKoProductPitchObjectionHandling,
        );

        return {
          objectionHandling,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback
          ?.aiaKoProductPitchObjectionHandlingGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering AIA KO product pitch objection handling generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': true,
          },
        });

        agenda
          .now(
            AGENDA_JOB_TYPES.GENERATE_AIA_KO_PRODUCT_PITCH_OBJECTION_HANDLING,
            {
              sessionId,
              languageCode,
            },
          )
          .then(() => {
            console.log('AIA KO product pitch objection handling job queued');
          })
          .catch((error) => {
            console.error(
              'Error queueing AIA KO product pitch objection handling job:',
              error,
            );
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.aiaKoProductPitchObjectionHandlingGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        objectionHandling: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/aia-ko-e2e-assessment
   * @description Get AIA KO End-To-End Outbound Call comprehensive assessment
   */
  app.get('/:sessionId/aia-ko-e2e-assessment', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for AIA KO E2E assessment type
      if (session.assessmentType !== 'aia-ko-end-to-end-outbound-call') {
        throw app.httpErrors.badRequest(
          'E2E assessment only available for AIA KO End-To-End Outbound Call sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          e2eAssessment: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay.feedback?.aiaKoE2EAssessment) {
        const e2eAssessment = parseJsonSafely(
          session.roleplay.feedback.aiaKoE2EAssessment,
        );

        return {
          e2eAssessment,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay.feedback?.aiaKoE2EAssessmentGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering AIA KO E2E assessment generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.aiaKoE2EAssessmentGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_AIA_KO_E2E_ASSESSMENT, {
            sessionId,
            languageCode,
          })
          .then(() => {
            console.log('AIA KO E2E assessment job queued');
          })
          .catch((error) => {
            console.error('Error queueing AIA KO E2E assessment job:', error);
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.aiaKoE2EAssessmentGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        e2eAssessment: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

    /**
   * @method GET /sessions/:sessionId/manulife-sales-and-negotiation-skills
   * @description Get Manulife GoalReady Sales and Negotiation Skills assessment
   */
  app.get('/:sessionId/manulife-sales-and-negotiation-skills', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for Manulife GoalReady assessment type
      if (session.assessmentType !== 'manulife-goalready') {
        throw app.httpErrors.badRequest(
          'Sales and negotiation skills assessment only available for Manulife GoalReady sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          salesAndNegotiationSkills: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay?.feedback?.manulifeSalesAndNegotiationSkills) {
        const salesAndNegotiationSkills = parseJsonSafely(
          session.roleplay.feedback.manulifeSalesAndNegotiationSkills,
        );

        return {
          salesAndNegotiationSkills,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay?.feedback
          ?.manulifeSalesAndNegotiationSkillsGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering Manulife sales and negotiation skills generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.manulifeSalesAndNegotiationSkillsGenerating': true,
          },
        });

        agenda
          .now(
            AGENDA_JOB_TYPES.GENERATE_MANULIFE_SALES_AND_NEGOTIATION_SKILLS,
            {
              sessionId,
              languageCode,
            },
          )
          .then(() => {
            console.log('Manulife sales and negotiation skills job queued');
          })
          .catch((error) => {
            console.error(
              'Error queueing Manulife sales and negotiation skills job:',
              error,
            );
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.manulifeSalesAndNegotiationSkillsGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        salesAndNegotiationSkills: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/manulife-soft-skills
   * @description Get Manulife GoalReady Soft Skills assessment
   */
  app.get('/:sessionId/manulife-soft-skills', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for Manulife GoalReady assessment type
      if (session.assessmentType !== 'manulife-goalready') {
        throw app.httpErrors.badRequest(
          'Soft skills assessment only available for Manulife GoalReady sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          softSkills: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay?.feedback?.manulifeSoftSkills) {
        const softSkills = parseJsonSafely(
          session.roleplay.feedback.manulifeSoftSkills,
        );

        return {
          softSkills,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay?.feedback?.manulifeSoftSkillsGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering Manulife soft skills generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.manulifeSoftSkillsGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_MANULIFE_SOFT_SKILLS, {
            sessionId,
            languageCode,
          })
          .then(() => {
            console.log('Manulife soft skills job queued');
          })
          .catch((error) => {
            console.error('Error queueing Manulife soft skills job:', error);
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.manulifeSoftSkillsGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        softSkills: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  /**
   * @method GET /sessions/:sessionId/manulife-product-knowledge
   * @description Get Manulife GoalReady Product Knowledge assessment
   */
  app.get('/:sessionId/manulife-product-knowledge', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      await verifyAndPopulateSession(sessionId, req.user!, app, [
        'messages',
        'persona',
      ]);

      const session = await SalesSession.findById(sessionId)
        .populate('messages')
        .populate('persona');

      if (!session) {
        throw app.httpErrors.notFound('Session not found');
      }

      // Only available for Manulife GoalReady assessment type
      if (session.assessmentType !== 'manulife-goalready') {
        throw app.httpErrors.badRequest(
          'Product knowledge assessment only available for Manulife GoalReady sessions',
        );
      }

      // Check if roleplay is complete
      if (!session.endedAt) {
        throw app.httpErrors.badRequest('Session has not ended yet');
      }

      if (!session.roleplay) {
        throw app.httpErrors.badRequest('Roleplay not started yet');
      }

      // Fetch messages for brief check
      const messages = await Message.find({
        _id: { $in: session.messages },
        content: { $exists: true },
      })
        .sort({ createdAt: 1 })
        .select('role content');

      // Check if roleplay is too brief
      const tooBrief = await checkBriefRoleplay(messages);
      if (tooBrief) {
        return {
          productKnowledge: {},
          tooBrief: true,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // If data exists, return it
      if (session.roleplay?.feedback?.manulifeProductKnowledge) {
        const productKnowledge = parseJsonSafely(
          session.roleplay.feedback.manulifeProductKnowledge,
        );

        return {
          productKnowledge,
          tooBrief: false,
          characterName: session.persona?.name || 'Prospect',
          generating: false,
        };
      }

      // Check if currently generating
      const isGenerating =
        session.roleplay?.feedback?.manulifeProductKnowledgeGenerating || false;

      // Simple retry logic: if not generating and no data, try to generate
      if (!isGenerating) {
        console.log(
          `Triggering Manulife product knowledge generation for session: ${sessionId}`,
        );

        const languageCode = getLanguageHeader(req);
        const agenda = getAgenda();

        // Mark as generating
        await session.updateOne({
          $set: {
            'roleplay.feedback.manulifeProductKnowledgeGenerating': true,
          },
        });

        agenda
          .now(AGENDA_JOB_TYPES.GENERATE_MANULIFE_PRODUCT_KNOWLEDGE, {
            sessionId,
            languageCode,
          })
          .then(() => {
            console.log('Manulife product knowledge job queued');
          })
          .catch((error) => {
            console.error(
              'Error queueing Manulife product knowledge job:',
              error,
            );
            // Reset generating flag on error
            SalesSession.findById(sessionId)
              .then((s) =>
                s?.updateOne({
                  $set: {
                    'roleplay.feedback.manulifeProductKnowledgeGenerating': false,
                  },
                }),
              )
              .catch(console.error);
          });
      }

      return {
        productKnowledge: null,
        tooBrief: false,
        generating: true,
        characterName: session.persona?.name || 'Prospect',
      };
    },
  });

  app.log.info('[sessions/assessment.ts] routes registered');
};

export default router;
