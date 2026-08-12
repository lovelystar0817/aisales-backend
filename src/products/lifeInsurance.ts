import { ProductConfiguration } from './types.js';

/**
 * Life Insurance - Comprehensive life protection
 * Financial protection for beneficiaries with flexible options
 */
export const lifeInsuranceConfiguration: ProductConfiguration = {
  base: {
    id: 'life-insurance',
    friendlyId: 'life-insurance',
    category: 'insurance',
  },

  localized: {
    // English (Original)
    en: {
      name: 'Life Insurance',
      keyFeatures: [
        'Guaranteed death benefit protection for beneficiaries',
        'Flexible term and permanent life insurance options',
        'Accelerated underwriting with fast approval processes',
        'Living benefits for terminal illness and chronic conditions',
        'Cash value accumulation in permanent life policies',
        'Conversion options from term to permanent coverage',
        'Portable coverage independent of employment',
        'Digital application and policy management tools',
        'Compassionate claims support and beneficiary assistance',
      ],
      featureHighlight: {
        title: 'Complete Financial Protection with Modern Technology',
        description:
          'Our life insurance combines essential financial protection for your loved ones with cutting-edge technology for faster, easier coverage. From accelerated underwriting to living benefits, we provide comprehensive protection that adapts to your changing life needs.',
      },
      evaluationFocus: [
        'Death benefit amount based on income replacement needs',
        'Term vs. permanent life insurance options',
        'Cash value growth potential and investment features',
        'Conversion and future insurability options',
        'Premium affordability and payment flexibility',
        'Living benefits and accelerated death benefit provisions',
        'Insurance company financial strength ratings',
        'Digital tools and customer service quality',
      ],
    },

    // Indonesian
    id: {
      name: 'Asuransi Jiwa',
      keyFeatures: [
        'Perlindungan manfaat kematian yang dijamin untuk penerima manfaat',
        'Pilihan asuransi jiwa berjangka dan permanen yang fleksibel',
        'Proses underwriting yang dipercepat dengan persetujuan cepat',
        'Manfaat hidup untuk penyakit terminal dan kondisi kronis',
        'Akumulasi nilai tunai dalam polis jiwa permanen',
        'Opsi konversi dari cakupan berjangka ke permanen',
        'Cakupan portabel yang tidak tergantung pekerjaan',
        'Aplikasi digital dan tools manajemen polis',
        'Dukungan klaim yang komprehensif dan bantuan penerima manfaat',
      ],
      featureHighlight: {
        title: 'Perlindungan Keuangan Lengkap dengan Teknologi Modern',
        description:
          'Asuransi jiwa kami menggabungkan perlindungan keuangan penting untuk keluarga dengan teknologi canggih untuk proses yang lebih cepat dan mudah. Dari underwriting yang dipercepat hingga manfaat hidup, kami menyediakan perlindungan komprehensif yang beradaptasi dengan kebutuhan hidup Anda.',
      },
      evaluationFocus: [
        'Jumlah manfaat kematian berdasarkan kebutuhan penggantian pendapatan',
        'Pilihan asuransi jiwa berjangka vs permanen',
        'Potensi pertumbuhan nilai tunai dan fitur investasi',
        'Opsi konversi dan jaminan asuransi masa depan',
        'Keterjangkauan premi dan fleksibilitas pembayaran',
        'Manfaat hidup dan ketentuan manfaat kematian yang dipercepat',
        'Rating kekuatan keuangan perusahaan asuransi',
        'Tools digital dan kualitas layanan pelanggan',
      ],
    },

    // Malaysian
    ms: {
      name: 'Insurans Hayat',
      keyFeatures: [
        'Perlindungan manfaat kematian yang dijamin untuk benefisiari',
        'Pilihan insurans hayat bertempoh dan kekal yang fleksibel',
        'Pengunderaitan dipercepat dengan proses kelulusan yang pantas',
        'Manfaat hidup untuk penyakit terminal dan keadaan kronik',
        'Pengumpulan nilai tunai dalam polisi hayat kekal',
        'Pilihan penukaran dari liputan bertempoh ke kekal',
        'Liputan mudah alih bebas daripada pekerjaan',
        'Aplikasi digital dan alat pengurusan polisi',
        'Sokongan tuntutan yang penuh kasih sayang dan bantuan benefisiari',
      ],
      featureHighlight: {
        title: 'Perlindungan Kewangan Lengkap dengan Teknologi Moden',
        description:
          'Insurans hayat kami menggabungkan perlindungan kewangan penting untuk orang tersayang anda dengan teknologi canggih untuk liputan yang lebih pantas dan mudah. Dari pengunderaitan dipercepat hingga manfaat hidup, kami menyediakan perlindungan komprehensif yang menyesuaikan dengan keperluan hidup anda yang berubah.',
      },
      evaluationFocus: [
        'Jumlah manfaat kematian berdasarkan keperluan penggantian pendapatan',
        'Pilihan insurans hayat bertempoh vs kekal',
        'Potensi pertumbuhan nilai tunai dan ciri pelaburan',
        'Pilihan penukaran dan kebolehinsuranan masa depan',
        'Kemampuan premium dan fleksibiliti pembayaran',
        'Manfaat hidup dan peruntukan manfaat kematian dipercepat',
        'Penarafan kekuatan kewangan syarikat insurans',
        'Alat digital dan kualiti perkhidmatan pelanggan',
      ],
    },

    // Tagalog (Filipino)
    tl: {
      name: 'Life Insurance',
      keyFeatures: [
        'Guaranteed death benefit protection para sa beneficiaries',
        'Flexible term at permanent life insurance options',
        'Accelerated underwriting na may fast approval processes',
        'Living benefits para sa terminal illness at chronic conditions',
        'Cash value accumulation sa permanent life policies',
        'Conversion options from term to permanent coverage',
        'Portable coverage na independent sa employment',
        'Digital application at policy management tools',
        'Compassionate claims support at beneficiary assistance',
      ],
      featureHighlight: {
        title: 'Complete Financial Protection na may Modern Technology',
        description:
          'Ang aming life insurance ay pinagsasama ang essential financial protection para sa inyong mga loved ones na may cutting-edge technology para sa mas mabilis at mas madaling coverage. Mula sa accelerated underwriting hanggang living benefits, nagbibigay kami ng comprehensive protection na nag-a-adapt sa inyong changing life needs.',
      },
      evaluationFocus: [
        'Death benefit amount based sa income replacement needs',
        'Term vs. permanent life insurance options',
        'Cash value growth potential at investment features',
        'Conversion at future insurability options',
        'Premium affordability at payment flexibility',
        'Living benefits at accelerated death benefit provisions',
        'Insurance company financial strength ratings',
        'Digital tools at customer service quality',
      ],
    },

    // Vietnamese
    vi: {
      name: 'Bảo hiểm nhân thọ',
      keyFeatures: [
        'Bảo vệ quyền lợi tử vong được đảm bảo cho người thụ hưởng',
        'Các lựa chọn bảo hiểm nhân thọ có thời hạn và vĩnh viễn linh hoạt',
        'Thẩm định nhanh với quy trình phê duyệt thần tốc',
        'Quyền lợi người sống cho bệnh giai đoạn cuối và tình trạng mãn tính',
        'Tích lũy giá trị tiền mặt trong các hợp đồng bảo hiểm nhân thọ vĩnh viễn',
        'Các lựa chọn chuyển đổi từ bảo hiểm có thời hạn sang bảo hiểm vĩnh viễn',
        'Bảo hiểm di động độc lập với công việc',
        'Ứng dụng kỹ thuật số và công cụ quản lý hợp đồng',
        'Hỗ trợ khiếu nại chu đáo và hỗ trợ người thụ hưởng',
      ],
      featureHighlight: {
        title: 'Bảo vệ tài chính toàn diện với công nghệ hiện đại',
        description:
          'Bảo hiểm nhân thọ của chúng tôi kết hợp bảo vệ tài chính thiết yếu cho những người thân yêu của bạn với công nghệ tiên tiến để có bảo hiểm nhanh chóng và dễ dàng hơn. Từ thẩm định nhanh đến quyền lợi người sống, chúng tôi cung cấp bảo vệ toàn diện thích ứng với nhu cầu cuộc sống thay đổi của bạn.',
      },
      evaluationFocus: [
        'Số tiền quyền lợi tử vong dựa trên nhu cầu thay thế thu nhập',
        'Các lựa chọn bảo hiểm nhân thọ có thời hạn so với vĩnh viễn',
        'Tiềm năng tăng trưởng giá trị tiền mặt và tính năng đầu tư',
        'Các lựa chọn chuyển đổi và khả năng bảo hiểm trong tương lai',
        'Khả năng chi trả phí bảo hiểm và tính linh hoạt thanh toán',
        'Quyền lợi người sống và điều khoản quyền lợi tử vong được tăng tốc',
        'Xếp hạng sức mạnh tài chính của công ty bảo hiểm',
        'Công cụ kỹ thuật số và chất lượng dịch vụ khách hàng',
      ],
    },

    // Thai
    th: {
      name: 'ประกันชีวิต',
      keyFeatures: [
        'การคุ้มครองสำหรับผู้รับผลประโยชน์ที่รับประกันเมื่อเสียชีวิต',
        'ตัวเลือกประกันชีวิตแบบมีกำหนดและถาวรที่ยืดหยุ่น',
        'การพิจารณาความเสี่ยงที่เร่งด่วนพร้อมกระบวนการอนุมัติที่รวดเร็ว',
        'ผลประโยชน์ระหว่างชีวิตสำหรับโรคระยะสุดท้ายและภาวะเรื้อรัง',
        'การสะสมมูลค่าเงินสดในกรมธรรม์ประกันชีวิตถาวร',
        'ตัวเลือกการแปลงจากการคุ้มครองแบบมีกำหนดเป็นแบบถาวร',
        'การคุ้มครองที่พกพาได้อิสระจากการจ้างงาน',
        'แอปพลิเคชันดิจิทัลและเครื่องมือจัดการกรมธรรม์',
        'การสนับสนุนการเรียกร้องที่เต็มไปด้วยความเห็นใจและความช่วยเหลือผู้รับผลประโยชน์',
      ],
      featureHighlight: {
        title: 'การคุ้มครองทางการเงินที่สมบูรณ์พร้อมเทคโนโลยีสมัยใหม่',
        description:
          'ประกันชีวิตของเราผสมผสานการคุ้มครองทางการเงินที่จำเป็นสำหรับคนที่คุณรักกับเทคโนโลยีล้ำสมัยเพื่อให้ได้การคุ้มครองที่รวดเร็วและง่ายขึ้น จากการพิจารณาความเสี่ยงที่เร่งด่วนจนถึงผลประโยชน์ระหว่างชีวิต เราให้การคุ้มครองที่ครอบคลุมซึ่งปรับตัวให้เข้ากับความต้องการในชีวิตที่เปลี่ยนแปลงของคุณ',
      },
      evaluationFocus: [
        'จำนวนผลประโยชน์เมื่อเสียชีวิตตามความต้องการทดแทนรายได้',
        'ตัวเลือกประกันชีวิตแบบมีกำหนดเทียบกับแบบถาวร',
        'ศักยภาพการเจริญเติบโตของมูลค่าเงินสดและคุณสมบัติการลงทุน',
        'ตัวเลือกการแปลงและความสามารถในการประกันในอนาคต',
        'ความสามารถในการจ่ายเบี้ยประกันและความยืดหยุ่นในการชำระเงิน',
        'ผลประโยชน์ระหว่างชีวิตและบทบัญญัติผลประโยชน์เมื่อเสียชีวิตที่เร่งด่วน',
        'การจัดอันดับความแข็งแกร่งทางการเงินของบริษัทประกัน',
        'เครื่องมือดิจิทัลและคุณภาพการบริการลูกค้า',
      ],
    },

    // Cebuano
    ceb: {
      name: 'Life Insurance',
      keyFeatures: [
        'Garantisado nga benepisyo sa kamatayon nga proteksyon alang sa mga benepisyaryo',
        'Flexible nga mga opsyon sa term ug permanent life insurance',
        'Accelerated underwriting nga adunay paspas nga proseso sa pag-apruba',
        'Mga benepisyo sa kinabuhi alang sa terminal illness ug chronic conditions',
        'Pag-akumula sa cash value sa permanent life policies',
        'Mga opsyon sa pagbag-o gikan sa term ngadto sa permanent coverage',
        'Portable nga coverage nga independente sa trabaho',
        'Digital application ug mga himan sa pagdumala sa policy',
        'Compassionate claims support ug tabang sa benepisyaryo',
      ],
      featureHighlight: {
        title:
          'Kompletong Proteksyon sa Pinansyal nga adunay Modernong Teknolohiya',
        description:
          'Ang among life insurance naghiusa sa mahinungdanon nga proteksyon sa pinansyal alang sa inyong mga minahal nga adunay advanced technology para sa mas paspas ug mas sayon nga coverage. Gikan sa accelerated underwriting ngadto sa mga benepisyo sa kinabuhi, naghatag kami og komprehensibo nga proteksyon nga mo-adapt sa inyong nagbag-o nga mga panginahanglan sa kinabuhi.',
      },
      evaluationFocus: [
        'Kantidad sa death benefit base sa mga panginahanglan sa pag-ilis sa kita',
        'Mga opsyon sa term vs. permanent life insurance',
        'Potensyal sa pagtubo sa cash value ug mga feature sa pamuhunan',
        'Mga opsyon sa pagbag-o ug sa umaabot nga insurability',
        'Affordability sa premium ug flexibility sa pagbayad',
        'Mga benepisyo sa kinabuhi ug mga probisyon sa accelerated death benefit',
        'Mga rating sa pinansyal nga kusog sa kompanya sa insurance',
        'Mga digital tools ug kalidad sa serbisyo sa kostumer',
      ],
    },

    // Traditional Chinese (Taiwan)
    cmn: {
      name: '人壽保險',
      keyFeatures: [
        '為受益人提供保證身故給付保障',
        '靈活的定期與終身壽險選項',
        '加速核保流程，快速獲得批准',
        '末期疾病與慢性病況的生前給付',
        '終身壽險保單中的現金價值累積',
        '定期險轉換為終身保障的選項',
        '不受就業影響的可攜式保障',
        '數位申請與保單管理工具',
        '貼心的理賠支援與受益人協助',
      ],
      featureHighlight: {
        title: '結合現代科技的全方位財務保障',
        description:
          '我們的人壽保險結合了為摯愛家人提供的基本財務保障與尖端科技，讓投保更快速、更便利。從加速核保到生前給付，我們提供全面的保障，隨時適應您不斷變化的人生需求。',
      },
      evaluationFocus: [
        '根據收入替代需求計算身故給付金額',
        '定期壽險與終身壽險選項比較',
        '現金價值成長潛力與投資功能',
        '轉換選項與未來可保性',
        '保費負擔能力與付款彈性',
        '生前給付與加速身故給付條款',
        '保險公司財務實力評級',
        '數位工具與客戶服務品質',
      ],
    },

    // Korean
    ko: {
      name: '보장성 보험 (종신, 정기)',
      keyFeatures: [
        '수익자를 위한 보장된 사망 보험금 보호',
        '유연한 정기 및 종신 생명보험 옵션',
        '빠른 승인 절차를 통한 간소화된 심사',
        '말기 질환 및 만성 질환에 대한 생전 급여',
        '종신 생명보험 상품의 현금 가치 적립',
        '정기에서 종신 보장으로의 전환 옵션',
        '고용과 무관한 휴대 가능한 보장',
        '디지털 신청 및 보험증권 관리 도구',
        '따뜻한 보험금 청구 지원 및 수익자 지원',
      ],
      featureHighlight: {
        title: '현대 기술과 함께하는 완벽한 재정 보호',
        description:
          '저희 생명보험은 사랑하는 가족을 위한 필수적인 재정 보호와 최첨단 기술을 결합하여 더 빠르고 쉬운 보장을 제공합니다. 간소화된 심사부터 생전 급여까지, 변화하는 삶의 필요에 맞춰 적응하는 종합적인 보호를 제공합니다.',
      },
      evaluationFocus: [
        '소득 대체 필요에 기반한 사망 보험금 금액',
        '정기 vs. 종신 생명보험 옵션',
        '현금 가치 성장 잠재력 및 투자 기능',
        '전환 및 미래 보험 가입 가능성 옵션',
        '보험료 부담 가능성 및 납입 유연성',
        '생전 급여 및 가속 사망 급여 조항',
        '보험회사 재정 건전성 등급',
        '디지털 도구 및 고객 서비스 품질',
      ],
    },
  },
};
