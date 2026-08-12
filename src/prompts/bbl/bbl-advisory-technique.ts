import {
  bblClientRevivalEvaluationPrompt,
  bblClientUpgradeEvaluationPrompt,
  bblGoalPlanningEvaluationPrompt,
  bblPortfolioReviewEvaluationPrompt,
} from '../../frameworks/bblAdvisoryModel.js';
import { SalesFramework } from '../../frameworks/types.js';

// BBL Advisory Technique prompt function (following same pattern as getSalesTechniquePrompt)
export function getBBLAdvisoryTechniquePrompt(
  characterName: string,
  framework: string,
  language?: string,
) {
  // Determine which evaluation framework to use
  let basePrompt: string;

  switch (framework) {
    case SalesFramework.BBL_CLIENT_REVIVAL_ADVISORY_MODEL:
      basePrompt = bblClientRevivalEvaluationPrompt;
      break;
    case SalesFramework.BBL_CLIENT_UPGRADE_ADVISORY_MODEL:
      basePrompt = bblClientUpgradeEvaluationPrompt;
      break;
    case SalesFramework.BBL_PORTFOLIO_REVIEW_ADVISORY_MODEL:
      basePrompt = bblPortfolioReviewEvaluationPrompt;
      break;
    case SalesFramework.BBL_GOAL_PLANNING_ADVISORY_MODEL:
      basePrompt = bblGoalPlanningEvaluationPrompt;
      break;
    default:
      throw new Error(`Unknown BBL advisory framework: ${framework}`);
  }

  // Replace character name placeholder
  basePrompt = basePrompt.replaceAll('{{characterName}}', characterName);

  let userPrompt = `[BANGKOK BANK WEALTH MANAGEMENT CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate a Bangkok Bank advisory technique assessment based strictly on the wealth advisor's performance. Output ONLY valid JSON using the exact format specified.`;

  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE]
IMPORTANT: The entire assessment must be in ${language} language.
- All text, including section titles, descriptions, and guidelines must be in ${language}
- Use ${language} equivalents for all technical terms and advisory concepts
- Format all numbers and measurements according to ${language} conventions

[IMPORTANT] The assessment should be fully localized in ${language}, including:
- All section titles and descriptions
- All scoring guidelines and descriptions
- All "why" explanations and "suggestion" recommendations
- All example text and dialogue suggestions
- All numerical values and scores should use ${language} formatting`;
  }

  return {
    format: async (params: any) => `${basePrompt}

${userPrompt
  .replace('{callType}', params.callType)
  .replace('{scenario}', params.scenario)
  .replace('{objectives}', params.objectives)
  .replace('{framework}', params.framework)
  .replace('{transcript}', params.transcript)
  .replace('{extraContext}', params.extraContext || '')}`,
  };
}
