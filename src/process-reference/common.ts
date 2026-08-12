import {
  ModuleProcessReferenceConfiguration,
  LocalizedProcessReferenceData,
  ProcessReference,
} from './types.js';
import { bblProcessReferenceConfiguration } from './bbl.js';
import { hsbcProcessReferenceConfiguration } from './hsbc.js';

// Define valid company keys for type safety
const VALID_COMPANY_PR_KEYS = ['bbl', 'hsbc'] as const;
export type ValidCompanyPRKey = (typeof VALID_COMPANY_PR_KEYS)[number];

// Type guard for valid company keys
function isValidCompanyPRKey(key: string): key is ValidCompanyPRKey {
  return VALID_COMPANY_PR_KEYS.includes(key as ValidCompanyPRKey);
}

// Registry of process reference configurations with type safety
const processReferenceRegistry: Record<
  ValidCompanyPRKey,
  ModuleProcessReferenceConfiguration
> = {
  bbl: bblProcessReferenceConfiguration,
  hsbc: hsbcProcessReferenceConfiguration,
};

/**
 * Get localized process reference from the co-located structure
 * @param companyId The company ID to get process reference data for
 * @param moduleId The module ID for module-specific process reference
 * @param languageCode The language code (e.g., 'en', 'id', 'ms')
 * @returns Localized process reference data or null if not available
 */
export const getLocalizedProcessReference = (
  companyId: string,
  moduleId: string,
  languageCode: string,
): LocalizedProcessReferenceData | null => {
  // Use type guard to safely access registry
  if (!isValidCompanyPRKey(companyId)) {
    return null;
  }

  const prConfig = processReferenceRegistry[companyId];
  if (!prConfig) {
    return null;
  }

  // Get module-specific configuration
  const moduleConfig = prConfig.modules[moduleId];
  if (!moduleConfig) {
    return null;
  }

  const localizedData = moduleConfig.localized[languageCode];
  if (!localizedData) {
    // Fallback to English if requested language is not available
    const fallbackData = moduleConfig.localized.en;
    if (!fallbackData) {
      return null;
    }

    return fallbackData;
  }

  return localizedData;
};

/**
 * Check if process reference exists for given company and module
 * @param companyId The company ID to check
 * @param moduleId The module ID to check
 * @returns Boolean indicating if process reference exists
 */
export const processReferenceExists = (
  companyId: string,
  moduleId: string,
): boolean => {
  if (!isValidCompanyPRKey(companyId)) {
    return false;
  }

  const prConfig = processReferenceRegistry[companyId];
  return !!prConfig && moduleId in prConfig.modules;
};

/**
 * Get process reference with fallback logic
 * @param companyId The company ID
 * @param moduleId The module ID for module-specific process reference
 * @param languageCode The language code (falls back to 'en' if not found)
 * @returns Process reference data or null if not available
 */
export const getProcessReference = (
  companyId?: string,
  moduleId?: string,
  languageCode: string = 'en',
): ProcessReference | null => {
  // Return null if required parameters are missing
  if (!companyId || !moduleId) {
    return null;
  }

  // Check if process reference exists for this company and module
  if (!processReferenceExists(companyId, moduleId)) {
    return null;
  }

  // Get localized data with fallbacks
  const localizedData = getLocalizedProcessReference(
    companyId,
    moduleId,
    languageCode,
  );

  if (localizedData) {
    return localizedData;
  }

  // Final fallback to English
  const defaultEnglishData = getLocalizedProcessReference(
    companyId,
    moduleId,
    'en',
  );

  return defaultEnglishData || null;
};

/**
 * Get all available company IDs that have process reference
 * @returns Array of company IDs
 */
export const getAvailableProcessReferenceCompanies =
  (): ValidCompanyPRKey[] => {
    return VALID_COMPANY_PR_KEYS.slice();
  };

/**
 * Get all available module IDs for a specific company
 * @param companyId The company ID
 * @returns Array of module IDs or empty array if company not found
 */
export const getAvailableProcessReferenceModules = (
  companyId: string,
): string[] => {
  if (!isValidCompanyPRKey(companyId)) {
    return [];
  }

  const prConfig = processReferenceRegistry[companyId];
  return prConfig ? Object.keys(prConfig.modules) : [];
};
