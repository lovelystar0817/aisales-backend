import { ProductConfiguration } from './types.js';

/**
 * HSBC Cantonese - Client Onboarding Product
 * Wealth management introduction for new-to-bank clients
 */
export const hsbcYueClientOnboardingConfiguration: ProductConfiguration = {
  base: {
    id: 'hsbc-client-onboarding',
    friendlyId: 'hsbc-client-onboarding',
    category: 'business-services',
  },

  localized: {
    // English
    en: {
      name: 'HSBC Wealth Introduction to NTB',
      keyFeatures: [
        'Comprehensive Goal Assessment',
        'Tailored Financial Strategies',
        'Progress Tracking and Monitoring',
        'Regular Plan Adjustments',
      ],
      featureHighlight: {
        title: 'Strategic Goal Planning',
        description:
          'Work with our experts to define, quantify, and achieve your financial objectives with customized planning solutions.',
      },
      evaluationFocus: [
        'Identify and clarify customer goals',
        'Quantify financial needs',
        'Demonstrate realistic timelines',
        'Showcase value of professional planning',
      ],
    },

    // Cantonese (廣東話)
    yue: {
      name: 'HSBC 財富管理新客戶介紹',
      keyFeatures: [
        '全面目標評估',
        '度身訂造財務策略',
        '進度追蹤同監察',
        '定期計劃調整',
      ],
      featureHighlight: {
        title: '策略性目標規劃',
        description:
          '同我哋嘅專家合作，定義、量化同達成你嘅財務目標，提供度身訂造嘅規劃方案。',
      },
      evaluationFocus: [
        '識別同釐清客戶目標',
        '量化財務需求',
        '展示切合實際嘅時間表',
        '展現專業規劃嘅價值',
      ],
    },
  },
};
