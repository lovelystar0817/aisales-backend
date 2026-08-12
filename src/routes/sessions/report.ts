import { randomUUID } from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import puppeteer from 'puppeteer';
import { z } from 'zod';
import { ALL_SALES_MODULES } from '../../constants/modules.js';
import { isProdOrStaging } from '../../env.js';
import {
  DEFAULT_FRAMEWORK,
  getTranslatedFramework,
} from '../../frameworks/common.js';
import { getLanguageHeader } from '../../locale/request.js';
import { setupUniversalAuthWithManage } from '../../middleware/conditionalAuth.js';
import { User } from '../../models/User.js';
import { getCJKFontCss } from '../../pdf/css/generatePDFCSS.js';
import { generateHeaderHtml } from '../../pdf/html/header.js';
import generateMainHtml from '../../pdf/html/main.js';
import { getPDFTranslations } from '../../pdf/services/translation.js';
import {
  calculateManulifeOverallScore,
  getManulifeTierLevel,
  getManulifeTierName,
  calculateGoalReadyOverallScore,
  getGoalReadyTierName,
  getGoalReadyTierLevel,
} from '../../utils/assessment/manulife.js';
import {
  calculateMSIGOverallScore,
  getMSIGTierName,
  hasFailedMandatory,
} from '../../utils/assessment/msig.js';
import { generateRoleplayOverview } from '../../utils/assessment/regular.js';
import { parseJsonSafely } from '../../utils/json.js';
import { getModuleByFriendlyId } from '../../utils/module.js';
import { Message } from '../../models/Message.js';
import { enrichSessionStanding } from '../../utils/prudential-standing.js';
import { isSessionTooBrief } from '../../utils/session.js';
import { verifyAndPopulateSession } from '../../utils/session-auth.js';

const router: FastifyPluginAsyncZod = async (app) => {
  /**
   * Set up authentication for Auth0, guest tokens, and manage auth
   * This allows the report to be accessed by:
   * 1. Regular users viewing their own session reports (via Auth0)
   * 2. Guest users viewing their session reports (via guest tokens)
   * 3. Managers viewing any user's session reports (via manage auth)
   * Set up authentication for Auth0, guest tokens, and manage auth
   * This allows the report to be accessed by:
   * 1. Regular users viewing their own session reports (via Auth0)
   * 2. Guest users viewing their session reports (via guest tokens)
   * 3. Managers viewing any user's session reports (via manage auth)
   */
  setupUniversalAuthWithManage(app);

  app.route({
    url: '/report',
    method: 'GET',
    schema: {
      querystring: z.object({
        sessionId: z.string(),
      }),
    },
    handler: async (request, reply) => {
      const { sessionId } = request.query;
      // Declare temp directory path outside try block so it can be cleaned up in catch
      let tempUserDataDir: string | undefined;
      try {
        // Get user's language from request headers
        const languageCode = getLanguageHeader(request);

        // Fetch and verify session
        const session = await verifyAndPopulateSession(
          sessionId,
          request.user!,
          app,
          [
            'standing',
            {
              path: 'scenario',
              populate: [{ path: 'module' }, { path: 'product' }],
            },
          ],
        );

        console.log('Generating report for session:', session.assessmentType);

        // Fetch user and company info
        const user = await User.findById(session?.user).populate('company');
        const completedAt = session?.endedAt
          ? new Date(session.endedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '';

        // Get localized module name
        const localizedModule = getModuleByFriendlyId(
          session?.callType || '',
          languageCode,
        );
        const localizedModuleName =
          (session?.scenario as any)?.module?.title ||
          localizedModule?.title ||
          session?.callType ||
          '';

        // Get all translations
        const translations = getPDFTranslations(languageCode);

        // Calculate and enrich framework (same as roleplay.ts does)
        const module = ALL_SALES_MODULES.find(
          (m) => m.friendlyId === session?.callType,
        );
        const framework = module?.framework ?? DEFAULT_FRAMEWORK;
        const translatedFramework = getTranslatedFramework(
          framework,
          languageCode,
          session.persona?.name,
        );

        // Enrich standing with tierName and assessment details (same as basic.ts /past endpoint)
        let enrichedStanding: any = null;
        if (session.assessmentType === 'prudential') {
          if (session.standing && session.roleplay?.feedback) {
            enrichedStanding = enrichSessionStanding(
              session.standing,
              session,
              languageCode,
            );
          } else if (session.standing) {
            enrichedStanding = session.standing;
          }
        } else if (session.assessmentType === 'msig') {
          const salesTechniques = parseJsonSafely(
            session.roleplay?.feedback?.salesTechniques,
          );
          const overallScore = calculateMSIGOverallScore(
            salesTechniques?.sections,
          );
          const tierName = getMSIGTierName(salesTechniques?.sections);
          const hasMandatoryFailures = hasFailedMandatory(
            salesTechniques?.sections,
          );

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

          enrichedStanding = {
            tierLevel,
            tierName,
            overallScore,
          };
        } else if (session.assessmentType === 'msig-3f') {
          const salesTechniques = parseJsonSafely(
            session.roleplay?.feedback?.salesTechniques,
          );
          const productKnowledge = parseJsonSafely(
            session.roleplay?.feedback?.productKnowledge,
          );

          // For MSIG Product Positioning, combine both scores with equal weight
          const salesTechScore = salesTechniques?.overallScore || 0;
          const productKnowledgeScore = productKnowledge?.overallScore || 0;

          // Check if data is incomplete
          const isDataIncomplete =
            !salesTechniques?.overallScore || !productKnowledge?.overallScore;

          if (isDataIncomplete) {
            enrichedStanding = null;
          } else {
            let overallScore = 0;
            if (salesTechScore > 0 && productKnowledgeScore > 0) {
              overallScore = Math.round(
                (salesTechScore + productKnowledgeScore) / 2,
              );
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

            enrichedStanding = {
              tierLevel,
              tierName,
              overallScore,
            };
          }
        } else if (session.assessmentType === 'manulife') {
          const salesTechniques = parseJsonSafely(
            session.roleplay?.feedback?.salesTechniques,
          );
          const overallScore = calculateManulifeOverallScore(
            salesTechniques?.sections,
          );
          const tierName = getManulifeTierName(salesTechniques?.sections);
          const tierLevel = getManulifeTierLevel(tierName);

          enrichedStanding = {
            tierLevel,
            tierName,
            overallScore,
          };
        } else if (session.assessmentType === 'manulife-goalready') {
          const overallScore = calculateGoalReadyOverallScore(session);
          const tierName = getGoalReadyTierName(overallScore);
          const tierLevel = getGoalReadyTierLevel(tierName);

          enrichedStanding = {
            tierLevel,
            tierName,
            overallScore,
          };
        } else if (session.assessmentType === 'axa-ph-recruitment') {
          // AXA PH doesn't use tier-based standings, just scores
          const softSkills = parseJsonSafely(
            session.roleplay?.feedback?.axaPhSoftSkills,
          );
          const knowledgeSkills = parseJsonSafely(
            session.roleplay?.feedback?.axaPhKnowledgeSkills,
          );

          const softSkillsScore = softSkills?.overallScore || 0;
          const knowledgeSkillsScore = knowledgeSkills?.overallScore || 0;
          const validScores = [softSkillsScore, knowledgeSkillsScore].filter(
            (s) => s > 0,
          );
          const overallScore =
            validScores.length > 0
              ? Math.round(
                  validScores.reduce((sum, s) => sum + s, 0) /
                    validScores.length,
                )
              : 0;

          enrichedStanding = {
            overallScore,
            softSkillsScore,
            knowledgeSkillsScore,
          };
        } else if (session.assessmentType === 'axa-ph-objection-handling') {
          // AXA PH Objection Handling uses soft skills and knowledge skills (same pattern as recruitment)
          const softSkills = parseJsonSafely(
            session.roleplay?.feedback?.axaPhSoftSkills,
          );
          const knowledgeSkills = parseJsonSafely(
            session.roleplay?.feedback?.axaPhKnowledgeSkills,
          );

          const softSkillsScore = softSkills?.overallScore || 0;
          const knowledgeSkillsScore = knowledgeSkills?.overallScore || 0;
          const validScores = [softSkillsScore, knowledgeSkillsScore].filter(
            (s) => s > 0,
          );
          const overallScore =
            validScores.length > 0
              ? Math.round(
                  validScores.reduce((sum, s) => sum + s, 0) /
                    validScores.length,
                )
              : 0;

          enrichedStanding = {
            overallScore,
            softSkillsScore,
            knowledgeSkillsScore,
          };
        } else if (session.assessmentType === 'prudential-objection-handling') {
          // Prudential Objection Handling uses 3F Sales Technique and LAPR Objection Handling
          const prudentialOHSalesTechnique = parseJsonSafely(
            session.roleplay?.feedback?.prudentialOHSalesTechnique,
          );
          const prudentialOHObjectionHandling = parseJsonSafely(
            session.roleplay?.feedback?.prudentialOHObjectionHandling,
          );

          const ohSalesTechScore =
            prudentialOHSalesTechnique?.overallScore || 0;
          const ohObjectionScore =
            prudentialOHObjectionHandling?.overallScore || 0;

          // Check if data is incomplete
          const isDataIncomplete =
            !prudentialOHSalesTechnique?.overallScore ||
            !prudentialOHObjectionHandling?.overallScore;

          if (isDataIncomplete) {
            enrichedStanding = null;
          } else {
            // Calculate overall score as average of both assessments
            const overallScore = Math.round(
              (ohSalesTechScore + ohObjectionScore) / 2,
            );

            // Map score to tier based on prudential-objection-handling standing configuration
            // Level 1: Sales Novice (default)
            // Level 2: Skilled Advisor (both scores >= 50)
            // Level 3: Strategic Consultant (both scores >= 75)
            let tierName = 'Sales Novice';
            let tierLevel = 1;

            if (ohSalesTechScore >= 75 && ohObjectionScore >= 75) {
              tierName = 'Strategic Consultant';
              tierLevel = 3;
            } else if (ohSalesTechScore >= 50 && ohObjectionScore >= 50) {
              tierName = 'Skilled Advisor';
              tierLevel = 2;
            }

            enrichedStanding = {
              tierLevel,
              tierName,
              overallScore,
            };
          }
        } else if (session.assessmentType === 'msig-travel-easy') {
          // MSIG Travel Easy uses Soft Skills (30) + Knowledge Skills (30) + Product Knowledge (40) = 100
          const softSkills = parseJsonSafely(
            session.roleplay?.feedback?.msigTravelEasySoftSkills,
          );
          const knowledgeSkills = parseJsonSafely(
            session.roleplay?.feedback?.msigTravelEasyKnowledgeSkills,
          );
          const productKnowledge = parseJsonSafely(
            session.roleplay?.feedback?.msigTravelEasyProductKnowledge,
          );

          const softSkillsScore = softSkills?.overallScore || 0;
          const knowledgeSkillsScore = knowledgeSkills?.overallScore || 0;
          const productKnowledgeScore = productKnowledge?.overallScore || 0;

          // Check if data is incomplete
          const isDataIncomplete =
            !softSkills?.overallScore ||
            !knowledgeSkills?.overallScore ||
            !productKnowledge?.overallScore;

          if (isDataIncomplete) {
            enrichedStanding = null;
          } else {
            // Calculate overall score (sum of all three scores out of 100)
            const overallScore =
              softSkillsScore + knowledgeSkillsScore + productKnowledgeScore;

            // Map score to tier
            let tierName = 'Sales Novice';
            let tierLevel = 1;

            if (overallScore >= 95) {
              tierName = 'Strategic Consultant';
              tierLevel = 4;
            } else if (overallScore >= 90) {
              tierName = 'Skilled Advisor';
              tierLevel = 3;
            } else if (overallScore >= 85) {
              tierName = 'Emerging Seller';
              tierLevel = 2;
            }

            enrichedStanding = {
              tierLevel,
              tierName,
              overallScore,
            };
          }
        } else if (session.assessmentType === 'prudential-ph-fact-finding') {
          const factFindingTechnique = parseJsonSafely(
            session.roleplay?.feedback?.prudentialPHFactFindingTechnique,
          );
          const productKnowledge = parseJsonSafely(
            session.roleplay?.feedback?.prudentialPHProductKnowledge,
          );

          const factFindingScore = factFindingTechnique?.overallScore || 0;
          const productKnowledgeScore = productKnowledge?.overallScore || 0;
          const factFindingMax = factFindingTechnique?.maxScore || 100;
          const productKnowledgeMax = productKnowledge?.maxScore || 100;

          const isDataIncomplete =
            !factFindingTechnique?.overallScore ||
            !productKnowledge?.overallScore;

          if (isDataIncomplete) {
            enrichedStanding = null;
          } else {
            const factFindingPct = Math.round(
              (factFindingScore / factFindingMax) * 100,
            );
            const productKnowledgePct = Math.round(
              (productKnowledgeScore / productKnowledgeMax) * 100,
            );
            const overallScore = Math.round(
              (factFindingPct + productKnowledgePct) / 2,
            );

            enrichedStanding = {
              overallScore,
              factFindingTechniqueScore: factFindingPct,
              productKnowledgeScore: productKnowledgePct,
            };
          }
        } else if (session.assessmentType === 'prudential-ph-closing-call') {
          const closingCallTechnique = parseJsonSafely(
            session.roleplay?.feedback?.prudentialPHClosingCallTechnique,
          );

          const closingCallScore = closingCallTechnique?.overallScore || 0;
          const closingCallMax = closingCallTechnique?.maxScore || 100;

          const isDataIncomplete = !closingCallTechnique?.overallScore;

          if (isDataIncomplete) {
            enrichedStanding = null;
          } else {
            const closingCallPct = Math.round(
              (closingCallScore / closingCallMax) * 100,
            );

            enrichedStanding = {
              overallScore: closingCallPct,
              closingCallTechniqueScore: closingCallPct,
            };
          }
        }

        // Generate overview if missing (it's lazily generated when the frontend polls,
        // but the PDF path needs it upfront)
        if (!session.roleplay?.feedback?.overview) {
          try {
            const messages = await Message.find({
              _id: { $in: session.messages },
              content: { $exists: true },
            })
              .sort({ createdAt: 1 })
              .select('role content');

            if (!isSessionTooBrief(messages)) {
              const salesOverview = await generateRoleplayOverview({
                callType: session.callType,
                scenario: session.roleplay?.title || '',
                objectives: session.roleplay?.objectives || [],
                messages,
                framework: session.roleplay?.framework ?? DEFAULT_FRAMEWORK,
                characterName: session.persona?.name || 'Prospect',
                sessionId: session._id.toString(),
                languageCode,
                productInfo: '',
                assessmentType: session.assessmentType,
              });

              if (salesOverview) {
                await session.updateOne({
                  $set: {
                    'roleplay.feedback.overview':
                      JSON.stringify(salesOverview),
                  },
                });
                // Update the in-memory session object for the PDF
                if (session.roleplay?.feedback) {
                  (session.roleplay.feedback as any).overview =
                    JSON.stringify(salesOverview);
                }
              }
            }
          } catch (overviewError) {
            console.error(
              'Failed to generate overview for PDF, continuing without it:',
              overviewError,
            );
          }
        }

        // Enrich session with translated framework and enriched standing
        const enrichedSession = {
          ...session.toObject(),
          framework: translatedFramework,
          standing: enrichedStanding,
        };

        // Generate HTML (components handle their own transformation)
        const html = generateMainHtml(request.headers.host, {
          session: enrichedSession,
          translations,
          localizedModuleName,
          host: request.headers.host,
        });

        // Create company logo config from DB
        const company = (user?.company as any) || {};
        const companyLogoConfig = {
          imageUrl: company.logoUrl || '',
          height: company.logoHeight || '30px',
        };

        const headerTemplate = await generateHeaderHtml(
          user?.email || '',
          completedAt,
          companyLogoConfig,
          {
            title: translations.title,
            completedOn: translations.completedOn,
            hupoLogoAlt: translations.hupoLogoAlt,
            companyLogoAlt: translations.companyLogoAlt,
          },
        );

        // Set environment variables to disable crashpad
        if (isProdOrStaging) {
          process.env.CHROME_DEVEL_SANDBOX = '';
          process.env.CHROME_CRASHPAD_PIPE_NAME = '';
          process.env.BREAKPAD_DUMP_LOCATION = '/tmp';
        }

        // Create unique temporary directory for this PDF generation
        // This prevents conflicts when multiple instances (prod/staging) run on same machine
        tempUserDataDir = path.join(os.tmpdir(), `chrome-pdf-${randomUUID()}`);

        // Try multiple Chrome executables
        const chromeExecutables = isProdOrStaging
          ? [
              '/usr/bin/google-chrome-stable',
              '/usr/bin/google-chrome',
              '/usr/bin/chromium-browser',
              '/usr/bin/chromium',
            ]
          : [undefined];

        let browser: puppeteer.Browser | null = null;
        let lastError: Error | null = null;

        for (const executablePath of chromeExecutables) {
          try {
            browser = await puppeteer.launch({
              headless: true,
              args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-crash-reporter',
                '--disable-extensions',
                `--user-data-dir=${tempUserDataDir}`,
              ],
              executablePath,
              timeout: 30000,
            });
            console.log(
              `Successfully launched browser with: ${executablePath || 'bundled chromium'}`,
            );
            break;
          } catch (error) {
            console.warn(
              `Failed to launch with ${executablePath || 'bundled chromium'}:`,
              error instanceof Error ? error.message : error,
            );
            lastError =
              error instanceof Error ? error : new Error(String(error));
            if (browser) {
              try {
                await browser.close();
              } catch {}
              browser = null;
            }
          }
        }

        if (!browser) {
          throw new Error(
            `Failed to launch any browser executable. Last error: ${lastError?.message}`,
          );
        }

        const page = await browser.newPage();

        // Set viewport for consistent rendering
        await page.setViewport({
          width: 794,
          height: 1123,
          deviceScaleFactor: 2,
        });

        await page.setContent(html, {
          waitUntil: ['load', 'networkidle0', 'domcontentloaded'],
          timeout: 30000,
        });

        // Inject CJK fonts separately via addStyleTag to avoid HTML parsing bottleneck
        // The large base64 font (~7MB) is injected after setContent() completes
        const cjkFontCss = getCJKFontCss();
        if (cjkFontCss) {
          await page.addStyleTag({ content: cjkFontCss });
        }

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: true,
          headerTemplate: headerTemplate,
          margin: {
            top: '0px',
            right: '0px',
            bottom: '10px',
            left: '0px',
          },
        });

        if (browser) {
          await browser.close();
        }

        // Clean up temporary user data directory
        try {
          fs.rmSync(tempUserDataDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp directory:', cleanupError);
        }

        return reply
          .header('Content-Type', 'application/pdf')
          .header('Content-Disposition', 'attachment; filename=report.pdf')
          .send(pdfBuffer);
      } catch (error: unknown) {
        console.error('PDF generation error:', error);

        // Try to clean up temp directory even on error
        try {
          if (tempUserDataDir) {
            fs.rmSync(tempUserDataDir, { recursive: true, force: true });
          }
        } catch {
          // Ignore cleanup errors
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return reply.status(500).send({
          ok: false,
          message: 'Failed to generate PDF',
          error: errorMessage,
        });
      }
    },
  });
};

export default router;
