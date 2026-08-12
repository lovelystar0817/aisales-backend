import { Schema, Types, model } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';

export interface MessageFeedback {
  type: 'praise' | 'suggestion' | 'insight' | 'warning' | 'error' | 'none';
  content: string;
}

export interface MessageDocument extends Timestamp {
  role: string;
  author?: string;
  content: string;
  sent: Date;
  feedback?: MessageFeedback;
  responseTimeSec?: number;

  _id: Types.ObjectId;
}
const feedbackSchema = new Schema({
  type: {
    type: String,
    enum: ['praise', 'suggestion', 'insight', 'warning', 'error', 'none'],
    required: true,
  },
  content: { type: String, required: true },
});

const schema = new Schema(
  {
    role: { type: String, enum: ['user', 'ai'], required: true },
    author: { type: String },
    content: { type: String },
    sent: { type: Date, default: Date.now },
    feedback: feedbackSchema,
    responseTimeSec: { type: Number },
  },
  { timestamps: true },
);

export const Message = model('Message', schema);
