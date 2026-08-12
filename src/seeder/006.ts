import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../env.js';
import { connect, disconnect, Types } from 'mongoose';
import { Module } from '../models/Module.js';
import { SalesProduct } from '../models/SalesProduct.js';
import { Persona } from '../models/Persona.js';
import { Scorecard } from '../models/Scorecard.js';
import { Scenario } from '../models/Scenario.js';
import {
  GRAB_COMPANY_ID,
  MSIG_COMPANY_ID,
  PRUDENTIAL_COMPANY_ID,
  MTL_COMPANY_ID,
  AXA_PH_COMPANY_ID,
  KT_AXA_COMPANY_ID,
  GREAT_EASTERN_COMPANY_ID,
} from '../utils/constants.js';
import { getPersonas } from '../utils/persona.js';
import { findStandingConfigurationForSession } from '../utils/prudential-standing.js';
import { getPersonaSpecificDifficulty } from '../data/personas/difficulty-specific.js';
import { loadTranslations } from '../locale/translation.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

type AssessmentType = 'regular' | 'prudential' | 'msig' | 'msig-3f';

function selectScorecardFriendlyId(
  companyId: string,
  moduleFriendlyId: string,
  productFriendlyId: string,
  assessmentType: AssessmentType,
): string {
  // MSIG specific mappings
  if (companyId === MSIG_COMPANY_ID) {
    if (assessmentType === 'msig') return 'msig-telesales-scorecard';
    if (assessmentType === 'msig-3f') return 'msig-3f-scorecard';
  }

  // Prudential mappings
  if (companyId === PRUDENTIAL_COMPANY_ID) {
    if (moduleFriendlyId === 'cold-call')
      return 'prudential-cold-call-scorecard';
    return 'prudential-product-positioning-scorecard';
  }

  // Grab MEDDPICC mapping by module
  if (
    companyId === GRAB_COMPANY_ID &&
    moduleFriendlyId === 'cold-call-meddpicc'
  ) {
    return 'grab-meddpicc-scorecard';
  }

  // MTL mappings
  if (companyId === MTL_COMPANY_ID) {
    if (moduleFriendlyId === 'mtl-agent-recruitment')
      return 'mtl-recruitment-scorecard';
    if (moduleFriendlyId === 'mtl-ul-plus-sales')
      return 'mtl-advisory-scorecard';
    if (moduleFriendlyId === 'mtl-prospect-practice')
      return 'mtl-prospect-practice-scorecard';
  }

  if (companyId === AXA_PH_COMPANY_ID) {
    if (moduleFriendlyId === 'axa-ph-unit-manager-recruitment')
      return 'axa-ph-recruitment-scorecard';
    if (moduleFriendlyId === 'axa-ph-financial-needs-analysis')
      return 'axa-ph-fna-scorecard';
    if (moduleFriendlyId === 'axa-ph-general-objection-handling')
      return 'axa-ph-objection-handling-scorecard';
  }

  if (companyId === KT_AXA_COMPANY_ID) {
    if (moduleFriendlyId === 'kt-axa-agent-recruitment')
      return 'kt-axa-recruitment-scorecard';
    if (moduleFriendlyId === 'kt-axa-fna-product-pitch')
      return 'kt-axa-fna-scorecard';
    if (moduleFriendlyId === 'kt-axa-wealthplus-close-call')
      return 'kt-axa-wealthplus-scorecard';
  }

  if (companyId === GREAT_EASTERN_COMPANY_ID) {
    if (moduleFriendlyId === 'great-eastern-fact-find')
      return 'great-eastern-fact-find-scorecard';
    if (moduleFriendlyId === 'great-eastern-product-pitch')
      return 'great-eastern-product-pitch-scorecard';
    if (moduleFriendlyId === 'great-eastern-post-sales')
      return 'great-eastern-post-sales-scorecard';
  }

  // Fallback generic
  return 'default-general-scorecard';
}

async function determineAssessmentType(
  companyId: string,
  moduleFriendlyId: string,
  productFriendlyId: string,
): Promise<AssessmentType> {
  // MSIG rules
  if (companyId === MSIG_COMPANY_ID) {
    if (moduleFriendlyId === 'telesales') return 'msig';
    if (moduleFriendlyId === 'product-positioning') return 'msig-3f';
  }

  // Prudential via standing configuration
  if (companyId === PRUDENTIAL_COMPANY_ID) {
    const standing = findStandingConfigurationForSession(
      companyId,
      moduleFriendlyId,
      productFriendlyId,
    );
    if (standing?.base?.assessmentType) {
      return standing.base.assessmentType as AssessmentType;
    }
  }

  return 'regular';
}

async function seedCompanySpecificScenarios(): Promise<number> {
  const companyIds = [
    PRUDENTIAL_COMPANY_ID,
    MSIG_COMPANY_ID,
    GRAB_COMPANY_ID,
    MTL_COMPANY_ID,
    AXA_PH_COMPANY_ID,
    KT_AXA_COMPANY_ID,
    GREAT_EASTERN_COMPANY_ID,
  ];
  let totalUpserts = 0;

  for (const companyId of companyIds) {
    const companyObjectId = new Types.ObjectId(companyId);

    // Fetch modules and products for this company
    const [modules, products] = await Promise.all([
      Module.find({ company: companyObjectId }).select('_id friendlyId').lean(),
      SalesProduct.find({ company: companyObjectId })
        .select('_id friendlyId')
        .lean(),
    ]);

    // Build quick lookup maps
    const moduleByFriendlyId = new Map(
      modules.map((m: any) => [m.friendlyId as string, m]),
    );
    const productByFriendlyId = new Map(
      products.map((p: any) => [p.friendlyId as string, p]),
    );

    // For each product and module, get personas suggested for that combo
    for (const product of products) {
      for (const module of modules) {
        const personasForCombo = getPersonas(
          'en',
          companyId,
          module.friendlyId,
          product.friendlyId,
        );

        if (!Array.isArray(personasForCombo) || personasForCombo.length === 0) {
          continue;
        }

        // Determine assessment type and scorecard
        const assessmentType = await determineAssessmentType(
          companyId,
          module.friendlyId,
          product.friendlyId,
        );
        const scorecardFriendlyId = selectScorecardFriendlyId(
          companyId,
          module.friendlyId,
          product.friendlyId,
          assessmentType,
        );

        const scorecardDoc = await Scorecard.findOne({
          friendlyId: scorecardFriendlyId,
        })
          .select('_id friendlyId')
          .lean();

        if (!scorecardDoc) {
          console.warn(
            `Scorecard not found for friendlyId=${scorecardFriendlyId}. Skipping scenarios for company=${companyId} module=${module.friendlyId} product=${product.friendlyId}.`,
          );
          continue;
        }

        for (const personaLite of personasForCombo) {
          // Resolve persona by friendlyId from DB
          const personaDoc = await Persona.findOne({
            friendlyId: personaLite.friendlyId,
          })
            .select('_id friendlyId')
            .lean();

          if (!personaDoc) {
            console.warn(
              `Persona not found for friendlyId=${personaLite.friendlyId}. Skipping scenario.`,
            );
            continue;
          }

          // Prepare difficulty/localization overlays from difficulty-specific config
          const difficultyInfo = getPersonaSpecificDifficulty(
            personaLite.friendlyId,
            module.friendlyId,
            product.friendlyId,
          );

          // Load translations and get salesGoal for each language
          const enTranslations = loadTranslations('en');
          const enGoal =
            enTranslations?.common.goals[module.friendlyId] ||
            enTranslations?.common.goals['default'];
          const enSalesGoal = enGoal ? `${enGoal}.` : '';

          // Build per-language payloads. 'en' goes into top-level scenarioDetails.
          const enPayload = difficultyInfo
            ? {
                salesDescription: difficultyInfo.uiDescription?.en,
                mainObjection: difficultyInfo.mainObjection
                  ? difficultyInfo.mainObjection.en
                  : undefined,
                salesGoal: enSalesGoal,
              }
            : undefined;
          // Get salesGoal for other languages
          const idTranslations = loadTranslations('id');
          const idGoal =
            idTranslations?.common.goals[module.friendlyId] ||
            idTranslations?.common.goals['default'];
          const idSalesGoal = idGoal ? `${idGoal}.` : '';

          const msTranslations = loadTranslations('ms');
          const msGoal =
            msTranslations?.common.goals[module.friendlyId] ||
            msTranslations?.common.goals['default'];
          const msSalesGoal = msGoal ? `${msGoal}.` : '';

          const thTranslations = loadTranslations('th');
          const thGoal =
            thTranslations?.common.goals[module.friendlyId] ||
            thTranslations?.common.goals['default'];
          const thSalesGoal = thGoal ? `${thGoal}.` : '';

          const tlTranslations = loadTranslations('tl');
          const tlGoal =
            tlTranslations?.common.goals[module.friendlyId] ||
            tlTranslations?.common.goals['default'];
          const tlSalesGoal = tlGoal ? `${tlGoal}.` : '';

          const viTranslations = loadTranslations('vi');
          const viGoal =
            viTranslations?.common.goals[module.friendlyId] ||
            viTranslations?.common.goals['default'];
          const viSalesGoal = viGoal ? `${viGoal}.` : '';

          const idPayload =
            difficultyInfo?.uiDescription?.id ||
            difficultyInfo?.mainObjection?.id
              ? {
                  salesDescription: difficultyInfo.uiDescription?.id,
                  mainObjection: difficultyInfo.mainObjection?.id,
                  salesGoal: idSalesGoal,
                }
              : undefined;
          const msPayload =
            difficultyInfo?.uiDescription?.ms ||
            difficultyInfo?.mainObjection?.ms
              ? {
                  salesDescription: difficultyInfo.uiDescription?.ms,
                  mainObjection: difficultyInfo.mainObjection?.ms,
                  salesGoal: msSalesGoal,
                }
              : undefined;
          const thPayload =
            (difficultyInfo as any)?.uiDescription?.th ||
            (difficultyInfo as any)?.mainObjection?.th
              ? {
                  salesDescription: (difficultyInfo as any).uiDescription?.th,
                  mainObjection: (difficultyInfo as any).mainObjection?.th,
                  salesGoal: thSalesGoal,
                }
              : undefined;
          const tlPayload =
            (difficultyInfo as any)?.uiDescription?.tl ||
            (difficultyInfo as any)?.mainObjection?.tl
              ? {
                  salesDescription: (difficultyInfo as any).uiDescription?.tl,
                  mainObjection: (difficultyInfo as any).mainObjection?.tl,
                  salesGoal: tlSalesGoal,
                }
              : undefined;
          const viPayload =
            (difficultyInfo as any)?.uiDescription?.vi ||
            (difficultyInfo as any)?.mainObjection?.vi
              ? {
                  salesDescription: (difficultyInfo as any).uiDescription?.vi,
                  mainObjection: (difficultyInfo as any).mainObjection?.vi,
                  salesGoal: viSalesGoal,
                }
              : undefined;

          // Upsert by unique key (company, module, product, persona)
          const update: any = {
            $setOnInsert: {
              company: companyObjectId,
              module: (module as any)._id,
              product: (product as any)._id,
              persona: (personaDoc as any)._id,
            },
            $set: {
              scorecard: (scorecardDoc as any)._id,
            },
          };

          if (difficultyInfo) {
            update.$set.difficultyLevel = difficultyInfo.level;
            if (enPayload) {
              update.$set.scenarioDetails = enPayload;
            }
            const locs: Record<string, any> = {};
            if (idPayload) locs['id'] = idPayload;
            if (msPayload) locs['ms'] = msPayload;
            if (thPayload) locs['th'] = thPayload;
            if (tlPayload) locs['tl'] = tlPayload;
            if (viPayload) locs['vi'] = viPayload;
            update.$set.localizations = locs;
          } else {
            // Even without difficulty customizations, set the basic salesGoal for English
            update.$set.scenarioDetails = {
              salesGoal: enSalesGoal,
            };
          }

          const res = await Scenario.updateOne(
            {
              company: companyObjectId,
              module: (module as any)._id,
              product: (product as any)._id,
              persona: (personaDoc as any)._id,
            },
            update,
            { upsert: true },
          );

          if (res.upsertedCount && res.upsertedCount > 0) {
            totalUpserts += res.upsertedCount;
          }
        }
      }
    }
  }

  return totalUpserts;
}

async function seedGenericScenarios(): Promise<number> {
  let totalUpserts = 0;

  // Get all modules and products that are not company-specific (generic ones)
  const [modules, products] = await Promise.all([
    Module.find({ company: { $exists: false } })
      .select('_id friendlyId')
      .lean(),
    SalesProduct.find({ company: { $exists: false } })
      .select('_id friendlyId')
      .lean(),
  ]);

  console.log(
    `Found ${modules.length} generic modules and ${products.length} generic products`,
  );

  // For each product and module, get personas suggested for that combo
  for (const product of products) {
    for (const module of modules) {
      // Get personas for generic scenarios (no specific company)
      const personasForCombo = getPersonas(
        'en',
        undefined,
        module.friendlyId,
        product.friendlyId,
      );

      if (!Array.isArray(personasForCombo) || personasForCombo.length === 0) {
        continue;
      }

      // Use default assessment type and scorecard for generic scenarios
      const assessmentType = 'regular';
      const scorecardFriendlyId = selectScorecardFriendlyId(
        '', // No specific company for generic scenarios
        module.friendlyId,
        product.friendlyId,
        assessmentType,
      );

      const scorecardDoc = await Scorecard.findOne({
        friendlyId: scorecardFriendlyId,
      })
        .select('_id friendlyId')
        .lean();

      if (!scorecardDoc) {
        console.warn(
          `Scorecard not found for friendlyId=${scorecardFriendlyId}. Skipping generic scenarios for module=${module.friendlyId} product=${product.friendlyId}.`,
        );
        continue;
      }

      for (const personaLite of personasForCombo) {
        // Resolve persona by friendlyId from DB
        const personaDoc = await Persona.findOne({
          friendlyId: personaLite.friendlyId,
        })
          .select('_id friendlyId')
          .lean();

        if (!personaDoc) {
          console.warn(
            `Persona not found for friendlyId=${personaLite.friendlyId}. Skipping generic scenario.`,
          );
          continue;
        }

        // Generic scenarios should NOT have difficulty levels or localization overlays
        // Those are company-specific customizations only

        // Upsert by unique key (module, product, persona) - no company field for generic scenarios
        const update: any = {
          $setOnInsert: {
            // Note: NO company field for generic scenarios
            module: (module as any)._id,
            product: (product as any)._id,
            persona: (personaDoc as any)._id,
          },
          $set: {
            scorecard: (scorecardDoc as any)._id,
            // Generic scenarios use default values from persona data, no custom difficulty or localization
          },
        };

        const res = await Scenario.updateOne(
          {
            // Match by module, product, persona but WITHOUT company field
            company: { $exists: false },
            module: (module as any)._id,
            product: (product as any)._id,
            persona: (personaDoc as any)._id,
          },
          update,
          { upsert: true },
        );

        if (res.upsertedCount && res.upsertedCount > 0) {
          totalUpserts += res.upsertedCount;
        }
      }
    }
  }

  return totalUpserts;
}

export async function seedScenarios() {
  await connect(process.env.DATABASE_URL!);

  try {
    console.log('Starting scenario seeding...');

    // Seed company-specific scenarios
    console.log('Seeding company-specific scenarios...');
    const companySpecificUpserts = await seedCompanySpecificScenarios();

    // Seed generic scenarios
    console.log('Seeding generic scenarios...');
    const genericUpserts = await seedGenericScenarios();

    const totalUpserts = companySpecificUpserts + genericUpserts;

    console.log('Scenarios seeding completed.');
    console.log(
      `- Company-specific scenarios created: ${companySpecificUpserts}`,
    );
    console.log(`- Generic scenarios created: ${genericUpserts}`);
    console.log(`- Total new scenarios created: ${totalUpserts}`);
  } catch (error) {
    console.error('Error seeding scenarios:', error);
  } finally {
    await disconnect();
  }
}

void seedScenarios();
