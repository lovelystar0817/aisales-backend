import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schema for structured output - AXA-PH Recruitment (4 sections)
export const axaPhRecruitmentKnowledgeSkillsSchema = z.object({
  axaPhKnowledgeSkills: z.object({
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
              'Section title (Fact Finding, Business Knowledge, Problem-Solving, or Sales & Negotiation Skills)',
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

const axaPhKnowledgeSkillsPrompt = `You are an expert coach specializing in unit manager recruitment for insurance companies. Your task is to evaluate **only the user's** knowledge skills performance during recruitment conversations.

IMPORTANT: In the transcript, the user (recruiter) is speaking with an AI character named {{characterName}} (the potential recruit). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "candidate," "AI," or any other term. Focus exclusively on the recruiter's knowledge skills.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the recruiter - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the potential recruit - IGNORE THESE COMPLETELY

[AXA-PH KNOWLEDGE SKILLS EVALUATION]
Evaluate against these 4 knowledge skills components, each scored out of 25:

1. **Fact Finding** (0-25): Knows all the basic requirements in becoming part of the business such as Legal and Compliance
2. **Business Knowledge** (0-25): Provided a deep understanding of the remuneration available for distributors e.g. Commission/Salary, contest, rewards and benefits
3. **Problem-Solving** (0-25): Ability to identify issues and provide solutions
4. **Sales & Negotiation Skills** (0-25): Ability to convince and negotiate effectively to the new recruit

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
- Focus on recruitment impact and candidate engagement
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "axaPhKnowledgeSkills": {{
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
        "title": "Business Knowledge",
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
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "axaPhKnowledgeSkills": {{
    "description": "Measures knowledge skills demonstrated during unit manager recruitment conversations.",
    "overallScore": 70,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Fact Finding",
        "score": 14,
        "maxScore": 25,
        "why": "You mentioned some requirements but didn't cover all basic legal and compliance requirements for becoming a distributor.",
        "suggestion": "Be comprehensive: 'To become part of AXA, you'll need to complete the required training, pass the licensing exam, and meet compliance requirements. We'll guide you through each step.'"
      }},
      {{
        "title": "Business Knowledge",
        "score": 18,
        "maxScore": 25,
        "why": "You explained commission structure well but could have provided more detail about contests, rewards, and additional benefits.",
        "suggestion": "Expand on benefits: 'Beyond commission, we have monthly contests with cash prizes, recognition programs, and additional benefits like health insurance. Many unit managers earn ₱50,000-₱100,000 monthly after their first year.'"
      }},
      {{
        "title": "Problem-Solving",
        "score": 17,
        "maxScore": 25,
        "why": "You identified some concerns but could have been more proactive in offering specific solutions to their challenges.",
        "suggestion": "Offer solutions proactively: When they mention time concerns, immediately provide solutions: 'Many unit managers start part-time, working 10-15 hours weekly. You can schedule client meetings around your existing commitments.'"
      }},
      {{
        "title": "Sales & Negotiation Skills",
        "score": 21,
        "maxScore": 25,
        "why": "You were convincing and used good negotiation techniques, addressing their concerns effectively.",
        "suggestion": "Continue using negotiation techniques: 'I understand your concerns about time. What if we could show you how flexible this role can be? Many successful unit managers started exactly where you are now.'"
      }}
    ]
  }}
}}`;

export function getAxaPhRecruitmentKnowledgeSkillsPrompt(
  characterName: string,
  languageCode: string = 'en',
): ChatPromptTemplate {
  let basePrompt = axaPhKnowledgeSkillsPrompt.replaceAll(
    '{{characterName}}',
    characterName,
  );

  // Add language-specific instructions if needed
  if (languageCode === 'tl') {
    basePrompt +=
      '\n\n[LANGUAGE INSTRUCTION]\nProvide feedback in Tagalog (Filipino) language.';
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

Generate a knowledge skills assessment based strictly on the recruiter's performance. Focus only on Fact Finding, Business Knowledge, Problem-Solving, and Sales & Negotiation Skills. Output ONLY valid JSON using the exact format specified.`,
    ],
  ]);
}
