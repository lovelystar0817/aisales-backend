import { Types } from 'mongoose';
import { AssessmentType } from '../models/SalesSession.js';

export type CriterionCheckFunction = (assessmentData: any) => boolean;

// A single criterion for a standing tier.
// The `assessmentArea` is a dot-notation path to a value in the SalesSession.roleplay.feedback object.
// Examples: 'salesTechniques.fourCExecution.score', 'objectionHandling.successfulCount'
export interface StandingCriterion {
  assessmentArea: string;
  condition:
    | 'score-range'
    | 'min-score'
    | 'max-score'
    | 'is-true'
    | 'min-count'
    | 'custom'; // New condition for function-based check
  value?: any; // [min, max] for score-range, number for others, boolean for is-true
  check?: CriterionCheckFunction; // The function to execute for 'custom' condition
  description?: string;
  title?: string;
  details?: string[];
  subCriteria?: {
    title: string;
    description: string;
    items?: string[];
  }[];
}

// A tier of standing, e.g., 'Sales Novice' or 'Skilled Advisor'.
export interface StandingTier {
  name: string;
  level: number; // For ordering, e.g., 1 for Novice, 2 for Skilled, 3 for Consultant
  criteria: StandingCriterion[];
}

// Plain object representation of the configuration
export interface StandingConfigurationData {
  friendlyId: string;
  name: string;
  company: Types.ObjectId;
  module: string; // Corresponds to SalesSession.callType
  product?: string; // Product identifier string that matches productId
  tiers: StandingTier[];
  isActive?: boolean;
}

export type LocalizedStandingTier = {
  name: string;
  scoreRange?: string; // For score-based standings (e.g., "<85", "85-89")
  criteria: {
    description?: string;
    title?: string;
    details?: string[];
    subCriteria?: {
      title: string;
      description: string;
      items?: string[];
    }[];
  }[];
};

export type LocalizedStanding = {
  name: string;
  type?: 'tier-based' | 'score-based' | 'manulife-score-based'; // Distinguish between formats
  tiers: LocalizedStandingTier[];
  sharedCriteria?: {
    title?: string;
    description?: string;
    details?: string[];
    subCriteria?: {
      title: string;
      description: string;
      items?: string[];
    }[];
  }[]; // For MSIG unified criteria
};

export type StandingConfiguration = {
  base: {
    friendlyId: string;
    company: Types.ObjectId;
    module: string;
    product?: string;
    assessmentType?: AssessmentType;
    type?: 'tier-based' | 'score-based' | 'manulife-score-based';
    tiers: {
      level: number;
      scoreRange?: string;
      criteria: {
        assessmentArea: string;
        condition:
          | 'score-range'
          | 'min-score'
          | 'max-score'
          | 'is-true'
          | 'min-count'
          | 'custom';
        value?: any;
        check?: CriterionCheckFunction;
      }[];
    }[];
    sharedCriteria?: {
      assessmentArea: string;
      condition:
        | 'score-range'
        | 'min-score'
        | 'max-score'
        | 'is-true'
        | 'min-count'
        | 'custom';
      value?: any;
      check?: CriterionCheckFunction;
    }[];
  };
  localized: {
    en: LocalizedStanding;
    id?: LocalizedStanding;
    ms?: LocalizedStanding;
    tl?: LocalizedStanding;
    vi?: LocalizedStanding;
    ceb?: LocalizedStanding;
    [key: string]: LocalizedStanding | undefined;
  };
};
