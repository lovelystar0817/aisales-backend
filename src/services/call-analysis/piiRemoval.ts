import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import type {
  IAssessment,
  ICallOverview,
  ITranscriptSegment,
  IMSIGCallAssessment,
} from '../../models/CallAnalysis.js';
import { OPENAI_MODEL_GPT_4_1_MINI } from '../../utils/constants.js';
import { parseJsonSafely } from '../../utils/json.js';

const transcriptSchema = z.object({
  segments: z.array(
    z.object({
      speaker: z.number().describe('The speaker ID'),
      role: z.enum(['agent', 'customer']).describe('The speaker role'),
      timestamp: z.number().describe('The timestamp of the message'),
      content: z
        .string()
        .describe('The content of the message with PII replaced'),
    }),
  ),
});

const assessmentSchema = z.object({
  summary: z.string().describe('Summary with PII replaced'),
  suggestedNextSteps: z
    .array(z.string())
    .describe('Next steps with PII replaced'),
  mandatory: z.array(
    z.object({
      criteria: z.string(),
      evaluation: z.string().describe('Description with PII replaced'),
      score: z.number(),
      maxScore: z.number(),
      weight: z.number(),
    }),
  ),
  softSkills: z.array(
    z.object({
      criteria: z.string(),
      evaluation: z.string().describe('Description with PII replaced'),
      score: z.number(),
      maxScore: z.number(),
      weight: z.number(),
    }),
  ),
  knowledgeApplication: z.array(
    z.object({
      criteria: z.string(),
      evaluation: z.string().describe('Description with PII replaced'),
      score: z.number(),
      maxScore: z.number(),
      weight: z.number(),
    }),
  ),
});

const overviewSchema = z.object({
  keyTakeaways: z.array(z.string()).describe('Key takeaways with PII replaced'),
  callHealth: z.object({
    positiveSignals: z
      .array(z.string())
      .describe('Positive signals with PII replaced'),
    risksObserved: z
      .array(z.string())
      .describe('Risks observed with PII replaced'),
    recommendations: z
      .array(z.string())
      .describe('Recommendations with PII replaced'),
  }),
  actionableNextSteps: z.object({
    keyActions: z.array(z.string()).describe('Key actions with PII replaced'),
    nextCall: z.string().describe('Next call description with PII replaced'),
  }),
});

const transcriptSystemPrompt = `You are a PII removal specialist. Your task is to selectively remove ONLY specific types of personal identifiable information from sales call transcripts.

[CRITICAL - DO NOT REDACT]
You MUST keep the following unchanged - DO NOT replace these:
- Names (full names, first names, last names, nicknames, titles like Mr/Ms/Mdm) - KEEP AS-IS
- Dates (appointments, deadlines, specific dates, travel dates, policy dates) - KEEP AS-IS (EXCEPT date of birth)
- Company names (MSIG, insurance companies, organizations) - KEEP AS-IS

[PII TO REDACT - Replace ONLY these]
Replace ONLY the following with placeholders:
- ID numbers (SSN, passport, driver's license, employee ID, NRIC, FIN) → [ID]
- Dates of birth ONLY (e.g., "born on 15 Jan 1980") → [DOB]
- Phone numbers → [PHONE]
- Email addresses → [EMAIL]
- Physical addresses (street addresses, home addresses) → [ADDRESS]
- Account numbers → [ACCOUNT]
- Credit card numbers → [CARD]
- Medical information → [MEDICAL]
- Financial amounts (when personally identifiable) → [AMOUNT]
- Policy numbers → [POLICY]
- Vehicle numbers → [VEHICLE]

[PRESERVATION RULES]
- Keep pronouns (he, she, they) unchanged
- Keep role references (agent, customer, manager) unchanged
- Preserve the exact JSON structure
- Maintain speaker IDs and timestamps exactly as provided

IMPORTANT: When in doubt whether to redact something, refer to the DO NOT REDACT list first.

[STRICT JSON OUTPUT FORMAT]
{{
  "segments": [
    {{
      "speaker": number,
      "role": "agent" | "customer",
      "timestamp": number,
      "content": "string with PII replaced"
    }}
  ]
}}`;

const transcriptUserPrompt = `[TRANSCRIPT TO PROCESS]
{transcript}

Process the transcript following the rules above:
1. Keep all names, dates (except DOB), and company names unchanged
2. Replace ONLY the specific PII types listed in [PII TO REDACT]
3. Return modified segments with appropriate placeholders

Output ONLY valid JSON in the exact format specified.

[REMINDER]
- DO NOT redact names, dates (except DOB), or company names
- ONLY redact the specific PII types in the redaction list
`;

const assessmentSystemPrompt = `You are a PII removal specialist. Your task is to selectively remove ONLY specific types of personal identifiable information from sales call assessments.

[CRITICAL - DO NOT REDACT]
You MUST keep the following unchanged - DO NOT replace these:
- Names (full names, first names, last names, nicknames, titles like Mr/Ms/Mdm) - KEEP AS-IS
- Dates (appointments, deadlines, specific dates, travel dates, policy dates) - KEEP AS-IS (EXCEPT date of birth)
- Company names (MSIG, insurance companies, organizations) - KEEP AS-IS

[PII TO REDACT - Replace ONLY these]
Replace ONLY the following with placeholders:
- ID numbers (NRIC, FIN, passport, etc.) → [ID]
- Dates of birth ONLY (e.g., "born on 15 Jan 1980") → [DOB]
- Phone numbers → [PHONE]
- Email addresses → [EMAIL]
- Physical addresses (street addresses, home addresses) → [ADDRESS]
- Account/Policy numbers → [ACCOUNT]/[POLICY]
- Vehicle numbers → [VEHICLE]

[PRESERVATION RULES]
- Maintain 'criteria', 'score', 'maxScore', and 'weight' exactly as provided, only update 'evaluation'
- Keep the exact JSON structure
- Maintain professional assessment language
- Keep generic references (e.g., "the customer", "the product") unchanged
- Keep names, dates (except DOB), and company names unchanged

IMPORTANT: When in doubt whether to redact something, refer to the DO NOT REDACT list first.

[STRICT JSON OUTPUT FORMAT]
{{
  "summary": "string with PII replaced",
  "suggestedNextSteps": ["string with PII replaced"],
  "mandatory": [
    {{
      "criteria": "string",
      "evaluation": "string with PII replaced",
      "score": number,
      "maxScore": number,
      "weight": number
    }}
  ],
  "softSkills": [
    {{
      "criteria": "string",
      "evaluation": "string with PII replaced",
      "score": number,
      "maxScore": number,
      "weight": number
    }}
  ],
  "knowledgeApplication": [
    {{
      "criteria": "string",
      "evaluation": "string with PII replaced",
      "score": number,
      "maxScore": number,
      "weight": number
    }}
  ]
}}`;

const assessmentUserPrompt = `[ASSESSMENT TO PROCESS]
{assessment}

Process the assessment following the rules above:
1. Keep all names, dates (except DOB), and company names unchanged
2. Replace ONLY the specific PII types listed in [PII TO REDACT]
3. Return modified assessment with appropriate placeholders

Output ONLY valid JSON in the exact format specified.

[REMINDER]
- DO NOT redact names, dates (except DOB), or company names
- ONLY redact the specific PII types in the redaction list`;

const overviewSystemPrompt = `You are a PII removal specialist. Your task is to selectively remove ONLY specific types of personal identifiable information from call overview.

[CRITICAL - DO NOT REDACT]
You MUST keep the following unchanged - DO NOT replace these:
- Names (full names, first names, last names, nicknames, titles like Mr/Ms/Mdm) - KEEP AS-IS
- Dates (appointments, deadlines, specific dates, travel dates, policy dates) - KEEP AS-IS (EXCEPT date of birth)
- Company names (MSIG, insurance companies, organizations) - KEEP AS-IS

[PII TO REDACT - Replace ONLY these]
Replace ONLY the following with placeholders:
- ID numbers (NRIC, FIN, passport, etc.) → [ID]
- Dates of birth ONLY (e.g., "born on 15 Jan 1980") → [DOB]
- Phone numbers → [PHONE]
- Email addresses → [EMAIL]
- Physical addresses (street addresses, home addresses) → [ADDRESS]
- Account/Policy numbers → [ACCOUNT]/[POLICY]
- Vehicle numbers → [VEHICLE]

[PRESERVATION RULES]
- Keep the exact JSON structure
- Maintain content meaning and recommendations
- Keep generic references (e.g., "the customer", "the product") unchanged
- Keep names, dates (except DOB), and company names unchanged

IMPORTANT: When in doubt whether to redact something, refer to the DO NOT REDACT list first.

[STRICT JSON OUTPUT FORMAT]
{{
  "keyTakeaways": ["string with PII replaced"],
  "callHealth": 
  {{
    "positiveSignals": ["string with PII replaced"],
    "risksObserved": ["string with PII replaced"],
    "recommendations": ["string with PII replaced"]
  }},
  "actionableNextSteps": 
  {{
    "keyActions": ["string with PII replaced"],
    "nextCall": "string with PII replaced"
  }}
}}`;

const overviewUserPrompt = `[OVERVIEW TO PROCESS]
{overview}

Process the overview following the rules above:
1. Keep all names, dates (except DOB), and company names unchanged
2. Replace ONLY the specific PII types listed in [PII TO REDACT]
3. Return modified overview with appropriate placeholders

Output ONLY valid JSON in the exact format specified.

[REMINDER]
- DO NOT redact names, dates (except DOB), or company names
- ONLY redact the specific PII types in the redaction list`;

export async function removePIIFromTranscript(
  transcript: ITranscriptSegment[],
): Promise<ITranscriptSegment[]> {
  try {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', transcriptSystemPrompt],
      ['user', transcriptUserPrompt],
    ]);

    const formattedPrompt = await prompt.format({
      transcript: JSON.stringify(transcript),
    });

    console.log(
      'Call Analysis ::: removePIIFromTranscript::: prompt',
      formattedPrompt,
    );

    const model = new ChatOpenAI({
      modelName: OPENAI_MODEL_GPT_4_1_MINI,
      temperature: 0,
    });

    const response = await model
      .withStructuredOutput(transcriptSchema)
      .invoke(formattedPrompt);

    console.log(
      'Call Analysis ::: removePIIFromTranscript::: result:',
      response,
    );

    // The response should already be structured according to the schema
    if (response && 'segments' in response) {
      return response.segments as ITranscriptSegment[];
    }

    throw new Error('Invalid response structure from PII removal');
  } catch (error) {
    console.error('Error removing PII from transcript:', error);
    throw new Error('Failed to remove PII from transcript');
  }
}

export async function removePIIFromAssessment(
  assessment: IAssessment,
): Promise<IAssessment> {
  try {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', assessmentSystemPrompt],
      ['user', assessmentUserPrompt],
    ]);

    const formattedPrompt = await prompt.format({
      assessment: JSON.stringify(assessment),
    });

    console.log(
      'Call Analysis ::: removePIIFromAssessment::: prompt',
      formattedPrompt,
    );

    const model = new ChatOpenAI({
      modelName: OPENAI_MODEL_GPT_4_1_MINI,
      temperature: 0,
    });

    const response = await model
      .withStructuredOutput(assessmentSchema)
      .invoke(formattedPrompt);

    console.log(
      'Call Analysis ::: removePIIFromAssessment::: result:',
      response,
    );

    // The response should already be structured according to the schema
    if (response) {
      return response as IAssessment;
    }

    throw new Error('Invalid response structure from PII removal');
  } catch (error) {
    console.error('Error removing PII from assessment:', error);
    throw new Error('Failed to remove PII from assessment');
  }
}

export async function removePIIFromOverview(
  overview: ICallOverview,
): Promise<ICallOverview> {
  try {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', overviewSystemPrompt],
      ['user', overviewUserPrompt],
    ]);

    const formattedPrompt = await prompt.format({
      overview: JSON.stringify(overview),
    });

    console.log(
      'Call Analysis ::: removePIIFromOverview::: prompt',
      formattedPrompt,
    );

    const model = new ChatOpenAI({
      modelName: OPENAI_MODEL_GPT_4_1_MINI,
      temperature: 0,
    });

    const response = await model
      .withStructuredOutput(overviewSchema)
      .invoke(formattedPrompt);

    console.log('Call Analysis ::: removePIIFromOverview::: result:', response);

    // The response should already be structured according to the schema
    if (response) {
      return response as ICallOverview;
    }

    throw new Error('Invalid response structure from PII removal');
  } catch (error) {
    console.error('Error removing PII from overview:', error);
    throw new Error('Failed to remove PII from overview');
  }
}

// Note: Cannot use withStructuredOutput for MSIG assessment because z.record()
// (dynamic keys) is not supported by OpenAI's structured output.
// Instead, we invoke the model directly and parse the JSON response.

const msigAssessmentSystemPrompt = `You are a PII removal specialist. Your task is to selectively remove ONLY specific types of personal identifiable
  information from an MSIG sales call assessment.
  
  [CRITICAL - DO NOT REDACT]
  You MUST keep the following unchanged - DO NOT replace these:
  - Names (full names, first names, last names, nicknames, titles like Mr/Ms/Mdm) - KEEP AS-IS
  - Dates (appointments, deadlines, specific dates, travel dates, policy dates) - KEEP AS-IS (EXCEPT date of birth)
  - Company names (MSIG, insurance companies, organizations) - KEEP AS-IS
  
  [PII TO REDACT - Replace ONLY these]
  Replace ONLY the following with placeholders:
  - ID numbers (NRIC, FIN, passport, etc.) → [ID]
  - Dates of birth ONLY (e.g., "born on 15 Jan 1980") → [DOB]
  - Phone numbers → [PHONE]
  - Email addresses → [EMAIL]
  - Physical addresses (street addresses, home addresses) → [ADDRESS]
  - Account/Policy numbers → [ACCOUNT]/[POLICY]
  - Vehicle numbers → [VEHICLE]
  
  [PRESERVATION RULES]
  - Maintain all scores, weights, pass/fail values, criteriaId, and structural data EXACTLY as provided
  - Only modify 'evidence', 'summary', and 'suggestedNextSteps' text content
  - Keep the exact JSON structure including all sections
  - Keep names, dates (except DOB), and company names unchanged
  
  IMPORTANT: When in doubt whether to redact something, refer to the DO NOT REDACT list first.`;

const msigAssessmentUserPrompt = `[MSIG ASSESSMENT TO PROCESS]
  {assessment}
  
  Process the MSIG assessment following the rules above:
  1. Keep all names, dates (except DOB), and company names unchanged
  2. Replace ONLY the specific PII types listed in [PII TO REDACT]
  3. Return the complete assessment with appropriate placeholders
  
  Output ONLY valid JSON in the exact structure provided.
  
  [REMINDER]
  - DO NOT redact names, dates (except DOB), or company names
  - ONLY redact the specific PII types in the redaction list
  - Preserve ALL scores, pass/fail, criteriaId, weights exactly as-is`;

export async function removePIIFromMSIGAssessment(
  msigAssessment: IMSIGCallAssessment,
): Promise<IMSIGCallAssessment> {
  try {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', msigAssessmentSystemPrompt],
      ['user', msigAssessmentUserPrompt],
    ]);

    const formattedPrompt = await prompt.format({
      assessment: JSON.stringify(msigAssessment),
    });

    console.log(
      'Call Analysis ::: removePIIFromMSIGAssessment::: prompt',
      formattedPrompt,
    );

    const model = new ChatOpenAI({
      modelName: OPENAI_MODEL_GPT_4_1_MINI,
      temperature: 0,
      modelKwargs: { response_format: { type: 'json_object' } },
    });

    const response = await model.invoke(formattedPrompt);

    console.log(
      'Call Analysis ::: removePIIFromMSIGAssessment::: result:',
      response.content,
    );

    const parsed = parseJsonSafely(response.content);

    if (parsed && parsed.sections) {
      return parsed as IMSIGCallAssessment;
    }

    throw new Error('Invalid response structure from MSIG PII removal');
  } catch (error) {
    console.error('Error removing PII from MSIG assessment:', error);
    throw new Error('Failed to remove PII from MSIG assessment');
  }
}
