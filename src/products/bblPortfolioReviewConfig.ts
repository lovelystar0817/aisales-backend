import { ProductConfiguration } from './types.js';

/**
 * BBL Portfolio Review Configuration - Localized content for Bangkok Bank Portfolio Review Services
 */
export const bblPortfolioReviewConfiguration: ProductConfiguration = {
  base: {
    id: 'bbl-portfolio-review',
    friendlyId: 'bbl-portfolio-review',
    category: 'business-services',
  },

  localized: {
    // English
    en: {
      name: 'Portfolio Review Services',
      keyFeatures: [
        'Comprehensive performance analysis',
        'Market impact assessment',
        'Portfolio rebalancing recommendations',
        'Risk-adjusted optimization strategies',
      ],
      featureHighlight: {
        title: 'Strategic Portfolio Review',
        description:
          'Optimize your investment portfolio with expert analysis, market insights, and tailored rebalancing solutions aligned to your goals.',
      },
      evaluationFocus: [
        'Reviewing portfolio performance effectively',
        'Linking recommendations to market conditions',
        'Identifying gaps and rebalancing opportunities',
        'Creating urgency for portfolio adjustments',
      ],
    },

    // Thai
    th: {
      name: 'บริการทบทวนพอร์ตการลงทุน',
      keyFeatures: [
        'การวิเคราะห์ผลการดำเนินงานอย่างครอบคลุม',
        'การประเมินผลกระทบของตลาด',
        'คำแนะนำการปรับสมดุลพอร์ต',
        'กลยุทธ์การปรับแต่งที่คำนึงถึงความเสี่ยง',
      ],
      featureHighlight: {
        title: 'การทบทวนพอร์ตการลงทุนเชิงกลยุทธ์',
        description:
          'เพิ่มประสิทธิภาพพอร์ตการลงทุนของคุณด้วยการวิเคราะห์จากผู้เชี่ยวชาญ ข้อมูลเชิงลึกของตลาด และโซลูชันการปรับสมดุลที่ปรับแต่งตามเป้าหมายของคุณ',
      },
      evaluationFocus: [
        'ทบทวนผลการดำเนินงานของพอร์ตอย่างมีประสิทธิภาพ',
        'เชื่อมโยงคำแนะนำกับสภาวะตลาด',
        'ระบุช่องว่างและโอกาสในการปรับสมดุล',
        'สร้างความเร่งด่วนในการปรับพอร์ต',
      ],
    },
  },
};
