import { ProductConfiguration } from './types.js';

/**
 * Muang Thai Life Assurance - UL Plus Product
 * Universal Life insurance plan combining protection with investment flexibility
 */
export const muangThaiULPlusConfiguration: ProductConfiguration = {
  base: {
    id: 'mtl-ul-plus-sales',
    friendlyId: 'mtl-ul-plus-sales',
    category: 'insurance',
  },

  localized: {
    // English
    en: {
      name: 'Muang Thai UL Plus',
      keyFeatures: [
        'Flexible Premium Payments: Adjust premium amounts based on your financial situation',
        'Investment Fund Selection: Choose from multiple investment funds based on your risk tolerance',
        'Life Insurance Protection: Comprehensive life coverage for family security',
        'Partial Withdrawals: Access part of your investment value when needed',
        'Tax Benefits: Premiums may be eligible for personal income tax deductions',
        'Death Benefit: Guaranteed protection for beneficiaries',
        'Policy Loans: Borrow against your policy value if needed',
      ],
      featureHighlight: {
        title:
          'Flexible universal life insurance combining protection with investment growth',
        description:
          'Muang Thai UL Plus is a flexible universal life insurance plan that combines comprehensive life coverage with investment opportunities. Designed for individuals seeking both protection and wealth accumulation, this plan offers premium flexibility, fund selection options, and the potential for tax benefits. Premiums can be adjusted based on income levels, and you can select from multiple investment funds aligned with your financial goals.',
      },
      evaluationFocus: [
        '**Product Framing**: Ability to introduce UL Plus naturally and link it accurately to identified customer needs',
        '**Flexibility Communication**: Understanding and articulation of premium flexibility and fund selection options',
        '**Protection-Investment Balance**: Clear explanation of how UL Plus combines life protection with investment growth',
        '**Target Customer Fit**: Recognition of suitable customers (self-employed, variable income, education planning)',
        '**Needs Discovery**: Effective use of open-ended questions to understand customer priorities and financial goals',
        '**Objection Handling**: Addressing concerns about complexity, time commitment, and product understanding',
        '**Rapport Building**: Establishing comfort and trust quickly, relating to customer naturally',
      ],
      callCriteria: {
        title: 'MTL UL Plus Advisory Scorecard',
        description:
          'To get the best standing in this session, aim to meet all the key evaluation criteria:',
        criteria: [
          'Build rapport quickly and establish trust',
          'Discover customer needs through open-ended questions',
          'Introduce UL Plus naturally and link to identified needs',
          'Address objections clearly and secure appointment commitment',
        ],
      },
    },

    // Thai
    th: {
      name: 'เมืองไทย UL Plus',
      keyFeatures: [
        'การชำระเบี้ยประกันที่ยืดหยุ่น: ปรับจำนวนเบี้ยประกันตามสถานการณ์ทางการเงินของคุณ',
        'การเลือกกองทุนการลงทุน: เลือกจากกองทุนการลงทุนหลายกองทุนตามระดับความเสี่ยงของคุณ',
        'การคุ้มครองประกันชีวิต: การคุ้มครองชีวิตที่ครอบคลุมเพื่อความมั่นคงของครอบครัว',
        'การถอนบางส่วน: เข้าถึงส่วนหนึ่งของมูลค่าการลงทุนของคุณเมื่อจำเป็น',
        'ผลประโยชน์ทางภาษี: เบี้ยประกันอาจมีสิทธิ์หักลดหย่อนภาษีเงินได้บุคคลธรรมดา',
        'เงินชดเชยกรณีเสียชีวิต: การปกป้องที่รับประกันสำหรับผู้รับผลประโยชน์',
        'สินเชื่อกรมธรรม์: กู้ยืมเงินเทียบกับมูลค่ากรมธรรม์ของคุณหากจำเป็น',
      ],
      featureHighlight: {
        title:
          'ประกันชีวิตยูนิเวอร์แซลที่ยืดหยุ่นผสมผสานการคุ้มครองกับการเติบโตของการลงทุน',
        description:
          'เมืองไทย UL Plus เป็นแผนประกันชีวิตยูนิเวอร์แซลที่ยืดหยุ่น ซึ่งรวมการคุ้มครองชีวิตที่ครอบคลุมกับโอกาสการลงทุน ออกแบบมาสำหรับบุคคลที่แสวงหาทั้งการปกป้องและการสะสมทรัพย์สิน แผนนี้เสนอความยืดหยุ่นในเบี้ยประกัน ตัวเลือกการเลือกกองทุน และศักยภาพสำหรับผลประโยชน์ทางภาษี คุณสามารถปรับเบี้ยประกันตามระดับรายได้ และเลือกจากกองทุนการลงทุนหลายกองทุนที่สอดคล้องกับเป้าหมายทางการเงินของคุณ',
      },
      evaluationFocus: [
        '**การนำเสนอผลิตภัณฑ์**: ความสามารถในการแนะนำ UL Plus อย่างเป็นธรรมชาติและเชื่อมโยงอย่างแม่นยำกับความต้องการของลูกค้าที่ระบุ',
        '**การสื่อสารความยืดหยุ่น**: ความเข้าใจและการแสดงออกของความยืดหยุ่นของเบี้ยประกันและตัวเลือกการเลือกกองทุน',
        '**สมดุลการปกป้อง-การลงทุน**: คำอธิบายที่ชัดเจนว่าบาท Plus รวมการปกป้องชีวิตกับการเติบโตของการลงทุนอย่างไร',
        '**ความเหมาะสมของลูกค้าเป้าหมาย**: การรับรู้ลูกค้าที่เหมาะสม (ประกอบอาชีพอิสระ รายได้ผันแปร การวางแผนการศึกษา)',
        '**การค้นพบความต้องการ**: การใช้คำถามปลายเปิดอย่างมีประสิทธิภาพเพื่อเข้าใจลำดับความสำคัญและเป้าหมายทางการเงินของลูกค้า',
        '**การจัดการข้อโต้แย้ง**: การจัดการกับความกังวลเกี่ยวกับความซับซ้อน ความมุ่งมั่นด้านเวลา และความเข้าใจผลิตภัณฑ์',
        '**การสร้างสัมพันธ์**: สร้างความสบายใจและความไว้วางใจอย่างรวดเร็ว เชื่อมโยงกับลูกค้าอย่างเป็นธรรมชาติ',
      ],
      callCriteria: {
        title: 'บัตรคะแนนการให้คำปรึกษา MTL UL Plus',
        description:
          'เพื่อให้ได้ผลลัพธ์ที่ดีที่สุดในเซสชันนี้ ให้มุ่งมั่นตอบสนองเกณฑ์การประเมินหลักทั้งหมด:',
        criteria: [
          'สร้างสัมพันธ์อย่างรวดเร็วและสร้างความไว้วางใจ',
          'ค้นพบความต้องการของลูกค้าผ่านคำถามปลายเปิด',
          'แนะนำ UL Plus อย่างเป็นธรรมชาติและเชื่อมโยงกับความต้องการที่ระบุ',
          'จัดการกับข้อโต้แย้งอย่างชัดเจนและรักษาความมุ่งมั่นในการนัดหมาย',
        ],
      },
    },

    // Indonesian (for regional support)
    id: {
      name: 'Muang Thai UL Plus',
      keyFeatures: [
        'Pembayaran Premi Fleksibel: Sesuaikan jumlah premi berdasarkan situasi keuangan Anda',
        'Pemilihan Dana Investasi: Pilih dari beberapa dana investasi berdasarkan toleransi risiko Anda',
        'Perlindungan Asuransi Jiwa: Perlindungan jiwa komprehensif untuk keamanan keluarga',
        'Penarikan Sebagian: Akses sebagian dari nilai investasi Anda saat dibutuhkan',
        'Manfaat Pajak: Premi mungkin memenuhi syarat untuk pengurangan pajak penghasilan pribadi',
        'Manfaat Kematian: Perlindungan terjamin untuk penerima manfaat',
        'Pinjaman Polis: Pinjam terhadap nilai polis Anda jika diperlukan',
      ],
      featureHighlight: {
        title:
          'Asuransi jiwa universal fleksibel yang menggabungkan perlindungan dengan pertumbuhan investasi',
        description:
          'Muang Thai UL Plus adalah rencana asuransi jiwa universal fleksibel yang menggabungkan perlindungan jiwa komprehensif dengan peluang investasi. Dirancang untuk individu yang mencari perlindungan dan akumulasi kekayaan, rencana ini menawarkan fleksibilitas premi, opsi pemilihan dana, dan potensi manfaat pajak. Premi dapat disesuaikan berdasarkan tingkat pendapatan, dan Anda dapat memilih dari beberapa dana investasi yang selaras dengan tujuan keuangan Anda.',
      },
      evaluationFocus: [
        '**Pembingkaian Produk**: Kemampuan memperkenalkan UL Plus secara alami dan menghubungkannya secara akurat dengan kebutuhan pelanggan yang diidentifikasi',
        '**Komunikasi Fleksibilitas**: Pemahaman dan artikulasi fleksibilitas premi dan opsi pemilihan dana',
        '**Keseimbangan Perlindungan-Investasi**: Penjelasan jelas tentang bagaimana UL Plus menggabungkan perlindungan jiwa dengan pertumbuhan investasi',
        '**Kesesuaian Pelanggan Target**: Pengenalan pelanggan yang sesuai (wiraswasta, pendapatan variabel, perencanaan pendidikan)',
        '**Penemuan Kebutuhan**: Penggunaan pertanyaan terbuka yang efektif untuk memahami prioritas dan tujuan keuangan pelanggan',
        '**Penanganan Keberatan**: Menangani kekhawatiran tentang kompleksitas, komitmen waktu, dan pemahaman produk',
        '**Membangun Hubungan**: Membangun kenyamanan dan kepercayaan dengan cepat, berhubungan dengan pelanggan secara alami',
      ],
      callCriteria: {
        title: 'Kartu Skor Penasihat MTL UL Plus',
        description:
          'Untuk mendapatkan posisi terbaik dalam sesi ini, usahakan memenuhi semua kriteria evaluasi utama:',
        criteria: [
          'Bangun hubungan dengan cepat dan bangun kepercayaan',
          'Temukan kebutuhan pelanggan melalui pertanyaan terbuka',
          'Perkenalkan UL Plus secara alami dan hubungkan dengan kebutuhan yang diidentifikasi',
          'Tangani keberatan dengan jelas dan amankan komitmen janji temu',
        ],
      },
    },

    // Malay (for regional support)
    ms: {
      name: 'Muang Thai UL Plus',
      keyFeatures: [
        'Pembayaran Premium Fleksibel: Laraskan jumlah premium berdasarkan situasi kewangan anda',
        'Pemilihan Dana Pelaburan: Pilih daripada pelbagai dana pelaburan berdasarkan toleransi risiko anda',
        'Perlindungan Insurans Hayat: Perlindungan hayat menyeluruh untuk keselamatan keluarga',
        'Pengeluaran Separa: Akses sebahagian daripada nilai pelaburan anda apabila diperlukan',
        'Manfaat Cukai: Premium mungkin layak untuk potongan cukai pendapatan peribadi',
        'Manfaat Kematian: Perlindungan terjamin untuk benefisiari',
        'Pinjaman Polisi: Pinjam terhadap nilai polisi anda jika diperlukan',
      ],
      featureHighlight: {
        title:
          'Insurans hayat universal fleksibel yang menggabungkan perlindungan dengan pertumbuhan pelaburan',
        description:
          'Muang Thai UL Plus adalah pelan insurans hayat universal fleksibel yang menggabungkan perlindungan hayat menyeluruh dengan peluang pelaburan. Direka untuk individu yang mencari perlindungan dan pengumpulan kekayaan, pelan ini menawarkan fleksibiliti premium, pilihan pemilihan dana, dan potensi manfaat cukai. Premium boleh disesuaikan berdasarkan tahap pendapatan, dan anda boleh memilih daripada pelbagai dana pelaburan yang sejajar dengan matlamat kewangan anda.',
      },
      evaluationFocus: [
        '**Pembingkaian Produk**: Keupayaan memperkenalkan UL Plus secara semula jadi dan menghubungkannya dengan tepat dengan keperluan pelanggan yang dikenal pasti',
        '**Komunikasi Fleksibiliti**: Pemahaman dan artikulasi fleksibiliti premium dan pilihan pemilihan dana',
        '**Keseimbangan Perlindungan-Pelaburan**: Penjelasan jelas tentang bagaimana UL Plus menggabungkan perlindungan hayat dengan pertumbuhan pelaburan',
        '**Kesesuaian Pelanggan Target**: Pengenalan pelanggan yang sesuai (bekerja sendiri, pendapatan berubah-ubah, perancangan pendidikan)',
        '**Penemuan Keperluan**: Penggunaan soalan terbuka yang berkesan untuk memahami keutamaan dan matlamat kewangan pelanggan',
        '**Pengendalian Bantahan**: Menangani kebimbangan tentang kerumitan, komitmen masa, dan pemahaman produk',
        '**Membina Hubungan**: Membina keselesaan dan kepercayaan dengan cepat, berhubung dengan pelanggan secara semula jadi',
      ],
      callCriteria: {
        title: 'Kad Skor Penasihat MTL UL Plus',
        description:
          'Untuk mendapat kedudukan terbaik dalam sesi ini, usahakan memenuhi semua kriteria penilaian utama:',
        criteria: [
          'Bina hubungan dengan cepat dan bina kepercayaan',
          'Temui keperluan pelanggan melalui soalan terbuka',
          'Perkenalkan UL Plus secara semula jadi dan kaitkan dengan keperluan yang dikenal pasti',
          'Tangani bantahan dengan jelas dan pastikan komitmen temu janji',
        ],
      },
    },
  },
};
