import { ChatOpenAI } from '@langchain/openai';
import { LangChainCallbackHandler } from '@posthog/ai';
import { DEFAULT_FRAMEWORK } from '../../frameworks/common.js';
import { SalesFramework } from '../../frameworks/types.js';
import { callbackHandler } from '../../libs/langchain.js';
import { Message } from '../../models/Message.js';
import { SalesProductDocument } from '../../models/SalesProduct.js';
import { AssessmentType, SalesSession } from '../../models/SalesSession.js';
import { ScenarioDocument } from '../../models/Scenario.js';
import { ScorecardDocument, ScorecardSection } from '../../models/Scorecard.js';
import { getProductKnowledgePrompt } from '../../prompts/product-knowledge.js';
import { getPrudentialRoleplayOverviewPrompt } from '../../prompts/prudential/prudential-roleplay-overview.js';
import { getRoleplayOverviewPrompt } from '../../prompts/roleplay-overview.js';
import { getSalesTechniquePrompt } from '../../prompts/sales-technique.js';
import { DEFAULT_OPENAI_MODEL, OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { HttpError } from '../errors.js';
import { parseJsonSafely, parseResponse } from '../json.js';
import { getLanguageName } from '../languages.js';
import { parseFeedbackScores } from '../manage/shared.js';
import { parseGrabFeedbackScores } from '../manage/grab.js';
import { isSessionTooBrief } from '../session.js';

export interface SalesFeedbackInput {
  callType: string;
  scenario: string;
  objectives: string[];
  messages: any[];
  characterName: string;
  framework: SalesFramework;
  companyId?: string;
  sessionId?: string;
  languageCode?: string;
  productInfo?: string;
  product?: SalesProductDocument;
  assessmentType?: AssessmentType;
  scorecard?: ScorecardSection;
  userName?: string;
}

export const generateRoleplayOverview = async ({
  callType,
  scenario,
  objectives,
  framework,
  messages,
  characterName,
  sessionId,
  languageCode,
  productInfo,
  assessmentType,
  userName,
}: SalesFeedbackInput) => {
  try {
    const model = new ChatOpenAI({ modelName: DEFAULT_OPENAI_MODEL });

    const session = sessionId
      ? await SalesSession.findById(sessionId)
          .select('assessmentType languageCode user')
          .populate('user', 'firstName name')
          .orFail()
      : null;

    // Determine assessment type - use parameter first, then session data, default to 'regular'
    const finalAssessmentType =
      assessmentType || session?.assessmentType || 'regular';

    // Prefer session's stored languageCode over request header languageCode
    const effectiveLanguageCode = session?.languageCode || languageCode;

    // Resolve userName for personalized feedback (AIA-KO only)
    const isAiaKo = finalAssessmentType?.startsWith('aia-ko');
    const resolvedUserName = isAiaKo
      ? userName ||
        (session?.user as any)?.firstName ||
        (session?.user as any)?.name ||
        undefined
      : undefined;

    // Use Prudential-specific prompt for Prudential sessions, general prompt for others
    const prompt =
      finalAssessmentType === 'prudential'
        ? getPrudentialRoleplayOverviewPrompt(
            characterName,
            effectiveLanguageCode,
            callType,
          )
        : getRoleplayOverviewPrompt(
            characterName,
            effectiveLanguageCode,
            resolvedUserName,
          );

    const conversationContext = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = productInfo;

    const formattedPrompt = await prompt.format({
      callType,
      scenario,
      objectives: objectives.join('\n'),
      framework,
      transcript: conversationContext,
      extraContext,
      characterName,
    });

    console.log('generateSalesOverview formattedPrompt:', formattedPrompt);

    const callback = session
      ? callbackHandler({
          userId: session.user?.toString(),
          sessionId: session.id,
          type: 'sales_overview',
        })
      : undefined;

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: callback ? [callback] : [],
    });

    let overviewData;
    try {
      overviewData = parseResponse(response);
    } catch (error) {
      console.error('Failed to parse sales overview response:', error);
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in sales overview response',
      );
    }

    return overviewData.overview;
  } catch (error) {
    console.error('Error generating sales overview:', error);
    throw new HttpError(500, 'Sales overview generation failed');
  }
};

export const generateSalesTechnique = async (
  param: SalesFeedbackInput & { callback: LangChainCallbackHandler },
) => {
  try {
    const {
      callType,
      scenario,
      objectives,
      framework,
      messages,
      characterName,
      callback,
      languageCode,
      productInfo,
      product,
    } = param;

    console.log('generateSalesTechnique param:', param);
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    console.log('generateSalesTechnique product:', product);

    const prompt = getSalesTechniquePrompt(
      characterName,
      framework,
      getLanguageName(languageCode),
    );

    const conversationContext = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = productInfo;

    const formattedPrompt = await prompt.format({
      callType,
      scenario,
      objectives: objectives.join('\n'),
      framework,
      transcript: conversationContext,
      extraContext,
    });

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: [callback],
    });

    console.log('generateSalesTechnique response:', response);

    let techniqueData;
    try {
      techniqueData = parseResponse(response);
    } catch (error) {
      console.error('Failed to parse sales technique response:', error);
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in sales technique response',
      );
    }

    return techniqueData.salesTechnique;
  } catch (error) {
    console.error('Error generating sales technique assessment:', error);
    throw new HttpError(500, 'Sales technique assessment generation failed');
  }
};

export const generateProductKnowledge = async ({
  callType,
  scenario,
  objectives,
  framework,
  messages,
  characterName,
  callback,
  languageCode,
  productInfo,
  product,
  scorecard,
}: SalesFeedbackInput & { callback: LangChainCallbackHandler }) => {
  try {
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const prompt = getProductKnowledgePrompt({
      characterName,
      language: getLanguageName(languageCode),
      evaluationFocus: product?.evaluationFocus?.join('\n'),
      productName: product?.name,
      productInformation:
        product?.knowledgePrompt ?? getProductInformation(product),
      scorecard,
      callType,
    });

    const conversationContext = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      callType,
      scenario,
      objectives: objectives.join('\n'),
      framework: framework ?? 'Not specified',
      transcript: conversationContext,
      productInfo,
    });

    console.log('generateProductKnowledge formattedPrompt:', formattedPrompt);

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: [callback],
    });

    let productData;
    try {
      productData = parseResponse(response);
    } catch (error) {
      console.error('Failed to parse product knowledge response:', error);
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in product knowledge response',
      );
    }

    return productData.productKnowledge;
  } catch (error) {
    console.error('Error generating product knowledge assessment:', error);
    throw new HttpError(500, 'Product knowledge assessment generation failed');
  }
};

const getProductInformation = (product: any): string => {
  const sections: string[] = [];

  sections.push(`## PRODUCT INFORMATION: ${product.name}\n`);

  // Add feature highlight if available
  if (product.featureHighlight) {
    sections.push(`**${product.featureHighlight.title}**`);
    sections.push(`${product.featureHighlight.description}\n`);
  }

  // Add key features
  if (product.keyFeatures && product.keyFeatures.length > 0) {
    sections.push('**Key Features:**');
    product.keyFeatures.forEach((feature: string) => {
      sections.push(`- ${feature}`);
    });
    sections.push('');
  }

  // Add evaluation focus areas
  if (product.evaluationFocus && product.evaluationFocus.length > 0) {
    sections.push('**Focus Areas:**');
    product.evaluationFocus.forEach((focus: string) => {
      sections.push(`- ${focus}`);
    });
    sections.push('');
  }

  return sections.join('\n');
};

export const generateSalesTechniqueJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting sales technique generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if assessment already exists
    if (session.roleplay.feedback?.salesTechniques) {
      console.log(`Sales techniques already exist for session: ${sessionId}`);
      // Clear generating flag if data exists
      await session.updateOne({
        $set: { 'roleplay.feedback.salesTechniquesGenerating': false },
      });
      return;
    }

    // 🆕 Mark as generating
    await session.updateOne({
      $set: { 'roleplay.feedback.salesTechniquesGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for sales technique assessment: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.salesTechniquesGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    const callback = callbackHandler({
      userId: session.user?.toString(),
      sessionId: session.id,
      type: 'sales_technique_assessment',
    });

    //Generate assessment
    const salesTechniques = await generateSalesTechnique({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives || [],
      framework,
      messages,
      characterName: session.persona?.name || 'Prospect',
      callback,
      languageCode,
      productInfo: '',
      product: session.product,
      sessionId: session._id.toString(),
    });

    if (salesTechniques) {
      // Calculate overall score - average for ALIBABA_TELESALES, sum for others
      let salesTechniquesWithOverallScore = salesTechniques;

      if (salesTechniques.sections && Array.isArray(salesTechniques.sections)) {
        const sum = salesTechniques.sections.reduce(
          (total: number, section: any) => {
            return total + (section.score || 0);
          },
          0,
        );

        // All frameworks use sum of section scores
        // ALIBABA_TELESALES: 20 sections × 0-5 = 100
        // MEDDPICC: 5 sections × 0-20 = 100
        const calculatedScore = sum;

        console.log(
          `Score comparison for session ${sessionId}: Framework=${framework}, LLM-generated=${salesTechniques.overallScore}, Calculated=${calculatedScore} (sum)`,
        );

        salesTechniquesWithOverallScore = {
          ...salesTechniques,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.salesTechniques': JSON.stringify(
            salesTechniquesWithOverallScore,
          ),
          'roleplay.feedback.salesTechniquesGenerating': false,
        },
      });
      console.log(
        `Sales technique generation completed for session: ${sessionId}`,
      );

      // Check if both assessments are complete and trigger SCORM completion if ready
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      // Generation failed - clear flag but don't save empty data
      await session.updateOne({
        $set: {
          'roleplay.feedback.salesTechniquesGenerating': false,
        },
      });
      console.log(
        `Sales technique generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `Sales technique generation job failed for session ${sessionId}:`,
      error,
    );

    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.salesTechniquesGenerating': false },
    }).catch((updateError) => {
      console.error('Failed to clear generating flag:', updateError);
    });
  }
};

export const generateProductKnowledgeJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting product knowledge generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate<{
        scenario: Omit<ScenarioDocument, 'scorecard'> & {
          scorecard?: ScorecardDocument;
        };
      }>({
        path: 'scenario',
        populate: [{ path: 'product' }, { path: 'persona' }],
      })
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Skip product knowledge generation for Alibaba Cloud Telesales
    const framework = session.roleplay.framework ?? DEFAULT_FRAMEWORK;
    if (framework === SalesFramework.ALIBABA_TELESALES) {
      console.log(
        `Skipping product knowledge generation for Alibaba Telesales session: ${sessionId}`,
      );
      await session.updateOne({
        $set: { 'roleplay.feedback.productKnowledgeGenerating': false },
      });
      return;
    }

    const productKnowledgeScorecard =
      session.scenario?.scorecard?.sections?.find(
        (s: any) => s.sectionType === 'product-knowledge',
      );

    if (productKnowledgeScorecard) {
      console.log(
        `Product knowledge scorecard found for session: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.productKnowledgeGenerating': false },
      });
      return;
    }

    if (
      session.scenario?.scorecard?.sections &&
      session.scenario?.scorecard?.sections?.length > 0 &&
      !productKnowledgeScorecard
    ) {
      console.log(
        `No product knowledge scorecard found for session: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.productKnowledgeGenerating': false },
      });
      return;
    }

    // Check if assessment already exists
    if (session.roleplay.feedback?.productKnowledge) {
      console.log(`Product knowledge already exists for session: ${sessionId}`);
      // Clear generating flag if data exists
      await session.updateOne({
        $set: { 'roleplay.feedback.productKnowledgeGenerating': false },
      });
      return;
    }

    // 🆕 Mark as generating
    await session.updateOne({
      $set: { 'roleplay.feedback.productKnowledgeGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ createdAt: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for product knowledge assessment: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.productKnowledgeGenerating': false },
      });
      return;
    }

    const callback = callbackHandler({
      userId: session.user?.toString(),
      sessionId: session.id,
      type: 'product_knowledge_assessment',
    });

    // Generate assessment
    const productKnowledge = await generateProductKnowledge({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives || [],
      framework,
      messages,
      characterName: session.persona?.name || 'Prospect',
      callback,
      languageCode,
      productInfo: '',
      product: session.product,
      scorecard: productKnowledgeScorecard,
    });

    if (productKnowledge) {
      // Calculate overall score - average for ALIBABA_TELESALES, sum for others
      let productKnowledgeWithOverallScore = productKnowledge;

      if (
        productKnowledge.sections &&
        Array.isArray(productKnowledge.sections)
      ) {
        const sum = productKnowledge.sections.reduce(
          (total: number, section: any) => {
            return total + (section.score || 0);
          },
          0,
        );

        // All frameworks use sum of section scores
        const calculatedScore = sum;

        console.log(
          `Product knowledge score comparison for session ${sessionId}: Framework=${framework}, LLM-generated=${productKnowledge.overallScore}, Calculated=${calculatedScore} (sum)`,
        );

        productKnowledgeWithOverallScore = {
          ...productKnowledge,
          overallScore: calculatedScore,
        };
      }

      await session.updateOne({
        $set: {
          'roleplay.feedback.productKnowledge': JSON.stringify(
            productKnowledgeWithOverallScore,
          ),
          'roleplay.feedback.productKnowledgeGenerating': false,
        },
      });
      console.log(
        `Product knowledge generation completed for session: ${sessionId}`,
      );

      // Check if both assessments are complete and trigger SCORM completion if ready
      await triggerSCORMCompletionIfReady(sessionId);
    } else {
      // Generation failed - clear flag but don't save empty data
      await session.updateOne({
        $set: {
          'roleplay.feedback.productKnowledgeGenerating': false,
        },
      });
      console.log(
        `Product knowledge generation returned no data for session: ${sessionId}`,
      );
    }
  } catch (error) {
    console.error(
      `Product knowledge generation job failed for session ${sessionId}:`,
      error,
    );

    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.productKnowledgeGenerating': false },
    }).catch((updateError) => {
      console.error('Failed to clear generating flag:', updateError);
    });
  }
};

/**
 * Check if both assessments are complete and trigger SCORM completion if ready
 */
export async function triggerSCORMCompletionIfReady(
  sessionId: string,
): Promise<void> {
  try {
    const session = await SalesSession.findById(sessionId).orFail();

    // Check if all assessments are complete (no generating flags still active)
    const feedback = session.roleplay?.feedback;
    if (!feedback) {
      console.log(`[SCORM] No feedback available for session: ${sessionId}`);
      return;
    }

    // Check if ANY generating flag is still active — if so, not all jobs are done
    const activeGeneratingFlags = [
      feedback.salesTechniquesGenerating && 'salesTechniques',
      feedback.productKnowledgeGenerating && 'productKnowledge',
      feedback.grabMexSoftSkillsGenerating && 'grabMexSoftSkills',
      feedback.axaPhSoftSkillsGenerating && 'axaPhSoftSkills',
      feedback.axaPhKnowledgeSkillsGenerating && 'axaPhKnowledgeSkills',
      feedback.ktAxaSoftSkillsGenerating && 'ktAxaSoftSkills',
      feedback.ktAxaKnowledgeSkillsGenerating && 'ktAxaKnowledgeSkills',
      feedback.ktAxaProductKnowledgeGenerating && 'ktAxaProductKnowledge',
      feedback.msigTravelEasySoftSkillsGenerating && 'msigTravelEasySoftSkills',
      feedback.msigTravelEasyKnowledgeSkillsGenerating &&
        'msigTravelEasyKnowledgeSkills',
      feedback.msigTravelEasyProductKnowledgeGenerating &&
        'msigTravelEasyProductKnowledge',
      feedback.prudentialOHSalesTechniqueGenerating &&
        'prudentialOHSalesTechnique',
      feedback.prudentialOHObjectionHandlingGenerating &&
        'prudentialOHObjectionHandling',
      feedback.prudentialPHAppointmentSettingGenerating &&
        'prudentialPHAppointmentSetting',
      feedback.prudentialPHFactFindingTechniqueGenerating &&
        'prudentialPHFactFindingTechnique',
      feedback.prudentialPHProductKnowledgeGenerating &&
        'prudentialPHProductKnowledge',
      feedback.prudentialPHClosingCallTechniqueGenerating &&
        'prudentialPHClosingCallTechnique',
      feedback.aiaKoIntroductionGenerating && 'aiaKoIntroduction',
      feedback.aiaKoObjectionHandlingGenerating && 'aiaKoObjectionHandling',
      feedback.aiaKoNeedsExplorationGenerating && 'aiaKoNeedsExploration',
      feedback.aiaKoE2EAssessmentGenerating && 'aiaKoE2EAssessment',
      (feedback.scorecards as any)?.some((s: any) => s.isGenerating) &&
        'scorecards',
    ].filter(Boolean);

    if (activeGeneratingFlags.length > 0) {
      console.log(
        `[SCORM] Assessments still generating for session: ${sessionId} - Active: ${activeGeneratingFlags.join(', ')}`,
      );
      return;
    }

    // Use the appropriate score calculator based on assessment type
    const scoreResult = parseGrabFeedbackScores(session);

    const overallScore = scoreResult.overallScore;
    const isValid = scoreResult.isValid;

    if (overallScore == null || overallScore <= 0) {
      console.log(
        `[SCORM] No valid scores for session: ${sessionId} (type: ${session.assessmentType})`,
      );
      return;
    }

    console.log(
      `[SCORM] Overall score calculated for session: ${sessionId} - Score: ${overallScore} (type: ${session.assessmentType})`,
    );

    // Store SCORM completion data
    await session.updateOne({
      $set: {
        'roleplay.overallScore': overallScore,
        'roleplay.scormCompletionReady': true,
        'roleplay.scormCompletionTriggeredAt': new Date(),
      },
    });

    console.log(
      `[SCORM] Session ${sessionId} marked as ready for SCORM completion with score: ${overallScore}`,
    );
  } catch (error) {
    console.error(
      `[SCORM] Error checking completion readiness for session ${sessionId}:`,
      error,
    );
  }
}
