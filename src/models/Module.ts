import { PopulatedDoc, Schema, Types, model, Document } from 'mongoose';
import { SalesProductDocument } from './SalesProduct.js';
import { SalesFramework } from '../frameworks/types.js';
import { CompanyDocument } from './Company.js';

// Localization type for module translations
export type ModuleLocalization = {
  title?: string;
  description?: string;
  scenarioSetup?: string;
  objectives?: string[];
};

// Localizations structure keyed by language code (e.g., 'en', 'id', 'fr')
export type ModuleLocalizations = {
  [languageCode: string]: ModuleLocalization;
};

export type IModule = {
  _id: Types.ObjectId;
  // UI fields
  title: string;
  description: string; // known as "one-liner description" on the UI
  // will have to be sourced from preprocessing later
  friendlyId: string;
  icon: string;
  group?: string;
  iconBgColor?: string;
  // misc fields
  company?: PopulatedDoc<CompanyDocument>;
  fields: {
    shown: string[];
    hidden: string[];
  };
  scenarioSetup?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // localized content
  localizations?: ModuleLocalizations;
  // OLD LEGACY FIELDS
  products?: SalesProductDocument[];
  framework?: SalesFramework;
  objectives?: string[];
  singleScenario?: boolean;
};

// Define methods interface
export interface ModuleMethods {
  getLocalizedContent(language?: string): ModuleLocalization;
}

export type ModuleDocument = IModule & Document & Partial<ModuleMethods>;

const schema = new Schema<ModuleDocument>(
  {
    friendlyId: { type: String, required: true },
    icon: { type: String, required: true },
    iconBgColor: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    group: { type: String },
    fields: {
      type: Object,
      default: { shown: [], hidden: [] },
    },
    framework: { type: String },
    objectives: [{ type: String }],
    singleScenario: { type: Boolean },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: false },
    scenarioSetup: { type: String },
    localizations: {
      type: Map,
      of: new Schema(
        {
          title: { type: String },
          description: { type: String },
          scenarioSetup: { type: String },
          objectives: { type: [String] },
        },
        { _id: false },
      ),
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient friendlyId queries
schema.index({ friendlyId: 1 });

// Helper method to get content in a specific language
schema.methods.getLocalizedContent = function (
  language: string = 'en',
): ModuleLocalization {
  const normalizedLang = language.toLowerCase();

  // If requesting English or no localized content exists, return default
  if (normalizedLang === 'en' || !this.localizations) {
    return {
      title: this.title,
      description: this.description,
      scenarioSetup: this.scenarioSetup,
      objectives: this.objectives,
    };
  }

  // Return localized content if available
  const localized = this.localizations.get(normalizedLang);
  if (localized) {
    return {
      title: localized.title ?? this.title,
      description: localized.description ?? this.description,
      scenarioSetup: localized.scenarioSetup ?? this.scenarioSetup,
      objectives: localized.objectives ?? this.objectives,
    };
  }

  // Try base language code (e.g., 'id' from 'id-ID')
  const baseLanguage = normalizedLang.split('-')[0];
  const baseLocalized = this.localizations.get(baseLanguage);
  if (baseLocalized) {
    return {
      title: baseLocalized.title ?? this.title,
      description: baseLocalized.description ?? this.description,
      scenarioSetup: baseLocalized.scenarioSetup ?? this.scenarioSetup,
      objectives: baseLocalized.objectives ?? this.objectives,
    };
  }

  // Fallback to defaults
  return {
    title: this.title,
    description: this.description,
    scenarioSetup: this.scenarioSetup,
    objectives: this.objectives,
  };
};

export const Module = model<ModuleDocument>('Module', schema);
