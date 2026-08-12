import { Types } from 'mongoose';
import { SalesFramework } from '../frameworks/types.js';
import { IModule, ModuleLocalizations } from '../models/Module.js';

/**
 * Define group keys used for translation lookups
 */
export const SALES_MODULE_GROUPS = {
  PROSPECTING: 'prospecting',
  RELATIONSHIP: 'relationship',
  CLOSING: 'closing',
  RETENTION: 'retention',
} as const;

export type SalesModuleGroupKey = keyof typeof SALES_MODULE_GROUPS;

/**
 * Default English values for module groups
 */
export const MODULE_GROUPS = {
  PROSPECTING: 'Prospecting & Discovery',
  RELATIONSHIP: 'Relationship Building',
  CLOSING: 'Closing & Negotiation',
  RETENTION: 'Retention & Upselling',
  CUSTOM: 'Custom',
} as const;

/**
 * Default sales modules for general use
 */
export const ALL_SALES_MODULES: IModule[] = [
  {
    _id: new Types.ObjectId('671e60000000000000000000'),
    friendlyId: 'cold-call',
    icon: '❄️',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Cold Call',
    description: 'Contact a new lead to secure a first meeting.',
    framework: SalesFramework.FOUR_C_MODEL,
    fields: {
      shown: ['name', 'age', 'location', 'occupation'],
      hidden: [],
    },
  },
  {
    _id: new Types.ObjectId('671e60000000000000000001'),
    friendlyId: 'discovery',
    icon: '🔍',
    iconBgColor: '#FFF4EB',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Discovery',
    description: "Probe the client's situation to uncover needs and facts.",
    framework: SalesFramework.THREE_F_MODEL,
    fields: { shown: [], hidden: [] },
  },
  {
    _id: new Types.ObjectId('671e60000000000000000002'),
    friendlyId: 'competitive-proposal',
    icon: '📊',
    iconBgColor: '#FFECEB',
    group: MODULE_GROUPS.RELATIONSHIP,
    title: 'Competitive Proposal',
    description:
      'Present your solution and out-position rival products the client is weighing.',
    framework: SalesFramework.VERIFY_PLUS_FOUR_C_MODEL,
    fields: { shown: [], hidden: [] },
  },
  {
    _id: new Types.ObjectId('671e60000000000000000003'),
    friendlyId: 'objection-handling',
    icon: '🌴',
    iconBgColor: '#FFECEB',
    group: MODULE_GROUPS.CLOSING,
    title: 'Objection Handling Drill',
    description:
      'Rapid-fire pushbacks on price, need, or timing and keep value anchored.',
    fields: { shown: [], hidden: [] },
  },
  {
    _id: new Types.ObjectId('671e60000000000000000004'),
    friendlyId: 'closing',
    icon: '📄',
    iconBgColor: '#E7F8F3',
    group: MODULE_GROUPS.CLOSING,
    title: 'Closing',
    description: 'Confirm agreement and collect application details.',
    fields: { shown: [], hidden: [] },
  },
  {
    _id: new Types.ObjectId('671e60000000000000000005'),
    friendlyId: 'review-renewal',
    icon: '🔄',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.RETENTION,
    title: 'Review / Renewal',
    description: 'Revisit current coverage to renew, tweak, or upsell.',
    fields: { shown: [], hidden: [] },
  },
  {
    _id: new Types.ObjectId('671e60000000000000000006'),
    friendlyId: 'product-positioning',
    icon: '📊',
    iconBgColor: '#FFECEB',
    group: MODULE_GROUPS.CLOSING,
    title: 'Product Positioning',
    description:
      'Rapid-fire pushbacks on price, need, or timing and keep value anchored.',
    framework: SalesFramework.THREE_F_MODEL,
    fields: { shown: [], hidden: [] },
  },
  // GRAB
  {
    _id: new Types.ObjectId('671e60000000000000000007'),
    friendlyId: 'discovery-call-meddpicc',
    icon: '🎯',
    iconBgColor: '#E7F8F3',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Discovery Call',
    description:
      'Uncover client pain points, needs, and budget using MEDDPICC methodology.',
    framework: SalesFramework.MEDDPICC,
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
  },
  {
    _id: new Types.ObjectId('671e60000000000000000008'),
    friendlyId: 'deal-closure',
    icon: '🤝',
    iconBgColor: '#E7F8F3',
    group: MODULE_GROUPS.CLOSING,
    title: 'Deal Closure',
    description:
      'Negotiate with the prospect to align on key commercial details and close the deal.',
    framework: SalesFramework.MEDDPICC,
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
  },
  {
    _id: new Types.ObjectId('671e60000000000000000009'),
    friendlyId: 'grab-mex',
    icon: '🎯',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.RELATIONSHIP,
    title: 'Budget Constraint Handling',
    description:
      'Practice handling merchant budget constraints and P&L concerns while driving campaign participation',
    framework: SalesFramework.GRAB_MEX_MEDDPICC,
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
  },
  // MSIG
  {
    _id: new Types.ObjectId('671e60000000000000000010'),
    friendlyId: 'telesales',
    icon: '📄',
    iconBgColor: '#E7F8F3',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Tele Sales',
    description:
      'Make effective telemarketing calls to generate leads and close sales remotely.',
    framework: SalesFramework.FOUR_C_MODEL,
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'persona',
        'communicationStyle',
        'decisionMaking',
        'workHistory',
      ],
      hidden: [],
    },
  },
  {
    _id: new Types.ObjectId('671e60000000000000000013'),
    friendlyId: 'agency-sales',
    icon: '🏢',
    iconBgColor: '#E7F8F3',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Agency Sales',
    description:
      'Establish credibility and drive growth through consultative selling',
    framework: SalesFramework.FOUR_C_MODEL,
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'persona',
        'communicationStyle',
        'decisionMaking',
        'workHistory',
      ],
      hidden: [],
    },
  },
  // Manulife
  {
    _id: new Types.ObjectId('671e60000000000000000011'),
    friendlyId: 'fna',
    icon: '📄',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.PROSPECTING, // or whatever group fits best in your structure
    title: 'Financial Needs Analysis',
    description:
      'Conduct comprehensive financial needs assessments to identify client protection, savings, and investment requirements.',
    // framework: SalesFramework.CONSULTATIVE_SELLING, // or whatever framework you use
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
  },
  // Manulife Product Pitch
  {
    _id: new Types.ObjectId('671e60000000000000000012'),
    friendlyId: 'manulife-product-pitch',
    icon: '🎯',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Product Pitch',
    description:
      "Explore the client's financial goals and recommend suitable Manulife products as solutions to help them achieve their financial objectives.",
    objectives: [
      'Build rapport and establish trust',
      'Reconfirm their top priority from the FNA',
      'Present the product clearly and confidently',
      'Address objections with empathy and clarity',
      'Guide them toward the next step (application or follow-up)',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'workHistory',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: false,
  },
  // BBL
  {
    _id: new Types.ObjectId('671e70000000000000000001'),
    friendlyId: 'bbl-client-upgrade',
    icon: '⬆️',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.RELATIONSHIP,
    title: 'Client Upgrade (in-person meeting)',
    framework: SalesFramework.BBL_CLIENT_UPGRADE_ADVISORY_MODEL,
    description:
      'Contact an existing client to upgrade them to Wealth services.',
    objectives: [
      'Welcome the client to Wealth and note any recent life or career changes.',
      "Present key Wealth services and benefits that fit the client's goals.",
      "Explore the client's profile and priorities to capture essential updates.",
      'Secure agreement for a follow-up investment advisory session.',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('671e70000000000000000002'),
    friendlyId: 'bbl-client-revival',
    icon: '🔄',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.RELATIONSHIP,
    title: 'Client Revival (in-person meeting)',
    framework: SalesFramework.BBL_CLIENT_REVIVAL_ADVISORY_MODEL,
    description: 'Reconnect with inactive clients and spark re-engagement.',
    objectives: [
      'Re-establish the relationship and acknowledge recent inactivity or balance thresholds',
      'Identify key reasons for inactivity and barriers to re-engagement',
      'Explore current priorities and map a clear re-engagement path',
      'Encourage an immediate step and secure the next touchpoint',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('671e70000000000000000003'),
    friendlyId: 'bbl-goal-planning',
    icon: '🎯',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.RELATIONSHIP,
    title: 'Goal Planning (in-person meeting)',
    framework: SalesFramework.BBL_GOAL_PLANNING_ADVISORY_MODEL,
    description:
      'Define, size, and plan financial goals with tailored solutions and next steps.',
    objectives: [
      "Identify and clarify the client's key financial goals and priorities.",
      'Quantify timelines, amounts, and risk tolerance for each goal.',
      'Present tailored solutions that align with their objectives.',
      'Secure commitment to proceed with goal-based planning services.',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('671e70000000000000000004'),
    friendlyId: 'bbl-portfolio-review',
    icon: '📊',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.RELATIONSHIP,
    title: 'Portfolio Review (in-person meeting)',
    framework: SalesFramework.BBL_PORTFOLIO_REVIEW_ADVISORY_MODEL,
    description:
      'Review portfolio performance, discuss market impact, propose adjustments, and confirm next steps.',
    objectives: [
      'Open the meeting with a warm welcome and recap of recent life or financial updates.',
      'Introduce the reason for the portfolio review, linking it to market movements or personal milestones.',
      'Review current portfolio performance and identify key gaps or imbalances.',
      'Recommend tailored rebalancing or top-up solutions aligned to his goals and risk appetite, prioritizing proposing top-up solutions first.',
      'Confirm next steps, secure agreement to proceed, and schedule a follow-up review with regards to the portfolio.',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  // HSBC
  {
    _id: new Types.ObjectId('671e80000000000000000001'),
    friendlyId: 'hsbc-client-onboarding',
    icon: '🚀',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.RELATIONSHIP,
    title: 'Client Onboarding',
    framework: SalesFramework.HSBC_CLIENT_ONBOARDING_ADVISORY_MODEL,
    description: 'Introducing HSBC & Wealth to New to Bank (NTB) clients',
    objectives: [
      "Welcome the client and establish rapport while introducing the bank's wealth management relationship model.",
      "Introduce the bank's wealth proposition in a way that highlights differentiation and alignment with client's priorities.",
      "Understand the client's financial profile, risk appetite, and onboarding requirements.",
      'Guide the client toward first engagement in wealth products and establish the relationship rhythm.',
      "Set up an in-person meeting to discuss HSBC Wealth's offerings in further detail.",
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },

  {
    _id: new Types.ObjectId('671e80000000000000000002'),
    friendlyId: 'hsbc-client-upgrade',
    icon: '⬆️',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.RELATIONSHIP,
    title: 'New to Wealth',
    framework: SalesFramework.HSBC_CLIENT_UPGRADE_ADVISORY_MODEL,
    description:
      'Contact an existing client to initiate a wealth journey with HSBC',
    objectives: [
      'Welcome the client to Wealth and note any recent life or career changes.',
      "Present key Wealth services and benefits that fit the client's goals.",
      "Explore the client's profile and priorities to capture essential updates.",
      'Secure agreement for a follow-up investment advisory session.',
      "Set up an in-person meeting to discuss HSBC Wealth's offerings in further detail.",
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  // MTL
  {
    _id: new Types.ObjectId('671e90000000000000000001'),
    friendlyId: 'mtl-agent-recruitment',
    icon: '👥',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Agent Recruitment',
    framework: SalesFramework.MTL_RECRUITMENT_FRAMEWORK,
    description:
      'Recruiting someone from your network to join MTL as an Insurance Agent',
    objectives: [
      'Build trust and make the potential recruit feel comfortable with a natural, encouraging tone',
      'Present the MTL role as professional, meaningful, and rewarding with clear benefits',
      'Respond confidently to emotional and logical concerns with realistic reassurance',
      'Inspire belief in personal growth and success through relatable examples',
      'Convert interest into clear next steps with explicit commitment to apply or sign up',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('671e90000000000000000002'),
    friendlyId: 'mtl-ul-plus-sales',
    icon: '💼',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'UL Plus Sales',
    framework: SalesFramework.MTL_ADVISORY_FRAMEWORK,
    description:
      'First-time outbound call to prospects who clicked on flexible savings & investment plan ads',
    objectives: [
      'Establish comfort and trust quickly, relate to customer naturally',
      'Use open-ended questions to understand real priorities and financial goals',
      'Introduce Muang Thai UL Plus naturally and link it accurately to identified needs',
      'Address concerns clearly and secure appointment confidently',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('671e90000000000000000003'),
    friendlyId: 'mtl-prospect-practice',
    icon: '👤',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Pitch Mastery',
    framework: SalesFramework.MTL_PROSPECT_FRAMEWORK,
    description:
      'Roles reversed: You play the prospect while observing a top-performing insurance agent conduct needs discovery and product explanation',
    objectives: [
      'Express your financial goals and priorities clearly as a realistic prospect',
      'Ask meaningful questions a real prospect would ask about savings and investment options',
      "Respond naturally to the agent's discovery questions and product explanations",
      'Show realistic progression in your thinking as concerns are addressed',
      'Complete needs discovery and product explanation in one conversation',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: true,
  },
  // AXA-PH
  {
    _id: new Types.ObjectId('671ea0000000000000000001'),
    friendlyId: 'axa-ph-unit-manager-recruitment',
    icon: '👥',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Unit Manager Recruitment',
    framework: SalesFramework.AXA_PH_RECRUITMENT_FRAMEWORK,
    description:
      'Recruit new prospects who showed interest in the financial advising opportunity but are now unsure about taking the next step',
    objectives: [
      'Make the role relatable by showing how everyday strengths (managing schedules, budgeting, planning, communicating) are the same skills used in financial advising',
      'Address time concerns by explaining how the role is flexible and can be done during quiet pockets of the day',
      'Reassure them that they can start at their own pace and that training will guide them step by step',
      'Help them feel more confident and encourage them to attend a training session',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: true,
  },
  // AXA-PH Financial Needs Analysis
  {
    _id: new Types.ObjectId('671ea0000000000000000002'),
    friendlyId: 'axa-ph-financial-needs-analysis',
    icon: '💰',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Financial Needs Analysis',
    framework: SalesFramework.AXA_PH_FNA_FRAMEWORK,
    description:
      'Guide a first-time client through a simple, low-commitment financial needs discussion while addressing concerns about affordability, flexibility, and early access to funds.',
    objectives: [
      'Build rapport with a first-time client',
      'Conduct fact-finding on income, lifestyle, and future financial goals',
      'Present a simple, affordable starter solution with guaranteed returns',
      'Address concerns about commitment, flexibility, and early access to funds',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: ['financialSituation', 'keyPriorities', 'productKnowledge'],
      // hidden: ['financialSituation', 'keyPriorities', 'productKnowledge'],
    },
    singleScenario: true,
  },
  // AXA-PH General Objection Handling
  {
    _id: new Types.ObjectId('671ea0000000000000000003'),
    friendlyId: 'axa-ph-general-objection-handling',
    icon: '🎯',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'General Objection Handling',
    framework: SalesFramework.AXA_PH_OBJECTION_HANDLING_FRAMEWORK,
    description:
      'A general call to practice fact finding and objection handling focused on education funding and protection.',
    objectives: [
      'Build rapport with a family-oriented client',
      'Conduct fact-finding on education timeline and budget',
      'Handle objections around guarantees and protection',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: true,
  },
  // KT AXA (Krungthai-AXA Thailand)
  {
    _id: new Types.ObjectId('671eb0000000000000000001'),
    friendlyId: 'kt-axa-agent-recruitment',
    icon: '👥',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Recruitment of Prospective Agents',
    framework: SalesFramework.KT_AXA_RECRUITMENT_FRAMEWORK,
    description:
      'Recruit prospects by exploring their goals and challenges, then present the life insurance agent career as a solution, detailing the work and showcasing growth opportunities.',
    objectives: [
      'Build rapport with prospects',
      'Conduct fact-finding on income, lifestyle, and challenges faced in the job',
      'Present the career of an insurance agent as solution highlighting job details and growth opportunities to address their concerns',
      'Handle objections related to job security, income, flexibility & support from the supervisors/company',
      "Close the prospect by guiding them to register for the company's career opportunity seminar (BOP)",
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: false,
  },
  // KT AXA FNA & Product Pitch (Krungthai-AXA Thailand)
  {
    _id: new Types.ObjectId('671eb0000000000000000002'),
    friendlyId: 'kt-axa-fna-product-pitch',
    icon: '💰',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'FNA & Product Pitch',
    framework: SalesFramework.KT_AXA_FNA_FRAMEWORK,
    description:
      "Explore the client's financial needs and propose Life Ready CI 123 to address their coverage needs, including protection against critical illnesses.",
    objectives: [
      'Build rapport with prospects who reached out via Facebook',
      'Conduct fact-finding on income, lifestyle, financial situation, and insurance gaps',
      'Present Life Ready + CI 123 as a solution tailored to their specific needs',
      'Handle objections related to affordability, existing coverage, and insurance skepticism',
      'Guide the prospect towards understanding the value of critical illness coverage',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: true,
  },
  // KT AXA WealthPlus Close Call (Krungthai-AXA Thailand)
  {
    _id: new Types.ObjectId('671eb0000000000000000003'),
    friendlyId: 'kt-axa-wealthplus-close-call',
    icon: '💎',
    iconBgColor: '#E8F1FD',
    group: MODULE_GROUPS.CLOSING,
    title: 'WealthPlus Ready Follow Up Call',
    framework: SalesFramework.KT_AXA_WEALTHPLUS_FRAMEWORK,
    description:
      'Followup call to close WealthPlus Ready 90/8 upsell opportunities by addressing objections, demonstrating product knowledge, and guiding prospects to complete the application.',
    objectives: [
      'Build on rapport established in previous interactions',
      'Address lingering questions or concerns about WealthPlus Ready 90/8',
      'Demonstrate comprehensive product knowledge (features, benefits, returns, tax advantages)',
      'Handle common objections effectively (price, comparison, returns, value for money)',
      'Use appropriate compliance language and avoid prohibited terms',
      'Guide the prospect to complete the application or schedule the next step',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: true,
  },
  // Prudential Objection Handling
  {
    _id: new Types.ObjectId('671eb0000000000000000004'),
    friendlyId: 'prudential-objection-handling',
    icon: '🎯',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.CLOSING,
    title: 'Objection Handling',
    framework: SalesFramework.PRUDENTIAL_LAPR_OBJECTION_HANDLING,
    description:
      'Practice handling customer objections using the LAPR framework in a bank branch setting.',
    objectives: [
      'Approach a walk-in customer professionally and build initial rapport',
      'Apply the 3F model (Feel, Felt, Found) for empathy and connection',
      'Handle objections using the LAPR framework (Listen, Acknowledge, Probe, Reframe)',
      'Secure interest for a follow-up discussion about insurance',
    ],
    fields: {
      shown: [
        'name',
        'age',
        'location',
        'occupation',
        'education',
        'financialSituation',
        'keyPriorities',
        'productKnowledge',
        'mainObjection',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: true,
  },
  // Alibaba
  {
    _id: new Types.ObjectId('671ec0000000000000000001'),
    friendlyId: 'alibaba-telesales',
    icon: '☁️',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Telesales for Alibaba Cloud',
    description:
      "Explore the client's needs and advise Alibaba Cloud solutions to them",
    framework: SalesFramework.ALIBABA_TELESALES,
    objectives: [
      "Identify the client's current cloud infrastructure challenges and pain points",
      'Understand project requirements, budget constraints, and timeline expectations',
      'Present Alibaba Cloud solutions that address specific technical and business needs',
      'Address objections about pricing, competition, and capabilities with data-driven responses',
      'Secure commitment for next steps (technical consultation, POC, or service upgrade)',
    ],
    fields: {
      shown: [
        'name',
        'gender',
        'age',
        'occupation',
        'location',
        'keyPriorities',
        'persona',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [
        'education',
        'financialSituation',
        'demographics',
        'companyProfile',
        'projectContext',
        'annualBudget',
        'competitorLandscape',
        'productKnowledge',
      ],
    },
  },
  // {
  //   _id: new Types.ObjectId('671e80000000000000000002'),
  //   friendlyId: 'hsbc-client-revival',
  //   icon: '🔄',
  //   iconBgColor: '#E8F4F8',
  //   group: MODULE_GROUPS.RELATIONSHIP,
  //   title: 'Client Revival',
  //   framework: SalesFramework.HSBC_CLIENT_REVIVAL_ADVISORY_MODEL,
  //   description: 'Reconnect with inactive clients and spark re-engagement.',
  //   objectives: [
  //     'Re-establish the relationship and acknowledge recent inactivity or balance thresholds',
  //     'Identify key reasons for inactivity and barriers to re-engagement',
  //     'Explore current priorities and map a clear re-engagement path',
  //     'Encourage an immediate step and secure the next touchpoint',
  //   ],
  //   fields: { shown: [], hidden: [] },
  //   singleScenario: true,
  // },
  // {
  //   _id: new Types.ObjectId('671e80000000000000000003'),
  //   friendlyId: 'hsbc-goal-planning',
  //   icon: '🎯',
  //   iconBgColor: '#E8F4F8',
  //   group: MODULE_GROUPS.RELATIONSHIP,
  //   title: 'Goal Planning',
  //   framework: SalesFramework.HSBC_GOAL_PLANNING_ADVISORY_MODEL,
  //   description:
  //     'Define, size, and plan financial goals with tailored solutions and next steps.',
  //   objectives: [
  //     "Identify and clarify the client's key financial goals and priorities.",
  //     'Quantify timelines, amounts, and risk tolerance for each goal.',
  //     'Present tailored solutions that align with their objectives.',
  //     'Secure commitment to proceed with goal-based planning services.',
  //   ],
  //   fields: { shown: [], hidden: [] },
  //   singleScenario: true,
  // },
  // {
  //   _id: new Types.ObjectId('671e80000000000000000004'),
  //   friendlyId: 'hsbc-portfolio-review',
  //   icon: '📊',
  //   iconBgColor: '#E8F4F8',
  //   group: MODULE_GROUPS.RELATIONSHIP,
  //   title: 'Portfolio Review',
  //   framework: SalesFramework.HSBC_PORTFOLIO_REVIEW_ADVISORY_MODEL,
  //   description:
  //     'Review portfolio performance, discuss market impact, propose adjustments, and confirm next steps.',
  //   objectives: [
  //     'Open the call with a warm welcome and recap of recent life or financial updates.',
  //     'Introduce the reason for the portfolio review, linking it to market movements or personal milestones.',
  //     'Review current portfolio performance and identify key gaps or imbalances.',
  //     'Recommend tailored rebalancing or top-up solutions aligned to his goals and risk appetite.',
  //     'Confirm next steps, secure agreement to proceed, and schedule a follow-up review.',
  //   ],
  //   fields: { shown: [], hidden: [] },
  //   singleScenario: true,
  // },
  // AIA KO
  {
    _id: new Types.ObjectId('694b10000000000000000001'),
    friendlyId: 'aia-ko-opening-objection-call',
    icon: '📞',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Opening & Objection Call',
    framework: SalesFramework.AIA_KO_OPENING_OBJECTION_CALL,
    description:
      "The agent greets the customer, explains why they're calling, handles early pushback naturally, and moves into asking questions to keep the conversation going toward setting an appointment",
    objectives: [
      'Confirm whether the customer can talk after a brief summary of required disclosures/consents in an outbound call setting.',
      'Respond promptly and appropriately to early objections without hesitation.',
      'When the customer requests do-not-call, execute the guidance and call wrap-up procedure correctly (mandatory response).',
      'If proceeding, keep the call purpose short and transition naturally into needs exploration.',
      'Run the conversation so the customer can interrupt—speak in short sentences, ask a question, and pause.',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('694b10000000000000000002'),
    friendlyId: 'aia-ko-product-pitch',
    icon: '💼',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Product Pitch',
    framework: SalesFramework.AIA_KO_PRODUCT_PITCH,
    description:
      "This scenario evaluates the capability of the user to explain the value proposition by reinterpreting the product in the client's language so the client can clearly visualize the product's value. When the client raises objections, the user should follow the objection-handling process and continue the sales conversation.",
    objectives: [
      'After summarized disclosures/consent, confirm needs briefly and move quickly into the benefit pitch stage.',
      'Use an FAB method to explain (1) why advanced treatment matters (non-covered cost burden) (2) the plan structure smoothly.',
      'Handle benefit-stage objections by type (health confidence / family-dependent / no additional coverage / "send materials" / question-led interest).',
      'When asked to compare to existing policies, frame it as overlap vs. gaps, and explain without exaggeration.',
      'Convert decision-avoidance objections (think / discuss / later / documents) into a confirmed next step.',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('694b10000000000000000003'),
    friendlyId: 'aia-ko-end-to-end-outbound-call',
    icon: '🎯',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Outbound Call (End-to-End)',
    framework: SalesFramework.AIA_KO_END_TO_END_OUTBOUND_CALL,
    description:
      'Practice the full end-to-end outbound telesales consultation — from the mandatory opening disclosure script and early objection handling, through needs/health exploration (5 key areas), FAB-based pitch of the (무)원스톱 프리미엄 암보험(갱신형) Advanced Treatment Plan, multi-attempt objection handling, and confident closing.',
    objectives: [
      'Deliver the mandatory opening disclosure script (affiliation/name, TM consent source, night-call restriction, opt-out option, call recording consent) in correct order and confirm customer availability.',
      "Probe all 5 health and coverage areas (personal history, family history, friends' experience, existing insurance, medications) and link statistics/facts to the customer's personal situation to build urgency.",
      'Use FAB method to explain the (무)원스톱 프리미엄 암보험(갱신형) advanced treatment plan — features, competitive advantages, and personal value.',
      'Handle objections with empathy and varied persuasion techniques (YES-But, YES-And, FAB, Cushion, Ignore Skill) — minimum 5 attempts to overcome rejection.',
      'Recognize buying signals and close with confidence using direct, indirect, and choice closing techniques — agree on next step or proceed to application.',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  // Prudential PH
  {
    _id: new Types.ObjectId('694a10000000000000000001'),
    friendlyId: 'prudential-ph-appointment-setting',
    icon: '📞',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Appointment Setting',
    framework: SalesFramework.PRUDENTIAL_PH_APPOINTMENT_SETTING,
    description:
      'Touch base with a prospect, build rapport, and set an appointment to explore more on their financial goals and objectives.',
    objectives: [
      'Identify yourself and the carrier (Pru Life UK) and use the permission check protocol to gain prospect engagement to continue the conversation.',
      "Articulate specific, relevant benefits tied to the prospect's life stage with social proof and urgency.",
      'Handle common objections (not interested, no money, not the right time, obstinate objector) effectively.',
      'Secure commitment for a follow-up appointment.',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('694a10000000000000000002'),
    friendlyId: 'prudential-ph-fact-finding',
    icon: '🤝',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Product Pitch (in-person meeting)',
    framework: SalesFramework.PRUDENTIAL_PH_FACT_FINDING,
    description:
      'Meet a prospect face-to-face for a prescheduled appointment, build rapport through natural conversation, conduct fact-finding using SPIN methodology, and present the Pru Life UK solution.',
    objectives: [
      'Greet the prospect warmly and build rapport through natural small talk before transitioning to business.',
      'Use SPIN questions (Situation, Problem, Implication, Need-Payoff) to uncover prospect needs and priorities.',
      'Select the most appropriate Pru Life UK product based on prospect profile, needs, and budget.',
      'Present product features and advantages clearly and accurately.',
      "Connect product benefits to the prospect's specific situation and concerns.",
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: false,
    localizations: {
      tl: {
        title: 'Product Pitch (in-person meeting)',
        description:
          'Makipagkita sa prospect nang harapan para sa naka-schedule na appointment, bumuo ng rapport sa pamamagitan ng natural na pag-uusap, magsagawa ng fact-finding gamit ang SPIN methodology, at ipresenta ang Pru Life UK solution.',
        objectives: [
          'Batiin ang prospect nang mainit at bumuo ng rapport sa pamamagitan ng natural na small talk bago lumipat sa negosyo.',
          'Gumamit ng SPIN questions (Situation, Problem, Implication, Need-Payoff) upang matuklasan ang pangangailangan at prioridad ng prospect.',
          'Pumili ng pinaka-angkop na Pru Life UK product batay sa profile, pangangailangan, at budget ng prospect.',
          'Ipresenta ang features at advantages ng produkto nang malinaw at tumpak.',
          'Ikonekta ang benefits ng produkto sa partikular na sitwasyon at alalahanin ng prospect.',
        ],
      },
    },
  },
  {
    _id: new Types.ObjectId('694a10000000000000000003'),
    friendlyId: 'prudential-ph-closing-call',
    icon: '🤝',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.CLOSING,
    title: 'Close Call (in-person meeting)',
    framework: SalesFramework.PRUDENTIAL_PH_CLOSING_CALL,
    description:
      'Follow up from the product pitch to close the sale of the pitched product. Address objections, create urgency using investment horizon logic, and secure the deal.',
    objectives: [
      'Introduce yourself as a Life Insurance Agent and set context for the follow-up visit.',
      'Position product advantages against market alternatives.',
      'Handle common objections (price concerns, existing policy, no need, no money, no time).',
      'Create appropriate urgency without fear-mongering using investment horizon logic.',
      'Secure deal closure.',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: false,
    localizations: {
      tl: {
        title: 'Close Call (in-person meeting)',
        description:
          'Follow-up mula sa product pitch upang isara ang benta ng iniharap na produkto. Tugunan ang mga objection, lumikha ng urgency gamit ang investment horizon logic, at isara ang deal.',
        objectives: [
          'Ipakilala ang sarili bilang Life Insurance Agent at itakda ang konteksto para sa follow-up na pagbisita.',
          'Iposisyon ang mga kalamangan ng produkto laban sa mga alternatibo sa merkado.',
          'Harapin ang mga karaniwang objection (alalahanin sa presyo, kasalukuyang polisiya, walang pangangailangan, walang pera, walang oras).',
          'Lumikha ng angkop na urgency nang walang fear-mongering gamit ang investment horizon logic.',
          'Isara ang deal.',
        ],
      },
    },
  },
  // Great Eastern
  {
    _id: new Types.ObjectId('671e6000000000000000a001'),
    friendlyId: 'great-eastern-fact-find',
    icon: '🔍',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.PROSPECTING,
    framework: SalesFramework.GREAT_EASTERN_FACT_FIND,
    title: 'Fact Finding (Stage 1)',
    description:
      'To call a cold prospect and conduct a financial need analysis to collect all financial details (income, expenses, assets, debts), clarify personal goals, timeframes and risk comfort of the prospect.',
    objectives: [
      'Build rapport with the client',
      "Practice asking questions to identify the client's real needs",
      'Handle objections relating to trust in your expertise as a Financial representative, I dont like your company, I think Insurance is a scam',
      'Follow market conduct principles in providing suitable recommendations',
    ],
    fields: {
      shown: [],
      hidden: [],
    },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('671e6000000000000000a002'),
    friendlyId: 'great-eastern-product-pitch',
    icon: '📊',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.CLOSING,
    framework: SalesFramework.GREAT_EASTERN_PRODUCT_PITCH,
    title: 'Product Pitch (Stage 2)',
    description:
      '(Please attempt after completing Stage 1) Explore the clients financial needs and propose Great Wealth Advantage 4 to address their coverage needs.',
    objectives: [
      'Build rapport with the client',
      "Practice asking questions to identify the client's real needs",
      'Present the product clearly and completely',
      'Handle objection related to pricing, valuable coverage & comparative prices',
      'Follow market conduct principles in providing suitable recommendations',
    ],
    fields: {
      shown: [],
      hidden: [],
    },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('671e6000000000000000a003'),
    friendlyId: 'great-eastern-post-sales',
    icon: '🔄',
    iconBgColor: '#E8F4F8',
    group: MODULE_GROUPS.RETENTION,
    framework: SalesFramework.GREAT_EASTERN_POST_SALES,
    title: 'Post Sale Service (Stage 3)',
    description:
      '(Please attempt after completing Stage 1 & Stage 2) Client is concerned about the current market conditions, and decided to meet you to find out more about the performance of Great Wealth Advantage 4.',
    objectives: [
      'Build rapport with the client',
      "Practice asking questions to identify the client's real needs",
      'Present the product clearly and completely',
      'Handle objection related to pricing, valuable coverage & comparative prices',
      'Follow market conduct principles in providing suitable recommendations',
    ],
    fields: {
      shown: [],
      hidden: [],
    },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('671e6000000000000000b001'),
    friendlyId: 'scb-demo-discovery',
    icon: '🔍',
    iconBgColor: '#FFF4EB',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Discovery',
    description: "Probe the client's situation to uncover needs and facts.",
    framework: SalesFramework.SCB_ADVISORY_FRAMEWORK,
    objectives: [
      'Build rapport with the client and make client comfortable.',
      'Demonstrate interest in knowing client better, display professionalism and advisory competence.',
      'Identify financial needs and priorities, and manage objections and performance questions.',
      "Showcase Bank's capabilities and create interest in seeking solutions from the Bank.",
      'Explore opportunities for asset consolidation.',
    ],
    fields: { shown: [], hidden: [] },
    singleScenario: true,
  },
  {
    _id: new Types.ObjectId('6b0000000000000000000001'),
    friendlyId: 'lalamove-driver-registration-new',
    icon: '📋',
    iconBgColor: '',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Driver Registration (New Applicant)',
    description:
      'Call prospective drivers who signed up through ads but have not completed the application process.',
    framework: SalesFramework.LALAMOVE_DRIVER_RECRUITMENT,
    objectives: [
      'Build relationship with driver to get the insight.',
      "Practice asking questions to identify the driver's obstacles or needs",
      "Able to introduce new promotions for new drivers according to driver's background/needs",
      "Handle objections, confusions, or questions, find out driver's key blockers for registering as driver",
    ],
    scenarioSetup: `Call to new prospective drivers who signed up through ads but have not completed the application process and paid the deposit.

The user needs to introduce Lalamove and the advantages and benefits to the drivers.

The user should guide the driver through the first five steps of the application process:
1. Create (Fill in: Cities, Vehicle type)
2. Basic info (Fill in: Name, Referral code)
3. Personal info (Fill in: ID Number, DoB)
4. Vehicle info (Fill in: License plate number)
5. Training passed (Docs pending to upload: Portrait, Vehicle registration, ID card, Vehicle plate)

The user should handle objections from the drivers and if the driver rejects, the user should get insights and try to overcome the objections.

The success scenario is when the driver completes the initial steps and uploads the documents or confirms that they will complete the uploading of the documents.`,
    fields: {
      shown: [
        'location',
        'occupation',
        'workHistory',
        'financialSituation',
        'liquidityNeeds',
        'keyPriorities',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: false,
    localizations: {
      th: {
        title: 'ลงทะเบียนคนขับ (ผู้สมัครใหม่)',
        description:
          'โทรหาคนขับที่สนใจซึ่งสมัครผ่านโฆษณาแต่ยังไม่ได้ดำเนินการสมัครให้เสร็จสิ้น',
        objectives: [
          'สร้างความสัมพันธ์กับคนขับเพื่อรับข้อมูลเชิงลึก',
          'ฝึกถามคำถามเพื่อระบุอุปสรรคหรือความต้องการของคนขับ',
          'สามารถแนะนำโปรโมชั่นใหม่สำหรับคนขับใหม่ตามภูมิหลัง/ความต้องการ',
          'จัดการข้อโต้แย้ง ความสับสน หรือคำถาม ค้นหาอุปสรรคหลักของคนขับในการลงทะเบียน',
        ],
        scenarioSetup: `โทรหาคนขับใหม่ที่สนใจซึ่งสมัครผ่านโฆษณาแต่ยังไม่ได้ดำเนินการสมัครให้เสร็จสิ้นและชำระเงินมัดจำ

ผู้ใช้ต้องแนะนำ Lalamove และข้อดีและสิทธิประโยชน์ให้กับคนขับ

ผู้ใช้ควรแนะนำคนขับผ่าน 5 ขั้นตอนแรกของกระบวนการสมัคร:
1. สร้างบัญชี (กรอก: เมือง, ประเภทรถ)
2. ข้อมูลพื้นฐาน (กรอก: ชื่อ, รหัสแนะนำ)
3. ข้อมูลส่วนตัว (กรอก: เลขบัตรประชาชน, วันเกิด)
4. ข้อมูลรถ (กรอก: หมายเลขทะเบียนรถ)
5. ผ่านการอบรม (เอกสารรอการอัพโหลด: รูปถ่ายใบหน้า, ทะเบียนรถ, บัตรประชาชน, รูปป้ายทะเบียน)

สถานการณ์ที่ประสบความสำเร็จคือเมื่อคนขับดำเนินการตามขั้นตอนเริ่มต้นและอัพโหลดเอกสารหรือยืนยันว่าจะดำเนินการอัพโหลดเอกสารให้เสร็จสิ้น`,
      },
    },
  },
  {
    _id: new Types.ObjectId('6b0000000000000000000002'),
    friendlyId: 'lalamove-driver-registration-docs',
    icon: '📄',
    iconBgColor: '',
    group: MODULE_GROUPS.PROSPECTING,
    title: 'Driver Registration (Documents Uploaded)',
    description:
      'Call drivers who uploaded documents but have not completed the application process and paid the deposit.',
    framework: SalesFramework.LALAMOVE_DRIVER_RECRUITMENT,
    objectives: [
      'Build relationship with driver to get the insight.',
      "Practice asking questions to identify the driver's obstacles or needs",
      "Able to introduce new promotions for new drivers according to driver's background/needs",
      "Handle objections, confusions, or questions, find out driver's key blockers for registering as driver",
    ],
    scenarioSetup: `Call to drivers who signed up and completed the uploading of documents but have not completed the application process and paid the deposit.

The user needs to introduce Lalamove and the advantages and benefits to the drivers.

The user should guide the driver through the remaining steps:
1. Completed verification of the Uploading of Documents
2. Paying the deposit
3. Next Steps

The user should handle objections from the drivers and if the driver rejects, the user should get insights and try to overcome the objections.

The success scenario is when the driver completes all the steps and pays the deposit.`,
    fields: {
      shown: [
        'location',
        'occupation',
        'workHistory',
        'financialSituation',
        'liquidityNeeds',
        'keyPriorities',
        'communicationStyle',
        'decisionMaking',
      ],
      hidden: [],
    },
    singleScenario: false,
    localizations: {
      th: {
        title: 'ลงทะเบียนคนขับ (อัพโหลดเอกสารแล้ว)',
        description:
          'โทรหาคนขับที่อัพโหลดเอกสารแล้วแต่ยังไม่ได้ดำเนินการสมัครให้เสร็จสิ้นและชำระเงินมัดจำ',
        objectives: [
          'สร้างความสัมพันธ์กับคนขับเพื่อรับข้อมูลเชิงลึก',
          'ฝึกถามคำถามเพื่อระบุอุปสรรคหรือความต้องการของคนขับ',
          'สามารถแนะนำโปรโมชั่นใหม่สำหรับคนขับใหม่ตามภูมิหลัง/ความต้องการ',
          'จัดการข้อโต้แย้ง ความสับสน หรือคำถาม ค้นหาอุปสรรคหลักของคนขับในการลงทะเบียน',
        ],
        scenarioSetup: `โทรหาคนขับที่สมัครและอัพโหลดเอกสารเรียบร้อยแล้วแต่ยังไม่ได้ดำเนินการสมัครให้เสร็จสิ้นและชำระเงินมัดจำ

ผู้ใช้ต้องแนะนำ Lalamove และข้อดีและสิทธิประโยชน์ให้กับคนขับ

ผู้ใช้ควรแนะนำคนขับผ่านขั้นตอนที่เหลือ:
1. ตรวจสอบการอัพโหลดเอกสารเสร็จสิ้น
2. ชำระเงินมัดจำ
3. ขั้นตอนถัดไป

สถานการณ์ที่ประสบความสำเร็จคือเมื่อคนขับดำเนินการตามขั้นตอนทั้งหมดและชำระเงินมัดจำ`,
      },
    },
  },
];

export const HUPO_DEMO_SALES_MODULES: IModule[] = [
  'cold-call',
  'discovery',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const DEFAULT_SALES_MODULES: IModule[] = [
  'cold-call',
  'discovery',
  'competitive-proposal',
  'objection-handling',
  'closing',
  'review-renewal',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const PRUDENTIAL_SALES_MODULES: IModule[] = [
  'cold-call',
  'product-positioning',
  // 'prudential-objection-handling',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const PRUDENTIAL_TW_SALES_MODULES: IModule[] = [
  'cold-call',
  'product-positioning',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const PLT_SALES_MODULES: IModule[] = [
  'cold-call',
  'product-positioning',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const PRUDENTIAL_ID_SALES_MODULES: IModule[] = [
  'cold-call',
  'product-positioning',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const GRAB_SALES_MODULES: IModule[] = [
  'discovery-call-meddpicc',
  'deal-closure',
  'grab-mex',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const RESEARCH_SALES_MODULES: IModule[] = ['cold-call'].map(
  (module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!,
);

export const MSIG_SALES_MODULES: IModule[] = [
  'telesales',
  'product-positioning',
  'agency-sales',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const MANULIFE_SALES_MODULES: IModule[] = [
  'fna',
  'manulife-product-pitch',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const BBL_SALES_MODULES: IModule[] = [
  'bbl-client-upgrade',
  'bbl-client-revival',
  'bbl-portfolio-review',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const HSBC_SALES_MODULES: IModule[] = [
  'hsbc-client-onboarding',
  'hsbc-client-upgrade',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const HSBC_YUE_SALES_MODULES: IModule[] = ['hsbc-client-onboarding'].map(
  (module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!,
);

export const MTL_SALES_MODULES: IModule[] = [
  'mtl-agent-recruitment',
  'mtl-ul-plus-sales',
  'mtl-prospect-practice',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const AXA_PH_SALES_MODULES: IModule[] = [
  'axa-ph-unit-manager-recruitment',
  'axa-ph-financial-needs-analysis',
  'axa-ph-general-objection-handling',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const KT_AXA_SALES_MODULES: IModule[] = [
  'kt-axa-agent-recruitment',
  'kt-axa-fna-product-pitch',
  'kt-axa-wealthplus-close-call',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const AIA_KO_SALES_MODULES: IModule[] = [
  'aia-ko-opening-objection-call',
  'aia-ko-product-pitch',
  // 'aia-ko-end-to-end-outbound-call',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const ALIBABA_SALES_MODULES: IModule[] = ['alibaba-telesales'].map(
  (module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!,
);

export const PRUDENTIAL_PH_SALES_MODULES: IModule[] = [
  'prudential-ph-appointment-setting',
  'prudential-ph-fact-finding',
  'prudential-ph-closing-call',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const GREAT_EASTERN_SALES_MODULES: IModule[] = [
  'great-eastern-fact-find',
  'great-eastern-product-pitch',
  'great-eastern-post-sales',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export const SCB_DEMO_SALES_MODULES: IModule[] = ['scb-demo-discovery'].map(
  (module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!,
);

export const LALAMOVE_SALES_MODULES: IModule[] = [
  'lalamove-driver-registration-new',
  'lalamove-driver-registration-docs',
].map((module) => ALL_SALES_MODULES.find((m) => m.friendlyId === module)!);

export function createModuleWithLocalizations(
  baseModule: IModule,
  localizations: ModuleLocalizations,
): IModule {
  return {
    ...baseModule,
    localizations,
  };
}
