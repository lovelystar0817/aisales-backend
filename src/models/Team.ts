import { Schema, Types, model } from 'mongoose';
import { Company } from './Company.js';
import { Timestamp } from '../types/timestamp.js';

export interface ITeam extends Timestamp {
  _id: Types.ObjectId;
  name: string;
  company: Types.ObjectId;
  lastModifiedAt?: Date;
  lastModifiedBy?: Types.ObjectId;
}

const schema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    company: {
      type: Schema.Types.ObjectId,
      ref: Company.modelName,
      required: true,
    },
    lastModifiedAt: { type: Date },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'ManageUser' },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure unique team names per company
schema.index({ name: 1, company: 1 }, { unique: true });

export type TeamDocument = ITeam & Document;
export const Team = model<ITeam>('Team', schema);
