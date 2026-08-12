import type {
  IAssessment,
  ITranscriptSegment,
} from '../../../models/CallAnalysis.js';
import { evaluateKnowledgeApplication } from './knowledge.js';
import { evaluateMandatoryAspects } from './mandatory.js';
import { evaluateSoftSkills } from './softskills.js';
import { generateSummaryAndNextSteps } from './summary.js';

// Common type for evaluation results
export interface EvaluationResult {
  criteria: string;
  evaluation: string;
  score: number;
  maxScore: number;
  weight: number;
}

// Main assessment function
export async function assessCallTranscript(
  transcript: ITranscriptSegment[],
): Promise<IAssessment> {
  try {
    // Format transcript for assessment
    const formattedTranscript = transcript
      .map(
        (segment) =>
          `${segment.role.toUpperCase()} (${segment.timestamp}s): ${segment.content}`,
      )
      .join('\n');

    // Run all three evaluations in parallel
    const [mandatoryResults, softSkillsResults, knowledgeResults] =
      await Promise.all([
        evaluateMandatoryAspects(formattedTranscript),
        evaluateSoftSkills(formattedTranscript),
        evaluateKnowledgeApplication(formattedTranscript),
      ]);

    // Generate summary and next steps
    const { summary, suggestedNextSteps } = await generateSummaryAndNextSteps(
      mandatoryResults,
      softSkillsResults,
      knowledgeResults,
    );

    const assessment: IAssessment = {
      summary,
      suggestedNextSteps,
      mandatory: mandatoryResults,
      softSkills: softSkillsResults,
      knowledgeApplication: knowledgeResults,
    };

    return assessment;
  } catch (error) {
    console.error('Error assessing call transcript:', error);
    throw new Error('Failed to assess call transcript');
  }
}

// Re-export utility functions
export { calculateOverallScore, getPerformanceMarking } from './scoring.js';
