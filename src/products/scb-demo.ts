import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

export const SCB_DEMO_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '6a1000000000000000000001',
    friendlyId: 'scb-demo-advisory',
    name: 'SCB Advisory Services',
    productType: ProductType.OWN,
    modules: ['scb-demo-discovery'],
    salesTarget: 'individual',
    keyFeatures: [
      'Personalized financial advisory services',
      'Wealth management solutions',
      'Investment portfolio guidance',
      'Retirement and savings planning',
    ],
    featureHighlight: {
      title: 'Comprehensive Financial Advisory',
      description:
        'Expert guidance for your financial goals and wealth management needs.',
    },
    evaluationFocus: [
      'Ability to identify client needs and present appropriate advisory solutions',
    ],
    markdown: `## SCB Advisory Services

SCB Advisory Services provides comprehensive wealth management and financial planning solutions tailored to high-net-worth and affluent clients. The service combines expert advisory with a wide range of investment and insurance solutions to help clients achieve their financial goals.

---

## Service Tiers

**Priority Banking:**
- For clients with Total Relationship Balance (TRB) of SGD 200,000 and above
- Dedicated Relationship Manager
- Priority service at branches
- Preferential rates on deposits and loans

**Priority Private:**
- For clients with Assets Under Management (AUM) of SGD 2,000,000 and above
- Dedicated Senior Relationship Manager
- Access to exclusive investment opportunities
- Comprehensive wealth planning and legacy solutions
- Private banking privileges

---

## Investment Solutions

**1. Unit Trusts & Funds:**
- Access to 200+ funds across major asset classes
- Equity, fixed income, multi-asset, and alternative funds
- Regular Savings Plan (RSP) starting from SGD 100/month
- Fund selection guidance based on risk profile

**2. Bonds:**
- Government and corporate bonds
- Minimum investment from SGD 250,000
- Regular coupon payments for income generation
- Portfolio diversification with fixed income allocation

**3. Structured Products:**
- Equity-linked notes and deposits
- Capital protected and non-capital protected options
- Enhanced yield opportunities
- Tailored solutions for specific market views

**4. Foreign Exchange:**
- Competitive FX rates for major and emerging market currencies
- FX advisory for portfolio hedging
- Dual currency investments for yield enhancement

---

## Wealth Planning Solutions

**1. Insurance & Protection:**
- Life insurance for income protection and legacy planning
- Critical illness coverage
- Universal life plans for wealth transfer
- Education endowment plans

**2. Retirement Planning:**
- CPF optimization strategies
- SRS (Supplementary Retirement Scheme) advisory
- Retirement income portfolio construction
- Annuity solutions for guaranteed income

**3. Estate & Legacy Planning:**
- Trust and will advisory services
- Business succession planning
- Philanthropic advisory
- Cross-border estate planning

---

## Key Differentiators

**1. Holistic Advisory Approach:**
- Comprehensive financial needs analysis before any product recommendation
- Annual portfolio review and rebalancing
- Life-stage based financial planning

**2. Market Insights & Research:**
- Access to SCB Global Research covering 60+ markets
- Weekly market outlook and investment ideas
- Real-time market alerts and portfolio monitoring

**3. Digital Capabilities:**
- SC Mobile app for portfolio tracking and trading
- Online wealth dashboard with real-time valuations
- Digital advisory tools for scenario planning

**4. Global Connectivity:**
- Presence in 50+ markets across Asia, Africa, and the Middle East
- Cross-border banking and investment capabilities
- Global market access through a single relationship`,
    knowledgePrompt: `You are a potential client being approached about SCB Advisory Services.
You have moderate financial knowledge and are open to hearing about advisory services but need to be convinced of the value.`,
    callCriteria: {
      en: {
        title: 'SCB Advisory Services Evaluation',
        description:
          'Evaluates how effectively the learner performs in the simulation, enabled by the AI.',
        criteria: [
          'Advisory skills demonstration (25%)',
          'Client engagement & objection handling (25%)',
          'Structure, progression & outcome management (25%)',
          'Actionability of coaching insights (25%)',
        ],
        markdown: `## Evaluation Framework

### 1. Advisory skills demonstration
- Demonstrates clear understanding of client needs through effective discovery
- Articulates value propositions aligned with client priorities and suitability
- Applies appropriate advisory techniques (e.g. portfolio logic, risk discussion, consolidation rationale)
- Uses language and framing appropriate to client sophistication level

### 2. Client engagement & objection handling
- Responds effectively to client objections and challenges
- Addresses client concerns with clarity, confidence, and rationale
- Avoids defensive, vague, or overly generic responses
- Maintains professional tone and relationship throughout resistance moments

### 3. Structure, progression & outcome management
- Conversation follows a logical advisory flow (opening → discovery → value discussion → recommendation → next steps)
- Demonstrates ability to steer the conversation without losing client engagement
- Clearly articulates next steps or outcomes (e.g. follow-up, proposal, consolidation ask)
- Adjusts approach based on client reactions during the session

### 4. Actionability of coaching insights
- Clearly identifies strengths and development areas after using AI demonstration tool
- Re-practising according to AI's feedback and suggestions and get better score/result
- Get well prepared when meet the real client via practising with AI coaching insights`,
      },
    },
  },
];
