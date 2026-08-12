import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schema for structured output
export const ktAxaWealthplusProductKnowledgeSchema = z.object({
  ktAxaWealthplusProductKnowledge: z.object({
    description: z
      .string()
      .describe('Description of what this assessment measures'),
    overallScore: z.number().describe('Overall score out of 100'),
    maxScore: z.number().describe('Maximum possible score (100)'),
    sections: z
      .array(
        z.object({
          title: z.string().describe('Section title (Product Pitch)'),
          score: z.number().describe('Score out of 100 for this section'),
          maxScore: z
            .number()
            .describe('Maximum possible score for this section (100)'),
          why: z
            .string()
            .describe('Brief explanation of the score (25-30 words)'),
          suggestion: z
            .string()
            .describe(
              'Specific improvement recommendation with actionable advice and examples',
            ),
        }),
      )
      .describe('Array containing the product pitch section'),
  }),
});

const ktAxaWealthplusProductKnowledgePrompt = `You are an expert coach specializing in WealthPlus Ready 90/8 sales for Krungthai-AXA Life Insurance (KT-AXA). Your task is to evaluate **only the user's** product knowledge and pitching skills during followup calls to close WealthPlus Ready upsell opportunities.

IMPORTANT: In the transcript, the user (financial advisor) is speaking with an AI character named {{characterName}} (the client). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "client," "customer," "AI," or any other term. Focus exclusively on the advisor's product pitch performance.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the financial advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the client - IGNORE THESE COMPLETELY

[KT AXA WEALTHPLUS PRODUCT KNOWLEDGE EVALUATION]
Evaluate the Product Pitch component, scored out of 100:

**Product Pitch** (0-100): Evaluates the advisor's ability to:
- Accurately explain WealthPlus Ready 90/8 features and benefits
- Address common objections effectively (price, returns, value comparison)
- Use appropriate compliance language and avoid prohibited terms
- Close the sale by guiding {{characterName}} to purchase or schedule application completion
- Demonstrate comprehensive product knowledge including:
  * 10% annual cash return from year 1
  * 8-year premium payment term
  * Coverage until age 90
  * Death benefit escalating from 100%-800%
  * Additional 100% ADB (accident death benefit)
  * Premium waiver for TPD (total permanent disability)
  * Maturity benefit of 800% at age 90
  * Total returns of ~1,290% of sum insured
  * IRR of ~1.66%
  * Tax deduction up to 100,000 THB/year
  * Simple underwriting (3 health questions only)

[COMPLIANCE REQUIREMENTS]
Terms agents SHOULD use:
- Information about Freelook period or policy cancellation
- How many years premium must be paid (8 years) and policy maturity age (90)
- Clarify that it is a life insurance policy
- Explain waiting periods for health insurance or critical illness plans (30–90–120 days)
- Inform customer that after policy approval, Customer Service (1159) will contact for Welcome Call

Terms agents should NOT use:
- Break-even point
- Like depositing money
- Continuing from the previous policy
- Once all premiums are paid, you can get all your money back immediately

[COMMON OBJECTIONS TO ADDRESS]
1. "The price of the policy seems very high"
2. "How does this compare to the other policies/policy I already have?"
3. "I am unclear on the returns of the product"
4. "I am not sure if this is value for money"

[EVALUATION CRITERIA]
- **Score**: Number out of 100 based on overall product pitch effectiveness
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. It should not just point out how the user could improve. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
- **80-100 (80-100%)**: Exceptional product knowledge and pitch delivery, accurate information, excellent objection handling, strong close
- **60-79 (60-79%)**: Good product knowledge with minor gaps, generally effective pitch and objection handling
- **40-59 (40-59%)**: Adequate but needs improvement in accuracy, objection handling, or closing
- **20-39 (20-39%)**: Poor product knowledge or pitch delivery with significant gaps
- **0-19 (0-19%)**: Very poor or missing product pitch entirely

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on product accuracy, objection handling, and closing effectiveness
- Check for compliance violations (prohibited terms)
- Consider how well objections were addressed and whether the close was attempted

[STRICT JSON OUTPUT FORMAT]
{{
  "ktAxaProductKnowledge": {{
    "description": "string",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Product Pitch",
        "score": "number",  //out of 100
        "maxScore": 100,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "ktAxaProductKnowledge": {{
    "description": "Measures product knowledge and pitch effectiveness during KT-AXA WealthPlus Ready close call conversations.",
    "overallScore": 75,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Product Pitch",
        "score": 75,
        "maxScore": 100,
        "why": "You explained key benefits well and addressed the price objection, but could have been more specific about the maturity benefit and tax advantages.",
        "suggestion": "Strengthen your pitch with complete details: 'WealthPlus Ready 90/8 gives you guaranteed 10% annual cash return—that's ฿{{amount}} every year from year 1. You pay premiums for just 8 years but stay covered until age 90. At maturity, you receive 800% of your sum insured, totaling 1,290% returns. Plus, you save up to ฿100,000 in taxes annually. With only 3 simple health questions, approval is fast. Shall we complete the application today?'"
      }}
    ]
  }}
}}`;

export function getKtAxaWealthplusProductKnowledgePrompt(
  characterName: string,
  languageCode: string = 'en',
): ChatPromptTemplate {
  let basePrompt = ktAxaWealthplusProductKnowledgePrompt.replace(
    /\{\{characterName\}\}/g,
    characterName,
  );

  // Add language-specific instructions if needed
  if (languageCode === 'th') {
    basePrompt +=
      '\n\n[LANGUAGE INSTRUCTION]\nProvide ALL feedback in Thai language, including the description field, section titles, why explanations, and suggestions.';
  }

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    [
      'user',
      `[CLOSE CALL CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

Generate a product knowledge assessment based strictly on the financial advisor's product pitch performance. Focus on WealthPlus Ready 90/8 product knowledge, objection handling, compliance, and closing effectiveness. Output ONLY valid JSON using the exact format specified.`,
    ],
  ]);
}
