import { Schema, Types, model } from 'mongoose';
import { Company } from './Company.js';
import { ManageUser } from './ManageUser.js';
import { Timestamp } from '../types/timestamp.js';

export type AdminLogCategory =
  | 'user'
  | 'team'
  | 'product'
  | 'persona'
  | 'scenario'
  | 'module'
  | 'scorecard'
  | 'report'
  | 'system';

export type AdminAction =
  // User actions
  | 'user_deactivated'
  | 'user_reactivated'
  | 'user_role_updated'
  | 'user_invited'
  // Team actions
  | 'team_created'
  | 'team_updated'
  // Product actions
  | 'product_import_started'
  | 'product_import_aborted'
  | 'product_published'
  | 'product_updated'
  | 'product_deleted'
  | 'product_competitor_updated'
  // Persona actions
  | 'persona_created'
  | 'persona_updated'
  | 'persona_deleted'
  // Module actions
  | 'module_created'
  | 'module_updated'
  | 'module_deleted'
  // Scenario actions
  | 'scenario_created'
  | 'scenario_updated'
  | 'scenario_status_changed'
  | 'scenario_deleted'
  // Scorecard actions
  | 'scorecard_created'
  | 'scorecard_updated'
  | 'scorecard_deleted'
  // Report actions
  | 'report_downloaded'
  // System actions
  | 'dashboard_refreshed'
  | 'issue_reported';

export interface IAdminLog extends Timestamp {
  _id: Types.ObjectId;

  // Who performed the action
  adminUser: Types.ObjectId;
  adminEmail: string;

  // Company context
  company: Types.ObjectId;

  // Action details
  action: AdminAction;
  category: AdminLogCategory;

  // Target entity
  targetType?: string;
  targetId?: Types.ObjectId;
  targetName?: string;

  // Change details (before/after for updates)
  details?: Record<string, unknown>;

  // Request context
  ipAddress?: string;
  userAgent?: string;
}

const schema = new Schema<IAdminLog>(
  {
    adminUser: {
      type: Schema.Types.ObjectId,
      ref: ManageUser.modelName,
      required: true,
    },
    adminEmail: { type: String, required: true },

    company: {
      type: Schema.Types.ObjectId,
      ref: Company.modelName,
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        // User actions
        'user_deactivated',
        'user_reactivated',
        'user_role_updated',
        'user_invited',
        // Team actions
        'team_created',
        'team_updated',
        // Product actions
        'product_import_started',
        'product_import_aborted',
        'product_published',
        'product_updated',
        'product_deleted',
        'product_competitor_updated',
        // Persona actions
        'persona_created',
        'persona_updated',
        'persona_deleted',
        // Module actions
        'module_created',
        'module_updated',
        'module_deleted',
        // Scenario actions
        'scenario_created',
        'scenario_updated',
        'scenario_status_changed',
        'scenario_deleted',
        // Scorecard actions
        'scorecard_created',
        'scorecard_updated',
        'scorecard_deleted',
        // Report actions
        'report_downloaded',
        // System actions
        'dashboard_refreshed',
        'issue_reported',
      ],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'user',
        'team',
        'product',
        'persona',
        'scenario',
        'module',
        'scorecard',
        'report',
        'system',
      ],
    },

    targetType: { type: String },
    targetId: { type: Schema.Types.ObjectId },
    targetName: { type: String },

    details: { type: Schema.Types.Mixed },

    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
schema.index({ company: 1, createdAt: -1 });
schema.index({ company: 1, action: 1 });
schema.index({ company: 1, category: 1 });
schema.index({ adminUser: 1, createdAt: -1 });
schema.index({ adminEmail: 1, createdAt: -1 });
schema.index({ targetId: 1 });

export type AdminLogDocument = IAdminLog & Document;
export const AdminLog = model<IAdminLog>('AdminLog', schema);
