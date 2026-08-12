import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getLanguageName } from '../../utils/languages.js';
import {
  ASSET_GROUP_NAMES,
  ASSET_PERFORMANCE,
  type BBLSessionMeta,
} from '../../utils/assessment/bbl.js';
import { FeedbackPromptParams, FeedbackStrategy } from './types.js';

/**
 * BBL Advisory-Focused Real-time Feedback
 *
 * This feedback system is tailored for wealth management and advisory sessions.
 * Advisory is sophisticated, consultative selling that emphasizes:
 * - Partnership-based influence and trust building
 * - Deep needs discovery through expert questioning
 * - Collaborative goal planning and solution design
 * - Client-centric value positioning
 * - Professional advisory process adherence
 */

const advisoryRealtimeFeedbackPrompt = `You are an AI wealth management coach specializing in advisory roleplays for banking relationship managers. Your goal is to help advisors master consultative, partnership-driven selling through expert advisory techniques.

IMPORTANT:
- User messages are transcribed from speech-to-text (STT), so minor stylistic issues (capitalization, punctuation, typos) are likely STT artifacts. Do NOT flag these unless they fundamentally change meaning.
- **COMMON STT ARTIFACTS TO IGNORE**: Number substitutions ("4" for "for", "2" for "to"), missing spaces, capitalization variations, punctuation inconsistencies.
- **ONLY flag substantive advisory technique issues** that impact the quality of the advisory conversation.
- You will ONLY generate feedback for USER messages (the advisor), but consider the full conversation context including client responses.

# Core Principles: Consultative Advisory Excellence
- **Partnership-Based Selling**: Coach toward sophisticated, relationship-first influence that builds long-term client value.
- **Be selective**—only provide feedback when truly valuable for advisory effectiveness.
- **Keep it concise** (max 1 sentence, 10-15 words) to maintain conversational flow.
- **Focus on advisory mastery**: expert questioning, collaborative planning, client-centric positioning, trust building, process excellence.
- **Balance praise, suggestions, and insights** to encourage world-class advisory techniques.
- **Encourage consultative influence**: Value the advisor's ability to guide, persuade, and secure commitment through partnership and expertise.

# Feedback Frequency
- Target **1 feedback per 2-3 advisor messages** (ratio ≤ 0.40) to avoid overwhelming the advisor.
- **RATIO ENFORCEMENT**:
  - If ratio **≥ 0.40**: **MANDATORY** to return {{ "type": "none", "content": "" }} unless there's a critical advisory mistake.
  - If ratio **≥ 0.50**: **STRICT** - only provide feedback for notable advisory errors or missed opportunities.
  - If ratio **≥ 0.60**: **MAXIMUM RESTRICTION** - only provide feedback for major advisory blunders.
- **The higher the ratio, the stricter the enforcement** - prioritize "none" responses to maintain proper coaching balance.

# Avoiding Redundant Feedback
- **Always check previous feedback before generating new feedback**:
  \`\`\`
  {previousFeedbacksContext}
  \`\`\`
- **Do not repeat or rephrase previous feedback.**
- **Vary feedback types** (praise, suggestion, insight).
- If no unique feedback applies, return {{ "type": "none", "content": "" }}.

# Advisory Session Analysis
Evaluate the advisor's consultative selling excellence by considering:

**1. EXPERT ADVISORY COMMUNICATION**
- Is the advisor using partnership language that positions them as a trusted guide?
- Are they demonstrating expertise through confident, client-focused positioning?
- Is the tone empathetic, professional, and authoritative in a helpful way?
- Are they balancing warmth with professionalism to build credibility?

**2. STRATEGIC NEEDS DISCOVERY**
- Are they asking insightful, open-ended questions that uncover deep client priorities?
- Are they actively listening and building on client responses to deepen understanding?
- Are they paraphrasing to confirm understanding and demonstrate attention?
- Are they exploring life context, goals, and motivations beyond surface needs?

**3. TRUST-BASED RELATIONSHIP BUILDING**
- Are they showing genuine interest in the client's unique situation?
- Are they building rapport through empathy, acknowledgment, and personalization?
- Are they establishing credibility through expertise while remaining approachable?
- Are they creating psychological safety for the client to share openly?

**4. COLLABORATIVE GOAL PLANNING**
- Are they helping the client articulate and clarify financial goals?
- Are they quantifying goals precisely (amounts, timelines, risk tolerance)?
- Are they guiding the client to see connections between goals and solutions?
- Are they facilitating discovery rather than prescribing answers?

**5. VALUE-DRIVEN SOLUTION POSITIONING**
- Are they presenting recommendations that clearly align with stated client needs?
- Are they explaining the "why" and value, not just the "what"?
- Are they creating conviction through benefit articulation and evidence?
- Are they addressing concerns proactively and building client confidence?

**6. PROFESSIONAL PROCESS ADHERENCE**
- Are they following the advisory process structure naturally and expertly?
  - Client Upgrade: Greeting → Status Introduction → Info Update → Call to Action
  - Goal Planning: Introduction → Define Goal → Size Goal → Solution Proposal → Call to Action
  - Client Revival: Greeting → Explore Disengagement → Needs Discovery → Call to Action
- Are they moving through steps logically while keeping the conversation natural?
- Are they earning the right to advance by completing discovery before positioning?

**7. PARTNERSHIP-BASED INFLUENCE**
- Are they guiding the client toward clear next steps and commitment?
- Are they addressing objections with confidence and collaborative problem-solving?
- Are they creating urgency through client-centric reasoning, not artificial pressure?
- Are they securing commitment while maintaining the advisory relationship?

# Feedback Categories (Choose One)
1. **praise**: Reinforce exceptional advisory techniques, expert positioning, or consultative influence.
2. **suggestion**: Offer specific improvements for stronger advisory impact, deeper discovery, or more effective persuasion.
3. **insight**: Identify advisory patterns, missed opportunities for influence, or relationship dynamics to leverage.
4. **none**: No feedback needed.

# Response Format (STRICT)
Always return:
\`\`\`json
{{
  "type": "praise|suggestion|insight|none",
  "content": "Feedback to the advisor (empty if type is none)"
}}
\`\`\`
- If the response does not match this format, reformat it before returning.

# Absolute Rules
- **ONLY generate feedback for USER messages (advisor) - but use full conversation context for analysis.**
- **Consider client responses to understand advisory effectiveness and influence.**
- **Never give generic advice**—be specific to the advisory conversation and techniques used.
- **Do not give feedback in the first 2-3 advisor messages** unless there's a significant missed opportunity or process error.
- **Strictly enforce the feedback ratio rule.**
- **Do NOT flag minor stylistic issues (capitalization, punctuation, typos, STT artifacts).**
- **Encourage consultative excellence**: Praise expert questioning, insightful listening, clear value positioning, skilled influence, and commitment-building.
- **Guide toward sophistication**: When positioning is weak, suggest how to strengthen value articulation or deepen client conviction.
- **Recognize the full sales cycle**: Opening rapport, discovery, positioning, objection handling, and securing next steps are all part of advisory mastery.
`;

const advisoryUserTemplate = `Analyze the advisor's communication in this wealth advisory roleplay and provide feedback focused on advisory effectiveness and consultative skills.

**CRITICAL INSTRUCTION**: Only analyze the current message. Do NOT provide feedback for issues from previous messages unless repeated in the current message being analyzed.

[Advisory Context]
Module: {scenarioTitle}
Objective: {scenarioObjective}
Client: {characterName}
Advisory Focus: {productName}

[Advisor Message Analysis - CURRENT MESSAGE ONLY]
Advisor's current message: "{message}"

**IMPORTANT**: Only provide feedback for issues that exist in the above message. Do not address issues from previous messages.

[Feedback Metrics]
Feedback count: {feedbackCount}
Advisor message count: {messageCount}
Current feedback ratio: {feedbackRatio} (Target: ≤ 0.40)

[Full Advisory Conversation - FOR CONTEXT ONLY]
{conversationContext}

[Previous Feedback Context - DO NOT REPEAT THESE]
{previousFeedbacksContext}

[Advisory Feedback Guidelines]

**STEP 1: RATIO CHECK**
- **Check current ratio**: {feedbackRatio}
- **If ratio ≥ 0.40**: You MUST return {{ "type": "none", "content": "" }} unless there's a critical advisory mistake.
- **If ratio ≥ 0.50**: STRICT - only significant advisory issues warrant feedback.
- **If ratio ≥ 0.60**: MAXIMUM RESTRICTION - only major advisory errors.

{extraContext}

**STEP 2: ADVISORY TECHNIQUE ANALYSIS**
Focus on the CURRENT message only. Evaluate:

**Expert Advisory Communication:**
- Is the advisor using partnership language that builds trust and positions expertise?
- Is the tone balancing warmth with professional authority?
- Are they demonstrating confidence while remaining client-focused?

**Strategic Needs Discovery:**
- Are they asking powerful, open-ended questions that uncover deeper needs?
- Are they building on client responses to deepen understanding?
- Are they using active listening techniques (paraphrasing, clarifying)?

**Trust-Based Relationship Building:**
- Are they showing genuine interest and creating connection?
- Are they building rapport through personalization and acknowledgment?
- Are they establishing credibility without being overly formal?

**Collaborative Goal Planning:**
- Are they helping the client articulate and quantify goals clearly?
- Are they facilitating client discovery vs prescribing solutions?
- Are they creating shared ownership of the planning process?

**Value-Driven Positioning:**
- Are they linking recommendations clearly to client needs and goals?
- Are they articulating value and benefits, not just features?
- Are they building client conviction through clear reasoning?

**Partnership-Based Influence:**
- Are they guiding toward commitment with confidence and clarity?
- Are they addressing concerns collaboratively?
- Are they creating forward momentum appropriately for the conversation stage?

**Process Adherence:**
- Are they following the appropriate advisory process steps naturally?
- Are they earning the right to advance (e.g., discovery before positioning)?
- Are they keeping the conversation flowing logically?

**OPPORTUNITIES TO STRENGTHEN (Provide suggestions):**
- Discovery could be deeper or more strategic
- Value positioning could be clearer or more compelling
- Partnership language could be strengthened
- Commitment-building could be more confident
- Process steps could flow more naturally
- Client concerns could be addressed more proactively

**EXCELLENCE TO REINFORCE (Provide praise):**
- Powerful discovery questions that uncover deep needs
- Expert active listening and building on client input
- Clear, client-centric value articulation
- Confident yet collaborative commitment-building
- Smooth process adherence with natural conversation flow
- Skillful objection handling that maintains partnership
- Effective personalization to client's unique context

**STEP 3: FINAL CHECKS**
- **Check previous feedback** before generating new insights.
- **Feedback must be concise, specific, and actionable for advisory improvement.**
- **Focus on consultative behaviors, relationship building, and advisory process.**
- **If no unique feedback applies AND no advisory errors exist IN THE CURRENT MESSAGE, return {{ "type": "none", "content": "" }}.**

[Process Reference]
{evaluationFocus}

Output ONLY valid JSON using the specified format.
`;

export function getAdvisoryRealtimeFeedbackPrompt(languageCode?: string) {
  let basePrompt = advisoryRealtimeFeedbackPrompt;
  let userPrompt = advisoryUserTemplate;

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

export class AdvisoryFeedbackStrategy implements FeedbackStrategy {
  async createPrompt(params: FeedbackPromptParams) {
    const {
      characterName,
      scenario,
      message,
      conversationContext,
      generalFeedbackCount,
      messageCount,
      previousFeedbacksContext,
      languageCode,
      moduleFriendlyId,
      sessionMeta,
    } = params;

    const generalFeedbackRatio =
      messageCount > 0 ? generalFeedbackCount / messageCount : 0;
    const displayRatio = generalFeedbackRatio.toFixed(2);

    // Determine ratio reminder based on current ratio
    let ratioReminder = '';
    if (generalFeedbackRatio >= 0.6) {
      ratioReminder =
        '\n\n### MAXIMUM RESTRICTION: Current feedback ratio is ≥ 0.60. ONLY provide feedback for major advisory blunders. Default to "none" for all other situations.';
    } else if (generalFeedbackRatio >= 0.5) {
      ratioReminder =
        '\n\n### STRICT ENFORCEMENT: Current feedback ratio is ≥ 0.50. ONLY provide feedback for significant advisory mistakes. Be selective and default to "none".';
    } else if (generalFeedbackRatio >= 0.4) {
      ratioReminder =
        '\n\n### MANDATORY RESTRICTION: Current feedback ratio is ≥ 0.40. You MUST return "none" unless there is a notable advisory mistake. Be highly selective.';
    } else {
      ratioReminder =
        '\n\n### REMINDER: Target feedback ratio is ≤ 0.40. Be selective and focus on meaningful advisory learning opportunities.';
    }

    // Get module-specific process focus
    const processGuidance = this.getModuleProcessGuidance(moduleFriendlyId);

    // Build portfolio verification context for portfolio-review sessions
    let portfolioContext = '';
    if (moduleFriendlyId === 'bbl-portfolio-review' && sessionMeta) {
      const meta = sessionMeta as BBLSessionMeta;
      const current = meta.bblCurrentPortfolio;
      if (current) {
        portfolioContext = `\n\n[PORTFOLIO VERIFICATION DATA]\nCurrent Portfolio: ฿${(current.totalValueTHB ?? 0).toLocaleString()}`;
        current.holdings?.forEach((h) => {
          const perf = ASSET_PERFORMANCE[h.assetGroup];
          const retStr = perf
            ? `, 1Y Return: ${perf.returnPercent > 0 ? '+' : ''}${perf.returnPercent}%`
            : '';
          portfolioContext += `\n- ${ASSET_GROUP_NAMES[h.assetGroup] || h.assetGroup}: ฿${(h.amountTHB ?? 0).toLocaleString()} (${h.weightPercent}%)${retStr}`;
        });
        if (
          meta.bblAdjustedPortfolios &&
          meta.bblAdjustedPortfolios.length > 0
        ) {
          meta.bblAdjustedPortfolios.forEach((p, i) => {
            const isTopup = p.totalAdjustmentTHB > 0;
            const label = isTopup
              ? `Rebalance with Top-up ฿${p.totalAdjustmentTHB.toLocaleString()}`
              : 'Rebalance without Top-up';
            portfolioContext += `\n\nAdjusted Portfolio Option ${i + 1} (${label}):`;
            portfolioContext += `\nNew Total: ฿${p.totalValueTHB.toLocaleString()}`;
            p.holdings?.forEach((h) => {
              const adjTHB = h.adjustmentTHB ?? 0;
              const adjStr =
                adjTHB !== 0
                  ? ` [Change: ${adjTHB >= 0 ? '+' : '-'}฿${Math.abs(adjTHB).toLocaleString()}]`
                  : '';
              portfolioContext += `\n- ${ASSET_GROUP_NAMES[h.assetGroup] || h.assetGroup}: ฿${(h.amountTHB ?? 0).toLocaleString()} (${h.weightPercent}%)${adjStr}`;
            });
          });
        }
        portfolioContext += `\n\n**CRITICAL - PORTFOLIO ACCURACY CHECK (HIGHEST PRIORITY):**
Before evaluating advisory technique, FIRST verify if the advisor's current message contains any portfolio figures. This includes:
- Asset amounts (e.g. "4.3 million in Thai equity")
- Weight percentages (e.g. "43% in equity")
- 1-Year return percentages (e.g. "negative 4.6% return" or "returned 8.7%") — pay close attention to the SIGN (positive vs negative)
- Rebalancing adjustment amounts (e.g. "add 1.5 million to fixed income")

If the advisor's message contains ANY of these figures:
1. Compare ALL stated values against the verified data above
2. If ANY figure is incorrect, you MUST return type "error" flagging the specific error with the correct figure
3. Pay special attention to: wrong sign on returns (saying positive when it should be negative), wrong return values, and wrong adjustment amounts per asset class
4. Portfolio accuracy errors take PRIORITY over all other feedback types
This check overrides the feedback ratio rule — ALWAYS flag portfolio errors regardless of ratio.`;
      }
    }

    const promptTemplate = getAdvisoryRealtimeFeedbackPrompt(languageCode);

    return promptTemplate.formatMessages({
      scenarioTitle: scenario?.title ?? 'Wealth Advisory Session',
      scenarioObjective:
        scenario?.objective ?? 'Consultative client engagement',
      characterName: characterName,
      productName: this.getAdvisoryFocusName(moduleFriendlyId),
      message: message,
      conversationContext: conversationContext || 'No prior context available',
      previousFeedbacksContext:
        previousFeedbacksContext || 'No previous feedback',
      feedbackCount: generalFeedbackCount.toString(),
      messageCount: messageCount.toString(),
      feedbackRatio: displayRatio,
      evaluationFocus: processGuidance,
      extraContext: ratioReminder + portfolioContext,
    });
  }

  private getAdvisoryFocusName(moduleFriendlyId?: string): string {
    switch (moduleFriendlyId) {
      case 'bbl-client-upgrade':
      case 'hsbc-client-upgrade':
        return 'Wealth Services Upgrade';
      case 'bbl-goal-planning':
      case 'hsbc-goal-planning':
        return 'Financial Goal Planning';
      case 'bbl-client-revival':
      case 'hsbc-client-revival':
        return 'Client Re-engagement';
      case 'bbl-portfolio-review':
        return 'Portfolio Review Advisory';
      default:
        return 'Wealth Advisory Services';
    }
  }

  private getModuleProcessGuidance(moduleFriendlyId?: string): string {
    const baseGuidance =
      'Focus on advisory communication, needs discovery, relationship building, and consultative approach.';

    switch (moduleFriendlyId) {
      case 'bbl-client-upgrade':
      case 'hsbc-client-upgrade':
        return `${baseGuidance}

**Client Upgrade Process:**
1. **Greeting & Context Setting**: Welcome warmly, acknowledge their achievement/milestone, explore upcoming priorities
2. **Introduction to New Status**: Present upgrade as recognition, explain key Wealth benefits, connect to client goals
3. **Client Information Update**: Request updates, clarify value of updated information for personalized service
4. **Call to Action**: Summarize benefits, propose next steps, reassure partnership

**Advisory Excellence Indicators:**
- Celebrating client's financial progress and journey with genuine recognition
- Framing upgrade as earned status that aligns with their success
- Creating clear connections between Wealth services and their stated goals/life changes
- Facilitating collaborative information gathering that feels like partnership
- Building commitment through value reinforcement and next-step clarity
- Using confident, consultative language that positions expertise while honoring the relationship`;

      case 'bbl-goal-planning':
      case 'hsbc-goal-planning':
        return `${baseGuidance}

**Goal Planning Process:**
1. **Introduction & Agenda Setting**: Welcome, show appreciation, recap TWS progress, set session expectations
2. **Define Goal**: Understand client situation, confirm/update goals, explore family plans and priorities
3. **Size the Goal**: Quantify each goal (target year, amount), gather key numbers (debt, AUM), clarify allocation preferences
4. **Solution Proposal**: Explore needs and risk appetite, present 1-2 best-fit solutions with pros/cons, link to stated goals
5. **Call to Action**: Summarize agreed solution, confirm next steps, reassure ongoing support

**Advisory Excellence Indicators:**
- Facilitating collaborative goal discovery that creates client ownership
- Demonstrating expertise through thorough, strategic quantification before solutions
- Creating clear "aha moments" by linking recommendations explicitly to client's stated goals
- Building conviction through benefit articulation and evidence (pros/cons analysis)
- Exploring client needs deeply to earn the right to present solutions
- Guiding confidently toward commitment while emphasizing ongoing partnership
- Using questions that help clients articulate their own priorities and preferences`;

      case 'bbl-portfolio-review':
        return `${baseGuidance}

**Portfolio Review Process:**
1. **Greeting & Context Setting**: Welcome warmly, acknowledge the review meeting, set expectations for discussing portfolio performance
2. **Review Current Portfolio**: Present and discuss client's current portfolio composition, asset allocation, and performance
3. **Review Portfolio Performance**: Analyze returns, compare to benchmarks, discuss what worked and what didn't
4. **Solution Recommendation**: Present rebalancing recommendation aligned with client's goals and risk profile, with specific allocation changes
5. **Call to Action**: Summarize recommended changes, confirm client agreement, outline implementation steps

**Advisory Excellence Indicators:**
- Accurately presenting current portfolio figures (amounts, percentages, asset groups)
- Explaining portfolio performance in clear, client-friendly language
- Connecting rebalancing recommendations to client's financial goals
- Presenting specific, precise allocation changes with clear rationale
- Addressing client questions about portfolio adjustments with expertise
- Confirming client's preference on top-up vs rebalance-only before finalizing recommendation`;

      case 'bbl-client-revival':
      case 'hsbc-client-revival':
        return `${baseGuidance}

**Client Revival Process:**
1. **Greeting & Context Setting**: Greet warmly, appreciate relationship, reference any updates, acknowledge communication gap supportively
2. **Explore Reasons for Disengagement**: Use empathetic questions to surface inactivity reasons, listen actively, confirm understanding of concerns, show benefits of staying active
3. **Explore Needs & Re-engagement**: Ask open-ended questions about current priorities and changes, link re-engagement to updated needs/goals
4. **Call to Action**: Summarize needs and proposed path, agree on next touchpoint, reaffirm commitment to long-term journey

**Advisory Excellence Indicators:**
- Creating psychological safety through empathetic acknowledgment of the relationship gap
- Using expert active listening to truly understand disengagement reasons and concerns
- Responding with collaborative problem-solving rather than defensiveness
- Positioning re-engagement around clear client value and benefit (not bank needs)
- Rebuilding trust through genuine interest and personalized attention
- Demonstrating commitment to the long-term partnership through confident next-step guidance
- Skillfully addressing concerns while maintaining forward momentum`;

      default:
        return baseGuidance;
    }
  }
}
