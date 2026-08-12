import { ProductConfiguration } from './types.js';

/**
 * KT-AXA Advisor Program
 * Company Financing program for new agents with 15,000 THB monthly CF
 */
export const ktAxaAdvisorConfiguration: ProductConfiguration = {
  base: {
    id: 'kt-axa-advisor',
    friendlyId: 'kt-axa-advisor',
    category: 'all',
  },

  localized: {
    // English
    en: {
      name: 'KT-AXA Advisor',
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
          'KT-AXA Advisor — Jumpstart your insurance career with 15,000 THB monthly support and a structured 10-month development program',
        description:
          'The KT-AXA Advisor program provides new agents with 15,000 THB monthly Company Financing, comprehensive hybrid training (classroom + online), success bonuses at Month 5 and Month 10, and a 10-year Career Achievement Bonus pathway worth up to 10,000,000 THB. Designed for motivated individuals ready to build a professional career in financial advisory.',
      },
      evaluationFocus: ['Soft Skills', 'Knowledge Skills'],
      callCriteria: {
        title: 'KT-AXA Advisor Recruitment Scorecard',
        description: 'You will be evaluated on two key areas:',
        criteria: [
          'Soft Skills: Communication Skills, Relationship Building, Adaptability, and Customer Orientation',
          'Knowledge Skills: Fact Finding, Business Knowledge, Problem-Solving, Sales & Negotiation Skills, and KT-AXA Advisor Program Knowledge',
        ],
      },
    },

    // Thai
    th: {
      name: 'KT-AXA Advisor',
      keyFeatures: [
        'เงินสนับสนุนรายเดือน (CF) 15,000 บาท',
        'โปรแกรมที่มีโครงสร้าง 10 เดือน',
        'โบนัสความสำเร็จเดือนที่ 5 และเดือนที่ 10',
        'โบนัสผลงานเกินเป้า (OAB) สูงสุด 25%',
        'โปรแกรมฝึกอบรมแบบไฮบริด 29 วัน',
        'โบนัสความสำเร็จในอาชีพสูงสุด 10,000,000 บาท ใน 10 ปี',
        'Welcome Pack และของขวัญส่วนบุคคล',
        'ชุดสูทสำเร็จการศึกษาเมื่อจบโปรแกรม',
        'เส้นทางอาชีพที่ชัดเจน: ตัวแทน → DM → MM → GA',
      ],
      featureHighlight: {
        title:
          'KT-AXA Advisor — เริ่มต้นอาชีพประกันภัยด้วยเงินสนับสนุนรายเดือน 15,000 บาท และโปรแกรมพัฒนา 10 เดือน',
        description:
          'โปรแกรม KT-AXA Advisor มอบเงินสนับสนุนรายเดือน (CF) 15,000 บาท การฝึกอบรมแบบไฮบริดที่ครอบคลุม (ห้องเรียน + ออนไลน์) โบนัสความสำเร็จเดือนที่ 5 และเดือนที่ 10 และเส้นทางโบนัสความสำเร็จในอาชีพ 10 ปี มูลค่าสูงสุด 10,000,000 บาท ออกแบบมาสำหรับผู้ที่มีแรงจูงใจพร้อมสร้างอาชีพมืออาชีพในด้านที่ปรึกษาทางการเงิน',
      },
      evaluationFocus: ['ทักษะด้านอ่อน', 'ทักษะด้านความรู้'],
      callCriteria: {
        title: 'บัตรคะแนนการสรรหา KT-AXA Advisor',
        description: 'คุณจะได้รับการประเมินในสองด้านหลัก:',
        criteria: [
          'ทักษะด้านอ่อน: ทักษะการสื่อสาร การสร้างความสัมพันธ์ ความสามารถในการปรับตัว และการมุ่งเน้นลูกค้า',
          'ทักษะด้านความรู้: การค้นหาข้อมูล ความรู้ทางธุรกิจ การแก้ปัญหา ทักษะการขายและการเจรจา และความรู้เกี่ยวกับโปรแกรม KT-AXA Advisor',
        ],
      },
    },
  },
};
