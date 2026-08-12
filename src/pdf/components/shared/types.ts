/**
 * Shared types for PDF components
 */

import { ScoreRatingTranslations } from '../../utils/scoreRating.js';

export interface BaseTranslations {
  overallScore: string;
  salesTechnique: string;
  productKnowledge: string;
  summary: string;
  suggestedNextSteps: string;
  ratings: ScoreRatingTranslations;
  [key: string]: any;
}

export interface AssessmentIdentifier {
  label: string;
  text: string;
}

export interface BaseOverallProps {
  assessmentIdentifiers: AssessmentIdentifier[];
  summary: string;
  nextSteps: string[];
  translations: BaseTranslations;
}

export interface BaseSalesTechniqueProps {
  overallScore: number;
  maxScore: number;
  description: string;
  translations: BaseTranslations;
}

export interface BaseProductKnowledgeProps {
  overallScore: number;
  maxScore: number;
  description: string;
  translations: BaseTranslations;
}
