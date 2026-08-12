import { Schema, model, Document, Types } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';

export interface IVoice extends Timestamp {
  _id?: Types.ObjectId;
  friendlyId: string;
  provider: 'elevenlabs';
  providerId: string;
  name?: string; // Human-readable name
  language: string; // Language code: 'en', 'id', 'ms', 'th', 'tl', 'vi'
  accent?: string; // 'american', 'british', 'singaporean', 'indian', etc.
  gender: 'male' | 'female' | 'neutral';
  ageGroup?: 'young' | 'middle' | 'older'; // Age category if applicable
  region?: string; // Geographic region if applicable
  description?: string; // Additional details about the voice
  isActive: boolean; // Whether this voice is currently available/active
}

export type VoiceDocument = IVoice & Document;

const schema = new Schema<VoiceDocument>(
  {
    friendlyId: { type: String, required: true, unique: true },
    provider: {
      type: String,
      required: true,
      enum: ['elevenlabs', 'chirp', 'cartesia'],
      default: 'elevenlabs',
    },
    providerId: { type: String, required: true },
    name: { type: String },
    language: { type: String, required: true },
    accent: { type: String },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'neutral'],
    },
    ageGroup: {
      type: String,
      enum: ['young', 'middle', 'older'],
    },
    region: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
schema.index({ provider: 1, language: 1, gender: 1, isActive: 1 });

export const Voice = model<VoiceDocument>('Voice', schema);
