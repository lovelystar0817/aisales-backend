import type { Job } from '@hokify/agenda';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { removePIIFromMSIGAssessment } from '../../services/call-analysis/piiRemoval.js';
import { AGENDA_JOB_TYPES } from '../../utils/constants.js';
import { checkAndMarkComplete } from './utils.js';
import { withRetry } from './retryUtils.js';

export default async function removePIIFromMsigAssessmentJob(job: Job) {
  const { analysisId } = job.attrs.data as { analysisId: string };

  await withRetry({
    job,
    jobType: AGENDA_JOB_TYPES.REMOVE_PII_FROM_MSIG_ASSESSMENT,
    analysisId,
    stepKeys: ['assessmentPIIRemoval'],
    fn: async () => {
      // Update status to in_progress (reuses same processingStep key)
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        'processingSteps.assessmentPIIRemoval.status': 'in_progress',
        'processingSteps.assessmentPIIRemoval.startedAt': new Date(),
      });

      // Get the analysis record
      const analysis = await CallAnalysis.findById(analysisId);
      if (!analysis || !analysis.rawMsigAssessment) {
        throw new Error('Analysis or raw MSIG assessment not found');
      }

      // Remove PII from MSIG assessment
      const cleanedAssessment = await removePIIFromMSIGAssessment(
        analysis.rawMsigAssessment,
      );

      // Update with cleaned MSIG assessment
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        msigAssessment: cleanedAssessment,
        'processingSteps.assessmentPIIRemoval.status': 'completed',
        'processingSteps.assessmentPIIRemoval.completedAt': new Date(),
      });

      // Check if all processing is complete
      await checkAndMarkComplete(analysisId);

      console.log(
        `PII removal from MSIG assessment completed for analysis ${analysisId}`,
      );
    },
  });
}
