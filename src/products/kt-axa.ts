import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

/**
 * KT AXA (Krungthai-AXA) Thailand Sales Products
 */
export const KT_AXA_SALES_PRODUCTS: LegacySalesProduct[] = [
  //   {
  //     _id: '671eb0000000000000000001',
  //     friendlyId: 'kt-axa-agent-recruitment',
  //     name: 'KT AXA Agent Recruitment',
  //     salesTarget: 'individual',
  //     knowledgePrompt: `Krungthai-AXA Life Insurance (KT-AXA) is part of the global AXA Group, one of the world's largest insurance and asset management companies operating in over 50 countries with more than 95 million customers worldwide. KT-AXA is a joint venture between Krungthai Bank and AXA, combining local expertise with global best practices.

  // Scenario Context:
  // This is the prospect's first meeting to explore the job of an insurance agent. They either submitted their contact information online or were referred by someone. The agent's role is to build rapport, understand their life goals and work experience (specifically challenges in earning income and job limitations), and then present the career of a life insurance agent as a solution addressing their concerns.

  // Expected Prospect Behaviors:
  // - They will ask about job details
  // - They may hesitate about switching careers to become a life insurance agent with Krungthai-AXA
  // - They want reassurance about whether their existing skills are suitable for the agent role
  // - They want to know about career prospects in the insurance business, long-term opportunities, what they need to do, and the basic benefits they can expect

  // Common Objections:
  // - "What can I expect in the long term from this career as an insurance agent?"
  // - "I have never done sales before, and I don't know if this is for me."
  // - "How difficult is it to hit the sales quotas, and will this be a steady paycheck?"
  // - Concerns about job security, income stability, flexibility, and support from supervisors/company

  // Success Scenario:
  // The prospect becomes interested in the role of agent and agrees to attend the company's career opportunity seminar (BOP - Business Opportunity Presentation).

  // Company Awards & Recognition:
  // - Top Employer Thailand 2024
  // - Thailand Best Employer Brand
  // - Most Innovative Life Insurance Company Thailand 2024
  // - Best Distribution Team & Distribution Channels 2024
  // - Best Health Insurance Brand Thailand 2024
  // - Most Trusted Life Insurance Brand Thailand 2024
  // - Asia's Most Inspiring Executives C23
  // - Marketing Excellence Awards for Brand Awareness
  // - Excellence in Health Insurance Services (Emma By AXA)
  // - Excellence in Diversity, Equity and Inclusion (Gold level)
  // - MDRT Recognition

  // Career Benefits (3i):
  // 1. Income (รายได้ไม่จำกัด): Unlimited earning potential - determine your own income without ceiling
  // 2. Independence (อิสระการใช้ชีวิต): Freedom in how you work and live - Work-Life Balance
  // 3. Impact (มีคุณค่าต่อผู้คน): Create meaningful value for people and society

  // Commission Structure:
  // - First Year Commission (FYC): 30% of premium
  // - Quarterly Volume Bonus (QVB): 45-55% based on production
  // - Year End Bonus (YEB): 11.25-13.75% based on production
  // - Renewal Year Commission (RYC): 12% (Year 1), 7.5% (Year 2), 5% (Years 3-5)
  // - AXA Prime Blue Bonus (APB): 22.5% + 5% sustainability bonus
  // - Additional achievement bonuses (OAB, SB) for meeting targets

  // Income Examples:
  // - 4 policies/month x THB 25,000 premium = THB 1.2M annual premium → THB 572,625 first year income
  // - 8 policies/month x THB 25,000 premium = THB 2.4M annual premium → THB 1,239,750 first year income
  // - 5-year cumulative income potential: THB 4-13 million depending on production level

  // AXA Prime Blue Training Program:
  // - 6-month intensive hybrid training (6 days onsite + 12 days online + 3 e-learning courses)
  // - Month 1: Strong foundation - Products, sales skills, digital tools
  // - Month 2: Advanced knowledge - Critical illness, health protection, underwriting
  // - Month 3: Service excellence - Claims process, after-sales service
  // - Months 4-6: Professional development - Advanced sales, negotiation, presentation skills
  // - Dedicated coach support with weekly activity planning
  // - Post-training follow-up and continuous mentorship

  // Digital Tools:
  // - AdvisorZone: Sales management platform
  // - My Wealth+: Investment product sales tool
  // - iPro: After-sales service and policy management
  // - Digital customer service tools

  // Career Progression Path:
  // - Agent → Senior Agent → Unit Manager → Agency Director
  // - Clear qualification criteria for advancement
  // - Team building and management opportunities
  // - Passive income from team production

  // Products Portfolio:
  // - Life Protection (ความคุ้มครองชีวิต)
  // - Health Insurance (ความคุ้มครองสุขภาพ)
  // - Critical Illness (ความคุ้มครองโรคร้ายแรง)
  // - Retirement Planning (เงินเก็บยามเกษียณ)
  // - Unit Linked (ประกันชีวิตควบการลงทุน)

  // Requirements to Join:
  // - Complete PCE (Pre-Contract Examination) via TLAA or KT-AXA channels
  // - Obtain OIC (Office of Insurance Commission) license
  // - Register through iRecruit system
  // - Pass Data Check verification

  // Practice Objectives:
  // The goal for the recruiter is to:
  // 1. Build rapport with prospects and understand their current situation
  // 2. Conduct fact-finding on income, lifestyle, and challenges faced in their current job
  // 3. Present the insurance agent career as a solution highlighting job details and growth opportunities
  // 4. Handle objections related to job security, income stability, flexibility, and company support
  // 5. Close by guiding them to register for the BOP (Business Opportunity Presentation) seminar

  // Important Considerations:
  // - Insurance agent market in Thailand is a growing industry (ranked in top 10 rising businesses)
  // - Thai people's awareness of insurance is increasing, with average of 37 policies per 100 people
  // - Agent channel represents over 51% of total insurance premium distribution
  // - Flexible work arrangements allow work-life balance
  // - Comprehensive support system with coaches and mentors
  // - Success requires dedication, persistence, and willingness to learn
  // - Initial income may vary while building client base`,
  //     productType: ProductType.OWN,
  //     keyFeatures: [
  //       'Unlimited Income Potential',
  //       'Flexible Work Schedule',
  //       'Comprehensive 6-Month Training (AXA Prime Blue)',
  //       'Digital Tools Support (AdvisorZone, My Wealth+, iPro)',
  //       'Clear Career Progression Path',
  //       'Commission + Bonuses Structure',
  //       'Global AXA Brand Recognition',
  //       'Continuous Mentorship & Coaching',
  //     ],
  //     featureHighlight: {
  //       title:
  //         'Join KT-AXA as a Financial Advisor - Unlimited income potential with comprehensive training and career growth',
  //       description:
  //         'Krungthai-AXA offers a rewarding career as a life insurance agent with unlimited earning potential, flexible work arrangements, comprehensive 6-month training program, digital tools, and clear career progression from Agent to Agency Director.',
  //     },
  //     evaluationFocus: ['Soft Skills', 'Knowledge Skills'],
  //     modules: ['kt-axa-agent-recruitment'],
  //     callCriteria: {
  //       en: {
  //         title: 'KT AXA Agent Recruitment Scorecard',
  //         description: 'You will be evaluated on two key areas:',
  //         criteria: [
  //           'Soft Skills: Communication Skills, Relationship Building, Adaptability, and Customer Orientation',
  //           'Knowledge Skills: Fact Finding, Business Knowledge, Problem-Solving, Sales & Negotiation Skills, and KT-AXA Company Knowledge',
  //         ],
  //       },
  //       th: {
  //         title: 'KT AXA Agent Recruitment Scorecard',
  //         description: 'คุณจะได้รับการประเมินในสองด้านหลัก:',
  //         criteria: [
  //           'ทักษะด้านอ่อน: ทักษะการสื่อสาร การสร้างความสัมพันธ์ ความสามารถในการปรับตัว และการมุ่งเน้นลูกค้า',
  //           'ทักษะด้านความรู้: การค้นหาข้อมูล ความรู้ทางธุรกิจ การแก้ปัญหา ทักษะการขายและการเจรจา และความรู้เกี่ยวกับบริษัท KT-AXA',
  //         ],
  //       },
  //     },
  //   },
  {
    _id: '671eb0000000000000000002',
    friendlyId: 'kt-axa-life-ready-ci123',
    name: 'Life Ready with addon CI123',
    salesTarget: 'individual',
    knowledgePrompt: `Krungthai-AXA Life Insurance (KT-AXA) Life Ready + CI 123 Critical Illness Coverage

Scenario Context:
This is a Financial Needs Analysis (FNA) conversation with a prospect who reached out via Facebook expressing interest in insurance. The agent's role is to build rapport, understand their financial situation and concerns, identify coverage gaps, and present Life Ready + CI 123 as a solution tailored to their specific needs.

PRODUCT 1: LIFE READY (ไลฟ์เรดดี้)

Plan Type: Whole Life Protection Plan (coverage until age 99)

Key Benefits:
- Death Benefit: 100% of Sum Insured, or Cash Surrender Value, or 101% of total premiums paid (whichever is greater)
- Maturity Benefit: 100% of Sum Insured at age 99
- Coverage Duration: Until age 99 (whole life protection)
- Tax Deduction: Premiums are tax-deductible under Thai tax regulations

Payment Term Options:
- 6-year payment term
- 12-year payment term
- 18-year payment term
- Pay until age 99

Minimum Sum Insured: THB 150,000
Entry Age: 1 month to 70 years old
Premium Discounts: Available for higher sum insured amounts (THB 500K-999K: THB 2/1000, THB 1M-2.99M: THB 3/1000, THB 3M+: THB 4/1000)

Target Customer Profiles:
1. High-income earners (6-year payment): Age 30-45, family breadwinners concerned about family protection, seeking tax deduction benefits
2. Middle-income earners (12/18-year payment): Age 25-45, caring for parents and family, seeking affordable premiums with high coverage
3. Those needing additional coverage: All ages, concerned about health, looking to add riders for comprehensive protection

PRODUCT 2: CI 123 - CRITICAL ILLNESS RIDER (ประกันโรคร้ายแรง CI 123)

Coverage: Comprehensive protection against 123 critical illnesses

Coverage Categories:
1. Pre-Early Stage Critical Illness: Coverage from early detection (tumors that haven't become cancer, diabetes complications like diabetic retinopathy and kidney damage)
2. Early-to-Moderate Stage Critical Illness: Treatment before condition becomes severe
3. Severe Stage Critical Illness: Full coverage for major conditions
4. Special Conditions: Specialized treatments including cardiac arrhythmia treatment, congenital heart defect surgery, adrenal gland tumors
5. Childhood Critical Illnesses: Coverage for pediatric conditions
6. Critical Care Benefit: ICU admission with ECMO/MV support for 5+ consecutive days, or permanent inability to perform 2+ daily activities

Key Features:
- No premium payment required after claim (subsequent year premiums waived)
- Coverage for up to 123 critical illnesses
- Protection against emerging diseases and pandemics
- Lump sum payout upon diagnosis
- Long-term protection until age 99

Selling Points by Customer Profile:

For Business Owners (like Khun Somsak):
- "Emergency liquidity" - Lump sum to keep business running if hospitalized
- Key person protection - Cash to pay business debts if incapacitated
- Business continuity assurance

For Young Professionals (like Khun Mintra):
- "Don't be a burden to parents" - Independent coverage beyond limited group insurance
- Low premium, easy to start, high coverage
- Covers gaps in employer group insurance (OPD limits, condo payments while unable to work)

For High-Income Tech Workers (like Khun Arm):
- "Protection Asset" - Small premium to protect large investment portfolio
- No need to liquidate investments for medical expenses
- Covers office syndrome and physiotherapy gaps in group insurance

For Shop Owners (like Khun Jintana):
- "Income replacement money" - Lump sum for living expenses if shop must close
- Compare premium to daily cost (20-30 THB/day, cheaper than a meal)
- Protection when 30-baht government healthcare isn't enough for stall rental/tuition

For Government Employees (like Khun Manop):
- Lump sum for non-reimbursable medicines/advanced treatments
- Cash for private room upgrade (vs. shared ward with government benefits)
- Money to pay cooperative loan installments during hospitalization

Common Objections and Responses:

"I already have group insurance from work"
→ Group insurance typically has limited OPD coverage and doesn't provide lump-sum payouts. CI 123 provides cash you can use for any purpose - living expenses, loan payments, or treatments not covered.

"Insurance is too expensive"
→ Life Ready + CI 123 can start from as low as 20-30 THB per day. Compare this to what you spend on coffee or a meal - this is protection worth millions.

"Government benefits are enough"
→ Government benefits cover hospital care, but who will pay your loan installments, children's tuition, or shop rent while you're hospitalized and unable to work?

"I'd rather invest in stocks"
→ Investments can go down in value when you need them most. Insurance provides guaranteed lump-sum protection that doesn't fluctuate with markets. Think of it as a "protection asset."

Practice Objectives:
1. Build rapport with prospects who reached out via Facebook
2. Conduct thorough fact-finding on income, financial situation, existing coverage, and priorities
3. Identify coverage gaps (group insurance limitations, no critical illness coverage, no income replacement)
4. Present Life Ready + CI 123 tailored to their specific situation and concerns
5. Address objections with concrete examples and comparisons
6. Guide prospect toward understanding the value proposition and next steps

Important Considerations:
- Always relate benefits to the prospect's specific situation
- Use concrete numbers (daily premium cost, coverage amounts)
- Address the emotional concern: "What happens to your family/business if you can't work?"
- Focus on lump-sum benefit as income replacement or emergency fund
- Compare insurance cost to everyday expenses to make it relatable`,
    productType: ProductType.OWN,
    keyFeatures: [
      'Whole Life Protection until Age 99',
      'Flexible Payment Terms (6, 12, 18 years or until 99)',
      'Coverage for 123 Critical Illnesses',
      'Pre-Early Stage Detection Coverage',
      'Lump Sum Payout upon Diagnosis',
      'Premium Waiver After Claim',
      'Tax Deductible Premiums',
      'Critical Care Benefit (ICU/ECMO coverage)',
      'Emerging Disease & Pandemic Coverage',
    ],
    featureHighlight: {
      title:
        'Comprehensive life and critical illness protection with lump-sum payout',
      description:
        'Life Ready + CI 123 combines whole life protection with comprehensive critical illness coverage for 123 conditions. Get a lump-sum payout upon diagnosis to use for treatment, income replacement, or any purpose - providing financial security when you need it most.',
    },
    evaluationFocus: ['Sales Technique', 'Product Knowledge'],
    modules: ['kt-axa-fna-product-pitch'],
    callCriteria: {
      en: {
        title: 'FNA & Product Pitch Scorecard',
        description: 'You will be evaluated on two key areas:',
        criteria: [
          'Sales Technique: Communication Skills, Adaptability, Customer Orientation, and Fact Finding',
          'Product Knowledge: Understanding of Life Ready and CI 123 features and providing solutions aligned with customer profile',
        ],
      },
      th: {
        title: 'FNA & Product Pitch Scorecard',
        description: 'คุณจะได้รับการประเมินในสองด้านหลัก:',
        criteria: [
          'เทคนิคการขาย: ทักษะการสื่อสาร ความสามารถในการปรับตัว การมุ่งเน้นลูกค้า และการค้นหาข้อมูล',
          'ความรู้ผลิตภัณฑ์: ความเข้าใจในคุณสมบัติของ Life Ready และ CI 123 และการนำเสนอโซลูชันที่สอดคล้องกับโปรไฟล์ลูกค้า',
        ],
      },
    },
  },
  {
    _id: '671eb0000000000000000003',
    friendlyId: 'kt-axa-wealthplus-ready',
    name: 'WealthPlus Ready 90/8',
    salesTarget: 'individual',
    knowledgePrompt: `Krungthai-AXA Life Insurance (KT-AXA) WealthPlus Ready 90/8 - Whole Life Savings Plan

Scenario Context:
This is a followup close call conversation with a prospect who has been introduced to WealthPlus Ready 90/8 in a previous interaction. The agent's role is to build on the established rapport, address any remaining concerns or objections, demonstrate comprehensive product knowledge, and guide the prospect to complete the application or schedule the next step to finalize the purchase.

Expected Prospect Behaviors:
- They have basic awareness of WealthPlus Ready 90/8 from the previous interaction
- They may have questions about price, returns, value comparison, or specific product features
- They may raise objections about affordability, comparison with other policies, clarity on returns, or value for money
- They want reassurance that this product aligns with their financial goals and provides good value

PRODUCT: WEALTHPLUS READY 90/8

Plan Type: Whole Life Savings Plan with guaranteed cash returns and death benefit

Key Benefits:
- 10% Annual Cash Return: Receive guaranteed 10% of sum insured every year starting from year 1, for life
- 8-Year Premium Payment Term: Pay premiums for only 8 years, receive benefits for life until age 90
- Coverage Until Age 90: Continuous life protection until age 90
- Death Benefit: Escalating death benefit from 100% to 800% of sum insured depending on age at death
  * Ages 0-39: 100% of sum insured
  * Ages 40-49: 150% of sum insured
  * Ages 50-59: 200% of sum insured
  * Ages 60-69: 300% of sum insured
  * Ages 70-79: 500% of sum insured
  * Ages 80-90: 800% of sum insured
- Additional 100% Accidental Death Benefit (ADB): Extra 100% of sum insured if death is due to accident
- Premium Waiver for Total Permanent Disability (TPD): No more premium payments required if insured becomes totally and permanently disabled
- Maturity Benefit: 800% of sum insured at age 90
- Total Returns: Approximately 1,290% of sum insured over the policy term (combining annual cash returns and maturity benefit)
- Internal Rate of Return (IRR): Approximately 1.66% per year
- Tax Deduction: Premiums are tax-deductible up to 100,000 THB per year under Thai tax regulations
- Simple Underwriting: Only 3 health questions required for approval (faster and easier application process)

Premium Payment:
- 8-year premium payment term (pay for 8 years only)
- Annual, semi-annual, quarterly, or monthly payment modes available

Entry Age: 0-65 years old
Minimum Sum Insured: THB 500,000

Target Customer Profile (Upper Mass and Wealth Segment):
- High-income earners seeking passive income and wealth accumulation
- Individuals looking for guaranteed returns with life protection
- Customers concerned about tax efficiency (maximizing tax deduction benefits)
- Those planning for retirement income or legacy planning
- Business owners wanting guaranteed cash flow and estate planning

Value Propositions by Customer Type:

For High-Income Earners:
- "Passive income stream" - Guaranteed 10% annual cash return provides passive income without affecting your principal investment
- Tax efficiency - Maximize your 100,000 THB annual tax deduction while building wealth
- Wealth accumulation - 1,290% total returns over policy term ensures significant wealth growth

For Retirees or Pre-Retirees:
- "Retirement income supplement" - 10% annual cash return supplements your retirement income for life
- Legacy planning - 800% maturity benefit or escalating death benefit ensures substantial inheritance for family
- No need to manage investments - Set-and-forget guaranteed returns

For Business Owners:
- "Guaranteed cash flow" - 10% annual cash return provides reliable cash flow regardless of business performance
- Estate planning tool - Escalating death benefit up to 800% ensures business succession or family security
- Tax-advantaged savings - Reduce taxable income while accumulating wealth

Common Objections and Responses:

"The price of the policy seems very high"
→ Let's look at it as an investment, not an expense. With WealthPlus Ready 90/8, you pay premiums for only 8 years but receive 10% annual cash return for life. For example, with a 1 million THB sum insured, you receive 100,000 THB every year starting from year 1. By year 8 when you stop paying premiums, you've already received 800,000 THB back, and you continue receiving 100,000 THB annually for life. At age 90, you receive the 800% maturity benefit of 8 million THB. That's a total of 1,290% returns - can you find this guaranteed return anywhere else?

"How does this compare to the other policies/policy I already have?"
→ WealthPlus Ready 90/8 is unique because it combines three benefits in one: (1) Guaranteed passive income from 10% annual cash return, (2) Escalating life protection from 100% to 800%, and (3) Significant tax deduction of up to 100,000 THB per year. Unlike traditional savings plans that lock your money away, this gives you annual cash flow. Unlike pure investment products, this provides guaranteed returns regardless of market performance. It's designed specifically for the Upper Mass and Wealth segment who want predictable, tax-efficient wealth accumulation.

"I am unclear on the returns of the product"
→ Let me break down the returns clearly. With a 1 million THB sum insured, here's what you get: (1) Annual Cash Return: 100,000 THB every year from year 1 until age 90. (2) Death Benefit: If something happens to you, your beneficiaries receive between 1-8 million THB depending on your age (100% to 800% of sum insured). (3) Maturity Benefit: At age 90, you receive 8 million THB (800% of sum insured). In total, you receive approximately 12.9 million THB (1,290% of sum insured) over the policy term. The IRR is approximately 1.66% per year, which is a guaranteed, tax-advantaged return.

"I am not sure if this is value for money"
→ Consider the value beyond just the percentage return. First, this is a GUARANTEED return - no market risk, no fluctuations. Second, you receive ANNUAL CASH FLOW of 10% starting immediately from year 1, which you can use for any purpose. Third, you get ESCALATING LIFE PROTECTION up to 800%, plus an additional 100% accidental death benefit. Fourth, you SAVE UP TO 100,000 THB IN TAXES every year. Fifth, the underwriting requires only 3 simple health questions - approval is fast and easy. When you add all these benefits together, WealthPlus Ready 90/8 delivers exceptional value that you won't find in standard investment or insurance products.

Compliance Requirements:

Terms agents SHOULD use:
- Information about Freelook period or policy cancellation (15-day freelook period after receiving policy)
- How many years premium must be paid (8 years) and policy maturity age (90)
- Clarify that it is a life insurance policy with savings component
- Explain waiting periods if any riders are added
- Inform customer that after policy approval, Customer Service (1159) will contact for Welcome Call to confirm policy details

Terms agents should NOT use:
- "Break-even point" (implies it's purely an investment product)
- "Like depositing money" (misleading comparison to bank deposits)
- "Continuing from the previous policy" (inaccurate unless explicitly discussing conversion)
- "Once all premiums are paid, you can get all your money back immediately" (false - maturity benefit is at age 90)

Practice Objectives:
The goal for the agent in this close call is to:
1. Build on rapport established in previous interactions
2. Address any lingering questions or concerns about WealthPlus Ready 90/8
3. Demonstrate comprehensive product knowledge including features, benefits, returns, tax advantages, and underwriting process
4. Handle common objections effectively using concrete examples and value-based reasoning
5. Use appropriate compliance language and avoid prohibited terms
6. Guide the prospect to take action: complete the application, schedule application completion, or commit to a specific next step

Important Considerations:
- WealthPlus Ready 90/8 is positioned for Upper Mass and Wealth segment customers who value guaranteed returns, tax efficiency, and wealth accumulation
- The unique selling point is the combination of guaranteed annual cash flow (10% per year), escalating life protection (up to 800%), and significant tax deduction (up to 100,000 THB/year)
- Focus on concrete numbers and examples tailored to the prospect's sum insured level
- Always emphasize the total value proposition: guaranteed returns + life protection + tax benefits + simple underwriting
- Close the conversation by asking for commitment to complete the application or schedule the next step
- Ensure compliance by mentioning the freelook period, 8-year premium payment term, policy maturity age (90), and Welcome Call from Customer Service (1159)`,
    productType: ProductType.OWN,
    keyFeatures: [
      '10% Annual Cash Return from Year 1',
      '8-Year Premium Payment Term',
      'Coverage Until Age 90',
      'Death Benefit Escalating from 100%-800%',
      'Additional 100% Accidental Death Benefit',
      'Premium Waiver for Total Permanent Disability',
      'Maturity Benefit of 800% at Age 90',
      'Total Returns ~1,290% of Sum Insured',
      'IRR ~1.66% per year',
      'Tax Deduction up to 100,000 THB/year',
      'Simple Underwriting (3 Health Questions Only)',
    ],
    featureHighlight: {
      title: 'Guaranteed passive income with life protection and tax benefits',
      description:
        'WealthPlus Ready 90/8 provides guaranteed 10% annual cash return from year 1, escalating death benefit up to 800%, and maturity benefit of 800% at age 90. Pay premiums for only 8 years and enjoy tax deduction up to 100,000 THB/year. Total returns of approximately 1,290% with simple 3-question underwriting.',
    },
    evaluationFocus: ['Soft Skills', 'Knowledge Skills', 'Product Knowledge'],
    modules: ['kt-axa-wealthplus-close-call'],
    callCriteria: {
      en: {
        title: 'WealthPlus Close Call Scorecard',
        description: 'You will be evaluated on three key areas:',
        criteria: [
          'Soft Skills: Communication Skills, Relationship Building, Adaptability, and Customer Orientation',
          'Knowledge Skills: Fact Finding, Problem-Solving, Sales & Negotiation Skills, and Compliance & Regulations',
          'Product Knowledge: Understanding of WealthPlus Ready 90/8 features and benefits, addressing objections, and closing the sale',
        ],
      },
      th: {
        title: 'WealthPlus Close Call Scorecard',
        description: 'คุณจะได้รับการประเมินในสามด้านหลัก:',
        criteria: [
          'ทักษะด้านอ่อน: ทักษะการสื่อสาร การสร้างความสัมพันธ์ ความสามารถในการปรับตัว และการมุ่งเน้นลูกค้า',
          'ทักษะด้านความรู้: การค้นหาข้อมูล การแก้ปัญหา ทักษะการขายและการเจรจา และการปฏิบัติตามกฎระเบียบ',
          'ความรู้ผลิตภัณฑ์: ความเข้าใจในคุณสมบัติและสิทธิประโยชน์ของ WealthPlus Ready 90/8 การจัดการข้อโต้แย้ง และการปิดการขาย',
        ],
      },
    },
  },
  // KTAXA Advisor Program
  {
    _id: '671eb0000000000000000005',
    friendlyId: 'kt-axa-advisor',
    name: 'KT-AXA Advisor',
    salesTarget: 'individual',
    knowledgePrompt: `KTAXA Advisor Program — Krungthai-AXA Life Insurance Public Company Limited

Program Overview:
The KTAXA Advisor program is a 10-month structured development program designed to provide financial support and comprehensive training for new insurance agents joining Krungthai-AXA. Agents receive 15,000 THB monthly Company Financing (CF) while building their client base and developing professional advisory skills.

Scenario Context:
This is a recruitment conversation where the agent presents the KTAXA Advisor program to a prospect. The recruiter's goal is to explain the program benefits, address concerns about the insurance career, and guide the prospect toward joining the program.

Qualifications for Joining:
- Age: Not over 50 years old (exceptions possible with CAO and DCAO approval)
- Education: Bachelor's degree or higher. Associate degree holders must have an average annual income of at least 120,000 THB
- Work Experience: If previously licensed as an insurance agent with another company, the license must have been held for no more than 2 years
- Agent License Status: New agents whose contract with KTAXA has been effective for less than 12 months, or return agents with a gap of more than 5 years from their last contract
- Must never have been an AXA Prime Blue Agent or KTAXA Advisor
- Required Documents: Proof of income for the past 12 months (salary slips or bank statements); new graduates must provide a certificate of graduation

Interview Process:
All candidates must pass an interview conducted by the Program Committee consisting of:
- Recruitment Team
- R&R (Rewards & Recognition)
- MA (Agency Manager)
The decision of the Program Committee is final.

Company Financing (CF):
- Monthly CF: 15,000 THB
- Duration: 10 months
- CF provides upfront income support during the transition period
- Monthly income eligibility is determined by the higher of accumulated First Year Commission (FYC) or accumulated CF
- 100% of FYC is deducted until it equals the total CF paid; any FYC exceeding total CF is paid in full

Monthly FYC Targets:
- Month 1: 40% (6,000 THB)
- Month 2: 60% (9,000 THB)
- Month 3: 80% (12,000 THB)
- Months 4-6: 100% (15,000 THB each)
- Months 7-10: 130% (19,500 THB each)

Accumulated FYC Targets:
- Month 1: 40% (6,000 THB)
- Month 2: 100% (15,000 THB)
- Month 3: 180% (27,000 THB)
- Month 4: 280% (42,000 THB)
- Month 5: 380% (57,000 THB)
- Month 6: 480% (72,000 THB)
- Month 7: 610% (91,500 THB)
- Month 8: 740% (111,000 THB)
- Month 9: 870% (130,500 THB)
- Month 10: 1,000% (150,000 THB)

Assessment Criteria (must pass all 3):
1. Approved Performance (Active): At least 1 approved policy per month
2. Training Participation: At least 80% attendance in Month 3, Month 5, and Month 10
3. Accumulated FYC Target: Must meet the target percentage

Bonuses:

1. Month 5 Success Bonus: 1 month of CF (15,000 THB) if:
   - Accumulated FYC ≥ 380% of CF
   - Active for at least 4 out of 5 months
   - ≥ 80% training participation (Months 1-5)
   - Must hold KTAXA Advisor status at end of Month 5

2. Month 10 Success Bonus: 1 month of CF (15,000 THB) if:
   - Accumulated FYC ≥ 1,000% of CF
   - Active for at least 8 out of 10 months
   - ≥ 80% training participation (all 10 months)
   - Must hold KTAXA Advisor status at end of Month 10

3. Over Achievement Bonus (OAB): Awarded when accumulated FYC exceeds 1,000% of CF
   - FYC 150,001-199,999 THB excess: 10% of excess FYC
   - FYC 200,000-299,999 THB excess: 20% of excess FYC
   - FYC 300,000+ THB excess: 25% of excess FYC
   - 30% paid monthly, remaining 70% paid after completing the 10-month program

Other Benefits:
- Welcome Pack at first orientation session
- Personalized Gift upon reaching 180% accumulated FYC, Active for 3 months, and ≥ 80% training (Months 1-3)
- Graduated Suit upon completing the program at Month 10

Career Achievement Bonus (CAB) — "10 Years, 10 Million" pathway:
- Stage 1 (Years 1-4): 4,000,000 THB — reach DM by Year 5, 1 referred agent, IC License, ≥ 75% persistency
- Stage 2 (Years 5-7): 3,000,000 THB — reach MM1 by Year 8, expand 2 units, 4 referred agents
- Stage 3 (Years 8-10): 3,000,000 THB — appointed GA by Year 9, GA Certify by Year 10, 8 referred agents
- Total CAB cap: 10,000,000 THB over 10 years

Training Plan (29 training days total, hybrid format: Classroom + Microsoft Teams + Online):
- Month 1 (6 days): Orientation, AXA introduction, profession introduction, benefits structure, basic life insurance planning, main and supplementary products (สัญญาหลักและอนุสัญญา), 7-step sales process + Roleplay, Digital Tools
- Month 2 (5 days): AXA product packages (iCare, So Shield, Koom Wer package), Retirement Planning & Annuity, Endowment Products, Customer Analysis, Financial Pyramid, Financial Health Check, Field Underwriting
- Month 3 (4 days): Social Media Marketing & Branding, CS & Key Man Insurance, Personal Tax Planning, Claim Process
- Month 4 (4 days): Personal Financial Statement, 4 Dimensions by Unit-linked
- Month 5 (3 days): ULP overview, 4 Dimensions of Unit-Linked Products, ULIP: what it is, benefits, and suitable customer profiles
- Month 6 (3 days): Coach Activity (once per month), AXA Prime Blue Club
- Months 7-10 (1 day each): Activity Coaching (once per month), AXA Prime Blue Club
- No training during Week 4 of each month

Termination Conditions:
- Fails to meet 1,000% accumulated FYC at end of Month 10
- Does not maintain Active status for two consecutive months
- Participates in less than 80% of training in Month 3, Month 5, or Month 10
- Violates Agent Contract Maintenance Regulations (VOC)
- Upon termination, reverts to regular agent status; excess FYC over CF is refunded

Common Objections:
- "Is 15,000 THB per month enough to live on?" → CF is a safety net while you build your client base. Top performers earn well above CF through commissions. By Month 5, many agents earn significantly more than the CF amount.
- "What if I can't meet the targets?" → The targets are progressive — starting at just 40% in Month 1. You have comprehensive training and coaching support. Many agents with no prior insurance experience succeed.
- "I'm worried about job stability" → The insurance industry in Thailand is growing. KT-AXA is backed by global AXA Group. The 10-year CAB pathway shows long-term commitment to your growth.
- "What happens if I fail the program?" → You revert to regular agent status and keep your license. Any excess FYC over CF paid is refunded to you.

Success Scenario:
The prospect becomes interested in the KTAXA Advisor program and agrees to attend the company's career opportunity seminar (BOP) or commits to the interview process.

Program Effective Period: January 9, 2026 to December 31, 2026`,
    productType: ProductType.OWN,
    keyFeatures: [
      '15,000 THB Monthly Company Financing (CF)',
      '10-Month Structured Program',
      'Month 5 & Month 10 Success Bonuses',
      'Over Achievement Bonus (OAB) up to 25%',
      '29-Day Hybrid Training Program',
      'Career Achievement Bonus up to 10,000,000 THB over 10 years',
      'Welcome Pack & Personalized Gift',
      'Graduated Suit upon Completion',
      'Clear Career Path: Agent → DM → MM → GA',
    ],
    featureHighlight: {
      title:
        'KTAXA Advisor — Jumpstart your insurance career with 15,000 THB monthly support and a structured 10-month development program',
      description:
        'The KTAXA Advisor program provides new agents with 15,000 THB monthly Company Financing, comprehensive hybrid training, success bonuses, and a 10-year Career Achievement Bonus pathway worth up to 10,000,000 THB.',
    },
    evaluationFocus: ['Soft Skills', 'Knowledge Skills'],
    modules: ['kt-axa-agent-recruitment'],
    callCriteria: {
      en: {
        title: 'KTAXA Advisor Recruitment Scorecard',
        description: 'You will be evaluated on two key areas:',
        criteria: [
          'Soft Skills: Communication Skills, Relationship Building, Adaptability, and Customer Orientation',
          'Knowledge Skills: Fact Finding, Business Knowledge, Problem-Solving, Sales & Negotiation Skills, and KTAXA Advisor Program Knowledge',
        ],
      },
      th: {
        title: 'บัตรคะแนนการสรรหา KTAXA Advisor',
        description: 'คุณจะได้รับการประเมินในสองด้านหลัก:',
        criteria: [
          'ทักษะด้านอ่อน: ทักษะการสื่อสาร การสร้างความสัมพันธ์ ความสามารถในการปรับตัว และการมุ่งเน้นลูกค้า',
          'ทักษะด้านความรู้: การค้นหาข้อมูล ความรู้ทางธุรกิจ การแก้ปัญหา ทักษะการขายและการเจรจา และความรู้เกี่ยวกับโปรแกรม KTAXA Advisor',
        ],
      },
    },
  },
  // KTAXA Advisor X Program
  {
    _id: '671eb0000000000000000006',
    friendlyId: 'kt-axa-advisor-x',
    name: 'KT-AXA Advisor X',
    salesTarget: 'individual',
    knowledgePrompt: `KTAXA Advisor X Program — Krungthai-AXA Life Insurance Public Company Limited

Program Overview:
The KTAXA Advisor X program is the premium tier of the KTAXA Advisor development program, offering 30,000 THB monthly Company Financing (CF) for high-potential agents. This 10-month structured program targets experienced professionals with at least 2 years of work experience who want to transition into a career as a professional financial advisor.

Scenario Context:
This is a recruitment conversation where the agent presents the KTAXA Advisor X program to a prospect. The recruiter's goal is to explain the enhanced program benefits, address concerns about the insurance career, highlight the premium nature of the program, and guide the prospect toward joining.

Qualifications for Joining:
- Age: Not over 50 years old (exceptions possible with CAO and DCAO approval)
- Education: Bachelor's degree or higher (no associate degree option)
- Work Experience: At least 2 years of work experience in any field. If less than 2 years, must have graduated in finance, accounting, or economics, OR hold an Investment Consultant (IC) License from the start
- Agent License Status: New agents whose contract with KTAXA has been effective for less than 12 months, or return agents with a gap of more than 5 years from their last contract
- Must never have been an AXA Prime Blue Agent or KTAXA Advisor
- Required Documents: Proof of income for the past 12 months (salary slips or bank statements); new graduates must provide a certificate of graduation

Interview Process:
All candidates must pass an interview conducted by the Program Committee consisting of:
- Recruitment Team
- R&R (Rewards & Recognition)
- MA (Agency Manager)
- RAM or a representative assigned by RAM (additional panel member for Advisor X)
The decision of the Program Committee is final.

Company Financing (CF):
- Monthly CF: 30,000 THB
- Duration: 10 months
- CF provides upfront income support during the transition period
- Monthly income eligibility is determined by the higher of accumulated First Year Commission (FYC) or accumulated CF
- 100% of FYC is deducted until it equals the total CF paid; any FYC exceeding total CF is paid in full

Monthly FYC Targets:
- Month 1: 40% (12,000 THB)
- Month 2: 60% (18,000 THB)
- Month 3: 80% (24,000 THB)
- Months 4-6: 100% (30,000 THB each)
- Months 7-10: 130% (39,000 THB each)

Accumulated FYC Targets:
- Month 1: 40% (12,000 THB)
- Month 2: 100% (30,000 THB)
- Month 3: 180% (54,000 THB)
- Month 4: 280% (84,000 THB)
- Month 5: 380% (114,000 THB)
- Month 6: 480% (144,000 THB)
- Month 7: 610% (183,000 THB)
- Month 8: 740% (222,000 THB)
- Month 9: 870% (261,000 THB)
- Month 10: 1,000% (300,000 THB)

Assessment Criteria (must pass all 3):
1. Approved Performance (Active): At least 1 approved policy per month
2. Training Participation: At least 80% attendance in Month 3, Month 5, and Month 10
3. Accumulated FYC Target: Must meet the target percentage

Bonuses:

1. Month 5 Success Bonus: 1 month of CF (30,000 THB) if:
   - Accumulated FYC ≥ 380% of CF
   - Active for at least 4 out of 5 months
   - ≥ 80% training participation (Months 1-5)
   - Must hold KTAXA Advisor X status at end of Month 5

2. Month 10 Success Bonus: 1 month of CF (30,000 THB) if:
   - Accumulated FYC ≥ 1,000% of CF
   - Active for at least 8 out of 10 months
   - ≥ 80% training participation (all 10 months)
   - Must hold KTAXA Advisor X status at end of Month 10

3. Over Achievement Bonus (OAB): Awarded when accumulated FYC exceeds 1,000% of CF
   - FYC 300,000+ THB excess: 30% of excess FYC
   - 30% paid monthly, remaining 70% paid after completing the 10-month program

Other Benefits:
- Welcome Pack at first orientation session
- Personalized Gift upon reaching 180% accumulated FYC, Active for 3 months, and ≥ 80% training (Months 1-3)
- Graduated Suit upon completing the program at Month 10

Career Achievement Bonus (CAB) — "10 Years, 10 Million" pathway:
- Stage 1 (Years 1-4): 4,000,000 THB — reach DM by Year 5, 1 referred agent, IC License, ≥ 75% persistency
- Stage 2 (Years 5-7): 3,000,000 THB — reach MM1 by Year 8, expand 2 units, 4 referred agents
- Stage 3 (Years 8-10): 3,000,000 THB — appointed GA by Year 9, GA Certify by Year 10, 8 referred agents
- Total CAB cap: 10,000,000 THB over 10 years

Training Plan (29 training days total, hybrid format: Classroom + Microsoft Teams + Online):
- Month 1 (6 days): Orientation, basic insurance & product knowledge, 7-step sales process, sales tools, sales activities
- Month 2 (5 days): Goal setting, product packages (iCare, iShield, etc.), retirement & savings planning, endowment/savings life insurance products, customer analysis, Financial Pyramid, financial health check, underwriting conditions, sales activities
- Month 3 (4 days): Goal setting, sales expansion, marketing & advisory skills, corporate market & key person insurance, sales activities
- Month 4 (4 days): Goal setting, online marketing, personal tax planning, claims process, sales activities
- Month 5 (3 days): Goal setting, personal financial planning, after-sales service, sales activities
- Month 6 (3 days): Goal setting, investment-linked insurance products (iLink, etc.), after-sales service, sales activities
- Months 7-10 (1 day each): Goal setting, sales activities, sales performance analysis
- No training during Week 4 of each month

Key Differences from KTAXA Advisor:
- Double the CF: 30,000 THB vs 15,000 THB
- Higher education requirement: Bachelor's degree only (no associate degree option)
- Work experience required: At least 2 years (or finance/accounting/economics degree, or IC License)
- Additional interview panel member: RAM or representative
- Higher OAB rate: 30% for all excess FYC over 300,000 THB (simpler, more generous)
- Training curriculum focused more on goal setting, investment products, and performance analysis

Termination Conditions:
- Fails to meet 1,000% accumulated FYC at end of Month 10
- Does not maintain Active status for two consecutive months
- Participates in less than 80% of training in Month 3, Month 5, or Month 10
- Violates Agent Contract Maintenance Regulations (VOC)
- Upon termination, reverts to regular agent status; excess FYC over CF is refunded

Common Objections:
- "Why should I choose Advisor X over the regular Advisor program?" → Advisor X offers double the financial support (30,000 THB vs 15,000 THB), giving you a stronger financial cushion. The OAB rate is also higher at 30%. It's designed for professionals like you who have established careers and need adequate support during the transition.
- "The targets seem very high for 30,000 THB CF" → The percentage targets are the same as the regular program — the amounts are higher because your CF is higher. With your professional background and the comprehensive training, many Advisor X agents exceed their targets. The progressive structure starts at just 40% in Month 1.
- "I don't have insurance experience" → That's exactly why this program exists. Your 2+ years of professional experience gives you transferable skills — client management, communication, problem-solving. The 29-day training program covers everything from basics to advanced investment products.
- "What about income stability?" → You receive 30,000 THB monthly CF for 10 months regardless. As you build your client base, your commission income grows. The CAB pathway offers up to 10,000,000 THB over 10 years — this is a serious long-term career opportunity.

Success Scenario:
The prospect becomes interested in the KTAXA Advisor X program and agrees to attend the company's career opportunity seminar (BOP) or commits to the interview process.

Program Effective Period: January 9, 2026 to December 31, 2026`,
    productType: ProductType.OWN,
    keyFeatures: [
      '30,000 THB Monthly Company Financing (CF)',
      '10-Month Structured Program',
      'Month 5 & Month 10 Success Bonuses',
      'Over Achievement Bonus (OAB) at 30%',
      '29-Day Hybrid Training Program',
      'Career Achievement Bonus up to 10,000,000 THB over 10 years',
      'Welcome Pack & Personalized Gift',
      'Graduated Suit upon Completion',
      'RAM Interview Panel for Selective Admission',
      'Clear Career Path: Agent → DM → MM → GA',
    ],
    featureHighlight: {
      title:
        'KTAXA Advisor X — Premium 30,000 THB monthly support for high-potential agents with an accelerated career path',
      description:
        'The KTAXA Advisor X program offers 30,000 THB monthly Company Financing for experienced professionals, with comprehensive training, higher OAB rates, and the same 10-year Career Achievement Bonus pathway worth up to 10,000,000 THB.',
    },
    evaluationFocus: ['Soft Skills', 'Knowledge Skills'],
    modules: ['kt-axa-agent-recruitment'],
    callCriteria: {
      en: {
        title: 'KTAXA Advisor X Recruitment Scorecard',
        description: 'You will be evaluated on two key areas:',
        criteria: [
          'Soft Skills: Communication Skills, Relationship Building, Adaptability, and Customer Orientation',
          'Knowledge Skills: Fact Finding, Business Knowledge, Problem-Solving, Sales & Negotiation Skills, and KTAXA Advisor X Program Knowledge',
        ],
      },
      th: {
        title: 'บัตรคะแนนการสรรหา KTAXA Advisor X',
        description: 'คุณจะได้รับการประเมินในสองด้านหลัก:',
        criteria: [
          'ทักษะด้านอ่อน: ทักษะการสื่อสาร การสร้างความสัมพันธ์ ความสามารถในการปรับตัว และการมุ่งเน้นลูกค้า',
          'ทักษะด้านความรู้: การค้นหาข้อมูล ความรู้ทางธุรกิจ การแก้ปัญหา ทักษะการขายและการเจรจา และความรู้เกี่ยวกับโปรแกรม KTAXA Advisor X',
        ],
      },
    },
  },
];
