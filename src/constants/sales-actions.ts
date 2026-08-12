import { CallType } from '../models/SalesSession.js';

export interface SalesAction {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  patterns: string[];
  priority: number; // 1-5, where 1 is highest priority
  category: 'opening' | 'discovery' | 'presentation' | 'objection' | 'closing';
  products?: string[];
  aiContext?: string;
}

export interface CallTypeSalesActions {
  [CallType.COLD_CALL]: SalesAction[];
  [CallType.INITIAL_OUTREACH]: SalesAction[];
  [CallType.DISCOVERY]: SalesAction[];
  [CallType.COMPETITIVE_PROPOSAL]: SalesAction[];
  [CallType.OBJECTION_HANDLING]: SalesAction[];
  [CallType.PRODUCT_POSITIONING]: SalesAction[];
  [CallType.CLOSING]: SalesAction[];
  [CallType.REVIEW_RENEWAL]: SalesAction[];
  [CallType.GRAB_COLD_CALL]: SalesAction[];
  [CallType.MSIG_TELESALES]: SalesAction[];
  [CallType.MSIG_AGENCY_SALES]: SalesAction[];
  [CallType.MANULIFE_FNA]: SalesAction[];
  [CallType.GRAB_MEX]: SalesAction[];
  [CallType.PRUDENTIAL_OBJECTION_HANDLING]: SalesAction[];
  [CallType.BBL_CLIENT_UPGRADE]: SalesAction[];
  [CallType.BBL_CLIENT_REVIVAL]: SalesAction[];
  [CallType.BBL_GOAL_PLANNING]: SalesAction[];
  [CallType.BBL_PORTFOLIO_REVIEW]: SalesAction[];
  [CallType.GREAT_EASTERN_FACT_FIND]: SalesAction[];
  [CallType.GREAT_EASTERN_PRODUCT_PITCH]: SalesAction[];
  [CallType.GREAT_EASTERN_POST_SALES]: SalesAction[];
}

export const SALES_ACTIONS: CallTypeSalesActions = {
  [CallType.COLD_CALL]: [
    {
      id: 'professional_greeting',
      title: 'Professional Greeting',
      description: 'Introduce yourself and your company professionally',
      keywords: [
        'my name is',
        'I am',
        "I'm calling from",
        'this is',
        'good morning my name',
        'good afternoon my name',
        'hello my name',
        'hi my name',
      ],
      patterns: [
        'hi.*my name is.*from',
        'good (morning|afternoon).*this is.*from',
        "hello.*I'm.*with",
        'my name is.*I work (at|with|for)',
        '(hi|hello).*(my name is|this is|I am)',
      ],
      priority: 1,
      category: 'opening',
      aiContext: `This action requires a clear introduction of the speaker's name or company. A simple "Hello" is not enough.\nCORRECT Example: "Hi, this is Jane from Hupo."\nINCORRECT Example: "Hello there."`,
    },
    {
      id: 'ask_permission',
      title: 'Ask for Permission',
      description: "Ask if it's a good time to talk",
      keywords: [
        'is this a good time',
        'good time to talk',
        'do you have a moment',
        'can I have a moment',
        'can I take a moment',
        'may I have a moment',
        'quick moment',
        'is now a good time',
        'convenient time',
      ],
      patterns: [
        'is this a good time',
        'do you have a (few )?minutes?',
        'can I (have|take) a (quick )?moment',
        'may I have a moment',
        'is now a good time',
        'good time to (talk|speak|chat)',
        'convenient time',
      ],
      priority: 2,
      category: 'opening',
      aiContext: `This action is for asking if it's a good time to talk *now*. It is NOT for confirming who is on the line.\nCORRECT Example: "Hi Mark, do you have a couple of minutes to chat?"\nINCORRECT Example: "Hello, am I speaking with Mark?"`,
    },
    {
      id: 'value_proposition',
      title: 'Present Value Proposition',
      description: 'Explain the reason for calling and potential value',
      keywords: [
        'help you to',
        'help companies like yours',
        'we can help',
        'offer a solution',
        'provide a benefit',
        'opportunity to improve',
        'way to reduce',
        'help you save',
      ],
      patterns: [
        "I'm calling because",
        "the reason I'm calling",
        'I wanted to reach out because',
        'we help (companies|businesses|people) (like you )?to',
        "we've been able to help.*save",
        'I thought you might be interested',
      ],
      priority: 3,
      category: 'presentation',
      aiContext: `This action requires presenting a clear benefit or reason for the call. It's more than just stating what the company does.\nCORRECT Example: "The reason for my call is we help businesses like yours reduce their software costs by up to 30%."\nINCORRECT Example: "We are a company that sells software."`,
    },
    {
      id: 'discover_pain_points',
      title: 'Discover Pain Points',
      description: 'Ask questions to understand challenges and needs',
      keywords: [
        'biggest challenge',
        'main problem',
        'facing any issues',
        'struggling with',
        'how do you handle',
        'how do you manage',
        'what are your pain points',
        'tell me about your process',
      ],
      patterns: [
        'what (are|is) your (biggest|main) (challenge|concern|issue)',
        'how do you currently (handle|manage|deal with)',
        "what's your experience with",
        'tell me about your (current|existing)',
        'are you having any (issues|problems|challenges) with',
        'what (challenges|problems|issues) are you facing',
      ],
      priority: 4,
      category: 'discovery',
      aiContext: `This involves asking open-ended questions to understand the prospect's challenges. Simple closed questions are not enough.\nCORRECT Example: "What are the biggest challenges you're facing with your current system?"\nINCORRECT Example: "Do you have a system?"`,
    },
    {
      id: 'schedule_followup',
      title: 'Schedule Follow-up',
      description: 'Secure next steps or follow-up meeting',
      keywords: [
        'schedule',
        'meeting',
        'follow up',
        'next steps',
        'when would',
        'calendar',
      ],
      patterns: [
        'would you be available',
        'can we schedule',
        "let's set up a (time|meeting)",
        'when would be a good time',
        'shall we book',
        'next steps would be',
        "I'd like to follow up",
        'when are you available',
        'send.*calendar invite',
        'put something on the calendar',
      ],
      priority: 5,
      category: 'closing',
      aiContext: `This action is for scheduling a *future* meeting or call. It is NOT for asking for immediate availability to talk right now.\nINCORRECT Example: "Is this a good time to talk?"\nINCORRECT Example: "Are you available to talk now?"`,
    },
  ],

  [CallType.INITIAL_OUTREACH]: [
    {
      id: 'professional_greeting',
      title: 'Professional Greeting',
      description: 'Introduce yourself and your company professionally',
      keywords: [
        'my name is',
        'I am',
        "I'm calling from",
        'this is',
        'speaking with',
        'good morning my name',
        'good afternoon my name',
        'hello my name',
        'hi my name',
      ],
      patterns: [
        'hi.*my name is.*from',
        'good (morning|afternoon).*this is.*from',
        "hello.*I'm.*with",
        'my name is.*I work (at|with|for)',
        '(hi|hello).*(my name is|this is|I am)',
      ],
      priority: 1,
      category: 'opening',
      aiContext: `This action requires a clear introduction of the speaker's name or company. A simple "Hello" is not enough.\nCORRECT Example: "Hi, this is Jane from Hupo."\nINCORRECT Example: "Hello there."`,
    },
    {
      id: 'ask_permission',
      title: 'Ask for Permission',
      description: "Ask if it's a good time to talk",
      keywords: [
        'is this a good time',
        'good time to talk',
        'do you have a moment',
        'can I have a moment',
        'can I take a moment',
        'may I have a moment',
        'quick moment',
        'is now a good time',
        'convenient time',
      ],
      patterns: [
        'is this a good time',
        'do you have a (few )?minutes?',
        'can I (have|take) a (quick )?moment',
        'may I have a moment',
        'is now a good time',
        'good time to (talk|speak|chat)',
        'convenient time',
      ],
      priority: 2,
      category: 'opening',
      aiContext: `This action is for asking if it's a good time to talk *now*. It is NOT for confirming who is on the line, and it is NOT for scheduling a future call.\nCORRECT Example: "Hi Mark, do you have a couple of minutes to chat?"\nINCORRECT Example: "Hello, am I speaking with Mark?"\nINCORRECT Example: "When would be a good time to schedule a call?"`,
    },
    {
      id: 'establish_credibility',
      title: 'Establish Credibility',
      description: 'Build trust and credibility early in the conversation',
      keywords: [
        "we've helped clients like",
        'our clients have seen',
        'we have a proven track record',
        'our experience in',
        'we successfully implemented',
      ],
      patterns: [
        "we've helped (many|numerous) (companies|clients)",
        'our (track record|experience) shows',
        "we've successfully",
        'our clients (have seen|report)',
        'proven results',
      ],
      priority: 3,
      category: 'presentation',
      aiContext: `This action requires providing proof or evidence of past success. Vague claims are not sufficient.\nCORRECT Example: "We've helped companies like Acme Inc. increase their lead generation by 50%."\nINCORRECT Example: "We are very successful."`,
    },
    {
      id: 'generate_interest',
      title: 'Generate Interest',
      description: 'Create curiosity about your solution',
      keywords: [
        'might be interested to learn',
        'curious about how',
        'find this intriguing',
        'you might be surprised to find',
        'it might be worth exploring',
      ],
      patterns: [
        'you might be (interested|curious) to know',
        "what's interesting is",
        'you might be surprised',
        'worth exploring',
        "I think you'll find this intriguing",
      ],
      priority: 4,
      category: 'presentation',
      aiContext: `This action is about creating curiosity. It should be a hook that makes the prospect want to learn more.\nCORRECT Example: "I noticed you're in the logistics industry, and I have an idea that could significantly cut your delivery times."\nINCORRECT Example: "Are you interested in our product?"`,
    },
    {
      id: 'request_meeting',
      title: 'Request Meeting',
      description: 'Secure a longer conversation or meeting',
      keywords: [
        'schedule a meeting',
        'schedule a call',
        'can we discuss',
        'like to explore',
        'have a conversation',
        'can we chat',
      ],
      patterns: [
        'would you be open to a (brief )?meeting',
        'can we schedule a call',
        "I'd love to discuss",
        'worth exploring further',
        "let's have a conversation",
      ],
      priority: 5,
      category: 'closing',
      aiContext: `This is a direct ask for a meeting or a longer conversation, not just a vague 'let's talk later'.\nCORRECT Example: "Would you be open to a 15-minute call next week to explore this further?"\nINCORRECT Example: "We should connect sometime."`,
    },
  ],

  [CallType.DISCOVERY]: [
    {
      id: 'current_situation_analysis',
      title: 'Current Situation Analysis',
      description: "Understand the prospect's current state and processes",
      keywords: [
        'what are you currently using',
        'tell me about your current process',
        'how do you handle this today',
        'what does your existing setup look like',
      ],
      patterns: [
        'how do you currently (handle|manage|deal with)',
        "what's your current (process|situation|setup)",
        'tell me about your existing',
        'right now, how are you',
        'what does your current.*look like',
        'how are you (currently )?handling',
      ],
      priority: 1,
      category: 'discovery',
      aiContext: `Focuses on understanding the 'as-is' state. The question should prompt a description of their current process or tools.\nCORRECT Example: "Could you walk me through how your team handles new customer onboarding today?"\nINCORRECT Example: "What do you do?"`,
    },
    {
      id: 'identify_stakeholders',
      title: 'Identify Stakeholders',
      description: 'Understand who is involved in the decision-making process',
      keywords: [
        'who else is involved',
        'who is the decision maker',
        'who needs to approve',
        'who else on your team',
      ],
      patterns: [
        'who else (is|would be) involved',
        'who makes the (final )?decision',
        'who would need to approve',
        'what does your team look like',
        'are there other stakeholders',
      ],
      priority: 2,
      category: 'discovery',
      aiContext: `This action is about identifying other people involved in the decision. It's a specific question about the decision-making unit.\nCORRECT Example: "Besides yourself, who else on your team would be involved in evaluating a new solution?"\nINCORRECT Example: "Who do you work with?"`,
    },
    {
      id: 'budget_discussion',
      title: 'Budget Discussion',
      description: 'Understand budget parameters and constraints',
      keywords: [
        "what's your budget for this",
        'have you allocated a budget',
        'what are you looking to spend',
        'is there a budget for this',
      ],
      patterns: [
        "what's your budget",
        'have you allocated (any )?budget',
        'what are you looking to (spend|invest)',
        'is budget a concern',
        'from a budget perspective',
      ],
      priority: 3,
      category: 'discovery',
      aiContext: `Directly or indirectly asks about the financial aspect of the purchase. It should be a question related to budget, cost, or investment.\nCORRECT Example: "Have you allocated a budget for this type of initiative?"\nINCORRECT Example: "Is this expensive?"`,
    },
    {
      id: 'timeline_exploration',
      title: 'Timeline Exploration',
      description: 'Understand implementation timeline and urgency',
      keywords: [
        "what's your timeline for this",
        'when are you looking to implement',
        'how urgent is this for you',
        'do you have a deadline',
      ],
      patterns: [
        "what's your timeline",
        'when (are you|do you need to)',
        'how urgent is this',
        'when would you like to (start|begin|implement)',
        'do you have a deadline',
      ],
      priority: 4,
      category: 'discovery',
      aiContext: `This is about understanding the urgency and timing for a decision or implementation.\nCORRECT Example: "What's your ideal timeline for getting a solution in place?"\nINCORRECT Example: "When will this be done?"`,
    },
    {
      id: 'success_criteria',
      title: 'Define Success Criteria',
      description: 'Understand what success looks like for the prospect',
      keywords: [
        'what does success look like',
        'what are your main goals',
        'what do you hope to achieve',
        'how do you measure success',
      ],
      patterns: [
        'what would success look like',
        'what are your (main )?goals',
        'what do you hope to achieve',
        'how would you measure success',
        'what outcomes are you looking for',
      ],
      priority: 5,
      category: 'discovery',
      aiContext: `Asks the prospect to define what a successful outcome looks like for them. It's about their goals and metrics.\nCORRECT Example: "If we were to move forward, what would a successful outcome look like for you in six months?"\nINCORRECT Example: "Do you want to succeed?"`,
    },
  ],

  [CallType.COMPETITIVE_PROPOSAL]: [
    {
      id: 'acknowledge_competition',
      title: 'Acknowledge Competition',
      description: 'Professionally acknowledge other options being considered',
      keywords: [
        'considering other options',
        'evaluating competitors',
        'looking at alternatives',
        'comparing us with',
      ],
      patterns: [
        "I understand you're (also )?looking at",
        "I know you're evaluating (other )?options",
        "it makes sense that you're comparing",
        "I'm sure you're considering alternatives",
      ],
      priority: 1,
      category: 'opening',
      aiContext: `This involves gracefully acknowledging that the prospect is considering other options, without being defensive.\nCORRECT Example: "I understand you're evaluating a few different platforms, which makes perfect sense."\nINCORRECT Example: "Why are you looking at our competitors?"`,
    },
    {
      id: 'differentiate_solution',
      title: 'Differentiate Solution',
      description: 'Highlight unique value propositions and differentiators',
      keywords: [
        'what makes us different',
        'our unique advantage is',
        'unlike our competitors',
        'what sets us apart',
        'we exclusively offer',
      ],
      patterns: [
        'what makes us (different|unique)',
        'unlike (other|most) (solutions|companies)',
        'our advantage is',
        'what sets us apart',
        'exclusively offer',
      ],
      priority: 2,
      category: 'presentation',
      aiContext: `Highlights what makes your solution unique compared to others. It must be a specific differentiator.\nCORRECT Example: "Unlike other solutions, we offer a dedicated success manager for every account, regardless of size."\nINCORRECT Example: "We are better."`,
    },
    {
      id: 'address_concerns',
      title: 'Address Competitive Concerns',
      description: 'Directly address concerns about competitive offerings',
      keywords: [
        'address your concern',
        "I understand you're worried about",
        'let me clarify that',
        "that's a valid question",
      ],
      patterns: [
        'I understand your concern about',
        'let me address that',
        "that's a great question",
        'I can see why you might think',
        'let me clarify',
      ],
      priority: 3,
      category: 'objection',
      aiContext: `Directly addresses a specific worry or question the prospect has about your solution vs. a competitor's.\nCORRECT Example: "That's a valid point about our pricing. Let me clarify how our licensing works, as it's different from Competitor X."\nINCORRECT Example: "Don't worry about it."`,
    },
    {
      id: 'provide_proof_points',
      title: 'Provide Proof Points',
      description: 'Share case studies, testimonials, or evidence',
      keywords: [
        'let me share a case study',
        'for example, one of our clients',
        'here is a customer testimonial',
        'we have proven results',
      ],
      patterns: [
        'for example, we had a client',
        'let me share a case study',
        'one of our customers',
        "here's proof",
        'the results speak for themselves',
      ],
      priority: 4,
      category: 'presentation',
      aiContext: `This requires sharing concrete evidence like case studies, data, or customer stories to back up claims.\nCORRECT Example: "For example, a client in your industry, RetailCorp, saw a 20% reduction in cart abandonment after implementing our feature."\nINCORRECT Example: "Many clients have seen results."`,
    },
    {
      id: 'create_urgency',
      title: 'Create Urgency',
      description: 'Establish timeline pressure or limited availability',
      keywords: [
        'this is a limited time offer',
        'the deadline is approaching',
        'we need to move quickly',
        'this opportunity ends soon',
      ],
      patterns: [
        'this opportunity is limited',
        'we need to move quickly',
        'time is of the essence',
        'deadline is approaching',
        'limited availability',
      ],
      priority: 5,
      category: 'closing',
      aiContext: `This action provides a reason for the prospect to act now, such as a limited-time offer or an upcoming deadline.\nCORRECT Example: "This introductory pricing is only available until the end of the quarter."\nINCORRECT Example: "You should buy this now."`,
    },
  ],

  [CallType.OBJECTION_HANDLING]: [
    {
      id: 'acknowledge_objection',
      title: 'Acknowledge Objection',
      description: "Listen and acknowledge the prospect's concern",
      keywords: [
        'I understand your concern',
        'I hear what you are saying',
        'that makes sense',
        "that's a valid point",
      ],
      patterns: [
        'I (completely )?understand',
        "I hear what you're saying",
        'that makes (perfect )?sense',
        'I can see (why|how)',
        "that's a valid (point|concern)",
      ],
      priority: 1,
      category: 'objection',
      aiContext: `Starts by validating the prospect's concern. It's about showing you've heard them, before you respond.\nCORRECT Example: "I can certainly understand why you'd be concerned about the implementation time."\nINCORRECT Example: "But you're wrong."`,
    },
    {
      id: 'clarify_objection',
      title: 'Clarify the Objection',
      description: 'Ask questions to fully understand the concern',
      keywords: [
        'can you help me understand',
        'could you tell me more about',
        'what specifically concerns you',
        'could you elaborate on that',
      ],
      patterns: [
        'help me understand',
        'can you tell me more about',
        'what specifically (concerns|worries) you',
        'can you clarify',
        'could you elaborate',
      ],
      priority: 2,
      category: 'objection',
      aiContext: `Asks follow-up questions to dig deeper into the real reason behind the objection.\nCORRECT Example: "To make sure I understand, when you say it's too expensive, are you referring to the upfront cost or the total cost of ownership?"\nINCORRECT Example: "Why?"`,
    },
    {
      id: 'provide_evidence',
      title: 'Provide Counter-Evidence',
      description: 'Share facts, data, or examples to address the objection',
      keywords: [
        'in fact, our data shows',
        'research indicates that',
        'studies have proven',
        'let me provide some evidence',
      ],
      patterns: [
        'actually, (our )?data shows',
        'in fact,',
        'research indicates',
        'studies have proven',
        'the evidence suggests',
        'statistics show',
      ],
      priority: 3,
      category: 'objection',
      aiContext: `Uses facts, data, or third-party proof to counter a specific objection.\nCORRECT Example: "Actually, a recent Gartner study showed that solutions like ours have a 2-year ROI of over 200%."\nINCORRECT Example: "I don't think that's true."`,
    },
    {
      id: 'reframe_perspective',
      title: 'Reframe Perspective',
      description: 'Help prospect see the situation from a different angle',
      keywords: [
        'another way to look at it is',
        'from a different perspective',
        'have you considered',
        'what if we could',
      ],
      patterns: [
        'another way to (think about|look at) this',
        'from a different perspective',
        'consider this',
        'what if (I told you|we)',
        'let me ask you this',
      ],
      priority: 4,
      category: 'objection',
      aiContext: `Offers a new way of looking at the problem or solution to change the prospect's viewpoint.\nCORRECT Example: "I hear you on the upfront cost. Another way to look at it is as an investment that pays for itself in about 8 months through saved man-hours."\nINCORRECT Example: "Think about it differently."`,
    },
    {
      id: 'gain_commitment',
      title: 'Gain Commitment',
      description:
        'Secure agreement to move forward after addressing objection',
      keywords: [
        'if I could, would you',
        'does that address your concern',
        'are you comfortable moving forward',
        'can we proceed',
      ],
      patterns: [
        'if I could (show|prove|demonstrate)',
        'would you be (comfortable|willing|interested)',
        'does that (make sense|address your concern)',
        'are you comfortable with',
        'can we move forward',
      ],
      priority: 5,
      category: 'closing',
      aiContext: `After handling an objection, this action seeks to confirm the objection is resolved and get agreement to move to the next step.\nCORRECT Example: "Does that address your concern about the integration? If so, are you ready to discuss next steps?"\nINCORRECT Example: "So, are we good now?"`,
    },
  ],

  [CallType.PRODUCT_POSITIONING]: [
    {
      id: 'recap_and_agenda',
      title: 'Recap and Set Agenda',
      description:
        'Briefly recap the last conversation and set a clear agenda for the current meeting.',
      keywords: [
        'to recap our last conversation',
        "for today's agenda",
        'when we last spoke',
        'the plan for today is',
      ],
      patterns: [
        'to recap our last conversation',
        'when we last spoke',
        'the agenda for today',
        'plan for this call is to',
      ],
      priority: 1,
      category: 'opening',
      aiContext: `This action involves summarizing previous conversations and setting a clear plan for the current one.\nCORRECT Example: "Last time we spoke, we discussed your need for better reporting. Today, I'd like to show you how our dashboard can help with that."\nINCORRECT Example: "So, what's up?"`,
    },
    {
      id: 'confirm_understanding',
      title: 'Confirm Understanding of Needs',
      description:
        "Confirm the understanding of the client's needs before diving into the product details.",
      keywords: [
        'my understanding is that',
        'if I recall correctly',
        'so your main goal is',
        'you mentioned that, is that right',
      ],
      patterns: [
        'my understanding is that',
        "if I recall correctly, you're looking for",
        'you mentioned that (you|your)',
        'you said that (you|your)',
        'does that sound right',
        'if I understand correctly',
        'so what I hear is',
        'you mentioned (wanting|needing|looking for)',
      ],
      priority: 2,
      category: 'opening',
      aiContext: `This is about playing back your understanding of the prospect's needs to ensure alignment before presenting.\nCORRECT Example: "If I recall correctly, your main priority is to reduce manual data entry. Is that still the case?"\nINCORRECT Example: "I know what you need."`,
    },
    {
      id: 'understand_requirements',
      title: 'Understand Requirements',
      description: 'Gather specific needs and requirements',
      keywords: [
        'what are your requirements',
        "what's most important to you",
        'what are you looking for in a solution',
        'what are your must-haves',
      ],
      patterns: [
        'what do you need',
        'what are you looking for',
        "what's (most )?important to you",
        'what are your requirements',
        'what would you consider a must-have',
      ],
      priority: 3,
      category: 'discovery',
      aiContext: `This action is for gathering detailed needs. It's about asking what is important or necessary for the prospect in a solution.\nCORRECT Example: "What are the must-have features for your team in a new system?"\nINCORRECT Example: "Do you need features?"`,
    },
    {
      id: 'present_features',
      title: 'Present Relevant Features',
      description: 'Demonstrate features that match identified needs',
      keywords: [
        'this feature allows you to',
        'with this capability',
        'the functionality of',
        'our solution provides',
      ],
      patterns: [
        'this feature (allows|enables) you to',
        'our (product|solution) provides',
        'you can (also )?use this to',
        'this functionality',
        'what this means for you',
      ],
      priority: 5,
      category: 'presentation',
      aiContext: `This action describes a capability of the product. It's about what the product *does*.\nCORRECT Example: "Our system has a drag-and-drop workflow builder."\nINCORRECT Example: "Our system is great."`,
    },
    {
      id: 'translate_to_benefits',
      title: 'Translate to Benefits',
      description: 'Explain how features translate to business benefits',
      keywords: [
        'the benefit to you is',
        'which means you can',
        'the result is that',
        'the impact on your business is',
      ],
      patterns: [
        'which means (you can|that)',
        'the benefit (for you )?is',
        'this (results in|leads to)',
        'the impact (on your business )?is',
        'what this means for your (business|team)',
      ],
      priority: 6,
      category: 'presentation',
      aiContext: `This action connects a feature to a business outcome. It explains what the feature *means* for the prospect.\nCORRECT Example: "...which means you can create new onboarding workflows in minutes without needing an engineer."\nINCORRECT Example: "It's a very beneficial feature."`,
    },
    {
      id: 'handle_technical_questions',
      title: 'Handle Technical Questions',
      description: 'Address technical or detailed product questions',
      keywords: [
        'let me answer your technical question',
        'in terms of integration',
        'regarding security',
        'what are the specifications',
      ],
      patterns: [
        'how does (it|this) work',
        'how does (the|our) (system|product|solution) work',
        'from a technical perspective',
        'in terms of integration',
        'regarding (security|compatibility)',
        'what are the (technical )?specifications',
        'technical (details|requirements|questions)',
        'how is (it|this) implemented',
      ],
      priority: 9,
      category: 'presentation',
      aiContext: `This action is for addressing specific technical questions about how the product works, integrations, security, etc.\nCORRECT Example: "To answer your question about security, we are SOC 2 Type II compliant and all data is encrypted at rest and in transit."\nINCORRECT Example: "It's secure."`,
    },
    {
      id: 'summarize_value',
      title: 'Summarize Value',
      description: 'Recap key benefits and value proposition',
      keywords: [
        'to summarize the key benefits',
        'let me recap the value',
        'the bottom line is',
        'in conclusion, we can help you',
      ],
      patterns: [
        'to summarize',
        'let me recap',
        'the key benefits are',
        'the bottom line is',
        'in conclusion',
        'what this all means',
      ],
      priority: 10,
      category: 'presentation',
      aiContext: `This action recaps the key benefits and value discussed during the conversation.\nCORRECT Example: "So, to summarize, we can help you reduce data entry, improve reporting accuracy, and save your team about 10 hours a week."\nINCORRECT Example: "So, that's everything."`,
    },
    {
      id: 'pli_explain_headline',
      title: 'Explain PLI Headline',
      description:
        'Explain that PruLifetime Income is an insurance solution providing a regular stream of monthly income for life.',
      keywords: [
        'monthly income for life',
        'insurance solution for income',
        'lifelong stream of income',
      ],
      patterns: [
        'provides.*monthly.*income.*for life',
        'insurance.*solution.*regular.*stream of income',
        'lifetime.*monthly income',
      ],
      priority: 4,
      category: 'presentation',
      products: ['prulifetime-income-plus'],
      aiContext:
        "This is specific to PruLifetime Income. It requires explaining the core concept of a regular, lifelong monthly income stream.\nCORRECT Example: 'PruLifetime Income is an insurance solution designed to provide you with a steady stream of monthly income for the rest of your life.'",
    },
    {
      id: 'pli_explain_usp',
      title: 'Explain PLI Unique Selling Points',
      description:
        'Explain the unique selling points like monthly cash benefit from 49th month, disability waiver, and retrenchment benefit.',
      keywords: [
        'monthly cash benefit from 49th month',
        'waiver of premium on disability',
        'retrenchment benefit covers',
      ],
      patterns: [
        'cash benefit.*49th month',
        'disability waiver',
        'retrenchment benefit',
      ],
      priority: 7,
      category: 'presentation',
      products: ['prulifetime-income-plus'],
      aiContext:
        "This is specific to PruLifetime Income. It requires mentioning one of the unique selling points like the 49th-month cash benefit, disability waiver, or retrenchment benefit.\nCORRECT Example: 'One of the unique features is a disability waiver, which means your premiums are waived if you become disabled.'",
    },
    {
      id: 'pli_explain_risks',
      title: 'Explain PLI Risks and Limitations',
      description:
        'Explain the risks and limitations, such as implications of early surrender, pre-existing conditions, and fees.',
      keywords: [
        'early surrender penalty',
        'pre-existing condition limitations',
        'fees and charges apply',
        '14-day freelook period',
      ],
      patterns: [
        'implication of early surrender',
        'pre-existing conditions',
        'fees and charges',
        'freelook period',
      ],
      priority: 8,
      category: 'presentation',
      products: ['prulifetime-income-plus'],
      aiContext:
        "This is specific to PruLifetime Income. It requires explaining the potential downsides, such as surrender penalties or limitations on pre-existing conditions.\nCORRECT Example: 'It's important to know that if you surrender the policy early, there are fees and you may get back less than you put in.'",
    },
  ],

  [CallType.CLOSING]: [
    {
      id: 'confirm_fit',
      title: 'Confirm Product Fit',
      description: "Ensure solution meets prospect's needs",
      keywords: [
        'does this sound like a good fit',
        'does this meet your needs',
        'is this the right solution for you',
        'does this address your challenges',
      ],
      patterns: [
        'does this (sound like|seem like) a good fit',
        'does this meet your needs',
        'is this the (right )?solution',
        'does this address your (concerns|needs)',
        'are you comfortable with',
      ],
      priority: 1,
      category: 'closing',
      aiContext: `This action seeks explicit confirmation from the prospect that the solution is a good match for their needs.\nCORRECT Example: "Based on what we've discussed, does this seem like it would be a good fit for your team?"\nINCORRECT Example: "So you like it?"`,
    },
    {
      id: 'handle_final_objections',
      title: 'Handle Final Objections',
      description: 'Address any remaining concerns before closing',
      keywords: [
        'do you have any final questions',
        'are there any other concerns',
        'any hesitations before we proceed',
        'is there anything else I can clarify',
      ],
      patterns: [
        'do you have any (questions|concerns)',
        'is there anything else',
        'any final (questions|concerns)',
        'what (other )?questions do you have',
        'are there any hesitations',
      ],
      priority: 2,
      category: 'objection',
      aiContext: `This action is for proactively asking for and addressing any last-minute concerns before asking for the sale.\nCORRECT Example: "Before we move forward, are there any other questions or hesitations you have?"\nINCORRECT Example: "Anything else?"`,
    },
    {
      id: 'present_options',
      title: 'Present Options',
      description: 'Offer different package or pricing options',
      keywords: [
        'we have a few options',
        'let me show you the packages',
        'we offer different plans',
        'you can choose between',
      ],
      patterns: [
        'we have (several|different) options',
        'there are (a few|multiple) packages',
        'you can choose from',
        'we offer (different )?levels',
        'your options are',
      ],
      priority: 3,
      category: 'presentation',
      aiContext: `This involves showing the prospect different choices, typically for pricing, packages, or implementation levels.\nCORRECT Example: "We have two packages you can choose from: the Standard plan and the Enterprise plan."\nINCORRECT Example: "We have options."`,
    },
    {
      id: 'create_decision_urgency',
      title: 'Create Decision Urgency',
      description: 'Encourage timely decision making',
      keywords: [
        'what does your decision process look like',
        'when would you be looking to make a decision',
        'what are the next steps on your end',
      ],
      patterns: [
        'when (would|could) you make a decision',
        'what does your decision process look like',
        'to move forward',
        'the next steps (would )?be',
        'when can we start',
      ],
      priority: 4,
      category: 'closing',
      aiContext: `This action prompts the prospect to make a decision by asking about their process or timeline.\nCORRECT Example: "What does your decision-making process look like from here?"\nINCORRECT Example: "Are you going to decide soon?"`,
    },
    {
      id: 'secure_commitment',
      title: 'Secure Commitment',
      description: 'Get explicit agreement to proceed',
      keywords: [
        'are you ready to move forward',
        'shall we go ahead with the paperwork',
        'would you like to proceed',
        'are you ready to start',
      ],
      patterns: [
        'are you ready to (proceed|move forward)',
        'shall we go ahead',
        'can we (start|begin)',
        'are you prepared to',
        'would you like to proceed',
      ],
      priority: 5,
      category: 'closing',
      aiContext: `This is the direct ask for the sale or for a clear commitment to move forward.\nCORRECT Example: "Are you ready to move forward with the Enterprise plan?"\nINCORRECT Example: "So, do we have a deal?"`,
    },
  ],

  [CallType.REVIEW_RENEWAL]: [
    {
      id: 'review_performance',
      title: 'Review Performance',
      description: 'Discuss how the solution has performed',
      keywords: [
        'how has the performance been',
        'are you satisfied with the results',
        'what has your experience been like',
        'do you have any feedback for us',
      ],
      patterns: [
        'how has (it|this) been working',
        "what's your experience been",
        'are you satisfied with',
        'how are the results',
        "what's your feedback",
      ],
      priority: 1,
      category: 'discovery',
      aiContext: `This action involves asking the customer for feedback on their experience with the product or service.\nCORRECT Example: "Now that you've been using the platform for a year, how has your experience been?"\nINCORRECT Example: "Is it working?"`,
    },
    {
      id: 'identify_new_needs',
      title: 'Identify New Needs',
      description: 'Discover any new requirements or changes',
      keywords: [
        'have your needs changed',
        'are there any new requirements',
        'has anything evolved on your end',
        'any additional needs',
      ],
      patterns: [
        'have your needs changed',
        'any new requirements',
        "what's (different|changed)",
        'additional (needs|features)',
        'how have things evolved',
      ],
      priority: 2,
      category: 'discovery',
      aiContext: `This action aims to discover if the customer's situation or needs have changed since they first purchased.\nCORRECT Example: "Has anything changed in your business priorities since we last spoke that we should be aware of?"\nINCORRECT Example: "Do you need anything new?"`,
    },
    {
      id: 'discuss_expansion',
      title: 'Discuss Expansion',
      description: 'Explore opportunities for additional products or services',
      keywords: [
        'opportunity to expand',
        'are you interested in additional services',
        'we have upgrade options',
        'we can add on',
      ],
      patterns: [
        'opportunities to expand',
        'additional (products|services)',
        'would you be interested in more',
        'other (areas|departments)',
        'upgrade options',
      ],
      priority: 3,
      category: 'presentation',
      aiContext: `This action explores opportunities to sell more products or services, or to expand usage within the customer's company.\nCORRECT Example: "We've launched a new analytics module that I think could be really valuable for your marketing team. Would you be open to exploring that?"\nINCORRECT Example: "Do you want to buy more stuff?"`,
    },
    {
      id: 'address_concerns',
      title: 'Address Any Concerns',
      description: 'Handle any issues or dissatisfaction',
      keywords: [
        'have you had any issues',
        'are there any problems we can address',
        'how can we improve',
        'what could be better',
      ],
      patterns: [
        'any (issues|problems|concerns)',
        'how can we improve',
        'what could be better',
        'areas for improvement',
        'anything we should fix',
      ],
      priority: 4,
      category: 'objection',
      aiContext: `This action is for proactively asking about and addressing any problems or dissatisfaction the customer has experienced.\nCORRECT Example: "Is there anything about the service that hasn't met your expectations or that we could be doing better?"\nINCORRECT Example: "Any problems?"`,
    },
    {
      id: 'secure_renewal',
      title: 'Secure Renewal',
      description: 'Get commitment for contract renewal',
      keywords: [
        'are you ready to renew',
        'shall we continue for another year',
        'would you like to extend your contract',
      ],
      patterns: [
        'ready to renew',
        'continue (with|for another)',
        'extend (the|your) contract',
        'for next year',
        'renew (the|your) agreement',
      ],
      priority: 5,
      category: 'closing',
      aiContext: `This is the direct ask for the customer to renew their contract or agreement.\nCORRECT Example: "With your renewal coming up next month, are you ready to proceed with another year?"\nINCORRECT Example: "So you'll renew?"`,
    },
  ],

  [CallType.GRAB_COLD_CALL]: [],

  [CallType.MSIG_TELESALES]: [],
  [CallType.MSIG_AGENCY_SALES]: [],

  [CallType.MANULIFE_FNA]: [],

  [CallType.GRAB_MEX]: [],

  [CallType.PRUDENTIAL_OBJECTION_HANDLING]: [],
  [CallType.BBL_CLIENT_UPGRADE]: [],
  [CallType.BBL_CLIENT_REVIVAL]: [],
  [CallType.BBL_GOAL_PLANNING]: [],
  [CallType.BBL_PORTFOLIO_REVIEW]: [],
  [CallType.GREAT_EASTERN_FACT_FIND]: [],
  [CallType.GREAT_EASTERN_PRODUCT_PITCH]: [],
  [CallType.GREAT_EASTERN_POST_SALES]: [],
};

export const getSalesActions = (
  callType: CallType,
  productId?: string,
): SalesAction[] => {
  const allActionsForCallType = SALES_ACTIONS[callType] || [];

  if (!productId) {
    // Return only generic actions if no product is specified
    return allActionsForCallType.filter(
      (action) => !action.products || action.products.length === 0,
    );
  }

  // Filter actions for the specific product + generic actions
  return allActionsForCallType.filter((action) => {
    // Include generic actions
    if (!action.products || action.products.length === 0) {
      return true;
    }
    // Include product-specific actions
    return action.products.includes(productId);
  });
};

export const getSalesActionById = (
  callType: CallType,
  actionId: string,
  productId?: string,
): SalesAction | undefined => {
  return getSalesActions(callType, productId)?.find(
    (action) => action.id === actionId,
  );
};
