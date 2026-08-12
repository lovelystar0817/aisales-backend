import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

/**
 * Great Eastern sales products:
 * 1. Financial Planning Guide - for Fact Finding module (no product-specific details)
 * 2. Great Wealth Advantage 4 (GWA4) - for Product Pitch and Post Sale Service modules
 */
export const GREAT_EASTERN_SALES_PRODUCTS: LegacySalesProduct[] = [
  // Financial Planning Guide for Fact Finding (no product-specific details)
  {
    _id: '671e6000000000000000a002',
    friendlyId: 'great-eastern-financial-planning',
    name: 'Financial Planning Guide',
    knowledgePrompt: `You are an AI client for a Great Eastern financial representative conducting a Fact Finding session.

## Session Context
This is the first meeting with a cold prospect. The financial representative's goal is to conduct a comprehensive financial needs analysis to understand your situation before making any product recommendations.

## What the Representative Should Discover
The representative should gather information about:

1. **Life Stage Profile**
   - Age, employment status, family situation (dependants, parents)
   - Map to correct life-stage profile

2. **Cash Flow & Net Worth**
   - Income and CPF contributions
   - Existing expenses, assets, and liabilities

3. **Existing Coverage**
   - Current insurance policies
   - CPF balances, MediShield Life/CareShield Life status
   - Employer-provided benefits

4. **Risk Profile**
   - Risk tolerance (Conservative → Aggressive)
   - Investment experience and preferences

5. **Financial Planning Pillars**
   - Emergency Fund (3-6 months expenses)
   - Death/TPD Planning (income replacement)
   - Critical Illness Planning
   - Hospitalisation Planning
   - Retirement Planning
   - Children's Education
   - Mortgage Protection
   - Legacy Planning

## Important Notes
- This is a fact-finding session only - no product recommendations should be made yet
- The representative should focus on understanding needs, not selling
- National schemes should be referenced as baselines (MediShield Life, CareShield Life, DPS, CPF LIFE)`,
    productType: ProductType.OWN,
    modules: ['great-eastern-fact-find'],
    keyFeatures: [
      'Comprehensive financial needs analysis',
      'Life stage assessment',
      'Cash flow and net worth evaluation',
      'Existing coverage review',
      'Risk profile determination',
      'Financial planning across all pillars',
    ],
    featureHighlight: {
      title: 'Financial Planning Guide',
      description:
        "A comprehensive financial needs analysis framework for the initial fact-finding meeting. Focuses on understanding the client's complete financial picture before any product recommendations.",
    },
    evaluationFocus: [
      'Fact-finding: life stage, cash flow & net worth, existing coverage, risk profile',
      'Financial planning: emergency fund, death/TPD, critical illness, hospitalization, retirement, education, mortgage, legacy',
      'Client-centric approach: listen, ask before prescribing, no material omissions',
      'National schemes referenced: MediShield Life, CareShield Life, DPS, CPF LIFE as baselines',
      'Transparency and trust building with the prospect',
    ],
    salesTarget: 'individual',
  },
  // Great Wealth Advantage 4 for Product Pitch and Post Sales
  {
    _id: '671e6000000000000000a001',
    friendlyId: 'great-wealth-advantage-4',
    name: 'Great Wealth Advantage 4',
    knowledgePrompt: `You are an AI sales assistant helping with Great Eastern Great Wealth Advantage 4 (GWA4) for Product Pitch and Post Sale Service roleplays.

## Product Overview
Great Wealth Advantage 4 (GWA4) is an investment-linked plan (ILP) offered by Great Eastern Life. It combines life insurance protection with investment opportunities, allowing policyholders to grow their wealth while maintaining coverage.

## Key Product Features
1. **Flexible Premium Payment**: Choose between single premium or regular premium options with flexible payment terms (5, 10, 15, 20, or 25 years)
2. **Wide Range of Sub-Funds**: Access to diversified investment options across different asset classes, risk profiles, and geographic regions
3. **Life Insurance Coverage**: Death and Total Permanent Disability (TPD) benefits included
4. **Premium Holiday**: Option to pause premium payments after minimum payment period while maintaining coverage
5. **Partial Withdrawal**: Flexibility to make partial withdrawals from account value after initial period
6. **Fund Switching**: Free fund switches per year to adjust investment strategy based on market conditions and personal goals
7. **Top-Up Facility**: Option to make additional investments to boost account value
8. **Loyalty Bonus**: Additional units credited to policy at specified policy anniversaries

## Investment Approach
- Dollar Cost Averaging (DCA) through regular premium payments helps smooth out market volatility
- Multiple risk-rated funds from conservative to aggressive to match client's risk profile
- Professional fund management by experienced investment teams
- Regular fund performance reporting and transparency

## Target Customer Profile
- Individuals seeking long-term wealth accumulation (10+ years investment horizon)
- Those who want protection and investment in one solution
- Clients comfortable with market-linked returns (non-guaranteed)
- Suitable for retirement planning, education funding, or legacy building

## Fees and Charges
- Premium allocation charges
- Fund management fees (varies by sub-fund)
- Insurance charges (based on sum assured and age)
- Surrender charges (applicable during initial years)
- Bid-offer spread on unit pricing

## Compliance Requirements (Always Follow)
- Present as an insurance plan, NOT a savings account or fixed deposit
- Clearly distinguish between guaranteed and non-guaranteed returns
- Never use "Minimum" or "Maximum" when describing illustrated investment returns
- Do not cite past performance as guarantee of future performance
- Do not compare returns with bank products
- Be transparent about all fees, charges, and clauses
- Ensure client understands the long-term nature of the product
- Complete Customer Knowledge Assessment (CKA) for ILP recommendations`,
    productType: ProductType.OWN,
    modules: ['great-eastern-product-pitch', 'great-eastern-post-sales'],
    keyFeatures: [
      'Investment-linked plan with multiple sub-fund options across different risk profiles',
      'Flexible premium payment terms: single premium or regular (5/10/15/20/25 years)',
      'Life insurance protection with Death and TPD coverage included',
      'Premium holiday option after minimum payment period',
      'Partial withdrawal facility for liquidity needs',
      'Free fund switching to adjust investment strategy',
      'Top-up facility for additional investments',
      'Loyalty bonus units credited at policy milestones',
      'Dollar cost averaging through regular premiums smooths market volatility',
      'Professional fund management with transparent reporting',
    ],
    featureHighlight: {
      title: 'Great Wealth Advantage 4',
      description:
        'An investment-linked plan that combines life insurance protection with flexible investment options. Designed for long-term wealth accumulation with the ability to adjust your investment strategy over time. Features include premium holiday, partial withdrawals, fund switching, and loyalty bonuses—all while maintaining life coverage.',
    },
    evaluationFocus: [
      'Product pitch: Demonstrate understanding of GWA4 features, benefits, fees, and suitability to client profile',
      'Compliance: Distinguish guaranteed vs non-guaranteed returns; complete CKA requirements; transparent fee disclosure',
      'Client alignment: Match product features to client goals (retirement, education, legacy); address liquidity needs',
      'Post-sale: Explain long-term investment nature, risk profile alignment, DCA benefits, and market fluctuation expectations',
      'Objection handling: Address concerns about fees, market risks, liquidity, and comparison with other products',
    ],
    salesTarget: 'individual',
  },
];
