import { FastifyRequest } from 'fastify';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';

/**
 * Extract the language from the Accept-Language header
 * @param req Fastify request object
 * @returns The language code (default: 'en')
 */
export const getLanguageHeader = (req: FastifyRequest): string => {
  const acceptLanguage = req.headers['accept-language'];

  if (!acceptLanguage) {
    return 'en'; // Default to English
  }

  // Extract the primary language code
  // This handles formats like 'fr', 'fr-FR', 'fr,en;q=0.8'
  const primaryLang = acceptLanguage
    .split(',')[0]
    .trim()
    .split('-')[0]
    .toLowerCase();

  // Only return supported languages
  return SUPPORTED_LANGUAGES.includes(primaryLang) ? primaryLang : 'en';
};
