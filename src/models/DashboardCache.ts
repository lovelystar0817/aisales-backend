import { Schema, model, Document } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';

export interface IDashboardCache extends Timestamp {
  companyId?: string; // Company ID for filtering, null for global data
  teamIds?: string[]; // Only present when filtering by specific teams
  calculatedAt: Date; // When the data was calculated
  expiresAt: Date; // When the cached data expires

  // Account Summary Data
  accountSummary: {
    accountsCreated: number;
    monthlyActiveUsers: number;
    monthlyActiveUsersGrowth: number;
    repeatUsers: number;
  };

  // Practice Summary Data (aggregated across all filters)
  practiceSummary: {
    finishedPractices: number;
    averageDurationMinutes: number;
    averageDurationSeconds: number;
    overallAverageScore: number;
  };

  // Practice Details by Type
  practiceDetails: Array<{
    type: string;
    totalPractices: number;
    averageScore: number;
    grade: string;
  }>;

  // Progress Data (6 months default)
  progressData: {
    months: string[];
    salesTechnique: number[];
    productKnowledge: number[];
  };

  // Metadata
  calculationVersion: string; // Version of calculation logic (for cache invalidation)
  calculationDurationMs: number; // How long the calculation took
}

export interface DashboardCacheDocument extends IDashboardCache, Document {}

const schema = new Schema<DashboardCacheDocument>(
  {
    companyId: { type: String, default: null, index: true },
    // Make teamIds truly optional - don't define a default, and make it sparse
    teamIds: {
      type: [{ type: String }],
      required: false,
      default: undefined, // Explicitly set default to undefined
    },
    calculatedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },

    accountSummary: {
      accountsCreated: { type: Number, required: true },
      monthlyActiveUsers: { type: Number, required: true },
      monthlyActiveUsersGrowth: { type: Number, required: true },
      repeatUsers: { type: Number, required: true },
    },

    practiceSummary: {
      finishedPractices: { type: Number, required: true },
      averageDurationMinutes: { type: Number, required: true },
      averageDurationSeconds: { type: Number, required: true },
      overallAverageScore: { type: Number },
    },

    practiceDetails: [
      {
        type: { type: String, required: true },
        totalPractices: { type: Number, required: true },
        averageScore: { type: Number, required: true },
        grade: { type: String, required: true },
      },
    ],

    progressData: {
      months: [{ type: String, required: true }],
      salesTechnique: [{ type: Number, required: true }],
      productKnowledge: [{ type: Number, required: true }],
    },

    calculationVersion: { type: String, required: true, default: 'v1.0.0' },
    calculationDurationMs: { type: Number, required: true },
  },
  {
    timestamps: true,
    // This ensures undefined fields are not stored in MongoDB
    minimize: false,
  },
);

// Compound index for efficient lookups by company and expiration
schema.index({ companyId: 1, teamIds: 1, expiresAt: 1 });

export const DashboardCache = model<DashboardCacheDocument>(
  'DashboardCache',
  schema,
);
