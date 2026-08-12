import { Schema, Types, model } from 'mongoose';
import { Company } from './Company.js';
import { Timestamp } from '../types/timestamp.js';
import { Team } from './Team.js';
import { ManageUserRole, ManageUserStatus } from './ManageUser.js';

export interface IUser extends Timestamp {
  _id: Types.ObjectId;

  name: string;
  firstName: string;
  lastName: string;
  email: string;
  auth0Id?: string;
  company: Types.ObjectId;

  // Guest user fields
  isGuest?: boolean;
  createdAsGuestAt?: Date;

  isTester?: boolean;
  isDeleted?: boolean;
  emailVerified?: boolean;
  hasChangedPassword?: boolean;

  teams: Types.ObjectId[];
  role: ManageUserRole;
  status: ManageUserStatus;
}

const schema = new Schema<IUser>(
  {
    lastName: { type: String },
    firstName: { type: String },
    name: { type: String },
    email: { type: String },
    auth0Id: { type: String, unique: true, sparse: true },

    company: { type: Schema.Types.ObjectId, ref: Company.modelName },

    // Guest user fields
    isGuest: { type: Boolean, default: false },
    createdAsGuestAt: { type: Date },

    isTester: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    emailVerified: { type: Boolean, default: true }, // default true so we don't break existing users
    hasChangedPassword: { type: Boolean, default: false },

    teams: [{ type: Schema.Types.ObjectId, ref: Team.modelName }],
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'user'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'invited'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = IUser & Document;
export const User = model<IUser>('User', schema);
