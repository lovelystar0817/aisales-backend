export const MSIG_SECTION_ORDER = [
  { key: 'introduction', title: 'Introduction', weight: 5 },
  { key: 'presentation', title: 'Presentation', weight: 40 },
  { key: 'communication', title: 'Communication', weight: 10 },
  { key: 'salesConfirmation', title: 'Sales Confirmation', weight: 20 },
  { key: 'mandatoryDisclosure', title: 'Mandatory Disclosure', weight: 20 },
  { key: 'closure', title: 'Closure', weight: 5 },
] as const;

export type MSIGSectionKey = (typeof MSIG_SECTION_ORDER)[number]['key'];

// Keys only
export const MSIG_SECTIONS: readonly MSIGSectionKey[] = MSIG_SECTION_ORDER.map(
  (s) => s.key as MSIGSectionKey,
);

// Tier thresholds
export interface MSIGTierThreshold {
  minScore: number; // inclusive lower bound
  name: string;
}

export const MSIG_TIER_THRESHOLDS: readonly MSIGTierThreshold[] = [
  { minScore: 95, name: 'Strategic Consultant' },
  { minScore: 90, name: 'Skilled Advisor' },
  { minScore: 85, name: 'Emerging Seller' },
  // anything below 85 will be treated as "Sales Novice"
];

export function getMSIGTierFromScore(score: number): string {
  if (Number.isNaN(score)) return 'Not available';

  for (const { minScore, name } of MSIG_TIER_THRESHOLDS) {
    if (score >= minScore) return name;
  }
  return 'Sales Novice';
}
