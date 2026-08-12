import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Translation cache to avoid repeated file reads
const translationCache: Record<string, Record<string, any>> = {};

/**
 * Load translations for a specific language
 * @param lang Language code
 * @returns Translation object or null if not found
 */
export const loadTranslations = (lang: string): Record<string, any> | null => {
  // Return from cache if available
  if (translationCache[lang]) {
    return translationCache[lang];
  }

  try {
    // Try multiple possible paths for the translation files
    const possiblePaths = [
      // Standard path relative to the current module
      path.join(__dirname, '..', 'i18n', `${lang}.json`),
      // Alternate path for production builds
      path.join(process.cwd(), 'dist', 'i18n', `${lang}.json`),
      // Direct path from project root
      path.join(process.cwd(), 'src', 'i18n', `${lang}.json`),
    ];

    console.log('Possible paths:', possiblePaths);

    let translationData = null;
    let foundPath = null;

    // Try each path until we find one that exists
    for (const translationPath of possiblePaths) {
      if (fs.existsSync(translationPath)) {
        foundPath = translationPath;
        translationData = fs.readFileSync(translationPath, 'utf8');
        break;
      }
    }

    if (!translationData) {
      console.warn(
        `Translation file not found for language: ${lang}. Tried paths:`,
        possiblePaths,
      );

      // For non-English languages, try to load English as fallback
      if (lang !== 'en') {
        console.info(
          `Attempting to load English translations as fallback for ${lang}`,
        );
        return loadTranslations('en');
      }

      // For English, return empty object instead of null to avoid errors
      return {};
    }

    // Parse the translation file
    const translations = JSON.parse(translationData);
    console.info(
      `Successfully loaded translations for ${lang} from ${foundPath}`,
    );

    // Cache the translations
    translationCache[lang] = translations;

    return translations;
  } catch (error) {
    console.error(`Error loading translations for ${lang}:`, error);

    // Return empty object instead of null for more graceful degradation
    return {};
  }
};

/**
 * Get a translated value using dot notation path
 * @param lang Language code
 * @param path Dot notation path to the translation (e.g., 'scenarios.career.title')
 * @param defaultValue Default value if translation is not found
 * @returns Translated string or default value
 */
export const getTranslation = (
  lang: string,
  path: string,
  defaultValue: string = '',
): string => {
  // Default to English if language not supported
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    lang = 'en';
  }

  // Load translations for the language
  const translations = loadTranslations(lang);

  // Navigate the path to find the translation
  const keys = path.split('.');
  let value: any = translations;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      // Key not found in this language
      if (lang !== 'en') {
        // Try English as fallback
        return getTranslation('en', path, defaultValue);
      }
      return defaultValue;
    }
  }

  // If the value is null, undefined, or empty string, use the default value
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  return value.toString();
};

/**
 * Translate an entire object structure based on language
 * @param obj Object to translate
 * @param lang Language code
 * @returns Translated object
 */
export const translateObject = <T extends Record<string, any>>(
  obj: T,
  lang: string,
): T => {
  // If language is English or not supported, return original object
  if (lang === 'en' || !SUPPORTED_LANGUAGES.includes(lang)) {
    return obj;
  }

  // Load translations
  const translations = loadTranslations(lang);
  if (!translations) {
    return obj;
  }

  // Function to recursively translate object properties
  const translate = (object: any, prefix: string = ''): any => {
    if (!object || typeof object !== 'object') {
      return object;
    }

    // Handle arrays
    if (Array.isArray(object)) {
      return object.map((item, index) =>
        translate(item, `${prefix}[${index}]`),
      );
    }

    // Handle objects
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(object)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object') {
        // Recursively translate nested objects
        result[key] = translate(value, fullPath);
      } else if (typeof value === 'string') {
        // Try to find translation for this specific path
        const translatedValue = getTranslation(lang, fullPath, '');

        if (translatedValue) {
          // Use translation if found
          result[key] = translatedValue;
        } else {
          // Keep original value if no translation found
          result[key] = value;
        }
      } else {
        // Keep non-string values as is
        result[key] = value;
      }
    }

    return result;
  };

  return translate(obj) as T;
};

/**
 * Gets the list of supported language codes
 */
export function getSupportedLanguageCodes(): string[] {
  return SUPPORTED_LANGUAGES.map((l) => l);
}

/**
 * Checks if a language code is supported
 */
export function isLanguageSupported(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((l) => l === code.toLowerCase());
}

/**
 * Translate an array of objects
 * @param array Array to translate
 * @param lang Language code
 * @returns Translated array
 */
export const translateArray = <T extends Record<string, any>>(
  array: T[],
  lang: string,
): T[] => {
  return array.map((item) => translateObject(item, lang));
};
