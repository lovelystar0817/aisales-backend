import { ProductConfiguration } from './types.js';

/**
 * PRUWealth Plus (SGD) - SP - Single premium participating whole life
 * Wealth accumulation with comprehensive protection until age 130
 */
export const pruwealthPlusConfiguration: ProductConfiguration = {
  base: {
    id: 'pruwealth-plus',
    friendlyId: 'pruwealth-plus',
    category: 'insurance',
  },

  localized: {
    // English (Original)
    en: {
      name: 'PRUWealth Plus (SGD) - SP',
      keyFeatures: [
        'Single premium participating whole life insurance policy in Singapore Dollars',
        'Coverage until age 130 of original life assured',
        'Death benefit: 101% of premium or surrender value (105% for accidental death)',
        'Retrenchment benefit: 10% of single premium (first 5 years, once only)',
        'Reversionary bonus (non-guaranteed, becomes guaranteed when declared) added from year 2',
        'Performance bonus (non-guaranteed) paid at surrender, claim, or maturity',
        'Secondary life assured feature - policy continues on primary life assured death',
        'Change of life assured option after 2 years for wealth transfer',
        'Policy loans up to 70% of surrender value available',
        'Surgical and nursing loans (interest-free, up to 10% of premium or surrender value)',
        'Compatible with SRS funds (with specific restrictions)',
        'Four nomination/trust options available (49L, 49M, Juvenile, Educational)',
        'Maturity benefit based on face value percentage plus accumulated bonuses',
        '14-day free look period for full refund',
      ],
      featureHighlight: {
        title: 'Wealth Accumulation with Comprehensive Protection',
        description:
          'PRUWealth Plus (SGD) - SP is a single premium participating whole life policy that provides life insurance protection until age 130 with wealth accumulation through reversionary and performance bonuses. It offers unique flexibility through secondary life assured and change of life assured features for seamless wealth transfer, plus retrenchment protection of 10% single premium in the first 5 years. Compatible with SRS funds for retirement planning.',
      },
      evaluationFocus: [
        'Accuracy of PRUWealth Plus product information provided by salesperson',
        'Clear explanation of single premium participating whole life structure',
        'Understanding of maturity benefit, death benefit (regular and accidental), and retrenchment benefit',
        'Knowledge of reversionary bonus (guaranteed once declared) vs performance bonus (non-guaranteed)',
        'Critical distinction between face value (for bonus/maturity calculations) and sum assured (coverage amount)',
        'Understanding of secondary life assured feature (policy continues, no death benefit for primary)',
        'Knowledge of change of life assured (2-year waiting, unlimited changes, maturity date unchanged)',
        'Retrenchment benefit details (10% premium, first 5 years, 90-day waiting, specific eligibility)',
        'Death benefit calculations (101% regular, 105% accidental)',
        'Flexibility features (policy loans 70%, surgical/nursing loans interest-free)',
        'SRS compatibility with restrictions (no joint ownership, no secondary LA, no loans)',
        'Understanding of nomination vs secondary life assured mutual exclusivity',
        'Correct knowledge of critical timeframes (14-day free look, 90-day retrenchment waiting, 12-month exclusions)',
        'Awareness of accidental death exclusions and retrenchment exclusions',
        'Target market alignment (lump sum available, wealth accumulation, retrenchment protection)',
        'Distinguish between general improvement areas ("warning") and factual errors ("error")',
      ],
      callCriteria: {
        title: 'Prudential PRUWealth Plus Scorecard',
        description:
          'To get the best standing in this session, aim to meet all the key evaluation criteria:',
        criteria: [
          'Apply the 3F (Feel, Felt, Found) Framework',
          'Provide explanation of the product',
          'Demonstrate operational knowledge',
          'Handle objections',
        ],
      },
    },

    // Indonesian
    id: {
      name: 'PRUWealth Plus (SGD) - SP',
      keyFeatures: [
        'Polis asuransi jiwa seumur hidup partisipatif premi tunggal dalam Dollar Singapura',
        'Cakupan hingga usia 130 tahun dari life assured asli',
        'Manfaat kematian: 101% dari premi atau nilai surrender (105% untuk kematian akibat kecelakaan)',
        'Manfaat retrenchment: 10% dari premi tunggal (5 tahun pertama, satu kali saja)',
        'Bonus reversionary (tidak terjamin, menjadi terjamin saat dideklarasikan) ditambahkan dari tahun ke-2',
        'Bonus performa (tidak terjamin) dibayarkan saat surrender, klaim, atau jatuh tempo',
        'Fitur secondary life assured - polis berlanjut saat primary life assured meninggal',
        'Opsi penggantian life assured setelah 2 tahun untuk transfer kekayaan',
        'Pinjaman polis hingga 70% dari nilai surrender tersedia',
        'Pinjaman bedah dan perawatan (bebas bunga, hingga 10% premi atau nilai surrender)',
        'Kompatibel dengan dana SRS (dengan batasan tertentu)',
        'Empat opsi nominasi/trust tersedia (49L, 49M, Juvenile, Educational)',
        'Manfaat jatuh tempo berdasarkan persentase face value ditambah bonus terakumulasi',
        'Periode free look 14 hari untuk pengembalian dana penuh',
      ],
      featureHighlight: {
        title: 'Akumulasi Kekayaan dengan Perlindungan Komprehensif',
        description:
          'PRUWealth Plus (SGD) - SP adalah polis jiwa seumur hidup partisipatif premi tunggal yang memberikan perlindungan asuransi jiwa hingga usia 130 tahun dengan akumulasi kekayaan melalui bonus reversionary dan performa. Menawarkan fleksibilitas unik melalui fitur secondary life assured dan penggantian life assured untuk transfer kekayaan yang mulus, ditambah perlindungan retrenchment sebesar 10% premi tunggal dalam 5 tahun pertama. Kompatibel dengan dana SRS untuk perencanaan pensiun.',
      },
      evaluationFocus: [
        'Akurasi informasi produk PRUWealth Plus yang diberikan oleh salesperson',
        'Penjelasan yang jelas tentang struktur polis jiwa seumur hidup partisipatif premi tunggal',
        'Pemahaman tentang manfaat jatuh tempo, manfaat kematian (reguler dan akibat kecelakaan), dan manfaat retrenchment',
        'Pengetahuan tentang bonus reversionary (terjamin setelah dideklarasikan) vs bonus performa (tidak terjamin)',
        'Perbedaan kritis antara face value (untuk perhitungan bonus/jatuh tempo) dan sum assured (jumlah cakupan)',
        'Pemahaman fitur secondary life assured (polis berlanjut, tidak ada manfaat kematian untuk primary)',
        'Pengetahuan tentang penggantian life assured (masa tunggu 2 tahun, perubahan tidak terbatas, tanggal jatuh tempo tidak berubah)',
        'Detail manfaat retrenchment (10% premi, 5 tahun pertama, masa tunggu 90 hari, kelayakan spesifik)',
        'Perhitungan manfaat kematian (101% reguler, 105% akibat kecelakaan)',
        'Fitur fleksibilitas (pinjaman polis 70%, pinjaman bedah/perawatan bebas bunga)',
        'Kompatibilitas SRS dengan batasan (tidak ada kepemilikan bersama, tidak ada secondary LA, tidak ada pinjaman)',
        'Pemahaman tentang nominasi vs secondary life assured yang saling eksklusif',
        'Pengetahuan yang benar tentang jangka waktu kritis (free look 14 hari, masa tunggu retrenchment 90 hari, pengecualian 12 bulan)',
        'Kesadaran tentang pengecualian kematian akibat kecelakaan dan pengecualian retrenchment',
        'Kesesuaian pasar target (lump sum tersedia, akumulasi kekayaan, perlindungan retrenchment)',
        'Membedakan antara area peningkatan umum ("peringatan") dan kesalahan faktual ("error")',
      ],
      callCriteria: {
        title: 'Kartu Skor Prudential PRUWealth Plus',
        description:
          'Untuk mendapatkan posisi terbaik dalam sesi ini, usahakan memenuhi semua kriteria evaluasi utama:',
        criteria: [
          'Terapkan Kerangka 3F (Feel, Felt, Found)',
          'Berikan penjelasan tentang produk',
          'Tunjukkan pengetahuan operasional',
          'Tangani keberatan',
        ],
      },
    },

    // Malaysian
    ms: {
      name: 'PRUWealth Plus (SGD) - SP',
      keyFeatures: [
        'Polisi insurans hayat seumur hidup penyertaan premium tunggal dalam Dolar Singapura',
        'Perlindungan hingga umur 130 tahun dari life assured asal',
        'Manfaat kematian: 101% daripada premium atau nilai serahan (105% untuk kematian akibat kemalangan)',
        'Manfaat pemberhentian kerja: 10% daripada premium tunggal (5 tahun pertama, sekali sahaja)',
        'Bonus reversionary (tidak terjamin, menjadi terjamin apabila diisytiharkan) ditambah dari tahun ke-2',
        'Bonus prestasi (tidak terjamin) dibayar semasa serahan, tuntutan, atau matang',
        'Ciri secondary life assured - polisi berterusan apabila primary life assured meninggal',
        'Pilihan penukaran life assured selepas 2 tahun untuk pemindahan kekayaan',
        'Pinjaman polisi sehingga 70% daripada nilai serahan tersedia',
        'Pinjaman pembedahan dan penjagaan (bebas faedah, sehingga 10% premium atau nilai serahan)',
        'Serasi dengan dana SRS (dengan sekatan khusus)',
        'Empat pilihan nominasi/amanah tersedia (49L, 49M, Juvenile, Educational)',
        'Manfaat matang berdasarkan peratusan face value ditambah bonus terkumpul',
        'Tempoh free look 14 hari untuk bayaran balik penuh',
      ],
      featureHighlight: {
        title: 'Pengumpulan Kekayaan dengan Perlindungan Komprehensif',
        description:
          'PRUWealth Plus (SGD) - SP adalah polisi hayat seumur hidup penyertaan premium tunggal yang memberikan perlindungan insurans hayat hingga umur 130 tahun dengan pengumpulan kekayaan melalui bonus reversionary dan prestasi. Menawarkan fleksibiliti unik melalui ciri secondary life assured dan penukaran life assured untuk pemindahan kekayaan yang lancar, ditambah perlindungan pemberhentian kerja sebanyak 10% premium tunggal dalam 5 tahun pertama. Serasi dengan dana SRS untuk perancangan persaraan.',
      },
      evaluationFocus: [
        'Ketepatan maklumat produk PRUWealth Plus yang diberikan oleh jurujual',
        'Penjelasan yang jelas tentang struktur polisi hayat seumur hidup penyertaan premium tunggal',
        'Pemahaman tentang manfaat matang, manfaat kematian (biasa dan akibat kemalangan), dan manfaat pemberhentian kerja',
        'Pengetahuan tentang bonus reversionary (terjamin setelah diisytiharkan) vs bonus prestasi (tidak terjamin)',
        'Perbezaan kritikal antara face value (untuk pengiraan bonus/matang) dan sum assured (jumlah perlindungan)',
        'Pemahaman ciri secondary life assured (polisi berterusan, tiada manfaat kematian untuk primary)',
        'Pengetahuan tentang penukaran life assured (tempoh menunggu 2 tahun, perubahan tidak terhad, tarikh matang tidak berubah)',
        'Butiran manfaat pemberhentian kerja (10% premium, 5 tahun pertama, masa tunggu 90 hari, kelayakan khusus)',
        'Pengiraan manfaat kematian (101% biasa, 105% akibat kemalangan)',
        'Ciri fleksibiliti (pinjaman polisi 70%, pinjaman pembedahan/penjagaan bebas faedah)',
        'Keserasian SRS dengan sekatan (tiada pemilikan bersama, tiada secondary LA, tiada pinjaman)',
        'Pemahaman tentang nominasi vs secondary life assured yang saling eksklusif',
        'Pengetahuan yang betul tentang jangka masa kritikal (free look 14 hari, masa tunggu pemberhentian 90 hari, pengecualian 12 bulan)',
        'Kesedaran tentang pengecualian kematian akibat kemalangan dan pengecualian pemberhentian kerja',
        'Penjajaran pasaran sasaran (lump sum tersedia, pengumpulan kekayaan, perlindungan pemberhentian kerja)',
        'Membezakan antara kawasan penambahbaikan umum ("amaran") dan kesilapan fakta ("ralat")',
      ],
      callCriteria: {
        title: 'Kad Skor Prudential PRUWealth Plus',
        description:
          'Untuk mendapat kedudukan terbaik dalam sesi ini, usahakan memenuhi semua kriteria penilaian utama:',
        criteria: [
          'Gunakan Kerangka 3F (Feel, Felt, Found)',
          'Berikan penjelasan tentang produk',
          'Tunjukkan pengetahuan operasi',
          'Kendalikan bantahan',
        ],
      },
    },

    // Tagalog (Filipino)
    tl: {
      name: 'PRUWealth Plus (SGD) - SP',
      keyFeatures: [
        'Single premium participating whole life insurance policy sa Singapore Dollar',
        'Coverage hanggang age 130 ng original life assured',
        'Death benefit: 101% ng premium o surrender value (105% para sa accidental death)',
        'Retrenchment benefit: 10% ng single premium (first 5 years, once only)',
        'Reversionary bonus (non-guaranteed, becomes guaranteed when declared) added from year 2',
        'Performance bonus (non-guaranteed) paid sa surrender, claim, o maturity',
        'Secondary life assured feature - policy continues sa primary life assured death',
        'Change of life assured option pagkatapos ng 2 years para sa wealth transfer',
        'Policy loans hanggang 70% ng surrender value available',
        'Surgical and nursing loans (interest-free, hanggang 10% ng premium o surrender value)',
        'Compatible sa SRS funds (with specific restrictions)',
        'Four nomination/trust options available (49L, 49M, Juvenile, Educational)',
        'Maturity benefit based sa face value percentage plus accumulated bonuses',
        '14-day free look period para sa full refund',
      ],
      featureHighlight: {
        title: 'Wealth Accumulation with Comprehensive Protection',
        description:
          'PRUWealth Plus (SGD) - SP ay single premium participating whole life policy na nagbibigay ng life insurance protection hanggang age 130 with wealth accumulation through reversionary and performance bonuses. Nag-aalok ng unique flexibility through secondary life assured at change of life assured features para sa seamless wealth transfer, plus retrenchment protection ng 10% single premium sa first 5 years. Compatible sa SRS funds para sa retirement planning.',
      },
      evaluationFocus: [
        'Accuracy ng PRUWealth Plus product information na binigay ng salesperson',
        'Clear explanation ng single premium participating whole life structure',
        'Understanding ng maturity benefit, death benefit (regular and accidental), at retrenchment benefit',
        'Knowledge ng reversionary bonus (guaranteed once declared) vs performance bonus (non-guaranteed)',
        'Critical distinction between face value (para sa bonus/maturity calculations) at sum assured (coverage amount)',
        'Understanding ng secondary life assured feature (policy continues, no death benefit for primary)',
        'Knowledge ng change of life assured (2-year waiting, unlimited changes, maturity date unchanged)',
        'Retrenchment benefit details (10% premium, first 5 years, 90-day waiting, specific eligibility)',
        'Death benefit calculations (101% regular, 105% accidental)',
        'Flexibility features (policy loans 70%, surgical/nursing loans interest-free)',
        'SRS compatibility with restrictions (no joint ownership, no secondary LA, no loans)',
        'Understanding ng nomination vs secondary life assured mutual exclusivity',
        'Correct knowledge ng critical timeframes (14-day free look, 90-day retrenchment waiting, 12-month exclusions)',
        'Awareness ng accidental death exclusions at retrenchment exclusions',
        'Target market alignment (lump sum available, wealth accumulation, retrenchment protection)',
        'Distinguish between general improvement areas ("warning") at factual errors ("error")',
      ],
      callCriteria: {
        title: 'Prudential PRUWealth Plus Scorecard',
        description:
          'Para makakuha ng pinakamataas na marka sa session na ito, sikaping matugunan ang lahat ng key evaluation criteria:',
        criteria: [
          'Gamitin ang 3F (Feel, Felt, Found) Framework',
          'Magbigay ng paliwanag tungkol sa produkto',
          'Ipakita ang operational knowledge',
          'Pamahalaan ang mga objections',
        ],
      },
    },

    // Thai
    th: {
      name: 'PRUWealth Plus (SGD) - SP',
      keyFeatures: [
        'กรมธรรม์ประกันชีวิตแบบมีส่วนร่วมตลอดชีพ เบี้ยประกันเดี่ยว ในสกุลเงินดอลลาร์สิงคโปร์',
        'ความคุ้มครองจนถึงอายุ 130 ปีของผู้เอาประกันชีวิตเดิม',
        'ผลประโยชน์กรณีเสียชีวิต: 101% ของเบี้ยประกันหรือมูลค่าเวนคืน (105% สำหรับการเสียชีวิตจากอุบัติเหตุ)',
        'ผลประโยชน์การถูกเลิกจ้าง: 10% ของเบี้ยประกันเดี่ยว (5 ปีแรก, ครั้งเดียวเท่านั้น)',
        'โบนัสรายปี (ไม่รับประกัน, กลายเป็นรับประกันเมื่อประกาศ) เพิ่มตั้งแต่ปีที่ 2',
        'โบนัสผลการดำเนินงาน (ไม่รับประกัน) จ่ายเมื่อเวนคืน, เคลม, หรือครบกำหนด',
        'คุณสมบัติผู้เอาประกันชีวิตรอง - กรมธรรม์ดำเนินต่อเมื่อผู้เอาประกันชีวิตหลักเสียชีวิต',
        'ตัวเลือกเปลี่ยนผู้เอาประกันชีวิตหลังจาก 2 ปีสำหรับการถ่ายโอนความมั่งคั่ง',
        'สินเชื่อกรมธรรม์สูงสุด 70% ของมูลค่าเวนคืนมีให้บริการ',
        'สินเชื่อผ่าตัดและการพยาบาล (ไม่มีดอกเบี้ย, สูงสุด 10% ของเบี้ยประกันหรือมูลค่าเวนคืน)',
        'เข้ากันได้กับกองทุน SRS (ด้วยข้อจำกัดเฉพาะ)',
        'มีตัวเลือกการเสนอชื่อ/ทรัสต์สี่แบบ (49L, 49M, Juvenile, Educational)',
        'ผลประโยชน์ครบกำหนดตามเปอร์เซ็นต์มูลค่าหน้าบวกโบนัสสะสม',
        'ระยะเวลา free look 14 วันสำหรับการคืนเงินเต็มจำนวน',
      ],
      featureHighlight: {
        title: 'การสะสมความมั่งคั่งพร้อมความคุ้มครองที่ครอบคลุม',
        description:
          'PRUWealth Plus (SGD) - SP เป็นกรมธรรม์ประกันชีวิตแบบมีส่วนร่วมตลอดชีพ เบี้ยประกันเดี่ยว ที่ให้ความคุ้มครองประกันชีวิตจนถึงอายุ 130 ปี พร้อมการสะสมความมั่งคั่งผ่านโบนัสรายปีและผลการดำเนินงาน เสนอความยืดหยุ่นที่ไม่เหมือนใครผ่านคุณสมบัติผู้เอาประกันชีวิตรองและการเปลี่ยนผู้เอาประกันชีวิตเพื่อการถ่ายโอนความมั่งคั่งที่ราบรื่น บวกกับความคุ้มครองการถูกเลิกจ้าง 10% ของเบี้ยประกันเดี่ยวใน 5 ปีแรก เข้ากันได้กับกองทุน SRS สำหรับการวางแผนเกษียณ',
      },
      evaluationFocus: [
        'ความถูกต้องของข้อมูลผลิตภัณฑ์ PRUWealth Plus ที่พนักงานขายให้',
        'การอธิบายที่ชัดเจนเกี่ยวกับโครงสร้างกรมธรรม์ประกันชีวิตแบบมีส่วนร่วมตลอดชีพ เบี้ยประกันเดี่ยว',
        'ความเข้าใจเกี่ยวกับผลประโยชน์ครบกำหนด, ผลประโยชน์กรณีเสียชีวิต (ปกติและจากอุบัติเหตุ), และผลประโยชน์การถูกเลิกจ้าง',
        'ความรู้เกี่ยวกับโบนัสรายปี (รับประกันเมื่อประกาศ) vs โบนัสผลการดำเนินงาน (ไม่รับประกัน)',
        'ความแตกต่างที่สำคัญระหว่างมูลค่าหน้า (สำหรับการคำนวณโบนัส/ครบกำหนด) และทุนประกัน (จำนวนความคุ้มครอง)',
        'ความเข้าใจเกี่ยวกับคุณสมบัติผู้เอาประกันชีวิตรอง (กรมธรรม์ดำเนินต่อ, ไม่มีผลประโยชน์กรณีเสียชีวิตสำหรับผู้หลัก)',
        'ความรู้เกี่ยวกับการเปลี่ยนผู้เอาประกันชีวิต (รอ 2 ปี, เปลี่ยนได้ไม่จำกัด, วันครบกำหนดไม่เปลี่ยน)',
        'รายละเอียดผลประโยชน์การถูกเลิกจ้าง (10% เบี้ยประกัน, 5 ปีแรก, รอ 90 วัน, คุณสมบัติเฉพาะ)',
        'การคำนวณผลประโยชน์กรณีเสียชีวิต (101% ปกติ, 105% อุบัติเหตุ)',
        'คุณสมบัติความยืดหยุ่น (สินเชื่อกรมธรรม์ 70%, สินเชื่อผ่าตัด/พยาบาลไม่มีดอกเบี้ย)',
        'ความเข้ากันได้กับ SRS ด้วยข้อจำกัด (ไม่มีกรรมสิทธิ์ร่วม, ไม่มี secondary LA, ไม่มีสินเชื่อ)',
        'ความเข้าใจเกี่ยวกับการเสนอชื่อ vs ผู้เอาประกันชีวิตรองที่ต่างกัน',
        'ความรู้ที่ถูกต้องเกี่ยวกับกรอบเวลาที่สำคัญ (free look 14 วัน, รอการถูกเลิกจ้าง 90 วัน, ข้อยกเว้น 12 เดือน)',
        'ความตระหนักเกี่ยวกับข้อยกเว้นการเสียชีวิตจากอุบัติเหตุและข้อยกเว้นการถูกเลิกจ้าง',
        'การจัดตำแหน่งตลาดเป้าหมาย (มีเงินก้อน, สะสมความมั่งคั่ง, ความคุ้มครองการถูกเลิกจ้าง)',
        'แยกแยะระหว่างพื้นที่ปรับปรุงทั่วไป ("คำเตือน") และข้อผิดพลาดเชิงข้อเท็จจริง ("ข้อผิดพลาด")',
      ],
      callCriteria: {
        title: 'บัตรคะแนน Prudential PRUWealth Plus',
        description:
          'เพื่อให้ได้คะแนนที่ดีที่สุดในเซสชันนี้ พยายามตอบสนองเกณฑ์การประเมินหลักทั้งหมด:',
        criteria: [
          'ใช้กรอบ 3F (Feel, Felt, Found)',
          'ให้คำอธิบายเกี่ยวกับผลิตภัณฑ์',
          'แสดงความรู้ด้านการปฏิบัติงาน',
          'จัดการกับข้อโต้แย้ง',
        ],
      },
    },

    // Cebuano
    ceb: {
      name: 'PRUWealth Plus (SGD) - SP',
      keyFeatures: [
        'Single premium participating whole life insurance policy sa Singapore Dollar',
        'Coverage hangtod age 130 sa original life assured',
        'Death benefit: 101% sa premium o surrender value (105% para sa accidental death)',
        'Retrenchment benefit: 10% sa single premium (first 5 years, once lang)',
        'Reversionary bonus (non-guaranteed, mahimong guaranteed when declared) added from year 2',
        'Performance bonus (non-guaranteed) paid sa surrender, claim, o maturity',
        'Secondary life assured feature - policy continues sa primary life assured death',
        'Change of life assured option human sa 2 years para sa wealth transfer',
        'Policy loans hangtod 70% sa surrender value available',
        'Surgical and nursing loans (interest-free, hangtod 10% sa premium o surrender value)',
        'Compatible sa SRS funds (with specific restrictions)',
        'Four nomination/trust options available (49L, 49M, Juvenile, Educational)',
        'Maturity benefit based sa face value percentage plus accumulated bonuses',
        '14-day free look period para sa full refund',
      ],
      featureHighlight: {
        title: 'Wealth Accumulation with Comprehensive Protection',
        description:
          'PRUWealth Plus (SGD) - SP kay single premium participating whole life policy nga naghatag ug life insurance protection hangtod age 130 with wealth accumulation through reversionary and performance bonuses. Nag-offer ug unique flexibility through secondary life assured ug change of life assured features para sa seamless wealth transfer, plus retrenchment protection nga 10% single premium sa first 5 years. Compatible sa SRS funds para sa retirement planning.',
      },
      evaluationFocus: [
        'Accuracy sa PRUWealth Plus product information nga gihatag sa salesperson',
        'Clear explanation sa single premium participating whole life structure',
        'Understanding sa maturity benefit, death benefit (regular and accidental), ug retrenchment benefit',
        'Knowledge sa reversionary bonus (guaranteed once declared) vs performance bonus (non-guaranteed)',
        'Critical distinction tali sa face value (para sa bonus/maturity calculations) ug sum assured (coverage amount)',
        'Understanding sa secondary life assured feature (policy continues, wala death benefit for primary)',
        'Knowledge sa change of life assured (2-year waiting, unlimited changes, maturity date unchanged)',
        'Retrenchment benefit details (10% premium, first 5 years, 90-day waiting, specific eligibility)',
        'Death benefit calculations (101% regular, 105% accidental)',
        'Flexibility features (policy loans 70%, surgical/nursing loans interest-free)',
        'SRS compatibility with restrictions (wala joint ownership, wala secondary LA, wala loans)',
        'Understanding sa nomination vs secondary life assured mutual exclusivity',
        'Correct knowledge sa critical timeframes (14-day free look, 90-day retrenchment waiting, 12-month exclusions)',
        'Awareness sa accidental death exclusions ug retrenchment exclusions',
        'Target market alignment (lump sum available, wealth accumulation, retrenchment protection)',
        'Distinguish between general improvement areas ("warning") ug factual errors ("error")',
      ],
      callCriteria: {
        title: 'Prudential PRUWealth Plus Scorecard',
        description:
          'Para makakuha sa pinakamataas nga standing niining session, sikapa nga matuman ang tanan nga key evaluation criteria:',
        criteria: [
          'Gamita ang 3F (Feel, Felt, Found) Framework',
          'Hatagi ug explanation bahin sa produkto',
          'Ipakita ang operational knowledge',
          'Handlea ang mga objections',
        ],
      },
    },

    // Vietnamese
    vi: {
      name: 'PRUWealth Plus (SGD) - SP',
      keyFeatures: [
        'Hợp đồng bảo hiểm nhân thọ trọn đời có tham gia phí một lần bằng Đô la Singapore',
        'Bảo hiểm đến tuổi 130 của người được bảo hiểm gốc',
        'Quyền lợi tử vong: 101% phí hoặc giá trị hoàn lại (105% cho tử vong do tai nạn)',
        'Quyền lợi mất việc làm: 10% phí một lần (5 năm đầu, chỉ một lần)',
        'Tiền thưởng hàng năm (không đảm bảo, trở thành đảm bảo khi được công bố) được thêm từ năm thứ 2',
        'Tiền thưởng hiệu suất (không đảm bảo) được trả khi hoàn lại, yêu cầu bồi thường, hoặc đáo hạn',
        'Tính năng người được bảo hiểm phụ - hợp đồng tiếp tục khi người được bảo hiểm chính qua đời',
        'Tùy chọn thay đổi người được bảo hiểm sau 2 năm để chuyển giao tài sản',
        'Cho vay từ hợp đồng lên đến 70% giá trị hoàn lại có sẵn',
        'Cho vay phẫu thuật và chăm sóc (không lãi suất, lên đến 10% phí hoặc giá trị hoàn lại)',
        'Tương thích với quỹ SRS (với các hạn chế cụ thể)',
        'Bốn tùy chọn đề cử/ủy thác có sẵn (49L, 49M, Juvenile, Educational)',
        'Quyền lợi đáo hạn dựa trên phần trăm mệnh giá cộng tiền thưởng tích lũy',
        'Thời gian xem xét miễn phí 14 ngày để hoàn tiền đầy đủ',
      ],
      featureHighlight: {
        title: 'Tích Lũy Tài Sản với Bảo Vệ Toàn Diện',
        description:
          'PRUWealth Plus (SGD) - SP là hợp đồng bảo hiểm nhân thọ trọn đời có tham gia phí một lần cung cấp bảo vệ bảo hiểm nhân thọ đến tuổi 130 với tích lũy tài sản thông qua tiền thưởng hàng năm và hiệu suất. Cung cấp sự linh hoạt độc đáo thông qua tính năng người được bảo hiểm phụ và thay đổi người được bảo hiểm để chuyển giao tài sản liền mạch, cộng với bảo vệ mất việc làm 10% phí một lần trong 5 năm đầu. Tương thích với quỹ SRS cho kế hoạch nghỉ hưu.',
      },
      evaluationFocus: [
        'Độ chính xác của thông tin sản phẩm PRUWealth Plus do nhân viên bán hàng cung cấp',
        'Giải thích rõ ràng về cấu trúc bảo hiểm nhân thọ trọn đời có tham gia phí một lần',
        'Hiểu biết về quyền lợi đáo hạn, quyền lợi tử vong (thông thường và tai nạn), và quyền lợi mất việc làm',
        'Kiến thức về tiền thưởng hàng năm (đảm bảo khi được công bố) vs tiền thưởng hiệu suất (không đảm bảo)',
        'Phân biệt quan trọng giữa mệnh giá (cho tính toán tiền thưởng/đáo hạn) và số tiền bảo hiểm (số tiền bảo vệ)',
        'Hiểu biết về tính năng người được bảo hiểm phụ (hợp đồng tiếp tục, không có quyền lợi tử vong cho người chính)',
        'Kiến thức về thay đổi người được bảo hiểm (chờ 2 năm, thay đổi không giới hạn, ngày đáo hạn không đổi)',
        'Chi tiết quyền lợi mất việc làm (10% phí, 5 năm đầu, chờ 90 ngày, điều kiện cụ thể)',
        'Tính toán quyền lợi tử vong (101% thông thường, 105% tai nạn)',
        'Tính năng linh hoạt (cho vay từ hợp đồng 70%, cho vay phẫu thuật/chăm sóc không lãi suất)',
        'Tương thích SRS với hạn chế (không sở hữu chung, không secondary LA, không cho vay)',
        'Hiểu biết về đề cử vs người được bảo hiểm phụ loại trừ lẫn nhau',
        'Kiến thức chính xác về khung thời gian quan trọng (xem xét miễn phí 14 ngày, chờ mất việc 90 ngày, loại trừ 12 tháng)',
        'Nhận thức về loại trừ tử vong do tai nạn và loại trừ mất việc làm',
        'Phù hợp thị trường mục tiêu (có số tiền lớn, tích lũy tài sản, bảo vệ mất việc)',
        'Phân biệt giữa các lĩnh vực cải thiện chung ("cảnh báo") và lỗi thực tế ("lỗi")',
      ],
      callCriteria: {
        title: 'Bảng Điểm Prudential PRUWealth Plus',
        description:
          'Để đạt được thứ hạng tốt nhất trong phiên này, hãy cố gắng đáp ứng tất cả các tiêu chí đánh giá chính:',
        criteria: [
          'Áp dụng Khung 3F (Feel, Felt, Found)',
          'Cung cấp giải thích về sản phẩm',
          'Thể hiện kiến thức vận hành',
          'Xử lý phản đối',
        ],
      },
    },
  },
};
