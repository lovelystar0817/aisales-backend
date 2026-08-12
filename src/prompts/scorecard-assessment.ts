import { ScorecardSection } from '../models/Scorecard.js';

const userTemplate = `[SALES CONVERSATION CONTEXT]
Scenario: {scenario}
Objectives: {objectives}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate a sales technique assessment based strictly on the salesperson's performance against the {framework}. Output ONLY valid JSON using the exact format specified.`;

export function getScorecardPrompt(
  characterName: string,
  scorecardSection: ScorecardSection,
  language?: string,
) {
  // Determine which evaluation framework to use based on framework context
  if (!scorecardSection.prompt) {
    console.error(
      `No prompt defined for scorecard section: ${scorecardSection.name}`,
    );
    return null;
  }
  let basePrompt = scorecardSection.prompt;
  basePrompt = basePrompt?.replaceAll('{{characterName}}', characterName);

  let userPrompt = userTemplate;
  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE]
IMPORTANT: The entire assessment must be in ${language} language.
- All text, including section titles, descriptions, and guidelines must be in ${language}
- Use ${language} equivalents for all technical terms and product features
- Format all numbers and measurements according to ${language} conventions

[IMPORTANT] The assessment should be fully localized in ${language}, including:
- All section titles and descriptions
- All scoring guidelines and descriptions
- All strengths and weaknesses descriptions
- All example text and corrections
- All numerical values and scores`;
  }

  return {
    format: async (params: any) => `${basePrompt}

${userPrompt
  .replace('{scenario}', params.scenario)
  .replace('{objectives}', params.objectives)
  .replace('{transcript}', params.transcript)
  .replace('{extraContext}', params.extraContext || '')}`,
  };
}
