import { Schema, Types, model } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';

export interface ITranscriptSegment {
  speaker: 0 | 1;
  role: 'agent' | 'customer';
  timestamp: number;
  content: string;
}

export interface IAssessmentCriteria {
  criteria: string;
  evaluation: string;
  score: number;
  maxScore: number;
  weight: number;
}

export interface IAssessment {
  summary: string;
  suggestedNextSteps: string[];
  mandatory: IAssessmentCriteria[];
  softSkills: IAssessmentCriteria[];
  knowledgeApplication: IAssessmentCriteria[];
}

export interface ICallOverview {
  keyTakeaways: string[];
  callHealth: {
    positiveSignals: string[];
    risksObserved: string[];
    recommendations: string[];
  };
  actionableNextSteps: {
    keyActions: string[];
    nextCall: string;
  };
}

export type CallAnalysisProduct = 'traveleasy' | 'parecoveryplus' | 'dentiplus';

export interface IMSIGCriterionEvaluation {
  criteriaId: string;
  criteriaText: string;
  pass: boolean;
  mandatory: boolean;
  evidence: string;
}

export interface IMSIGSectionEvaluation {
  sectionType: string;
  sectionWeight: number;
  description: string;
  evaluations: IMSIGCriterionEvaluation[];
  notApplicable?: boolean;
  notApplicableReason?: string;
}

export interface IMSIGCallAssessment {
  sections: Record<string, IMSIGSectionEvaluation>;
  overallScore: number;
  tier: string;
  hasMandatoryFailures: boolean;
  summary: string;
  suggestedNextSteps: string[];
}

export interface IProcessingStep {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface ICallAnalysis extends Timestamp {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  company: Types.ObjectId;
  audioFileUrl: string;
  fileHash?: string;
  featureVersion?: number;
  status: 'uploading' | 'transcribing' | 'processing' | 'completed' | 'failed';
  product?: CallAnalysisProduct;

  // Transcript fields
  rawTranscript?: ITranscriptSegment[];
  transcript?: ITranscriptSegment[];

  // Assessment fields
  rawAssessment?: IAssessment;
  assessment?: IAssessment;

  // Overview fields
  rawOverview?: ICallOverview;
  overview?: ICallOverview;

  // MSIG 6-section assessment (for PARecovery Plus / DentiPlus)
  rawMsigAssessment?: IMSIGCallAssessment;
  msigAssessment?: IMSIGCallAssessment;

  // Pre-computed overall score (0-100) for efficient aggregation
  overallScore?: number;

  // Processing tracking
  processingSteps: {
    transcription: IProcessingStep;
    transcriptPIIRemoval: IProcessingStep;
    assessment: IProcessingStep;
    assessmentPIIRemoval: IProcessingStep;
    overview: IProcessingStep;
    overviewPIIRemoval: IProcessingStep;
  };

  error?: {
    step: string;
    message: string;
    timestamp: Date;
  };

  completedAt?: Date;
  new?: boolean;
}

const transcriptSegmentSchema = new Schema<ITranscriptSegment>(
  {
    speaker: {
      type: Number,
      enum: [0, 1],
      required: true,
    },
    role: {
      type: String,
      enum: ['agent', 'customer'],
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
    },
  },
  { _id: false },
);

const assessmentCriteriaSchema = new Schema<IAssessmentCriteria>(
  {
    criteria: {
      type: String,
      required: true,
    },
    evaluation: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    maxScore: {
      type: Number,
      required: true,
      default: 10,
    },
    weight: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { _id: false },
);

const assessmentSchema = new Schema<IAssessment>(
  {
    summary: {
      type: String,
      required: true,
    },
    suggestedNextSteps: [String],
    mandatory: [assessmentCriteriaSchema],
    softSkills: [assessmentCriteriaSchema],
    knowledgeApplication: [assessmentCriteriaSchema],
  },
  { _id: false },
);

const callOverviewSchema = new Schema<ICallOverview>(
  {
    keyTakeaways: [String],
    callHealth: {
      positiveSignals: [String],
      risksObserved: [String],
      recommendations: [String],
    },
    actionableNextSteps: {
      keyActions: [String],
      nextCall: {
        type: String,
        required: true,
      },
    },
  },
  { _id: false },
);

const msigCriterionEvaluationSchema = new Schema<IMSIGCriterionEvaluation>(
  {
    criteriaId: { type: String, required: true },
    criteriaText: { type: String, required: true },
    pass: { type: Boolean, required: true },
    mandatory: { type: Boolean, required: true },
    evidence: { type: String, default: '' },
  },
  {
    _id: false,
  },
);

const msigSectionEvaluationSchema = new Schema<IMSIGSectionEvaluation>(
  {
    sectionType: { type: String, required: true },
    sectionWeight: { type: Number, required: true },
    description: { type: String, required: true },
    evaluations: [msigCriterionEvaluationSchema],
    notApplicable: { type: Boolean },
    notApplicableReason: { type: String },
  },
  {
    _id: false,
  },
);

const msigCallAssessmentSchema = new Schema<IMSIGCallAssessment>(
  {
    sections: {
      type: Map,
      of: msigSectionEvaluationSchema,
    },
    overallScore: { type: Number, required: true },
    tier: { type: String, required: true },
    hasMandatoryFailures: { type: Boolean, required: true },
    summary: { type: String, required: true },
    suggestedNextSteps: [String],
  },
  {
    _id: false,
  },
);

const processingStepSchema = new Schema<IProcessingStep>(
  {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    startedAt: Date,
    completedAt: Date,
    error: String,
  },
  { _id: false },
);

const callAnalysisSchema = new Schema<ICallAnalysis>(
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
    product: {
      type: String,
      enum: ['traveleasy', 'parecoveryplus', 'dentiplus'],
      index: true,
    },
    audioFileUrl: {
      type: String,
      required: true,
    },
    fileHash: {
      type: String,
      index: true,
    },
    featureVersion: {
      type: Number,
      index: true,
    },
    status: {
      type: String,
      enum: ['uploading', 'transcribing', 'processing', 'completed', 'failed'],
      default: 'uploading',
      index: true,
    },
    rawTranscript: [transcriptSegmentSchema],
    transcript: [transcriptSegmentSchema],
    rawAssessment: assessmentSchema,
    assessment: assessmentSchema,
    rawOverview: callOverviewSchema,
    overview: callOverviewSchema,
    rawMsigAssessment: msigCallAssessmentSchema,
    msigAssessment: msigCallAssessmentSchema,
    overallScore: { type: Number },
    processingSteps: {
      transcription: {
        type: processingStepSchema,
        default: () => ({ status: 'pending' }),
      },
      transcriptPIIRemoval: {
        type: processingStepSchema,
        default: () => ({ status: 'pending' }),
      },
      assessment: {
        type: processingStepSchema,
        default: () => ({ status: 'pending' }),
      },
      assessmentPIIRemoval: {
        type: processingStepSchema,
        default: () => ({ status: 'pending' }),
      },
      overview: {
        type: processingStepSchema,
        default: () => ({ status: 'pending' }),
      },
      overviewPIIRemoval: {
        type: processingStepSchema,
        default: () => ({ status: 'pending' }),
      },
    },
    error: {
      step: String,
      message: String,
      timestamp: Date,
    },
    completedAt: Date,
    new: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
callAnalysisSchema.index({ user: 1, createdAt: -1 });
callAnalysisSchema.index({ company: 1, status: 1 });
callAnalysisSchema.index({ company: 1, overallScore: 1 });
// Compound index for cache lookup: fileHash + featureVersion + user
callAnalysisSchema.index({
  fileHash: 1,
  featureVersion: 1,
  user: 1,
  product: 1,
});

/**
 * Check if a CallAnalysis record is complete and can be reused
 * @param callAnalysis The CallAnalysis record to validate
 * @returns true if the record is complete and can be reused
 */
export function isCallAnalysisComplete(callAnalysis: ICallAnalysis): boolean {
  // Check if overall status is completed
  if (callAnalysis.status !== 'completed') {
    return false;
  }

  // Check if all processing steps are completed
  const requiredSteps = [
    'transcription',
    'transcriptPIIRemoval',
    'assessment',
    'assessmentPIIRemoval',
    'overview',
    'overviewPIIRemoval',
  ] as const;

  for (const stepName of requiredSteps) {
    const step = callAnalysis.processingSteps[stepName];
    if (!step || step.status !== 'completed') {
      return false;
    }
  }

  // For MSIG products, check msigAssessment; for TravelEasy/default, check assessment
  const isMsigProduct =
    callAnalysis.product === 'parecoveryplus' ||
    callAnalysis.product === 'dentiplus';

  if (isMsigProduct) {
    if (
      !callAnalysis.transcript ||
      !callAnalysis.msigAssessment ||
      !callAnalysis.overview
    ) {
      return false;
    }
  } else {
    if (
      !callAnalysis.transcript ||
      !callAnalysis.assessment ||
      !callAnalysis.overview
    ) {
      return false;
    }
  }

  // Check if there's no recent error
  if (callAnalysis.error) {
    return false;
  }

  // Check if completedAt is set
  if (!callAnalysis.completedAt) {
    return false;
  }

  return true;
}

export const CallAnalysis = model<ICallAnalysis>(
  'CallAnalysis',
  callAnalysisSchema,
);
