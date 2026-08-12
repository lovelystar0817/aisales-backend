import { LegacySalesProduct, ProductType } from '../models/SalesProduct.js';

/**
 * Grab For Business company specific products - focused on corporate services
 */
export const GRAB_SALES_PRODUCTS: LegacySalesProduct[] = [
  {
    _id: '671f60000000000000000000',
    friendlyId: 'grab-for-business',
    name: 'Grab For Business',
    knowledgePrompt: `
## PRODUCT INFORMATION: Grab For Business

Grab For Business is Southeast Asia's leading B2B SaaS platform integrated with Grab's core services to improve corporate productivity and engagement. Our unified portal provides:

**Core Services:**
- **Transport**: Safe, reliable corporate rides with comprehensive safety features
- **Food**: Quick meal delivery for employees and clients
- **Delivery**: Secure corporate package delivery on demand  
- **Mart**: Daily essentials delivered to employees

**Key Value Propositions:**
- **Cost Efficiency**: Reduce costs through automated expense management
- **Governance & Control**: Advanced company policies and spending limits
- **Transparency**: Real-time reporting and detailed expense tracking
- **Automation**: SFTP integration with HR systems for seamless employee management
- **Security**: Enhanced safety protocols and data protection

**Portal Features:**
- Employee roster management and access controls
- Policy assignment and spending limit enforcement
- Multiple payment options (corporate billing, credit cards)
- Real-time transaction monitoring and reporting
- Cost code categorization for expense tracking
- 24/7 client support and dedicated service teams

Focus on understanding their current corporate services pain points, operational inefficiencies, and how Grab For Business can streamline their processes while providing transparency and control.`,
    productType: ProductType.OWN,
    modules: [
      'discovery-call-meddpicc',
      'deal-closure',
      'competitive-proposal',
      'objection-handling',
    ],
    keyFeatures: [
      'Unified B2B portal integrating transport, food, delivery, and mart services under one platform',
      'Advanced policy management with spend limits based on amount, location, and time controls',
      'Real-time expense tracking and automated reporting with detailed analytics',
      'SFTP integration with HR systems for seamless employee roster management',
      'Multi-tiered spending controls with customizable employee group assignments',
      'Corporate billing and direct company charging with multiple payment options',
      'Automated expense policy enforcement without requiring manager approvals',
      'Real-time transaction monitoring with detailed cost code categorization',
      '80% increase in customer base in 2024 across various target industries',
      'Saves over 11,500 employee working hours annually through automated processes',
    ],
    featureHighlight: {
      title:
        'Complete Corporate Expense Control with 11,500+ Hours Saved Annually',
      description:
        'Grab For Business delivers a unified platform that automates corporate expense management while providing complete policy control. Companies save over 11,500 employee working hours per year through automated claims processing, real-time spend monitoring, and intelligent policy enforcement across transport, food, and delivery services.',
    },
    evaluationFocus: [
      '**ROI and Time Savings**: Understanding of 11,500+ hours saved annually and quantifiable efficiency gains',
      '**Policy Management**: Knowledge of spend limits, location controls, and time-based restrictions',
      '**Corporate Integration**: Understanding of SFTP integration capabilities and HR system automation',
      '**Cost Control**: Ability to explain automated expense management and real-time monitoring',
      '**Multi-Service Platform**: Knowledge of integrated transport, food, delivery, and mart services',
      '**Business Growth**: Awareness of 80% customer base increase and market expansion',
      '**Governance Features**: Understanding of employee group management and policy assignment',
      '**Pain Point Identification**: Ability to identify corporate expense management challenges',
      '**Competitive Advantages**: Knowledge of unique B2B features vs consumer ride-hailing',
      '**Implementation Process**: Understanding of setup, employee onboarding, and portal management',
      '**Reporting Capabilities**: Knowledge of real-time analytics and expense tracking features',
      '**Target Industries**: Understanding of various corporate sectors and their specific needs',
    ],
    salesTarget: 'corporate',
  },
  //   {
  //     _id: new Date().getTime().toString(), // Mock ObjectId
  //     friendlyId: 'grab-transport-solutions',
  //     name: 'Grab Transport Solutions',
  //     knowledgePrompt: `
  // ## PRODUCT INFORMATION: Grab Transport Solutions

  // **GrabCar Services:**
  // - **Economy**: Shared rides and affordable options (GrabShare, GrabCar Saver)
  // - **Standard**: Dedicated cars for business trips (sedans, MPVs, vans)
  // - **Premium**: Special business trips with luxury fleets (Camry, Accord, Mercedes, BMW)

  // **GrabBike Services:**
  // - **GrabBike+**: Premium motorcycles with shorter wait times
  // - **GrabBike**: Standard motorcycles for quick city navigation
  // - **GrabBike Saver**: Economy motorcycles for cost-conscious trips

  // **Safety & Security Features:**
  // - Comprehensive driver background checks and training
  // - Passenger and driver selfie verification
  // - GrabChat & number masking for privacy
  // - Real-time GPS tracking and SOS emergency button
  // - AudioProtect encrypted recording during rides
  // - Commercial insurance and 3rd party coverage
  // - Telematics reporting on driver behavior

  // **COVID-19 Safety (GrabProtect):**
  // - Driver health declarations
  // - Sanitized equipment after every ride
  // - Contactless service implementation
  // - Cashless payment options
  // Focus on their corporate transport needs, safety requirements, and cost optimization goals.`,
  //     productType: ProductType.OWN,
  //     modules: ['product-positioning', 'competitive-proposal'],
  //     keyFeatures: [
  //       'Comprehensive service tiers: Economy (GrabCar Saver), Standard, and Premium luxury options',
  //       'Advanced safety features including AudioProtect AI-powered audio recording',
  //       'Driver selfie verification with random identity checks throughout shifts',
  //       'Real-time GPS tracking with SOS emergency button and trip monitoring',
  //       'Commercial insurance coverage with 3rd party protection',
  //       '99.9% of rides occur without safety incidents (4x safer than traditional transport)',
  //       'GrabChat with number masking for enhanced passenger privacy',
  //       'Contactless payment options and cashless service implementation',
  //       'Telematics reporting for driver behavior monitoring and fleet management',
  //       'COVID-19 safety protocols with sanitized equipment and health declarations',
  //     ],
  //     featureHighlight: {
  //       title: '99.9% Safety Record with AI-Powered AudioProtect Technology',
  //       description:
  //         'Grab Transport Solutions delivers industry-leading safety with 99.9% incident-free rides and 4x better safety than traditional transport. Features advanced AudioProtect AI technology, real-time GPS tracking, driver verification, and comprehensive insurance coverage for complete corporate transport security.',
  //     },
  //     evaluationFocus: [
  //       '**Safety Statistics**: Understanding of 99.9% incident-free rides and 4x safety improvement',
  //       '**AudioProtect Technology**: Knowledge of AI-powered audio recording and real-time risk detection',
  //       '**Driver Verification**: Understanding of selfie verification and background check processes',
  //       '**Service Tiers**: Knowledge of Economy, Standard, and Premium options for different corporate needs',
  //       '**Emergency Features**: Understanding of SOS button, GPS tracking, and emergency response',
  //       '**Insurance Coverage**: Knowledge of commercial insurance and 3rd party protection',
  //       '**Privacy Features**: Understanding of GrabChat, number masking, and data protection',
  //       '**Corporate Benefits**: Ability to explain cost optimization and fleet management advantages',
  //       '**COVID-19 Protocols**: Knowledge of health safety measures and contactless services',
  //       '**Technology Integration**: Understanding of telematics, real-time monitoring, and reporting',
  //       '**Competitive Safety**: Ability to compare safety features with traditional transport options',
  //       '**Risk Mitigation**: Understanding of how features address corporate transport security concerns',
  //     ],
  //   },
  // Focus on their corporate transport needs, safety requirements, and cost optimization goals.`,
  //   productType: ProductType.OWN,
  //   modules: ['product-positioning', 'competitive-proposal'],
  //   keyFeatures: [
  //     'Comprehensive service tiers: Economy (GrabCar Saver), Standard, and Premium luxury options',
  //     'Advanced safety features including AudioProtect AI-powered audio recording',
  //     'Driver selfie verification with random identity checks throughout shifts',
  //     'Real-time GPS tracking with SOS emergency button and trip monitoring',
  //     'Commercial insurance coverage with 3rd party protection',
  //     '99.9% of rides occur without safety incidents (4x safer than traditional transport)',
  //     'GrabChat with number masking for enhanced passenger privacy',
  //     'Contactless payment options and cashless service implementation',
  //     'Telematics reporting for driver behavior monitoring and fleet management',
  //     'COVID-19 safety protocols with sanitized equipment and health declarations',
  //   ],
  //   featureHighlight: {
  //     title: '99.9% Safety Record with AI-Powered AudioProtect Technology',
  //     description:
  //       'Grab Transport Solutions delivers industry-leading safety with 99.9% incident-free rides and 4x better safety than traditional transport. Features advanced AudioProtect AI technology, real-time GPS tracking, driver verification, and comprehensive insurance coverage for complete corporate transport security.',
  //   },
  //   evaluationFocus: [
  //     '**Safety Statistics**: Understanding of 99.9% incident-free rides and 4x safety improvement',
  //     '**AudioProtect Technology**: Knowledge of AI-powered audio recording and real-time risk detection',
  //     '**Driver Verification**: Understanding of selfie verification and background check processes',
  //     '**Service Tiers**: Knowledge of Economy, Standard, and Premium options for different corporate needs',
  //     '**Emergency Features**: Understanding of SOS button, GPS tracking, and emergency response',
  //     '**Insurance Coverage**: Knowledge of commercial insurance and 3rd party protection',
  //     '**Privacy Features**: Understanding of GrabChat, number masking, and data protection',
  //     '**Corporate Benefits**: Ability to explain cost optimization and fleet management advantages',
  //     '**COVID-19 Protocols**: Knowledge of health safety measures and contactless services',
  //     '**Technology Integration**: Understanding of telematics, real-time monitoring, and reporting',
  //     '**Competitive Safety**: Ability to compare safety features with traditional transport options',
  //     '**Risk Mitigation**: Understanding of how features address corporate transport security concerns',
  //   ],
  // },
  {
    _id: '671f60000000000000000001',
    friendlyId: 'grab-mex-campaigns',
    name: 'MEX',
    knowledgePrompt: `
## PRODUCT INFORMATION: MEX

MEX (Merchant Excellence) is a comprehensive program for Account Managers to help merchants grow through strategic campaign participation. This is a consultative selling approach focused on driving revenue growth and brand awareness.

**PROVEN PERFORMANCE METRICS:**
- **8.5% Outperformance**: MEX merchants outperform non-participating merchants by 8.5%
- **Over 1500 Stores**: Food & Mart stores have participated in campaign programs
- **1.1 Million Eaters**: Engaged through Mega Sale banner clicks in Grab app
- **Case Study**: 50% discount campaigns drove 20% incremental sales post-campaign

**MEDIA VALUE PACKAGE ($145,000):**
- **360-Degree Marketing**: High-impact marketing across multiple channels
- **Grab-Owned Channels**: eDM campaigns, social media promotion, in-app banners/carousels
- **Paid Advertising ($50,000)**: Digital ads, content hubs/KOLs, Telegram groups, social channels
- **In-App Visibility**: Banners, icons, carousels, prioritized listings, push notifications

**CAMPAIGN MECHANICS:**
- **Requirement**: 50% off bestsellers (bundles preferred)
- **Flexible Redemption Caps**: Customizable based on merchant needs
- **High-Res Images**: Required for deal submissions

**GROWTH POTENTIAL BY MERCHANT TYPE:**
- **Standalone Restaurants**: Up to 300% increase
- **QSR (Quick Service)**: Up to 41% increase  
- **Large Chains**: Up to 37% increase

**SIGN-UP PROCESS:**
1. **Account Manager Consultation**: Discuss business goals and campaign fit
2. **Participation Confirmation**: Finalize bundle details and participating outlets
3. **Deal Submission**: Provide high-res images and detailed offer information

**KEY OBJECTION HANDLING:**
- **Budget Constraints**: Address concerns about funding food costs and P&L impact
- **ROI Concerns**: Use proven metrics (8.5% outperformance, 20% incremental sales)
- **Campaign Investment**: Position as growth investment, not just marketing cost

**COMPETITIVE POSITIONING:**
- Media value worth $145,000 compared to traditional advertising
- Access to 1.1M+ engaged customer base
- Proven post-campaign sales sustainability (20% incremental sales)

Focus on consultative selling using MEDDPICC methodology to address budget constraints while demonstrating clear ROI and growth potential.`,
    productType: ProductType.OWN,
    modules: ['grab-mex'],
    keyFeatures: [
      'Grab is running a Mega Sale Campaign',
      'Over 1.5k Food & Mart stores participated in previous programs',
      '1.1M eaters engaged through the previous campaign',
      'Asking for 50% off best sellers bundle with customizable redemption caps in exchange for media value of $145,000',
      'Visibility includes high impact marketing across EDMs, social channels, KOLs, in app push & prioritised listings',
      'Grab owned channels & Paid advertising worth $50,000',
      'Previous 50% off campaigns drove 120% increase in sales during campaign & 20% incremental sales post campaign',
      "Merchant's competitor ran this campaign and saw 30% increase in new customer acquired, 20% increase in frequency for existing users post campaign",
      'End to end campaign support from deal submission to execution & reporting',
    ],
    featureHighlight: {
      title:
        'Mega Sale Campaign: 120% Sales Boost During Campaign + 20% Post-Campaign Growth',
      description:
        'Grab Mega Sale Campaign delivers exceptional results with over 1.5k participating stores and 1.1M engaged eaters. Offering 50% off best sellers with customizable redemption caps in exchange for $145,000 media value including high-impact marketing across EDMs, social channels, KOLs, and prioritized listings. Proven case studies show 120% sales increase during campaign and sustained 20% incremental growth post-campaign.',
    },
    evaluationFocus: [
      '**Campaign ROI Understanding**: Knowledge of 8.5% merchant outperformance and incremental sales growth metrics',
      '**Media Value Proposition**: Ability to articulate $145,000 media value packages and their components',
      '**Channel Strategy**: Understanding of 360-degree marketing across eDM, social, in-app, and paid channels',
      '**Budget Constraint Handling**: Skills in addressing merchant concerns about funding food costs and P&L impact',
      '**MEDDPICC Application**: Using MEDDPICC methodology to qualify opportunities and close campaign deals',
      '**Growth Segmentation**: Knowledge of different growth potentials (QSR 41%, Large Chains 37%, Standalone 300%)',
      '**Campaign Mechanics**: Understanding of 50% off requirements, bundle preferences, and redemption cap flexibility',
      '**Merchant Pain Points**: Ability to identify and address common objections around campaign investment',
      '**Success Stories**: Knowledge of case studies showing 20% post-campaign incremental sales',
      '**Visibility Channels**: Understanding of prioritized listings, digital ads, KOLs, and content hub strategies',
      '**Account Management**: Consultative selling approach focusing on merchant growth and partnership',
      '**Competitive Positioning**: Ability to demonstrate unique value vs other marketing channels and platforms',
    ],
    salesTarget: 'corporate',
  },
];
