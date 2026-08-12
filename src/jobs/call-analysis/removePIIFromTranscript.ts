import type { Job } from '@hokify/agenda';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { removePIIFromTranscript } from '../../services/call-analysis/piiRemoval.js';
import { AGENDA_JOB_TYPES } from '../../utils/constants.js';
import { checkAndMarkComplete } from './utils.js';
import { withRetry } from './retryUtils.js';

export default async function removePIIFromTranscriptJob(job: Job) {
  const { analysisId } = job.attrs.data as { analysisId: string };

  await withRetry({
    job,
    jobType: AGENDA_JOB_TYPES.REMOVE_PII_FROM_TRANSCRIPT,
    analysisId,
    stepKeys: ['transcriptPIIRemoval'],
    fn: async () => {
      // Update status to in_progress
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        'processingSteps.transcriptPIIRemoval.status': 'in_progress',
        'processingSteps.transcriptPIIRemoval.startedAt': new Date(),
      });

      // Get the analysis record
      const analysis = await CallAnalysis.findById(analysisId);
      if (!analysis || !analysis.rawTranscript) {
        throw new Error('Analysis or raw transcript not found');
      }

      // Remove PII from transcript
      const cleanedTranscript = await removePIIFromTranscript(
        analysis.rawTranscript,
      );

      // Update with cleaned transcript
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        transcript: cleanedTranscript,
        'processingSteps.transcriptPIIRemoval.status': 'completed',
        'processingSteps.transcriptPIIRemoval.completedAt': new Date(),
      });

      // Check if all processing is complete
      await checkAndMarkComplete(analysisId);

      console.log(
        `PII removal from transcript completed for analysis ${analysisId}`,
      );
    },
  });
}
