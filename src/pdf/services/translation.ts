/**
 * Translation service for PDF generation
 * Centralizes translation fetching logic
 */

import { getTranslation } from '../../locale/translation.js';
import { REQUIRED_TRANSLATION_KEYS } from './constants.js';

export interface PDFTranslations {
  // Core assessment translations
  overallScore: string;
  salesTechnique: string;
  salesTechniqueDescription: string;
  productKnowledge: string;
  productKnowledgeDescription: string;
  technicalKnowledge: string;
  technicalKnowledgeDescription: string;
  operationalKnowledge: string;
  summary: string;
  suggestedNextSteps: string;
  module: string;
  product: string;
  persona: string;
  why: string;
  strengths: string;
  toImprove: string;
  correction: string;
  suggestion: string;

  // BBL and HSBC specific
  advisoryTechnique: string;
  advisoryTechniqueDescription: string;
  processAdherence: string;
  processAdherenceDescription: string;
  communicationAndPresence: string;
  communicationAndPresenceDescription: string;
  relationshipManagement: string;
  relationshipManagementDescription: string;

  // Prudential-specific
  clientVerification: string;
  objectionHandling: string;
  dynamicFramework: string;
  threeFExecution: string;
  fourCExecution: string;
  mandatory: string;
  completed: string;
  incomplete: string;
  intermediate: string;
  beginner: string;
  expert: string;
  overview: string;
  nextSteps: string;
  prudentialMandatoryNotMet: string;
  prudentialNextStepsTitle: string;
  prudentialSuggestedNextStep: string;
  standings: string;
  sessionStanding: string;
  notAvailable: string;

  // Header translations
  title: string;
  completedOn: string;
  hupoLogoAlt: string;
  companyLogoAlt: string;

  // Score ratings
  ratings: {
    poor: string;
    fair: string;
    good: string;
    excellent: string;
  };

  // MSIG specific
  introduction: string;
  presentation: string;
  communication: string;
  salesConfirmation: string;
  mandatoryDisclosure: string;
  closure: string;
  salesNovice: string;
  skilledAdvisor: string;
  strategicConsultant: string;
  emergingSeller: string;
  mandatoryFailed: string;
  msigNextStepsTitle: string;
  msigMandatoryNotMetSummary: string;
  msigMandatoryNotMetNextStep: string;

  // Manulife specific
  financialNeeds: string;

  // AXA PH specific
  softSkills: string;
  knowledgeSkills: string;

  // Additional
  [key: string]: any;
}

/**
 * Fetches all required translations for PDF generation
 */
export function getPDFTranslations(languageCode: string): PDFTranslations {
  return {
    overallScore: getTranslation(
      languageCode,
      'assessment.overallScore',
      'Overall score',
    ),
    salesTechnique: getTranslation(
      languageCode,
      'assessment.salesTechnique',
      'Sales technique',
    ),
    salesTechniqueDescription: getTranslation(
      languageCode,
      'assessment.salesTechniqueDescription',
      'Measures the ability to follow set framework to drive a successful conversation.',
    ),
    productKnowledge: getTranslation(
      languageCode,
      'assessment.productKnowledge',
      'Product knowledge',
    ),
    productKnowledgeDescription: getTranslation(
      languageCode,
      'assessment.productKnowledgeDescription',
      'Measures the ability to accurately convey product features, benefits, and key details.',
    ),
    technicalKnowledge: getTranslation(
      languageCode,
      'assessment.technicalKnowledge',
      'Technical knowledge',
    ),
    technicalKnowledgeDescription: getTranslation(
      languageCode,
      'assessment.technicalKnowledgeDescription',
      'Measures the ability to accurately convey product features, benefits, and key details.',
    ),
    operationalKnowledge: getTranslation(
      languageCode,
      'assessment.operationalKnowledge',
      'Operational knowledge',
    ),
    summary: getTranslation(languageCode, 'assessment.summary', 'Summary'),
    suggestedNextSteps: getTranslation(
      languageCode,
      'assessment.suggestedNextSteps',
      'Suggested next steps',
    ),
    module: getTranslation(languageCode, 'modules.groups.module', 'Module'),
    product: getTranslation(languageCode, 'products.product', 'Product'),
    persona: getTranslation(languageCode, 'personas.persona', 'Persona'),
    why: getTranslation(languageCode, 'assessment.why', 'Why'),
    strengths: getTranslation(
      languageCode,
      'assessment.strengths',
      'Strengths',
    ),
    toImprove: getTranslation(
      languageCode,
      'assessment.toImprove',
      'To improve',
    ),
    correction: getTranslation(
      languageCode,
      'assessment.correction',
      'Correction',
    ),
    suggestion: getTranslation(
      languageCode,
      'assessment.suggestion',
      'Suggestion',
    ),

    // Prudential-specific translations
    clientVerification: getTranslation(
      languageCode,
      'assessment.standings.clientVerification',
      'Client Verification',
    ),
    objectionHandling: getTranslation(
      languageCode,
      'assessment.objectionHandling',
      'Objection Handling',
    ),
    dynamicFramework: getTranslation(
      languageCode,
      'assessment.standings.dynamicFramework',
      'Framework Execution',
    ),
    threeFExecution: getTranslation(
      languageCode,
      'assessment.standings.threeFExecution',
      '3F Execution',
    ),
    fourCExecution: getTranslation(
      languageCode,
      'assessment.standings.fourCExecution',
      '4C Execution',
    ),
    mandatory: getTranslation(
      languageCode,
      'assessment.standings.mandatory',
      'Mandatory',
    ),
    completed: getTranslation(
      languageCode,
      'assessment.completed',
      'Completed',
    ),
    incomplete: getTranslation(
      languageCode,
      'assessment.standings.incomplete',
      'Incomplete',
    ),
    intermediate: getTranslation(
      languageCode,
      'assessment.standings.intermediate',
      'Intermediate',
    ),
    beginner: getTranslation(
      languageCode,
      'assessment.standings.beginner',
      'Beginner',
    ),
    expert: getTranslation(
      languageCode,
      'assessment.standings.expert',
      'Expert',
    ),
    overview: getTranslation(languageCode, 'assessment.overview', 'Overview'),
    nextSteps: getTranslation(
      languageCode,
      'assessment.nextSteps',
      'Next Steps',
    ),
    prudentialMandatoryNotMet: getTranslation(
      languageCode,
      'assessment.prudentialMandatoryNotMet.summary',
      'Mandatory criteria not met. Please complete client verification before proceeding.',
    ),
    prudentialNextStepsTitle: getTranslation(
      languageCode,
      'assessment.prudentialMandatoryNotMet.nextStepsTitle',
      'Next Steps',
    ),
    prudentialSuggestedNextStep: getTranslation(
      languageCode,
      'assessment.prudentialMandatoryNotMet.suggestedNextStep',
      'Complete client verification requirements and retry the assessment.',
    ),
    standings: getTranslation(
      languageCode,
      'assessment.standings.currentSession',
      'Current Standing',
    ),
    sessionStanding: getTranslation(
      languageCode,
      'assessment.standings.sessionStanding',
      'Session standing',
    ),
    notAvailable: getTranslation(
      languageCode,
      'assessment.standings.notAvailable',
      'Not Available',
    ),

    // Header translations
    title: getTranslation(
      languageCode,
      'assessment.title',
      'Roleplay Assessment',
    ),
    completedOn: getTranslation(
      languageCode,
      'assessment.completedOn',
      'Completed on',
    ),
    hupoLogoAlt: getTranslation(languageCode, 'ui.hupoLogoAlt', 'Hupo Logo'),
    companyLogoAlt: getTranslation(
      languageCode,
      'ui.companyLogoAlt',
      'Company Logo',
    ),

    // Score rating translations
    ratings: {
      poor: getTranslation(languageCode, 'assessment.ratings.poor', 'Poor'),
      fair: getTranslation(languageCode, 'assessment.ratings.fair', 'Fair'),
      good: getTranslation(languageCode, 'assessment.ratings.good', 'Good'),
      excellent: getTranslation(
        languageCode,
        'assessment.ratings.excellent',
        'Excellent',
      ),
    },

    // MSIG specific
    introduction: getTranslation(
      languageCode,
      'assessment.introduction',
      'Introduction',
    ),
    presentation: getTranslation(
      languageCode,
      'assessment.presentation',
      'Presentation',
    ),
    communication: getTranslation(
      languageCode,
      'assessment.communication',
      'Communication',
    ),
    salesConfirmation: getTranslation(
      languageCode,
      'assessment.salesConfirmation',
      'Sales Confirmation',
    ),
    mandatoryDisclosure: getTranslation(
      languageCode,
      'assessment.mandatoryDisclosure',
      'Mandatory Disclosure',
    ),
    closure: getTranslation(languageCode, 'assessment.closure', 'Closure'),
    salesNovice: getTranslation(
      languageCode,
      'assessment.salesNovice',
      'Sales Novice',
    ),
    skilledAdvisor: getTranslation(
      languageCode,
      'assessment.skilledAdvisor',
      'Skilled Advisor',
    ),
    strategicConsultant: getTranslation(
      languageCode,
      'assessment.strategicConsultant',
      'Strategic Consultant',
    ),
    emergingSeller: getTranslation(
      languageCode,
      'assessment.emergingSeller',
      'Emerging Seller',
    ),
    mandatoryFailed: getTranslation(
      languageCode,
      'assessment.mandatoryFailed',
      'Standing unavailable: Mandatory criteria not met.',
    ),
    msigNextStepsTitle: getTranslation(
      languageCode,
      'assessment.msigFailedNextStepsTitle',
      'To progress your standing, focus on:',
    ),
    msigMandatoryNotMetSummary: getTranslation(
      languageCode,
      'assessment.msigMandatoryNotMetSummary',
      "Your standing isn't available because you missed a mandatory criteria, which requires full adherence. Review your performance in other areas to see what went well, and make sure to complete all steps next time to receive your standing.",
    ),
    msigMandatoryNotMetNextStep: getTranslation(
      languageCode,
      'assessment.msigMandatoryNotMetNextStep',
      'Completing all mandatory criteria.',
    ),

    // Manulife specific
    financialNeeds: getTranslation(
      languageCode,
      'assessment.manulifeFinancialNeeds',
      'Financial Needs, Goal Guide and Conclusion',
    ),

    // AXA PH specific
    softSkills: getTranslation(
      languageCode,
      'assessment.softSkills',
      'Soft Skills',
    ),
    knowledgeSkills: getTranslation(
      languageCode,
      'assessment.knowledgeSkills',
      'Knowledge Skills',
    ),

    // AIA KO specific
    needsHealthExploration: getTranslation(
      languageCode,
      'assessment.needsHealthExploration',
      'Needs & Health Exploration',
    ),
    needsAnalysis: getTranslation(
      languageCode,
      'assessment.needsAnalysis',
      'Needs Analysis',
    ),
    productPitch: getTranslation(
      languageCode,
      'assessment.productPitch',
      'Product Pitch',
    ),
    // BBL and HSBC specific translations
    advisoryTechnique: getTranslation(
      languageCode,
      'assessment.advisoryTechnique',
      'Advisory Technique',
    ),
    advisoryTechniqueDescription: getTranslation(
      languageCode,
      'assessment.advisoryTechniqueDescription',
      'Measures the ability to use advisory techniques to drive a successful conversation.',
    ),
    processAdherence: getTranslation(
      languageCode,
      'assessment.processAdherence',
      'Process Adherence',
    ),
    processAdherenceDescription: getTranslation(
      languageCode,
      'assessment.processAdherenceDescription',
      'Measures how well company best-practice processes are followed to drive a successful conversation.',
    ),
    communicationAndPresence: getTranslation(
      languageCode,
      'assessment.communicationAndPresence',
      'Communication and Presence',
    ),
    communicationAndPresenceDescription: getTranslation(
      languageCode,
      'assessment.communicationAndPresenceDescription',
      'Measures how well communication and presence are used to drive a successful conversation.',
    ),
    relationshipManagement: getTranslation(
      languageCode,
      'assessment.relationshipManagement',
      'Relationship Management',
    ),
    relationshipManagementDescription: getTranslation(
      languageCode,
      'assessment.relationshipManagementDescription',
      'Measures the ability to build and maintain strong client relationships.',
    ),
  };
}
