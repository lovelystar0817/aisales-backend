import { MSIG_COMPANY_ID } from './constants.js';
import { shouldUsePrudentialData } from './prudential-standing.js';

export const getAssessmentType = (companyId?: string) => {
  if (companyId === MSIG_COMPANY_ID) {
    return 'msig';
  } else if (companyId && shouldUsePrudentialData(companyId)) {
    return 'prudential';
  } else {
    return 'regular';
  }
};

/**
 * Format persona profile information for assessment context
 * Includes demographic info, financial profile, and key priorities
 */
export const formatPersonaProfile = (persona: any): string => {
  if (!persona) return '';

  const profileParts: string[] = [];

  // Add basic demographic info
  if (persona.age) {
    profileParts.push(`Age: ${persona.age}`);
  }

  if (persona.occupation) {
    profileParts.push(`Occupation: ${persona.occupation}`);
  }

  // Add HSBC financial profile if available
  if (persona.hsbcFinancialProfile) {
    const profile = persona.hsbcFinancialProfile;

    if (profile.demographicProfile) {
      profileParts.push(`Profile: ${profile.demographicProfile}`);
    }

    if (profile.annualIncome) {
      profileParts.push(`Annual Income: ${profile.annualIncome}`);
    }

    if (profile.hsbcTier) {
      profileParts.push(`HSBC Tier: ${profile.hsbcTier}`);
    }
  }

  // Add BBL financial profile if available
  if (persona.bblFinancialProfile) {
    const profile = persona.bblFinancialProfile;

    if (profile.demographicProfile) {
      profileParts.push(`Profile: ${profile.demographicProfile}`);
    }

    if (profile.annualIncome) {
      profileParts.push(`Annual Income: ${profile.annualIncome}`);
    }
  }

  // Add detailed profile information
  if (persona.details) {
    const details = persona.details;

    if (details.location) {
      profileParts.push(`Location: ${details.location}`);
    }

    if (details.financialSituation) {
      profileParts.push(
        `\nFinancial Situation:\n${details.financialSituation}`,
      );
    }

    if (details.keyPriorities && details.keyPriorities.length > 0) {
      profileParts.push(
        `\nKey Priorities:\n${details.keyPriorities.map((p: string) => `- ${p}`).join('\n')}`,
      );
    }
  }

  return profileParts.length > 0
    ? `\n[CLIENT PROFILE]\n${profileParts.join('\n')}\n`
    : '';
};
