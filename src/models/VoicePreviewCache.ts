import { Schema, model, Document, Types } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';

export interface IVoicePreviewCache extends Timestamp {
  _id?: Types.ObjectId;
  providerId: string;
  language: string;
  s3Url: string;
}

export type VoicePreviewCacheDocument = IVoicePreviewCache & Document;

const schema = new Schema<VoicePreviewCacheDocument>(
  {
    providerId: { type: String, required: true, unique: true },
    language: { type: String, required: true },
    s3Url: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const VoicePreviewCache = model<VoicePreviewCacheDocument>(
  'VoicePreviewCache',
  schema,
);
