import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

/**
 * AIA Korea sales products
 */
export const AIA_KO_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '694b10000000000000000000',
    friendlyId: 'aia-ko-opening-objection-call',
    name: 'Opening & Objection Call',
    productType: ProductType.OWN,
    modules: ['aia-ko-opening-objection-call'], // Specifically for this module
    keyFeatures: [
      'Professional greeting and disclosure',
      'Early objection handling techniques',
      'Natural transition to needs exploration',
      'Interactive conversation management',
    ],
    featureHighlight: {
      title: 'Outbound Call Mastery',
      description:
        'Handle early customer objections naturally and transition smoothly into needs exploration for appointment setting.',
    },
    evaluationFocus: [
      'Execute required disclosures professionally',
      'Respond to objections without hesitation',
      'Handle do-not-call requests correctly',
      'Keep conversation interactive and customer-friendly',
    ],
    salesTarget: 'individual',
    titleBarHidden: true,
  },
  {
    _id: '694b10000000000000000001',
    friendlyId: 'aia-ko-product-pitch',
    name: 'Product Pitch',
    productType: ProductType.OWN,
    modules: ['aia-ko-product-pitch'], // Specifically for this module
    keyFeatures: [
      'FAB method for value proposition',
      'Needs-benefit linking',
      'Advanced treatment value explanation',
      'Coverage gap identification',
    ],
    featureHighlight: {
      title: 'Value Proposition Mastery',
      description:
        'Translate product features into compelling personal value while handling objections during the benefit presentation phase.',
    },
    evaluationFocus: [
      'Use FAB method to explain advanced treatment benefits',
      'Link product benefits to customer-stated needs',
      'Handle objections by type (health confidence, family-dependent, coverage blocks)',
      'Translate technical features into clear personal value',
    ],
    salesTarget: 'individual',
    titleBarHidden: true,
  },
  {
    _id: '694b10000000000000000002',
    friendlyId: 'aia-ko-end-to-end-outbound-call',
    name: 'Outbound Call (End-to-End)',
    productType: ProductType.OWN,
    modules: ['aia-ko-end-to-end-outbound-call'], // Specifically for this module
    keyFeatures: [
      'Full consultation flow from opening to closing',
      'Health and needs exploration across 5 key areas',
      'FAB method for advanced treatment value proposition',
      'Multi-attempt objection handling with persuasion variety',
      'Buying signal recognition and confident closing',
    ],
    featureHighlight: {
      title: 'Full Consultation Mastery',
      description:
        'Practice the complete outbound telesales call — from professional opening through needs exploration, product pitch, objection handling, and closing — in a single end-to-end session.',
    },
    evaluationFocus: [
      'Deliver all mandatory disclosures in correct order with confident opening',
      'Probe all 5 health areas and create urgency with personalized statistics',
      'Use FAB method to translate advanced treatment features into personal value',
      'Handle objections with empathy and 5+ varied persuasion attempts',
      'Recognize buying signals and close with conviction',
    ],
    salesTarget: 'individual',
    titleBarHidden: true,
  },
];
