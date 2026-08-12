import { ProductConfiguration } from './types.js';

/**
 * KT-AXA WealthPlus Ready 90/8
 * Whole life savings plan with guaranteed returns
 */
export const ktAxaWealthPlusReadyConfiguration: ProductConfiguration = {
  base: {
    id: 'kt-axa-wealthplus-ready',
    friendlyId: 'kt-axa-wealthplus-ready',
    category: 'insurance',
  },

  localized: {
    // English
    en: {
      name: 'WealthPlus Ready 90/8',
      keyFeatures: [
        '10% Annual Cash Return from Year 1',
        '8-Year Premium Payment Term',
        'Coverage Until Age 90',
        'Death Benefit Escalating from 100%-800%',
        'Additional 100% Accidental Death Benefit',
        'Premium Waiver for Total Permanent Disability',
        'Maturity Benefit of 800% at Age 90',
        'Total Returns ~1,290% of Sum Insured',
        'IRR ~1.66% per year',
        'Tax Deduction up to 100,000 THB/year',
        'Simple Underwriting (3 Health Questions Only)',
      ],
      featureHighlight: {
        title:
          'Guaranteed passive income with life protection and tax benefits',
        description:
          'WealthPlus Ready 90/8 provides guaranteed 10% annual cash return from year 1, escalating death benefit up to 800%, and maturity benefit of 800% at age 90. Pay premiums for only 8 years and enjoy tax deduction up to 100,000 THB/year. Total returns of approximately 1,290% with simple 3-question underwriting.',
      },
      evaluationFocus: ['Soft Skills', 'Knowledge Skills', 'Product Knowledge'],
      callCriteria: {
        title: 'WealthPlus Close Call Scorecard',
        description: 'You will be evaluated on three key areas:',
        criteria: [
          'Soft Skills: Communication Skills, Relationship Building, Adaptability, and Customer Orientation',
          'Knowledge Skills: Fact Finding, Problem-Solving, Sales & Negotiation Skills, and Compliance & Regulations',
          'Product Knowledge: Understanding of WealthPlus Ready 90/8 features and benefits, addressing objections, and closing the sale',
        ],
      },
    },

    // Thai
    th: {
      name: 'เวลท์พลัส เรดดี้ 90/8',
      keyFeatures: [
        'ผลตอบแทนเงินสดรายปี 10% ตั้งแต่ปีแรก',
        'ระยะเวลาชำระเบี้ย 8 ปี',
        'ความคุ้มครองจนถึงอายุ 90 ปี',
        'ผลประโยชน์กรณีเสียชีวิตที่เพิ่มขึ้นจาก 100%-800%',
        'ผลประโยชน์กรณีเสียชีวิตจากอุบัติเหตุเพิ่มเติม 100%',
        'ยกเว้นเบี้ยประกันสำหรับความพิการถาวรสิ้นเชิง',
        'ผลประโยชน์ครบกำหนด 800% ที่อายุ 90 ปี',
        'ผลตอบแทนรวม ~1,290% ของทุนประกัน',
        'IRR ~1.66% ต่อปี',
        'หักลดหย่อนภาษีสูงสุด 100,000 บาท/ปี',
        'การรับประกันภัยง่าย (เพียง 3 คำถามเกี่ยวกับสุขภาพ)',
      ],
      featureHighlight: {
        title:
          'รายได้แบบ Passive ที่รับประกันพร้อมความคุ้มครองชีวิตและสิทธิประโยชน์ทางภาษี',
        description:
          'WealthPlus Ready 90/8 ให้ผลตอบแทนเงินสดรายปี 10% ที่รับประกันตั้งแต่ปีแรก ผลประโยชน์กรณีเสียชีวิตที่เพิ่มขึ้นถึง 800% และผลประโยชน์ครบกำหนด 800% ที่อายุ 90 ปี ชำระเบี้ยเพียง 8 ปีและเพลิดเพลินกับการหักลดหย่อนภาษีสูงสุด 100,000 บาท/ปี ผลตอบแทนรวมประมาณ 1,290% พร้อมการรับประกันภัยที่ง่ายด้วยคำถาม 3 ข้อ',
      },
      evaluationFocus: [
        'ทักษะด้านอ่อน',
        'ทักษะด้านความรู้',
        'ความรู้ผลิตภัณฑ์',
      ],
      callCriteria: {
        title: 'บัตรคะแนนการปิดการขาย WealthPlus',
        description: 'คุณจะได้รับการประเมินในสามด้านหลัก:',
        criteria: [
          'ทักษะด้านอ่อน: ทักษะการสื่อสาร การสร้างความสัมพันธ์ ความสามารถในการปรับตัว และการมุ่งเน้นลูกค้า',
          'ทักษะด้านความรู้: การค้นหาข้อมูล การแก้ปัญหา ทักษะการขายและการเจรจา และการปฏิบัติตามกฎระเบียบ',
          'ความรู้ผลิตภัณฑ์: ความเข้าใจในคุณสมบัติและสิทธิประโยชน์ของ WealthPlus Ready 90/8 การจัดการข้อโต้แย้ง และการปิดการขาย',
        ],
      },
    },
  },
};
