import { FlattenMaps, Types } from 'mongoose';

import { IPersona, PersonaDetails } from '../models/Persona.js';
import { Scenario, ScenarioDocument } from '../models/Scenario.js';
import {
  AIA_KO_COMPANY_ID,
  ALIBABA_COMPANY_ID,
  AXA_PH_COMPANY_ID,
  BBL_COMPANY_ID,
  CARTESIA_THAI_FEMALE_VOICE_ID,
  CARTESIA_THAI_MALE_VOICE_ID,
  ELEVEN_LABS_FEMALE_BRITISH_ACCENT_VOICE_ID,
  ELEVEN_LABS_FEMALE_SINGAPOREAN_VOICE_ID_2,
  ELEVEN_LABS_FEMALE_VOICE_ID,
  ELEVEN_LABS_INDONESIAN_OLDER_FEMALE_VOICE_ID,
  ELEVEN_LABS_INDONESIAN_OLDER_MALE_VOICE_ID,
  // Indonesian voices
  ELEVEN_LABS_INDONESIAN_YOUNG_FEMALE_VOICE_ID,
  ELEVEN_LABS_INDONESIAN_YOUNG_MALE_VOICE_ID,
  ELEVEN_LABS_MALAYSIAN_OLDER_FEMALE_VOICE_ID,
  ELEVEN_LABS_MALAYSIAN_OLDER_MALE_VOICE_ID,
  // Malaysian voices
  ELEVEN_LABS_MALAYSIAN_YOUNG_FEMALE_VOICE_ID,
  ELEVEN_LABS_MALAYSIAN_YOUNG_MALE_VOICE_ID,
  ELEVEN_LABS_MALE_AMERICAN_ACCENT_VOICE_ID,
  ELEVEN_LABS_MALE_BRITISH_ACCENT_VOICE_ID,
  ELEVEN_LABS_MALE_VOICE_ID,
  ELEVEN_LABS_TAGALOG_OLDER_FEMALE_VOICE_ID,
  ELEVEN_LABS_TAGALOG_OLDER_MALE_VOICE_ID,
  // Tagalog voices
  ELEVEN_LABS_TAGALOG_YOUNG_FEMALE_VOICE_ID,
  ELEVEN_LABS_TAGALOG_YOUNG_MALE_VOICE_ID,
  ELEVEN_LABS_TRADITIONAL_CHINESE_OLDER_MALE_VOICE_ID,
  ELEVEN_LABS_TRADITIONAL_CHINESE_OLD_FEMALE_VOICE_ID,
  ELEVEN_LABS_TRADITIONAL_CHINESE_YOUNGER_FEMALE_VOICE_ID,
  // Traditional Chinese voices
  ELEVEN_LABS_TRADITIONAL_CHINESE_YOUNG_MALE_VOICE_ID,
  ELEVEN_LABS_VIETNAMESE_OLDER_FEMALE_VOICE_ID,
  ELEVEN_LABS_VIETNAMESE_OLDER_MALE_VOICE_ID,
  // Vietnamese voices
  ELEVEN_LABS_VIETNAMESE_YOUNG_FEMALE_VOICE_ID,
  ELEVEN_LABS_VIETNAMESE_YOUNG_MALE_VOICE_ID,
  GRAB_COMPANY_ID,
  GRAB_LMS_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
  HSBC_COMPANY_ID,
  HSBC_YUE_COMPANY_ID,
  KT_AXA_COMPANY_ID,
  MANULIFE_COMPANY_ID,
  MSIG_COMPANY_ID,
  MTL_COMPANY_ID,
  PLT_COMPANY_ID,
  PRUDENTIAL_COMPANY_ID,
  PRUDENTIAL_ID_COMPANY_ID,
  PRUDENTIAL_PH_COMPANY_ID,
  PRUDENTIAL_TW_COMPANY_ID,
  RESEARCH_COMPANY_ID,
  GREAT_EASTERN_COMPANY_ID,
  SCB_DEMO_COMPANY_ID,
  LALAMOVE_COMPANY_ID,
} from './constants.js';

// Import persona configurations and types from data layer
import {
  AIA_KO_PERSONA_CONFIGURATIONS,
  ALIBABA_PERSONA_CONFIGURATIONS,
  ALL_PERSONA_CONFIGURATIONS,
  AXA_PH_FNA_PERSONA_CONFIGURATIONS,
  AXA_PH_OBJECTION_HANDLING_PERSONA_CONFIGURATIONS,
  AXA_PH_UNIT_MANAGER_RECRUITMENT_PERSONA_CONFIGURATIONS,
  BBL_PERSONA_CONFIGURATIONS,
  DEFAULT_PERSONA_CONFIGURATIONS,
  GRAB_DEFAULT_PERSONA_CONFIGURATIONS,
  GRAB_MEX_PERSONA_CONFIGURATIONS,
  HSBC_CLIENT_ONBOARDING_PERSONA_CONFIGURATIONS,
  HSBC_CLIENT_UPGRADE_PERSONA_CONFIGURATIONS,
  HSBC_YUE_CLIENT_ONBOARDING_PERSONA_CONFIGURATIONS,
  KT_AXA_AGENT_RECRUITMENT_PERSONA_CONFIGURATIONS,
  KT_AXA_FNA_PERSONA_CONFIGURATIONS,
  KT_AXA_WEALTHPLUS_PERSONA_CONFIGURATIONS,
  MANULIFE_PERSONA_CONFIGURATIONS,
  MSIG_PERSONA_CONFIGURATIONS,
  MTL_AGENT_RECRUITMENT_PERSONA_CONFIGURATIONS,
  MTL_PROSPECT_PRACTICE_PERSONA_CONFIGURATIONS,
  MTL_UL_PLUS_SALES_PERSONA_CONFIGURATIONS,
  PLT_COLD_CALL_PERSONA_CONFIGURATIONS,
  PLT_PLI_PERSONA_CONFIGURATIONS,
  PLT_PRUSHIELD_PERSONA_CONFIGURATIONS,
  PRUDENTIAL_TW_COLD_CALL_PERSONA_CONFIGURATIONS,
  PRUDENTIAL_TW_PRULIFETIME_PERSONA_CONFIGURATIONS,
  PRUDENTIAL_TW_PRUSHIELD_PERSONA_CONFIGURATIONS,
  PRU_COLD_CALL_PERSONA_CONFIGURATIONS,
  PRU_PLI_PERSONA_CONFIGURATIONS,
  PRU_PRUSHIELD_PERSONA_CONFIGURATIONS,
  PersonaConfiguration,
  RESEARCH_PERSONA_CONFIGURATIONS,
  getLocalizedPersonasFromConfigs,
  getSafeLanguageCode,
  PRU_PH_APPOINTMENT_SETTING_PERSONA_CONFIGURATIONS,
  PRU_PH_FACT_FINDING_PERSONA_CONFIGURATIONS,
  PRU_PH_CLOSING_CALL_PERSONA_CONFIGURATIONS,
  GREAT_EASTERN_PERSONA_CONFIGURATIONS,
  SCB_DEMO_PERSONA_CONFIGURATIONS,
  LALAMOVE_PERSONA_CONFIGURATIONS,
} from '../data/personas/index.js';

/**
 * Get all personas in the specified language
 */
export function getPersonas(
  languageCode: string = 'en',
  companyId?: string,
  moduleId?: string,
  productId?: string,
): Omit<IPersona, 'localizations'>[] {
  let personas: PersonaConfiguration[] = [];
  switch (companyId) {
    case GRAB_COMPANY_ID:
    case GRAB_LMS_COMPANY_ID:
    case GRAB_TEST_COMPANY_ID:
      if (moduleId === 'grab-mex') {
        personas = GRAB_MEX_PERSONA_CONFIGURATIONS;
      } else {
        personas = GRAB_DEFAULT_PERSONA_CONFIGURATIONS;
      }
      break;
    case RESEARCH_COMPANY_ID:
      personas = RESEARCH_PERSONA_CONFIGURATIONS;
      break;
    case PRUDENTIAL_COMPANY_ID:
      if (productId === 'prulifetime-income-plus') {
        personas = PRU_PLI_PERSONA_CONFIGURATIONS;
      } else if (productId === 'prushield') {
        personas = PRU_PRUSHIELD_PERSONA_CONFIGURATIONS;
      } else {
        personas = PRU_COLD_CALL_PERSONA_CONFIGURATIONS;
      }
      break;
    case PLT_COMPANY_ID:
      if (productId === 'prulifetime-income-plus') {
        personas = PLT_PLI_PERSONA_CONFIGURATIONS;
      } else if (productId === 'prushield') {
        personas = PLT_PRUSHIELD_PERSONA_CONFIGURATIONS;
      } else {
        personas = PLT_COLD_CALL_PERSONA_CONFIGURATIONS;
      }
      break;
    case PRUDENTIAL_TW_COMPANY_ID:
      if (productId === 'prulifetime-income-plus') {
        personas = PRUDENTIAL_TW_PRULIFETIME_PERSONA_CONFIGURATIONS;
      } else if (productId === 'prushield') {
        personas = PRUDENTIAL_TW_PRUSHIELD_PERSONA_CONFIGURATIONS;
      } else {
        personas = PRUDENTIAL_TW_COLD_CALL_PERSONA_CONFIGURATIONS;
      }
      break;
    case PRUDENTIAL_ID_COMPANY_ID:
      if (productId === 'prulifetime-income-plus') {
        personas = PRU_PLI_PERSONA_CONFIGURATIONS;
      } else if (productId === 'prushield') {
        personas = PRU_PRUSHIELD_PERSONA_CONFIGURATIONS;
      } else {
        personas = PRU_COLD_CALL_PERSONA_CONFIGURATIONS;
      }
      break;

    case MSIG_COMPANY_ID:
      personas = MSIG_PERSONA_CONFIGURATIONS;
      break;
    case MANULIFE_COMPANY_ID:
      if (
        moduleId === 'manulife-product-pitch' &&
        productId === 'manulife-goalready'
      ) {
        // manulife-product-pitch module with manulife-goalready product uses Kris persona
        personas = MANULIFE_PERSONA_CONFIGURATIONS.filter(
          (p) =>
            p.base.friendlyId === 'kris-ph-cafe-owner-entrepreneur-goalready',
        );
      } else if (moduleId === 'fna') {
        // FNA uses Marc and Angeline personas
        personas = MANULIFE_PERSONA_CONFIGURATIONS.filter(
          (p) =>
            p.base.friendlyId ===
              'marc-ph-marketing-executive-first-job-receptive' ||
            p.base.friendlyId === 'angeline-ph-teacher-family-oriented',
        );
      } else {
        // Default: return all Manulife personas
        personas = MANULIFE_PERSONA_CONFIGURATIONS;
      }
      break;
    case BBL_COMPANY_ID:
      personas = BBL_PERSONA_CONFIGURATIONS;
      break;
    case HSBC_COMPANY_ID:
      if (moduleId === 'hsbc-client-onboarding') {
        personas = HSBC_CLIENT_ONBOARDING_PERSONA_CONFIGURATIONS;
      } else {
        personas = HSBC_CLIENT_UPGRADE_PERSONA_CONFIGURATIONS;
      }
      break;
    case HSBC_YUE_COMPANY_ID:
      personas = HSBC_YUE_CLIENT_ONBOARDING_PERSONA_CONFIGURATIONS;
      break;
    case MTL_COMPANY_ID:
      if (moduleId === 'mtl-agent-recruitment') {
        personas = MTL_AGENT_RECRUITMENT_PERSONA_CONFIGURATIONS;
      } else if (moduleId === 'mtl-ul-plus-sales') {
        personas = MTL_UL_PLUS_SALES_PERSONA_CONFIGURATIONS;
      } else if (moduleId === 'mtl-prospect-practice') {
        personas = MTL_PROSPECT_PRACTICE_PERSONA_CONFIGURATIONS;
      }
      break;
    case AXA_PH_COMPANY_ID:
      if (moduleId === 'axa-ph-unit-manager-recruitment') {
        personas = AXA_PH_UNIT_MANAGER_RECRUITMENT_PERSONA_CONFIGURATIONS;
      } else if (moduleId === 'axa-ph-financial-needs-analysis') {
        personas = AXA_PH_FNA_PERSONA_CONFIGURATIONS;
      } else if (moduleId === 'axa-ph-general-objection-handling') {
        personas = AXA_PH_OBJECTION_HANDLING_PERSONA_CONFIGURATIONS;
      }
      break;
    case KT_AXA_COMPANY_ID:
      if (moduleId === 'kt-axa-agent-recruitment') {
        personas = KT_AXA_AGENT_RECRUITMENT_PERSONA_CONFIGURATIONS;
      } else if (moduleId === 'kt-axa-fna-product-pitch') {
        personas = KT_AXA_FNA_PERSONA_CONFIGURATIONS;
      } else if (moduleId === 'kt-axa-wealthplus-close-call') {
        personas = KT_AXA_WEALTHPLUS_PERSONA_CONFIGURATIONS;
      }
      break;
    case AIA_KO_COMPANY_ID:
      personas = AIA_KO_PERSONA_CONFIGURATIONS;
      break;
    case ALIBABA_COMPANY_ID:
      personas = ALIBABA_PERSONA_CONFIGURATIONS;
      break;
    case PRUDENTIAL_PH_COMPANY_ID:
      if (moduleId === 'prudential-ph-appointment-setting') {
        personas = PRU_PH_APPOINTMENT_SETTING_PERSONA_CONFIGURATIONS;
      } else if (moduleId === 'prudential-ph-fact-finding') {
        personas = PRU_PH_FACT_FINDING_PERSONA_CONFIGURATIONS;
      } else if (moduleId === 'prudential-ph-closing-call') {
        personas = PRU_PH_CLOSING_CALL_PERSONA_CONFIGURATIONS;
      }
      break;
    case GREAT_EASTERN_COMPANY_ID:
      personas = GREAT_EASTERN_PERSONA_CONFIGURATIONS;
      break;
    case SCB_DEMO_COMPANY_ID:
      personas = SCB_DEMO_PERSONA_CONFIGURATIONS;
      break;
    case LALAMOVE_COMPANY_ID:
      personas = LALAMOVE_PERSONA_CONFIGURATIONS;
      break;
    default:
      personas = DEFAULT_PERSONA_CONFIGURATIONS;
      break;
  }
  const safeLanguageCode = getSafeLanguageCode(languageCode);
  return getLocalizedPersonasFromConfigs(personas, safeLanguageCode, moduleId);
}

/**
 * Get a specific persona by id in the specified language
 */
export function getPersonaById(
  id: string,
  languageCode: string = 'en',
  moduleId?: string,
): Omit<IPersona, 'localizations'> | null {
  const config = ALL_PERSONA_CONFIGURATIONS.find((p) => p.base.id === id);
  if (!config) return null;

  const safeLanguageCode = getSafeLanguageCode(languageCode);
  const personas = getLocalizedPersonasFromConfigs(
    [config],
    safeLanguageCode,
    moduleId,
  );

  const persona = personas.find((p) => p._id.toString() === id);
  if (!persona) return null;

  return persona;
}

interface GetPersonasV2Params {
  companyId: string;
  languageCode: string;
  moduleId?: string;
  productId?: string;
}

export async function getPersonasV2({
  companyId,
  languageCode,
  moduleId,
  productId,
}: GetPersonasV2Params) {
  const customScenarioCount = await Scenario.countDocuments({
    company: new Types.ObjectId(companyId),
    module: new Types.ObjectId(moduleId),
    product: new Types.ObjectId(productId),
    isActive: true,
  });
  if (customScenarioCount === 0) {
    // no custom scenarios, use default scenarios
    const defaultScenarios = await Scenario.find({
      company: { $exists: false },
      module: new Types.ObjectId(moduleId),
      product: new Types.ObjectId(productId),
      isActive: true,
    })
      .populate<{ persona: IPersona }>({
        path: 'persona',
      })
      .lean();
    if (defaultScenarios.length === 0) {
      return ALL_PERSONA_CONFIGURATIONS;
    }
    return transformScenariosToPersonas(defaultScenarios, languageCode);
  }

  // has custom scenarios
  const customScenarios = await Scenario.find({
    company: new Types.ObjectId(companyId),
    module: new Types.ObjectId(moduleId),
    product: new Types.ObjectId(productId),
    isActive: true,
  })
    .populate<{ persona: IPersona }>({
      path: 'persona',
    })
    .lean();
  return transformScenariosToPersonas(customScenarios, languageCode);
}

type InputScenario = Omit<FlattenMaps<ScenarioDocument>, 'persona'> & {
  persona: IPersona;
};

function transformScenariosToPersonas(
  scenarios: InputScenario[],
  languageCode: string,
) {
  return scenarios
    .filter((scenario) => scenario.persona)
    .map((scenario) => {
      const { localizations: personaLocalizations, ...restOfPersona } =
        scenario.persona;

      // Get localized persona content (excluding details for now)
      const localizedPersona =
        languageCode !== 'en' && personaLocalizations?.[languageCode]
          ? personaLocalizations[languageCode]
          : {};

      // Extract details separately to merge them properly
      const {
        details: localizedPersonaDetails,
        ...localizedPersonaWithoutDetails
      } = localizedPersona as any;

      const persona = {
        scenarioId: scenario._id,
        ...restOfPersona,
        ...localizedPersonaWithoutDetails,
      };

      const {
        scenarioDetails,
        localizations: scenarioLocalizations,
        difficultyLevel,
      } = scenario;

      const localizedScenarioDetails =
        languageCode !== 'en' && scenarioLocalizations?.[languageCode]
          ? scenarioLocalizations[languageCode]
          : {};

      // Merge details objects properly - base details, then persona localized details, then scenario details
      persona.details = {
        ...(restOfPersona.details || {}),
        ...(localizedPersonaDetails || {}),
        ...(scenarioDetails || {}),
        ...(localizedScenarioDetails || {}),
      };

      if (difficultyLevel) {
        persona.details.difficultyLevel = difficultyLevel;
      }

      return persona;
    });
}

export const getPersonaVoiceByAccent = (gender: string, accent: string) => {
  const voiceIds: Record<string, Record<string, string>> = {
    male: {
      british: ELEVEN_LABS_MALE_BRITISH_ACCENT_VOICE_ID,
      american: ELEVEN_LABS_MALE_AMERICAN_ACCENT_VOICE_ID,
      singaporean: ELEVEN_LABS_MALE_VOICE_ID,
      default: ELEVEN_LABS_MALE_VOICE_ID,
    },
    female: {
      british: ELEVEN_LABS_FEMALE_BRITISH_ACCENT_VOICE_ID,
      american: ELEVEN_LABS_FEMALE_VOICE_ID,
      singaporean: ELEVEN_LABS_FEMALE_SINGAPOREAN_VOICE_ID_2,
      default: ELEVEN_LABS_FEMALE_VOICE_ID,
    },
  };

  return voiceIds[gender]?.[accent] || voiceIds[gender]?.default;
};

export const convertSupportingFieldsToDetails = (
  supportingFields: Array<{ fieldName: string; value: string }>,
): PersonaDetails => {
  const details: PersonaDetails = {};

  supportingFields.forEach((field) => {
    // Handle keyPriorities as array (split by comma or newline)
    if (field.fieldName === 'keyPriorities') {
      const priorities = parseBulletPoints(field.value);
      if (priorities.length > 0) {
        details.keyPriorities = priorities;
      }
    } else {
      // All other fields: directly assign (names already match)
      (details as any)[field.fieldName] = field.value;
    }
  });

  return details;
};

// Helper function to parse bullet points into an array
export const parseBulletPoints = (text: string): string[] => {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // Remove bullet point characters (•, -, *, etc.)
      return line.replace(/^[•\-*]\s*/, '').trim();
    })
    .filter((line) => line.length > 0);
};

/**
 * Determines age group from age number
 */
export const getAgeGroup = (age: number): 'young' | 'older' => {
  // Simplified to young/older since most voice sets only have these two categories
  return age < 40 ? 'young' : 'older';
};

/**
 * Get default voice provider IDs for all supported languages based on age and gender
 * This enables multi-language persona support with appropriate voice matching
 * Note: English (en) is excluded as it should be provided via the accent parameter
 */
export const getDefaultLanguageVoiceProviderIds = (
  age: number,
  gender: 'male' | 'female',
): Record<string, string> => {
  const ageGroup = getAgeGroup(age);
  const voiceMap: Record<string, string> = {};

  // English is NOT included here - it must be provided via the accent parameter

  // Indonesian (id)
  if (gender === 'male') {
    voiceMap.id =
      ageGroup === 'young'
        ? ELEVEN_LABS_INDONESIAN_YOUNG_MALE_VOICE_ID
        : ELEVEN_LABS_INDONESIAN_OLDER_MALE_VOICE_ID;
  } else {
    voiceMap.id =
      ageGroup === 'young'
        ? ELEVEN_LABS_INDONESIAN_YOUNG_FEMALE_VOICE_ID
        : ELEVEN_LABS_INDONESIAN_OLDER_FEMALE_VOICE_ID;
  }

  // Malay (ms)
  if (gender === 'male') {
    voiceMap.ms =
      ageGroup === 'young'
        ? ELEVEN_LABS_MALAYSIAN_YOUNG_MALE_VOICE_ID
        : ELEVEN_LABS_MALAYSIAN_OLDER_MALE_VOICE_ID;
  } else {
    voiceMap.ms =
      ageGroup === 'young'
        ? ELEVEN_LABS_MALAYSIAN_YOUNG_FEMALE_VOICE_ID
        : ELEVEN_LABS_MALAYSIAN_OLDER_FEMALE_VOICE_ID;
  }

  // Tagalog (tl)
  if (gender === 'male') {
    voiceMap.tl =
      ageGroup === 'young'
        ? ELEVEN_LABS_TAGALOG_YOUNG_MALE_VOICE_ID
        : ELEVEN_LABS_TAGALOG_OLDER_MALE_VOICE_ID;
  } else {
    voiceMap.tl =
      ageGroup === 'young'
        ? ELEVEN_LABS_TAGALOG_YOUNG_FEMALE_VOICE_ID
        : ELEVEN_LABS_TAGALOG_OLDER_FEMALE_VOICE_ID;
  }

  // Vietnamese (vi)
  if (gender === 'male') {
    voiceMap.vi =
      ageGroup === 'young'
        ? ELEVEN_LABS_VIETNAMESE_YOUNG_MALE_VOICE_ID
        : ELEVEN_LABS_VIETNAMESE_OLDER_MALE_VOICE_ID;
  } else {
    voiceMap.vi =
      ageGroup === 'young'
        ? ELEVEN_LABS_VIETNAMESE_YOUNG_FEMALE_VOICE_ID
        : ELEVEN_LABS_VIETNAMESE_OLDER_FEMALE_VOICE_ID;
  }

  // Thai (th) - Use Cartesia voices for better quality
  voiceMap.th =
    gender === 'male'
      ? CARTESIA_THAI_MALE_VOICE_ID
      : CARTESIA_THAI_FEMALE_VOICE_ID;

  // Traditional Chinese (cmn) - Use ElevenLabs voices
  if (gender === 'male') {
    voiceMap.cmn =
      ageGroup === 'young'
        ? ELEVEN_LABS_TRADITIONAL_CHINESE_YOUNG_MALE_VOICE_ID
        : ELEVEN_LABS_TRADITIONAL_CHINESE_OLDER_MALE_VOICE_ID;
  } else {
    voiceMap.cmn =
      ageGroup === 'young'
        ? ELEVEN_LABS_TRADITIONAL_CHINESE_YOUNGER_FEMALE_VOICE_ID
        : ELEVEN_LABS_TRADITIONAL_CHINESE_OLD_FEMALE_VOICE_ID;
  }

  // Cebuano (ceb) - Use Tagalog voices as fallback
  voiceMap.ceb = voiceMap.tl;

  return voiceMap;
};
