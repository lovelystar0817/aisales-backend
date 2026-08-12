import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../../../utils/constants.js';
import { MSIG_TRAVELEASY_PRODUCT_INFO } from '../productInfo.js';
import type { EvaluationResult } from './index.js';

// Schema for knowledge application evaluation
export const knowledgeApplicationSchema = z.object({
  evaluations: z.array(
    z.object({
      criteria: z.string(),
      evaluation: z.string(),
      score: z.number().min(0).max(5),
      maxScore: z.number(),
      weight: z.number().min(1).max(9),
    }),
  ),
});

const knowledgeApplicationSystemPrompt = `You are an expert call quality assessor for MSIG Insurance. Your task is to evaluate how well the sales representative applies their knowledge in a sales/service call, specifically for MSIG TravelEasy products.

[EVALUATION CONTEXT]
- Write the evaluation from a second-person perspective, addressing the sales representative directly as "you"
- Focus on accuracy of information PROVIDED about MSIG products (do not penalize for omissions)
- Assess how well complex insurance terms are explained in simple language
- Be objective and fair in your assessment
- CRITICAL: Only evaluate information that was actually discussed - do not penalize for not mentioning product features unrelated to the customer's query
- CRITICAL: Carefully check for contradictions, inconsistencies, and confusing instructions within the conversation
- CRITICAL: If the agent changes their answer or provides conflicting information, this MUST be reflected in lower scores

[SCORING GUIDELINES]
Each criterion has a specific scoring rubric. Follow the exact scoring guidelines provided for each criterion.
IMPORTANT: Higher scores are better (5 = best performance, 1 = worst performance)

[PRODUCT REFERENCE - MSIG TRAVELEASY]
${MSIG_TRAVELEASY_PRODUCT_INFO}

[STRICT JSON OUTPUT FORMAT]
{{
  "evaluations": [
    {{
      "criteria": "string - exact criteria name",
      "evaluation": "string - detailed evaluation written in second person (e.g., 'You provided accurate...' instead of 'The agent provided...')",
      "score": "number - evaluated score of the criterion",
      "maxScore": "number - max score of the criterion, provide exact one that is provided in the prompt",
      "weight": "number - weight of the criterion, provide exact one that is provided in the prompt"
    }}
  ]
}}`;

const knowledgeApplicationUserPrompt = `[TRANSCRIPT TO EVALUATE]
{transcript}

Evaluate the following knowledge application aspects:

1. **Accuracy of technical information** (maxScore: 5, weight: 9)
   IMPORTANT EVALUATION PRINCIPLE:
   - Only evaluate the accuracy of information that WAS PROVIDED in the conversation
   - DO NOT penalize for omitting product details that were not relevant to the customer's specific query
   - Focus on whether the information given was factually correct, not whether all possible information was mentioned
   - CRITICAL: Check for contradictions, inconsistencies, and confusing instructions
   - CRITICAL: Scheduling of the followup to the current call is NOT to be considered in this or any evaluation criteria. Do NOT penalize or reward based on whether a follow-up call was scheduled.

   Scoring:
   - Score 5: All information provided was accurate, consistent, and jargon-free
   - Score 4: Most information provided was accurate with minimal issues or minor inconsistencies
   - Score 3: Some information provided was accurate but had notable errors, contradictions, or jargon
   - Score 2: Limited accurate information, several errors, major contradictions, or excessive jargon
   - Score 1: Information provided was mostly inaccurate, heavily contradictory, or heavily jargon-filled

   Areas to evaluate (ONLY FOR INFORMATION ACTUALLY PROVIDED):
   - Factual accuracy of any MSIG product information mentioned
   - Consistency of information (no contradictions within the same call)
   - Clarity of instructions (purchasing steps should be clear and actionable)
   - Avoid technical jargon and use layman language

   CRITICAL accuracy checks:
   - Check for CONTRADICTIONS (e.g., saying different age limits at different times)
   - Check for CONFUSING INSTRUCTIONS (e.g., unclear purchasing guidance)
   - Verify CONSISTENCY in definitions (e.g., who qualifies as child vs adult)
   - Ensure CLARITY in family/individual plan eligibility rules

   Specific accuracy checks (ONLY CHECK WHAT WAS MENTIONED):
   - IF age definitions were discussed → must be consistent throughout the call
   - IF family plan eligibility was discussed → must accurately state requirements
   - IF purchasing instructions were given → must be clear and actionable
   - IF coverage amounts were mentioned → must match exactly
   - IF plan names were mentioned → must be correct (Standard, Elite, Premier)
   - IF benefits/limitations were discussed → must be accurately stated
   - IF sub-limits were mentioned → must be accurate
   - IF optional covers were mentioned → must be accurately described

   PENALTY TRIGGERS:
   - Contradicting own statements (e.g., changing age limits mid-conversation)
   - Providing unclear/confusing purchasing instructions
   - Flip-flopping on answers without clear justification
   - Giving incorrect eligibility criteria for plans

Score each criterion from 0-5 based on the agent's performance. Pay special attention to the accuracy of any MSIG TravelEasy product information mentioned. Return ONLY valid JSON.`;

export async function evaluateKnowledgeApplication(
  transcript: string,
): Promise<EvaluationResult[]> {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', knowledgeApplicationSystemPrompt],
    ['user', knowledgeApplicationUserPrompt],
  ]);

  const formattedPrompt = await prompt.format({ transcript });

  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1_MINI,
    temperature: 0,
  });

  const response = await model
    .withStructuredOutput(knowledgeApplicationSchema)
    .invoke(formattedPrompt);

  if (!response || !response.evaluations) {
    throw new Error('Invalid response from knowledge application evaluation');
  }

  return response.evaluations;
}
