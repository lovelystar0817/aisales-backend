import type {
  ICallOverview,
  ITranscriptSegment,
} from '../../../models/CallAnalysis.js';
import { generateKeyTakeaways } from './keyTakeaways.js';
import { generateCallHealth } from './callHealth.js';
import { generateActionableNextSteps } from './actionableNextSteps.js';

// Main overview generation function
export async function generateCallOverview(
  transcript: ITranscriptSegment[],
  product?: string,
): Promise<ICallOverview> {
  try {
    // Format transcript for assessment
    const formattedTranscript = transcript
      .map(
        (segment) =>
          `${segment.role.toUpperCase()} (${segment.timestamp}s): ${segment.content}`,
      )
      .join('\n');

    // Run all overview generations in parallel
    const [keyTakeaways, callHealth, actionableNextSteps] = await Promise.all([
      generateKeyTakeaways(formattedTranscript),
      generateCallHealth(formattedTranscript, product),
      generateActionableNextSteps(formattedTranscript, product),
    ]);

    const overview: ICallOverview = {
      keyTakeaways,
      callHealth,
      actionableNextSteps,
    };

    return overview;
  } catch (error) {
    console.error('Error generating call overview:', error);
    throw new Error('Failed to generate call overview');
  }
}
