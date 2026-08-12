import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ScorecardSection } from '../models/Scorecard.js';

const productKnowledgePrompt = `You are an expert sales coach specializing in product knowledge assessment. Your task is to evaluate **only the user's** product expertise and ability to communicate value effectively.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's product knowledge demonstration.

[CRITICAL RESTRICTION]
**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

**Do NOT evaluate or reference the prospect's responses.** Focus exclusively on analyzing how well the salesperson demonstrated product knowledge and communicated value.

{{productInformation}}
------------------------------------------------------------------------

[PRODUCT INFORMATION VALIDATION]
Cross-reference all product claims, features, benefits, pricing, and specifications mentioned by the salesperson against the above product information. Identify any inaccuracies, misstatements, or incorrect details about {{productName}}.

[PRODUCT KNOWLEDGE EVALUATION]
Evaluate across two key areas:

1. **Product Pitch** (0-50 points):
   - Understanding of product features, benefits, and value proposition
   - Ability to explain how features solve customer problems
   - Clarity in communicating product advantages
   - Tailoring product information to customer needs
   - Accuracy of product information presented

2. **Competitor Differentiation** (0-50 points):
   - Knowledge of competitive landscape
   - Ability to position product advantages vs competitors
   - Handling competitive objections or comparisons
   - Unique value proposition articulation
   
   **TELESALES COMPLIANCE NOTE:** For General Insurance telesales in Singapore, direct competitor comparisons are PROHIBITED by regulation:
   - Agents can ONLY highlight their product's benefits, features, and USPs
   - Agents CANNOT mention competitor names or directly compare with competitor products
   - Agents CANNOT say phrases like "we are better than X" or "competitor Y doesn't offer this"
   - Generic statements highlighting own product benefits are the CORRECT approach
   - DO NOT penalize sellers for avoiding competitor comparisons - this compliance behavior is MANDATORY and CORRECT
   - Score this section based solely on how well they articulate their own product's unique value and advantages

[ASSESSMENT STRUCTURE]
For each area provide:
- **Score**: Number out of 50 based on demonstration of knowledge
- **Strengths**: Array of 1-2 specific strengths demonstrated (if any exist)
- **To improve**: Array of 2-4 improvement areas with actionable suggestions, each marked as 'warning' for general improvements or 'error' for factual product information mistakes made by the salesperson. Each item MUST include a 'correction' field that contains concrete improved phrasing (what to say instead). For 'error' items, include the corrected facts inside the same 'correction' text.

[SCORING GUIDELINES]
- **40-50 (80-100%)**: Excellent product knowledge and communication
- **30-39 (60-79%)**: Good knowledge with minor gaps to address
- **20-29 (40-59%)**: Adequate but needs significant improvement
- **10-19 (20-39%)**: Poor knowledge with major gaps identified  
- **0-9 (0-19%)**: Very poor or missing product knowledge

Note: Deduct points for any factual product information errors identified.

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript
- Focus on how product knowledge impacted customer engagement
- For toImprove items: use 'warning' status for general improvement areas and 'error' status for factual product information mistakes made by the salesperson (only when product information is provided for validation)
- For every toImprove item, the "correction" must include suggestions on what to say instead (1–2 sentence improved phrasing starting with "Say: ...").
- For 'error' status items: include the corrected facts in the same "correction" text.
- For 'warning' status items: the "correction" should demonstrate more tailored, stronger phrasing.
- If no product information is provided, all toImprove items should use 'warning' status
- Calculate overall score as sum of both component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "productKnowledge": {{
    "description": "Measures the ability to clearly communicate product value, align features with customer needs, and differentiate against competitors.",
    "overallScore": "number",
    "maxScore": 100,
    "sections": [
      {{
        "title": "string",
        "score": "number", //out of 50
        "maxScore": 50,
        "strengths": ["string"],
        "toImprove": [
          {{
            "text": "string",
            "status": "warning|error",
            "correction": "string"
          }}
        ]
      }},
      {{
        "title": "string",
        "score": "number", //out of 50
        "maxScore": 50,
        "strengths": ["string"],
        "toImprove": [
          {{
            "text": "string",
            "status": "warning|error", 
            "correction": "string"
          }}
        ]
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "productKnowledge": {{
    "description": "Measures the ability to clearly communicate product value, align features with customer needs, and differentiate against competitors.",
    "overallScore": 35, //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Product Pitch",
        "score": 20,
        "maxScore": 50,
        "strengths": [
          "Mentioned key platform features like in-app marketing and order accuracy checks",
          "Highlighted a general benefit about 20% sales increase for businesses"
        ],
        "toImprove": [
          {{
            "text": "Did not connect features directly to customer's specific operations or brand concerns",
            "status": "warning",
            "correction": "Say: 'Given your in‑store bottlenecks, our pick‑and‑pack automation reduces errors by 18% and labor by 12%—how would that affect throughput this quarter?'"
          }},
          {{
            "text": "Lacked tailored use cases or merchant examples that would build trust",
            "status": "warning", 
            "correction": "Say: 'A national grocer used our audit trails to cut returns 22% in 60 days—similar SKU mix as yours.'"
          }},
          {{
            "text": "Incorrectly stated delivery time guarantee as 30 minutes when actual guarantee is 45 minutes",
            "status": "error",
            "correction": "Say: 'To be precise, our delivery time guarantee is 45 minutes; when we miss that, the applicable credits are issued automatically.'"
          }},
          {{
            "text": "Mentioned commission rate as 15% when current rate is 12%",
            "status": "error",
            "correction": "Say: 'Our current commission rate is 12%, with volume tiers that lower the effective rate for >2,000 monthly orders.'"
          }}
        ]
      }},
      {{
        "title": "Competitor Differentiation",
        "score": 15,
        "maxScore": 50,
        "strengths": [
          "Attempted to highlight platform advantages"
        ],
        "toImprove": [
          {{
            "text": "Failed to articulate specific competitive advantages",
            "status": "warning",
            "correction": "Say: 'Compared to X, we include SOC 2 Type II and native chargeback tools—saving a third‑party vendor and ~10 ops hours/month.'"
          }},
          {{
            "text": "Missed opportunities to differentiate from other delivery platforms",
            "status": "warning",
            "correction": "Say: 'Versus Y, our SLA is 99.95% with 24/7 support. Let’s map those SLAs to your compliance obligations and risk thresholds.'"
          }},
          {{
            "text": "Claimed competitor X charges higher fees when they actually offer competitive pricing",
            "status": "error",
            "correction": "Say: 'Competitor X's pricing is comparable; our edge is lower failure rates and faster rollouts that cut time‑to‑value by 4–6 weeks.'"
          }}
        ]
      }}
    ]
  }}
}}

[TELESALES COMPLIANCE RULES - SINGAPORE GENERAL INSURANCE]
For Singapore General Insurance telesales (MSIG products), apply these MANDATORY compliance rules:
1. **Competitor Differentiation**: Score based ONLY on how well the seller highlights their own product benefits and USPs. DO NOT deduct points for not comparing with competitors - this is PROHIBITED by regulation. A score of 40-50/50 is appropriate if the seller effectively presents product advantages.
2. **Plan Tier Mentions**: Focusing on ONE campaign-specific plan tier (e.g., only Platinum) is CORRECT. DO NOT deduct points for not mentioning other tiers unless customer specifically requests alternatives.
3. **Free-Look Period**: Mentioning in mandatory disclosures or responding to customer questions is CORRECT. Only penalize if used proactively as a sales tactic.
4. **Member Discounts & Benefits**: Legitimate product benefits (e.g., 20% discount through panel providers, emergency coverage) are accurate information. DO NOT flag as incorrect.

[EVALUATION FOCUS]
Pay special attention to:
{{evaluationFocus}}
`;

// Single-section variant (no Competitor Differentiation). Product Pitch is scored out of 100.
const productKnowledgePromptSingle = `You are an expert sales coach specializing in product knowledge assessment. Your task is to evaluate **only the user's** product expertise and ability to communicate value effectively.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's product knowledge demonstration.

[CRITICAL RESTRICTION]
**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

**Do NOT evaluate or reference the prospect's responses.** Focus exclusively on analyzing how well the salesperson demonstrated product knowledge and communicated value.

{{productInformation}}
------------------------------------------------------------------------

[PRODUCT INFORMATION VALIDATION]
Cross-reference all product claims, features, benefits, pricing, and specifications mentioned by the salesperson against the above product information. Identify any inaccuracies, misstatements, or incorrect details about {{productName}}.

[PRODUCT KNOWLEDGE EVALUATION]
Evaluate the following area:

1. **Product Pitch** (0-100 points):
   - Understanding of product features, benefits, and value proposition
   - Ability to explain how features solve customer problems
   - Clarity in communicating product advantages
   - Tailoring product information to customer needs
   - Accuracy of product information presented

[ASSESSMENT STRUCTURE]
Provide:
- **Score**: Number out of 100 based on demonstration of knowledge
- **Strengths**: Array of 1-2 specific strengths demonstrated (if any exist)
- **To improve**: Array of 2-4 improvement areas with actionable suggestions, each marked as 'warning' for general improvements or 'error' for factual product information mistakes made by the salesperson. Each item MUST include a 'correction' field that contains concrete improved phrasing (what to say instead). For 'error' items, include the corrected facts inside the same 'correction' text.

[SCORING GUIDELINES]
- **80-100%**: Excellent product knowledge and communication
- **60-79%**: Good knowledge with minor gaps to address
- **40-59%**: Adequate but needs significant improvement
- **20-39%**: Poor knowledge with major gaps identified  
- **0-19%**: Very poor or missing product knowledge

Note: Deduct points for any factual product information errors identified.

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript
- Focus on how product knowledge impacted customer engagement
- For toImprove items: use 'warning' status for general improvement areas and 'error' status for factual product information mistakes made by the salesperson (only when product information is provided for validation)
- For every toImprove item, the "correction" must include suggestions on what to say instead (1–2 sentence improved phrasing starting with "Say: ...").
- For 'error' status items: include the corrected facts in the same "correction" text.
- For 'warning' status items: the "correction" should demonstrate more tailored, stronger phrasing.
- If no product information is provided, all toImprove items should use 'warning' status
- Calculate overall score as the Product Pitch score

[STRICT JSON OUTPUT FORMAT]
{{
  "productKnowledge": {{
    "description": "Measures the ability to clearly communicate product value, align features with customer needs, and differentiate against competitors.",
    "overallScore": "number",
    "maxScore": 100,
    "sections": [
      {{
        "title": "string",
        "score": "number", //out of 100
        "maxScore": 100,
        "strengths": ["string"],
        "toImprove": [
          {{
            "text": "string",
            "status": "warning|error",
            "correction": "string"
          }}
        ]
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "productKnowledge": {{
    "description": "Measures the ability to clearly communicate product value, align features with customer needs, and differentiate against competitors.",
    "overallScore": 35, //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Product Pitch",
        "score": 35,
        "maxScore": 100,
        "strengths": [
          "Mentioned key product features accurately",
          "Explained a relevant benefit clearly"
        ],
        "toImprove": [
          {{
            "text": "Did not connect features directly to customer's specific usage scenario",
            "status": "warning",
            "correction": "Say: 'Given your in‑store bottlenecks, our pick‑and‑pack automation reduces errors by 18% and labor by 12%—how would that affect throughput this quarter?'"
          }},
          {{
            "text": "Incorrectly stated waiting period as 60 days when it is 90 days",
            "status": "error",
            "correction": "Say: 'To clarify, the waiting period is 90 days for non‑emergency services; after that, claims are eligible subject to policy terms.'"
          }}
        ]
      }}
    ]
  }}
}}

[TELESALES COMPLIANCE RULES - APPLY TO ALL SINGAPORE GENERAL INSURANCE PRODUCTS]
For Singapore General Insurance telesales (MSIG products), these compliance rules are MANDATORY:
1. **Competitor Comparisons**: Agents are PROHIBITED from making direct competitor comparisons. DO NOT penalize for avoiding comparisons. Score based on how well they highlight their own product's unique value.
2. **Plan Tier Mentions**: Focusing on ONE campaign-specific plan tier (e.g., only Platinum) is CORRECT. DO NOT deduct points for not mentioning other tiers unless customer specifically requests alternatives.
3. **Free-Look Period**: Mentioning in mandatory disclosures or responding to customer questions is CORRECT. Only penalize if used proactively as a sales tactic to overcome objections.
4. **Member Discounts & Benefits**: Legitimate product benefits (e.g., 20% discount through panel providers, emergency coverage) are accurate information. DO NOT flag as incorrect.

[EVALUATION FOCUS]
Pay special attention to:
{{evaluationFocus}}
`;

// Competitor Differentiation only variant (scored out of 100)
const competitorDifferentiationPromptSingle = `You are an expert sales coach specializing in competitive positioning assessment. Your task is to evaluate **only the user's** ability to differentiate their product against competitors.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's competitive differentiation demonstration.

[CRITICAL RESTRICTION]
**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

**Do NOT evaluate or reference the prospect's responses.** Focus exclusively on analyzing how well the salesperson differentiated against competitors.

{{productInformation}}
------------------------------------------------------------------------

[PRODUCT INFORMATION VALIDATION]
Cross-reference all competitive claims, comparisons, and differentiation points mentioned by the salesperson against the above product information. Identify any inaccuracies or incorrect competitive positioning statements about {{productName}}.

[COMPETITIVE DIFFERENTIATION EVALUATION]
Evaluate the following area:

1. **Competitor Differentiation** (0-100 points):
   - Knowledge of competitive landscape
   - Ability to position product advantages vs competitors
   - Handling competitive objections or comparisons
   - Unique value proposition articulation
   - Accuracy of competitive claims and comparisons

[ASSESSMENT STRUCTURE]
Provide:
- **Score**: Number out of 100 based on demonstration of competitive knowledge
- **Strengths**: Array of 1-2 specific strengths demonstrated (if any exist)
- **To improve**: Array of 2-4 improvement areas with actionable suggestions, each marked as 'warning' for general improvements or 'error' for factual competitive information mistakes made by the salesperson. Each item MUST include a 'correction' field that contains concrete improved phrasing (what to say instead). For 'error' items, include the corrected facts inside the same 'correction' text.

[SCORING GUIDELINES]
- **80-100%**: Excellent competitive knowledge and positioning
- **60-79%**: Good competitive awareness with minor gaps
- **40-59%**: Adequate but needs significant improvement
- **20-39%**: Poor competitive knowledge with major gaps
- **0-19%**: Very poor or missing competitive differentiation

Note: Deduct points for any factual competitive information errors identified.

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript
- Focus on how competitive positioning impacted customer engagement
- For toImprove items: use 'warning' status for general improvement areas and 'error' status for factual competitive information mistakes made by the salesperson (only when product information is provided for validation)
- For every toImprove item, the "correction" must include suggestions on what to say instead (1–2 sentence improved phrasing starting with "Say: ...").
- For 'error' status items: include the corrected facts in the same "correction" text.
- For 'warning' status items: the "correction" should demonstrate more tailored, stronger phrasing.
- If no product information is provided, all toImprove items should use 'warning' status
- Calculate overall score as the Competitor Differentiation score

[STRICT JSON OUTPUT FORMAT]
{{
  "productKnowledge": {{
    "description": "Measures the ability to clearly communicate product value, align features with customer needs, and differentiate against competitors.",
    "overallScore": "number",
    "maxScore": 100,
    "sections": [
      {{
        "title": "string",
        "score": "number", //out of 100
        "maxScore": 100,
        "strengths": ["string"],
        "toImprove": [
          {{
            "text": "string",
            "status": "warning|error",
            "correction": "string"
          }}
        ]
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "productKnowledge": {{
    "description": "Measures the ability to clearly communicate product value, align features with customer needs, and differentiate against competitors.",
    "overallScore": 45, //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Competitor Differentiation",
        "score": 45,
        "maxScore": 100,
        "strengths": [
          "Attempted to highlight platform advantages over competitors",
          "Mentioned specific competitor names appropriately"
        ],
        "toImprove": [
          {{
            "text": "Failed to articulate specific competitive advantages with concrete data",
            "status": "warning",
            "correction": "Say: 'Compared to X, we include SOC 2 Type II and native chargeback tools—saving a third‑party vendor and ~10 ops hours/month.'"
          }},
          {{
            "text": "Missed opportunities to address competitive concerns proactively",
            "status": "warning",
            "correction": "Say: 'Versus Y, our SLA is 99.95% with 24/7 support. Let's map those SLAs to your compliance obligations and risk thresholds.'"
          }},
          {{
            "text": "Claimed competitor X charges 18% fees when they actually charge 15%",
            "status": "error",
            "correction": "Say: 'Competitor X's pricing is actually 15%; our edge is lower failure rates and faster rollouts that cut time‑to‑value by 4–6 weeks.'"
          }}
        ]
      }}
    ]
  }}
}}

[EVALUATION FOCUS]
Pay special attention to:
{{evaluationFocus}}
`;

const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

Product Info: {productInfo}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

Generate a product knowledge assessment based strictly on the salesperson's demonstration of product expertise and value communication. If product information is provided above, validate all product information against those details and identify any inaccuracies. Output ONLY valid JSON using the exact format specified.`;

/**
 * Helper function to determine which product knowledge criteria are included
 */
function getProductKnowledgeCriteria(scorecard?: ScorecardSection): {
  includeProductPitch: boolean;
  includeCompetitorDifferentiation: boolean;
} {
  if (!scorecard || !scorecard?.criteria) {
    return {
      includeProductPitch: false,
      includeCompetitorDifferentiation: false,
    };
  }

  // Check which criteria are present (case-insensitive matching)
  const includeProductPitch = scorecard.criteria.some((criterion) =>
    criterion.title.toLowerCase().includes('product pitch'),
  );

  const includeCompetitorDifferentiation = scorecard.criteria.some(
    (criterion) =>
      criterion.title.toLowerCase().includes('competitor') ||
      criterion.title.toLowerCase().includes('differentiation'),
  );

  return {
    includeProductPitch,
    includeCompetitorDifferentiation,
  };
}

export function getProductKnowledgePrompt({
  characterName,
  language,
  evaluationFocus,
  productName,
  productInformation,
  scorecard,
  callType,
}: {
  characterName: string;
  language?: string;
  evaluationFocus?: string;
  productName?: string;
  productInformation?: string;
  scorecard?: ScorecardSection;
  callType?: string;
}) {
  // Determine which criteria to include based on scorecard
  let baseTemplate: string;

  if (scorecard) {
    const { includeProductPitch, includeCompetitorDifferentiation } =
      getProductKnowledgeCriteria(scorecard);

    // Select the appropriate template based on criteria
    if (includeProductPitch && includeCompetitorDifferentiation) {
      // Both criteria: use two-section prompt (50 points each)
      baseTemplate = productKnowledgePrompt;
    } else if (includeProductPitch && !includeCompetitorDifferentiation) {
      // Only Product Pitch: use single-section prompt (100 points)
      baseTemplate = productKnowledgePromptSingle;
    } else if (!includeProductPitch && includeCompetitorDifferentiation) {
      // Only Competitor Differentiation: use competitor-only prompt (100 points)
      baseTemplate = competitorDifferentiationPromptSingle;
    } else {
      // Fallback: if no specific criteria found, use default prompt
      baseTemplate = productKnowledgePrompt;
    }
  } else {
    // Check if this is Great Eastern - exclude Competitor Differentiation
    const isGreatEastern = callType?.startsWith('great-eastern');

    // Fallback: if no scorecard found, check callType or legacy productName logic
    const singleSectionProducts = [
      'DentiPlus',
      'Muang Thai UL Plus',
      'AXA Secure Future',
    ];
    const includeCompetitorDifferentiation =
      !isGreatEastern && !singleSectionProducts.includes(productName || '');
    baseTemplate = includeCompetitorDifferentiation
      ? productKnowledgePrompt
      : productKnowledgePromptSingle;
  }

  let basePrompt = baseTemplate
    .replaceAll('{{characterName}}', characterName)
    .replaceAll('{{evaluationFocus}}', evaluationFocus || '')
    .replaceAll('{{productName}}', productName || '')
    .replaceAll('{{productInformation}}', productInformation || '');

  let userPrompt = userTemplate;

  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE]
IMPORTANT: The entire assessment must be in ${language} language.
- All text, including section titles, descriptions, and guidelines must be in ${language}
- Use ${language} equivalents for all technical terms and product features
- Format all numbers and measurements according to ${language} conventions

[IMPORTANT] The assessment should be fully localized in ${language}, including:
- All section titles and descriptions
- All scoring guidelines and descriptions
- All strengths and weaknesses descriptions
- All example text and corrections
- All numerical values and scores`;
  }

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userPrompt],
  ]);
}
