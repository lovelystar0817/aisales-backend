import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schema for structured output - AXA-PH Recruitment (4 sections)
export const axaPhRecruitmentSoftSkillsSchema = z.object({
  axaPhSoftSkills: z.object({
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
              'Section title (Communication Skills, Relationship Building, Adaptability, or Customer Orientation)',
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
      .describe('Array of the 4 soft skills sections'),
  }),
});

const axaPhSoftSkillsPrompt = `You are an expert coach specializing in unit manager recruitment for insurance companies. Your task is to evaluate **only the user's** soft skills performance during recruitment conversations.

IMPORTANT: In the transcript, the user (recruiter) is speaking with an AI character named {{characterName}} (the potential recruit). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "candidate," "AI," or any other term. Focus exclusively on the recruiter's soft skills.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the recruiter - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the potential recruit - IGNORE THESE COMPLETELY

[AXA-PH SOFT SKILLS EVALUATION]
Evaluate against these 4 soft skills components, each scored out of 25:

1. **Communication Skills** (0-25): Clear delivery and respectful communication to the new recruit
2. **Relationship Building** (0-25): Building and maintaining rapport with the candidate/new recruit
3. **Adaptability** (0-25): Flexibility in changing/understanding the concerns of the recruit
4. **Customer Orientation** (0-25): Able to provide a clear convincing presentation about the Company and the business

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
  "axaPhSoftSkills": {{
    "description": "string",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Communication Skills",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Relationship Building",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Adaptability",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Customer Orientation",
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
  "axaPhSoftSkills": {{
    "description": "Measures soft skills demonstrated during unit manager recruitment conversations.",
    "overallScore": 76,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Communication Skills",
        "score": 19,
        "maxScore": 25,
        "why": "You communicated clearly but occasionally used jargon that may confuse new recruits. Your tone was respectful throughout.",
        "suggestion": "Simplify language: Instead of 'leverage your existing skill set,' say 'use the skills you already have.' Example: 'You mentioned managing your household budget—that's exactly the kind of planning skill we use in financial advising.'"
      }},
      {{
        "title": "Relationship Building",
        "score": 20,
        "maxScore": 25,
        "why": "You built good rapport by acknowledging their concerns and showing genuine interest in their situation.",
        "suggestion": "Continue building rapport by asking about their goals: 'What would success look like for you in this role? What are you hoping to achieve?'"
      }},
      {{
        "title": "Adaptability",
        "score": 17,
        "maxScore": 25,
        "why": "You addressed some concerns but could have been more flexible in adjusting your approach when they raised time concerns.",
        "suggestion": "Be more adaptive: When they mention time constraints, immediately pivot to flexibility. Example: 'I hear that time is a concern. Let me show you how flexible this role can be—many unit managers work around their existing schedule.'"
      }},
      {{
        "title": "Customer Orientation",
        "score": 20,
        "maxScore": 25,
        "why": "You presented the company well but could have been more convincing about the business opportunity and benefits.",
        "suggestion": "Strengthen your presentation: Be specific about benefits. Example: 'AXA offers competitive commission structures, plus monthly contests and rewards. Many unit managers earn additional income while maintaining flexibility.'"
      }}
    ]
  }}
}}`;

export function getAxaPhRecruitmentSoftSkillsPrompt(
  characterName: string,
  languageCode: string = 'en',
): ChatPromptTemplate {
  let basePrompt = axaPhSoftSkillsPrompt.replaceAll(
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

Generate a soft skills assessment based strictly on the recruiter's performance. Focus only on Communication Skills, Relationship Building, Adaptability, and Customer Orientation. Output ONLY valid JSON using the exact format specified.`,
    ],
  ]);
}
