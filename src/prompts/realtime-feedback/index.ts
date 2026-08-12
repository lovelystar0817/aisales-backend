import { FeedbackPromptParams, FeedbackStrategy } from './types.js';
import { SalesFeedbackStrategy } from './sales-feedback.js';
import { AdvisoryFeedbackStrategy } from './advisory-feedback.js';

/**
 * Factory function to get the appropriate feedback strategy
 * based on the assessment type.
 *
 * @param assessmentType - The type of assessment (e.g., 'bbl', 'hsbc', 'prudential', 'manulife')
 * @returns The appropriate feedback strategy instance
 */
export function getFeedbackStrategy(assessmentType?: string): FeedbackStrategy {
  // BBL assessments use advisory-focused feedback
  if (assessmentType === 'bbl' || assessmentType === 'hsbc') {
    return new AdvisoryFeedbackStrategy();
  }

  // All other assessments (prudential, manulife, msig, default) use sales-focused feedback
  return new SalesFeedbackStrategy();
}

/**
 * Main function to create real-time roleplay feedback prompts
 *
 * @param params - Feedback prompt parameters
 * @returns Promise resolving to formatted messages for the LLM
 */
export async function createRealtimeRoleplayFeedbackPrompt(
  params: FeedbackPromptParams,
) {
  const strategy = getFeedbackStrategy(params.assessmentType);
  return strategy.createPrompt(params);
}

export type { FeedbackPromptParams, FeedbackStrategy } from './types.js';
