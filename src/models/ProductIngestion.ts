import { Schema, model, Document, Types } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';

export type IngestionStatus =
  | 'processing'
  | 'parsed'
  | 'failed'
  | 'published'
  | 'aborted';

export interface IProductIngestion extends Timestamp {
  _id: Types.ObjectId;
  ingestionId: string;
  draftId: string;
  company?: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: IngestionStatus;

  input: {
    name?: string;
    friendlyId?: string;
    languageCode?: string;
  };

  files: Array<{
    fileName: string;
    mimeType: string;
    size: number;
    s3Key: string;
  }>;

  // Raw extracted text per file
  extractedText?: Array<{
    fileName: string;
    text: string;
    wordCount: number;
    language?: string;
  }>;

  // Output 1: Schema fields from LLM
  extractedFields?: {
    name: string;
    friendlyId: string;
    productType: 'own' | 'competitor';
    salesTarget: 'individual' | 'corporate';
    keyFeatures: string[];
    featureHighlight: {
      title: string;
      description: string;
    };
    evaluationFocus: string[];
    callCriteria: {
      title: string;
      description: string;
      criteria: string[];
      markdown: string;
    };
    suggestedModules: string[];
    localizations?: Record<string, any>;
  };

  // Processing metadata
  processingMeta?: {
    totalTextLength: number;
    processingTimeMs: number;
    llmTokensUsed?: number;
    confidence?: Record<string, number>; // field -> confidence score
  };

  // Output 2: Embeddings for search/retrieval
  embeddings?: Array<{
    chunkId: string;
    text: string;
    embedding: number[];
  }>;

  processingErrors?: string[];
  processingWarnings?: string[];
  publishedProductId?: Types.ObjectId;

  // Additional metadata
  metadata?: {
    generateCompetitiveIntelligence?: boolean;
    duplicateCompetitiveIntelligence?: boolean;
    duplicateId?: string;
  };
}

export type ProductIngestionDocument = IProductIngestion & Document;

const schema = new Schema<ProductIngestionDocument>(
  {
    ingestionId: { type: String, required: true, unique: true },
    draftId: { type: String, required: true, unique: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'ManageUser',
      required: true,
    },
    status: {
      type: String,
      enum: ['processing', 'parsed', 'failed', 'published', 'aborted'],
      default: 'processing',
    },

    input: {
      name: { type: String },
      friendlyId: { type: String },
      languageCode: { type: String, default: 'en' },
    },

    files: [
      {
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        s3Key: { type: String, required: true },
      },
    ],

    extractedText: [
      {
        fileName: { type: String, required: true },
        text: { type: String, required: true },
        wordCount: { type: Number, required: true },
        language: { type: String },
      },
    ],

    extractedFields: {
      name: { type: String },
      friendlyId: { type: String },
      productType: { type: String, enum: ['own', 'competitor'] },
      salesTarget: { type: String, enum: ['individual', 'corporate'] },
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
      suggestedModules: [{ type: String }],
      localizations: { type: Map, of: Schema.Types.Mixed },
    },

    processingMeta: {
      totalTextLength: { type: Number },
      processingTimeMs: { type: Number },
      llmTokensUsed: { type: Number },
      confidence: { type: Map, of: Number },
    },

    embeddings: [
      {
        chunkId: { type: String, required: true },
        text: { type: String, required: true },
        embedding: [{ type: Number }],
      },
    ],

    processingErrors: [{ type: String }],
    processingWarnings: [{ type: String }],
    publishedProductId: { type: Schema.Types.ObjectId, ref: 'SalesProduct' },

    metadata: {
      generateCompetitiveIntelligence: { type: Boolean, default: false },
      duplicateCompetitiveIntelligence: { type: Boolean, default: false },
      duplicateId: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
schema.index({ status: 1 });
schema.index({ createdAt: -1 });

export const ProductIngestion = model<ProductIngestionDocument>(
  'ProductIngestion',
  schema,
);
