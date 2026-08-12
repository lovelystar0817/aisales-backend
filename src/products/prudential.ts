import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';
import { ProductConfiguration } from './types.js';

/**
 * Get Prudential-specific callCriteria for all-products-exploratory
 * @param languageCode The language code
 * @returns CallCriteria object or null
 */
export const getPrudentialColdCallCriteria = (languageCode: string) => {
  const callCriteriaMap = {
    en: {
      title: 'Prudential Cold Call Scorecard',
      description:
        'To get the best standing in this session, aim to meet all the key evaluation criteria:',
      criteria: [
        'Complete client verification',
        'Apply the 4C (Capture, Context, Conflict, Closure) framework',
        'Handle objections',
      ],
    },
    id: {
      title: 'Kartu Skor Cold Call Prudential',
      description:
        'Untuk mendapatkan posisi terbaik dalam sesi ini, usahakan memenuhi semua kriteria evaluasi utama:',
      criteria: [
        'Selesaikan verifikasi klien',
        'Terapkan kerangka 4C (Capture, Context, Conflict, Closure)',
        'Tangani keberatan',
      ],
    },
    ms: {
      title: 'Kad Skor Cold Call Prudential',
      description:
        'Untuk mendapat kedudukan terbaik dalam sesi ini, usahakan memenuhi semua kriteria penilaian utama:',
      criteria: [
        'Lengkapkan pengesahan pelanggan',
        'Gunakan kerangka 4C (Capture, Context, Conflict, Closure)',
        'Kendalikan bantahan',
      ],
    },
    tl: {
      title: 'Prudential Cold Call Scorecard',
      description:
        'Para makakuha ng pinakamataas na marka sa session na ito, sikaping matugunan ang lahat ng key evaluation criteria:',
      criteria: [
        'Kumpletuhin ang client verification',
        'Gamitin ang 4C (Capture, Context, Conflict, Closure) framework',
        'Pamahalaan ang mga objections',
      ],
    },
    vi: {
      title: 'Thẻ Điểm Cold Call Prudential',
      description:
        'Để đạt được vị trí tốt nhất trong phiên này, hãy cố gắng đáp ứng tất cả các tiêu chí đánh giá chính:',
      criteria: [
        'Hoàn thành xác minh khách hàng',
        'Áp dụng khung 4C (Capture, Context, Conflict, Closure)',
        'Xử lý các phản đối',
      ],
    },
    th: {
      title: 'บัตรคะแนน Cold Call Prudential',
      description:
        'เพื่อให้ได้ผลลัพธ์ที่ดีที่สุดในเซสชันนี้ ให้มุ่งมั่นตอบสนองเกณฑ์การประเมินหลักทั้งหมด:',
      criteria: [
        'ทำการยืนยันตัวตนลูกค้าให้สมบูรณ์',
        'ใช้กรอบ 4C (Capture, Context, Conflict, Closure)',
        'จัดการกับข้อโต้แย้ง',
      ],
    },
    cmn: {
      title: '保德信陌生開發評分卡',
      description:
        '為了在此次練習中獲得最佳成績，請努力達成以下所有關鍵評估標準：',
      criteria: [
        '完成客戶身份驗證',
        '運用4C（Capture掌握、Context情境、Conflict衝突、Closure結案）框架',
        '處理客戶異議',
      ],
    },
  };

  return (
    callCriteriaMap[languageCode as keyof typeof callCriteriaMap] ||
    callCriteriaMap.en
  );
};

/**
 * Prudential company specific products - focused on financial services (module-specific for cold calling)
 */
export const PRUDENTIAL_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '671c60000000000000000000',
    friendlyId: 'all-products-exploratory',
    name: 'All Products (Exploratory)',
    // knowledgePrompt:
    //   'You are an AI sales assistant helping with exploratory sales conversations',
    productType: ProductType.OWN,
    modules: ['cold-call'],
    salesTarget: 'individual',
    titleBarHidden: true,
  },
  {
    _id: '671c60000000000000000001',
    friendlyId: 'prushield',
    name: 'PRUShield',
    knowledgePrompt: `
[PRUSHIELD PRODUCT INFORMATION FOR VALIDATION]

**Product Overview:**
- Product Family: PRUShield Premier, PRUShield Plus, PRUShield Standard (legacy: PRUShield A & B)
- Type: Integrated Shield Plan - Enhancement plan offered on top of MediShield Life
- Coverage: Additional benefits for hospitalization in restructured hospitals and private hospitals
- Target Market: Singaporeans and Singapore Permanent Residents (also available for foreigners as private health insurance)
- Value Proposition: "Better Healthcare Coverage, for Better Lives" with three pillars: Better Coverage, Better Healthcare Experience, Better Savings

**Current Plan Options & Coverage Limits:**
- **PRUShield Premier**: Policy Year Limit S$2 million (at Panel Providers), S$1.2 million (Non-Panel), Unlimited Lifetime Limit
- **PRUShield Plus**: Policy Year Limit S$1 million with Refresh Benefit, Unlimited Lifetime Limit
- **PRUShield Standard**: Basic coverage (specific limits vary)
- **Legacy Plans**: PRUShield A (S$150,000/year), PRUShield B (S$120,000/year) - for existing policyholders only
- All plans: Renewable yearly up to lifetime, guaranteed renewability

**Key Value Propositions:**
1. **Better Coverage:**
   - High annual coverage with yearly refresh benefit
   - "As-charged" claims vs in-line limits for each benefit
   - One of the lowest out-of-pocket expenses in the market

2. **Better Healthcare Experience:**
   - PRUPanel Connect value-added services (1000+ specialists)
   - Cashless pre-authorization and enhanced Letter of Guarantee (ELOG)
   - Appointment booking, teleconsultation, concierge services
   - Pre and post-hospitalization coverage: 180 days/365 days for all providers

3. **Better Savings:**
   - One of the lowest premiums in industry (8.8% below average for private plans)
   - 20% PRUWell Reward for no-claims
   - Claims-based premium pricing for fairer costs
   - Access to panel hospitals at more affordable rates

**PRUExtra Supplementary Plans:**
- **PRUExtra Premier CoPay**: Full private hospital access, 95% coverage, S$3,000 stop-loss, claims-based pricing
- **PRUExtra Preferred CoPay**: Panel + selected private hospitals, 95% coverage, claims-based pricing
- **PRUExtra Premier Lite/Plus Lite**: Lower coverage options with reduced deductibles
- Available premium range: S$158-S$659 (Age 30) with 20% PRUWell Reward

**Enhanced Cancer Coverage:**
- **Cancer Drug Treatment**: Up to 20x MediShield Life limits for CDL treatments
- **Cancer Drug Services**: Up to 20x MediShield Life limits (S$72,000/year)
- **Non-CDL Coverage**: S$150,000 annual limit via PRUExtra
- **Multiple Primary Cancers**: Enhanced coverage available on application
- **Combined Coverage**: Up to S$240,000 annual cancer treatment coverage

**Cost Structure (Current Plans):**
- Deductibles: S$1,500-S$3,500 depending on ward class
- Co-insurance: 10% for base plans
- Pro-ration: PRUShield Plus - 85% for private hospitals; PRUShield Premier - None required
- Stop-loss feature: S$3,000 maximum co-payment with PRUExtra Premier/Preferred CoPay

**Premium Payment & Pricing:**
- MediSave payment with cash/cheque top-up
- Claims-based premium pricing (first-in-market approach since 2017)
- 90-day grace period
- Premium benchmarking: 8.8-12.8% below market average

**Unique Features & Services:**
- **MIC@Home**: Mobile Inpatient Care at Home coverage
- **PRUPanel Connect**: Network of 1000+ specialists with value-added services
- **Refresh Benefit**: Policy limit resets for different medical conditions in same year
- **PRUShield EasySwitch**: Seamless switching from other insurers (extended to June 2025)
- **Bill Matching**: Pre-authorization up to S$1 million for cancer treatment

**Key Differentiators vs Competitors:**
- Lowest out-of-pocket costs across claim sizes (S$800 for S$16,000 claims, S$3,000-S$6,000 for S$120,000 claims)
- Most comprehensive PRUPanel Connect services vs competitors
- Claims-based pricing vs traditional age-based pricing
- Competitive cancer coverage (20x vs 15-23x competitors)
- Cashless pre/post-hospitalization benefits

**Legacy Plans (PRUShield A & B) - For Existing Customers:**
- PRUShield A: S$150,000 year limit, higher daily benefits
- PRUShield B: S$120,000 year limit, lower daily benefits, 85% pro-ration for A Ward/Private
- Deductibles: S$1,500-S$3,500 by ward class
- Co-insurance: 10% for both plans
- Annual caps: Cancer Drug Treatment S$42,000 (A), S$36,500 (B)

**Eligibility & Terms:**
- Maximum Entry Age: 75 years old
- Maximum Renewal Age: Lifetime
- Review Period: 60 days from cover start date or 14 days from policy receipt
- Territorial Cover: Singapore with emergency overseas coverage

**Major Exclusions:**
- Pre-existing conditions (unless declared and accepted)
- Congenital anomalies, hereditary conditions
- Mental illness, pregnancy-related treatments (except specific coverage)
- Cosmetic surgery, dental treatment (except medical reasons)
- Treatment for drug addiction, alcoholism
- Self-inflicted injuries, suicide attempts
- Professional sports injuries, hazardous activities
- COVID-19 treatment for at-risk travelers (specific period: 27 Mar 2020 - 20 Oct 2020)
`,
    productType: ProductType.OWN,
    keyFeatures: [
      'Enhancement plan offered on top of MediShield Life for additional coverage',
      'Two plan options: PRUShield A (higher coverage) and PRUShield B (standard coverage)',
      'Covers hospitalization in B2/C wards of restructured hospitals and private hospitals',
      'Renewable yearly up to lifetime with guaranteed renewability',
      'Premium payment through MediSave account with cash top-up if needed',
      'Policy year limits: S$150,000 (Plan A) / S$120,000 (Plan B) with unlimited lifetime limits',
      'Coverage includes inpatient, day surgery, outpatient hospital benefits, and other benefits',
      '10% co-insurance and deductibles ranging from S$1,500 to S$3,500 depending on ward class',
      'Pro-ration applies for Plan B in higher-class wards (85% coverage)',
      'Maximum entry age: 75 years old',
      '60-day review period for policy cancellation with full premium refund',
    ],
    featureHighlight: {
      title:
        'Comprehensive hospitalization coverage with MediSave payment convenience',
      description:
        'PRUShield enhances your MediShield Life coverage with higher benefit limits and broader hospital options. Premiums are automatically deducted from your MediSave account annually, with the flexibility to top up in cash if needed. Plan A offers up to S$150,000 annual coverage while Plan B provides S$120,000, both with lifetime renewability and no lifetime limits.',
    },
    evaluationFocus: [
      '**Current vs Legacy Plans**: Understanding of active PRUShield Premier/Plus vs legacy A/B plans',
      '**Value Proposition**: Ability to articulate "Better Coverage, Better Healthcare Experience, Better Savings"',
      '**Competitive Positioning**: Knowledge of "one of the lowest out-of-pocket expenses" and premium advantages',
      '**Cancer Coverage**: Understanding of enhanced 20x MediShield Life limits and comprehensive CDL/non-CDL coverage',
      '**PRUExtra Supplementary Plans**: Knowledge of different CoPay options and their features',
      '**PRUPanel Connect**: Awareness of 1000+ specialist network and value-added services',
      '**Claims-Based Pricing**: Understanding of first-in-market approach and PRUWell Reward',
      '**PRUShield EasySwitch**: Knowledge of seamless switching benefits and eligibility',
      '**Refresh Benefit**: Understanding of policy limit reset for different medical conditions',
      '**Premium Benchmarking**: Awareness of 8.8-12.8% below market average positioning',
      '**MIC@Home Coverage**: Knowledge of Mobile Inpatient Care at Home benefits',
      '**Stop-Loss Features**: Understanding of S$3,000 maximum co-payment with riders',
      '**Pre-authorization**: Knowledge of bill-matching up to S$1 million for cancer treatment',
      '**Market Statistics**: Awareness of medical inflation trends and healthcare challenges in Singapore',
      "**Distinguish between general improvement areas ('warning') and factual errors about PRUShield ('error')",
    ],
    modules: ['product-positioning'],
    salesTarget: 'individual',
  },
  {
    _id: '671c60000000000000000002',
    friendlyId: 'prulifetime-income-plus',
    name: 'PRULifetime Income Plus (RP)',
    knowledgePrompt: `
## PRODUCT INFORMATION: PRULifetime Income Plus (RP)

### Basic Product Details
- **Product Type**: Regular premium participating whole of life insurance plan denominated in Singapore Dollars
- **Insurance Need**: Wealth Accumulation
- **Policy Type**: Participating
- **Entry Age**: 1 ANB to 70 ANB (Death) | 1 ANB to 64 ANB (Disability Waiver & Retrenchment Benefit)
- **Premium Payment Terms**: 4 or 10 years ONLY
- **Policy Term**: Whole of Life (Upon change of Life Assured, policy matures at Original Life Assured's 110 years of age)
- **Underwriting**: Guaranteed Issuance (GIO) for base plan only; Supplementary Benefits subject to full underwriting
- **Availability**: Cash policy only, NOT available for SRS

### Minimum Premium Requirements
- **4-year payment term**: Minimum Face Value S$45,000
- **10-year payment term**: Minimum Face Value S$23,000
- **Maximum Premium**: Subject to total premiums of S$10 million (GIO aggregation rule)
- **Face Value Formula**: Annual Premium × Premium Payment Term

### Key Benefits

#### Monthly Cash Benefit (Core Feature)
- **Start Date**: From 49th policy month onwards
- **Guaranteed Component**: 0.864% per year of Face Value
- **Non-Guaranteed Component**: 2.004% per year of Face Value (based on 4.25% illustrated investment return)
- **Payment Options**:
  1. Receive as monthly payouts
  2. Accumulate with PACS at prevailing interest rate (current: 2.5% p.a. non-guaranteed)
- **Payment Frequency**: Monthly only (no yearly option available)

#### Death Benefits
**Non-Accidental Death**: Higher of:
- 101% of total premiums paid (excluding supplementary benefits premiums) OR
- 101% of Surrender Value at time of death
- Plus any cash benefit left with company, less amounts owed

**Accidental Death**: Higher of:
- 105% of total premiums paid (excluding supplementary benefits premiums) OR
- 101% of Surrender Value at time of death
- Plus any cash benefit left with company, less amounts owed

#### Disability Waiver Benefit
- **Coverage Period**: Until policy anniversary before life assured turns 70 OR end of premium payment term (whichever earlier)
- **Deferment Period**: 6 months from confirmed onset of Total and Permanent Disability
- **Scope**: Future premiums waived; supplementary benefit premiums NOT waived
- **Frequency**: Only once per policy
- **Age-Based Criteria**:
  - Ages 28 days-15 years: Constant care requirement for 6+ months
  - Ages 16-65 years: Cannot work OR loss of specific body functions
  - Ages 66-70 years: Loss of specific body functions OR inability to perform 3+ Activities of Daily Living for 6+ months

#### Retrenchment Benefit
- **Eligibility**: During premium payment term, before 65th birthday policy anniversary
- **Waiting Period**: 90 days from cover start/reinstatement date
- **Unemployment Requirement**: At least 30 continuous days
- **Payout Structure**:
  - 4-year premium term: 50% of annualized premium
  - 10-year premium term: 100% of annualized premium
- **Frequency**: One-time payment only
- **Requirements**: Working in Singapore, company registered in Singapore, valid employment status

#### Change of Life Assured
- **Timing**: After premium payment term completion only
- **Frequency**: Individual policies (once only), Business organization policies (unlimited)
- **Requirements**: Insurable interest, new life assured's birth date not later than original cover start date
- **Impact**: Policy gets cover expiry date at original life assured's 110th birthday, all supplementary benefits end, maturity benefit payable

### Surrender Value Timeline
- **4-year premium term**: Surrender value after 12 months from first premium due date
- **10-year premium term**: Surrender value after 36 months from first premium due date

### Policy Features Available
- Policy Loan: ✓
- Surgical & Nursing Loan: ✓
- Automatic Premium Loan: ✓
- Convertibility: ✗

### Attachable Supplementary Benefits
- Payer Security Plus (PSP)
- Early Payer Security – on PSP
- Crisis Waiver III
- Early Stage Crisis Waiver

### Important Limitations & Exclusions
- **Suicide Clause**: 12 months from cover start date or reinstatement
- **Pre-existing Condition**: 12 months exclusion period
- **Early Termination**: High costs, surrender value may be less than premiums paid
- **Non-Guaranteed Elements**: Monthly cash benefit non-guaranteed portion varies with participating fund performance
- **Accumulation Interest**: Company reserves right to vary interest rate with 30 days notice

### Target Customers (Appropriate)
- Want monthly cash benefit payments
- Prefer shorter premium payment periods (4 or 10 years)
- Seek wealth accumulation through cash benefit accumulation
- Want to transfer wealth to next generation
- Need retirement lifestyle maintenance
- Want to complement retirement income

### Inappropriate Customers
- Want high protection coverage
- Seek high guaranteed returns
- Want to manage own investment portfolio mix

### Free Look Period
- **Duration**: 14 days from policy receipt
- **Refund**: Full premium refund less medical and other expenses incurred
`,
    productType: ProductType.OWN,
    modules: ['product-positioning'],
    keyFeatures: [
      'Regular premium participating whole life insurance plan in Singapore Dollars',
      'Choice of premium payment terms: 4 or 10 years only',
      'Monthly Cash Benefit starting from 49th policy month (guaranteed 0.864% + non-guaranteed 2.004% per year of Face Value)',
      'Guaranteed Issuance (GIO) - no medical underwriting required for base plan',
      'Death benefit: 101% of total premiums paid or surrender value (105% for accidental death)',
      'Disability Waiver Benefit until age 70',
      'Retrenchment Benefit (50% of annual premium for 4-year term, 100% for 10-year term)',
      'Change of Life Assured option for wealth transfer',
      'Policy loans, surgical & nursing loans available',
      "Whole of life coverage (matures at original life assured's 110th birthday if life assured is changed)",
    ],
    featureHighlight: {
      title: 'Monthly Income for Life Starting from Year 4',
      description:
        'Provides guaranteed monthly cash benefit of 0.864% per year plus non-guaranteed 2.004% per year of Face Value, starting from the 49th policy month onwards. Face Value equals Annual Premium multiplied by Premium Payment Term (minimum Face Value: S$45,000 for 4-year term, S$23,000 for 10-year term).',
    },
    evaluationFocus: [
      '**Product Knowledge Assessment**: Provide a partial explanation of the product information, covering some (but not all) of the following key items:',
      '**Headline Solution**: It is an insurance solution that provides a regular stream of monthly income for life',
      "**Client Needs Addressal**: State client's identified financial objective, the justification of how this plan suits client's requirements and financial objectives",
      '**Unique Selling Points**: Monthly cash benefit starting from the 49th month, Other built-in benefits (Disability waiver benefit, retrenchment benefit, change of life assured benefit)',
      '**Coverage Provided**: Death benefit, accidental death benefit',
      '**Guaranteed and Non-Guaranteed Portions**: Cash Benefit, Death Benefit, Maturity Benefit (if any)',
      "**Timeline of Policy**: Available premium payment terms, policy term, how does this solution fits into client's time horizon for this financial objective",
      "**Premium Amount Proposed**: Why this amount is proposed, how can this address client's identified shortfall/gap for the financial objective, find out and explain if this amount is within client's affordability",
      '**Risks and Limitations**: Implication of early surrender or termination, pre-existing conditions, fees and charges involved, risks involved in this plan, free-look period',
      '**Competitive Differentiation**: How this plan differs from fixed deposits and highlight why it offers better benefits for the client',
      '**Accuracy of Product Information**: Correct explanation of monthly cash benefit structure (guaranteed vs non-guaranteed components)',
      '**Operational Knowledge**: Accurate premium payment terms (4 or 10 years only), proper explanation of Guaranteed Issuance (GIO) scope and limitations',
      '**Timing Knowledge**: Correct timing of benefits (monthly cash benefit starts from 49th month), accurate death benefit calculations and accidental death provisions',
      '**Process Understanding**: Proper explanation of surrender value timeline differences between 4-year and 10-year terms',
      '**Customer Suitability**: Understanding of target customer profile and appropriateness',
      '**Feature Knowledge**: Knowledge of unique features like Disability Waiver and Retrenchment Benefits',
      "**Assessment Distinction**: Distinction between general improvement areas ('warning') and factual errors ('error')",
    ],
    salesTarget: 'individual',
  },
  {
    _id: '671c60000000000000000003',
    friendlyId: 'pruvantage-assure-ii',
    name: 'PRUVantage Assure II',
    knowledgePrompt: `
## PRODUCT INFORMATION: PRUVantage Assure II

### Basic Product Details
- **Product Type**: Regular premium whole of life investment-linked policy denominated in Singapore Dollars
- **Insurance Need**: Wealth Accumulation and Protection
- **Policy Type**: Investment-Linked
- **Entry Age**: 1 ANB to 65 ANB (for UOB distribution)
- **Premium Payment Terms**: 5, 10, 15, 20, or 25 years
- **Policy Term**: Whole of Life
- **Launch Date**: 8 July 2024 (UOB distribution effective 9 September 2024)
- **Minimum Premium**: S$1,000 per annum
- **Maximum Premium**: No limit specified

### Key Features & Benefits

#### Dual Account Structure
- **Growth Account**: Designed for wealth growth at faster pace, higher Welcome Bonus, dividend payouts from year 11 onwards
- **Flex Account**: Provides flexibility to receive dividends from day 1 with lower Welcome Bonus
- **Account Allocation**: For UOB customers: Default 100% Growth Account, 0% Flex Account (fixed allocation)
- **Additional Investment Account**: For Investment Booster (Lump Sum) top-ups

#### Sum Assured Structure
- **Starting Point**: 103% of total regular premiums paid (excluding supplementary benefits and top-ups)
- **Annual Increase**: 3% of total regular premiums paid (simple interest basis)
- **Maximum**: Stops increasing at 160% of total regular premiums paid
- **Adjustment**: Reduced proportionally when withdrawals are made

#### First-in-Market Wealth Assure Feature
- **Definition**: Highest daily locked-in account value in Growth Account and Flex Account
- **Maximum Limit**: S$20,000,000 or three times lifetime premium per policy (whichever is higher)
- **Purpose**: Protects wealth from market downturns by locking coverage at portfolio peak
- **Daily Tracking**: Account value compared against recorded Wealth Assure Value daily

#### Death Benefit
**Payout**: Highest of:
- Sum Assured (on date of death), OR
- Wealth Assure Value (on date of death), OR
- Account value from Growth Account and Flex Account
- PLUS: Account value from Additional Investment Account
- LESS: Any amounts owed

#### Accidental Disability Benefit
- **Coverage Period**: Until policy anniversary before life assured turns 70 years old
- **Payout Structure**: Same as Death Benefit (highest of Sum Assured, Wealth Assure Value, or account value)
- **Timing Requirement**: Disability must occur within 12 months of accident
- **Policy Termination**: Whole policy ends once benefit is paid

#### Investment Features
- **Welcome Bonus**: More than 100% of premiums invested from day 1 (due to Welcome Bonus in first 3 years)
- **Loyalty Bonus**: 0.5% of latest Growth Account and Flex Account value annually after premium term
- **Fund Selection**: Wide selection of PRULink Funds available
- **Fund Switching**: Available after sufficient units accumulated
- **Investment Booster (Lump Sum)**: Minimum S$1,000 top-up option, 3% premium charge

#### Flexible Policy Features
- **Premium Pass**: Take premium break without premium holiday charge after completing minimum paid years
- **Wealth Share**: Divide policy into sub-policies within 130 years from first premium due date
- **Change of Life Assured**: Allowed after 2 years from cover start date, unlimited changes permitted
- **Partial Withdrawals**: Available with withdrawal charges during premium term
- **Reduce/Resume Coverage**: Option to reduce and later resume Sum Assured/Wealth Assure Value

#### Charges Structure
- **Administration Charges**: Low and simplified charges structure
- **Surrender Charges**:
  * 5-year term: Charged for 8 years
  * 10-year term: Charged for 10 years
  * 15-year term: Charged for 15 years
  * 20-year term: Charged for 20 years
  * 25-year term: Charged for 25 years
  * Range: From 100% in first 2 years, reduced over time
- **Withdrawal Charges**: Applied during charge period unless free withdrawal entitlement

### Target Market Segments

#### Older Millennials/Generation X with Family
- **Age**: 30-45 years old
- **Income**: S$70,000 and above
- **Profile**: Married couples with children, aggressive savers with higher risk appetite
- **Priorities**: Children's education, retirement planning, second property
- **Value Proposition**: Create wealth foundation for family with investment growth and protection

#### Young Millennials
- **Age**: 25-35 years old
- **Income**: S$70,000 and above
- **Profile**: Single, aspirational and ambitious
- **Goals**: First property purchase, higher education, specific life goals
- **Value Proposition**: Wealth creation to meet specific life objectives

### Marketing Propositions

#### 1. First-in-Market Wealth Assure Feature
- Protects wealth from market downturns by locking coverage at portfolio peak
- Maximum coverage protection during market volatility
- Unique feature not available in competitor products

#### 2. Incremental Coverage Over the Years
- Sum Assured increases by 3% annually up to 160% of premiums paid
- Provides growing protection aligned with inflation and wealth accumulation

#### 3. Optimize Your Wealth
- Dual Account structure for balanced wealth growth and income flexibility
- More than 100% premium investment from day 1 due to Welcome Bonus
- Low and simplified administration charges

#### 4. Leave Your Legacy
- Wealth Share feature enables policy division for seamless wealth transfer
- Unlimited Change of Life Assured options
- Loyalty Bonus continues wealth growth after premium term

#### 5. Flexibility for Evolving Needs
- Premium Pass for temporary premium breaks
- Flexible coverage adjustments (reduce/resume)
- Fund switching and top-up options

### Competitive Advantages
- **Death Benefit**: First-in-market Wealth Assure feature vs. competitors' nominal 100-101% of premiums
- **Premium Terms**: Flexible 5-25 year terms vs. competitors' whole-of-life premium payment
- **Coverage Growth**: 3% annual increase vs. static coverage in other products
- **Wealth Protection**: Daily locked-in value tracking vs. no downside protection
- **Policy Flexibility**: Premium Pass, Wealth Share, unlimited life assured changes

### Supplementary Benefits Available
- Payer Security Plus
- Early Payer Security
- Crisis Waiver III
- Early Stage Crisis Waiver
- Accident Assist

### Important Limitations & Considerations
- **Early Termination**: High surrender charges especially in early years
- **Investment Risk**: Account value subject to fund performance and market fluctuations
- **Charges Impact**: Assurance charges increase with age and may affect policy sustainability
- **UOB Specific**: Fixed 100% Growth Account allocation, unable to change
- **Minimum Contribution**: 24-month minimum contribution period required
`,
    productType: ProductType.OWN,
    modules: ['product-positioning'],
    keyFeatures: [
      'Regular premium whole life investment-linked policy with choice of 5, 10, 15, 20, or 25-year premium terms',
      'First-in-market Wealth Assure feature that locks highest daily account value up to S$20 million or 3x lifetime premium',
      'Dual Account structure: Growth Account (wealth focus) and Flex Account (dividend flexibility)',
      'Sum Assured starts at 103% of premiums and increases 3% annually up to 160% of total premiums paid',
      'Death and Accidental Disability benefits based on highest of Sum Assured, Wealth Assure Value, or account value',
      'Welcome Bonus enabling more than 100% premium investment from day 1',
      'Loyalty Bonus of 0.5% of account value annually after premium term completion',
      'Wealth Share feature to divide policy into sub-policies for wealth transfer',
      'Premium Pass option for premium breaks without holiday charges',
      'Investment Booster (Lump Sum) top-up facility with minimum S$1,000',
      'Wide selection of PRULink Funds for investment options',
      'Unlimited Change of Life Assured after 2 years from policy start',
    ],
    featureHighlight: {
      title:
        'First-in-Market Wealth Assure Protection with Flexible Investment Growth',
      description:
        'PRUVantage Assure II uniquely combines investment growth with downside protection through the innovative Wealth Assure feature that locks in the highest daily account value. With dual account structure, flexible premium terms (5-25 years), and growing Sum Assured (3% annually up to 160%), it provides comprehensive wealth accumulation and protection in a single policy.',
    },
    evaluationFocus: [
      '**Wealth Assure Feature Understanding**: Clear explanation of first-in-market feature that locks highest daily account value',
      '**Dual Account Structure**: Knowledge of Growth Account vs Flex Account differences and UOB-specific allocation',
      '**Sum Assured Mechanics**: Understanding of 103% starting point, 3% annual increase, and 160% maximum cap',
      '**Death Benefit Calculation**: Ability to explain highest-of-three calculation (Sum Assured, Wealth Assure Value, Account Value)',
      '**Investment Features**: Knowledge of Welcome Bonus, Loyalty Bonus, and Investment Booster options',
      '**Flexibility Options**: Understanding of Premium Pass, Wealth Share, and Change of Life Assured features',
      '**Target Market Alignment**: Appropriate positioning for millennials and Gen X with wealth accumulation goals',
      '**Competitive Differentiation**: Clear articulation of advantages vs traditional investment-linked products',
      '**UOB-Specific Features**: Knowledge of fixed 100% Growth Account allocation and maximum 65 ANB entry age',
      '**Charges Structure**: Understanding of surrender charges timeline and withdrawal charge implications',
      '**Risk Considerations**: Awareness of investment risks, charge impacts, and early termination costs',
      "**Premium Terms Flexibility**: Knowledge of 5-25 year options vs competitors' whole-of-life payment",
      '**Accidental Disability Coverage**: Understanding of coverage until age 70 and policy termination upon claim',
      '**Fund Management**: Knowledge of PRULink Fund selection and switching capabilities',
      '**Wealth Transfer Features**: Understanding of Wealth Share for legacy planning and family wealth distribution',
      "**Assessment Distinction**: Distinction between general improvement areas ('warning') and factual errors ('error')",
    ],
    salesTarget: 'individual',
  },
  {
    _id: '671c60000000000000000004',
    friendlyId: 'pruwealth-plus',
    name: 'PRUWealth Plus (SGD) - SP',
    knowledgePrompt: `
## PRODUCT INFORMATION: PRUWealth Plus (SGD) - Single Premium

### Basic Product Details
- **Product Type**: Single premium participating whole life insurance policy denominated in Singapore Dollars
- **Insurance Need**: Wealth Accumulation and Protection
- **Policy Type**: Participating
- **Policy Term**: Whole of Life (to age 130 of original life assured)
- **Premium Type**: Single Premium (one-time payment)
- **Currency**: Singapore Dollars (SGD)
- **Document Version**: June 2024
- **Protection Coverage**: SDIC Policy Owners' Protection Scheme
- **Review Period**: 14 days for full refund (less medical fees and expenses)

### Core Benefits

#### 1. Maturity Benefit
- **Payment Date**: Policy anniversary before life assured turns 130 years old
- **Formula**: (Face Value × Percentage) + Reversionary Bonuses + Performance Bonus - Amounts Owed
- **Percentage**: Depends on policy term
- **Face Value**: Notional value used for calculations (NOT the same as Sum Assured)

#### 2. Death Benefits

**Regular Death Benefit:**
- **Higher of:**
  - 101% of single premium paid (less any bonus surrendered), OR
  - 101% of surrender value
- **Plus**: Any cash benefit left with company
- **Less**: Any amounts owed

**Accidental Death Benefit:**
- **Higher of:**
  - 105% of single premium paid (less any bonus surrendered), OR
  - 101% of surrender value
- **Plus**: Any cash benefit left with company
- **Less**: Any amounts owed

**Pre-existing Condition (within 12 months):**
- Payment: Single premium received less policy loans, surgical/nursing loans, outstanding amounts, and expenses (administrative, sales-related, medical)

**Suicide (within 12 months):**
- Policy voided (treated as never existed)
- Refund: Single premium less deductions (loans, outstanding amounts, expenses)

#### 3. Retrenchment Benefit
- **Amount**: 10% of single premium (at retrenchment date)
- **Eligibility Window**: First 5 policy years, before age 65
- **Waiting Period**: 90 days from policy start or reinstatement
- **Unemployment Requirement**: Minimum 30 continuous days from retrenchment date
- **Payment**: Once only, single lump sum
- **Claim Deadline**: Within 6 months from retrenchment date
- **Subject to**: Maximum per policyowner across all policies

**Eligibility Requirements:**
- Working in Singapore
- Company registered in Singapore
- Singapore citizen, permanent resident, or foreigner with valid MOM employment pass
- Full-time employment (not part-time, freelance, or self-employed)
- Employed for at least 6 continuous months before retrenchment
- Not available for corporate-owned policies

**Retrenchment Definition:**
Termination of full-time employment (not by choice), certified as unemployed by employer due to:
- Employer restructuring, reorganizing, relocating, outsourcing, or liquidating business

**NOT Covered:**
- Awareness of retrenchment before policy start
- Part-time, freelance, or independent contractor work
- Self-employed or sole proprietor status
- Employment less than 6 continuous months
- Retirement, resignation, poor performance dismissal
- End of employment contract
- Leave of absence
- Military discharge
- Voluntary forfeiture of income

### Bonus Structure

#### Reversionary Bonus (Non-guaranteed)
- **Timing**: Yearly bonus added from calendar year after 2nd policy anniversary
- **Once Declared**: Becomes guaranteed
- **Face Value**: Used for bonus calculation (shown in certificate)
- **Surrender Option**: Can be surrendered for cash value (less than face value)

#### Performance Bonus (Non-guaranteed)
- **Type**: One-off bonus
- **Based on**: Percentage of accumulated reversionary bonuses
- **Payment Timing**: At surrender, claim, or maturity
- **Amount Depends on**: Policy end date
- **Cannot be Surrendered**: Separately from policy

### Unique Features

#### Secondary Life Assured
- **Function**: Policy continues on primary life assured's death
- **New Primary**: Secondary becomes new primary life assured
- **Death Benefit**: No death benefit paid for primary's death
- **Eligible Appointees**: Spouse or children (depending on ownership structure)
- **Requirements**: Insurable interest with original policyowners
- **NOT Available**: For SRS-funded policies
- **Cannot Combine**: With nomination/trust (must remove one to enable the other)
- **Management**: Can appoint, change, or remove anytime during policy term

#### Change of Life Assured
- **Availability**: After 2 years from cover start date
- **Frequency**: Anytime throughout policy term
- **Cover End Date**: Remains unchanged (original life assured's age 130)
- **New Cover Start**: Issued for new life assured
- **Requirements**: Proof of insurable interest, underwriting approval
- **Effects**: Original life assured's cover ends immediately
- **NOT Available**: For SRS-funded policies

### Flexibility Options

#### Policy Loan
- **Maximum Amount**: 70% of surrender value
- **Minimum Repayment**: S$100
- **Interest**: Yearly rate (variable, compounded daily)
- **Interest Accrual**: Added to loan annually on policy anniversary
- **Notice Period**: 3 months for interest rate changes
- **NOT Available**: For SRS-funded policies

#### Surgical and Nursing Loan
- **Interest**: Interest-free
- **Minimum Amount**: S$200 per loan
- **Maximum Total**: Lower of 10% of single premium OR surrender value
- **Multiple Loans**: Allowed within maximum limit
- **Requirements**: Cash payment portion of medical bills, cannot claim from other sources
- **Exclusions**: Dental treatment, AIDS/HIV, cosmetic surgery, pregnancy-related
- **NOT Available**: For SRS-funded policies

#### Policy Surrender
- **Availability**: Anytime after policy issuance
- **Immediate Value**: Surrender value provided upon policy issue
- **Early Years**: Surrender value < single premium
- **Process**: Application form required, company confirms acceptance
- **Payment**: Surrender value less amounts owed
- **Policy Ends**: Completely upon surrender

#### Policy Reinstatement
- **Eligibility**: If policy ended due to debt exceeding surrender value
- **Window**: Within 24 months from end date
- **Age Limit**: Life assured must be under 65 years old
- **Requirements**: Pay all amounts owed plus interest, provide health evidence (at applicant's cost)
- **Approval**: Company acceptance required
- **Interest Notice**: 30 days for rate changes

#### Bonus Surrender
- **Reversionary Bonus**: Can surrender part or all accumulated reversionary bonuses
- **Cash Value**: Less than face value of bonus
- **Impact**: Reduces long-term policy value
- **Requirement**: Surrender value must exist
- **Performance Bonus**: Cannot be surrendered separately

### SRS (Supplementary Retirement Scheme) Compatibility

**Can be Purchased with SRS Funds**: Yes

**SRS Purchase Restrictions (NOT Available):**
- Joint ownership
- Secondary life assured
- Change of life assured
- Policy loans
- Surgical and nursing loans
- Bonus surrender (restrictions apply)

**Important**: SRS terms and conditions override policy terms if conflicting

### Nomination and Trust Options

**Four Types Available:**
1. **Section 49L Trust**: Irrevocable, spouse & children only
2. **Section 49M Nomination**: Revocable, any beneficiary
3. **Juvenile Trust**: Parent/guardian for child, transfers at age 21
4. **Educational Trust**: Parent/guardian for child, no transfer

**Cannot Combine**: With secondary life assured (must remove one to enable the other)

**Eligibility Requirements:**
- You are the life assured
- No premium financing arrangement
- Policy not assigned
- No secondary life assured appointed

### Accidental Death Exclusions

**NOT Covered for Accidental Death Claims:**
- Pre-existing conditions (accidents/conditions before cover start)
- War, riot, revolution, terrorism (nuclear/biological/chemical)
- Active military duties, maintaining civil order
- Travel by military aircraft or waterborne vessel
- Illnesses or diseases of any kind
- Bites from or contact with infected animals/insects
- Pregnancy and related complications
- State of unsound mind
- Deliberate acts (intoxicating liquor/drugs, suicide attempts, self-injury)
- Unlawful acts, resisting arrest, assault
- Dangerous activities/sports without licensed supervision
- Professional or competitive sports (if earning income)
- Racing of all kinds (except on foot or bicycle)
- Aviation (except as fare-paying passenger on commercial airline)
- Radiation or radioactive contamination

### Important Timeframes

| Event | Timeframe |
|-------|-----------|
| Review period | 14 days from policy receipt |
| Retrenchment waiting | 90 days from start |
| Retrenchment claim window | First 5 policy years |
| Claim deadline (retrenchment) | 6 months from event |
| Pre-existing exclusion | 12 months |
| Suicide exclusion | 12 months |
| Change life assured eligibility | After 2 years |
| Incontestability | After 2 years |
| Reinstatement window | 24 months after lapse |

### Face Value vs Sum Assured

**CRITICAL DISTINCTION:**
- **Face Value**: Notional amount used for calculating reversionary bonuses and maturity benefit
- **Sum Assured**: Actual coverage amount
- **Face Value ≠ Sum Assured**: These are NOT the same
- **Both Shown**: In certificate of life assurance

### Policy Termination Events

Policy automatically ends upon:
1. Death of life assured (if no secondary life assured)
2. Policy surrender
3. Policy lapse (debt exceeds surrender value)
4. Maturity date
5. Death benefit claim payment

Whichever occurs first.

### Target Customers (Appropriate)
- Want wealth accumulation with life insurance protection
- Prefer single premium payment (lump sum available)
- Seek bonus-based growth (participating in company's profits)
- Want to transfer wealth to next generation (via secondary life assured or change of life assured)
- Need retrenchment protection in early working years
- Want policy loan flexibility for liquidity needs
- Interested in SRS-compatible investment options

### Inappropriate Customers
- Cannot afford single premium payment upfront
- Want guaranteed high returns only
- Need immediate income or cash flow
- Want pure investment without insurance component
- Require complex investment management control

### Governing Law
- Singapore law applies
- Singapore courts have exclusive jurisdiction
- All amounts in SGD unless stated

### Important Limitations & Considerations
- **Early Termination**: Surrender value may be less than single premium paid in early years
- **Non-Guaranteed Elements**: Bonuses (reversionary and performance) are non-guaranteed and depend on participating fund performance
- **Face Value Confusion**: Face value is NOT death benefit - used only for bonus and maturity calculations
- **SRS Restrictions**: Significant feature limitations for SRS-funded policies
- **Retrenchment Limited**: Only first 5 years, specific employment criteria, one-time payment
- **Mutual Exclusivity**: Cannot have both nomination/trust and secondary life assured
- **Pre-existing Conditions**: 12-month exclusion for death claims
- **Suicide Clause**: Policy void if within 12 months
- **Incontestability**: Cannot contest after 2 years (except fraud)
`,
    productType: ProductType.OWN,
    modules: ['product-positioning'],
    keyFeatures: [
      'Single premium participating whole life insurance policy in Singapore Dollars',
      'Coverage until age 130 of original life assured',
      'Death benefit: 101% of premium or surrender value (105% for accidental death)',
      'Retrenchment benefit: 10% of single premium (first 5 years, once only)',
      'Reversionary bonus (non-guaranteed, becomes guaranteed when declared) added from year 2',
      'Performance bonus (non-guaranteed) paid at surrender, claim, or maturity',
      'Secondary life assured feature - policy continues on primary life assured death',
      'Change of life assured option after 2 years for wealth transfer',
      'Policy loans up to 70% of surrender value available',
      'Surgical and nursing loans (interest-free, up to 10% of premium or surrender value)',
      'Compatible with SRS funds (with specific restrictions)',
      'Four nomination/trust options available (49L, 49M, Juvenile, Educational)',
      'Maturity benefit based on face value percentage plus accumulated bonuses',
      '14-day free look period for full refund',
    ],
    featureHighlight: {
      title: 'Wealth Accumulation with Comprehensive Protection',
      description:
        'PRUWealth Plus (SGD) - SP is a single premium participating whole life policy that provides life insurance protection until age 130 with wealth accumulation through reversionary and performance bonuses. It offers unique flexibility through secondary life assured and change of life assured features for seamless wealth transfer, plus retrenchment protection of 10% single premium in the first 5 years. Compatible with SRS funds for retirement planning.',
    },
    evaluationFocus: [
      '**Product Understanding**: Clear explanation of single premium participating whole life structure',
      '**Core Benefits Knowledge**: Understanding of maturity benefit, death benefit (regular and accidental), and retrenchment benefit',
      '**Bonus Mechanics**: Knowledge of reversionary bonus (guaranteed once declared) vs performance bonus (non-guaranteed)',
      '**Face Value vs Sum Assured**: Critical distinction between face value (for bonus/maturity calculations) and sum assured (coverage amount)',
      '**Secondary Life Assured**: Understanding that policy continues on primary death, secondary becomes new primary, no death benefit paid for primary',
      '**Change of Life Assured**: Knowledge of 2-year waiting period, unlimited changes, maturity date stays unchanged',
      '**Retrenchment Benefit Details**: 10% of premium, first 5 years only, 90-day waiting, 30-day unemployment minimum, 6-month claim deadline',
      '**Retrenchment Eligibility**: Full-time employment, 6+ months employed, Singapore-based work, specific exclusions understood',
      '**Death Benefit Calculations**: Correct formula for regular (101%) vs accidental (105%) death benefits',
      '**Flexibility Features**: Knowledge of policy loans (70% of surrender value), surgical/nursing loans (interest-free)',
      '**SRS Compatibility**: Understanding that product is SRS-compatible but with significant restrictions (no joint ownership, no secondary LA, no change LA, no loans)',
      '**Nomination vs Secondary LA**: Mutual exclusivity - cannot have both simultaneously',
      '**Timeframes Accuracy**: Correct knowledge of critical periods (14-day free look, 90-day retrenchment waiting, 12-month pre-existing/suicide exclusion, 2-year incontestability)',
      '**Accidental Death Exclusions**: Awareness of comprehensive exclusion list (war, illness, intentional acts, professional sports, aviation)',
      '**Policy Loan Terms**: 70% maximum, variable interest, 3-month notice for rate changes',
      '**Surrender Implications**: Understanding that surrender value < premium in early years',
      '**Target Market Alignment**: Appropriate positioning for customers with lump sum available, wealth accumulation goals, retrenchment protection needs',
      '**Reinstatement Options**: 24-month window, under age 65, health evidence required',
      '**Bonus Surrender**: Reversionary bonuses can be surrendered (cash value < face value), performance bonus cannot',
      '**Policy Termination Events**: Understanding of 5 automatic termination scenarios',
      "**Assessment Distinction**: Distinction between general improvement areas ('warning') and factual errors ('error')",
    ],
    salesTarget: 'individual',
  },
  /**
   * Product for Prudential Objection Handling module
   * Bank branch walk-in scenario where FA approaches customer about insurance
   */
  {
    _id: '671c60000000000000000010',
    friendlyId: 'prudential-insurance-general',
    name: 'Insurance Solutions',
    productType: ProductType.OWN,
    modules: ['prudential-objection-handling'],
    salesTarget: 'individual',
    titleBarHidden: true,
    keyFeatures: [
      'Comprehensive insurance coverage for life, health, and wealth protection',
      'Flexible premium payment options to suit different budgets',
      'Coverage for hospitalization, critical illness, and life protection',
      'Savings and investment components for wealth accumulation',
      'Family protection benefits including education funding',
    ],
    featureHighlight: {
      title: 'Comprehensive Insurance Solutions for Your Life Goals',
      description:
        'Our insurance solutions provide comprehensive protection for you and your family, covering health, life, and wealth needs. Whether you need hospitalization coverage, critical illness protection, or savings for retirement and education, we have flexible plans to match your goals and budget.',
    },
  },
];

export const PLT_SALES_PRODUCTS: LegacySalesProduct[] =
  PRUDENTIAL_SALES_PRODUCTS.filter(
    (product) =>
      product.friendlyId === 'all-products-exploratory' ||
      product.friendlyId === 'prushield' ||
      product.friendlyId === 'prulifetime-income-plus',
  );

export const PRUDENTIAL_TW_SALES_PRODUCTS: LegacySalesProduct[] =
  PRUDENTIAL_SALES_PRODUCTS.filter(
    (product) =>
      product.friendlyId === 'all-products-exploratory' ||
      product.friendlyId === 'prushield' ||
      product.friendlyId === 'prulifetime-income-plus',
  );

export const PRUDENTIAL_ID_SALES_PRODUCTS: LegacySalesProduct[] =
  PRUDENTIAL_SALES_PRODUCTS.filter(
    (product) =>
      product.friendlyId === 'all-products-exploratory' ||
      product.friendlyId === 'prushield' ||
      product.friendlyId === 'prulifetime-income-plus',
  );

export const prudentialExploratoryConfiguration: ProductConfiguration = {
  base: {
    id: 'prudential-exploratory',
    friendlyId: 'prudential-exploratory',
    category: 'insurance',
  },
  localized: {
    en: {
      name: 'Prudential Exploratory',
      keyFeatures: [],
      evaluationFocus: [],
    },
    cmn: {
      name: '保德信探索式銷售',
      keyFeatures: [],
      evaluationFocus: [],
    },
  },
};
