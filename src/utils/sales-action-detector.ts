import { ChatAnthropic } from '@langchain/anthropic';
import { CallType } from '../models/SalesSession.js';
import {
  getSalesActions,
  type SalesAction,
} from '../constants/sales-actions.js';
import { CLAUDE_MODEL_HAIKU } from './constants.js';
import { z } from 'zod';

const aiDetectionSchema = z.object({
  detectedActions: z
    .array(
      z.object({
        actionId: z.string().describe('The ID of the detected action'),
        detected: z
          .boolean()
          .describe('Whether the action was detected in the message'),
        triggerText: z
          .string()
          .describe(
            'The specific phrase or sentence from the message that triggered the detection',
          ),
      }),
    )
    .describe('Array of detected actions from the message'),
});

export interface DetectedAction {
  action: SalesAction;
  confidence: number; // 0-1
  detectedAt: Date;
  triggerText: string; // The text that triggered the detection
  detectionMethod: 'keyword' | 'pattern' | 'ai'; // How it was detected
}

export interface ActionDetectionResult {
  detectedActions: DetectedAction[];
  allActions: SalesAction[];
  completedActionIds: string[];
}

export class SalesActionDetector {
  private callType: CallType;
  private actions: SalesAction[];
  private productId?: string;

  constructor(callType: CallType, productId?: string) {
    this.callType = callType;
    this.productId = productId;
    this.actions = getSalesActions(callType, productId);
  }

  /**
   * Detect completed sales actions from a user message
   */
  async detectActions(
    userMessage: string,
    previouslyCompletedActions: string[] = [],
  ): Promise<DetectedAction[]> {
    // Filter out meaningless messages
    const trimmedMessage = userMessage.trim();
    if (
      !trimmedMessage ||
      trimmedMessage === '...' ||
      trimmedMessage.length < 3
    ) {
      console.log(
        '[Action Detection] Skipping message - too short or meaningless:',
        trimmedMessage,
      );
      return [];
    }

    const messageText = trimmedMessage.toLowerCase();

    // Filter out already completed actions
    const pendingActions = this.actions
      .filter((action) => !previouslyCompletedActions.includes(action.id))
      .slice(0, 3); // Detect max from first 3 pending actions

    console.log(
      `[Action Detection] Processing ${pendingActions.length} actions`,
    );

    const detections: DetectedAction[] = [];
    const actionsNeedingAI: SalesAction[] = [];

    // First pass: Try pattern/keyword matching for all actions
    for (const action of pendingActions) {
      const detection = await this.detectSingleAction(
        action,
        userMessage,
        messageText,
      );
      if (detection) {
        detections.push(detection);
        console.log(
          `[Action Detection] ✅ "${action.title}" detected via ${detection.detectionMethod}`,
        );
      } else {
        // If pattern/keyword matching failed, add to AI batch
        actionsNeedingAI.push(action);
        console.log(
          `[Action Detection] ❌ "${action.title}" not detected via pattern/keyword, will try AI`,
        );
      }
    }

    // Second pass: Use AI detection for actions that pattern/keyword matching missed
    if (actionsNeedingAI.length > 0) {
      console.log(
        `[Action Detection] Pattern/keyword matching failed for ${actionsNeedingAI.length} actions, using AI fallback`,
      );
      const aiDetections = await this.detectActionsByAI(
        actionsNeedingAI,
        userMessage,
      );
      detections.push(...aiDetections);
    }

    console.log(`[Action Detection] Total detections: ${detections.length}`);
    return detections;
  }

  /**
   * Detect a single action using multiple methods (non-AI only)
   */
  private detectSingleAction(
    action: SalesAction,
    originalMessage: string,
    lowerMessage: string,
  ): DetectedAction | null {
    console.log('Scanning message:', lowerMessage);
    // Method 1: Keyword matching
    const keywordDetection = this.detectByKeywords(action, lowerMessage);
    if (keywordDetection) {
      return {
        action,
        confidence: keywordDetection.confidence,
        detectedAt: new Date(),
        triggerText: keywordDetection.triggerText,
        detectionMethod: 'keyword',
      };
    }

    // Method 2: Pattern matching
    const patternDetection = this.detectByPatterns(action, lowerMessage);
    if (patternDetection) {
      return {
        action,
        confidence: patternDetection.confidence,
        detectedAt: new Date(),
        triggerText: patternDetection.triggerText,
        detectionMethod: 'pattern',
      };
    }

    return null;
  }

  /**
   * Detect action by keyword matching
   */
  private detectByKeywords(
    action: SalesAction,
    message: string,
  ): { confidence: number; triggerText: string } | null {
    console.log(
      `[Action Detection] Detecting action ${action.title} using keywords: ${action.keywords}`,
    );
    const matches: string[] = [];

    for (const keyword of action.keywords) {
      // Escape special regex characters in keyword
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      if (regex.test(message)) {
        matches.push(keyword);
      }
    }

    if (matches.length === 0) return null;

    // Improved confidence calculation - require more matches for higher confidence
    // Base confidence starts lower and requires more evidence
    let confidence = 0.2 + matches.length * 0.1; // Start at 0.2, add 0.1 per match

    // Apply stricter thresholds for different action types
    if (action.category === 'opening') {
      // Opening actions need higher confidence since they're critical
      confidence = Math.max(confidence, 0.4); // Minimum 0.4 for opening actions

      // Special handling for professional greeting - require more than just "hello"
      if (action.id === 'professional_greeting') {
        const hasIntroduction = /\b(my name is|i am|i'm|this is|from)\b/i.test(
          message,
        );
        if (
          !hasIntroduction &&
          matches.length === 1 &&
          matches[0] === 'hello'
        ) {
          // Just "hello" alone is not enough for professional greeting
          console.log(
            `[Action Detection] "${action.title}" - "hello" alone is insufficient for professional greeting`,
          );
          return null;
        }
      }
    }

    // Cap maximum confidence for keyword matching
    confidence = Math.min(confidence, 0.7); // Max 0.7 for keyword matching

    const triggerText = matches.join(', ');

    console.log(
      `[Action Detection] "${action.title}" - keyword confidence: ${confidence}, matches: ${triggerText}`,
    );
    return { confidence, triggerText };
  }

  /**
   * Detect action by regex pattern matching
   */
  private detectByPatterns(
    action: SalesAction,
    message: string,
  ): { confidence: number; triggerText: string } | null {
    console.log(
      `[Action Detection] Detecting action ${action.title} using patterns: ${action.patterns}`,
    );
    for (const pattern of action.patterns) {
      try {
        const regex = new RegExp(pattern, 'i');
        const match = message.match(regex);

        if (match) {
          return {
            confidence: 0.8, // High confidence for pattern matches
            triggerText: match[0],
          };
        }
      } catch (error) {
        console.warn(
          `Invalid regex pattern for action ${action.id}: ${pattern}`,
        );
      }
    }

    return null;
  }

  /**
   * Batch AI detection for multiple actions in a single request
   */
  private async detectActionsByAI(
    actions: SalesAction[],
    message: string,
  ): Promise<DetectedAction[]> {
    const startTime = Date.now();
    try {
      const model = new ChatAnthropic({
        modelName: CLAUDE_MODEL_HAIKU,
        temperature: 0,
      }).withStructuredOutput(aiDetectionSchema);

      const actionsList = actions
        .map(
          (action) =>
            `- ${action.id}: "${action.title}" - ${action.description}`,
        )
        .join('\n');

      console.log(`[Action Detection] AI detecting actions:\n${actionsList}`);

      const actionsWithContext = actions.filter((action) => action.aiContext);
      const contextPrompt =
        actionsWithContext.length > 0
          ? `
Here is some additional context for specific actions:
${actionsWithContext
  .map(
    (action) => `
- For "${action.title}" (${action.id}): ${action.aiContext}`,
  )
  .join('')}
`
          : '';

      const prompt = `You are an expert sales conversation analyzer. Analyze the user's message to determine which of the sales actions were performed.

IMPORTANT GUIDELINES:
- Only detect actions that are CLEARLY and DEFINITIVELY performed in the message.
- Be conservative - when in doubt, do NOT detect the action.
- Consider the context and intent, not just keywords.
${contextPrompt}

Now, analyze the following message based on these examples and guidelines.

Actions to check:
${actionsList}

Sales Message: "${message}"

Return a JSON object with the detected actions. Be conservative in your analysis.`;

      const result = await model.invoke(prompt);
      const detections: DetectedAction[] = [];

      for (const detection of result.detectedActions) {
        if (detection.detected) {
          const action = actions.find((a) => a.id === detection.actionId);
          if (action) {
            // Calculate confidence based on action type and quality of detection
            let confidence = 0.6; // Base confidence for AI detection

            // Adjust confidence based on action category
            if (action.category === 'opening') {
              confidence = 0.65; // Slightly higher for opening actions
            } else if (action.category === 'closing') {
              confidence = 0.7; // Higher for closing actions as they're more definitive
            }

            // Adjust based on trigger text quality
            if (detection.triggerText && detection.triggerText.length > 10) {
              confidence += 0.05; // Bonus for detailed trigger text
            }

            confidence = Math.min(confidence, 0.8); // Cap at 0.8 for AI detection

            detections.push({
              action,
              confidence,
              detectedAt: new Date(),
              triggerText: detection.triggerText,
              detectionMethod: 'ai',
            });
          }
        }
      }

      const duration = Date.now() - startTime;
      console.log(
        `[AI Detection] Batch processed ${actions.length} actions in ${duration}ms, detected ${detections.length}:`,
      );
      console.log(detections);

      return detections;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[AI Detection] Error detecting actions after ${duration}ms:`,
        error,
      );
      return [];
    }
  }

  /**
   * Get all actions for the current call type
   */
  getAllActions(): SalesAction[] {
    return this.actions;
  }

  /**
   * Get actions by category
   */
  getActionsByCategory(category: SalesAction['category']): SalesAction[] {
    return this.actions.filter((action) => action.category === category);
  }

  /**
   * Calculate overall progress percentage
   */
  calculateProgress(completedActionIds: string[]): number {
    if (this.actions.length === 0) return 0;
    return Math.round((completedActionIds.length / this.actions.length) * 100);
  }

  /**
   * Get next suggested actions based on priority and completed actions
   */
  getNextSuggestedActions(
    completedActionIds: string[],
    limit: number = 3,
  ): SalesAction[] {
    const pendingActions = this.actions.filter(
      (action) => !completedActionIds.includes(action.id),
    );

    return pendingActions
      .sort((a, b) => a.priority - b.priority) // Lower priority number = higher priority
      .slice(0, limit);
  }
}

/**
 * Factory function to create detector instance
 */
export function createSalesActionDetector(
  callType: CallType,
  productId?: string,
): SalesActionDetector {
  return new SalesActionDetector(callType, productId);
}

/**
 * Utility function to merge detection results across multiple messages
 */
export function mergeDetectionResults(
  results: ActionDetectionResult[],
): ActionDetectionResult {
  const allDetectedActions: DetectedAction[] = [];
  const completedActionIds = new Set<string>();
  let allActions: SalesAction[] = [];

  for (const result of results) {
    allDetectedActions.push(...result.detectedActions);
    result.completedActionIds.forEach((id) => completedActionIds.add(id));
    if (result.allActions.length > allActions.length) {
      allActions = result.allActions;
    }
  }

  return {
    detectedActions: allDetectedActions,
    allActions,
    completedActionIds: Array.from(completedActionIds),
  };
}
