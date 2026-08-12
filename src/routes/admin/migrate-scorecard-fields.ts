import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { ensureAdmin } from '../../utils/adminutil.js';
import { SalesSession } from '../../models/SalesSession.js';
import { Scorecard } from '../../models/Scorecard.js';

/**
 * TEMPORARY MIGRATION ROUTE
 *
 * This route migrates existing SalesSession documents to use new field names:
 * 1. customScorecards → scorecards
 * 2. why → reason (in scorecard criteria)
 * 3. assessmentType: 'custom-scorecard' → 'scorecard'
 *
 * SAFETY FEATURES:
 * - Preview endpoint to see what will change
 * - Dry-run mode to test without making changes
 * - Test on single session first
 * - Keeps old fields until explicitly cleaned up
 * - Detailed logging of all changes
 *
 * DELETE THIS FILE AFTER MIGRATION IS COMPLETE
 */

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  // Admin authentication hook
  app.addHook('preHandler', async (request, reply) => {
    await ensureAdmin(app, request);
  });

  // ==========================================================================
  // GET /admin/migrate-scorecard-fields/preview - Preview migration
  // ==========================================================================
  app.get('/preview', {
    schema: {
      response: {
        200: z.object({
          success: z.boolean(),
          preview: z.object({
            totalSessionsToMigrate: z.number(),
            note: z.string(),
            sampleSessions: z.array(
              z.object({
                id: z.string(),
                assessmentType: z.string(),
                hasCustomScorecardsData: z.boolean(),
                scorecardsCount: z.number(),
              }),
            ),
          }),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        app.log.info('Preview migration request received');

        // Only migrate sessions with 'custom-scorecard' assessmentType
        const sessionsToMigrate = await SalesSession.countDocuments({
          assessmentType: 'custom-scorecard' as any,
        });

        // Sample sessions
        const sampleSessions = await SalesSession.find({
          assessmentType: 'custom-scorecard' as any,
        })
          .limit(5)
          .select('_id assessmentType roleplay.feedback.customScorecards')
          .lean();

        app.log.info({ sessionsToMigrate }, 'Migration preview generated');

        return reply.send({
          success: true,
          preview: {
            totalSessionsToMigrate: sessionsToMigrate,
            note: 'Only sessions with assessmentType="custom-scorecard" will be migrated',
            sampleSessions: sampleSessions.map((s: any) => {
              const customScorecards =
                s.roleplay?.feedback?.customScorecards || [];
              return {
                id: s._id.toString(),
                assessmentType: s.assessmentType,
                hasCustomScorecardsData:
                  Array.isArray(customScorecards) &&
                  customScorecards.length > 0,
                scorecardsCount: Array.isArray(customScorecards)
                  ? customScorecards.length
                  : 0,
              };
            }),
          },
        });
      } catch (error: any) {
        app.log.error(error, 'Preview failed');
        return reply.status(500).send({
          success: false,
          error: 'Preview failed',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // POST /admin/migrate-scorecard-fields/test-one - Test on single session
  // ==========================================================================
  app.post('/test-one', {
    schema: {
      body: z.object({
        sessionId: z.string(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          before: z.any(),
          after: z.any(),
        }),
        404: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { sessionId } = req.body as { sessionId: string };

        app.log.info({ sessionId }, 'Testing migration on single session');

        const session = await SalesSession.findById(sessionId);

        if (!session) {
          return reply.status(404).send({
            success: false,
            error: 'Session not found',
          });
        }

        // Capture before state
        const before = {
          assessmentType: session.assessmentType,
          hasCustomScorecards: !!(session.roleplay?.feedback as any)
            ?.customScorecards,
          customScorecards: (session.roleplay?.feedback as any)
            ?.customScorecards,
        };

        // Perform migration
        const updates: any = {};
        let needsUpdate = false;

        // Note: Using string comparison because 'custom-scorecard' is legacy
        if ((session.assessmentType as string) === 'custom-scorecard') {
          updates.assessmentType = 'scorecard';
          needsUpdate = true;
        }

        const customScorecards = (session.roleplay?.feedback as any)
          ?.customScorecards;

        if (customScorecards) {
          const migratedScorecards = customScorecards.map((scorecard: any) => {
            let migratedSectionType = scorecard.sectionType;

            // Migrate sectionType: product_knowledge → product-knowledge
            if (scorecard.sectionType === 'product_knowledge') {
              migratedSectionType = 'product-knowledge';
            } else if (scorecard.sectionType === 'communication_presence') {
              migratedSectionType = 'communication-presence';
            }

            if (scorecard.criteria && Array.isArray(scorecard.criteria)) {
              const migratedCriteria = scorecard.criteria.map(
                (criterion: any) => {
                  if (criterion.why !== undefined) {
                    const { why, ...rest } = criterion;
                    return {
                      ...rest,
                      reason: why,
                    };
                  }
                  return criterion;
                },
              );

              return {
                ...scorecard,
                sectionType: migratedSectionType,
                criteria: migratedCriteria,
              };
            }

            return {
              ...scorecard,
              sectionType: migratedSectionType,
            };
          });

          updates['roleplay.feedback.scorecards'] = migratedScorecards;
          needsUpdate = true;
        }

        if (needsUpdate) {
          // IMPORTANT: We DON'T unset customScorecards here for safety
          // It will be kept as backup until cleanup step
          await session.updateOne({ $set: updates });
        }

        // Fetch updated session
        const updatedSession = await SalesSession.findById(sessionId);

        const after = {
          assessmentType: updatedSession?.assessmentType,
          hasScorecardsField: !!(updatedSession?.roleplay?.feedback as any)
            ?.scorecards,
          scorecards: (updatedSession?.roleplay?.feedback as any)?.scorecards,
          hasCustomScorecardsBackup: !!(
            updatedSession?.roleplay?.feedback as any
          )?.customScorecards,
        };

        app.log.info({ sessionId, before, after }, 'Test migration completed');

        return reply.send({
          success: true,
          message: 'Test migration completed. Old field kept as backup.',
          before,
          after,
        });
      } catch (error: any) {
        app.log.error(error, 'Test migration failed');
        return reply.status(500).send({
          success: false,
          error: 'Test migration failed',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // POST /admin/migrate-scorecard-fields - Execute migration (SAFE MODE)
  // ==========================================================================
  app.post('/', {
    schema: {
      body: z.object({
        dryRun: z.boolean().optional().default(true),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          dryRun: z.boolean(),
          results: z.object({
            assessmentTypeUpdated: z.number(),
            scorecardsRenamed: z.number(),
            reasonFieldUpdated: z.number(),
            sectionTypeUpdated: z.number(),
            sessionsProcessed: z.number(),
            errors: z.array(z.string()),
            remainingCustomScorecardAssessmentType: z.number(),
          }),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { dryRun } = req.body as { dryRun?: boolean };
        const isDryRun = dryRun !== false; // Default to true for safety

        app.log.info({ dryRun: isDryRun }, 'Migration request received');

        if (isDryRun) {
          app.log.warn('DRY RUN MODE - No changes will be made');
        }

        const results = {
          assessmentTypeUpdated: 0,
          scorecardsRenamed: 0,
          reasonFieldUpdated: 0,
          sectionTypeUpdated: 0,
          sessionsProcessed: 0,
          errors: [] as string[],
        };

        // Find all sessions with 'custom-scorecard' assessmentType
        const sessions = await SalesSession.find({
          assessmentType: 'custom-scorecard' as any,
        });

        app.log.info({ count: sessions.length }, 'Found sessions to migrate');

        for (const session of sessions) {
          try {
            const updates: any = {};
            let needsUpdate = false;

            // 1. Update assessmentType from 'custom-scorecard' to 'scorecard'
            // Note: Using string comparison because 'custom-scorecard' is legacy
            if ((session.assessmentType as string) === 'custom-scorecard') {
              updates.assessmentType = 'scorecard';
              needsUpdate = true;
              results.assessmentTypeUpdated++;
            }

            // 2. Migrate customScorecards → scorecards
            const customScorecards = (session.roleplay?.feedback as any)
              ?.customScorecards;

            if (customScorecards) {
              // Update field name and migrate 'why' to 'reason' in criteria
              // Also migrate sectionType from underscore to hyphen
              const migratedScorecards = customScorecards.map(
                (scorecard: any) => {
                  let migratedSectionType = scorecard.sectionType;

                  // Migrate sectionType: product_knowledge → product-knowledge
                  if (scorecard.sectionType === 'product_knowledge') {
                    migratedSectionType = 'product-knowledge';
                    results.sectionTypeUpdated++;
                  } else if (
                    scorecard.sectionType === 'communication_presence'
                  ) {
                    migratedSectionType = 'communication-presence';
                    results.sectionTypeUpdated++;
                  }

                  if (scorecard.criteria && Array.isArray(scorecard.criteria)) {
                    const migratedCriteria = scorecard.criteria.map(
                      (criterion: any) => {
                        if (criterion.why !== undefined) {
                          results.reasonFieldUpdated++;
                          // Create new object without 'why'
                          const { why, ...rest } = criterion;
                          return {
                            ...rest,
                            reason: why,
                          };
                        }
                        return criterion;
                      },
                    );

                    return {
                      ...scorecard,
                      sectionType: migratedSectionType,
                      criteria: migratedCriteria,
                    };
                  }

                  return {
                    ...scorecard,
                    sectionType: migratedSectionType,
                  };
                },
              );

              updates['roleplay.feedback.scorecards'] = migratedScorecards;
              // DON'T unset old field yet - keep as backup
              needsUpdate = true;
              results.scorecardsRenamed++;
            }

            // Apply updates if needed
            if (needsUpdate) {
              if (!isDryRun) {
                // REAL MODE: Only set new fields, DON'T unset old ones yet
                // Keep old fields as backup for now
                await session.updateOne({ $set: updates });
                results.sessionsProcessed++;
              } else {
                // DRY RUN: Just count what would be updated
                results.sessionsProcessed++;
              }
            }
          } catch (error) {
            const errorMsg = `Error updating session ${session._id}: ${error instanceof Error ? error.message : String(error)}`;
            app.log.error(error, errorMsg);
            results.errors.push(errorMsg);
          }
        }

        // Verify migration - count remaining sessions
        const remainingCustomScorecard = await SalesSession.countDocuments({
          assessmentType: 'custom-scorecard' as any,
        });

        app.log.info(
          {
            ...results,
            remainingCustomScorecard,
          },
          'Migration completed',
        );

        const message = isDryRun
          ? 'DRY RUN completed - no changes made. Set dryRun=false to execute.'
          : 'Migration completed. Old fields kept as backup. Use /cleanup to remove them.';

        return reply.send({
          success: true,
          message,
          dryRun: isDryRun,
          results: {
            ...results,
            remainingCustomScorecardAssessmentType: remainingCustomScorecard,
          },
        });
      } catch (error: any) {
        app.log.error(error, 'Migration failed');
        return reply.status(500).send({
          success: false,
          error: 'Migration failed',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // GET /admin/migrate-scorecard-fields/scorecards/test-query - Test MongoDB array query
  // ==========================================================================
  app.get('/scorecards/test-query', {
    handler: async (req, reply) => {
      try {
        app.log.info('Testing Scorecard query');

        // Test different query approaches
        const test1 = await Scorecard.countDocuments({
          'sections.sectionType': 'product_knowledge',
        });

        const test2 = await Scorecard.countDocuments({
          'sections.sectionType': 'communication_presence',
        });

        const test3 = await Scorecard.countDocuments({
          sections: {
            $elemMatch: { sectionType: 'product_knowledge' },
          },
        });

        const test4 = await Scorecard.countDocuments({
          sections: {
            $elemMatch: { sectionType: 'communication_presence' },
          },
        });

        // Find sample documents
        const samples = await Scorecard.find({
          $or: [
            { 'sections.sectionType': 'product_knowledge' },
            { 'sections.sectionType': 'communication_presence' },
          ],
        })
          .limit(2)
          .select('name sections.sectionType')
          .lean();

        return reply.send({
          success: true,
          queryTests: {
            dotNotation_productKnowledge: test1,
            dotNotation_communicationPresence: test2,
            elemMatch_productKnowledge: test3,
            elemMatch_communicationPresence: test4,
          },
          note: 'Dot notation and $elemMatch should return same results for array queries',
          samples: samples.map((s: any) => ({
            name: s.name,
            sectionTypes: s.sections?.map((sec: any) => sec.sectionType),
          })),
        });
      } catch (error: any) {
        app.log.error(error, 'Query test failed');
        return reply.status(500).send({
          success: false,
          error: error.message,
        });
      }
    },
  });

  // ==========================================================================
  // GET /admin/migrate-scorecard-fields/scorecards/preview - Preview Scorecard migration
  // ==========================================================================
  app.get('/scorecards/preview', {
    schema: {
      response: {
        200: z.object({
          success: z.boolean(),
          preview: z.object({
            scorecardsWithOldSectionTypes: z.number(),
            sampleScorecards: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                hasOldSectionTypes: z.boolean(),
                sectionsCount: z.number(),
              }),
            ),
          }),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        app.log.info('Scorecard migration preview request received');

        const scorecardsCount = await Scorecard.countDocuments({
          $or: [
            { 'sections.sectionType': 'product_knowledge' },
            { 'sections.sectionType': 'communication_presence' },
          ],
        });

        const sampleScorecards = await Scorecard.find({
          $or: [
            { 'sections.sectionType': 'product_knowledge' },
            { 'sections.sectionType': 'communication_presence' },
          ],
        })
          .limit(5)
          .select('_id name sections');

        app.log.info(
          { scorecardsCount },
          'Scorecard migration preview generated',
        );

        return reply.send({
          success: true,
          preview: {
            scorecardsWithOldSectionTypes: scorecardsCount,
            sampleScorecards: sampleScorecards.map((s) => ({
              id: s._id.toString(),
              name: s.name,
              hasOldSectionTypes:
                s.sections?.some(
                  (sec: any) =>
                    sec.sectionType === 'product_knowledge' ||
                    sec.sectionType === 'communication_presence',
                ) || false,
              sectionsCount: s.sections?.length || 0,
            })),
          },
        });
      } catch (error: any) {
        app.log.error(error, 'Scorecard preview failed');
        return reply.status(500).send({
          success: false,
          error: 'Scorecard preview failed',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // POST /admin/migrate-scorecard-fields/scorecards - Migrate Scorecard templates
  // ==========================================================================
  app.post('/scorecards', {
    schema: {
      body: z.object({
        dryRun: z.boolean().optional().default(true),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          dryRun: z.boolean(),
          results: z.object({
            scorecardsProcessed: z.number(),
            sectionTypesUpdated: z.number(),
            localizedSectionTypesUpdated: z.number(),
            errors: z.array(z.string()),
          }),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { dryRun } = req.body as { dryRun?: boolean };
        const isDryRun = dryRun !== false;

        app.log.info(
          { dryRun: isDryRun },
          'Scorecard template migration request received',
        );

        if (isDryRun) {
          app.log.warn('DRY RUN MODE - No changes will be made');
        }

        const results = {
          scorecardsProcessed: 0,
          sectionTypesUpdated: 0,
          localizedSectionTypesUpdated: 0,
          errors: [] as string[],
        };

        // Find all scorecards with old section types
        const scorecards = await Scorecard.find({
          $or: [
            { 'sections.sectionType': 'product_knowledge' },
            { 'sections.sectionType': 'communication_presence' },
            { 'localizations.sections.sectionType': 'product_knowledge' },
            { 'localizations.sections.sectionType': 'communication_presence' },
          ],
        });

        app.log.info(
          { count: scorecards.length },
          'Found scorecards to migrate',
        );

        for (const scorecard of scorecards) {
          try {
            let needsUpdate = false;

            // Migrate main sections
            if (scorecard.sections && scorecard.sections.length > 0) {
              scorecard.sections = scorecard.sections.map((section: any) => {
                if (section.sectionType === 'product_knowledge') {
                  results.sectionTypesUpdated++;
                  needsUpdate = true;
                  return { ...section, sectionType: 'product-knowledge' };
                } else if (section.sectionType === 'communication_presence') {
                  results.sectionTypesUpdated++;
                  needsUpdate = true;
                  return { ...section, sectionType: 'communication-presence' };
                }
                return section;
              });
            }

            // Migrate localized sections
            if (scorecard.localizations) {
              const localizations = scorecard.localizations as any;
              const localizationsObj =
                localizations instanceof Map
                  ? Object.fromEntries(localizations)
                  : localizations;

              const updatedLocalizations: any = {};

              for (const [langCode, localization] of Object.entries(
                localizationsObj,
              )) {
                const loc = localization as any;
                if (loc.sections && Array.isArray(loc.sections)) {
                  updatedLocalizations[langCode] = {
                    ...loc,
                    sections: loc.sections.map((section: any) => {
                      if (section.sectionType === 'product_knowledge') {
                        results.localizedSectionTypesUpdated++;
                        needsUpdate = true;
                        return {
                          ...section,
                          sectionType: 'product-knowledge',
                        };
                      } else if (
                        section.sectionType === 'communication_presence'
                      ) {
                        results.localizedSectionTypesUpdated++;
                        needsUpdate = true;
                        return {
                          ...section,
                          sectionType: 'communication-presence',
                        };
                      }
                      return section;
                    }),
                  };
                } else {
                  updatedLocalizations[langCode] = loc;
                }
              }

              scorecard.localizations = updatedLocalizations;
            }

            if (needsUpdate && !isDryRun) {
              await scorecard.save();
              results.scorecardsProcessed++;
            } else if (needsUpdate && isDryRun) {
              results.scorecardsProcessed++;
            }
          } catch (error) {
            const errorMsg = `Error updating scorecard ${scorecard._id}: ${error instanceof Error ? error.message : String(error)}`;
            app.log.error(error, errorMsg);
            results.errors.push(errorMsg);
          }
        }

        // Verify migration
        const remainingScorecards = await Scorecard.countDocuments({
          $or: [
            { 'sections.sectionType': 'product_knowledge' },
            { 'sections.sectionType': 'communication_presence' },
          ],
        });

        app.log.info(
          {
            ...results,
            remainingScorecards,
          },
          'Scorecard migration completed',
        );

        const message = isDryRun
          ? 'DRY RUN completed - no changes made. Set dryRun=false to execute.'
          : `Migration completed. Updated ${results.scorecardsProcessed} scorecards.`;

        return reply.send({
          success: true,
          message,
          dryRun: isDryRun,
          results,
        });
      } catch (error: any) {
        app.log.error(error, 'Scorecard migration failed');
        return reply.status(500).send({
          success: false,
          error: 'Scorecard migration failed',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });

  // ==========================================================================
  // POST /admin/migrate-scorecard-fields/cleanup - Remove old fields (DANGER)
  // ==========================================================================
  app.post('/cleanup', {
    schema: {
      body: z.object({
        confirm: z.literal('DELETE_OLD_FIELDS'),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          cleaned: z.number(),
        }),
        400: z.object({
          success: z.boolean(),
          error: z.string(),
        }),
        500: z.object({
          success: z.boolean(),
          error: z.string(),
          details: z.string().optional(),
        }),
      },
    },
    handler: async (req, reply) => {
      try {
        const { confirm } = req.body as { confirm: string };

        if (confirm !== 'DELETE_OLD_FIELDS') {
          return reply.status(400).send({
            success: false,
            error: 'Must send confirm: "DELETE_OLD_FIELDS" to proceed',
          });
        }

        app.log.warn('CLEANUP: Removing old customScorecards fields');

        // Only remove customScorecards if scorecards exists
        const result = await SalesSession.updateMany(
          {
            'roleplay.feedback.customScorecards': { $exists: true },
            'roleplay.feedback.scorecards': { $exists: true },
          },
          {
            $unset: {
              'roleplay.feedback.customScorecards': 1,
            },
          },
        );

        app.log.info({ cleaned: result.modifiedCount }, 'Cleanup completed');

        return reply.send({
          success: true,
          message: 'Old fields removed',
          cleaned: result.modifiedCount,
        });
      } catch (error: any) {
        app.log.error(error, 'Cleanup failed');
        return reply.status(500).send({
          success: false,
          error: 'Cleanup failed',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  });
};

export default router;
