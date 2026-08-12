import { CallAnalysis } from '../../models/CallAnalysis.js';

export async function checkAndMarkComplete(analysisId: string) {
  const analysis = await CallAnalysis.findById(analysisId);
  if (!analysis) return;

  const allStepsComplete =
    analysis.processingSteps.transcription.status === 'completed' &&
    analysis.processingSteps.transcriptPIIRemoval.status === 'completed' &&
    analysis.processingSteps.assessment.status === 'completed' &&
    analysis.processingSteps.assessmentPIIRemoval.status === 'completed' &&
    analysis.processingSteps.overview.status === 'completed' &&
    analysis.processingSteps.overviewPIIRemoval.status === 'completed';

  if (allStepsComplete) {
    await CallAnalysis.findByIdAndUpdate(analysisId, {
      status: 'completed',
      completedAt: new Date(),
      new: true,
    });
  }
}
