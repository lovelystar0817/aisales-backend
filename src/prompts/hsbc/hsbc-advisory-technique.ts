import {
  hsbcClientRevivalEvaluationPrompt,
  hsbcClientUpgradeEvaluationPrompt,
  hsbcClientOnboardingEvaluationPrompt,
  hsbcGoalPlanningEvaluationPrompt,
  hsbcPortfolioReviewEvaluationPrompt,
} from '../../frameworks/hsbcAdvisoryModel.js';
import { SalesFramework } from '../../frameworks/types.js';

// HSBC Advisory Technique prompt function (following same pattern as getSalesTechniquePrompt)
export function getHSBCAdvisoryTechniquePrompt(
  characterName: string,
  framework: string,
  language?: string,
) {
  // Determine which evaluation framework to use
  let basePrompt: string;

  switch (framework) {
    case SalesFramework.HSBC_CLIENT_UPGRADE_ADVISORY_MODEL:
      basePrompt = hsbcClientUpgradeEvaluationPrompt;
      break;
    case SalesFramework.HSBC_CLIENT_ONBOARDING_ADVISORY_MODEL:
      basePrompt = hsbcClientOnboardingEvaluationPrompt;
      break;
    default:
      throw new Error(`Unknown HSBC advisory framework: ${framework}`);
  }

  // Replace character name placeholder
  basePrompt = basePrompt.replaceAll('{{characterName}}', characterName);

  let userPrompt = `[HSBC WEALTH MANAGEMENT CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

IMPORTANT: When making suggestions and providing examples, tailor them to the client's specific profile, demographics, and situation. If the client profile indicates they are single, married, have children, etc., ensure all recommendations and dialogue examples are contextually appropriate.

Generate a HSBC advisory technique assessment based strictly on the wealth advisor's performance. Output ONLY valid JSON using the exact format specified.`;

  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE - CRITICAL REQUIREMENT]
⚠️ MANDATORY: The ENTIRE assessment INCLUDING the JSON response structure MUST be in ${language} language.

**JSON Response Structure Requirements:**
1. ALL "section" field values in the JSON response MUST use the ${language} section titles from the framework
   - Example for Cantonese: Use "以客為本嘅框架 (關係管理)" NOT "Client-centric framing (Relationship Management)"
   - Example for Cantonese: Use "清晰同結構 (關係管理)" NOT "Clarity & structure (Relationship Management)"
   - Example for Cantonese: Use "語調 (溝通同表現)" NOT "Tone (Communication and Presence)"

2. ALL "why" explanations MUST be written entirely in ${language}

3. ALL "suggestion" recommendations MUST be written entirely in ${language}

4. ALL example dialogue and text MUST be in ${language}

5. Use ${language} equivalents for all technical terms and advisory concepts

6. Format all numbers and measurements according to ${language} conventions

**VERIFICATION CHECKLIST:**
- ✓ Section titles in JSON match the ${language} framework exactly
- ✓ All "why" fields contain only ${language} text
- ✓ All "suggestion" fields contain only ${language} text
- ✓ All example dialogue is in ${language}
- ✓ No English text appears anywhere in the assessment

[CRITICAL] If the language is Cantonese/yue, the JSON response MUST use Cantonese section titles like:
"以客為本嘅框架 (關係管理)", "清晰同結構 (關係管理)", "適切性同合規意識 (關係管理)",
"份量同表達 (個人品牌)", "參與同融洽 (建立信任)", "問候同設定背景 (流程遵守)",
"介紹 HSBC 財富主張 (流程遵守)", "客戶資料同入門 (流程遵守)", "行動呼籲同下一步 (流程遵守)",
"HSBC 代表準確性", "語調 (溝通同表現)", "措辭同清晰度 (溝通同表現)", "參與同主動聆聽 (溝通同表現)"`;
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
