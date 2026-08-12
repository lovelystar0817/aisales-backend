import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import { z } from 'zod';
import { ALL_SALES_MODULES } from '../../constants/modules.js';
import { getModuleDisclaimer } from '../../data/disclaimers/prudential.js';
import { getPersonaSpecificDifficulty } from '../../data/personas/difficulty-specific.js';
import { selectRandomBBLObjections } from '../../data/bbl-objections.js';
import { selectRandomMSIGObjections } from '../../data/msig-objections.js';
import {
  DEFAULT_FRAMEWORK,
  getTranslatedFramework,
} from '../../frameworks/common.js';
import { getLanguageHeader } from '../../locale/request.js';
import { setupUniversalAuthWithManage } from '../../middleware/conditionalAuth.js';
import { Company } from '../../models/Company.js';
import { CallType, SalesSession } from '../../models/SalesSession.js';
import { Scenario } from '../../models/Scenario.js';
import { UserModuleAccess } from '../../models/UserModuleAccess.js';
import {
  BBL_COMPANY_ID,
  HSBC_COMPANY_ID,
  HSBC_YUE_COMPANY_ID,
  GRAB_COMPANY_ID,
  MANULIFE_COMPANY_ID,
  MSIG_COMPANY_ID,
  MTL_COMPANY_ID,
  AXA_PH_COMPANY_ID,
  KT_AXA_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
  PRUDENTIAL_PH_COMPANY_ID,
  AIA_KO_COMPANY_ID,
  GREAT_EASTERN_COMPANY_ID,
} from '../../utils/constants.js';
import { parseJsonSafely } from '../../utils/json.js';
import {
  calculateManulifeOverallScore,
  getManulifeTierLevel,
  getManulifeTierName,
} from '../../utils/assessment/manulife.js';
import {
  getLocalizedModuleFromScenario,
  getModuleByFriendlyId,
  getModuleById,
  getModules,
  getModulesV2,
} from '../../utils/module.js';
import {
  calculateMSIGOverallScore,
  getMSIGTierName,
  hasFailedMandatory,
  isMsigDataIncomplete,
} from '../../utils/assessment/msig.js';
import { parseAiaKoFeedbackScores } from '../../utils/manage/aia-ko.js';
import { getPersonaById, getPersonas } from '../../utils/persona.js';
import { getProductByFriendlyId, getProductById } from '../../utils/product.js';
import {
  analyzeStandingProgression,
  enrichSessionStanding,
  findStandingConfigurationForSession,
  shouldUsePrudentialData,
} from '../../utils/prudential-standing.js';
import { verifyAndPopulateSession } from '../../utils/session-auth.js';
import { IPersona, PersonaDocument } from '../../models/Persona.js';
import { ScorecardDocument, ScorecardSection } from '../../models/Scorecard.js';
import { Voice, VoiceDocument } from '../../models/Voice.js';
import { ModuleDocument } from '../../models/Module.js';
import { SalesProductDocument } from '../../models/SalesProduct.js';
import type { CallCriteria } from '../../models/SalesProduct.js';

/**
 * Call criteria for Great Eastern modules (from scenario evaluation frameworks).
 * Used to show the agent what they will be evaluated on.
 */
function getGreatEasternCallCriteria(
  moduleFriendlyId: string,
  languageCode: string,
): CallCriteria | null {
  const en = (): CallCriteria | null => {
    if (moduleFriendlyId === 'great-eastern-fact-find') {
      return {
        title: 'Great Eastern Fact Finding – Evaluation Criteria',
        description:
          'You will be evaluated on three areas (equal weight). Aim to meet all criteria for the best standing.',
        criteria: [
          'Soft skills (33%): Communication Skills (clear delivery, respectful communication); Relationship Building (rapport, patience); Adaptability (flexibility to customer concerns); Customer Orientation (focus on satisfaction and service).',
          'Knowledge skills (33%): Verification (identify yourself and Great Eastern; Permission Check; gain prospect permission); Fact Finding (life stage, cash flow & net worth, existing coverage, risk profile, CKA if recommending ILPs); Problem-Solving (identify issues and find solutions).',
          'Financial Planning (33%): Cover client needs – Emergency fund (3–6 months); Death/TPD (9× income); Critical illness (4×); Hospitalisation; Retirement; Education; Mortgage; Legacy. Ensure client-centric approach, no material omissions, reference national schemes (MediShield Life, CareShield Life, DPS, CPF LIFE), and transparency.',
        ],
      };
    }
    if (moduleFriendlyId === 'great-eastern-product-pitch') {
      return {
        title: 'Great Eastern Product Pitch – Evaluation Criteria',
        description:
          'You will be evaluated on soft skills, knowledge skills, and product pitch. Aim to meet all criteria for the best standing.',
        criteria: [
          'Soft skills: Communication Skills, Relationship Building, Adaptability, Customer Orientation.',
          'Knowledge skills: Fact Finding (life stage, cash flow, existing coverage, risk profile, CKA); Problem-Solving; Sales & Negotiation (close deals, listen to objections, probe motivations, resolve while maintaining rapport); Compliance (present as insurance not savings/FD; guaranteed vs non-guaranteed; no min/max on illustrated returns; no past performance guarantee; no bank comparison; explicit fees and clauses).',
          'Product pitch (100%): Understanding of Great Wealth Advantage 4, features and benefits; product solution aligned to the customer profile.',
        ],
      };
    }
    if (moduleFriendlyId === 'great-eastern-post-sales') {
      return {
        title: 'Great Eastern Post Sale Service – Evaluation Criteria',
        description:
          'You will be evaluated on soft skills, knowledge skills, and product review. Aim to meet all criteria for the best standing.',
        criteria: [
          'Soft skills: Communication Skills, Relationship Building, Adaptability, Customer Orientation.',
          'Knowledge skills: Problem-Solving; Sales & Negotiation (listen to objections, probe motivations, resolve while maintaining rapport); Compliance (present as insurance not savings/FD; guaranteed vs non-guaranteed; no min/max on illustrated returns; no past performance guarantee; no bank comparison).',
          'Product review: Clear understanding of product features, benefits, and value proposition; how features solve customer problems; accurate product information; tailor to customer needs and objections. Focus on technical details of the product purchased, not pitching the product.',
        ],
      };
    }
    return null;
  };
  return en();
}

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  /**
   * Set up universal authentication for both Auth0 and guest tokens
   */
  setupUniversalAuthWithManage(app);

  /**
   * @method POST /sessions/
   * @description Create a new sales session
   */
  app.post('/', {
    schema: {
      body: z.object({
        // old compatibility body
        callType: z.string().optional(),
        // new schema, for normal creation
        personaId: z.string(),
        moduleId: z.string().optional(),
        productId: z.string(),
        scenarioId: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const companyId = req.user?.company.toString();
        let { personaId, moduleId, productId, scenarioId } = req.body;
        const languageCode = getLanguageHeader(req);

        if (req.body.callType) {
          const foundModule = getModuleByFriendlyId(req.body.callType);
          if (!foundModule) {
            return reply.status(404).send({ error: 'Module not found' });
          }

          const foundProduct = getProductByFriendlyId(
            companyId,
            req.body.productId,
          );
          if (!foundProduct) {
            return reply.status(404).send({ error: 'Product not found' });
          }

          moduleId = foundModule._id.toString();
          productId = foundProduct._id.toString();
        }

        const company = await Company.findById(companyId);

        // Try to find a matching scenario in the database using _id values
        let matchingScenario = null;
        if (companyId && company?.selfServiceEnabled) {
          try {
            if (scenarioId)
              matchingScenario = await Scenario.findById(scenarioId)
                .populate<{ module: ModuleDocument }>('module')
                .populate<{ persona: PersonaDocument }>({
                  path: 'persona',
                  populate: { path: 'voice' },
                })
                .populate<{ product: SalesProductDocument }>('product')
                .populate<{ scorecard: ScorecardDocument }>('scorecard');

            // Try company-specific scenarios
            if (!matchingScenario) {
              matchingScenario = await Scenario.findOne({
                company: new Types.ObjectId(companyId),
                module: new Types.ObjectId(moduleId),
                persona: new Types.ObjectId(personaId),
                product: new Types.ObjectId(productId),
              })
                .populate<{ module: ModuleDocument }>('module')
                .populate<{ persona: PersonaDocument }>({
                  path: 'persona',
                  populate: { path: 'voice' },
                })
                .populate<{ product: SalesProductDocument }>('product')
                .populate<{ scorecard: ScorecardDocument }>('scorecard');
            }

            // If no company-specific scenario found, try default scenarios
            if (!matchingScenario) {
              matchingScenario = await Scenario.findOne({
                company: { $exists: false },
                module: new Types.ObjectId(moduleId),
                persona: new Types.ObjectId(personaId),
                product: new Types.ObjectId(productId),
              })
                .populate<{ module: ModuleDocument }>('module')
                .populate<{ persona: PersonaDocument }>({
                  path: 'persona',
                  populate: { path: 'voice' },
                })
                .populate<{ product: SalesProductDocument }>('product')
                .populate<{ scorecard: ScorecardDocument }>('scorecard');
            }
          } catch (error) {
            console.warn('Error finding matching scenario:', error);
          }
        }

        // Populate localization voices - convert to plain object to iterate language keys
        const personaLocalizations: Record<string, any> | null =
          matchingScenario?.persona?.localizations
            ? JSON.parse(JSON.stringify(matchingScenario.persona.localizations))
            : null;
        let localizationVoiceMap: Map<string, VoiceDocument> | null = null;
        if (personaLocalizations) {
          const voiceIds: string[] = [];
          for (const [, loc] of Object.entries(personaLocalizations)) {
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
          }
        }

        // Get friendlyId values to bridge to static data
        let callType: string;
        let personaFriendlyId: string;
        let productFriendlyId: string;

        let localizedPersona: Omit<IPersona, 'localizations'> | null = null;
        if (matchingScenario) {
          callType = matchingScenario.module.friendlyId;
          personaFriendlyId = matchingScenario.persona.friendlyId;
          productFriendlyId = matchingScenario.product.friendlyId;

          const localized = personaLocalizations?.[languageCode];
          let localizedVoice: VoiceDocument | undefined;

          if (localized?.voice) {
            if (
              typeof localized.voice === 'object' &&
              'providerId' in localized.voice
            ) {
              localizedVoice = localized.voice as VoiceDocument;
            } else if (localizationVoiceMap) {
              localizedVoice = localizationVoiceMap.get(
                String(localized.voice),
              );
            }
          }

          // Fallback to getLocalizedContent (handles 'en' default)
          const localizedContent =
            matchingScenario.persona.getLocalizedContent(languageCode);
          if (!localizedVoice && localizedContent?.voice) {
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

          const mainVoice = matchingScenario.persona.voice as
            | VoiceDocument
            | undefined;
          const voiceId =
            localizedVoice?.providerId ||
            mainVoice?.providerId ||
            matchingScenario.persona.voiceId;

          localizedPersona = {
            ...matchingScenario.persona.toObject(),
            ...localizedContent,
            voiceId,
            ...(localizedVoice ? { voice: localizedVoice } : {}),
          };
        } else {
          // For non-self-service companies: use static data lookup by ObjectId
          try {
            let foundProduct = getProductById(
              companyId,
              productId,
              languageCode,
            );
            if (!foundProduct) {
              foundProduct = getProductByFriendlyId(
                companyId,
                productId,
                languageCode,
              );
            }
            let foundModule = getModuleById(moduleId!);
            if (!foundModule) {
              foundModule = getModuleByFriendlyId(moduleId!);
            }
            const moduleFriendlyId = foundModule?.friendlyId;

            const foundPersona = getPersonaById(
              personaId,
              languageCode,
              moduleFriendlyId,
            );
            if (!foundModule || !foundPersona || !foundProduct) {
              return reply
                .status(404)
                .send({ error: 'Module, persona, or product not found' });
            }

            callType = moduleFriendlyId!;
            personaFriendlyId = foundPersona.friendlyId;
            productFriendlyId = foundProduct.friendlyId;
            localizedPersona = getPersonaById(personaId, languageCode);
          } catch (error) {
            console.error('Error fetching entities:', error);
            return reply
              .status(500)
              .send({ error: 'Failed to fetch entities' });
          }
        }

        // Get localized persona content from static data using friendlyId
        if (!localizedPersona) {
          return reply.status(404).send({ error: 'Persona not found' });
        }

        // Apply Prudential-specific enhancements (same as in /personas endpoint)
        if (
          shouldUsePrudentialData(companyId) ||
          companyId === MSIG_COMPANY_ID ||
          companyId === BBL_COMPANY_ID ||
          companyId === HSBC_COMPANY_ID ||
          companyId === HSBC_YUE_COMPANY_ID ||
          companyId === MTL_COMPANY_ID ||
          companyId === AXA_PH_COMPANY_ID ||
          companyId === AIA_KO_COMPANY_ID
        ) {
          try {
            const difficultyInfo = getPersonaSpecificDifficulty(
              localizedPersona.friendlyId,
              callType,
              productFriendlyId,
            );

            if (difficultyInfo) {
              const selectedLanguage =
                languageCode as keyof typeof difficultyInfo.uiDescription;
              const uiDescription =
                difficultyInfo.uiDescription[selectedLanguage];

              const mainObjection = difficultyInfo.mainObjection
                ? difficultyInfo.mainObjection[selectedLanguage]
                : undefined;

              // Enhance persona details with difficulty-specific information
              localizedPersona.details = {
                ...localizedPersona.details,
                difficultyLevel: difficultyInfo.level,
                salesDescription:
                  uiDescription || localizedPersona.details.salesDescription,
                mainObjection:
                  mainObjection || localizedPersona.details.mainObjection,
                salesGoal: '',
              };

              const tempMetaObj: Record<string, any> = {};
              if (difficultyInfo.bblContext?.portfolioReviewTrigger) {
                let prtLanguage = ['en', 'th'].includes(selectedLanguage)
                  ? (selectedLanguage as 'en' | 'th')
                  : 'en';

                tempMetaObj.bblPortfolioReviewTrigger =
                  difficultyInfo.bblContext.portfolioReviewTrigger[prtLanguage];
              }

              if (difficultyInfo.bblContext?.currentPortfolio) {
                tempMetaObj.bblCurrentPortfolio =
                  difficultyInfo.bblContext.currentPortfolio;
              }

              if (difficultyInfo.bblContext?.adjustedPortfolios) {
                tempMetaObj.bblAdjustedPortfolios =
                  difficultyInfo.bblContext.adjustedPortfolios;
              }

              // For portfolio review, randomly decide if client wants topup or not
              const TOPUP_WILLINGNESS_PROBABILITY = 0.5;
              if (productFriendlyId === 'bbl-portfolio-review') {
                tempMetaObj.bblRebalanceWithTopup =
                  Math.random() < TOPUP_WILLINGNESS_PROBABILITY;
              }

              if (Object.keys(tempMetaObj).length > 0) {
                localizedPersona.meta = { ...tempMetaObj };
              }

              // For BBL sessions, randomly select objections based on scenario type
              // Array format: index 0 = primary objection, indices 1+ = mini objections
              if (companyId === BBL_COMPANY_ID) {
                const prtLanguage = ['en', 'th'].includes(selectedLanguage)
                  ? (selectedLanguage as 'en' | 'th')
                  : 'en';

                const objections = selectRandomBBLObjections(
                  productFriendlyId,
                  prtLanguage,
                  {
                    excludeTopupObjection:
                      tempMetaObj.bblRebalanceWithTopup === true,
                  },
                );

                if (objections && objections.length > 0) {
                  if (!localizedPersona.meta) {
                    localizedPersona.meta = {};
                  }
                  localizedPersona.meta.selectedObjections = objections;
                  // Set primary objection (index 0) as mainObjection for frontend display
                  if (!localizedPersona.details) {
                    localizedPersona.details = {} as any;
                  }
                  localizedPersona.details.mainObjection = objections[0];
                }
              }
            }
          } catch (error) {
            console.warn(
              `No difficulty info found for persona ${localizedPersona.friendlyId}:`,
              error,
            );
          }

          // For MSIG PA Recovery Plus or TravelEasy, randomize objections even when there is
          // no persona-specific difficulty (getPersonaSpecificDifficulty returns null for
          // those products). Otherwise the persona's static mainObjection (e.g. Daryl's
          // DentiPlus objection) would always be used.
          if (
            companyId === MSIG_COMPANY_ID &&
            productFriendlyId !== 'dentiplus'
          ) {
            const objections = selectRandomMSIGObjections(productFriendlyId);

            if (objections && objections.length > 0) {
              if (!localizedPersona.meta) {
                localizedPersona.meta = {};
              }
              localizedPersona.meta.selectedObjections = objections;
              if (!localizedPersona.details) {
                localizedPersona.details = {} as any;
              }
              localizedPersona.details.mainObjection = objections[0];
            }
          }
        }

        const salesProduct =
          matchingScenario?.product ??
          getProductByFriendlyId(companyId, productFriendlyId, languageCode);
        if (!salesProduct) {
          return reply.status(404).send({ error: 'Sales product not found' });
        }

        // Get the module and framework for this call type
        const module =
          matchingScenario?.module ??
          ALL_SALES_MODULES.find((module) => module.friendlyId === callType);
        const framework = module?.framework ?? DEFAULT_FRAMEWORK;

        // Get localized module to include translated objectives
        const localizedModules = getModules(companyId, languageCode);

        const localizedModuleFromScenario = matchingScenario?.module
          ? {
              ...matchingScenario.module.toObject(),
              ...matchingScenario.module.getLocalizedContent?.(languageCode),
            }
          : null;

        const localizedModule =
          localizedModuleFromScenario ??
          localizedModules.find((m) => m.friendlyId === callType);

        const standingConfig = companyId
          ? findStandingConfigurationForSession(
              companyId,
              callType,
              productFriendlyId,
            )
          : undefined;

        let assessmentType = standingConfig?.base.assessmentType ?? 'regular';
        if (
          matchingScenario &&
          (matchingScenario.scorecard?.sections?.length ?? 0) > 0
        ) {
          assessmentType = 'scorecard';
        } else if (
          companyId === MSIG_COMPANY_ID &&
          (module?.friendlyId === CallType.MSIG_TELESALES ||
            module?.friendlyId === CallType.MSIG_AGENCY_SALES)
        ) {
          if (productFriendlyId === 'travel-easy') {
            assessmentType = 'msig-travel-easy';
          } else {
            assessmentType = 'msig';
          }
        } else if (
          companyId === MSIG_COMPANY_ID &&
          module?.friendlyId === CallType.PRODUCT_POSITIONING
        ) {
          assessmentType = 'msig-3f';
        } else if (
          companyId === MANULIFE_COMPANY_ID &&
          module?.friendlyId === CallType.MANULIFE_FNA
        ) {
          assessmentType = 'manulife';
        } else if (
          companyId === MANULIFE_COMPANY_ID &&
          module?.friendlyId === 'manulife-product-pitch' &&
          productFriendlyId === 'manulife-goalready'
        ) {
          assessmentType = 'manulife-goalready';
        } else if (companyId === BBL_COMPANY_ID) {
          assessmentType = 'bbl';
        } else if (
          (companyId === GRAB_COMPANY_ID ||
            companyId === GRAB_TEST_COMPANY_ID) &&
          module?.friendlyId === CallType.GRAB_MEX
        ) {
          assessmentType = 'grab-mex';
        } else if (
          companyId === HSBC_COMPANY_ID ||
          companyId === HSBC_YUE_COMPANY_ID
        ) {
          assessmentType = 'hsbc';
        } else if (
          companyId === MTL_COMPANY_ID &&
          module?.friendlyId === 'mtl-agent-recruitment'
        ) {
          assessmentType = 'mtl-recruitment';
        } else if (
          companyId === MTL_COMPANY_ID &&
          module?.friendlyId === 'mtl-prospect-practice'
        ) {
          assessmentType = 'mtl-prospect-practice';
        } else if (
          companyId === AXA_PH_COMPANY_ID &&
          module?.friendlyId === 'axa-ph-unit-manager-recruitment'
        ) {
          assessmentType = 'axa-ph-recruitment';
        } else if (
          companyId === AXA_PH_COMPANY_ID &&
          module?.friendlyId === 'axa-ph-general-objection-handling'
        ) {
          assessmentType = 'axa-ph-objection-handling';
        } else if (
          companyId === KT_AXA_COMPANY_ID &&
          module?.friendlyId === 'kt-axa-agent-recruitment'
        ) {
          assessmentType = 'kt-axa-recruitment';
        } else if (
          companyId === KT_AXA_COMPANY_ID &&
          module?.friendlyId === 'kt-axa-fna-product-pitch'
        ) {
          assessmentType = 'kt-axa-fna';
        } else if (
          companyId === KT_AXA_COMPANY_ID &&
          module?.friendlyId === 'kt-axa-wealthplus-close-call'
        ) {
          assessmentType = 'kt-axa-wealthplus';
        } else if (
          shouldUsePrudentialData(companyId) &&
          module?.friendlyId === 'prudential-objection-handling'
        ) {
          assessmentType = 'prudential-objection-handling';
        } else if (
          companyId === PRUDENTIAL_PH_COMPANY_ID &&
          module?.friendlyId === 'prudential-ph-appointment-setting'
        ) {
          assessmentType = 'prudential-ph-appointment-setting';
        } else if (
          companyId === PRUDENTIAL_PH_COMPANY_ID &&
          module?.friendlyId === 'prudential-ph-fact-finding'
        ) {
          assessmentType = 'prudential-ph-fact-finding';
        } else if (
          companyId === PRUDENTIAL_PH_COMPANY_ID &&
          module?.friendlyId === 'prudential-ph-closing-call'
        ) {
          assessmentType = 'prudential-ph-closing-call';
        } else if (companyId === AIA_KO_COMPANY_ID) {
          if (module?.friendlyId === 'aia-ko-opening-objection-call') {
            assessmentType = 'aia-ko-opening-objection-call';
          } else if (module?.friendlyId === 'aia-ko-product-pitch') {
            assessmentType = 'aia-ko-product-pitch';
          } else if (module?.friendlyId === 'aia-ko-end-to-end-outbound-call') {
            assessmentType = 'aia-ko-end-to-end-outbound-call';
          }
        } else if (
          companyId === GREAT_EASTERN_COMPANY_ID &&
          (module?.friendlyId === 'great-eastern-fact-find' ||
            module?.friendlyId === 'great-eastern-product-pitch' ||
            module?.friendlyId === 'great-eastern-post-sales')
        ) {
          assessmentType = 'great-eastern';
        }

        // Override callCriteria based on module for MSIG products
        let productWithModuleCallCriteria: any = { ...salesProduct };
        if (
          companyId === MSIG_COMPANY_ID &&
          module?.friendlyId === CallType.MSIG_TELESALES &&
          productFriendlyId !== 'travel-easy'
        ) {
          // Use MSIG Telesales scorecard for telesales module
          // Provide localized callCriteria based on language
          const telesalesCallCriteria: {
            [key: string]: {
              title: string;
              description: string;
              criteria: string[];
            };
          } = {
            en: {
              title: 'MSIG Telesales Call Scorecard',
              description:
                'To get the best standing in this session, aim to meet all the key evaluation criteria:',
              criteria: [
                'Complete introduction',
                'Presentation',
                'Communication skills',
                'Sales confirmation',
                'Mandatory statement',
                'Closure',
              ],
            },
            id: {
              title: 'MSIG Telesales Call Scorecard',
              description:
                'Untuk mendapatkan standing terbaik dalam sesi ini, usahakan memenuhi semua kriteria evaluasi utama:',
              criteria: [
                'Perkenalan lengkap',
                'Presentasi',
                'Keterampilan komunikasi',
                'Konfirmasi penjualan',
                'Pernyataan wajib',
                'Penutupan',
              ],
            },
            ms: {
              title: 'MSIG Telesales Call Scorecard',
              description:
                'Untuk mendapat kedudukan terbaik dalam sesi ini, usahakan memenuhi semua kriteria penilaian utama:',
              criteria: [
                'Pengenalan lengkap',
                'Persembahan',
                'Kemahiran komunikasi',
                'Pengesahan jualan',
                'Kenyataan mandatori',
                'Penutupan',
              ],
            },
          };

          productWithModuleCallCriteria.callCriteria =
            telesalesCallCriteria[languageCode] || telesalesCallCriteria.en;
        }

        // Override callCriteria for Great Eastern by module (from scenario evaluation frameworks)
        if (
          companyId === GREAT_EASTERN_COMPANY_ID &&
          (module?.friendlyId === 'great-eastern-fact-find' ||
            module?.friendlyId === 'great-eastern-product-pitch' ||
            module?.friendlyId === 'great-eastern-post-sales')
        ) {
          const greatEasternCallCriteria = getGreatEasternCallCriteria(
            module.friendlyId,
            languageCode,
          );
          if (greatEasternCallCriteria) {
            productWithModuleCallCriteria.callCriteria =
              greatEasternCallCriteria;
          }
        }

        const sessionData: any = {
          user: req.user?._id,
          teams: req.user?.teams || [],
          callType,
          assessmentType,
          languageCode,
          // Legacy fields - persist static data as before
          product: productWithModuleCallCriteria,
          persona: localizedPersona,
          startedAt: new Date(),
          roleplay: {
            framework,
            objectives: localizedModule?.objectives || [],
            // BBL objections: index 0 = primary, indices 1+ = mini
            ...(localizedPersona.meta?.selectedObjections
              ? { selectedObjections: localizedPersona.meta.selectedObjections }
              : {}),
          },
        };

        // Store scenario ID if we found a matching scenario
        if (matchingScenario) {
          sessionData.scenario = matchingScenario._id;
        }

        const newSession = await SalesSession.create(sessionData);

        return reply.send({
          success: true,
          sessionId: newSession._id.toString(),
        });
      } catch (error) {
        console.error(error);
        return reply
          .status(500)
          .send({ error: 'Failed to create new session' });
      }
    },
  });

  app.get('/past', {
    schema: {
      querystring: z.object({
        limit: z.coerce.number().optional().default(10),
        offset: z.coerce.number().optional().default(0),
      }),
    },
    handler: async (req, reply) => {
      const { limit, offset } = req.query;
      const userId = req.user?._id;
      const languageCode = getLanguageHeader(req);

      if (!userId) {
        return reply.status(400).send({ error: 'User ID is required' });
      }

      try {
        // Define the base filter for sessions
        const sessionFilter = {
          endedAt: { $exists: true, $ne: null },
          $expr: { $gte: [{ $size: '$messages' }, 6] },
          user: userId,
        };

        const totalCount = await SalesSession.countDocuments(sessionFilter);

        const sessions = await SalesSession.find(sessionFilter)
          .populate('standing')
          .populate({
            path: 'scenario',
            populate: [
              { path: 'product' },
              { path: 'persona' },
              { path: 'module' },
            ],
          })
          .sort({ endedAt: -1 })
          .skip(offset)
          .limit(limit)
          .lean({ virtuals: true });

        const result = sessions.map((session, sessionIndex) => {
          // Prefer normalized scenario fields if present, fallback to legacy embedded fields
          const persona =
            (session as any)?.scenario?.persona || (session as any).persona;
          const product =
            (session as any)?.scenario?.product || (session as any).product;

          // Get the module and framework for this call type
          const moduleFromScenario = getLocalizedModuleFromScenario(
            (session as any)?.scenario,
            languageCode,
          );

          // Get localized module name
          const localizedModule =
            moduleFromScenario ??
            getModuleByFriendlyId(session.callType, languageCode);

          const localizedModuleName =
            localizedModule?.title || session.callType;
          const localizedProductName = product?.name || '';

          // If product has titleBarHidden flag, use only module name
          const title = product?.titleBarHidden
            ? localizedModuleName
            : `${localizedModuleName} - ${localizedProductName}`;

          const salesTechniques = parseJsonSafely(
            session.roleplay?.feedback?.salesTechniques,
          );
          const productKnowledge = parseJsonSafely(
            session.roleplay?.feedback?.productKnowledge,
          );
          const processAdherence = parseJsonSafely(
            session.roleplay?.feedback?.processAdherence,
          );
          const communicationAndPresence = parseJsonSafely(
            session.roleplay?.feedback?.communicationAndPresence,
          );
          const advisoryTechnique = parseJsonSafely(
            session.roleplay?.feedback?.advisoryTechnique,
          );
          const grabMexSoftSkills = parseJsonSafely(
            session.roleplay?.feedback?.grabMexSoftSkills,
          );
          // AXA PH-specific feedback fields
          const axaPhSoftSkills = parseJsonSafely(
            session.roleplay?.feedback?.axaPhSoftSkills,
          );
          const axaPhKnowledgeSkills = parseJsonSafely(
            session.roleplay?.feedback?.axaPhKnowledgeSkills,
          );
          // KT AXA-specific feedback fields
          const ktAxaSoftSkills = parseJsonSafely(
            session.roleplay?.feedback?.ktAxaSoftSkills,
          );
          const ktAxaKnowledgeSkills = parseJsonSafely(
            session.roleplay?.feedback?.ktAxaKnowledgeSkills,
          );
          const ktAxaProductKnowledge = parseJsonSafely(
            session.roleplay?.feedback?.ktAxaProductKnowledge,
          );
          // HSBC-specific feedback fields
          const relationshipManagement = parseJsonSafely(
            session.roleplay?.feedback?.relationshipManagement,
          );
          const hsbcProcessAdherence = parseJsonSafely(
            session.roleplay?.feedback?.processAdherence,
          );
          const representation = parseJsonSafely(
            session.roleplay?.feedback?.representation,
          );
          // Prudential Objection Handling-specific feedback fields
          const prudentialOHSalesTechnique = parseJsonSafely(
            session.roleplay?.feedback?.prudentialOHSalesTechnique,
          );
          const prudentialOHObjectionHandling = parseJsonSafely(
            session.roleplay?.feedback?.prudentialOHObjectionHandling,
          );
          // MSIG TravelEasy-specific feedback fields
          const msigTravelEasySoftSkills = parseJsonSafely(
            session.roleplay?.feedback?.msigTravelEasySoftSkills,
          );
          const msigTravelEasyKnowledgeSkills = parseJsonSafely(
            session.roleplay?.feedback?.msigTravelEasyKnowledgeSkills,
          );
          const msigTravelEasyProductKnowledge = parseJsonSafely(
            session.roleplay?.feedback?.msigTravelEasyProductKnowledge,
          );
          // Prudential PH Appointment Setting-specific feedback fields
          const prudentialPHAppointmentSetting = parseJsonSafely(
            session.roleplay?.feedback?.prudentialPHAppointmentSetting,
          );
          // Prudential PH Fact Finding-specific feedback fields
          const prudentialPHFactFindingTechnique = parseJsonSafely(
            session.roleplay?.feedback?.prudentialPHFactFindingTechnique,
          );
          const prudentialPHProductKnowledge = parseJsonSafely(
            session.roleplay?.feedback?.prudentialPHProductKnowledge,
          );
          // Prudential PH Closing Call-specific feedback fields
          const prudentialPHClosingCallTechnique = parseJsonSafely(
            session.roleplay?.feedback?.prudentialPHClosingCallTechnique,
          );
          // AIA Korea-specific feedback fields
          const aiaKoIntroduction = parseJsonSafely(
            session.roleplay?.feedback?.aiaKoIntroduction,
          );
          const aiaKoObjectionHandling = parseJsonSafely(
            session.roleplay?.feedback?.aiaKoObjectionHandling,
          );
          const aiaKoNeedsExploration = parseJsonSafely(
            session.roleplay?.feedback?.aiaKoNeedsExploration,
          );

          const aiaKoNeedsAnalysis = parseJsonSafely(
            session.roleplay?.feedback?.aiaKoNeedsAnalysis,
          );
          const aiaKoProductPitch = parseJsonSafely(
            session.roleplay?.feedback?.aiaKoProductPitch,
          );
          const aiaKoProductPitchObjectionHandling = parseJsonSafely(
            session.roleplay?.feedback?.aiaKoProductPitchObjectionHandling,
          );
          // AIA KO End-to-End specific feedback fields
          const aiaKoE2EAssessment = parseJsonSafely(
            session.roleplay?.feedback?.aiaKoE2EAssessment,
          );
          // Great Eastern-specific feedback fields
          const greatEasternAssessment = parseJsonSafely(
            session.roleplay?.feedback?.greatEasternAssessment,
          );
          // Manulife GoalReady-specific feedback fields
          const manulifeSalesAndNegotiationSkills = parseJsonSafely(
            session.roleplay?.feedback?.manulifeSalesAndNegotiationSkills,
          );
          const manulifeSoftSkills = parseJsonSafely(
            session.roleplay?.feedback?.manulifeSoftSkills,
          );
          const manulifeProductKnowledge = parseJsonSafely(
            session.roleplay?.feedback?.manulifeProductKnowledge,
          );

          const salesTechniqueScore = salesTechniques?.overallScore ?? null;
          const productKnowledgeScore = productKnowledge?.overallScore ?? null;
          const processAdherenceScore =
            session.assessmentType === 'bbl'
              ? (processAdherence?.overallScore ?? undefined)
              : undefined;
          const communicationAndPresenceScore =
            session.assessmentType === 'hsbc'
              ? (communicationAndPresence?.overallScore ?? undefined)
              : undefined;
          const advisoryTechniqueScore =
            session.assessmentType === 'bbl' ||
            session.assessmentType === 'hsbc'
              ? (advisoryTechnique?.overallScore ?? undefined)
              : undefined;
          const softSkillsScore = grabMexSoftSkills?.overallScore ?? null;
          // AXA PH-specific scores
          const axaPhSoftSkillsScore =
            session.assessmentType === 'axa-ph-recruitment' ||
            session.assessmentType === 'axa-ph-objection-handling'
              ? (axaPhSoftSkills?.overallScore ?? null)
              : null;
          const axaPhKnowledgeSkillsScore =
            session.assessmentType === 'axa-ph-recruitment' ||
            session.assessmentType === 'axa-ph-objection-handling'
              ? (axaPhKnowledgeSkills?.overallScore ?? null)
              : null;
          // KT AXA-specific scores
          const isKtAxaAssessment =
            session.assessmentType === 'kt-axa-recruitment' ||
            session.assessmentType === 'kt-axa-fna' ||
            session.assessmentType === 'kt-axa-wealthplus';
          const ktAxaSoftSkillsScore = isKtAxaAssessment
            ? (ktAxaSoftSkills?.overallScore ?? null)
            : null;
          const ktAxaKnowledgeSkillsScore = isKtAxaAssessment
            ? (ktAxaKnowledgeSkills?.overallScore ?? null)
            : null;
          const ktAxaProductKnowledgeScore =
            session.assessmentType === 'kt-axa-fna' ||
            session.assessmentType === 'kt-axa-wealthplus'
              ? (ktAxaProductKnowledge?.overallScore ?? null)
              : null;
          // HSBC-specific scores
          const relationshipManagementScore =
            session.assessmentType === 'hsbc'
              ? (relationshipManagement?.overallScore ?? undefined)
              : undefined;
          const hsbcProcessAdherenceScore =
            session.assessmentType === 'hsbc'
              ? (hsbcProcessAdherence?.overallScore ?? undefined)
              : undefined;
          const representationScore =
            session.assessmentType === 'hsbc'
              ? (representation?.overallScore ?? undefined)
              : undefined;

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
            const overallScore = calculateMSIGOverallScore(
              salesTechniques?.sections,
            );
            const tierName = getMSIGTierName(salesTechniques?.sections);
            const hasMandatoryFailures = hasFailedMandatory(
              salesTechniques?.sections,
            );
            const isDataIncomplete = isMsigDataIncomplete(
              salesTechniques?.sections,
            );

            // Map tier name to tier level for consistency with existing standing system
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
            // For MSIG Product Positioning, combine both scores with equal weight
            const salesTechScore = salesTechniques?.overallScore || 0;
            const productKnowledgeScore = productKnowledge?.overallScore || 0;

            // Check if data is incomplete (missing either sales technique or product knowledge)
            const isDataIncomplete =
              !salesTechniques?.overallScore || !productKnowledge?.overallScore;

            if (isDataIncomplete) {
              // Set standing to null so frontend shows "Not available"
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
            const overallScore = calculateManulifeOverallScore(
              salesTechniques?.sections,
            );
            const tierName = getManulifeTierName(
              salesTechniques?.sections,
              languageCode,
            );
            const tierLevel = getManulifeTierLevel(tierName);

            enrichedStanding = {
              tierLevel,
              tierName,
              overallScore,
              // maxScore:
            };
          } else if (session.assessmentType === 'manulife-goalready') {
            // For Manulife GoalReady: Sales & Negotiation Skills (33) + Soft Skills (33) + Product Knowledge (34) = 100
            // Check if data is incomplete
            const isDataIncomplete =
              !manulifeSalesAndNegotiationSkills?.score ||
              !manulifeSoftSkills?.score ||
              !manulifeProductKnowledge?.score;

            if (isDataIncomplete) {
              enrichedStanding = null;
            } else {
              // Normalize each score to its respective weight out of 100 (keep decimal precision)
              const salesAndNegotiationScore =
                (manulifeSalesAndNegotiationSkills.score /
                  (manulifeSalesAndNegotiationSkills.maxScore || 33)) *
                33;
              const softSkillsScore =
                (manulifeSoftSkills.score /
                  (manulifeSoftSkills.maxScore || 33)) *
                33;
              const productKnowledgeScore =
                (manulifeProductKnowledge.score /
                  (manulifeProductKnowledge.maxScore || 34)) *
                34;

              // Calculate overall score with 1 decimal place (sum of all three normalized scores out of 100)
              const overallScore = Number(
                (
                  salesAndNegotiationScore +
                  softSkillsScore +
                  productKnowledgeScore
                ).toFixed(1),
              );

              // Determine tier based on score
              let tierLevel: number;
              let tierName: string;

              if (overallScore < 50) {
                tierLevel = 1;
                tierName = 'Failed';
              } else if (overallScore < 80) {
                tierLevel = 2;
                tierName = 'Pass';
              } else {
                tierLevel = 3;
                tierName = 'Champion';
              }

              enrichedStanding = {
                tierLevel,
                tierName,
                overallScore,
              };
            }
          } else if (
            session.assessmentType === 'prudential-objection-handling'
          ) {
            // For Prudential Objection Handling, calculate standing from scores
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
            // For MSIG TravelEasy: Soft Skills (30) + Knowledge Skills (30) + Product Knowledge (40) = 100
            const softSkillsScore = msigTravelEasySoftSkills?.overallScore || 0;
            const knowledgeSkillsScore =
              msigTravelEasyKnowledgeSkills?.overallScore || 0;
            const productKnowledgeScore =
              msigTravelEasyProductKnowledge?.overallScore || 0;

            // Check if data is incomplete
            const isDataIncomplete =
              !msigTravelEasySoftSkills?.overallScore ||
              !msigTravelEasyKnowledgeSkills?.overallScore ||
              !msigTravelEasyProductKnowledge?.overallScore;

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
          }

          return {
            id: session._id.toString(),
            title,
            startedAt: session.startedAt
              ? new Date(session.startedAt).toISOString()
              : null,
            endedAt: session.endedAt
              ? new Date(session.endedAt).toISOString()
              : null,
            callType: session.callType,
            assessmentType: session.assessmentType,
            product: {
              name: product?.name || null,
            },
            persona: {
              name: persona?.name || null,
              occupation: persona?.occupation || null,
            },
            scores: {
              salesTechnique: salesTechniqueScore,
              productKnowledge: productKnowledgeScore,
              processAdherence: processAdherenceScore,
              communicationAndPresence: communicationAndPresenceScore,
              advisoryTechnique: advisoryTechniqueScore,
              ...(session.assessmentType === 'grab-mex' && {
                softSkills: softSkillsScore,
              }),
              ...(session.assessmentType === 'hsbc' && {
                relationshipManagement: relationshipManagementScore,
                hsbcProcessAdherence: hsbcProcessAdherenceScore,
                representation: representationScore,
              }),
              ...(session.assessmentType === 'scorecard' && {
                overallScore: Math.round(
                  (session?.roleplay?.feedback?.scorecards as any)?.reduce(
                    (total: number, section: any) =>
                      total + Math.round(section.overallScore),
                    0,
                  ) / (session?.roleplay?.feedback?.scorecards as any)?.length,
                ),
              }),
              ...((session.assessmentType === 'axa-ph-recruitment' ||
                session.assessmentType === 'axa-ph-objection-handling') && {
                axaPhSoftSkills: axaPhSoftSkillsScore,
                axaPhKnowledgeSkills: axaPhKnowledgeSkillsScore,
              }),
              ...(isKtAxaAssessment && {
                ktAxaSoftSkills: ktAxaSoftSkillsScore,
                ktAxaKnowledgeSkills: ktAxaKnowledgeSkillsScore,
                ...(ktAxaProductKnowledgeScore !== null && {
                  ktAxaProductKnowledge: ktAxaProductKnowledgeScore,
                }),
              }),
              ...(session.assessmentType === 'msig-travel-easy' && {
                msigTravelEasySoftSkills:
                  msigTravelEasySoftSkills?.overallScore ?? null,
                msigTravelEasyKnowledgeSkills:
                  msigTravelEasyKnowledgeSkills?.overallScore ?? null,
                msigTravelEasyProductKnowledge:
                  msigTravelEasyProductKnowledge?.overallScore ?? null,
              }),
              ...(session.assessmentType ===
                'prudential-ph-appointment-setting' && {
                overallScore:
                  prudentialPHAppointmentSetting?.overallScore ?? null,
              }),
              ...(session.assessmentType === 'prudential-ph-fact-finding' && {
                prudentialPHFactFindingTechnique:
                  prudentialPHFactFindingTechnique?.overallScore != null
                    ? Math.round(
                        (prudentialPHFactFindingTechnique.overallScore /
                          (prudentialPHFactFindingTechnique.maxScore || 100)) *
                          100,
                      )
                    : null,
                prudentialPHProductKnowledge:
                  prudentialPHProductKnowledge?.overallScore != null
                    ? Math.round(
                        (prudentialPHProductKnowledge.overallScore /
                          (prudentialPHProductKnowledge.maxScore || 100)) *
                          100,
                      )
                    : null,
              }),
              ...(session.assessmentType === 'prudential-ph-closing-call' && {
                prudentialPHClosingCallTechnique:
                  prudentialPHClosingCallTechnique?.overallScore != null
                    ? Math.round(
                        (prudentialPHClosingCallTechnique.overallScore /
                          (prudentialPHClosingCallTechnique.maxScore || 100)) *
                          100,
                      )
                    : null,
              }),
              ...(session.assessmentType ===
                'aia-ko-opening-objection-call' && {
                aiaKoIntroduction:
                  aiaKoIntroduction?.overallScore != null
                    ? Math.round(
                        (aiaKoIntroduction.overallScore /
                          (aiaKoIntroduction.maxScore || 100)) *
                          100,
                      )
                    : null,
                aiaKoObjectionHandling:
                  aiaKoObjectionHandling?.overallScore != null
                    ? Math.round(
                        (aiaKoObjectionHandling.overallScore /
                          (aiaKoObjectionHandling.maxScore || 100)) *
                          100,
                      )
                    : null,
                aiaKoNeedsExploration:
                  aiaKoNeedsExploration?.overallScore != null
                    ? Math.round(
                        (aiaKoNeedsExploration.overallScore /
                          (aiaKoNeedsExploration.maxScore || 100)) *
                          100,
                      )
                    : null,
                overallScore: parseAiaKoFeedbackScores(session).overallScore,
              }),
              ...(session.assessmentType === 'aia-ko-product-pitch' && {
                aiaKoNeedsAnalysis:
                  aiaKoNeedsAnalysis?.overallScore != null
                    ? Math.round(
                        (aiaKoNeedsAnalysis.overallScore /
                          (aiaKoNeedsAnalysis.maxScore || 100)) *
                          100,
                      )
                    : null,
                aiaKoProductPitch:
                  aiaKoProductPitch?.overallScore != null
                    ? Math.round(
                        (aiaKoProductPitch.overallScore /
                          (aiaKoProductPitch.maxScore || 100)) *
                          100,
                      )
                    : null,
                aiaKoProductPitchObjectionHandling:
                  aiaKoProductPitchObjectionHandling?.overallScore != null
                    ? Math.round(
                        (aiaKoProductPitchObjectionHandling.overallScore /
                          (aiaKoProductPitchObjectionHandling.maxScore ||
                            100)) *
                          100,
                      )
                    : null,
                overallScore: parseAiaKoFeedbackScores(session).overallScore,
              }),
              ...(session.assessmentType ===
                'aia-ko-end-to-end-outbound-call' && {
                aiaKoE2EAssessment:
                  aiaKoE2EAssessment?.overallScore != null
                    ? Math.round(
                        (aiaKoE2EAssessment.overallScore /
                          (aiaKoE2EAssessment.maxScore || 100)) *
                          100,
                      )
                    : null,
              }),
              ...(session.assessmentType === 'great-eastern' && {
                overallScore: greatEasternAssessment?.overallScore ?? null,
              }),
              ...(session.assessmentType === 'manulife-goalready' && {
                manulifeSalesAndNegotiationSkills:
                  manulifeSalesAndNegotiationSkills?.score != null
                    ? Number(
                        (
                          (manulifeSalesAndNegotiationSkills.score /
                            (manulifeSalesAndNegotiationSkills.maxScore ||
                              33)) *
                          33
                        ).toFixed(1),
                      )
                    : null,
                manulifeSoftSkills:
                  manulifeSoftSkills?.score != null
                    ? Number(
                        (
                          (manulifeSoftSkills.score /
                            (manulifeSoftSkills.maxScore || 33)) *
                          33
                        ).toFixed(1),
                      )
                    : null,
                manulifeProductKnowledge:
                  manulifeProductKnowledge?.score != null
                    ? Number(
                        (
                          (manulifeProductKnowledge.score /
                            (manulifeProductKnowledge.maxScore || 34)) *
                          34
                        ).toFixed(1),
                      )
                    : null,
              }),
            },
            standing: enrichedStanding,
          };
        });

        return reply.send({
          data: result,
          pagination: {
            limit,
            offset,
            total: totalCount,
            hasMore: offset + limit < totalCount,
          },
        });
      } catch (error) {
        console.error('Error fetching past sessions:', error);

        return reply.code(500).send({
          error: 'Internal server error while fetching sessions',
        });
      }
    },
  });

  /**
   * @method POST /sessions/track-module-access
   * @description Mark a module as accessed by the user (triggers first-time modal)
   */
  app.post('/track-module-access', {
    schema: {
      body: z.object({
        moduleId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { moduleId } = req.body;
      const userId = req.user?._id;
      const companyId = req.user?.company?.toString();

      if (companyId && !shouldUsePrudentialData(companyId)) {
        return reply.send({ success: true }); // No-op for non-Prudential users
      }

      try {
        // Create a new UserModuleAccess record if it doesn't exist
        await UserModuleAccess.findOneAndUpdate(
          { userId, moduleId },
          { userId, moduleId },
          { upsert: true, new: true },
        );

        return reply.send({ success: true });
      } catch (error) {
        console.error('Error marking module as accessed:', error);
        return reply
          .status(500)
          .send({ error: 'Failed to mark module as accessed' });
      }
    },
  });
  /**
   * @method GET /sessions/home
   * @description Retrieve all sales modules with populated products and first-time access info
   * @query modules - Optional comma-separated list of module friendlyIds to filter by (whitelist)
   */
  app.get('/home', {
    schema: {
      querystring: z.object({
        modules: z.string().optional(),
      }),
    },
    async handler(req, reply) {
      const companyId = req.user!.company!.toString();
      const userId = req.user?._id?.toString();
      const languageCode = getLanguageHeader(req);
      const { modules: moduleWhitelist } = req.query;

      let modules = getModules(companyId, languageCode);

      // Apply whitelist filter if provided
      if (moduleWhitelist) {
        const allowedModules = moduleWhitelist
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean);
        if (allowedModules.length > 0) {
          modules = modules.filter((m) =>
            allowedModules.includes(m.friendlyId),
          );
        }
      }

      // Only add first-time tracking for Prudential users
      let populatedModules = modules;
      if (companyId && shouldUsePrudentialData(companyId) && userId) {
        const userModuleAccesses = await UserModuleAccess.find({ userId });
        const accessedModuleIds = userModuleAccesses.map(
          (access) => access.moduleId,
        );

        populatedModules = modules.map((module: any) => {
          const disclaimer = getModuleDisclaimer(
            module.friendlyId,
            languageCode,
          );
          return {
            ...module,
            isFirstTime: !accessedModuleIds.includes(module.friendlyId),
            disclaimer: disclaimer,
          };
        });
      } else {
        populatedModules = modules.map((module) => ({
          ...module,
          isFirstTime: false,
        }));
      }

      const company = await Company.findById(companyId);
      let dbModules: any = [];
      if (company?.selfServiceEnabled || company?.dataMigrated) {
        dbModules = await getModulesV2(companyId, languageCode);

        // Apply whitelist filter to database modules if provided
        if (moduleWhitelist) {
          const allowedModules = moduleWhitelist
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean);
          if (allowedModules.length > 0) {
            dbModules = dbModules.filter((m: any) =>
              allowedModules.includes(m.friendlyId),
            );
          }
        }
      }

      // If company data has been migrated OR is self-service enabled, only return database modules
      if (company?.dataMigrated || company?.selfServiceEnabled) {
        return reply.send({
          modules: dbModules,
        });
      }

      return reply.send({
        modules: [...dbModules, ...populatedModules],
      });
    },
  });

  /**
   * @method GET /sessions/:sessionId
   * @description Retrieve session details (without voice prompts)
   */
  app.get('/:sessionId', {
    schema: {
      params: z.object({
        sessionId: z.string(),
      }),
    },
    async handler(req, reply) {
      const { sessionId } = req.params;

      const rawSession = await verifyAndPopulateSession(
        sessionId,
        req.user!,
        app,
        [
          {
            path: 'messages',
            options: { sort: { sent: 1 } },
          },
          'standing',
          {
            path: 'scenario',
            populate: [{ path: 'scorecard' }, { path: 'module' }],
          },
        ],
      );
      const session = rawSession.toObject({ virtuals: true });

      const module = ALL_SALES_MODULES.find(
        (module) => module.friendlyId === session.callType,
      );

      const framework = module?.framework ?? DEFAULT_FRAMEWORK;

      const languageCode = getLanguageHeader(req);

      // Get localized module to include translated objectives
      const localizedModules = getModules(
        req.user?.company?.toString(),
        languageCode,
      );
      const localizedModule =
        getLocalizedModuleFromScenario(session?.scenario, languageCode) ??
        localizedModules.find((m) => m.friendlyId === session.callType);

      let sessionObjectives = session.roleplay?.objectives || [];
      if (sessionObjectives.length === 0 && localizedModule?.objectives) {
        sessionObjectives = localizedModule.objectives;
        if (session.roleplay) {
          await rawSession.updateOne({
            $set: { 'roleplay.objectives': localizedModule.objectives },
          });
        }
      }

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
            (session as any)?.scenario?.persona?.friendlyId ||
              session.persona?.friendlyId ||
              '',
            languageCode,
            ((session as any)?.scenario?.product || (session as any).product)
              ?.friendlyId,
          );
        } catch (error) {
          console.error('Error analyzing standing progression:', error);
        }
      }

      const response = {
        ...session,
        standing: enrichedStanding,
        standingProgression,
        module: localizedModule,
        framework: getTranslatedFramework(
          framework,
          languageCode,
          session.persona?.name,
        ),
        hasScorecards: session.scenario?.scorecard?.sections?.length > 0,
      };

      if (response.roleplay) {
        response.roleplay.objectives = sessionObjectives;
      }

      return reply.send({
        session: response,
        status: session.endedAt ? 'ended' : 'active',
      });
    },
  });

  app.log.info('[sessions/basic.ts] routes registered');
};

export default router;
