import { MessageDocument } from '../models/Message.js';
import { OPENAI_MODEL_GPT_4_1 } from './constants.js';
import { HttpError } from './errors.js';
import { parseResponse } from './json.js';
import { ChatOpenAI } from '@langchain/openai';
import { createRealtimeRoleplayFeedbackPrompt } from '../prompts/realtime-feedback/index.js';

export interface FeedbackResponse {
  type: 'praise' | 'suggestion' | 'insight' | 'warning' | 'error' | 'none';
  content: string;
}

export interface ProductInfo {
  name: string;
  knowledgePrompt?: string;
  keyFeatures?: string[];
  evaluationFocus?: string[];
  featureHighlight?: {
    title: string;
    description: string;
  };
}

export async function generateMessageFeedback({
  message,
  messages,
  characterName,
  scenario,
  productInfo,
  languageCode,
  assessmentType,
  moduleFriendlyId,
  sessionMeta,
}: {
  message: Omit<MessageDocument, '_id' | 'createdAt' | 'updatedAt'> | null;
  messages: MessageDocument[];
  characterName: string;
  scenario?: {
    title?: string;
    objective?: string;
  };
  productInfo?: ProductInfo;
  languageCode?: string;
  assessmentType?: string;
  moduleFriendlyId?: string;
  sessionMeta?: Record<string, unknown>;
}): Promise<FeedbackResponse | null> {
  // Skip feedback generation for AI messages - only analyze user messages
  if (!message || message.role !== 'user') {
    return null;
  }

  // Skip feedback generation for very short messages
  if (!message.content || message.content.length < 10) {
    return null;
  }

  try {
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    // Format conversation context with sliding window (last 15 messages)
    const CONTEXT_WINDOW = 15;
    const conversationContext = messages
      .slice(-CONTEXT_WINDOW)
      .filter((msg) => msg?.content)
      .map((msg) => {
        let text = `${msg.role === 'ai' ? characterName : 'User'} (Role: ${msg.role}): ${msg.content}`;
        if (msg.feedback) {
          text += ` (Received feedback: ${msg.feedback.content})`;
        }
        return text;
      })
      .join('\n\n');

    // Format previous feedback context (only feedback given to user messages)
    const previousFeedbacksContext = messages
      .filter((msg) => msg?.feedback && msg?.role === 'user')
      .map((msg) => {
        return `Feedback: ${msg.feedback?.content}`;
      })
      .join('\n');

    // Count only user messages for the ratio calculation
    const userMessageCount = messages.filter(
      (msg) => msg && msg.role === 'user',
    ).length;

    // Count only general feedback (excluding product corrections) for ratio calculation
    const generalFeedbackCount = messages.filter(
      (msg) =>
        msg?.feedback &&
        msg.role === 'user' &&
        msg.feedback.type !== 'error' &&
        msg.feedback.type !== 'warning',
    ).length;

    // Get the prompt template and format it
    const promptMessages = await createRealtimeRoleplayFeedbackPrompt({
      scenario: scenario ?? { title: '', objective: '' },
      characterName,
      message: message.content,
      conversationContext,
      generalFeedbackCount,
      messageCount: userMessageCount,
      previousFeedbacksContext,
      productInfo,
      languageCode,
      assessmentType,
      moduleFriendlyId,
      sessionMeta,
    });

    console.log({ promptMessages });

    const response: any = await model.invoke(promptMessages);

    let feedback;
    try {
      feedback = parseResponse(response);
      console.log({ feedback });
    } catch (error) {
      console.error('Failed to parse message feedback response:', error);
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in message feedback response',
      );
    }

    if (!feedback || feedback.type === 'none') {
      return null;
    }

    return {
      type: feedback.type,
      content: feedback.content,
    };
  } catch (error) {
    console.error('Error generating simple feedback:', error);
    return null;
  }
}
