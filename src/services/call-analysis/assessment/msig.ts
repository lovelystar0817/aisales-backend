import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import type {
  ITranscriptSegment,
  IMSIGCallAssessment,
  IMSIGSectionEvaluation,
  CallAnalysisProduct,
} from '../../../models/CallAnalysis.js';

import {
  getMSIGSectionPrompt,
  getAvailableSections,
  type SectionCriteria,
} from '../../../prompts/msig-assessment.js';

import {
  calculateMSIGOverallScore,
  hasFailedMandatory,
  getMSIGTierName,
  type MSIGSectionsRecord,
  type MSIGSectionEvaluation as HomeMSIGSectionEvaluation,
} from '../../../utils/assessment/msig.js';

import { parseResponse } from '../../../utils/json.js';

import {
  OPENAI_MODEL_GPT_4_1,
  OPENAI_MODEL_GPT_4_1_MINI,
} from '../../../utils/constants.js';

/**
 * Format call analysis transcript to match MSIG prompt expectations.
 * MSIG prompts expect "user:" for salesperson and "ai:" for prospect.
 */
function formatTranscriptForMSIG(transcript: ITranscriptSegment[]): string {
  return transcript
    .map((segment) => {
      const role = segment.role === 'agent' ? 'user' : 'ai';
      return `${role}: ${segment.content}`;
    })
    .join('\n');
}

/**
 * Get product display name for prompt context.
 */
function getProductDisplayName(product: CallAnalysisProduct): string {
  switch (product) {
    case 'dentiplus':
      return 'DentiPlus dental insurance';
    case 'parecoveryplus':
      return 'PARecovery Plus personal accident insurance';
    default:
      return 'insurance';
  }
}

/**
 * Get the productId expected by getMSIGSectionPrompt.
 */
function getPromptProductId(product: CallAnalysisProduct): string {
  switch (product) {
    case 'dentiplus':
      return 'dentiplus';
    case 'parecoveryplus':
      return 'parecovery-plus';
    default:
      return '';
  }
}

/**
 * Assess a single section of a call analysis transcript using the MSIG framework.
 */
async function assessSection(
  formattedTranscript: string,
  sectionType: keyof SectionCriteria,
  product: CallAnalysisProduct,
): Promise<IMSIGSectionEvaluation> {
  const productId = getPromptProductId(product);
  const productName = getProductDisplayName(product);

  const { prompt, sectionData } = getMSIGSectionPrompt({
    sectionType,
    productId,
    callType: 'telesales',
  });

  const formattedPrompt = await prompt.format({
    callType: 'Telesales',
    scenario: `Real ${productName} sales call recording`,
    objectives: `Sell ${productName} to the customer`,
    framework: 'MSIG Telesales QA Assessment Framework',
    transcript: formattedTranscript,
  });

  const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
  const response = await model.invoke(formattedPrompt);
  const parsed = parseResponse(response);
  const sectionEvaluation = parsed.sectionEvaluation;

  // Handle not-applicable sections (Sales Confirmation & Mandatory Disclosure when no sale)
  if (!sectionEvaluation.isApplicable) {
    const placeholderEvaluations = sectionData.criteria.map(
      (criterion: any) => ({
        criteriaId: criterion.id,
        criteriaText: criterion.text,
        pass: false,
        mandatory: criterion.mandatory,
        evidence: '',
      }),
    );

    return {
      sectionType,
      sectionWeight: sectionData.weight,
      description: sectionData.description,
      evaluations: placeholderEvaluations,
      notApplicable: true,
      notApplicableReason:
        sectionEvaluation.notApplicableReason || 'Section not applicable',
    };
  }

  // Build a lookup from criteria definitions to enforce correct mandatory values
  const mandatoryLookup = new Map(
    sectionData.criteria.map((c: any) => [c.id, c.mandatory]),
  );

  // Overlay mandatory from criteria definitions (LLM may hallucinate mandatory status)
  const evaluations = (sectionEvaluation.evaluations ?? []).map((ev: any) => ({
    ...ev,
    mandatory: mandatoryLookup.get(ev.criteriaId) ?? ev.mandatory,
  }));

  return {
    sectionType,
    sectionWeight: sectionEvaluation.sectionWeight ?? sectionData.weight,
    description: sectionEvaluation.description ?? sectionData.description,
    evaluations,
  };
}

/**
 * Generate summary and next steps from MSIG section results.
 */
async function generateMSIGSummary(
  sections: Record<string, IMSIGSectionEvaluation>,
  overallScore: number,
  tier: string,
): Promise<{ summary: string; suggestedNextSteps: string[] }> {
  const sectionSummaries = Object.entries(sections)
    .map(([key, section]) => {
      if (section.notApplicable) return `- ${key}: Not applicable`;
      const passed = section.evaluations.filter((e) => e.pass).length;
      const total = section.evaluations.length;
      return `- ${key} (weight ${section.sectionWeight}%): ${passed}/${total} criteria passed`;
    })
    .join('\n');

  const failedCriteria = Object.values(sections)
    .filter((s) => !s.notApplicable)
    .flatMap((s) =>
      s.evaluations
        .filter((e) => !e.pass)
        .map(
          (e) =>
            `- ${e.criteriaText}${e.mandatory ? ' [MANDATORY]' : ''}: ${e.evidence}`,
        ),
    )
    .join('\n');

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are an expert call quality assessor for MSIG Insurance. Write directly to the sales representative using "you". Be constructive and
  professional.`,
    ],
    [
      'user',
      `Based on this MSIG telesales assessment, generate a summary and next steps.
  
  Overall Score: ${overallScore}% (Tier: ${tier})
  
  Section Results:
  ${sectionSummaries}
  
  Failed Criteria:
  ${failedCriteria || 'None - all criteria passed'}
  
  Generate JSON: {{"summary": "3-4 sentence summary", "suggestedNextSteps": ["3-5 actionable recommendations"]}}`,
    ],
  ]);

  const schema = z.object({
    summary: z.string(),
    suggestedNextSteps: z.array(z.string()),
  });

  const model = new ChatOpenAI({
    modelName: OPENAI_MODEL_GPT_4_1_MINI,
    temperature: 0.2,
  });

  const result = await prompt
    .pipe(model.withStructuredOutput(schema))
    .invoke({});

  return result;
}

/**
 * Main entry point: assess a call analysis transcript using the MSIG 6-section framework.
 * Used for PARecovery Plus and DentiPlus products.
 */
export async function assessCallTranscriptMSIG(
  transcript: ITranscriptSegment[],
  product: CallAnalysisProduct,
): Promise<IMSIGCallAssessment> {
  const formattedTranscript = formatTranscriptForMSIG(transcript);
  const availableSections = getAvailableSections();

  // Run all 6 sections in parallel
  const sectionResults = await Promise.all(
    availableSections.map((sectionType) =>
      assessSection(formattedTranscript, sectionType, product),
    ),
  );

  // Build sections record
  const sections: Record<string, IMSIGSectionEvaluation> = {};
  for (const result of sectionResults) {
    sections[result.sectionType] = result;
  }

  // Reuse existing MSIG scoring functions (they accept MSIGSectionsRecord)
  const sectionsForScoring = sections as unknown as MSIGSectionsRecord;
  const overallScore = calculateMSIGOverallScore(sectionsForScoring);
  const hasMandatoryFailures = hasFailedMandatory(sectionsForScoring);
  const tier = getMSIGTierName(sectionsForScoring);

  // Generate summary
  const { summary, suggestedNextSteps } = await generateMSIGSummary(
    sections,
    overallScore,
    tier,
  );

  return {
    sections,
    overallScore,
    tier,
    hasMandatoryFailures,
    summary,
    suggestedNextSteps,
  };
}
