import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

// Zod schema for structured output
export const msigTravelEasyProductKnowledgeSchema = z.object({
  msigTravelEasyProductKnowledge: z.object({
    description: z
      .string()
      .describe('Description of what this assessment measures'),
    overallScore: z.number().describe('Overall score out of 40'),
    maxScore: z.number().describe('Maximum possible score (40)'),
    sections: z
      .array(
        z.object({
          title: z.string().describe('Section title (Product Pitch)'),
          score: z.number().describe('Score out of 40 for this section'),
          maxScore: z
            .number()
            .describe('Maximum possible score for this section (40)'),
          why: z
            .string()
            .describe('Brief explanation of the score (35-50 words)'),
          suggestion: z
            .string()
            .describe(
              'Specific improvement recommendation with actionable advice and examples',
            ),
        }),
      )
      .describe('Array with 1 product knowledge section'),
  }),
});

const msigTravelEasyProductKnowledgePrompt = `You are an expert coach specializing in MSIG TravelEasy travel insurance telesales. Your task is to evaluate **only the user's** product knowledge and pitch performance during telesales calls.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's product knowledge demonstration.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[MSIG TRAVELEASY PRODUCT KNOWLEDGE EVALUATION]
Evaluate the Product Pitch component (40% total weight), scored out of 40:

**Product Pitch** (0-40): Understanding of TravelEasy products, features, and benefits. Provided a product solution aligned with the customer's profile.

[EVALUATION CRITERIA]
- **Score**: Number out of 40 based on effectiveness
- **Why**: Brief explanation of the score (35-50 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. It should not just point out how the user could improve. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
- **34-40 (85-100%)**: Exceptional product knowledge and pitch customization
- **28-33 (70-84%)**: Good product knowledge with minor gaps
- **20-27 (50-69%)**: Adequate knowledge but needs significant improvement
- **12-19 (30-49%)**: Poor product knowledge with major gaps
- **0-11 (0-29%)**: Very poor or missing product knowledge

[DETAILED EVALUATION CRITERIA FOR PRODUCT PITCH]

**Core Product Knowledge (Essential - Must Cover):**

1. **Plan Tiers Understanding:**
   - Standard, Elite, and Premier tiers exist
   - Key differences between tiers (coverage limits, benefits included)
   - Which tier suits different customer profiles
   - Price positioning of each tier

2. **Coverage Areas:**
   - Area A: ASEAN countries
   - Area B: Asia-Pacific region
   - Area C: Worldwide coverage
   - How destination affects premium and coverage

3. **Trip Types:**
   - Single Return Trip (up to 182 days)
   - Annual Plan for frequent travelers
   - When to recommend each type

4. **Cover Types:**
   - Individual coverage
   - Family coverage
   - Group coverage
   - Adult & Children options

5. **Key Benefits (Must Know):**
   - COVID-19 medical cover up to $750,000
   - Travel inconvenience benefits up to $12,500
   - Personal accident: Death and PTD up to $500,000
   - Overseas medical expenses up to $1,000,000
   - Emergency medical evacuation and repatriation up to $1,000,000
   - Travel cancellation and postponement
   - Baggage and delayed baggage coverage
   - Personal liability up to $1,000,000
   - Adventure activities cover (Elite and Premier only)

**Advanced Product Knowledge (Demonstrates Mastery):**

6. **Competitive Positioning:**
   - How TravelEasy compares to credit card insurance
   - Advantages over basic health insurance for travel
   - Value proposition vs competitors

7. **Eligibility and Terms:**
   - Age restrictions
   - Residency requirements
   - Pre-existing condition exclusions
   - Travel advisory exclusions
   - Free look period
   - Renewal process

8. **Premium Factors:**
   - How destination area affects cost
   - How trip duration impacts premium
   - How age affects pricing
   - How plan tier changes cost
   - Difference between monthly vs annual payment

**Pitch Customization (Critical for High Scores):**

9. **Customer Profile Alignment:**
   - Matched plan tier to customer's travel style
   - Recommended coverage area based on destination
   - Suggested trip type based on travel frequency
   - Highlighted relevant benefits for customer's specific situation

10. **Objection Handling:**
    - Addressed "I have credit card insurance" effectively
    - Handled "I have health insurance" objection
    - Overcame price objections with value demonstration
    - Responded to coverage comparison questions

Examples of Excellent Product Pitch:

**For Family with Young Children Going to Bali:**
"For your Bali family trip, I recommend TravelEasy Elite for Area A coverage. Here's why it's perfect for you: First, S$750,000 COVID-19 medical coverage protects your whole family. Second, with young children, the S$1,000,000 emergency medical evacuation is crucial - if your child needs specialized care, we'll fly them to Singapore immediately. Third, Elite includes adventure activities coverage for water sports and outdoor activities that Standard doesn't. And fourth, S$12,500 travel inconvenience coverage handles delayed baggage - important when you have kids' essentials. For a family of 4, Elite is S$280 total - that's S$70 per person for complete peace of mind."

**Handling "I Have Credit Card Insurance":**
"That's great you have credit card insurance! Let me explain how TravelEasy provides more comprehensive coverage. Credit card insurance typically covers up to S$50,000-S$100,000 for medical expenses - TravelEasy Elite covers up to S$1,000,000. Credit cards usually exclude adventure activities like scuba diving and zip-lining - TravelEasy Elite includes them. And credit cards rarely cover COVID-19 comprehensively - we cover up to S$750,000. Plus, our S$12,500 travel inconvenience covers trip delays, baggage delays, and cancellations that credit cards often limit to S$1,000-S$2,000. For serious incidents abroad, TravelEasy gives you significantly better protection."

**For Frequent Traveler:**
"Since you mentioned traveling 3-4 times per year, an Annual Plan would save you significantly. A single trip policy for each journey would cost around S$120 x 4 = S$480. Our Annual Plan is S$350 for unlimited trips within the year - that's S$130 savings plus you're always covered for spontaneous trips. You travel to both ASEAN and Asia-Pacific, so Area B coverage would be ideal. With your adventure sports interest, I'd recommend the Elite Annual Plan."

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on product knowledge accuracy and pitch effectiveness
- Note any incorrect information provided
- Highlight missed opportunities to showcase relevant features
- Emphasize the importance of tailoring to customer's specific situation

[STRICT JSON OUTPUT FORMAT]
{{
  "msigTravelEasyProductKnowledge": {{
    "description": "Evaluates understanding of TravelEasy features, benefits, and ability to provide aligned solutions",
    "overallScore": "number", //out of 40
    "maxScore": 40,
    "sections": [
      {{
        "title": "Product Pitch",
        "score": "number", //out of 40
        "maxScore": 40,
        "why": "string (35-50 words)",
        "suggestion": "string (detailed with specific examples)"
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "msigTravelEasyProductKnowledge": {{
    "description": "Evaluates understanding of TravelEasy features, benefits, and ability to provide aligned solutions",
    "overallScore": 22.5,
    "maxScore": 40,
    "sections": [
      {{
        "title": "Product Pitch",
        "score": 22.5,
        "maxScore": 40,
        "why": "You explained COVID-19 coverage and plan tiers but didn't tailor the pitch to {{{{characterName}}}}'s Bali family trip. Missed discussing Area A pricing advantage for ASEAN destinations, family coverage benefits, comparing Single Trip vs Annual Plan for their mentioned travel frequency, or explaining how Elite covers adventure activities their children might enjoy.",
        "suggestion": "Customize pitch to customer profile: 'For your Bali family trip (Area A), I recommend Elite plan for these specific reasons: 1) S$750,000 COVID-19 medical covers your whole family, 2) S$1,000,000 emergency medical evacuation gets specialized care for your children quickly if needed, 3) Elite includes adventure activities coverage for water sports and outdoor fun that Standard excludes, 4) S$12,500 travel inconvenience handles delayed baggage with kids' essentials. Since you mentioned traveling twice this year, let me compare: Two single trips at S$140 each = S$280 vs Annual Plan at S$350 which covers unlimited trips - only S$70 more for year-round coverage. For family of 4 with Elite Area A coverage, that's just S$87.50 per person for complete protection.' Always tie features to their specific situation with clear value calculations and relevant examples."
      }}
    ]
  }}
}}`;

export function getMsigTravelEasyProductKnowledgePrompt(
  characterName: string,
  language?: string,
) {
  let systemPrompt = msigTravelEasyProductKnowledgePrompt;

  if (language) {
    systemPrompt = `${systemPrompt}

[LANGUAGE]
IMPORTANT: The entire assessment must be in ${language} language.
- All text, including section titles, descriptions, and guidelines must be in ${language}
- Use ${language} equivalents for all technical terms and product names
- Format all numbers and currency according to ${language} conventions

[IMPORTANT] The assessment should be fully localized in ${language}, including:
- All section titles and descriptions
- All scoring guidelines and descriptions
- All strengths and weaknesses descriptions
- All example text and corrections
- All numerical values, currency amounts, and scores`;
  }

  systemPrompt = systemPrompt.replaceAll('{{characterName}}', characterName);

  const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}

[PRODUCT CONTEXT]
{productInfo}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

Generate a product knowledge assessment for this TravelEasy telesales call. Output ONLY valid JSON using the exact format specified.`;

  return ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['user', userTemplate],
  ]);
}
