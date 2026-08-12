// Manulife FNA constants

export type ManulifeSectionKey = 'introduction' | 'financialNeeds';

export interface ManulifeSectionConfig {
  key: ManulifeSectionKey;
  label: string;
  localized: {
    en: string;
    ceb: string;
    id?: string;
    ms?: string;
    tl?: string;
    vi?: string;
    th?: string;
  };
}

export const MANULIFE_SECTIONS: ManulifeSectionKey[] = [
  'introduction',
  'financialNeeds',
];

export const MANULIFE_SECTION_ORDER: ManulifeSectionConfig[] = [
  {
    key: 'introduction',
    label: 'Introduction to Manulife & Facts of Life',
    localized: {
      en: 'Introduction to Manulife & Facts of Life',
      ceb: 'Introduksyon sa Manulife ug mga Kamatuoran sa Kinabuhi',
    },
  },
  {
    key: 'financialNeeds',
    label: 'Financial Needs, Goal Guide and Conclusion',
    localized: {
      en: 'Financial Needs, Goal Guide and Conclusion',
      ceb: 'Mga Panginahanglan sa Pinansyal, Giya sa Tumong ug Konklusyon',
    },
  },
];

/**
 * Get localized section label
 */
export function getManulifeSectionLabel(
  sectionKey: ManulifeSectionKey,
  languageCode: string = 'en',
): string {
  const section = MANULIFE_SECTION_ORDER.find((s) => s.key === sectionKey);
  if (!section) return sectionKey;

  return (
    section.localized[languageCode as keyof typeof section.localized] ||
    section.localized.en
  );
}

export interface ManulifeTierThreshold {
  minScore: number; // inclusive lower bound
  name: string;
  localized: {
    en: string;
    ceb: string;
    id?: string;
    ms?: string;
    tl?: string;
    vi?: string;
    th?: string;
  };
}

export const MANULIFE_TIER_THRESHOLDS: readonly ManulifeTierThreshold[] = [
  {
    minScore: 27,
    name: 'Champion',
    localized: {
      en: 'Champion',
      ceb: 'Kampeon',
    },
  },
  {
    minScore: 24,
    name: 'Pass',
    localized: {
      en: 'Pass',
      ceb: 'Mipasar',
    },
  },
  {
    minScore: 0,
    name: 'Failed',
    localized: {
      en: 'Failed',
      ceb: 'Napakyas',
    },
  },
];

const FAILED_TIER_NAMES = {
  en: 'Failed',
  ceb: 'Napakyas',
};

const NOT_AVAILABLE_NAMES = {
  en: 'Not available',
  ceb: 'Wala magamit',
};

export function getManulifeTierFromScore(
  score: number,
  languageCode: string = 'en',
): string {
  if (Number.isNaN(score)) {
    return (
      NOT_AVAILABLE_NAMES[languageCode as keyof typeof NOT_AVAILABLE_NAMES] ||
      NOT_AVAILABLE_NAMES.en
    );
  }

  for (const { minScore, localized } of MANULIFE_TIER_THRESHOLDS) {
    if (score >= minScore) {
      return localized[languageCode as keyof typeof localized] || localized.en;
    }
  }

  return (
    FAILED_TIER_NAMES[languageCode as keyof typeof FAILED_TIER_NAMES] ||
    FAILED_TIER_NAMES.en
  );
}
