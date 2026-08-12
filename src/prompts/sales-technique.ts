import { ChatPromptTemplate } from '@langchain/core/prompts';
import { fourCModelEvaluationPrompt } from '../frameworks/fourCModel.js';
import { meddpiccFrameworkEvaluationPrompt } from '../frameworks/meddpicc.js';
import { mexMeddpiccFrameworkEvaluationPrompt } from '../frameworks/mexMeddpicc.js';
import { strategicPitchFrameworkEvaluationPrompt } from '../frameworks/strategicPitch.js';
import { threeFModelEvaluationPrompt } from '../frameworks/threeFModel.js';
import { mtlRecruitmentFrameworkEvaluationPrompt } from '../frameworks/mtlRecruitment.js';
import { mtlAdvisoryFrameworkEvaluationPrompt } from '../frameworks/mtlAdvisory.js';
import { mtlProspectFrameworkEvaluationPrompt } from '../frameworks/mtlProspect.js';
import { axaPhFNAEvaluationPrompt } from '../frameworks/axaPhFNA.js';
import { axaPhObjectionHandlingEvaluationPrompt } from '../frameworks/axaPhObjectionHandling.js';
import {
  hsbcClientOnboardingEvaluationPrompt,
  hsbcClientUpgradeEvaluationPrompt,
} from '../frameworks/hsbcAdvisoryModel.js';
import { alibabaTelesalesFrameworkEvaluationPrompt } from '../frameworks/alibabaTelesales.js';
import {
  greatEasternFactFindEvaluationPrompt,
  greatEasternProductPitchEvaluationPrompt,
  greatEasternPostSalesEvaluationPrompt,
} from '../frameworks/greatEastern.js';
import { scbAdvisoryEvaluationPrompt } from '../frameworks/scbAdvisory.js';
import { lalamoveDriverRecruitmentEvaluationPrompt } from '../frameworks/lalamoveDriverRecruitment.js';
import { SalesFramework } from '../frameworks/types.js';

const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate a sales technique assessment based strictly on the salesperson's performance against the {framework}. Output ONLY valid JSON using the exact format specified.`;

export function getSalesTechniquePrompt(
  characterName: string,
  framework: SalesFramework,
  language?: string,
) {
  // Determine which evaluation framework to use based on framework context
  let basePrompt;
  switch (framework) {
    case SalesFramework.MEDDPICC:
      basePrompt = meddpiccFrameworkEvaluationPrompt;
      break;
    case SalesFramework.GRAB_MEX_MEDDPICC:
      basePrompt = mexMeddpiccFrameworkEvaluationPrompt;
      break;
    case SalesFramework.STRATEGIC_PITCH:
      basePrompt = strategicPitchFrameworkEvaluationPrompt;
      break;
    case SalesFramework.FOUR_C_MODEL:
      basePrompt = fourCModelEvaluationPrompt;
      break;
    case SalesFramework.THREE_F_MODEL:
      basePrompt = threeFModelEvaluationPrompt;
      break;
    case SalesFramework.MTL_RECRUITMENT_FRAMEWORK:
      basePrompt = mtlRecruitmentFrameworkEvaluationPrompt;
      break;
    case SalesFramework.MTL_ADVISORY_FRAMEWORK:
      basePrompt = mtlAdvisoryFrameworkEvaluationPrompt;
      break;
    case SalesFramework.MTL_PROSPECT_FRAMEWORK:
      basePrompt = mtlProspectFrameworkEvaluationPrompt;
      break;
    case SalesFramework.AXA_PH_FNA_FRAMEWORK:
      basePrompt = axaPhFNAEvaluationPrompt;
      break;
    case SalesFramework.AXA_PH_OBJECTION_HANDLING_FRAMEWORK:
      basePrompt = axaPhObjectionHandlingEvaluationPrompt;
      break;
    case SalesFramework.HSBC_CLIENT_ONBOARDING_ADVISORY_MODEL:
      basePrompt = hsbcClientOnboardingEvaluationPrompt;
      break;
    case SalesFramework.HSBC_CLIENT_UPGRADE_ADVISORY_MODEL:
      basePrompt = hsbcClientUpgradeEvaluationPrompt;
      break;
    case SalesFramework.ALIBABA_TELESALES:
      basePrompt = alibabaTelesalesFrameworkEvaluationPrompt;
      break;
    case SalesFramework.GREAT_EASTERN_FACT_FIND:
      basePrompt = greatEasternFactFindEvaluationPrompt;
      break;
    case SalesFramework.GREAT_EASTERN_PRODUCT_PITCH:
      basePrompt = greatEasternProductPitchEvaluationPrompt;
      break;
    case SalesFramework.GREAT_EASTERN_POST_SALES:
      basePrompt = greatEasternPostSalesEvaluationPrompt;
      break;
    case SalesFramework.SCB_ADVISORY_FRAMEWORK:
      basePrompt = scbAdvisoryEvaluationPrompt;
      break;
    case SalesFramework.LALAMOVE_DRIVER_RECRUITMENT:
      basePrompt = lalamoveDriverRecruitmentEvaluationPrompt;
      break;
    default:
      throw new Error(`Unknown framework: ${framework}`);
  }
  basePrompt = basePrompt.replaceAll('{{characterName}}', characterName);

  let userPrompt = userTemplate;
  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE]
IMPORTANT: The entire assessment must be in ${language} language.
- All text, including section titles, descriptions, and guidelines must be in ${language}
- Use ${language} equivalents for all technical terms and product features
- Format all numbers and measurements according to ${language} conventions
- NEVER mix English words into ${language} text — translate everything including prefixes like "Say:", "Example:", "Tip:" into ${language}

[IMPORTANT] The assessment should be fully localized in ${language}, including:
- All section titles and descriptions
- All scoring guidelines and descriptions
- All strengths and weaknesses descriptions
- All example text, corrections, and suggestion scripts
- All numerical values and scores`;
  }

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userPrompt],
  ]);
}
