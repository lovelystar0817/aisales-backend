import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../../../utils/constants.js';
import { MSIG_TRAVELEASY_PRODUCT_INFO } from '../productInfo.js';
import { getPARecoveryPlusProductInfoForPrompt } from '../../../products/PARecoveryPlus.js';
import { getDentiPlusProductInfoForPrompt } from '../../../products/DentiPlus.js';

function getProductReference(product?: string): string {
  if (product === 'parecoveryplus')
    return getPARecoveryPlusProductInfoForPrompt();
  if (product === 'dentiplus') return getDentiPlusProductInfoForPrompt();
  return MSIG_TRAVELEASY_PRODUCT_INFO;
}

// Schema for call health analysis
const callHealthSchema = z.object({
  positiveSignals: z.array(z.string()).min(2).max(4),
  risksObserved: z.array(z.string()).min(2).max(4),
  recommendations: z.array(z.string()).min(2).max(4),
});

// Import mandatory aspects system prompt for reference
const mandatoryAspectsReference = `
COMPLIANCE REQUIREMENTS:
- Must verify at least 3 customer particulars before releasing policy information
- Must use proper greeting script
- Must consistently address customer
- Cannot reveal information to 3rd parties without justification
- Must provide clear and accurate product information
- Must close with proper script`;

function buildCallHealthSystemPrompt(product?: string): string {
  return `You are an expert call quality analyst for MSIG Insurance. Your task is to analyze the health of a sales/service call by identifying positive
  signals, risks, and providing recommendations.
  
  [ANALYSIS CONTEXT]
  - Focus on signals from the CUSTOMER's perspective and behavior
  - Identify compliance and procedural risks based on MSIG requirements
  - Provide actionable recommendations for improvement
  - Be specific and concrete in your observations
  
  [PRODUCT REFERENCE]
  ${getProductReference(product)}
  
  ${mandatoryAspectsReference}
  
  [OUTPUT REQUIREMENTS]
  For each section, provide 2-4 bullet points that are specific and actionable.
  
  [STRICT JSON OUTPUT FORMAT]
  {{
    "positiveSignals": ["array of 2-4 positive customer signals"],
    "risksObserved": ["array of 2-4 compliance or business risks"],
    "recommendations": ["array of 2-4 specific recommendations"]
  }}`;
}

const callHealthUserPrompt = `[TRANSCRIPT TO ANALYZE]
{transcript}

Analyze the call health by evaluating:

**1. POSITIVE SIGNALS FROM CUSTOMER (2-4 points)**
Focus on customer engagement and interest indicators:
- Did they ask detailed questions about products/coverage?
- Did they express interest in proceeding or upgrading?
- Did they show understanding after explanations?
- Did they mention future needs or additional coverage?
- Did they accept recommendations or proposals?

Example positive signals:
- "Asked detailed product questions and confirmed understanding after your recap."
- "Agreed to proceed with the higher coverage once benefits/cost were clarified."
- "Expressed interest in future spouse coverage and possibly an annual plan."

**2. RISKS OBSERVED (2-4 points)**
Focus on compliance gaps and potential issues:
- Verification requirements not fully met (need 3+ identifiers)
- Unclear or contradictory information provided
- Customer misconceptions not fully addressed
- Payment or follow-up risks
- Missing documentation or confirmation steps
- Any violations of mandatory procedures

Example risks:
- "Compliance gap: only 2 identifiers verified before discussing policy details (needs 3+)."
- "Minor misconception surfaced around adventure sports coverage; could cause post-purchase complaints if not documented."
- "Payment pending — potential drop-off without timely follow-up; no alternative mid-tier option was offered during decision window."

**3. RECOMMENDATIONS (2-4 points)**
Provide specific, actionable improvements based on the risks and overall interaction:
- Process improvements for compliance
- Sales technique enhancements
- Customer experience improvements
- Follow-up strategies
- Training focus areas

Example recommendations:
- "Add a short 3-identifier verification script to open every policy discussion."
- "Use a one-minute compare (Standard vs Plus vs Annual) to pre-empt cost objections."
- "Practice brief objection handling for price and adventure-sports questions."
- "Proactively position spouse/annual options when household or frequent-travel cues appear."

Return ONLY valid JSON with the three required arrays.`;

export async function generateCallHealth(
  transcript: string,
  product?: string,
): Promise<{
  positiveSignals: string[];
  risksObserved: string[];
  recommendations: string[];
}> {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', buildCallHealthSystemPrompt(product)],
    ['user', callHealthUserPrompt],
  ]);

  const formattedPrompt = await prompt.format({ transcript });

  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1_MINI,
    temperature: 0.2,
  });

  const response = await model
    .withStructuredOutput(callHealthSchema)
    .invoke(formattedPrompt);

  if (
    !response ||
    !response.positiveSignals ||
    !response.risksObserved ||
    !response.recommendations
  ) {
    throw new Error('Invalid response from call health analysis');
  }

  return {
    positiveSignals: response.positiveSignals,
    risksObserved: response.risksObserved,
    recommendations: response.recommendations,
  };
}
