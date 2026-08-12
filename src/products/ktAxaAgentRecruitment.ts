import { ProductConfiguration } from './types.js';

/**
 * KT-AXA Agent Recruitment
 * Career opportunity presentation for prospective insurance agents
 */
export const ktAxaAgentRecruitmentConfiguration: ProductConfiguration = {
  base: {
    id: 'kt-axa-agent-recruitment',
    friendlyId: 'kt-axa-agent-recruitment',
    category: 'all',
  },

  localized: {
    // English
    en: {
      name: 'KT-AXA Agent Recruitment',
      keyFeatures: [
        'Unlimited Income Potential',
        'Flexible Work Schedule',
        'Comprehensive 6-Month Training (AXA Prime Blue)',
        'Digital Tools Support (AdvisorZone, My Wealth+, iPro)',
        'Clear Career Progression Path',
        'Commission + Bonuses Structure',
        'Global AXA Brand Recognition',
        'Continuous Mentorship & Coaching',
      ],
      featureHighlight: {
        title:
          'Join KT-AXA as a Financial Advisor - Unlimited income potential with comprehensive training and career growth',
        description:
          'Krungthai-AXA offers a rewarding career as a life insurance agent with unlimited earning potential, flexible work arrangements, comprehensive 6-month training program, digital tools, and clear career progression from Agent to Agency Director.',
      },
      evaluationFocus: ['Soft Skills', 'Knowledge Skills'],
      callCriteria: {
        title: 'KT-AXA Agent Recruitment Scorecard',
        description: 'You will be evaluated on two key areas:',
        criteria: [
          'Soft Skills: Communication Skills, Relationship Building, Adaptability, and Customer Orientation',
          'Knowledge Skills: Fact Finding, Business Knowledge, Problem-Solving, Sales & Negotiation Skills, and KT-AXA Company Knowledge',
        ],
      },
    },

    // Thai
    th: {
      name: 'การสรรหาตัวแทน KT-AXA',
      keyFeatures: [
        'ศักยภาพรายได้ไม่จำกัด',
        'ตารางการทำงานที่ยืดหยุ่น',
        'การฝึกอบรมที่ครอบคลุม 6 เดือน (AXA Prime Blue)',
        'การสนับสนุนเครื่องมือดิจิทัล (AdvisorZone, My Wealth+, iPro)',
        'เส้นทางความก้าวหน้าในอาชีพที่ชัดเจน',
        'โครงสร้างค่าคอมมิชชัน + โบนัส',
        'การยอมรับแบรนด์ AXA ระดับโลก',
        'การให้คำปรึกษาและการโค้ชอย่างต่อเนื่อง',
      ],
      featureHighlight: {
        title:
          'เข้าร่วม KT-AXA ในฐานะที่ปรึกษาทางการเงิน - ศักยภาพรายได้ไม่จำกัดพร้อมการฝึกอบรมที่ครอบคลุมและการเติบโตในอาชีพ',
        description:
          'กรุงไทย-แอกซ่า เสนออาชีพที่คุ้มค่าในฐานะตัวแทนประกันชีวิต พร้อมศักยภาพการหารายได้ไม่จำกัด การจัดการทำงานที่ยืดหยุ่น โปรแกรมฝึกอบรมที่ครอบคลุม 6 เดือน เครื่องมือดิจิทัล และเส้นทางความก้าวหน้าในอาชีพที่ชัดเจนจากตัวแทนสู่ผู้อำนวยการเอเจนซี่',
      },
      evaluationFocus: ['ทักษะด้านอ่อน', 'ทักษะด้านความรู้'],
      callCriteria: {
        title: 'บัตรคะแนนการสรรหาตัวแทน KT-AXA',
        description: 'คุณจะได้รับการประเมินในสองด้านหลัก:',
        criteria: [
          'ทักษะด้านอ่อน: ทักษะการสื่อสาร การสร้างความสัมพันธ์ ความสามารถในการปรับตัว และการมุ่งเน้นลูกค้า',
          'ทักษะด้านความรู้: การค้นหาข้อมูล ความรู้ทางธุรกิจ การแก้ปัญหา ทักษะการขายและการเจรจา และความรู้เกี่ยวกับบริษัท KT-AXA',
        ],
      },
    },
  },
};
