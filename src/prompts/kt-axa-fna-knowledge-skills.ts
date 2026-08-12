import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schema for structured output
export const ktAxaFnaKnowledgeSkillsSchema = z.object({
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

const ktAxaFnaKnowledgeSkillsPrompt = `You are an expert coach specializing in financial needs analysis (FNA) for Krungthai-AXA Life Insurance (KT-AXA). Your task is to evaluate **only the user's** knowledge skills performance during FNA conversations with prospects.

IMPORTANT: In the transcript, the user (financial advisor) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "client," "AI," or any other term. Focus exclusively on the advisor's knowledge skills.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the financial advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[KT AXA FNA KNOWLEDGE SKILLS EVALUATION]
Evaluate against these 4 knowledge skills components, each scored out of 25:

1. **Fact Finding** (0-25): Ability to gather comprehensive information about the prospect's financial situation, goals, needs, and concerns through effective questioning
2. **Problem-Solving** (0-25): Ability to identify financial issues and gaps, then provide appropriate solutions tailored to the prospect's needs
3. **Sales & Negotiation Skills** (0-25): Ability to present solutions convincingly, handle objections, and guide the prospect toward appropriate financial decisions
4. **Compliance & Regulations** (0-25): Demonstrates knowledge of insurance regulations, proper disclosure requirements, and ethical sales practices. **CRITICAL: The agent MUST introduce themselves with their name and agent ID at the start of the conversation - if they fail to do so, deduct 5-10 points from this section.**

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
- Focus on FNA process effectiveness and prospect engagement
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
    "description": "Measures knowledge skills demonstrated during KT-AXA financial needs analysis conversations.",
    "overallScore": 78,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Fact Finding",
        "score": 20,
        "maxScore": 25,
        "why": "You asked comprehensive questions about income, expenses, and goals, but could have explored existing coverage and debt situation more thoroughly.",
        "suggestion": "Expand your fact-finding: 'Beyond your monthly income and expenses, can you tell me about any existing insurance policies you have? And do you have any outstanding loans or mortgages I should factor into your financial plan?'"
      }},
      {{
        "title": "Problem-Solving",
        "score": 19,
        "maxScore": 25,
        "why": "You identified protection gaps well but could have provided more specific solutions tailored to their unique situation.",
        "suggestion": "Be more specific with solutions: 'Based on your income of ฿80,000 and family responsibilities, I recommend a protection plan covering at least 10x your annual income. This would ensure your family maintains their lifestyle if anything happens to you.'"
      }},
      {{
        "title": "Sales & Negotiation Skills",
        "score": 21,
        "maxScore": 25,
        "why": "You presented solutions convincingly and handled objections about affordability effectively by offering flexible payment options.",
        "suggestion": "Continue using benefit-focused language: 'This isn't just an expense—it's peace of mind for your family. And with monthly payments of just ฿2,500, it's less than what most people spend on dining out each month.'"
      }},
      {{
        "title": "Compliance & Regulations",
        "score": 18,
        "maxScore": 25,
        "why": "You mentioned key disclosures but could have been more thorough about policy terms, exclusions, and the cooling-off period.",
        "suggestion": "Always cover compliance points: 'Before we proceed, I want to make sure you understand that this policy has a 15-day free-look period. Also, there are certain exclusions for pre-existing conditions that we should review together.'"
      }}
    ]
  }}
}}`;

export function getKtAxaFnaKnowledgeSkillsPrompt(
  characterName: string,
  languageCode: string = 'en',
): ChatPromptTemplate {
  let basePrompt = ktAxaFnaKnowledgeSkillsPrompt.replaceAll(
    '{{characterName}}',
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
      `[FNA CONVERSATION CONTEXT]
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
