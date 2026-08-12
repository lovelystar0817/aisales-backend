/**
 * Monthly budget ranges per persona per product for Prudential PH scenarios.
 * Used in fact-finding and closing-call voice prompts.
 */

const BUDGET_MAP: Record<string, Record<string, string>> = {
  // PRULink Assurance Account Plus
  'prulink-assurance-account-plus-ph': {
    'anna-surgeon-prudential-ph-closing-call': '₱15,000/month',
    'charlie-marketing-manager-prudential-ph-closing-call': '₱5,000-7,000/month',
    'john-creative-director-prudential-ph-closing-call': '₱2,500-5,000/month',
    'danny-retired-prudential-ph-closing-call': '₱7,000-10,000/month',
    'celia-ofw-nurse-prudential-ph-closing-call': '₱5,000-7,000/month',
  },
  // PRULink Elite Protector Series
  'prulink-elite-protector-ph': {
    'anna-surgeon-prudential-ph-closing-call': '₱10,000-15,000/month',
    'charlie-marketing-manager-prudential-ph-closing-call': '₱7,000-10,000/month',
    'john-creative-director-prudential-ph-closing-call': '₱7,000-10,000/month',
    'danny-retired-prudential-ph-closing-call': '₱10,000-15,000/month',
    'celia-ofw-nurse-prudential-ph-closing-call': '₱10,000-15,000/month',
  },
  // PRULove for Life
  'prulove-for-life-ph': {
    'anna-surgeon-prudential-ph-closing-call': '₱10,000-15,000/month',
    'charlie-marketing-manager-prudential-ph-closing-call': '₱5,000-7,000/month',
    'john-creative-director-prudential-ph-closing-call': '₱2,500-5,000/month',
    'danny-retired-prudential-ph-closing-call': '₱10,000-15,000/month',
    'celia-ofw-nurse-prudential-ph-closing-call': '₱5,000-7,000/month',
  },
  // PRULifetime Income
  'prulifetime-income-ph': {
    'anna-surgeon-prudential-ph-closing-call': '₱25,000-30,000/month',
    'charlie-marketing-manager-prudential-ph-closing-call': '₱10,000/month',
    'john-creative-director-prudential-ph-closing-call': '₱10,000/month',
    'danny-retired-prudential-ph-closing-call': '₱30,000-35,000/month',
    'celia-ofw-nurse-prudential-ph-closing-call': '₱10,000-15,000/month',
  },
};

/**
 * Get the monthly budget range for a given persona and product.
 * Returns undefined if no budget mapping exists.
 */
export const getPersonaProductBudget = (
  personaFriendlyId: string,
  productFriendlyId?: string,
): string | undefined => {
  if (!productFriendlyId) return undefined;
  const productBudgets = BUDGET_MAP[productFriendlyId];
  if (!productBudgets) return undefined;
  return productBudgets[personaFriendlyId];
};
