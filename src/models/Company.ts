import { Schema, model, Document } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';
import { SUPPORTED_LANGUAGES } from '../utils/constants.js';

export interface ICompany extends Timestamp {
  name: string;
  friendlyId?: string;
  domain?: string;
  auth0ConnectionName?: string;
  auth0OrgId?: string;
  trialEndsAt?: Date;
  logoUrl?: string;
  logoHeight?: string;
  selfServiceEnabled?: boolean;
  languages?: string[];
  dataMigrated?: boolean;
}

const schema = new Schema(
  {
    name: { type: String, required: true },
    friendlyId: { type: String, unique: true },
    domain: { type: String },
    auth0ConnectionName: { type: String },
    auth0OrgId: { type: String },
    trialEndsAt: { type: Date },
    logoUrl: { type: String },
    logoHeight: { type: String },
    selfServiceEnabled: { type: Boolean, default: false },
    languages: {
      type: [String],
      default: SUPPORTED_LANGUAGES,
    },
    dataMigrated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

schema.post('save', function (doc, next) {
  const name = doc.name;
  const friendlyId = name.toLowerCase().replace(/ /g, '-');

  doc.set('friendlyId', friendlyId);

  next();
});

export type CompanyDocument = ICompany & Document;
export const Company = model<ICompany>('Company', schema);
