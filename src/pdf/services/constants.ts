/**
 * Shared constants for assessment section orders and configurations
 */

export interface SectionConfig {
  key: string;
  title: string;
  weight?: number;
}

export const MSIG_SECTION_ORDER: SectionConfig[] = [
  {
    key: 'introduction',
    title: 'Introduction',
    weight: 5,
  },
  {
    key: 'presentation',
    title: 'Presentation',
    weight: 40,
  },
  {
    key: 'communication',
    title: 'Communication',
    weight: 10,
  },
  {
    key: 'salesConfirmation',
    title: 'Sales Confirmation',
    weight: 20,
  },
  {
    key: 'mandatoryDisclosure',
    title: 'Mandatory Disclosure',
    weight: 20,
  },
  {
    key: 'closure',
    title: 'Closure',
    weight: 5,
  },
];

export const MSIG_SECTIONS = MSIG_SECTION_ORDER.map((section) => section.key);

export const MANULIFE_SECTION_ORDER: SectionConfig[] = [
  {
    key: 'introduction',
    title: 'Introduction to Manulife & Facts of Life',
  },
  {
    key: 'financialNeeds',
    title: 'Financial Needs, Goal Guide and Conclusion',
  },
];

export const MANULIFE_SECTIONS = MANULIFE_SECTION_ORDER.map(
  (section) => section.key,
);

/**
 * Translation keys required for PDF generation
 */
export const REQUIRED_TRANSLATION_KEYS = [
  'assessment.overallScore',
  'assessment.salesTechnique',
  'assessment.productKnowledge',
  'assessment.summary',
  'assessment.suggestedNextSteps',
  'modules.groups.module',
  'products.product',
  'personas.persona',
  'assessment.why',
  'assessment.strengths',
  'assessment.toImprove',
  'assessment.correction',
  'assessment.suggestion',
  'assessment.standings.clientVerification',
  'assessment.standings.objectionHandling',
  'assessment.standings.dynamicFramework',
  'assessment.standings.mandatory',
  'assessment.completed',
  'assessment.standings.incomplete',
  'assessment.standings.intermediate',
  'assessment.standings.beginner',
  'assessment.standings.expert',
  'assessment.overview',
  'assessment.nextSteps',
  'assessment.prudentialMandatoryNotMet.summary',
  'assessment.prudentialMandatoryNotMet.nextStepsTitle',
  'assessment.prudentialMandatoryNotMet.suggestedNextStep',
  'assessment.standings.currentSession',
  'assessment.standings.notAvailable',
  'assessment.title',
  'assessment.completedOn',
  'ui.hupoLogoAlt',
  'ui.companyLogoAlt',
  'assessment.salesTechniqueDescription',
  'assessment.ratings.poor',
  'assessment.ratings.fair',
  'assessment.ratings.good',
  'assessment.ratings.excellent',
  'assessment.introduction',
  'assessment.presentation',
  'assessment.communication',
  'assessment.salesConfirmation',
  'assessment.mandatoryDisclosure',
  'assessment.closure',
  'assessment.salesNovice',
  'assessment.skilledAdvisor',
  'assessment.strategicConsultant',
  'assessment.emergingSeller',
  'assessment.mandatoryFailed',
  'assessment.msigFailedNextStepsTitle',
  'assessment.msigMandatoryNotMetSummary',
  'assessment.msigMandatoryNotMetNextStep',
  'assessment.manulifeFinancialNeeds',
  'assessment.advisoryTechnique',
  'assessment.processAdherence',
  'assessment.communicationAndPresence',
  'assessment.advisoryTechniqueDescription',
  'assessment.processAdherenceDescription',
  'assessment.communicationAndPresenceDescription',
] as const;
