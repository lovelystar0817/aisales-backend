import { Types } from 'mongoose';
import { getCompetitiveIntelligence as getLocalizedCI } from '../competitive-intelligence/common.js';
import {
  GRAB_COMPANY_ID,
  GRAB_LMS_COMPANY_ID,
  PRUDENTIAL_COMPANY_ID,
  PRUDENTIAL_ID_COMPANY_ID,
  PLT_COMPANY_ID,
  MSIG_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
  PRUDENTIAL_TW_COMPANY_ID,
} from './constants.js';
import { SalesProductCompetitor } from '../models/SalesProductCompetitor.js';
import { SalesProduct } from '../models/SalesProduct.js';

// Export types
export type {
  Competitor,
  CompetitiveIntelligence,
} from '../competitive-intelligence/types.js';

// Import the type for return type annotation
import type { CompetitiveIntelligence } from '../competitive-intelligence/types.js';

/**
 * Get competitive intelligence data using the new co-located structure with product-specific support
 * Also checks database for dynamic product competitive intelligence
 * @param companyId Company ID to get CI data for
 * @param productId Product ID (friendlyId or ObjectId) for product-specific competitive intelligence
 * @param languageCode Target language code
 * @returns Competitive intelligence data or null if not available
 */
export function getCompetitiveIntelligence(
  companyId?: string,
  productId?: string,
  languageCode: string = 'en',
): CompetitiveIntelligence | null {
  // Map company IDs to our co-located structure
  let mappedCompanyId: string | undefined;

  switch (companyId) {
    case PRUDENTIAL_COMPANY_ID:
    case PRUDENTIAL_TW_COMPANY_ID:
    case PLT_COMPANY_ID:
    case PRUDENTIAL_ID_COMPANY_ID:
      mappedCompanyId = 'prudential';
      break;
    case GRAB_COMPANY_ID:
    case GRAB_LMS_COMPANY_ID:
    case GRAB_TEST_COMPANY_ID:
      mappedCompanyId = 'grab';
      break;
    case MSIG_COMPANY_ID:
      mappedCompanyId = 'msig';
      break;
    default:
      // No mapping found - return null instead of falling back to default
      mappedCompanyId = undefined;
  }

  // Don't fall back to defaults - only return CI if found for specific company/product
  try {
    return getLocalizedCI(mappedCompanyId, languageCode, productId);
  } catch (error) {
    // Return null instead of throwing or falling back to defaults
    return null;
  }
}

/**
 * Get competitive intelligence data for a specific product, checking database first for dynamic products
 * @param companyId Company ID to get CI data for
 * @param productIdOrObjectId Product ID (friendlyId or ObjectId) for product-specific competitive intelligence
 * @param languageCode Target language code
 * @returns Promise with competitive intelligence data or null if not found
 */
export async function getCompetitiveIntelligenceForProduct(
  companyId?: string,
  productIdOrObjectId?: string | Types.ObjectId,
  languageCode: string = 'en',
): Promise<CompetitiveIntelligence | null> {
  if (!productIdOrObjectId) {
    return null;
  }

  try {
    // First, try to find the product by ObjectId or friendlyId
    let productObjectId: Types.ObjectId | null = null;

    if (Types.ObjectId.isValid(productIdOrObjectId)) {
      // It's already an ObjectId
      productObjectId = new Types.ObjectId(productIdOrObjectId);
    } else {
      // It's a friendlyId, look up the product
      const product = await SalesProduct.findOne({
        friendlyId: productIdOrObjectId,
        ...(companyId ? { company: companyId } : {}),
      }).select('_id');

      if (product) {
        productObjectId = product._id;
      }
    }

    // If we have a product ObjectId, check for competitive intelligence in the database
    if (productObjectId) {
      const competitorDoc = await SalesProductCompetitor.findOne({
        product: productObjectId,
        ...(companyId ? { company: companyId } : {}),
      });

      if (competitorDoc) {
        // Get localized competitors or fall back to default
        let competitors = competitorDoc.competitors;

        if (
          competitorDoc.localizations &&
          competitorDoc.localizations[languageCode]
        ) {
          competitors = competitorDoc.localizations[languageCode].competitors;
        }

        // Transform database format to match expected type
        return {
          competitors: competitors.map((c) => ({
            name: c.name,
            company: c.company,
            type: c.type,
            keyFeatures: c.keyFeatures,
            strengths: c.strengths,
            limitations: c.limitations,
            positioningStrategy: c.positioningStrategy,
          })),
        };
      }
    }

    // No database CI found, return null (caller can fall back to hardcoded)
    return null;
  } catch (error) {
    console.error(
      'Error fetching competitive intelligence from database:',
      error,
    );
    return null;
  }
}
