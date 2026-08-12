import type { Job } from '@hokify/agenda';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import { transcribeWithSpeakersAlt } from '../../services/call-analysis/transcription.js';
import { S3 } from '../../libs/s3.js';
import { getAgenda } from '../agenda.js';
import { AGENDA_JOB_TYPES, MSIG_COMPANY_ID } from '../../utils/constants.js';
import { withRetry } from './retryUtils.js';

export default async function transcribeWithSpeakersJob(job: Job) {
  const { analysisId } = job.attrs.data as { analysisId: string };

  await withRetry({
    job,
    jobType: AGENDA_JOB_TYPES.TRANSCRIBE_WITH_SPEAKERS,
    analysisId,
    stepKeys: ['transcription'],
    fn: async () => {
      // Update status to in_progress
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        status: 'transcribing',
        'processingSteps.transcription.status': 'in_progress',
        'processingSteps.transcription.startedAt': new Date(),
      });

      // Get the analysis record
      const analysis = await CallAnalysis.findById(analysisId);
      if (!analysis) {
        throw new Error('Analysis not found');
      }

      // Download audio from S3
      const audioKey = analysis.audioFileUrl.split('.amazonaws.com/')[1];
      const audioBuffer = await S3.getFileBuffer(audioKey);

      console.log('Transcribing with speakers for analysis', analysisId);
      let keyterms: string[] | undefined = undefined;
      if (analysis.company.equals(MSIG_COMPANY_ID)) {
        keyterms = [
          'Bryan',
          'Nomer',
          'Johnny',
          'Hong Shin',
          'Siew Hong',
          'Marlia',
          'Yipei',
          'Jennifer',
          'Niki',
          'Nikita',
          'MSIG',
          'MSIG insurance',
        ];
      }

      // Transcribe with speaker diarization
      const transcript = await transcribeWithSpeakersAlt(
        audioBuffer,
        keyterms,
      );

      // Update with raw transcript
      await CallAnalysis.findByIdAndUpdate(analysisId, {
        rawTranscript: transcript,
        status: 'processing',
        'processingSteps.transcription.status': 'completed',
        'processingSteps.transcription.completedAt': new Date(),
      });

      // Start parallel jobs: PII removal from transcript and assessment
      const agenda = getAgenda();

      await agenda.now(AGENDA_JOB_TYPES.REMOVE_PII_FROM_TRANSCRIPT, {
        analysisId,
      });

      await agenda.now(AGENDA_JOB_TYPES.ASSESS_CALL, {
        analysisId,
        product: analysis.product,
      });

      console.log(
        `Transcription completed for analysis ${analysisId}, started parallel processing`,
      );
    },
  });
}
