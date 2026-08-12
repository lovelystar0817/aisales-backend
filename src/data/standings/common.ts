import {
  StandingConfiguration,
  LocalizedStanding,
} from '../../types/standings.js';

/**
 * Get localized standing from the co-located structure
 * @param standingConfig The standing configuration to get data for
 * @param languageCode The language code (e.g., 'en', 'id', 'ms')
 * @returns Localized standing data or null if not available
 */
export const getLocalizedStanding = (
  standingConfig: StandingConfiguration,
  languageCode: string,
): LocalizedStanding | null => {
  const localizedData = standingConfig.localized[languageCode];
  if (!localizedData) {
    // Fallback to English if requested language is not available
    const fallbackData = standingConfig.localized.en;
    if (!fallbackData) {
      return null;
    }
    return fallbackData;
  }

  return localizedData;
};

/**
 * Return true if the object (recursively) contains
 * at least ONE boolean that is true.
 */
export const deepSomeTrue = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  return Object.values(obj).some((v) =>
    typeof v === 'boolean'
      ? v
      : typeof v === 'object' && v !== null && deepSomeTrue(v),
  );
};

/**
 * Return true only if EVERY boolean (recursively) is true.
 * If the tree has no booleans it also returns true – exactly
 * the behaviour the current loops implement.
 */
export const deepAllTrue = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  for (const v of Object.values(obj)) {
    if (typeof v === 'boolean' && !v) return false;
    if (typeof v === 'object' && v !== null && !deepAllTrue(v)) return false;
  }
  return true;
};
