import { Document, model, PopulatedDoc, Schema, Types } from 'mongoose';
import { ModuleDocument } from './Module.js';
import { PersonaDocument } from './Persona.js';
import { ScorecardDocument } from './Scorecard.js';
import { SalesProductDocument } from './SalesProduct.js';
import { CompanyDocument } from './Company.js';
import { ManageUserDocument } from './ManageUser.js';
import { Timestamp } from '../types/timestamp.js';

export interface ScenarioLocalization {
  mainObjection?: string;
  salesDescription?: string;
  salesGoal?: string;
}

export type ScenarioLocalizations = {
  [languageCode: string]: ScenarioLocalization;
};

export interface IScenario extends Timestamp {
  _id: Types.ObjectId;
  module: PopulatedDoc<ModuleDocument>;
  persona: PopulatedDoc<PersonaDocument>;
  scorecard: PopulatedDoc<ScorecardDocument>;
  product: PopulatedDoc<SalesProductDocument>;
  company?: PopulatedDoc<CompanyDocument>;
  // persona details, from LLM preprocessing. previously difficulty-specific.ts
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  scenarioDetails: ScenarioLocalization;

  isActive: boolean;

  contextPrompt?: string;
  voicePrompt?: string;

  createdBy?: PopulatedDoc<ManageUserDocument>;
  updatedBy?: PopulatedDoc<ManageUserDocument>;
  // localized content
  localizations: ScenarioLocalizations;
}

// Define methods interface
export interface ScenarioMethods {
  getLocalizedContent(language?: string): ScenarioLocalization;
}

export type ScenarioDocument = IScenario & Document & Partial<ScenarioMethods>;

// Define localization schema for scenario-specific overlays
const scenarioLocalizationSchema = new Schema<ScenarioLocalization>(
  {
    mainObjection: { type: String, required: false },
    salesDescription: { type: String, required: false },
    salesGoal: { type: String, required: false },
  },
  { _id: false },
);

const schema = new Schema<ScenarioDocument>(
  {
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    persona: { type: Schema.Types.ObjectId, ref: 'Persona', required: true },
    scorecard: {
      type: Schema.Types.ObjectId,
      ref: 'Scorecard',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'SalesProduct',
      required: false,
    },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: false },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: false,
    },
    scenarioDetails: { type: scenarioLocalizationSchema, required: false },
    localizations: {
      type: Map,
      of: scenarioLocalizationSchema,
      required: false,
    },
    isActive: { type: Boolean, default: false },

    contextPrompt: { type: String, required: false },
    voicePrompt: { type: String, required: false },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'ManageUser',
      required: false,
    },
    updatedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  },
);

// Index for efficient product-based queries (roleplay counting)
schema.index({ product: 1 });

// Compound index for company and product queries
schema.index({ company: 1, product: 1 });

// Helper method to get content in a specific language
schema.methods.getLocalizedContent = function (
  language: string = 'en',
): ScenarioLocalization {
  const normalizedLang = language.toLowerCase();

  // If requesting English or no localized content exists, return default
  if (normalizedLang === 'en' || !this.localizations) {
    return {
      mainObjection: this.scenarioDetails?.mainObjection,
      salesDescription: this.scenarioDetails?.salesDescription,
      salesGoal: this.scenarioDetails?.salesGoal,
    };
  }

  // Return localized content if available (using .get() for Map)
  const localized = this.localizations.get(normalizedLang);
  if (localized) {
    return {
      mainObjection: localized.mainObjection,
      salesDescription: localized.salesDescription,
      salesGoal: localized.salesGoal,
    };
  }

  // Try base language code (e.g., 'th' from 'th-TH')
  const baseLanguage = normalizedLang.split('-')[0];
  const baseLocalized = this.localizations.get(baseLanguage);
  if (baseLocalized) {
    return {
      mainObjection: baseLocalized.mainObjection,
      salesDescription: baseLocalized.salesDescription,
      salesGoal: baseLocalized.salesGoal,
    };
  }

  // Fallback to default scenarioDetails
  return {
    mainObjection: this.scenarioDetails?.mainObjection,
    salesDescription: this.scenarioDetails?.salesDescription,
    salesGoal: this.scenarioDetails?.salesGoal,
  };
};

export const Scenario = model<ScenarioDocument>('Scenario', schema);
