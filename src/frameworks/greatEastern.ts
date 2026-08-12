import { FrameworkConfiguration } from './types.js';

/**
 * Great Eastern Fact Finding Framework
 * Stage 1: First meet up with cold prospect to conduct financial need analysis
 *
 * Evaluation Split:
 * - Soft skills (33%): Communication, Relationship Building, Adaptability, Customer Orientation
 * - Knowledge skills (33%): Verification, Fact Finding, Problem-Solving
 * - Financial Planning (33%)
 */
export const greatEasternFactFindConfiguration: FrameworkConfiguration = {
  base: {
    id: 'great-eastern-fact-find',
    friendlyId: 'great-eastern-fact-find',
    type: 'list',
  },

  localized: {
    en: {
      title: 'Fact Finding (Stage 1)',
      description:
        'Evaluation framework for conducting financial need analysis with cold prospects. First meet up to collect financial details, clarify goals, timeframes and risk comfort.',
      parts: [
        {
          title: 'Soft Skills',
          description:
            'Communication Skills (25%), Relationship Building (25%), Adaptability (25%), Customer Orientation (25%)',
          items: [
            'Communication Skills: Clear delivery and respectful communication, good word choices that are not too technical to understand',
            'Relationship Building: Building and maintaining rapport with the customer. Patience dealing with very demanding clients (high-net-worth)',
            'Adaptability: Flexibility in changing/understanding the concerns of the customer',
            'Customer Orientation: Focus on customer satisfaction and service',
          ],
        },
        {
          title: 'Knowledge Skills',
          description:
            'Verification (34%), Fact Finding (33%), Problem-Solving (33%)',
          items: [
            'Verification: Agent must clearly identify themselves and the carrier (Great Eastern) to satisfy transparency standards. Execute the "Permission Check" protocol ("Is this a convenient time?"). Successfully gain prospect\'s permission and attention to continue conversation',
            "Fact Finding - Life Stage: Determine client's age, employment status, family situation (dependants, parents) and map to correct life-stage profile",
            'Fact Finding - Cash Flow & Net Worth: Probe income, CPF contributions, existing expenses, assets, and liabilities',
            'Fact Finding - Existing Coverage: Ask about current insurance policies, CPF balances, MediShield Life/CareShield Life status, and employer-provided benefits',
            'Fact Finding - Risk Profile: Determine risk tolerance (Conservative → Aggressive) before making investment recommendations',
            'Fact Finding - CKA: If recommending unlisted Specified Investment Products (ILPs, Unit Trusts), check qualifications, investment experience, or relevant work experience',
            'Problem-Solving: Ability to identify issues and find solutions',
          ],
        },
        {
          title: 'Financial Planning',
          description:
            'Clear understanding of client needs across all financial planning pillars',
          items: [
            'Emergency Fund: Client should have 3-6 months expenses saved (12 months if irregular income)',
            'Death/TPD Planning: Prepare for at least 9x annual income. Ask about dependants protection scheme, monthly income replacement and short-term needs coverage',
            'Critical Illness Planning: Prepare for at least 4x annual income. Know if recovery is covered and if lump sum needs can be handled',
            'Hospitalisation Planning: Ensure short-term expenses handled for dependants. Ask about Integrated Shield Plan or MediShield Life plans',
            'Retirement Planning: Compute monthly desired income, years of retirement adjusted for inflation, minus insurance expenses and savings. Ask about CPF Life coverage',
            "Children's Education: Prepare for 3-4 years × annual cost (local/international) adjusted for 6% education inflation",
            'Mortgage Protection: Client should have mortgage insurance. Ask about current coverage and future loans',
            'Legacy Planning: At minimum have will, CPF nomination and advance care plan. Ask about inheritance planning and tax implications',
            'Quality - Client-centric: Listen, ask before prescribing, adapt to client priorities rather than pushing products',
            'Quality - No Material Omissions: All four pillars (Emergency Funds, Protection, Investments, Legacy) raised for client life stage',
            'Quality - National Schemes Referenced: MediShield Life, CareShield Life, DPS, and CPF LIFE explained as baselines before layering private products',
            'Quality - Transparency: Commissions, conflicts of interest, or product limitations not obscured',
          ],
        },
      ],
    },
  },
};

/**
 * Great Eastern Product Pitch Framework
 * Stage 2: Second meet up to propose Great Wealth Advantage 4
 *
 * Evaluation Split:
 * - Soft skills: Communication, Relationship Building, Adaptability, Customer Orientation
 * - Knowledge skills: Fact Finding, Problem-Solving, Sales & Negotiation, Compliance
 * - Product Knowledge (100%)
 */
export const greatEasternProductPitchConfiguration: FrameworkConfiguration = {
  base: {
    id: 'great-eastern-product-pitch',
    friendlyId: 'great-eastern-product-pitch',
    type: 'list',
  },

  localized: {
    en: {
      title: 'Product Pitch (Stage 2)',
      description:
        "(Please attempt after completing Stage 1) Explore the client's financial needs and propose Great Wealth Advantage 4 to address their coverage needs",
      parts: [
        {
          title: 'Soft Skills',
          description:
            'Communication Skills (25%), Relationship Building (25%), Adaptability (25%), Customer Orientation (25%)',
          items: [
            'Communication Skills: Clear delivery and respectful communication, good word choices that are not too technical to understand',
            'Relationship Building: Building and maintaining rapport with the customer. Patience dealing with very demanding clients (high-net-worth)',
            'Adaptability: Flexibility in changing/understanding the concerns of the customer',
            'Customer Orientation: Focus on customer satisfaction and service',
          ],
        },
        {
          title: 'Knowledge Skills',
          description:
            'Fact Finding (25%), Problem-Solving (25%), Sales & Negotiation Skills (25%), Compliance & Regulations (25%)',
          items: [
            'Fact Finding: Life stage identified, cash flow & net worth gathered, existing coverage reviewed, risk profile assessed, CKA completed if needed',
            'Problem-Solving: Ability to identify issues and find solutions',
            'Sales & Negotiation: Ability to close deals and negotiate effectively despite dealing with highly knowledgeable clients. Actively listen to objections without interruption, probe for underlying motivations, and resolve objections while maintaining professional rapport',
            'Compliance - Product Presentation: Present as insurance plan, not savings account or fixed deposit',
            'Compliance - Returns: Clearly inform about guaranteed and non-guaranteed returns. Do not use "Minimum" or "Maximum" when describing illustrated investment returns',
            'Compliance - Past Performance: Do not cite past performance as guarantee of future performance. Do not imply guaranteed returns unless specifically stated',
            'Compliance - Comparisons: Do not compare returns with bank products. Do not provide financial advice on banking products or premium financing',
            'Compliance - Transparency: Explain features, benefits, and limitations with clarity. Be explicit about all fees, charges, and clauses',
          ],
        },
        {
          title: 'Product Knowledge',
          description:
            'Understanding of products, features, and benefits. Product solution aligned with customer profile',
          items: [
            'Demonstrate clear understanding of Great Wealth Advantage 4 product features',
            'Explain product benefits and value proposition clearly',
            "Tailor product information to the customer's specific needs",
            'Handle objections related to pricing, coverage and comparison with existing products',
            'Provide product solution aligned with the customer profile',
          ],
        },
      ],
    },
  },
};

/**
 * Great Eastern Post Sales Framework
 * Stage 3: Client follow-up 1 year after purchasing Great Wealth Advantage 4
 *
 * Evaluation Split:
 * - Soft skills: Communication, Relationship Building, Adaptability, Customer Orientation
 * - Knowledge skills: Problem-Solving (33%), Sales & Negotiation (33%), Compliance (33%)
 * - Product Review (focus on technical details, not pitch)
 */
export const greatEasternPostSalesConfiguration: FrameworkConfiguration = {
  base: {
    id: 'great-eastern-post-sales',
    friendlyId: 'great-eastern-post-sales',
    type: 'list',
  },

  localized: {
    en: {
      title: 'Post Sale Service (Stage 3)',
      description:
        '(Please attempt after completing Stage 1 & Stage 2) Address client concerns about market conditions and sub-fund performance one year after purchasing Great Wealth Advantage 4',
      parts: [
        {
          title: 'Soft Skills',
          description:
            'Communication Skills (25%), Relationship Building (25%), Adaptability (25%), Customer Orientation (25%)',
          items: [
            'Communication Skills: Clear delivery and respectful communication, good word choices that are not too technical to understand',
            'Relationship Building: Building and maintaining rapport with the customer. Patience dealing with very demanding clients (high-net-worth)',
            'Adaptability: Flexibility in changing/understanding the concerns of the customer',
            'Customer Orientation: Focus on customer satisfaction and service',
          ],
        },
        {
          title: 'Knowledge Skills',
          description:
            'Problem-Solving (33%), Sales & Negotiation Skills (33%), Compliance & Regulations (33%)',
          items: [
            'Problem-Solving: Ability to identify issues and find solutions. Address client worries about volatile economic changes',
            'Sales & Negotiation: Listen to objections without interruption, probe for underlying motivations, resolve objections while maintaining professional rapport',
            'Compliance - Product Presentation: Present as insurance plan, not savings account or fixed deposit',
            'Compliance - Returns: Clearly inform about guaranteed and non-guaranteed returns. Do not use "Minimum" or "Maximum" when describing illustrated investment returns',
            'Compliance - Past Performance: Do not cite past performance as guarantee of future performance. Do not imply guaranteed returns unless specifically stated',
            'Compliance - Comparisons: Do not compare returns with bank products. Do not provide financial advice on banking products or premium financing',
          ],
        },
        {
          title: 'Product Review',
          description:
            'Focus on sharing technical details of the product purchased, not pitching the product',
          items: [
            'Demonstrate clear understanding of product features, benefits, and value proposition',
            "Explain how features solve the customer's problems",
            'Communicate product advantages clearly and concisely',
            "Tailor product information to the customer's needs and objections",
            'Present accurate product information',
            'Explain investment is for long term and according to risk profile',
            'Explain short to medium term fluctuations are expected',
            'Explain how dollar cost averaging smooths out risks',
          ],
        },
      ],
    },
  },
};

/**
 * Great Eastern Fact Finding Evaluation Prompt
 * For evaluating financial representatives conducting fact-finding sessions
 */
export const greatEasternFactFindEvaluationPrompt = `You are an expert sales coach specializing in financial planning and fact-finding for Great Eastern. Your task is to evaluate **only the user's** performance in conducting a comprehensive financial needs analysis.

IMPORTANT: In the transcript, the user (financial representative) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the representative's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the financial representative - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[GREAT EASTERN FACT FINDING EVALUATION FRAMEWORK]
Evaluate against these 3 sections with specific criteria in each:

## SECTION 1: SOFT SKILLS (0-33 points)
**Criteria to evaluate:**
1. **Communication Skills** (0-8 points): Clear delivery and respectful communication, good word choices that are not too technical to understand
2. **Relationship Building** (0-8 points): Building and maintaining rapport with {{characterName}}. Patience dealing with very demanding clients (high-net-worth)
3. **Adaptability** (0-8 points): Flexibility in changing/understanding {{characterName}}'s concerns
4. **Customer Orientation** (0-9 points): Focus on {{characterName}}'s satisfaction and service

## SECTION 2: KNOWLEDGE SKILLS (0-34 points)
**Criteria to evaluate:**
1. **Verification** (0-12 points): Agent must clearly identify themselves and Great Eastern to satisfy transparency standards. Execute the "Permission Check" protocol ("Is this a convenient time?"). Successfully gain {{characterName}}'s permission and attention to continue conversation
2. **Fact Finding** (0-11 points):
   - Life Stage: Determine {{characterName}}'s age, employment status, family situation (dependants, parents) and map to correct life-stage profile
   - Cash Flow & Net Worth: Probe income, CPF contributions, existing expenses, assets, and liabilities
   - Existing Coverage: Ask about current insurance policies, CPF balances, MediShield Life/CareShield Life status, and employer-provided benefits
   - Risk Profile: Determine risk tolerance (Conservative → Aggressive) before making investment recommendations
   - CKA: If recommending unlisted Specified Investment Products (ILPs, Unit Trusts), check qualifications, investment experience, or relevant work experience
3. **Problem Solving** (0-11 points): Ability to identify issues and find solutions

## SECTION 3: FINANCIAL PLANNING (0-33 points)
**Criteria to evaluate:**
1. **Financial Planning** (0-33 points): Clear understanding of {{characterName}}'s needs across all financial planning pillars:
   - Emergency Fund: Client should have 3-6 months expenses saved (12 months if irregular income)
   - Death/TPD Planning: Prepare for at least 9x annual income. Ask about dependants protection scheme, monthly income replacement and short-term needs coverage
   - Critical Illness Planning: Prepare for at least 4x annual income. Know if recovery is covered and if lump sum needs can be handled
   - Hospitalisation Planning: Ensure short-term expenses handled for dependants. Ask about Integrated Shield Plan or MediShield Life plans
   - Retirement Planning: Compute monthly desired income, years of retirement adjusted for inflation, minus insurance expenses and savings. Ask about CPF Life coverage
   - Children's Education: Prepare for 3-4 years × annual cost (local/international) adjusted for 6% education inflation
   - Mortgage Protection: Client should have mortgage insurance. Ask about current coverage and future loans
   - Legacy Planning: At minimum have will, CPF nomination and advance care plan. Ask about inheritance planning and tax implications
   - Quality - Client-centric: Listen, ask before prescribing, adapt to client priorities rather than pushing products
   - Quality - No Material Omissions: All four pillars (Emergency Funds, Protection, Investments, Legacy) raised for client life stage
   - Quality - National Schemes Referenced: MediShield Life, CareShield Life, DPS, and CPF LIFE explained as baselines before layering private products
   - Quality - Transparency: Commissions, conflicts of interest, or product limitations not obscured

[SCORING GUIDELINES]
- **Exceptional (90-100%)**: Outstanding performance, demonstrates mastery of the technique
- **Good (70-89%)**: Solid performance with minor areas for enhancement
- **Adequate (50-69%)**: Basic application but needs improvement in execution
- **Poor (30-49%)**: Weak performance with significant gaps
- **Very Poor (0-29%)**: Missing or ineffective application of the technique

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Include example phrases the advisor could have used
- Focus on fact-finding thoroughness, client-centric approach, and financial planning coverage
- Calculate overall score as sum of all section scores
- **why**: 2-3 sentence explanation of why the advisor received this score based on specific transcript evidence
- **suggestion**: 2-3 sentence actionable suggestion with example phrasing the advisor could use

[STRICT JSON OUTPUT FORMAT]
{{
  "greatEasternAssessment": {{
    "overallScore": "number", //out of 100, sum of all section scores
    "overallFeedback": "string", //2-3 sentence summary of overall performance
    "sections": [
      {{
        "title": "Soft Skills",
        "score": "number",  //out of 33, sum of all criteria scores
        "maxScore": 33,
        "feedback": "string", //brief explanation of the section score (25-30 words)
        "strengths": ["string"], //1-3 specific things done well
        "improvements": ["string"], //1-3 specific areas to improve with actionable advice
        "criteria": [
          {{
            "title": "Communication Skills",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string", //2-3 sentence actionable suggestion with example phrasing
            "why": "string" //2-3 sentence explanation based on specific transcript evidence
          }},
          {{
            "title": "Relationship Building",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Adaptability",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Customer Orientation",
            "score": "number", //out of 9
            "maxScore": 9,
            "suggestion": "string",
            "why": "string"
          }}
        ]
      }},
      {{
        "title": "Knowledge Skills",
        "score": "number",  //out of 34, sum of all criteria scores
        "maxScore": 34,
        "feedback": "string",
        "strengths": ["string"],
        "improvements": ["string"],
        "criteria": [
          {{
            "title": "Verification",
            "score": "number", //out of 12
            "maxScore": 12,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Fact Finding",
            "score": "number", //out of 11
            "maxScore": 11,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Problem Solving",
            "score": "number", //out of 11
            "maxScore": 11,
            "suggestion": "string",
            "why": "string"
          }}
        ]
      }},
      {{
        "title": "Financial Planning",
        "score": "number",  //out of 33
        "maxScore": 33,
        "feedback": "string",
        "strengths": ["string"],
        "improvements": ["string"],
        "criteria": [
          {{
            "title": "Financial Planning",
            "score": "number", //out of 33
            "maxScore": 33,
            "suggestion": "string",
            "why": "string"
          }}
        ]
      }}
    ],
    "nextSteps": ["string"] //2-4 actionable recommendations for future practice
  }}
}}`;

/**
 * Great Eastern Product Pitch Evaluation Prompt
 * For evaluating financial representatives pitching Great Wealth Advantage 4
 * Note: Product Knowledge is evaluated separately using GENERATE_PRODUCT_KNOWLEDGE job
 */
export const greatEasternProductPitchEvaluationPrompt = `You are an expert sales coach specializing in Great Eastern's Great Wealth Advantage 4 (GWA4) product pitch. Your task is to evaluate **only the user's** performance in presenting this investment-linked plan.

IMPORTANT: In the transcript, the user (financial representative) is speaking with an AI character named {{characterName}} (the client). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "client," "customer," "AI," or any other term. Focus exclusively on the representative's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the financial representative - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the client - IGNORE THESE COMPLETELY

[GREAT EASTERN PRODUCT PITCH EVALUATION FRAMEWORK]
Evaluate against these 2 sections with specific criteria in each:

## SECTION 1: SOFT SKILLS (0-34 points)
**Criteria to evaluate:**
1. **Communication Skills** (0-9 points): Clear delivery and respectful communication, good word choices that are not too technical to understand
2. **Relationship Building** (0-9 points): Building and maintaining rapport with {{characterName}}. Patience dealing with very demanding clients (high-net-worth)
3. **Adaptability** (0-8 points): Flexibility in changing/understanding {{characterName}}'s concerns
4. **Customer Orientation** (0-8 points): Focus on {{characterName}}'s satisfaction and service

## SECTION 2: KNOWLEDGE SKILLS (0-33 points)
**Criteria to evaluate:**
1. **Fact Finding** (0-8 points): Life stage identified, cash flow & net worth gathered, existing coverage reviewed, risk profile assessed, CKA completed if needed
2. **Problem Solving** (0-8 points): Ability to identify issues and find solutions
3. **Sales & Negotiation Skills** (0-9 points): Ability to close deals, handle objections from highly knowledgeable clients, listen without interruption, probe underlying motivations
4. **Compliance and Regulations** (0-8 points):
   - Product Presentation: Present as insurance plan, NOT savings account or fixed deposit
   - Returns: Clearly inform about guaranteed vs non-guaranteed returns. Do NOT use "Minimum" or "Maximum" for illustrated returns
   - Past Performance: Do NOT cite past performance as guarantee of future performance
   - Comparisons: Do NOT compare returns with bank products
   - Transparency: Explain features, benefits, and limitations clearly; be explicit about all fees, charges, and clauses

**COMMON OBJECTIONS AND RECOMMENDED SCRIPTS:**
- "I need to think about it" → "I completely understand. What specific aspects would you like to consider further? I'd be happy to provide more information on any areas of concern."
- "It's too expensive" → "I appreciate your concern about cost. Let me show you how the premium flexibility works - you can adjust based on your budget, and the long-term benefits often outweigh the initial investment."
- "I already have insurance" → "That's great that you're already protected. Let me show you how GWA4 can complement your existing coverage and address any gaps, particularly for wealth accumulation."
- "The returns are not guaranteed" → "You're right to consider this. While investment returns are not guaranteed, GWA4 provides guaranteed benefits including the loyalty bonus. Let me explain the historical fund performance and how diversification helps manage risk."
- "I want to compare with other products" → "That's a prudent approach. I can help you understand the key differences. What specific features are most important to you in making your comparison?"
- "My spouse/family needs to be involved" → "Absolutely, this is an important family decision. Would it be helpful if I prepared a summary for them, or would you prefer I meet with both of you together?"

[SCORING GUIDELINES]
- **Exceptional (90-100%)**: Outstanding performance, demonstrates mastery of the technique
- **Good (70-89%)**: Solid performance with minor areas for enhancement
- **Adequate (50-69%)**: Basic application but needs improvement in execution
- **Poor (30-49%)**: Weak performance with significant gaps
- **Very Poor (0-29%)**: Missing or ineffective application of the technique

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Include example phrases the advisor could have used
- Focus on sales techniques, compliance, and client alignment
- Calculate overall score as sum of all section scores
- **why**: 2-3 sentence explanation of why the advisor received this score based on specific transcript evidence
- **suggestion**: 2-3 sentence actionable suggestion with example phrasing the advisor could use

[STRICT JSON OUTPUT FORMAT]
{{
  "greatEasternAssessment": {{
    "overallScore": "number", //out of 67, sum of all section scores
    "overallFeedback": "string", //2-3 sentence summary of overall performance
    "sections": [
      {{
        "title": "Soft Skills",
        "score": "number",  //out of 34, sum of all criteria scores
        "maxScore": 34,
        "feedback": "string", //brief explanation of the section score (25-30 words)
        "strengths": ["string"], //1-3 specific things done well
        "improvements": ["string"], //1-3 specific areas to improve with actionable advice
        "criteria": [
          {{
            "title": "Communication Skills",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string", //2-3 sentence actionable suggestion with example phrasing
            "why": "string" //2-3 sentence explanation based on specific transcript evidence
          }},
          {{
            "title": "Relationship Building",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Adaptability",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Customer Orientation",
            "score": "number", //out of 9
            "maxScore": 9,
            "suggestion": "string",
            "why": "string"
          }}
        ]
      }},
      {{
        "title": "Knowledge Skills",
        "score": "number",  //out of 33, sum of all criteria scores
        "maxScore": 33,
        "feedback": "string",
        "strengths": ["string"],
        "improvements": ["string"],
        "criteria": [
          {{
            "title": "Fact Finding",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Problem Solving",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Sales & Negotiation Skills",
            "score": "number", //out of 9
            "maxScore": 9,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Compliance and Regulations",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string",
            "why": "string"
          }}
        ]
      }}
    ],
    "nextSteps": ["string"] //2-4 actionable recommendations for future practice
  }}
}}`;

/**
 * Great Eastern Post Sales Evaluation Prompt
 * For evaluating financial representatives conducting post-sale service follow-ups
 */
export const greatEasternPostSalesEvaluationPrompt = `You are an expert sales coach specializing in Great Eastern's post-sale service for Great Wealth Advantage 4 (GWA4). Your task is to evaluate **only the user's** performance in conducting a client follow-up session.

IMPORTANT: In the transcript, the user (financial representative) is speaking with an AI character named {{characterName}} (the client). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "client," "customer," "AI," or any other term. Focus exclusively on the representative's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the financial representative - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the client - IGNORE THESE COMPLETELY

[GREAT EASTERN POST SALES EVALUATION FRAMEWORK]
Evaluate against these 3 sections with specific criteria in each:

## SECTION 1: SOFT SKILLS (0-34 points)
**Criteria to evaluate:**
1. **Communication Skills** (0-9 points): Clear delivery and respectful communication, good word choices that are not too technical to understand
2. **Relationship Building** (0-9 points): Building and maintaining rapport with {{characterName}}. Patience dealing with very demanding clients (high-net-worth)
3. **Adaptability** (0-8 points): Flexibility in changing/understanding {{characterName}}'s concerns about market conditions
4. **Customer Orientation** (0-8 points): Focus on {{characterName}}'s satisfaction and service

## SECTION 2: KNOWLEDGE SKILLS (0-33 points)
**Criteria to evaluate:**
1. **Problem Solving** (0-11 points): Ability to identify issues and find solutions; address {{characterName}}'s worries about volatile economic changes.
2. **Sales & Negotiation Skills** (0-11 points): Listen to objections without interruption, probe underlying motivations, resolve objections professionally.
3. **Compliance and Regulations** (0-11 points): 
   - Product Presentation: Present as insurance plan, NOT savings account or fixed deposit
   - Returns: Clearly inform about guaranteed vs non-guaranteed returns. Do NOT use "Minimum" or "Maximum" for illustrated returns
   - Past Performance: Do NOT cite past performance as guarantee of future performance
   - Comparisons: Do NOT compare returns with bank products

**COMMON OBJECTIONS AND RECOMMENDED SCRIPTS:**
- "My policy is losing money" → "I understand your concern. Let me explain that short-term fluctuations are normal for investment-linked products. Your policy is designed for long-term growth, and historically, staying invested has been the best approach."
- "I want to surrender my policy" → "Before making that decision, let's review your original goals together. Surrendering now may result in losses and you would lose your insurance coverage. Can I show you how your policy is still working toward your objectives?"
- "The market is too volatile" → "Market volatility is indeed concerning. However, your regular premium contributions benefit from dollar-cost averaging, which helps smooth out market fluctuations over time."
- "I'm not seeing the returns I expected" → "Let me walk you through your policy statement. Remember that illustrated returns are projections, not guarantees. Your guaranteed benefits are still in place, and the non-guaranteed portion will depend on market performance over your policy term."
- "I want to reduce my premiums" → "I understand budget constraints can arise. Let's explore your options - GWA4 offers premium flexibility including premium holidays. What level would be comfortable for you while still meeting your protection needs?"
- "Should I switch to another product?" → "Let's first review what you have and your current needs. Switching may involve new costs and a fresh waiting period for certain benefits. I can help you understand the implications before making any decision."

3. **Compliance and Regulations** (0-11 points):
   - Product Presentation: Present as insurance plan, NOT savings account or fixed deposit
   - Returns: Clearly inform about guaranteed vs non-guaranteed returns. Do NOT use "Minimum" or "Maximum" for illustrated returns
   - Past Performance: Do NOT cite past performance as guarantee of future performance
   - Comparisons: Do NOT compare returns with bank products

## SECTION 3: PRODUCT KNOWLEDGE (0-33 points)
**Criteria to evaluate:**
1. **Product Review** (0-33 points): Focus on sharing technical details of the product purchased, not pitching the product
   - Demonstrate clear understanding of product features, benefits, and value proposition
   - Explain how features solve {{characterName}}'s problems
   - Communicate product advantages clearly and concisely
   - Tailor product information to {{characterName}}'s needs and objections
   - Present accurate product information
   - Explain investment is for long term and according to risk profile
   - Explain short to medium term fluctuations are expected
   - Explain how dollar cost averaging (DCA) smooths out risks

[SCORING GUIDELINES]
- **Exceptional (90-100%)**: Outstanding performance, demonstrates mastery of the technique
- **Good (70-89%)**: Solid performance with minor areas for enhancement
- **Adequate (50-69%)**: Basic application but needs improvement in execution
- **Poor (30-49%)**: Weak performance with significant gaps
- **Very Poor (0-29%)**: Missing or ineffective application of the technique

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Include example phrases the advisor could have used
- Focus on addressing client concerns, compliance, and product understanding
- Calculate overall score as sum of all section scores
- **why**: 2-3 sentence explanation of why the advisor received this score based on specific transcript evidence
- **suggestion**: 2-3 sentence actionable suggestion with example phrasing the advisor could use

[STRICT JSON OUTPUT FORMAT]
{{
  "greatEasternAssessment": {{
    "overallScore": "number", //out of 100, sum of all section scores
    "overallFeedback": "string", //2-3 sentence summary of overall performance
    "sections": [
      {{
        "title": "Soft Skills",
        "score": "number",  //out of 34, sum of all criteria scores
        "maxScore": 34,
        "feedback": "string", //brief explanation of the section score (25-30 words)
        "strengths": ["string"], //1-3 specific things done well
        "improvements": ["string"], //1-3 specific areas to improve with actionable advice
        "criteria": [
          {{
            "title": "Communication Skills",
            "score": "number", //out of 9
            "maxScore": 9,
            "suggestion": "string", //2-3 sentence actionable suggestion with example phrasing
            "why": "string" //2-3 sentence explanation based on specific transcript evidence
          }},
          {{
            "title": "Relationship Building",
            "score": "number", //out of 9
            "maxScore": 9,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Adaptability",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Customer Orientation",
            "score": "number", //out of 8
            "maxScore": 8,
            "suggestion": "string",
            "why": "string"
          }}
        ]
      }},
      {{
        "title": "Knowledge Skills",
        "score": "number",  //out of 33, sum of all criteria scores
        "maxScore": 33,
        "feedback": "string",
        "strengths": ["string"],
        "improvements": ["string"],
        "criteria": [
          {{
            "title": "Problem Solving",
            "score": "number", //out of 11
            "maxScore": 11,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Sales & Negotiation Skills",
            "score": "number", //out of 11
            "maxScore": 11,
            "suggestion": "string",
            "why": "string"
          }},
          {{
            "title": "Compliance and Regulations",
            "score": "number", //out of 11
            "maxScore": 11,
            "suggestion": "string",
            "why": "string"
          }}
        ]
      }},
      {{
        "title": "Product Knowledge",
        "score": "number",  //out of 33
        "maxScore": 33,
        "feedback": "string",
        "strengths": ["string"],
        "improvements": ["string"],
        "criteria": [
          {{
            "title": "Product Review",
            "score": "number", //out of 33
            "maxScore": 33,
            "suggestion": "string",
            "why": "string"
          }}
        ]
      }}
    ],
    "nextSteps": ["string"] //2-4 actionable recommendations for future practice
  }}
}}`;
