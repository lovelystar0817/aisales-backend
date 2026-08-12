import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../../env.js';
import { connect, disconnect, Types } from 'mongoose';
import {
  SalesProduct,
  SalesProductDocument,
} from '../../models/SalesProduct.js';
import { GRAB_SALES_PRODUCTS } from '../../products/grab.js';
import {
  GRAB_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
} from '../../utils/constants.js';

// Import Grab-specific product configurations
import { grabTransportSolutionsConfiguration } from '../../products/grabTransportSolutions.js';
import { grabForBusinessConfiguration } from '../../products/grabForBusiness.js';
import { grabMEXCampaignSolutionsConfiguration } from '../../products/grabMEXCampaignSolutions.js';
import { ProductConfiguration } from '../../products/types.js';
import { PRODUCT_FRIENDLY_ID_SUFFIXES } from './constants.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

// Grab-specific product configurations
const GRAB_PRODUCT_CONFIGURATIONS: ProductConfiguration[] = [
  grabTransportSolutionsConfiguration,
  grabForBusinessConfiguration,
  grabMEXCampaignSolutionsConfiguration,
];

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

export async function seedGrabSalesProducts() {
  await connect(process.env.DATABASE_URL!);

  try {
    // Create a map of configurations by friendlyId for easy lookup
    const configMap = new Map(
      GRAB_PRODUCT_CONFIGURATIONS.map((config) => [
        config.base.friendlyId,
        config,
      ]),
    );

    // Prepare operations to upsert sales products with merged localizations
    const operations = GRAB_SALES_PRODUCTS.map((product) => {
      const config = configMap.get(product.friendlyId);

      // Build localizations from configuration
      const localizations: SalesProductDocument['localizations'] = {};

      if (config) {
        Object.entries(config.localized).forEach(([lang, localizedProduct]) => {
          if (localizedProduct) {
            localizations[lang] = {
              name: localizedProduct.name,
              description: '',
              keyFeatures: localizedProduct.keyFeatures,
              featureHighlight: localizedProduct.featureHighlight,
              evaluationFocus: localizedProduct.evaluationFocus,
              callCriteria: localizedProduct.callCriteria,
            };
          }
        });
      }

      const { en, ...rest } = localizations;

      // Generate stable friendlyId with pre-generated nanoid suffix (company-specific)
      const companySuffixes = PRODUCT_FRIENDLY_ID_SUFFIXES[companyArg];
      const suffix = companySuffixes?.[product.friendlyId];
      const stableFriendlyId = suffix
        ? `${product.friendlyId}-${suffix}`
        : product.friendlyId;

      return {
        updateOne: {
          filter: {
            friendlyId: stableFriendlyId,
            company: new Types.ObjectId(TARGET_COMPANY_ID),
          },
          update: {
            $setOnInsert: {
              _id: new Types.ObjectId(),
              friendlyId: stableFriendlyId,
            },
            $set: {
              name: config?.localized.en.name ?? product.name,
              knowledgePrompt: product.knowledgePrompt,
              productType: product.productType,
              keyFeatures: product.keyFeatures,
              featureHighlight: product.featureHighlight,
              evaluationFocus: product.evaluationFocus,
              callCriteria: en?.callCriteria,
              company: new Types.ObjectId(TARGET_COMPANY_ID),
              localizations: rest,
              salesTarget: 'individual',
              hasCompetitiveIntelligence:
                product.friendlyId === 'grab-for-business',
            },
          },
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      const result = await SalesProduct.bulkWrite(operations, {
        ordered: false,
      });
      console.log('Grab sales products seeding completed:', {
        company: companyArg,
        companyId: TARGET_COMPANY_ID,
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        matched: result.matchedCount,
      });
    } else {
      console.log('No Grab sales product operations to execute.');
    }
  } catch (error) {
    console.error('Error seeding Grab sales products:', error);
  } finally {
    await disconnect();
  }
}

void seedGrabSalesProducts();
