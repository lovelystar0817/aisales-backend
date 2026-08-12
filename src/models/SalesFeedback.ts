import { type Types, type PopulatedDoc, Schema, model } from 'mongoose';
import { UserDocument } from './User.js';
import { SalesSessionDocument } from './SalesSession.js';

export type SalesFeedbackResponse = {
  question: string;
  answer: string;
};

export type SalesFeedbackDocument = {
  _id: Types.ObjectId;
  user: PopulatedDoc<UserDocument>;
  session: PopulatedDoc<SalesSessionDocument>;
  responses: SalesFeedbackResponse[];
  language?: string;
  createdAt: Date;
  updatedAt: Date;
};

const schema = new Schema<SalesFeedbackDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: 'SalesSession',
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

export const SalesFeedback = model('SalesFeedback', schema);
