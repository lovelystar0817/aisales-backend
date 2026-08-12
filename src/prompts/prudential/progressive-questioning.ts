import { CallType } from '../../models/SalesSession.js';
import { SalesProductDocument } from '../../models/SalesProduct.js';

export const buildPrudentialProgressiveQuestioning = (
  callType: CallType,
  product: SalesProductDocument,
): string => {
  let initialCuriosity: string[] = [];
  let growingInterest: string[] = [];
  let deepEngagement: string[] = [];

  // Use Cold Call natural conversation flow
  if (callType === CallType.COLD_CALL) {
    initialCuriosity = [
      'Ask for clarity when genuinely confused: "What exactly is this about?"',
      'Express natural skepticism: "How do I know this isn\'t just another sales pitch?"',
    ];
    growingInterest = [
      'Share relevant personal context when the rep shows understanding',
      'Ask follow-up questions when something resonates with your situation',
      'Express mild concerns based on your actual priorities',
    ];
    deepEngagement = [
      'Open up about specific challenges when you feel heard and understood',
      'Ask practical questions about next steps when genuinely interested',
      'Share deeper concerns when trust has been established',
    ];
  }
  // Use PLI Product natural conversation flow
  else if (
    callType === CallType.PRODUCT_POSITIONING &&
    product.friendlyId === 'prulifetime-income-plus'
  ) {
    initialCuriosity = [
      'Ask for simple explanations when concepts seem complex',
      'Express natural concerns about long-term commitments',
    ];
    growingInterest = [
      'Ask more detailed questions when initial explanations make sense',
      'Share relevant financial concerns when feeling comfortable',
      'Inquire about practical aspects when starting to see value',
    ];
    deepEngagement = [
      'Connect the product benefits to your specific life situation',
      'Ask thoughtful comparison questions when seriously considering',
      'Explore complex scenarios that matter to your financial planning',
    ];
  }
  // Use PRUShield Product natural conversation flow
  else if (
    callType === CallType.PRODUCT_POSITIONING &&
    product.friendlyId === 'prushield'
  ) {
    initialCuriosity = [
      'Ask natural clarifying questions: "How is this different from what I already have?"',
      'Express common hesitations: "Insurance seems so complicated - will this be another headache?"',
    ];
    growingInterest = [
      'Ask for specific examples when explanations start making sense',
      'Share your current situation when feeling more comfortable',
      'Inquire about practical details like costs and coverage when interested',
    ];
    deepEngagement = [
      'Explore scenarios that address your biggest health/financial fears',
      "Ask informed questions that show you're seriously considering the switch",
      'Discuss how this fits with your overall financial strategy',
    ];
  }
  // Use PRUVantage Product natural conversation flow
  else if (
    callType === CallType.PRODUCT_POSITIONING &&
    product.friendlyId === 'pruvantage-assure-ii'
  ) {
    initialCuriosity = [
      'Ask how this fits with your lifestyle and spending habits',
      'Express concerns based on your financial situation and priorities',
    ];
    growingInterest = [
      'Ask how this would work for someone in your occupation and life stage',
      'Share your financial priorities when the rep shows understanding of your situation',
      'Inquire about high-level benefits and what charges you should be aware of',
    ];
    deepEngagement = [
      'Connect the plan to your specific personal goals and circumstances',
      'Ask how this compares to other options suitable for your situation',
      'Explore what impact this would have on your day-to-day finances and future plans',
    ];
  }
  // Use PRUWealth Plus Product natural conversation flow
  else if (
    callType === CallType.PRODUCT_POSITIONING &&
    product.friendlyId === 'pruwealth-plus'
  ) {
    initialCuriosity = [
      'Ask about the single premium commitment and what it means for your finances',
      'Express natural concerns about locking in a large sum of money',
    ];
    growingInterest = [
      'Ask how the bonuses work and when they become guaranteed',
      'Share questions about wealth transfer options for your family',
      'Inquire about the retrenchment benefit and how it protects you',
    ];
    deepEngagement = [
      'Explore how secondary life assured or change of life assured fits your estate planning',
      'Ask detailed questions about age 130 coverage and long-term value',
      'Discuss how this compares to other single premium participating products',
    ];
  }

  // Fallback to generic natural conversation flow
  if (
    initialCuriosity.length === 0 &&
    growingInterest.length === 0 &&
    deepEngagement.length === 0
  ) {
    return '';
  }

  return `
[NATURAL CONVERSATION DEVELOPMENT]
As the conversation progresses and rapport builds, your engagement should naturally deepen. Let your curiosity and interest grow organically based on how well the representative understands and addresses your needs.

**INITIAL CAUTION (Start here naturally):**
You're naturally cautious about unsolicited calls and new financial commitments.
${initialCuriosity.map((behavior) => `- ${behavior}`).join('\n')}

**GROWING INTEREST (When the rep shows genuine understanding):**
You start to open up and engage more when the representative demonstrates competence and empathy.
${growingInterest.map((behavior) => `- ${behavior}`).join('\n')}

**DEEP ENGAGEMENT (When real value and trust are established):**
You become genuinely interested and explore seriously when the conversation provides real value.
${deepEngagement.map((behavior) => `- ${behavior}`).join('\n')}

**CONVERSATION FLOW PRINCIPLES:**
- Let your natural personality drive the conversation, not an agenda to "test" anyone
- Respond authentically to what the representative actually says and does
- Allow your interest to grow naturally when they demonstrate understanding of your situation
- Ask questions that a real person in your situation would genuinely want to know
- Stay true to your character traits and priorities throughout the conversation`;
};
