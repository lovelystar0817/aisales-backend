import { Schema, Types, model } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';

export type BulkInviteStatus = 'processing' | 'completed' | 'failed';

export interface IBulkInviteItem {
  rowNumber: number; // Row number di Excel (1-based, excluding header)
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  teamNames: string[]; // Array of team names

  // Validation status
  isValid: boolean;
  validationErrors: string[]; // e.g., "Invalid email format", "Email already exists"

  // Processing status
  emailSent: boolean;
  emailSentAt?: Date;
  emailError?: string; // SendGrid error message if failed
  retryCount: number; // Number of retry attempts
  lastRetryAt?: Date;
}

export interface IBulkInvite extends Timestamp {
  _id: Types.ObjectId;
  company: Types.ObjectId;
  uploadedBy: Types.ObjectId; // Superadmin who uploaded
  uploadedByEmail: string; // For logging purposes

  // File info
  fileName: string;
  totalRows: number; // Total rows in Excel (excluding header)

  // Status
  status: BulkInviteStatus;
  startedAt: Date;
  completedAt?: Date;

  // Items
  items: IBulkInviteItem[];

  // Summary statistics
  validCount: number;
  invalidCount: number;
  sentCount: number;
  failedCount: number;
}

const bulkInviteItemSchema = new Schema<IBulkInviteItem>(
  {
    rowNumber: { type: Number, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      // Removed enum and required validation to allow tracking of invalid roles
      // Validation is tracked via isValid flag and validationErrors array
      required: false,
    },
    teamNames: [{ type: String }],

    isValid: { type: Boolean, required: true, default: false },
    validationErrors: [{ type: String }],

    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    emailError: { type: String },
    retryCount: { type: Number, default: 0 },
    lastRetryAt: { type: Date },
  },
  { _id: false },
);

const schema = new Schema<IBulkInvite>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'ManageUser',
      required: true,
    },
    uploadedByEmail: { type: String, required: true },

    fileName: { type: String, required: true },
    totalRows: { type: Number, required: true },

    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date },

    items: [bulkInviteItemSchema],

    validCount: { type: Number, default: 0 },
    invalidCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

// Indexes
schema.index({ company: 1, createdAt: -1 });
schema.index({ uploadedBy: 1, createdAt: -1 });
schema.index({ status: 1 });

export type BulkInviteDocument = IBulkInvite & Document;
export const BulkInvite = model<IBulkInvite>('BulkInvite', schema);
