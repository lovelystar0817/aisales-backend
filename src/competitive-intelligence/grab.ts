import { CompetitiveIntelligenceConfiguration } from './types.js';

// Grab competitive intelligence with co-located translations (APAC transport/mobility market)
export const grabCompetitiveIntelligenceConfiguration: CompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'grab',
      company: 'grab',
      targetMarket: 'transport-mobility',
    },

    localized: {
      // English (Original)
      en: {
        competitors: [
          {
            name: 'CDG Zig (ComfortDelGro)',
            company: 'ComfortDelGro Corporation',
            type: 'Integrated Mobility Platform',
            keyFeatures: [
              "Singapore's largest taxi fleet (8,400+ taxis)",
              'ZigBiz corporate solutions',
              'Integrated taxi and ride-hailing services',
            ],
            strengths: [
              'Established market leader with 50+ years experience',
              'Largest taxi network in Singapore',
              'Strong corporate relationships',
            ],
            limitations: [
              'Late entry into ride-hailing (2021)',
              'Singapore-only operations',
              'Traditional taxi-focused approach',
            ],
            positioningStrategy:
              'Emphasize our regional APAC expertise and comprehensive super-app ecosystem vs their traditional taxi-focused approach.',
          },
          {
            name: 'Trans-Cab Services',
            company: 'Trans-Cab Pte Ltd',
            type: 'Taxi & Ride-Hailing Platform',
            keyFeatures: [
              'Third-largest taxi fleet (2,079 vehicles)',
              'Launching ride-hailing in 2025',
              'Corporate account services',
            ],
            strengths: [
              'Established taxi operator since 2003',
              'Significant fleet size',
              'Strong local market knowledge',
            ],
            limitations: [
              'New to ride-hailing platform operations',
              'Singapore-only operations',
              'No multi-service ecosystem',
            ],
            positioningStrategy:
              'Highlight our established multi-market presence and mature technology platform vs their limited scope.',
          },
          {
            name: 'Ryde',
            company: 'Ryde Group Pte Ltd',
            type: 'Multi-Modal Transport Platform',
            keyFeatures: [
              'Multi-modal transport options',
              'Corporate transport solutions',
              'Technology-focused platform',
            ],
            strengths: [
              'Technology-first approach',
              'Competitive pricing model',
              'Multi-modal service offerings',
            ],
            limitations: [
              'Singapore market only',
              'Smaller fleet vs established players',
              'Limited corporate track record',
            ],
            positioningStrategy:
              'Leverage our extensive APAC network and proven enterprise client base vs their limited geographical scope.',
          },
          {
            name: 'TADA',
            company: 'MVLGRP Pte Ltd',
            type: 'Premium Ride-Hailing Platform',
            keyFeatures: [
              'Premium ride-hailing service',
              'Corporate account management',
              'Quality-oriented approach',
            ],
            strengths: [
              'Premium service positioning',
              'Technology-focused operations',
              'Corporate service offerings',
            ],
            limitations: [
              'Singapore-only operations',
              'Higher pricing vs mass market',
              'Smaller driver network',
            ],
            positioningStrategy:
              'Emphasize our regional coverage and mass market accessibility vs their premium-only positioning.',
          },
          {
            name: 'Strides Premier',
            company: 'Strides Premier Pte Ltd',
            type: 'Corporate Transport Solutions',
            keyFeatures: [
              'Corporate taxi and limousine services',
              'Executive transport solutions',
              'Fleet management services',
            ],
            strengths: [
              'Specialized corporate transport focus',
              'Executive service expertise',
              'Strong B2B relationships',
            ],
            limitations: [
              'Traditional transport models only',
              'No ride-hailing technology',
              'Singapore-only operations',
            ],
            positioningStrategy:
              'Highlight our advanced digital platform and regional scalability vs their traditional service model.',
          },
          {
            name: 'GoTo Business Solutions',
            company: 'GoTo (Gojek)',
            type: 'Super-app Business Platform',
            keyFeatures: [
              'Integrated transport and delivery',
              'Market leadership in Indonesia',
              'Super-app ecosystem',
            ],
            strengths: [
              'Comprehensive service ecosystem',
              'Dominant Indonesia position',
              'Strong local brand recognition',
            ],
            limitations: [
              'Limited presence outside Indonesia',
              'Consumer-focused vs enterprise-first',
              'Inconsistent APAC coverage',
            ],
            positioningStrategy:
              'Highlight our broader APAC market coverage and established corporate service expertise across all markets.',
          },
          {
            name: 'Regional Transport Providers',
            company: 'ComfortDelGro, Blue Bird & Others',
            type: 'Local Fleet Services',
            keyFeatures: [
              'Deep local market knowledge',
              'Established regulatory compliance',
              'Traditional corporate partnerships',
            ],
            strengths: [
              'Strong local relationships',
              'Excellent regulatory compliance',
              'Established partnerships',
            ],
            limitations: [
              'Limited cross-border capabilities',
              'Fragmented multi-market operations',
              'No unified platform',
            ],
            positioningStrategy:
              'Emphasize our unified platform across APAC markets and superior technology integration vs their fragmented operations.',
          },
        ],
      },

      // Indonesian
      id: {
        competitors: [
          {
            name: 'CDG Zig (ComfortDelGro)',
            company: 'ComfortDelGro Corporation',
            type: 'Platform Mobilitas Terintegrasi',
            keyFeatures: [
              'Armada taksi terbesar di Singapura (8.400+ taksi)',
              'Solusi korporat ZigBiz',
              'Layanan taksi dan ride-hailing terintegrasi',
            ],
            strengths: [
              'Pemimpin pasar mapan dengan pengalaman 50+ tahun',
              'Jaringan taksi terbesar di Singapura',
              'Hubungan korporat yang kuat',
            ],
            limitations: [
              'Masuk terlambat ke ride-hailing (2021)',
              'Operasi hanya di Singapura',
              'Pendekatan yang berfokus pada taksi tradisional',
            ],
            positioningStrategy:
              'Tekankan keahlian regional APAC kami dan ekosistem super-app yang komprehensif vs pendekatan taksi tradisional mereka.',
          },
          {
            name: 'Trans-Cab Services',
            company: 'Trans-Cab Pte Ltd',
            type: 'Platform Taksi & Ride-Hailing',
            keyFeatures: [
              'Armada taksi terbesar ketiga (2.079 kendaraan)',
              'Meluncurkan ride-hailing pada 2025',
              'Layanan akun korporat',
            ],
            strengths: [
              'Operator taksi mapan sejak 2003',
              'Ukuran armada yang signifikan',
              'Pengetahuan pasar lokal yang kuat',
            ],
            limitations: [
              'Baru dalam operasi platform ride-hailing',
              'Operasi hanya di Singapura',
              'Tidak ada ekosistem multi-layanan',
            ],
            positioningStrategy:
              'Soroti kehadiran multi-pasar yang mapan dan platform teknologi yang matang vs ruang lingkup mereka yang terbatas.',
          },
          {
            name: 'Ryde',
            company: 'Ryde Group Pte Ltd',
            type: 'Platform Transportasi Multi-Modal',
            keyFeatures: [
              'Pilihan transportasi multi-modal',
              'Solusi transportasi korporat',
              'Platform yang berfokus pada teknologi',
            ],
            strengths: [
              'Pendekatan teknologi-first',
              'Model harga yang kompetitif',
              'Penawaran layanan multi-modal',
            ],
            limitations: [
              'Hanya pasar Singapura',
              'Armada lebih kecil vs pemain mapan',
              'Rekam jejak korporat yang terbatas',
            ],
            positioningStrategy:
              'Manfaatkan jaringan APAC yang luas dan basis klien enterprise yang terbukti vs ruang lingkup geografis mereka yang terbatas.',
          },
          {
            name: 'TADA',
            company: 'MVLGRP Pte Ltd',
            type: 'Platform Ride-Hailing Premium',
            keyFeatures: [
              'Layanan ride-hailing premium',
              'Manajemen akun korporat',
              'Pendekatan yang berorientasi kualitas',
            ],
            strengths: [
              'Posisi layanan premium',
              'Operasi yang berfokus pada teknologi',
              'Penawaran layanan korporat',
            ],
            limitations: [
              'Operasi hanya di Singapura',
              'Harga lebih tinggi vs pasar massa',
              'Rangkaian driver yang lebih kecil',
            ],
            positioningStrategy:
              'Tekankan cakupan regional kami dan aksesibilitas pasar massa vs posisi premium-only mereka.',
          },
          {
            name: 'Strides Premier',
            company: 'Strides Premier Pte Ltd',
            type: 'Solusi Transportasi Korporat',
            keyFeatures: [
              'Layanan taksi dan limusin korporat',
              'Solusi transportasi eksekutif',
              'Layanan manajemen armada',
            ],
            strengths: [
              'Fokus transportasi korporat yang terspesialisasi',
              'Keahlian layanan eksekutif',
              'Hubungan B2B yang kuat',
            ],
            limitations: [
              'Hanya model transportasi tradisional',
              'Tidak ada teknologi ride-hailing',
              'Operasi hanya di Singapura',
            ],
            positioningStrategy:
              'Soroti platform digital canggih kami dan skalabilitas regional vs model layanan tradisional mereka.',
          },
          {
            name: 'GoTo Business Solutions',
            company: 'GoTo (Gojek)',
            type: 'Platform Bisnis Super-app',
            keyFeatures: [
              'Transportasi dan pengiriman terintegrasi',
              'Kepemimpinan pasar di Indonesia',
              'Ekosistem super-app',
            ],
            strengths: [
              'Ekosistem layanan yang komprehensif',
              'Posisi dominan di Indonesia',
              'Pengakuan merek lokal yang kuat',
            ],
            limitations: [
              'Kehadiran terbatas di luar Indonesia',
              'Berfokus pada konsumen vs enterprise-first',
              'Cakupan APAC yang tidak konsisten',
            ],
            positioningStrategy:
              'Soroti cakupan pasar APAC yang lebih luas dan keahlian layanan korporat yang mapan di semua pasar.',
          },
          {
            name: 'Penyedia Transportasi Regional',
            company: 'ComfortDelGro, Blue Bird & Lainnya',
            type: 'Layanan Armada Lokal',
            keyFeatures: [
              'Pengetahuan pasar lokal yang mendalam',
              'Kepatuhan regulasi yang mapan',
              'Kemitraan korporat tradisional',
            ],
            strengths: [
              'Hubungan lokal yang kuat',
              'Kepatuhan regulasi yang sangat baik',
              'Kemitraan yang mapan',
            ],
            limitations: [
              'Kemampuan lintas batas yang terbatas',
              'Operasi multi-pasar yang terfragmentasi',
              'Tidak ada platform terpadu',
            ],
            positioningStrategy:
              'Tekankan platform terpadu kami di pasar APAC dan integrasi teknologi yang superior vs operasi terfragmentasi mereka.',
          },
        ],
      },

      // Malaysian
      ms: {
        competitors: [
          {
            name: 'CDG Zig (ComfortDelGro)',
            company: 'ComfortDelGro Corporation',
            type: 'Platform Mobiliti Bersepadu',
            keyFeatures: [
              'Armada teksi terbesar di Singapura (8,400+ teksi)',
              'Penyelesaian korporat ZigBiz',
              'Perkhidmatan teksi dan ride-hailing bersepadu',
            ],
            strengths: [
              'Pemimpin pasaran mapan dengan pengalaman 50+ tahun',
              'Rangkaian teksi terbesar di Singapura',
              'Hubungan korporat yang kuat',
            ],
            limitations: [
              'Kemasukan lewat ke ride-hailing (2021)',
              'Operasi Singapura sahaja',
              'Pendekatan yang berfokus pada teksi tradisional',
            ],
            positioningStrategy:
              'Tekankan kepakaran serantau APAC kami dan ekosistem super-app yang komprehensif vs pendekatan teksi tradisional mereka.',
          },
          {
            name: 'Trans-Cab Services',
            company: 'Trans-Cab Pte Ltd',
            type: 'Platform Teksi & Ride-Hailing',
            keyFeatures: [
              'Armada teksi terbesar ketiga (2,079 kenderaan)',
              'Melancarkan ride-hailing pada 2025',
              'Perkhidmatan akaun korporat',
            ],
            strengths: [
              'Operator teksi mapan sejak 2003',
              'Saiz armada yang signifikan',
              'Pengetahuan pasaran tempatan yang kuat',
            ],
            limitations: [
              'Baru dalam operasi platform ride-hailing',
              'Operasi Singapura sahaja',
              'Tiada ekosistem multi-perkhidmatan',
            ],
            positioningStrategy:
              'Tekankan kehadiran multi-pasaran yang mapan dan platform teknologi yang matang vs skop terhad mereka.',
          },
          {
            name: 'Ryde',
            company: 'Ryde Group Pte Ltd',
            type: 'Platform Pengangkutan Multi-Modal',
            keyFeatures: [
              'Pilihan pengangkutan multi-modal',
              'Penyelesaian pengangkutan korporat',
              'Platform yang berfokus pada teknologi',
            ],
            strengths: [
              'Pendekatan teknologi-first',
              'Model harga yang kompetitif',
              'Penawaran perkhidmatan multi-modal',
            ],
            limitations: [
              'Pasaran Singapura sahaja',
              'Armada lebih kecil vs pemain mapan',
              'Rekod prestasi korporat yang terhad',
            ],
            positioningStrategy:
              'Manfaatkan rangkaian APAC yang luas dan pangkalan klien enterprise yang terbukti vs skop geografi terhad mereka.',
          },
          {
            name: 'TADA',
            company: 'MVLGRP Pte Ltd',
            type: 'Platform Ride-Hailing Premium',
            keyFeatures: [
              'Perkhidmatan ride-hailing premium',
              'Pengurusan akaun korporat',
              'Pendekatan yang berorientasi kualiti',
            ],
            strengths: [
              'Posisi perkhidmatan premium',
              'Operasi yang berfokus pada teknologi',
              'Penawaran perkhidmatan korporat',
            ],
            limitations: [
              'Operasi Singapura sahaja',
              'Harga lebih tinggi vs pasaran massa',
              'Rangkaian pemandu yang lebih kecil',
            ],
            positioningStrategy:
              'Tekankan liputan serantau kami dan kebolehcapaian pasaran massa vs posisi premium-sahaja mereka.',
          },
          {
            name: 'Strides Premier',
            company: 'Strides Premier Pte Ltd',
            type: 'Penyelesaian Pengangkutan Korporat',
            keyFeatures: [
              'Perkhidmatan teksi dan limusin korporat',
              'Penyelesaian pengangkutan eksekutif',
              'Perkhidmatan pengurusan armada',
            ],
            strengths: [
              'Fokus pengangkutan korporat yang khusus',
              'Kepakaran perkhidmatan eksekutif',
              'Hubungan B2B yang kuat',
            ],
            limitations: [
              'Model pengangkutan tradisional sahaja',
              'Tiada teknologi ride-hailing',
              'Operasi Singapura sahaja',
            ],
            positioningStrategy:
              'Tekankan platform digital canggih kami dan kebolehskalaan serantau vs model perkhidmatan tradisional mereka.',
          },
          {
            name: 'GoTo Business Solutions',
            company: 'GoTo (Gojek)',
            type: 'Platform Perniagaan Super-app',
            keyFeatures: [
              'Pengangkutan dan penghantaran bersepadu',
              'Kepemimpinan pasaran di Indonesia',
              'Ekosistem super-app',
            ],
            strengths: [
              'Ekosistem perkhidmatan yang komprehensif',
              'Kedudukan dominan di Indonesia',
              'Pengiktirafan jenama tempatan yang kuat',
            ],
            limitations: [
              'Kehadiran terhad di luar Indonesia',
              'Berfokus pada pengguna vs enterprise-first',
              'Liputan APAC yang tidak konsisten',
            ],
            positioningStrategy:
              'Tekankan liputan pasaran APAC yang lebih luas dan kepakaran perkhidmatan korporat yang mapan di semua pasaran.',
          },
          {
            name: 'Penyedia Pengangkutan Serantau',
            company: 'ComfortDelGro, Blue Bird & Lain-lain',
            type: 'Perkhidmatan Armada Tempatan',
            keyFeatures: [
              'Pengetahuan pasaran tempatan yang mendalam',
              'Pematuhan peraturan yang mapan',
              'Perkongsian korporat tradisional',
            ],
            strengths: [
              'Hubungan tempatan yang kuat',
              'Pematuhan peraturan yang sangat baik',
              'Perkongsian yang mapan',
            ],
            limitations: [
              'Kebolehan merentas sempadan yang terhad',
              'Operasi multi-pasaran yang terpecah-belah',
              'Tiada platform bersepadu',
            ],
            positioningStrategy:
              'Tekankan platform bersepadu kami di pasaran APAC dan integrasi teknologi yang unggul vs operasi terpecah-belah mereka.',
          },
        ],
      },

      // Tagalog (Filipino)
      tl: {
        competitors: [
          {
            name: 'CDG Zig (ComfortDelGro)',
            company: 'ComfortDelGro Corporation',
            type: 'Integrated Mobility Platform',
            keyFeatures: [
              'Pinakamalaking taxi fleet sa Singapore (8,400+ taxis)',
              'ZigBiz corporate solutions',
              'Integrated taxi at ride-hailing services',
            ],
            strengths: [
              'Nakaestablish na market leader na may 50+ years experience',
              'Pinakamalaking taxi network sa Singapore',
              'Malakas na corporate relationships',
            ],
            limitations: [
              'Late entry sa ride-hailing (2021)',
              'Singapore-only operations',
              'Traditional taxi-focused approach',
            ],
            positioningStrategy:
              'I-emphasize ang aming regional APAC expertise at comprehensive super-app ecosystem vs ang kanilang traditional taxi-focused approach.',
          },
          {
            name: 'Trans-Cab Services',
            company: 'Trans-Cab Pte Ltd',
            type: 'Taxi & Ride-Hailing Platform',
            keyFeatures: [
              'Pangatlong pinakamalaking taxi fleet (2,079 vehicles)',
              'Maglulunsad ng ride-hailing sa 2025',
              'Corporate account services',
            ],
            strengths: [
              'Nakaestablish na taxi operator simula 2003',
              'Malaking fleet size',
              'Malakas na local market knowledge',
            ],
            limitations: [
              'Bago pa lang sa ride-hailing platform operations',
              'Singapore-only operations',
              'Walang multi-service ecosystem',
            ],
            positioningStrategy:
              'I-highlight ang aming established multi-market presence at mature technology platform vs ang kanilang limited scope.',
          },
          {
            name: 'Ryde',
            company: 'Ryde Group Pte Ltd',
            type: 'Multi-Modal Transport Platform',
            keyFeatures: [
              'Multi-modal transport options',
              'Corporate transport solutions',
              'Technology-focused platform',
            ],
            strengths: [
              'Technology-first approach',
              'Competitive pricing model',
              'Multi-modal service offerings',
            ],
            limitations: [
              'Singapore market lang',
              'Mas maliit na fleet vs established players',
              'Limited corporate track record',
            ],
            positioningStrategy:
              'I-leverage ang aming extensive APAC network at proven enterprise client base vs ang kanilang limited geographical scope.',
          },
          {
            name: 'TADA',
            company: 'MVLGRP Pte Ltd',
            type: 'Premium Ride-Hailing Platform',
            keyFeatures: [
              'Premium ride-hailing service',
              'Corporate account management',
              'Quality-oriented approach',
            ],
            strengths: [
              'Premium service positioning',
              'Technology-focused operations',
              'Corporate service offerings',
            ],
            limitations: [
              'Singapore-only operations',
              'Mas mataas na pricing vs mass market',
              'Mas maliit na driver network',
            ],
            positioningStrategy:
              'I-emphasize ang aming regional coverage at mass market accessibility vs ang kanilang premium-only positioning.',
          },
          {
            name: 'Strides Premier',
            company: 'Strides Premier Pte Ltd',
            type: 'Corporate Transport Solutions',
            keyFeatures: [
              'Corporate taxi at limousine services',
              'Executive transport solutions',
              'Fleet management services',
            ],
            strengths: [
              'Specialized corporate transport focus',
              'Executive service expertise',
              'Malakas na B2B relationships',
            ],
            limitations: [
              'Traditional transport models lang',
              'Walang ride-hailing technology',
              'Singapore-only operations',
            ],
            positioningStrategy:
              'I-highlight ang aming advanced digital platform at regional scalability vs ang kanilang traditional service model.',
          },
          {
            name: 'GoTo Business Solutions',
            company: 'GoTo (Gojek)',
            type: 'Super-app Business Platform',
            keyFeatures: [
              'Integrated transport at delivery',
              'Market leadership sa Indonesia',
              'Super-app ecosystem',
            ],
            strengths: [
              'Comprehensive service ecosystem',
              'Dominant Indonesia position',
              'Malakas na local brand recognition',
            ],
            limitations: [
              'Limited presence outside Indonesia',
              'Consumer-focused vs enterprise-first',
              'Inconsistent APAC coverage',
            ],
            positioningStrategy:
              'I-highlight ang aming broader APAC market coverage at established corporate service expertise across all markets.',
          },
          {
            name: 'Regional Transport Providers',
            company: 'ComfortDelGro, Blue Bird & Others',
            type: 'Local Fleet Services',
            keyFeatures: [
              'Malalim na local market knowledge',
              'Established regulatory compliance',
              'Traditional corporate partnerships',
            ],
            strengths: [
              'Malakas na local relationships',
              'Excellent regulatory compliance',
              'Established partnerships',
            ],
            limitations: [
              'Limited cross-border capabilities',
              'Fragmented multi-market operations',
              'Walang unified platform',
            ],
            positioningStrategy:
              'I-emphasize ang aming unified platform across APAC markets at superior technology integration vs ang kanilang fragmented operations.',
          },
        ],
      },

      // Vietnamese
      vi: {
        competitors: [
          {
            name: 'CDG Zig (ComfortDelGro)',
            company: 'ComfortDelGro Corporation',
            type: 'Nền tảng Di chuyển Tích hợp',
            keyFeatures: [
              'Đội taxi lớn nhất Singapore (hơn 8.400 xe taxi)',
              'Giải pháp doanh nghiệp ZigBiz',
              'Dịch vụ taxi và gọi xe tích hợp',
            ],
            strengths: [
              'Nhà lãnh đạo thị trường đã thành lập với hơn 50 năm kinh nghiệm',
              'Mạng lưới taxi lớn nhất Singapore',
              'Mối quan hệ doanh nghiệp vững mạnh',
            ],
            limitations: [
              'Gia nhập muộn vào thị trường gọi xe (2021)',
              'Chỉ hoạt động tại Singapore',
              'Phương pháp tiếp cận tập trung vào taxi truyền thống',
            ],
            positioningStrategy:
              'Nhấn mạnh chuyên môn khu vực APAC và hệ sinh thái super-app toàn diện của chúng tôi so với phương pháp tiếp cận taxi truyền thống của họ.',
          },
          {
            name: 'Trans-Cab Services',
            company: 'Trans-Cab Pte Ltd',
            type: 'Nền tảng Taxi & Gọi xe',
            keyFeatures: [
              'Đội taxi lớn thứ ba (2.079 xe)',
              'Ra mắt dịch vụ gọi xe vào năm 2025',
              'Dịch vụ tài khoản doanh nghiệp',
            ],
            strengths: [
              'Nhà điều hành taxi đã thành lập từ năm 2003',
              'Quy mô đội xe đáng kể',
              'Hiểu biết mạnh mẽ về thị trường địa phương',
            ],
            limitations: [
              'Mới tham gia hoạt động nền tảng gọi xe',
              'Chỉ hoạt động tại Singapore',
              'Không có hệ sinh thái đa dịch vụ',
            ],
            positioningStrategy:
              'Làm nổi bật sự hiện diện đa thị trường đã thành lập và nền tảng công nghệ trưởng thành của chúng tôi so với phạm vi hạn chế của họ.',
          },
          {
            name: 'Ryde',
            company: 'Ryde Group Pte Ltd',
            type: 'Nền tảng Vận tải Đa phương thức',
            keyFeatures: [
              'Tùy chọn vận tải đa phương thức',
              'Giải pháp vận tải doanh nghiệp',
              'Nền tảng tập trung vào công nghệ',
            ],
            strengths: [
              'Phương pháp tiếp cận công nghệ-đầu tiên',
              'Mô hình giá cạnh tranh',
              'Dịch vụ đa phương thức',
            ],
            limitations: [
              'Chỉ có thị trường Singapore',
              'Đội xe nhỏ hơn so với các đối thủ đã thành lập',
              'Thành tích doanh nghiệp hạn chế',
            ],
            positioningStrategy:
              'Tận dụng mạng lưới APAC rộng lớn và cơ sở khách hàng doanh nghiệp đã được chứng minh của chúng tôi so với phạm vi địa lý hạn chế của họ.',
          },
          {
            name: 'TADA',
            company: 'MVLGRP Pte Ltd',
            type: 'Nền tảng Gọi xe Cao cấp',
            keyFeatures: [
              'Dịch vụ gọi xe cao cấp',
              'Quản lý tài khoản doanh nghiệp',
              'Phương pháp tiếp cận hướng chất lượng',
            ],
            strengths: [
              'Định vị dịch vụ cao cấp',
              'Hoạt động tập trung vào công nghệ',
              'Dịch vụ doanh nghiệp',
            ],
            limitations: [
              'Chỉ hoạt động tại Singapore',
              'Giá cao hơn so với thị trường đại chúng',
              'Mạng lưới tài xế nhỏ hơn',
            ],
            positioningStrategy:
              'Nhấn mạnh phạm vi phủ sóng khu vực và khả năng tiếp cận thị trường đại chúng của chúng tôi so với định vị chỉ cao cấp của họ.',
          },
          {
            name: 'Strides Premier',
            company: 'Strides Premier Pte Ltd',
            type: 'Giải pháp Vận tải Doanh nghiệp',
            keyFeatures: [
              'Dịch vụ taxi và limousine doanh nghiệp',
              'Giải pháp vận tải điều hành',
              'Dịch vụ quản lý đội xe',
            ],
            strengths: [
              'Tập trung chuyên biệt vào vận tải doanh nghiệp',
              'Chuyên môn dịch vụ điều hành',
              'Mối quan hệ B2B vững mạnh',
            ],
            limitations: [
              'Chỉ có mô hình vận tải truyền thống',
              'Không có công nghệ gọi xe',
              'Chỉ hoạt động tại Singapore',
            ],
            positioningStrategy:
              'Làm nổi bật nền tảng kỹ thuật số tiên tiến và khả năng mở rộng khu vực của chúng tôi so với mô hình dịch vụ truyền thống của họ.',
          },
          {
            name: 'GoTo Business Solutions',
            company: 'GoTo (Gojek)',
            type: 'Nền tảng Kinh doanh Super-app',
            keyFeatures: [
              'Vận tải và giao hàng tích hợp',
              'Dẫn đầu thị trường tại Indonesia',
              'Hệ sinh thái super-app',
            ],
            strengths: [
              'Hệ sinh thái dịch vụ toàn diện',
              'Vị thế thống trị tại Indonesia',
              'Nhận diện thương hiệu địa phương mạnh mẽ',
            ],
            limitations: [
              'Hiện diện hạn chế bên ngoài Indonesia',
              'Tập trung vào người tiêu dùng vs doanh nghiệp-đầu tiên',
              'Phạm vi phủ sóng APAC không nhất quán',
            ],
            positioningStrategy:
              'Làm nổi bật phạm vi phủ sóng thị trường APAC rộng hơn và chuyên môn dịch vụ doanh nghiệp đã thành lập trên tất cả các thị trường của chúng tôi.',
          },
          {
            name: 'Nhà cung cấp Vận tải Khu vực',
            company: 'ComfortDelGro, Blue Bird & Khác',
            type: 'Dịch vụ Đội xe Địa phương',
            keyFeatures: [
              'Hiểu biết sâu sắc về thị trường địa phương',
              'Tuân thủ quy định đã thành lập',
              'Quan hệ đối tác doanh nghiệp truyền thống',
            ],
            strengths: [
              'Mối quan hệ địa phương vững mạnh',
              'Tuân thủ quy định xuất sắc',
              'Quan hệ đối tác đã thành lập',
            ],
            limitations: [
              'Khả năng xuyên biên giới hạn chế',
              'Hoạt động đa thị trường phân mảnh',
              'Không có nền tảng thống nhất',
            ],
            positioningStrategy:
              'Nhấn mạnh nền tảng thống nhất của chúng tôi trên các thị trường APAC và tích hợp công nghệ vượt trội so với hoạt động phân mảnh của họ.',
          },
        ],
      },

      // Thai
      th: {
        competitors: [
          {
            name: 'CDG Zig (ComfortDelGro)',
            company: 'ComfortDelGro Corporation',
            type: 'แพลตฟอร์มการเดินทางแบบบูรณาการ',
            keyFeatures: [
              'ฟลีทแท็กซี่ที่ใหญ่ที่สุดในสิงคโปร์ (แท็กซี่ 8,400+ คัน)',
              'โซลูชันองค์กร ZigBiz',
              'บริการแท็กซี่และเรียกรถแบบบูรณาการ',
            ],
            strengths: [
              'ผู้นำตลาดที่ก่อตั้งมาแล้วด้วยประสบการณ์ 50+ ปี',
              'เครือข่ายแท็กซี่ที่ใหญ่ที่สุดในสิงคโปร์',
              'ความสัมพันธ์ขององค์กรที่แข็งแกร่ง',
            ],
            limitations: [
              'เข้าสู่ตลาดเรียกรถช้า (2021)',
              'ดำเนินการเฉพาะในสิงคโปร์',
              'แนวทางที่เน้นแท็กซี่แบบดั้งเดิม',
            ],
            positioningStrategy:
              'เน้นความเชี่ยวชาญในภูมิภาค APAC และระบบนิเวศ super-app ที่ครอบคลุมของเรา เมื่อเทียบกับแนวทางแท็กซี่แบบดั้งเดิมของพวกเขา',
          },
          {
            name: 'Trans-Cab Services',
            company: 'Trans-Cab Pte Ltd',
            type: 'แพลตฟอร์มแท็กซี่และเรียกรถ',
            keyFeatures: [
              'ฟลีทแท็กซี่ที่ใหญ่เป็นอันดับสาม (2,079 คัน)',
              'เปิดตัวบริการเรียกรถในปี 2025',
              'บริการบัญชีองค์กร',
            ],
            strengths: [
              'ผู้ให้บริการแท็กซี่ที่ก่อตั้งมาตั้งแต่ปี 2003',
              'ขนาดฟลีทที่มีนัยสำคัญ',
              'ความรู้ตลาดท้องถิ่นที่แข็งแกร่ง',
            ],
            limitations: [
              'ใหม่ในการดำเนินการแพลตฟอร์มเรียกรถ',
              'ดำเนินการเฉพาะในสิงคโปร์',
              'ไม่มีระบบนิเวศหลายบริการ',
            ],
            positioningStrategy:
              'เน้นการมีอยู่ในหลายตลาดที่ก่อตั้งมาแล้วและแพลตฟอร์มเทคโนโลยีที่เป็นผู้ใหญ่ของเรา เมื่อเทียบกับขอบเขตที่จำกัดของพวกเขา',
          },
          {
            name: 'Ryde',
            company: 'Ryde Group Pte Ltd',
            type: 'แพลตฟอร์มขนส่งหลายรูปแบบ',
            keyFeatures: [
              'ตัวเลือกขนส่งหลายรูปแบบ',
              'โซลูชันขนส่งองค์กร',
              'แพลตฟอร์มที่เน้นเทคโนโลยี',
            ],
            strengths: [
              'แนวทางเทคโนโลยีเป็นหลัก',
              'โมเดลการกำหนดราคาที่แข่งขันได้',
              'การเสนอบริการหลายรูปแบบ',
            ],
            limitations: [
              'ตลาดสิงคโปร์เท่านั้น',
              'ฟลีทที่เล็กกว่าเมื่อเทียบกับผู้เล่นที่ก่อตั้งมาแล้ว',
              'ประวัติการทำงานขององค์กรที่จำกัด',
            ],
            positioningStrategy:
              'ใช้ประโยชน์จากเครือข่าย APAC ที่กว้างขวางและฐานลูกค้าองค์กรที่พิสูจน์แล้วของเรา เมื่อเทียบกับขอบเขตทางภูมิศาสตร์ที่จำกัดของพวกเขา',
          },
          {
            name: 'TADA',
            company: 'MVLGRP Pte Ltd',
            type: 'แพลตฟอร์มเรียกรถระดับพรีเมียม',
            keyFeatures: [
              'บริการเรียกรถระดับพรีเมียม',
              'การจัดการบัญชีองค์กร',
              'แนวทางที่เน้นคุณภาพ',
            ],
            strengths: [
              'การวางตำแหน่งบริการระดับพรีเมียม',
              'การดำเนินการที่เน้นเทคโนโลยี',
              'การเสนอบริการองค์กร',
            ],
            limitations: [
              'ดำเนินการเฉพาะในสิงคโปร์',
              'ราคาสูงกว่าเมื่อเทียบกับตลาดมวลชน',
              'เครือข่ายคนขับที่เล็กกว่า',
            ],
            positioningStrategy:
              'เน้นการครอบคลุมระดับภูมิภาคและการเข้าถึงตลาดมวลชนของเรา เมื่อเทียบกับการวางตำแหน่งพรีเมียมเท่านั้นของพวกเขา',
          },
          {
            name: 'Strides Premier',
            company: 'Strides Premier Pte Ltd',
            type: 'โซลูชันขนส่งองค์กร',
            keyFeatures: [
              'บริการแท็กซี่และลิมูซีนองค์กร',
              'โซลูชันขนส่งผู้บริหาร',
              'บริการจัดการฟลีท',
            ],
            strengths: [
              'การเน้นขนส่งองค์กรเฉพาะทาง',
              'ความเชี่ยวชาญบริการผู้บริหาร',
              'ความสัมพันธ์ B2B ที่แข็งแกร่ง',
            ],
            limitations: [
              'โมเดลขนส่งแบบดั้งเดิมเท่านั้น',
              'ไม่มีเทคโนโลยีเรียกรถ',
              'ดำเนินการเฉพาะในสิงคโปร์',
            ],
            positioningStrategy:
              'เน้นแพลตฟอร์มดิจิทัลขั้นสูงและความสามารถในการขยายตัวในระดับภูมิภาคของเรา เมื่อเทียบกับโมเดลบริการแบบดั้งเดิมของพวกเขา',
          },
          {
            name: 'GoTo Business Solutions',
            company: 'GoTo (Gojek)',
            type: 'แพลตฟอร์มธุรกิจ Super-app',
            keyFeatures: [
              'ขนส่งและการส่งมอบแบบบูรณาการ',
              'ความเป็นผู้นำตลาดในอินโดนีเซีย',
              'ระบบนิเวศ super-app',
            ],
            strengths: [
              'ระบบนิเวศบริการที่ครอบคลุม',
              'ตำแหน่งที่โดดเด่นในอินโดนีเซีย',
              'การรับรู้แบรนด์ท้องถิ่นที่แข็งแกร่ง',
            ],
            limitations: [
              'การมีอยู่ที่จำกัดนอกอินโดนีเซีย',
              'เน้นผู้บริโภคมากกว่าองค์กร',
              'การครอบคลุม APAC ที่ไม่สม่ำเสมอ',
            ],
            positioningStrategy:
              'เน้นการครอบคลุมตลาด APAC ที่กว้างขวางกว่าและความเชี่ยวชาญด้านบริการองค์กรที่ก่อตั้งมาแล้วในทุกตลาดของเรา',
          },
          {
            name: 'ผู้ให้บริการขนส่งระดับภูมิภาค',
            company: 'ComfortDelGro, Blue Bird และอื่นๆ',
            type: 'บริการฟลีทท้องถิ่น',
            keyFeatures: [
              'ความรู้ตลาดท้องถิ่นที่ลึกซึ้ง',
              'การปฏิบัติตามข้อบังคับที่ก่อตั้งมาแล้ว',
              'ความร่วมมือองค์กรแบบดั้งเดิม',
            ],
            strengths: [
              'ความสัมพันธ์ท้องถิ่นที่แข็งแกร่ง',
              'การปฏิบัติตามข้อบังคับที่ยอดเยี่ยม',
              'ความร่วมมือที่ก่อตั้งมาแล้ว',
            ],
            limitations: [
              'ความสามารถข้ามพรมแดนที่จำกัด',
              'การดำเนินการหลายตลาดที่แยกส่วน',
              'ไม่มีแพลตฟอร์มที่เป็นหนึ่งเดียว',
            ],
            positioningStrategy:
              'เน้นแพลตฟอร์มที่เป็นหนึ่งเดียวของเราในตลาด APAC และการบูรณาการเทคโนโลยีที่เหนือกว่า เมื่อเทียบกับการดำเนินการที่แยกส่วนของพวกเขา',
          },
        ],
      },

      // Cebuano
      ceb: {
        competitors: [
          {
            name: 'CDG Zig (ComfortDelGro)',
            company: 'ComfortDelGro Corporation',
            type: 'Integrated Mobility Platform',
            keyFeatures: [
              'Pinakadako nga taxi fleet sa Singapore (8,400+ nga taxi)',
              'ZigBiz corporate solutions',
              'Integrated taxi ug ride-hailing services',
            ],
            strengths: [
              'Natukod nga market leader nga adunay 50+ ka tuig nga kasinatian',
              'Pinakadako nga taxi network sa Singapore',
              'Lig-on nga corporate relationships',
            ],
            limitations: [
              'Late entry sa ride-hailing (2021)',
              'Singapore-only nga mga operasyon',
              'Tradisyonal nga taxi-focused approach',
            ],
            positioningStrategy:
              'I-emphasize ang among regional APAC expertise ug komprehensibong super-app ecosystem vs ilang tradisyonal nga taxi-focused approach.',
          },
          {
            name: 'Trans-Cab Services',
            company: 'Trans-Cab Pte Ltd',
            type: 'Taxi & Ride-Hailing Platform',
            keyFeatures: [
              'Ikatulong pinakadako nga taxi fleet (2,079 nga sakyanan)',
              'Maglansad ug ride-hailing sa 2025',
              'Corporate account services',
            ],
            strengths: [
              'Natukod nga taxi operator sukad 2003',
              'Dakong fleet size',
              'Lig-on nga local market knowledge',
            ],
            limitations: [
              'Bag-o pa lang sa ride-hailing platform operations',
              'Singapore-only nga mga operasyon',
              'Walay multi-service ecosystem',
            ],
            positioningStrategy:
              'I-highlight ang among natukod nga multi-market presence ug mature technology platform vs ilang limited scope.',
          },
          {
            name: 'Ryde',
            company: 'Ryde Group Pte Ltd',
            type: 'Multi-Modal Transport Platform',
            keyFeatures: [
              'Multi-modal transport options',
              'Corporate transport solutions',
              'Technology-focused platform',
            ],
            strengths: [
              'Technology-first approach',
              'Competitive pricing model',
              'Multi-modal service offerings',
            ],
            limitations: [
              'Singapore market lang',
              'Mas gamay nga fleet vs established players',
              'Limited corporate track record',
            ],
            positioningStrategy:
              'I-leverage ang among extensive APAC network ug proven enterprise client base vs ilang limited geographical scope.',
          },
          {
            name: 'TADA',
            company: 'MVLGRP Pte Ltd',
            type: 'Premium Ride-Hailing Platform',
            keyFeatures: [
              'Premium ride-hailing service',
              'Corporate account management',
              'Quality-oriented approach',
            ],
            strengths: [
              'Premium service positioning',
              'Technology-focused operations',
              'Corporate service offerings',
            ],
            limitations: [
              'Singapore-only nga mga operasyon',
              'Mas taas nga pricing vs mass market',
              'Mas gamay nga driver network',
            ],
            positioningStrategy:
              'I-emphasize ang among regional coverage ug mass market accessibility vs ilang premium-only positioning.',
          },
          {
            name: 'Strides Premier',
            company: 'Strides Premier Pte Ltd',
            type: 'Corporate Transport Solutions',
            keyFeatures: [
              'Corporate taxi ug limousine services',
              'Executive transport solutions',
              'Fleet management services',
            ],
            strengths: [
              'Specialized corporate transport focus',
              'Executive service expertise',
              'Lig-on nga B2B relationships',
            ],
            limitations: [
              'Tradisyonal nga transport models lang',
              'Walay ride-hailing technology',
              'Singapore-only nga mga operasyon',
            ],
            positioningStrategy:
              'I-highlight ang among advanced digital platform ug regional scalability vs ilang traditional service model.',
          },
          {
            name: 'GoTo Business Solutions',
            company: 'GoTo (Gojek)',
            type: 'Super-app Business Platform',
            keyFeatures: [
              'Integrated transport ug delivery',
              'Market leadership sa Indonesia',
              'Super-app ecosystem',
            ],
            strengths: [
              'Comprehensive service ecosystem',
              'Dominant Indonesia position',
              'Lig-on nga local brand recognition',
            ],
            limitations: [
              'Limited presence outside Indonesia',
              'Consumer-focused vs enterprise-first',
              'Inconsistent APAC coverage',
            ],
            positioningStrategy:
              'I-highlight ang among broader APAC market coverage ug established corporate service expertise sa tanan nga mga market.',
          },
          {
            name: 'Regional Transport Providers',
            company: 'ComfortDelGro, Blue Bird & Others',
            type: 'Local Fleet Services',
            keyFeatures: [
              'Lawom nga local market knowledge',
              'Natukod nga regulatory compliance',
              'Tradisyonal nga corporate partnerships',
            ],
            strengths: [
              'Lig-on nga local relationships',
              'Excellent regulatory compliance',
              'Natukod nga partnerships',
            ],
            limitations: [
              'Limited cross-border capabilities',
              'Fragmented multi-market operations',
              'Walay unified platform',
            ],
            positioningStrategy:
              'I-emphasize ang among unified platform sa APAC markets ug superior technology integration vs ilang fragmented operations.',
          },
        ],
      },
    },
  };
