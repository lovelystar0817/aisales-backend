import { ModuleProcessReferenceConfiguration } from './types.js';

// Bank Process Reference configuration with co-located translations
export const bblProcessReferenceConfiguration: ModuleProcessReferenceConfiguration =
  {
    base: {
      id: 'bbl',
      company: 'bbl',
    },

    modules: {
      // Client Upgrade Process
      'bbl-client-upgrade': {
        base: {
          id: 'bbl-client-upgrade',
          company: 'bbl',
          moduleId: 'bbl-client-upgrade',
        },
        localized: {
          // English (Original)
          en: {
            title: 'Client Upgrade Onboarding',
            description:
              'Structured approach for upgrading existing clients to Wealth services',
            steps: [
              {
                title: '1. Greeting & Context Setting',
                items: [],
                markdown: `- Greet the client warmly and inform them of their upgrade status`,
              },
              {
                title: '2. Introduction to New Status & Offerings',
                items: [],
                markdown: `- Express gratitude for their continued use of bank services and connect to various investments the client has made, or reasons that led to the client's upgrade
- Explain the additional overall privileges the client will receive
- Mention the privileges that are most likely to align with the client's interests`,
              },
              {
                title: '3. Client Information Update',
                items: [],
                markdown: `- Request to collect additional current information about the client's financial situation, goals, and needs, which will help provide better service
- Show understanding and connect Wealth services and privileges to match the additional information received`,
              },
              {
                title: '4. Agree on Next Steps',
                items: [],
                markdown: `- Request consent for managing services on behalf of the client (product execution consent form)
- Summarize the conversation
- Schedule follow-up for additional services the client is interested in, to discuss in more detail
- Express appreciation for the trust the client has always placed in us`,
              },
            ],
          },

          // Thai
          th: {
            title: 'การเชิญลูกค้าเข้าสู่บริการใหม่',
            description: 'แนวทางการอัพเกรดลูกค้าเดิมเข้าสู่บริการ Wealth',
            steps: [
              {
                title: '1. การทักทายและการสร้างบริบท',
                items: [],
                markdown: `- ทักทายลูกค้าอย่างอบอุ่นและแจ้งสถานะอัพเกรด`,
              },
              {
                title: '2. การแนะนำสถานะและข้อเสนอใหม่',
                items: [],
                markdown: `- แสดงความขอบคุณที่ใช้บริการธนาคารอย่างต่อเนื่องและพูดโยงเข้าถึงการลงทุนต่างๆที่ลูกค้าได้ทำ หรือเหตุผลที่ทำให้ลูกค้าได้อัพเกรด
- อธิบายถึงสิทธิพิเศษเพิ่มเติมโดยรวมที่ลูกค้าจะได้รับ
- กล่าวถึงสิทธิพิเศษที่น่าจะตรงกับความสนใจของลูกค้ามากที่สุด`,
              },
              {
                title: '3. การอัปเดตข้อมูลลูกค้า',
                items: [],
                markdown: `- ขอรวบรวมข้อมูลปัจจุบันเพิ่มเติมเกี่ยวกับสถานการณ์ทางการเงิน เป้าหมาย และความต้องการของลูกค้าซึ่งจะช่วยให้สามารถดูแลลูกค้าได้ดีขึ้น
- แสดงความเข้าใจและเชื่อมโยงบริการ Wealth และสิทธิพิเศษ ให้ตรงกับข้อมูลที่ได้รับเพิ่มเติม`,
              },
              {
                title: '4. การลงเรื่องขั้นตอนถัดไป',
                items: [],
                markdown: `- ขอความยินยอมในการจัดการบริการในนามลูกค้า (product execution consent form)
- สรุปการพูดคุย
- นัดติดตามผลสำหรับบริการเพิ่มเติมที่ลูกค้าสนใจ เพื่อพูดคุยอย่างละเอียดมากขึ้น
- แสดงความขอบคุณความไว้วางใจที่ลูกค้ามีให้เสมอมา`,
              },
            ],
          },

          // Indonesian
          id: {
            title: 'Onboarding Upgrade Klien',
            description:
              'Pendekatan terstruktur untuk mengupgrade klien yang ada ke layanan Wealth',
            steps: [
              {
                title: '1. Salam & Penetapan Konteks',
                items: [],
                markdown: `- Sapa klien dengan hangat dan beri tahu status upgrade mereka`,
              },
              {
                title: '2. Pengenalan Status & Penawaran Baru',
                items: [],
                markdown: `- Ekspresikan rasa terima kasih atas penggunaan layanan bank yang berkelanjutan dan hubungkan dengan berbagai investasi yang telah dilakukan klien, atau alasan yang menyebabkan upgrade klien
- Jelaskan hak istimewa tambahan secara keseluruhan yang akan diterima klien
- Sebutkan hak istimewa yang paling mungkin selaras dengan minat klien`,
              },
              {
                title: '3. Pembaruan Informasi Klien',
                items: [],
                markdown: `- Minta untuk mengumpulkan informasi terkini tambahan tentang situasi finansial, tujuan, dan kebutuhan klien, yang akan membantu memberikan layanan yang lebih baik
- Tunjukkan pemahaman dan hubungkan layanan Wealth dan hak istimewa agar sesuai dengan informasi tambahan yang diterima`,
              },
              {
                title: '4. Setuju pada Langkah Selanjutnya',
                items: [],
                markdown: `- Minta persetujuan untuk mengelola layanan atas nama klien (formulir persetujuan eksekusi produk)
- Rangkum percakapan
- Jadwalkan tindak lanjut untuk layanan tambahan yang diminati klien, untuk dibahas lebih detail
- Ekspresikan apresiasi atas kepercayaan yang selalu diberikan klien kepada kami`,
              },
            ],
          },

          // Malay
          ms: {
            title: 'Onboarding Naik Taraf Pelanggan',
            description:
              'Pendekatan berstruktur untuk menaik taraf pelanggan sedia ada kepada perkhidmatan Wealth',
            steps: [
              {
                title: '1. Salam & Penetapan Konteks',
                items: [],
                markdown: `- Sapa pelanggan dengan mesra dan maklumkan status naik taraf mereka`,
              },
              {
                title: '2. Pengenalan Status & Tawaran Baharu',
                items: [],
                markdown: `- Ucapkan terima kasih atas penggunaan perkhidmatan bank yang berterusan dan hubungkan dengan pelbagai pelaburan yang telah dibuat pelanggan, atau sebab-sebab yang membawa kepada naik taraf pelanggan
- Terangkan keistimewaan tambahan secara keseluruhan yang akan diterima pelanggan
- Sebutkan keistimewaan yang paling mungkin selaras dengan minat pelanggan`,
              },
              {
                title: '3. Kemas Kini Maklumat Pelanggan',
                items: [],
                markdown: `- Minta untuk mengumpul maklumat semasa tambahan tentang situasi kewangan, matlamat, dan keperluan pelanggan, yang akan membantu memberikan perkhidmatan yang lebih baik
- Tunjukkan pemahaman dan hubungkan perkhidmatan Wealth dan keistimewaan agar sepadan dengan maklumat tambahan yang diterima`,
              },
              {
                title: '4. Setuju pada Langkah Seterusnya',
                items: [],
                markdown: `- Minta persetujuan untuk menguruskan perkhidmatan bagi pihak pelanggan (borang persetujuan pelaksanaan produk)
- Rumuskan perbualan
- Jadualkan susulan untuk perkhidmatan tambahan yang diminati pelanggan, untuk dibincangkan dengan lebih terperinci
- Ucapkan penghargaan atas kepercayaan yang selalu diberikan pelanggan kepada kami`,
              },
            ],
          },

          // Filipino
          tl: {
            title: 'Client Upgrade Onboarding',
            description:
              'Structured na diskarte para sa pag-upgrade ng mga existing client sa Wealth services',
            steps: [
              {
                title: '1. Pagbati & Pagtatakda ng Konteksto',
                items: [],
                markdown: `- Batiin ang kliyente nang mainit at ipaalam ang kanilang upgrade status`,
              },
              {
                title: '2. Pagpapakilala sa Bagong Status & Mga Alok',
                items: [],
                markdown: `- Ipahayag ang pasasalamat sa patuloy na paggamit ng mga serbisyo ng bangko at ikonekta sa iba't ibang investments na ginawa ng kliyente, o mga dahilan na nagdulot ng upgrade ng kliyente
- Ipaliwanag ang karagdagang pangkalahatang privileges na matatanggap ng kliyente
- Banggitin ang mga privileges na malamang na tumugma sa interes ng kliyente`,
              },
              {
                title: '3. Client Information Update',
                items: [],
                markdown: `- Humingi na mangolekta ng karagdagang kasalukuyang impormasyon tungkol sa financial situation, goals, at needs ng kliyente, na makakatulong sa pagbibigay ng mas mahusay na serbisyo
- Ipakita ang pag-unawa at ikonekta ang Wealth services at privileges upang tumugma sa karagdagang impormasyong natanggap`,
              },
              {
                title: '4. Magkasundo sa Susunod na Hakbang',
                items: [],
                markdown: `- Humingi ng pahintulot para sa pagmamaneho ng mga serbisyo sa ngalan ng kliyente (product execution consent form)
- Buuin ang usapan
- Mag-iskedyul ng follow-up para sa karagdagang serbisyo na interesado ang kliyente, para talakayin nang mas detalyado
- Ipahayag ang pasasalamat sa tiwala na palaging ibinibigay ng kliyente sa amin`,
              },
            ],
          },

          // Vietnamese
          vi: {
            title: 'Giới thiệu Nâng cấp Khách hàng',
            description:
              'Phương pháp có cấu trúc để nâng cấp khách hàng hiện tại lên dịch vụ Wealth',
            steps: [
              {
                title: '1. Chào hỏi & Thiết lập Bối cảnh',
                items: [],
                markdown: `- Chào đón khách hàng một cách nồng nhiệt và thông báo trạng thái nâng cấp của họ`,
              },
              {
                title: '2. Giới thiệu Tình trạng & Ưu đãi Mới',
                items: [],
                markdown: `- Bày tỏ lòng biết ơn về việc sử dụng dịch vụ ngân hàng liên tục và kết nối với các khoản đầu tư khác nhau mà khách hàng đã thực hiện, hoặc lý do dẫn đến việc nâng cấp của khách hàng
- Giải thích các đặc quyền bổ sung tổng thể mà khách hàng sẽ nhận được
- Đề cập đến các đặc quyền có khả năng phù hợp nhất với sở thích của khách hàng`,
              },
              {
                title: '3. Cập nhật Thông tin Khách hàng',
                items: [],
                markdown: `- Yêu cầu thu thập thông tin hiện tại bổ sung về tình hình tài chính, mục tiêu và nhu cầu của khách hàng, điều này sẽ giúp cung cấp dịch vụ tốt hơn
- Thể hiện sự hiểu biết và kết nối dịch vụ Wealth và đặc quyền để phù hợp với thông tin bổ sung đã nhận được`,
              },
              {
                title: '4. Đồng ý về Các Bước Tiếp theo',
                items: [],
                markdown: `- Yêu cầu sự đồng ý để quản lý dịch vụ thay mặt khách hàng (biểu mẫu đồng ý thực thi sản phẩm)
- Tóm tắt cuộc trò chuyện
- Lên lịch theo dõi cho các dịch vụ bổ sung mà khách hàng quan tâm, để thảo luận chi tiết hơn
- Bày tỏ sự đánh giá cao về sự tin tưởng mà khách hàng luôn dành cho chúng tôi`,
              },
            ],
          },
        },
      },

      // Goal Planning Process (similar structure)
      'bbl-goal-planning': {
        base: {
          id: 'bbl-goal-planning',
          company: 'bbl',
          moduleId: 'bbl-goal-planning',
        },
        localized: {
          en: {
            title: 'Goal Planning',
            description:
              'Comprehensive approach to financial goal setting and planning',
            steps: [
              {
                title: '1. Introduction & Agenda Setting',
                items: [],
                markdown: `- Recap TWS (Total Wealth Solution) progress and set expectations for today's discussion
- Welcome the client and show appreciation for the relationship
- Share gratitude and any personal follow-up (e.g., family or career updates)
- Recap current goals and explain the session agenda: "review goals, size targets, and discuss tailored solutions"`,
              },
              {
                title: '2. Define Goal',
                items: [],
                markdown: `- Understand the client's situation and confirm or reprioritize key goals
- Confirm/update basics (age, occupation)
- Ask about family plans and long-term life goals
- Check if any current goals have changed or new ones need to be added`,
              },
              {
                title: '3. Size the Goal',
                items: [],
                markdown: `- Quantify each goal into clear targets
- For each goal, confirm the target year and specific amount needed
- Gather key numbers like current debt, total assets (AUM), and other relevant inputs (e.g., education costs)
- Clarify how much of their current assets they want to allocate`,
              },
              {
                title: '4. Solution Proposal',
                items: [],
                markdown: `- Navigate decision tree through branching questions to recommend the right product type and structure

**Critical Branching Questions (ask in sequence):**
- Coverage preference: "Do you want life insurance protection for this goal?" (YES → insurance products / NO → pure investment)
- Risk appetite for coverage (if YES): "Are you comfortable with market-linked insurance (cheaper, variable) or prefer guaranteed whole life (higher cost, certain)?" (Market-linked → unit-linked options / Guaranteed → investment + whole life)
- Product structure (if market-linked): "Would you prefer one integrated unit-linked product or separate investment + unit-linked for diversification?" (Single → pure unit-linked / Separate → investment + unit-linked)
- For retirees/legacy planners: "Do you prefer regular income payouts or lump-sum at maturity?" (Regular → investment + savings insurance / Lump-sum → other paths)
- Payment method: "Prefer lump-sum investment, regular monthly contributions (DCA), or combination?"

**Final Actions:**
- Present 1-2 best-fit solutions based on their decision path
- Explain WHY this product TYPE matches their branching responses
- Show with numbers how the solution closes the gap to each goal
- Clarify trade-offs (cost vs coverage, guaranteed vs growth, liquidity vs lock-in)`,
              },
              {
                title: '5. Call to Action',
                items: [],
                markdown: `- Gain agreement to proceed with the plan
- Summarize the agreed solution and how it addresses each goal
- Confirm next steps: execution of the product or scheduling follow-up
- Reassure ongoing support and long-term partnership`,
              },
            ],
          },
          // Add other languages following the same pattern...
          th: {
            title: 'การวางแผนเป้าหมาย',
            description:
              'แนวทางที่ครอบคลุมในการกำหนดเป้าหมายทางการเงินและการวางแผน',
            steps: [
              {
                title: '1. การแนะนำและการกำหนดวาระ',
                items: [],
                markdown: `- สรุปความก้าวหน้าของ TWS (Total Wealth Solution) และกำหนดความคาดหวังสำหรับการอภิปรายวันนี้
- ต้อนรับลูกค้าและแสดงความซาบซึ้งในความสัมพันธ์
- แบ่งปันความขอบคุณและการติดตามส่วนตัว (เช่น การอัปเดตเรื่องครอบครัวหรืออาชีพ)
- สรุปเป้าหมายปัจจุบันและอธิบายวาระการประชุม: "ทบทวนเป้าหมาย กำหนดเป้าหมาย และหารือเกี่ยวกับโซลูชันที่ปรับแต่งได้"`,
              },
              {
                title: '2. กำหนดเป้าหมาย',
                items: [],
                markdown: `- เข้าใจสถานการณ์ของลูกค้าและยืนยันหรือจัดลำดับความสำคัญของเป้าหมายหลักใหม่
- ยืนยัน/อัปเดตข้อมูลพื้นฐาน (อายุ อาชีพ)
- สอบถามเกี่ยวกับแผนครอบครัวและเป้าหมายชีวิตระยะยาว
- ตรวจสอบว่าเป้าหมายปัจจุบันใดบ้างที่เปลี่ยนแปลงหรือต้องการเพิ่มเป้าหมายใหม่`,
              },
              {
                title: '3. กำหนดขนาดเป้าหมาย',
                items: [],
                markdown: `- วัดปริมาณแต่ละเป้าหมายให้เป็นเป้าหมายที่ชัดเจน
- สำหรับแต่ละเป้าหมาย ยืนยันปีเป้าหมายและจำนวนเงินที่ต้องการโดยเฉพาะ
- รวบรวมตัวเลขสำคัญ เช่น หนี้สินปัจจุบัน สินทรัพย์รวม (AUM) และข้อมูลที่เกี่ยวข้องอื่นๆ (เช่น ค่าใช้จ่ายด้านการศึกษา)
- ชี้แจงว่าพวกเขาต้องการจัดสรรสินทรัพย์ปัจจุบันเท่าไหร่`,
              },
              {
                title: '4. ข้อเสนอโซลูชัน',
                items: [],
                markdown: `- นำทางผ่าน decision tree ด้วยคำถามแบ่งสาขาเพื่อแนะนำประเภทและโครงสร้างผลิตภัณฑ์ที่เหมาะสม

**คำถามสำคัญแบบแบ่งสาขา (ถามตามลำดับ):**
- ความต้องการความคุ้มครอง: "คุณต้องการความคุ้มครองประกันชีวิตสำหรับเป้าหมายนี้ไหม?" (ใช่ → ผลิตภัณฑ์ประกัน / ไม่ → การลงทุนล้วน)
- ความอยากรับความเสี่ยงสำหรับความคุ้มครอง (ถ้าตอบใช่): "คุณสบายใจกับประกันที่เชื่อมโยงตลาด (เบี้ยถูกกว่า แต่มีความผันผวน) หรือชอบประกันชีวิตแบบรับประกันผลตอบแทน (เบี้ยสูงกว่า แต่แน่นอน)?" (เชื่อมโยงตลาด → ตัวเลือก unit-linked / รับประกัน → การลงทุน + ประกันชีวิตแบบเต็ม)
- โครงสร้างผลิตภัณฑ์ (ถ้าเชื่อมโยงตลาด): "คุณชอบผลิตภัณฑ์ unit-linked แบบรวมเดียว หรือแยกเป็นการลงทุน + unit-linked เพื่อการกระจายความเสี่ยง?" (แบบรวม → unit-linked ล้วน / แยก → การลงทุน + unit-linked)
- สำหรับผู้เกษียณ/ผู้วางแผนมรดก: "คุณชอบรับเงินเป็นรายได้ประจำ หรือรับครั้งเดียวตอนครบกำหนด?" (รายได้ประจำ → การลงทุน + ประกันออมทรัพย์ / ครั้งเดียว → เส้นทางอื่น)
- วิธีการชำระเงิน: "ชอบลงทุนเป็นก้อน, จ่ายรายเดือน (DCA), หรือผสม?"

**การดำเนินการสุดท้าย:**
- นำเสนอโซลูชันที่เหมาะสมที่สุด 1-2 ตัวตามเส้นทางการตัดสินใจของพวกเขา
- อธิบายว่าทำไมผลิตภัณฑ์ประเภทนี้เหมาะกับคำตอบแบ่งสาขาของพวกเขา
- แสดงด้วยตัวเลขว่าโซลูชันปิดช่องว่างไปยังแต่ละเป้าหมายอย่างไร
- ชี้แจงการแลกเปลี่ยน (ต้นทุนกับความคุ้มครอง, รับประกันกับการเติบโต, สภาพคล่องกับการล็อค)`,
              },
              {
                title: '5. การเรียกร้องให้ลงมือทำ',
                items: [],
                markdown: `- ได้รับความเห็นชอบให้ดำเนินการตามแผน
- สรุปโซลูชันที่ตกลงกันและวิธีที่มันตอบสนองแต่ละเป้าหมาย
- ยืนยันขั้นตอนต่อไป: การดำเนินการผลิตภัณฑ์หรือการกำหนดตารางติดตาม
- ให้ความมั่นใจในการสนับสนุนอย่างต่อเนื่องและความเป็นหุ้นส่วนระยะยาว`,
              },
            ],
          },
        },
      },

      // Portfolio Review Process
      'bbl-portfolio-review': {
        base: {
          id: 'bbl-portfolio-review',
          company: 'bbl',
          moduleId: 'bbl-portfolio-review',
        },
        localized: {
          en: {
            title: 'Portfolio Review',
            description:
              'Comprehensive approach to reviewing portfolio performance and rebalancing',
            steps: [
              {
                title: '1. Greeting and Setting Context',
                items: [],
                markdown: `- Welcome the client, thank them for their time, and confirm the purpose of the meeting.
- Ask about their work, family, or any recent life updates.`,
              },
              {
                title: '2. Event Summary',
                items: [],
                markdown: `- Introduce the event trigger for this review (e.g., market changes).
- Summarize recent market events relevant to the client's interests, based on the investment outlook:

  **U.S. Stock Market:** Increased due to strong quarterly earnings. Most companies exceeded expectations, especially in the technology sector. The market was also supported by a slowdown in PPI inflation, although CPI rose slightly.

  **Thai Stock Market:** Declined due to political uncertainty surrounding the prime minister transition. However, positive factors include growth in the tourism sector and expectations that the new central bank governor will adopt a more accommodative monetary policy to support interest rate cuts.

  **Chinese Stock Market:** Rose as A-share stocks remained within a trading range. The market was also supported by Q2 GDP growth of 5.2%, which exceeded the government's target.

  **Vietnamese Stock Market:** Fell due to sell-offs in banking stocks following reports that several major commercial banks misused funds from private bond issuances. However, the market later rebounded as investors viewed the practical impact on companies as limited.`,
              },
              {
                title: '3. Portfolio Performance Review',
                items: [],
                markdown: `- Explain how these events have affected the client's portfolio.
- Identify which asset classes have outperformed or underperformed expectations.
- Highlight any new or remaining gaps from the client's original financial goals.`,
              },
              {
                title: '4. Portfolio Adjustment Recommendations',
                items: [],
                markdown: `- Propose portfolio adjustments tailored to the client's profile and preferences, aligned with CIO recommendations, or introduce relevant new products.
- Recommend rebalancing with a top-up before suggesting rebalancing without a top-up.
- Explain how the client's chosen option (top-up or not) would affect their portfolio allocation and alignment with their goals.`,
              },
              {
                title: '5. Call to Action',
                items: [],
                markdown: `- Summarize next steps and set a timeline for follow-up or the next meeting.
- Express appreciation for the client's time and continued trust.`,
              },
            ],
          },
          // Add Thai translation
          th: {
            title: 'การทบทวนพอร์ตโฟลิโอ',
            description:
              'แนวทางที่ครอบคลุมในการทบทวนผลตอบแทนพอร์ตโฟลิโอและการปรับสมดุล',
            steps: [
              {
                title: '1. การทักทายและการสร้างบริบท',
                items: [],
                markdown: `- ต้อนรับลูกค้า ขอบคุณสำหรับเวลาและยืนยันวัตถุประสงค์ในการเข้าพูดคุย
- สอบถามเกี่ยวกับการทำงาน ครอบครัว หรือการอัปเดตเรื่องชีวิตของลูกค้าล่าสุด`,
              },
              {
                title: '2. สรุปเหตุการณ์',
                items: [],
                markdown: `- แนะนำเหตุผล (event trigger) สำหรับการทบทวนครั้งนี้ เช่น การเปลี่ยนแปลงของตลาด
- สรุปตลาดหรือเหตุการณ์ในปัจจุบันตามที่เหมาะสมและลูกค้าสนใจ โดยอิง investment outlook:

  **ตลาดหุ้นสหรัฐ:** ปรับตัวขึ้น จากผลประกอบการณ์ที่แข็งแกร่งไตรมาสนี้ โดยส่วนใหญ่ผลประกอบการดีเกินคาดโดยเฉพาะหุ้นในกลุ่มเทคโนโลยี และตลาดยังได้ปัจจัยหนุนจากการชะลอตัวของเงินเฟ้อ PPI ส่วน CPI ขยายตัวเพิ่มขึ้น

  **ตลาดหุ้นไทย:** ปรับตัวลง เนื่องจากความไม่นอนทางการเมืองเกี่ยวกับการเปลี่ยนนายกรัฐมนตรี แต่มีปัจจัยบวกจากการเติบโตของภาคการท่องเที่ยวและธปท.คนใหม่มีแนวโน้มใช้นโยบายการเงินที่ผ่อนคลาย สนับสนุนการปรับลดอัตราดอกเบี้ย

  **ตลาดหุ้นจีน:** ปรับตัวขึ้น โดยหุ้น A-Share ยังคงแกว่งตัวในกรอบ นอกจากนั้นตลาดยังได้แรงหนุนจากรายงาน GDP ไตรมาส 2 ขยายตัว 5.2% ซึ่งสูงกว่าเป้าหมายที่รัฐบาลจีนกำหนดไว้

  **ตลาดหุ้นเวียดนาม:** ปรับตัวลง จากแรงขายหุ้นกลุ่มธนาคาร หลังสื่อรายงานผลการตรวจสอบพบว่าธนาคารพาณิชย์ขนาดใหญ่หลายแห่งใช้เงินในการออกตราสารหนี้เอกชนผิดวัตถุประสงค์ แต่ตลาดฟื้นตัวหลังนักลงทุนมองว่าบริษัทต่างๆ มีผลกระทบเชิงปฏิบัติไม่มาก`,
              },
              {
                title: '3. ทบทวนผลตอบแทนพอร์ตโฟลิโอ',
                items: [],
                markdown: `- อธิบายว่าเหตุการณ์เหล่านี้มีผลต่อพอร์ตโฟลิโอของลูกค้าอย่างไร
- อธิบายว่าประเภทสินทรัพย์ใดที่ทำผลงานเกินหรือต่ำกว่าคาด
- ระบุช่องว่างใด ๆ จากเป้าหมายทางการเงินเดิมเพิ่มเติม`,
              },
              {
                title: '4. คำแนะนำการปรับพอร์ต',
                items: [],
                markdown: `- เสนอการปรับพอร์ตที่ปรับแต่งให้สอดคล้องกับโปรไฟล์และ preference ของลูกค้าที่สอดคล้องกับคำแนะนำ CIO หรือเสนอผลิตภัณฑ์ใหม่ที่เกี่ยวข้อง
- แนะนำให้ Rebalance ด้วยการ top-up ก่อนการ Rebalance แบบไม่ top-up
- อธิบายว่าทางเลือกที่ลูกค้าเลือก (top-up หรือ ไม่ top-up) ส่งผลอย่างไรต่อสินทรัพย์ในพอร์ต และจะสอดคล้องกับเป้าหมายอย่างไรบ้าง`,
              },
              {
                title: '5. การเรียกร้องให้ลงมือทำ',
                items: [],
                markdown: `- สรุปการดำเนินการและกำหนดกรอบเวลาสำหรับการติดตามหรือการนัดพบต่อไป
- แสดงความขอบคุณในเวลาและความไว้ใจที่ลูกค้ามอบให้เสมอมา`,
              },
            ],
          },
        },
      },

      // Client Revival Process
      'bbl-client-revival': {
        base: {
          id: 'bbl-client-revival',
          company: 'bbl',
          moduleId: 'bbl-client-revival',
        },
        localized: {
          en: {
            title: 'Client Revival',
            description:
              'Re-engagement strategy for dormant or inactive clients',
            steps: [
              {
                title: '1. Greeting & Context Setting',
                items: [],
                markdown: `- Greet the client and introduce yourself`,
              },
              {
                title: '2. Explore Reasons for Disengagement',
                items: [],
                markdown: `- Ask about concerns, discomfort, or problems that occurred from using the service that caused the client to disengage from Wealth services (see additional 2 pages)
- Summarize and confirm shared understanding of the problems, obstacles, or main concerns of the client
- Propose solutions to the problems that occurred, or services that can address the client's needs, based on what the client has shared`,
              },
              {
                title: '3. Agree on Next Steps',
                items: [],
                markdown: `- Schedule follow-up or discuss further for additional services the client is interested in, or details of the solution to the problem
- Thank the client and confirm readiness to serve the client continuously in the long term`,
              },
            ],
          },
          // Add other languages following the same pattern...
          th: {
            title: 'การฟื้นฟูลูกค้า',
            description:
              'กลยุทธ์การติดต่อกลับสำหรับลูกค้าที่ไม่ได้ใช้บริการหรือไม่ค่อยได้ติดต่อ',
            steps: [
              {
                title: '1. การทักทายและการสร้างบริบท',
                items: [],
                markdown: `- ทักทายลูกค้าและแนะนำตัว`,
              },
              {
                title: '2. สำรวจเหตุผลของการห่างเหิน',
                items: [],
                markdown: `- ถามถึงความกังวล ความไม่สบายใจ หรือ ปัญหาอุปสรรค ที่เกิดขึ้นจากการใช้บริการ ที่ทำให้ลูกค้าห่างเหินจากบริการ wealth (เพิ่มเติม 2 หน้าต่อไป)
- สรุปยืนยันความเข้าใจร่วมกันของปัญหาอุปสรรค หรือความกังวลหลักของลูกค้า
- เสนอทางออกของปัญหาที่เกิดขึ้น หรือบริการที่สามารถตอบโจทย์ลูกค้าได้ จากคำบอกเล่าของลูกค้า`,
              },
              {
                title: '3. ตกลงเรื่องขั้นตอนถัดไป',
                items: [],
                markdown: `- นัดติดตามผลหรือพูดคุยเพิ่มเติมสำหรับบริการเพิ่มเติมที่ลูกค้าสนใจ หรือ รายละเอียดทางออกของปัญหา
- ขอบคุณลูกค้าและยืนยันความพร้อมในการบริการของลูกค้าต่อเนื่องระยะยาว`,
              },
            ],
          },
          // Indonesian
          id: {
            title: 'Kebangkitan Klien',
            description:
              'Strategi keterlibatan kembali untuk klien yang tidak aktif atau dorman',
            steps: [
              {
                title: '1. Salam & Penetapan Konteks',
                items: [],
                markdown: `- Sapa klien dan perkenalkan diri Anda`,
              },
              {
                title: '2. Jelajahi Alasan Ketidaktertarikan',
                items: [],
                markdown: `- Tanyakan tentang kekhawatiran, ketidaknyamanan, atau masalah yang terjadi dari penggunaan layanan yang menyebabkan klien tidak terlibat dengan layanan Wealth (lihat 2 halaman tambahan)
- Rangkum dan konfirmasi pemahaman bersama tentang masalah, hambatan, atau kekhawatiran utama klien
- Usulkan solusi untuk masalah yang terjadi, atau layanan yang dapat memenuhi kebutuhan klien, berdasarkan apa yang telah dibagikan klien`,
              },
              {
                title: '3. Setuju pada Langkah Selanjutnya',
                items: [],
                markdown: `- Jadwalkan tindak lanjut atau diskusikan lebih lanjut untuk layanan tambahan yang diminati klien, atau detail solusi untuk masalah tersebut
- Ucapkan terima kasih kepada klien dan konfirmasi kesiapan untuk melayani klien secara berkelanjutan dalam jangka panjang`,
              },
            ],
          },
          // Malay
          ms: {
            title: 'Pemulihan Pelanggan',
            description:
              'Strategi penglibatan semula untuk pelanggan yang tidak aktif atau dorman',
            steps: [
              {
                title: '1. Salam & Penetapan Konteks',
                items: [],
                markdown: `- Sapa pelanggan dan perkenalkan diri anda`,
              },
              {
                title: '2. Terokai Sebab Ketidakpenglibatan',
                items: [],
                markdown: `- Tanya tentang kebimbangan, ketidakselesaan, atau masalah yang berlaku daripada penggunaan perkhidmatan yang menyebabkan pelanggan tidak terlibat dengan perkhidmatan Wealth (lihat 2 halaman tambahan)
- Rumuskan dan sahkan persefahaman bersama tentang masalah, halangan, atau kebimbangan utama pelanggan
- Cadangkan penyelesaian kepada masalah yang berlaku, atau perkhidmatan yang dapat memenuhi keperluan pelanggan, berdasarkan apa yang telah dikongsi pelanggan`,
              },
              {
                title: '3. Setuju pada Langkah Seterusnya',
                items: [],
                markdown: `- Jadualkan susulan atau bincangkan lebih lanjut untuk perkhidmatan tambahan yang diminati pelanggan, atau butiran penyelesaian kepada masalah tersebut
- Ucapkan terima kasih kepada pelanggan dan sahkan kesediaan untuk melayani pelanggan secara berterusan dalam jangka panjang`,
              },
            ],
          },
          // Filipino
          tl: {
            title: 'Pagbangon ng Kliyente',
            description:
              'Estratehiya ng muling pakikipag-ugnayan para sa mga kliyenteng hindi aktibo o walang ginagawa',
            steps: [
              {
                title: '1. Pagbati & Pagtakda ng Konteksto',
                items: [],
                markdown: `- Batiin ang kliyente at ipakilala ang inyong sarili`,
              },
              {
                title: '2. Tuklasin ang mga Dahilan ng Pagkakawalay',
                items: [],
                markdown: `- Magtanong tungkol sa mga alalahanin, hindi komportable, o mga problema na naganap mula sa paggamit ng serbisyo na nagdulot sa kliyente na hindi makipag-ugnayan sa mga serbisyo ng Wealth (tingnan ang karagdagang 2 pahina)
- Buuin at kumpirmahin ang shared understanding ng mga problema, hadlang, o pangunahing alalahanin ng kliyente
- Magmungkahi ng mga solusyon sa mga problema na naganap, o mga serbisyo na makakatugon sa mga pangangailangan ng kliyente, batay sa kung ano ang ibinahagi ng kliyente`,
              },
              {
                title: '3. Magkasundo sa Susunod na Hakbang',
                items: [],
                markdown: `- Mag-iskedyul ng follow-up o talakayin pa para sa karagdagang serbisyo na interesado ang kliyente, o mga detalye ng solusyon sa problema
- Magpasalamat sa kliyente at kumpirmahin ang kahandaan na maglingkod sa kliyente nang patuloy sa mahabang panahon`,
              },
            ],
          },
          // Vietnamese
          vi: {
            title: 'Hồi sinh Khách hàng',
            description:
              'Chiến lược tái tham gia cho khách hàng không hoạt động hoặc ngủ đông',
            steps: [
              {
                title: '1. Chào hỏi & Thiết lập Bối cảnh',
                items: [],
                markdown: `- Chào đón khách hàng và giới thiệu bản thân`,
              },
              {
                title: '2. Khám phá Lý do Không tham gia',
                items: [],
                markdown: `- Hỏi về các mối quan ngại, sự khó chịu, hoặc vấn đề xảy ra từ việc sử dụng dịch vụ khiến khách hàng không tham gia các dịch vụ Wealth (xem thêm 2 trang)
- Tóm tắt và xác nhận sự hiểu biết chung về các vấn đề, trở ngại, hoặc mối quan ngại chính của khách hàng
- Đề xuất giải pháp cho các vấn đề đã xảy ra, hoặc dịch vụ có thể đáp ứng nhu cầu của khách hàng, dựa trên những gì khách hàng đã chia sẻ`,
              },
              {
                title: '3. Đồng ý về Các Bước Tiếp theo',
                items: [],
                markdown: `- Lên lịch theo dõi hoặc thảo luận thêm cho các dịch vụ bổ sung mà khách hàng quan tâm, hoặc chi tiết giải pháp cho vấn đề
- Cảm ơn khách hàng và xác nhận sự sẵn sàng phục vụ khách hàng liên tục trong dài hạn`,
              },
            ],
          },
        },
      },
    },
  };
