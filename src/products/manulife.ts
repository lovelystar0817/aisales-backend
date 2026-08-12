import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

// Import product configurations
export { manulifeGoalReadyConfiguration } from './manulifeGoalReadyConfig.js';

/**
 * Manulife financial products for FNA modules
 */
export const MANULIFE_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '671d60000000000000000010',
    friendlyId: 'all-products-exploratory',
    name: 'All Products (Exploratory)',
    // prompt:
    //   'You are an AI sales assistant helping with exploratory sales conversations',
    productType: ProductType.OWN,
    modules: ['fna'],
    salesTarget: 'individual',
    callCriteria: {
      en: {
        title: 'Manulife FNA Scorecard',
        description:
          'To get the best standing in this session, aim to meet all the key evaluation criteria:',
        criteria: [
          'Introduction to Manulife & Facts of Life',
          'Financial Needs, Goal Guide and Conclusion',
        ],
      },
    },
    titleBarHidden: true,
    // No company specified = global product
  },
  {
    _id: '671d60000000000000000011',
    friendlyId: 'manulife-goalready',
    name: 'GoalReady',
    knowledgePrompt: `
[MANULIFE GOALREADY PRODUCT INFORMATION FOR VALIDATION]

**Product Overview:**
- Product Name: Manulife GoalReady
- Type: Smart and affordable life and savings plan combining insurance protection with investment benefits
- Target Market: Individuals preparing for retirement, securing child's education, or pursuing personal passions
- Value Proposition: "Take control of your future with goal-based payments, grow your wealth through our expertly managed global and local funds, and get better value for your investment over time"

**Key Value Propositions:**
1. **Boost your earning potential with diverse investment options:**
   - Wide range of high-performing global and local funds
   - Expertly managed funds tailored to goals and risk appetite
   - Fund categories: Fixed Income, Multi-Asset, Equity (both local and global)

2. **Grow your savings with long-term bonus:**
   - 1.75% loyalty bonus on fund value from policy years 6 to 10
   - 0.75% bonus on fund value from policy year 11 onwards
   - Subject to certain conditions (premiums paid regularly, total withdrawals should not exceed all top-ups made)
   - Bonus based on average account value for the last 48 months (excludes top-ups, Premium Extensions, and reinvested payouts from GMAI Fund)

3. **Start your journey with flexible, goal-based payments:**
   - Choose payment duration: 5 years or longer
   - Minimum annual base premium: PHP 60,000 for Minimum 5-Pay, PHP 24,000 for Regular Pay
   - Stay on track with goals at your own pace

4. **Protect your goals with life insurance coverage:**
   - Coverage until age 99 or until fund value is depleted
   - Add optional health and protection riders to safeguard savings
   - Protection in case of hospitalization or disability

**Death Benefit Options:**

1. **Face Plus (Protection-Focused):**
   - Coverage: 100% of Face Amount + 125% of all top-ups + Account Value
   - Best for: Higher protection coverage than savings

2. **Level Face (Savings-Focused):**
   - Coverage: Higher of (Face Amount + 125% of top-ups - 125% of partial withdrawals) OR 110% of Account Value
   - Best for: Higher savings than protection coverage

**Customizable Protection Coverage:**
- Face Amount Calculation: Annual Base Premium × Face Amount Multiplier
- Face Amount Multiplier ranges based on issue age:
  - Age 0-50: 5x to 60x
  - Age 51-55: 5x to 45x
  - Age 56-60: 5x to 30x
  - Age 61-65: 5x to 20x
  - Age 66-70: 5x to 15x

- Multiplier can be increased/decreased:
  - Within first 6 months: Adjust multiplier with corresponding premium change
  - After 5 years: Decrease multiplier without changing base premium
  - Before age 70: Increase multiplier without additional premiums (subject to underwriting)
  - Higher multiplier = higher Cost of Insurance charges = lower Account Value

**Life Event Benefit:**
- Increase coverage one-time by 20% (up to PHP 1M) during major life events
- No medical examination required
- No additional premiums required (but COI increases)
- Life events covered: Marriage, Birth/Adoption of Child, 10th Policy Year, Retirement
- Proof required within 180 days from event date
- Insured must be below 65 years old

**Packaged Riders:**
1. **Accidental Death Benefit (ADB):** Additional accident coverage
2. **Total Disability Waiver (TDW):** Waives premiums if insured becomes totally disabled before age 60 and remains disabled for 6+ consecutive months
3. **Payor's Benefit (PB):** Waives premiums upon death or disability of the payor

**Optional Riders:**
1. **Maccimax Plan 1-4:** Death, dismemberment, disability, and hospitalization from accidents
2. **Term Rider:** Additional death benefit
3. **Hospital Income Benefit:** Hospitalization allowance (max 1000 days), doubled for dread disease, tripled for ICU

**Investment Fund Options:**

**Fixed Income Funds:**
- Peso Secure Fund
- Peso Cash (Fund Switch only)

**Multi-Asset Funds (Local):**
- Peso Diversified Value Fund
- Peso Dynamic Allocation Fund
- Peso Wealth Optimizer Fund 2036

**Multi-Asset Funds (Global):**
- Peso Global Multi-Asset Income Fund (GMAI)
  - Diversified across assets: stocks, bonds, REITs, preferred securities, options
  - Geographic diversification: U.S., Europe, Japan, Asia
  - Flexibility to allocate between equity, fixed income, and hedging strategies
  - Top holdings include: NVIDIA, Microsoft, Broadcom, Amazon, Apple

**Equity Funds (Local):**
- Peso Growth Fund
- Peso Powerhouse Fund
- Peso Emperor Fund

**Equity Funds (Global):**
- Peso Global Market Leaders Fund (GMLF)
  - Focus on high-quality global stocks and well-known brands
  - Superior long-term growth potential
  - 2024 PHP Total Return: 22.60%
  - 10Y Average Benchmark Return: 12.08%
- Peso US Growth Fund
- Peso Tiger Growth Fund
- Peso Global Health Fund

**Suggested Fund Allocations:**
- **High Risk:** 50% GMAI + 50% GMLF (assumed 10% fund growth rate)
- **Medium Risk:** 75% GMAI + 25% Peso Secure Fund (assumed 7% fund growth rate)
- **Low Risk:** 100% Peso Secure Fund
- Minimum fund allocation: 20%

**Target Customer Profiles:**

1. **Frank (Gen Z)** - 27-year-old young professional:
   - Goal: Build dream retirement beach house over next 15 years
   - Strategy: Grow money through high-risk fund allocation
   - Example: PHP 40,000 annual premium + PHP 50,000 lump-sum top-up yearly

2. **Iris (Millennial)** - 35-year-old mom:
   - Goal: Send daughter to top university over next 15 years
   - Strategy: Save for child's education (medical school)
   - Example: PHP 150,000 face amount, medium risk allocation

3. **Dina (Millennial)** - 40-year-old budding entrepreneur:
   - Goal: Expand business operations over next decade
   - Strategy: Focus on business scaling (physical store, equipment, staff)
   - Example: PHP 250,000 annual premium with recurring top-ups and premium extensions

4. **Dan (Gen X)** - 50-year-old C-level executive:
   - Goal: Enjoy golden years with family (traveling) over next 15 years
   - Strategy: Retirement planning with medium-risk allocation
   - Example: PHP 350,000 annual premium

**Important Features:**
- Policy can be customized based on specific financial goals
- Investment returns are not guaranteed and depend on fund performance
- Account Value can grow or decrease based on fund performance
- Cost of Insurance (COI) charges deducted from Account Value
- Fund switching allowed with minimum fund allocation of 20%
- Partial withdrawals may affect death benefit and long-term value

**About Manulife:**
- Leading international financial services provider
- Global headquarters in Toronto, Canada
- Operating in Philippines since 1907
- One of the leading life insurance companies in the country
- Part of Manulife Financial Corporation (among world's largest life insurance companies by market capitalization)

**Important Disclaimers:**
- Not a deposit product
- Earnings are not assured and principal amount invested is exposed to risk of loss
- Benefits and risks must be thoroughly explained before purchase
- Material contains only brief description - complete terms in Policy Contract
- In case of conflict, Policy Contract prevails
`,
    productType: ProductType.OWN,
    modules: ['manulife-product-pitch'],
    salesTarget: 'individual',
    keyFeatures: [
      'Smart and affordable life and savings plan combining insurance protection with investment benefits',
      'Life insurance coverage until age 99 or until fund value is depleted',
      'Long-term loyalty bonus: 1.75% of fund value from years 6-10, 0.75% from year 11 onwards',
      'Flexible goal-based payment duration: 5 years or longer',
      'Wide range of high-performing global and local funds (Fixed Income, Multi-Asset, Equity)',
      'Two death benefit options: Face Plus (protection-focused) and Level Face (savings-focused)',
      'Customizable face amount multipliers from 5x to 60x based on age',
      'Life Event Benefit: increase coverage by 20% (up to PHP 1M) during major life events without medical exam',
      "Packaged riders: Accidental Death Benefit, Total Disability Waiver, Payor's Benefit",
      'Optional riders: Maccimax Plans, Term Rider, Hospital Income Benefit',
      'Fund switching flexibility with minimum 20% allocation per fund',
      'Suggested fund allocations based on risk profile (High/Medium/Low)',
      'Minimum annual premium: PHP 60,000 (5-Pay) or PHP 24,000 (Regular Pay)',
    ],
    featureHighlight: {
      title:
        'Goal-based wealth accumulation with comprehensive life insurance protection',
      description:
        'Manulife GoalReady is a versatile life and savings plan that combines insurance protection until age 99 with investment growth through expertly managed global and local funds. Build your wealth with long-term loyalty bonuses (1.75% for years 6-10, 0.75% thereafter), flexible premium payment terms, and customizable coverage that adjusts with your life milestones—all designed to help you achieve your financial goals whether for retirement, education, or business expansion.',
    },
    evaluationFocus: [
      '**Product Understanding**: Clear explanation of GoalReady as a combined life insurance and investment product',
      '**Four Key Value Propositions**: Ability to articulate diverse investment options, long-term bonus, flexible payments, and life insurance coverage',
      '**Long-term Bonus Structure**: Correct knowledge of 1.75% bonus (years 6-10) and 0.75% bonus (year 11 onwards) with qualifying conditions',
      '**Death Benefit Options**: Understanding of Face Plus (protection-focused) vs Level Face (savings-focused) and their calculations',
      '**Face Amount Multipliers**: Knowledge of age-based multiplier ranges (5x-60x) and adjustment rules',
      '**Life Event Benefit**: Understanding of 20% coverage increase during major life events without medical exam',
      '**Rider Options**: Knowledge of packaged riders (ADB, TDW, PB) and optional riders (Maccimax, Term, Hospital Income)',
      '**Fund Categories**: Understanding of Fixed Income, Multi-Asset, and Equity funds (both local and global)',
      '**Key Fund Features**: Knowledge of GMAI (diversified multi-asset) and GMLF (global market leaders) characteristics',
      '**Risk-Based Allocations**: Understanding of suggested fund allocations for High/Medium/Low risk profiles',
      '**Premium Requirements**: Correct minimum premiums (PHP 60,000 for 5-Pay, PHP 24,000 for Regular Pay)',
      '**Target Market Alignment**: Appropriate positioning for different customer profiles (Gen Z professionals, Millennials, Gen X)',
      '**Use Case Examples**: Knowledge of Frank, Iris, Dina, and Dan personas and their specific goals',
      '**Investment Flexibility**: Understanding of fund switching, top-ups, and minimum 20% allocation per fund',
      '**Coverage Flexibility**: Knowledge of multiplier adjustments (within 6 months, after 5 years, before age 70)',
      '**Risk Disclosures**: Clear communication that earnings are not assured and principal is at risk',
      '**Cost of Insurance Impact**: Understanding that higher multipliers increase COI charges and decrease Account Value',
      '**Policy Termination**: Knowledge that coverage ends at age 99 or fund value depletion',
      '**Competitive Positioning**: Ability to explain advantages over traditional savings or pure investment products',
      "**Assessment Distinction**: Distinction between general improvement areas ('warning') and factual errors about GoalReady ('error')",
    ],
    callCriteria: {
      en: {
        title: 'Manulife GoalReady Scorecard',
        description:
          'To get the best standing in this session, aim to meet all the key evaluation criteria:',
        criteria: [
          'Soft Skills',
          'Product Knowledge',
          'Sales & Negotiation Skills',
        ],
      },
      tl: {
        title: 'Manulife GoalReady Scorecard',
        description:
          'Upang makakuha ng pinakamahusay na standing sa session na ito, layuning matugunan ang lahat ng pangunahing pamantayan sa pagsusuri:',
        criteria: [
          'Mga Kasanayan sa Pakikipag-ugnayan',
          'Kaalaman sa Produkto',
          'Mga Kasanayan sa Pagbebenta at Negosasyon',
        ],
      },
    },
    titleBarHidden: true,
  },
];
