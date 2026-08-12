import { ChatPromptTemplate } from '@langchain/core/prompts';

// Define criteria for each section
export interface Criterion {
  id: string;
  text: string;
  description: string;
}

export interface SectionData {
  description: string;
  criteria: Criterion[];
}

export interface ManulifeSectionCriteria {
  introduction: SectionData;
  financialNeeds: SectionData;
}

export const MANULIFE_SECTION_CRITERIA: ManulifeSectionCriteria = {
  introduction: {
    description:
      'Evaluates the introduction to Manulife & Facts of Life presentation including company introduction and life stages discussion',
    criteria: [
      {
        id: 'introduction_greeting_thanks',
        text: 'Did the Advisor greet the prospect and thanked him/her for his/her time?',
        description:
          'Look for: Advisor greets the prospect professionally and thanks them for their time at the beginning of the session. FAIL if: No greeting, rude greeting, or fails to thank prospect for their time.',
      },
      {
        id: 'introduction_use_prospect_name',
        text: "Did the Advisor use the prospect's name when addressing the prospect?",
        description:
          "Look for: Advisor uses the prospect's name appropriately throughout the conversation to personalize the interaction. FAIL if: Rarely or never uses prospect's name during conversation.",
      },
      {
        id: 'introduction_self_introduction',
        text: 'Did the Advisor introduce him/herself as a Manulife Philippines Financial Advisor?',
        description:
          'Look for: Advisor clearly introduces themselves as a Manulife Philippines Financial Advisor. FAIL if: Unclear introduction, wrong company name, or missing role identification.',
      },
      {
        id: 'introduction_role_mention',
        text: 'Did the Advisor mention his/her role as a Manulife Philippines Financial Advisor?',
        description:
          'Look for: Advisor mentions and explains their role as a Manulife Philippines Financial Advisor. FAIL if: Does not mention or explain their role clearly.',
      },
      {
        id: 'introduction_company_csr',
        text: 'Did the Advisor provide a brief introduction of Manulife as a company and its Corporate Social Responsibility in the Philippines?',
        description:
          'Look for: Advisor mentions Manulife founded 1887 in Toronto, 36M customers worldwide, #1 market cap in Philippines since 1907, mission "Decisions made easier. Lives made better," and CSR initiatives supporting Filipino communities. FAIL if: Missing key company facts, no CSR mention, or incorrect company information.',
      },
      {
        id: 'introduction_life_stages',
        text: 'Did the advisor walked the client through the different life stages?',
        description:
          'Look for: Advisor explains and walks the client through different life stages as part of the presentation. FAIL if: Does not discuss life stages or provides incomplete explanation.',
      },
      {
        id: 'introduction_circle_of_life',
        text: 'Did the advisor clearly discuss the Circle of Life and the concept of 28,000 days?',
        description:
          'Look for: Advisor clearly explains the Circle of Life concept and the 28,000 days framework. FAIL if: Does not mention Circle of Life, unclear explanation, or missing 28,000 days concept.',
      },
      {
        id: 'introduction_hierarchy_financial_needs',
        text: 'When discussing the Hierarchy of Financial needs, did the advisor emphasize the importance of building a strong financial foundation through protection, life, and health coverage?',
        description:
          'Look for: When discussing Hierarchy of Financial Needs, advisor emphasizes the importance of building a strong financial foundation through protection, life, and health coverage. FAIL if: Does not emphasize financial foundation importance or missing protection/life/health coverage discussion.',
      },
      {
        id: 'introduction_disruptions_open_question',
        text: "When talking about life's DISRUPTIONS, did the advisor begin by asking an open-ended question related to death and/or sickness?",
        description:
          "Look for: When talking about life's DISRUPTIONS, advisor begins by asking an open-ended question related to death and/or sickness to engage the prospect. FAIL if: No open-ended question about disruptions, closed questions only, or does not address death/sickness topics.",
      },
      {
        id: 'introduction_disruptions_statistics',
        text: "When talking about life's DISRUPTIONS, did the advisor use the statistics to create a sense of urgency?",
        description:
          "Look for: When talking about life's DISRUPTIONS, advisor uses relevant statistics to create a sense of urgency about the need for protection. FAIL if: No statistics used, irrelevant statistics, or fails to create urgency around disruptions.",
      },
      {
        id: 'introduction_dreams_question',
        text: "When talking about DREAMS in life, did the advisor ask what the customers' dreams are for themselves and their loved ones?",
        description:
          "Look for: When talking about DREAMS in life, advisor asks what the customer's dreams are for themselves and their loved ones. FAIL if: Does not ask about dreams, too generic questions, or misses opportunity to explore personal aspirations.",
      },
      {
        id: 'introduction_dreams_statistics',
        text: 'When talking about DREAMS in life, did the advisor use the statistics to build awareness and encourage action?',
        description:
          'Look for: When talking about DREAMS in life, advisor uses statistics to build awareness and encourage action toward achieving those dreams. FAIL if: No statistics about dreams/goals, fails to build awareness, or does not encourage action.',
      },
    ],
  },

  financialNeeds: {
    description:
      'Evaluates the Financial Needs Analysis, Goal Guide completion, and proper conclusion of the session',
    criteria: [
      {
        id: 'financial_needs_income_replacement',
        text: 'Did the advisor ask the client how much household income would he/she want to replace when death occurs?',
        description:
          'Look for: Advisor asks specifically about how much household income the client would want to replace in case of death. FAIL if: Does not ask about income replacement, unclear question, or skips this critical financial planning step.',
      },
      {
        id: 'financial_needs_income_duration',
        text: 'Did the advisor ask the client how long would he/she want the income replacement to continue for?',
        description:
          'Look for: Advisor asks for the duration or time period the client would want the income replacement to continue for. FAIL if: Does not ask about duration, unclear timeframe questions, or incomplete income replacement planning.',
      },
      {
        id: 'financial_needs_protection_calculation',
        text: 'Did the advisor accurately determine the Income Protection need based on the projection table?',
        description:
          "Look for: Advisor uses Manulife FNA projection tables showing life insurance needs (e.g., ₱25K monthly income = ₱1.6M for 5-year or ₱3.2M for 10-year support) with 4% inflation and 3% conservative return assumptions. FAIL if: Wrong calculations, doesn't reference projection tables, or uses incorrect multipliers.",
      },
      {
        id: 'financial_needs_hospital_preference',
        text: "Did the advisor ask the client's preferred hospital from the list in case of a medical emergency or serious illness?",
        description:
          "Look for: Advisor asks for the client's preferred hospital from the provided list in case of medical emergency or serious illness. FAIL if: Does not ask about hospital preference, does not provide list options, or unclear about emergency medical planning.",
      },
      {
        id: 'financial_needs_health_emergency_fund',
        text: 'Did the advisor provide the customer of the recommended Health Emergency Fund, based on their hospital of choice?',
        description:
          "Look for: Advisor provides the customer with the recommended Health Emergency Fund amount based on their hospital of choice. FAIL if: Does not provide health emergency fund recommendation, wrong amount, or not based on customer's hospital selection.",
      },
      {
        id: 'financial_needs_health_fund_factors',
        text: 'When computing for the recommended Health Emergency Fund, did the advisor factor in 3-6 months worth of household income, and considered any other health or medical coverage the client may have? (eg. HMO)',
        description:
          'Look for: When computing the recommended Health Emergency Fund, advisor factors in 3-6 months worth of household income and considers any other health or medical coverage the client may have (e.g., HMO). FAIL if: Does not consider household income multiplier, ignores existing coverage, or incomplete health fund calculation.',
      },
      {
        id: 'financial_needs_child_education',
        text: "Did the advisor ask for the client's child's age and at which school they would like to send him/her to?",
        description:
          "Look for: Advisor asks for the client's child's age and which school they would like to send them to. FAIL if: Does not ask about children's education planning, missing age or school preference, or incomplete education needs assessment.",
      },
      {
        id: 'financial_needs_education_calculation',
        text: 'Based on the information provided by the client, did the advisor accurately determine the Education Fund needed based on the projection table?',
        description:
          'Look for: Based on information provided by the client, advisor accurately determines the Education Fund needed using the projection table. FAIL if: Incorrect education fund calculation, does not use projection table, or wrong education funding amount.',
      },
      {
        id: 'financial_needs_retirement_planning',
        text: "Did the advisor ask for the client's desired retirement age and pension?",
        description:
          "Look for: Advisor asks for the client's desired retirement age and pension expectations. FAIL if: Does not ask about retirement planning, missing retirement age or pension discussion, or incomplete retirement needs assessment.",
      },
      {
        id: 'financial_needs_retirement_calculation',
        text: 'Based on the information provided by the client, did the advisor accurately determine the Retirement Fund needed based on the projection table?',
        description:
          'Look for: Based on information provided by the client, advisor accurately determines the Retirement Fund needed using the projection table. FAIL if: Incorrect retirement fund calculation, does not use projection table, or wrong retirement funding amount.',
      },
      {
        id: 'financial_needs_coverage_needs',
        text: "Did the Advisor ask the coverage needed for each of the client's needs?",
        description:
          "Look for: Advisor asks about the coverage needed for each of the client's identified financial needs. FAIL if: Does not ask about coverage amounts, incomplete needs coverage discussion, or missing coverage assessment.",
      },
      {
        id: 'financial_needs_priorities',
        text: "Did the Advisor ask the client's financial needs priorities?",
        description:
          'Look for: Advisor asks the client to prioritize their financial needs to help guide the planning process. FAIL if: Does not ask about priorities, unclear prioritization discussion, or missing priority assessment.',
      },
      {
        id: 'financial_needs_client_profile',
        text: 'Did the Advisor ask the answers to the Client Profile Section?',
        description:
          'Look for: Advisor guides the client through the Client Profile Section questions. FAIL if: Does not complete client profile, missing profile questions, or incomplete client information gathering.',
      },
      {
        id: 'financial_needs_suitability_assessment',
        text: 'Did the Advisor guide the customer in answering the Client Suitability Assessment and explained the results?',
        description:
          'Look for: Advisor guides the customer through the Client Suitability Assessment and explains the results to them. FAIL if: Does not conduct suitability assessment, unclear explanation of results, or incomplete suitability process.',
      },
      {
        id: 'financial_needs_email_copy',
        text: 'Did the Advisor mention giving the customer a copy of the accomplished form to their email?',
        description:
          'Look for: Advisor mentions that they will send a copy of the accomplished form to the customer via email. FAIL if: Does not mention email copy, unclear about form delivery, or missing follow-up documentation.',
      },
      {
        id: 'financial_needs_schedule_meeting',
        text: 'Did the Advisor schedule a second meeting with the client?',
        description:
          'Look for: Advisor schedules a specific second meeting with the client for follow-up. FAIL if: Does not schedule follow-up meeting, vague meeting arrangements, or missing second meeting planning.',
      },
      {
        id: 'financial_needs_ask_referrals',
        text: 'Did the Advisor ask the prospect for referrals?',
        description:
          'Look for: Advisor asks the prospect for referrals to other potential clients. FAIL if: Does not ask for referrals, unclear referral request, or missing referral opportunity.',
      },
      {
        id: 'financial_needs_feedback_qr',
        text: 'Did the Advisor invite the client to scan the QR code to provide feedback on the presentation?',
        description:
          'Look for: Advisor invites the client to scan the QR code to provide feedback on the presentation. FAIL if: Does not mention QR code feedback, missing feedback invitation, or unclear feedback process.',
      },
    ],
  },
};

// Evaluation response interface
export interface ManulifeCriterionEvaluation {
  criteriaId: string;
  criteriaText: string;
  pass: boolean;
  evidence: string;
}

export interface ManulifeSectionEvaluation {
  sectionType: keyof ManulifeSectionCriteria;
  description: string;
  evaluations: ManulifeCriterionEvaluation[];
}

export interface ManulifeEvaluationResponse {
  sectionEvaluation: ManulifeSectionEvaluation;
}
const manulifeEvaluationPrompt = `You are an expert financial advisor coach specializing in Manulife Philippines Financial Needs Analysis (FNA) quality assurance. Your task is to evaluate a financial advisory roleplay transcript based on specific Manulife FNA guidelines for the {{sectionType}} section.

IMPORTANT: In the transcript, the user (financial advisor) is speaking with an AI character (the prospect). Focus exclusively on the advisor's performance in conducting the FNA process.

[SPEECH-TO-TEXT ARTIFACT HANDLING]
**CRITICAL: User messages are transcribed from speech-to-text (STT), so minor stylistic issues are likely due to this process. Do NOT flag these unless they fundamentally change the meaning or represent genuine process misinformation.**

- **COMMON STT ARTIFACTS TO IGNORE**: Number substitutions ("4" for "for", "2" for "to", "u" for "you"), missing spaces in compound words, capitalization variations, and punctuation inconsistencies should NOT be flagged as errors.
- **COMPANY NAME STT VARIATIONS TO IGNORE**: Minor variations in company names that are clearly STT artifacts (e.g., "Manulife" vs "Manu Life", missing spaces, capitalization differences) should NOT be flagged as errors.
- **PRONUNCIATION/NAME VARIATIONS TO IGNORE**: Do NOT flag pronunciation-related issues or proper-name formatting differences for company names (spacing, hyphenation, capitalization, or phonetic spellings caused by STT). Only flag if the identity changes (entirely different company) or if meaning is materially altered.
- **ONLY flag as genuine errors**: Factual mistakes about processes, calculations, requirements, or entirely wrong company names - NOT minor pronunciation or formatting variations.

[MANULIFE FNA FRAMEWORK CONTEXT]
The Manulife Financial Needs Analysis follows the iPLAN methodology:
- **i**dentify: Help clients identify financial needs and priorities
- **P**ropose: Suggest suitable financial solutions to address needs  
- **L**ay out: Create tailor-fit plans based on need, means, and risk profile
- **A**ssess: Track financial plans progress regularly
- **N**urture: Support plans until goals are realized

[COMPANY BACKGROUND REFERENCE]
**Manulife Global**: Founded 1887 Toronto, 36M customers worldwide, operates in 20+ countries
**Manulife Philippines**: Since 1907, #1 market capitalization Philippine Stock Exchange, 2M+ lives covered, 500+ insured companies
**Strategic Alliance**: Partnership with China Banking Corporation (founded 1920, 620+ branches) through MCBL
**Mission**: "Decisions made easier. Lives made better"
**Values**: Obsess about customers, Do the right thing, Think big, Get it done together, Own it, Share your humanity
**CSR**: 45+ offices nationwide, community investments supporting Filipino communities since 1907
**Services**: Life & Health, Long-Term Savings (Education/Retirement), Wealth & Asset Management

[PRESENTATION FRAMEWORK]
**Life Stages** (5 phases): Single Adult → Married → Young Family → Growing Family → Empty Nester/Golden Years
**Circle of Life**: 28,000 Days concept by Dr. Sankay Tolani showing income/work patterns across age groups (0-20, 21-40, 41-60, 61-80)
**Financial Hierarchy**: Foundation (Income Protection & Health via insurance) → Growth (Education, Retirement, Wealth via savings/investments)

[PHILIPPINE FINANCIAL STATISTICS]
Critical statistics advisors should reference to create urgency:
- **Savings Crisis**: Only 25% of households save regularly, savings last 6 months
- **Health Crisis**: 18-29 age group sick more frequently, 40%+ medical expenses out-of-pocket
- **Education Crisis**: 11M children not attending school (25% aged 5-24), only 25% who enter finish college  
- **Retirement Crisis**: 80% of 7.6M seniors (60+) lack retirement funds

[CALCULATION FRAMEWORKS - Philippine Peso (₱)]
**Income Protection**: Life insurance coverage based on household income replacement
- Examples: ₱25K monthly = ₱1.6M (5-year) or ₱3.2M (10-year) family support
- Covers: Debt settlement, household expenses, final hospital bills, funeral costs
- Assumptions: 4% yearly inflation, 3% conservative investment return

**Health Emergency Fund**: ₱2M standard, ₱3.5M premium hospital coverage
- Major illness costs: Heart attack ₱980K, Stroke ₱1.8M, Cancer ₱120K per chemo session  
- Adjustments: Deduct existing HMO, add 3-6 months income replacement during recovery
- Hospital tiers: Specific recommendations for NCR, Luzon, Visayas, Mindanao regions

**Education Planning**: Tuition projection tables with 6% annual increases
- Metro Manila universities: ₱47K-₱315K per semester (UST, Ateneo, De La Salle)
- Regional options across Luzon, Visayas, Mindanao with specific fee schedules
- International options: NUS Singapore, UCLA, University of Melbourne with peso conversions
- Usage: Determine years until college (typically age 18), select preferred school

**Retirement Planning**: Fund requirement matrices by retirement age (50-70) and desired monthly income (₱25K-₱400K)
- Examples: Retire at 50 with ₱25K monthly = ₱10.4M needed; at 70 = ₱3.2M needed
- Assumptions: 3% conservative return, fund depleted by age 80
- Context: Only 20% of Philippine seniors financially prepared

[INVESTMENT SOLUTIONS - UITF]
**Risk Profiles**: Conservative (Bond funds), Moderate (Balanced funds), Aggressive (Equity funds)
**Options**: BSP-regulated offshore funds with onshore, global, regional, country-specific categories

[CRITICAL RESTRICTIONS]
**FOCUS ON THE USER'S PERFORMANCE.** In the conversation transcript:
- Messages labeled with "user:" are from the financial advisor - EVALUATE THESE
- Messages labeled with "ai:" are from the prospect - USE FOR CONTEXT ONLY

**Do NOT evaluate the prospect's responses, but DO use them to understand the conversation flow and context.** 
Focus exclusively on analyzing how well the advisor met the specified criteria based on the full conversation context.

[EVALUATION SECTION]
Section: {{sectionType}}
Total Criteria: {{totalCriteria}}

[CRITERIA TO EVALUATE]
{{criteriaList}}

[ASSESSMENT INSTRUCTIONS]
For each criterion, provide a simple **Pass/Fail** assessment:

**Pass (true)**: The advisor clearly demonstrated or mentioned the required element
**Fail (false)**: The advisor failed to address or adequately demonstrate the required element  

[EVIDENCE REQUIREMENTS]
For each assessment, provide brief evidence from the transcript showing what the advisor said or did.

[MANDATORY CRITERIA]
Criteria marked with mandatory: true are critical requirements for the FNA process.

[STRICT JSON OUTPUT FORMAT]
{{
 "sectionEvaluation": {{
   "sectionType": "{{sectionType}}",
   "description": "string", // What this section measures
   "evaluations": [
     {{
       "criteriaId": "string",
       "criteriaText": "string",
       "pass": "boolean", // true/false for pass/fail
       "evidence": "string" // Brief evidence from transcript
     }}
   ]
 }}
}}`;

const userTemplate = `[FNA CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}  
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

Generate a {{sectionType}} section assessment based strictly on the advisor's adherence to Manulife FNA criteria. Output ONLY valid JSON using the exact format specified.

**Key Requirements:**
- **IGNORE STT ARTIFACTS**: Do NOT flag minor company name variations, capitalization differences, missing spaces, or pronunciation-based spellings that are clearly STT artifacts.
- Evaluate each criterion with pass: true/false
- Simple pass/fail assessment with evidence`;

export function getManulifeSectionPrompt({
  sectionType,
  language,
}: {
  sectionType: keyof ManulifeSectionCriteria;
  language?: string;
}) {
  const sectionData = MANULIFE_SECTION_CRITERIA[sectionType];

  if (!sectionData) {
    throw new Error(`Invalid section type: ${sectionType}`);
  }

  // Format criteria list for prompt
  const criteriaList = sectionData.criteria
    .map(
      (criterion, index) =>
        `${index + 1}. **${criterion.text}** (ID: ${criterion.id})
   Description: ${criterion.description}`,
    )
    .join('\n\n');

  let basePrompt = manulifeEvaluationPrompt
    .replaceAll('{{sectionType}}', sectionType)
    .replaceAll('{{totalCriteria}}', sectionData.criteria.length.toString())
    .replaceAll('{{criteriaList}}', criteriaList);

  let userPrompt = userTemplate.replaceAll('{{sectionType}}', sectionType);

  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE]
IMPORTANT: The output should be in ${language} language.`;
    userPrompt += `

[IMPORTANT] The assessment should be in ${language} language.`;
  }

  return {
    prompt: ChatPromptTemplate.fromMessages([
      ['system', basePrompt],
      ['user', userPrompt],
    ]),
    sectionData: {
      ...sectionData,
      description: sectionData.description,
    },
  };
}

// Helper functions
export function getManulifeAvailableSections(): Array<
  keyof ManulifeSectionCriteria
> {
  return Object.keys(MANULIFE_SECTION_CRITERIA) as Array<
    keyof ManulifeSectionCriteria
  >;
}

export function getManulifeTotalCriteria(
  sectionType: keyof ManulifeSectionCriteria,
): number {
  return MANULIFE_SECTION_CRITERIA[sectionType]?.criteria.length || 0;
}
