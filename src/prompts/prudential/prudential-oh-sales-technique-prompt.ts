import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// 3F Sales Technique Section Schema
const threeFSectionSchema = z.object({
  title: z.string(),
  score: z.number().min(0).max(34),
  maxScore: z.number(),
  why: z.string(),
  suggestion: z.string(),
});

// Sales Technique (3F) Assessment Schema
export const prudentialOHSalesTechniqueSchema = z.object({
  salesTechnique: z.object({
    description: z.string(),
    overallScore: z.number().min(0).max(100),
    maxScore: z.literal(100),
    sections: z.array(threeFSectionSchema), // Feel, Felt, Found (3 items)
  }),
});

export type PrudentialOHSalesTechniqueAssessment = z.infer<
  typeof prudentialOHSalesTechniqueSchema
>;

const systemPrompt = `You are an expert sales coach specializing in objection handling for financial advisors at Prudential. Your task is to evaluate the financial advisor's performance using the **3F Model (Feel, Felt, Found)** for building empathy and rapport.

IMPORTANT: In the transcript, the user (financial advisor) is speaking with an AI character named {{characterName}} (the customer). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the financial advisor's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the financial advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the customer - IGNORE THESE COMPLETELY

---

## SALES TECHNIQUE (3F MODEL) EVALUATION

Evaluate against these 3 components:

1. **Feel** (0-33): How effectively did they demonstrate empathy by acknowledging {{characterName}}'s emotions, concerns, and current situation?
2. **Felt** (0-33): How well did they build credibility and relatability by sharing relevant examples of others who experienced similar situations?
3. **Found** (0-34): How effectively did they present solutions and outcomes that address {{characterName}}'s specific concerns?

### 3F Scoring Guidelines:
- **Exceptional (90-100%)**: Outstanding performance, demonstrates mastery
- **Good (70-89%)**: Solid performance with minor areas for enhancement
- **Adequate (50-69%)**: Basic application but needs improvement
- **Poor (30-49%)**: Weak performance with significant gaps
- **Very Poor (0-29%)**: Missing or ineffective application

---

## FEEDBACK GUIDELINES

- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Include example phrases the advisor could have used
- For each section, provide:
  - **Why**: Brief explanation of the score (25-30 words)
  - **Suggestion**: Specific improvement recommendation with example phrases

---

## SCENARIO CONTEXT

This is a bank branch scenario where:
- A customer walked into the bank for routine banking services
- The financial advisor approached them to discuss insurance
- There is NO pre-existing relationship between them
- The customer's initial reaction is to dismiss the insurance conversation
- The goal is to engage the customer in a meaningful conversation, NOT to close a sale

---

## OUTPUT FORMAT

Return ONLY valid JSON in the following structure:

{{
  "salesTechnique": {{
    "description": "Measures the ability to apply the 3F Model (Feel, Felt, Found) to create empathy, build credibility, and present compelling solutions.",
    "overallScore": <number 0-100>,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Feel",
        "score": <number 0-33>,
        "maxScore": 33,
        "why": "<25-30 word explanation>",
        "suggestion": "<actionable advice with example phrases>"
      }},
      {{
        "title": "Felt",
        "score": <number 0-33>,
        "maxScore": 33,
        "why": "<25-30 word explanation>",
        "suggestion": "<actionable advice with example phrases>"
      }},
      {{
        "title": "Found",
        "score": <number 0-34>,
        "maxScore": 34,
        "why": "<25-30 word explanation>",
        "suggestion": "<actionable advice with example phrases>"
      }}
    ]
  }}
}}`;

const userPrompt = `## Conversation Transcript

{transcript}

---

Please evaluate the financial advisor's performance using the 3F Model (Feel, Felt, Found) as specified in the system instructions.`;

export function getPrudentialOHSalesTechniquePrompt(
  characterName: string,
  _languageCode: string = 'en',
) {
  const formattedSystemPrompt = systemPrompt.replace(
    /\{\{characterName\}\}/g,
    characterName,
  );

  return ChatPromptTemplate.fromMessages([
    ['system', formattedSystemPrompt],
    ['user', userPrompt],
  ]);
}
