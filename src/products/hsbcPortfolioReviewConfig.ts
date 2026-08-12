import { ProductConfiguration } from './types.js';

/**
 * HSBC Portfolio Review Configuration - Localized content for HSBC Portfolio Review Services
 * Includes Dual Currency Note (DCN) product knowledge
 */
export const hsbcPortfolioReviewConfiguration: ProductConfiguration = {
  base: {
    id: 'hsbc-portfolio-review',
    friendlyId: 'hsbc-portfolio-review',
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
      markdown: `# Dual Currency Note
Structured investment linked to USD/THB exchange rate, issued by Bangkok Bank (AAA rated).
Fixed interest rate (typically 8% p.a.) and short maturity (1-3 months typical).

**⚠️ Key Risks:**
- **No principal protection** - can lose up to 100% of investment
- **NOT a deposit** - not covered by deposit insurance
- Currency conversion risk based on spot rate at maturity

### USD
- Invest in USD, receive fixed interest in USD
- If USD/THB rate stays below strike price: principal returned in USD (no conversion)
- If USD/THB rate rises above strike price: principal converted to THB (currency risk - may lose value if THB weakens)
- Example: USD 100,000 at 35.00 strike → if rate hits 36.00, get THB 3.5M back (worth only ~USD 97,222 = 2.8% loss)

### THB
- Invest in THB, receive fixed interest in THB
- If USD/THB rate stays above strike price: principal returned in THB (no conversion)
- If USD/THB rate falls below strike price: principal converted to USD (currency risk - may lose value if THB strengthens)
- Example: THB 3.5M at 35.00 strike → if rate drops to 34.00, get USD 100,000 back (worth only THB 3.4M = 2.9% loss)`,
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
      markdown: `# ตราสารหนี้สองสกุลเงิน (Dual Currency Note)
ผลิตภัณฑ์การลงทุนแบบมีโครงสร้างเชื่อมโยงกับอัตราแลกเปลี่ยน USD/THB, ออกโดยธนาคารกรุงเทพ (อันดับ AAA).
อัตราดอกเบี้ยคงที่ (โดยทั่วไป 8% ต่อปี) และอายุสั้น (โดยทั่วไป 1-3 เดือน).

**⚠️ ความเสี่ยงสำคัญ:**
- **ไม่มีการคุ้มครองเงินต้น** - อาจขาดทุนได้ถึง 100% ของเงินลงทุน
- **ไม่ใช่เงินฝาก** - ไม่ได้รับความคุ้มครองจากสถาบันคุ้มครองเงินฝาก
- มีความเสี่ยงจากการแปลงสกุลเงินตามอัตราแลกเปลี่ยน ณ วันครบกำหนด

### รูปแบบ USD
- ลงทุนใน USD รับดอกเบี้ยคงที่ใน USD
- หากอัตรา USD/THB อยู่ต่ำกว่าราคาใช้สิทธิ: คืนเงินต้นเป็น USD (ไม่มีการแปลงสกุล)
- หากอัตรา USD/THB สูงกว่าราคาใช้สิทธิ: เงินต้นแปลงเป็น THB (มีความเสี่ยงด้านสกุลเงิน - อาจขาดทุนหาก THB อ่อนค่า)
- ตัวอย่าง: USD 100,000 ที่ราคาใช้สิทธิ 35.00 → หากอัตราขึ้นไปถึง 36.00 จะได้ 3.5 ล้านบาทคืน (มีค่าเพียง ~USD 97,222 = ขาดทุน 2.8%)

### รูปแบบ THB
- ลงทุนใน THB รับดอกเบี้ยคงที่ใน THB
- หากอัตรา USD/THB อยู่สูงกว่าราคาใช้สิทธิ: คืนเงินต้นเป็น THB (ไม่มีการแปลงสกุล)
- หากอัตรา USD/THB ต่ำกว่าราคาใช้สิทธิ: เงินต้นแปลงเป็น USD (มีความเสี่ยงด้านสกุลเงิน - อาจขาดทุนหาก THB แข็งค่า)
- ตัวอย่าง: 3.5 ล้านบาท ที่ราคาใช้สิทธิ 35.00 → หากอัตราลงไปถึง 34.00 จะได้ USD 100,000 คืน (มีค่าเพียง 3.4 ล้านบาท = ขาดทุน 2.9%)`,
    },
  },
};
