import { ProductConfiguration } from './types.js';

/**
 * AIA Korea - Opening & Objection Call Configuration
 * Localized content for outbound telemarketing call scenario
 */
export const aiaKoOpeningObjectionCallConfiguration: ProductConfiguration = {
  base: {
    id: 'aia-ko-opening-objection-call',
    friendlyId: 'aia-ko-opening-objection-call',
    category: 'insurance',
  },

  localized: {
    // English
    en: {
      name: 'Opening & Objection Call',
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
    },

    // Korean (한국어)
    ko: {
      name: '도입 및 도입 반론 처리',
      keyFeatures: [
        '전문적인 인사 및 고지',
        '초기 반론 처리 기법',
        '니즈 탐색으로 자연스러운 전환',
        '상호작용적 대화 관리',
      ],
      featureHighlight: {
        title: '아웃바운드 콜 마스터리',
        description:
          '초기 고객 반론을 자연스럽게 처리하고 약속 설정을 위한 니즈 탐색으로 원활하게 전환합니다.',
      },
      evaluationFocus: [
        '필수 고지사항을 전문적으로 수행',
        '주저 없이 반론에 응대',
        '수신거부 요청을 올바르게 처리',
        '대화를 상호작용적이고 고객 친화적으로 유지',
      ],
    },
  },
};
