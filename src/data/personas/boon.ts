import { PersonaConfiguration } from './types.js';
import {
  ELEVEN_LABS_MALE_VOICE_ID,
  ELEVEN_LABS_INDONESIAN_YOUNG_MALE_VOICE_ID,
  ELEVEN_LABS_MALAYSIAN_YOUNG_MALE_VOICE_ID,
  ELEVEN_LABS_TAGALOG_YOUNG_MALE_VOICE_ID,
  ELEVEN_LABS_VIETNAMESE_YOUNG_MALE_VOICE_ID,
  CHIRP_THAI_YOUNG_MALE_VOICE_ID,
  ELEVEN_LABS_KOREAN_YOUNG_MALE_VOICE_ID,
} from '../../utils/constants.js';

/**
 * Boon - Future Wealth Grower (BBL)
 * Young professional focused on career growth and building first major assets
 */
export const boonPersona: PersonaConfiguration = {
  base: {
    id: '6826940f3e77a12f1cf3087d',
    friendlyId: 'parit-future-wealth-grower',
    name: 'Boon',
    age: 35,
    image:
      'https://dopmo1eihgbgm.cloudfront.net/6826940f3e77a12f1cf3087d/sq-parit.png',
    voiceId: ELEVEN_LABS_MALE_VOICE_ID,
    annualIncome: 750000,
    gender: 'male',
    bblFinancialProfile: {
      profileData: {
        aum: '10-12M THB',
        numberOfKids: 0,
      },
      retirementGoal: {
        retirementAge: 60,
        payoutYears: 25,
        retirementLifestyle: 'budget',
        protectionPercentage: 50,
        prefersRegularPayouts: true,
        prefersShorterPaymentPeriod: false,
        upfrontInvestment: 0,
      },
    },
  },

  localized: {
    // English (Original)
    en: {
      occupation: 'Rising Mid-level Corporate Management',
      description:
        'Early career professional with 8-10 years of experience working in a major global corporate. Ambitious and growth-driven, focused on career advancement.',
      bblFinancialProfile: {
        profileData: {
          demographicProfile: 'Male, Young professional, early career stage',
          behaviorProfile: 'Deposit-heavy',
          workHistory:
            'Early career professional with ~8-10 years of experience. Works in a major global corporate',
          liquidityNeeds:
            'Moderate – driven by lifestyle upgrades (travel, gadgets), professional development (courses), and maintaining an urban lifestyle',
          riskAppetite: 'Moderate',
          investmentFrequency: 'Regular but cautious',
          keyLifestyleExpenditure:
            'Travel, personal development programs, gadgets, networking events, nightlife/social lifestyle',
          discPersonality: 'Dominance',
        },
      },
      details: {
        location: 'Bangkok, Thailand',
        education: 'Master of Business Administration',
        occupation: 'Rising Mid-level Corporate Management Team',
        financialSituation:
          'Wealth in accumulation phase. Deposit-heavy, building base savings while starting to experiment with equities and mutual funds.',
        keyPriorities: [
          'Career growth and professional development',
          'Financial independence and wealth building',
          'Acquiring first major assets (property)',
          'Lifestyle upgrades and experiences',
        ],
        productKnowledge:
          'Good understanding of basic financial products, researches investment options actively but prefers simple and accessible solutions',
        mainObjection:
          "I'm interested in growing my wealth, but I want to make sure any investment aligns with my career timeline and risk tolerance.",
        salesDescription:
          'You’ll be speaking with Boon, 35, a young professional early in his corporate career who is focused on career growth, financial independence, and buying his first major asset. Your goal is to welcome him to Wealth, capture any recent updates, present key services that fit his plans, and secure agreement for a follow-up investment advisory session.',
      },
      personalityDetails: {
        persona:
          'Ambitious, aspirational, curious, growth-driven, data-focused, open to new opportunities',
        communicationStyle: [
          'Prefers detailed exploration of alternatives',
          'Driven by facts and data',
          'Asks thoughtful questions about long-term implications',
          'Values professional and structured presentations',
          'Appreciates efficiency in communication',
        ],
        decisionMaking: [
          'Explores multiple options thoroughly',
          'Seeks input from peers and family',
          'Open to trying new financial products if simple and accessible',
          'Considers long-term career impact on financial decisions',
        ],
      },
    },

    // Indonesian
    id: {
      occupation: 'Manajemen Perusahaan Tingkat Menengah',
      voiceId: ELEVEN_LABS_INDONESIAN_YOUNG_MALE_VOICE_ID,
      description:
        'Profesional awal karir dengan pengalaman 8-10 tahun bekerja di perusahaan global besar. Ambisius dan berorientasi pertumbuhan, fokus pada kemajuan karir.',
      bblFinancialProfile: {
        profileData: {
          demographicProfile: 'Laki-laki, Profesional muda, tahap awal karir',
          behaviorProfile: 'Fokus deposito',
          workHistory:
            'Profesional awal karir dengan pengalaman ~8-10 tahun. Bekerja di perusahaan global besar',
          liquidityNeeds:
            'Sedang – didorong oleh peningkatan gaya hidup (perjalanan, gadget), pengembangan profesional (kursus), dan mempertahankan gaya hidup urban',
          riskAppetite: 'Sedang',
          investmentFrequency: 'Teratur namun hati-hati',
          keyLifestyleExpenditure:
            'Perjalanan, program pengembangan diri, gadget, acara networking, gaya hidup malam/sosial',
          discPersonality: 'Dominance',
        },
      },
      details: {
        location: 'Bangkok, Thailand',
        education: 'Master Administrasi Bisnis',
        occupation: 'Tim Manajemen Perusahaan Tingkat Menengah',
        financialSituation:
          'Kekayaan dalam fase akumulasi. Fokus deposito, membangun tabungan dasar sambil mulai bereksperimen dengan saham dan reksa dana.',
        keyPriorities: [
          'Pertumbuhan karir dan pengembangan profesional',
          'Kemerdekaan finansial dan pembangunan kekayaan',
          'Memperoleh aset besar pertama (properti)',
          'Peningkatan gaya hidup dan pengalaman',
        ],
        productKnowledge:
          'Pemahaman yang baik tentang produk keuangan dasar, aktif meneliti pilihan investasi tetapi lebih suka solusi yang sederhana dan mudah diakses',
        mainObjection:
          'Saya tertarik untuk mengembangkan kekayaan saya, tetapi saya ingin memastikan investasi apa pun selaras dengan timeline karir dan toleransi risiko saya.',
        salesDescription:
          'Anda akan berbicara dengan Boon, 35 tahun, seorang profesional muda di awal karir korporatnya yang fokus pada pertumbuhan karir, kemerdekaan finansial, dan membeli aset besar pertamanya. Tujuan Anda adalah menyambutnya ke Wealth, menangkap pembaruan terbaru, menyajikan layanan kunci yang sesuai dengan rencananya, dan mengamankan persetujuan untuk sesi konsultasi investasi lanjutan.',
      },
      personalityDetails: {
        persona:
          'Ambisius, aspiratif, ingin tahu, berorientasi pertumbuhan, fokus data, terbuka terhadap peluang baru',
        communicationStyle: [
          'Lebih suka eksplorasi alternatif yang detail',
          'Didorong oleh fakta dan data',
          'Mengajukan pertanyaan yang bijaksana tentang implikasi jangka panjang',
          'Menghargai presentasi yang profesional dan terstruktur',
          'Menghargai efisiensi dalam komunikasi',
        ],
        decisionMaking: [
          'Mengeksplorasi berbagai pilihan secara menyeluruh',
          'Mencari masukan dari rekan dan keluarga',
          'Terbuka untuk mencoba produk keuangan baru jika sederhana dan mudah diakses',
          'Mempertimbangkan dampak karir jangka panjang pada keputusan keuangan',
        ],
      },
    },

    // Malaysian
    ms: {
      occupation: 'Pengurusan Korporat Peringkat Pertengahan',
      voiceId: ELEVEN_LABS_MALAYSIAN_YOUNG_MALE_VOICE_ID,
      description:
        'Profesional awal kerjaya dengan pengalaman 8-10 tahun bekerja di korporat global utama. Bercita-cita tinggi dan berorientasikan pertumbuhan, fokus pada kemajuan kerjaya.',
      bblFinancialProfile: {
        profileData: {
          demographicProfile:
            'Lelaki, Profesional muda, peringkat awal kerjaya',
          behaviorProfile: 'Berat deposito',
          workHistory:
            'Profesional awal kerjaya dengan pengalaman ~8-10 tahun. Bekerja di korporat global utama',
          liquidityNeeds:
            'Sederhana – didorong oleh peningkatan gaya hidup (perjalanan, gadget), pembangunan profesional (kursus), dan mengekalkan gaya hidup bandar',
          riskAppetite: 'Sederhana',
          investmentFrequency: 'Tetap tetapi berhati-hati',
          keyLifestyleExpenditure:
            'Perjalanan, program pembangunan diri, gadget, acara rangkaian, gaya hidup malam/sosial',
          discPersonality: 'Dominance',
        },
      },
      details: {
        location: 'Bangkok, Thailand',
        education: 'Sarjana Pentadbiran Perniagaan',
        occupation: 'Pasukan Pengurusan Korporat Peringkat Pertengahan',
        financialSituation:
          'Kekayaan dalam fasa pengumpulan. Berat deposito, membina simpanan asas sambil mula bereksperimen dengan ekuiti dan dana bersama.',
        keyPriorities: [
          'Pertumbuhan kerjaya dan pembangunan profesional',
          'Kebebasan kewangan dan pembinaan kekayaan',
          'Memperoleh aset utama pertama (hartanah)',
          'Peningkatan gaya hidup dan pengalaman',
        ],
        productKnowledge:
          'Pemahaman yang baik tentang produk kewangan asas, aktif menyelidik pilihan pelaburan tetapi lebih suka penyelesaian yang mudah dan boleh diakses',
        mainObjection:
          'Saya berminat untuk mengembangkan kekayaan saya, tetapi saya ingin memastikan sebarang pelaburan sejajar dengan jadual waktu kerjaya dan toleransi risiko saya.',
        salesDescription:
          'Anda akan bercakap dengan Boon, 35 tahun, seorang profesional muda di awal kerjaya korporatnya yang fokus pada pertumbuhan kerjaya, kebebasan kewangan, dan membeli aset utama pertamanya. Matlamat anda adalah menyambutnya ke Wealth, menangkap kemas kini terkini, menyampaikan perkhidmatan utama yang sesuai dengan rancangannya, dan mendapatkan persetujuan untuk sesi nasihat pelaburan susulan.',
      },
      personalityDetails: {
        persona:
          'Bercita-cita tinggi, aspiratif, ingin tahu, berorientasikan pertumbuhan, fokus data, terbuka kepada peluang baru',
        communicationStyle: [
          'Lebih suka penerokaan alternatif yang terperinci',
          'Didorong oleh fakta dan data',
          'Mengajukan soalan yang bijak tentang implikasi jangka panjang',
          'Menghargai persembahan yang profesional dan berstruktur',
          'Menghargai kecekapan dalam komunikasi',
        ],
        decisionMaking: [
          'Meneroka pelbagai pilihan dengan teliti',
          'Mencari input dari rakan dan keluarga',
          'Terbuka untuk mencuba produk kewangan baru jika mudah dan boleh diakses',
          'Mempertimbangkan kesan kerjaya jangka panjang pada keputusan kewangan',
        ],
      },
    },

    // Tagalog
    tl: {
      voiceId: ELEVEN_LABS_TAGALOG_YOUNG_MALE_VOICE_ID,
      occupation: 'Rising Mid-level Corporate Management',
      description:
        'Early career professional na may 8-10 years experience na nagtatrabaho sa major global corporate. Ambitious at growth-driven, focused sa career advancement.',
      bblFinancialProfile: {
        profileData: {
          demographicProfile: 'Lalaki, Young professional, early career stage',
          behaviorProfile: 'Deposit-heavy',
          workHistory:
            'Early career professional na may ~8-10 years experience. Nagtatrabaho sa major global corporate',
          liquidityNeeds:
            'Moderate – driven ng lifestyle upgrades (travel, gadgets), professional development (courses), at maintaining ng urban lifestyle',
          riskAppetite: 'Moderate',
          investmentFrequency: 'Regular pero cautious',
          keyLifestyleExpenditure:
            'Travel, personal development programs, gadgets, networking events, nightlife/social lifestyle',
          discPersonality: 'Dominance',
        },
      },
      details: {
        location: 'Bangkok, Thailand',
        education: 'Master of Business Administration',
        occupation: 'Rising Mid-level Corporate Management Team',
        financialSituation:
          'Wealth sa accumulation phase. Deposit-heavy, nagbubuild ng base savings habang nagsisimula mag-experiment sa equities at mutual funds.',
        keyPriorities: [
          'Career growth at professional development',
          'Financial independence at wealth building',
          'Pagkuha ng first major assets (property)',
          'Lifestyle upgrades at experiences',
        ],
        productKnowledge:
          'Magandang understanding sa basic financial products, actively nag-research ng investment options pero prefer ang simple at accessible na solutions',
        mainObjection:
          'Interested ako sa paglaki ng wealth ko, pero gusto ko masiguro na any investment ay aligned sa career timeline at risk tolerance ko.',
        salesDescription:
          'Makakausap mo si Boon, 35, isang young professional na nasa early stage ng corporate career niya na focused sa career growth, financial independence, at pagbili ng first major asset niya. Goal mo ay i-welcome siya sa Wealth, ma-capture ang recent updates, i-present ang key services na fit sa plans niya, at makuha ang agreement para sa follow-up investment advisory session.',
      },
      personalityDetails: {
        persona:
          'Ambitious, aspirational, curious, growth-driven, data-focused, open sa new opportunities',
        communicationStyle: [
          'Prefer ang detailed exploration ng alternatives',
          'Driven ng facts at data',
          'Nagtanong ng thoughtful questions about long-term implications',
          'Values professional at structured presentations',
          'Appreciates efficiency sa communication',
        ],
        decisionMaking: [
          'Thoroughly nag-explore ng multiple options',
          'Humihingi ng input from peers at family',
          'Open na subukan ang new financial products kung simple at accessible',
          'Considers long-term career impact sa financial decisions',
        ],
      },
    },

    // Vietnamese
    vi: {
      voiceId: ELEVEN_LABS_VIETNAMESE_YOUNG_MALE_VOICE_ID,
      occupation: 'Quản lý Doanh nghiệp Cấp trung',
      description:
        'Chuyên gia nghề nghiệp với 8-10 năm kinh nghiệm làm việc tại tập đoàn toàn cầu lớn. Có tham vọng và hướng tới tăng trưởng, tập trung vào thăng tiến sự nghiệp.',
      bblFinancialProfile: {
        profileData: {
          demographicProfile: 'Nam, Chuyên gia trẻ, giai đoạn đầu sự nghiệp',
          behaviorProfile: 'Tập trung tiết kiệm',
          workHistory:
            'Chuyên gia đầu sự nghiệp với kinh nghiệm ~8-10 năm. Làm việc tại tập đoàn toàn cầu lớn',
          liquidityNeeds:
            'Vừa phải – được thúc đẩy bởi nâng cấp lối sống (du lịch, thiết bị), phát triển chuyên môn (khóa học), và duy trì lối sống đô thị',
          riskAppetite: 'Vừa phải',
          investmentFrequency: 'Thường xuyên nhưng thận trọng',
          keyLifestyleExpenditure:
            'Du lịch, chương trình phát triển cá nhân, thiết bị, sự kiện kết nối, lối sống giải trí/xã hội',
          discPersonality: 'Dominance',
        },
      },
      details: {
        location: 'Bangkok, Thái Lan',
        education: 'Thạc sĩ Quản trị Kinh doanh',
        occupation: 'Đội ngũ Quản lý Doanh nghiệp Cấp trung',
        financialSituation:
          'Tài sản trong giai đoạn tích lũy. Tập trung tiết kiệm, xây dựng số tiết kiệm cơ bản đồng thời bắt đầu thử nghiệm với cổ phiếu và quỹ tương hỗ.',
        keyPriorities: [
          'Tăng trưởng nghề nghiệp và phát triển chuyên môn',
          'Độc lập tài chính và xây dựng tài sản',
          'Có được tài sản lớn đầu tiên (bất động sản)',
          'Nâng cấp lối sống và trải nghiệm',
        ],
        productKnowledge:
          'Hiểu biết tốt về các sản phẩm tài chính cơ bản, tích cực nghiên cứu các lựa chọn đầu tư nhưng thích các giải pháp đơn giản và dễ tiếp cận',
        mainObjection:
          'Tôi quan tâm đến việc tăng trưởng tài sản, nhưng tôi muốn đảm bảo bất kỳ khoản đầu tư nào cũng phù hợp với lộ trình nghề nghiệp và khả năng chấp nhận rủi ro của tôi.',
        salesDescription:
          'Bạn sẽ nói chuyện với Boon, 35 tuổi, một chuyên gia trẻ đang ở giai đoạn đầu sự nghiệp doanh nghiệp, tập trung vào tăng trưởng sự nghiệp, độc lập tài chính và mua tài sản lớn đầu tiên. Mục tiêu của bạn là chào mừng anh ấy đến với Wealth, nắm bắt các cập nhật gần đây, trình bày các dịch vụ chính phù hợp với kế hoạch của anh ấy và đảm bảo thỏa thuận cho buổi tư vấn đầu tư tiếp theo.',
      },
      personalityDetails: {
        persona:
          'Có tham vọng, khát vọng, tò mò, hướng tới tăng trưởng, tập trung vào dữ liệu, cởi mở với cơ hội mới',
        communicationStyle: [
          'Thích khám phá chi tiết các lựa chọn thay thế',
          'Được thúc đẩy bởi sự thật và dữ liệu',
          'Đặt câu hỏi sâu sắc về tác động lâu dài',
          'Đánh giá cao các bài thuyết trình chuyên nghiệp và có cấu trúc',
          'Đánh giá cao hiệu quả trong giao tiếp',
        ],
        decisionMaking: [
          'Khám phá kỹ lưỡng nhiều lựa chọn',
          'Tìm kiếm ý kiến từ đồng nghiệp và gia đình',
          'Sẵn sàng thử các sản phẩm tài chính mới nếu đơn giản và dễ tiếp cận',
          'Xem xét tác động nghề nghiệp lâu dài đối với quyết định tài chính',
        ],
      },
    },

    // Thai
    th: {
      voiceId: CHIRP_THAI_YOUNG_MALE_VOICE_ID,
      occupation: 'ผู้บริหารระดับกลาง',
      description:
        'ผู้เชี่ยวชาญในวัยต้นของอาชีพที่มีประสบการณ์ 8-10 ปี ทำงานในบริษัทข้ามชาติขนาดใหญ่ มีความมุ่งมั่นและมุ่งเน้นการเติบโต มุ่งเน้นความก้าวหน้าในอาชีพ',
      bblFinancialProfile: {
        profileData: {
          demographicProfile:
            'ชาย, เชี่ยวชาญด้านการลงทุน, ระยะเริ่มต้น-ปานกลางของการอาชีพทำงาน',
          behaviorProfile: 'เน้นลงทุนในเงินฝาก',
          workHistory:
            'ผู้บริหารระดับกลางด้วยประสบการทำงาน 8-10 ปี ทำงานในบริษัทข้ามชาติขนาดใหญ่',
          liquidityNeeds:
            'ปานกลาง - ขับเคลื่อนโดยการอัปเกรดไลฟ์สไตล์ (การเดินทาง gadget) การพัฒนาวิชาชีพ (หลักสูตร) และการรักษาไลฟ์สไตล์เมือง',
          riskAppetite: 'ปานกลาง',
          investmentFrequency: 'ลงทุนอย่างสม่ำเสมออย่างระมัดระวัง',
          keyLifestyleExpenditure:
            'การเดินทาง โปรแกรมพัฒนาตนเอง gadget กิจกรรมnetworking',
          discPersonality: 'Dominance',
        },
      },
      details: {
        location: 'กรุงเทพมหานคร ประเทศไทย',
        education: 'ปริญญาโทบริหารธุรกิจ',
        occupation: 'ผู้บริหารระดับกลาง',
        financialSituation:
          'อยู่ในช่วงสะสมทรัพย์สิน เน้นลงทุนในเงินฝาก สร้างเงินออมพื้นฐานในขณะที่เริ่มทดลองลงทุนในหุ้นและกองทุนรวม',
        keyPriorities: [
          'การเติบโตในอาชีพและการพัฒนาวิชาชีพ',
          'ความเป็นอิสระทางการเงินและการสร้างความมั่งคั่ง',
          'การได้มาซึ่งสินทรัพย์หลักครั้งแรก (อสังหาริมทรัพย์)',
          'การยกระดับไลฟ์สไตล์และประสบการณ์',
        ],
        productKnowledge:
          'มีความเข้าใจที่ดีเกี่ยวกับผลิตภัณฑ์ทางการเงินพื้นฐาน ค้นคว้าตัวเลือกการลงทุนอย่างแข็งขัน แต่ต้องการโซลูชันที่เรียบง่ายและเข้าถึงได้',
        mainObjection:
          'ผมสนใจที่จะเพิ่มความมั่งคั่ง แต่ผมต้องการให้แน่ใจว่าการลงทุนใดๆ สอดคล้องกับกรอบเวลาอาชีพและความสามารถในการรับความเสี่ยงของผม',
        salesDescription:
          'คุณจะได้พูดคุยกับบุญ อายุ 35 ปี ผู้เชี่ยวชาญหนุ่มที่อยู่ในช่วงต้นของอาชีพองค์กร ที่มุ่งเน้นการเติบโตในอาชีพ ความเป็นอิสระทางการเงิน และการซื้อสินทรัพย์หลักครั้งแรก เป้าหมายของคุณคือต้อนรับเขาสู่ Wealth จับข้อมูลอัปเดตล่าสุด นำเสนอบริการหลักที่เหมาะกับแผนของเขา และรักษาข้อตกลงสำหรับเซสชันให้คำปรึกษาการลงทุนครั้งต่อไป',
      },
      personalityDetails: {
        persona:
          'มีความทะเยอทะยาน มีแรงบันดาลใจ อยากรู้อยากเห็น มุ่งเน้นการเติบโต เน้นข้อมูล เปิดรับโอกาสใหม่',
        communicationStyle: [
          'ชอบการสำรวจทางเลือกอย่างละเอียด',
          'ขับเคลื่อนด้วยข้อเท็จจริงและข้อมูล',
          'ถามคำถามที่มีความคิดเกี่ยวกับผลกระทบระยะยาว',
          'ให้ความสำคัญกับการนำเสนอที่เป็นมืออาชีพและมีโครงสร้าง',
          'ชื่นชมประสิทธิภาพในการสื่อสาร',
        ],
        decisionMaking: [
          'สำรวจตัวเลือกต่างๆ อย่างละเอียดถี่ถ้วน',
          'ขอความเห็นจากเพื่อนร่วมงานและครอบครัว',
          'เปิดรับการลองผลิตภัณฑ์ทางการเงินใหม่หากเรียบง่ายและเข้าถึงได้',
          'พิจารณาผลกระทบระยะยาวต่ออาชีพในการตัดสินใจทางการเงิน',
        ],
      },
    },

    // Korean
    ko: {
      voiceId: ELEVEN_LABS_KOREAN_YOUNG_MALE_VOICE_ID,
      occupation: '중견 기업 경영진',
      description:
        '주요 글로벌 기업에서 8-10년 경력의 초기 경력 전문가. 야심차고 성장 지향적이며 경력 발전에 집중합니다.',
      bblFinancialProfile: {
        profileData: {
          demographicProfile: '남성, 젊은 전문가, 초기 경력 단계',
          behaviorProfile: '예금 중심',
          workHistory:
            '약 8-10년 경력의 초기 경력 전문가. 주요 글로벌 기업에서 근무',
          liquidityNeeds:
            '보통 – 라이프스타일 업그레이드(여행, 가젯), 전문성 개발(강좌), 도시 생활 유지에 의해 주도됨',
          riskAppetite: '보통',
          investmentFrequency: '정기적이지만 신중함',
          keyLifestyleExpenditure:
            '여행, 자기 개발 프로그램, 가젯, 네트워킹 이벤트, 야간 생활/사교 생활',
          discPersonality: 'Dominance',
        },
      },
      details: {
        location: '방콕, 태국',
        education: '경영학 석사',
        occupation: '중견 기업 경영팀',
        financialSituation:
          '자산 축적 단계. 예금 중심으로 기본 저축을 쌓으면서 주식과 뮤추얼 펀드 실험을 시작하고 있습니다.',
        keyPriorities: [
          '경력 성장 및 전문성 개발',
          '재정적 독립 및 자산 형성',
          '첫 번째 주요 자산 취득 (부동산)',
          '라이프스타일 업그레이드 및 경험',
        ],
        productKnowledge:
          '기본 금융 상품에 대한 좋은 이해, 투자 옵션을 적극적으로 조사하지만 단순하고 접근 가능한 솔루션을 선호합니다',
        mainObjection:
          '저는 자산을 늘리는 데 관심이 있지만, 어떤 투자든 제 경력 일정과 위험 허용 범위에 맞는지 확인하고 싶습니다.',
        salesDescription:
          'Boon(35세)은 기업 경력 초기에 있는 젊은 전문가로, 경력 성장, 재정적 독립, 첫 번째 주요 자산 구매에 집중하고 있습니다. 귀하의 목표는 그를 Wealth에 환영하고, 최근 업데이트를 파악하고, 그의 계획에 맞는 핵심 서비스를 제시하며, 후속 투자 자문 세션에 대한 동의를 확보하는 것입니다.',
      },
      personalityDetails: {
        persona:
          '야심차고, 포부가 있으며, 호기심이 많고, 성장 지향적이며, 데이터 중심적이고, 새로운 기회에 개방적',
        communicationStyle: [
          '대안에 대한 상세한 탐색 선호',
          '사실과 데이터에 의해 주도됨',
          '장기적 영향에 대해 사려 깊은 질문을 함',
          '전문적이고 체계적인 프레젠테이션을 중시함',
          '커뮤니케이션의 효율성을 높이 평가함',
        ],
        decisionMaking: [
          '여러 옵션을 철저히 탐색함',
          '동료와 가족의 의견을 구함',
          '단순하고 접근 가능하다면 새로운 금융 상품을 시도할 의향이 있음',
          '재정적 결정에서 장기적 경력 영향을 고려함',
        ],
      },
    },
  },
};
