import { ProductConfiguration } from './types.js';

/**
 * KT-AXA Advisor X Program
 * Premium Company Financing program for experienced agents with 30,000 THB monthly CF
 */
export const ktAxaAdvisorXConfiguration: ProductConfiguration = {
  base: {
    id: 'kt-axa-advisor-x',
    friendlyId: 'kt-axa-advisor-x',
    category: 'all',
  },

  localized: {
    // English
    en: {
      name: 'KT-AXA Advisor X',
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
          'KT-AXA Advisor X — Premium 30,000 THB monthly support for high-potential agents with an accelerated career path',
        description:
          'The KT-AXA Advisor X program is the premium tier offering 30,000 THB monthly Company Financing for agents with at least 2 years of work experience. Features include a rigorous 4-panel interview, higher OAB rates at 30%, comprehensive hybrid training, and the same 10-year Career Achievement Bonus pathway worth up to 10,000,000 THB. Ideal for experienced professionals transitioning into financial advisory.',
      },
      evaluationFocus: ['Soft Skills', 'Knowledge Skills'],
      callCriteria: {
        title: 'KT-AXA Advisor X Recruitment Scorecard',
        description: 'You will be evaluated on two key areas:',
        criteria: [
          'Soft Skills: Communication Skills, Relationship Building, Adaptability, and Customer Orientation',
          'Knowledge Skills: Fact Finding, Business Knowledge, Problem-Solving, Sales & Negotiation Skills, and KT-AXA Advisor X Program Knowledge',
        ],
      },
    },

    // Thai
    th: {
      name: 'KT-AXA Advisor X',
      keyFeatures: [
        'เงินสนับสนุนรายเดือน (CF) 30,000 บาท',
        'โปรแกรมที่มีโครงสร้าง 10 เดือน',
        'โบนัสความสำเร็จเดือนที่ 5 และเดือนที่ 10',
        'โบนัสผลงานเกินเป้า (OAB) 30%',
        'โปรแกรมฝึกอบรมแบบไฮบริด 29 วัน',
        'โบนัสความสำเร็จในอาชีพสูงสุด 10,000,000 บาท ใน 10 ปี',
        'Welcome Pack และของขวัญส่วนบุคคล',
        'ชุดสูทสำเร็จการศึกษาเมื่อจบโปรแกรม',
        'การสัมภาษณ์โดยคณะกรรมการ 4 ฝ่ายเพื่อคัดเลือกพิเศษ',
        'เส้นทางอาชีพที่ชัดเจน: ตัวแทน → DM → MM → GA',
      ],
      featureHighlight: {
        title:
          'KT-AXA Advisor X — เงินสนับสนุนรายเดือนระดับพรีเมียม 30,000 บาท สำหรับตัวแทนที่มีศักยภาพสูงพร้อมเส้นทางอาชีพแบบเร่งรัด',
        description:
          'โปรแกรม KT-AXA Advisor X เป็นระดับพรีเมียมที่มอบเงินสนับสนุนรายเดือน (CF) 30,000 บาท สำหรับตัวแทนที่มีประสบการณ์ทำงานอย่างน้อย 2 ปี มีการสัมภาษณ์โดยคณะกรรมการ 4 ฝ่าย อัตรา OAB ที่สูงขึ้น 30% การฝึกอบรมแบบไฮบริดที่ครอบคลุม และเส้นทางโบนัสความสำเร็จในอาชีพ 10 ปี มูลค่าสูงสุด 10,000,000 บาท เหมาะสำหรับผู้เชี่ยวชาญที่มีประสบการณ์และต้องการเปลี่ยนสายอาชีพมาเป็นที่ปรึกษาทางการเงิน',
      },
      evaluationFocus: ['ทักษะด้านอ่อน', 'ทักษะด้านความรู้'],
      callCriteria: {
        title: 'บัตรคะแนนการสรรหา KT-AXA Advisor X',
        description: 'คุณจะได้รับการประเมินในสองด้านหลัก:',
        criteria: [
          'ทักษะด้านอ่อน: ทักษะการสื่อสาร การสร้างความสัมพันธ์ ความสามารถในการปรับตัว และการมุ่งเน้นลูกค้า',
          'ทักษะด้านความรู้: การค้นหาข้อมูล ความรู้ทางธุรกิจ การแก้ปัญหา ทักษะการขายและการเจรจา และความรู้เกี่ยวกับโปรแกรม KT-AXA Advisor X',
        ],
      },
    },
  },
};
