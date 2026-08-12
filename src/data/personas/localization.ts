import { IPersona, PersonaDocument } from '../../models/Persona.js';
import { SUPPORTED_LANGUAGES } from '../../utils/constants.js';
import {
  PersonaConfiguration,
  SupportedLanguage,
  buildPersonaDocument,
} from './types.js';

/**
 * New localization function for co-located personas
 * Gets the appropriate language variant directly from the persona configuration
 */
function getLocalizedPersonaFromConfig(
  personaConfig: PersonaConfiguration,
  languageCode: SupportedLanguage = 'en',
  moduleId?: string,
): Omit<IPersona, 'localizations'> {
  return buildPersonaDocument(personaConfig, languageCode, moduleId);
}

/**
 * Get multiple personas in the specified language
 */
export function getLocalizedPersonasFromConfigs(
  personaConfigs: PersonaConfiguration[],
  languageCode: SupportedLanguage = 'en',
  moduleId?: string,
): Omit<IPersona, 'localizations'>[] {
  return personaConfigs.map((config) =>
    getLocalizedPersonaFromConfig(config, languageCode, moduleId),
  );
}

/**
 * Utility to check if a string is a supported language code
 */
export function isSupportedLanguage(code: string): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(code as SupportedLanguage);
}

/**
 * Get language code with fallback to English
 */
export function getSafeLanguageCode(languageCode?: string): SupportedLanguage {
  console.log(
    'Language code:',
    languageCode,
    ', isSupportedLanguage:',
    isSupportedLanguage(languageCode || ''),
  );
  if (!languageCode || !isSupportedLanguage(languageCode)) {
    return 'en';
  }
  return languageCode;
}
