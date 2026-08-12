import {
  ProductCompetitiveIntelligenceConfiguration,
  CompetitiveIntelligenceConfiguration,
} from './types.js';

// Shared competitive intelligence content for most Prudential products (excludes PruVantage)
const sharedPrudentialCompetitiveIntelligence: CompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'prudential-shared',
      company: 'prudential',
      targetMarket: 'insurance',
    },

    localized: {
      // English (Original)
      en: {
        competitors: [
          {
            name: 'HealthShield Gold Max',
            company: 'AIA Singapore',
            type: 'Integrated Shield Plan',
            keyFeatures: [
              'Comprehensive hospitalization coverage',
              'Multiple plan tiers available',
              'Add-on benefits and riders',
              'Strong healthcare provider network',
            ],
            strengths: [
              'Established brand recognition in health insurance',
              'Comprehensive coverage options',
              'Multiple plan tiers for different budgets',
              'Extensive healthcare provider partnerships',
            ],
            limitations: [
              'Higher premium costs vs basic options',
              'Complex plan structure with multiple tiers',
              'Annual premium increases with age',
              'Potentially overwhelming choice options',
            ],
            positioningStrategy:
              'Highlight our competitive premium rates, simpler plan structure, and comprehensive coverage without unnecessary complexity while maintaining superior service levels.',
          },
          {
            name: 'Supreme Health',
            company: 'Great Eastern',
            type: 'Health Insurance',
            keyFeatures: [
              'Comprehensive medical coverage',
              'Hospitalization benefits',
              'Integration with broader insurance portfolio',
              'Established market presence',
            ],
            strengths: [
              'Long-established Singapore presence',
              'Comprehensive coverage options',
              'Portfolio integration benefits',
              'Traditional reliability and trust',
            ],
            limitations: [
              'Limited digital innovation vs newer entrants',
              'Traditional customer service approach',
              'Less competitive pricing in segments',
              'Slower adoption of modern features',
            ],
            positioningStrategy:
              'Emphasize our digital-first approach, competitive pricing, and modern customer experience while maintaining comprehensive coverage and superior service innovation.',
          },
          {
            name: 'Enhanced IncomeShield',
            company: 'NTUC Income',
            type: 'Integrated Shield Plan',
            keyFeatures: [
              'Affordable comprehensive health coverage',
              'Social enterprise pricing model',
              'Accessibility focus across income levels',
              'Coverage tiers from basic to comprehensive',
            ],
            strengths: [
              'Competitive pricing through social enterprise model',
              'Strong community trust and brand loyalty',
              'Comprehensive basic coverage options',
              'Accessibility across income segments',
            ],
            limitations: [
              'Fewer premium service options vs private insurers',
              'Limited customization and personalization',
              'Focus on basic coverage rather than premium features',
              'Fewer value-added services',
            ],
            positioningStrategy:
              'Offer premium service levels, enhanced customization options, and value-added benefits while maintaining competitive pricing and superior customer experience.',
          },
        ],
      },

      // Indonesian
      id: {
        competitors: [
          {
            name: 'HealthShield Gold Max',
            company: 'AIA Singapore',
            type: 'Paket Perisai Terintegrasi',
            keyFeatures: [
              'Cakupan perawatan rumah sakit yang komprehensif',
              'Tersedia beberapa tingkat paket',
              'Manfaat dan rider tambahan',
              'Jaringan penyedia layanan kesehatan yang kuat',
            ],
            strengths: [
              'Pengakuan merek yang mapan dalam asuransi kesehatan',
              'Pilihan cakupan yang komprehensif',
              'Berbagai tingkat paket untuk berbagai anggaran',
              'Kemitraan penyedia layanan kesehatan yang luas',
            ],
            limitations: [
              'Biaya premi yang lebih tinggi vs opsi dasar',
              'Struktur paket yang kompleks dengan berbagai tingkat',
              'Peningkatan premi tahunan seiring bertambahnya usia',
              'Pilihan yang berpotensi membingungkan',
            ],
            positioningStrategy:
              'Soroti tarif premi kompetitif kami, struktur paket yang lebih sederhana, dan cakupan komprehensif tanpa kompleksitas yang tidak perlu sambil mempertahankan tingkat layanan yang superior.',
          },
          {
            name: 'Supreme Health',
            company: 'Great Eastern',
            type: 'Asuransi Kesehatan',
            keyFeatures: [
              'Cakupan medis yang komprehensif',
              'Manfaat perawatan rumah sakit',
              'Integrasi dengan portofolio asuransi yang lebih luas',
              'Kehadiran pasar yang mapan',
            ],
            strengths: [
              'Kehadiran Singapura yang sudah lama mapan',
              'Pilihan cakupan yang komprehensif',
              'Manfaat integrasi portofolio',
              'Keandalan dan kepercayaan tradisional',
            ],
            limitations: [
              'Inovasi digital terbatas vs pendatang baru',
              'Pendekatan layanan pelanggan tradisional',
              'Harga kurang kompetitif di beberapa segmen',
              'Adopsi fitur modern yang lambat',
            ],
            positioningStrategy:
              'Tekankan pendekatan digital-first kami, harga yang kompetitif, dan pengalaman pelanggan modern sambil mempertahankan cakupan komprehensif dan inovasi layanan yang superior.',
          },
          {
            name: 'Enhanced IncomeShield',
            company: 'NTUC Income',
            type: 'Paket Perisai Terintegrasi',
            keyFeatures: [
              'Cakupan kesehatan komprehensif yang terjangkau',
              'Model harga perusahaan sosial',
              'Fokus aksesibilitas di berbagai tingkat pendapatan',
              'Tingkat cakupan dari dasar hingga komprehensif',
            ],
            strengths: [
              'Harga kompetitif melalui model perusahaan sosial',
              'Kepercayaan komunitas yang kuat dan loyalitas merek',
              'Pilihan cakupan dasar yang komprehensif',
              'Aksesibilitas di berbagai segmen pendapatan',
            ],
            limitations: [
              'Opsi layanan premium yang lebih sedikit vs asuransi swasta',
              'Kustomisasi dan personalisasi yang terbatas',
              'Fokus pada cakupan dasar daripada fitur premium',
              'Layanan nilai tambah yang lebih sedikit',
            ],
            positioningStrategy:
              'Tawarkan tingkat layanan premium, opsi kustomisasi yang ditingkatkan, dan manfaat nilai tambah sambil mempertahankan harga yang kompetitif dan pengalaman pelanggan yang superior.',
          },
        ],
      },

      // Malaysian
      ms: {
        competitors: [
          {
            name: 'HealthShield Gold Max',
            company: 'AIA Singapore',
            type: 'Pelan Perisai Bersepadu',
            keyFeatures: [
              'Liputan penjagaan kemasukan hospital yang komprehensif',
              'Pelbagai peringkat pelan tersedia',
              'Manfaat dan rider tambahan',
              'Rangkaian penyedia penjagaan kesihatan yang kuat',
            ],
            strengths: [
              'Pengiktirafan jenama yang mapan dalam insurans kesihatan',
              'Pilihan liputan yang komprehensif',
              'Pelbagai peringkat pelan untuk bajet yang berbeza',
              'Perkongsian penyedia penjagaan kesihatan yang luas',
            ],
            limitations: [
              'Kos premium yang lebih tinggi vs pilihan asas',
              'Struktur pelan yang kompleks dengan pelbagai peringkat',
              'Peningkatan premium tahunan dengan umur',
              'Pilihan yang berpotensi membingungkan',
            ],
            positioningStrategy:
              'Tekankan kadar premium yang kompetitif, struktur pelan yang lebih mudah, dan liputan komprehensif tanpa kerumitan yang tidak perlu sambil mengekalkan tahap perkhidmatan yang unggul.',
          },
          {
            name: 'Supreme Health',
            company: 'Great Eastern',
            type: 'Insurans Kesihatan',
            keyFeatures: [
              'Liputan perubatan yang komprehensif',
              'Manfaat kemasukan hospital',
              'Integrasi dengan portfolio insurans yang lebih luas',
              'Kehadiran pasaran yang mapan',
            ],
            strengths: [
              'Kehadiran Singapura yang telah lama mapan',
              'Pilihan liputan yang komprehensif',
              'Manfaat integrasi portfolio',
              'Kebolehpercayaan dan kepercayaan tradisional',
            ],
            limitations: [
              'Inovasi digital terhad vs pendatang baru',
              'Pendekatan perkhidmatan pelanggan tradisional',
              'Harga kurang kompetitif dalam segmen',
              'Penggunaan ciri moden yang perlahan',
            ],
            positioningStrategy:
              'Tekankan pendekatan digital-first kami, harga yang kompetitif, dan pengalaman pelanggan moden sambil mengekalkan liputan komprehensif dan inovasi perkhidmatan yang unggul.',
          },
          {
            name: 'Enhanced IncomeShield',
            company: 'NTUC Income',
            type: 'Pelan Perisai Bersepadu',
            keyFeatures: [
              'Liputan kesihatan komprehensif yang mampu milik',
              'Model harga perusahaan sosial',
              'Fokus kebolehcapaian merentasi tahap pendapatan',
              'Peringkat liputan dari asas hingga komprehensif',
            ],
            strengths: [
              'Harga kompetitif melalui model perusahaan sosial',
              'Kepercayaan komuniti yang kuat dan kesetiaan jenama',
              'Pilihan liputan asas yang komprehensif',
              'Kebolehcapaian merentasi segmen pendapatan',
            ],
            limitations: [
              'Pilihan perkhidmatan premium yang kurang vs penanggung insurans swasta',
              'Kustomisasi dan personalisasi yang terhad',
              'Fokus pada liputan asas berbanding ciri premium',
              'Perkhidmatan nilai tambah yang lebih sedikit',
            ],
            positioningStrategy:
              'Tawarkan tahap perkhidmatan premium, pilihan kustomisasi yang dipertingkatkan, dan manfaat nilai tambah sambil mengekalkan harga yang kompetitif dan pengalaman pelanggan yang unggul.',
          },
        ],
      },

      // Tagalog (Filipino)
      tl: {
        competitors: [
          {
            name: 'HealthShield Gold Max',
            company: 'AIA Singapore',
            type: 'Integrated Shield Plan',
            keyFeatures: [
              'Comprehensive hospitalization coverage',
              'Multiple plan tiers available',
              'Add-on benefits at riders',
              'Malakas na healthcare provider network',
            ],
            strengths: [
              'Established brand recognition sa health insurance',
              'Comprehensive coverage options',
              'Multiple plan tiers para sa iba-ibang budget',
              'Extensive healthcare provider partnerships',
            ],
            limitations: [
              'Mas mataas na premium costs vs basic options',
              'Complex plan structure na may multiple tiers',
              'Annual premium increases na tumataas sa edad',
              'Potentially overwhelming choice options',
            ],
            positioningStrategy:
              'I-highlight ang aming competitive premium rates, mas simple na plan structure, at comprehensive coverage na walang unnecessary complexity habang pinapanatili ang superior service levels.',
          },
          {
            name: 'Supreme Health',
            company: 'Great Eastern',
            type: 'Health Insurance',
            keyFeatures: [
              'Comprehensive medical coverage',
              'Hospitalization benefits',
              'Integration sa broader insurance portfolio',
              'Established market presence',
            ],
            strengths: [
              'Long-established Singapore presence',
              'Comprehensive coverage options',
              'Portfolio integration benefits',
              'Traditional reliability at trust',
            ],
            limitations: [
              'Limited digital innovation vs newer entrants',
              'Traditional customer service approach',
              'Less competitive pricing sa segments',
              'Slower adoption ng modern features',
            ],
            positioningStrategy:
              'I-emphasize ang aming digital-first approach, competitive pricing, at modern customer experience habang pinapanatili ang comprehensive coverage at superior service innovation.',
          },
          {
            name: 'Enhanced IncomeShield',
            company: 'NTUC Income',
            type: 'Integrated Shield Plan',
            keyFeatures: [
              'Affordable comprehensive health coverage',
              'Social enterprise pricing model',
              'Accessibility focus across income levels',
              'Coverage tiers from basic to comprehensive',
            ],
            strengths: [
              'Competitive pricing through social enterprise model',
              'Malakas na community trust at brand loyalty',
              'Comprehensive basic coverage options',
              'Accessibility across income segments',
            ],
            limitations: [
              'Fewer premium service options vs private insurers',
              'Limited customization at personalization',
              'Focus sa basic coverage rather than premium features',
              'Fewer value-added services',
            ],
            positioningStrategy:
              'Mag-offer ng premium service levels, enhanced customization options, at value-added benefits habang pinapanatili ang competitive pricing at superior customer experience.',
          },
        ],
      },

      // Vietnamese
      vi: {
        competitors: [
          {
            name: 'HealthShield Gold Max',
            company: 'AIA Singapore',
            type: 'Gói Bảo hiểm Tích hợp',
            keyFeatures: [
              'Bảo hiểm nội trú toàn diện',
              'Nhiều cấp độ gói bảo hiểm có sẵn',
              'Quyền lợi bổ sung và điều khoản rider',
              'Mạng lưới nhà cung cấp dịch vụ y tế mạnh mẽ',
            ],
            strengths: [
              'Thương hiệu được công nhận rộng rãi trong bảo hiểm sức khỏe',
              'Các lựa chọn bảo hiểm toàn diện',
              'Nhiều cấp độ gói cho các ngân sách khác nhau',
              'Quan hệ đối tác rộng rãi với các nhà cung cấp dịch vụ y tế',
            ],
            limitations: [
              'Chi phí phí bảo hiểm cao hơn so với các lựa chọn cơ bản',
              'Cấu trúc gói phức tạp với nhiều cấp độ',
              'Phí bảo hiểm hàng năm tăng theo tuổi',
              'Có thể gây choáng ngợp với quá nhiều lựa chọn',
            ],
            positioningStrategy:
              'Nhấn mạnh mức phí bảo hiểm cạnh tranh của chúng tôi, cấu trúc gói đơn giản hơn, và bảo hiểm toàn diện mà không có sự phức tạp không cần thiết trong khi duy trì mức độ dịch vụ vượt trội.',
          },
          {
            name: 'Supreme Health',
            company: 'Great Eastern',
            type: 'Bảo hiểm Sức khỏe',
            keyFeatures: [
              'Bảo hiểm y tế toàn diện',
              'Quyền lợi nội trú',
              'Tích hợp với danh mục bảo hiểm rộng hơn',
              'Sự hiện diện thị trường đã được thiết lập',
            ],
            strengths: [
              'Sự hiện diện lâu đời tại Singapore',
              'Các lựa chọn bảo hiểm toàn diện',
              'Lợi ích tích hợp danh mục đầu tư',
              'Độ tin cậy và niềm tin truyền thống',
            ],
            limitations: [
              'Đổi mới số hạn chế so với các công ty mới',
              'Phương pháp dịch vụ khách hàng truyền thống',
              'Giá cả ít cạnh tranh trong một số phân khúc',
              'Chậm áp dụng các tính năng hiện đại',
            ],
            positioningStrategy:
              'Nhấn mạnh phương pháp ưu tiên số của chúng tôi, giá cả cạnh tranh, và trải nghiệm khách hàng hiện đại trong khi duy trì bảo hiểm toàn diện và đổi mới dịch vụ vượt trội.',
          },
          {
            name: 'Enhanced IncomeShield',
            company: 'NTUC Income',
            type: 'Gói Bảo hiểm Tích hợp',
            keyFeatures: [
              'Bảo hiểm sức khỏe toàn diện giá cả phải chăng',
              'Mô hình định giá doanh nghiệp xã hội',
              'Tập trung vào khả năng tiếp cận qua các mức thu nhập',
              'Các cấp độ bảo hiểm từ cơ bản đến toàn diện',
            ],
            strengths: [
              'Giá cả cạnh tranh thông qua mô hình doanh nghiệp xã hội',
              'Lòng tin cộng đồng mạnh mẽ và lòng trung thành thương hiệu',
              'Các lựa chọn bảo hiểm cơ bản toàn diện',
              'Khả năng tiếp cận qua các phân khúc thu nhập',
            ],
            limitations: [
              'Ít lựa chọn dịch vụ cao cấp hơn so với các công ty bảo hiểm tư nhân',
              'Tùy chỉnh và cá nhân hóa hạn chế',
              'Tập trung vào bảo hiểm cơ bản thay vì các tính năng cao cấp',
              'Ít dịch vụ giá trị gia tăng hơn',
            ],
            positioningStrategy:
              'Cung cấp các mức độ dịch vụ cao cấp, các lựa chọn tùy chỉnh nâng cao, và các quyền lợi giá trị gia tăng trong khi duy trì giá cả cạnh tranh và trải nghiệm khách hàng vượt trội.',
          },
        ],
      },

      // Thai
      th: {
        competitors: [
          {
            name: 'HealthShield Gold Max',
            company: 'AIA Singapore',
            type: 'แผนประกันป้องกันแบบบูรณาการ',
            keyFeatures: [
              'ความคุ้มครองการรักษาในโรงพยาบาลอย่างครอบคลุม',
              'มีหลายระดับของแผนให้เลือก',
              'ผลประโยชน์เสริมและไรเดอร์',
              'เครือข่ายผู้ให้บริการด้านสุขภาพที่แข็งแกร่ง',
            ],
            strengths: [
              'การรับรู้แบรนด์ที่ก่อตั้งมาแล้วในประกันสุขภาพ',
              'ตัวเลือกความคุ้มครองที่ครอบคลุม',
              'หลายระดับของแผนสำหรับงบประมาณที่แตกต่างกัน',
              'ความร่วมมือกับผู้ให้บริการด้านสุขภาพอย่างกว้างขวาง',
            ],
            limitations: [
              'ค่าเบี้ยประกันที่สูงกว่าเมื่อเทียบกับตัวเลือกขั้นพื้นฐาน',
              'โครงสร้างแผนที่ซับซ้อนด้วยหลายระดับ',
              'ค่าเบี้ยประกันรายปีที่เพิ่มขึ้นตามอายุ',
              'ตัวเลือกที่อาจทำให้สับสนได้',
            ],
            positioningStrategy:
              'เน้นอัตราค่าเบี้ยประกันที่แข่งขันได้ โครงสร้างแผนที่ง่ายกว่า และความคุ้มครองที่ครอบคลุมโดยไม่มีความซับซ้อนที่ไม่จำเป็น ขณะที่รักษาระดับบริการที่เหนือกว่า',
          },
          {
            name: 'Supreme Health',
            company: 'Great Eastern',
            type: 'ประกันสุขภาพ',
            keyFeatures: [
              'ความคุ้มครองทางการแพทย์ที่ครอบคลุม',
              'ผลประโยชน์การรักษาในโรงพยาบาล',
              'การบูรณาการกับพอร์ตโฟลิโอประกันที่กว้างขวางกว่า',
              'การมีอยู่ในตลาดที่ก่อตั้งมาแล้ว',
            ],
            strengths: [
              'การมีอยู่ในสิงคโปร์ที่ก่อตั้งมายาวนาน',
              'ตัวเลือกความคุ้มครองที่ครอบคลุม',
              'ผลประโยชน์จากการบูรณาการพอร์ตโฟลิโอ',
              'ความเชื่อถือและความไว้วางใจแบบดั้งเดิม',
            ],
            limitations: [
              'นวัตกรรมดิจิทัลที่จำกัดเมื่อเทียบกับผู้เข้าใหม่',
              'แนวทางบริการลูกค้าแบบดั้งเดิม',
              'การกำหนดราคาที่แข่งขันได้น้อยกว่าในบางส่วน',
              'การนำฟีเจอร์สมัยใหม่มาใช้ที่ช้า',
            ],
            positioningStrategy:
              'เน้นแนวทางดิจิทัลเป็นหลัก การกำหนดราคาที่แข่งขันได้ และประสบการณ์ลูกค้าที่ทันสมัย ขณะที่รักษาความคุ้มครองที่ครอบคลุมและนวัตกรรมบริการที่เหนือกว่า',
          },
          {
            name: 'Enhanced IncomeShield',
            company: 'NTUC Income',
            type: 'แผนประกันป้องกันแบบบูรณาการ',
            keyFeatures: [
              'ความคุ้มครองสุขภาพที่ครอบคลุมและราคาไม่แพง',
              'โมเดลการกำหนดราคาของวิสาหกิจเพื่อสังคม',
              'การเน้นการเข้าถึงได้ในทุกระดับรายได้',
              'ระดับความคุ้มครองจากพื้นฐานถึงครอบคลุม',
            ],
            strengths: [
              'การกำหนดราคาที่แข่งขันได้ผ่านโมเดลวิสาหกิจเพื่อสังคม',
              'ความไว้วางใจของชุมชนที่แข็งแกร่งและความภักดีต่อแบรนด์',
              'ตัวเลือกความคุ้มครองพื้นฐานที่ครอบคลุม',
              'การเข้าถึงได้ในทุกส่วนของรายได้',
            ],
            limitations: [
              'ตัวเลือกบริการพรีเมียมที่น้อยกว่าเมื่อเทียบกับผู้ประกันเอกชน',
              'การปรับแต่งและการทำให้เป็นส่วนบุคคลที่จำกัด',
              'การเน้นความคุ้มครองพื้นฐานมากกว่าฟีเจอร์พรีเมียม',
              'บริการที่เพิ่มมูลค่าที่น้อยกว่า',
            ],
            positioningStrategy:
              'เสนอระดับบริการพรีเมียม ตัวเลือกการปรับแต่งที่ปรับปรุงแล้ว และผลประโยชน์ที่เพิ่มมูลค่า ขณะที่รักษาการกำหนดราคาที่แข่งขันได้และประสบการณ์ลูกค้าที่เหนือกว่า',
          },
        ],
      },

      // Cebuano
      ceb: {
        competitors: [
          {
            name: 'HealthShield Gold Max',
            company: 'AIA Singapore',
            type: 'Integrated Shield Plan',
            keyFeatures: [
              'Komprehensibong hospitalization coverage',
              'Daghang plan tiers nga available',
              'Add-on benefits ug riders',
              'Lig-on nga healthcare provider network',
            ],
            strengths: [
              'Natukod nga brand recognition sa health insurance',
              'Komprehensibong coverage options',
              'Daghang plan tiers alang sa lain-laing budget',
              'Halapad nga healthcare provider partnerships',
            ],
            limitations: [
              'Mas taas nga premium costs vs basic options',
              'Complex plan structure nga adunay daghang tiers',
              'Annual premium increases nga motubo sa edad',
              'Mahimong makapalibog nga daghang options',
            ],
            positioningStrategy:
              'I-highlight ang among competitive premium rates, mas simple nga plan structure, ug comprehensive coverage nga walay unnecessary complexity samtang gipreserbar ang superior service levels.',
          },
          {
            name: 'Supreme Health',
            company: 'Great Eastern',
            type: 'Health Insurance',
            keyFeatures: [
              'Komprehensibong medical coverage',
              'Hospitalization benefits',
              'Integration sa mas halapad nga insurance portfolio',
              'Natukod nga market presence',
            ],
            strengths: [
              'Taas nga nakaestablished nga Singapore presence',
              'Komprehensibong coverage options',
              'Portfolio integration benefits',
              'Tradisyonal nga reliability ug pagsalig',
            ],
            limitations: [
              'Limited digital innovation vs bag-ong entrants',
              'Tradisyonal nga customer service approach',
              'Kulang sa competitive pricing sa pipila ka segments',
              'Hinay nga pag-adopt sa modern features',
            ],
            positioningStrategy:
              'I-emphasize ang among digital-first approach, competitive pricing, ug modern customer experience samtang gipreserbar ang comprehensive coverage ug superior service innovation.',
          },
          {
            name: 'Enhanced IncomeShield',
            company: 'NTUC Income',
            type: 'Integrated Shield Plan',
            keyFeatures: [
              'Affordable comprehensive health coverage',
              'Social enterprise pricing model',
              'Accessibility focus sa tanan nga income levels',
              'Coverage tiers gikan sa basic hangtod comprehensive',
            ],
            strengths: [
              'Competitive pricing pinaagi sa social enterprise model',
              'Lig-on nga community trust ug brand loyalty',
              'Comprehensive basic coverage options',
              'Accessibility sa tanan nga income segments',
            ],
            limitations: [
              'Kulang sa premium service options vs private insurers',
              'Limited customization ug personalization',
              'Focus sa basic coverage kaysa premium features',
              'Kulang sa value-added services',
            ],
            positioningStrategy:
              'Magtanyag ug premium service levels, enhanced customization options, ug value-added benefits samtang gipreserbar ang competitive pricing ug superior customer experience.',
          },
        ],
      },

      // Traditional Chinese (Taiwan)
      cmn: {
        competitors: [
          {
            name: 'HealthShield Gold Max',
            company: 'AIA Singapore',
            type: '整合式保障計劃',
            keyFeatures: [
              '全面的住院保障',
              '多種計劃等級可供選擇',
              '附加福利和附約',
              '強大的醫療服務提供者網絡',
            ],
            strengths: [
              '在健康保險領域具有良好的品牌知名度',
              '全面的保障選項',
              '多種計劃等級適合不同預算',
              '廣泛的醫療服務提供者合作夥伴',
            ],
            limitations: [
              '與基本選項相比保費成本較高',
              '多層級的複雜計劃結構',
              '年度保費隨年齡增長而提高',
              '選項可能過多令人困惑',
            ],
            positioningStrategy:
              '強調我們具有競爭力的保費費率、更簡單的計劃結構，以及全面的保障而無不必要的複雜性，同時維持優質的服務水準。',
          },
          {
            name: 'Supreme Health',
            company: 'Great Eastern',
            type: '健康保險',
            keyFeatures: [
              '全面的醫療保障',
              '住院福利',
              '與更廣泛的保險組合整合',
              '成熟的市場地位',
            ],
            strengths: [
              '在新加坡長期深耕',
              '全面的保障選項',
              '投資組合整合優勢',
              '傳統的可靠性和信任',
            ],
            limitations: [
              '與新進者相比數位創新有限',
              '傳統的客戶服務方式',
              '在某些領域的定價競爭力較弱',
              '採用現代功能的速度較慢',
            ],
            positioningStrategy:
              '強調我們的數位優先策略、具競爭力的定價，以及現代化的客戶體驗，同時維持全面的保障和優質的服務創新。',
          },
          {
            name: 'Enhanced IncomeShield',
            company: 'NTUC Income',
            type: '整合式保障計劃',
            keyFeatures: [
              '價格實惠的全面健康保障',
              '社會企業定價模式',
              '跨收入水平的可及性',
              '從基本到全面的保障等級',
            ],
            strengths: [
              '透過社會企業模式提供具競爭力的價格',
              '強大的社區信任和品牌忠誠度',
              '全面的基本保障選項',
              '跨收入階層的可及性',
            ],
            limitations: [
              '與私人保險公司相比高階服務選項較少',
              '客製化和個人化有限',
              '專注於基本保障而非高階功能',
              '附加價值服務較少',
            ],
            positioningStrategy:
              '提供高階服務水準、增強的客製化選項，以及附加價值福利，同時維持具競爭力的價格和優質的客戶體驗。',
          },
        ],
      },
    },
  };

// Product-specific competitive intelligence configurations
const allProductsExploratoryCompetitiveIntelligence: CompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'prudential-all-products-exploratory',
      company: 'prudential',
      productId: 'all-products-exploratory',
      targetMarket: 'insurance',
    },
    localized: sharedPrudentialCompetitiveIntelligence.localized,
  };

const prushieldCompetitiveIntelligence: CompetitiveIntelligenceConfiguration = {
  base: {
    id: 'prudential-prushield',
    company: 'prudential',
    productId: 'prushield',
    targetMarket: 'insurance',
  },
  localized: sharedPrudentialCompetitiveIntelligence.localized,
};

const prulifetimeIncomePlusCompetitiveIntelligence: CompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'prudential-prulifetime-income-plus',
      company: 'prudential',
      productId: 'prulifetime-income-plus',
      targetMarket: 'insurance',
    },
    localized: sharedPrudentialCompetitiveIntelligence.localized,
  };

// PruVantage Assure II competitive intelligence
const pruvantageAssureIICompetitiveIntelligence: CompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'prudential-pruvantage-assure-ii',
      company: 'prudential',
      productId: 'pruvantage-assure-ii',
      targetMarket: 'investment-linked insurance',
    },
    localized: {
      // English
      en: {
        competitors: [
          {
            name: 'Invest Ready III',
            company: 'Manulife',
            type: 'Investment-Linked Policy',
            keyFeatures: [
              'Multiple premium term options with Flexi Start Dates',
              'Minimum Investment Period (MIP) structure',
              'Welcome Bonus up to 15% for longer terms',
              'Loyalty Bonus 0.30% after MIP completion',
              'Premium flexibility after Flexi Start Date',
              'Top-up premiums with 0% premium charge',
              'Change of Life Assured option available',
            ],
            strengths: [
              'Flexible premium payment structure with multiple options',
              'No premium charge on top-up premiums',
              'Comprehensive bonus structure including welcome and loyalty bonuses',
              'Premium holiday option available',
              'Wide range of entry ages across different terms',
            ],
            limitations: [
              'Complex premium structure with multiple MIP and Flexi combinations',
              'High minimum premiums for shorter terms (up to S$25,000 p.a.)',
              'High administrative charges during MIP period (2.50% p.a.)',
              'Surrender charges apply for full MIP duration',
              'Policy fees apply for lower premium amounts',
              'No unique downside protection features',
            ],
            positioningStrategy:
              'PRUVantage Assure II offers superior simplicity with our innovative Wealth Assure feature that locks in peak portfolio values for downside protection - something Invest Ready III cannot match. While they offer complex MIP structures, we provide clearer premium terms (5-25 years) with growing Sum Assured and first-in-market wealth protection.',
          },
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA',
            type: 'Investment-Linked Policy',
            keyFeatures: [
              'Initial Investment Period (IIP) of 10, 15 or 20 years',
              'Welcome Bonus up to 75% over 3 years for 20-year IIP',
              'Special Bonus: 5% from year 10-20, 8% from year 21 onwards',
              'Accidental Death Benefit in first 2 years',
              'Premium Pass option to waive holiday charges',
              'Secondary Insured Option available',
              'Minimum premium from S$2,400 p.a.',
            ],
            strengths: [
              'Competitive minimum premium requirement',
              'High welcome bonus potential over 3 years',
              'Special ongoing bonus structure from year 10',
              'Additional accidental death coverage in early years',
              'Premium Pass flexibility option',
              'Secondary insured coverage available',
            ],
            limitations: [
              'Limited to 3 IIP options vs our 5 flexible terms',
              'Top-up premiums carry 5% premium charge vs our 3%',
              'Complex charge structure with multiple fee types',
              'No withdrawals allowed until 2 years of premiums paid',
              'No unique wealth protection or downside coverage',
              'Supplementary charges apply for 10 years',
            ],
            positioningStrategy:
              'PRUVantage Assure II provides superior wealth protection through our first-in-market Wealth Assure feature and more flexible premium terms (5-25 years vs their 3 IIP options). Our lower top-up charges (3% vs 5%) and unique daily wealth lock-in protection offer better value and security than Pro Achiever 3.0.',
          },
          {
            name: 'GREAT Wealth Advantage 4',
            company: 'Great Eastern',
            type: 'Investment-Linked Policy',
            keyFeatures: [
              'Choice periods of 5, 10, or 15 years',
              'Welcome Bonus up to 55% for Choice 15',
              'Premium Bonus 2% after Choice period',
              'Loyalty Bonus 0.30% p.a. from 10th/15th year',
              'Flexibility after Choice period completion',
              'Total Permanent Disability (TPD) and Terminal Illness benefits',
              'Change of Life Assured option available',
            ],
            strengths: [
              'Low minimum premiums (S$1,200 p.a. for Choice 15)',
              'High welcome bonus potential for longer terms',
              'Multiple bonus structures including premium and loyalty bonuses',
              'Additional TPD and TI benefits included',
              'Premium flexibility after Choice period',
              'Lower top-up premium charge (3%)',
            ],
            limitations: [
              'Surrender charges apply for full Choice period duration',
              'Complex fee structure varying by Choice period',
              'High policy fees during initial years (up to 2.50%)',
              'Premium Holiday charges during Choice period',
              'Limited flexibility during Choice period',
              'No downside protection or wealth assurance features',
            ],
            positioningStrategy:
              'While GREAT Wealth Advantage 4 offers competitive premiums and bonuses, PRUVantage Assure II delivers superior value through our unique Wealth Assure protection that secures your peak portfolio value. Our growing Sum Assured (3% annually) and simplified charge structure provide clearer benefits and better long-term wealth protection than their Choice-based system.',
          },
        ],
      },
      // Indonesian
      id: {
        competitors: [
          {
            name: 'Invest Ready III',
            company: 'Manulife',
            type: 'Polis Terkait Investasi',
            keyFeatures: [
              'Pilihan jangka premi yang beragam dengan Tanggal Mulai Fleksi',
              'Struktur Periode Investasi Minimum (MIP)',
              'Bonus Selamat Datang hingga 15% untuk jangka panjang',
              'Bonus Loyalitas 0,30% setelah penyelesaian MIP',
              'Fleksibilitas premi setelah Tanggal Mulai Fleksi',
              'Premi top-up dengan biaya premi 0%',
              'Opsi Perubahan Tertanggung tersedia',
            ],
            strengths: [
              'Struktur pembayaran premi fleksibel dengan beragam pilihan',
              'Tidak ada biaya premi untuk premi top-up',
              'Struktur bonus komprehensif termasuk bonus selamat datang dan loyalitas',
              'Opsi libur premi tersedia',
              'Rentang usia masuk yang luas di berbagai jangka',
            ],
            limitations: [
              'Struktur premi kompleks dengan beragam kombinasi MIP dan Fleksi',
              'Premi minimum tinggi untuk jangka pendek (hingga S$25.000 per tahun)',
              'Biaya administrasi tinggi selama periode MIP (2,50% per tahun)',
              'Biaya penyerahan berlaku selama durasi MIP penuh',
              'Biaya polis berlaku untuk jumlah premi yang lebih rendah',
              'Tidak ada fitur perlindungan kerugian yang unik',
            ],
            positioningStrategy:
              'PRUVantage Assure II menawarkan kesederhanaan superior dengan fitur Wealth Assure inovatif yang mengunci nilai puncak portofolio untuk perlindungan kerugian - sesuatu yang tidak dapat ditandingi Invest Ready III. Sementara mereka menawarkan struktur MIP yang kompleks, kami menyediakan jangka premi yang lebih jelas (5-25 tahun) dengan Sum Assured yang tumbuh dan perlindungan kekayaan pertama di pasar.',
          },
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA',
            type: 'Polis Terkait Investasi',
            keyFeatures: [
              'Periode Investasi Awal (IIP) 10, 15 atau 20 tahun',
              'Bonus Selamat Datang hingga 75% selama 3 tahun untuk IIP 20 tahun',
              'Bonus Khusus: 5% dari tahun 10-20, 8% dari tahun 21 dan seterusnya',
              'Manfaat Kematian Akibat Kecelakaan dalam 2 tahun pertama',
              'Opsi Premium Pass untuk menghapus biaya libur',
              'Opsi Tertanggung Sekunder tersedia',
              'Premi minimum dari S$2.400 per tahun',
            ],
            strengths: [
              'Persyaratan premi minimum yang kompetitif',
              'Potensi bonus selamat datang tinggi selama 3 tahun',
              'Struktur bonus berkelanjutan khusus dari tahun 10',
              'Cakupan kematian akibat kecelakaan tambahan di tahun-tahun awal',
              'Opsi fleksibilitas Premium Pass',
              'Cakupan tertanggung sekunder tersedia',
            ],
            limitations: [
              'Terbatas pada 3 opsi IIP vs 5 jangka fleksibel kami',
              'Premi top-up dikenakan biaya 5% vs 3% kami',
              'Struktur biaya kompleks dengan beragam jenis biaya',
              'Tidak ada penarikan yang diizinkan hingga 2 tahun premi dibayar',
              'Tidak ada perlindungan kekayaan unik atau cakupan kerugian',
              'Biaya tambahan berlaku selama 10 tahun',
            ],
            positioningStrategy:
              'PRUVantage Assure II memberikan perlindungan kekayaan superior melalui fitur Wealth Assure pertama di pasar dan jangka premi yang lebih fleksibel (5-25 tahun vs 3 opsi IIP mereka). Biaya top-up yang lebih rendah (3% vs 5%) dan perlindungan penguncian kekayaan harian yang unik menawarkan nilai dan keamanan yang lebih baik daripada Pro Achiever 3.0.',
          },
          {
            name: 'GREAT Wealth Advantage 4',
            company: 'Great Eastern',
            type: 'Polis Terkait Investasi',
            keyFeatures: [
              'Periode Pilihan 5, 10, atau 15 tahun',
              'Bonus Selamat Datang hingga 55% untuk Pilihan 15',
              'Bonus Premi 2% setelah periode Pilihan',
              'Bonus Loyalitas 0,30% per tahun dari tahun ke-10/15',
              'Fleksibilitas setelah penyelesaian periode Pilihan',
              'Manfaat Cacat Total Permanen (TPD) dan Penyakit Terminal',
              'Opsi Perubahan Tertanggung tersedia',
            ],
            strengths: [
              'Premi minimum rendah (S$1.200 per tahun untuk Pilihan 15)',
              'Potensi bonus selamat datang tinggi untuk jangka panjang',
              'Struktur bonus berganda termasuk bonus premi dan loyalitas',
              'Manfaat TPD dan TI tambahan termasuk',
              'Fleksibilitas premi setelah periode Pilihan',
              'Biaya premi top-up yang lebih rendah (3%)',
            ],
            limitations: [
              'Biaya penyerahan berlaku selama durasi periode Pilihan penuh',
              'Struktur biaya kompleks yang bervariasi berdasarkan periode Pilihan',
              'Biaya polis tinggi selama tahun-tahun awal (hingga 2,50%)',
              'Biaya Libur Premi selama periode Pilihan',
              'Fleksibilitas terbatas selama periode Pilihan',
              'Tidak ada perlindungan kerugian atau fitur jaminan kekayaan',
            ],
            positioningStrategy:
              'Meskipun GREAT Wealth Advantage 4 menawarkan premi dan bonus yang kompetitif, PRUVantage Assure II memberikan nilai superior melalui perlindungan Wealth Assure unik yang mengamankan nilai puncak portofolio Anda. Sum Assured yang tumbuh (3% tahunan) dan struktur biaya yang disederhanakan memberikan manfaat yang lebih jelas dan perlindungan kekayaan jangka panjang yang lebih baik daripada sistem berbasis Pilihan mereka.',
          },
        ],
      },
      // Malaysian
      ms: {
        competitors: [
          {
            name: 'Invest Ready III',
            company: 'Manulife',
            type: 'Polisi Berkaitan Pelaburan',
            keyFeatures: [
              'Pelbagai pilihan tempoh premium dengan Tarikh Mula Fleksi',
              'Struktur Tempoh Pelaburan Minimum (MIP)',
              'Bonus Selamat Datang sehingga 15% untuk tempoh panjang',
              'Bonus Kesetiaan 0.30% selepas tamat MIP',
              'Fleksibiliti premium selepas Tarikh Mula Fleksi',
              'Premium tambahan dengan caj premium 0%',
              'Pilihan Pertukaran Nyawa Diinsuranskan tersedia',
            ],
            strengths: [
              'Struktur pembayaran premium fleksibel dengan pelbagai pilihan',
              'Tiada caj premium untuk premium tambahan',
              'Struktur bonus komprehensif termasuk bonus selamat datang dan kesetiaan',
              'Pilihan cuti premium tersedia',
              'Julat umur kemasukan yang luas merentasi tempoh berbeza',
            ],
            limitations: [
              'Struktur premium kompleks dengan pelbagai kombinasi MIP dan Fleksi',
              'Premium minimum tinggi untuk tempoh pendek (sehingga S$25,000 setahun)',
              'Caj pentadbiran tinggi semasa tempoh MIP (2.50% setahun)',
              'Caj penyerahan dikenakan untuk tempoh MIP penuh',
              'Yuran polisi dikenakan untuk jumlah premium yang lebih rendah',
              'Tiada ciri perlindungan kerugian yang unik',
            ],
            positioningStrategy:
              'PRUVantage Assure II menawarkan kesederhanaan unggul dengan ciri Wealth Assure inovatif yang mengunci nilai puncak portfolio untuk perlindungan kerugian - sesuatu yang tidak dapat ditandingi Invest Ready III. Sementara mereka menawarkan struktur MIP yang kompleks, kami menyediakan tempoh premium yang lebih jelas (5-25 tahun) dengan Sum Assured yang berkembang dan perlindungan kekayaan terunggul di pasaran.',
          },
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA',
            type: 'Polisi Berkaitan Pelaburan',
            keyFeatures: [
              'Tempoh Pelaburan Awal (IIP) 10, 15 atau 20 tahun',
              'Bonus Selamat Datang sehingga 75% dalam 3 tahun untuk IIP 20 tahun',
              'Bonus Khas: 5% dari tahun 10-20, 8% dari tahun 21 dan seterusnya',
              'Manfaat Kematian Akibat Kemalangan dalam 2 tahun pertama',
              'Pilihan Premium Pass untuk mengetepikan caj cuti',
              'Pilihan Diinsuranskan Sekunder tersedia',
              'Premium minimum dari S$2,400 setahun',
            ],
            strengths: [
              'Keperluan premium minimum yang kompetitif',
              'Potensi bonus selamat datang tinggi dalam 3 tahun',
              'Struktur bonus berterusan khas dari tahun 10',
              'Perlindungan kematian akibat kemalangan tambahan di tahun-tahun awal',
              'Pilihan fleksibiliti Premium Pass',
              'Perlindungan diinsuranskan sekunder tersedia',
            ],
            limitations: [
              'Terhad kepada 3 pilihan IIP berbanding 5 tempoh fleksibel kami',
              'Premium tambahan dikenakan caj 5% berbanding 3% kami',
              'Struktur caj kompleks dengan pelbagai jenis yuran',
              'Tiada pengeluaran dibenarkan sehingga 2 tahun premium dibayar',
              'Tiada perlindungan kekayaan unik atau perlindungan kerugian',
              'Caj tambahan dikenakan selama 10 tahun',
            ],
            positioningStrategy:
              'PRUVantage Assure II memberikan perlindungan kekayaan unggul melalui ciri Wealth Assure terunggul di pasaran dan tempoh premium yang lebih fleksibel (5-25 tahun berbanding 3 pilihan IIP mereka). Caj tambahan yang lebih rendah (3% berbanding 5%) dan perlindungan penguncian kekayaan harian yang unik menawarkan nilai dan keselamatan yang lebih baik daripada Pro Achiever 3.0.',
          },
          {
            name: 'GREAT Wealth Advantage 4',
            company: 'Great Eastern',
            type: 'Polisi Berkaitan Pelaburan',
            keyFeatures: [
              'Tempoh Pilihan 5, 10, atau 15 tahun',
              'Bonus Selamat Datang sehingga 55% untuk Pilihan 15',
              'Bonus Premium 2% selepas tempoh Pilihan',
              'Bonus Kesetiaan 0.30% setahun dari tahun ke-10/15',
              'Fleksibiliti selepas tamat tempoh Pilihan',
              'Manfaat Hilang Upaya Kekal Menyeluruh (TPD) dan Penyakit Terminal',
              'Pilihan Pertukaran Nyawa Diinsuranskan tersedia',
            ],
            strengths: [
              'Premium minimum rendah (S$1,200 setahun untuk Pilihan 15)',
              'Potensi bonus selamat datang tinggi untuk tempoh panjang',
              'Struktur bonus berganda termasuk bonus premium dan kesetiaan',
              'Manfaat TPD dan TI tambahan disertakan',
              'Fleksibiliti premium selepas tempoh Pilihan',
              'Caj premium tambahan yang lebih rendah (3%)',
            ],
            limitations: [
              'Caj penyerahan dikenakan untuk tempoh Pilihan penuh',
              'Struktur yuran kompleks yang berbeza mengikut tempoh Pilihan',
              'Yuran polisi tinggi semasa tahun-tahun awal (sehingga 2.50%)',
              'Caj Cuti Premium semasa tempoh Pilihan',
              'Fleksibiliti terhad semasa tempoh Pilihan',
              'Tiada perlindungan kerugian atau ciri jaminan kekayaan',
            ],
            positioningStrategy:
              'Walaupun GREAT Wealth Advantage 4 menawarkan premium dan bonus yang kompetitif, PRUVantage Assure II memberikan nilai unggul melalui perlindungan Wealth Assure unik yang mengamankan nilai puncak portfolio anda. Sum Assured yang berkembang (3% tahunan) dan struktur caj yang dipermudahkan memberikan manfaat yang lebih jelas dan perlindungan kekayaan jangka panjang yang lebih baik daripada sistem berasaskan Pilihan mereka.',
          },
        ],
      },
      // Tagalog (Filipino)
      tl: {
        competitors: [
          {
            name: 'Invest Ready III',
            company: 'Manulife',
            type: 'Investment-Linked Policy',
            keyFeatures: [
              'Maraming premium term options na may Flexi Start Dates',
              'Minimum Investment Period (MIP) structure',
              'Welcome Bonus hanggang 15% para sa mas mahabang terms',
              'Loyalty Bonus 0.30% pagkatapos ng MIP',
              'Premium flexibility pagkatapos ng Flexi Start Date',
              'Top-up premiums na walang premium charge',
              'Change of Life Assured option available',
            ],
            strengths: [
              'Flexible premium payment structure na may maraming options',
              'Walang premium charge sa top-up premiums',
              'Comprehensive bonus structure kasama ang welcome at loyalty bonuses',
              'Premium holiday option available',
              'Malawak na entry ages sa iba-ibang terms',
            ],
            limitations: [
              'Complex premium structure na may maraming MIP at Flexi combinations',
              'Mataas na minimum premiums para sa shorter terms (hanggang S$25,000 bawat taon)',
              'Mataas na administrative charges sa MIP period (2.50% bawat taon)',
              'Surrender charges applicable sa buong MIP duration',
              'Policy fees applicable sa mas mababang premium amounts',
              'Walang unique downside protection features',
            ],
            positioningStrategy:
              'Ang PRUVantage Assure II ay nag-aalok ng superior simplicity na may innovative Wealth Assure feature na nag-lo-lock ng peak portfolio values para sa downside protection - na hindi makakaya ng Invest Ready III. Habang nag-aalok sila ng complex MIP structures, nagbibigay kami ng mas malinaw na premium terms (5-25 years) na may growing Sum Assured at first-in-market wealth protection.',
          },
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA',
            type: 'Investment-Linked Policy',
            keyFeatures: [
              'Initial Investment Period (IIP) na 10, 15 o 20 years',
              'Welcome Bonus hanggang 75% sa loob ng 3 years para sa 20-year IIP',
              'Special Bonus: 5% mula year 10-20, 8% mula year 21 onwards',
              'Accidental Death Benefit sa first 2 years',
              'Premium Pass option para waive ang holiday charges',
              'Secondary Insured Option available',
              'Minimum premium mula S$2,400 bawat taon',
            ],
            strengths: [
              'Competitive minimum premium requirement',
              'Mataas na welcome bonus potential sa loob ng 3 years',
              'Special ongoing bonus structure mula year 10',
              'Additional accidental death coverage sa early years',
              'Premium Pass flexibility option',
              'Secondary insured coverage available',
            ],
            limitations: [
              'Limited sa 3 IIP options vs aming 5 flexible terms',
              'Top-up premiums may 5% premium charge vs aming 3%',
              'Complex charge structure na may multiple fee types',
              'Walang withdrawals allowed hanggang 2 years ng premiums paid',
              'Walang unique wealth protection o downside coverage',
              'Supplementary charges applicable ng 10 years',
            ],
            positioningStrategy:
              'Ang PRUVantage Assure II ay nagbibigay ng superior wealth protection sa pamamagitan ng aming first-in-market Wealth Assure feature at mas flexible premium terms (5-25 years vs kanilang 3 IIP options). Ang aming mas mababang top-up charges (3% vs 5%) at unique daily wealth lock-in protection ay nag-aalok ng better value at security kaysa sa Pro Achiever 3.0.',
          },
          {
            name: 'GREAT Wealth Advantage 4',
            company: 'Great Eastern',
            type: 'Investment-Linked Policy',
            keyFeatures: [
              'Choice periods na 5, 10, o 15 years',
              'Welcome Bonus hanggang 55% para sa Choice 15',
              'Premium Bonus 2% pagkatapos ng Choice period',
              'Loyalty Bonus 0.30% bawat taon mula 10th/15th year',
              'Flexibility pagkatapos ng Choice period completion',
              'Total Permanent Disability (TPD) at Terminal Illness benefits',
              'Change of Life Assured option available',
            ],
            strengths: [
              'Mababang minimum premiums (S$1,200 bawat taon para sa Choice 15)',
              'Mataas na welcome bonus potential para sa longer terms',
              'Multiple bonus structures kasama ang premium at loyalty bonuses',
              'Additional TPD at TI benefits included',
              'Premium flexibility pagkatapos ng Choice period',
              'Mas mababang top-up premium charge (3%)',
            ],
            limitations: [
              'Surrender charges applicable sa buong Choice period duration',
              'Complex fee structure na nag-vary by Choice period',
              'Mataas na policy fees sa initial years (hanggang 2.50%)',
              'Premium Holiday charges sa Choice period',
              'Limited flexibility sa Choice period',
              'Walang downside protection o wealth assurance features',
            ],
            positioningStrategy:
              'Habang nag-aalok ang GREAT Wealth Advantage 4 ng competitive premiums at bonuses, naghahatid ang PRUVantage Assure II ng superior value sa pamamagitan ng aming unique Wealth Assure protection na nag-se-secure ng inyong peak portfolio value. Ang aming growing Sum Assured (3% annually) at simplified charge structure ay nagbibigay ng mas malinaw na benefits at better long-term wealth protection kaysa sa kanilang Choice-based system.',
          },
        ],
      },
      // Vietnamese
      vi: {
        competitors: [
          {
            name: 'Invest Ready III',
            company: 'Manulife',
            type: 'Hợp đồng bảo hiểm liên kết đầu tư',
            keyFeatures: [
              'Nhiều tùy chọn thời hạn phí bảo hiểm với Ngày Bắt đầu Linh hoạt',
              'Cấu trúc Thời gian Đầu tư Tối thiểu (MIP)',
              'Tiền thưởng Chào mừng lên đến 15% cho thời hạn dài',
              'Tiền thưởng Trung thành 0,30% sau khi hoàn thành MIP',
              'Tính linh hoạt phí bảo hiểm sau Ngày Bắt đầu Linh hoạt',
              'Phí bảo hiểm bổ sung với phí bảo hiểm 0%',
              'Tùy chọn Thay đổi Người được bảo hiểm có sẵn',
            ],
            strengths: [
              'Cấu trúc thanh toán phí bảo hiểm linh hoạt với nhiều tùy chọn',
              'Không có phí bảo hiểm cho phí bảo hiểm bổ sung',
              'Cấu trúc tiền thưởng toàn diện bao gồm tiền thưởng chào mừng và trung thành',
              'Tùy chọn nghỉ phí bảo hiểm có sẵn',
              'Phạm vi tuổi tham gia rộng trên các thời hạn khác nhau',
            ],
            limitations: [
              'Cấu trúc phí bảo hiểm phức tạp với nhiều kết hợp MIP và Linh hoạt',
              'Phí bảo hiểm tối thiểu cao cho thời hạn ngắn (lên đến S$25.000 mỗi năm)',
              'Phí hành chính cao trong thời gian MIP (2,50% mỗi năm)',
              'Phí surrender áp dụng cho toàn bộ thời gian MIP',
              'Phí hợp đồng áp dụng cho số tiền phí bảo hiểm thấp hơn',
              'Không có tính năng bảo vệ rủi ro độc đáo',
            ],
            positioningStrategy:
              'PRUVantage Assure II cung cấp sự đơn giản vượt trội với tính năng Wealth Assure sáng tạo khóa giá trị đỉnh cao của danh mục đầu tư để bảo vệ rủi ro - điều mà Invest Ready III không thể sánh được. Trong khi họ cung cấp cấu trúc MIP phức tạp, chúng tôi cung cấp các thời hạn phí bảo hiểm rõ ràng hơn (5-25 năm) với Sum Assured tăng trưởng và bảo vệ tài sản đầu tiên trên thị trường.',
          },
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA',
            type: 'Hợp đồng bảo hiểm liên kết đầu tư',
            keyFeatures: [
              'Thời gian Đầu tư Ban đầu (IIP) 10, 15 hoặc 20 năm',
              'Tiền thưởng Chào mừng lên đến 75% trong 3 năm cho IIP 20 năm',
              'Tiền thưởng Đặc biệt: 5% từ năm 10-20, 8% từ năm 21 trở đi',
              'Quyền lợi Tử vong do Tai nạn trong 2 năm đầu',
              'Tùy chọn Premium Pass để miễn phí nghỉ',
              'Tùy chọn Người được bảo hiểm Phụ có sẵn',
              'Phí bảo hiểm tối thiểu từ S$2.400 mỗi năm',
            ],
            strengths: [
              'Yêu cầu phí bảo hiểm tối thiểu cạnh tranh',
              'Tiềm năng tiền thưởng chào mừng cao trong 3 năm',
              'Cấu trúc tiền thưởng đặc biệt liên tục từ năm 10',
              'Bảo hiểm tử vong do tai nạn bổ sung trong những năm đầu',
              'Tùy chọn linh hoạt Premium Pass',
              'Bảo hiểm người được bảo hiểm phụ có sẵn',
            ],
            limitations: [
              'Giới hạn 3 tùy chọn IIP so với 5 thời hạn linh hoạt của chúng tôi',
              'Phí bảo hiểm bổ sung có phí 5% so với 3% của chúng tôi',
              'Cấu trúc phí phức tạp với nhiều loại phí',
              'Không cho phép rút tiền cho đến khi thanh toán phí bảo hiểm 2 năm',
              'Không có bảo vệ tài sản độc đáo hoặc bảo hiểm rủi ro',
              'Phí bổ sung áp dụng trong 10 năm',
            ],
            positioningStrategy:
              'PRUVantage Assure II cung cấp bảo vệ tài sản vượt trội thông qua tính năng Wealth Assure đầu tiên trên thị trường và các thời hạn phí bảo hiểm linh hoạt hơn (5-25 năm so với 3 tùy chọn IIP của họ). Phí bổ sung thấp hơn của chúng tôi (3% so với 5%) và bảo vệ khóa tài sản hàng ngày độc đáo cung cấp giá trị và bảo mật tốt hơn so với Pro Achiever 3.0.',
          },
          {
            name: 'GREAT Wealth Advantage 4',
            company: 'Great Eastern',
            type: 'Hợp đồng bảo hiểm liên kết đầu tư',
            keyFeatures: [
              'Thời gian Lựa chọn 5, 10, hoặc 15 năm',
              'Tiền thưởng Chào mừng lên đến 55% cho Lựa chọn 15',
              'Tiền thưởng Phí bảo hiểm 2% sau thời gian Lựa chọn',
              'Tiền thưởng Trung thành 0,30% mỗi năm từ năm thứ 10/15',
              'Tính linh hoạt sau khi hoàn thành thời gian Lựa chọn',
              'Quyền lợi Thương tật Toàn bộ Vĩnh viễn (TPD) và Bệnh hiểm nghèo',
              'Tùy chọn Thay đổi Người được bảo hiểm có sẵn',
            ],
            strengths: [
              'Phí bảo hiểm tối thiểu thấp (S$1.200 mỗi năm cho Lựa chọn 15)',
              'Tiềm năng tiền thưởng chào mừng cao cho thời hạn dài',
              'Cấu trúc tiền thưởng đa dạng bao gồm tiền thưởng phí bảo hiểm và trung thành',
              'Quyền lợi TPD và TI bổ sung được bao gồm',
              'Tính linh hoạt phí bảo hiểm sau thời gian Lựa chọn',
              'Phí phí bảo hiểm bổ sung thấp hơn (3%)',
            ],
            limitations: [
              'Phí surrender áp dụng cho toàn bộ thời gian Lựa chọn',
              'Cấu trúc phí phức tạp thay đổi theo thời gian Lựa chọn',
              'Phí hợp đồng cao trong những năm đầu (lên đến 2,50%)',
              'Phí Nghỉ Phí bảo hiểm trong thời gian Lựa chọn',
              'Tính linh hoạt hạn chế trong thời gian Lựa chọn',
              'Không có bảo vệ rủi ro hoặc tính năng đảm bảo tài sản',
            ],
            positioningStrategy:
              'Trong khi GREAT Wealth Advantage 4 cung cấp phí bảo hiểm và tiền thưởng cạnh tranh, PRUVantage Assure II mang lại giá trị vượt trội thông qua bảo vệ Wealth Assure độc đáo bảo vệ giá trị đỉnh cao danh mục đầu tư của bạn. Sum Assured tăng trưởng của chúng tôi (3% hàng năm) và cấu trúc phí đơn giản hóa cung cấp lợi ích rõ ràng hơn và bảo vệ tài sản dài hạn tốt hơn so với hệ thống dựa trên Lựa chọn của họ.',
          },
        ],
      },
      // Thai
      th: {
        competitors: [
          {
            name: 'Invest Ready III',
            company: 'Manulife',
            type: 'กรมธรรม์เชื่อมโยงการลงทุน',
            keyFeatures: [
              'ตัวเลือกระยะเวลาเบี้ยประกันหลากหลายพร้อมวันที่เริ่มต้นที่ยืดหยุ่น',
              'โครงสร้างระยะเวลาการลงทุนขั้นต่ำ (MIP)',
              'โบนัสต้อนรับสูงสุด 15% สำหรับระยะเวลายาว',
              'โบนัสความภักดี 0.30% หลังจากจบ MIP',
              'ความยืดหยุ่นในเบี้ยประกันหลังวันที่เริ่มต้นที่ยืดหยุ่น',
              'เบี้ยประกันเสริมที่ไม่มีค่าธรรมเนียมเบี้ยประกัน',
              'ตัวเลือกการเปลี่ยนผู้เอาประกันภัยมีให้',
            ],
            strengths: [
              'โครงสร้างการชำระเบี้ยประกันที่ยืดหยุ่นพร้อมตัวเลือกหลากหลาย',
              'ไม่มีค่าธรรมเนียมเบี้ยประกันสำหรับเบี้ยประกันเสริม',
              'โครงสร้างโบนัสที่ครอบคลุมรวมถึงโบนัสต้อนรับและความภักดี',
              'ตัวเลือกพักเบี้ยประกันมีให้',
              'ช่วงอายุเข้าที่กว้างในระยะเวลาต่างๆ',
            ],
            limitations: [
              'โครงสร้างเบี้ยประกันที่ซับซ้อนด้วยการรวม MIP และยืดหยุ่นหลายแบบ',
              'เบี้ยประกันขั้นต่ำสูงสำหรับระยะเวลาสั้น (สูงสุด S$25,000 ต่อปี)',
              'ค่าธรรมเนียมการบริหารสูงในช่วง MIP (2.50% ต่อปี)',
              'ค่าธรรมเนียมการยกเลิกใช้ตลอดระยะเวลา MIP',
              'ค่าธรรมเนียมกรมธรรม์ใช้สำหรับจำนวนเบี้ยประกันที่ต่ำกว่า',
              'ไม่มีคุณสมบัติการป้องกันความเสี่ยงที่เป็นเอกลักษณ์',
            ],
            positioningStrategy:
              'PRUVantage Assure II นำเสนอความเรียบง่ายที่เหนือกว่าด้วยคุณสมบัติ Wealth Assure ที่นวัตกรรมซึ่งล็อกค่าพอร์ตการลงทุนที่จุดสูงสุดเพื่อป้องกันความเสี่ยง - สิ่งที่ Invest Ready III ไม่สามารถเทียบได้ ในขณะที่พวกเขานำเสนอโครงสร้าง MIP ที่ซับซ้อน เราให้ระยะเวลาเบี้ยประกันที่ชัดเจนกว่า (5-25 ปี) พร้อม Sum Assured ที่เติบโตและการป้องกันความมั่งคั่งแรกในตลาด',
          },
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA',
            type: 'กรมธรรม์เชื่อมโยงการลงทุน',
            keyFeatures: [
              'ระยะเวลาการลงทุนเริ่มต้น (IIP) 10, 15 หรือ 20 ปี',
              'โบนัสต้อนรับสูงสุด 75% ใน 3 ปีสำหรับ IIP 20 ปี',
              'โบนัสพิเศษ: 5% จากปีที่ 10-20, 8% จากปีที่ 21 เป็นต้นไป',
              'ผลประโยชน์เสียชีวิตจากอุบัติเหตุใน 2 ปีแรก',
              'ตัวเลือก Premium Pass เพื่อยกเว้นค่าธรรมเนียมการพัก',
              'ตัวเลือกผู้เอาประกันภัยรองมีให้',
              'เบี้ยประกันขั้นต่ำตั้งแต่ S$2,400 ต่อปี',
            ],
            strengths: [
              'ข้อกำหนดเบี้ยประกันขั้นต่ำที่แข่งขันได้',
              'ศักยภาพโบนัสต้อนรับสูงใน 3 ปี',
              'โครงสร้างโบนัสต่อเนื่องพิเศษจากปีที่ 10',
              'การประกันเสียชีวิตจากอุบัติเหตุเพิ่มเติมในปีแรกๆ',
              'ตัวเลือกความยืดหยุ่น Premium Pass',
              'การประกันผู้เอาประกันภัยรองมีให้',
            ],
            limitations: [
              'จำกัดใน 3 ตัวเลือก IIP เทียบกับ 5 ระยะเวลาที่ยืดหยุ่นของเรา',
              'เบี้ยประกันเสริมมีค่าธรรมเนียม 5% เทียบกับ 3% ของเรา',
              'โครงสร้างค่าธรรมเนียมที่ซับซ้อนด้วยประเภทค่าธรรมเนียมหลายแบบ',
              'ไม่อนุญาตให้ถอนจนกว่าจะชำระเบี้ยประกัน 2 ปี',
              'ไม่มีการป้องกันความมั่งคั่งเฉพาะหรือการคุ้มครองความเสี่ยง',
              'ค่าธรรมเนียมเสริมใช้เป็นเวลา 10 ปี',
            ],
            positioningStrategy:
              'PRUVantage Assure II ให้การป้องกันความมั่งคั่งที่เหนือกว่าผ่านคุณสมบัติ Wealth Assure แรกในตลาดและระยะเวลาเบี้ยประกันที่ยืดหยุ่นกว่า (5-25 ปี เทียบกับ 3 ตัวเลือก IIP ของพวกเขา) ค่าธรรมเนียมเสริมที่ต่ำกว่าของเรา (3% เทียบกับ 5%) และการป้องกันการล็อกความมั่งคั่งรายวันที่เป็นเอกลักษณ์นำเสนอคุณค่าและความปลอดภัยที่ดีกว่า Pro Achiever 3.0',
          },
          {
            name: 'GREAT Wealth Advantage 4',
            company: 'Great Eastern',
            type: 'กรมธรรม์เชื่อมโยงการลงทุน',
            keyFeatures: [
              'ระยะเวลาทางเลือก 5, 10, หรือ 15 ปี',
              'โบนัสต้อนรับสูงสุด 55% สำหรับทางเลือก 15',
              'โบนัสเบี้ยประกัน 2% หลังระยะเวลาทางเลือก',
              'โบนัสความภักดี 0.30% ต่อปีจากปีที่ 10/15',
              'ความยืดหยุ่นหลังการสำเร็จระยะเวลาทางเลือก',
              'ผลประโยชน์ความพิการถาวรสิ้นเชิง (TPD) และการเจ็บป่วยร้ายแรง',
              'ตัวเลือกการเปลี่ยนผู้เอาประกันภัยมีให้',
            ],
            strengths: [
              'เบี้ยประกันขั้นต่ำต่ำ (S$1,200 ต่อปีสำหรับทางเลือก 15)',
              'ศักยภาพโบนัสต้อนรับสูงสำหรับระยะเวลายาว',
              'โครงสร้างโบนัสหลายแบบรวมถึงโบนัสเบี้ยประกันและความภักดี',
              'ผลประโยชน์ TPD และ TI เพิ่มเติมรวมอยู่ด้วย',
              'ความยืดหยุ่นในเบี้ยประกันหลังระยะเวลาทางเลือก',
              'ค่าธรรมเนียมเบี้ยประกันเสริมที่ต่ำกว่า (3%)',
            ],
            limitations: [
              'ค่าธรรมเนียมการยกเลิกใช้ตลอดระยะเวลาทางเลือก',
              'โครงสร้างค่าธรรมเนียมที่ซับซ้อนซึ่งแตกต่างกันตามระยะเวลาทางเลือก',
              'ค่าธรรมเนียมกรมธรรม์สูงในปีแรกๆ (สูงสุด 2.50%)',
              'ค่าธรรมเนียมพักเบี้ยประกันในระยะเวลาทางเลือก',
              'ความยืดหยุ่นจำกัดในระยะเวลาทางเลือก',
              'ไม่มีการป้องกันความเสี่ยงหรือคุณสมบัติรับประกันความมั่งคั่ง',
            ],
            positioningStrategy:
              'แม้ว่า GREAT Wealth Advantage 4 จะนำเสนอเบี้ยประกันและโบนัสที่แข่งขันได้ แต่ PRUVantage Assure II มอบคุณค่าที่เหนือกว่าผ่านการป้องกัน Wealth Assure เฉพาะที่รักษาความปลอดภัยให้กับมูลค่าพอร์ตการลงทุนสูงสุดของคุณ Sum Assured ที่เติบโต (3% ต่อปี) และโครงสร้างค่าธรรมเนียมที่เรียบง่ายของเรามอบผลประโยชน์ที่ชัดเจนกว่าและการป้องกันความมั่งคั่งระยะยาวที่ดีกว่าระบบที่อิงตามทางเลือกของพวกเขา',
          },
        ],
      },

      // Traditional Chinese (Taiwan)
      cmn: {
        competitors: [
          {
            name: 'Invest Ready III',
            company: 'Manulife',
            type: '投資連結型保單',
            keyFeatures: [
              '多種保費期限選項搭配彈性起始日期',
              '最低投資期限（MIP）結構',
              '長期保單最高可獲得 15% 的歡迎紅利',
              'MIP 完成後可獲得 0.30% 的忠誠紅利',
              '彈性起始日期後的保費靈活度',
              '追加保費享 0% 保費收費',
              '可變更被保險人選項',
            ],
            strengths: [
              '靈活的保費支付結構，提供多種選項',
              '追加保費無保費收費',
              '全面的紅利結構，包括歡迎紅利和忠誠紅利',
              '提供保費假期選項',
              '不同期限的入保年齡範圍廣泛',
            ],
            limitations: [
              '複雜的保費結構，有多種 MIP 和彈性組合',
              '短期保單最低保費較高（最高每年 S$25,000）',
              'MIP 期間管理費用較高（每年 2.50%）',
              '解約費用適用於整個 MIP 期限',
              '較低保費金額需支付保單費用',
              '沒有獨特的下檔保護功能',
            ],
            positioningStrategy:
              'PRUVantage Assure II 提供卓越的簡潔性，配備創新的 Wealth Assure 功能，可鎖定投資組合峰值以提供下檔保護——這是 Invest Ready III 無法比擬的。雖然他們提供複雜的 MIP 結構，我們提供更清晰的保費期限（5-25 年），配備增長型保額和市場首創的財富保護。',
          },
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA',
            type: '投資連結型保單',
            keyFeatures: [
              '初始投資期限（IIP）10、15 或 20 年',
              '20 年 IIP 可在 3 年內獲得最高 75% 的歡迎紅利',
              '特別紅利：第 10-20 年 5%，第 21 年起 8%',
              '前 2 年意外死亡保障',
              'Premium Pass 選項可免除假期費用',
              '提供次要被保險人選項',
              '最低保費每年 S$2,400 起',
            ],
            strengths: [
              '具競爭力的最低保費要求',
              '3 年內高額歡迎紅利潛力',
              '從第 10 年起的特別持續紅利結構',
              '早期額外意外死亡保障',
              'Premium Pass 靈活選項',
              '提供次要被保險人保障',
            ],
            limitations: [
              '僅限 3 種 IIP 選項，我們有 5 種彈性期限',
              '追加保費收取 5% 費用，我們只收 3%',
              '複雜的費用結構，有多種費用類型',
              '繳納 2 年保費前不允許提領',
              '沒有獨特的財富保護或下檔保障',
              '附加費用適用 10 年',
            ],
            positioningStrategy:
              'PRUVantage Assure II 通過我們市場首創的 Wealth Assure 功能和更靈活的保費期限（5-25 年，相比他們的 3 種 IIP 選項）提供卓越的財富保護。我們較低的追加費用（3% 對比 5%）和獨特的每日財富鎖定保護，提供比 Pro Achiever 3.0 更好的價值和安全性。',
          },
          {
            name: 'GREAT Wealth Advantage 4',
            company: 'Great Eastern',
            type: '投資連結型保單',
            keyFeatures: [
              '選擇期限 5、10 或 15 年',
              'Choice 15 最高可獲得 55% 的歡迎紅利',
              '選擇期限後 2% 保費紅利',
              '從第 10/15 年起每年 0.30% 忠誠紅利',
              '完成選擇期限後的靈活度',
              '全殘（TPD）和末期疾病保障',
              '可變更被保險人選項',
            ],
            strengths: [
              '最低保費較低（Choice 15 每年 S$1,200）',
              '長期保單的高額歡迎紅利潛力',
              '多種紅利結構，包括保費紅利和忠誠紅利',
              '包含額外 TPD 和 TI 保障',
              '選擇期限後的保費靈活度',
              '較低的追加保費收費（3%）',
            ],
            limitations: [
              '解約費用適用於整個選擇期限',
              '複雜的費用結構因選擇期限而異',
              '初期保單費用較高（最高 2.50%）',
              '選擇期限內有保費假期費用',
              '選擇期限內靈活度有限',
              '沒有下檔保護或財富保障功能',
            ],
            positioningStrategy:
              '雖然 GREAT Wealth Advantage 4 提供具競爭力的保費和紅利，但 PRUVantage Assure II 通過我們獨特的 Wealth Assure 保護提供卓越價值，可確保您的投資組合峰值。我們增長型保額（每年 3%）和簡化的費用結構提供比他們選擇式系統更清晰的保障和更好的長期財富保護。',
          },
        ],
      },
    },
  };

// PRUWealth Plus competitive intelligence
const pruwealthPlusCompetitiveIntelligence: CompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'prudential-pruwealth-plus',
      company: 'prudential',
      productId: 'pruwealth-plus',
      targetMarket: 'single premium participating whole life',
    },
    localized: {
      // English
      en: {
        competitors: [
          {
            name: 'GREAT SP Secure',
            company: 'Great Eastern',
            type: 'Single Premium Participating Whole Life',
            keyFeatures: [
              'Single premium payment structure',
              'Whole life coverage with savings element',
              'Guaranteed cash value from policy inception',
              'Reversionary bonuses (non-guaranteed)',
              'Terminal bonuses payable at maturity or claim',
              'Policy loan facility available',
              'Coverage until age 99',
            ],
            strengths: [
              'Established brand with long Singapore history',
              'Competitive guaranteed cash values',
              'Straightforward bonus structure',
              'Lower minimum premium requirements',
              'Well-established claims track record',
            ],
            limitations: [
              'Coverage only until age 99 vs our age 130',
              'No retrenchment benefit protection',
              'No secondary life assured feature',
              'No change of life assured option',
              'Limited wealth transfer flexibility',
              'No SRS compatibility',
            ],
            positioningStrategy:
              'PRUWealth Plus offers superior longevity coverage until age 130 (vs their age 99) with unique wealth transfer features including secondary life assured and unlimited change of life assured options. Our retrenchment benefit provides 10% single premium protection in the first 5 years - a feature they cannot match. Plus, our SRS compatibility offers retirement planning flexibility.',
          },
          {
            name: 'Capital Elite',
            company: 'AIA',
            type: 'Single Premium Participating Life',
            keyFeatures: [
              'Single premium whole life insurance',
              'Guaranteed and non-guaranteed bonuses',
              'Death benefit coverage',
              'Cash value accumulation',
              'Policy loan up to 80% of cash value',
              'Maturity at age 100',
              'Dividend participation',
            ],
            strengths: [
              'Higher policy loan ratio (80% vs our 70%)',
              'Strong bonus declaration history',
              'Wide distribution network',
              'Comprehensive rider options',
              'Established participating fund performance',
            ],
            limitations: [
              'Maturity at age 100 vs our age 130 coverage',
              'No retrenchment protection benefit',
              'No secondary life assured continuation feature',
              'Cannot change life assured',
              'Higher minimum premium requirements',
              'Not compatible with SRS funds',
            ],
            positioningStrategy:
              'While AIA Capital Elite offers higher loan ratios, PRUWealth Plus delivers superior value through our unique retrenchment benefit (10% of premium in first 5 years), extended coverage to age 130, and innovative wealth transfer features. Our secondary life assured ensures policy continuation on primary death, and change of life assured option provides unmatched flexibility for estate planning - features that set us apart.',
          },
          {
            name: 'SP Wealth Assure',
            company: 'NTUC Income',
            type: 'Single Premium Participating Plan',
            keyFeatures: [
              'Single premium payment',
              'Participating whole life coverage',
              'Annual reversionary bonuses',
              'Terminal bonus at maturity or claim',
              'Death and total permanent disability benefits',
              'Policy loan facility',
              'Coverage to age 100',
            ],
            strengths: [
              'Competitive premium rates (social enterprise model)',
              'Strong community trust',
              'TPD benefit included in base plan',
              'Transparent bonus declaration',
              'Accessible to broader market segments',
            ],
            limitations: [
              'Coverage limited to age 100 vs our age 130',
              'No retrenchment benefit',
              'No secondary life assured feature',
              'No change of life assured flexibility',
              'Limited premium service options',
              'No SRS fund compatibility',
            ],
            positioningStrategy:
              'PRUWealth Plus provides comprehensive protection beyond NTUC Income SP Wealth Assure with coverage extending 30 years longer (to age 130), plus exclusive features: 10% retrenchment benefit in first 5 years, secondary life assured for seamless wealth transfer, and change of life assured option for estate planning flexibility. Our SRS compatibility adds retirement planning advantages their product cannot offer.',
          },
        ],
      },
      // Indonesian
      id: {
        competitors: [
          {
            name: 'GREAT SP Secure',
            company: 'Great Eastern',
            type: 'Asuransi Jiwa Seumur Hidup Partisipatif Premi Tunggal',
            keyFeatures: [
              'Struktur pembayaran premi tunggal',
              'Cakupan seumur hidup dengan elemen tabungan',
              'Nilai tunai terjamin sejak awal polis',
              'Bonus reversionary (tidak terjamin)',
              'Bonus terminal dibayarkan saat jatuh tempo atau klaim',
              'Fasilitas pinjaman polis tersedia',
              'Cakupan hingga usia 99 tahun',
            ],
            strengths: [
              'Merek mapan dengan sejarah panjang di Singapura',
              'Nilai tunai terjamin yang kompetitif',
              'Struktur bonus yang jelas',
              'Persyaratan premi minimum yang lebih rendah',
              'Track record klaim yang mapan',
            ],
            limitations: [
              'Cakupan hanya hingga usia 99 vs usia 130 kami',
              'Tidak ada perlindungan manfaat retrenchment',
              'Tidak ada fitur secondary life assured',
              'Tidak ada opsi change of life assured',
              'Fleksibilitas transfer kekayaan terbatas',
              'Tidak kompatibel dengan SRS',
            ],
            positioningStrategy:
              'PRUWealth Plus menawarkan cakupan umur panjang superior hingga usia 130 (vs usia 99 mereka) dengan fitur transfer kekayaan unik termasuk secondary life assured dan opsi change of life assured tanpa batas. Manfaat retrenchment kami memberikan perlindungan 10% premi tunggal dalam 5 tahun pertama - fitur yang tidak dapat mereka tandingi. Plus, kompatibilitas SRS kami menawarkan fleksibilitas perencanaan pensiun.',
          },
          {
            name: 'Capital Elite',
            company: 'AIA',
            type: 'Asuransi Jiwa Partisipatif Premi Tunggal',
            keyFeatures: [
              'Asuransi jiwa seumur hidup premi tunggal',
              'Bonus terjamin dan tidak terjamin',
              'Cakupan manfaat kematian',
              'Akumulasi nilai tunai',
              'Pinjaman polis hingga 80% dari nilai tunai',
              'Jatuh tempo pada usia 100 tahun',
              'Partisipasi dividen',
            ],
            strengths: [
              'Rasio pinjaman polis lebih tinggi (80% vs 70% kami)',
              'Sejarah deklarasi bonus yang kuat',
              'Jaringan distribusi yang luas',
              'Opsi rider yang komprehensif',
              'Kinerja dana partisipatif yang mapan',
            ],
            limitations: [
              'Jatuh tempo pada usia 100 vs cakupan usia 130 kami',
              'Tidak ada manfaat perlindungan retrenchment',
              'Tidak ada fitur kelanjutan secondary life assured',
              'Tidak dapat mengubah life assured',
              'Persyaratan premi minimum lebih tinggi',
              'Tidak kompatibel dengan dana SRS',
            ],
            positioningStrategy:
              'Meskipun AIA Capital Elite menawarkan rasio pinjaman lebih tinggi, PRUWealth Plus memberikan nilai superior melalui manfaat retrenchment unik (10% premi dalam 5 tahun pertama), cakupan diperpanjang hingga usia 130, dan fitur transfer kekayaan inovatif. Secondary life assured kami memastikan kelanjutan polis saat primary meninggal, dan opsi change of life assured memberikan fleksibilitas tak tertandingi untuk perencanaan estate - fitur yang membedakan kami.',
          },
          {
            name: 'SP Wealth Assure',
            company: 'NTUC Income',
            type: 'Paket Partisipatif Premi Tunggal',
            keyFeatures: [
              'Pembayaran premi tunggal',
              'Cakupan seumur hidup partisipatif',
              'Bonus reversionary tahunan',
              'Bonus terminal saat jatuh tempo atau klaim',
              'Manfaat kematian dan cacat total permanen',
              'Fasilitas pinjaman polis',
              'Cakupan hingga usia 100 tahun',
            ],
            strengths: [
              'Tarif premi kompetitif (model perusahaan sosial)',
              'Kepercayaan komunitas yang kuat',
              'Manfaat TPD termasuk dalam paket dasar',
              'Deklarasi bonus transparan',
              'Dapat diakses oleh segmen pasar yang lebih luas',
            ],
            limitations: [
              'Cakupan terbatas hingga usia 100 vs usia 130 kami',
              'Tidak ada manfaat retrenchment',
              'Tidak ada fitur secondary life assured',
              'Tidak ada fleksibilitas change of life assured',
              'Opsi layanan premium terbatas',
              'Tidak kompatibel dengan dana SRS',
            ],
            positioningStrategy:
              'PRUWealth Plus memberikan perlindungan komprehensif melampaui NTUC Income SP Wealth Assure dengan cakupan yang diperpanjang 30 tahun lebih lama (hingga usia 130), plus fitur eksklusif: manfaat retrenchment 10% dalam 5 tahun pertama, secondary life assured untuk transfer kekayaan yang mulus, dan opsi change of life assured untuk fleksibilitas perencanaan estate. Kompatibilitas SRS kami menambah keuntungan perencanaan pensiun yang tidak dapat ditawarkan produk mereka.',
          },
        ],
      },
      // Malaysian
      ms: {
        competitors: [
          {
            name: 'GREAT SP Secure',
            company: 'Great Eastern',
            type: 'Insurans Hayat Seumur Hidup Penyertaan Premium Tunggal',
            keyFeatures: [
              'Struktur pembayaran premium tunggal',
              'Liputan seumur hidup dengan elemen simpanan',
              'Nilai tunai terjamin dari permulaan polisi',
              'Bonus reversionary (tidak terjamin)',
              'Bonus terminal dibayar pada matang atau tuntutan',
              'Kemudahan pinjaman polisi tersedia',
              'Liputan sehingga umur 99 tahun',
            ],
            strengths: [
              'Jenama mapan dengan sejarah panjang di Singapura',
              'Nilai tunai terjamin yang kompetitif',
              'Struktur bonus yang jelas',
              'Keperluan premium minimum yang lebih rendah',
              'Rekod tuntutan yang mapan',
            ],
            limitations: [
              'Liputan hanya sehingga umur 99 vs umur 130 kami',
              'Tiada perlindungan manfaat pemberhentian kerja',
              'Tiada ciri secondary life assured',
              'Tiada pilihan change of life assured',
              'Fleksibiliti pemindahan kekayaan terhad',
              'Tiada keserasian SRS',
            ],
            positioningStrategy:
              'PRUWealth Plus menawarkan liputan umur panjang unggul sehingga umur 130 (vs umur 99 mereka) dengan ciri pemindahan kekayaan unik termasuk secondary life assured dan pilihan change of life assured tanpa had. Manfaat pemberhentian kerja kami memberikan perlindungan 10% premium tunggal dalam 5 tahun pertama - ciri yang tidak dapat mereka tandingi. Tambahan pula, keserasian SRS kami menawarkan fleksibiliti perancangan persaraan.',
          },
          {
            name: 'Capital Elite',
            company: 'AIA',
            type: 'Insurans Hayat Penyertaan Premium Tunggal',
            keyFeatures: [
              'Insurans hayat seumur hidup premium tunggal',
              'Bonus terjamin dan tidak terjamin',
              'Liputan manfaat kematian',
              'Pengumpulan nilai tunai',
              'Pinjaman polisi sehingga 80% nilai tunai',
              'Matang pada umur 100 tahun',
              'Penyertaan dividen',
            ],
            strengths: [
              'Nisbah pinjaman polisi lebih tinggi (80% vs 70% kami)',
              'Sejarah pengisytiharan bonus yang kukuh',
              'Rangkaian pengedaran yang luas',
              'Pilihan rider yang komprehensif',
              'Prestasi dana penyertaan yang mapan',
            ],
            limitations: [
              'Matang pada umur 100 vs liputan umur 130 kami',
              'Tiada manfaat perlindungan pemberhentian kerja',
              'Tiada ciri kesinambungan secondary life assured',
              'Tidak boleh menukar life assured',
              'Keperluan premium minimum lebih tinggi',
              'Tidak serasi dengan dana SRS',
            ],
            positioningStrategy:
              'Walaupun AIA Capital Elite menawarkan nisbah pinjaman lebih tinggi, PRUWealth Plus memberikan nilai unggul melalui manfaat pemberhentian kerja unik (10% premium dalam 5 tahun pertama), liputan dilanjutkan sehingga umur 130, dan ciri pemindahan kekayaan inovatif. Secondary life assured kami memastikan kesinambungan polisi apabila primary meninggal, dan pilihan change of life assured memberikan fleksibiliti yang tiada tandingan untuk perancangan harta pusaka - ciri yang membezakan kami.',
          },
          {
            name: 'SP Wealth Assure',
            company: 'NTUC Income',
            type: 'Pelan Penyertaan Premium Tunggal',
            keyFeatures: [
              'Pembayaran premium tunggal',
              'Liputan seumur hidup penyertaan',
              'Bonus reversionary tahunan',
              'Bonus terminal pada matang atau tuntutan',
              'Manfaat kematian dan hilang upaya kekal menyeluruh',
              'Kemudahan pinjaman polisi',
              'Liputan sehingga umur 100 tahun',
            ],
            strengths: [
              'Kadar premium kompetitif (model perusahaan sosial)',
              'Kepercayaan komuniti yang kukuh',
              'Manfaat TPD termasuk dalam pelan asas',
              'Pengisytiharan bonus telus',
              'Boleh diakses oleh segmen pasaran yang lebih luas',
            ],
            limitations: [
              'Liputan terhad sehingga umur 100 vs umur 130 kami',
              'Tiada manfaat pemberhentian kerja',
              'Tiada ciri secondary life assured',
              'Tiada fleksibiliti change of life assured',
              'Pilihan perkhidmatan premium terhad',
              'Tidak serasi dengan dana SRS',
            ],
            positioningStrategy:
              'PRUWealth Plus memberikan perlindungan komprehensif melebihi NTUC Income SP Wealth Assure dengan liputan dilanjutkan 30 tahun lebih lama (sehingga umur 130), tambahan ciri eksklusif: manfaat pemberhentian kerja 10% dalam 5 tahun pertama, secondary life assured untuk pemindahan kekayaan yang lancar, dan pilihan change of life assured untuk fleksibiliti perancangan harta pusaka. Keserasian SRS kami menambah kelebihan perancangan persaraan yang tidak dapat ditawarkan produk mereka.',
          },
        ],
      },
      // Tagalog (Filipino)
      tl: {
        competitors: [
          {
            name: 'GREAT SP Secure',
            company: 'Great Eastern',
            type: 'Single Premium Participating Whole Life',
            keyFeatures: [
              'Single premium payment structure',
              'Whole life coverage na may savings element',
              'Guaranteed cash value from policy inception',
              'Reversionary bonuses (non-guaranteed)',
              'Terminal bonuses payable sa maturity o claim',
              'Policy loan facility available',
              'Coverage hanggang age 99',
            ],
            strengths: [
              'Established brand na may mahabang kasaysayan sa Singapore',
              'Competitive guaranteed cash values',
              'Straightforward bonus structure',
              'Mas mababang minimum premium requirements',
              'Well-established claims track record',
            ],
            limitations: [
              'Coverage lang hanggang age 99 vs aming age 130',
              'Walang retrenchment benefit protection',
              'Walang secondary life assured feature',
              'Walang change of life assured option',
              'Limited wealth transfer flexibility',
              'Walang SRS compatibility',
            ],
            positioningStrategy:
              'Ang PRUWealth Plus ay nag-aalok ng superior longevity coverage hanggang age 130 (vs kanilang age 99) na may unique wealth transfer features kasama ang secondary life assured at unlimited change of life assured options. Ang aming retrenchment benefit ay nagbibigay ng 10% single premium protection sa first 5 years - isang feature na hindi nila makakaya. Plus, ang aming SRS compatibility ay nag-aalok ng retirement planning flexibility.',
          },
          {
            name: 'Capital Elite',
            company: 'AIA',
            type: 'Single Premium Participating Life',
            keyFeatures: [
              'Single premium whole life insurance',
              'Guaranteed at non-guaranteed bonuses',
              'Death benefit coverage',
              'Cash value accumulation',
              'Policy loan up to 80% ng cash value',
              'Maturity sa age 100',
              'Dividend participation',
            ],
            strengths: [
              'Mas mataas na policy loan ratio (80% vs aming 70%)',
              'Malakas na bonus declaration history',
              'Malawak na distribution network',
              'Comprehensive rider options',
              'Established participating fund performance',
            ],
            limitations: [
              'Maturity sa age 100 vs aming age 130 coverage',
              'Walang retrenchment protection benefit',
              'Walang secondary life assured continuation feature',
              'Hindi makakagbago ng life assured',
              'Mas mataas na minimum premium requirements',
              'Hindi compatible sa SRS funds',
            ],
            positioningStrategy:
              'Habang nag-aalok ang AIA Capital Elite ng mas mataas na loan ratios, naghahatid ang PRUWealth Plus ng superior value sa pamamagitan ng aming unique retrenchment benefit (10% ng premium sa first 5 years), extended coverage to age 130, at innovative wealth transfer features. Ang aming secondary life assured ay nagsisiguro ng policy continuation sa primary death, at change of life assured option ay nagbibigay ng unmatched flexibility para sa estate planning - mga feature na nagtatakda sa amin.',
          },
          {
            name: 'SP Wealth Assure',
            company: 'NTUC Income',
            type: 'Single Premium Participating Plan',
            keyFeatures: [
              'Single premium payment',
              'Participating whole life coverage',
              'Annual reversionary bonuses',
              'Terminal bonus sa maturity o claim',
              'Death and total permanent disability benefits',
              'Policy loan facility',
              'Coverage to age 100',
            ],
            strengths: [
              'Competitive premium rates (social enterprise model)',
              'Malakas na community trust',
              'TPD benefit included sa base plan',
              'Transparent bonus declaration',
              'Accessible sa mas malawak na market segments',
            ],
            limitations: [
              'Coverage limited sa age 100 vs aming age 130',
              'Walang retrenchment benefit',
              'Walang secondary life assured feature',
              'Walang change of life assured flexibility',
              'Limited premium service options',
              'Walang SRS fund compatibility',
            ],
            positioningStrategy:
              'Ang PRUWealth Plus ay nagbibigay ng comprehensive protection lampas sa NTUC Income SP Wealth Assure na may coverage extending 30 years mas mahaba (to age 130), plus exclusive features: 10% retrenchment benefit sa first 5 years, secondary life assured para sa seamless wealth transfer, at change of life assured option para sa estate planning flexibility. Ang aming SRS compatibility ay nagdadagdag ng retirement planning advantages na hindi maibigay ng kanilang product.',
          },
        ],
      },
      // Vietnamese
      vi: {
        competitors: [
          {
            name: 'GREAT SP Secure',
            company: 'Great Eastern',
            type: 'Bảo hiểm nhân thọ trọn đời có tham gia phí một lần',
            keyFeatures: [
              'Cấu trúc thanh toán phí một lần',
              'Bảo hiểm trọn đời với yếu tố tiết kiệm',
              'Giá trị tiền mặt được đảm bảo từ khi bắt đầu hợp đồng',
              'Tiền thưởng hàng năm (không được đảm bảo)',
              'Tiền thưởng cuối cùng được trả khi đáo hạn hoặc yêu cầu bồi thường',
              'Có sẵn tiện ích cho vay từ hợp đồng',
              'Bảo hiểm đến tuổi 99',
            ],
            strengths: [
              'Thương hiệu được thiết lập với lịch sử lâu dài tại Singapore',
              'Giá trị tiền mặt đảm bảo cạnh tranh',
              'Cấu trúc tiền thưởng đơn giản',
              'Yêu cầu phí bảo hiểm tối thiểu thấp hơn',
              'Hồ sơ yêu cầu bồi thường đã được thiết lập',
            ],
            limitations: [
              'Bảo hiểm chỉ đến tuổi 99 so với tuổi 130 của chúng tôi',
              'Không có quyền lợi bảo vệ mất việc làm',
              'Không có tính năng người được bảo hiểm phụ',
              'Không có tùy chọn thay đổi người được bảo hiểm',
              'Linh hoạt chuyển giao tài sản hạn chế',
              'Không tương thích với SRS',
            ],
            positioningStrategy:
              'PRUWealth Plus cung cấp bảo hiểm tuổi thọ vượt trội đến tuổi 130 (so với tuổi 99 của họ) với các tính năng chuyển giao tài sản độc đáo bao gồm người được bảo hiểm phụ và các tùy chọn thay đổi người được bảo hiểm không giới hạn. Quyền lợi mất việc làm của chúng tôi cung cấp bảo vệ 10% phí một lần trong 5 năm đầu - một tính năng mà họ không thể sánh được. Hơn nữa, khả năng tương thích SRS của chúng tôi cung cấp linh hoạt kế hoạch hưu trí.',
          },
          {
            name: 'Capital Elite',
            company: 'AIA',
            type: 'Bảo hiểm nhân thọ có tham gia phí một lần',
            keyFeatures: [
              'Bảo hiểm nhân thọ trọn đời phí một lần',
              'Tiền thưởng được đảm bảo và không được đảm bảo',
              'Bảo hiểm quyền lợi tử vong',
              'Tích lũy giá trị tiền mặt',
              'Cho vay từ hợp đồng lên đến 80% giá trị tiền mặt',
              'Đáo hạn ở tuổi 100',
              'Tham gia cổ tức',
            ],
            strengths: [
              'Tỷ lệ cho vay từ hợp đồng cao hơn (80% so với 70% của chúng tôi)',
              'Lịch sử công bố tiền thưởng mạnh mẽ',
              'Mạng lưới phân phối rộng',
              'Các tùy chọn điều khoản bổ sung toàn diện',
              'Hiệu suất quỹ tham gia đã được thiết lập',
            ],
            limitations: [
              'Đáo hạn ở tuổi 100 so với bảo hiểm tuổi 130 của chúng tôi',
              'Không có quyền lợi bảo vệ mất việc làm',
              'Không có tính năng tiếp tục người được bảo hiểm phụ',
              'Không thể thay đổi người được bảo hiểm',
              'Yêu cầu phí bảo hiểm tối thiểu cao hơn',
              'Không tương thích với quỹ SRS',
            ],
            positioningStrategy:
              'Trong khi AIA Capital Elite cung cấp tỷ lệ cho vay cao hơn, PRUWealth Plus mang lại giá trị vượt trội thông qua quyền lợi mất việc làm độc đáo (10% phí trong 5 năm đầu), bảo hiểm mở rộng đến tuổi 130, và các tính năng chuyển giao tài sản sáng tạo. Người được bảo hiểm phụ của chúng tôi đảm bảo tiếp tục hợp đồng khi người chính qua đời, và tùy chọn thay đổi người được bảo hiểm cung cấp linh hoạt không gì sánh được cho kế hoạch tài sản - các tính năng tạo nên sự khác biệt của chúng tôi.',
          },
          {
            name: 'SP Wealth Assure',
            company: 'NTUC Income',
            type: 'Kế hoạch tham gia phí một lần',
            keyFeatures: [
              'Thanh toán phí một lần',
              'Bảo hiểm trọn đời có tham gia',
              'Tiền thưởng hàng năm',
              'Tiền thưởng cuối cùng khi đáo hạn hoặc yêu cầu bồi thường',
              'Quyền lợi tử vong và thương tật toàn bộ vĩnh viễn',
              'Tiện ích cho vay từ hợp đồng',
              'Bảo hiểm đến tuổi 100',
            ],
            strengths: [
              'Mức phí bảo hiểm cạnh tranh (mô hình doanh nghiệp xã hội)',
              'Lòng tin cộng đồng mạnh mẽ',
              'Quyền lợi TPD được bao gồm trong kế hoạch cơ bản',
              'Công bố tiền thưởng minh bạch',
              'Có thể tiếp cận cho các phân khúc thị trường rộng hơn',
            ],
            limitations: [
              'Bảo hiểm giới hạn đến tuổi 100 so với tuổi 130 của chúng tôi',
              'Không có quyền lợi mất việc làm',
              'Không có tính năng người được bảo hiểm phụ',
              'Không có linh hoạt thay đổi người được bảo hiểm',
              'Các tùy chọn dịch vụ cao cấp hạn chế',
              'Không tương thích với quỹ SRS',
            ],
            positioningStrategy:
              'PRUWealth Plus cung cấp bảo vệ toàn diện vượt xa NTUC Income SP Wealth Assure với bảo hiểm kéo dài thêm 30 năm (đến tuổi 130), cộng với các tính năng độc quyền: quyền lợi mất việc làm 10% trong 5 năm đầu, người được bảo hiểm phụ cho việc chuyển giao tài sản liền mạch, và tùy chọn thay đổi người được bảo hiểm cho linh hoạt kế hoạch tài sản. Khả năng tương thích SRS của chúng tôi bổ sung lợi thế kế hoạch hưu trí mà sản phẩm của họ không thể cung cấp.',
          },
        ],
      },
      // Thai
      th: {
        competitors: [
          {
            name: 'GREAT SP Secure',
            company: 'Great Eastern',
            type: 'ประกันชีวิตตลอดชีพแบบมีส่วนร่วมเบี้ยประกันเดี่ยว',
            keyFeatures: [
              'โครงสร้างการชำระเบี้ยประกันเดี่ยว',
              'ความคุ้มครองตลอดชีพพร้อมองค์ประกอบการออม',
              'มูลค่าเงินสดที่รับประกันตั้งแต่เริ่มกรมธรรม์',
              'โบนัสรายปี (ไม่รับประกัน)',
              'โบนัสสุดท้ายที่จ่ายเมื่อครบกำหนดหรือเคลม',
              'สิ่งอำนวยความสะดวกสินเชื่อกรมธรรม์มีให้',
              'ความคุ้มครองจนถึงอายุ 99 ปี',
            ],
            strengths: [
              'แบรนด์ที่ก่อตั้งมาแล้วพร้อมประวัติยาวนานในสิงคโปร์',
              'มูลค่าเงินสดที่รับประกันที่แข่งขันได้',
              'โครงสร้างโบนัสที่ตรงไปตรงมา',
              'ข้อกำหนดเบี้ยประกันขั้นต่ำที่ต่ำกว่า',
              'ประวัติการเคลมที่ดีที่สุด',
            ],
            limitations: [
              'ความคุ้มครองเพียงถึงอายุ 99 ปี เทียบกับอายุ 130 ปีของเรา',
              'ไม่มีการป้องกันผลประโยชน์การถูกเลิกจ้าง',
              'ไม่มีคุณสมบัติผู้เอาประกันภัยรอง',
              'ไม่มีตัวเลือกเปลี่ยนผู้เอาประกันภัย',
              'ความยืดหยุ่นในการโอนความมั่งคั่งจำกัด',
              'ไม่มีความเข้ากันได้กับ SRS',
            ],
            positioningStrategy:
              'PRUWealth Plus นำเสนอความคุ้มครองอายุขัยที่เหนือกว่าจนถึงอายุ 130 ปี (เทียบกับอายุ 99 ปีของพวกเขา) พร้อมคุณสมบัติการโอนความมั่งคั่งที่เป็นเอกลักษณ์รวมถึงผู้เอาประกันภัยรองและตัวเลือกเปลี่ยนผู้เอาประกันภัยไม่จำกัด ผลประโยชน์การถูกเลิกจ้างของเราให้การป้องกัน 10% เบี้ยประกันเดี่ยวใน 5 ปีแรก - คุณสมบัติที่พวกเขาไม่สามารถเทียบได้ นอกจากนี้ ความเข้ากันได้กับ SRS ของเรายังมอบความยืดหยุ่นในการวางแผนเกษียณอายุ',
          },
          {
            name: 'Capital Elite',
            company: 'AIA',
            type: 'ประกันชีวิตแบบมีส่วนร่วมเบี้ยประกันเดี่ยว',
            keyFeatures: [
              'ประกันชีวิตตลอดชีพเบี้ยประกันเดี่ยว',
              'โบนัสที่รับประกันและไม่รับประกัน',
              'ความคุ้มครองผลประโยชน์เสียชีวิต',
              'การสะสมมูลค่าเงินสด',
              'สินเชื่อกรมธรรม์สูงสุด 80% ของมูลค่าเงินสด',
              'ครบกำหนดที่อายุ 100 ปี',
              'การมีส่วนร่วมในเงินปันผล',
            ],
            strengths: [
              'อัตราสินเชื่อกรมธรรม์ที่สูงกว่า (80% เทียบกับ 70% ของเรา)',
              'ประวัติการประกาศโบนัสที่แข็งแกร่ง',
              'เครือข่ายการกระจายสินค้าที่กว้าง',
              'ตัวเลือกไรเดอร์ที่ครอบคลุม',
              'ผลการดำเนินงานกองทุนที่มีส่วนร่วมที่ดี',
            ],
            limitations: [
              'ครบกำหนดที่อายุ 100 ปี เทียบกับความคุ้มครองอายุ 130 ปีของเรา',
              'ไม่มีผลประโยชน์การป้องกันการถูกเลิกจ้าง',
              'ไม่มีคุณสมบัติการดำเนินต่อผู้เอาประกันภัยรอง',
              'ไม่สามารถเปลี่ยนผู้เอาประกันภัยได้',
              'ข้อกำหนดเบี้ยประกันขั้นต่ำที่สูงกว่า',
              'ไม่เข้ากันกับกองทุน SRS',
            ],
            positioningStrategy:
              'แม้ว่า AIA Capital Elite จะเสนออัตราสินเชื่อที่สูงกว่า แต่ PRUWealth Plus มอบคุณค่าที่เหนือกว่าผ่านผลประโยชน์การถูกเลิกจ้างที่เป็นเอกลักษณ์ (10% ของเบี้ยประกันใน 5 ปีแรก) ความคุ้มครองที่ขยายถึงอายุ 130 ปี และคุณสมบัติการโอนความมั่งคั่งที่นวัตกรรม ผู้เอาประกันภัยรองของเรารับประกันการดำเนินต่อกรมธรรม์เมื่อผู้หลักเสียชีวิต และตัวเลือกเปลี่ยนผู้เอาประกันภัยให้ความยืดหยุ่นที่ไม่มีใครเทียบได้สำหรับการวางแผนทรัพย์สิน - คุณสมบัติที่ทำให้เราโดดเด่น',
          },
          {
            name: 'SP Wealth Assure',
            company: 'NTUC Income',
            type: 'แผนมีส่วนร่วมเบี้ยประกันเดี่ยว',
            keyFeatures: [
              'การชำระเบี้ยประกันเดี่ยว',
              'ความคุ้มครองตลอดชีพแบบมีส่วนร่วม',
              'โบนัสรายปี',
              'โบนัสสุดท้ายเมื่อครบกำหนดหรือเคลม',
              'ผลประโยชน์เสียชีวิตและความพิการถาวรสิ้นเชิง',
              'สิ่งอำนวยความสะดวกสินเชื่อกรมธรรม์',
              'ความคุ้มครองถึงอายุ 100 ปี',
            ],
            strengths: [
              'อัตราเบี้ยประกันที่แข่งขันได้ (โมเดลวิสาหกิจเพื่อสังคม)',
              'ความไว้วางใจของชุมชนที่แข็งแกร่ง',
              'ผลประโยชน์ TPD รวมอยู่ในแผนพื้นฐาน',
              'การประกาศโบนัสที่โปร่งใส',
              'เข้าถึงได้ในส่วนตลาดที่กว้างขวางกว่า',
            ],
            limitations: [
              'ความคุ้มครองจำกัดถึงอายุ 100 ปี เทียบกับอายุ 130 ปีของเรา',
              'ไม่มีผลประโยชน์การถูกเลิกจ้าง',
              'ไม่มีคุณสมบัติผู้เอาประกันภัยรอง',
              'ไม่มีความยืดหยุ่นในการเปลี่ยนผู้เอาประกันภัย',
              'ตัวเลือกบริการพรีเมียมที่จำกัด',
              'ไม่มีความเข้ากันได้กับกองทุน SRS',
            ],
            positioningStrategy:
              'PRUWealth Plus ให้การป้องกันที่ครอบคลุมเหนือกว่า NTUC Income SP Wealth Assure ด้วยความคุ้มครองที่ขยายยาวกว่า 30 ปี (ถึงอายุ 130 ปี) บวกกับคุณสมบัติพิเศษ: ผลประโยชน์การถูกเลิกจ้าง 10% ใน 5 ปีแรก ผู้เอาประกันภัยรองสำหรับการโอนความมั่งคั่งที่ราบรื่น และตัวเลือกเปลี่ยนผู้เอาประกันภัยสำหรับความยืดหยุ่นในการวางแผนทรัพย์สิน ความเข้ากันได้กับ SRS ของเราเพิ่มข้อได้เปรียบในการวางแผนเกษียณอายุที่ผลิตภัณฑ์ของพวกเขาไม่สามารถนำเสนอได้',
          },
        ],
      },
    },
  };

// Main Prudential competitive intelligence configuration with product specificity
export const prudentialCompetitiveIntelligenceConfiguration: ProductCompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'prudential',
      company: 'prudential',
      targetMarket: 'Singapore Insurance Market',
    },
    products: {
      'all-products-exploratory': allProductsExploratoryCompetitiveIntelligence,
      prushield: prushieldCompetitiveIntelligence,
      'prulifetime-income-plus': prulifetimeIncomePlusCompetitiveIntelligence,
      'pruvantage-assure-ii': pruvantageAssureIICompetitiveIntelligence,
      'pruwealth-plus': pruwealthPlusCompetitiveIntelligence,
    },
  };
