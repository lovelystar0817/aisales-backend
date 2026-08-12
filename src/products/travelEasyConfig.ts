import { ProductConfiguration } from './types.js';

/**
 * TravelEasy Configuration - Localized content for TravelEasy product
 */
export const travelEasyConfiguration: ProductConfiguration = {
  base: {
    id: 'travel-easy',
    friendlyId: 'travel-easy',
    category: 'insurance',
  },

  localized: {
    // English (Original)
    en: {
      name: 'TravelEasy',
      keyFeatures: [
        'Over 50 benefits including comprehensive COVID-19 coverage',
        'Three plan tiers: Standard, Elite, and Premier',
        'Three coverage areas: Area A (ASEAN), Area B (Asia-Pacific), Area C (Worldwide)',
        'COVID-19 medical cover up to $750,000',
        'Travel inconvenience benefits up to $12,500',
        'Personal accident cover: Death and Permanent Total Disability up to $500,000',
        'Overseas medical expenses up to $1,000,000',
        'Emergency medical evacuation and repatriation up to $1,000,000',
        'Travel cancellation and postponement coverage',
        'Baggage, delayed baggage, and personal money protection',
        'Personal liability coverage up to $1,000,000',
        'Adventurous activities cover (Elite and Premier plans)',
        'Single Return Trip (up to 182 days) or Annual Plan options',
        'Individual, Group, Family, or Adult & Children cover types',
        'No medical check-up required for standard applicants',
      ],
      featureHighlight: {
        title: 'Comprehensive Travel Protection for Every Journey',
        description:
          'TravelEasy provides comprehensive travel insurance with over 50 benefits designed for every type of traveler. From extensive COVID-19 coverage to travel inconvenience protection, our three-tier plans (Standard, Elite, Premier) ensure you and your family are protected across ASEAN, Asia-Pacific, or worldwide destinations with flexible single trip or annual coverage options.',
      },
      evaluationFocus: [
        'Understanding customer travel plans and destination (Area A/B/C)',
        'Plan tier selection (Standard, Elite, Premier) based on traveler needs',
        'Cover type selection (Individual, Family, Group, Adult & Children)',
        'Trip duration and frequency (Single Return Trip vs Annual Plan)',
        'COVID-19 coverage benefits and eligibility requirements',
        'Medical benefits including overseas medical expenses and emergency evacuation',
        'Travel inconvenience benefits: cancellation, postponement, delays, baggage',
        'Personal accident and liability coverage explanation',
        'Premium calculation based on destination area, plan tier, and trip duration',
        'Eligibility requirements (age restrictions, residency requirements)',
        'Key exclusions: pre-existing conditions, travel advisories',
        'Policy terms: coverage period, free look period, renewal process',
        'Common objections: existing coverage (credit card, health insurance), cost, coverage comparison',
      ],
      callCriteria: {
        title: 'TravelEasy Telesales Call Scorecard',
        description:
          'To get the best result in this session, aim to meet all the key evaluation criteria:',
        criteria: [],
        markdown: `**1. Soft Skills (30 points):**\n
Demonstrate clear communication, build rapport with customers, adapt to their concerns, and focus on customer satisfaction.\n\n
**2. Knowledge Skills (30 points):**\n
Gather essential travel information, solve customer problems effectively, and close deals confidently through skilled negotiation.\n\n
**3. Product Knowledge (40 points):**\n
Present TravelEasy products accurately, explain plan tiers and coverage areas, and provide solutions aligned with the customer's travel profile.`,
      },
    },

    // Indonesian
    id: {
      name: 'TravelEasy',
      keyFeatures: [
        'Lebih dari 50 manfaat termasuk cakupan COVID-19 yang komprehensif',
        'Tiga tingkatan paket: Standard, Elite, dan Premier',
        'Tiga area cakupan: Area A (ASEAN), Area B (Asia-Pasifik), Area C (Seluruh Dunia)',
        'Cakupan medis COVID-19 hingga $750.000',
        'Manfaat ketidaknyamanan perjalanan hingga $12.500',
        'Cakupan kecelakaan pribadi: Kematian dan Cacat Total Permanen hingga $500.000',
        'Biaya medis luar negeri hingga $1.000.000',
        'Evakuasi medis darurat dan repatriasi hingga $1.000.000',
        'Cakupan pembatalan dan penundaan perjalanan',
        'Perlindungan bagasi, bagasi tertunda, dan uang pribadi',
        'Cakupan tanggung jawab pribadi hingga $1.000.000',
        'Cakupan aktivitas petualangan (paket Elite dan Premier)',
        'Pilihan Perjalanan Pulang Pergi Tunggal (hingga 182 hari) atau Paket Tahunan',
        'Jenis cakupan Individu, Grup, Keluarga, atau Dewasa & Anak-anak',
        'Tidak perlu pemeriksaan medis untuk pelamar standar',
      ],
      featureHighlight: {
        title: 'Perlindungan Perjalanan Komprehensif untuk Setiap Perjalanan',
        description:
          'TravelEasy menyediakan asuransi perjalanan komprehensif dengan lebih dari 50 manfaat yang dirancang untuk setiap jenis pelancong. Dari cakupan COVID-19 yang luas hingga perlindungan ketidaknyamanan perjalanan, tiga tingkatan paket kami (Standard, Elite, Premier) memastikan Anda dan keluarga terlindungi di destinasi ASEAN, Asia-Pasifik, atau seluruh dunia dengan pilihan cakupan perjalanan tunggal atau tahunan yang fleksibel.',
      },
      evaluationFocus: [
        'Memahami rencana perjalanan dan destinasi pelanggan (Area A/B/C)',
        'Pemilihan tingkatan paket (Standard, Elite, Premier) berdasarkan kebutuhan pelancong',
        'Pemilihan jenis cakupan (Individu, Keluarga, Grup, Dewasa & Anak-anak)',
        'Durasi dan frekuensi perjalanan (Perjalanan Pulang Pergi Tunggal vs Paket Tahunan)',
        'Manfaat cakupan COVID-19 dan persyaratan kelayakan',
        'Manfaat medis termasuk biaya medis luar negeri dan evakuasi darurat',
        'Manfaat ketidaknyamanan perjalanan: pembatalan, penundaan, keterlambatan, bagasi',
        'Penjelasan cakupan kecelakaan dan tanggung jawab pribadi',
        'Perhitungan premi berdasarkan area destinasi, tingkatan paket, dan durasi perjalanan',
        'Persyaratan kelayakan (batasan usia, persyaratan residensi)',
        'Pengecualian utama: kondisi pra-eksisting, peringatan perjalanan',
        'Ketentuan polis: periode cakupan, periode free look, proses perpanjangan',
        'Keberatan umum: cakupan yang ada (kartu kredit, asuransi kesehatan), biaya, perbandingan cakupan',
      ],
      callCriteria: {
        title: 'Kartu Skor Panggilan Telesales TravelEasy',
        description:
          'Untuk mendapatkan hasil terbaik dalam sesi ini, usahakan memenuhi semua kriteria evaluasi utama:',
        criteria: [],
        markdown: `**1. Keterampilan Lunak (30 poin):**\n
Tunjukkan komunikasi yang jelas, bangun hubungan baik dengan pelanggan, adaptasi terhadap kekhawatiran mereka, dan fokus pada kepuasan pelanggan.\n\n
**2. Keterampilan Pengetahuan (30 poin):**\n
Kumpulkan informasi perjalanan penting, selesaikan masalah pelanggan secara efektif, dan tutup kesepakatan dengan percaya diri melalui negosiasi yang terampil.\n\n
**3. Pengetahuan Produk (40 poin):**\n
Presentasikan produk TravelEasy secara akurat, jelaskan tingkatan paket dan area cakupan, serta berikan solusi yang selaras dengan profil perjalanan pelanggan.`,
      },
    },

    // Malaysian
    ms: {
      name: 'TravelEasy',
      keyFeatures: [
        'Lebih 50 manfaat termasuk perlindungan COVID-19 yang komprehensif',
        'Tiga peringkat pelan: Standard, Elite, dan Premier',
        'Tiga kawasan perlindungan: Kawasan A (ASEAN), Kawasan B (Asia-Pasifik), Kawasan C (Seluruh Dunia)',
        'Perlindungan perubatan COVID-19 sehingga $750,000',
        'Manfaat kesulitan perjalanan sehingga $12,500',
        'Perlindungan kemalangan peribadi: Kematian dan Hilang Upaya Kekal sehingga $500,000',
        'Perbelanjaan perubatan luar negara sehingga $1,000,000',
        'Pemindahan perubatan kecemasan dan penghantaran pulang sehingga $1,000,000',
        'Perlindungan pembatalan dan penangguhan perjalanan',
        'Perlindungan bagasi, bagasi tertangguh, dan wang peribadi',
        'Perlindungan liabiliti peribadi sehingga $1,000,000',
        'Perlindungan aktiviti pengembaraan (pelan Elite dan Premier)',
        'Pilihan Perjalanan Pergi Balik Tunggal (sehingga 182 hari) atau Pelan Tahunan',
        'Jenis perlindungan Individu, Kumpulan, Keluarga, atau Dewasa & Kanak-kanak',
        'Tiada pemeriksaan perubatan diperlukan untuk pemohon standard',
      ],
      featureHighlight: {
        title: 'Perlindungan Perjalanan Komprehensif untuk Setiap Perjalanan',
        description:
          'TravelEasy menyediakan insurans perjalanan komprehensif dengan lebih 50 manfaat yang direka untuk setiap jenis pelancong. Dari perlindungan COVID-19 yang luas hingga perlindungan kesulitan perjalanan, tiga peringkat pelan kami (Standard, Elite, Premier) memastikan anda dan keluarga terlindung di destinasi ASEAN, Asia-Pasifik, atau seluruh dunia dengan pilihan perlindungan perjalanan tunggal atau tahunan yang fleksibel.',
      },
      evaluationFocus: [
        'Memahami rancangan perjalanan dan destinasi pelanggan (Kawasan A/B/C)',
        'Pemilihan peringkat pelan (Standard, Elite, Premier) berdasarkan keperluan pelancong',
        'Pemilihan jenis perlindungan (Individu, Keluarga, Kumpulan, Dewasa & Kanak-kanak)',
        'Tempoh dan kekerapan perjalanan (Perjalanan Pergi Balik Tunggal vs Pelan Tahunan)',
        'Manfaat perlindungan COVID-19 dan syarat kelayakan',
        'Manfaat perubatan termasuk perbelanjaan perubatan luar negara dan pemindahan kecemasan',
        'Manfaat kesulitan perjalanan: pembatalan, penangguhan, kelewatan, bagasi',
        'Penjelasan perlindungan kemalangan dan liabiliti peribadi',
        'Pengiraan premium berdasarkan kawasan destinasi, peringkat pelan, dan tempoh perjalanan',
        'Syarat kelayakan (had umur, keperluan kediaman)',
        'Pengecualian utama: keadaan sedia ada, amaran perjalanan',
        'Terma polisi: tempoh perlindungan, tempoh free look, proses pembaharuan',
        'Bantahan biasa: perlindungan sedia ada (kad kredit, insurans kesihatan), kos, perbandingan perlindungan',
      ],
      callCriteria: {
        title: 'Kad Skor Panggilan Telesales TravelEasy',
        description:
          'Untuk mendapat hasil terbaik dalam sesi ini, usahakan memenuhi semua kriteria penilaian utama:',
        criteria: [],
        markdown: `**1. Kemahiran Lembut (30 mata):**\n
Tunjukkan komunikasi yang jelas, bina hubungan baik dengan pelanggan, adaptasi kepada kebimbangan mereka, dan fokus kepada kepuasan pelanggan.\n\n
**2. Kemahiran Pengetahuan (30 mata):**\n
Kumpul maklumat perjalanan penting, selesaikan masalah pelanggan dengan berkesan, dan tutup perjanjian dengan yakin melalui rundingan yang mahir.\n\n
**3. Pengetahuan Produk (40 mata):**\n
Bentangkan produk TravelEasy dengan tepat, terangkan peringkat pelan dan kawasan perlindungan, serta berikan penyelesaian yang sejajar dengan profil perjalanan pelanggan.`,
      },
    },

    // Cebuano
    ceb: {
      name: 'TravelEasy',
      keyFeatures: [
        'Sobra sa 50 ka mga benepisyo lakip ang komprehensibo nga COVID-19 coverage',
        'Tulo ka plan tiers: Standard, Elite, ug Premier',
        'Tulo ka coverage areas: Area A (ASEAN), Area B (Asia-Pacific), Area C (Worldwide)',
        'COVID-19 medical cover hangtod $750,000',
        'Travel inconvenience benefits hangtod $12,500',
        'Personal accident cover: Kamatayon ug Permanent Total Disability hangtod $500,000',
        'Overseas medical expenses hangtod $1,000,000',
        'Emergency medical evacuation ug repatriation hangtod $1,000,000',
        'Travel cancellation ug postponement coverage',
        'Baggage, delayed baggage, ug personal money protection',
        'Personal liability coverage hangtod $1,000,000',
        'Adventurous activities cover (Elite ug Premier plans)',
        'Single Return Trip (hangtod 182 days) o Annual Plan options',
        'Individual, Group, Family, o Adult & Children cover types',
        'Walay medical check-up nga gikinahanglan para sa standard applicants',
      ],
      featureHighlight: {
        title: 'Komprehensibo nga Travel Protection para sa Matag Biyahe',
        description:
          'Ang TravelEasy naghatag ug komprehensibo nga travel insurance nga may sobra sa 50 ka mga benepisyo nga gidisenyo para sa matag tipo sa mga biyahero. Gikan sa extensive COVID-19 coverage hangtod sa travel inconvenience protection, ang among tulo ka tier plans (Standard, Elite, Premier) nagsiguro nga ikaw ug ang imong pamilya protektado sa ASEAN, Asia-Pacific, o worldwide destinations nga may flexible single trip o annual coverage options.',
      },
      evaluationFocus: [
        'Pagsabut sa travel plans ug destination sa kostumer (Area A/B/C)',
        'Plan tier selection (Standard, Elite, Premier) base sa needs sa traveler',
        'Cover type selection (Individual, Family, Group, Adult & Children)',
        'Trip duration ug frequency (Single Return Trip vs Annual Plan)',
        'COVID-19 coverage benefits ug eligibility requirements',
        'Medical benefits lakip ang overseas medical expenses ug emergency evacuation',
        'Travel inconvenience benefits: cancellation, postponement, delays, baggage',
        'Personal accident ug liability coverage explanation',
        'Premium calculation base sa destination area, plan tier, ug trip duration',
        'Eligibility requirements (age restrictions, residency requirements)',
        'Key exclusions: pre-existing conditions, travel advisories',
        'Policy terms: coverage period, free look period, renewal process',
        'Common objections: existing coverage (credit card, health insurance), cost, coverage comparison',
      ],
      callCriteria: {
        title: 'TravelEasy Telesales Call Scorecard',
        description:
          'Para makakuha sa pinakamataas nga resulta niining session, sikapa nga matuman ang tanan nga key evaluation criteria:',
        criteria: [],
        markdown: `**1. Soft Skills (30 ka puntos):**\n
Ipakita ang tin-aw nga komunikasyon, pagtukod og maayong relasyon sa mga kostumer, pag-adapt sa ilang mga kabalaka, ug focus sa katagbawan sa kostumer.\n\n
**2. Knowledge Skills (30 ka puntos):**\n
Tigoma ang importanting impormasyon sa biyahe, sulbara ang mga problema sa kostumer nga epektibo, ug isara ang mga deal nga may pagsalig pinaagi sa hanas nga pagnegosyo.\n\n
**3. Product Knowledge (40 ka puntos):**\n
Ipresentar ang mga produkto sa TravelEasy nga tukma, ipasabut ang plan tiers ug coverage areas, ug paghatag og mga solusyon nga aligned sa travel profile sa kostumer.`,
      },
    },
  },
};
