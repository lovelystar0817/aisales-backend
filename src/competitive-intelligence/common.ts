import {
  defaultCompetitiveIntelligenceConfiguration,
  grabCompetitiveIntelligenceConfiguration,
  prudentialCompetitiveIntelligenceConfiguration,
  msigCompetitiveIntelligenceConfiguration,
} from './configs/index.js';
import {
  CompetitiveIntelligence,
  CompetitiveIntelligenceConfiguration,
  LocalizedCompetitiveIntelligenceData,
  ProductCompetitiveIntelligenceConfiguration,
} from './types.js';

// Define valid registry keys for type safety
export const VALID_COMPANY_CI_KEYS = ['default'] as const;
export const VALID_PRODUCT_CI_KEYS = ['msig', 'grab', 'prudential'] as const;

export type ValidCompanyCIKey = (typeof VALID_COMPANY_CI_KEYS)[number];
export type ValidProductCIKey = (typeof VALID_PRODUCT_CI_KEYS)[number];

// Registry of competitive intelligence configurations with type safety
const competitiveIntelligenceRegistry: Record<
  ValidCompanyCIKey,
  CompetitiveIntelligenceConfiguration
> = {
  default: defaultCompetitiveIntelligenceConfiguration,
};

// Registry of product-specific competitive intelligence configurations with type safety
const productCompetitiveIntelligenceRegistry: Record<
  ValidProductCIKey,
  ProductCompetitiveIntelligenceConfiguration
> = {
  grab: grabCompetitiveIntelligenceConfiguration,
  msig: msigCompetitiveIntelligenceConfiguration,
  prudential: prudentialCompetitiveIntelligenceConfiguration,
};

/**
 * Get localized competitive intelligence from the co-located structure
 * @param companyId The company ID to get CI data for
 * @param languageCode The language code (e.g., 'en', 'id', 'ms')
 * @returns Localized competitive intelligence data or null if not available
 */
export const getLocalizedCompetitiveIntelligence = (
  companyId: string,
  languageCode: string,
): LocalizedCompetitiveIntelligenceData | null => {
  // Use type guard to safely access registry
  if (!isValidCompanyCIKey(companyId)) {
    return null;
  }

  const ciConfig = competitiveIntelligenceRegistry[companyId];
  if (!ciConfig) {
    return null;
  }

  const localizedData = ciConfig.localized[languageCode];
  if (!localizedData) {
    // Fallback to English if requested language is not available
    const fallbackData = ciConfig.localized.en;
    if (!fallbackData) {
      return null;
    }

    return fallbackData;
  }

  return localizedData;
};

/**
 * Get all available company IDs for competitive intelligence
 * @returns Array of company IDs
 */
export const getAvailableCompetitiveIntelligenceIds = (): string[] => {
  return Object.keys(competitiveIntelligenceRegistry);
};

/**
 * Check if competitive intelligence exists for a company (unified check across both registries)
 * @param companyId The company ID to check
 * @returns Boolean indicating if CI exists
 */
export const competitiveIntelligenceExists = (companyId: string): boolean => {
  return isValidCompanyCIKey(companyId) || isValidProductCIKey(companyId);
};

/**
 * Type guard to check if a company ID is a valid company-level CI key
 */
export const isValidCompanyCIKey = (key: string): key is ValidCompanyCIKey => {
  return VALID_COMPANY_CI_KEYS.includes(key as ValidCompanyCIKey);
};

/**
 * Type guard to check if a company ID is a valid product-level CI key
 */
export const isValidProductCIKey = (key: string): key is ValidProductCIKey => {
  return VALID_PRODUCT_CI_KEYS.includes(key as ValidProductCIKey);
};

/**
 * Get localized competitive intelligence for a specific product
 * @param companyId The company ID to get CI data for
 * @param productId The product ID to get CI data for
 * @param languageCode The language code (e.g., 'en', 'id', 'ms')
 * @returns Localized competitive intelligence data or null if not available
 */
export const getLocalizedProductCompetitiveIntelligence = (
  companyId: string,
  productId: string,
  languageCode: string,
): LocalizedCompetitiveIntelligenceData | null => {
  // Use type guard to safely access registry
  if (!isValidProductCIKey(companyId)) {
    return null;
  }
  const productCiConfig = productCompetitiveIntelligenceRegistry[companyId];
  if (!productCiConfig) {
    return null;
  }

  const productConfig = productCiConfig.products[productId];
  if (!productConfig) {
    return null;
  }

  const localizedData = productConfig.localized[languageCode];
  if (!localizedData) {
    // Fallback to English if requested language is not available
    const fallbackData = productConfig.localized.en;
    if (!fallbackData) {
      return null;
    }

    return fallbackData;
  }

  return localizedData;
};

/**
 * Check if product-specific competitive intelligence exists for a company and product
 * @param companyId The company ID to check
 * @param productId The product ID to check
 * @returns Boolean indicating if product-specific CI exists
 */
export const productCompetitiveIntelligenceExists = (
  companyId: string,
  productId: string,
): boolean => {
  // Use type guard to safely check registry
  if (!isValidProductCIKey(companyId)) {
    return false;
  }
  const productCiConfig = productCompetitiveIntelligenceRegistry[companyId];
  return !!productCiConfig && productId in productCiConfig.products;
};

/**
 * Get competitive intelligence with product-specific lookups
 * @param companyId The company ID
 * @param languageCode The language code (falls back to 'en' if not found)
 * @param productId Optional product ID for product-specific competitive intelligence
 * @returns Competitive intelligence data or null if not available
 */
export const getCompetitiveIntelligence = (
  companyId?: string,
  languageCode: string = 'en',
  productId?: string,
): CompetitiveIntelligence | null => {
  // If productId is provided and product-specific CI exists, use it
  if (
    companyId &&
    productId &&
    productCompetitiveIntelligenceExists(companyId, productId)
  ) {
    const productData = getLocalizedProductCompetitiveIntelligence(
      companyId,
      productId,
      languageCode,
    );
    if (productData) {
      return productData;
    }
  }

  // Check if company-level CI exists
  if (companyId && isValidCompanyCIKey(companyId)) {
    const localizedData = getLocalizedCompetitiveIntelligence(
      companyId,
      languageCode,
    );
    if (localizedData) {
      return localizedData;
    }
  }

  // No competitive intelligence available for this company/product
  return null;
};
