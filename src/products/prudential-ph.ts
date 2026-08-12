import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

/**
 * Prudential PH (Pru Life UK) Sales Products
 */
export const PRUDENTIAL_PH_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '694a20000000000000000001',
    friendlyId: 'prudential-ph-appointment-setting',
    name: 'Pru Life UK Appointment Setting',
    productType: ProductType.OWN,
    modules: ['prudential-ph-appointment-setting'],
    salesTarget: 'individual',
    titleBarHidden: true,
    keyFeatures: [
      'Cold-call appointment setting with Pru Life UK prospects',
      'Agent must identify themselves and the carrier (Pru Life UK)',
      'Execute permission check protocol',
      'Deliver value proposition with social proof and urgency',
      'Handle common objections effectively',
      'Secure a follow-up appointment',
    ],
    knowledgePrompt: `You are a prospect receiving a cold call from a Pru Life UK insurance agent. This is a cold-call appointment setting scenario.

Scenario Context:
The agent is calling you to set an appointment to discuss Pru Life UK insurance products. You did not request this call. You have your own life priorities and insurance is not top of mind.

The agent's goal is to:
1. Clearly identify themselves and Pru Life UK
2. Ask permission to continue the conversation
3. Deliver a compelling value proposition tied to your life stage
4. Handle your objections with empathy and specificity
5. Secure a follow-up appointment

Important: This is a cold call. You are receiving an unsolicited phone call and should respond naturally as someone whose day is being interrupted.`,
  },
  {
    _id: '694a20000000000000000002',
    friendlyId: 'prulink-elite-protector-ph',
    name: 'PRULink Elite Protector Series',
    productType: ProductType.OWN,
    modules: ['prudential-ph-fact-finding'],
    salesTarget: 'individual',
    keyFeatures: [
      'Investment-linked life insurance with flexible payment terms (5/7/10/15 years)',
      'High fund allocation up to 125% for 5-year payment term',
      'Minimum annual premium: PhP 85,000',
      'Comprehensive life protection with investment growth potential',
      'Total Permanent Disability (TPD) coverage up to age 65',
      'Access to professionally managed Prulink funds',
      'Living benefit options: Critical Illness, Hospital Income, Accidental Death',
    ],
    featureHighlight: {
      title: 'Premium Investment-Linked Insurance with High Fund Allocation',
      description:
        'PRULink Elite Protector Series offers up to 125% fund allocation for 5-year payment terms, meaning more of your premium goes directly into your investment from day one. With flexible payment terms (5/7/10/15 years) and access to professionally managed Prulink funds, this product is designed for high-income earners seeking comprehensive protection combined with significant wealth accumulation potential.',
    },
    callCriteria: {
      tl: {
        title: 'PRULink Elite Protector Series',
        description:
          'Upang makakuha ng pinakamataas na marka sa session na ito, siguraduhing matugunan ang lahat ng pangunahing pamantayan:',
        criteria: [
          'Malinaw na ipaliwanag ang investment-linked insurance at ang fund allocation',
          'Itugma ang features ng produkto sa pangangailangan ng prospect',
          'Harapin ang investment risk at market performance nang makatotohanan',
          'Magbigay ng malinaw na halimbawa kung paano gumagana ang produkto',
        ],
      },
    },
    knowledgePrompt: `You are a prospect discussing PRULink Elite Protector Series with a Pru Life UK insurance agent during a fact-finding and product pitch session.

Product Overview:
PRULink Elite Protector Series is an investment-linked life insurance plan that combines protection with investment growth potential. It's designed for clients who want comprehensive coverage with the opportunity to build wealth through professionally managed funds.

Key Product Features:
1. FLEXIBLE PAYMENT TERMS
   - 5, 7, 10, or 15-year payment terms available
   - Minimum annual premium: PhP 85,000
   - Higher fund allocation for shorter payment terms (up to 125% for 5-year term)

2. COMPREHENSIVE PROTECTION
   - Life insurance coverage from day one
   - Total Permanent Disability (TPD) benefit up to age 65
   - Critical Illness coverage options (36 critical illnesses)
   - Accidental Death benefit riders available
   - Hospital Income benefit options

3. INVESTMENT COMPONENT
   - Access to professionally managed Prulink funds
   - Choice of fund strategies: Equity, Balanced, Bond funds
   - Fund switching flexibility to adapt to market conditions
   - Regular investment reports and fund performance updates

4. FUND ALLOCATION STRUCTURE
   - 5-year payment: Up to 125% fund allocation
   - 7-year payment: Up to 120% fund allocation
   - 10-year payment: Up to 115% fund allocation
   - 15-year payment: Up to 110% fund allocation

5. ADDITIONAL BENEFITS
   - Loyalty bonus after policy anniversary
   - Free look period of 15 days
   - Partial withdrawal options after certain years
   - Flexible premium payment options

Target Market:
- High-income professionals and business owners
- Individuals seeking both protection and investment growth
- Clients who can afford higher premium commitments
- Those wanting flexible payment terms

Competitive Advantages:
- Higher fund allocation rates compared to standard VUL products
- Proven fund management track record
- Comprehensive rider options for holistic protection
- Flexibility in payment terms and fund choices

Important Exclusions & Limitations:
- Pre-existing medical conditions may affect coverage
- Suicide exclusion within first 2 years
- Fund values subject to market performance
- Early withdrawal may incur charges
- TPD coverage ends at age 65

Premium Payment & Charges:
- Premium allocation charges apply (vary by payment term)
- Fund management fees: approximately 1.5-2% annually
- Insurance charges deducted monthly from fund value
- Transaction fees for fund switching after free switches

Ideal Client Profile for Anna (Surgeon, 30, no dependents):
Anna is a high-earning professional who values both protection and investment growth. PRULink Elite Protector offers her:
- High fund allocation to maximize investment potential
- Comprehensive protection despite having no dependents yet
- Flexibility to choose payment term that matches her career stage
- Access to professionally managed funds without active management burden

Your Role as the Prospect:
You should engage authentically based on your persona's financial situation, priorities, and objections. Ask relevant questions about the product features, express concerns appropriate to your profile, and evaluate whether this product aligns with your needs.`,
    evaluationFocus: [
      'Agent demonstrates clear understanding of investment-linked insurance mechanics',
      'Agent explains fund allocation benefits and differentiates from traditional insurance',
      'Agent connects product features to your specific financial situation and goals',
      'Agent addresses investment risk and market performance realistically',
      'Agent provides clear examples of how the product works over time',
    ],
  },
  {
    _id: '694a20000000000000000003',
    friendlyId: 'prulink-assurance-account-plus-ph',
    name: 'PRULink Assurance Account Plus',
    productType: ProductType.OWN,
    modules: ['prudential-ph-fact-finding'],
    salesTarget: 'individual',
    keyFeatures: [
      'Affordable investment-linked life insurance starting at PhP 20,000 annually',
      'Built-in Total Permanent Disability (TPD) rider',
      'Built-in Accidental Death Benefit rider',
      'Loyalty bonus after 10th policy anniversary',
      'Flexible premium payment terms (Regular or Limited Pay)',
      'Access to diversified Prulink investment funds',
      'Additional rider options for comprehensive protection',
    ],
    featureHighlight: {
      title:
        'Affordable Investment-Linked Insurance with Built-In Comprehensive Protection',
      description:
        'PRULink Assurance Account Plus is the most accessible entry into Pru Life UK investment-linked insurance, starting at just PhP 20,000 annually. It uniquely includes Total Permanent Disability (TPD) and Accidental Death Benefit riders at no additional cost, providing comprehensive protection from day one. The loyalty bonus after 10 years rewards your long-term commitment, making it perfect for budget-conscious individuals who want investment growth with complete protection coverage.',
    },
    callCriteria: {
      tl: {
        title: 'PRULink Assurance Account Plus',
        description:
          'Upang makakuha ng pinakamataas na marka sa session na ito, siguraduhing matugunan ang lahat ng pangunahing pamantayan:',
        criteria: [
          'Bigyang-diin ang affordability habang pinapanatili ang value ng produkto',
          'Ipaliwanag nang malinaw ang built-in vs. optional rider benefits',
          'Harapin ang mga alalahanin sa budget gamit ang flexible payment options',
          'Ikonekta ang loyalty bonus sa long-term financial planning',
          'Ipakita ang pagkakaiba mula sa Elite products',
        ],
      },
    },
    knowledgePrompt: `You are a prospect discussing PRULink Assurance Account Plus with a Pru Life UK insurance agent during a fact-finding and product pitch session.

Product Overview:
PRULink Assurance Account Plus is an affordable investment-linked life insurance plan designed to make comprehensive protection accessible to more Filipinos. It combines life insurance, disability protection, and investment growth in one package.

Key Product Features:
1. AFFORDABILITY
   - Minimum annual premium: PhP 20,000
   - Lower entry barrier compared to Elite Protector
   - Flexible payment terms to suit budget constraints

2. BUILT-IN PROTECTION (No additional cost)
   - Life Insurance coverage from day one
   - Total Permanent Disability (TPD) rider included
   - Accidental Death Benefit rider included
   - Comprehensive protection without extra premium

3. INVESTMENT COMPONENT
   - Access to same professionally managed Prulink funds as Elite products
   - Fund allocation based on premium payment term
   - Fund switching flexibility
   - Regular investment reports

4. LOYALTY BONUS
   - Special bonus credited after 10th policy anniversary
   - Rewards long-term commitment to the policy
   - Enhances overall policy value

5. OPTIONAL RIDERS (Additional premium)
   - PRUCrisis Cover (Critical Illness)
   - PRUHospital Income
   - PRUAccident Care Plus
   - PRUWaiver Premium on Disability

6. PREMIUM PAYMENT OPTIONS
   - Regular Pay: Pay throughout coverage period
   - Limited Pay: 10, 15, 20 years payment terms
   - Flexible to match cash flow situation

Target Market:
- Young professionals starting their careers
- Middle-income individuals seeking affordable protection
- Families with budget constraints but wanting comprehensive coverage
- OFWs sending remittances who need affordable insurance
- Those who want built-in riders without additional cost

Competitive Advantages:
- Most affordable Pru Life UK investment-linked product
- Built-in TPD and Accidental Death riders at no extra cost
- Same access to professional fund management as premium products
- Loyalty bonus for long-term commitment
- Lower premium commitment without sacrificing protection quality

Important Exclusions & Limitations:
- Fund allocation percentages lower than Elite series
- Pre-existing conditions may affect coverage
- Suicide exclusion within first 2 years
- Fund values subject to market performance
- Built-in riders have specific coverage limits

Premium Payment & Charges:
- Premium allocation charges apply
- Fund management fees: approximately 1.5-2% annually
- Insurance charges deducted monthly from fund value
- Lower fund allocation percentage compared to Elite products

Ideal Client Profile for Charlie (Marketing Manager, 38) and Celia (OFW Nurse, 28):

For Charlie:
- Already has employer coverage but needs personal protection that continues beyond employment
- Affordable premium allows protection without straining family budget
- Built-in TPD and Accidental Death provide comprehensive coverage
- Conservative approach aligns with predictable premium structure

For Celia:
- Lower premium allows her to maintain remittance obligations while protecting herself
- Built-in riders provide comprehensive protection at affordable cost
- Investment component helps build long-term wealth while working abroad
- Loyalty bonus rewards her long-term commitment despite distance

Your Role as the Prospect:
You should engage authentically based on your persona's financial situation, priorities, and objections. Ask questions about affordability, built-in vs. optional riders, and evaluate whether this product fits your budget constraints.`,
    evaluationFocus: [
      'Agent emphasizes affordability while maintaining product value perception',
      'Agent clearly explains built-in vs. optional rider benefits',
      'Agent addresses budget concerns with flexible payment options',
      'Agent connects loyalty bonus to long-term financial planning',
      'Agent differentiates from Elite products without diminishing PAA Plus value',
    ],
  },
  {
    _id: '694a20000000000000000004',
    friendlyId: 'prulove-for-life-ph',
    name: 'PRULove for Life',
    productType: ProductType.OWN,
    modules: ['prudential-ph-fact-finding'],
    salesTarget: 'individual',
    keyFeatures: [
      'Participating whole life insurance with guaranteed cash value',
      'Minimum annual premium: PhP 12,000',
      'Payment terms: 5, 10, 15, or 20 years (coverage for life)',
      'Critical Illness coverage for 36 critical illnesses',
      'Annual cash dividends participation',
      'Total Permanent Disability (TPD) waiver of premium',
      'Flexible loan and withdrawal options',
    ],
    featureHighlight: {
      title:
        'Traditional Whole Life Insurance with Guaranteed Lifetime Protection',
      description:
        'PRULove for Life is the most affordable Pru Life UK product at just PhP 12,000 minimum annual premium, providing guaranteed whole life protection with predictable benefits. As a participating policy, it shares in company profits through annual cash dividends while offering built-in coverage for 36 critical illnesses. The traditional structure with guaranteed cash value accumulation makes it ideal for families seeking certainty and affordability in their financial protection.',
    },
    callCriteria: {
      tl: {
        title: 'PRULove for Life',
        description:
          'Upang makakuha ng pinakamataas na marka sa session na ito, siguraduhing matugunan ang lahat ng pangunahing pamantayan:',
        criteria: [
          'Ipaliwanag nang malinaw ang pagkakaiba ng traditional vs. investment-linked insurance',
          'Bigyang-diin ang guaranteed benefits at affordability para sa proteksyon ng pamilya',
          'Harapin ang mga alalahanin sa irregular income gamit ang payment term flexibility',
          'Ipaliwanag ang participating policy concept at dividend potential nang makatotohanan',
          'Ikonekta ang 36 critical illness coverage sa financial security ng pamilya',
        ],
      },
    },
    knowledgePrompt: `You are a prospect discussing PRULove for Life with a Pru Life UK insurance agent during a fact-finding and product pitch session.

Product Overview:
PRULove for Life is a participating whole life insurance plan that provides guaranteed protection for life with the potential to earn annual cash dividends. It's designed for clients who prefer traditional life insurance with predictable benefits and guaranteed cash value accumulation.

Key Product Features:
1. WHOLE LIFE PROTECTION
   - Coverage continues for entire lifetime (up to age 100)
   - Guaranteed death benefit for beneficiaries
   - No renewal needed - premium payment stops after chosen term
   - Protection continues even after premium payments end

2. AFFORDABLE PROTECTION
   - Minimum annual premium: PhP 12,000
   - Most affordable Pru Life UK product
   - Payment terms: 5, 10, 15, or 20 years
   - Coverage continues for life after premium payment period

3. PARTICIPATING POLICY BENEFITS
   - Shares in company's divisible surplus through annual cash dividends
   - Dividends can be taken as cash or left to accumulate with interest
   - Non-guaranteed but based on company performance
   - Historical dividend track record available

4. CRITICAL ILLNESS COVERAGE
   - Coverage for 36 critical illnesses built-in
   - Early stage and major critical illness benefits
   - Separate benefit from death benefit
   - Comprehensive protection against medical emergencies

5. GUARANTEED CASH VALUE
   - Policy builds guaranteed cash value over time
   - Can be used as loan collateral
   - Partial withdrawal options available
   - Surrender value if policy is terminated

6. TOTAL PERMANENT DISABILITY (TPD) WAIVER
   - Waiver of premium if TPD occurs before age 65
   - Coverage continues without further premium payment
   - Provides financial relief during disability

7. FLEXIBILITY FEATURES
   - Policy loan facility (up to 80% of cash value)
   - Partial withdrawal options after certain years
   - Automatic Premium Loan option to prevent lapse
   - Premium holiday options in certain conditions

Target Market:
- Families seeking affordable, guaranteed lifetime protection
- Individuals who prefer traditional insurance over investment-linked
- Breadwinners wanting to ensure family financial security
- Those uncomfortable with market-linked investment products
- Clients seeking guaranteed cash value accumulation

Competitive Advantages:
- Most affordable entry into Pru Life UK insurance
- Guaranteed benefits with no market risk
- Participating policy shares company profits
- Coverage continues for life after premium payment period
- 36 critical illnesses covered built-in
- Strong company track record of dividend payouts

Important Exclusions & Limitations:
- Suicide exclusion within first 2 years
- Pre-existing critical illness conditions excluded
- Dividends are non-guaranteed
- Early surrender may result in loss
- Cash value builds gradually over time
- TPD waiver coverage ends at age 65

Premium Payment & Charges:
- Fixed premium throughout payment period
- No premium allocation charges (traditional insurance)
- Cost of insurance built into premium structure
- Surrender charges apply if policy terminated early

Ideal Client Profile for John (Creative Director & Freelancer, 42):

John is a practical family man with irregular income from freelancing. PRULove for Life is ideal for him because:
- Most affordable option at PhP 12,000 minimum annual premium
- Traditional structure easier to understand than investment-linked products
- Guaranteed benefits provide certainty despite irregular income
- 36 critical illnesses coverage protects family from medical costs
- Shorter payment terms (5 or 10 years) can be planned during good earning periods
- Coverage continues for life protecting wife and children permanently
- Cash value builds as emergency fund without market risk
- Participating feature provides upside potential without downside risk

Your Role as the Prospect:
You should engage authentically based on your persona's financial situation, priorities, and objections. Ask questions about guaranteed vs. non-guaranteed benefits, payment flexibility with irregular income, and how this compares to investment-linked products.`,
    evaluationFocus: [
      'Agent clearly explains traditional vs. investment-linked insurance differences',
      'Agent emphasizes guaranteed benefits and affordability for family protection',
      'Agent addresses irregular income concerns with payment term flexibility',
      'Agent explains participating policy concept and dividend potential realistically',
      'Agent connects 36 critical illness coverage to family financial security',
    ],
  },
  {
    _id: '694a20000000000000000005',
    friendlyId: 'prulifetime-income-ph',
    name: 'PRULifetime Income',
    productType: ProductType.OWN,
    modules: ['prudential-ph-fact-finding'],
    salesTarget: 'individual',
    keyFeatures: [
      'Guaranteed 5% annual payout from year 6 onwards (based on Face Amount)',
      'Payment terms: 5 or 10 years (income for life)',
      'Minimum annual premium varies by age and Face Amount',
      'Guaranteed death benefit of 200% Face Amount',
      'Critical Illness coverage for 36 critical illnesses',
      'Total Permanent Disability (TPD) waiver of premium',
      'Lifetime income stream for retirement planning',
    ],
    featureHighlight: {
      title: 'Guaranteed Lifetime Income for Retirement and Legacy Planning',
      description:
        'PRULifetime Income is the ONLY Pru Life UK product that guarantees a 5% annual payout for life starting from year 6, providing predictable retirement income that never stops. With a guaranteed death benefit of 200% of Face Amount, it combines retirement income security with substantial legacy planning. The short payment period (5 or 10 years) allows pre-retirees to fund the policy while working, then enjoy guaranteed income throughout retirement—addressing both longevity risk and wealth transfer needs.',
    },
    callCriteria: {
      tl: {
        title: 'PRULifetime Income',
        description:
          'Upang makakuha ng pinakamataas na marka sa session na ito, siguraduhing matugunan ang lahat ng pangunahing pamantayan:',
        criteria: [
          'Ipaliwanag nang malinaw ang guaranteed lifetime income mechanism at timeline',
          'Ikonekta ang produkto sa retirement income continuity at legacy planning needs',
          'Harapin ang mga alalahanin kaugnay ng edad at positioning ng insurance sa later life stage',
          'Magbigay ng konkretong halimbawa gamit ang Face Amount calculations',
          'Ipakita ang pagkakaiba mula sa ibang produkto na may unique income guarantee feature',
        ],
      },
    },
    knowledgePrompt: `You are a prospect discussing PRULifetime Income with a Pru Life UK insurance agent during a fact-finding and product pitch session.

Product Overview:
PRULifetime Income is a participating life insurance plan specifically designed for retirement income and legacy planning. It guarantees a 5% annual payout for life starting from year 6, providing predictable income during retirement while ensuring a substantial death benefit for loved ones.

Key Product Features:
1. GUARANTEED LIFETIME INCOME
   - 5% of Face Amount paid annually starting year 6
   - Income continues for entire lifetime (up to age 100)
   - Guaranteed - not dependent on company performance
   - Predictable cash flow for retirement planning

2. FLEXIBLE PAYMENT TERMS
   - 5-year or 10-year premium payment terms
   - Coverage and income continue for life after payment period
   - Plan ahead to complete payments before retirement
   - Income starts during or after premium payment period

3. SUBSTANTIAL DEATH BENEFIT
   - Guaranteed 200% of Face Amount upon death
   - Provides significant legacy for beneficiaries
   - Death benefit continues even after receiving income payouts
   - Not reduced by income received

4. CRITICAL ILLNESS PROTECTION
   - Coverage for 36 critical illnesses
   - Early stage and major critical illness benefits
   - Separate from death benefit and income stream
   - Financial protection against medical emergencies

5. TPD WAIVER OF PREMIUM
   - Premium waived if TPD occurs before age 65
   - Income stream continues without further premium payment
   - Coverage remains intact during disability

6. PARTICIPATING POLICY BENEFITS
   - May receive additional cash dividends (non-guaranteed)
   - Based on company's divisible surplus performance
   - Dividends supplement guaranteed income stream

7. INCOME FLEXIBILITY
   - Receive income as cash annually
   - Option to accumulate income with interest
   - Can be used for living expenses, reinvestment, or gifting
   - Tax advantages on income payouts

Premium Structure:
- Minimum Face Amount and premium vary by age
- Younger ages have lower premiums for same Face Amount
- Higher Face Amount means higher guaranteed annual income
- Premium fixed throughout payment period

Example Illustration (for reference):
If Face Amount = PhP 1,000,000:
- Annual income from year 6: PhP 50,000 (5% of PhP 1M) guaranteed for life
- Death benefit: PhP 2,000,000 (200% of PhP 1M)
- Premium payment: 5 or 10 years only

Target Market:
- Individuals nearing or in retirement (50-65 age group)
- High net worth individuals seeking guaranteed income
- Those prioritizing legacy planning for heirs
- Retirees wanting predictable supplemental income
- Individuals seeking estate planning solutions

Competitive Advantages:
- ONLY Pru Life UK product with guaranteed lifetime income stream
- Higher death benefit (200%) provides substantial legacy
- Income guaranteed regardless of company performance
- Short premium payment period (5-10 years)
- Combines retirement income + protection + legacy planning in one product
- Participating feature provides additional upside potential

Important Exclusions & Limitations:
- Suicide exclusion within first 2 years
- Pre-existing critical illness conditions excluded
- Higher premium requirement compared to traditional whole life
- Income starts only from year 6 (not immediate)
- Cash dividends are non-guaranteed
- Early surrender results in significant loss

Premium Payment & Charges:
- Fixed premium throughout 5 or 10 year payment period
- Traditional insurance structure (no premium allocation charges)
- Cost of insurance and income guarantee built into premium
- Surrender charges apply if terminated early

Ideal Client Profile for Denny (Retiree, 65):

Denny is nearing or already in retirement, focused on income continuity and legacy planning. PRULifetime Income is perfect for him because:
- Guaranteed 5% annual payout provides predictable retirement income supplement
- Short payment period (5 years) can be funded from existing savings or retirement funds
- Income starts soon (year 6) aligning with retirement timeline
- 200% death benefit ensures significant legacy for loved ones
- Critical illness coverage protects retirement savings from medical costs
- Guaranteed income addresses longevity risk (outliving savings)
- Participating feature provides potential for additional income
- Estate planning tool - predictable income + substantial death benefit

Common Objections to Address:
- "I'm too old to start insurance" - Addresses need for income continuity and legacy
- "No savings to commit" - Short payment period can use existing retirement funds
- "I need income now" - Income starts year 6; bridge with other sources

Your Role as the Prospect:
You should engage authentically based on your persona's financial situation, priorities, and objections. Ask questions about income timing, payment affordability at retirement age, legacy benefits, and how this compares to other retirement income solutions.`,
    evaluationFocus: [
      'Agent clearly explains guaranteed lifetime income mechanism and timeline',
      'Agent connects product to retirement income continuity and legacy planning needs',
      'Agent addresses age-related concerns and positioning insurance at later life stage',
      'Agent illustrates concrete examples with Face Amount calculations',
      'Agent differentiates from other products emphasizing unique income guarantee feature',
    ],
  },
  // Closing Call products (same 4 products, associated with prudential-ph-closing-call module)
  {
    _id: '694a20000000000000000006',
    friendlyId: 'prulink-elite-protector-ph-closing',
    name: 'PRULink Elite Protector Series',
    productType: ProductType.OWN,
    modules: ['prudential-ph-closing-call'],
    salesTarget: 'individual',
    keyFeatures: [
      'Investment-linked life insurance with flexible payment terms (5/7/10/15 years)',
      'High fund allocation up to 125% for 5-year payment term',
      'Minimum annual premium: PhP 85,000',
      'Comprehensive life protection with investment growth potential',
      'Total Permanent Disability (TPD) coverage up to age 65',
      'Access to professionally managed Prulink funds',
      'Living benefit options: Critical Illness, Hospital Income, Accidental Death',
    ],
    featureHighlight: {
      title: 'Premium Investment-Linked Insurance with High Fund Allocation',
      description:
        'PRULink Elite Protector Series offers up to 125% fund allocation for 5-year payment terms, meaning more of your premium goes directly into your investment from day one. With flexible payment terms (5/7/10/15 years) and access to professionally managed Prulink funds, this product is designed for high-income earners seeking comprehensive protection combined with significant wealth accumulation potential.',
    },
    callCriteria: {
      tl: {
        title: 'PRULink Elite Protector Series',
        description:
          'Upang makakuha ng pinakamataas na marka sa session na ito, siguraduhing matugunan ang lahat ng pangunahing pamantayan:',
        criteria: [
          'Harapin ang mga objection gamit ang evidence-based na tugon na nakakonekta sa mga specific na feature ng produkto',
          'Lumikha ng urgency gamit ang investment horizon logic nang walang fear-mongering',
          'Gamitin ang mga strategic trial close upang ma-secure ang commitment ng prospect',
        ],
      },
    },
    knowledgePrompt: `You are a prospect in a follow-up in-person closing call with a Pru Life UK insurance agent. You were previously pitched PRULink Elite Protector Series.

Product Overview:
PRULink Elite Protector Series is an investment-linked life insurance plan that combines protection with investment growth potential. The agent previously explained its features and you are now reconsidering.

Key Product Features:
1. Flexible payment terms: 5, 7, 10, or 15 years; minimum annual premium: PhP 85,000
2. High fund allocation up to 125% for 5-year payment term
3. Comprehensive protection: Life insurance, TPD (up to age 65), Critical Illness, Accidental Death, Hospital Income riders
4. Investment component: Access to professionally managed Prulink funds, fund switching flexibility
5. Loyalty bonus and partial withdrawal options

Your Role as the Prospect:
This is a follow-up visit. You are still on the fence and have closing objections. You need to be convinced with evidence-based responses. If the agent handles your objections well and creates appropriate urgency using investment horizon logic, you will eventually agree to purchase.`,
    evaluationFocus: [
      'Agent handles objections with evidence-based responses tied to specific product features',
      'Agent positions product advantages clearly against market alternatives',
      'Agent creates urgency using investment horizon logic without fear-mongering',
      'Agent uses strategic trial closes to gauge and build commitment',
      'Agent secures deal closure by addressing all remaining concerns',
    ],
  },
  {
    _id: '694a20000000000000000007',
    friendlyId: 'prulink-assurance-account-plus-ph-closing',
    name: 'PRULink Assurance Account Plus',
    productType: ProductType.OWN,
    modules: ['prudential-ph-closing-call'],
    salesTarget: 'individual',
    keyFeatures: [
      'Affordable investment-linked life insurance starting at PhP 20,000 annually',
      'Built-in Total Permanent Disability (TPD) rider',
      'Built-in Accidental Death Benefit rider',
      'Loyalty bonus after 10th policy anniversary',
      'Flexible premium payment terms (Regular or Limited Pay)',
      'Access to diversified Prulink investment funds',
      'Additional rider options for comprehensive protection',
    ],
    featureHighlight: {
      title: 'Affordable Investment-Linked Insurance with Built-In Comprehensive Protection',
      description:
        'PRULink Assurance Account Plus is the most accessible entry into Pru Life UK investment-linked insurance, starting at just PhP 20,000 annually. It uniquely includes Total Permanent Disability (TPD) and Accidental Death Benefit riders at no additional cost, providing comprehensive protection from day one.',
    },
    callCriteria: {
      tl: {
        title: 'PRULink Assurance Account Plus',
        description:
          'Upang makakuha ng pinakamataas na marka sa session na ito, siguraduhing matugunan ang lahat ng pangunahing pamantayan:',
        criteria: [
          'Harapin ang mga objection gamit ang evidence-based na tugon na nakakonekta sa mga specific na feature ng produkto',
          'Lumikha ng urgency gamit ang investment horizon logic nang walang fear-mongering',
          'Gamitin ang mga strategic trial close upang ma-secure ang commitment ng prospect',
        ],
      },
    },
    knowledgePrompt: `You are a prospect in a follow-up in-person closing call with a Pru Life UK insurance agent. You were previously pitched PRULink Assurance Account Plus.

Product Overview:
PRULink Assurance Account Plus is an affordable investment-linked life insurance plan combining life insurance, disability protection, and investment growth. Starting at PhP 20,000 annually with built-in TPD and Accidental Death riders at no additional cost.

Key Product Features:
1. Minimum annual premium: PhP 20,000; Regular or Limited Pay options
2. Built-in TPD and Accidental Death Benefit riders at no extra cost
3. Loyalty bonus after 10th policy anniversary
4. Access to professionally managed Prulink funds; fund switching flexibility
5. Optional riders: PRUCrisis Cover, PRUHospital Income, PRUAccident Care Plus

Your Role as the Prospect:
This is a follow-up visit. You are still on the fence and have closing objections. You need to be convinced with evidence-based responses. If the agent handles your objections well and creates appropriate urgency, you will eventually agree to purchase.`,
    evaluationFocus: [
      'Agent handles objections with evidence-based responses tied to specific product features',
      'Agent emphasizes affordability and built-in value while addressing budget concerns',
      'Agent creates urgency using investment horizon logic without fear-mongering',
      'Agent uses strategic trial closes to gauge and build commitment',
      'Agent secures deal closure by addressing all remaining concerns',
    ],
  },
  {
    _id: '694a20000000000000000008',
    friendlyId: 'prulove-for-life-ph-closing',
    name: 'PRULove for Life',
    productType: ProductType.OWN,
    modules: ['prudential-ph-closing-call'],
    salesTarget: 'individual',
    keyFeatures: [
      'Participating whole life insurance with guaranteed cash value',
      'Minimum annual premium: PhP 12,000',
      'Payment terms: 5, 10, 15, or 20 years (coverage for life)',
      'Critical Illness coverage for 36 critical illnesses',
      'Annual cash dividends participation',
      'Total Permanent Disability (TPD) waiver of premium',
      'Flexible loan and withdrawal options',
    ],
    featureHighlight: {
      title: 'Traditional Whole Life Insurance with Guaranteed Lifetime Protection',
      description:
        'PRULove for Life is the most affordable Pru Life UK product at just PhP 12,000 minimum annual premium, providing guaranteed whole life protection with predictable benefits. As a participating policy, it shares in company profits through annual cash dividends while offering built-in coverage for 36 critical illnesses.',
    },
    callCriteria: {
      tl: {
        title: 'PRULove for Life',
        description:
          'Upang makakuha ng pinakamataas na marka sa session na ito, siguraduhing matugunan ang lahat ng pangunahing pamantayan:',
        criteria: [
          'Harapin ang mga objection gamit ang evidence-based na tugon na nakakonekta sa mga specific na feature ng produkto',
          'Lumikha ng urgency gamit ang investment horizon logic nang walang fear-mongering',
          'Gamitin ang mga strategic trial close upang ma-secure ang commitment ng prospect',
        ],
      },
    },
    knowledgePrompt: `You are a prospect in a follow-up in-person closing call with a Pru Life UK insurance agent. You were previously pitched PRULove for Life.

Product Overview:
PRULove for Life is a participating whole life insurance plan providing guaranteed protection for life with potential annual cash dividends. Minimum annual premium PhP 12,000 with payment terms of 5, 10, 15, or 20 years.

Key Product Features:
1. Minimum annual premium: PhP 12,000; coverage continues for entire lifetime after payment period
2. Coverage for 36 critical illnesses built-in
3. Participating policy: Shares in company divisible surplus through annual dividends
4. Guaranteed cash value builds over time; policy loan facility up to 80% of cash value
5. TPD waiver of premium if TPD occurs before age 65

Your Role as the Prospect:
This is a follow-up visit. You are still on the fence and have closing objections. You need to be convinced with evidence-based responses. If the agent handles your objections well and creates appropriate urgency, you will eventually agree to purchase.`,
    evaluationFocus: [
      'Agent handles objections with evidence-based responses tied to specific product features',
      'Agent emphasizes guaranteed benefits and affordable protection for the family',
      'Agent creates urgency using investment horizon logic without fear-mongering',
      'Agent uses strategic trial closes to gauge and build commitment',
      'Agent secures deal closure by addressing all remaining concerns',
    ],
  },
  {
    _id: '694a20000000000000000009',
    friendlyId: 'prulifetime-income-ph-closing',
    name: 'PRULifetime Income',
    productType: ProductType.OWN,
    modules: ['prudential-ph-closing-call'],
    salesTarget: 'individual',
    keyFeatures: [
      'Guaranteed 5% annual payout from year 6 onwards (based on Face Amount)',
      'Payment terms: 5 or 10 years (income for life)',
      'Minimum annual premium varies by age and Face Amount',
      'Guaranteed death benefit of 200% Face Amount',
      'Critical Illness coverage for 36 critical illnesses',
      'Total Permanent Disability (TPD) waiver of premium',
      'Lifetime income stream for retirement planning',
    ],
    featureHighlight: {
      title: 'Guaranteed Lifetime Income for Retirement and Legacy Planning',
      description:
        'PRULifetime Income guarantees a 5% annual payout for life starting from year 6, providing predictable retirement income that never stops. With a guaranteed death benefit of 200% of Face Amount, it combines retirement income security with substantial legacy planning.',
    },
    callCriteria: {
      tl: {
        title: 'PRULifetime Income',
        description:
          'Upang makakuha ng pinakamataas na marka sa session na ito, siguraduhing matugunan ang lahat ng pangunahing pamantayan:',
        criteria: [
          'Harapin ang mga objection gamit ang evidence-based na tugon na nakakonekta sa mga specific na feature ng produkto',
          'Lumikha ng urgency gamit ang investment horizon logic nang walang fear-mongering',
          'Gamitin ang mga strategic trial close upang ma-secure ang commitment ng prospect',
        ],
      },
    },
    knowledgePrompt: `You are a prospect in a follow-up in-person closing call with a Pru Life UK insurance agent. You were previously pitched PRULifetime Income.

Product Overview:
PRULifetime Income guarantees a 5% annual payout for life starting from year 6, with a 200% death benefit. Short payment period of 5 or 10 years. Coverage for 36 critical illnesses and TPD waiver of premium.

Key Product Features:
1. 5% of Face Amount paid annually from year 6 — guaranteed for life
2. Guaranteed 200% of Face Amount death benefit
3. Payment terms: 5 or 10 years only; coverage continues for life
4. Critical illness coverage for 36 illnesses; TPD waiver of premium
5. Participating policy: potential additional cash dividends

Your Role as the Prospect:
This is a follow-up visit. You are still on the fence and have closing objections. You need to be convinced with evidence-based responses. If the agent handles your objections well and creates appropriate urgency using investment horizon logic, you will eventually agree to purchase.`,
    evaluationFocus: [
      'Agent handles objections with evidence-based responses tied to specific product features',
      'Agent emphasizes guaranteed lifetime income and legacy planning benefits',
      'Agent creates urgency using investment horizon logic without fear-mongering',
      'Agent uses strategic trial closes to gauge and build commitment',
      'Agent secures deal closure by addressing all remaining concerns',
    ],
  },
];
