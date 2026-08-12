import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../env.js';
import { connect, disconnect } from 'mongoose';
import { LegacySalesProduct, SalesProduct } from '../models/SalesProduct.js';
import {
  ALL_SALES_PRODUCTS,
  ALL_PRODUCT_CONFIGURATIONS,
  COMPANY_PRODUCTS,
} from './salesProducts.js';
import { SalesProductDocument } from '../models/SalesProduct.js';
import {
  PRUDENTIAL_COMPANY_ID,
  GRAB_COMPANY_ID,
  MSIG_COMPANY_ID,
  MTL_COMPANY_ID,
  AXA_PH_COMPANY_ID,
  GREAT_EASTERN_COMPANY_ID,
} from '../utils/constants.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

// Helper function to determine company ID for a product
function getCompanyIdForProduct(
  product: LegacySalesProduct,
): string | undefined {
  // Check if product is in PRUDENTIAL products
  if (
    COMPANY_PRODUCTS.PRUDENTIAL.some((p) => p.friendlyId === product.friendlyId)
  ) {
    return PRUDENTIAL_COMPANY_ID;
  }

  // Check if product is in GRAB products
  if (COMPANY_PRODUCTS.GRAB.some((p) => p.friendlyId === product.friendlyId)) {
    return GRAB_COMPANY_ID;
  }

  // Check if product is in MSIG products
  if (COMPANY_PRODUCTS.MSIG.some((p) => p.friendlyId === product.friendlyId)) {
    return MSIG_COMPANY_ID;
  }

  // Check if product is in MTL products
  if (COMPANY_PRODUCTS.MTL.some((p) => p.friendlyId === product.friendlyId)) {
    return MTL_COMPANY_ID;
  }

  // Check if product is in AXA-PH products
  if (
    COMPANY_PRODUCTS.AXA_PH?.some((p) => p.friendlyId === product.friendlyId)
  ) {
    return AXA_PH_COMPANY_ID;
  }

  // Check if product is in Great Eastern products
  if (
    COMPANY_PRODUCTS.GREAT_EASTERN?.some(
      (p) => p.friendlyId === product.friendlyId,
    )
  ) {
    return GREAT_EASTERN_COMPANY_ID;
  }

  // Default products have no company (global)
  return undefined;
}

export async function seedSalesProducts() {
  await connect(process.env.DATABASE_URL!);

  try {
    // Create a map of configurations by friendlyId for easy lookup
    const configMap = new Map(
      ALL_PRODUCT_CONFIGURATIONS.map((config) => [
        config.base.friendlyId,
        config,
      ]),
    );

    // Prepare operations to upsert sales products with merged localizations
    const operations = ALL_SALES_PRODUCTS.map((product) => {
      const config = configMap.get(product.friendlyId);

      // Build localizations from configuration
      const localizations: SalesProductDocument['localizations'] = {};

      if (config) {
        Object.entries(config.localized).forEach(([lang, localizedProduct]) => {
          if (localizedProduct) {
            localizations[lang] = {
              name: localizedProduct.name,
              description: '', // Can be set if you have descriptions
              keyFeatures: localizedProduct.keyFeatures,
              featureHighlight: localizedProduct.featureHighlight,
              evaluationFocus: localizedProduct.evaluationFocus,
              callCriteria: localizedProduct.callCriteria,
            };
          }
        });
      }

      const { en, ...rest } = localizations;

      // Determine company for this product
      const companyId = getCompanyIdForProduct(product);

      return {
        updateOne: {
          filter: { friendlyId: product.friendlyId },
          update: {
            $set: {
              friendlyId: product.friendlyId,
              name: product.name,
              knowledgePrompt: product.knowledgePrompt,
              productType: product.productType,
              keyFeatures: product.keyFeatures,
              featureHighlight: product.featureHighlight,
              evaluationFocus: product.evaluationFocus,
              callCriteria: en?.callCriteria,
              company: companyId,
              localizations: rest,
              salesTarget: 'individual',
            },
          },
          upsert: true,
        },
      };
    });

    const result = await SalesProduct.bulkWrite(operations, { ordered: false });
    console.log('Sales products seeding completed:', {
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      matched: result.matchedCount,
    });
  } catch (error) {
    console.error('Error seeding sales products:', error);
  } finally {
    await disconnect();
  }
}

void seedSalesProducts();
