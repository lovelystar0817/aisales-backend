import { shouldUsePrudentialData } from '../utils/prudential-standing.js';
import { allProductsExploratoryConfiguration } from './allProductsExploratory.js';
import { dentiPlusConfiguration } from './dentiPlusConfig.js';
import { bblPortfolioReviewConfiguration } from './bblPortfolioReviewConfig.js';
import { hsbcPortfolioReviewConfiguration } from './hsbcPortfolioReviewConfig.js';
import { convertProductToMarkdown } from '../utils/product-markdown.js';
import { grabForBusinessConfiguration } from './grabForBusiness.js';
import { grabMEXCampaignSolutionsConfiguration } from './grabMEXCampaignSolutions.js';
import { healthInsuranceConfiguration } from './healthInsurance.js';
import { lifeInsuranceConfiguration } from './lifeInsurance.js';
import { parecoveryPlusConfiguration } from './parecoveryPlusConfig.js';
import { getPrudentialColdCallCriteria } from './prudential.js';
import { prulifetimeIncomePlusConfiguration } from './prulifetimeIncomePlus.js';
import { pruvantageAssureIIConfiguration } from './pruvantageAssureII.js';
import { prushieldConfiguration } from './prushield.js';
import { pruwealthPlusConfiguration } from './pruwealthPlus.js';
import { LocalizedProductData, ProductConfiguration } from './types.js';
import { wealthInsuranceConfiguration } from './wealthInsurance.js';
import { muangThaiULPlusConfiguration } from './muangThaiULPlus.js';
import { ktAxaAgentRecruitmentConfiguration } from './ktAxaAgentRecruitment.js';
import { ktAxaAdvisorConfiguration } from './ktAxaAdvisor.js';
import { ktAxaAdvisorXConfiguration } from './ktAxaAdvisorX.js';
import { ktAxaLifeReadyCI123Configuration } from './ktAxaLifeReadyCI123.js';
import { ktAxaWealthPlusReadyConfiguration } from './ktAxaWealthPlusReady.js';
import { hsbcYueClientOnboardingConfiguration } from './hsbc-yue.js';
import { travelEasyConfiguration } from './travelEasyConfig.js';
import { aiaKoOpeningObjectionCallConfiguration } from './aiaKoOpeningObjectionCallConfig.js';
import { lalamoveDriverRegistrationConfiguration } from './lalamoveDriverRegistration.js';
import { aiaKoProductPitchConfiguration } from './aiaKoProductPitchConfig.js';
import { aiaKoEndToEndOutboundCallConfiguration } from './aiaKoEndToEndOutboundCallConfig.js';
import { manulifeGoalReadyConfiguration } from './manulifeGoalReadyConfig.js';

// Define valid product registry keys for type safety
export const VALID_PRODUCT_KEYS = [
  'grab-for-business',
  'life-insurance',
  'health-insurance',
  'wealth-insurance',
  // 'grab-transport-solutions',
  'prushield',
  'prulifetime-income-plus',
  'pruvantage-assure-ii',
  'pruwealth-plus',
  'all-products-exploratory',
  'parecovery-plus',
  'dentiplus',
  'bbl-portfolio-review',
  'hsbc-portfolio-review',
  'hsbc-client-onboarding',
  'grab-mex-campaigns',
  'mtl-ul-plus-sales',
  'kt-axa-agent-recruitment',
  'kt-axa-advisor',
  'kt-axa-advisor-x',
  'kt-axa-life-ready-ci123',
  'kt-axa-wealthplus-ready',
  'travel-easy',
  'aia-ko-opening-objection-call',
  'lalamove-driver-registration',
  'aia-ko-product-pitch',
  'aia-ko-end-to-end-outbound-call',
  'manulife-goalready',
] as const;

export type ValidProductKey = (typeof VALID_PRODUCT_KEYS)[number];

// Registry of products with co-located translations and type safety
const localizedProducts: Record<ValidProductKey, ProductConfiguration> = {
  'grab-for-business': grabForBusinessConfiguration,
  'life-insurance': lifeInsuranceConfiguration,
  'health-insurance': healthInsuranceConfiguration,
  'wealth-insurance': wealthInsuranceConfiguration,
  // 'grab-transport-solutions': grabTransportSolutionsConfiguration,
  prushield: prushieldConfiguration,
  'prulifetime-income-plus': prulifetimeIncomePlusConfiguration,
  'pruvantage-assure-ii': pruvantageAssureIIConfiguration,
  'pruwealth-plus': pruwealthPlusConfiguration,
  'all-products-exploratory': allProductsExploratoryConfiguration,
  'parecovery-plus': parecoveryPlusConfiguration,
  dentiplus: dentiPlusConfiguration,
  'bbl-portfolio-review': bblPortfolioReviewConfiguration,
  'hsbc-portfolio-review': hsbcPortfolioReviewConfiguration,
  'hsbc-client-onboarding': hsbcYueClientOnboardingConfiguration,
  'grab-mex-campaigns': grabMEXCampaignSolutionsConfiguration,
  'mtl-ul-plus-sales': muangThaiULPlusConfiguration,
  'kt-axa-agent-recruitment': ktAxaAgentRecruitmentConfiguration,
  'kt-axa-advisor': ktAxaAdvisorConfiguration,
  'kt-axa-advisor-x': ktAxaAdvisorXConfiguration,
  'kt-axa-life-ready-ci123': ktAxaLifeReadyCI123Configuration,
  'kt-axa-wealthplus-ready': ktAxaWealthPlusReadyConfiguration,
  'travel-easy': travelEasyConfiguration,
  'aia-ko-opening-objection-call': aiaKoOpeningObjectionCallConfiguration,
  'lalamove-driver-registration': lalamoveDriverRegistrationConfiguration,
  'aia-ko-product-pitch': aiaKoProductPitchConfiguration,
  'aia-ko-end-to-end-outbound-call': aiaKoEndToEndOutboundCallConfiguration,
  'manulife-goalready': manulifeGoalReadyConfiguration,
  // Add other products as they get migrated to the new structure
};

/**
 * Get localized product from the co-located structure
 * @param productId The product ID to get data for
 * @param languageCode The language code (e.g., 'en', 'id', 'ms')
 * @param companyId Optional company ID to determine if Prudential-specific features should be included
 * @returns Localized product data or null if not available
 */
export const getLocalizedProduct = (
  productId: string,
  languageCode: string,
  companyId?: string,
): LocalizedProductData | null => {
  const productConfig = localizedProducts[productId as ValidProductKey];
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

    const result = {
      ...productConfig.base,
      ...fallbackData,
    };

    // For all-products-exploratory, add Prudential-specific callCriteria if company is Prudential
    if (
      productId === 'all-products-exploratory' &&
      companyId &&
      shouldUsePrudentialData(companyId)
    ) {
      result.callCriteria = getPrudentialColdCallCriteria(languageCode);
    }

    // Auto-generate markdown if not provided
    if (!result.markdown && (result.keyFeatures || result.featureHighlight)) {
      result.markdown = convertProductToMarkdown(result);
    }

    return result;
  }

  const result = {
    ...productConfig.base,
    ...localizedData,
  };

  // For all-products-exploratory, add Prudential-specific callCriteria if company is Prudential
  if (
    productId === 'all-products-exploratory' &&
    companyId &&
    shouldUsePrudentialData(companyId)
  ) {
    result.callCriteria = getPrudentialColdCallCriteria(languageCode);
  }

  // Auto-generate markdown if not provided
  if (!result.markdown && (result.keyFeatures || result.featureHighlight)) {
    result.markdown = convertProductToMarkdown(result);
  }

  return result;
};

/**
 * Get all available product IDs from the co-located registry
 * @returns Array of product IDs
 */
export const getAvailableProductIds = (): string[] => {
  return Object.keys(localizedProducts);
};

/**
 * Get all available language codes for a specific product
 * @param productId The product ID to check
 * @returns Array of language codes available for this product
 */
export const getAvailableLanguagesForProduct = (
  productId: string,
): string[] => {
  const productConfig = localizedProducts[productId as ValidProductKey];
  if (!productConfig) {
    return [];
  }

  return Object.keys(productConfig.localized);
};

/**
 * Check if a product exists in the co-located registry
 * @param productId The product ID to check
 * @returns True if product exists, false otherwise
 */
export const productExists = (productId: string): boolean => {
  return productId in localizedProducts;
};

/**
 * Get all available products for a specific language
 * @param languageCode The language code (e.g., 'en', 'id', 'ms')
 * @param companyId Optional company ID to determine if Prudential-specific features should be included
 * @returns Array of localized product data
 */
export const getAllLocalizedProducts = (
  languageCode: string,
  companyId?: string,
): LocalizedProductData[] => {
  return Object.values(localizedProducts)
    .map((config) =>
      getLocalizedProduct(config.base.id, languageCode, companyId),
    )
    .filter((product): product is LocalizedProductData => product !== null);
};

/**
 * Get products by category for a specific language
 * @param category The product category to filter by
 * @param languageCode The language code (e.g., 'en', 'id', 'ms')
 * @param companyId Optional company ID to determine if Prudential-specific features should be included
 * @returns Array of localized product data in the specified category
 */
export const getProductsByCategory = (
  category: string,
  languageCode: string,
  companyId?: string,
): LocalizedProductData[] => {
  return getAllLocalizedProducts(languageCode, companyId).filter(
    (product) => product.category === category,
  );
};
