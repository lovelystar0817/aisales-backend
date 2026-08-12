import { model, PopulatedDoc, Schema, Types } from 'mongoose';
import { Timestamp } from '../types/timestamp.js';
import { Message } from './Message.js';
import { PersonaDocument } from './Persona.js';
import { SalesProductDocument } from './SalesProduct.js';
import { ScenarioDocument } from './Scenario.js';
import { SalesFramework } from '../frameworks/types.js';
import { IUserStanding } from './UserStanding.js';
import { ScorecardSectionType } from './Scorecard.js';

export enum CallType {
  COLD_CALL = 'cold-call',
  INITIAL_OUTREACH = 'initial-outreach',
  DISCOVERY = 'discovery',
  COMPETITIVE_PROPOSAL = 'competitive-proposal',
  OBJECTION_HANDLING = 'objection-handling',
  PRODUCT_POSITIONING = 'product-positioning',
  CLOSING = 'closing',
  REVIEW_RENEWAL = 'review-renewal',
  GRAB_COLD_CALL = 'cold-call-meddpicc',
  MSIG_TELESALES = 'telesales',
  MSIG_AGENCY_SALES = 'agency-sales',
  MANULIFE_FNA = 'fna',
  GRAB_MEX = 'grab-mex',
  PRUDENTIAL_OBJECTION_HANDLING = 'prudential-objection-handling',
  BBL_CLIENT_UPGRADE = 'bbl-client-upgrade',
  BBL_CLIENT_REVIVAL = 'bbl-client-revival',
  BBL_GOAL_PLANNING = 'bbl-goal-planning',
  BBL_PORTFOLIO_REVIEW = 'bbl-portfolio-review',
  GREAT_EASTERN_FACT_FIND = 'great-eastern-fact-find',
  GREAT_EASTERN_PRODUCT_PITCH = 'great-eastern-product-pitch',
  GREAT_EASTERN_POST_SALES = 'great-eastern-post-sales',
}

export type AssessmentType =
  | 'regular'
  | 'prudential'
  | 'prudential-objection-handling'
  | 'msig'
  | 'msig-3f'
  | 'msig-travel-easy'
  | 'manulife'
  | 'manulife-goalready'
  | 'bbl'
  | 'hsbc'
  | 'grab-mex'
  | 'mtl-recruitment'
  | 'scorecard'
  | 'mtl-prospect-practice'
  | 'axa-ph-recruitment'
  | 'axa-ph-objection-handling'
  | 'kt-axa-recruitment'
  | 'kt-axa-fna'
  | 'kt-axa-wealthplus'
  | 'prudential-ph-appointment-setting'
  | 'prudential-ph-fact-finding'
  | 'prudential-ph-closing-call'
  | 'aia-ko-opening-objection-call'
  | 'aia-ko-product-pitch'
  | 'aia-ko-end-to-end-outbound-call'
  | 'great-eastern';

export interface ISalesSession extends Timestamp {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  teams: Types.ObjectId[];

  callType: CallType;
  assessmentType: AssessmentType;
  languageCode?: string;

  // New normalized approach using Scenario (contains module + product + persona + scorecard + company)
  scenario?: PopulatedDoc<ScenarioDocument>;

  // OLD LEGACY FIELDS - for backward compatibility
  product?: SalesProductDocument;
  persona?: PersonaDocument;

  startedAt: Date;
  endedAt?: Date;
  endReason?: string;

  roleplay?: {
    title: string;
    summary: string;
    objectives: string[];
    mainObjection: string;
    framework: SalesFramework;
    selectedObjections?: string[]; // For BBL - index 0 is primary objection, indices 1+ are mini objections
    // alternativeProducts: string; // JSON string
    duration?: number;
    conversation?: string; // ElevenLabs conversation ID

    feedback: {
      overview: string;
      salesTechniques: string;
      productKnowledge: string;
      technicalKnowledge: string;
      // BBL-specific assessment fields
      advisoryTechnique?: string; // BBL Advisory Technique assessment
      processAdherence?: string; // BBL Process Adherence assessment
      // HSBC-specific assessment fields
      relationshipManagement?: string; // HSBC Relationship Management assessment
      hsbcProcessAdherence?: string; // HSBC Process Adherence assessment
      representation?: string; // HSBC Representation assessment
      communicationAndPresence?: string; // HSBC Communication and Presence assessment
      audioUrl?: string; // URL for cached overview audio
      salesTechniquesGenerating?: boolean;
      productKnowledgeGenerating?: boolean;
      advisoryTechniqueGenerating?: boolean; // BBL Advisory Technique generating flag
      processAdherenceGenerating?: boolean; // BBL Process Adherence generating flag
      // HSBC generating flags
      isHsbcRelationshipManagementGenerating?: boolean;
      isHsbcProcessAdherenceGenerating?: boolean;
      isHsbcRepresentationGenerating?: boolean;
      communicationAndPresenceGenerating?: boolean; // HSBC Communication and Presence generating flag
      isStandingGenerating?: boolean;
      technicalKnowledgeGenerating?: boolean;
      // Grab MEX fields
      grabMexSoftSkillsGenerating?: boolean;
      grabMexSoftSkills?: string;
      // AXA PH fields
      axaPhSoftSkillsGenerating?: boolean;
      axaPhSoftSkills?: string;
      axaPhKnowledgeSkillsGenerating?: boolean;
      axaPhKnowledgeSkills?: string;
      // KT AXA fields
      ktAxaSoftSkillsGenerating?: boolean;
      ktAxaSoftSkills?: string;
      ktAxaKnowledgeSkillsGenerating?: boolean;
      ktAxaKnowledgeSkills?: string;
      ktAxaProductKnowledgeGenerating?: boolean;
      ktAxaProductKnowledge?: string;
      // MSIG TravelEasy fields
      msigTravelEasySoftSkillsGenerating?: boolean;
      msigTravelEasySoftSkills?: string;
      msigTravelEasyKnowledgeSkillsGenerating?: boolean;
      msigTravelEasyKnowledgeSkills?: string;
      msigTravelEasyProductKnowledgeGenerating?: boolean;
      msigTravelEasyProductKnowledge?: string;
      // Prudential Objection Handling fields
      prudentialOHSalesTechniqueGenerating?: boolean;
      prudentialOHSalesTechnique?: string;
      prudentialOHObjectionHandlingGenerating?: boolean;
      prudentialOHObjectionHandling?: string;

      // Prudential PH Appointment Setting fields
      prudentialPHAppointmentSettingGenerating?: boolean;
      prudentialPHAppointmentSetting?: string;

      // Prudential PH Fact Finding fields
      prudentialPHFactFindingTechniqueGenerating?: boolean;
      prudentialPHFactFindingTechnique?: string;
      prudentialPHProductKnowledgeGenerating?: boolean;
      prudentialPHProductKnowledge?: string;

      // Prudential PH Closing Call fields
      prudentialPHClosingCallTechniqueGenerating?: boolean;
      prudentialPHClosingCallTechnique?: string;

      // AIA KO Opening & Objection Call fields
      aiaKoIntroductionGenerating?: boolean;
      aiaKoIntroduction?: string;
      aiaKoObjectionHandlingGenerating?: boolean;
      aiaKoObjectionHandling?: string;
      aiaKoNeedsExplorationGenerating?: boolean;
      aiaKoNeedsExploration?: string;

      // AIA KO Product Pitch fields
      aiaKoNeedsAnalysisGenerating?: boolean;
      aiaKoNeedsAnalysis?: string;
      aiaKoProductPitchGenerating?: boolean;
      aiaKoProductPitch?: string;
      aiaKoProductPitchObjectionHandlingGenerating?: boolean;
      aiaKoProductPitchObjectionHandling?: string;
      // AIA KO End-to-End Outbound Call fields
      aiaKoE2EAssessmentGenerating?: boolean;
      aiaKoE2EAssessment?: string;
      // Manulife GoalReady fields
      manulifeSalesAndNegotiationSkillsGenerating?: boolean;
      manulifeSalesAndNegotiationSkills?: string;
      manulifeSoftSkillsGenerating?: boolean;
      manulifeSoftSkills?: string;
      manulifeProductKnowledgeGenerating?: boolean;
      manulifeProductKnowledge?: string;
      // Great Eastern fields
      greatEasternAssessmentGenerating?: boolean;
      greatEasternAssessment?: string;

      scorecards?: {
        name: string;
        isGenerating: boolean;
        overallScore?: number;
        maxScore?: number;
        sectionType: ScorecardSectionType;
        criteria?: {
          title: string;
          score: number;
          maxScore: number;
          reason?: string;
          suggestion?: string;
          strengths?: string[];
          toImprove?: {
            text: string;
            status?: string;
            correction?: string;
            example?: string;
          }[];
        }[];
      };
    };

    // SCORM completion tracking
    overallScore?: number; // Calculated overall score for SCORM
    scormCompletionReady?: boolean; // Flag when both assessments are complete
    scormCompletionTriggeredAt?: Date; // When SCORM completion was triggered
  };
  scores: {
    salesTechnique: number;
    productKnowledge: number;
  };

  // Sales action tracking
  actionTracking?: {
    completedActions: {
      actionId: string;
      completedAt: Date;
      confidence: number;
      detectionMethod: 'keyword' | 'pattern' | 'ai';
      triggerText: string;
      messageId?: string;
    }[];
    progressPercentage: number;
    lastUpdated: Date;
  };

  messages: Types.ObjectId[];
  standing?: IUserStanding;
}

const schema = new Schema<ISalesSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],

    callType: {
      type: String,
      default: CallType.INITIAL_OUTREACH,
    },

    assessmentType: {
      type: String,
      enum: [
        'regular',
        'prudential',
        'prudential-objection-handling',
        'msig',
        'msig-3f',
        'msig-travel-easy',
        'manulife',
        'manulife-goalready',
        'grab-mex',
        'bbl',
        'hsbc',
        'mtl-recruitment',
        'axa-ph-recruitment',
        'axa-ph-objection-handling',
        'kt-axa-recruitment',
        'kt-axa-fna',
        'kt-axa-wealthplus',
        'scorecard',
        'mtl-prospect-practice',
        'prudential-ph-appointment-setting',
        'prudential-ph-fact-finding',
        'prudential-ph-closing-call',
        'aia-ko-opening-objection-call',
        'aia-ko-product-pitch',
        'aia-ko-end-to-end-outbound-call',
        'great-eastern',
      ],
      default: 'regular',
    },

    languageCode: { type: String },

    // New normalized approach using Scenario
    scenario: {
      type: Schema.Types.ObjectId,
      ref: 'Scenario',
    },

    // Legacy fields for backward compatibility
    product: {
      type: Object,
      default: {},
    },

    persona: {
      type: Object,
      default: {},
    },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    endReason: { type: String },

    roleplay: {
      title: { type: String },
      summary: { type: String },
      objectives: { type: [String] },
      mainObjection: { type: String },
      framework: { type: String },
      selectedObjections: { type: [String] }, // For BBL - index 0 is primary objection, indices 1+ are mini objections
      // alternativeProducts: { type: String }, // JSON string (array)
      duration: {
        type: Number,
      },
      conversation: { type: String }, // ElevenLabs conversation ID & Livekit room ID
      feedback: {
        overview: { type: String },
        salesTechniques: { type: String },
        productKnowledge: { type: String },
        technicalKnowledge: { type: String },
        advisoryTechnique: { type: String },
        processAdherence: { type: String },
        communicationAndPresence: { type: String },
        relationshipManagement: { type: String },
        hsbcProcessAdherence: { type: String },
        representation: { type: String },
        grabMexSoftSkills: { type: String },
        axaPhSoftSkills: { type: String },
        axaPhKnowledgeSkills: { type: String },
        ktAxaSoftSkills: { type: String },
        ktAxaKnowledgeSkills: { type: String },
        ktAxaProductKnowledge: { type: String },
        msigTravelEasySoftSkills: { type: String },
        msigTravelEasyKnowledgeSkills: { type: String },
        msigTravelEasyProductKnowledge: { type: String },
        audioUrl: { type: String },
        salesTechniquesGenerating: { type: Boolean, default: false },
        productKnowledgeGenerating: { type: Boolean, default: false },
        technicalKnowledgeGenerating: { type: Boolean, default: false },
        advisoryTechniqueGenerating: { type: Boolean, default: false },
        processAdherenceGenerating: { type: Boolean, default: false },
        communicationAndPresenceGenerating: { type: Boolean, default: false },
        isHsbcRelationshipManagementGenerating: {
          type: Boolean,
          default: false,
        },
        isHsbcProcessAdherenceGenerating: { type: Boolean, default: false },
        isHsbcRepresentationGenerating: { type: Boolean, default: false },
        isHsbcCommunicationAndPresenceGenerating: {
          type: Boolean,
          default: false,
        },
        grabMexSoftSkillsGenerating: { type: Boolean, default: false },
        axaPhSoftSkillsGenerating: { type: Boolean, default: false },
        axaPhKnowledgeSkillsGenerating: { type: Boolean, default: false },
        ktAxaSoftSkillsGenerating: { type: Boolean, default: false },
        ktAxaKnowledgeSkillsGenerating: { type: Boolean, default: false },
        ktAxaProductKnowledgeGenerating: { type: Boolean, default: false },
        msigTravelEasySoftSkillsGenerating: { type: Boolean, default: false },
        msigTravelEasyKnowledgeSkillsGenerating: {
          type: Boolean,
          default: false,
        },
        msigTravelEasyProductKnowledgeGenerating: {
          type: Boolean,
          default: false,
        },
        isStandingGenerating: { type: Boolean, default: false },
        // Prudential Objection Handling fields
        prudentialOHSalesTechniqueGenerating: { type: Boolean, default: false },
        prudentialOHSalesTechnique: { type: String },
        prudentialOHObjectionHandlingGenerating: {
          type: Boolean,
          default: false,
        },
        prudentialOHObjectionHandling: { type: String },

        // Prudential PH Appointment Setting fields
        prudentialPHAppointmentSettingGenerating: {
          type: Boolean,
          default: false,
        },
        prudentialPHAppointmentSetting: { type: String },

        // Prudential PH Fact Finding fields
        prudentialPHFactFindingTechniqueGenerating: {
          type: Boolean,
          default: false,
        },
        prudentialPHFactFindingTechnique: { type: String },
        prudentialPHProductKnowledgeGenerating: {
          type: Boolean,
          default: false,
        },
        prudentialPHProductKnowledge: { type: String },

        // Prudential PH Closing Call fields
        prudentialPHClosingCallTechniqueGenerating: {
          type: Boolean,
          default: false,
        },
        prudentialPHClosingCallTechnique: { type: String },

        // AIA KO Opening & Objection Call fields
        aiaKoIntroductionGenerating: { type: Boolean, default: false },
        aiaKoIntroduction: { type: String },
        aiaKoObjectionHandlingGenerating: { type: Boolean, default: false },
        aiaKoObjectionHandling: { type: String },
        aiaKoNeedsExplorationGenerating: { type: Boolean, default: false },
        aiaKoNeedsExploration: { type: String },

        // AIA KO Product Pitch fields
        aiaKoNeedsAnalysisGenerating: { type: Boolean, default: false },
        aiaKoNeedsAnalysis: { type: String },
        aiaKoProductPitchGenerating: { type: Boolean, default: false },
        aiaKoProductPitch: { type: String },
        aiaKoProductPitchObjectionHandlingGenerating: {
          type: Boolean,
          default: false,
        },
        aiaKoProductPitchObjectionHandling: { type: String },
        // AIA KO End-to-End Outbound Call fields
        aiaKoE2EAssessmentGenerating: { type: Boolean, default: false },
        aiaKoE2EAssessment: { type: String },
        // Manulife GoalReady fields
        manulifeSalesAndNegotiationSkillsGenerating: {
          type: Boolean,
          default: false,
        },
        manulifeSalesAndNegotiationSkills: { type: String },
        manulifeSoftSkillsGenerating: { type: Boolean, default: false },
        manulifeSoftSkills: { type: String },
        manulifeProductKnowledgeGenerating: { type: Boolean, default: false },
        manulifeProductKnowledge: { type: String },
        // Great Eastern fields
        greatEasternAssessmentGenerating: { type: Boolean, default: false },
        greatEasternAssessment: { type: String },

        scorecards: [
          {
            name: { type: String },
            isGenerating: { type: Boolean },
            overallScore: { type: Number },
            maxScore: { type: Number },
            sectionType: { type: String },
            criteria: [
              {
                title: { type: String },
                score: { type: Number },
                maxScore: { type: Number },
                reason: { type: String, required: false },
                suggestion: { type: String, required: false },
                strengths: { type: [String], required: false },
                toImprove: {
                  type: [
                    {
                      text: { type: String },
                      status: { type: String, required: false },
                      correction: { type: String, required: false },
                      example: { type: String, required: false },
                    },
                  ],
                  required: false,
                },
              },
            ],
          },
        ],
      },

      // SCORM completion tracking
      overallScore: { type: Number },
      scormCompletionReady: { type: Boolean, default: false },
      scormCompletionTriggeredAt: { type: Date },
    },
    scores: {
      salesTechnique: { type: Number },
      productKnowledge: { type: Number },
    },
    actionTracking: {
      completedActions: [
        {
          actionId: { type: String, required: true },
          completedAt: { type: Date, required: true },
          confidence: { type: Number, required: true },
          detectionMethod: {
            type: String,
            enum: ['keyword', 'pattern', 'ai'],
            required: true,
          },
          triggerText: { type: String, required: true },
          messageId: { type: String },
        },
      ],
      progressPercentage: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },
    messages: {
      type: [Schema.Types.ObjectId],
      ref: Message.modelName,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

schema.virtual('standing', {
  ref: 'UserStanding',
  localField: '_id',
  foreignField: 'session',
  justOne: true,
});

// Indexes
// Sparse index for filtering by user and scenario (used in getInactiveModulesWithHistory)
// Sparse because scenario is an optional field - only indexes documents that have scenario
schema.index({ user: 1, scenario: 1 }, { sparse: true });

export type SalesSessionDocument = ISalesSession & Document;

export const SalesSession = model<ISalesSession>('SalesSession', schema);
