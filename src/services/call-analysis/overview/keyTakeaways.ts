import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../../../utils/constants.js';

// Schema for key takeaways extraction
const keyTakeawaysSchema = z.object({
  keyTakeaways: z.array(z.string()).min(3).max(5),
});

const keyTakeawaysSystemPrompt = `You are an expert call analysis specialist for MSIG Insurance. Your task is to extract the most important key takeaways from a sales/service call transcript.

[EXTRACTION CONTEXT]
- Focus on concrete information, decisions, and outcomes from the conversation
- Capture specific details about products, coverage amounts, dates, and customer requests
- Note any actions taken or agreed upon during the call
- Include relevant context about what the customer wanted and what was ultimately provided
- Be specific with numbers, dates, products, and coverage details when mentioned

[OUTPUT REQUIREMENTS]
- Provide 3-5 key takeaways that capture the essence of the call
- Each takeaway should be a complete, informative sentence
- Use specific details rather than generic statements
- Focus on outcomes and decisions rather than process descriptions
- Include coverage amounts, product names, dates, and other concrete details when available

[EXAMPLE FORMAT]
Good takeaways:
- "Customer requested an upgrade to Travel Protect Plus to increase medical coverage from $100k → $250k for an upcoming trip to Japan (15–22 Oct)."
- "Initial hesitation on premium cost; you clarified what the upgrade adds (higher medical, evacuation, baggage) and key exclusions (pre-existing conditions, adventure sports without rider)."

Poor takeaways:
- "Customer asked about insurance" (too vague)
- "Agent explained the product" (not specific enough)

[STRICT JSON OUTPUT FORMAT]
{{
  "keyTakeaways": ["string array of 3-5 key takeaways"]
}}`;

const keyTakeawaysUserPrompt = `[TRANSCRIPT TO ANALYZE]
{transcript}

Extract 3-5 key takeaways from this call transcript. Focus on:
1. The primary customer request or issue
2. Specific products, coverage amounts, or services discussed
3. Important decisions made or actions taken
4. Any future plans or follow-up items mentioned
5. Resolution or outcome of the call

Provide concrete, specific takeaways that give a clear picture of what happened in this call.

Return ONLY valid JSON with an array of key takeaways.`;

export async function generateKeyTakeaways(
  transcript: string,
): Promise<string[]> {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', keyTakeawaysSystemPrompt],
    ['user', keyTakeawaysUserPrompt],
  ]);

  const formattedPrompt = await prompt.format({ transcript });

  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1_MINI,
    temperature: 0.2,
  });

  const response = await model
    .withStructuredOutput(keyTakeawaysSchema)
    .invoke(formattedPrompt);

  if (!response || !response.keyTakeaways) {
    throw new Error('Invalid response from key takeaways extraction');
  }

  return response.keyTakeaways;
}
