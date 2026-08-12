import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../../../utils/constants.js';
import type { EvaluationResult } from './index.js';

// Schema for mandatory aspects evaluation
export const mandatoryAspectsSchema = z.object({
  evaluations: z.array(
    z.object({
      criteria: z.string(),
      evaluation: z.string(),
      score: z.number().min(0).max(5),
      maxScore: z.number(),
      weight: z.number().min(1),
    }),
  ),
});

const mandatoryAspectsSystemPrompt = `You are an expert call quality assessor for MSIG Insurance. Your task is to evaluate the mandatory aspects of a sales/service call based on specific criteria and scoring rubrics.

[EVALUATION CONTEXT]
- Write the evaluation from a second-person perspective, addressing the sales representative directly as "you"
- Evaluate based on what was actually said in the transcript
- If a criterion is not applicable (e.g., no 3rd party involved), still provide a score based on the best possible interpretation
- Be objective and fair in your assessment

[SCORING GUIDELINES]
Each criterion has a specific scoring rubric. Follow the exact scoring guidelines provided for each criterion.
IMPORTANT: Higher scores are better (5 = best performance, 1 = worst performance)

[STRICT JSON OUTPUT FORMAT]
{{
  "evaluations": [
    {{
      "criteria": "string - exact criteria name",
      "evaluation": "string - detailed evaluation written in second person (e.g., 'You greeted the customer warmly...' instead of 'The agent greeted...')",
      "score": "number - evaluated score of the criterion",
      "maxScore": "number - max score of the criterion, provide exact one that is provided in the prompt",
      "weight": "number - weight of the criterion, provide exact one that is provided in the prompt"
    }}
  ]
}}`;

const mandatoryAspectsUserPrompt = `[TRANSCRIPT TO EVALUATE]
{transcript}

Evaluate the following mandatory aspects of this call:

1. **To greet using the complete opening script** (maxScore: 5, weight: 1)
   Scoring:
   - Score 5: Greeted with complete opening script naturally and warmly
   - Score 3: Greeted with complete opening script but lacked clarity and warmth
   - Score 2: Non-standard greeting with warmth/clarity
   - Score 1: Non-standard greeting with no warmth/clarity
   - Score 0: No greeting at all

   Expected script pattern:
   - Inbound: "Good Morning/Afternoon, MSIG insurance, This is [Name] speaking. How may I assist/help you?"
   - Outbound: "This is [Name] from MSIG Insurance. May I speak to [Customer]?" or "May I speak to [Customer]? This is [Name] from MSIG insurance."

   Criteria to check (the introduction must contain these parts):
   i. Salutation - Good Morning or Good Afternoon
   ii. MSIG Insurance
   iii. CSO's name
   iv. Equivalent of "How may I assist you?" / "How may I help you?"

   IMPORTANT:
   - When evaluating, accept variations of "How may I assist/help you?" as long as the meaning is the same (e.g., "How can I help you?", "What can I do for you?", "How may I help you today?").
   - If the introduction has ANY of the parts listed above (salutation, MSIG Insurance, CSO's name, How may I assist you?), then score the introduction based on how many parts are present.
   - If NO part of the introduction is recorded at all (e.g., the call recording starts mid-conversation), give a full score (5).

2. **Confirm customer's name & contact, address them consistently** (maxScore: 5, weight: 1)
   Scoring:
   - Score 5: Met all the areas
   - Score 4: Met most of the areas
   - Score 3: Met some of the areas
   - Score 2: Met at least one of the areas
   - Score 1: Does not meet any of the areas

   Areas to evaluate:
   - Asked for customer's contact number and name at start (before advise begins). As long as contact details and name are obtained before advise starts, this is considered as meeting the requirement.
   - Addressed customer appropriately and consistently based on the name given (examples: "Chan Lili" → "Ms Chan", "Ivy" → "Ivy", "Mdm Lee" → "Mdm Lee"). IMPORTANT: If name is already given, there is NO need to ask again or ask how to address customer - just address them appropriately.
   - Maintained consistent addressing throughout the call (should not toggle between different forms like 'Cindy', 'Ms Tan', 'Madam')

   IMPORTANT addressing rules:
   - If the agent refers to the client by name OR by sir/ma'am consistently throughout the call, score this area as fully met.
   - If the customer is not correctly addressed (e.g., no name or sir/ma'am used, or inconsistent addressing), penalise the score for this area accordingly.

3. **Verify at least 3 particulars before releasing any policy information** (maxScore: 5, weight: 3)
   CRITICAL: Only score if the caller is the Policy holder. If the caller is NOT the policy holder, set BOTH score AND maxScore to 0 (N/A).

   IMPORTANT: Call verification is ONLY required when the client needs any of the following:
   - Their own specific policy information like coverage amount, plan type, insured people
   - Request to change personal particulars or change instruction to policy
   If none of the above apply (i.e., no call verification is required), give a full score (5).

   Scoring (ONLY if caller is policy holder AND verification is required as described above):
   - Score 5: Full verification performed
   - Score 4: Over verification / Verify when not required
   - Score 3: Did not authenticate 1 extra particular after customer gave 3 upfront
   - Score 2: Authenticated 1 to 2 particulars
   - Score 1: No verification done

   Required particulars:
   - Full name as per NRIC/FIN/Passport
   - NRIC (Last 5 alphanumerical)/FIN/Passport number
   - One additional from:
      - Policy No.
      - Claim No.
      - Acknowledgment No.
      - Date or Mode of Last Purchase
      - Date or Amount of Last Premium Deduction
      - Name of other Insured Persons
      - Types of in-force policies with us
      - Insured Property (only if different from Mailing Address)
      - Plan Type or Sum Insured of any policy with MSIG (only for non-package policies)
      - Period of insurance
      - For Motor policies: Vehicle Number
      - For Travel policies: Region of Travel


4. **No revealing of information to 3rd party without valid justification** (maxScore: 5, weight: 3)
   CRITICAL: Only score if the caller is NOT the policy holder. If the caller IS the policy holder, set BOTH score AND maxScore to 0 (N/A).

   IMPORTANT: If the caller is an agent/broker calling on behalf of customer, proper verification must include:
   - Agent name or code
   - Customer's name
   - Policy number OR acknowledgement number

   Scoring (ONLY if caller is NOT the policy holder):
   - Score 5: No information revealed to 3rd party without proper justification/verification and excellent 3rd party management
   - Score 3: No information revealed but average/poor 3rd party management
   - Score 1: Revealed information to 3rd party without valid justification or proper verification
   - Score 0: Major breach of confidentiality

5. **Closing: Thank customer and close the call with a pleasantry** (maxScore: 5, weight: 1)
   Scoring:
   - Score 5: Met all areas (thanked customer AND used pleasantry)
   - Score 4: Met most of the areas
   - Score 3: Met some of the areas
   - Score 2: Met at least one area
   - Score 1: Does not meet any areas
   - Score 0: Abrupt or rude ending

   Areas:
   1. Thanked customer
   2. Closed with pleasantry (e.g. "It was a pleasure talking with you", "Have a nice day", "Have a pleasant trip", "Enjoy your holiday", "Have a nice weekend!", "It's been nice speaking with you", "Wishing you a pleasant day", "Take care", "Speedy recovery")


Evaluate each criterion carefully based on the transcript. Return ONLY valid JSON in the exact format specified.`;

export async function evaluateMandatoryAspects(
  transcript: string,
): Promise<EvaluationResult[]> {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', mandatoryAspectsSystemPrompt],
    ['user', mandatoryAspectsUserPrompt],
  ]);

  const formattedPrompt = await prompt.format({ transcript });

  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1_MINI,
    temperature: 0,
  });

  const response = await model
    .withStructuredOutput(mandatoryAspectsSchema)
    .invoke(formattedPrompt);

  if (!response || !response.evaluations) {
    throw new Error('Invalid response from mandatory aspects evaluation');
  }

  return response.evaluations;
}
