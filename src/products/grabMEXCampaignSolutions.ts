import { ProductConfiguration } from './types.js';

/**
 * MEX - Merchant Excellence Program
 * Budget constraint handling approach for Account Managers helping merchants grow through campaign participation
 */
export const grabMEXCampaignSolutionsConfiguration: ProductConfiguration = {
  base: {
    id: 'grab-mex-campaigns',
    friendlyId: 'grab-mex-campaigns',
    category: 'business-services',
  },

  localized: {
    // English (Original)
    en: {
      name: 'GrabFood',
      keyFeatures: [
        'Grab is running a Mega Sale Campaign',
        'Over 1.5k Food & Mart stores participated in previous programs',
        '1.1M eaters engaged through the previous campaign',
        'Asking for 50% off best sellers bundle with customizable redemption caps in exchange for media value of $145,000',
        'Visibility includes high impact marketing across EDMs, social channels, KOLs, in app push & prioritised listings',
        'Grab owned channels & Paid advertising worth $50,000',
        'Previous 50% off campaigns drove 120% increase in sales during campaign & 20% incremental sales post campaign',
        "Merchant's competitor ran this campaign and saw 30% increase in new customer acquired, 20% increase in frequency for existing users post campaign",
        'End to end campaign support from deal submission to execution & reporting',
      ],
      featureHighlight: {
        title:
          'Mega Sale Campaign: 1.5k Stores, 1.1M Engaged Eaters, $145k Media Value',
        description:
          "Grab's Mega Sale Campaign connects merchants with over 1.1M engaged eaters through 1.5k participating stores. Offering 50% off bestsellers with customizable redemption caps in exchange for $145,000 media value including high-impact marketing across EDMs, social channels, KOLs, in-app push notifications, and prioritized listings. Case studies show 120% sales increase during campaign and 20% post-campaign growth.",
      },
      evaluationFocus: [
        '**Campaign ROI Understanding**: Knowledge of 8.5% merchant outperformance and incremental sales growth metrics',
        '**Media Value Proposition**: Ability to articulate $145,000 media value packages and their components',
        '**Channel Strategy**: Understanding of 360-degree marketing across eDM, social, in-app, and paid channels',
        '**Budget Constraint Handling**: Skills in addressing merchant concerns about funding food costs and P&L impact',
        '**MEDDPICC Application**: Using MEDDPICC methodology to qualify opportunities and close campaign deals',
        '**Growth Segmentation**: Knowledge of different growth potentials (QSR 41%, Large Chains 37%, Standalone 300%)',
        '**Campaign Mechanics**: Understanding of 50% off requirements, bundle preferences, and redemption cap flexibility',
        '**Merchant Pain Points**: Ability to identify and address common objections around campaign investment',
        '**Success Stories**: Knowledge of case studies showing 20% post-campaign incremental sales',
        '**Visibility Channels**: Understanding of prioritized listings, digital ads, KOLs, and content hub strategies',
        '**Account Management**: Consultative selling approach focusing on merchant growth and partnership',
        '**Competitive Positioning**: Ability to demonstrate unique value vs other marketing channels and platforms',
      ],
      callCriteria: {
        title: 'GrabFood Campaign Participation Assessment',
        description:
          'Evaluate merchant readiness and qualification for GrabFood campaign participation using MEDDPICC methodology',
        criteria: [
          '**Metrics**: Current revenue trends, customer acquisition costs, and growth targets',
          '**Economic Buyer**: Identify decision-maker with budget authority for marketing/campaign investments',
          '**Decision Criteria**: Understand how merchant evaluates marketing ROI and campaign success',
          '**Decision Process**: Map approval workflow for campaign participation and budget allocation',
          '**Paper Process**: Review contract terms, payment schedules, and campaign requirements',
          '**Implicate the Pain**: Discover growth challenges, customer acquisition gaps, and competitive pressures',
          '**Champion**: Identify internal advocate who understands value of campaign participation',
          '**Competition**: Assess alternative marketing channels and platform options being considered',
        ],
        markdown: `
## Campaign Mechanics Overview

### Requirements
- **50% off Bestsellers** (bundles preferred)
- **Redemption Cap** can be customized based on merchant needs
- **High-resolution images** and detailed bundle/item information required

### Media Value Package ($145,000)
#### Grab-Owned Channels
- **eDM Campaigns**: Direct email marketing to targeted customer segments
- **Social Channels**: Facebook, Instagram, TikTok promotion with deal features
- **In-App Visibility**: Banners, icons, carousels, and prioritized listings
- **Push Notifications**: Targeted in-app alerts to relevant customer base

#### Paid Advertising ($50,000)
- **Digital Ads**: Targeted social media and search advertising
- **Content Hubs/KOLs**: Influencer partnerships and content marketing
- **Telegram Groups**: Community engagement and direct promotion
- **Cross-Platform**: Extended reach across multiple digital touchpoints

### Success Metrics
- **8.5% Outperformance** vs non-participating merchants
- **Up to 300% Growth** potential for standalone restaurants
- **20% Incremental Sales** sustained post-campaign
- **1.1M+ Customer Reach** through Mega Sale campaigns

### Sign-Up Process
1. **Account Manager Consultation**: Discuss business goals and campaign fit
2. **Participation Confirmation**: Finalize bundle details and participating outlets
3. **Deal Submission**: Provide high-res images and detailed offer information
        `,
      },
    },

    // Indonesian
    id: {
      name: 'GrabFood',
      keyFeatures: [
        'Grab sedang menjalankan Kampanye Mega Sale',
        'Lebih dari 1,5k toko Food & Mart berpartisipasi dalam program sebelumnya',
        '1,1M pengguna terlibat melalui kampanye sebelumnya',
        'Meminta diskon 50% untuk bundle best seller dengan cap redemption yang dapat disesuaikan sebagai imbalan nilai media $145.000',
        'Visibilitas mencakup marketing berdampak tinggi melalui EDM, saluran sosial, KOL, notifikasi push in-app & listing prioritas',
        'Channel milik Grab & Iklan berbayar senilai $50.000',
        'Kampanye diskon 50% sebelumnya menghasilkan peningkatan penjualan 120% selama kampanye & 20% penjualan incremental pasca kampanye',
        'Kompetitor KFC menjalankan kampanye ini dan melihat peningkatan 30% pelanggan baru yang diperoleh, peningkatan 20% frekuensi untuk pengguna yang sudah ada pasca kampanye',
        'Dukungan kampanye end to end dari submission deal hingga eksekusi & pelaporan',
      ],
      featureHighlight: {
        title:
          'Kampanye Mega Sale: 1.5k Toko, 1.1M Pengguna Terlibat, Nilai Media $145k',
        description:
          'Kampanye Mega Sale Grab menghubungkan merchant dengan lebih dari 1.1M pengguna yang terlibat melalui 1.5k toko yang berpartisipasi. Menawarkan diskon 50% untuk bestseller dengan cap redemption yang dapat disesuaikan sebagai imbalan nilai media $145.000 termasuk marketing berdampak tinggi di EDM, saluran sosial, KOL, notifikasi push in-app, dan listing prioritas. Studi kasus menunjukkan peningkatan penjualan 120% selama kampanye dan pertumbuhan 20% pasca-kampanye.',
      },
      evaluationFocus: [
        '**Pemahaman ROI Kampanye**: Pengetahuan tentang outperformance merchant 8,5% dan metrik pertumbuhan penjualan incremental',
        '**Proposisi Nilai Media**: Kemampuan mengartikulasikan paket nilai media $145.000 dan komponennya',
        '**Strategi Channel**: Pemahaman marketing 360 derajat meliputi eDM, sosial, in-app, dan paid channel',
        '**Penanganan Kendala Budget**: Keterampilan mengatasi kekhawatiran merchant tentang pendanaan biaya makanan dan dampak P&L',
        '**Aplikasi MEDDPICC**: Menggunakan metodologi MEDDPICC untuk qualify peluang dan close deal kampanye',
        '**Segmentasi Pertumbuhan**: Pengetahuan tentang potensi pertumbuhan berbeda (QSR 41%, Rantai Besar 37%, Standalone 300%)',
        '**Mekanisme Kampanye**: Pemahaman persyaratan diskon 50%, preferensi bundle, dan fleksibilitas redemption cap',
        '**Pain Point Merchant**: Kemampuan mengidentifikasi dan mengatasi keberatan umum seputar investasi kampanye',
        '**Success Stories**: Pengetahuan studi kasus yang menunjukkan 20% penjualan incremental post-kampanye',
        '**Channel Visibilitas**: Pemahaman prioritized listing, iklan digital, KOL, dan strategi content hub',
        '**Account Management**: Pendekatan consultative selling yang fokus pada pertumbuhan merchant dan partnership',
        '**Competitive Positioning**: Kemampuan mendemonstrasikan nilai unik vs channel marketing dan platform lain',
      ],
      callCriteria: {
        title: 'Penilaian Partisipasi Kampanye GrabFood',
        description:
          'Evaluasi kesiapan dan kualifikasi merchant untuk partisipasi kampanye GrabFood menggunakan metodologi MEDDPICC',
        criteria: [
          '**Metrics**: Tren revenue saat ini, biaya akuisisi customer, dan target pertumbuhan',
          '**Economic Buyer**: Identifikasi decision-maker dengan otoritas budget untuk investasi marketing/kampanye',
          '**Decision Criteria**: Memahami bagaimana merchant mengevaluasi ROI marketing dan kesuksesan kampanye',
          '**Decision Process**: Petakan workflow approval untuk partisipasi kampanye dan alokasi budget',
          '**Paper Process**: Review syarat kontrak, jadwal pembayaran, dan persyaratan kampanye',
          '**Implicate the Pain**: Temukan tantangan pertumbuhan, gap akuisisi customer, dan tekanan kompetitif',
          '**Champion**: Identifikasi advocate internal yang memahami nilai partisipasi kampanye',
          '**Competition**: Asses channel marketing alternatif dan opsi platform yang sedang dipertimbangkan',
        ],
      },
    },

    // Malaysian
    ms: {
      name: 'GrabFood',
      keyFeatures: [
        'Grab sedang menjalankan Kempen Mega Sale',
        'Lebih dari 1.5k kedai Food & Mart mengambil bahagian dalam program sebelumnya',
        '1.1M pemakan terlibat melalui kempen sebelumnya',
        'Meminta 50% diskaun untuk bundle best seller dengan had penebusan yang boleh disesuaikan sebagai pertukaran untuk nilai media $145,000',
        'Keterlihatan termasuk pemasaran berimpak tinggi merentasi EDM, saluran sosial, KOL, notifikasi tolakan dalam aplikasi & penyenaraian keutamaan',
        'Saluran milik Grab & Pengiklanan berbayar bernilai $50,000',
        'Kempen diskaun 50% sebelumnya memacu peningkatan jualan 120% semasa kempen & 20% jualan tambahan pasca kempen',
        'Pesaing KFC menjalankan kempen ini dan melihat peningkatan 30% pelanggan baru yang diperoleh, peningkatan 20% kekerapan untuk pengguna sedia ada pasca kempen',
        'Sokongan kempen hujung ke hujung dari penyerahan tawaran hingga pelaksanaan & pelaporan',
      ],
      featureHighlight: {
        title:
          'Kempen Mega Sale: 1.5k Kedai, 1.1M Pemakan Terlibat, Nilai Media $145k',
        description:
          'Kempen Mega Sale Grab menghubungkan pedagang dengan lebih dari 1.1M pemakan yang terlibat melalui 1.5k kedai yang mengambil bahagian. Menawarkan diskaun 50% untuk bestseller dengan had penebusan yang boleh disesuaikan sebagai pertukaran untuk nilai media $145,000 termasuk pemasaran berimpak tinggi merentasi EDM, saluran sosial, KOL, notifikasi tolakan dalam aplikasi, dan penyenaraian keutamaan. Kajian kes menunjukkan peningkatan jualan 120% semasa kempen dan pertumbuhan 20% pasca-kempen.',
      },
      evaluationFocus: [
        '**Pemahaman ROI Kempen**: Pengetahuan tentang prestasi cemerlang pedagang 8.5% dan metrik pertumbuhan jualan tambahan',
        '**Proposisi Nilai Media**: Keupayaan mengartikulasikan pakej nilai media $145,000 dan komponennya',
        '**Strategi Saluran**: Pemahaman pemasaran 360 darjah merentasi eDM, sosial, dalam aplikasi, dan saluran berbayar',
        '**Pengendalian Kekangan Belanjawan**: Kemahiran menangani kebimbangan pedagang tentang pembiayaan kos makanan dan impak P&L',
        '**Aplikasi MEDDPICC**: Menggunakan metodologi MEDDPICC untuk melayakkan peluang dan menutup tawaran kempen',
        '**Segmentasi Pertumbuhan**: Pengetahuan tentang potensi pertumbuhan berbeza (QSR 41%, Rangkaian Besar 37%, Berdiri Sendiri 300%)',
        '**Mekanik Kempen**: Pemahaman keperluan diskaun 50%, keutamaan bundle, dan fleksibiliti had penebusan',
        '**Titik Kesakitan Pedagang**: Keupayaan mengenal pasti dan menangani bantahan biasa seputar pelaburan kempen',
        '**Kisah Kejayaan**: Pengetahuan kajian kes yang menunjukkan 20% jualan tambahan pasca-kempen',
        '**Saluran Keterlihatan**: Pemahaman penyenaraian keutamaan, iklan digital, KOL, dan strategi hab kandungan',
        '**Pengurusan Akaun**: Pendekatan jualan konsultatif yang fokus pada pertumbuhan pedagang dan perkongsian',
        '**Kedudukan Kompetitif**: Keupayaan menunjukkan nilai unik vs saluran pemasaran dan platform lain',
      ],
      callCriteria: {
        title: 'Penilaian Penyertaan Kempen GrabFood',
        description:
          'Nilai kesiapan dan kelayakan pedagang untuk penyertaan kempen GrabFood menggunakan metodologi MEDDPICC',
        criteria: [
          '**Metrik**: Trend pendapatan semasa, kos pemerolehan pelanggan, dan sasaran pertumbuhan',
          '**Pembeli Ekonomi**: Kenal pasti pembuat keputusan dengan kuasa belanjawan untuk pelaburan pemasaran/kempen',
          '**Kriteria Keputusan**: Fahami bagaimana pedagang menilai ROI pemasaran dan kejayaan kempen',
          '**Proses Keputusan**: Petakan aliran kerja kelulusan untuk penyertaan kempen dan peruntukan belanjawan',
          '**Proses Kertas**: Semak syarat kontrak, jadual pembayaran, dan keperluan kempen',
          '**Implikasikan Kesakitan**: Temui cabaran pertumbuhan, jurang pemerolehan pelanggan, dan tekanan kompetitif',
          '**Juara**: Kenal pasti penyokong dalaman yang memahami nilai penyertaan kempen',
          '**Persaingan**: Nilai saluran pemasaran alternatif dan pilihan platform yang sedang dipertimbangkan',
        ],
      },
    },

    // Tagalog (Filipino)
    tl: {
      name: 'GrabFood',
      keyFeatures: [
        'Grab ay nagpapatakbo ng Mega Sale Campaign',
        'Mahigit 1.5k Food & Mart stores ang nag-participate sa mga nakaraang programa',
        '1.1M eaters ang nag-engage sa nakaraang campaign',
        'Humihingi ng 50% off sa best sellers bundle na may customizable redemption caps kapalit ng media value na $145,000',
        'Visibility kasama ang high impact marketing sa EDMs, social channels, KOLs, in app push & prioritized listings',
        'Grab owned channels & Paid advertising na worth $50,000',
        'Nakaraang 50% off campaigns ay nag-drive ng 120% increase sa sales during campaign & 20% incremental sales post campaign',
        'Competitor ng KFC ay nag-run ng campaign na ito at nakakita ng 30% increase sa new customer acquired, 20% increase sa frequency para sa existing users post campaign',
        'End to end campaign support mula deal submission hanggang execution & reporting',
      ],
      featureHighlight: {
        title:
          'Mega Sale Campaign: 1.5k Stores, 1.1M Engaged Eaters, $145k Media Value',
        description:
          'Ang Mega Sale Campaign ng Grab ay nag-connect sa mga merchants sa mahigit 1.1M engaged eaters sa pamamagitan ng 1.5k participating stores. Nag-offer ng 50% off sa bestsellers na may customizable redemption caps kapalit ng $145,000 media value kasama ang high-impact marketing sa EDMs, social channels, KOLs, in-app push notifications, at prioritized listings. Ang case studies ay nagpapakita ng 120% sales increase during campaign at 20% post-campaign growth.',
      },
      evaluationFocus: [
        '**Campaign ROI Understanding**: Kaalaman sa 8.5% merchant outperformance at incremental sales growth metrics',
        '**Media Value Proposition**: Kakayahang i-articulate ang $145,000 media value packages at ang mga components nito',
        '**Channel Strategy**: Pag-unawa sa 360-degree marketing sa EDM, social, in-app, at paid channels',
        '**Budget Constraint Handling**: Skills sa pag-address ng merchant concerns tungkol sa funding food costs at P&L impact',
        '**MEDDPICC Application**: Paggamit ng MEDDPICC methodology para ma-qualify ang opportunities at ma-close ang campaign deals',
        '**Growth Segmentation**: Kaalaman sa iba-ibang growth potentials (QSR 41%, Large Chains 37%, Standalone 300%)',
        '**Campaign Mechanics**: Pag-unawa sa 50% off requirements, bundle preferences, at redemption cap flexibility',
        '**Merchant Pain Points**: Kakayahang ma-identify at ma-address ang common objections around campaign investment',
        '**Success Stories**: Kaalaman sa case studies na nagpapakita ng 20% post-campaign incremental sales',
        '**Visibility Channels**: Pag-unawa sa prioritized listings, digital ads, KOLs, at content hub strategies',
        '**Account Management**: Consultative selling approach na naka-focus sa merchant growth at partnership',
        '**Competitive Positioning**: Kakayahang ipakita ang unique value vs other marketing channels at platforms',
      ],
      callCriteria: {
        title: 'GrabFood Campaign Participation Assessment',
        description:
          'I-evaluate ang merchant readiness at qualification para sa GrabFood campaign participation gamit ang MEDDPICC methodology',
        criteria: [
          '**Metrics**: Current revenue trends, customer acquisition costs, at growth targets',
          '**Economic Buyer**: I-identify ang decision-maker na may budget authority para sa marketing/campaign investments',
          '**Decision Criteria**: Intindihin kung paano nag-evaluate ang merchant ng marketing ROI at campaign success',
          '**Decision Process**: I-map ang approval workflow para sa campaign participation at budget allocation',
          '**Paper Process**: I-review ang contract terms, payment schedules, at campaign requirements',
          '**Implicate the Pain**: Tukuyin ang growth challenges, customer acquisition gaps, at competitive pressures',
          '**Champion**: I-identify ang internal advocate na naka-unawa sa value ng campaign participation',
          '**Competition**: I-assess ang alternative marketing channels at platform options na ino-consider',
        ],
      },
    },

    // Vietnamese
    vi: {
      name: 'GrabFood',
      keyFeatures: [
        'Grab đang chạy Chiến dịch Mega Sale',
        'Hơn 1.5k cửa hàng Food & Mart đã tham gia các chương trình trước đây',
        '1.1M người dùng tương tác thông qua chiến dịch trước đây',
        'Yêu cầu giảm giá 50% cho bundle best seller với redemption caps có thể tùy chỉnh để đổi lấy giá trị truyền thông $145,000',
        'Khả năng hiển thị bao gồm marketing tác động cao qua EDM, kênh xã hội, KOL, thông báo đẩy trong ứng dụng & danh sách ưu tiên',
        'Kênh sở hữu của Grab & Quảng cáo trả phí trị giá $50,000',
        'Các chiến dịch giảm giá 50% trước đây đã thúc đẩy tăng trưởng doanh số 120% trong chiến dịch & 20% doanh số tăng thêm sau chiến dịch',
        'Đối thủ cạnh tranh của KFC đã chạy chiến dịch này và thấy tăng 30% khách hàng mới thu được, tăng 20% tần suất cho người dùng hiện tại sau chiến dịch',
        'Hỗ trợ chiến dịch từ đầu đến cuối từ nộp deal đến thực hiện & báo cáo',
      ],
      featureHighlight: {
        title:
          'Chiến dịch Mega Sale: 1.5k Cửa hàng, 1.1M Người dùng Tương tác, Giá trị Truyền thông $145k',
        description:
          'Chiến dịch Mega Sale của Grab kết nối các merchant với hơn 1.1M người dùng tương tác thông qua 1.5k cửa hàng tham gia. Cung cấp giảm giá 50% cho bestseller với redemption caps có thể tùy chỉnh để đổi lấy giá trị truyền thông $145,000 bao gồm marketing tác động cao trên EDM, kênh xã hội, KOL, thông báo đẩy trong ứng dụng, và danh sách ưu tiên. Nghiên cứu trường hợp cho thấy tăng trưởng doanh số 120% trong chiến dịch và tăng trưởng 20% sau chiến dịch.',
      },
      evaluationFocus: [
        '**Hiểu biết ROI Chiến dịch**: Kiến thức về hiệu suất vượt trội 8,5% của merchant và các chỉ số tăng trưởng doanh số tăng thêm',
        '**Đề xuất Giá trị Truyền thông**: Khả năng diễn giải gói giá trị truyền thông $145.000 và các thành phần của nó',
        '**Chiến lược Kênh**: Hiểu biết về marketing 360 độ trên EDM, mạng xã hội, trong ứng dụng và các kênh trả phí',
        '**Xử lý Ràng buộc Ngân sách**: Kỹ năng giải quyết mối quan tâm của merchant về tài trợ chi phí thực phẩm và tác động P&L',
        '**Ứng dụng MEDDPICC**: Sử dụng phương pháp MEDDPICC để đánh giá cơ hội và chốt các thỏa thuận chiến dịch',
        '**Phân khúc Tăng trưởng**: Kiến thức về các tiềm năng tăng trưởng khác nhau (QSR 41%, Chuỗi Lớn 37%, Độc lập 300%)',
        '**Cơ chế Chiến dịch**: Hiểu biết về yêu cầu giảm 50%, ưu tiên gói combo và tính linh hoạt của giới hạn đổi thưởng',
        '**Điểm Đau của Merchant**: Khả năng xác định và giải quyết các phản đối phổ biến xung quanh đầu tư chiến dịch',
        '**Câu chuyện Thành công**: Kiến thức về các nghiên cứu trường hợp cho thấy 20% doanh số tăng thêm sau chiến dịch',
        '**Kênh Hiển thị**: Hiểu biết về danh sách ưu tiên, quảng cáo số, KOL và chiến lược trung tâm nội dung',
        '**Quản lý Tài khoản**: Phương pháp bán hàng tư vấn tập trung vào tăng trưởng merchant và đối tác',
        '**Định vị Cạnh tranh**: Khả năng thể hiện giá trị độc đáo so với các kênh marketing và nền tảng khác',
      ],
      callCriteria: {
        title: 'Đánh giá Tham gia Chiến dịch GrabFood',
        description:
          'Đánh giá sự sẵn sàng và trình độ của merchant để tham gia chiến dịch GrabFood bằng phương pháp MEDDPICC',
        criteria: [
          '**Chỉ số**: Xu hướng doanh thu hiện tại, chi phí thu hút khách hàng và mục tiêu tăng trưởng',
          '**Người mua Kinh tế**: Xác định người ra quyết định có thẩm quyền ngân sách cho đầu tư marketing/chiến dịch',
          '**Tiêu chí Quyết định**: Hiểu cách merchant đánh giá ROI marketing và thành công chiến dịch',
          '**Quy trình Quyết định**: Lập bản đồ quy trình phê duyệt cho việc tham gia chiến dịch và phân bổ ngân sách',
          '**Quy trình Giấy tờ**: Xem xét các điều khoản hợp đồng, lịch thanh toán và yêu cầu chiến dịch',
          '**Ngụ ý Đau đớn**: Khám phá thách thức tăng trưởng, khoảng trống thu hút khách hàng và áp lực cạnh tranh',
          '**Nhà vô địch**: Xác định người ủng hộ nội bộ hiểu giá trị của việc tham gia chiến dịch',
          '**Cạnh tranh**: Đánh giá các kênh marketing thay thế và tùy chọn nền tảng đang được xem xét',
        ],
      },
    },
  },
};
