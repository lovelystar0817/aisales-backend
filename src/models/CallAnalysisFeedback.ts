import { type Types, type PopulatedDoc, Schema, model } from 'mongoose';
import { UserDocument } from './User.js';
import { ICallAnalysis } from './CallAnalysis.js';

export type CallAnalysisFeedbackResponse = {
  question: string;
  answer: string;
};

export type CallAnalysisFeedbackDocument = {
  _id: Types.ObjectId;
  user: PopulatedDoc<UserDocument>;
  callAnalysis: PopulatedDoc<ICallAnalysis>;
  responses: CallAnalysisFeedbackResponse[];
  language?: string;
  createdAt: Date;
  updatedAt: Date;
};

const schema = new Schema<CallAnalysisFeedbackDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    callAnalysis: {
      type: Schema.Types.ObjectId,
      ref: 'CallAnalysis',
      required: true,
    },
    responses: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    language: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

export const CallAnalysisFeedback = model('CallAnalysisFeedback', schema);
