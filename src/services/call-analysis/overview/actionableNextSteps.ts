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

// Schema for actionable next steps
const actionableNextStepsSchema = z.object({
  keyActions: z.array(z.string()).min(2).max(4),
  nextCall: z.string(),
});

function buildActionableNextStepsSystemPrompt(product?: string): string {
  return `You are an expert sales operations analyst for MSIG Insurance. Your task is to extract actionable next steps from a sales/service call to ensure
  successful conversion and customer satisfaction.
  
  [EXTRACTION CONTEXT]
  - Focus on concrete, actionable steps that need to be taken
  - Identify follow-up requirements based on the conversation
  - Be specific about timing, actions, and outcomes
  - Consider both immediate and future opportunities
  
  [PRODUCT REFERENCE]
  ${getProductReference(product)}
  
  [OUTPUT REQUIREMENTS]
  - Key Actions: 2-4 specific actions that need to be taken
  - Next Call: A single, clear description of the next interaction timing and purpose
  
  [STRICT JSON OUTPUT FORMAT]
  {{
    "keyActions": ["array of 2-4 key action items"],
    "nextCall": "string describing the next interaction"
  }}`;
}

const actionableNextStepsUserPrompt = `[TRANSCRIPT TO ANALYZE]
{transcript}

Extract actionable next steps from this call:

**1. KEY ACTIONS (2-4 points)**
Extract specific actions that need to be taken to ensure successful conversion or resolution:
- Payment-related actions (sending links, processing, confirmation)
- Documentation requirements (policy documents, summaries, exclusions)
- CRM updates and tracking
- Customer communications and confirmations
- Internal logging or reporting requirements

Focus on IMMEDIATE actions that directly relate to this specific interaction and customer.

Example key actions:
- "Resend payment link with a concise benefits/exclusions summary; log outcome in CRM (travel dates, destination, chosen plan, spouse/annual interest)."
- "Set a 24-hour follow-up if payment not received; document any barriers (price, timing)."
- "After payment, send policy confirmation PDF and remind customer how to access emergency assistance numbers."

**2. NEXT CALL**
Provide a single, clear description of when and why the next interaction should occur:
- Be specific about timing (e.g., "24 hours", "one week before departure")
- State the purpose clearly
- Include any opportunities for upselling or cross-selling if mentioned

Example next call:
- "Follow up in 24 hours on payment status; if completed, check in one week before departure to confirm documents and revisit spouse/annual options."

Return ONLY valid JSON with the required structure.`;

export async function generateActionableNextSteps(
  transcript: string,
  product?: string,
): Promise<{
  keyActions: string[];
  nextCall: string;
}> {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', buildActionableNextStepsSystemPrompt(product)],
    ['user', actionableNextStepsUserPrompt],
  ]);

  const formattedPrompt = await prompt.format({ transcript });

  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1_MINI,
    temperature: 0.2,
  });

  const response = await model
    .withStructuredOutput(actionableNextStepsSchema)
    .invoke(formattedPrompt);

  if (!response || !response.keyActions || !response.nextCall) {
    throw new Error('Invalid response from actionable next steps extraction');
  }

  return {
    keyActions: response.keyActions,
    nextCall: response.nextCall,
  };
}
