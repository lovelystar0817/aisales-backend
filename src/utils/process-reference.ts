import { getProcessReference as getLocalizedPR } from '../process-reference/common.js';
import {
  BBL_COMPANY_ID,
  HSBC_COMPANY_ID,
  HSBC_YUE_COMPANY_ID,
} from './constants.js';

// Export types
export type {
  ProcessStep,
  ProcessItem,
  ProcessReference,
} from '../process-reference/types.js';

// Import the type for return type annotation
import type { ProcessReference } from '../process-reference/types.js';

/**
 * Get process reference data using the co-located structure with module-specific support
 * @param companyId Company ID to get process reference data for
 * @param moduleId Module ID for module-specific process reference
 * @param languageCode Target language code
 * @returns Process reference data or null if not available
 */
export function getProcessReference(
  companyId?: string,
  moduleId?: string,
  languageCode: string = 'en',
): ProcessReference | null {
  // Map company IDs to our co-located structure
  let mappedCompanyId: string | null = null;

  switch (companyId) {
    case BBL_COMPANY_ID:
      mappedCompanyId = 'bbl';
      break;
    case HSBC_COMPANY_ID:
    case HSBC_YUE_COMPANY_ID:
      mappedCompanyId = 'hsbc';
      break;
    default:
      // Return null for companies that don't have process reference
      return null;
  }

  // Use the co-located process reference system with module support
  return getLocalizedPR(mappedCompanyId, moduleId, languageCode);
}
