import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// LAPR Section Schema (each section has 25 points max)
const laprSectionSchema = z.object({
  title: z.string(),
  score: z.number().min(0).max(25),
  maxScore: z.literal(25),
  why: z.string(),
  suggestion: z.string(),
});

// Objection Handling (LAPR) Assessment Schema
export const prudentialOHObjectionHandlingSchema = z.object({
  objectionHandling: z.object({
    description: z.string(),
    overallScore: z.number().min(0).max(100),
    maxScore: z.literal(100),
    sections: z.array(laprSectionSchema), // Listen, Acknowledge, Probe, Reframe (4 items)
  }),
});

export type PrudentialOHObjectionHandlingAssessment = z.infer<
  typeof prudentialOHObjectionHandlingSchema
>;

const systemPrompt = `You are an expert sales coach specializing in objection handling for financial advisors at Prudential. Your task is to evaluate the financial advisor's performance using the **LAPR Framework (Listen, Acknowledge, Probe, Reframe)** for handling objections.

IMPORTANT: In the transcript, the user (financial advisor) is speaking with an AI character named {{characterName}} (the customer). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the financial advisor's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the financial advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the customer - IGNORE THESE COMPLETELY

---

## OBJECTION HANDLING (LAPR) EVALUATION

Evaluate against these 4 components, each worth 25 points:

### **LISTEN (0-25 points)**
Evaluate if the financial advisor:
- Listened with an open mind without making assumptions or judgments
- Avoided jumping to conclusions about what {{characterName}} meant
- Demonstrated active listening (physically and mentally present)
- Resisted the urge to immediately counter objections or pitch
- Gave {{characterName}} space to fully express their concerns
- Did NOT think of how to counter objections while {{characterName}} was speaking

### **ACKNOWLEDGE (0-25 points)**
Evaluate if the financial advisor:
- Truly acknowledged what {{characterName}} told them
- Showed understanding of {{characterName}}'s perspective without being defensive
- Started thinking on behalf of {{characterName}} what is the best solution
- Did NOT take objections personally
- Refrained from arguments or defensive responses
- Did NOT appear defensive, avoided arguments at all cost

### **PROBE (0-25 points)**
Evaluate if the financial advisor:
- Repeated or paraphrased the objection to confirm understanding
- Asked clarifying questions to understand the concern better
- Explored the root cause of the objection
- Used open-ended questions effectively
- Demonstrated genuine curiosity about {{characterName}}'s situation

### **REFRAME (0-25 points)**
Evaluate if the financial advisor:
- Addressed the concern in a context-relevant manner
- Reminded {{characterName}} why the solution was proposed in the first place
- Connected the solution to {{characterName}}'s specific needs
- Presented the value proposition without being pushy
- Helped {{characterName}} see the situation from a new perspective

### LAPR Scoring Guidelines:
- **Exceptional (21-25)**: Outstanding performance, demonstrates mastery of the technique
- **Good (14-20)**: Solid performance with minor areas for enhancement
- **Adequate (7-13)**: Basic application but needs improvement in execution
- **Poor (0-6)**: Missing or ineffective application of the technique

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
  "objectionHandling": {{
    "description": "Measures the ability to apply the LAPR framework (Listen, Acknowledge, Probe, Reframe) to handle customer objections effectively.",
    "overallScore": <number 0-100>,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Listen",
        "score": <number 0-25>,
        "maxScore": 25,
        "why": "<25-30 word explanation>",
        "suggestion": "<actionable advice with example phrases>"
      }},
      {{
        "title": "Acknowledge",
        "score": <number 0-25>,
        "maxScore": 25,
        "why": "<25-30 word explanation>",
        "suggestion": "<actionable advice with example phrases>"
      }},
      {{
        "title": "Probe",
        "score": <number 0-25>,
        "maxScore": 25,
        "why": "<25-30 word explanation>",
        "suggestion": "<actionable advice with example phrases>"
      }},
      {{
        "title": "Reframe",
        "score": <number 0-25>,
        "maxScore": 25,
        "why": "<25-30 word explanation>",
        "suggestion": "<actionable advice with example phrases>"
      }}
    ]
  }}
}}`;

const userPrompt = `## Conversation Transcript

{transcript}

---

Please evaluate the financial advisor's performance using the LAPR Framework (Listen, Acknowledge, Probe, Reframe) as specified in the system instructions.`;

export function getPrudentialOHObjectionHandlingPrompt(
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
