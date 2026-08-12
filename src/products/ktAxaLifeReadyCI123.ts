import { ProductConfiguration } from './types.js';

/**
 * KT-AXA Life Ready + CI 123
 * Whole life insurance with critical illness coverage
 */
export const ktAxaLifeReadyCI123Configuration: ProductConfiguration = {
  base: {
    id: 'kt-axa-life-ready-ci123',
    friendlyId: 'kt-axa-life-ready-ci123',
    category: 'insurance',
  },

  localized: {
    // English
    en: {
      name: 'Life Ready with addon CI123',
      keyFeatures: [
        'Whole Life Protection until Age 99',
        'Flexible Payment Terms (6, 12, 18 years or until 99)',
        'Coverage for 123 Critical Illnesses',
        'Pre-Early Stage Detection Coverage',
        'Lump Sum Payout upon Diagnosis',
        'Premium Waiver After Claim',
        'Tax Deductible Premiums',
        'Critical Care Benefit (ICU/ECMO coverage)',
        'Emerging Disease & Pandemic Coverage',
      ],
      featureHighlight: {
        title:
          'Comprehensive life and critical illness protection with lump-sum payout',
        description:
          'Life Ready + CI 123 combines whole life protection with comprehensive critical illness coverage for 123 conditions. Get a lump-sum payout upon diagnosis to use for treatment, income replacement, or any purpose - providing financial security when you need it most.',
      },
      evaluationFocus: ['Sales Technique', 'Product Knowledge'],
      callCriteria: {
        title: 'FNA & Product Pitch Scorecard',
        description: 'You will be evaluated on two key areas:',
        criteria: [
          'Sales Technique: Communication Skills, Adaptability, Customer Orientation, and Fact Finding',
          'Product Knowledge: Understanding of Life Ready and CI 123 features and providing solutions aligned with customer profile',
        ],
      },
    },

    // Thai
    th: {
      name: 'ไลฟ์เรดดี้ พร้อมสัญญาเพิ่มเติม CI123',
      keyFeatures: [
        'ความคุ้มครองตลอดชีพจนถึงอายุ 99 ปี',
        'ระยะเวลาชำระเบี้ยที่ยืดหยุ่น (6, 12, 18 ปี หรือจนถึงอายุ 99 ปี)',
        'ความคุ้มครองโรคร้ายแรง 123 โรค',
        'ความคุ้มครองการตรวจพบขั้นต้น',
        'จ่ายเงินก้อนเมื่อได้รับการวินิจฉัย',
        'ยกเว้นเบี้ยประกันหลังการเคลม',
        'เบี้ยประกันหักลดหย่อนภาษีได้',
        'ผลประโยชน์การดูแลผู้ป่วยหนัก (ความคุ้มครอง ICU/ECMO)',
        'ความคุ้มครองโรคอุบัติใหม่และโรคระบาด',
      ],
      featureHighlight: {
        title: 'ความคุ้มครองชีวิตและโรคร้ายแรงที่ครอบคลุมพร้อมการจ่ายเงินก้อน',
        description:
          'Life Ready + CI 123 รวมความคุ้มครองตลอดชีพกับความคุ้มครองโรคร้ายแรงที่ครอบคลุม 123 เงื่อนไข รับเงินก้อนเมื่อได้รับการวินิจฉัยเพื่อใช้สำหรับการรักษา การทดแทนรายได้ หรือวัตถุประสงค์ใดๆ - ให้ความมั่นคงทางการเงินเมื่อคุณต้องการมากที่สุด',
      },
      evaluationFocus: ['เทคนิคการขาย', 'ความรู้ผลิตภัณฑ์'],
      callCriteria: {
        title: 'บัตรคะแนน FNA และนำเสนอผลิตภัณฑ์',
        description: 'คุณจะได้รับการประเมินในสองด้านหลัก:',
        criteria: [
          'เทคนิคการขาย: ทักษะการสื่อสาร ความสามารถในการปรับตัว การมุ่งเน้นลูกค้า และการค้นหาข้อมูล',
          'ความรู้ผลิตภัณฑ์: ความเข้าใจในคุณสมบัติของ Life Ready และ CI 123 และการนำเสนอโซลูชันที่สอดคล้องกับโปรไฟล์ลูกค้า',
        ],
      },
    },
  },
};
