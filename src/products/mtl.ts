import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

/**
 * MTL Sales Products
 */
export const MTL_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '671e60000000000000000000',
    friendlyId: 'mtl-agent-recruitment',
    name: 'Muang Thai Agent Recruitment',
    salesTarget: 'individual',
    knowledgePrompt: `Muang Thai Life Insurance (MTL) is recruiting new insurance agents to join our team. This is an opportunity to become a professional insurance advisor helping people plan and protect their future while building your own career and financial independence.

Key Benefits:
- 10,000 Baht Training Allowance: Financial support during your training period so you can learn without financial pressure
- Comprehensive Training: Step-by-step guidance and comprehensive training program to help you succeed
- Flexibility: Control your own schedule and work-life balance
- Personal Growth: Develop valuable skills in sales, communication, and financial planning
- Earning Potential: Build your income based on your effort and dedication
- Meaningful Work: Help families secure their financial future and protect what matters most

How It Works:
As an MTL insurance agent, you'll receive 10,000 baht during your training period. You'll get comprehensive training and step-by-step guidance on how to help clients understand their insurance needs and find the right solutions. You'll have flexibility in managing your schedule while building your client base and growing your income through commissions.

Target Recruits:
- Individuals looking for career growth and financial independence
- Those seeking flexible work arrangements
- People who want to help others while building their own future
- Anyone interested in financial services and personal development
- Those looking for meaningful work that makes a difference

Important Considerations:
- Training support and mentorship are provided throughout your journey
- Success requires dedication, persistence, and a willingness to learn
- Initial income may vary as you build your client base
- The role offers flexibility but requires self-discipline and time management
- Many successful agents started with similar concerns and have built thriving careers
- The opportunity is suitable for those ready to take control of their professional future`,
    productType: ProductType.OWN,
    keyFeatures: [
      '10,000 Baht Training Allowance',
      'Comprehensive Training Program',
      'Step-by-Step Guidance',
      'Flexible Schedule',
      'Personal Growth Opportunities',
      'Earning Potential',
      'Meaningful Work',
    ],
    featureHighlight: {
      title:
        'Professional insurance agent opportunity with training support and flexible career path',
      description:
        'MTL offers a rewarding career as an insurance agent with 10,000 baht training allowance, comprehensive training, step-by-step guidance, and the flexibility to build your own successful practice while helping families secure their future.',
    },
    evaluationFocus: [
      'Rapport & Empathy',
      'Opportunity Framing',
      'Objection Handling',
      'Motivation & Persuasion',
      'Call to Action',
      'Trust Building',
      'Benefits Communication',
    ],
    modules: ['mtl-agent-recruitment'],
    callCriteria: {
      en: {
        title: 'MTL Agent Recruitment Scorecard',
        description:
          'To get the best standing in this session, aim to meet all the key evaluation criteria:',
        criteria: [
          'Build trust and make the potential recruit feel comfortable with a natural, encouraging tone',
          'Present the MTL role as professional, meaningful, and rewarding with clear benefits',
          'Respond confidently to emotional and logical concerns with realistic reassurance',
          'Inspire belief in personal growth and success through relatable examples',
          'Convert interest into clear next steps with explicit commitment to apply or sign up',
        ],
      },
      th: {
        title: 'บัตรคะแนนการรับสมัครเอเจนต์ MTL',
        description:
          'เพื่อให้ได้ผลลัพธ์ที่ดีที่สุดในเซสชันนี้ ให้มุ่งมั่นตอบสนองเกณฑ์การประเมินหลักทั้งหมด:',
        criteria: [
          'สร้างความไว้วางใจและทำให้ผู้สมัครรู้สึกสบายใจด้วยน้ำเสียงที่เป็นธรรมชาติและให้กำลังใจ',
          'นำเสนอบทบาท MTL เป็นมืออาชีพ มีความหมาย และคุ้มค่าพร้อมผลประโยชน์ที่ชัดเจน',
          'ตอบสนองอย่างมั่นใจต่อความกังวลทางอารมณ์และตรรกะด้วยการให้ความมั่นใจที่สมจริง',
          'สร้างแรงบันดาลใจความเชื่อในการเติบโตส่วนบุคคลและความสำเร็จผ่านตัวอย่างที่เกี่ยวข้อง',
          'แปลงความสนใจให้เป็นขั้นตอนถัดไปที่ชัดเจนพร้อมความมุ่งมั่นที่ชัดเจนในการสมัครหรือลงทะเบียน',
        ],
      },
    },
  },
  {
    _id: '671e60000000000000000001',
    friendlyId: 'mtl-ul-plus-sales',
    name: 'Muang Thai UL Plus',
    salesTarget: 'individual',
    knowledgePrompt: `[MUANG THAI UL PLUS - PRODUCT INFORMATION]

**Product Name**: Muang Thai UL Plus (เมืองไทยยูแอล พลัส)
**Product Type**: Universal Life Insurance with Investment Component
**Official Name**: Muang Thai Universal Life 1

**KEY FEATURES**

1. **Guaranteed Minimum Returns**
   - First policy year: Minimum 4% return per year on investment value
   - From second policy year onwards: Minimum 1% return per year on investment value
   - Returns apply to the investment portion of premiums

2. **Life Insurance Coverage**
   - Death benefit = Sum assured + Investment value
   - Comprehensive life protection for family security
   - Coverage can be adjusted based on needs (subject to underwriting)

3. **Tax Benefits**
   - Eligible for personal income tax deduction up to 100,000 THB per year
   - Conditions apply based on policy terms and tax regulations

4. **Flexibility**
   - Adjustable premium payments based on financial situation
   - Partial withdrawals available (subject to fees and minimum policy value requirements)
   - Multiple investment fund options to match risk tolerance
   - Premium payment can be annual, semi-annual, quarterly, or monthly

5. **Investment Component**
   - Professional fund management by Muang Thai Life
   - Portfolio includes: Government & corporate bonds (low risk), unit trusts, equity instruments (max 20% of portfolio)
   - Investment allocation adjusted based on market conditions
   - Regular performance reports provided to policyholders

**ELIGIBILITY & TERMS**

- **Age**: 30 days to 75 years (at entry)
- **Coverage Period**: Until age 99 or until investment value is insufficient to cover policy charges
- **Premium Payment Period**: Until age 99
- **Minimum Premium**:
  - Annual: 10,000 THB
  - Semi-annual: 5,000 THB  
  - Quarterly: 3,000 THB
  - Monthly: 1,000 THB
- **Minimum Sum Assured**: Varies by age (8x annual premium for ages 0-49, 5x for ages 50-70, 2x for ages 71-75)
- **Maximum Sum Assured**: No limit

**FEES & CHARGES**

1. **Premium Allocation Charges** (deducted from premiums):
   - Year 1: 60% of annual premium
   - Years 2-5: 40%-10% declining scale
   - Year 6 onwards: 0%

2. **Cost of Insurance (COI)**:
   - Monthly charge based on age, gender, and sum assured
   - Increases with age
   - Deducted from investment value

3. **Policy Administration Fee**: 55 THB/month

4. **Top-Up Premium Fee**: 3% of top-up amount

5. **Surrender/Withdrawal Charges**:
   - Years 1-10: 80%-0% declining scale on withdrawn amount
   - Year 11 onwards: 0%

6. **Free Look Period**: 15 days from policy receipt (500 THB cancellation fee + actual medical exam costs if any)

**TARGET CUSTOMERS**

- Self-employed individuals with variable income
- Parents planning for children's education
- Individuals seeking both protection and investment growth
- Those wanting premium flexibility and tax benefits
- Ages 30 days to 75 years
- People comfortable with managed investment risk

**IMPORTANT DISCLAIMERS**

- Universal Life Insurance, NOT a bank deposit
- NOT pure investment fund with free insurance
- Past performance does not guarantee future results
- Policy charges may exceed investment value, requiring top-up payments
- Changing or canceling policy/riders may affect tax deduction eligibility
- Policy will lapse if charges cannot be covered by investment value
- Suicide within 1 year of policy start or increase is not covered
- Medical underwriting required, non-disclosure may void policy

**VALUE PROPOSITIONS**

1. **Dual Benefit**: Combines life protection with wealth accumulation
2. **Guaranteed Returns**: Minimum 4% first year, 1% thereafter on investment value
3. **Flexibility**: Adjust premiums, withdraw funds, select investment allocation
4. **Tax Advantage**: Up to 100,000 THB annual deduction
5. **Professional Management**: Expert fund management with regular performance tracking
6. **Comprehensive Protection**: Death benefit covers family's financial security

**HOW TO TRACK POLICY**

- Annual policy statements mailed to policyholders
- MTL Click mobile application (real-time access)
- Website: www.muangthai.co.th
- Call Center: 1766 (press 4)`,
    productType: ProductType.OWN,
    keyFeatures: [
      'Flexible Premium Payments',
      'Investment Fund Selection',
      'Life Insurance Protection',
      'Partial Withdrawals',
      'Tax Benefits',
      'Death Benefit',
      'Policy Loans',
    ],
    featureHighlight: {
      title:
        'Flexible universal life insurance combining protection with investment growth',
      description:
        'Muang Thai UL Plus offers flexible premiums, multiple investment fund options, and comprehensive life coverage in one plan.',
    },
    evaluationFocus: [
      'Product Framing: Ability to introduce UL Plus naturally and link it accurately to identified customer needs',
      'Flexibility Communication: Understanding and articulation of premium flexibility and fund selection options',
      'Protection-Investment Balance: Clear explanation of how UL Plus combines life protection with investment growth',
      'Guaranteed Returns: Accurate communication of 4% first year and 1% ongoing minimum returns on investment value',
      'Target Customer Fit: Recognition of suitable customers (self-employed, variable income, education planning)',
      'Tax Benefits: Correct explanation of up to 100,000 THB tax deduction eligibility',
      'Fees Understanding: Awareness of key charges (premium allocation, COI, administration fees)',
      'Product Accuracy: Correct representation of product features without misstatements',
    ],
    modules: ['mtl-ul-plus-sales', 'mtl-prospect-practice'],
    callCriteria: {
      en: {
        title: 'MTL UL Plus Advisory Scorecard',
        description:
          'To get the best standing in this session, aim to meet all the key evaluation criteria:',
        criteria: [
          'Build rapport quickly and establish trust',
          'Discover customer needs through open-ended questions',
          'Introduce UL Plus naturally and link to identified needs',
          'Explain product features accurately using only provided product information',
          'Address objections clearly with accurate product knowledge',
        ],
      },
      th: {
        title: 'บัตรคะแนนการให้คำปรึกษา MTL UL Plus',
        description:
          'เพื่อให้ได้ผลลัพธ์ที่ดีที่สุดในเซสชันนี้ ให้มุ่งมั่นตอบสนองเกณฑ์การประเมินหลักทั้งหมด:',
        criteria: [
          'สร้างสัมพันธ์อย่างรวดเร็วและสร้างความไว้วางใจ',
          'ค้นพบความต้องการของลูกค้าผ่านคำถามปลายเปิด',
          'แนะนำ UL Plus อย่างเป็นธรรมชาติและเชื่อมโยงกับความต้องการที่ระบุ',
          'อธิบายคุณสมบัติผลิตภัณฑ์อย่างถูกต้องโดยใช้ข้อมูลผลิตภัณฑ์ที่ให้ไว้เท่านั้น',
          'จัดการกับข้อโต้แย้งอย่างชัดเจนด้วยความรู้ผลิตภัณฑ์ที่ถูกต้อง',
        ],
      },
    },
  },
];
