import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schema for structured output
export const ktAxaRecruitmentKnowledgeSkillsSchema = z.object({
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
              'Section title (Fact Finding, Business Knowledge, Problem-Solving, Sales & Negotiation Skills, or KT-AXA Company Knowledge)',
            ),
          score: z.number().describe('Score out of 20 for this section'),
          maxScore: z
            .number()
            .describe('Maximum possible score for this section (20)'),
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
      .describe('Array of the 5 knowledge skills sections'),
  }),
});

const ktAxaRecruitmentKnowledgeSkillsPrompt = `You are an expert coach specializing in agent recruitment for Krungthai-AXA Life Insurance (KT-AXA). Your task is to evaluate **only the user's** knowledge skills performance during recruitment conversations.

IMPORTANT: In the transcript, the user (recruiter) is speaking with an AI character named {{characterName}} (the potential recruit). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "candidate," "AI," or any other term. Focus exclusively on the recruiter's knowledge skills.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the recruiter - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the potential recruit - IGNORE THESE COMPLETELY

[KT AXA KNOWLEDGE SKILLS EVALUATION]
Evaluate against these 5 knowledge skills components, each scored out of 20:

1. **Fact Finding** (0-20): Knows all the basic requirements in becoming part of the business such as Legal and Compliance. **CRITICAL: The recruiter MUST introduce themselves with their name and agent ID at the start of the conversation - if they fail to do so, deduct 5-10 points from this section.**
2. **Business Knowledge** (0-20): Provided a deep understanding of the remuneration available for distributors e.g. Commission/Salary, contest, rewards and benefits
3. **Problem-Solving** (0-20): Ability to identify issues and provide solutions
4. **Sales & Negotiation Skills** (0-20): Ability to convince and negotiate effectively with the new recruit
5. **KT-AXA Company Knowledge** (0-20): Knowledge of KT-AXA products, services, training programs, and career opportunities

[EVALUATION CRITERIA]
For each component:
- **Score**: Number out of 20 based on effectiveness
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. It should not just point out how the user could improve. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
- **16-20 (80-100%)**: Exceptional performance, minimal room for improvement
- **12-15 (60-79%)**: Good performance with minor gaps to address
- **8-11 (40-59%)**: Adequate but needs significant improvement
- **4-7 (20-39%)**: Poor performance with major gaps identified
- **0-3 (0-19%)**: Very poor or missing entirely

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on recruitment impact and candidate engagement
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
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Business Knowledge",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Problem-Solving",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Sales & Negotiation Skills",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "KT-AXA Company Knowledge",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "ktAxaKnowledgeSkills": {{
    "description": "Measures knowledge skills demonstrated during KT-AXA agent recruitment conversations.",
    "overallScore": 72,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Fact Finding",
        "score": 14,
        "maxScore": 20,
        "why": "You mentioned some requirements but didn't cover all basic legal and compliance requirements for becoming a KT-AXA agent.",
        "suggestion": "Be comprehensive: 'To become a KT-AXA agent, you'll need to complete the AXA Prime Blue training, pass the OIC licensing exam, and meet compliance requirements. We'll guide you through each step.'"
      }},
      {{
        "title": "Business Knowledge",
        "score": 15,
        "maxScore": 20,
        "why": "You explained commission structure well but could have provided more detail about QVB bonuses and additional benefits.",
        "suggestion": "Expand on benefits: 'Beyond the 30%% FYC commission, KT-AXA offers QVB bonuses of 45-55%%, monthly contests, and recognition programs. Many agents earn ฿50,000-฿100,000 monthly after their first year.'"
      }},
      {{
        "title": "Problem-Solving",
        "score": 14,
        "maxScore": 20,
        "why": "You identified some concerns but could have been more proactive in offering specific solutions to their challenges.",
        "suggestion": "Offer solutions proactively: When they mention time concerns, immediately provide solutions: 'Many KT-AXA agents start part-time, working 10-15 hours weekly. You can schedule client meetings around your existing commitments.'"
      }},
      {{
        "title": "Sales & Negotiation Skills",
        "score": 16,
        "maxScore": 20,
        "why": "You were convincing and used good negotiation techniques, addressing their concerns effectively.",
        "suggestion": "Continue using negotiation techniques: 'I understand your concerns about stability. What if we could show you how flexible this role can be? Many successful KT-AXA agents started exactly where you are now.'"
      }},
      {{
        "title": "KT-AXA Company Knowledge",
        "score": 13,
        "maxScore": 20,
        "why": "You mentioned KT-AXA but could have provided more details about training programs and career progression.",
        "suggestion": "Highlight KT-AXA specifics: 'KT-AXA is part of the global AXA Group. Our AXA Prime Blue training program includes comprehensive modules on products, sales techniques, and compliance. Career paths include Senior Agent, Unit Manager, and beyond.'"
      }}
    ]
  }}
}}`;

export function getKtAxaRecruitmentKnowledgeSkillsPrompt(
  characterName: string,
  languageCode: string = 'en',
): ChatPromptTemplate {
  let basePrompt = ktAxaRecruitmentKnowledgeSkillsPrompt.replaceAll(
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
      `[RECRUITMENT CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

Generate a knowledge skills assessment based strictly on the recruiter's performance. Focus only on Fact Finding, Business Knowledge, Problem-Solving, Sales & Negotiation Skills, and KT-AXA Company Knowledge. Output ONLY valid JSON using the exact format specified.`,
    ],
  ]);
}
