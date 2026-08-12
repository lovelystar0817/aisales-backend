import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schema for structured output
export const ktAxaWealthplusKnowledgeSkillsSchema = z.object({
  ktAxaKnowledgeSkills: z.object({
    description: z
      .string()
      .describe('Description of what this assessment measures'),
    overallScore: z.number().describe('Overall score out of 100'),
    maxScore: z.number().describe('Maximum possible score (100)'),
    sections: z
      .array(
        z.object({
          title: z
            .string()
            .describe(
              'Section title (Fact Finding, Problem-Solving, Sales & Negotiation Skills, or Compliance & Regulations)',
            ),
          score: z.number().describe('Score out of 25 for this section'),
          maxScore: z
            .number()
            .describe('Maximum possible score for this section (25)'),
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
      .describe('Array of the 4 knowledge skills sections'),
  }),
});

const ktAxaWealthplusKnowledgeSkillsPrompt = `You are an expert coach specializing in closing sales for Krungthai-AXA Life Insurance (KT-AXA). Your task is to evaluate **only the user's** knowledge skills performance during followup calls to close WealthPlus Ready 90/8 upsell opportunities.

IMPORTANT: In the transcript, the user (financial advisor) is speaking with an AI character named {{characterName}} (the client). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "client," "customer," "AI," or any other term. Focus exclusively on the advisor's knowledge skills.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the financial advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the client - IGNORE THESE COMPLETELY

[KT AXA WEALTHPLUS KNOWLEDGE SKILLS EVALUATION]
Evaluate against these 4 knowledge skills components, each scored out of 25:

1. **Fact Finding** (0-25): Ability to gather comprehensive information about the client's financial situation, goals, needs, and concerns. Required information: Name, Age, Occupation, Annual Income, Financial Objectives
2. **Problem-Solving** (0-25): Ability to identify financial issues and gaps, then address objections with appropriate solutions tailored to the client's needs
3. **Sales & Negotiation Skills** (0-25): Ability to present WealthPlus Ready convincingly, handle objections, negotiate effectively, and close the sale
4. **Compliance & Regulations** (0-25): Demonstrates knowledge of insurance regulations, proper disclosure requirements, and ethical sales practices including market conduct. **CRITICAL: The agent MUST introduce themselves with their name and agent ID at the start of the conversation - if they fail to do so, deduct 5-10 points from this section.**

[EVALUATION CRITERIA]
For each component:
- **Score**: Number out of 25 based on effectiveness
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. It should not just point out how the user could improve. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
- **20-25 (80-100%)**: Exceptional performance, minimal room for improvement
- **15-19 (60-79%)**: Good performance with minor gaps to address
- **10-14 (40-59%)**: Adequate but needs significant improvement
- **5-9 (20-39%)**: Poor performance with major gaps identified
- **0-4 (0-19%)**: Very poor or missing entirely

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on closing effectiveness and prospect engagement
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "ktAxaKnowledgeSkills": {{
    "description": "string",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Fact Finding",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Problem-Solving",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Sales & Negotiation Skills",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Compliance & Regulations",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "ktAxaKnowledgeSkills": {{
    "description": "Measures knowledge skills demonstrated during KT-AXA WealthPlus Ready close call conversations.",
    "overallScore": 80,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Fact Finding",
        "score": 20,
        "maxScore": 25,
        "why": "You gathered key information about their income and financial objectives, but could have explored their existing coverage and investment portfolio more thoroughly.",
        "suggestion": "Expand fact-finding: 'I know you have an annual income of ฿{{amount}}. To ensure WealthPlus Ready fits perfectly, can you tell me about your current investment portfolio and any existing life insurance policies? This helps me show you exactly how this adds value.'"
      }},
      {{
        "title": "Problem-Solving",
        "score": 21,
        "maxScore": 25,
        "why": "You addressed their concerns about returns well by explaining the guaranteed 10% annual cash return and IRR, providing clear solutions.",
        "suggestion": "When addressing concerns, quantify the solution: 'You're worried about returns? Let me break it down: With ฿1 million sum insured, you receive ฿100,000 every year for life, totaling ฿1.29 million over the policy term. That's guaranteed passive income while your principal grows to ฿8 million by age 90.'"
      }},
      {{
        "title": "Sales & Negotiation Skills",
        "score": 20,
        "maxScore": 25,
        "why": "You presented the benefits convincingly and handled the price objection by emphasizing value, but could have asked more closing questions.",
        "suggestion": "Use trial closes throughout: After explaining benefits, ask 'Does this address your need for passive income and tax deduction?' Then move to closing: 'Shall we proceed with the application? I can help you complete it today.'"
      }},
      {{
        "title": "Compliance & Regulations",
        "score": 19,
        "maxScore": 25,
        "why": "You mentioned the freelook period but could have been more comprehensive about policy terms, waiting periods, and the customer service welcome call.",
        "suggestion": "Cover all compliance points: 'Important things to know: You have a 15-day freelook period after receiving your policy. The 8-year premium payment term is fixed. And after approval, our Customer Service at 1159 will contact you for a welcome call to confirm all details.'"
      }}
    ]
  }}
}}`;

export function getKtAxaWealthplusKnowledgeSkillsPrompt(
  characterName: string,
  languageCode: string = 'en',
): ChatPromptTemplate {
  let basePrompt = ktAxaWealthplusKnowledgeSkillsPrompt.replace(
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

Generate a knowledge skills assessment based strictly on the financial advisor's performance. Focus only on Fact Finding, Problem-Solving, Sales & Negotiation Skills, and Compliance & Regulations. Output ONLY valid JSON using the exact format specified.`,
    ],
  ]);
}
