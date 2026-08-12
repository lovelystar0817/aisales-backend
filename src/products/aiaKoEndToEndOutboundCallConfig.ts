import { ProductConfiguration } from './types.js';

/**
 * AIA Korea - End-To-End Outbound Call Configuration
 * Localized content for the full consultation flow scenario
 */
export const aiaKoEndToEndOutboundCallConfiguration: ProductConfiguration = {
  base: {
    id: 'aia-ko-end-to-end-outbound-call',
    friendlyId: 'aia-ko-end-to-end-outbound-call',
    category: 'insurance',
  },

  localized: {
    // English
    en: {
      name: 'Outbound Call (End-to-End)',
      keyFeatures: [
        'Professional opening with mandatory disclosures and early objection handling',
        'Comprehensive needs and health exploration across 5 key areas',
        'FAB method for advanced treatment plan value proposition',
        'Multi-attempt objection handling with varied persuasion techniques',
        'Confident closing using buying signal recognition',
      ],
      featureHighlight: {
        title: 'Full Consultation Mastery',
        description:
          'Practice the complete outbound telesales call — from the first greeting through needs exploration, product pitch, objection handling, and closing — in a single end-to-end session.',
      },
      evaluationFocus: [
        'Deliver professional opening with all required disclosures in correct order',
        'Probe all 5 health areas and create genuine urgency with personalized statistics',
        'Use FAB method to translate advanced treatment features into personal value',
        'Handle objections with empathy, 5+ attempts, and varied persuasion techniques',
        'Recognize buying signals and close with confidence and conviction',
      ],
    },

    // Korean (한국어)
    ko: {
      name: '아웃바운드 콜 (엔드-투-엔드)',
      keyFeatures: [
        '필수 고지 및 초기 반론 처리를 포함한 전문적인 도입',
        '5가지 핵심 영역을 포괄하는 니즈/건강 탐색',
        '선진치료플랜 가치 제안을 위한 FAB 기법',
        '다양한 설득화법을 활용한 5회 이상 반론극복 시도',
        '구매신호 인식을 통한 확신 있는 클로징',
      ],
      featureHighlight: {
        title: '엔드-투-엔드 상담 마스터리',
        description:
          '첫 인사부터 니즈 탐색, 상품 설명, 반론 극복, 클로징까지 아웃바운드 텔레세일즈 전체 흐름을 단일 세션으로 연습합니다.',
      },
      evaluationFocus: [
        '필수 고지사항을 올바른 순서로 전달하는 전문적인 도입 실행',
        '5가지 건강 영역 탐색 및 개인화된 통계로 진정한 긴급성 조성',
        'FAB 기법을 활용한 선진치료 기능의 개인적 가치 전환',
        '공감, 5회 이상 시도, 다양한 설득화법으로 반론 처리',
        '구매신호 인식 및 확신 있는 클로징',
      ],
    },
  },
};
