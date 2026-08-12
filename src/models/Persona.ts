import { Document, PopulatedDoc, Schema, Types, model } from 'mongoose';
import { ModuleDocument } from './Module.js';
import { Company, CompanyDocument } from './Company.js';
import { ManageUser, ManageUserDocument } from './ManageUser.js';
import { VoiceDocument } from './Voice.js';
import {
  BblFinancialProfile,
  HsbcFinancialProfile,
  GreatEasternFinancialProfile,
} from '../data/personas/types.js';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';

export interface PersonaDetails {
  // UI fields
  location?: string;
  education?: string;
  workHistory?: string;
  financialSituation?: string;
  liquidityNeeds?: string;
  keyPriorities?: string[];
  companySizeAndSpend?: string;
  // Alibaba-specific fields
  demographics?: string;
  companyProfile?: string;
  projectContext?: string;
  annualBudget?: string;
  competitorLandscape?: string;
  expectedQueries?: string[]; // Questions persona might ask (for agent prompts, not UI)
  // OLD LEGACY FIELDS
  occupation?: string;
  productKnowledge?: string;
  mainObjection?: string;
  salesDescription?: string;
  salesGoal?: string;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  familySituations?: string[];
}

export interface PersonaLocalization {
  name?: string;
  occupation: string;
  details: PersonaDetails;
  voice: PopulatedDoc<VoiceDocument>;
  // Legacy field for backward compatibility
  description?: string;
  personalityDetails?: {
    persona: string;
    communicationStyle: string[];
    decisionMaking: string[];
  };
}

export type PersonaLocalizations = Record<string, PersonaLocalization>;

export interface IPersona {
  _id: string;
  // UI fields
  name: string;
  age: number | null;
  occupation: string;
  image: string;
  gender: 'male' | 'female';
  details: PersonaDetails;
  // will have to be sourced from preprocessing later
  annualIncome: number | null;
  monthlyIncome?: number | null;
  voice: PopulatedDoc<VoiceDocument>;
  friendlyId: string;
  personalityDetails: {
    persona: string;
    communicationStyle: string[];
    decisionMaking: string[];
  };
  // misc fields
  company?: PopulatedDoc<CompanyDocument>;
  createdBy?: PopulatedDoc<ManageUserDocument>;
  createdAt?: Date;
  updatedBy?: PopulatedDoc<ManageUserDocument>;
  updatedAt?: Date;
  // localized content
  localizations: PersonaLocalizations;

  isCustom?: boolean;

  // OLD LEGACY FIELDS
  description?: string;
  module?: PopulatedDoc<ModuleDocument>;
  callGoal?: string;
  voiceId?: string;
  companyId?: string;
  meta?: Record<string, unknown>;
  bblFinancialProfile?: BblFinancialProfile;
  hsbcFinancialProfile?: HsbcFinancialProfile;
  greatEasternFinancialProfile?: GreatEasternFinancialProfile;
}

// Define methods interface
export interface PersonaMethods {
  getLocalizedContent(language?: string): PersonaLocalization | null;
}

export type PersonaDocument = IPersona & Document & PersonaMethods;

const schema = new Schema<PersonaDocument>(
  {
    friendlyId: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    occupation: { type: String, required: true },
    image: { type: String, required: true },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    details: { type: Object, required: false },
    annualIncome: { type: Number, required: false },
    monthlyIncome: { type: Number, required: false },
    voice: {
      type: Schema.Types.ObjectId,
      ref: 'Voice',
      required: false,
    },
    personalityDetails: { type: Object, required: false },
    // Explicit language keys instead of Map to avoid AdminJS regex bug with nested refs
    localizations: {
      type: new Schema(
        Object.fromEntries(
          SUPPORTED_LANGUAGES.map((lang) => [
            lang,
            {
              name: { type: String },
              occupation: { type: String },
              description: { type: String },
              details: { type: Object },
              personalityDetails: { type: Object },
              voice: { type: Schema.Types.ObjectId },
            },
          ]),
        ),
        { _id: false },
      ),
      required: false,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: Company.modelName,
      required: false,
      index: true,
    },

    isCustom: { type: Boolean, required: false, default: false },
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

    // Legacy fields
    voiceId: { type: String, required: false },
    description: { type: String, required: false },
    bblFinancialProfile: { type: Object, required: false },
    hsbcFinancialProfile: { type: Object, required: false },
    greatEasternFinancialProfile: { type: Object, required: false },
    meta: { type: Object, required: false },
  },
  { timestamps: true },
);

schema.index({ company: 1, friendlyId: 1 });

schema.pre('validate', function (next) {
  if (!this.friendlyId && this.name) {
    const slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const shortId = Math.random().toString(36).substring(2, 8);
    this.friendlyId = `${slug}-${shortId}`;
  }
  next();
});

// Helper method to get content in a specific language
schema.methods.getLocalizedContent = function (
  language: string = 'en',
): PersonaLocalization | null {
  const normalizedLang = language.toLowerCase();

  // If requesting English or no localized content exists, return default
  if (normalizedLang === 'en' || !this.localizations) {
    return {
      name: this.name,
      occupation: this.occupation,
      details: this.details,
      voice: this.voice,
      description: this.description,
      personalityDetails: this.personalityDetails,
    };
  }

  const base = {
    name: this.name,
    occupation: this.occupation,
    details: this.details,
    voice: this.voice,
    description: this.description,
    personalityDetails: this.personalityDetails,
  };

  // Return localized content if available (using bracket notation for plain Object)
  const localized =
    this.localizations[normalizedLang] ||
    this.localizations[normalizedLang.split('-')[0]];

  if (!localized) {
    return base;
  }

  // Merge: localized fields take precedence, undefined fields fall back to base
  const localizedObj =
    typeof localized.toObject === 'function' ? localized.toObject() : localized;
  const merged = { ...base };
  for (const key of Object.keys(localizedObj)) {
    if (localizedObj[key] != null) {
      (merged as any)[key] = localizedObj[key];
    }
  }
  return merged;
};

export const Persona = model<PersonaDocument>('Persona', schema);
