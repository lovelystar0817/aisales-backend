import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../../../utils/constants.js';
import type { EvaluationResult } from './index.js';

// Schema for soft skills evaluation
export const softSkillsSchema = z.object({
  evaluations: z.array(
    z.object({
      criteria: z.string(),
      evaluation: z.string(),
      score: z.number().min(0).max(5),
      maxScore: z.number().min(0), // Allow 0 for N/A cases
      weight: z.number().min(1), // Keep weight as 1
    }),
  ),
});

const softSkillsSystemPrompt = `You are an expert call quality assessor for MSIG Insurance. Your task is to evaluate the soft skills demonstrated in a sales/service call.

[EVALUATION CONTEXT]
- Write the evaluation from a second-person perspective, addressing the sales representative directly as "you"
- Consider tone, empathy, clarity, and professionalism
- Evaluate based on the overall interaction quality
- Be objective and fair in your assessment

[SCORING GUIDELINES]
Each criterion has a specific scoring rubric. Follow the exact scoring guidelines provided for each criterion.
IMPORTANT: Higher scores are better (5 = best performance, 1 = worst performance)
SPECIAL CASE: For N/A situations (e.g., no hold occurred for 3-step script), set BOTH score AND maxScore to 0

[STRICT JSON OUTPUT FORMAT]
{{
  "evaluations": [
    {{
      "criteria": "string - exact criteria name",
      "evaluation": "string - detailed evaluation written in second person (e.g., 'You demonstrated excellent...' instead of 'The agent demonstrated...')",
      "score": "number - evaluated score of the criterion",
      "maxScore": "number - max score of the criterion, provide exact one that is provided in the prompt",
      "weight": "number - weight of the criterion, provide exact one that is provided in the prompt"
    }}
  ]
}}`;

const softSkillsUserPrompt = `[TRANSCRIPT TO EVALUATE]
{transcript}

Evaluate the following soft skills in this call:

1. **Use polite language with the right tone, and avoid interrupting the customer** (maxScore: 5, weight: 2)
   Scoring:
   - Score 5: Met all the areas
   - Score 4: Met most of the areas
   - Score 3: Met some of the areas
   - Score 2: Met at least one of the areas
   - Score 1: Does not meet any of the areas
   
   Areas to evaluate:
   - Consistent usage of polite terms (e.g., "May I", "Could I", "Please" when requesting information)
   - Correct tone (no sniggering/mocking)
   - Do not interrupt customer

2. **Adherence to 3-step script** (maxScore: 5, weight: 1)
   IMPORTANT: First check if the customer was put on hold in the transcript:
   - If NO hold situation occurred → Mark as N/A (set both score and maxScore to 0)
   - If hold situation DID occur → Evaluate with maxScore: 5 using the scoring below

   CRITICAL: CSO should be penalized if they did NOT put the customer on hold when it took too long or was necessary (e.g., lengthy processing, checking information, consulting resources).

   Scoring (ONLY if customer was put on hold):
   - Score 5: Met all the areas
   - Score 4: Met most of the areas
   - Score 3: Met some of the areas
   - Score 2: Met at least one of the areas
   - Score 1: Does not meet any of the areas

   3-step script when putting customer on hold:
   - Step 1: "May I put you on hold, while I..." or "Please hold while I..."
   - Step 2: "Thank you" (after customer agrees to hold)
   - Step 3: "Thank you for holding, Mr/Ms..." (when returning)

   NOTE: Look for phrases like "hold", "wait", "put you on hold", "please wait", "let me check" to identify hold situations. Also penalize if CSO should have put customer on hold but didn't (e.g., long silence, extensive searching).

3. **Speak clearly at an appropriate pace with confidence and professionalism, while building rapport through empathy and appreciation** (maxScore: 5, weight: 2)
   Scoring:
   - Score 5: Met all the areas
   - Score 4: Met most of the areas
   - Score 3: Met some of the areas
   - Score 2: Met at least one of the areas
   - Score 1: Does not meet any of the areas

   Areas to evaluate:
   - Audible voice or words
   - Appropriate pace
   - Sound confident and sure of product
   - Professionalism (no Singlish or filler words like "hmm", "aheh", "huh", "hor", mumbling, cough/sniff/clear throat without muting/apology)
   - Rapport with customer through:
     * Empathy phrases: ONLY evaluate empathy for cases where there are incidents requiring empathy such as "I injured my leg", "My grandpa passed away", "I was robbed", "I had an accident", etc. In other cases, empathy can be skipped from consideration. Examples of empathy: "Sorry to hear about your experience", "Sorry to hear about your loss", "Hope that you are ok?"
     * Appreciation: "Thank you. That made my day!", "It's my pleasure"
     * Feedback acknowledgment: "Thank you for your feedback", "We appreciate your feedback", "Thank you for bringing this to our attention"

4. **Listen attentively, ask relevant questions, clarify and restate to ensure understanding, while keeping responses clear and simple** (maxScore: 5, weight: 3)
   Scoring:
   - Score 5: Met all the areas
   - Score 4: Met most of the areas
   - Score 3: Met some of the areas
   - Score 2: Met at least one of the areas
   - Score 1: Does not meet any of the areas
   
   Areas to evaluate:
   - Ask relevant questions / Probe if necessary
   - Listen attentively/Focus
   - Clarify understanding
   - Understand customer needs
   - Restate to confirm understanding
   - KISS (Keep It Short & Simple)

5. **Ensuring customers' understanding and engagement** (maxScore: 5, weight: 2)
   CRITICAL: Only score if there is evidence that the customer did not understand or has an objection. If there is NO such evidence, set BOTH score AND maxScore to 0 (N/A).

   Scoring (ONLY if customer showed confusion or raised objections):
   - Score 5: Clearly picked up cues that customer does not understand, elaborated further and ensured complete understanding; Acknowledged customer's concern/objection with empathy and addressed with convincing answers
   - Score 4: Good understanding and engagement (between 3 and 5)
   - Score 3: Partially picked up cues that customer does not understand and elaborated further; Used only standard objection handling approach
   - Score 2: Limited understanding and engagement
   - Score 1: Did not ensure customer understanding and/or engagement

   Areas to evaluate (ONLY if applicable):
   - Pick up cues that customer does not fully understand
   - Engaging customers through positive handling of objections and giving convincing answers

Score each criterion from 0-5 based on the agent's performance. Return ONLY valid JSON.`;

export async function evaluateSoftSkills(
  transcript: string,
): Promise<EvaluationResult[]> {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', softSkillsSystemPrompt],
    ['user', softSkillsUserPrompt],
  ]);

  const formattedPrompt = await prompt.format({ transcript });

  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1_MINI,
    temperature: 0.1,
  });

  const response = await model
    .withStructuredOutput(softSkillsSchema)
    .invoke(formattedPrompt);

  if (!response || !response.evaluations) {
    throw new Error('Invalid response from soft skills evaluation');
  }

  return response.evaluations;
}
