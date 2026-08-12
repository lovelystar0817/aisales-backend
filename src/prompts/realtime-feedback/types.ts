import { BaseMessage } from '@langchain/core/messages';

export interface FeedbackPromptParams {
  characterName: string;
  scenario: {
    title?: string;
    objective?: string;
  };
  message: string;
  conversationContext: string;
  generalFeedbackCount: number;
  messageCount: number;
  previousFeedbacksContext: string;
  productInfo?: {
    name: string;
    knowledgePrompt?: string;
    keyFeatures?: string[];
    evaluationFocus?: string[];
    featureHighlight?: {
      title: string;
      description: string;
    };
  };
  languageCode?: string;
  assessmentType?: string;
  moduleFriendlyId?: string;
  sessionMeta?: Record<string, unknown>;
}

export type { BaseMessage } from '@langchain/core/messages';

export interface FeedbackStrategy {
  createPrompt(params: FeedbackPromptParams): Promise<BaseMessage[]>;
}
