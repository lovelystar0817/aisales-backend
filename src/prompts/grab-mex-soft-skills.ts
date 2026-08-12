import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schema for structured output
export const grabMexSoftSkillsSchema = z.object({
  grabMexSoftSkills: z.object({
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
              'Section title (Listen, Acknowledge, Explore, or Respond)',
            ),
          score: z.number().describe('Score out of 25 for this section'),
          maxScore: z
            .number()
            .describe('Maximum possible score for this section (25)'),
          strengths: z
            .array(z.string())
            .describe('Array of specific strengths demonstrated'),
          toImprove: z
            .array(
              z.object({
                text: z.string().describe('Area that needs improvement'),
                example: z
                  .string()
                  .describe('Example of how to improve this area'),
              }),
            )
            .describe('Array of areas to improve with examples'),
        }),
      )
      .describe('Array of the 4 LAER framework sections'),
  }),
});

export const laerSoftSkillsPrompt = `You are an expert sales coach specializing in soft skills assessment, specifically the LAER framework for objection handling. Your task is to evaluate **only the user's** ability to handle objections using Listen, Acknowledge, Explore, and Respond techniques.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's technique.

[CRITICAL RESTRICTION]
**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

**Do NOT evaluate or reference the prospect's responses.** Focus exclusively on analyzing how well the salesperson applied the LAER framework when faced with objections or concerns.

[LAER FRAMEWORK EVALUATION]
Evaluate across four key areas of objection handling:

1. **Listen** (0-25 points):
   - Did they let {{characterName}} finish speaking without interrupting?
   - Did they demonstrate active listening by acknowledging what was said?
   - Did they resist the urge to immediately respond with a pitch?
   - Did they show patience when {{characterName}} expressed concerns?

2. **Acknowledge** (0-25 points):
   - Did they validate {{characterName}}'s concerns and show understanding?
   - Did they use empathetic language to demonstrate they heard the objection?
   - Did they relate to {{characterName}}'s situation ("I understand," "That makes sense")?
   - Did they avoid dismissing or minimizing the concern?

3. **Explore** (0-25 points):
   - Did they ask follow-up questions to uncover the root cause of the objection?
   - Did they probe deeper to understand if the concern was about budget, value, timing, or authority?
   - Did they use open-ended questions to gather more information?
   - Did they seek to understand the specific nature of the concern?

4. **Respond** (0-25 points):
   - Did they address the specific concern with tailored value proposition?
   - Did they provide relevant examples, case studies, or social proof?
   - Did they offer solutions or alternatives to overcome the objection?
   - Did they work collaboratively with {{characterName}} to find solutions?

[ASSESSMENT STRUCTURE]
For each area provide:
- **Score**: Number out of 25 based on demonstration of LAER technique
- **Strengths**: Array of 1-2 specific strengths demonstrated (if any exist)
- **To improve**: Array of 2-3 improvement areas with actionable suggestions and examples

[SCORING GUIDELINES]
- **20-25 (80-100%)**: Excellent LAER execution with natural objection handling
- **15-19 (60-79%)**: Good LAER application with minor technique gaps
- **10-14 (40-59%)**: Adequate but needs significant improvement in objection handling
- **5-9 (20-39%)**: Poor LAER execution with major gaps in technique
- **0-4 (0-19%)**: Very poor or missing objection handling skills

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript
- Focus on how LAER techniques impacted {{characterName}}'s engagement
- Provide concrete examples of better responses when suggesting improvements
- Calculate overall score as sum of all four component scores

[EXAMPLES OF GOOD LAER EXECUTION]

**Listen Example:**
"I hear you — budget is always a big consideration, especially in F&B where margins are tight."

**Acknowledge Example:**
"If I were you, I'd also want to be cautious about where every dollar goes. A lot of our partners felt the same at first."

**Explore Example:**
"When you say the budget feels high, is it more about cash flow this quarter, or do you feel that the value doesn't match the price?"

**Respond Example:**
"We've seen 30% increase in-app visibility in participating merchants compared to their competitors, and boost in sales post-campaign, even without discounts. I have many merchants that joined, managed to cover their costs and continued growing organically afterward. With the quality of your food, I believe you can achieve similar results. How about we explore ways to lower your upfront costs through bundling?"

[ASSESSMENT STRUCTURE]
Provide a comprehensive LAER soft skills assessment with:
- Overall description and score (0-100)
- Four sections: Listen, Acknowledge, Explore, Respond (each 0-25 points)
- For each section: score, strengths demonstrated, areas to improve with specific examples

Focus on concrete, actionable feedback that helps improve objection handling skills.

[EXAMPLE ASSESSMENT]
{{
  "grabMexSoftSkills": {{
    "description": "Measures the ability to handle objections using the LAER framework: Listen, Acknowledge, Explore, and Respond.",
    "overallScore": 68,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Listen",
        "score": 20,
        "maxScore": 25,
        "strengths": [
          "You allowed {{characterName}} to fully express their budget concerns without interrupting",
          "You demonstrated patience when they explained their financial constraints"
        ],
        "toImprove": [
          {{
            "text": "You could have shown more active listening by summarizing what {{characterName}} said",
            "example": "So if I understand correctly, you're saying the budget feels stretched because of recent equipment purchases, is that right?"
          }}
        ]
      }},
      {{
        "title": "Acknowledge",
        "score": 18,
        "maxScore": 25,
        "strengths": [
          "You validated their concern with empathetic language"
        ],
        "toImprove": [
          {{
            "text": "You could have related more personally to their situation",
            "example": "I completely understand - many restaurant owners in your position have told me the exact same thing about being cautious with marketing spend"
          }},
          {{
            "text": "You missed an opportunity to normalize their concern",
            "example": "That makes perfect sense. A lot of our F&B partners felt the same way when they first looked at our campaigns"
          }}
        ]
      }},
      {{
        "title": "Explore",
        "score": 15,
        "maxScore": 25,
        "strengths": [
          "You asked some follow-up questions about their budget"
        ],
        "toImprove": [
          {{
            "text": "You didn't probe deep enough to understand the root cause of their budget concern",
            "example": "When you say the budget feels high, is it more about cash flow this quarter, or do you feel that the value doesn't match the price?"
          }},
          {{
            "text": "You could have explored their decision-making process more",
            "example": "Help me understand - what would need to happen for you to feel comfortable moving forward with this investment?"
          }}
        ]
      }},
      {{
        "title": "Respond",
        "score": 15,
        "maxScore": 25,
        "strengths": [
          "You provided some data about campaign performance"
        ],
        "toImprove": [
          {{
            "text": "Your response wasn't tailored specifically to their budget objection",
            "example": "Given your concern about budget, let me share how merchants like you have actually seen ROI within the first month. We've had restaurants recover their campaign investment in just 3-4 weeks through increased orders"
          }},
          {{
            "text": "You didn't offer alternative solutions to address their budget constraint",
            "example": "How about we explore ways to lower your upfront costs through bundling, or we could start with a smaller pilot campaign to prove results first?"
          }}
        ]
      }}
    ]
  }}
}}`;

const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Generate a LAER soft skills assessment based strictly on the salesperson's objection handling performance. Focus only on how they applied Listen, Acknowledge, Explore, and Respond techniques when faced with objections or concerns. Output ONLY valid JSON using the exact format specified.`;

export function getGrabMexSoftSkillsPrompt(
  characterName: string,
  language?: string,
) {
  let basePrompt = laerSoftSkillsPrompt.replaceAll(
    '{{characterName}}',
    characterName,
  );

  let userPrompt = userTemplate;

  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE]
IMPORTANT: The output must be in ${language} language.
- All text, including section titles, descriptions, and guidelines must be in ${language}
- Use ${language} equivalents for all technical terms and objection handling phrases
- Format all numbers and measurements according to ${language} conventions

[IMPORTANT] The assessment should be fully localized in ${language}, including:
- All section titles and descriptions
- All scoring guidelines and descriptions
- All strengths and improvement areas
- All example responses and corrections
- All numerical values and scores`;
  }

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userPrompt],
  ]);
}
