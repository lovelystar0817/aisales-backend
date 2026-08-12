import {
  meddpiccFrameworkExtraVoicePrompt,
  meddpiccConfiguration,
} from './meddpicc.js';
import {
  mexMeddpiccFrameworkExtraVoicePrompt,
  mexMeddpiccConfiguration,
} from './mexMeddpicc.js';
import { threeFModelConfiguration } from './threeFModel.js';
import {
  Framework,
  SalesFramework,
  FrameworkConfiguration,
  LocalizedFrameworkData,
} from './types.js';
import {
  fourCModelSalesExtraVoicePrompt,
  fourCModelConfiguration,
} from './fourCModel.js';
import { verifyPlusFourCModelConfiguration } from './verifyPlusFourCModel.js';
import { strategicPitchConfiguration } from './strategicPitch.js';
import {
  bblClientUpgradeAdvisoryModelConfiguration,
  bblClientRevivalAdvisoryModelConfiguration,
  bblGoalPlanningAdvisoryModelConfiguration,
  bblPortfolioReviewAdvisoryModelConfiguration,
} from './bblAdvisoryModel.js';
import {
  hsbcClientUpgradeAdvisoryModelConfiguration,
  hsbcClientOnboardingAdvisoryModelConfiguration,
} from './hsbcAdvisoryModel.js';
import { mtlRecruitmentConfiguration } from './mtlRecruitment.js';
import { mtlAdvisoryConfiguration } from './mtlAdvisory.js';
import { mtlProspectConfiguration } from './mtlProspect.js';
import { axaPhRecruitmentConfiguration } from './axaPhRecruitment.js';
import { axaPhFNAConfiguration } from './axaPhFNA.js';
import { axaPhObjectionHandlingConfiguration } from './axaPhObjectionHandling.js';
import { ktAxaRecruitmentConfiguration } from './ktAxaRecruitment.js';
import { ktAxaFNAConfiguration } from './ktAxaFna.js';
import { ktAxaWealthplusConfiguration } from './ktAxaWealthplus.js';
import { prudentialLaprObjectionHandlingConfiguration } from './prudentialLaprObjectionHandling.js';
import { alibabaTelesalesConfiguration } from './alibabaTelesales.js';
import { prudentialPHAppointmentSettingConfiguration } from './prudentialPHAppointmentSetting.js';
import { prudentialPhFactFindingConfiguration } from './prudentialPhFactFinding.js';
import { aiaKoOpeningObjectionCallConfiguration } from './aiaKoOpeningObjectionCall.js';
import { aiaKoProductPitchConfiguration } from './aiaKoProductPitch.js';
import { aiaKoEndToEndOutboundCallConfiguration } from './aiaKoEndToEndOutboundCall.js';
import {
  greatEasternFactFindConfiguration,
  greatEasternProductPitchConfiguration,
  greatEasternPostSalesConfiguration,
} from './greatEastern.js';
import { scbAdvisoryConfiguration } from './scbAdvisory.js';
import { lalamoveDriverRecruitmentConfiguration } from './lalamoveDriverRecruitment.js';
import { prudentialPhClosingCallConfiguration } from './prudentialPhClosingCall.js';

// Registry of frameworks with co-located translations
const localizedFrameworks: Record<string, FrameworkConfiguration> = {
  STRATEGIC_PITCH: strategicPitchConfiguration,
  THREE_F_MODEL: threeFModelConfiguration,
  MEDDPICC: meddpiccConfiguration,
  GRAB_MEX_MEDDPICC: mexMeddpiccConfiguration,
  FOUR_C_MODEL: fourCModelConfiguration,
  VERIFY_PLUS_FOUR_C_MODEL: verifyPlusFourCModelConfiguration,
  BBL_CLIENT_UPGRADE_ADVISORY_MODEL: bblClientUpgradeAdvisoryModelConfiguration,
  BBL_CLIENT_REVIVAL_ADVISORY_MODEL: bblClientRevivalAdvisoryModelConfiguration,
  BBL_GOAL_PLANNING_ADVISORY_MODEL: bblGoalPlanningAdvisoryModelConfiguration,
  BBL_PORTFOLIO_REVIEW_ADVISORY_MODEL:
    bblPortfolioReviewAdvisoryModelConfiguration,
  HSBC_CLIENT_ONBOARDING_ADVISORY_MODEL:
    hsbcClientOnboardingAdvisoryModelConfiguration,
  HSBC_CLIENT_UPGRADE_ADVISORY_MODEL:
    hsbcClientUpgradeAdvisoryModelConfiguration,
  MTL_RECRUITMENT_FRAMEWORK: mtlRecruitmentConfiguration,
  MTL_ADVISORY_FRAMEWORK: mtlAdvisoryConfiguration,
  MTL_PROSPECT_FRAMEWORK: mtlProspectConfiguration,
  AXA_PH_RECRUITMENT_FRAMEWORK: axaPhRecruitmentConfiguration,
  AXA_PH_FNA_FRAMEWORK: axaPhFNAConfiguration,
  AXA_PH_OBJECTION_HANDLING_FRAMEWORK: axaPhObjectionHandlingConfiguration,
  KT_AXA_RECRUITMENT_FRAMEWORK: ktAxaRecruitmentConfiguration,
  KT_AXA_FNA_FRAMEWORK: ktAxaFNAConfiguration,
  KT_AXA_WEALTHPLUS_FRAMEWORK: ktAxaWealthplusConfiguration,
  PRUDENTIAL_LAPR_OBJECTION_HANDLING:
    prudentialLaprObjectionHandlingConfiguration,
  ALIBABA_TELESALES: alibabaTelesalesConfiguration,
  PRUDENTIAL_PH_APPOINTMENT_SETTING:
    prudentialPHAppointmentSettingConfiguration,
  PRUDENTIAL_PH_FACT_FINDING: prudentialPhFactFindingConfiguration,
  AIA_KO_OPENING_OBJECTION_CALL: aiaKoOpeningObjectionCallConfiguration,
  AIA_KO_PRODUCT_PITCH: aiaKoProductPitchConfiguration,
  AIA_KO_END_TO_END_OUTBOUND_CALL: aiaKoEndToEndOutboundCallConfiguration,
  GREAT_EASTERN_FACT_FIND: greatEasternFactFindConfiguration,
  GREAT_EASTERN_PRODUCT_PITCH: greatEasternProductPitchConfiguration,
  GREAT_EASTERN_POST_SALES: greatEasternPostSalesConfiguration,
  SCB_ADVISORY_FRAMEWORK: scbAdvisoryConfiguration,
  LALAMOVE_DRIVER_RECRUITMENT: lalamoveDriverRecruitmentConfiguration,
  PRUDENTIAL_PH_CLOSING_CALL: prudentialPhClosingCallConfiguration,
};

export const getFrameworkExtraVoicePrompt = (
  framework: SalesFramework | undefined,
) => {
  if (!framework) {
    return '';
  }
  switch (framework) {
    case SalesFramework.MEDDPICC:
      return meddpiccFrameworkExtraVoicePrompt;
    case SalesFramework.GRAB_MEX_MEDDPICC:
      return mexMeddpiccFrameworkExtraVoicePrompt;
    case SalesFramework.FOUR_C_MODEL:
      return fourCModelSalesExtraVoicePrompt;
    default:
      return '';
  }
};

/**
 * Get localized framework from the co-located structure
 * @param frameworkId The framework ID to get data for
 * @param languageCode The language code (e.g., 'en', 'id', 'ms')
 * @returns Localized framework data or null if not available
 */
export const getLocalizedFramework = (
  frameworkId: string,
  languageCode: string,
): LocalizedFrameworkData | null => {
  const frameworkConfig = localizedFrameworks[frameworkId];
  if (!frameworkConfig) {
    return null;
  }

  const localizedData = frameworkConfig.localized[languageCode];
  if (!localizedData) {
    // Fallback to English if requested language is not available
    const fallbackData = frameworkConfig.localized.en;
    if (!fallbackData) {
      return null;
    }

    return {
      ...frameworkConfig.base,
      ...fallbackData,
    };
  }

  return {
    ...frameworkConfig.base,
    ...localizedData,
  };
};

/**
 * Get all available framework IDs from the co-located registry
 * @returns Array of framework IDs
 */
export const getAvailableFrameworkIds = (): string[] => {
  return Object.keys(localizedFrameworks);
};

/**
 * Get all available language codes for a specific framework
 * @param frameworkId The framework ID to check
 * @returns Array of language codes available for this framework
 */
export const getAvailableLanguagesForFramework = (
  frameworkId: string,
): string[] => {
  const frameworkConfig = localizedFrameworks[frameworkId];
  if (!frameworkConfig) {
    return [];
  }

  return Object.keys(frameworkConfig.localized);
};

/**
 * Check if a framework exists in the co-located registry
 * @param frameworkId The framework ID to check
 * @returns True if framework exists, false otherwise
 */
export const frameworkExists = (frameworkId: string): boolean => {
  return frameworkId in localizedFrameworks;
};

/**
 * Get translated framework data for a specific framework and language
 * Uses the new co-located structure only
 * @param framework The sales framework to get data for
 * @param languageCode The language code (e.g., 'en', 'id', 'ms')
 * @returns Translated framework data
 */
export const getTranslatedFramework = (
  framework: SalesFramework,
  languageCode: string,
  characterName?: string,
): Framework => {
  const localizedFramework = getLocalizedFramework(
    framework.toString(),
    languageCode,
  );
  if (localizedFramework) {
    return characterName
      ? replaceCharacterName(localizedFramework, characterName)
      : localizedFramework;
  }

  // Fallback to English version from co-located structure
  const englishFramework = getLocalizedFramework(framework.toString(), 'en');
  if (englishFramework) {
    return characterName
      ? replaceCharacterName(englishFramework, characterName)
      : englishFramework;
  }

  // This should not happen if all frameworks are properly configured
  throw new Error(
    `Framework ${framework} not found in co-located configuration`,
  );
};

/**
 * Replace {{characterName}} placeholder in framework items with actual persona name
 */
const replaceCharacterName = (
  framework: Framework,
  characterName: string,
): Framework => {
  if (!framework.parts) return framework;
  return {
    ...framework,
    parts: framework.parts.map((part) => ({
      ...part,
      items: part.items.map((item) =>
        item.replaceAll('{{characterName}}', characterName),
      ),
    })),
  };
};

export const DEFAULT_FRAMEWORK = SalesFramework.THREE_F_MODEL;
