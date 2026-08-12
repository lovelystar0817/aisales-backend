/**
 * AIA KO End-to-End Outbound Call objections for randomization
 *
 * Objections are categorized by call stage and theme category.
 * Category-based deduplication prevents thematically similar objections
 * from appearing in the same session.
 *
 * 3 objections are randomly selected per call.
 */

export type AiaKoObjectionCategory =
  | 'time'
  | 'coverage'
  | 'money'
  | 'disinterest'
  | 'privacy'
  | 'health'
  | 'end-call';

export interface AiaKoObjection {
  ko: string;
  en: string;
  stage: 'opening' | 'product-explanation' | 'closing' | 'situation-specific';
  subType: string;
  category: AiaKoObjectionCategory;
}

export const AIA_KO_E2E_OBJECTIONS: AiaKoObjection[] = [
  // ── Opening (Intro → health/needs check) ──
  {
    stage: 'opening',
    subType: 'immediate-shutdown',
    category: 'disinterest',
    ko: '관심없어요. 다시 전화하지 마세요. 제 정보를 어떻게 알았어요?',
    en: "I'm not interested. Don't call me again. How did you get my information?",
  },
  {
    stage: 'opening',
    subType: 'busy-avoidance',
    category: 'time',
    ko: '지금 바빠요. 지금은 시간이 없어요. 운전 중이에요.',
    en: "I'm busy right now. I don't have time right now. I'm driving.",
  },
  {
    stage: 'opening',
    subType: 'indifferent-no-interest',
    category: 'disinterest',
    ko: '필요 없어요. 안 할래요. 괜찮아요.',
    en: "I don't need it. No thanks, I'm not doing this.",
  },

  // ── Product explanation (Benefit pitch) ──
  {
    stage: 'product-explanation',
    subType: 'health-confidence',
    category: 'health',
    ko: '가족력이 없어서 필요 없어요. 건강 관리를 잘해서 괜찮아요. 건강보험이 필요 없어요.',
    en: "I don't have any family history, so I don't need this. I take good care of my health, so I don't need insurance.",
  },
  {
    stage: 'product-explanation',
    subType: 'family-dependent',
    category: 'coverage',
    ko: '자식이 다 해줘요. 배우자와 상의해야 돼요. 집안에 보험 설계사가 있어요.',
    en: 'My children handle all of this. I need to discuss it with my spouse. We have an insurance agent in the family.',
  },
  {
    stage: 'product-explanation',
    subType: 'no-additional-coverage',
    category: 'coverage',
    ko: '이미 보험이 있어요. 최근에 업그레이드 했어요.',
    en: 'I already have insurance. I recently upgraded my coverage.',
  },
  {
    stage: 'product-explanation',
    subType: 'send-materials-deflection',
    category: 'disinterest',
    ko: '자료 먼저 보내주세요. 서류 먼저 보내주세요. 카톡으로 보내주세요.',
    en: 'Please send the documents first. Send it to me on KakaoTalk first.',
  },
  {
    stage: 'product-explanation',
    subType: 'question-led-interest',
    category: 'coverage',
    ko: '어디 보험사 이에요? 갱신형이에요? 순수보장형이에요?',
    en: 'Which insurance company is this? Is it renewable (renewal-type)? Is it pure protection (no-savings) coverage?',
  },

  // ── Closing (Attempt to proceed) ──
  {
    stage: 'closing',
    subType: 'decision-avoidance',
    category: 'time',
    ko: '다음에 다시 전화주세요. 지금은 시간이 없어요. 좀 더 생각해볼게요. 다른 사람과 상의해볼게요. 서류를 먼저 보내주세요.',
    en: "Please call me again later. I don't have time right now. Let me think about it. I need to discuss it with someone. Please send me the documents first.",
  },

  // ── Situation-specific ──
  {
    stage: 'situation-specific',
    subType: 'medical-history-ineligibility',
    category: 'health',
    ko: '현재 암 치료 중이에요. OOO 병력으로 최근에 입원했었어요. OOO 수술을 했어요.',
    en: "I'm currently undergoing cancer treatment. I was recently hospitalized due to a history of OOO. I had OOO surgery.",
  },
  {
    stage: 'situation-specific',
    subType: 'icas-pre-screening-refusal',
    category: 'privacy',
    ko: '확인할 필요 없어요. 주민등록번호 알려주기 싫어요.',
    en: "There's no need to check. I don't want to share my resident registration number.",
  },
  {
    stage: 'situation-specific',
    subType: 'follow-up-prospect-callback',
    category: 'money',
    ko: '서류 아직 안 봤어요. 가족이 하지 말래요. 보험료가 부담돼요.',
    en: "I haven't looked at the documents yet. My family told me not to do it. The premium feels too expensive.",
  },
  {
    stage: 'situation-specific',
    subType: 'cancellation-withdrawal-defense',
    category: 'money',
    ko: '자녀가 하지 말래요. 배우자가 반대해요. 보험료를 감당할 수 없어요. 같은 보장이 이미 있어서 필요 없어요.',
    en: "My children told me not to do it. My spouse is against it. I can't afford the premium. I already have the same coverage, so I don't need it.",
  },
];

/**
 * Map persona mainObjection themes to categories to avoid.
 * This prevents picking objections that overlap with the persona's own mainObjection.
 */
const PERSONA_MAIN_OBJECTION_CATEGORIES: Record<
  string,
  AiaKoObjectionCategory[]
> = {
  // Kim Woo-Jung: "haven't felt the need, basic coverage enough" → coverage + disinterest
  'kim-woo-jung-early-insurance-interest-aia-ko': ['coverage', 'disinterest'],
  // Lee Soon-Young: "medical history worry + afford premiums" → money + health
  'lee-soon-young-medical-history-concern-aia-ko': ['money', 'health'],
  // Choi Sun-ho: "don't need more insurance, children handle it" → coverage
  'choi-sun-ho-unaware-necessity-aia-ko': ['coverage'],
};

/**
 * Randomly select 3 objections for an AIA KO End-to-End Outbound Call session.
 *
 * Strategy:
 * - Exclude objections whose category overlaps with the persona's mainObjection
 * - No two objections from the same category
 * - "end-call" category objection only appears as the last objection if selected
 * - Try to pick from different stages when possible
 *
 * Returns a flat array where:
 * - index 0 = primary objection (used as mainObjection for display)
 * - indices 1-2 = additional objections
 */
export function selectRandomAiaKoObjections(
  language: 'en' | 'ko' = 'ko',
  personaFriendlyId?: string,
): string[] {
  const NUM_OBJECTIONS = 3;
  const excludeCategories =
    PERSONA_MAIN_OBJECTION_CATEGORIES[personaFriendlyId || ''] || [];

  // Filter out objections whose category overlaps with persona's mainObjection
  const eligible = AIA_KO_E2E_OBJECTIONS.filter(
    (o) => !excludeCategories.includes(o.category),
  );

  // Shuffle eligible objections
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);

  const selected: AiaKoObjection[] = [];
  const usedCategories = new Set<AiaKoObjectionCategory>();

  // First pass: pick one from each unique category (skip end-call for first two positions)
  for (const obj of shuffled) {
    if (selected.length >= NUM_OBJECTIONS) break;
    if (usedCategories.has(obj.category)) continue;

    // end-call category only in the last position
    if (obj.category === 'end-call' && selected.length < NUM_OBJECTIONS - 1)
      continue;

    selected.push(obj);
    usedCategories.add(obj.category);
  }

  // Second pass: fill remaining if needed (allow same category as last resort)
  if (selected.length < NUM_OBJECTIONS) {
    const remaining = shuffled.filter((obj) => !selected.includes(obj));
    for (const obj of remaining) {
      if (selected.length >= NUM_OBJECTIONS) break;
      selected.push(obj);
    }
  }

  // Final shuffle so primary objection is random
  selected.sort(() => Math.random() - 0.5);

  return selected.map((obj) => obj[language] || obj.ko);
}
