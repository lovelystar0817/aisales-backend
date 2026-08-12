import { ChatOpenAI } from '@langchain/openai';
import { Message } from '../../models/Message.js';
import { SalesSession } from '../../models/SalesSession.js';
import {
  greatEasternFactFindEvaluationPrompt,
  greatEasternProductPitchEvaluationPrompt,
  greatEasternPostSalesEvaluationPrompt,
} from '../../frameworks/greatEastern.js';
import { OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { isSessionTooBrief } from '../session.js';
import { parseResponse } from '../json.js';
import { triggerSCORMCompletionIfReady } from './regular.js';

function getGreatEasternPrompt(
  moduleFriendlyId: string,
  characterName: string,
): string {
  let basePrompt: string;

  switch (moduleFriendlyId) {
    case 'great-eastern-fact-find':
      basePrompt = greatEasternFactFindEvaluationPrompt;
      break;
    case 'great-eastern-product-pitch':
      basePrompt = greatEasternProductPitchEvaluationPrompt;
      break;
    case 'great-eastern-post-sales':
      basePrompt = greatEasternPostSalesEvaluationPrompt;
      break;
    default:
      basePrompt = greatEasternFactFindEvaluationPrompt;
  }

  return basePrompt.replaceAll('{{characterName}}', characterName);
}

export async function generateGreatEasternAssessmentJob(
  job: any,
): Promise<void> {
  const { sessionId, languageCode = 'en' } = job.attrs.data;
  console.log(
    `[Great Eastern] Starting assessment generation for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .populate({
        path: 'scenario',
        populate: { path: 'module' },
      })
      .orFail();

    if (!session.roleplay) {
      throw new Error(`No roleplay found for session: ${sessionId}`);
    }

    // Do not re-generate if already present
    if (session.roleplay.feedback?.greatEasternAssessment) {
      console.log(
        `[Great Eastern] Assessment already exists for session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.greatEasternAssessmentGenerating': false },
      });
      return;
    }

    await session.updateOne({
      $set: { 'roleplay.feedback.greatEasternAssessmentGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `[Great Eastern] Session too brief for assessment: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.greatEasternAssessmentGenerating': false },
      });
      return;
    }

    // Get the module friendlyId from session.callType (always set) or fall back to scenario
    const scenario = session.scenario as any;
    const moduleFriendlyId =
      session.callType ||
      scenario?.module?.friendlyId ||
      'great-eastern-fact-find';

    console.log(
      `[Great Eastern] Using module: ${moduleFriendlyId} for session: ${sessionId}`,
    );

    const model = new ChatOpenAI({
      modelName: OPENAI_MODEL_GPT_4_1,
      modelKwargs: {
        response_format: { type: 'json_object' },
      },
    });

    const prompt = getGreatEasternPrompt(
      moduleFriendlyId,
      session.persona?.name || 'Prospect',
    );

    const transcript = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const fullPrompt = `${prompt}

[CONVERSATION TRANSCRIPT]
${transcript}`;

    const response: any = await model.invoke(fullPrompt);

    let assessment;
    try {
      assessment = parseResponse(response);
      console.log(
        '[Great Eastern] Parsed assessment:',
        JSON.stringify(assessment, null, 2).substring(0, 500),
      );
    } catch (error) {
      console.error('[Great Eastern] Failed to parse response:', error);
      await session.updateOne({
        $set: { 'roleplay.feedback.greatEasternAssessmentGenerating': false },
      });
      return;
    }

    // Extract greatEasternAssessment from response
    const greatEasternAssessment = assessment.greatEasternAssessment;

    if (greatEasternAssessment && greatEasternAssessment.sections) {
      // Calculate overall score as sum of section scores
      const sectionsScore = greatEasternAssessment.sections.reduce(
        (sum: number, section: any) => {
          return sum + (section.score || 0);
        },
        0,
      );

      console.log(
        `[Great Eastern] Sections score for session ${sessionId}: ${sectionsScore} (from ${greatEasternAssessment.sections.length} sections)`,
      );

      let productKnowledgeScore = 0;

      // For product pitch module, include product knowledge score if available
      if (moduleFriendlyId === 'great-eastern-product-pitch') {
        console.log(
          `[Great Eastern] Product pitch module detected, fetching latest product knowledge score`,
        );
        try {
          // Re-fetch session to get the latest product knowledge score
          const latestSession = await SalesSession.findById(sessionId)
            .select('roleplay.feedback.productKnowledge')
            .lean();

          if (!latestSession) {
            console.log(
              `[Great Eastern] Warning: Could not refetch session ${sessionId}`,
            );
          } else {
            const productKnowledgeData =
              latestSession?.roleplay?.feedback?.productKnowledge;

            if (productKnowledgeData) {
              console.log(
                `[Great Eastern] Product knowledge data found, type: ${typeof productKnowledgeData}`,
              );
              const productKnowledge =
                typeof productKnowledgeData === 'string'
                  ? JSON.parse(productKnowledgeData)
                  : productKnowledgeData;
              const rawProductKnowledgeScore =
                productKnowledge.overallScore || 0;
              // Convert from 100-point scale to 33-point scale to match other sections
              productKnowledgeScore = Math.round(
                (rawProductKnowledgeScore * 33) / 100,
              );
              console.log(
                `[Great Eastern] Product knowledge score: ${rawProductKnowledgeScore}/100 → ${productKnowledgeScore}/33`,
              );
            } else {
              console.log(
                `[Great Eastern] No product knowledge data found yet for session ${sessionId} (may still be generating)`,
              );
            }
          }
        } catch (error) {
          console.error(
            '[Great Eastern] Error fetching/parsing product knowledge data:',
            error,
          );
        }
      }

      // Calculate total score: sections + product knowledge
      const calculatedScore = sectionsScore + productKnowledgeScore;

      console.log(
        `[Great Eastern] Final score calculation for session ${sessionId}:`,
      );
      console.log(
        `  - Sections score (${greatEasternAssessment.sections.length} sections): ${sectionsScore}`,
      );
      console.log(`  - Product knowledge score: ${productKnowledgeScore}`);
      console.log(`  - Total calculated score: ${calculatedScore}`);
      console.log(
        `  - LLM-generated score: ${greatEasternAssessment.overallScore}`,
      );

      const assessmentWithOverallScore = {
        ...greatEasternAssessment,
        overallScore: calculatedScore,
      };

      console.log(
        `[Great Eastern] Saving assessment with overallScore: ${assessmentWithOverallScore.overallScore}`,
      );

      const serializedAssessment = JSON.stringify(assessmentWithOverallScore);
      console.log(
        `[Great Eastern] Serialized assessment (first 500 chars):`,
        serializedAssessment.substring(0, 500),
      );

      await session.updateOne({
        $set: {
          'roleplay.feedback.greatEasternAssessment': serializedAssessment,
          'roleplay.feedback.greatEasternAssessmentGenerating': false,
        },
      });
      console.log(
        `[Great Eastern] Assessment generation completed for session: ${sessionId}`,
      );
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.greatEasternAssessmentGenerating': false,
        },
      });
      console.log(
        `[Great Eastern] Assessment generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `[Great Eastern] Assessment generation failed for session ${sessionId}:`,
      error,
    );
    try {
      await SalesSession.findByIdAndUpdate(sessionId, {
        $set: { 'roleplay.feedback.greatEasternAssessmentGenerating': false },
      });
    } catch (updateError) {
      console.error(
        `[Great Eastern] Failed to clear generating flag for session ${sessionId}:`,
        updateError,
      );
    }
  }
}

// Keep the old function name as an alias for backwards compatibility with existing jobs
export const generateGreatEasternSalesTechniqueJob =
  generateGreatEasternAssessmentJob;
