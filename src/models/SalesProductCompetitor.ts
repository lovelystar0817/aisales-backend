import { Schema, model, Document, PopulatedDoc, Types } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';
import { SalesProductDocument } from './SalesProduct.js';
import { CompanyDocument } from './Company.js';

export interface CompetitorProductData {
  name: string;
  company: string;
  type: string;
  keyFeatures: string[];
  strengths: string[];
  limitations: string[];
  positioningStrategy: string;
}

export interface SalesProductCompetitorLocalization {
  competitors: CompetitorProductData[];
}

export interface SalesProductCompetitorLocalizations {
  [languageCode: string]: SalesProductCompetitorLocalization;
}

export interface SalesProductCompetitorDocument extends Timestamp {
  _id?: string;
  product: PopulatedDoc<SalesProductDocument>;
  company?: PopulatedDoc<CompanyDocument>;
  competitors: CompetitorProductData[];
  source?: string;
  localizations?: SalesProductCompetitorLocalizations;
}

const competitorDataSchema = new Schema(
  {
    name: { type: String, required: true },
    company: { type: String, required: true },
    type: { type: String, required: true },
    keyFeatures: [{ type: String, required: true }],
    strengths: [{ type: String, required: true }],
    limitations: [{ type: String, required: true }],
    positioningStrategy: { type: String, required: true },
  },
  { _id: false },
);

const schema = new Schema<SalesProductCompetitorDocument>(
  {
    product: { type: Types.ObjectId, ref: 'SalesProduct', required: true }, // References SalesProduct.friendlyId
    company: { type: Types.ObjectId, ref: 'Company', required: false }, // Which company this CI is for
    competitors: [competitorDataSchema], // Default English content
    source: { type: String },
    localizations: {
      type: Map,
      of: {
        competitors: [competitorDataSchema],
      },
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
schema.index({ product: 1, company: 1 }, { unique: true });
schema.index({ product: 1 });
schema.index({ company: 1 });

export const SalesProductCompetitor = model<SalesProductCompetitorDocument>(
  'SalesProductCompetitor',
  schema,
);
