import {
  IScorecard,
  ScorecardDocument,
  ScorecardLocalizations,
} from '../models/Scorecard.js';
import { SalesFramework } from '../frameworks/types.js';
import { Types } from 'mongoose';
import {
  PRUDENTIAL_COMPANY_ID,
  GRAB_COMPANY_ID,
  MSIG_COMPANY_ID,
  MTL_COMPANY_ID,
  AXA_PH_COMPANY_ID,
  KT_AXA_COMPANY_ID,
  GREAT_EASTERN_COMPANY_ID,
} from '../utils/constants.js';

/**
 * All possible scorecard configurations across all assessment variants
 */
export const ALL_SCORECARDS: any = [
  //NOTE: changed to any since the Scorecard schema has been updated (removed all salesTechniqueSections and technicalKnowledgeSections)
  // General/Default Scorecards
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000001'),
    friendlyId: 'default-general-scorecard',
    name: 'General Sales Assessment',
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique', 'product-knowledge'],
    salesTechniqueFramework: SalesFramework.THREE_F_MODEL,
    technicalKnowledgeVariant: 'general',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Framework Execution',
        description: 'How well did you apply the sales framework?',
        prompt:
          'Evaluate the application of the sales framework throughout the conversation.',
      },
      {
        title: 'Objection Handling',
        description: 'How effectively did you handle customer objections?',
        prompt:
          'Assess the quality of objection handling and response techniques.',
      },
      {
        title: 'Communication Skills',
        description: 'How clear and professional was your communication?',
        prompt: 'Evaluate communication clarity, tone, and professionalism.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Product Knowledge',
        description:
          'How well do you understand the product features and benefits?',
        prompt:
          'Assess understanding of product specifications and value propositions.',
      },
      {
        title: 'Competitive Knowledge',
        description: 'How well do you understand the competitive landscape?',
        prompt:
          'Evaluate knowledge of competitors and differentiation strategies.',
      },
    ],
    localizations: {},
  },

  // Prudential Scorecards
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000002'),
    friendlyId: 'prudential-cold-call-scorecard',
    name: 'Prudential Cold Call Assessment',
    company: new Types.ObjectId(PRUDENTIAL_COMPANY_ID),
    assessmentType: 'criteria',
    enabledAssessments: ['sales-technique', 'technical-knowledge'],
    salesTechniqueFramework: SalesFramework.FOUR_C_MODEL,
    technicalKnowledgeVariant: 'prudential',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Client Verification',
        description: 'Proper verification of client identity and consent',
        prompt: 'Evaluate compliance with client verification procedures.',
      },
      {
        title: '4C Framework Execution',
        description:
          'Application of Capture, Context, Conflict, and Close framework',
        prompt: 'Assess the execution of the 4C framework throughout the call.',
      },
      {
        title: 'Objection Handling',
        description: 'Effective handling of customer objections',
        prompt: 'Evaluate objection handling techniques and success rate.',
      },
      {
        title: 'Call Management',
        description: 'Overall call flow and time management',
        prompt: 'Assess call structure, pacing, and professional delivery.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Product Knowledge',
        description: 'Understanding of Prudential products and features',
        prompt:
          'Evaluate knowledge of product benefits, features, and suitability.',
      },
      {
        title: 'Regulatory Compliance',
        description: 'Adherence to regulatory requirements',
        prompt: 'Assess compliance with MAS regulations and company policies.',
      },
      {
        title: 'Risk Assessment',
        description: 'Ability to assess customer needs and risk profile',
        prompt:
          'Evaluate skill in identifying customer needs and appropriate solutions.',
      },
    ],
    localizations: {},
  },

  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000003'),
    friendlyId: 'prudential-product-positioning-scorecard',
    name: 'Prudential Product Positioning Assessment',
    company: new Types.ObjectId(PRUDENTIAL_COMPANY_ID),
    assessmentType: 'criteria',
    enabledAssessments: ['sales-technique', 'technical-knowledge'],
    salesTechniqueFramework: SalesFramework.THREE_F_MODEL,
    technicalKnowledgeVariant: 'prudential',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: '3F Framework Execution',
        description: 'Application of Feel, Felt, Found framework',
        prompt: 'Evaluate the use of empathy and solution-oriented approaches.',
      },
      {
        title: 'Product Positioning',
        description: 'Effective positioning of products against competitors',
        prompt:
          'Assess ability to position products with clear value propositions.',
      },
      {
        title: 'Customer Engagement',
        description: 'Building rapport and maintaining customer interest',
        prompt: 'Evaluate engagement techniques and relationship building.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Product Expertise',
        description: 'Deep knowledge of product features and benefits',
        prompt: 'Assess comprehensive understanding of product specifications.',
      },
      {
        title: 'Competitive Analysis',
        description: 'Understanding of competitive advantages',
        prompt:
          'Evaluate knowledge of market positioning and competitive strengths.',
      },
      {
        title: 'Needs Analysis',
        description: 'Ability to match products to customer needs',
        prompt:
          'Assess skill in identifying and addressing customer requirements.',
      },
    ],
    localizations: {},
  },

  // MSIG Scorecards
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000004'),
    friendlyId: 'msig-telesales-scorecard',
    name: 'MSIG Telesales Assessment',
    company: new Types.ObjectId(MSIG_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique', 'product-knowledge'],
    salesTechniqueFramework: SalesFramework.THREE_F_MODEL,
    technicalKnowledgeVariant: 'general',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Opening and Rapport',
        description: 'Effective call opening and relationship building',
        prompt:
          'Evaluate the quality of call opening and rapport establishment.',
      },
      {
        title: 'Needs Discovery',
        description: 'Identifying customer needs and pain points',
        prompt: 'Assess ability to uncover customer needs through questioning.',
      },
      {
        title: 'Product Presentation',
        description: 'Clear and compelling product presentation',
        prompt:
          'Evaluate product presentation skills and benefit communication.',
      },
      {
        title: 'Closing Techniques',
        description: 'Effective closing and next steps',
        prompt: 'Assess closing techniques and commitment securing.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Product Features',
        description: 'Understanding of MSIG product features',
        prompt: 'Evaluate knowledge of product specifications and coverage.',
      },
      {
        title: 'Claims Process',
        description: 'Knowledge of claims procedures and requirements',
        prompt:
          'Assess understanding of claims processes and customer support.',
      },
    ],
    localizations: {},
  },

  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000005'),
    friendlyId: 'msig-3f-scorecard',
    name: 'MSIG 3F Framework Assessment',
    company: new Types.ObjectId(MSIG_COMPANY_ID),
    assessmentType: 'score-with-badge',
    enabledAssessments: ['sales-technique', 'product-knowledge'],
    salesTechniqueFramework: SalesFramework.THREE_F_MODEL,
    technicalKnowledgeVariant: 'general',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Feel (Empathy)',
        description: 'Demonstrating understanding and empathy',
        prompt:
          'Evaluate the use of empathetic responses and active listening.',
      },
      {
        title: 'Felt (Shared Experience)',
        description: 'Sharing relevant experiences or examples',
        prompt:
          'Assess ability to relate through shared experiences or case studies.',
      },
      {
        title: 'Found (Solution)',
        description: 'Presenting effective solutions',
        prompt: 'Evaluate solution presentation and benefit articulation.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Product Differentiation',
        description: 'Understanding unique product advantages',
        prompt:
          'Assess knowledge of product differentiators and unique selling points.',
      },
      {
        title: 'Customer Scenarios',
        description: 'Applying products to customer situations',
        prompt:
          'Evaluate ability to match products to specific customer scenarios.',
      },
    ],
    localizations: {},
  },

  // Grab Scorecards
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000006'),
    friendlyId: 'grab-meddpicc-scorecard',
    name: 'Grab MEDDPICC Assessment',
    company: new Types.ObjectId(GRAB_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique', 'product-knowledge'],
    salesTechniqueFramework: SalesFramework.MEDDPICC,
    technicalKnowledgeVariant: 'general',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Metrics',
        description: 'Identifying quantifiable business impact',
        prompt: 'Evaluate ability to identify and discuss measurable outcomes.',
      },
      {
        title: 'Economic Buyer',
        description: 'Identifying decision makers',
        prompt: 'Assess skill in identifying and engaging economic buyers.',
      },
      {
        title: 'Decision Criteria',
        description: 'Understanding customer decision factors',
        prompt: 'Evaluate understanding of customer decision-making criteria.',
      },
      {
        title: 'Decision Process',
        description: 'Understanding the customer journey',
        prompt: 'Assess knowledge of customer decision-making process.',
      },
      {
        title: 'Pain',
        description: 'Identifying customer pain points',
        prompt:
          'Evaluate ability to identify and articulate customer challenges.',
      },
      {
        title: 'Champion',
        description: 'Building internal advocates',
        prompt:
          'Assess skill in identifying and developing internal champions.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Platform Knowledge',
        description: 'Understanding of Grab platform and services',
        prompt: 'Evaluate knowledge of Grab ecosystem and service offerings.',
      },
      {
        title: 'Business Solutions',
        description: 'Knowledge of B2B solutions and integrations',
        prompt:
          'Assess understanding of business solutions and API integrations.',
      },
    ],
    localizations: {},
  },

  // MTL Scorecards
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000007'),
    friendlyId: 'mtl-recruitment-scorecard',
    name: 'MTL Agent Recruitment Assessment',
    company: new Types.ObjectId(MTL_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique'],
    salesTechniqueFramework: SalesFramework.MTL_RECRUITMENT_FRAMEWORK,
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Rapport & Empathy',
        description: 'Building trust and making the recruit feel comfortable',
        prompt:
          'Evaluate the ability to build trust and make the potential recruit feel comfortable with a natural, encouraging tone.',
      },
      {
        title: 'Opportunity Framing',
        description: 'Presenting MTL role as professional and rewarding',
        prompt:
          'Assess how well the MTL role was presented as professional, meaningful, and rewarding with clear benefits.',
      },
      {
        title: 'Objection Handling',
        description: 'Responding confidently to concerns',
        prompt:
          'Evaluate how confidently emotional and logical concerns were addressed with realistic reassurance.',
      },
      {
        title: 'Motivation & Persuasion',
        description: 'Inspiring belief in personal growth and success',
        prompt:
          'Assess the ability to inspire belief in personal growth and success through relatable examples.',
      },
      {
        title: 'Call to Action',
        description: 'Converting interest into actionable next steps',
        prompt:
          'Evaluate how clearly interest was converted into actionable next steps with explicit commitment.',
      },
    ],
    localizations: {
      th: {
        name: 'การประเมินการรับสมัครเอเจนต์ MTL',
        salesTechniqueSections: [
          {
            title: 'สร้างสัมพันธ์และความเห็นอกเห็นใจ',
            description: 'สร้างความไว้วางใจและทำให้ผู้สมัครรู้สึกสบายใจ',
            prompt:
              'ประเมินความสามารถในการสร้างความไว้วางใจและทำให้ผู้สมัครที่มีศักยภาพรู้สึกสบายใจด้วยน้ำเสียงที่เป็นธรรมชาติและให้กำลังใจ',
          },
          {
            title: 'การนำเสนอโอกาส',
            description: 'นำเสนอบทบาท MTL เป็นมืออาชีพและคุ้มค่า',
            prompt:
              'ประเมินว่าบทบาท MTL ถูกนำเสนออย่างไรว่าเป็นมืออาชีพ มีความหมาย และคุ้มค่าพร้อมผลประโยชน์ที่ชัดเจน',
          },
          {
            title: 'การจัดการข้อโต้แย้ง',
            description: 'ตอบสนองอย่างมั่นใจต่อความกังวล',
            prompt:
              'ประเมินว่าความกังวลทางอารมณ์และตรรกะถูกจัดการอย่างมั่นใจด้วยการให้ความมั่นใจที่สมจริง',
          },
          {
            title: 'แรงจูงใจและการโน้มน้าวใจ',
            description:
              'สร้างแรงบันดาลใจความเชื่อในการเติบโตส่วนบุคคลและความสำเร็จ',
            prompt:
              'ประเมินความสามารถในการสร้างแรงบันดาลใจความเชื่อในการเติบโตส่วนบุคคลและความสำเร็จผ่านตัวอย่างที่เกี่ยวข้อง',
          },
          {
            title: 'การเรียกร้องให้ดำเนินการ',
            description: 'แปลงความสนใจให้เป็นขั้นตอนที่ปฏิบัติได้',
            prompt:
              'ประเมินว่าความสนใจถูกแปลงเป็นขั้นตอนที่ปฏิบัติได้อย่างชัดเจนพร้อมความมุ่งมั่นที่ชัดเจน',
          },
        ],
      },
    },
  },

  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000008'),
    friendlyId: 'mtl-advisory-scorecard',
    name: 'MTL Advisory Technique Assessment',
    company: new Types.ObjectId(MTL_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique', 'product-knowledge'],
    salesTechniqueFramework: SalesFramework.MTL_ADVISORY_FRAMEWORK,
    technicalKnowledgeVariant: 'general',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Rapport Building',
        description: 'Establishing comfort and trust quickly',
        prompt:
          'Evaluate how effectively comfort and trust were established quickly, relating to the customer naturally.',
      },
      {
        title: 'Needs Discovery',
        description: 'Understanding real priorities and financial goals',
        prompt:
          "Assess how well open-ended questions were used to understand the customer's real priorities and financial goals.",
      },
      {
        title: 'Product Framing',
        description: 'Introducing Muang Thai UL Plus naturally',
        prompt:
          'Evaluate how naturally and accurately Muang Thai UL Plus was introduced and linked to identified needs.',
      },
      {
        title: 'Objection Handling & Closing',
        description: 'Addressing concerns and securing commitment',
        prompt:
          'Assess how clearly concerns were addressed and an appointment commitment was secured confidently.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Product Knowledge',
        description: 'Understanding of UL Plus features and benefits',
        prompt:
          'Evaluate knowledge of Muang Thai UL Plus specifications, flexibility options, and value propositions.',
      },
      {
        title: 'Application Scenarios',
        description: 'Applying products to customer situations',
        prompt:
          'Assess ability to match UL Plus features to specific customer scenarios and needs.',
      },
    ],
    localizations: {
      th: {
        name: 'การประเมินเทคนิคการให้คำปรึกษา MTL',
        salesTechniqueSections: [
          {
            title: 'การสร้างสัมพันธ์',
            description: 'สร้างความสบายใจและความไว้วางใจอย่างรวดเร็ว',
            prompt:
              'ประเมินว่าความสบายใจและความไว้วางใจถูกสร้างอย่างมีประสิทธิภาพอย่างรวดเร็วเพียงใด เชื่อมโยงกับลูกค้าอย่างเป็นธรรมชาติ',
          },
          {
            title: 'การค้นพบความต้องการ',
            description: 'เข้าใจลำดับความสำคัญและเป้าหมายทางการเงินที่แท้จริง',
            prompt:
              'ประเมินว่าคำถามปลายเปิดถูกใช้อย่างดีเพียงใดเพื่อเข้าใจลำดับความสำคัญที่แท้จริงและเป้าหมายทางการเงินของลูกค้า',
          },
          {
            title: 'การนำเสนอผลิตภัณฑ์',
            description: 'แนะนำ Muang Thai UL Plus อย่างเป็นธรรมชาติ',
            prompt:
              'ประเมินว่า Muang Thai UL Plus ถูกแนะนำอย่างเป็นธรรมชาติและแม่นยำเพียงใดและเชื่อมโยงกับความต้องการที่ระบุ',
          },
          {
            title: 'การจัดการข้อโต้แย้งและการปิดการขาย',
            description: 'จัดการความกังวลและรักษาความมุ่งมั่น',
            prompt:
              'ประเมินว่าความกังวลถูกจัดการอย่างชัดเจนเพียงใดและความมุ่งมั่นในการนัดหมายถูกรักษาอย่างมั่นใจ',
          },
        ],
        technicalKnowledgeSections: [
          {
            title: 'ความรู้ผลิตภัณฑ์',
            description: 'ความเข้าใจในคุณสมบัติและประโยชน์ของ UL Plus',
            prompt:
              'ประเมินความรู้เกี่ยวกับข้อกำหนด Muang Thai UL Plus ตัวเลือกความยืดหยุ่น และข้อเสนอคุณค่า',
          },
          {
            title: 'สถานการณ์การใช้งาน',
            description: 'นำผลิตภัณฑ์ไปใช้กับสถานการณ์ของลูกค้า',
            prompt:
              'ประเมินความสามารถในการจับคู่คุณสมบัติ UL Plus กับสถานการณ์และความต้องการเฉพาะของลูกค้า',
          },
        ],
      },
    },
  },

  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000009'),
    friendlyId: 'mtl-prospect-practice-scorecard',
    name: 'MTL Pitch Mastery Assessment',
    company: new Types.ObjectId(MTL_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique'],
    salesTechniqueFramework: SalesFramework.MTL_PROSPECT_FRAMEWORK,
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Prospect Realism',
        description:
          'How believable and consistent was the portrayal of a real prospect?',
        prompt:
          'Evaluate how believable and consistent the user was in portraying a real prospect throughout the conversation.',
      },
      {
        title: 'Clarity of Needs & Concerns',
        description:
          'Did the user express relevant needs, doubts, and decision factors?',
        prompt:
          'Assess how clearly the user expressed relevant needs, doubts, and decision-making factors.',
      },
      {
        title: 'Quality of Questions Asked',
        description:
          'Did the user ask meaningful questions a real prospect would ask?',
        prompt:
          'Evaluate the quality and relevance of questions asked by the user as a prospect.',
      },
      {
        title: 'Engagement & Responsiveness',
        description:
          "How well did the user respond to the agent's discovery and explanations?",
        prompt:
          "Assess how well the user engaged with and responded to the agent's discovery questions and explanations.",
      },
      {
        title: 'Conversation Completion',
        description:
          'Did the user help complete needs discovery and product explanation in the conversation?',
        prompt:
          'Evaluate how well the user engaged with the full needs discovery and product explanation process in this conversation.',
      },
    ],
    localizations: {
      th: {
        name: 'การประเมินการเชี่ยวชาญการนำเสนอ MTL',
        salesTechniqueSections: [
          {
            title: 'ความสมจริงของลูกค้าเป้าหมาย',
            description:
              'การแสดงบทบาทของลูกค้าเป้าหมายจริงมีความน่าเชื่อถือและสอดคล้องกันเพียงใด?',
            prompt:
              'ประเมินว่าผู้ใช้มีความน่าเชื่อถือและสอดคล้องกันเพียงใดในการแสดงบทบาทของลูกค้าเป้าหมายจริงตลอดการสนทนา',
          },
          {
            title: 'ความชัดเจนของความต้องการและความกังวล',
            description:
              'ผู้ใช้แสดงความต้องการ ข้อสงสัย และปัจจัยการตัดสินใจที่เกี่ยวข้องหรือไม่?',
            prompt:
              'ประเมินว่าผู้ใช้แสดงความต้องการ ข้อสงสัย และปัจจัยการตัดสินใจที่เกี่ยวข้องอย่างชัดเจนเพียงใด',
          },
          {
            title: 'คุณภาพของคำถามที่ถาม',
            description:
              'ผู้ใช้ถามคำถามที่มีความหมายที่ลูกค้าเป้าหมายจริงจะถามหรือไม่?',
            prompt:
              'ประเมินคุณภาพและความเกี่ยวข้องของคำถามที่ผู้ใช้ถามในฐานะลูกค้าเป้าหมาย',
          },
          {
            title: 'การมีส่วนร่วมและการตอบสนอง',
            description:
              'ผู้ใช้ตอบสนองต่อการค้นพบและคำอธิบายของตัวแทนได้ดีเพียงใด?',
            prompt:
              'ประเมินว่าผู้ใช้มีส่วนร่วมและตอบสนองต่อคำถามการค้นพบและคำอธิบายของตัวแทนได้ดีเพียงใด',
          },
          {
            title: 'ความสมบูรณ์ของการสนทนา',
            description:
              'ผู้ใช้ช่วยให้การค้นพบความต้องการและการอธิบายผลิตภัณฑ์เสร็จสมบูรณ์ในการสนทนาหรือไม่?',
            prompt:
              'ประเมินว่าผู้ใช้มีส่วนร่วมกับกระบวนการค้นพบความต้องการและการอธิบายผลิตภัณฑ์อย่างครบถ้วนในการสนทนานี้ได้ดีเพียงใด',
          },
        ],
      },
    },
  },

  // AXA-PH Scorecards
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000010'),
    friendlyId: 'axa-ph-recruitment-scorecard',
    name: 'AXA-PH Unit Manager Recruitment Assessment',
    company: new Types.ObjectId(AXA_PH_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique'],
    salesTechniqueFramework: SalesFramework.AXA_PH_RECRUITMENT_FRAMEWORK,
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Soft Skills',
        description:
          'Evaluates interpersonal and communication abilities during recruitment',
        prompt:
          'Evaluate soft skills including Communication Skills (clear and respectful communication), Relationship Building (rapport with recruit), Adaptability (flexibility with concerns), and Customer Orientation (convincing presentation about the Company).',
      },
      {
        title: 'Knowledge Skills',
        description:
          'Evaluates business knowledge and problem-solving abilities',
        prompt:
          'Evaluate knowledge skills including Fact Finding (legal and compliance requirements), Business Knowledge (remuneration, commission, rewards), Problem-Solving (identifying issues and solutions), and Sales & Negotiation Skills (convincing and negotiating effectively).',
      },
    ],
    localizations: {
      tl: {
        name: 'AXA-PH Unit Manager Recruitment Assessment',
        salesTechniqueSections: [
          {
            title: 'Soft Skills',
            description:
              'Sinusuri ang mga kakayahan sa interpersonal at komunikasyon sa panahon ng recruitment',
            prompt:
              'Suriin ang soft skills kabilang ang Communication Skills (malinaw at magalang na komunikasyon), Relationship Building (rapport sa recruit), Adaptability (flexibility sa mga alalahanin), at Customer Orientation (nakakakumbinsing presentasyon tungkol sa Kompanya).',
          },
          {
            title: 'Knowledge Skills',
            description:
              'Sinusuri ang kaalaman sa negosyo at kakayahan sa paglutas ng problema',
            prompt:
              'Suriin ang knowledge skills kabilang ang Fact Finding (legal at compliance requirements), Business Knowledge (remuneration, commission, rewards), Problem-Solving (pagtukoy ng mga isyu at solusyon), at Sales & Negotiation Skills (pagkumbinsi at pakikipagnegosasyon nang epektibo).',
          },
        ],
      },
    },
  },

  // AXA-PH Financial Needs Analysis Scorecard
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000011'),
    friendlyId: 'axa-ph-fna-scorecard',
    name: 'AXA-PH Financial Needs Analysis Assessment',
    company: new Types.ObjectId(AXA_PH_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique', 'product-knowledge'],
    salesTechniqueFramework: SalesFramework.AXA_PH_FNA_FRAMEWORK,
    technicalKnowledgeVariant: 'general',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Communication Skills',
        description: 'Clear delivery and respectful communication',
        prompt:
          'Evaluate the quality of communication including clarity, tone, professionalism, and respect shown to the client throughout the conversation.',
      },
      {
        title: 'Adaptability',
        description: 'Flexibility in understanding customer concerns',
        prompt:
          'Assess how well the agent adapted their approach based on customer responses, showing flexibility in addressing changing concerns and situations.',
      },
      {
        title: 'Customer Orientation',
        description: 'Focus on customer satisfaction and service',
        prompt:
          'Evaluate how well the agent focused on customer needs, satisfaction, and providing service rather than just selling. Did they prioritize the client experience?',
      },
      {
        title: 'Fact Finding',
        description:
          'Ask all required information: Name, Age, Occupation, Annual Income, Financial Objectives',
        prompt:
          'Assess how thoroughly the agent gathered key client information including Name, Age, Occupation, Annual Income, and Financial Objectives through appropriate questioning.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Product Pitch',
        description:
          'Understanding of AXA Secure Future features and benefits, and providing a solution aligned with customer profile',
        prompt:
          'Evaluate knowledge of AXA Secure Future product features (7-pay structure, guaranteed annual cash endowment, death benefit, surrender value, policy loans, non-forfeiture options) and how well the solution was tailored to the customer profile and financial objectives.',
      },
    ],
    localizations: {
      tl: {
        name: 'AXA-PH Financial Needs Analysis Assessment',
        salesTechniqueSections: [
          {
            title: 'Communication Skills',
            description: 'Malinaw na paghahatid at magalang na komunikasyon',
            prompt:
              'Suriin ang kalidad ng komunikasyon kabilang ang kalinawan, tono, propesyonalismo, at paggalang na ipinakita sa kliyente sa buong pag-uusap.',
          },
          {
            title: 'Adaptability',
            description:
              'Kakayahang umangkop sa pag-unawa sa mga alalahanin ng customer',
            prompt:
              'Suriin kung gaano kabuti nag-adapt ang agent ng kanilang approach batay sa mga tugon ng customer, nagpapakita ng flexibility sa pagtugon sa nagbabagong mga alalahanin at sitwasyon.',
          },
          {
            title: 'Customer Orientation',
            description: 'Focus sa kasiyahan at serbisyo ng customer',
            prompt:
              'Suriin kung gaano kabuti nag-focus ang agent sa mga pangangailangan ng customer, kasiyahan, at pagbibigay ng serbisyo kaysa sa pagbebenta lamang. Pinahalagahan ba nila ang karanasan ng kliyente?',
          },
          {
            title: 'Fact Finding',
            description:
              'Tanungin ang lahat ng kinakailangang impormasyon: Pangalan, Edad, Trabaho, Taunang Kita, Financial Objectives',
            prompt:
              'Suriin kung gaano kasusing nangolekta ang agent ng mahahalagang impormasyon ng kliyente kabilang ang Pangalan, Edad, Trabaho, Taunang Kita, at Financial Objectives sa pamamagitan ng angkop na pagtatanong.',
          },
        ],
        technicalKnowledgeSections: [
          {
            title: 'Product Pitch',
            description:
              'Pag-unawa sa mga features at benefits ng AXA Secure Future, at pagbibigay ng solusyon na naaayon sa profile ng customer',
            prompt:
              'Suriin ang kaalaman sa mga features ng produktong AXA Secure Future (7-pay structure, guaranteed annual cash endowment, death benefit, surrender value, policy loans, non-forfeiture options) at kung gaano kabuti ang solusyon ay nai-tailor sa profile at financial objectives ng customer.',
          },
        ],
      },
    },
  },

  // AXA-PH General Objection Handling Scorecard
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000012'),
    friendlyId: 'axa-ph-objection-handling-scorecard',
    name: 'AXA-PH General Objection Handling Assessment',
    company: new Types.ObjectId(AXA_PH_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique'],
    salesTechniqueFramework: SalesFramework.AXA_PH_OBJECTION_HANDLING_FRAMEWORK,
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      // Soft Skills (3 sections)
      {
        title: 'Relationship Building',
        description: 'Building and maintaining respectful communication',
        prompt:
          'Evaluate how effectively the agent built and maintained trust-based, respectful communication throughout the conversation. Did they establish rapport early and maintain a warm tone?',
      },
      {
        title: 'Adaptability',
        description: 'Flexibility in understanding customer concerns',
        prompt:
          'Assess how well the agent adapted their approach based on customer responses, showing flexibility in addressing changing concerns about education funding, affordability, and protection.',
      },
      {
        title: 'Customer Orientation',
        description: 'Focus on customer satisfaction and service',
        prompt:
          "Evaluate how well the agent focused on customer needs, satisfaction, and providing service rather than just selling. Did they prioritize understanding the family-oriented client's education goals?",
      },
      // Knowledge Skills (2 sections)
      {
        title: 'Problem-Solving',
        description: 'Ability to identify issues and find solutions',
        prompt:
          'Assess how effectively the agent identified core concerns and provided practical solutions for objections around affordability, guaranteed returns, early withdrawal, and protection.',
      },
      {
        title: 'Sales & Negotiation Skills',
        description: 'Ability to close deals and negotiate effectively',
        prompt:
          'Evaluate how well the agent handled objections professionally, presented alternatives when facing resistance, and maintained a friendly, exploratory tone while negotiating.',
      },
    ],
    localizations: {
      tl: {
        name: 'AXA-PH General Objection Handling Assessment',
        salesTechniqueSections: [
          {
            title: 'Relationship Building',
            description: 'Pagbuo at pagpapanatili ng magalang na komunikasyon',
            prompt:
              'Suriin kung gaano kabisa ang agent sa pagbuo at pagpapanatili ng komunikasyong batay sa tiwala at paggalang sa buong pag-uusap. Nakabuo ba sila ng rapport ng maaga at napanatili ang mainit na tono?',
          },
          {
            title: 'Adaptability',
            description:
              'Kakayahang umangkop sa pag-unawa sa mga alalahanin ng customer',
            prompt:
              'Suriin kung gaano kabuti nag-adapt ang agent ng kanilang approach batay sa mga tugon ng customer, nagpapakita ng flexibility sa pagtugon sa nagbabagong mga alalahanin tungkol sa education funding, affordability, at protection.',
          },
          {
            title: 'Customer Orientation',
            description: 'Focus sa kasiyahan at serbisyo ng customer',
            prompt:
              'Suriin kung gaano kabuti nag-focus ang agent sa mga pangangailangan ng customer, kasiyahan, at pagbibigay ng serbisyo kaysa sa pagbebenta lamang. Pinrayoridad ba nila ang pag-unawa sa education goals ng family-oriented na kliyente?',
          },
          {
            title: 'Problem-Solving',
            description:
              'Kakayahang tukuyin ang mga isyu at makahanap ng solusyon',
            prompt:
              'Suriin kung gaano kabisa ang agent sa pagtukoy ng mga pangunahing alalahanin at pagbibigay ng praktikal na solusyon para sa mga objection tungkol sa affordability, guaranteed returns, early withdrawal, at protection.',
          },
          {
            title: 'Sales & Negotiation Skills',
            description:
              'Kakayahang isara ang mga deal at makipagnegosasyon nang epektibo',
            prompt:
              'Suriin kung gaano kabuti ang agent sa pag-handle ng mga objection nang propesyonal, pagpresenta ng mga alternatibo kapag may resistance, at pagpapanatili ng friendly at exploratory na tono habang nakikipagnegosasyon.',
          },
        ],
      },
    },
  },

  // KT AXA Recruitment Scorecard
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000012'),
    friendlyId: 'kt-axa-recruitment-scorecard',
    name: 'KT AXA Agent Recruitment Assessment',
    company: new Types.ObjectId(KT_AXA_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique'],
    salesTechniqueFramework: SalesFramework.KT_AXA_RECRUITMENT_FRAMEWORK,
    salesTechniqueSections: [
      {
        title: 'Communication Skills',
        description:
          'Clear delivery and respectful communication to the new recruit',
        prompt:
          'Evaluate the quality of communication including clarity, tone, professionalism, and respect shown to the potential recruit throughout the conversation.',
      },
      {
        title: 'Relationship Building',
        description:
          'Building and maintaining rapport with the candidate/new recruit',
        prompt:
          'Assess how well the agent built and maintained rapport with the candidate, creating trust and connection through genuine engagement.',
      },
      {
        title: 'Adaptability',
        description:
          'Flexibility in changing/understanding the concerns of the recruit',
        prompt:
          'Evaluate how well the agent adapted their approach based on the recruit responses, showing flexibility in addressing changing concerns and situations.',
      },
      {
        title: 'Customer Orientation',
        description:
          'Able to provide a clear convincing presentation about the Company and the business',
        prompt:
          'Assess how well the agent focused on the recruit needs, providing a clear and convincing presentation about KT-AXA and the insurance agent career opportunity.',
      },
      {
        title: 'Fact Finding',
        description:
          'Knows all the basic requirements in becoming part of the business such as Legal and Compliance',
        prompt:
          'Evaluate how thoroughly the agent gathered key information about the recruit background, goals, and concerns, while demonstrating knowledge of legal and compliance requirements.',
      },
      {
        title: 'Business Knowledge',
        description:
          'Provided a deep understanding of the remuneration available for distributors (e.g., Commission/Salary, contests, rewards and benefits)',
        prompt:
          'Assess the agent knowledge and ability to explain the compensation structure including commission rates, bonuses, contests, rewards, and benefits available to KT-AXA agents.',
      },
      {
        title: 'Problem-Solving',
        description: 'Ability to identify issues and provide solutions',
        prompt:
          'Evaluate the agent ability to identify the recruit concerns and objections, and provide effective solutions and responses to address them.',
      },
      {
        title: 'Sales & Negotiation Skills',
        description:
          'Ability to convince and negotiate effectively with the new recruit',
        prompt:
          'Assess the agent persuasion and negotiation abilities, including how effectively they presented value propositions and handled resistance.',
      },
      {
        title: 'KT-AXA Company Knowledge',
        description:
          'Knowledge of KT-AXA products, services, training programs, and career opportunities',
        prompt:
          'Evaluate the agent knowledge of KT-AXA including products, services, AXA Prime Blue training program, career progression paths, and company culture.',
      },
    ],
    localizations: {
      th: {
        name: 'การประเมินการสรรหาตัวแทน KT AXA',
        salesTechniqueSections: [
          {
            title: 'ทักษะการสื่อสาร',
            description:
              'การนำเสนอที่ชัดเจนและการสื่อสารที่เคารพต่อผู้สมัครใหม่',
            prompt:
              'ประเมินคุณภาพการสื่อสารรวมถึงความชัดเจน น้ำเสียง ความเป็นมืออาชีพ และความเคารพที่แสดงต่อผู้สมัครที่มีศักยภาพตลอดการสนทนา',
          },
          {
            title: 'การสร้างความสัมพันธ์',
            description: 'การสร้างและรักษาความสัมพันธ์กับผู้สมัคร/ผู้สมัครใหม่',
            prompt:
              'ประเมินว่าตัวแทนสร้างและรักษาความสัมพันธ์กับผู้สมัครได้ดีแค่ไหน สร้างความไว้วางใจและความเชื่อมโยงผ่านการมีส่วนร่วมอย่างจริงใจ',
          },
          {
            title: 'ความสามารถในการปรับตัว',
            description:
              'ความยืดหยุ่นในการเปลี่ยนแปลง/เข้าใจความกังวลของผู้สมัคร',
            prompt:
              'ประเมินว่าตัวแทนปรับแนวทางตามการตอบสนองของผู้สมัครได้ดีแค่ไหน แสดงความยืดหยุ่นในการตอบสนองต่อความกังวลและสถานการณ์ที่เปลี่ยนแปลง',
          },
          {
            title: 'การมุ่งเน้นลูกค้า',
            description:
              'สามารถนำเสนอข้อมูลบริษัทและธุรกิจอย่างชัดเจนและน่าเชื่อถือ',
            prompt:
              'ประเมินว่าตัวแทนให้ความสำคัญกับความต้องการของผู้สมัครได้ดีแค่ไหน นำเสนอข้อมูลเกี่ยวกับ KT-AXA และโอกาสในอาชีพตัวแทนประกันอย่างชัดเจนและน่าเชื่อถือ',
          },
          {
            title: 'การค้นหาข้อมูล',
            description:
              'รู้ข้อกำหนดพื้นฐานทั้งหมดในการเป็นส่วนหนึ่งของธุรกิจ เช่น กฎหมายและการปฏิบัติตามกฎระเบียบ',
            prompt:
              'ประเมินว่าตัวแทนรวบรวมข้อมูลสำคัญเกี่ยวกับภูมิหลัง เป้าหมาย และความกังวลของผู้สมัครได้ละเอียดแค่ไหน พร้อมแสดงความรู้เกี่ยวกับข้อกำหนดทางกฎหมายและการปฏิบัติตามกฎระเบียบ',
          },
          {
            title: 'ความรู้ทางธุรกิจ',
            description:
              'ให้ความเข้าใจลึกซึ้งเกี่ยวกับค่าตอบแทนสำหรับตัวแทน (เช่น ค่าคอมมิชชัน/เงินเดือน การแข่งขัน รางวัลและสิทธิประโยชน์)',
            prompt:
              'ประเมินความรู้และความสามารถของตัวแทนในการอธิบายโครงสร้างค่าตอบแทนรวมถึงอัตราค่าคอมมิชชัน โบนัส การแข่งขัน รางวัล และสิทธิประโยชน์สำหรับตัวแทน KT-AXA',
          },
          {
            title: 'การแก้ปัญหา',
            description: 'ความสามารถในการระบุปัญหาและเสนอวิธีแก้ไข',
            prompt:
              'ประเมินความสามารถของตัวแทนในการระบุความกังวลและข้อโต้แย้งของผู้สมัคร และให้วิธีแก้ไขและการตอบสนองที่มีประสิทธิภาพ',
          },
          {
            title: 'ทักษะการขายและการเจรจา',
            description:
              'ความสามารถในการโน้มน้าวและเจรจาอย่างมีประสิทธิภาพกับผู้สมัครใหม่',
            prompt:
              'ประเมินความสามารถในการโน้มน้าวและเจรจาของตัวแทน รวมถึงวิธีการนำเสนอคุณค่าและการจัดการกับการต่อต้านอย่างมีประสิทธิภาพ',
          },
          {
            title: 'ความรู้เกี่ยวกับบริษัท KT-AXA',
            description:
              'ความรู้เกี่ยวกับผลิตภัณฑ์ บริการ โปรแกรมการฝึกอบรม และโอกาสในอาชีพของ KT-AXA',
            prompt:
              'ประเมินความรู้ของตัวแทนเกี่ยวกับ KT-AXA รวมถึงผลิตภัณฑ์ บริการ โปรแกรมฝึกอบรม AXA Prime Blue เส้นทางความก้าวหน้าในอาชีพ และวัฒนธรรมองค์กร',
          },
        ],
      },
    },
  },

  // KT AXA FNA Product Pitch Scorecard
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000013'),
    friendlyId: 'kt-axa-fna-scorecard',
    name: 'KT AXA FNA & Product Pitch Assessment',
    company: new Types.ObjectId(KT_AXA_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique', 'product-knowledge'],
    salesTechniqueFramework: SalesFramework.KT_AXA_FNA_FRAMEWORK,
    technicalKnowledgeVariant: 'general',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Communication Skills',
        description:
          'Clear delivery and respectful communication with the prospect',
        prompt:
          'Evaluate the quality of communication including clarity, tone, professionalism, and respect shown to the prospect throughout the conversation.',
      },
      {
        title: 'Adaptability',
        description: 'Flexibility in understanding customer concerns and needs',
        prompt:
          'Assess how well the agent adapted their approach based on customer responses, showing flexibility in addressing changing concerns and situations.',
      },
      {
        title: 'Customer Orientation',
        description: 'Focus on customer satisfaction and providing value',
        prompt:
          'Evaluate how well the agent focused on customer needs, satisfaction, and providing genuine value rather than just selling. Did they prioritize the client experience?',
      },
      {
        title: 'Fact Finding',
        description:
          'Gathering key information: Age, Occupation, Income, Financial Goals, Family Situation, Existing Coverage',
        prompt:
          'Assess how thoroughly the agent gathered key client information including Age, Occupation, Income, Financial Goals, Family Situation, and Existing Coverage through appropriate questioning.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Product Pitch',
        description:
          'Understanding of Life Ready and CI 123 features/benefits, and providing a solution aligned with customer profile',
        prompt:
          'Evaluate knowledge of Life Ready (whole life insurance with savings component, tax deduction benefits) and CI 123 Critical Illness Rider (coverage for 123 diseases, lump sum payment) and how well the solution was tailored to the customer profile, financial situation, and objectives.',
      },
    ],
    localizations: {
      th: {
        name: 'การประเมิน KT AXA FNA และนำเสนอผลิตภัณฑ์',
        salesTechniqueSections: [
          {
            title: 'ทักษะการสื่อสาร',
            description:
              'การนำเสนอที่ชัดเจนและการสื่อสารที่เคารพกับลูกค้าเป้าหมาย',
            prompt:
              'ประเมินคุณภาพการสื่อสารรวมถึงความชัดเจน น้ำเสียง ความเป็นมืออาชีพ และความเคารพที่แสดงต่อลูกค้าเป้าหมายตลอดการสนทนา',
          },
          {
            title: 'ความสามารถในการปรับตัว',
            description:
              'ความยืดหยุ่นในการเข้าใจความกังวลและความต้องการของลูกค้า',
            prompt:
              'ประเมินว่าตัวแทนปรับแนวทางตามการตอบสนองของลูกค้าได้ดีแค่ไหน แสดงความยืดหยุ่นในการตอบสนองต่อความกังวลและสถานการณ์ที่เปลี่ยนแปลง',
          },
          {
            title: 'การมุ่งเน้นลูกค้า',
            description: 'มุ่งเน้นความพึงพอใจของลูกค้าและการมอบคุณค่า',
            prompt:
              'ประเมินว่าตัวแทนให้ความสำคัญกับความต้องการของลูกค้า ความพึงพอใจ และการมอบคุณค่าที่แท้จริงมากกว่าการขายเพียงอย่างเดียว ให้ความสำคัญกับประสบการณ์ของลูกค้าหรือไม่?',
          },
          {
            title: 'การค้นหาข้อมูล',
            description:
              'การรวบรวมข้อมูลสำคัญ: อายุ อาชีพ รายได้ เป้าหมายทางการเงิน สถานการณ์ครอบครัว ความคุ้มครองที่มีอยู่',
            prompt:
              'ประเมินว่าตัวแทนรวบรวมข้อมูลสำคัญของลูกค้าได้ละเอียดแค่ไหน รวมถึง อายุ อาชีพ รายได้ เป้าหมายทางการเงิน สถานการณ์ครอบครัว และความคุ้มครองที่มีอยู่ ผ่านการถามคำถามที่เหมาะสม',
          },
        ],
        technicalKnowledgeSections: [
          {
            title: 'การนำเสนอผลิตภัณฑ์',
            description:
              'ความเข้าใจคุณสมบัติ/ประโยชน์ของ Life Ready และ CI 123 และการนำเสนอโซลูชันที่ตรงกับโปรไฟล์ลูกค้า',
            prompt:
              'ประเมินความรู้เกี่ยวกับ Life Ready (ประกันชีวิตตลอดชีพพร้อมองค์ประกอบการออม สิทธิประโยชน์ลดหย่อนภาษี) และ CI 123 สัญญาเพิ่มเติมโรคร้ายแรง (คุ้มครอง 123 โรค จ่ายเงินก้อน) และวิธีที่โซลูชันถูกปรับให้เหมาะกับโปรไฟล์ลูกค้า สถานการณ์ทางการเงิน และวัตถุประสงค์',
          },
        ],
      },
    },
  },
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000014'),
    friendlyId: 'kt-axa-wealthplus-scorecard',
    name: 'KT AXA WealthPlus Close Call Assessment',
    company: new Types.ObjectId(KT_AXA_COMPANY_ID),
    assessmentType: 'score',
    enabledAssessments: ['overview', 'sales-technique', 'product-knowledge'],
    salesTechniqueFramework: SalesFramework.KT_AXA_WEALTHPLUS_FRAMEWORK,
    technicalKnowledgeVariant: 'general',
    scormPolicy: {
      enabled: true,
    },
    salesTechniqueSections: [
      {
        title: 'Communication Skills',
        description:
          'Clear, professional delivery with active listening and appropriate language',
        prompt:
          'Evaluate the quality of communication including clarity of speech, professional tone, active listening skills, and use of appropriate language when discussing WealthPlus Ready 90/8 with the high-value prospect.',
      },
      {
        title: 'Relationship Building',
        description: 'Building rapport and trust with the prospect',
        prompt:
          'Assess how well the agent built rapport and established trust with the prospect through personalized conversation, showing genuine interest, and creating a comfortable environment for discussion.',
      },
      {
        title: 'Adaptability',
        description:
          'Flexibility in responding to objections and changing needs',
        prompt:
          'Evaluate how effectively the agent adapted their approach based on prospect responses, handled objections smoothly, and adjusted the conversation flow to address evolving concerns.',
      },
      {
        title: 'Customer Orientation',
        description: 'Focus on customer needs, goals, and providing value',
        prompt:
          'Assess how well the agent prioritized customer needs and goals, demonstrated understanding of their unique situation, and focused on providing genuine value rather than just closing the sale.',
      },
      {
        title: 'Fact Finding',
        description:
          'Gathering key information about financial situation, family, goals, and legacy planning needs',
        prompt:
          'Evaluate how thoroughly the agent gathered critical information including current financial situation, family structure, retirement and legacy goals, existing coverage, and estate planning needs through targeted questioning.',
      },
      {
        title: 'Problem-Solving',
        description:
          'Analyzing customer needs and proposing tailored solutions',
        prompt:
          "Assess how well the agent analyzed the prospect's situation, identified specific needs and gaps, and positioned WealthPlus Ready 90/8 as a solution that addresses their unique legacy planning and wealth transfer requirements.",
      },
      {
        title: 'Sales & Negotiation Skills',
        description: 'Handling objections and guiding toward decision',
        prompt:
          "Evaluate the agent's ability to handle price objections, address concerns about product comparison and returns, overcome hesitation, and guide the prospect toward a decision using appropriate closing techniques.",
      },
      {
        title: 'Compliance & Regulations',
        description:
          'Adherence to regulatory requirements and proper disclosure',
        prompt:
          'Assess whether the agent followed compliance requirements including proper product disclosures, used approved terminology, avoided prohibited claims, and maintained ethical sales practices throughout the conversation.',
      },
    ],
    technicalKnowledgeSections: [
      {
        title: 'Product Pitch',
        description:
          'Understanding of WealthPlus Ready 90/8 features, benefits, and ability to position it as a legacy planning tool',
        prompt:
          "Evaluate knowledge of WealthPlus Ready 90/8 including 10% annual cash return, 8-year premium payment period, coverage until age 90, escalating death benefit (100%-800%), maturity benefit structure, tax advantages (up to 100,000 THB deduction), and how effectively the agent positioned it as a legacy planning and wealth transfer solution tailored to the prospect's needs.",
      },
    ],
    localizations: {
      th: {
        name: 'การประเมิน KT AXA WealthPlus Close Call',
        salesTechniqueSections: [
          {
            title: 'ทักษะการสื่อสาร',
            description:
              'การนำเสนอที่ชัดเจน เป็นมืออาชีพ พร้อมการฟังอย่างตั้งใจและภาษาที่เหมาะสม',
            prompt:
              'ประเมินคุณภาพการสื่อสารรวมถึงความชัดเจนในการพูด น้ำเสียงที่เป็นมืออาชีพ ทักษะการฟังอย่างตั้งใจ และการใช้ภาษาที่เหมาะสมเมื่อพูดคุยเรื่อง WealthPlus Ready 90/8 กับลูกค้าเป้าหมายระดับสูง',
          },
          {
            title: 'การสร้างความสัมพันธ์',
            description: 'การสร้างสายสัมพันธ์และความไว้วางใจกับลูกค้าเป้าหมาย',
            prompt:
              'ประเมินว่าตัวแทนสร้างสายสัมพันธ์และสร้างความไว้วางใจกับลูกค้าเป้าหมายได้ดีแค่ไหน ผ่านการสนทนาที่เป็นส่วนตัว การแสดงความสนใจอย่างแท้จริง และการสร้างบรรยากาศที่สบายสำหรับการพูดคุย',
          },
          {
            title: 'ความสามารถในการปรับตัว',
            description:
              'ความยืดหยุ่นในการตอบสนองต่อข้อโต้แย้งและความต้องการที่เปลี่ยนแปลง',
            prompt:
              'ประเมินว่าตัวแทนปรับแนวทางตามการตอบสนองของลูกค้าเป้าหมายได้อย่างมีประสิทธิภาพแค่ไหน จัดการกับข้อโต้แย้งอย่างราบรื่น และปรับการสนทนาเพื่อตอบสนองต่อความกังวลที่เปลี่ยนแปลง',
          },
          {
            title: 'การมุ่งเน้นลูกค้า',
            description:
              'มุ่งเน้นความต้องการ เป้าหมาย และการมอบคุณค่าให้ลูกค้า',
            prompt:
              'ประเมินว่าตัวแทนให้ความสำคัญกับความต้องการและเป้าหมายของลูกค้าได้ดีแค่ไหน แสดงความเข้าใจในสถานการณ์เฉพาะของพวกเขา และมุ่งเน้นการให้คุณค่าที่แท้จริงมากกว่าการปิดการขายเพียงอย่างเดียว',
          },
          {
            title: 'การค้นหาข้อมูล',
            description:
              'การรวบรวมข้อมูลสำคัญเกี่ยวกับสถานการณ์ทางการเงิน ครอบครัว เป้าหมาย และความต้องการวางแผนมรดก',
            prompt:
              'ประเมินว่าตัวแทนรวบรวมข้อมูลสำคัญได้ละเอียดแค่ไหน รวมถึงสถานการณ์ทางการเงินปัจจุบัน โครงสร้างครอบครัว เป้าหมายการเกษียณและมรดก ความคุ้มครองที่มีอยู่ และความต้องการวางแผนมรดก ผ่านการถามคำถามที่ตรงเป้าหมาย',
          },
          {
            title: 'การแก้ปัญหา',
            description:
              'การวิเคราะห์ความต้องการของลูกค้าและเสนอโซลูชันที่ปรับแต่งได้',
            prompt:
              'ประเมินว่าตัวแทนวิเคราะห์สถานการณ์ของลูกค้าเป้าหมายได้ดีแค่ไหน ระบุความต้องการและช่องว่างที่เฉพาะเจาะจง และวาง WealthPlus Ready 90/8 เป็นโซลูชันที่ตอบสนองความต้องการการวางแผนมรดกและการถ่ายโอนความมั่งคั่งที่เป็นเอกลักษณ์ของพวกเขา',
          },
          {
            title: 'ทักษะการขายและการเจรจาต่อรอง',
            description: 'การจัดการข้อโต้แย้งและแนะนำไปสู่การตัดสินใจ',
            prompt:
              'ประเมินความสามารถของตัวแทนในการจัดการกับข้อโต้แย้งเรื่องราคา จัดการกับความกังวลเกี่ยวกับการเปรียบเทียบผลิตภัณฑ์และผลตอบแทน เอาชนะความลังเล และแนะนำลูกค้าเป้าหมายไปสู่การตัดสินใจโดยใช้เทคนิคการปิดการขายที่เหมาะสม',
          },
          {
            title: 'การปฏิบัติตามข้อกำหนดและกฎระเบียบ',
            description:
              'การปฏิบัติตามข้อกำหนดด้านกฎระเบียบและการเปิดเผยข้อมูลที่ถูกต้อง',
            prompt:
              'ประเมินว่าตัวแทนปฏิบัติตามข้อกำหนดด้านการปฏิบัติตามกฎระเบียบหรือไม่ รวมถึงการเปิดเผยข้อมูลผลิตภัณฑ์ที่เหมาะสม ใช้คำศัพท์ที่ได้รับอนุมัติ หลีกเลี่ยงการอ้างสิทธิ์ที่ต้องห้าม และรักษาการปฏิบัติการขายที่มีจริยธรรมตลอดการสนทนา',
          },
        ],
        technicalKnowledgeSections: [
          {
            title: 'การนำเสนอผลิตภัณฑ์',
            description:
              'ความเข้าใจคุณสมบัติและประโยชน์ของ WealthPlus Ready 90/8 และความสามารถในการวางตำแหน่งเป็นเครื่องมือวางแผนมรดก',
            prompt:
              'ประเมินความรู้เกี่ยวกับ WealthPlus Ready 90/8 รวมถึงผลตอบแทนเงินสดรายปี 10% ระยะเวลาชำระเบี้ย 8 ปี ความคุ้มครองจนถึงอายุ 90 ปี ผลประโยชน์กรณีเสียชีวิตที่เพิ่มขึ้น (100%-800%) โครงสร้างผลประโยชน์ครบกำหนด ข้อได้เปรียบด้านภาษี (ลดหย่อนได้สูงสุด 100,000 บาท) และว่าตัวแทนวางตำแหน่งเป็นเครื่องมือวางแผนมรดกและโซลูชันการถ่ายโอนความมั่งคั่งที่ปรับแต่งให้เหมาะกับความต้องการของลูกค้าเป้าหมายได้อย่างมีประสิทธิภาพแค่ไหน',
          },
        ],
      },
    },
  },
  // Great Eastern Scorecards
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000015'),
    friendlyId: 'great-eastern-fact-find-scorecard',
    name: 'Great Eastern Fact Finding Assessment',
    company: new Types.ObjectId(GREAT_EASTERN_COMPANY_ID),
    assessmentType: 'criteria',
    enabledAssessments: ['sales-technique', 'technical-knowledge'],
    salesTechniqueFramework: SalesFramework.THREE_F_MODEL,
    technicalKnowledgeVariant: 'general',
    scormPolicy: { enabled: true },
    salesTechniqueSections: [
      {
        title: 'Soft Skills (33%)',
        description:
          'Communication Skills, Relationship Building, Adaptability, Customer Orientation',
        prompt:
          'Evaluate Communication Skills (clear delivery, respectful communication, appropriate word choices), Relationship Building (rapport, patience with demanding clients), Adaptability (flexibility to customer concerns), Customer Orientation (focus on customer satisfaction and service).',
      },
      {
        title: 'Knowledge Skills (33%)',
        description: 'Verification, Fact Finding, Problem-Solving',
        prompt:
          'Verification: Agent must identify themselves and Great Eastern; execute Permission Check; gain prospect permission. Fact Finding: Life stage, cash flow & net worth, existing coverage, risk profile, CKA if recommending ILPs. Problem-Solving: Identify issues and find solutions.',
      },
      {
        title: 'Financial Planning (33%)',
        description:
          'Client needs understanding and conversation quality across all pillars',
        prompt:
          'Assess: (1) Understanding of client needs: Emergency fund (3-6 months), death/TPD (9x income), critical illness (4x), hospitalization, retirement, education, mortgage, legacy; (2) Client-centric approach, no material omissions, national schemes (MediShield Life, CareShield Life, DPS, CPF LIFE) referenced, transparency on commissions and limitations.',
      },
    ],
    technicalKnowledgeSections: [],
    localizations: {},
  },
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000016'),
    friendlyId: 'great-eastern-product-pitch-scorecard',
    name: 'Great Eastern Product Pitch Assessment',
    company: new Types.ObjectId(GREAT_EASTERN_COMPANY_ID),
    assessmentType: 'criteria',
    enabledAssessments: ['sales-technique', 'technical-knowledge'],
    salesTechniqueFramework: SalesFramework.THREE_F_MODEL,
    technicalKnowledgeVariant: 'general',
    scormPolicy: { enabled: true },
    salesTechniqueSections: [
      {
        title: 'Soft Skills',
        description:
          'Communication Skills, Relationship Building, Adaptability, Customer Orientation',
        prompt:
          'Evaluate Communication Skills, Relationship Building (rapport, patience), Adaptability, Customer Orientation.',
      },
      {
        title: 'Knowledge Skills',
        description:
          'Fact Finding, Problem-Solving, Sales & Negotiation, Compliance & Regulations',
        prompt:
          'Fact Finding: life stage, cash flow, existing coverage, risk profile, CKA. Problem-Solving: identify issues and solutions. Sales & Negotiation: close deals, listen to objections, probe motivations, resolve while maintaining rapport. Compliance: present as insurance not savings/FD; guaranteed vs non-guaranteed returns; no min/max on illustrated returns; no past performance guarantee; no bank comparison; explicit fees and clauses.',
      },
      {
        title: 'Product Pitch (100%)',
        description:
          'Understanding of product, features, benefits; alignment to customer profile',
        prompt:
          'Evaluate understanding of Great Wealth Advantage 4, features and benefits, and that the product solution is aligned to the customer profile.',
      },
    ],
    technicalKnowledgeSections: [],
    localizations: {},
  },
  {
    _id: new Types.ObjectId('62b3f6f6b3f6f60000000017'),
    friendlyId: 'great-eastern-post-sales-scorecard',
    name: 'Great Eastern Post Sale Service Assessment',
    company: new Types.ObjectId(GREAT_EASTERN_COMPANY_ID),
    assessmentType: 'criteria',
    enabledAssessments: ['sales-technique', 'technical-knowledge'],
    salesTechniqueFramework: SalesFramework.THREE_F_MODEL,
    technicalKnowledgeVariant: 'general',
    scormPolicy: { enabled: true },
    salesTechniqueSections: [
      {
        title: 'Soft Skills',
        description:
          'Communication Skills, Relationship Building, Adaptability, Customer Orientation',
        prompt:
          'Evaluate Communication Skills, Relationship Building, Adaptability, Customer Orientation.',
      },
      {
        title: 'Knowledge Skills',
        description:
          'Problem-Solving, Sales & Negotiation, Compliance & Regulations',
        prompt:
          'Problem-Solving: identify issues and solutions. Sales & Negotiation: listen to objections, probe motivations, resolve while maintaining rapport. Compliance: present as insurance not savings/FD; guaranteed vs non-guaranteed; no min/max on illustrated returns; no past performance guarantee; no bank comparison.',
      },
      {
        title: 'Product Review',
        description:
          'Technical details of product purchased; tailor to customer needs and objections',
        prompt:
          'Evaluate clear understanding of product features, benefits, and value proposition; how features solve customer problems; accurate product information; tailoring to customer needs and objections. Focus on sharing technical details of the product purchased, not pitching the product.',
      },
    ],
    technicalKnowledgeSections: [],
    localizations: {},
  },
];

/**
 * Get scorecards by company ID
 */
export function getScorecardsByCompany(
  companyId?: string,
): typeof ALL_SCORECARDS {
  if (!companyId) {
    return ALL_SCORECARDS.filter((scorecard: any) => !scorecard.company);
  }
  return ALL_SCORECARDS.filter(
    (scorecard: any) =>
      (typeof scorecard.company === 'string'
        ? scorecard.company
        : scorecard.company?._id) === companyId,
  );
}

/**
 * Get scorecard by assessment type
 */
export function getScorecardsByAssessmentType(
  assessmentType: string,
): typeof ALL_SCORECARDS {
  // Map assessment types to scorecards
  switch (assessmentType) {
    case 'prudential':
      return ALL_SCORECARDS.filter((s: any) =>
        typeof s.company === 'string' || s.company === null
          ? s.company === PRUDENTIAL_COMPANY_ID
          : s.company?._id === PRUDENTIAL_COMPANY_ID,
      );
    case 'msig':
      return ALL_SCORECARDS.filter(
        (s: any) =>
          (typeof s.company === 'string' ? s.company : s.company?._id) ===
            MSIG_COMPANY_ID && s.friendlyId === 'msig-telesales-scorecard',
      );
    case 'msig-3f':
      return ALL_SCORECARDS.filter((s: any) =>
        typeof s.company === 'string' || s.company === null
          ? s.company === MSIG_COMPANY_ID
          : s.company?._id === MSIG_COMPANY_ID &&
            s.friendlyId === 'msig-3f-scorecard',
      );
    default:
      return ALL_SCORECARDS.filter((s: any) => !s.company);
  }
}

/**
 * Get scorecard by ID
 */
export function getScorecardById(
  id: string,
): Omit<ScorecardDocument, 'createdAt' | 'updatedAt'> | undefined {
  return ALL_SCORECARDS.find((scorecard: any) => scorecard.friendlyId === id);
}
