import { FrameworkConfiguration } from './types.js';

/**
 * KT AXA Recruitment Framework Configuration
 * Used for evaluating agent recruitment conversations
 */
export const ktAxaRecruitmentConfiguration: FrameworkConfiguration = {
  base: {
    id: 'kt-axa-recruitment-framework',
    friendlyId: 'kt-axa-recruitment',
    type: 'list',
  },

  localized: {
    en: {
      title: 'KT AXA Agent Recruitment Framework',
      description:
        'Framework for evaluating soft skills and knowledge skills in agent recruitment conversations for Krungthai-AXA Life Insurance.',
      parts: [
        {
          title: 'Soft Skills',
          description: 'Evaluates interpersonal and communication abilities',
          items: [
            'Communication Skills: Clear delivery and respectful communication to the new recruit',
            'Relationship Building: Building and maintaining rapport with the candidate/new recruit',
            'Adaptability: Flexibility in changing/understanding the concerns of the recruit',
            'Customer Orientation: Able to provide a clear convincing presentation about the Company and the business',
          ],
        },
        {
          title: 'Knowledge Skills',
          description:
            'Evaluates business knowledge, problem-solving, and KT-AXA understanding',
          items: [
            'Fact Finding: Knows all the basic requirements in becoming part of the business such as Legal and Compliance',
            'Business Knowledge: Provided a deep understanding of the remuneration available for distributors (e.g., Commission/Salary, contests, rewards and benefits)',
            'Problem-Solving: Ability to identify issues and provide solutions',
            'Sales & Negotiation Skills: Ability to convince and negotiate effectively with the new recruit',
            'KT-AXA Company Knowledge: Knowledge of KT-AXA products, services, training programs, and career opportunities',
          ],
        },
      ],
    },

    th: {
      title: 'กรอบการสรรหาตัวแทน KT AXA',
      description:
        'กรอบสำหรับประเมินทักษะด้านอ่อนและทักษะความรู้ในการสนทนาสรรหาตัวแทนสำหรับกรุงไทย-แอกซ่า ประกันชีวิต',
      parts: [
        {
          title: 'ทักษะด้านอ่อน',
          description: 'ประเมินความสามารถด้านมนุษยสัมพันธ์และการสื่อสาร',
          items: [
            'ทักษะการสื่อสาร: การนำเสนอที่ชัดเจนและการสื่อสารที่เคารพต่อผู้สมัครใหม่',
            'การสร้างความสัมพันธ์: การสร้างและรักษาความสัมพันธ์กับผู้สมัคร/ผู้สมัครใหม่',
            'ความสามารถในการปรับตัว: ความยืดหยุ่นในการเปลี่ยนแปลง/เข้าใจความกังวลของผู้สมัคร',
            'การมุ่งเน้นลูกค้า: สามารถนำเสนอข้อมูลบริษัทและธุรกิจอย่างชัดเจนและน่าเชื่อถือ',
          ],
        },
        {
          title: 'ทักษะความรู้',
          description:
            'ประเมินความรู้ทางธุรกิจ การแก้ปัญหา และความเข้าใจเกี่ยวกับ KT-AXA',
          items: [
            'การค้นหาข้อมูล: รู้ข้อกำหนดพื้นฐานทั้งหมดในการเป็นส่วนหนึ่งของธุรกิจ เช่น กฎหมายและการปฏิบัติตามกฎระเบียบ',
            'ความรู้ทางธุรกิจ: ให้ความเข้าใจลึกซึ้งเกี่ยวกับค่าตอบแทนสำหรับตัวแทน (เช่น ค่าคอมมิชชัน/เงินเดือน การแข่งขัน รางวัลและสิทธิประโยชน์)',
            'การแก้ปัญหา: ความสามารถในการระบุปัญหาและเสนอวิธีแก้ไข',
            'ทักษะการขายและการเจรจา: ความสามารถในการโน้มน้าวและเจรจาอย่างมีประสิทธิภาพกับผู้สมัครใหม่',
            'ความรู้เกี่ยวกับบริษัท KT-AXA: ความรู้เกี่ยวกับผลิตภัณฑ์ บริการ โปรแกรมการฝึกอบรม และโอกาสในอาชีพของ KT-AXA',
          ],
        },
      ],
    },
  },
};
