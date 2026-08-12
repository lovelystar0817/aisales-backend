import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../../../utils/constants.js';
import { calculateWeightedScore, getPerformanceMarking } from './scoring.js';
import type { EvaluationResult } from './index.js';

// Schema for summary generation
const summarySchema = z.object({
  summary: z
    .string()
    .describe('A descriptive 3-4 sentence summary of the call performance'),
  suggestedNextSteps: z
    .array(z.string())
    .describe('Array of specific actionable recommendations'),
});

const summarySystemPrompt = `You are an expert call quality assessor for MSIG Insurance providing feedback to a sales representative.

[WRITING STYLE]
- Write directly to the sales representative using "you" throughout
- Be constructive and professional in tone
- Focus on specific behaviors and outcomes
- Provide actionable feedback

[SUMMARY REQUIREMENTS]
- Write 3-4 sentences that provide a comprehensive overview of the call performance
- Address the representative directly (e.g., "You demonstrated..." not "The agent demonstrated...")
- Include specific strengths and areas for improvement
- Reference the scores naturally within the narrative
- Make it personalized and meaningful, not just listing numbers

[SUGGESTED NEXT STEPS REQUIREMENTS]
- Provide 3-5 specific, actionable recommendations
- Prioritize based on the weakest areas identified
- Make recommendations concrete and achievable
- Frame positively (what to do, not just what not to do)
- Address the representative directly using "you"

[JSON OUTPUT FORMAT]
{{
  "summary": "string - 3-4 sentence descriptive summary addressing the representative directly",
  "suggestedNextSteps": ["string - specific actionable recommendation"]
}}`;

const summaryUserPrompt = `Based on the call evaluation results below, generate a personalized summary and actionable next steps for the sales representative.

[EVALUATION SCORES]
Overall Performance: {overallPerformance} ({overallPercentage}%)
- Mandatory Aspects: {mandatoryPercentage}%
- Soft Skills: {softSkillsPercentage}%
- Knowledge Application: {knowledgePercentage}%

[DETAILED EVALUATION RESULTS]

MANDATORY ASPECTS:
{mandatoryDetails}

SOFT SKILLS:
{softSkillsDetails}

KNOWLEDGE APPLICATION:
{knowledgeDetails}

[WEAK AREAS IDENTIFIED]
{weakAreas}

Generate a summary that:
1. Provides an overall assessment of the call performance
2. Highlights key strengths demonstrated
3. Identifies the most important areas for improvement
4. Maintains a constructive and encouraging tone

Generate suggested next steps that:
1. Address the specific weak areas identified
2. Provide concrete actions the representative can take
3. Are prioritized by importance and impact
4. Support continuous improvement

Remember to write everything from a second-person perspective, addressing the sales representative directly as "you".`;

export async function generateSummaryAndNextSteps(
  mandatoryScores: EvaluationResult[],
  softSkillsScores: EvaluationResult[],
  knowledgeScores: EvaluationResult[],
): Promise<{ summary: string; suggestedNextSteps: string[] }> {
  // Calculate weighted scores for each category
  const mandatoryPercentage = calculateWeightedScore(mandatoryScores);
  const softSkillsPercentage = calculateWeightedScore(softSkillsScores);
  const knowledgePercentage = calculateWeightedScore(knowledgeScores);
  const allScores = [...mandatoryScores, ...softSkillsScores, ...knowledgeScores];
  const totalWeightedScore = allScores.reduce((sum, s) => sum + s.score * s.weight, 0);
  const totalMaxWeightedScore = allScores.reduce(
    (sum, s) => sum + s.maxScore * s.weight,
    0,
  );
  const overallPercentage =
    totalMaxWeightedScore > 0
      ? (totalWeightedScore / totalMaxWeightedScore) * 100
      : 0;

  const overallPerformance = getPerformanceMarking(overallPercentage);

  // Format detailed evaluation results
  const formatEvaluationDetails = (scores: EvaluationResult[]) =>
    scores
      .map(
        (s) =>
          `- ${s.criteria}: ${s.score}/${s.maxScore} (${((s.score / s.maxScore) * 100).toFixed(0)}%) - ${s.evaluation}`,
      )
      .join('\n');

  const mandatoryDetails = formatEvaluationDetails(mandatoryScores);
  const softSkillsDetails = formatEvaluationDetails(softSkillsScores);
  const knowledgeDetails = formatEvaluationDetails(knowledgeScores);

  // Identify weak areas (below 80% of max score)
  const findWeakAreas = (scores: EvaluationResult[], category: string) =>
    scores
      .filter((s) => s.score / s.maxScore < 0.8)
      .map(
        (s) =>
          `${category}: ${s.criteria} (${((s.score / s.maxScore) * 100).toFixed(0)}%)`,
      );

  const weakAreas = [
    ...findWeakAreas(mandatoryScores, 'Mandatory'),
    ...findWeakAreas(softSkillsScores, 'Soft Skills'),
    ...findWeakAreas(knowledgeScores, 'Knowledge'),
  ].join('\n');

  // Generate summary and next steps using LLM
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', summarySystemPrompt],
    ['user', summaryUserPrompt],
  ]);

  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1_MINI,
    temperature: 0.2,
  });

  try {
    const response = await prompt
      .pipe(model.withStructuredOutput(summarySchema))
      .invoke({
        overallPerformance,
        overallPercentage: overallPercentage.toFixed(1),
        mandatoryPercentage: mandatoryPercentage.toFixed(1),
        softSkillsPercentage: softSkillsPercentage.toFixed(1),
        knowledgePercentage: knowledgePercentage.toFixed(1),
        mandatoryDetails,
        softSkillsDetails,
        knowledgeDetails,
        weakAreas:
          weakAreas ||
          'No significant weak areas identified - excellent performance across all categories',
      });

    if (!response || !response.summary || !response.suggestedNextSteps) {
      throw new Error('Invalid response from summary generation');
    }

    return {
      summary: response.summary,
      suggestedNextSteps: response.suggestedNextSteps,
    };
  } catch (error) {
    console.error(
      'Error generating summary with LLM, falling back to basic summary:',
      error,
    );

    throw error;
  }
}
