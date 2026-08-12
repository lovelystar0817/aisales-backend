import {
  LegacySalesProduct,
  ProductType,
  SalesProductDocument,
} from '../models/SalesProduct.js';

export const BBL_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '671e60000000000000000010',
    friendlyId: 'bbl-client-upgrade',
    name: 'Wealth Services Upgrade',
    productType: ProductType.OWN,
    salesTarget: 'individual',
    keyFeatures: [
      'Premium wealth management services',
      'Personalized investment strategies',
      'Dedicated relationship manager',
      'Enhanced financial planning tools',
    ],
    featureHighlight: {
      title: 'Exclusive Wealth Services',
      description:
        'Upgrade to our comprehensive wealth management platform with personalized investment strategies and dedicated support.',
    },
    evaluationFocus: [
      "Understanding client's current financial position",
      'Identifying upgrade opportunities',
      'Presenting value proposition clearly',
      'Handling upgrade objections effectively',
    ],
    modules: ['bbl-client-upgrade'], // Restrict to specific module
  },
  {
    _id: '671d60000000000000000011',
    friendlyId: 'bbl-goal-planning',
    name: 'Financial Goal Planning Services',
    productType: ProductType.OWN,
    salesTarget: 'individual',
    keyFeatures: [
      'Comprehensive goal assessment',
      'Tailored financial strategies',
      'Progress tracking and monitoring',
      'Regular plan adjustments',
    ],
    featureHighlight: {
      title: 'Strategic Goal Planning',
      description:
        'Work with our experts to define, size, and achieve your financial goals with personalized planning solutions.',
    },
    evaluationFocus: [
      'Identifying and clarifying client goals',
      'Quantifying financial requirements',
      'Presenting realistic timelines',
      'Demonstrating value of professional planning',
    ],
    modules: ['bbl-goal-planning'], // Restrict to specific module
  },
  {
    _id: '671d60000000000000000012',
    friendlyId: 'bbl-client-revival',
    name: 'Client Revival Services',
    productType: ProductType.OWN,
    salesTarget: 'individual',
    keyFeatures: [
      'Account reactivation support',
      'Updated market insights',
      'Renewed service offerings',
      'Enhanced client benefits',
    ],
    featureHighlight: {
      title: 'Renewed Partnership',
      description:
        'Reconnect with enhanced services and updated solutions designed to meet your evolving financial needs.',
    },
    evaluationFocus: [
      'Understanding reasons for inactivity',
      'Presenting new value propositions',
      'Rebuilding trust and confidence',
      'Securing commitment to re-engagement',
    ],
    modules: ['bbl-client-revival'], // Restrict to specific module
  },
  {
    _id: '671d60000000000000000013',
    friendlyId: 'bbl-portfolio-review',
    name: 'Portfolio Review Services',
    productType: ProductType.OWN,
    salesTarget: 'individual',
    keyFeatures: [
      'Comprehensive performance analysis',
      'Market impact assessment',
      'Portfolio rebalancing recommendations',
      'Risk-adjusted optimization strategies',
    ],
    featureHighlight: {
      title: 'Strategic Portfolio Review',
      description:
        'Optimize your investment portfolio with expert analysis, market insights, and tailored rebalancing solutions aligned to your goals.',
    },
    evaluationFocus: [
      'Reviewing portfolio performance effectively',
      'Linking recommendations to market conditions',
      'Identifying gaps and rebalancing opportunities',
      'Creating urgency for portfolio adjustments',
    ],
    modules: ['bbl-portfolio-review'], // Restrict to specific module
  },
];
