import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getLanguageName } from '../../utils/languages.js';
import { FeedbackPromptParams, FeedbackStrategy } from './types.js';

/**
 * Sales-Focused Real-time Feedback
 *
 * This feedback system is tailored for traditional product sales sessions.
 * It emphasizes sales techniques, product knowledge, and deal progression.
 */

// SYSTEM PROMPT: Contains ALL rules, principles, and analysis instructions
// USER TEMPLATE: Contains ONLY context data and conversation information

const realtimeRoleplayFeedbackPrompt = `You are an expert AI sales coach for roleplay conversations. Your purpose is to analyze a salesperson's messages and provide targeted, concise feedback on two key areas:
1.  **Product Accuracy:** Validating claims against a provided knowledge base.
2.  **Sales Effectiveness:** Evaluating communication techniques and strategy.

### 1. Absolute Rules (Apply to ALL responses)
- **Output Format:** You MUST ONLY return a single, valid JSON object in the specified format. Do not add any text before or after the JSON.
- **Analyze User Messages Only:** Generate feedback exclusively for messages from the USER (the salesperson). Use the prospect's messages for context only.
- **Analyze Current Message Only:** Your feedback must pertain ONLY to errors or techniques observed in the single, current message provided for analysis. Do not re-evaluate past messages.
- **No Redundant Feedback:** Before generating new feedback, check the [Previous Feedback] context. Do NOT repeat or rephrase a point that has already been made.
- **Initial Grace Period:** Do not provide general sales feedback (praise, suggestion, insight) for the first 2 user messages to allow the conversation to develop naturally. This rule does NOT apply to critical product corrections (error, warning).

### 2. What to IGNORE (Critical STT & Style Rules)
Your analysis MUST ignore issues arising from Speech-to-Text (STT) transcription. DO NOT flag the following:
- **Common STT Artifacts:** Number substitutions ("4" for "for", "2" for "to"), missing spaces, capitalization/punctuation errors.
- **Product Name Variations:** Phonetic or structural variations (e.g., "Grab4Business" vs "Grab For Business", "UOP" vs "UOB").
- **Pronunciation & Proper Names:** Phonetic spellings or formatting differences for people or product names.
- **Minor Stylistic Issues:** Small typos or grammatical errors that do not change the meaning or indicate a factual product error.

### 3. Core Analysis Logic
Follow this sequence to determine the appropriate feedback.

**Step 1: Determine Analysis Path**
- **IF** [Product Knowledge] is provided: Proceed to **Step 2A**.
- **IF** [Product Knowledge] is NOT provided: Skip to **Step 2B**.

**Step 2A: Analysis WITH Product Knowledge**
This path has two priorities. Product accuracy is always the highest priority.

- **PRIORITY #1: Product Accuracy Check (Overrides Feedback Ratio)**
  - Scan the ENTIRE current message for any factual discrepancies against the [Product Knowledge] base.
  - **If you find factual mistakes** (wrong prices, features, terms): Generate an 'error' feedback. Correct ALL mistakes found in the current message within a single feedback response.
  - **If you find incomplete or misleading info**: Generate a 'warning' feedback. Provide the crucial missing details to add clarity.
  - Product corrections are MANDATORY and must always be generated, regardless of the feedback ratio.

- **PRIORITY #2: Sales Technique Check (Subject to Feedback Ratio)**
  - **AFTER** the product check, consider the sales technique.
  - Refer to the [Feedback Metrics] to enforce the feedback ratio for general feedback (praise, suggestion, insight).
  - **Ratio ≥ 0.50:** MANDATORY 'none' response unless a significant sales mistake is present.
  - **Ratio ≥ 0.60:** STRICTLY 'none' unless there's a major sales error.
  - **Ratio ≥ 0.75:** MAXIMUM RESTRICTION - only feedback for critical blunders.

**Step 2B: Analysis WITHOUT Product Knowledge**
- Focus **ENTIRELY** on sales effectiveness (rapport, questioning, objection handling, etc.).
- Do NOT generate 'error' or 'warning' types.
- Strictly enforce the feedback ratio as defined in **Priority #2** above. Be selective and aim for a ratio ≤ 0.50.

**Step 3: Select Feedback Type & Format Response**
- Based on your analysis, choose ONE feedback type: 'praise', 'suggestion', 'insight', 'warning', 'error', or 'none'.
- If no unique, valuable feedback is identified (and there are no product errors), you MUST return {{"type": "none", "content": ""}}.

### 4. Output Specification (Strictly Enforced)

**A. JSON Structure:**
\`\`\`json
{{
  "type": "praise|suggestion|insight|warning|error|none",
  "content": "Feedback to the user (empty if type is none)"
}}
\`\`\`

B. Content Formatting Rules by Type:
praise, suggestion, insight: Be concise. Maximum 2 sentences.
error, warning:
Start with a header: Correction: (for error) or Clarification: (for warning).
Use bullet points (•) for each distinct point.
Prioritize 1-2 concise, high-impact bullet points. Avoid 3 repetitive points.
Each bullet must provide unique, non-redundant information.
\`\`\``;

const userTemplate = `[Scenario Context]
- Scenario: {scenarioTitle}
- Objective: {scenarioObjective}
- Prospect: {characterName}
- Product: {productName}

[Product Knowledge]
{productKnowledge}

[Conversation History]
{conversationContext}

[Previous Feedback]
{previousFeedbacksContext}

---
[ANALYSIS TASK]

Analyze the following salesperson message based on the rules and context provided.

- Salesperson's Current Message: "{message}"

- Feedback Metrics:
  - Feedback Count: {feedbackCount}
  - Salesperson Message Count: {messageCount}
  - General Feedback Ratio: {feedbackRatio} (Target: ≤ 0.50)

{extraContext}
`;

export function getSalesRealtimeFeedbackPrompt(languageCode?: string) {
  let basePrompt = realtimeRoleplayFeedbackPrompt;
  let userPrompt = userTemplate;

  if (languageCode) {
    const language = getLanguageName(languageCode);
    basePrompt = `${basePrompt}

[LANGUAGE]
IMPORTANT: The 'content' field should be in ${language} language.`;
    userPrompt += `
[IMPORTANT] The feedback should be in ${language} language.`;
  }

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userPrompt],
  ]);
}

export class SalesFeedbackStrategy implements FeedbackStrategy {
  async createPrompt(params: FeedbackPromptParams) {
    const {
      characterName,
      scenario,
      message,
      conversationContext,
      generalFeedbackCount,
      messageCount,
      previousFeedbacksContext,
      productInfo,
      languageCode,
      assessmentType,
    } = params;

    const generalFeedbackRatio =
      messageCount > 0 ? generalFeedbackCount / messageCount : 0;
    const displayRatio = generalFeedbackRatio.toFixed(2);

    // Updated ratio reminder to be clearer about when product validation applies
    const hasDetailedKnowledge =
      productInfo?.knowledgePrompt &&
      productInfo.knowledgePrompt.trim().length > 0;

    // Determine ratio reminder based on knowledge availability and current ratio
    let ratioReminder = '';
    if (hasDetailedKnowledge) {
      if (generalFeedbackRatio >= 0.5) {
        ratioReminder =
          '\n\n### CRITICAL REMINDER: Current general feedback ratio is ≥ 0.50. Strongly prioritize using "none" for general sales feedback BUT always generate "error" or "warning" feedback for any product mistakes (product corrections override all ratio limits).';
      } else {
        ratioReminder =
          '\n\n### REMINDER: Detailed product knowledge is available. Always check for product accuracy first - product corrections must be generated regardless of feedback frequency.';
      }
    } else {
      if (generalFeedbackRatio >= 0.75) {
        ratioReminder =
          '\n\n### MAXIMUM RESTRICTION: Current feedback ratio is ≥ 0.75. ONLY provide feedback for major sales blunders or critical mistakes. Default to "none" for all other situations.';
      } else if (generalFeedbackRatio >= 0.6) {
        ratioReminder =
          '\n\n### STRICT ENFORCEMENT: Current feedback ratio is ≥ 0.60. ONLY provide feedback for significant sales mistakes. Be selective and default to "none".';
      } else if (generalFeedbackRatio >= 0.5) {
        ratioReminder =
          '\n\n### MANDATORY RESTRICTION: Current feedback ratio is ≥ 0.50. You MUST return "none" for general sales feedback unless there is a notable sales mistake. Be selective.';
      } else {
        ratioReminder =
          '\n\n### REMINDER: No detailed product knowledge available. Focus on sales techniques with standard feedback frequency rules (target ≤ 0.50).';
      }
    }

    // Add extra context per assessment type
    let extraContext = '';

    if (assessmentType === 'prudential') {
      extraContext =
        '\n\n### PRUDENTIAL SESSION SPECIAL INSTRUCTIONS:\n' +
        '**CRITICAL: This is a Prudential training session where users must follow specific verification scripts.**\n' +
        '- **DO NOT criticize introduction and verification processes** - Users are required to follow exact scripts for greeting, self-introduction, verification requests, and collecting client information\n' +
        '- **DO NOT flag scripted language as repetitive or unnatural** - Standard banking verification scripts are required for compliance\n' +
        '- **Focus feedback on**: Product knowledge accuracy, objection handling, relationship building after verification, and sales technique application\n' +
        '- **Avoid feedback on**: Greeting scripts, verification requests, asking for personal details, formal language during verification process\n' +
        '- **EXCEPTION**: Still provide product corrections when factual errors are present, regardless of script requirements';
    } else if (assessmentType === 'manulife') {
      extraContext =
        '\n\n### MANULIFE FNA SPECIAL INSTRUCTIONS:\n' +
        '**CRITICAL: FNA is for needs discovery, NOT product positioning.**\n' +
        '- **RED FLAG**: When advisor mentions specific products, features, or recommendations during needs analysis phase\n' +
        '- **FEEDBACK RULE**: Provide feedback: "Focus on needs discovery first. FNA is to uncover client needs - save product discussions for the follow-up meeting."\n' +
        '- **FNA PURPOSE**: Advisor should ask comprehensive questions about financial situation, goals, concerns, and gaps - NOT present solutions yet';
    } else if (assessmentType === 'manulife-goalready') {
      extraContext =
        '\n\n### MANULIFE GOALREADY SPECIAL INSTRUCTIONS:\n' +
        '**CRITICAL: This is a GoalReady PRODUCT PITCH session - advisors SHOULD present product features and benefits.**\n' +
        '- **EXPECTED BEHAVIOR**: Advisor should explain GoalReady features (long-term savings, retirement benefits, guaranteed returns, education funding, flexible premiums)\n' +
        "- **PRODUCT KNOWLEDGE FOCUS**: Validate accurate presentation of GoalReady value proposition, premium structure, and benefits for the customer's specific situation (retirement, child education, variable business income)\n" +
        '- **FAB FRAMEWORK**: Recognize when advisor uses Feature-Application-Benefit presentation (Feature → Application → Benefit to client)\n' +
        '- **OBJECTION HANDLING FOCUS**: Advisor should use Manulife-approved techniques for objection categories:\n' +
        '  • **NO Money**: "No budget", "Cost too high", "It\'s expensive"\n' +
        '  • **NO Time**: "I\'ll think it over", "Ask my spouse", "Maybe next year"\n' +
        '  • **NO Need**: "I\'m still young", "I don\'t need insurance"\n' +
        '  • **NO Trust**: "Been fooled before", "Times uncertain"\n' +
        '- **MANULIFE OBJECTION TECHNIQUES**: Recognize Feel-Felt-Found, Clarify-Agree-Present, Direct Questioning\n' +
        '- **CLOSING TECHNIQUES**: Encourage feedback when advisor uses Manulife closing techniques ("Your Obligation/Our Obligation", "You Can\'t Lose"), asks for commitment, or guides toward next steps\n' +
        '- **AVOID FEEDBACK ON**: Natural product presentation (this IS a product pitch, unlike FNA)\n' +
        "- **PROVIDE FEEDBACK WHEN**: Advisor misses objection handling opportunities, fails to use Manulife techniques, provides inaccurate product information, or doesn't attempt to close";
    } else if (
      assessmentType === 'aia-ko-opening-objection-call' ||
      assessmentType === 'aia-ko-product-pitch' ||
      assessmentType === 'aia-ko-end-to-end-outbound-call'
    ) {
      const feedbackLang = languageCode
        ? getLanguageName(languageCode)
        : 'Korean';
      const isKorean =
        !languageCode || languageCode === 'ko' || languageCode === 'ko-KR';
      const toneExamples = isKorean
        ? '- For praise: "잘하셨어요! ~한 부분이 인상적이었어요" rather than "The technique was adequate."\n' +
          '- For suggestions: "다음에는 ~해보시면 더 좋을 것 같아요!" rather than "You should improve X."\n'
        : '';
      extraContext =
        '\n\n### AIA KOREA SPECIAL INSTRUCTIONS:\n' +
        `**FEEDBACK TONE: Write as an encouraging sales coach — warm, supportive, motivating. Write feedback in ${feedbackLang}.**\n` +
        `- Use friendly, conversational ${feedbackLang} phrasing — NOT formal/clinical language.\n` +
        toneExamples +
        '- Acknowledge effort before suggesting improvement.\n' +
        '**KOREAN BUSINESS CULTURE:** Identifying as calling from a partner channel (Samsung Card, 삼성카드, XX카드, XX홈쇼핑, etc.) is a legitimate and professional opening in Korean telemarketing. Do NOT flag this as an error or suggest they should introduce differently.\n' +
        '- Affiliation-first openings are standard practice in Korean outbound calls.';
    } else if (
      assessmentType === 'axa-ph-recruitment' ||
      assessmentType === 'axa-ph-objection-handling'
    ) {
      extraContext =
        '\n\n### AXA PHILIPPINES SPECIAL INSTRUCTIONS:\n' +
        '**CRITICAL: This is an AXA Philippines recruitment/sales session. Recruiters follow official company scripts and present verified company information.**\n' +
        '- **Do NOT flag claims as errors or warnings simply because they are not explicitly listed in the Product Knowledge.** Only flag claims that directly contradict or misrepresent the provided facts.\n' +
        '- **Company background facts, industry awards, organizational details, commission structures, promotion systems, training infrastructure, and recognition programs mentioned by the recruiter should NOT be treated as errors** unless they directly contradict what is stated in the Product Knowledge.\n' +
        '- **Absence from the knowledge base does not mean inaccuracy** — recruiters have access to official company materials beyond what is summarized here.\n' +
        '- **Focus error/warning feedback on**: Claims that clearly contradict stated product facts (e.g., wrong product names, incorrect plan terms, misrepresented benefits).\n' +
        '- **Focus sales feedback on**: Recruitment techniques, rapport building, addressing prospect concerns, and call-to-action effectiveness.';
    }

    const productKnowledge = this.formatProductKnowledge(productInfo);
    const evaluationFocus = this.formatEvaluationFocus(productInfo);

    const promptTemplate = getSalesRealtimeFeedbackPrompt(languageCode);

    return promptTemplate.formatMessages({
      scenarioTitle: scenario?.title ?? 'Workplace conversation',
      scenarioObjective: scenario?.objective ?? 'Effective communication',
      characterName: characterName,
      productName: productInfo?.name ?? 'General Sales Discussion',
      productKnowledge,
      evaluationFocus,
      message: message,
      conversationContext: conversationContext || 'No prior context available',
      previousFeedbacksContext:
        previousFeedbacksContext || 'No previous feedback',
      feedbackCount: generalFeedbackCount.toString(),
      messageCount: messageCount.toString(),
      feedbackRatio: displayRatio,
      extraContext: ratioReminder + extraContext,
    });
  }

  private formatProductKnowledge(
    product?: FeedbackPromptParams['productInfo'],
  ) {
    if (!product) {
      return 'No product information provided. Focus on general sales techniques and communication skills only.';
    }

    // Check if we have substantial product knowledge
    const hasDetailedKnowledge =
      product.knowledgePrompt && product.knowledgePrompt.trim().length > 0;

    if (!hasDetailedKnowledge) {
      return `**Product: ${product.name}**\n\nNo detailed product knowledge available for fact-checking. Focus on general sales techniques and communication effectiveness only. Do not attempt to validate product claims.`;
    }

    let knowledge = `**Product: ${product.name}**\n\n**DETAILED PRODUCT KNOWLEDGE AVAILABLE** - Product validation required.\n\n`;

    if (product.knowledgePrompt) {
      knowledge += `${product.knowledgePrompt}\n\n`;
    }

    if (product.keyFeatures && product.keyFeatures.length > 0) {
      const features = product.keyFeatures
        .map((feature) => {
          if (typeof feature === 'string') {
            return '- ' + feature;
          }
          return '';
        })
        .join('\n');
      knowledge += '**Key Features:**\n' + features + '\n\n';
    }

    if (product.featureHighlight) {
      knowledge += `**Feature Highlight:**\n**${product.featureHighlight.title}**\n${product.featureHighlight.description}\n\n`;
    }

    return knowledge;
  }

  private formatEvaluationFocus(product?: FeedbackPromptParams['productInfo']) {
    // Only provide product-specific evaluation focus if we have detailed knowledge
    const hasDetailedKnowledge =
      product?.knowledgePrompt && product.knowledgePrompt.trim().length > 0;

    if (!hasDetailedKnowledge) {
      return 'No detailed product knowledge available. Focus on general sales effectiveness: rapport building, questioning techniques, objection handling, value articulation, closing techniques, and communication skills.';
    }

    if (!product?.evaluationFocus || product.evaluationFocus.length === 0) {
      return 'Focus on product accuracy, completeness of explanations, and general sales effectiveness.';
    }
    return product.evaluationFocus.join('\n');
  }
}
