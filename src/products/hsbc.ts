import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

export const HSBC_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '671e80000000000000000000',
    friendlyId: 'hsbc-client-upgrade',
    name: 'HSBC Wealth introduction to ETB',
    productType: ProductType.OWN,
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
    modules: ['hsbc-client-upgrade'], // Restrict to specific module
    salesTarget: 'individual',
    titleBarHidden: true,
  },
  {
    _id: '671e80000000000000000001',
    friendlyId: 'hsbc-client-onboarding',
    name: 'HSBC Wealth introduction to NTB',
    productType: ProductType.OWN,
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
    modules: ['hsbc-client-onboarding'], // Restrict to specific module
    salesTarget: 'individual',
    titleBarHidden: true,
  },
];
