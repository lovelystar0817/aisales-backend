import 'dotenv/config';

import { generateMessageFeedback } from './src/utils/realtime-feedback.js';
import { DEFAULT_CHARACTER_NAME } from './src/utils/constants.js';

// Mock message data that simulates a real conversation
const mockMessages = [
  {
    role: 'ai',
    content: 'Hey!',
    sent: new Date(),
  },
  {
    role: 'user', 
    content: 'Hey, Prakash. How are you?',
    sent: new Date(),
  },
  {
    role: 'ai',
    content: 'Hello Rene. I’m doing fine, thank you. Good to hear from you again. I’ve had a chance to reflect on our last discussion about Grab for Business, especially after hearing a bit from my colleagues in the Philippines. What’s new on your end since we last spoke?',
    sent: new Date(),
  },
  {
    role: 'user',
    content: 'Well, since our last conversation, I\'ve looked into some of the transport requirements you had earlier mentioned. Just wanted to get an understanding of has your priorities changed around that so far?',
    sent: new Date(),
  },
  {
    role: 'ai',
    content: 'My core priorities haven’t shifted much. We’re still focused on streamlining operations, ensuring compliance, and keeping a close eye on costs across the region. Transport requirements remain significant, especially with the scale we’re managing. I’m open to hearing if you’ve identified any areas where your solution could address some of those ongoing challenges more effectively. Have you come across anything specific that you think aligns with what we discussed earlier?',
    sent: new Date(),
  },
  {
    role: 'user',
    content: 'Definitely. So with the solution, I think a couple of areas which might be of interest would be number one, the reporting, the transparency and reporting that we see on the platform that we provide for clients. Number two, the governance framework in terms of policy setting and similar to folks in the professional services space, automating employee management, putting in cost center codes for better bill backs to clients would be of interest. How does that all sound to you?',
    sent: new Date(),
  },
  {
    role: 'ai',
    content: 'Those points are relevant, especially the governance framework and the ability to automate employee management tied to cost centers. We do have ongoing challenges with manual reconciliation and ensuring that business travel is compliant with our internal policies. Can you clarify how flexible your platform is when it comes to integrating with existing systems? Also, do you have any case studies from organizations of similar scale in APAC that demonstrate tangible cost savings or efficiency improvements?',
    sent: new Date(),
  },
];

// The latest message to generate feedback for
const latestMessage = {
  role: 'user',
  content: 'Sure. So with integrating systems, I think you\'ll be glad to know that Grab4Business sits as a standalone in terms of the web based portal. There isn\'t really a need to integrate, but where the employee management automation site comes in is via SFTP single shell file transfer protocol. And that\'s a one way push from your site to us maybe on a daily basis with the most updated employees of TCS, those that aren\'t there, we remove new joiners, we automatically add them in. That would save your team a huge amount of time in terms of having to add remove folks on a daily, on a weekly basis. Now, when it comes to case studies of similar clients, similar sizes, I\'ve personally worked with two large companies that have been doing this for years and they\'re all very different. And so we\'ve had some really good results in Singapore. One of about three and a half thousand folks through the employee management side, we\'ve actually helped to reduce two to three hours a week from a single admin\'s time work. That eventually translates into them being able to focus on more revenue generating activities.',
  sent: new Date(),
  tempId: 'test-123',
};

// Mock scenario
const scenario = {
  title: 'Grab for Business Discovery Call',
  objective: 'Understand the client\'s needs and recommend appropriate Grab for Business solution',
};

// Mock product info (this would come from getProductById in real usage)
const productInfo = {
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
  featureHighlight: {
    title: 'Complete Corporate Expense Control with 11,500+ Hours Saved Annually',
    description: 'Grab For Business delivers a unified platform that automates corporate expense management while providing complete policy control. Companies save over 11,500 employee working hours per year through automated claims processing, real-time spend monitoring, and intelligent policy enforcement across transport, food, and delivery services.',
  },
};

async function testGenerateMessageFeedback() {
  console.log('🧪 Testing generateMessageFeedback function...\n');

  try {
    const feedback = await generateMessageFeedback({
      message: latestMessage,
      messages: [...mockMessages, latestMessage] as any,
      characterName: DEFAULT_CHARACTER_NAME,
      scenario,
      productInfo,
      languageCode: 'en', // optional
    });

    console.log('✅ Feedback generated successfully!');
    console.log('📊 Result:');
    if (feedback) {
      console.log(`Type: ${feedback.type}`);
      console.log(`Content: "${feedback.content}"`);
    } else {
      console.log('No feedback generated (returned null)');
    }

  } catch (error) {
    console.error('❌ Error generating feedback:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the test
testGenerateMessageFeedback()
  .then(() => {
    console.log('\n🎉 Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }); 