import { Document, Schema, model, Types } from 'mongoose';

// Represents a user's achievement of a specific standing level for a given session.
export interface IUserStanding {
  user: Types.ObjectId;
  company: Types.ObjectId;
  session: Types.ObjectId;
  persona: string;
  standingConfigurationId: string;
  tierName: string;
  tierLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserStandingSchema = new Schema<IUserStanding>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: 'SalesSession',
      required: true,
      unique: true,
    }, // One standing record per session
    persona: { type: String, required: true },
    standingConfigurationId: {
      type: String,
      required: true,
      index: true,
    },
    tierName: { type: String, required: true },
    tierLevel: { type: Number, required: true },
  },
  { timestamps: true },
);

UserStandingSchema.index({ user: 1, company: 1 });

UserStandingSchema.virtual('sessionData', {
  ref: 'SalesSession',
  localField: 'session',
  foreignField: '_id',
  justOne: true,
});

export const UserStanding = model<IUserStanding>(
  'UserStanding',
  UserStandingSchema,
);
