import { ModuleProcessReferenceConfiguration } from './types.js';

// Bank Process Reference configuration with co-located translations
export const hsbcProcessReferenceConfiguration: ModuleProcessReferenceConfiguration =
  {
    base: {
      id: 'hsbc',
      company: 'hsbc',
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
                items: [
                  {
                    title: 'Welcome & Congratulate',
                    subItems: [
                      'Greet warmly and thank the client for their growing relationship with the bank.',
                      'Reference something personal from past interactions (e.g., career promotion, family update).',
                    ],
                  },
                  {
                    title: 'Acknowledge Their Journey',
                    subItems: [
                      'Show appreciation for their trust and milestones so far.',
                    ],
                  },
                  {
                    title: 'Explore Upcoming Priorities',
                    subItems: [
                      'Ask about upcoming personal or financial plans to set context for the upgrade.',
                    ],
                  },
                ],
              },
              {
                title: '2. Introduction to New Status & Offerings',
                items: [
                  {
                    title: 'Present Upgrade as Recognition',
                    subItems: [
                      "Position the Wealth upgrade as a recognition of the client's trust and growth.",
                    ],
                  },
                  {
                    title: 'Explain Key Benefits',
                    subItems: [
                      'Clearly outline the new benefits of the Wealth status.',
                    ],
                  },
                  {
                    title: 'Connect to Client Goals',
                    subItems: [
                      'Tie the benefits back to the priorities and aspirations mentioned earlier.',
                    ],
                  },
                ],
              },
              {
                title: '3. Client Information Update',
                items: [
                  {
                    title: 'Request Key Updates',
                    subItems: [
                      'Politely ask for any new or missing personal information (age, occupation, AUM, etc.).',
                    ],
                  },
                  {
                    title: 'Clarify the Value of Updates',
                    subItems: [
                      'Explain that complete information helps tailor the right solutions and offerings.',
                    ],
                  },
                ],
              },
              {
                title: '4. Call to Action',
                items: [
                  {
                    title: 'Summarize & Confirm',
                    subItems: [
                      'Recap key points and confirm mutual understanding.',
                    ],
                  },
                  {
                    title: 'Propose Next Steps',
                    subItems: [
                      'Suggest next actions such as setting up an investment advisory session.',
                    ],
                  },
                  {
                    title: 'Reassure Partnership',
                    subItems: [
                      'End by reinforcing the long-term partnership and ongoing support from the bank.',
                    ],
                  },
                ],
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
                items: [
                  {
                    title: 'ต้อนรับและแสดงความยินดี',
                    subItems: [
                      'ทักทายลูกค้าอย่างอบอุ่นและขอบคุณที่ใช้บริการ Bank',
                      'อ้างอิงถึงผลงานหรือความสำเร็จที่ทำให้เขามีสิทธิ์อัพเกรด',
                    ],
                  },
                  {
                    title: 'ยอมรับการเดินทางของพวกเขา',
                    description:
                      'ยอมรับความก้าวหน้าทางการเงินและความสัมพันธ์ปัจจุบันกับธนาคาร',
                  },
                  {
                    title: 'สำรวจลำดับความสำคัญที่กำลังจะมาถึง',
                    description:
                      'สอบถามเกี่ยวกับการเปลี่ยนแปลงในชีวิต การพัฒนาอาชีพ หรือเป้าหมายทางการเงินที่กำลังดำเนินการ',
                  },
                ],
              },
              {
                title: '2. การแนะนำสถานะและข้อเสนอใหม่',
                items: [
                  {
                    title: 'นำเสนอการอัพเกรดเป็นการยอมรับ',
                    description:
                      'กำหนดกรอบการอัพเกรดบริการ Wealth เป็นการยอมรับความสำเร็จและการเติบโตของพวกเขา',
                  },
                  {
                    title: 'อธิบายผลประโยชน์หลัก',
                    description:
                      'เน้นผลประโยชน์และบริการพิเศษที่มีผ่าน Wealth Banking',
                  },
                  {
                    title: 'เชื่อมต่อกับเป้าหมายของลูกค้า',
                    description:
                      'เชื่อมโยงบริการ Wealth โดยตรงกับวัตถุประสงค์และลำดับความสำคัญทางการเงินที่ระบุไว้',
                  },
                ],
              },
              {
                title: '3. การอัปเดตข้อมูลลูกค้า',
                items: [
                  {
                    title: 'ขอการอัปเดตที่สำคัญ',
                    description:
                      'รวบรวมข้อมูลปัจจุบันเกี่ยวกับสถานการณ์ทางการเงิน เป้าหมาย และความต้องการของพวกเขา',
                  },
                  {
                    title: 'ชี้แจงคุณค่าของการอัปเดต',
                    description:
                      'อธิบายว่าข้อมูลที่อัปเดตช่วยให้บริการและคำแนะนำที่ดีขึ้นและเป็นส่วนตัวมากขึ้นได้อย่างไร',
                  },
                ],
              },
              {
                title: '4. การเรียกร้องให้ลงมือทำ',
                items: [
                  {
                    title: 'สรุปและยืนยัน',
                    description:
                      'สรุปผลประโยชน์หลักที่พูดคุยและยืนยันความสนใจในการอัพเกรด',
                  },
                  {
                    title: 'เสนอขั้นตอนต่อไป',
                    description:
                      'แนะนำการประชุมติดตามหรือการดำเนินการเฉพาะเพื่อเปิดใช้งานบริการ Wealth ของพวกเขา',
                  },
                  {
                    title: 'ความมั่นใจในความเป็นหุ้นส่วน',
                    description:
                      'เน้นการสนับสนุนอย่างต่อเนื่องและความเป็นหุ้นส่วนที่พวกเขาสามารถคาดหวังได้ในอนาคต',
                  },
                ],
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
                items: [
                  {
                    title: 'Sambut & Ucapkan Selamat',
                    subItems: [
                      'Sapa klien dengan hangat dan terima kasih atas hubungan mereka dengan Bank',
                      'Referensikan pencapaian atau milestone mereka yang memenuhi syarat untuk upgrade',
                    ],
                  },
                  {
                    title: 'Akui perjalanan mereka',
                    description:
                      'Mengakui kemajuan finansial mereka dan hubungan saat ini dengan bank',
                  },
                  {
                    title: 'Jelajahi prioritas yang akan datang',
                    description:
                      'Tanyakan tentang perubahan hidup, perkembangan karir, atau tujuan finansial yang sedang mereka kejar',
                  },
                ],
              },
              {
                title: '2. Pengenalan Status & Penawaran Baru',
                items: [
                  {
                    title: 'Presentasikan upgrade sebagai pengakuan',
                    description:
                      'Bingkai upgrade layanan Wealth sebagai pengakuan atas kesuksesan dan pertumbuhan mereka',
                  },
                  {
                    title: 'Jelaskan manfaat utama',
                    description:
                      'Sorot manfaat eksklusif dan layanan yang tersedia melalui Wealth Banking',
                  },
                  {
                    title: 'Hubungkan dengan tujuan klien',
                    description:
                      'Kaitkan layanan Wealth langsung dengan tujuan dan prioritas finansial mereka yang telah dinyatakan',
                  },
                ],
              },
              {
                title: '3. Pembaruan Informasi Klien',
                items: [
                  {
                    title: 'Minta pembaruan kunci',
                    description:
                      'Kumpulkan informasi terkini tentang situasi finansial, tujuan, dan preferensi mereka',
                  },
                  {
                    title: 'Klarifikasi nilai pembaruan',
                    description:
                      'Jelaskan bagaimana informasi yang diperbarui membantu memberikan layanan dan saran yang lebih baik dan personal',
                  },
                ],
              },
              {
                title: '4. Seruan Bertindak',
                items: [
                  {
                    title: 'Rangkum & konfirmasi',
                    description:
                      'Rangkum manfaat utama yang dibahas dan konfirmasi minat mereka pada upgrade',
                  },
                  {
                    title: 'Usulkan langkah selanjutnya',
                    description:
                      'Sarankan pertemuan lanjutan atau tindakan spesifik untuk mengaktifkan layanan Wealth mereka',
                  },
                  {
                    title: 'Yakinkan kemitraan',
                    description:
                      'Tekankan dukungan berkelanjutan dan kemitraan yang dapat mereka harapkan ke depan',
                  },
                ],
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
                items: [
                  {
                    title: 'Sambut & Ucap Tahniah',
                    subItems: [
                      'Sapa pelanggan dengan mesra dan terima kasih atas hubungan mereka dengan Bank',
                      'Rujuk pencapaian atau milestone mereka yang layak untuk naik taraf',
                    ],
                  },
                  {
                    title: 'Akui perjalanan mereka',
                    description:
                      'Mengiktiraf kemajuan kewangan mereka dan hubungan semasa dengan bank',
                  },
                  {
                    title: 'Terokai keutamaan yang akan datang',
                    description:
                      'Tanya tentang perubahan hidup, perkembangan kerjaya, atau matlamat kewangan yang sedang mereka kejar',
                  },
                ],
              },
              {
                title: '2. Pengenalan Status & Tawaran Baharu',
                items: [
                  {
                    title: 'Persembahkan naik taraf sebagai pengiktirafan',
                    description:
                      'Bingkai naik taraf perkhidmatan Wealth sebagai pengiktirafan kejayaan dan pertumbuhan mereka',
                  },
                  {
                    title: 'Terangkan faedah utama',
                    description:
                      'Serlahkan faedah eksklusif dan perkhidmatan yang tersedia melalui Wealth Banking',
                  },
                  {
                    title: 'Sambung dengan matlamat pelanggan',
                    description:
                      'Kaitkan perkhidmatan Wealth secara langsung dengan objektif dan keutamaan kewangan mereka yang dinyatakan',
                  },
                ],
              },
              {
                title: '3. Kemas Kini Maklumat Pelanggan',
                items: [
                  {
                    title: 'Minta kemas kini utama',
                    description:
                      'Kumpul maklumat semasa tentang situasi kewangan, matlamat, dan keutamaan mereka',
                  },
                  {
                    title: 'Jelaskan nilai kemas kini',
                    description:
                      'Terangkan bagaimana maklumat yang dikemas kini membantu memberikan perkhidmatan dan nasihat yang lebih baik dan peribadi',
                  },
                ],
              },
              {
                title: '4. Seruan Bertindak',
                items: [
                  {
                    title: 'Ringkas & sahkan',
                    description:
                      'Rumus faedah utama yang dibincangkan dan sahkan minat mereka terhadap naik taraf',
                  },
                  {
                    title: 'Cadang langkah seterusnya',
                    description:
                      'Cadang mesyuarat susulan atau tindakan khusus untuk mengaktifkan perkhidmatan Wealth mereka',
                  },
                  {
                    title: 'Yakinkan perkongsian',
                    description:
                      'Tekankan sokongan berterusan dan perkongsian yang boleh mereka jangka pada masa hadapan',
                  },
                ],
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
                items: [
                  {
                    title: 'Maligayang pagdating & Pagbati',
                    subItems: [
                      'Batiin ang kliyente nang mainit at magpasalamat sa kanilang relasyon sa Bank',
                      'Banggitin ang kanilang tagumpay o milestone na nagbibigay-daan sa upgrade',
                    ],
                  },
                  {
                    title: 'Kilalanin ang kanilang paglalakbay',
                    description:
                      'Kilalanin ang kanilang financial progress at kasalukuyang relasyon sa bangko',
                  },
                  {
                    title: 'Tuklasin ang mga paparating na priyoridad',
                    description:
                      'Magtanong tungkol sa mga pagbabago sa buhay, career development, o financial goals na ginagawa nila',
                  },
                ],
              },
              {
                title: '2. Pagpapakilala sa Bagong Status & Mga Alok',
                items: [
                  {
                    title: 'Ipresenta ang upgrade bilang pagkilala',
                    description:
                      'I-frame ang Wealth services upgrade bilang pagkilala sa kanilang tagumpay at paglago',
                  },
                  {
                    title: 'Ipaliwanag ang mga pangunahing benepisyo',
                    description:
                      'I-highlight ang mga eksklusibong benepisyo at serbisyo na available sa pamamagitan ng Wealth Banking',
                  },
                  {
                    title: 'Ikonekta sa mga layunin ng kliyente',
                    description:
                      'I-link ang Wealth services nang direkta sa kanilang stated financial objectives at priorities',
                  },
                ],
              },
              {
                title: '3. Client Information Update',
                items: [
                  {
                    title: 'Humingi ng mga pangunahing update',
                    description:
                      'Mangolekta ng kasalukuyang impormasyon tungkol sa kanilang financial situation, goals, at preferences',
                  },
                  {
                    title: 'Linawin ang halaga ng mga update',
                    description:
                      'Ipaliwanag kung paano nakakatulong ang updated information sa pagbibigay ng mas magandang, mas personalized na serbisyo at payo',
                  },
                ],
              },
              {
                title: '4. Call to Action',
                items: [
                  {
                    title: 'Buuin at kumpirmahin',
                    description:
                      'I-recap ang mga pangunahing benepisyong tinalakay at kumpirmahin ang kanilang interes sa upgrade',
                  },
                  {
                    title: 'Magmungkahi ng mga susunod na hakbang',
                    description:
                      'Magmungkahi ng follow-up meeting o specific actions para ma-activate ang kanilang Wealth services',
                  },
                  {
                    title: 'Tiyakin ang partnership',
                    description:
                      'Bigyang-diin ang patuloy na suporta at partnership na pwede nilang asahan sa hinaharap',
                  },
                ],
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
                items: [
                  {
                    title: 'Chào mừng & Chúc mừng',
                    subItems: [
                      'Chào đón khách hàng một cách nồng nhiệt và cảm ơn mối quan hệ của họ với Bank',
                      'Tham chiếu thành tích hoặc cột mốc của họ đủ điều kiện để nâng cấp',
                    ],
                  },
                  {
                    title: 'Ghi nhận hành trình của họ',
                    description:
                      'Thừa nhận tiến bộ tài chính của họ và mối quan hệ hiện tại với ngân hàng',
                  },
                  {
                    title: 'Khám phá các ưu tiên sắp tới',
                    description:
                      'Hỏi về những thay đổi trong cuộc sống, phát triển nghề nghiệp, hoặc mục tiêu tài chính mà họ đang theo đuổi',
                  },
                ],
              },
              {
                title: '2. Giới thiệu Tình trạng & Ưu đãi Mới',
                items: [
                  {
                    title: 'Trình bày nâng cấp như sự công nhận',
                    description:
                      'Đặt khung nâng cấp dịch vụ Wealth như sự thừa nhận thành công và tăng trưởng của họ',
                  },
                  {
                    title: 'Giải thích các lợi ích chính',
                    description:
                      'Nổi bật các lợi ích độc quyền và dịch vụ có sẵn thông qua Wealth Banking',
                  },
                  {
                    title: 'Kết nối với mục tiêu khách hàng',
                    description:
                      'Liên kết dịch vụ Wealth trực tiếp với các mục tiêu và ưu tiên tài chính đã nêu của họ',
                  },
                ],
              },
              {
                title: '3. Cập nhật Thông tin Khách hàng',
                items: [
                  {
                    title: 'Yêu cầu các cập nhật quan trọng',
                    description:
                      'Thu thập thông tin hiện tại về tình hình tài chính, mục tiêu và sở thích của họ',
                  },
                  {
                    title: 'Làm rõ giá trị của các cập nhật',
                    description:
                      'Giải thích cách thông tin cập nhật giúp cung cấp dịch vụ và lời khuyên tốt hơn, cá nhân hóa hơn',
                  },
                ],
              },
              {
                title: '4. Kêu gọi Hành động',
                items: [
                  {
                    title: 'Tóm tắt & xác nhận',
                    description:
                      'Tóm tắt các lợi ích chính đã thảo luận và xác nhận sự quan tâm của họ đối với việc nâng cấp',
                  },
                  {
                    title: 'Đề xuất các bước tiếp theo',
                    description:
                      'Đề xuất cuộc họp theo dõi hoặc các hành động cụ thể để kích hoạt dịch vụ Wealth của họ',
                  },
                  {
                    title: 'Đảm bảo quan hệ đối tác',
                    description:
                      'Nhấn mạnh sự hỗ trợ liên tục và quan hệ đối tác mà họ có thể mong đợi trong tương lai',
                  },
                ],
              },
            ],
          },
        },
      },

      // HSBC Client Onboarding
      'hsbc-client-onboarding': {
        base: {
          id: 'hsbc-client-onboarding',
          company: 'hsbc',
          moduleId: 'hsbc-client-onboarding',
        },
        localized: {
          // English
          en: {
            title: 'Client onboarding',
            description:
              'Structured approach for onboarding new clients to HSBC & Wealth services',
            steps: [
              {
                title: '1. Greeting and context setting',
                items: [
                  {
                    title:
                      "Welcome the client and establish rapport while introducing the bank's wealth management relationship model.",
                    subItems: [
                      'Welcome the client to the bank and express appreciation for choosing us.',
                      'Briefly introduce the wealth management relationship model (dedicated RM, tailored advisory, digital tools).',
                      'Explore client background and motivations for joining the bank (career, family, financial goals).',
                    ],
                  },
                ],
              },
              {
                title: '2. Introduction to HSBC wealth proposition',
                items: [
                  {
                    title:
                      "Introduce the bank's wealth proposition in a way that highlights differentiation and alignment with client's priorities.",
                    subItems: [
                      'Overview of wealth services and how they address different client needs (saving, investing, protection, planning).',
                      'Highlight key value propositions: holistic wealth planning, expert advisory, exclusive solutions, global access, or preferential rates.',
                    ],
                  },
                  {
                    title: 'Goal-based Wealth Management',
                    description:
                      "Tailored investment plans that align client's life goals to manage risk and capture growth, e.g., retirement planning, children's education, and legacy planning.",
                  },
                  {
                    title: 'Portfolio Diversification',
                    description:
                      'Active and flexible asset allocation in equity and fixed income securities, offering a diverse mix of high dividend equities, bonds, and emerging market debts.',
                  },
                  {
                    title: 'Lifestyle Benefits',
                    description:
                      'Enjoy premium perks such as bonus travel miles, lounge and limo services, F&B benefits, exclusive access to world-class entertainment, and more.',
                  },
                ],
              },
              {
                title: '3. Client profiling & onboarding',
                items: [
                  {
                    title:
                      "Understand the client's financial profile, risk appetite, and onboarding requirements.",
                    subItems: [
                      'Collect personal and financial details (age, occupation, family situation, income, goals).',
                      'Discuss overall financial position (assets, liabilities, income sources).',
                      'Explore product interests (deposits, investments, insurance, FX, etc.).',
                      'Assess risk appetite and investment experience.',
                      'Capture necessary documentation for KYC/onboarding.',
                      'Obtain consent & disclosures.',
                    ],
                  },
                ],
              },
              {
                title: '4. Call to action & next steps',
                items: [
                  {
                    title:
                      'Guide the client toward first engagement in wealth products and establish the relationship rhythm.',
                    subItems: [
                      'Recommend initial advisory session or portfolio review.',
                      'Align on immediate next steps (e.g., investment profiling, account setup, meeting with investment advisor).',
                      'Reassure the client of ongoing relationship support and access to dedicated wealth resources.',
                      'Invitation to and securing the next meeting',
                    ],
                  },
                  {
                    title: 'Bonus:',
                    description:
                      'Successfully inviting the client, and their partners, for a next consultation in person',
                  },
                ],
              },
            ],
          },

          // Cantonese
          yue: {
            title: '客戶迎新',
            description: '為新客戶加入滙豐財富管理服務而設嘅結構化方法',
            steps: [
              {
                title: '1. 問候同設定背景',
                items: [
                  {
                    title:
                      '歡迎客戶同建立融洽關係，同時介紹銀行嘅財富管理關係模式',
                    subItems: [
                      '歡迎客戶加入銀行，表達感謝佢哋選擇我哋',
                      '簡單介紹財富管理關係模式（專屬客戶經理、度身訂造嘅顧問、數碼工具）',
                      '探索客戶嘅背景同加入銀行嘅動機（事業、家庭、財務目標）',
                    ],
                  },
                ],
              },
              {
                title: '2. 介紹滙豐財富主張',
                items: [
                  {
                    title:
                      '以突顯差異化同配合客戶優先事項嘅方式介紹銀行嘅財富主張',
                    subItems: [
                      '概述財富服務同點樣滿足不同客戶需要（儲蓄、投資、保障、規劃）',
                      '強調主要價值主張：全面財富規劃、專家顧問、獨家方案、環球通達或優惠利率',
                    ],
                  },
                  {
                    title: '以目標為本嘅財富管理',
                    description:
                      '度身訂造嘅投資計劃配合客戶嘅人生目標，管理風險同把握增長，例如退休規劃、子女教育同遺產規劃',
                  },
                  {
                    title: '投資組合多元化',
                    description:
                      '主動靈活嘅資產配置於股票同固定收益證券，提供高息股、債券同新興市場債務嘅多元化組合',
                  },
                  {
                    title: '生活方式優惠',
                    description:
                      '享受優質禮遇，例如額外旅遊里數、貴賓室同禮車服務、餐飲優惠、獨家世界級娛樂通行證等',
                  },
                ],
              },
              {
                title: '3. 客戶資料同入門',
                items: [
                  {
                    title: '了解客戶嘅財務狀況、風險胃納同入門要求',
                    subItems: [
                      '收集個人同財務資料（年齡、職業、家庭狀況、收入、目標）',
                      '討論整體財務狀況（資產、負債、收入來源）',
                      '探索產品興趣（存款、投資、保險、外匯等）',
                      '評估風險胃納同投資經驗',
                      '收集 KYC/入門所需文件',
                      '獲得同意同披露',
                    ],
                  },
                ],
              },
              {
                title: '4. 行動呼籲同下一步',
                items: [
                  {
                    title: '引導客戶進行首次財富產品嘅參與，建立關係節奏',
                    subItems: [
                      '建議初步顧問會議或投資組合檢視',
                      '對齊即時嘅下一步（例如：投資分析、帳戶設置、同投資顧問會面）',
                      '向客戶保證持續嘅關係支援同專屬財富資源嘅使用',
                      '邀請同確保下次會議',
                    ],
                  },
                  {
                    title: '額外加分：',
                    description: '成功邀請客戶同佢哋嘅伴侶進行下次親身諮詢',
                  },
                ],
              },
            ],
          },
        },
      },

      // HSBC Client Upgrade
      'hsbc-client-upgrade': {
        base: {
          id: 'hsbc-client-upgrade',
          company: 'hsbc',
          moduleId: 'hsbc-client-upgrade',
        },
        localized: {
          // English
          en: {
            title: 'New to Wealth',
            description:
              'Structured approach for initiating a wealth journey with existing HSBC clients',
            steps: [
              {
                title: '1. Greeting and context setting',
                items: [
                  {
                    title:
                      'Welcome client into wealth and recap any key changes in their life',
                    subItems: [
                      'Welcome client into wealth',
                      'Customer life updates (career, family, lifestyle)',
                    ],
                  },
                ],
              },
              {
                title: '2. Introduction to new status & offerings',
                items: [
                  {
                    title:
                      "Introduce to wealth services by providing key benefits that suit to client's need",
                    subItems: [
                      'Overview of wealth services',
                      'Key benefits of upgrading to wealth customers e.g., extended product solutions',
                    ],
                  },
                  {
                    title: 'Goal-based Wealth Management',
                    description:
                      "Tailored investment plans that align client's life goals to manage risk and capture growth, e.g., retirement planning, children's education, and legacy planning.",
                  },
                  {
                    title: 'Portfolio Diversification',
                    description:
                      'Active and flexible asset allocation in equity and fixed income securities, offering diverse mix of high dividend equities, bonds, and emerging market debts',
                  },
                  {
                    title: 'Lifestyle Benefits',
                    description:
                      'Enjoy premium perks such as bonus travel miles, lounge and limo services, F&B benefits, exclusive access to world-class entertainment, and more.',
                  },
                ],
              },
              {
                title: '3. Client information update',
                items: [
                  {
                    title:
                      "Understand client profile & needs and capture key updates on customer's information",
                    subItems: [
                      'Updated personal info (age, occupation, lifestyle)',
                      'Overall wealth information (source of wealth, asset value)',
                      'Financial needs analysis & goal planning (short term vs med vs long term)',
                      'Product interest (deposits, insurance, equities, etc.)',
                      "Bank relationship (client's relationship with other banks)",
                      'Risk appetite & investment experience',
                      'Understand how HSBC can add value:',
                    ],
                  },
                  {
                    title: 'Goal-based Wealth Management',
                    description:
                      "Tailored investment plans that align client's life goals to manage risk and capture growth, e.g., retirement planning, children's education, and legacy planning.",
                  },
                  {
                    title: 'Portfolio Diversification',
                    description:
                      'Active and flexible asset allocation in equity and fixed income securities, offering diverse mix of high dividend equities, bonds, and emerging market debts',
                  },
                  {
                    title: 'Lifestyle Benefits',
                    description:
                      'Enjoy premium perks such as bonus travel miles, lounge and limo services, F&B benefits, exclusive access to world-class entertainment, and more.',
                  },
                  {
                    title: 'Notes:',
                    subItems: [
                      'HSBC helps with portfolio construction, bespoke, or through a selection of pre-set portfolios',
                      'Offers comprehensive Wealth Portfolio intelligence services for diversification, vol stress test analysis, and goal achievability simulations',
                    ],
                  },
                ],
              },
              {
                title: '4. Call to action',
                items: [
                  {
                    title:
                      'Convince client for additional product advisory service',
                    subItems: [
                      'Consent & acknowledgement',
                      'Alignment key next steps for investment advisory',
                      'Invitation to and securing the next meeting',
                    ],
                  },
                  {
                    title: 'Bonus:',
                    description:
                      'successfully inviting the client, and their partners, for a next consultation in person',
                  },
                ],
              },
            ],
          },
        },
      },
    },
  };
