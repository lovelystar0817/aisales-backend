/**
 * Helper utilities for building competitive intelligence configurations
 * Reduces code duplication across language-specific configurations
 */

import { SUPPORTED_LANGUAGES } from '../utils/constants.js';
import {
  Competitor,
  CompetitiveIntelligenceConfiguration,
  CompetitiveIntelligenceBase,
  LocalizedCompetitiveIntelligenceData,
} from './types.js';

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Translation map for a single competitor across multiple languages
 */
export type CompetitorTranslations = {
  [K in SupportedLanguage]?: Competitor;
};

/**
 * Build a competitive intelligence configuration from base data and translations
 * This helper reduces code duplication by automatically building the full configuration
 * from compact translation maps.
 *
 * @param base Base configuration metadata
 * @param competitorTranslations Array of competitor translation maps
 * @returns Complete competitive intelligence configuration
 *
 * @example
 * ```typescript
 * const config = buildCIConfiguration(
 *   { id: 'example', company: 'example', targetMarket: 'insurance' },
 *   [{
 *     en: { name: 'Competitor A', company: 'Company A', ... },
 *     id: { name: 'Kompetitor A', company: 'Perusahaan A', ... }
 *   }]
 * );
 * ```
 */
export function buildCIConfiguration(
  base: CompetitiveIntelligenceBase,
  competitorTranslations: CompetitorTranslations[],
): CompetitiveIntelligenceConfiguration {
  const localized: {
    [languageCode: string]: LocalizedCompetitiveIntelligenceData;
  } = {};

  // Build each language version from the translation maps
  for (const lang of SUPPORTED_LANGUAGES) {
    const competitors: Competitor[] = [];

    // Collect all competitors for this language
    for (const translationMap of competitorTranslations) {
      if (translationMap[lang]) {
        competitors.push(translationMap[lang]);
      }
    }

    // Only add the language if it has competitors
    if (competitors.length > 0) {
      localized[lang] = { competitors };
    }
  }

  return {
    base,
    localized,
  };
}

/**
 * Create a competitor translation map from a base English competitor
 * This is a helper for cases where you want to start with English and add translations
 *
 * @param englishCompetitor Base English competitor
 * @param translations Partial translations for other languages
 * @returns Complete competitor translation map
 */
export function createCompetitorTranslations(
  englishCompetitor: Competitor,
  translations: Partial<Omit<CompetitorTranslations, 'en'>> = {},
): CompetitorTranslations {
  return {
    en: englishCompetitor,
    ...translations,
  };
}

/**
 * Validate that a competitive intelligence configuration has required languages
 * Ensures at least English is present and warns about missing translations
 *
 * @param config Configuration to validate
 * @param requiredLanguages Languages that must be present
 * @returns Array of missing language codes
 */
export function validateCIConfiguration(
  config: CompetitiveIntelligenceConfiguration,
  requiredLanguages: string[] = ['en'],
): string[] {
  const missing: string[] = [];

  for (const lang of requiredLanguages) {
    if (
      !config.localized[lang] ||
      config.localized[lang].competitors.length === 0
    ) {
      missing.push(lang);
    }
  }

  return missing;
}
