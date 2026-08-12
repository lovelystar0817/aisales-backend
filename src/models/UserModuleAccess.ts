import { Schema, Types, model } from 'mongoose';
import { User } from './User.js';
import { Timestamp } from '../types/timestamp.js';

export interface IUserModuleAccess extends Timestamp {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  moduleId: string; // Module friendlyId
}

const schema = new Schema<IUserModuleAccess>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: User.modelName,
      required: true,
    },
    moduleId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create compound index to ensure unique user-module combinations
schema.index({ userId: 1, moduleId: 1 }, { unique: true });

// Index for efficient queries by userId
schema.index({ userId: 1 });

// Index for efficient queries by moduleId
schema.index({ moduleId: 1 });

export type UserModuleAccessDocument = IUserModuleAccess & Document;
export const UserModuleAccess = model<IUserModuleAccess>(
  'UserModuleAccess',
  schema,
);
