import type { Job } from '@hokify/agenda';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { removePIIFromOverview } from '../../services/call-analysis/piiRemoval.js';
import { AGENDA_JOB_TYPES } from '../../utils/constants.js';
import { checkAndMarkComplete } from './utils.js';
import { withRetry } from './retryUtils.js';

export default async function removePIIFromOverviewJob(job: Job) {
  const { analysisId } = job.attrs.data as { analysisId: string };

  await withRetry({
    job,
    jobType: AGENDA_JOB_TYPES.REMOVE_PII_FROM_OVERVIEW,
    analysisId,
    stepKeys: ['overviewPIIRemoval'],
    fn: async () => {
      // Update status to in_progress
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        'processingSteps.overviewPIIRemoval.status': 'in_progress',
        'processingSteps.overviewPIIRemoval.startedAt': new Date(),
      });

      // Get the analysis record
      const analysis = await CallAnalysis.findById(analysisId);
      if (!analysis || !analysis.rawOverview) {
        throw new Error('Analysis or raw overview not found');
      }

      // Remove PII from overview
      const cleanedOverview = await removePIIFromOverview(analysis.rawOverview);

      // Update with cleaned overview
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        overview: cleanedOverview,
        'processingSteps.overviewPIIRemoval.status': 'completed',
        'processingSteps.overviewPIIRemoval.completedAt': new Date(),
      });

      // Check if all processing is complete
      await checkAndMarkComplete(analysisId);

      console.log(
        `PII removal from overview completed for analysis ${analysisId}`,
      );
    },
  });
}
