import { ChatOpenAI } from '@langchain/openai';
import { callbackHandler } from '../../libs/langchain.js';
import { HttpError } from '../errors.js';
import { parseResponse } from '../json.js';
import { LangChainCallbackHandler } from '@posthog/ai';
import { SalesSession } from '../../models/SalesSession.js';
import { Message } from '../../models/Message.js';
import { OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { isSessionTooBrief } from '../session.js';
import { getLanguageName } from '../languages.js';
import { SalesFeedbackInput } from './regular.js';
import {
  getBBLAdvisoryTechniquePrompt,
  getBBLProcessAdherencePrompt,
} from '../../prompts/bbl/index.js';

export interface BBLPortfolioHolding {
  assetGroup: string;
  amountTHB: number;
  weightPercent: number;
  adjustmentTHB?: number;
}

export interface BBLCurrentPortfolio {
  totalValueTHB: number;
  holdings: BBLPortfolioHolding[];
}

export interface BBLAdjustedPortfolio {
  isSuggested: boolean;
  totalAdjustmentTHB: number;
  totalValueTHB: number;
  holdings: BBLPortfolioHolding[];
}

export interface BBLSessionMeta {
  bblCurrentPortfolio?: BBLCurrentPortfolio;
  bblAdjustedPortfolios?: BBLAdjustedPortfolio[];
  bblRebalanceWithTopup?: boolean;
  bblPortfolioReviewTrigger?: string;
  selectedObjections?: string[];
}

export const ASSET_GROUP_NAMES: Record<string, string> = {
  'thai-fixed-income': 'Thai Fixed Income',
  'global-fixed-income': 'Global Fixed Income',
  allocation: 'Balanced Allocation',
  'thai-equity': 'Thai Equity',
  'dm-equity': 'Developed Market Equity',
  'em-equity': 'Emerging Market Equity',
  thematic: 'Thematic Investments',
  'real-asset': 'Real Assets',
  commodities: 'Commodities',
};

// 1-Year return and volatility data per asset group (from BBL portfolio spreadsheet)
export const ASSET_PERFORMANCE: Record<
  string,
  { returnPercent: number; volatilityPercent: number }
> = {
  'thai-fixed-income': { returnPercent: 2.8, volatilityPercent: 2.8 },
  'global-fixed-income': { returnPercent: -1.4, volatilityPercent: 5.5 },
  allocation: { returnPercent: 3.9, volatilityPercent: 7.8 },
  'thai-equity': { returnPercent: -4.6, volatilityPercent: 15.0 },
  'dm-equity': { returnPercent: 8.7, volatilityPercent: 13.2 },
  'em-equity': { returnPercent: -2.3, volatilityPercent: 18.6 },
  thematic: { returnPercent: -6.1, volatilityPercent: 22.0 },
  'real-asset': { returnPercent: -3.5, volatilityPercent: 12.4 },
  commodities: { returnPercent: -8.9, volatilityPercent: 25.0 },
};

// Build portfolio context string for assessment prompts (portfolio review only)
function buildPortfolioContext(session: {
  persona?: { meta?: BBLSessionMeta };
}): string {
  const meta = session.persona?.meta;
  if (!meta?.bblCurrentPortfolio) return '';

  const current = meta.bblCurrentPortfolio;
  const adjusted = meta.bblAdjustedPortfolios;
  const wantsTopup = meta.bblRebalanceWithTopup;

  let ctx = `\n[PORTFOLIO VERIFICATION DATA]
Current Portfolio: ฿${(current.totalValueTHB ?? 0).toLocaleString()}`;

  current.holdings?.forEach((h) => {
    const perf = ASSET_PERFORMANCE[h.assetGroup];
    const retStr = perf
      ? `, 1Y Return: ${perf.returnPercent > 0 ? '+' : ''}${perf.returnPercent}%`
      : '';
    ctx += `\n- ${ASSET_GROUP_NAMES[h.assetGroup] || h.assetGroup}: ฿${(h.amountTHB ?? 0).toLocaleString()} (${h.weightPercent}%)${retStr}`;
  });

  if (adjusted && adjusted.length > 0) {
    adjusted.forEach((p, i) => {
      const isTopup = p.totalAdjustmentTHB > 0;
      const label = isTopup
        ? `Rebalance with Top-up ฿${p.totalAdjustmentTHB.toLocaleString()}`
        : 'Rebalance without Top-up';
      ctx += `\n\nAdjusted Portfolio Option ${i + 1} (${label}):`;
      ctx += `\nNew Total: ฿${p.totalValueTHB.toLocaleString()}`;
      p.holdings?.forEach((h) => {
        const adjTHB = h.adjustmentTHB ?? 0;
        const adj =
          adjTHB >= 0
            ? `+฿${adjTHB.toLocaleString()}`
            : `-฿${Math.abs(adjTHB).toLocaleString()}`;
        ctx += `\n- ${ASSET_GROUP_NAMES[h.assetGroup] || h.assetGroup}: ฿${(h.amountTHB ?? 0).toLocaleString()} (${h.weightPercent}%) [${adj}]`;
      });
    });
  }

  if (wantsTopup !== undefined) {
    ctx += `\n\nClient's Top-up Preference: ${wantsTopup ? 'Willing to top-up' : 'No top-up, rebalance only'}`;
  }

  ctx += `\n\n[EVALUATION INSTRUCTIONS - PORTFOLIO VERIFICATION]
- CRITICAL: Verify the advisor correctly states current portfolio composition. Any incorrect amounts, percentages, or asset group names should be penalized under Technical Product Knowledge.
- The advisor's rebalancing recommendation MUST match one of the adjusted portfolio options exactly. Any numerical differences in amounts, weights, or top-up values should be penalized under Recommendation Suitability.
- If the advisor recommends a top-up but the client prefers no top-up (or vice versa), note this mismatch.`;

  return ctx;
}

// Generate BBL Advisory Technique assessment (replaces Sales Technique)
export const generateBBLAdvisoryTechnique = async (
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
    } = param;

    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    const prompt = getBBLAdvisoryTechniquePrompt(
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

    let techniqueData;
    try {
      techniqueData = parseResponse(response);
    } catch (error) {
      console.error('Failed to parse BBL advisory technique response:', error);
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in BBL advisory technique response',
      );
    }

    console.log('generateBBLAdvisoryTechnique techniqueData:', techniqueData);

    return techniqueData.advisoryTechnique;
  } catch (error) {
    console.error('Error generating BBL advisory technique assessment:', error);
    throw new HttpError(
      500,
      'BBL advisory technique assessment generation failed',
    );
  }
};

// Generate BBL Process Adherence assessment (replaces Product Knowledge)
export const generateBBLProcessAdherence = async ({
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
}: SalesFeedbackInput & { callback: LangChainCallbackHandler }) => {
  try {
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const prompt = getBBLProcessAdherencePrompt({
      characterName,
      language: getLanguageName(languageCode),
      evaluationFocus: product?.evaluationFocus?.join('\n'),
      productName: product?.name,
      productInformation: product?.knowledgePrompt,
      framework,
    });

    const conversationContext = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      callType,
      scenario,
      objectives: objectives.join('\n'),
      framework,
      transcript: conversationContext,
      productInfo,
    });

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: [callback],
    });

    let processData;
    try {
      processData = parseResponse(response);
    } catch (error) {
      console.error('Failed to parse BBL process adherence response:', error);
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in BBL process adherence response',
      );
    }

    return processData.processAdherence;
  } catch (error) {
    console.error('Error generating BBL process adherence assessment:', error);
    throw new HttpError(
      500,
      'BBL process adherence assessment generation failed',
    );
  }
};

// Job function for generating BBL advisory technique assessment (like generateSalesTechniqueJob)
export const generateBBLAdvisoryTechniqueJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting BBL advisory technique generation job for session: ${sessionId}`,
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
    if (session.roleplay.feedback?.advisoryTechnique) {
      console.log(
        `BBL advisory technique already exists for session: ${sessionId}`,
      );
      // Clear generating flag if data exists
      await session.updateOne({
        $set: { 'roleplay.feedback.advisoryTechniqueGenerating': false },
      });
      return;
    }

    // Mark as generating
    await session.updateOne({
      $set: { 'roleplay.feedback.advisoryTechniqueGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for BBL advisory technique assessment: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.advisoryTechniqueGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const callback = callbackHandler({
      userId: session.user?.toString(),
      sessionId: session.id,
      type: 'bbl_advisory_technique_assessment',
    });

    // Build portfolio context for portfolio review sessions
    const portfolioContext =
      session.callType === 'bbl-portfolio-review'
        ? buildPortfolioContext(session)
        : '';

    // Generate assessment
    const advisoryTechnique = await generateBBLAdvisoryTechnique({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives || [],
      framework,
      messages,
      characterName: session.persona?.name || 'Client',
      callback,
      languageCode,
      productInfo: portfolioContext,
      product: session.product,
      sessionId: session._id.toString(),
    });

    if (advisoryTechnique) {
      await session.updateOne({
        $set: {
          'roleplay.feedback.advisoryTechnique':
            JSON.stringify(advisoryTechnique),
          'roleplay.feedback.advisoryTechniqueGenerating': false,
        },
      });
      console.log(`BBL advisory technique generated for session: ${sessionId}`);
    } else {
      await session.updateOne({
        $set: { 'roleplay.feedback.advisoryTechniqueGenerating': false },
      });
    }
  } catch (error) {
    console.error('BBL advisory technique generation failed:', error);
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.advisoryTechniqueGenerating': false },
    }).catch(console.error);
  }
};

// Job function for generating BBL process adherence assessment (like generateProductKnowledgeJob)
export const generateBBLProcessAdherenceJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting BBL process adherence generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if assessment already exists
    if (session.roleplay.feedback?.processAdherence) {
      console.log(
        `BBL process adherence already exists for session: ${sessionId}`,
      );
      // Clear generating flag if data exists
      await session.updateOne({
        $set: { 'roleplay.feedback.processAdherenceGenerating': false },
      });
      return;
    }

    // Mark as generating
    await session.updateOne({
      $set: { 'roleplay.feedback.processAdherenceGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ createdAt: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for BBL process adherence assessment: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.processAdherenceGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const callback = callbackHandler({
      userId: session.user?.toString(),
      sessionId: session.id,
      type: 'bbl_process_adherence_assessment',
    });

    // Build portfolio context for portfolio review sessions
    const portfolioCtx =
      session.callType === 'bbl-portfolio-review'
        ? buildPortfolioContext(session)
        : '';

    // Generate assessment
    const processAdherence = await generateBBLProcessAdherence({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives || [],
      framework,
      messages,
      characterName: session.persona?.name || 'Client',
      callback,
      languageCode,
      productInfo: portfolioCtx,
      product: session.product,
    });

    if (processAdherence) {
      await session.updateOne({
        $set: {
          'roleplay.feedback.processAdherence':
            JSON.stringify(processAdherence),
          'roleplay.feedback.processAdherenceGenerating': false,
        },
      });
      console.log(`BBL process adherence generated for session: ${sessionId}`);
    } else {
      await session.updateOne({
        $set: { 'roleplay.feedback.processAdherenceGenerating': false },
      });
    }
  } catch (error) {
    console.error('BBL process adherence generation failed:', error);
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.processAdherenceGenerating': false },
    }).catch(console.error);
  }
};
