import { PersonaConfiguration } from '../types.js';
import { ELEVEN_LABS_AIA_KO_AIDA_VOICE_ID } from '../../../utils/constants.js';

/**
 * Lee Soon-young - Concerned Due to Medical History (유병이력 걱정형)
 * Housewife in their 60s, concerned about being declined due to medical history
 */
export const leeSoonYoungPersonaKo: PersonaConfiguration = {
  base: {
    id: '67a1234567890abcdef12346',
    friendlyId: 'lee-soon-young-medical-history-concern-aia-ko',
    name: 'Lee Soon-young',
    age: 60,
    image:
      'https://dmbxplgo7ci2f.cloudfront.net/682357a367e18980a534d57b/lee-soon-young-54d5864f.png',
    voiceId: ELEVEN_LABS_AIA_KO_AIDA_VOICE_ID,
    annualIncome: null, // 연금 수급 수준 / Pension payout level
    gender: 'female',
  },

  localized: {
    // English
    en: {
      occupation: 'Housewife',
      description:
        'A housewife in their 60s living on pension income. Understands the need for insurance from past experience but worries about being declined due to medical history and feels financial burden about additional insurance.',
      details: {
        location: 'N/A',
        education: 'N/A',
        occupation: 'Housewife',
        financialSituation: 'Feels financial burden about additional insurance',
        keyPriorities: [
          'Concerned about being declined due to medical history',
          'Financial burden of additional insurance premiums',
          'Verifies and compares information needed for decision-making',
        ],
        productKnowledge:
          'Owns a baseline level of insurance for the age group (e.g., indemnity/medical expenses, cancer, dementia level). Understands the necessity from past experience but has concerns about medical history affecting new applications.',
        mainObjection:
          "I'm worried they won't accept me because of my medical history.",
        salesDescription:
          "You'll be speaking with Lee Soon-young, 60, a housewife living on pension income. She understands insurance value from experience but is concerned about being declined due to medical history and the financial burden of additional premiums. Your goal is to address her concerns with empathy, provide detailed explanations with examples, and help her find affordable options that work with her medical situation.",
      },
      personalityDetails: {
        persona:
          "Cautious and doesn't decide immediately, verifies and compares information",
        communicationStyle: [
          'Prefer detailed explanations with specific examples',
          "Want high empathy and responsive handling of the areas they're concerned about",
        ],
        decisionMaking: [
          "Doesn't decide quickly",
          'Verifies and compares information needed for decision-making',
        ],
      },
    },

    // Korean
    ko: {
      name: '이순영',
      voiceId: ELEVEN_LABS_AIA_KO_AIDA_VOICE_ID,
      occupation: '가사',
      description:
        '연금 수급으로 생활하는 60대 가정주부입니다. 과거 경험으로 보험의 필요성은 체득했으나 유병이력으로 인한 가입 거부 우려와 추가 보험에 대한 금전적 부담감이 있습니다.',
      details: {
        location: 'N/A',
        education: 'N/A',
        occupation: '가사',
        financialSituation: '추가 보험에 대한 금전적인 부담감이 있음',
        keyPriorities: [
          '가입거부에 대한 우려',
          '추가 보험에 대한 금전적인 부담감',
          '의사결정에 필요한 정보들을 다양하게 확인하고 비교',
        ],
        productKnowledge:
          '기본 및 나이대에 필요할 수 있는 보험을 일정 수준 보유 (실손, 암, 치매 수준). 과거 경험으로 보험의 필요성은 이해하지만 유병이력으로 인한 가입 거부 우려가 있습니다.',
        mainObjection:
          '유병이력 때문에 가입이 거절되지 않을까 걱정됩니다.',
        salesDescription:
          '연금으로 생활하는 60세 가정주부 이순영님과 상담하시게 됩니다. 경험으로 보험 가치를 이해하지만 유병이력으로 인한 가입 거부와 추가 보험료 부담을 걱정하고 있습니다. 공감을 바탕으로 우려사항을 해소하고, 구체적인 예시로 상세히 설명하며, 건강 상태에 맞는 합리적인 옵션을 찾아드리는 것이 목표입니다.',
      },
      personalityDetails: {
        persona:
          '결정에 조심스러운 편으로 바로 결정을 잘 하지 않음, 정보들을 다양하게 확인하고 비교',
        communicationStyle: [
          '구체적인 설명과 예시 선호',
          '걱정되는 부분에 대한 높은 공감 및 응대 선호',
        ],
        decisionMaking: [
          '바로 결정을 잘 하지 않음',
          '의사결정에 필요한 정보들을 다양하게 확인하고 비교',
        ],
      },
    },
  },
};
