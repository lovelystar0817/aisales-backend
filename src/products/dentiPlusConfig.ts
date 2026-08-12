import { ProductConfiguration } from './types.js';

/**
 * DentiPlus Configuration - Localized content for MSIG DentiPlus dental insurance
 */
export const dentiPlusConfiguration: ProductConfiguration = {
  base: {
    id: 'dentiplus',
    friendlyId: 'dentiplus',
    category: 'insurance',
  },

  localized: {
    // English (Original)
    en: {
      name: 'DentiPlus',
      keyFeatures: [
        'Two plan tiers: Classic and Platinum',
        'Overall annual limit: Classic up to S$1,000; Platinum up to S$1,500',
        'Higher coverage at Contracted Providers (direct billing available)',
        'Preventive dental: check-up, cleaning, fluoride (one visit per Policy Year)',
        'Dental radiology: bitewing, skull/facial survey, or panoramic x-ray (per Policy Year limits)',
        'Conservative treatments: permanent amalgam/composite and glass ionomer fillings',
        'Extractions (non-surgical): simple and complicated',
        'Endodontics: root canal and therapeutic pulpotomy (excluding final restoration)',
        'Emergency dental: covered; during waiting period handled on reimbursement basis',
        '14-business-day free look; automatic yearly renewal; monthly or annual premiums',
      ],
      featureHighlight: {
        title: 'Flexible Dental Coverage With Network Benefits',
        description:
          'DentiPlus provides practical, affordable dental coverage across essential categories with two tiers. Enjoy higher coverage and direct billing at Contracted Providers, overall annual limits up to S$1,500, and simple reimbursement for out-of-network care.',
      },
      evaluationFocus: [
        'Tier selection (Classic vs Platinum) based on expected dental usage and budget',
        'In-network (Contracted Providers) vs out-of-network coverage differences and process',
        'Annual overall limit and per-policy-year visit/x-ray limits',
        'Eligibility (ages 18 to below 60 at start) and termination conditions',
        'Key exclusions including cosmetic/aesthetic treatments and pre-existing conditions',
        'Claims flow: pre-notification for non-emergency, direct billing in-network, receipts for out-of-network',
        'Renewal, free look, and premium payment frequency (monthly vs annual)',
      ],
      callCriteria: {
        title: 'Product Positioning Scorecard',
        description:
          'To get the best result in this session, aim to meet all the key evaluation criteria:',
        criteria: [],
        markdown: `**1. Sales Technique (3F):**\n
Use the 3F framework (Feel → Felt → Found) to listen, empathize, and offer a tailored solution.\n\n
**2. Product Knowledge:**\n
- **Product Pitch:** Present accurate, concise product information that ties features directly to customer outcomes.\n
- **Competitor Differentiation:** Differentiate the solution by highlighting unique value and concrete advantages over competitors.`,
      },
    },

    // Indonesian
    id: {
      name: 'DentiPlus',
      keyFeatures: [
        'Dua tingkat paket: Classic dan Platinum',
        'Batas tahunan keseluruhan: Classic hingga S$1.000; Platinum hingga S$1.500',
        'Cakupan lebih tinggi di Penyedia Terkontrak (penagihan langsung tersedia)',
        'Perawatan preventif gigi: pemeriksaan, pembersihan, fluorida (satu kunjungan per Tahun Polis)',
        'Radiologi gigi: bitewing, survei tengkorak/wajah, atau x-ray panoramik (batas per Tahun Polis)',
        'Perawatan konservatif: tambal amalgan/komposit permanen dan glass ionomer',
        'Pencabutan (non-bedah): sederhana dan rumit',
        'Endodontik: perawatan saluran akar dan pulpotomi terapeutik (tanpa restorasi akhir)',
        'Darurat gigi: ditanggung; selama masa tunggu diganti-biayakan',
        'Free look 14 hari kerja; pembaruan otomatis tahunan; premi bulanan atau tahunan',
      ],
      featureHighlight: {
        title: 'Perlindungan Gigi Fleksibel dengan Manfaat Jaringan',
        description:
          'DentiPlus menyediakan perlindungan gigi yang praktis dan terjangkau dengan dua tingkat. Nikmati cakupan lebih tinggi dan penagihan langsung di Penyedia Terkontrak, batas tahunan hingga S$1.500, serta penggantian biaya yang sederhana untuk layanan di luar jaringan.',
      },
      evaluationFocus: [
        'Pemilihan tingkat (Classic vs Platinum) berdasarkan penggunaan gigi yang diperkirakan dan anggaran',
        'Dalam jaringan (Penyedia Terkontrak) vs luar jaringan: perbedaan cakupan dan proses',
        'Batas tahunan keseluruhan dan batas kunjungan/x-ray per Tahun Polis',
        'Kelayakan (usia 18 hingga di bawah 60 saat mulai) dan ketentuan penghentian',
        'Pengecualian utama termasuk perawatan kosmetik/estetika dan kondisi pra-eksisting',
        'Alur klaim: pra-notifikasi untuk non-darurat, penagihan langsung dalam jaringan, kuitansi untuk luar jaringan',
        'Pembaruan, free look, dan frekuensi pembayaran premi (bulanan vs tahunan)',
      ],
      callCriteria: {
        title: 'Kartu Skor Posisi Produk',
        description:
          'Untuk mendapatkan hasil terbaik dalam sesi ini, usahakan memenuhi semua kriteria evaluasi utama:',
        criteria: [],
        markdown: `**1. Teknik Penjualan (3F):**\n
Gunakan kerangka kerja 3F (Feel → Felt → Found) untuk mendengarkan, berempati, dan menawarkan solusi yang disesuaikan.\n\n
**2. Pengetahuan Produk:**\n
- **Presentasi Produk:** Sajikan informasi produk yang akurat dan ringkas yang menghubungkan fitur langsung dengan hasil pelanggan.\n
- **Diferensiasi Pesaing:** Bedakan solusi dengan menyoroti nilai unik dan keunggulan konkret dibanding pesaing.`,
      },
    },

    // Malaysian
    ms: {
      name: 'DentiPlus',
      keyFeatures: [
        'Dua peringkat pelan: Classic dan Platinum',
        'Had tahunan keseluruhan: Classic sehingga S$1,000; Platinum sehingga S$1,500',
        'Perlindungan lebih tinggi di Penyedia Berkontrak (pengebilan langsung tersedia)',
        'Penjagaan pencegahan gigi: pemeriksaan, pembersihan, fluorida (satu lawatan setiap Tahun Polisi)',
        'Radiologi gigi: bitewing, tinjauan tengkorak/wajah, atau x-ray panoramik (had per Tahun Polisi)',
        'Rawatan konservatif: tampalan amalgan/komposit kekal dan glass ionomer',
        'Pencabutan (bukan pembedahan): mudah dan rumit',
        'Endodontik: rawatan saluran akar dan pulpotomi terapeutik (tidak termasuk restorasi akhir)',
        'Kecemasan gigi: dilindungi; semasa tempoh menunggu dibayar balik',
        'Tempoh lihat percuma 14 hari bekerja; pembaharuan automatik tahunan; premium bulanan atau tahunan',
      ],
      featureHighlight: {
        title: 'Perlindungan Gigi Fleksibel dengan Manfaat Rangkaian',
        description:
          'DentiPlus menawarkan perlindungan gigi yang praktikal dan mampu milik dengan dua peringkat. Nikmati perlindungan lebih tinggi dan pengebilan langsung di Penyedia Berkontrak, had tahunan sehingga S$1,500, serta proses bayaran balik yang mudah untuk luar rangkaian.',
      },
      evaluationFocus: [
        'Pemilihan peringkat (Classic vs Platinum) berdasarkan penggunaan gigi yang dijangka dan bajet',
        'Dalam rangkaian (Penyedia Berkontrak) vs luar rangkaian: perbezaan perlindungan dan proses',
        'Had tahunan keseluruhan dan had lawatan/x-ray setiap Tahun Polisi',
        'Kelayakan (umur 18 hingga bawah 60 pada permulaan) dan syarat penamatan',
        'Pengecualian utama termasuk rawatan kosmetik/estetik dan keadaan sedia ada',
        'Aliran tuntutan: pra-pemakluman untuk bukan kecemasan, pengebilan langsung dalam rangkaian, resit untuk luar rangkaian',
        'Pembaharuan, tempoh lihat percuma, dan kekerapan pembayaran premium (bulanan vs tahunan)',
      ],
      callCriteria: {
        title: 'Kad Skor Kedudukan Produk',
        description:
          'Untuk mendapat hasil terbaik dalam sesi ini, usahakan memenuhi semua kriteria penilaian utama:',
        criteria: [],
        markdown: `**1. Teknik Jualan (3F):**\n
Gunakan rangka kerja 3F (Feel → Felt → Found) untuk mendengar, berempati, dan menawarkan penyelesaian yang disesuaikan.\n\n
**2. Pengetahuan Produk:**\n
- **Pembentangan Produk:** Sampaikan maklumat produk yang tepat dan ringkas yang menghubungkan ciri terus kepada hasil pelanggan.\n
- **Pembezaan Pesaing:** Bezakan penyelesaian dengan menonjolkan nilai unik dan kelebihan konkrit berbanding pesaing.`,
      },
    },

    // Cebuano
    ceb: {
      name: 'DentiPlus',
      keyFeatures: [
        'Duha ka plan tiers: Classic ug Platinum',
        'Overall annual limit: Classic hangtod S$1,000; Platinum hangtod S$1,500',
        'Mas taas nga coverage sa Contracted Providers (direct billing available)',
        'Preventive dental: check-up, cleaning, fluoride (usa ka bisita matag Policy Year)',
        'Dental radiology: bitewing, skull/facial survey, o panoramic x-ray (per Policy Year limits)',
        'Conservative treatments: permanent amalgam/composite ug glass ionomer fillings',
        'Extractions (non-surgical): simple ug complicated',
        'Endodontics: root canal ug therapeutic pulpotomy (wala apil ang final restoration)',
        'Emergency dental: covered; panahon sa waiting period gi-handle sa reimbursement basis',
        '90-day waiting period para sa non-emergency services; pre-existing conditions excluded',
        '14-business-day free look; automatic yearly renewal; monthly o annual premiums',
      ],
      featureHighlight: {
        title: 'Flexible Dental Coverage With Network Benefits',
        description:
          'Ang DentiPlus naghatag ug practical, affordable dental coverage tabok sa essential categories nga may duha ka tiers. Makatagamtam ug mas taas nga coverage ug direct billing sa Contracted Providers, overall annual limits hangtod S$1,500, ug simple reimbursement para sa out-of-network care.',
      },
      evaluationFocus: [
        'Tier selection (Classic vs Platinum) base sa expected dental usage ug budget',
        'In-network (Contracted Providers) vs out-of-network coverage differences ug process',
        'Annual overall limit ug per-policy-year visit/x-ray limits',
        'Waiting period (90 days) ug unsaon pag-handle sa emergency dental',
        'Eligibility (edad 18 hangtod ubos sa 60 sa start) ug termination conditions',
        'Key exclusions lakip ang cosmetic/aesthetic treatments ug pre-existing conditions',
        'Claims flow: pre-notification para sa non-emergency, direct billing in-network, receipts para sa out-of-network',
        'Renewal, free look, ug premium payment frequency (monthly vs annual)',
      ],
      callCriteria: {
        title: 'Product Positioning Scorecard',
        description:
          'Para makakuha sa pinakamataas nga resulta niining session, sikapa nga matuman ang tanan nga key evaluation criteria:',
        criteria: [],
        markdown: `**1. Sales Technique (3F):**\n
Gamita ang 3F framework (Feel → Felt → Found) para maminaw, mag-empathize, ug mag-offer ug tailored solution.\n\n
**2. Product Knowledge:**\n
- **Product Pitch:** Ipresent ang accurate, concise product information nga nag-tie sa features direkta sa customer outcomes.\n
- **Competitor Differentiation:** I-differentiate ang solution pinaagi sa pag-highlight sa unique value ug concrete advantages kaysa sa competitors.`,
      },
    },
  },
};
