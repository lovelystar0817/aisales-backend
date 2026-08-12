import { Schema, Types, model } from 'mongoose';
import { Company } from './Company.js';
import { Team } from './Team.js';
import { Timestamp } from '../types/timestamp.js';

export type ManageUserRole = 'superadmin' | 'admin' | 'user';
export type ManageUserStatus = 'active' | 'inactive' | 'invited';

export interface IManageUser extends Timestamp {
  _id: Types.ObjectId;

  name: string;
  firstName: string;
  lastName: string;
  email: string;
  auth0Id: string;
  company: Types.ObjectId;
  role: ManageUserRole;
  status: ManageUserStatus;
  teams: Types.ObjectId[];
  isDeleted: boolean;
}

const schema = new Schema<IManageUser>(
  {
    lastName: { type: String },
    firstName: { type: String },
    name: { type: String },
    email: { type: String },
    auth0Id: { type: String, unique: true, sparse: true },
    company: {
      type: Schema.Types.ObjectId,
      ref: Company.modelName,
      required: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'user'],
      default: 'admin',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'invited'],
      default: 'active',
    },
    teams: [{ type: Schema.Types.ObjectId, ref: Team.modelName }],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
schema.index({ company: 1, email: 1 }, { unique: true });
schema.index({ company: 1, role: 1 });
schema.index({ company: 1, status: 1 });

export type ManageUserDocument = IManageUser & Document;
export const ManageUser = model<IManageUser>('ManageUser', schema);
