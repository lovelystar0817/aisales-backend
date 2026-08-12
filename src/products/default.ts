import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

/**
 * Default sales products for general use (mostly global)
 */
export const DEFAULT_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '671d60000000000000000000',
    friendlyId: 'all-products-exploratory',
    name: 'All Products (Exploratory)',
    // prompt:
    //   'You are an AI sales assistant helping with exploratory sales conversations',
    productType: ProductType.OWN,
    modules: ['cold-call', 'discovery'],
    salesTarget: 'individual',
    titleBarHidden: true,
    // No company specified = global product
  },
  {
    _id: '671d60000000000000000001',
    friendlyId: 'life-insurance',
    name: 'Life Insurance',
    // prompt: 'You are an AI sales assistant helping with life insurance sales',
    productType: ProductType.OWN,
    salesTarget: 'individual',
    modules: [
      'competitive-proposal',
      'objection-handling',
      'closing',
      'review-renewal',
    ],
    keyFeatures: [
      'Guaranteed death benefit protection for beneficiaries',
      'Flexible term and permanent life insurance options',
      'Accelerated underwriting with fast approval processes',
      'Living benefits for terminal illness and chronic conditions',
      'Cash value accumulation in permanent life policies',
      'Conversion options from term to permanent coverage',
      'Portable coverage independent of employment',
      'Digital application and policy management tools',
      'Compassionate claims support and beneficiary assistance',
    ],
    featureHighlight: {
      title: 'Complete Financial Protection with Modern Technology',
      description:
        'Our life insurance combines essential financial protection for your loved ones with cutting-edge technology for faster, easier coverage. From accelerated underwriting to living benefits, we provide comprehensive protection that adapts to your changing life needs.',
    },
    evaluationFocus: [
      'Death benefit amount based on income replacement needs',
      'Term vs. permanent life insurance options',
      'Cash value growth potential and investment features',
      'Conversion and future insurability options',
      'Premium affordability and payment flexibility',
      'Living benefits and accelerated death benefit provisions',
      'Insurance company financial strength ratings',
      'Digital tools and customer service quality',
    ],
  },
  {
    _id: '671e60000000000000000002',
    friendlyId: 'health-insurance',
    name: 'Health Insurance',
    // prompt: 'You are an AI sales assistant helping with health insurance sales',
    productType: ProductType.OWN,
    salesTarget: 'individual',
    modules: [
      'competitive-proposal',
      'objection-handling',
      'closing',
      'review-renewal',
    ],
    keyFeatures: [
      '100% preventive care coverage including annual check-ups and screenings',
      'Comprehensive mental health and behavioral health services',
      'Nationwide provider network with extensive hospital coverage',
      'Telehealth services and 24/7 nurse hotline support',
      'HSA-compatible options for tax-advantaged health savings',
      'Prescription drug coverage with preferred pharmacy networks',
      'Maternity and family planning services included',
      'Transparent pricing with cost-estimation tools',
      'Care coordination for chronic condition management',
    ],
    featureHighlight: {
      title: 'Complete Healthcare Protection with Preventive Care Focus',
      description:
        'Our comprehensive health insurance plan emphasizes preventive care to keep you healthy while providing full protection against unexpected medical costs. With nationwide network access, telehealth services, and transparent pricing, you get peace of mind for all your healthcare needs.',
    },
    evaluationFocus: [
      'Preventive care benefits and wellness program opportunities',
      'Provider network adequacy and accessibility in your area',
      'Prescription drug formulary coverage for current medications',
      'Mental health and behavioral health service availability',
      'Total cost analysis including premiums, deductibles, and co-pays',
      'HSA eligibility and health savings account benefits',
      'Telehealth and digital health service capabilities',
      'Care coordination services for ongoing health management',
    ],
  },
  {
    _id: '671d60000000000000000003',
    friendlyId: 'wealth-insurance',
    name: 'Wealth Insurance',
    // prompt: 'You are an AI sales assistant helping with wealth insurance sales',
    productType: ProductType.OWN,
    salesTarget: 'individual',
    modules: [
      'competitive-proposal',
      'objection-handling',
      'closing',
      'review-renewal',
    ],
    keyFeatures: [
      'High-value asset protection and wealth preservation strategies',
      'Estate planning integration with tax-efficient structures',
      'Investment-linked policies with diversified portfolio options',
      'Flexible premium payment schedules and benefit adjustments',
      'Global coverage for international wealth management needs',
      'Trust and estate planning coordination services',
      'Tax-advantaged wealth transfer to beneficiaries',
      'Concierge-level customer service and dedicated advisors',
      'Alternative investment options within policy structures',
    ],
    featureHighlight: {
      title: 'Sophisticated Wealth Protection with Tax-Efficient Strategies',
      description:
        'Our wealth insurance solutions provide comprehensive protection for high-net-worth individuals, combining sophisticated investment strategies with estate planning benefits. Designed for wealth preservation and efficient transfer to future generations while providing flexible access to policy values.',
    },
    evaluationFocus: [
      'Asset protection needs and wealth preservation goals',
      'Estate planning objectives and tax minimization strategies',
      'Investment performance and portfolio diversification options',
      'Liquidity needs and policy loan accessibility',
      'International coverage and cross-border considerations',
      'Trust structures and beneficiary planning requirements',
      'Tax implications and advantages of policy structures',
      'Professional advisory support and wealth management services',
    ],
  },
  // {
  //   _id: new Date().getTime().toString(), // Mock ObjectId
  //   friendlyId: 'something-else',
  //   name: 'Something Else',
  //   prompt: 'You are an AI sales assistant helping with general product sales',
  //   productType: ProductType.OWN,
  //   // No modules specified = global product
  // },
];
