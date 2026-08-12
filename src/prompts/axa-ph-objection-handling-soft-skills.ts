import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schema for structured output - 3 sections for objection handling
export const axaPhObjectionHandlingSoftSkillsSchema = z.object({
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
              'Section title (Relationship Building, Adaptability, or Customer Orientation)',
            ),
          score: z.number().describe('Score out of 33 or 34 for this section'),
          maxScore: z
            .number()
            .describe('Maximum possible score for this section (33 or 34)'),
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
      .describe('Array of the 3 soft skills sections'),
  }),
});

const axaPhObjectionHandlingSoftSkillsPrompt = `You are an expert sales coach specializing in objection handling and fact-finding conversations for education funding and protection products. Your task is to evaluate **only the user's** soft skills performance.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's soft skills.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[AXA-PH OBJECTION HANDLING SOFT SKILLS EVALUATION]
Evaluate against these 3 soft skills components:

1. **Relationship Building** (0-33): Building and maintaining respectful, trust-based communication throughout the conversation
2. **Adaptability** (0-33): Flexibility in changing and understanding the concerns of the customer, especially around education funding objections
3. **Customer Orientation** (0-34): Focus on customer satisfaction and service rather than just selling

[EVALUATION CRITERIA]
For each component:
- **Score**: Number based on effectiveness (first two sections out of 33, last section out of 34)
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
For 33-point sections:
- **27-33 (80-100%)**: Exceptional performance, minimal room for improvement
- **20-26 (60-79%)**: Good performance with minor gaps to address
- **13-19 (40-59%)**: Adequate but needs significant improvement
- **7-12 (20-39%)**: Poor performance with major gaps identified
- **0-6 (0-19%)**: Very poor or missing entirely

For 34-point section:
- **27-34 (80-100%)**: Exceptional performance, minimal room for improvement
- **20-26 (60-79%)**: Good performance with minor gaps to address
- **14-19 (40-59%)**: Adequate but needs significant improvement
- **7-13 (20-39%)**: Poor performance with major gaps identified
- **0-6 (0-19%)**: Very poor or missing entirely

[OBJECTION HANDLING CONTEXT]
The scenario focuses on education funding and protection. Key objections the customer may raise:
- "I want something small - what if I can't keep up with payments?" (Affordability)
- "Is this better than a normal bank savings account?" (Comparing options)
- "What if I need the money earlier?" (Early withdrawal/flexibility)
- "What if something happens before the plan matures?" (Protection)
- "Is this really guaranteed?" (Trust/guarantees)

[SOFT SKILLS DETAILED]

**RELATIONSHIP BUILDING (33 points)**
- Did they establish rapport and trust early in the conversation?
- Did they maintain a warm, respectful tone throughout?
- Did they show genuine interest in {{characterName}}'s situation and family?
- Did they create a comfortable environment for open discussion?

**ADAPTABILITY (33 points)**
- Did they adjust their approach based on {{characterName}}'s reactions?
- Did they handle objections with flexibility and understanding?
- Did they modify their pace or style to match {{characterName}}'s needs?
- Did they recover well from any misunderstandings or challenges?

**CUSTOMER ORIENTATION (34 points)**
- Did they prioritize {{characterName}}'s needs over making a sale?
- Did they show genuine interest in {{characterName}}'s education funding goals?
- Did they focus on providing value and solutions?
- Did they build trust throughout the conversation?

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on objection handling impact and customer engagement
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "axaPhSoftSkills": {{
    "description": "string",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Relationship Building",
        "score": "number",  //out of 33
        "maxScore": 33,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Adaptability",
        "score": "number",  //out of 33
        "maxScore": 33,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Customer Orientation",
        "score": "number",  //out of 34
        "maxScore": 34,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "axaPhSoftSkills": {{
    "description": "Measures soft skills demonstrated during objection handling conversations focused on education funding and protection.",
    "overallScore": 76,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Relationship Building",
        "score": 26,
        "maxScore": 33,
        "why": "You built good rapport by acknowledging their concerns about their child's education and showing genuine interest in their family situation.",
        "suggestion": "Continue building rapport by asking about their goals: 'What does success look like for your child's education? What timeline are you considering for their college fund?'"
      }},
      {{
        "title": "Adaptability",
        "score": 24,
        "maxScore": 33,
        "why": "You addressed some concerns but could have been more flexible when they raised affordability concerns about keeping up with payments.",
        "suggestion": "Be more adaptive: When they mention payment concerns, immediately pivot to flexibility. Example: 'I hear that affordability is important. Let me show you options that fit your budget - we have plans starting as low as you're comfortable with.'"
      }},
      {{
        "title": "Customer Orientation",
        "score": 26,
        "maxScore": 34,
        "why": "You focused well on their education funding needs but could have been more attentive to their protection concerns.",
        "suggestion": "Strengthen customer focus: Be specific about how the plan addresses their needs. Example: 'Based on what you've shared about securing your child's future, this plan offers both the education fund you need and protection in case anything unexpected happens.'"
      }}
    ]
  }}
}}`;

export function getAxaPhObjectionHandlingSoftSkillsPrompt(
  characterName: string,
  languageCode: string = 'en',
): ChatPromptTemplate {
  let basePrompt = axaPhObjectionHandlingSoftSkillsPrompt.replaceAll(
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
      `[OBJECTION HANDLING CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

Generate a soft skills assessment based strictly on the salesperson's performance. Focus only on Relationship Building, Adaptability, and Customer Orientation. Output ONLY valid JSON using the exact format specified.`,
    ],
  ]);
}
