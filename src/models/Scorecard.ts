import { model, PopulatedDoc, Schema, Types } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';
import { CompanyDocument } from './Company.js';
import { ManageUser, ManageUserDocument } from './ManageUser.js';

// Constants
const SECTION_TYPES = [
  'custom',
  'product-knowledge',
  'communication-presence',
] as const;

const ASSESSMENT_TYPES = ['score', 'score-with-badge', 'criteria'] as const;

export type ScorecardSectionType = (typeof SECTION_TYPES)[number];
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

// Interfaces
export interface ScorecardCriteria {
  title: string;
  description: string;
  prompt?: string;
}

export interface ScorecardSection {
  name: string;
  sectionType: ScorecardSectionType;
  criteria: ScorecardCriteria[];
  prompt?: string;
}

export interface ScorecardLocalization {
  name: string;
  sections?: ScorecardSection[];
}

export interface ScorecardLocalizations {
  [languageCode: string]: ScorecardLocalization;
}

export interface IScorecard extends Timestamp {
  _id: Types.ObjectId;
  name: string;
  friendlyId: string;
  company?: PopulatedDoc<CompanyDocument>;
  sections?: ScorecardSection[];
  assessmentType?: AssessmentType;
  scormPolicy?: {
    enabled: boolean;
  };
  localizations?: ScorecardLocalizations;
  isCustom?: boolean;
  createdBy?: PopulatedDoc<ManageUserDocument>;
  updatedBy?: PopulatedDoc<ManageUserDocument>;
}

export type ScorecardDocument = IScorecard & Document;

const criteriaSchema = {
  title: { type: String, required: true },
  description: { type: String, required: true },
  prompt: { type: String },
};

const sectionSchema = {
  name: { type: String, required: true },
  sectionType: {
    type: String,
    enum: SECTION_TYPES,
    required: true,
  },
  criteria: [criteriaSchema],
  prompt: { type: String },
};

const schema = new Schema(
  {
    name: { type: String, required: true },
    friendlyId: { type: String, required: true, unique: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: false },
    sections: [sectionSchema],
    assessmentType: {
      type: String,
      enum: ASSESSMENT_TYPES,
    },
    scormPolicy: {
      enabled: { type: Boolean },
    },
    localizations: {
      type: Map,
      of: new Schema(
        {
          name: { type: String },
          sections: [sectionSchema],
        },
        { _id: false },
      ),
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: ManageUser.modelName,
      required: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: ManageUser.modelName,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
schema.index({ company: 1, friendlyId: 1 });

export const Scorecard = model<ScorecardDocument>('Scorecard', schema);
