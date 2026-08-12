import { FrameworkConfiguration } from './types.js';

/**
 * KT-AXA WealthPlus Close Call Framework
 * Used for evaluating followup close calls for WealthPlus Ready 90/8
 */
export const ktAxaWealthplusConfiguration: FrameworkConfiguration = {
  base: {
    id: 'kt-axa-wealthplus-framework',
    friendlyId: 'kt-axa-wealthplus',
    type: 'list',
  },

  localized: {
    en: {
      title: 'KT-AXA WealthPlus Close Call Framework',
      description:
        'Framework for evaluating sales technique and product knowledge during followup calls to close upsell opportunities for WealthPlus Ready 90/8.',
      parts: [
        {
          title: 'Soft Skills',
          description:
            'Evaluates communication and relationship-building abilities',
          items: [
            'Communication Skills: Clear delivery and respectful communication, good word choices that are not too technical',
            'Relationship Building: Building and maintaining rapport with the customer',
            'Adaptability: Flexibility in changing/understanding concerns',
            'Customer Orientation: Focus on customer satisfaction and service',
          ],
        },
        {
          title: 'Knowledge Skills',
          description:
            'Evaluates fact-finding, problem-solving, sales & negotiation skills, and compliance knowledge',
          items: [
            'Fact Finding: Ask all required information: Name, Age, Occupation, Annual Income, Financial Objectives',
            'Problem-Solving: Ability to identify issues and find solutions',
            'Sales & Negotiation Skills: Ability to close deals and negotiate effectively',
            'Compliance & Regulations: Knowledge of compliance and market conduct requirements',
          ],
        },
        {
          title: 'Product Knowledge',
          description:
            'Evaluates understanding of WealthPlus Ready 90/8 and ability to address client questions and objections',
          items: [
            'Product Pitch: Understanding of WealthPlus Ready 90/8 features and benefits, addressing objections, and closing the sale',
          ],
        },
      ],
    },

    th: {
      title: 'กรอบการประเมินการโทรปิดการขาย WealthPlus',
      description:
        'กรอบสำหรับประเมินเทคนิคการขายและความรู้ผลิตภัณฑ์ในการโทรติดตามเพื่อปิดการขาย WealthPlus Ready 90/8',
      parts: [
        {
          title: 'ทักษะด้านความนุ่มนวล',
          description: 'ประเมินความสามารถในการสื่อสารและสร้างความสัมพันธ์',
          items: [
            'ทักษะการสื่อสาร: การนำเสนอที่ชัดเจนและการสื่อสารที่สุภาพ การเลือกใช้คำที่ไม่ซับซ้อนเกินไป',
            'การสร้างความสัมพันธ์: การสร้างและรักษาความสัมพันธ์ที่ดีกับลูกค้า',
            'ความสามารถในการปรับตัว: ความยืดหยุ่นในการเปลี่ยนแปลง/เข้าใจความกังวล',
            'การมุ่งเน้นลูกค้า: มุ่งเน้นความพึงพอใจและการบริการลูกค้า',
          ],
        },
        {
          title: 'ทักษะด้านความรู้',
          description:
            'ประเมินการค้นหาข้อมูล การแก้ปัญหา ทักษะการขายและการเจรจา และความรู้ด้านการปฏิบัติตามกฎระเบียบ',
          items: [
            'การค้นหาข้อมูล: สอบถามข้อมูลที่จำเป็นทั้งหมด: ชื่อ อายุ อาชีพ รายได้ต่อปี วัตถุประสงค์ทางการเงิน',
            'การแก้ปัญหา: ความสามารถในการระบุปัญหาและหาทางแก้ไข',
            'ทักษะการขายและการเจรจา: ความสามารถในการปิดการขายและเจรจาอย่างมีประสิทธิภาพ',
            'การปฏิบัติตามกฎระเบียบและข้อกำหนด: ความรู้เกี่ยวกับการปฏิบัติตามกฎระเบียบและจรรยาบรรณตลาด',
          ],
        },
        {
          title: 'ความรู้ผลิตภัณฑ์',
          description:
            'ประเมินความเข้าใจใน WealthPlus Ready 90/8 และความสามารถในการตอบคำถามและจัดการข้อโต้แย้งของลูกค้า',
          items: [
            'การนำเสนอผลิตภัณฑ์: ความเข้าใจในคุณสมบัติและสิทธิประโยชน์ของ WealthPlus Ready 90/8 การจัดการข้อโต้แย้ง และการปิดการขาย',
          ],
        },
      ],
    },
  },
};
