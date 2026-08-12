import { type PopulatedDoc, Schema, Types, model, Document } from 'mongoose';
import { ModuleDocument } from './Module.js';
import { CompanyDocument } from './Company.js';
import { ManageUserDocument } from './ManageUser.js';
import { Timestamp } from '../types/timestamp.js';

export enum ProductType {
  OWN = 'own',
  COMPETITOR = 'competitor',
}

export interface SalesProductLocalization {
  name: string;
  description: string;
  keyFeatures?: string[];
  featureHighlight?: {
    title: string;
    description: string;
  };
  evaluationFocus?: string[];
  callCriteria?: CallCriteria;
}

export type SalesProductLocalizations = {
  [languageCode: string]: SalesProductLocalization;
};

export interface CallCriteria {
  title: string;
  description: string;
  criteria: string[];
  markdown?: string;
}

export interface ISalesProduct extends Timestamp {
  _id?: Types.ObjectId;
  friendlyId: string;
  name: string;
  knowledgePrompt?: string;
  productType: ProductType;
  keyFeatures?: string[];
  featureHighlight?: {
    title: string;
    description: string;
  };
  evaluationFocus?: string[];
  callCriteria?: CallCriteria;
  salesTarget: 'individual' | 'corporate';
  markdown?: string;
  // misc fields
  company?: PopulatedDoc<CompanyDocument>;
  createdBy?: PopulatedDoc<ManageUserDocument>;
  updatedBy?: PopulatedDoc<ManageUserDocument>;
  // localized content
  localizations?: SalesProductLocalizations;
  // Cached counts and flags for performance
  documentCount?: number;
  roleplayCount?: number;
  hasCompetitiveIntelligence?: boolean;

  isPlaceholderProduct?: boolean;
  // OLD LEGACY FIELDS
  modules?: PopulatedDoc<ModuleDocument>[];
}

export interface LegacySalesProduct {
  _id: string; // ObjectId as string (like mongoose document)
  friendlyId: string;
  name: string;
  // prompt: string;
  knowledgePrompt?: string;
  productType: ProductType;
  modules?: string[];
  keyFeatures?: string[];
  featureHighlight?: {
    title: string;
    description: string;
  };
  salesTarget: 'individual' | 'corporate';
  callCriteria?: {
    [languageCode: string]: CallCriteria;
  };
  evaluationFocus?: string[];
  markdown?: string;
  titleBarHidden?: boolean; // whether to hide the product name in the roleplay title bar
}

export type SalesProductDocument = ISalesProduct & Document;

const schema = new Schema<SalesProductDocument>(
  {
    friendlyId: { type: String, required: true },
    name: { type: String, required: true },
    knowledgePrompt: { type: String },
    productType: {
      type: String,
      enum: Object.values(ProductType),
      default: ProductType.OWN,
    },
    keyFeatures: [{ type: String }],
    featureHighlight: {
      title: { type: String },
      description: { type: String },
    },
    evaluationFocus: [{ type: String }],
    callCriteria: {
      title: { type: String },
      description: { type: String },
      criteria: [{ type: String }],
      markdown: { type: String },
    },
    salesTarget: {
      type: String,
      enum: ['individual', 'corporate'],
      default: 'individual',
    },
    // Competitive intelligence moved to separate SalesProductCompetitor model
    localizations: {
      type: Map,
      of: {
        title: { type: String },
        description: { type: String },
        keyFeatures: [{ type: String }],
        featureHighlight: {
          title: { type: String },
          description: { type: String },
        },
        evaluationFocus: [{ type: String }],
        callCriteria: {
          title: { type: String },
          description: { type: String },
          criteria: [{ type: String }],
          markdown: { type: String },
        },
      },
    },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: false },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'ManageUser',
      required: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'ManageUser',
      required: false,
    },
    // Cached counts and flags for performance
    documentCount: { type: Number, default: 0 },
    roleplayCount: { type: Number, default: 0 },
    hasCompetitiveIntelligence: { type: Boolean, default: false },
    isPlaceholderProduct: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Compound unique index for per-company friendlyId uniqueness
schema.index({ friendlyId: 1, company: 1 }, { unique: true });

// Index for company-based queries
schema.index({ company: 1 });

export const SalesProduct = model<SalesProductDocument>('SalesProduct', schema);
