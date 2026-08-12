import { ProductConfiguration } from './types.js';

/**
 * AIA Korea - Product Pitch Configuration
 * Localized content for product presentation scenario
 */
export const aiaKoProductPitchConfiguration: ProductConfiguration = {
  base: {
    id: 'aia-ko-product-pitch',
    friendlyId: 'aia-ko-product-pitch',
    category: 'insurance',
  },

  localized: {
    // English
    en: {
      name: 'Product Pitch',
      keyFeatures: [
        'Need stimulation using statistics, news articles, and age/medical-history-based risk awareness',
        'Empathy → Need Stimulation → Benefit Delivery sales cycle',
        'Buying signal identification and closing attempts',
        'Advanced objection handling techniques',
        'Multiple persuasion attempts for client engagement',
      ],
      featureHighlight: {
        title: 'Value Proposition Mastery',
        description:
          'Based on needs and health exploration, explain both the necessity and benefits of the "Advanced Treatment Plan," and persuade the client using the Empathy → Need Stimulation → Benefit Delivery cycle.',
      },
      evaluationFocus: [
        'Stimulate need awareness using statistics/news and age/medical-history-based risk',
        'Execute Empathy → Need Stimulation → Benefit Delivery cycle approximately 3 times',
        'Identify buying signals and attempt appropriate closing',
        'Handle objections with confidence, empathy, and multiple persuasion attempts',
        'Explain coverage details accurately without misrepresentation',
      ],
    },

    // Korean (한국어)
    ko: {
      name: '상품설명/혜택제시',
      keyFeatures: [
        '통계·뉴스 및 연령·병력 기반 필요성 자극',
        '공감 → 필요성 자극 → 상품 혜택 전달 세일즈 사이클',
        '구매 신호 포착 및 클로징 시도',
        '고급 반론 처리 기법',
        '고객 참여를 위한 다양한 설득 시도',
      ],
      featureHighlight: {
        title: '가치 제안 마스터리',
        description:
          '니즈/건강탐색을 바탕으로 "선진치료플랜"의 필요성과 함께 혜택을 설명하고 공감 → 필요성 자극 → 혜택 전달 사이클을 사용하여 고객을 단계별로 설득해 나갑니다.',
      },
      evaluationFocus: [
        '통계·뉴스 및 연령·병력 기반 필요성 자극 수행',
        '공감 → 필요성 자극 → 혜택 전달 사이클을 약 3회 실행',
        '구매 신호 포착 및 적절한 클로징 시도',
        '확신, 공감, 다양한 설득 시도로 반론 처리',
        '보장내용 정확하게 설명 (오안내 없음)',
      ],
    },
  },
};
