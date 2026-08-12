import type { Job } from '@hokify/agenda';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { removePIIFromAssessment } from '../../services/call-analysis/piiRemoval.js';
import { AGENDA_JOB_TYPES } from '../../utils/constants.js';
import { checkAndMarkComplete } from './utils.js';
import { withRetry } from './retryUtils.js';

export default async function removePIIFromAssessmentJob(job: Job) {
  const { analysisId } = job.attrs.data as { analysisId: string };

  await withRetry({
    job,
    jobType: AGENDA_JOB_TYPES.REMOVE_PII_FROM_ASSESSMENT,
    analysisId,
    stepKeys: ['assessmentPIIRemoval'],
    fn: async () => {
      // Update status to in_progress
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        'processingSteps.assessmentPIIRemoval.status': 'in_progress',
        'processingSteps.assessmentPIIRemoval.startedAt': new Date(),
      });

      // Get the analysis record
      const analysis = await CallAnalysis.findById(analysisId);
      if (!analysis || !analysis.rawAssessment) {
        throw new Error('Analysis or raw assessment not found');
      }

      // Remove PII from assessment
      const cleanedAssessment = await removePIIFromAssessment(
        analysis.rawAssessment,
      );

      // Update with cleaned assessment
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        assessment: cleanedAssessment,
        'processingSteps.assessmentPIIRemoval.status': 'completed',
        'processingSteps.assessmentPIIRemoval.completedAt': new Date(),
      });

      // Check if all processing is complete
      await checkAndMarkComplete(analysisId);

      console.log(
        `PII removal from assessment completed for analysis ${analysisId}`,
      );
    },
  });
}
