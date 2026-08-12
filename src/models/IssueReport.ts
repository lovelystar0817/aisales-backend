import { Schema, Types, model, Document } from 'mongoose';
import { User } from './User.js';
import { Company } from './Company.js';
import { Timestamp } from '../types/timestamp.js';

export interface IIssueReport extends Timestamp {
  _id: Types.ObjectId;

  reporter: Types.ObjectId;
  reporterType: 'user' | 'admin';
  company: Types.ObjectId;

  description: string;
  userAgent?: string;
  url?: string;

  metadata?: {
    browserInfo?: string;
    deviceInfo?: string;
    sessionId?: string;
    [key: string]: any;
  };
}

const schema = new Schema<IIssueReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    reporterType: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: Company.modelName,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
schema.index({ reporter: 1, createdAt: -1 });
schema.index({ company: 1, createdAt: -1 });

export type IssueReportDocument = IIssueReport & Document;
export const IssueReport = model<IIssueReport>('IssueReport', schema);
