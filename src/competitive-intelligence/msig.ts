import {
  ProductCompetitiveIntelligenceConfiguration,
  CompetitiveIntelligenceConfiguration,
} from './types.js';

// PARecoveryPlus competitive intelligence
const parecoveryPlusCompetitiveIntelligence: CompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'msig-parecoveryplus',
      company: 'msig',
      productId: 'parecovery-plus',
      targetMarket: 'Singapore Personal Accident Insurance',
    },

    localized: {
      // English
      en: {
        competitors: [
          {
            name: 'GREAT Protector Active',
            company: 'Great Eastern',
            type: 'Personal Accident Insurance',
            keyFeatures: [
              'Accident coverage up to age 70',
              'Coverage for permanent disability and death',
              'Optional medical expenses coverage',
              'Basic daily hospital income benefit',
            ],
            strengths: [
              'Established brand with long market presence',
              'Simple product structure',
              'Coverage until age 70',
            ],
            limitations: [
              'Limited lifestyle and recovery benefits compared to PARecoveryPlus',
              'No unique recovery support features like home modification',
              'Minimal alternative treatment coverage',
              'No pet care or entertainment ticket cancellation benefits',
            ],
            positioningStrategy:
              'PARecoveryPlus offers comprehensive recovery-focused benefits that go beyond traditional accident insurance. While GREAT Protector Active covers basic accident scenarios, PARecoveryPlus includes lifestyle benefits like pet care allowance, trauma counselling, and home modification grants that truly support your recovery journey.',
          },
          {
            name: 'SmartCare Accident',
            company: 'AXA Singapore',
            type: 'Personal Accident Insurance',
            keyFeatures: [
              'Accidental death and disability coverage',
              'Medical expense reimbursement',
              'Daily hospital allowance',
              'Basic fracture benefits',
            ],
            strengths: [
              'International insurance brand recognition',
              'Competitive pricing for basic coverage',
              'Straightforward claims process',
            ],
            limitations: [
              'Limited to basic accident coverage without recovery support',
              'No lifestyle or wellness benefits',
              'Minimal alternative treatment options',
              'No specialized recovery assistance like home nursing fund',
            ],
            positioningStrategy:
              "PARecoveryPlus stands out with its holistic approach to accident recovery. Unlike SmartCare Accident's basic coverage, we provide comprehensive recovery support including home nursing fund, permanent caregiver grant, and even cosmetic procedure coverage for face and neck injuries - addressing the full spectrum of recovery needs.",
          },
          {
            name: 'Personal Accident',
            company: 'NTUC Income',
            type: 'Personal Accident Insurance',
            keyFeatures: [
              'Accident-related death and disability benefits',
              'Medical expenses coverage for accidents',
              'Hospital cash benefits',
              'Fracture and burn benefits',
            ],
            strengths: [
              'Local cooperative heritage and trust',
              'Reasonable premium rates',
              'Good customer service reputation',
            ],
            limitations: [
              'Basic accident coverage without specialized recovery benefits',
              'No trauma counselling or mental health support',
              'Limited lifestyle protection features',
              'No innovative benefits like pet care or entertainment coverage',
            ],
            positioningStrategy:
              'While NTUC Income Personal Accident provides solid basic accident protection, PARecoveryPlus is designed for modern lifestyles with unique benefits like staycation cancellation, fitness membership coverage, and mobility aid support that reflect how people actually live and recover today.',
          },
        ],
      },

      // Indonesian
      id: {
        competitors: [
          {
            name: 'GREAT Protector Active',
            company: 'Great Eastern',
            type: 'Asuransi Kecelakaan Pribadi',
            keyFeatures: [
              'Perlindungan kecelakaan hingga usia 70 tahun',
              'Perlindungan cacat permanen dan kematian',
              'Perlindungan biaya medis opsional',
              'Manfaat pendapatan harian rumah sakit dasar',
            ],
            strengths: [
              'Merek mapan dengan kehadiran pasar yang lama',
              'Struktur produk yang sederhana',
              'Perlindungan hingga usia 70 tahun',
            ],
            limitations: [
              'Manfaat gaya hidup dan pemulihan terbatas dibanding PARecoveryPlus',
              'Tidak ada fitur dukungan pemulihan unik seperti modifikasi rumah',
              'Perlindungan pengobatan alternatif minimal',
              'Tidak ada manfaat perawatan hewan atau pembatalan tiket hiburan',
            ],
            positioningStrategy:
              'PARecoveryPlus menawarkan manfaat pemulihan komprehensif yang melampaui asuransi kecelakaan tradisional. Sementara GREAT Protector Active mencakup skenario kecelakaan dasar, PARecoveryPlus termasuk manfaat gaya hidup seperti tunjangan perawatan hewan, konseling trauma, dan hibah modifikasi rumah yang benar-benar mendukung perjalanan pemulihan Anda.',
          },
          {
            name: 'SmartCare Accident',
            company: 'AXA Singapore',
            type: 'Asuransi Kecelakaan Pribadi',
            keyFeatures: [
              'Perlindungan kematian dan cacat akibat kecelakaan',
              'Penggantian biaya medis',
              'Tunjangan harian rumah sakit',
              'Manfaat patah tulang dasar',
            ],
            strengths: [
              'Pengakuan merek asuransi internasional',
              'Harga kompetitif untuk perlindungan dasar',
              'Proses klaim yang mudah',
            ],
            limitations: [
              'Terbatas pada perlindungan kecelakaan dasar tanpa dukungan pemulihan',
              'Tidak ada manfaat gaya hidup atau kesehatan',
              'Pilihan pengobatan alternatif minimal',
              'Tidak ada bantuan pemulihan khusus seperti dana perawatan rumah',
            ],
            positioningStrategy:
              'PARecoveryPlus menonjol dengan pendekatan holistik terhadap pemulihan kecelakaan. Tidak seperti perlindungan dasar AXA, kami menyediakan dukungan pemulihan komprehensif termasuk dana perawatan rumah, hibah pengasuh permanen, dan bahkan perlindungan prosedur kosmetik untuk cedera wajah dan leher - mengatasi spektrum penuh kebutuhan pemulihan.',
          },
          {
            name: 'Personal Accident',
            company: 'NTUC Income',
            type: 'Asuransi Kecelakaan Pribadi',
            keyFeatures: [
              'Manfaat kematian dan cacat terkait kecelakaan',
              'Perlindungan biaya medis untuk kecelakaan',
              'Manfaat uang tunai rumah sakit',
              'Manfaat patah tulang dan luka bakar',
            ],
            strengths: [
              'Warisan koperasi lokal dan kepercayaan',
              'Tarif premi yang wajar',
              'Reputasi layanan pelanggan yang baik',
            ],
            limitations: [
              'Perlindungan kecelakaan dasar tanpa manfaat pemulihan khusus',
              'Tidak ada konseling trauma atau dukungan kesehatan mental',
              'Fitur perlindungan gaya hidup terbatas',
              'Tidak ada manfaat inovatif seperti perawatan hewan atau perlindungan hiburan',
            ],
            positioningStrategy:
              'Sementara NTUC Income Personal Accident menyediakan perlindungan kecelakaan dasar yang solid, PARecoveryPlus dirancang untuk gaya hidup modern dengan manfaat unik seperti pembatalan staycation, perlindungan keanggotaan kebugaran, dan dukungan alat bantu mobilitas yang mencerminkan bagaimana orang benar-benar hidup dan pulih hari ini.',
          },
        ],
      },

      // Malaysian
      ms: {
        competitors: [
          {
            name: 'GREAT Protector Active',
            company: 'Great Eastern',
            type: 'Insurans Kemalangan Peribadi',
            keyFeatures: [
              'Perlindungan kemalangan sehingga umur 70 tahun',
              'Perlindungan kecacatan kekal dan kematian',
              'Perlindungan perbelanjaan perubatan pilihan',
              'Manfaat pendapatan harian hospital asas',
            ],
            strengths: [
              'Jenama mantap dengan kehadiran pasaran yang lama',
              'Struktur produk yang mudah',
              'Perlindungan sehingga umur 70 tahun',
            ],
            limitations: [
              'Manfaat gaya hidup dan pemulihan terhad berbanding PARecoveryPlus',
              'Tiada ciri sokongan pemulihan unik seperti pengubahsuaian rumah',
              'Perlindungan rawatan alternatif minimum',
              'Tiada manfaat penjagaan haiwan atau pembatalan tiket hiburan',
            ],
            positioningStrategy:
              'PARecoveryPlus menawarkan manfaat pemulihan komprehensif yang melampaui insurans kemalangan tradisional. Sementara GREAT Protector Active meliputi senario kemalangan asas, PARecoveryPlus termasuk manfaat gaya hidup seperti elaun penjagaan haiwan, kaunseling trauma, dan geran pengubahsuaian rumah yang benar-benar menyokong perjalanan pemulihan anda.',
          },
          {
            name: 'SmartCare Accident',
            company: 'AXA Singapore',
            type: 'Insurans Kemalangan Peribadi',
            keyFeatures: [
              'Perlindungan kematian dan kecacatan akibat kemalangan',
              'Pembayaran balik perbelanjaan perubatan',
              'Elaun harian hospital',
              'Manfaat patah tulang asas',
            ],
            strengths: [
              'Pengiktirafan jenama insurans antarabangsa',
              'Harga kompetitif untuk perlindungan asas',
              'Proses tuntutan yang mudah',
            ],
            limitations: [
              'Terhad kepada perlindungan kemalangan asas tanpa sokongan pemulihan',
              'Tiada manfaat gaya hidup atau kesihatan',
              'Pilihan rawatan alternatif minimum',
              'Tiada bantuan pemulihan khusus seperti dana jagaan rumah',
            ],
            positioningStrategy:
              'PARecoveryPlus menonjol dengan pendekatan holistik terhadap pemulihan kemalangan. Tidak seperti perlindungan asas AXA, kami menyediakan sokongan pemulihan komprehensif termasuk dana jagaan rumah, geran penjaga kekal, dan bahkan perlindungan prosedur kosmetik untuk kecederaan muka dan leher - menangani spektrum penuh keperluan pemulihan.',
          },
          {
            name: 'Personal Accident',
            company: 'NTUC Income',
            type: 'Insurans Kemalangan Peribadi',
            keyFeatures: [
              'Manfaat kematian dan kecacatan berkaitan kemalangan',
              'Perlindungan perbelanjaan perubatan untuk kemalangan',
              'Manfaat tunai hospital',
              'Manfaat patah tulang dan melecur',
            ],
            strengths: [
              'Warisan koperasi tempatan dan kepercayaan',
              'Kadar premium yang berpatutan',
              'Reputasi perkhidmatan pelanggan yang baik',
            ],
            limitations: [
              'Perlindungan kemalangan asas tanpa manfaat pemulihan khusus',
              'Tiada kaunseling trauma atau sokongan kesihatan mental',
              'Ciri perlindungan gaya hidup terhad',
              'Tiada manfaat inovatif seperti penjagaan haiwan atau perlindungan hiburan',
            ],
            positioningStrategy:
              'Sementara NTUC Income Personal Accident menyediakan perlindungan kemalangan asas yang kukuh, PARecoveryPlus direka untuk gaya hidup moden dengan manfaat unik seperti pembatalan staycation, perlindungan keahlian kecergasan, dan sokongan alat bantu mobiliti yang mencerminkan bagaimana orang benar-benar hidup dan pulih hari ini.',
          },
        ],
      },

      // Cebuano
      ceb: {
        competitors: [
          {
            name: 'GREAT Protector Active',
            company: 'Great Eastern',
            type: 'Personal Accident Insurance',
            keyFeatures: [
              'Accident coverage hangtod edad nga 70',
              'Coverage para sa permanenteng disability ug kamatayon',
              'Optional medical expenses coverage',
              'Basic daily hospital income benefit',
            ],
            strengths: [
              'Natukod nga brand nga adunay taas nga presensya sa merkado',
              'Yano nga istruktura sa produkto',
              'Coverage hangtod edad nga 70',
            ],
            limitations: [
              'Limited nga lifestyle ug recovery benefits kumpara sa PARecoveryPlus',
              'Walay talagsaon nga recovery support features sama sa home modification',
              'Gamay nga alternative treatment coverage',
              'Walay pet care o entertainment ticket cancellation benefits',
            ],
            positioningStrategy:
              'Ang PARecoveryPlus nagtanyag ug komprehensibong recovery-focused benefits nga molapas sa tradisyonal nga accident insurance. Samtang ang GREAT Protector Active naglangkob sa basic accident scenarios, ang PARecoveryPlus naglakip ug lifestyle benefits sama sa pet care allowance, trauma counselling, ug home modification grants nga tinuod nga mosuporta sa imong recovery journey.',
          },
          {
            name: 'SmartCare Accident',
            company: 'AXA Singapore',
            type: 'Personal Accident Insurance',
            keyFeatures: [
              'Accidental death ug disability coverage',
              'Medical expense reimbursement',
              'Daily hospital allowance',
              'Basic fracture benefits',
            ],
            strengths: [
              'International insurance brand recognition',
              'Kompetitibo nga presyo para sa basic coverage',
              'Straightforward claims process',
            ],
            limitations: [
              'Limited sa basic accident coverage nga walay recovery support',
              'Walay lifestyle o wellness benefits',
              'Gamay nga alternative treatment options',
              'Walay specialized recovery assistance sama sa home nursing fund',
            ],
            positioningStrategy:
              'Ang PARecoveryPlus mibarog sa iyang holistic approach sa accident recovery. Dili sama sa basic coverage sa SmartCare Accident, kami naghatag ug komprehensibong recovery support lakip ang home nursing fund, permanent caregiver grant, ug bisan cosmetic procedure coverage para sa nawong ug liog nga mga samad - nga motubag sa tibuok spectrum sa recovery needs.',
          },
          {
            name: 'Personal Accident',
            company: 'NTUC Income',
            type: 'Personal Accident Insurance',
            keyFeatures: [
              'Accident-related death ug disability benefits',
              'Medical expenses coverage para sa mga aksidente',
              'Hospital cash benefits',
              'Fracture ug burn benefits',
            ],
            strengths: [
              'Local cooperative heritage ug pagsalig',
              'Reasonable premium rates',
              'Maayong customer service reputation',
            ],
            limitations: [
              'Basic accident coverage nga walay specialized recovery benefits',
              'Walay trauma counselling o mental health support',
              'Limited lifestyle protection features',
              'Walay innovative benefits sama sa pet care o entertainment coverage',
            ],
            positioningStrategy:
              'Samtang ang NTUC Income Personal Accident naghatag ug solid basic accident protection, ang PARecoveryPlus gidesinyo alang sa modernong lifestyle nga adunay talagsaon nga benefits sama sa staycation cancellation, fitness membership coverage, ug mobility aid support nga nagsalamin kon unsaon pagkinabuhi ug pag-ayo sa mga tawo karon.',
          },
        ],
      },
    },
  };

// DentiPlus competitive intelligence
const dentiPlusCompetitiveIntelligence: CompetitiveIntelligenceConfiguration = {
  base: {
    id: 'msig-dentiplus',
    company: 'msig',
    productId: 'dentiplus',
    targetMarket: 'Singapore Dental Insurance',
  },

  localized: {
    // English
    en: {
      competitors: [],
    },

    // Indonesian
    id: {
      competitors: [],
    },

    // Malaysian
    ms: {
      competitors: [],
    },

    // Cebuano
    ceb: {
      competitors: [
        {
          name: 'Dental Care Plus',
          company: 'Chubb',
          type: 'Dental Insurance',
          keyFeatures: [
            'Coverage para sa preventive, basic, ug pipila ka major dental treatments',
            'Access sa network ug out-of-network nga mga dentista',
            'Emergency dental treatment coverage',
            'Annual benefit limits nga adunay co-payment/co-insurance structures',
          ],
          strengths: [
            'International insurer nga adunay lig-on nga brand recognition',
            'Halapad nga provider network ug preventive care focus',
            'Yano nga plan structure para sa kinatibuk-ang dental needs',
          ],
          limitations: [
            'Ang mga benefits mahimong lahi-lahi depende sa network status',
            'Out-of-network reimbursements mahimong adunay daghan nga mga lakang',
            'Coverage para sa advanced endodontic procedures mahimong mas limitado',
            'Co-payments o sub-limits mahimong magamit alang sa pipila ka mga serbisyo',
          ],
          positioningStrategy:
            'Ang DentiPlus gidesinyo alang sa katin-awan ug adlaw-adlaw nga paggamit. Uban sa defined plan tiers, transparent annual limits (Classic ug Platinum), ug direct billing sa Contracted Providers, gipasinayon niini ang pagpili ug claims versus broader offerings sama sa Chubb Dental Care Plus—labi na alang sa endodontics, therapeutic pulpotomy, ug specified conservative treatments.',
        },
      ],
    },
  },
};

// Main MSIG competitive intelligence configuration with product specificity
export const msigCompetitiveIntelligenceConfiguration: ProductCompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'msig',
      company: 'msig',
      targetMarket: 'Singapore Insurance Market',
    },
    products: {
      'parecovery-plus': parecoveryPlusCompetitiveIntelligence,
      dentiplus: dentiPlusCompetitiveIntelligence,
    },
  };
