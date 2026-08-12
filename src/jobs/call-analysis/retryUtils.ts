import type { Job } from '@hokify/agenda';
import { CallAnalysis } from '../../models/CallAnalysis.js';

const RETRY_DELAYS = [
  30 * 1000, // 30 seconds
  2 * 60 * 1000, // 2 minutes
  5 * 60 * 1000, // 5 minutes
];

const MAX_RETRIES = 3;

export interface RetryJobData {
  analysisId: string;
  product?: string;
  retryCount?: number;
}

export async function withRetry(options: {
  job: Job;
  jobType: string;
  analysisId: string;
  stepKeys: string[];
  fn: () => Promise<void>;
}) {
  const { job, jobType, analysisId, stepKeys, fn } = options;
  const { retryCount = 0 } = job.attrs.data as RetryJobData;

  try {
    await fn();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `Error in ${jobType} (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`,
      error,
    );

    if (retryCount < MAX_RETRIES) {
      const delayIndex = Math.min(retryCount, RETRY_DELAYS.length - 1);
      const retryDelay = RETRY_DELAYS[delayIndex];
      const retryAt = new Date(Date.now() + retryDelay);

      console.log(
        `Scheduling retry ${retryCount + 1}/${MAX_RETRIES} for analysis ${analysisId} in ${retryDelay / 1000}s`,
      );

      await job.agenda.schedule(retryAt, jobType, {
        ...(job.attrs.data as object),
        retryCount: retryCount + 1,
      });

      return;
    }

    // max retries exhausted - mark as failed
    const failUpdate: Record<string, any> = {
      status: 'failed',
      error: {
        step: stepKeys[0],
        message: errorMessage,
        timestamp: new Date(),
      },
    };

    for (const stepKey of stepKeys) {
      failUpdate[`processingSteps.${stepKey}.status`] = 'failed';
      failUpdate[`processingSteps.${stepKey}.completedAt`] = new Date();
      failUpdate[`processingSteps.${stepKey}.error`] = errorMessage;
    }

    await CallAnalysis.findByIdAndUpdate(analysisId, failUpdate);

    throw error;
  }
}
