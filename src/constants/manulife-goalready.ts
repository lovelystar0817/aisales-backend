// src/constants/manulife-goalready.ts

export type GoalReadySectionKey =
  | 'softSkills'
  | 'productKnowledge'
  | 'knowledgeSkills';

export interface GoalReadySectionConfig {
  key: GoalReadySectionKey;
  label: string;
  localized: {
    en: string;
    tl: string;
  };
}

export const GOALREADY_SECTIONS: GoalReadySectionKey[] = [
  'softSkills',
  'productKnowledge',
  'knowledgeSkills',
];

export const GOALREADY_SECTION_ORDER: GoalReadySectionConfig[] = [
  {
    key: 'softSkills',
    label: 'Soft Skills',
    localized: {
      en: 'Soft Skills',
      tl: 'Mga Kasanayan sa Pakikipag-ugnayan',
    },
  },
  {
    key: 'productKnowledge',
    label: 'Product Knowledge',
    localized: {
      en: 'Product Knowledge',
      tl: 'Kaalaman sa Produkto',
    },
  },
  {
    key: 'knowledgeSkills',
    label: 'Sales & Negotiation Skills',
    localized: {
      en: 'Sales & Negotiation Skills',
      tl: 'Mga Kasanayan sa Pagbebenta at Negosasyon',
    },
  },
];

export function getGoalReadySectionLabel(
  sectionKey: GoalReadySectionKey,
  languageCode: string = 'en',
): string {
  const section = GOALREADY_SECTION_ORDER.find((s) => s.key === sectionKey);
  if (!section) return sectionKey;

  return (
    section.localized[languageCode as keyof typeof section.localized] ||
    section.localized.en
  );
}

export interface GoalReadyTierThreshold {
  minScore: number;
  name: string;
  localized: {
    en: string;
    tl: string;
  };
}

export const GOALREADY_TIER_THRESHOLDS: readonly GoalReadyTierThreshold[] = [
  {
    minScore: 80,
    name: 'Champion',
    localized: {
      en: 'Champion',
      tl: 'Kampeon',
    },
  },
  {
    minScore: 50,
    name: 'Pass',
    localized: {
      en: 'Pass',
      tl: 'Pumasa',
    },
  },
  {
    minScore: 0,
    name: 'Failed',
    localized: {
      en: 'Failed',
      tl: 'Nabigo',
    },
  },
];

const FAILED_TIER_NAMES = {
  en: 'Failed',
  tl: 'Nabigo',
};

const NOT_AVAILABLE_NAMES = {
  en: 'Not available',
  tl: 'Hindi available',
};

export function getGoalReadyTierFromScore(
  score: number,
  languageCode: string = 'en',
): string {
  if (Number.isNaN(score)) {
    return (
      NOT_AVAILABLE_NAMES[languageCode as keyof typeof NOT_AVAILABLE_NAMES] ||
      NOT_AVAILABLE_NAMES.en
    );
  }

  for (const { minScore, localized } of GOALREADY_TIER_THRESHOLDS) {
    if (score >= minScore) {
      return localized[languageCode as keyof typeof localized] || localized.en;
    }
  }

  return (
    FAILED_TIER_NAMES[languageCode as keyof typeof FAILED_TIER_NAMES] ||
    FAILED_TIER_NAMES.en
  );
}
