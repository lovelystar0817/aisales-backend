import { LegacySalesProduct } from '../models/SalesProduct.js';
import { DEFAULT_SALES_PRODUCTS } from '../products/default.js';
import { GRAB_SALES_PRODUCTS } from '../products/grab.js';
import {
  PLT_SALES_PRODUCTS,
  PRUDENTIAL_ID_SALES_PRODUCTS,
  PRUDENTIAL_SALES_PRODUCTS,
  PRUDENTIAL_TW_SALES_PRODUCTS,
} from '../products/prudential.js';
import { MSIG_SALES_PRODUCTS } from '../products/msig.js';
import { getLocalizedProduct } from '../products/common.js';
import {
  GRAB_COMPANY_ID,
  GRAB_LMS_COMPANY_ID,
  PRUDENTIAL_COMPANY_ID,
  PRUDENTIAL_ID_COMPANY_ID,
  MSIG_COMPANY_ID,
  MANULIFE_COMPANY_ID,
  PLT_COMPANY_ID,
  BBL_COMPANY_ID,
  HSBC_COMPANY_ID,
  HSBC_YUE_COMPANY_ID,
  DEFAULT_LANGUAGE,
  MTL_COMPANY_ID,
  AXA_PH_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
  PRUDENTIAL_TW_COMPANY_ID,
  KT_AXA_COMPANY_ID,
  ALIBABA_COMPANY_ID,
  PRUDENTIAL_PH_COMPANY_ID,
  AIA_KO_COMPANY_ID,
  GREAT_EASTERN_COMPANY_ID,
  SCB_DEMO_COMPANY_ID,
  LALAMOVE_COMPANY_ID,
} from './constants.js';
import { MANULIFE_SALES_PRODUCTS } from '../products/manulife.js';
import { BBL_SALES_PRODUCTS } from '../products/bbl.js';
import { HSBC_SALES_PRODUCTS } from '../products/hsbc.js';
import { MTL_SALES_PRODUCTS } from '../products/mtl.js';
import { AXA_PH_SALES_PRODUCTS } from '../products/axa-ph.js';
import { KT_AXA_SALES_PRODUCTS } from '../products/kt-axa.js';
import { ALIBABA_SALES_PRODUCTS } from '../products/alibaba.js';
import { PRUDENTIAL_PH_SALES_PRODUCTS } from '../products/prudential-ph.js';
import { AIA_KO_SALES_PRODUCTS } from '../products/aia-ko.js';
import { GREAT_EASTERN_SALES_PRODUCTS } from '../products/great-eastern.js';
import { SCB_DEMO_SALES_PRODUCTS } from '../products/scb-demo.js';
import { LALAMOVE_SALES_PRODUCTS } from '../products/lalamove.js';

/**
 * Apply localization to an array of products
 * @param products Array of product documents to localize
 * @param languageCode Target language code
 * @param companyId Company ID for conditional features
 * @returns Array of localized product documents
 */
const localizeProducts = (
  products: LegacySalesProduct[],
  languageCode: string,
  companyId?: string,
): Omit<LegacySalesProduct, 'callCriteria'>[] => {
  return products.map((product) => {
    // Try to get localized product from co-located structure
    const localizedProductData = getLocalizedProduct(
      product.friendlyId,
      languageCode,
      companyId,
    );

    if (localizedProductData) {
      // Merge the base product with localized data
      return {
        ...product,
        name: localizedProductData.name,
        keyFeatures: localizedProductData.keyFeatures,
        featureHighlight: localizedProductData.featureHighlight,
        evaluationFocus: localizedProductData.evaluationFocus,
        markdown: localizedProductData.markdown ?? product.markdown,
        callCriteria:
          localizedProductData.callCriteria ??
          product.callCriteria?.[languageCode ?? DEFAULT_LANGUAGE],
      };
    }

    // If no localized data found, resolve language-specific fields from the product itself
    const langCallCriteria = product.callCriteria?.[languageCode];
    if (langCallCriteria) {
      return {
        ...product,
        markdown: langCallCriteria.markdown ?? product.markdown,
        callCriteria: langCallCriteria,
      };
    }

    // Fallback to default language callCriteria
    const defaultCallCriteria =
      product.callCriteria?.[DEFAULT_LANGUAGE] ?? product.callCriteria;
    return {
      ...product,
      callCriteria: defaultCallCriteria,
    };
  });
};

export const getProducts = (
  companyId: string | undefined,
  languageCode: string = 'en',
): LegacySalesProduct[] => {
  let products: LegacySalesProduct[];

  switch (companyId) {
    case PRUDENTIAL_COMPANY_ID:
      products = PRUDENTIAL_SALES_PRODUCTS;
      break;
    case PRUDENTIAL_TW_COMPANY_ID:
      products = PRUDENTIAL_TW_SALES_PRODUCTS;
      break;
    case PLT_COMPANY_ID:
      products = PLT_SALES_PRODUCTS;
      break;
    case PRUDENTIAL_ID_COMPANY_ID:
      products = PRUDENTIAL_ID_SALES_PRODUCTS;
      break;
    case GRAB_COMPANY_ID:
    case GRAB_LMS_COMPANY_ID:
    case GRAB_TEST_COMPANY_ID:
      products = GRAB_SALES_PRODUCTS;
      break;
    case MSIG_COMPANY_ID:
      products = MSIG_SALES_PRODUCTS;
      break;
    case MANULIFE_COMPANY_ID:
      products = MANULIFE_SALES_PRODUCTS;
      break;
    case BBL_COMPANY_ID:
      products = BBL_SALES_PRODUCTS;
      break;
    case HSBC_COMPANY_ID:
    case HSBC_YUE_COMPANY_ID:
      products = HSBC_SALES_PRODUCTS;
      break;
    case MTL_COMPANY_ID:
      products = MTL_SALES_PRODUCTS;
      break;
    case AXA_PH_COMPANY_ID:
      products = AXA_PH_SALES_PRODUCTS;
      break;
    case KT_AXA_COMPANY_ID:
      products = KT_AXA_SALES_PRODUCTS;
      break;
    case ALIBABA_COMPANY_ID:
      products = ALIBABA_SALES_PRODUCTS;
      break;
    case PRUDENTIAL_PH_COMPANY_ID:
      products = PRUDENTIAL_PH_SALES_PRODUCTS;
      break;
    case AIA_KO_COMPANY_ID:
      products = AIA_KO_SALES_PRODUCTS;
      break;
    case GREAT_EASTERN_COMPANY_ID:
      products = GREAT_EASTERN_SALES_PRODUCTS;
      break;
    case SCB_DEMO_COMPANY_ID:
      products = SCB_DEMO_SALES_PRODUCTS;
      break;
    case LALAMOVE_COMPANY_ID:
      products = LALAMOVE_SALES_PRODUCTS;
      break;
    default:
      products = DEFAULT_SALES_PRODUCTS;
      break;
  }

  return localizeProducts(products, languageCode, companyId);
};

export const getProductsForModule = (
  companyId: string | undefined,
  moduleId: string,
  languageCode: string = 'en',
): LegacySalesProduct[] => {
  // Get all products for the company
  const allProducts = getProducts(companyId, languageCode);

  // Filter products that are either:
  // 1. Global products (no modules specified)
  // 2. Products specifically linked to this module
  const filteredProducts = allProducts.filter((product) => {
    // If no modules specified, it's a global product
    if (!product.modules || product.modules.length === 0) {
      return true;
    }

    // If product has module restrictions, check if this module is included
    return product.modules.includes(moduleId);
  });

  return filteredProducts;
};

export const getProductById = (
  companyId: string | undefined,
  productId: string,
  languageCode: string = 'en',
): LegacySalesProduct => {
  console.log('getProductById', {
    companyId,
    productId,
    languageCode,
  });
  const products = getProducts(companyId, languageCode);
  const product = products.find(
    (p) => p._id?.toString() === productId || p.friendlyId === productId,
  );

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  return product;
};

export const getProductByFriendlyId = (
  companyId: string | undefined,
  productId: string,
  languageCode: string = 'en',
): LegacySalesProduct => {
  const products = getProducts(companyId, languageCode);
  const product = products.find((p) => p.friendlyId === productId);

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  return product;
};
