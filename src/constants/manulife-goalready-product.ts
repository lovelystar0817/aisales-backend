// src/constants/manulife-goalready-product.ts

export interface GoalReadyProductDetails {
  productName: string;
  tagline: string;
  keyFeatures: string[];
  benefits: {
    retirement: string[];
    education: string[];
    flexibility: string[];
    protection: string[];
  };
  premiumStructure: {
    paymentOptions: string[];
    flexibilityFeatures: string[];
  };
  guaranteedReturns: {
    description: string;
    projections: string[];
  };
  vsCompetitors: {
    vulComparison: string[];
    advantages: string[];
  };
}

export const GOALREADY_PRODUCT_DETAILS: GoalReadyProductDetails = {
  productName: 'GoalReady',
  tagline: 'Plan the future you want today with Manulife GoalReady',
  keyFeatures: [
    'Smart and affordable life and savings plan combining insurance protection with investment benefits',
    'Goal-based payments with flexible payment duration (5 years or longer)',
    'Life insurance coverage up to age 99',
    'Long-term bonus: 1.75% on fund value from years 6-10, then 0.75% from year 11 onwards',
    'Diverse investment options: Portfolio Secure (low risk), Portfolio Balance (medium risk), Portfolio Balance (high risk)',
    'Customizable protection coverage through face amount multipliers (5x to 60x)',
    'Optional health and protection riders available',
    'Life Event Benefit - increase coverage by 20% (up to PHP 1M) during major life events without medical exam',
  ],
  benefits: {
    retirement: [
      'Build stable long-term fund for retirement planning',
      'Ideal for self-employed individuals without employer pension',
      'Guaranteed cash values for retirement income',
      'Expertly managed global and local funds for growth potential',
      'Accumulated dividends can supplement retirement income',
    ],
    education: [
      "Secure funding for child's education through structured savings",
      "Payor's Benefit rider waives premiums upon death or disability of payor",
      'Long-term growth through compounding returns',
      'Flexible withdrawal options when education funding is needed',
      'Peace of mind that education goals stay on track',
    ],
    flexibility: [
      'Choose payment duration that fits your lifestyle (minimum 5 years or pay-to-goal)',
      'Flexible premium payment options: 5-Pay or Pay-to-Goal',
      'Minimum annual premium: PHP 60,000 for 5-Pay, PHP 24,000 for Pay-to-Goal',
      'Option to make lump-sum top-ups or premium extensions',
      'Ability to adjust face amount multiplier within first 6 months',
      'Policy loans available using cash values',
    ],
    protection: [
      'Life insurance coverage up to age 99 or until fund value depleted',
      'Two death benefit options: Face Plus (protection-focused) or Level Face (savings-focused)',
      'Accidental Death Benefit for additional protection',
      'Total Disability Waiver - premiums waived if insured becomes totally disabled',
      'Optional riders: Maccimax Plan 1-4, Term Rider, Hospital Income Benefit',
      'Life Event Benefit for major milestones (marriage, birth, 10th policy year, retirement)',
    ],
  },
  premiumStructure: {
    paymentOptions: [
      '5-Pay: Minimum 5 years payment period, PHP 60,000 minimum annual premium, PHP 300,000 minimum coverage',
      'Pay-to-Goal: Minimum 10 years payment period, PHP 24,000 minimum annual premium, PHP 300,000 minimum coverage',
      'Annual, semi-annual, quarterly, or monthly payment modes available',
      'Premium flexibility with top-ups and extensions',
    ],
    flexibilityFeatures: [
      'Lump-sum top-ups allowed to boost investment',
      'Premium extensions available to continue contributions beyond initial payment period',
      'Recurring top-ups for systematic additional savings',
      'Policy loan facility using cash values (subject to interest)',
      'Partial withdrawal options (may affect coverage)',
    ],
  },
  guaranteedReturns: {
    description:
      'GoalReady offers guaranteed cash values plus loyalty bonus. Long-term bonus of 1.75% on average account value from policy years 6-10, then 0.75% from year 11 onwards. Dividends are possible but not guaranteed.',
    projections: [
      'Sample Frank (27yo male, Pay-to-Goal age 42): PHP 413,609 fund value at year 5, PHP 2.366M at age 42 with loyalty bonus',
      'Sample Iris (35yo female, Pay-to-Goal for child age 2): PHP 1.01M fund value at year 6, PHP 3.59M at year 14 with payor benefit',
      'Sample Dan (50yo male, Pay-to-Goal age 65): PHP 1.26M fund value at year 4, PHP 7.88M at age 65 with loyalty bonus',
      'Sample Dina (40yo female, 5-Pay): PHP 1.19M initial fund value, PHP 4.20M at year 10 with top-ups and extensions',
      'Projections based on assumed fund growth rates of 7-10% depending on fund allocation',
    ],
  },
  vsCompetitors: {
    vulComparison: [
      'GoalReady provides structured goal-based planning vs VUL general investment approach',
      'Loyalty bonus feature enhances long-term value compared to standard VUL products',
      'Goal period alignment ensures disciplined savings tied to specific life goals',
      'Comprehensive protection options with customizable face amount multipliers',
      'Life Event Benefit allows coverage increases without additional medical requirements',
    ],
    advantages: [
      'Manulife has over 100 years of global expertise in insurance and wealth management',
      'Expertly managed global and local investment funds with proven track record',
      'Wide range of fund options: Fixed Income, Multi-Asset, and Equity funds',
      'Access to global markets: North America (74%), Europe (8%), Asia Pacific (6%), Emerging Markets (4%)',
      'Top fund holdings include leading global companies (NVIDIA, Microsoft, Apple, Amazon, Broadcom)',
      'Global Multi-Asset Income Fund: 14.73% PHP total return (2024), 9.28% 10-year average benchmark return',
      'Global Market Leaders Fund: 22.60% PHP total return (2024), 12.08% 10-year average benchmark return',
      'Peso Secure Fund: 2.96% PHP total return (2024), 1.21% 10-year average return for conservative investors',
      'Strong financial stability and claims-paying ability',
      'Comprehensive customer service and advisor support network',
    ],
  },
};

/**
 * Format GoalReady product details into structured prompt text for LLM fact-checking.
 * Pattern follows getDentiPlusProductInfoForPrompt() from DentiPlus.ts
 */
export function getGoalReadyProductInfoForPrompt(): string {
  const details = GOALREADY_PRODUCT_DETAILS;

  return `
[GOALREADY PRODUCT REFERENCE - USE FOR FACT-CHECKING STATEMENTS]

**PRODUCT NAME & TAGLINE:**
- Product: ${details.productName}
- Tagline: "${details.tagline}"
- Description: ${details.keyFeatures[0]}

**KEY FEATURES:**
${details.keyFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

**PREMIUM STRUCTURE (CRITICAL FOR ACCURACY):**
${details.premiumStructure.paymentOptions.map((opt) => `- ${opt}`).join('\n')}

**LOYALTY BONUS (EXACT PERCENTAGES):**
- ${details.guaranteedReturns.description}

**BENEFITS BY CATEGORY:**

Retirement Planning:
${details.benefits.retirement.map((b) => `  - ${b}`).join('\n')}

Education Funding:
${details.benefits.education.map((b) => `  - ${b}`).join('\n')}

Flexibility Features:
${details.benefits.flexibility.map((b) => `  - ${b}`).join('\n')}

Protection Coverage:
${details.benefits.protection.map((b) => `  - ${b}`).join('\n')}

**INVESTMENT OPTIONS:**
- Portfolio Secure (low risk)
- Portfolio Balance (medium risk)
- Portfolio Growth (high risk)

**FACE AMOUNT MULTIPLIERS:**
- Customizable: 5x to 60x coverage

**FUND PERFORMANCE DATA:**
${details.vsCompetitors.advantages
  .filter((a) => a.includes('Fund:'))
  .map((f) => `- ${f}`)
  .join('\n')}

**COMMON MISCONCEPTIONS TO FLAG AS INCORRECT:**
1. Minimum premium amounts (MUST be PHP 60,000 for 5-Pay OR PHP 24,000 for Pay-to-Goal)
2. Payment period requirements (5-Pay = 5+ years, Pay-to-Goal = 10+ years)
3. Loyalty bonus timing/percentages (1.75% years 6-10, then 0.75% from year 11)
4. Withdrawal flexibility (partial withdrawals may affect coverage and incur charges - not "anytime freely")
5. Face amount multipliers (5x-60x, not other ranges)
6. Minimum coverage amount (PHP 300,000)

**VS COMPETITORS (VUL COMPARISON):**
${details.vsCompetitors.vulComparison.map((v) => `- ${v}`).join('\n')}

**ASSESSMENT GUIDELINES:**
- Extract ONLY statements about product features, benefits, premiums, or terms
- Categorize based on factual accuracy against this reference
- CORRECT: Matches reference accurately
- WARNING: Partially correct but missing important context or oversimplified
- INCORRECT: Contradicts reference or contains factual errors (provide correction)
- Ignore speech-to-text artifacts (typos, pronunciation variations)
`;
}
