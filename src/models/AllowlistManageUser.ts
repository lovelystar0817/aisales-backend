import { Schema, Types, model } from 'mongoose';
import { Company } from './Company.js';
import { Team } from './Team.js';
import { Timestamp } from '../types/timestamp.js';

export type AllowlistManageUserRole = 'superadmin' | 'admin';

export interface IAllowlistManageUser extends Timestamp {
  _id: Types.ObjectId;

  email: string;
  name?: string; // Pre-populated name for the user
  company: Types.ObjectId;
  role?: AllowlistManageUserRole;
  teams?: Types.ObjectId[];
}

const schema = new Schema<IAllowlistManageUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      trim: true,
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: Company.modelName,
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ['superadmin', 'admin'],
      default: 'admin',
    },

    teams: [{ type: Schema.Types.ObjectId, ref: Team.modelName }],
  },
  {
    timestamps: true,
  },
);

// Compound unique index on email + company to prevent duplicate allowlist entries
schema.index({ email: 1, company: 1 }, { unique: true });

export type AllowlistManageUserDocument = IAllowlistManageUser & Document;
export const AllowlistManageUser = model<IAllowlistManageUser>(
  'AllowlistManageUser',
  schema,
);
