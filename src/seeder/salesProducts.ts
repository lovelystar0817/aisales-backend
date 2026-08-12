import { LegacySalesProduct } from '../models/SalesProduct.js';
import { ProductConfiguration } from '../products/types.js';
import { DEFAULT_SALES_PRODUCTS } from '../products/default.js';
import {
  PLT_SALES_PRODUCTS,
  PRUDENTIAL_SALES_PRODUCTS,
  PRUDENTIAL_TW_SALES_PRODUCTS,
} from '../products/prudential.js';
import { GRAB_SALES_PRODUCTS } from '../products/grab.js';
import { MSIG_SALES_PRODUCTS } from '../products/msig.js';
import { MTL_SALES_PRODUCTS } from '../products/mtl.js';
import { AXA_PH_SALES_PRODUCTS } from '../products/axa-ph.js';
import { KT_AXA_SALES_PRODUCTS } from '../products/kt-axa.js';
import { HSBC_SALES_PRODUCTS } from '../products/hsbc.js';
import { GREAT_EASTERN_SALES_PRODUCTS } from '../products/great-eastern.js';

// Import product configurations with localized content
import { hsbcYueClientOnboardingConfiguration } from '../products/hsbc-yue.js';
import { allProductsExploratoryConfiguration } from '../products/allProductsExploratory.js';
import { dentiPlusConfiguration } from '../products/dentiPlusConfig.js';
import { parecoveryPlusConfiguration } from '../products/parecoveryPlusConfig.js';
import { travelEasyConfiguration } from '../products/travelEasyConfig.js';
import { wealthInsuranceConfiguration } from '../products/wealthInsurance.js';
import { prushieldConfiguration } from '../products/prushield.js';
import { prulifetimeIncomePlusConfiguration } from '../products/prulifetimeIncomePlus.js';
import { lifeInsuranceConfiguration } from '../products/lifeInsurance.js';
import { healthInsuranceConfiguration } from '../products/healthInsurance.js';
import { grabTransportSolutionsConfiguration } from '../products/grabTransportSolutions.js';
import { grabForBusinessConfiguration } from '../products/grabForBusiness.js';
import { muangThaiULPlusConfiguration } from '../products/muangThaiULPlus.js';
import { grabMEXCampaignSolutionsConfiguration } from '../products/grabMEXCampaignSolutions.js';

/**
 * Product configurations with localized content
 * These contain the localized versions for seeding
 */
export const ALL_PRODUCT_CONFIGURATIONS: ProductConfiguration[] = [
  allProductsExploratoryConfiguration,
  dentiPlusConfiguration,
  parecoveryPlusConfiguration,
  travelEasyConfiguration,
  wealthInsuranceConfiguration,
  prushieldConfiguration,
  prulifetimeIncomePlusConfiguration,
  lifeInsuranceConfiguration,
  healthInsuranceConfiguration,
  grabTransportSolutionsConfiguration,
  grabForBusinessConfiguration,
  muangThaiULPlusConfiguration,
  grabMEXCampaignSolutionsConfiguration,
  hsbcYueClientOnboardingConfiguration,
];

/**
 * All available sales products across all companies
 * This aggregates products from different company-specific files
 */
export const ALL_SALES_PRODUCTS: LegacySalesProduct[] = [
  ...DEFAULT_SALES_PRODUCTS,
  ...PRUDENTIAL_SALES_PRODUCTS,
  ...GRAB_SALES_PRODUCTS,
  ...MSIG_SALES_PRODUCTS,
  ...MTL_SALES_PRODUCTS,
  ...AXA_PH_SALES_PRODUCTS,
  ...KT_AXA_SALES_PRODUCTS,
  ...GREAT_EASTERN_SALES_PRODUCTS,
];

/**
 * Company-specific product groupings for easy reference
 */
export const COMPANY_PRODUCTS = {
  DEFAULT: DEFAULT_SALES_PRODUCTS,
  PRUDENTIAL: PRUDENTIAL_SALES_PRODUCTS,
  GRAB: GRAB_SALES_PRODUCTS,
  MSIG: MSIG_SALES_PRODUCTS,
  MTL: MTL_SALES_PRODUCTS,
  AXA_PH: AXA_PH_SALES_PRODUCTS,
  KT_AXA: KT_AXA_SALES_PRODUCTS,
  GREAT_EASTERN: GREAT_EASTERN_SALES_PRODUCTS,
} as const;

/**
 * Get products by company ID
 */
export function getProductsByCompany(companyId?: string) {
  switch (companyId) {
    case 'prudential':
      return PRUDENTIAL_SALES_PRODUCTS;
    case 'prudential-tw':
      return PRUDENTIAL_TW_SALES_PRODUCTS;
    case 'plt':
      return PLT_SALES_PRODUCTS;
    case 'grab':
    case 'grab-lms':
      return GRAB_SALES_PRODUCTS;
    case 'msig':
      return MSIG_SALES_PRODUCTS;
    case 'mtl':
      return MTL_SALES_PRODUCTS;
    case 'axa-ph':
      return AXA_PH_SALES_PRODUCTS;
    case 'kt-axa':
      return KT_AXA_SALES_PRODUCTS;
    case 'hsbc':
    case 'hsbc-yue':
      return HSBC_SALES_PRODUCTS;
    case 'great-eastern':
      return GREAT_EASTERN_SALES_PRODUCTS;
    default:
      return DEFAULT_SALES_PRODUCTS;
  }
}

/**
 * Get product by friendly ID across all companies
 */
export function getProductById(friendlyId: string) {
  return ALL_SALES_PRODUCTS.find(
    (product) => product.friendlyId === friendlyId,
  );
}
