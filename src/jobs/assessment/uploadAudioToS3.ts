import { Job } from '@hokify/agenda';
import { SalesSession } from '../../models/SalesSession.js';
import { S3 } from '../../libs/s3.js';
import { CLOUDFRONT_DOMAIN } from '../../utils/constants.js';
import fs from 'fs/promises';

interface UploadAudioData {
  sessionId: string;
  tempFilePath: string; // Path to temporary file instead of buffer
  audioFileName: string;
  contentHash: string;
}

export const uploadAudioToS3 = async (job: Job<UploadAudioData>) => {
  const { sessionId, tempFilePath, audioFileName, contentHash } =
    job.attrs.data;

  try {
    console.log(`Background S3 upload started for session ${sessionId}`);

    // Read the audio buffer from temp file
    const audioBuffer = await fs.readFile(tempFilePath);

    // Upload audio to S3 using S3 lib directly
    const uploadResult = await S3.uploadFile(audioBuffer, audioFileName);
    console.log(
      `Audio uploaded to S3 for session ${sessionId}: ${uploadResult.key}`,
    );

    // Generate CloudFront URL for faster delivery
    const publicUrl = `${CLOUDFRONT_DOMAIN}/${audioFileName}`;

    // Update session with the S3 URL
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.audioUrl': publicUrl,
      },
    });

    console.log(`Session ${sessionId} updated with S3 audio URL: ${publicUrl}`);
  } catch (error) {
    console.error(
      `Error uploading audio to S3 for session ${sessionId}:`,
      error,
    );
    throw error; // Agenda will handle retries
  } finally {
    // Clean up: delete the temporary file
    try {
      await fs.unlink(tempFilePath);
      console.log(`Cleaned up temp file: ${tempFilePath}`);
    } catch (cleanupError) {
      console.warn(
        `Failed to cleanup temp file ${tempFilePath}:`,
        cleanupError,
      );
    }
  }
};
