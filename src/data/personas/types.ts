import { loadTranslations } from '../../locale/translation.js';
import { IPersona } from '../../models/Persona.js';

/**
 * Base persona information that doesn't change across languages
 */
export interface BasePersona {
  id: string;
  friendlyId: string;
  name: string;
  age: number | null;
  image: string;
  voiceId: string; // Default voice ID
  gender: 'male' | 'female';
  annualIncome: number | null;
  monthlyIncome?: number | null;
  currency?: string;
  bblFinancialProfile?: BblFinancialProfile;
  hsbcFinancialProfile?: HsbcFinancialProfile;
  greatEasternFinancialProfile?: GreatEasternFinancialProfile;
}

type ExpectedLifestyle = 'budget' | 'comfortable' | 'premium';

/**
 * Structured financial profile data for sales recommendations based on questionnaire sections
 */
export interface BblFinancialProfile {
  // BBL-specific profile data (as shown in SelectClient UI)
  profileData?: {
    aum?: string; // Assets Under Management range, e.g., "10-12M THB"
    numberOfKids?: number; // Number of children (numeric data, not localized)
    // Localized fields (merged from LocalizedPersonaContent during buildPersonaDocument)
    demographicProfile?: string; // Localized demographic description
    behaviorProfile?: string; // Localized behavior description
    workHistory?: string; // Localized work history description
    liquidityNeeds?: string; // Localized liquidity needs description
    riskAppetite?: string; // Localized risk appetite description
    investmentFrequency?: string; // Localized investment frequency description
    keyLifestyleExpenditure?: string; // Localized lifestyle expenditure description
    discPersonality?: string; // DISC personality type (Dominance, Influence, Steadiness, Conscientiousness)
  };

  educationGoal?: {
    kidAge?: number;
    preferredLocation?: string;
    educationLevel?: string;
    schoolType?: string;
    expectedLifestyleForKids?: ExpectedLifestyle;
    protectionPercentage?: number;
    willingToTakeProductRiskForCheaperPremium?: boolean;
    prefersSingleInstrument?: boolean;
    upfrontInvestment?: number;
  };
  retirementGoal?: {
    retirementAge?: number;
    payoutYears?: number;
    retirementLifestyle?: ExpectedLifestyle;
    protectionPercentage?: number;
    prefersRegularPayouts?: boolean;
    prefersShorterPaymentPeriod?: boolean;
    upfrontInvestment?: number;
  };
  legacyGoal?: {
    numberOfBeneficiaries?: number;
    beneficiaryLifestyle?: ExpectedLifestyle;
    protectionDuration?: number;
    protectionPercentage?: number;
    willingToTakeProductRiskForCheaperPremium?: boolean;
    prefersSingleInstrument?: boolean;
    upfrontInvestment?: number;
  };
}

export interface HsbcFinancialProfile {
  demographicProfile: string;
  annualIncome: string;
  hsbcTier: string;
  liquidityNeeds: string;
  keyLifestyleExpenditures: string;
}

export interface GreatEasternFinancialProfile {
  liquidityNeeds: string;
  lifestyleExpenditures: string;
}

/**
 * Localized content for a persona
 */
export interface LocalizedPersonaContent {
  name?: string; // Localized name (optional, falls back to base name)
  occupation: string;
  description: string;
  voiceId?: string; // Language-specific voice ID (optional, falls back to base voiceId)
  bblFinancialProfile?: {
    profileData?: {
      demographicProfile?: string; // Localized demographic description
      behaviorProfile?: string; // Localized behavior description
      workHistory?: string; // Localized work history description
      liquidityNeeds?: string; // Localized liquidity needs description
      riskAppetite?: string; // Localized risk appetite description
      investmentFrequency?: string; // Localized investment frequency description
      keyLifestyleExpenditure?: string; // Localized lifestyle expenditure description
      discPersonality?: string; // Localized personality description
    };
  };
  hsbcFinancialProfile?: HsbcFinancialProfile;
  details: {
    location: string;
    education: string;
    occupation: string;
    workHistory?: string;
    financialSituation: string;
    liquidityNeeds?: string;
    keyPriorities: string[];
    productKnowledge: string;
    mainObjection: string;
    salesDescription: string;
    difficultyLevel?: 'easy' | 'medium' | 'hard';
    // Optional Alibaba-specific fields
    demographics?: string; // e.g., "Male, married, 2 children (ages 15 and 10)"
    companyProfile?: string; // Combined company name, industry, and profile
    projectContext?: string; // Combined project background, current setup, and stage
    annualBudget?: string; // e.g., "20,000 USD"
    competitorLandscape?: string; // e.g., "Exploring AWS, Azure, GCP"
    // Expected queries/questions the persona might ask (for agent prompts, not displayed in UI)
    expectedQueries?: string[];
    // Update for Prudential PH
    familySituations?: string[]; // e.g., "Married with 2 children in school"
  };
  personalityDetails: {
    persona: string;
    communicationStyle: string[];
    decisionMaking: string[];
  };
}

/**
 * Complete persona definition with all language variants
 */
export interface PersonaConfiguration {
  base: BasePersona;
  localized: {
    en: LocalizedPersonaContent;
    id?: LocalizedPersonaContent;
    ms?: LocalizedPersonaContent;
    tl?: LocalizedPersonaContent;
    vi?: LocalizedPersonaContent;
    th?: LocalizedPersonaContent;
    ceb?: LocalizedPersonaContent;
    cmn?: LocalizedPersonaContent;
    yue?: LocalizedPersonaContent;
    ko?: LocalizedPersonaContent;
  };
}

/**
 * Utility type for supported language codes
 */
export type SupportedLanguage =
  | 'en'
  | 'id'
  | 'ms'
  | 'tl'
  | 'vi'
  | 'th'
  | 'ceb'
  | 'cmn'
  | 'yue'
  | 'ko';

/**
 * Helper function to build a PersonaDocument from configuration
 */
export function buildPersonaDocument(
  config: PersonaConfiguration,
  language: SupportedLanguage = 'en',
  moduleId?: string,
): Omit<IPersona, 'localizations'> {
  const localizedContent = config.localized[language] || config.localized.en;

  const { id, ...restConfig } = config.base;

  const output: Omit<IPersona, 'localizations'> = {
    ...restConfig,
    _id: config.base.id,
    ...localizedContent,
    // Use localized voiceId if available, otherwise fall back to base voiceId
    voice: undefined,
  };

  // Merge base and localized financial profile data
  if (config.base.bblFinancialProfile || localizedContent.bblFinancialProfile) {
    output.bblFinancialProfile = {
      ...config.base.bblFinancialProfile,
      ...localizedContent.bblFinancialProfile,
      profileData: {
        ...config.base.bblFinancialProfile?.profileData,
        ...localizedContent.bblFinancialProfile?.profileData,
      },
    };
  }

  const translations = loadTranslations(language);

  // Set salesGoal from translations - frontend will handle concatenation
  const goal = translations?.common.goals[moduleId || 'default'];
  if (goal) {
    output.details.salesGoal = `${goal}.`;
  }

  return output;
}

/**
 * Helper function to get all language variants of a persona
 */
export function getAllPersonaVariants(
  config: PersonaConfiguration,
): Record<SupportedLanguage, Omit<IPersona, 'localizations'>> {
  return {
    en: buildPersonaDocument(config, 'en'),
    id: buildPersonaDocument(config, 'id'),
    ms: buildPersonaDocument(config, 'ms'),
    tl: buildPersonaDocument(config, 'tl'),
    vi: buildPersonaDocument(config, 'vi'),
    th: buildPersonaDocument(config, 'th'),
    ceb: buildPersonaDocument(config, 'ceb'),
    cmn: buildPersonaDocument(config, 'cmn'),
    yue: buildPersonaDocument(config, 'yue'),
    ko: buildPersonaDocument(config, 'ko'),
  };
}
