import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../../env.js';
import { connect, disconnect, Types } from 'mongoose';
import { Module } from '../../models/Module.js';
import { SalesProduct } from '../../models/SalesProduct.js';
import { Persona } from '../../models/Persona.js';
import { Scorecard } from '../../models/Scorecard.js';
import { Scenario } from '../../models/Scenario.js';
import {
  GRAB_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
} from '../../utils/constants.js';
import { getPersonas } from '../../utils/persona.js';
import { loadTranslations } from '../../locale/translation.js';
import { getRegularCallPrompt } from '../../prompts/sales-voice.js';
import { CallType } from '../../models/SalesSession.js';
import {
  PRODUCT_FRIENDLY_ID_SUFFIXES,
  PRODUCT_MODULE_MAPPING,
} from './constants.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

/**
 * Strips the nanoid suffix from a product friendlyId to get the base ID.
 * e.g., "grab-for-business-Xk9mZp" -> "grab-for-business"
 */
function getProductBaseFriendlyId(friendlyId: string): string {
  const parts = friendlyId.split('-');
  parts.pop();
  return parts.join('-');
}

/**
 * Gets all module friendlyIds (no suffixes)
 */
function getModuleFriendlyIds(): string[] {
  return Object.keys(PRODUCT_MODULE_MAPPING).flatMap(
    (productBase) => PRODUCT_MODULE_MAPPING[productBase],
  );
}

/**
 * Gets all product friendlyIds with their suffixes for a specific company
 */
function getProductFriendlyIds(company: CompanyArg): string[] {
  const companySuffixes = PRODUCT_FRIENDLY_ID_SUFFIXES[company];
  return Object.entries(companySuffixes).map(
    ([base, suffix]) => `${base}-${suffix}`,
  );
}

// Parse company argument
const VALID_COMPANIES = ['grab', 'grab-test'] as const;
type CompanyArg = (typeof VALID_COMPANIES)[number];

function parseCompanyArg(): CompanyArg {
  const companyArg = process.argv.find((arg) => arg.startsWith('--company='));

  if (!companyArg) {
    console.error('Error: --company argument is required');
    console.error('Usage: npx tsx script.ts --company=grab|grab-test');
    process.exit(1);
  }

  const value = companyArg.split('=')[1] as CompanyArg;

  if (!VALID_COMPANIES.includes(value)) {
    console.error(
      `Error: Invalid company "${value}". Must be one of: ${VALID_COMPANIES.join(', ')}`,
    );
    process.exit(1);
  }

  return value;
}

const companyArg = parseCompanyArg();
const TARGET_COMPANY_ID =
  companyArg === 'grab' ? GRAB_COMPANY_ID : GRAB_TEST_COMPANY_ID;

// Grab-specific scorecard mapping by module
// Returns company-specific friendlyId to match scorecards seeder
function selectScorecardFriendlyId(
  moduleFriendlyId: string,
  company: CompanyArg,
): string {
  // grab-test uses original IDs, grab uses new IDs
  const meddpiccId = company === 'grab' ? 'A7X9K2' : 'QHGanM';
  const mexMeddpiccId = company === 'grab' ? 'B8Y4M5' : 'XUDE4A';

  switch (moduleFriendlyId) {
    case 'discovery-call-meddpicc':
    case 'deal-closure':
      return `grab-meddpicc-assessment-${meddpiccId}`;
    case 'grab-mex':
      return `grab-mex-partial-meddpicc-assessment-${mexMeddpiccId}`;
    default:
      return `grab-meddpicc-assessment-${meddpiccId}`;
  }
}

export async function seedGrabScenarios() {
  await connect(process.env.DATABASE_URL!);
  console.log(
    `[Grab Scenarios] Connected to MongoDB for company: ${companyArg}`,
  );

  try {
    const companyObjectId = new Types.ObjectId(TARGET_COMPANY_ID);

    // Fetch modules and products for Grab company by specific friendlyIds
    const moduleFriendlyIds = getModuleFriendlyIds();
    const productFriendlyIds = getProductFriendlyIds(companyArg);

    // Pre-fetch all required data upfront to avoid session timeout
    const [modules, products, allPersonas, allScorecards] = await Promise.all([
      Module.find({
        company: companyObjectId,
        friendlyId: { $in: moduleFriendlyIds },
      })
        .select('_id friendlyId title')
        .lean(),
      SalesProduct.find({
        company: companyObjectId,
        friendlyId: { $in: productFriendlyIds },
      })
        .select('_id friendlyId')
        .lean(),
      Persona.find({
        company: companyObjectId,
      })
        .select('_id friendlyId name details localizations')
        .lean(),
      Scorecard.find({
        company: companyObjectId,
      })
        .select('_id friendlyId')
        .lean(),
    ]);

    console.log(`[Grab Scenarios] Fetched data:
  - Modules: ${modules.length} (expected: ${moduleFriendlyIds.length})
  - Products: ${products.length} (expected: ${productFriendlyIds.length})
  - Personas: ${allPersonas.length}
  - Scorecards: ${allScorecards.length}`);

    // Create lookup maps for O(1) access
    // Use name as key since personas no longer have hardcoded _id values
    const personaByName = new Map(allPersonas.map((p) => [p.name, p]));
    const scorecardByFriendlyId = new Map(
      allScorecards.map((s) => [s.friendlyId, s]),
    );

    // Pre-load all translations
    const translations = {
      en: loadTranslations('en'),
      id: loadTranslations('id'),
      ms: loadTranslations('ms'),
      th: loadTranslations('th'),
      tl: loadTranslations('tl'),
      vi: loadTranslations('vi'),
      ko: loadTranslations('ko'),
    };

    // Build all bulk operations
    const bulkOps: any[] = [];

    // Create module lookup by friendlyId (modules don't have suffixes)
    const moduleByFriendlyId = new Map(modules.map((m) => [m.friendlyId, m]));

    for (const product of products) {
      const productBaseFriendlyId = getProductBaseFriendlyId(
        product.friendlyId,
      );
      const validModules = PRODUCT_MODULE_MAPPING[productBaseFriendlyId] || [];

      if (validModules.length === 0) {
        console.log(
          `[Grab Scenarios] ⚠ Skipping: No module mapping for product="${productBaseFriendlyId}"`,
        );
        continue;
      }

      for (const moduleFriendlyId of validModules) {
        const module = moduleByFriendlyId.get(moduleFriendlyId);

        if (!module) {
          console.log(
            `[Grab Scenarios] ⚠ Skipping: Module "${moduleFriendlyId}" not found in database for product="${productBaseFriendlyId}"`,
          );
          continue;
        }

        const personasForCombo = getPersonas(
          'en',
          TARGET_COMPANY_ID,
          moduleFriendlyId,
          productBaseFriendlyId,
        );

        if (!Array.isArray(personasForCombo) || personasForCombo.length === 0) {
          console.log(
            `[Grab Scenarios] ⚠ Skipping: No personas configured for module="${moduleFriendlyId}" + product="${productBaseFriendlyId}"`,
          );
          continue;
        }

        // Get scorecard from pre-fetched map
        const scorecardFriendlyId = selectScorecardFriendlyId(
          moduleFriendlyId,
          companyArg,
        );
        const scorecardDoc = scorecardByFriendlyId.get(scorecardFriendlyId);

        if (!scorecardDoc) {
          console.warn(
            `[Grab Scenarios] ⚠ Skipping: Scorecard "${scorecardFriendlyId}" not found for module="${moduleFriendlyId}" + product="${productBaseFriendlyId}"`,
          );
          continue;
        }

        // Build sales goal text from translations
        const getSalesGoal = (lang: keyof typeof translations) => {
          const t = translations[lang];
          const desc =
            t?.common.goals[moduleFriendlyId] || t?.common.goals['default'];
          return desc ? `${desc}.` : '';
        };

        for (const personaLite of personasForCombo) {
          // Get persona from pre-fetched map using name (since _id is auto-generated)
          const personaDoc = personaByName.get(personaLite.name);

          if (!personaDoc) {
            console.warn(
              `[Grab Scenarios] ⚠ Skipping: Persona name="${personaLite.name}" not found in database`,
            );
            continue;
          }

          // salesGoal = module title + "with" + persona name
          const enSalesGoal = `${(module as any).title} with ${personaDoc.name}`;

          // Get persona salesDescription for each language
          const enPersonaSalesDescription =
            (personaDoc as any).details?.salesDescription || '';
          const idPersonaSalesDescription =
            (personaDoc as any).localizations?.id?.details?.salesDescription ||
            '';
          const msPersonaSalesDescription =
            (personaDoc as any).localizations?.ms?.details?.salesDescription ||
            '';
          const thPersonaSalesDescription =
            (personaDoc as any).localizations?.th?.details?.salesDescription ||
            '';
          const tlPersonaSalesDescription =
            (personaDoc as any).localizations?.tl?.details?.salesDescription ||
            '';
          const viPersonaSalesDescription =
            (personaDoc as any).localizations?.vi?.details?.salesDescription ||
            '';
          const koPersonaSalesDescription =
            (personaDoc as any).localizations?.ko?.details?.salesDescription ||
            '';

          // salesDescription = persona.salesDescription + goal text
          const enSalesDescription =
            `${enPersonaSalesDescription} ${getSalesGoal('en')}`.trim();

          // Build localizations with salesDescription (persona salesDescription + translated goal text)
          const locs: Record<string, any> = {};
          const idSalesDescription =
            `${idPersonaSalesDescription} ${getSalesGoal('id')}`.trim();
          const msSalesDescription =
            `${msPersonaSalesDescription} ${getSalesGoal('ms')}`.trim();
          const thSalesDescription =
            `${thPersonaSalesDescription} ${getSalesGoal('th')}`.trim();
          const tlSalesDescription =
            `${tlPersonaSalesDescription} ${getSalesGoal('tl')}`.trim();
          const viSalesDescription =
            `${viPersonaSalesDescription} ${getSalesGoal('vi')}`.trim();
          const koSalesDescription =
            `${koPersonaSalesDescription} ${getSalesGoal('ko')}`.trim();

          if (idSalesDescription)
            locs['id'] = {
              salesDescription: idSalesDescription,
              salesGoal: enSalesGoal,
            };
          if (msSalesDescription)
            locs['ms'] = {
              salesDescription: msSalesDescription,
              salesGoal: enSalesGoal,
            };
          if (thSalesDescription)
            locs['th'] = {
              salesDescription: thSalesDescription,
              salesGoal: enSalesGoal,
            };
          if (tlSalesDescription)
            locs['tl'] = {
              salesDescription: tlSalesDescription,
              salesGoal: enSalesGoal,
            };
          if (viSalesDescription)
            locs['vi'] = {
              salesDescription: viSalesDescription,
              salesGoal: enSalesGoal,
            };
          if (koSalesDescription)
            locs['ko'] = {
              salesDescription: koSalesDescription,
              salesGoal: enSalesGoal,
            };

          const prompt = getRegularCallPrompt(
            personaLite as any,
            { ...product, friendlyId: productBaseFriendlyId } as any,
            '',
            'en',
            moduleFriendlyId as CallType,
            'regular',
            moduleFriendlyId,
            true,
          );

          // Add to bulk operations
          bulkOps.push({
            updateOne: {
              filter: {
                company: companyObjectId,
                module: (module as any)._id,
                product: (product as any)._id,
                persona: (personaDoc as any)._id,
              },
              update: {
                $setOnInsert: {
                  company: companyObjectId,
                  module: (module as any)._id,
                  product: (product as any)._id,
                  persona: (personaDoc as any)._id,
                },
                $set: {
                  scorecard: (scorecardDoc as any)._id,
                  scenarioDetails: {
                    salesGoal: enSalesGoal,
                    salesDescription: enSalesDescription,
                  },
                  localizations: locs,
                  voicePrompt: prompt,
                  isActive: true,
                  isSeeded: true,
                },
              },
              upsert: true,
            },
          });
        }

        console.log(
          `[Grab Scenarios] ✓ Prepared: module="${moduleFriendlyId}" + product="${productBaseFriendlyId}" → ${personasForCombo.length} scenarios`,
        );
      }
    }

    // Execute bulk write in batches to avoid memory issues
    const BATCH_SIZE = 100;
    let totalUpserts = 0;

    if (bulkOps.length === 0) {
      console.log(
        '[Grab Scenarios] ⚠ No scenarios to seed. Check module/product/persona configurations.',
      );
      return;
    }

    const totalBatches = Math.ceil(bulkOps.length / BATCH_SIZE);
    console.log(
      `[Grab Scenarios] Starting bulk write: ${bulkOps.length} operations in ${totalBatches} batches`,
    );

    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const result = await Scenario.bulkWrite(batch, { ordered: false });
      totalUpserts += result.upsertedCount;
      console.log(
        `[Grab Scenarios] Batch ${batchNum}/${totalBatches}: ${result.upsertedCount} new, ${result.modifiedCount} updated`,
      );
    }

    console.log(`[Grab Scenarios] ✅ Seeding complete:
  - Company: ${companyArg} (${TARGET_COMPANY_ID})
  - Total operations: ${bulkOps.length}
  - New scenarios created: ${totalUpserts}
  - Existing scenarios updated: ${bulkOps.length - totalUpserts}`);
  } catch (error) {
    console.error('[Grab Scenarios] ❌ Error:', error);
    throw error;
  } finally {
    await disconnect();
    console.log('[Grab Scenarios] Disconnected from MongoDB');
  }
}

seedGrabScenarios()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
