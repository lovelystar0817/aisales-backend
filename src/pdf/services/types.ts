/**
 * Shared types for PDF generation
 * Simplified - components handle their own transformation
 */

export interface AssessmentIdentifier {
  label: string;
  text: string;
}

export interface SalesTechniqueSection {
  title: string;
  score: number;
  maxScore: number;
  why?: string;
  suggestion?: string;
  // Prudential-specific fields
  completed?: string[];
  toImprove?: string[];
  isMandatory?: boolean;
  status?: string;
  // MSIG/Manulife-specific fields
  notApplicable?: boolean;
  evaluations?: any[];
  hasFailedMandatory?: boolean;
  hasFailedItem?: boolean;
}

export interface ProductKnowledgeSection {
  title: string;
  score: number;
  maxScore: number;
  strengths: string[];
  toImprove: {
    text: string;
    correction: string | null;
    status?: 'warning' | 'info' | 'error';
  }[];
}

export type AssessmentType =
  | 'regular'
  | 'prudential'
  | 'msig'
  | 'msig-3f'
  | 'manulife'
  | 'bbl';
