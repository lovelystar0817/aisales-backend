import { Agenda } from '@hokify/agenda';
import { FastifyInstance } from 'fastify';
import { isProdOrStaging } from '../env.js';
import Sentry from '../sentry-init.js';
import {
  generateBBLAdvisoryTechniqueJob,
  generateBBLProcessAdherenceJob,
} from '../utils/assessment/bbl.js';
import {
  generateHSBCRelationshipManagementJob,
  generateHSBCProcessAdherenceJob,
  generateHSBCRepresentationJob,
  generateHSBCCommunicationAndPresenceJob,
} from '../utils/assessment/hsbc.js';
import {
  generateManulifeSectionAssessmentJob,
  generateManulifeSalesAndNegotiationSkillsJob,
  generateManulifeSoftSkillsJob,
  generateManulifeProductKnowledgeJob,
} from '../utils/assessment/manulife.js';
import { generateMSIGSectionAssessmentJob } from '../utils/assessment/msig.js';
import {
  generatePrudentialSalesTechniqueJob,
  generatePrudentialTechnicalKnowledgeJob,
} from '../utils/assessment/prudential.js';
import {
  generatePrudentialOHSalesTechniqueJob,
  generatePrudentialOHObjectionHandlingJob,
} from '../utils/assessment/prudential-objection-handling.js';
import { generatePrudentialPHAppointmentSettingJob } from '../utils/assessment/prudential-ph-appointment-setting.js';
import {
  generatePrudentialPHFactFindingTechniqueJob,
  generatePrudentialPHProductKnowledgeJob,
} from '../utils/assessment/prudential-ph-fact-finding.js';
import { generatePrudentialPHClosingCallTechniqueJob } from '../utils/assessment/prudential-ph-closing-call.js';
import {
  generateProductKnowledgeJob,
  generateSalesTechniqueJob,
} from '../utils/assessment/regular.js';
import { generateGrabMexSoftSkillsJob } from '../utils/assessment/grab.js';
import {
  generateAxaPhSoftSkillsJob,
  generateAxaPhKnowledgeSkillsJob,
} from '../utils/assessment/axa-ph.js';
import {
  generateKtAxaProductKnowledgeJob,
  generateKtAxaSoftSkillsJob,
  generateKtAxaKnowledgeSkillsJob,
} from '../utils/assessment/kt-axa.js';
import {
  generateMsigTravelEasySoftSkillsJob,
  generateMsigTravelEasyKnowledgeSkillsJob,
  generateMsigTravelEasyProductKnowledgeJob,
} from '../utils/assessment/msig-travel-easy.js';
import {
  generateAiaKoIntroductionJob,
  generateAiaKoObjectionHandlingJob,
  generateAiaKoNeedsExplorationJob,
  generateAiaKoNeedsAnalysisJob,
  generateAiaKoProductPitchJob,
  generateAiaKoProductPitchObjectionHandlingJob,
  generateAiaKoE2EAssessmentJob,
} from '../utils/assessment/aia-ko.js';
import { generateGreatEasternSalesTechniqueJob } from '../utils/assessment/great-eastern.js';
import { AGENDA_JOB_TYPES } from '../utils/constants.js';
import { calculateUserStandingJob } from './assessment/calculateUserStanding.js';
import { uploadAudioToS3 } from './assessment/uploadAudioToS3.js';
import { extractFieldsJob } from './products/extractFields.js';
import { generateEmbeddingsJob } from './products/generateEmbeddings.js';
import assessCallJob from './call-analysis/assessCall.js';
import removePIIFromAssessmentJob from './call-analysis/removePIIFromAssessment.js';
import removePIIFromMsigAssessmentJob from './call-analysis/removePIIFromMsigAssessment.js';
import removePIIFromOverviewJob from './call-analysis/removePIIFromOverview.js';
import removePIIFromTranscriptJob from './call-analysis/removePIIFromTranscript.js';
import transcribeWithSpeakersJob from './call-analysis/transcribeWithSpeakers.js';
import { calculateDashboardSummary } from './dashboard/calculateDashboardSummary.js';
import { sendInvitationEmail } from './mail/inviteUser.js';
import { sendUpdateRoleEmail } from './mail/updateAdminRole.js';
import { postSlackReport } from './report/postSlackReport.js';
import { processBulkInvite } from './bulkInvite/processBulkInvite.js';
import { sendBulkInviteEmail } from './bulkInvite/sendBulkInviteEmail.js';
import { generateScorecardsJob } from '../utils/assessment/scorecard.js';

let agendaInstance: Agenda | null = null;

export function getAgenda() {
  if (!agendaInstance) {
    throw new Error('Agenda has not been initialized');
  }
  return agendaInstance;
}

export async function initializeAgenda(fastify: FastifyInstance) {
  if (agendaInstance) {
    return agendaInstance;
  }

  const agenda = new Agenda({
    defaultConcurrency: 3,
    maxConcurrency: 5,
    processEvery: '2 minutes',
    db: {
      address: fastify.config.DATABASE_URL,
      collection: 'agendaJobs',
    },
  });

  // Error handling
  agenda.on('ready', () => fastify.log.info('Agenda started successfully!'));
  agenda.on('error', (error) =>
    fastify.log.error({ err: error }, 'Agenda connection error!'),
  );
  agenda.on('fail', (error, job) => {
    const name = job.attrs.name;
    fastify.log.error({ err: error }, `Job ${name} failed:`);
    if (isProdOrStaging) {
      Sentry.captureException(
        new Error(`Agenda job failed: ${name} ::: ${error}`),
        { tags: { type: 'agenda' } },
      );
    }
  });

  // Define jobs
  agenda.define(AGENDA_JOB_TYPES.POST_SLACK_REPORT, postSlackReport);
  agenda.define(AGENDA_JOB_TYPES.UPLOAD_AUDIO_TO_S3, uploadAudioToS3);
  agenda.define(
    AGENDA_JOB_TYPES.CALCULATE_DASHBOARD_SUMMARY,
    calculateDashboardSummary,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_SALES_TECHNIQUE,
    generateSalesTechniqueJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_PRODUCT_KNOWLEDGE,
    generateProductKnowledgeJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_SALES_TECHNIQUE,
    generatePrudentialSalesTechniqueJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_TECHNICAL_KNOWLEDGE,
    generatePrudentialTechnicalKnowledgeJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_OH_SALES_TECHNIQUE,
    generatePrudentialOHSalesTechniqueJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_OH_OBJECTION_HANDLING,
    generatePrudentialOHObjectionHandlingJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_PH_APPOINTMENT_SETTING,
    generatePrudentialPHAppointmentSettingJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_PH_FACT_FINDING_TECHNIQUE,
    generatePrudentialPHFactFindingTechniqueJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_PH_PRODUCT_KNOWLEDGE,
    generatePrudentialPHProductKnowledgeJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_PRUDENTIAL_PH_CLOSING_CALL_TECHNIQUE,
    generatePrudentialPHClosingCallTechniqueJob,
  );

  agenda.define(
    AGENDA_JOB_TYPES.CALCULATE_USER_STANDING,
    calculateUserStandingJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_MSIG_SECTION_ASSESSMENT,
    generateMSIGSectionAssessmentJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_MANULIFE_SECTION_ASSESSMENT,
    generateManulifeSectionAssessmentJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_MANULIFE_SALES_AND_NEGOTIATION_SKILLS,
    generateManulifeSalesAndNegotiationSkillsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_MANULIFE_SOFT_SKILLS,
    generateManulifeSoftSkillsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_MANULIFE_PRODUCT_KNOWLEDGE,
    generateManulifeProductKnowledgeJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_GREAT_EASTERN_SALES_TECHNIQUE,
    generateGreatEasternSalesTechniqueJob,
  );

  // Product ingestion jobs
  agenda.define(AGENDA_JOB_TYPES.PRODUCT_EXTRACT_FIELDS, extractFieldsJob);
  agenda.define(
    AGENDA_JOB_TYPES.PRODUCT_GENERATE_EMBEDDINGS,
    generateEmbeddingsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_GRAB_MEX_SOFT_SKILLS,
    generateGrabMexSoftSkillsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_AXA_PH_SOFT_SKILLS,
    generateAxaPhSoftSkillsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_AXA_PH_KNOWLEDGE_SKILLS,
    generateAxaPhKnowledgeSkillsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_KT_AXA_SOFT_SKILLS,
    generateKtAxaSoftSkillsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_KT_AXA_KNOWLEDGE_SKILLS,
    generateKtAxaKnowledgeSkillsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_KT_AXA_PRODUCT_KNOWLEDGE,
    generateKtAxaProductKnowledgeJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_MSIG_TRAVEL_EASY_SOFT_SKILLS,
    generateMsigTravelEasySoftSkillsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_MSIG_TRAVEL_EASY_KNOWLEDGE_SKILLS,
    generateMsigTravelEasyKnowledgeSkillsJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_MSIG_TRAVEL_EASY_PRODUCT_KNOWLEDGE,
    generateMsigTravelEasyProductKnowledgeJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_BBL_ADVISORY_TECHNIQUE,
    generateBBLAdvisoryTechniqueJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_BBL_PROCESS_ADHERENCE,
    generateBBLProcessAdherenceJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_HSBC_RELATIONSHIP_MANAGEMENT,
    generateHSBCRelationshipManagementJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_HSBC_PROCESS_ADHERENCE,
    generateHSBCProcessAdherenceJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_HSBC_REPRESENTATION,
    generateHSBCRepresentationJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_HSBC_COMMUNICATION_AND_PRESENCE,
    generateHSBCCommunicationAndPresenceJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_AIA_KO_INTRODUCTION,
    generateAiaKoIntroductionJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_AIA_KO_OBJECTION_HANDLING,
    generateAiaKoObjectionHandlingJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_AIA_KO_NEEDS_EXPLORATION,
    generateAiaKoNeedsExplorationJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_AIA_KO_NEEDS_ANALYSIS,
    generateAiaKoNeedsAnalysisJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_AIA_KO_PRODUCT_PITCH,
    generateAiaKoProductPitchJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_AIA_KO_PRODUCT_PITCH_OBJECTION_HANDLING,
    generateAiaKoProductPitchObjectionHandlingJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.GENERATE_AIA_KO_E2E_ASSESSMENT,
    generateAiaKoE2EAssessmentJob,
  );
  agenda.define(AGENDA_JOB_TYPES.SEND_INVITE_EMAIL, sendInvitationEmail);
  agenda.define(AGENDA_JOB_TYPES.SEND_UPDATE_ROLE_EMAIL, sendUpdateRoleEmail);
  agenda.define(AGENDA_JOB_TYPES.PROCESS_BULK_INVITE, processBulkInvite);
  // Set concurrency to 1 to avoid SendGrid rate limiting
  agenda.define(AGENDA_JOB_TYPES.SEND_BULK_INVITE_EMAIL, sendBulkInviteEmail, {
    concurrency: 1,
  });

  // Call analysis jobs
  agenda.define(
    AGENDA_JOB_TYPES.TRANSCRIBE_WITH_SPEAKERS,
    transcribeWithSpeakersJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.REMOVE_PII_FROM_TRANSCRIPT,
    removePIIFromTranscriptJob,
  );
  agenda.define(AGENDA_JOB_TYPES.ASSESS_CALL, assessCallJob);
  agenda.define(
    AGENDA_JOB_TYPES.REMOVE_PII_FROM_ASSESSMENT,
    removePIIFromAssessmentJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.REMOVE_PII_FROM_MSIG_ASSESSMENT,
    removePIIFromMsigAssessmentJob,
  );
  agenda.define(
    AGENDA_JOB_TYPES.REMOVE_PII_FROM_OVERVIEW,
    removePIIFromOverviewJob,
  );
  agenda.define(AGENDA_JOB_TYPES.EVALUATE_SCORECARDS, generateScorecardsJob);

  // Schedule recurring dashboard calculations (every 12 hours)
  await agenda.every('12 hours', AGENDA_JOB_TYPES.CALCULATE_DASHBOARD_SUMMARY, {
    forceRecalculate: false,
  });

  await agenda.start();
  agendaInstance = agenda;

  return agenda;
}

export async function gracefullyStopAgenda() {
  await getAgenda().stop();
  process.exit(0);
}
