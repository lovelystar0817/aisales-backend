import type { Job } from '@hokify/agenda';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { assessCallTranscript } from '../../services/call-analysis/assessment.js';
import { assessCallTranscriptMSIG } from '../../services/call-analysis/assessment/msig.js';
import { calculateOverallScore } from '../../services/call-analysis/assessment/scoring.js';
import { generateCallOverview } from '../../services/call-analysis/overview/index.js';
import { getAgenda } from '../agenda.js';
import { AGENDA_JOB_TYPES } from '../../utils/constants.js';
import { withRetry } from './retryUtils.js';

export default async function assessCallJob(job: Job) {
  const { analysisId, product } = job.attrs.data as {
    analysisId: string;
    product?: string;
  };

  await withRetry({
    job,
    jobType: AGENDA_JOB_TYPES.ASSESS_CALL,
    analysisId,
    stepKeys: ['assessment', 'overview'],
    fn: async () => {
      // Update status to in_progress
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        'processingSteps.assessment.status': 'in_progress',
        'processingSteps.assessment.startedAt': new Date(),
        'processingSteps.overview.status': 'in_progress',
        'processingSteps.overview.startedAt': new Date(),
      });

      // Get the analysis record
      const analysis = await CallAnalysis.findById(analysisId);
      if (!analysis || !analysis.rawTranscript) {
        throw new Error('Analysis or raw transcript not found');
      }

      const isMsigProduct =
        product === 'parecoveryplus' || product === 'dentiplus';

      if (isMsigProduct) {
        // MSIG 6-section assessment for PARecovery Plus / DentiPlus
        const [msigAssessment, overview] = await Promise.all([
          assessCallTranscriptMSIG(
            analysis.rawTranscript,
            product as 'parecoveryplus' | 'dentiplus',
          ),
          generateCallOverview(analysis.rawTranscript, product),
        ]);

        await CallAnalysis.findByIdAndUpdate(analysisId, {
          rawMsigAssessment: msigAssessment,
          rawOverview: overview,
          overallScore: msigAssessment.hasMandatoryFailures
            ? null
            : msigAssessment.overallScore,
          'processingSteps.assessment.status': 'completed',
          'processingSteps.assessment.completedAt': new Date(),
          'processingSteps.overview.status': 'completed',
          'processingSteps.overview.completedAt': new Date(),
        });

        const agenda = getAgenda();
        await Promise.all([
          agenda.now(AGENDA_JOB_TYPES.REMOVE_PII_FROM_MSIG_ASSESSMENT, {
            analysisId,
          }),
          agenda.now(AGENDA_JOB_TYPES.REMOVE_PII_FROM_OVERVIEW, {
            analysisId,
          }),
        ]);
      } else {
        const [assessment, overview] = await Promise.all([
          assessCallTranscript(analysis.rawTranscript),
          generateCallOverview(analysis.rawTranscript),
        ]);

        const { percentage } = calculateOverallScore(assessment);
        await CallAnalysis.findByIdAndUpdate(analysisId, {
          rawAssessment: assessment,
          rawOverview: overview,
          overallScore: Math.round(percentage * 10) / 10,
          'processingSteps.assessment.status': 'completed',
          'processingSteps.assessment.completedAt': new Date(),
          'processingSteps.overview.status': 'completed',
          'processingSteps.overview.completedAt': new Date(),
        });

        const agenda = getAgenda();
        await Promise.all([
          agenda.now(AGENDA_JOB_TYPES.REMOVE_PII_FROM_ASSESSMENT, {
            analysisId,
          }),
          agenda.now(AGENDA_JOB_TYPES.REMOVE_PII_FROM_OVERVIEW, {
            analysisId,
          }),
        ]);
      }

      console.log(
        `Assessment and overview completed for analysis ${analysisId}, started PII removal`,
      );
    },
  });
}
