import { ProductConfiguration } from './types.js';

/**
 * PRULifetime Income Plus (RP) - Lifetime income solution
 * Monthly lifetime income starting from year 4
 */
export const prulifetimeIncomePlusConfiguration: ProductConfiguration = {
  base: {
    id: 'prulifetime-income-plus',
    friendlyId: 'prulifetime-income-plus',
    category: 'insurance',
  },

  localized: {
    // English (Original)
    en: {
      name: 'PRULifetime Income Plus (RP)',
      keyFeatures: [
        'Regular premium participating whole life plan in Singapore Dollar denomination',
        'Premium payment term choices: 4 or 10 years only',
        'Monthly Cash Benefits starting from policy month 49 (guaranteed 0.864% + non-guaranteed 2.004% per annum of Face Value)',
        'Guaranteed Issue (GIO) - no medical underwriting required for basic plan',
        'Death benefit: 101% of total premiums paid or surrender value (105% for accidental death)',
        'Disability Waiver Benefit up to age 70',
        'Retrenchment Benefit (50% of annual premium for 4-year term, 100% for 10-year term)',
        'Replacement of Life Assured option for wealth transfer',
        'Policy loans, surgical & care loans available',
        'Lifetime coverage (matures at age 110 of original life assured if life assured is replaced)',
      ],
      featureHighlight: {
        title: 'Monthly Lifetime Income Starting from Year 4',
        description:
          'Provides guaranteed monthly cash benefits of 0.864% per annum plus non-guaranteed 2.004% per annum of Face Value, commencing from policy month 49. Face Value equals Annual Premium multiplied by Premium Payment Term (minimum Face Value: S$45,000 for 4-year term, S$23,000 for 10-year term).',
      },
      evaluationFocus: [
        'Accuracy of PRULifetime Income Plus product information provided by salesperson',
        'Correct explanation of monthly cash benefit structure (guaranteed vs non-guaranteed components)',
        'Accurate premium payment terms (4 or 10 years only)',
        'Proper explanation of Guaranteed Issue (GIO) scope and limitations',
        'Correct timing of benefits (monthly cash benefits start from month 49)',
        'Accurate death benefit calculations and accidental death provisions',
        'Proper explanation of surrender value timeline differences between 4-year and 10-year terms',
        'Understanding of target customer profile and suitability',
        'Knowledge of unique features like Disability Waiver Benefit and Retrenchment Benefit',
        'Distinguish between general improvement areas ("warning") and factual errors ("error")',
      ],
      callCriteria: {
        title: 'Prudential PRULifetime Income Plus Scorecard',
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
      name: 'PRULifetime Income Plus (RP)',
      keyFeatures: [
        'Paket asuransi jiwa seumur hidup partisipatif premi reguler dalam denominasi Dollar Singapura',
        'Pilihan jangka waktu pembayaran premi: 4 atau 10 tahun saja',
        'Manfaat Tunai Bulanan dimulai dari bulan ke-49 polis (terjamin 0.864% + tidak terjamin 2.004% per tahun dari Face Value)',
        'Penerbitan Terjamin (GIO) - tidak diperlukan underwriting medis untuk paket dasar',
        'Manfaat kematian: 101% dari total premi yang dibayar atau nilai surrender (105% untuk kematian akibat kecelakaan)',
        'Manfaat Waiver Disabilitas hingga usia 70 tahun',
        'Manfaat Retrenchment (50% dari premi tahunan untuk jangka 4 tahun, 100% untuk jangka 10 tahun)',
        'Opsi Pergantian Life Assured untuk transfer kekayaan',
        'Pinjaman polis, pinjaman bedah & perawatan tersedia',
        'Cakupan seumur hidup (jatuh tempo pada usia 110 tahun life assured asli jika life assured diganti)',
      ],
      featureHighlight: {
        title: 'Pendapatan Bulanan Seumur Hidup Dimulai dari Tahun ke-4',
        description:
          'Memberikan manfaat tunai bulanan terjamin sebesar 0.864% per tahun plus tidak terjamin 2.004% per tahun dari Face Value, dimulai dari bulan ke-49 polis. Face Value sama dengan Premi Tahunan dikalikan Jangka Waktu Pembayaran Premi (Face Value minimum: S$45.000 untuk jangka 4 tahun, S$23.000 untuk jangka 10 tahun).',
      },
      evaluationFocus: [
        'Akurasi informasi produk PRULifetime Income Plus yang diberikan oleh salesperson',
        'Penjelasan yang benar tentang struktur manfaat tunai bulanan (komponen terjamin vs tidak terjamin)',
        'Jangka waktu pembayaran premi yang akurat (4 atau 10 tahun saja)',
        'Penjelasan yang tepat tentang ruang lingkup dan keterbatasan Penerbitan Terjamin (GIO)',
        'Timing manfaat yang benar (manfaat tunai bulanan dimulai dari bulan ke-49)',
        'Perhitungan manfaat kematian yang akurat dan ketentuan kematian akibat kecelakaan',
        'Penjelasan yang tepat tentang perbedaan timeline nilai surrender antara jangka 4 tahun dan 10 tahun',
        'Pemahaman profil target customer dan kesesuaian',
        'Pengetahuan tentang fitur unik seperti Manfaat Waiver Disabilitas dan Manfaat Retrenchment',
        'Membedakan antara area peningkatan umum ("peringatan") dan kesalahan faktual ("error")',
      ],
      callCriteria: {
        title: 'Kartu Skor Prudential PRULifetime Income Plus',
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
      name: 'PRULifetime Income Plus (RP)',
      keyFeatures: [
        'Paket insurans hayat seumur hidup penyertaan premium tetap dalam denominasi Dolar Singapura',
        'Pilihan tempoh pembayaran premium: 4 atau 10 tahun sahaja',
        'Manfaat Tunai Bulanan bermula dari bulan ke-49 polisi (terjamin 0.864% + tidak terjamin 2.004% setahun dari Face Value)',
        'Pengeluaran Terjamin (GIO) - tiada keperluan pengunderaitan perubatan untuk pelan asas',
        'Manfaat kematian: 101% dari jumlah premium dibayar atau nilai serahan (105% untuk kematian akibat kemalangan)',
        'Manfaat Penepian Kecacatan hingga umur 70 tahun',
        'Manfaat Pemberhentian Kerja (50% premium tahunan untuk tempoh 4 tahun, 100% untuk tempoh 10 tahun)',
        'Pilihan Pertukaran Life Assured untuk pemindahan kekayaan',
        'Pinjaman polisi, pinjaman pembedahan & penjagaan tersedia',
        'Liputan seumur hidup (matang pada umur 110 tahun life assured asal jika life assured ditukar)',
      ],
      featureHighlight: {
        title: 'Pendapatan Bulanan Seumur Hidup Bermula dari Tahun ke-4',
        description:
          'Menyediakan manfaat tunai bulanan terjamin sebanyak 0.864% setahun plus tidak terjamin 2.004% setahun dari Face Value, bermula dari bulan ke-49 polisi. Face Value sama dengan Premium Tahunan didarab Tempoh Pembayaran Premium (Face Value minimum: S$45,000 untuk tempoh 4 tahun, S$23,000 untuk tempoh 10 tahun).',
      },
      evaluationFocus: [
        'Ketepatan maklumat produk PRULifetime Income Plus yang diberikan oleh jurujual',
        'Penjelasan yang betul tentang struktur manfaat tunai bulanan (komponen terjamin vs tidak terjamin)',
        'Tempoh pembayaran premium yang tepat (4 atau 10 tahun sahaja)',
        'Penjelasan yang betul tentang skop dan batasan Pengeluaran Terjamin (GIO)',
        'Masa manfaat yang betul (manfaat tunai bulanan bermula dari bulan ke-49)',
        'Pengiraan manfaat kematian yang tepat dan peruntukan kematian akibat kemalangan',
        'Penjelasan yang betul tentang perbezaan timeline nilai serahan antara tempoh 4 tahun dan 10 tahun',
        'Pemahaman profil pelanggan sasaran dan kesesuaian',
        'Pengetahuan tentang ciri unik seperti Manfaat Penepian Kecacatan dan Manfaat Pemberhentian Kerja',
        'Membezakan antara kawasan penambahbaikan umum ("amaran") dan kesilapan fakta ("ralat")',
      ],
      callCriteria: {
        title: 'Kad Skor Prudential PRULifetime Income Plus',
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
      name: 'PRULifetime Income Plus (RP)',
      keyFeatures: [
        'Regular premium participating whole life plan sa Singapore Dollar denomination',
        'Premium payment term choices: 4 o 10 years lang',
        'Monthly Cash Benefits nagsisimula from policy month 49 (guaranteed 0.864% + non-guaranteed 2.004% per annum ng Face Value)',
        'Guaranteed Issue (GIO) - walang medical underwriting required para sa basic plan',
        'Death benefit: 101% ng total premiums paid o surrender value (105% para sa accidental death)',
        'Disability Waiver Benefit hanggang age 70',
        'Retrenchment Benefit (50% ng annual premium para sa 4-year term, 100% para sa 10-year term)',
        'Replacement of Life Assured option para sa wealth transfer',
        'Policy loans, surgical & care loans available',
        'Lifetime coverage (matures sa age 110 ng original life assured kung life assured ay na-replace)',
      ],
      featureHighlight: {
        title: 'Monthly Lifetime Income Starting from Year 4',
        description:
          'Nagbibigay ng guaranteed monthly cash benefits ng 0.864% per annum plus non-guaranteed 2.004% per annum ng Face Value, nagsisimula from policy month 49. Face Value ay katumbas ng Annual Premium na multiply sa Premium Payment Term (minimum Face Value: S$45,000 para sa 4-year term, S$23,000 para sa 10-year term).',
      },
      evaluationFocus: [
        'Accuracy ng PRULifetime Income Plus product information na binigay ng salesperson',
        'Correct explanation ng monthly cash benefit structure (guaranteed vs non-guaranteed components)',
        'Accurate premium payment terms (4 o 10 years lang)',
        'Proper explanation ng Guaranteed Issue (GIO) scope at limitations',
        'Correct timing ng benefits (monthly cash benefits start from month 49)',
        'Accurate death benefit calculations at accidental death provisions',
        'Proper explanation ng surrender value timeline differences between 4-year at 10-year terms',
        'Understanding ng target customer profile at suitability',
        'Knowledge ng unique features tulad ng Disability Waiver Benefit at Retrenchment Benefit',
        'Distinguish between general improvement areas ("warning") at factual errors ("error")',
      ],
      callCriteria: {
        title: 'Prudential PRULifetime Income Plus Scorecard',
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
      name: 'PRULifetime Income Plus (RP)',
      keyFeatures: [
        'แผนประกันชีวิตแบบมีส่วนร่วมตลอดชีพ เบี้ยประกันปกติ ในสกุลเงินดอลลาร์สิงคโปร์',
        'ตัวเลือกระยะเวลาชำระเบี้ยประกัน: 4 หรือ 10 ปีเท่านั้น',
        'ผลประโยชน์เงินสดรายเดือนเริ่มตั้งแต่เดือนที่ 49 ของกรมธรรม์ (รับประกัน 0.864% + ไม่รับประกัน 2.004% ต่อปีของมูลค่าหน้า)',
        'การออกกรมธรรม์แบบรับประกัน (GIO) - ไม่ต้องมีการตรวจสอบทางการแพทย์สำหรับแผนพื้นฐาน',
        'ผลประโยชน์กรณีเสียชีวิต: 101% ของเบี้ยประกันทั้งหมดที่ชำระแล้ว หรือมูลค่าเวนคืน (105% สำหรับการเสียชีวิตจากอุบัติเหตุ)',
        'ผลประโยชน์การยกเว้นเบี้ยประกันกรณีทุพพลภาพจนถึงอายุ 70 ปี',
        'ผลประโยชน์การถูกเลิกจ้าง (50% ของเบี้ยประกันรายปีสำหรับระยะเวลา 4 ปี, 100% สำหรับระยะเวลา 10 ปี)',
        'ตัวเลือกการเปลี่ยนผู้เอาประกันชีวิตสำหรับการถ่ายโอนความมั่งคั่ง',
        'สินเชื่อกรมธรรม์, สินเชื่อผ่าตัดและการดูแลสามารถใช้ได้',
        'ความคุ้มครองตลอดชีวิต (ครบกำหนดเมื่อผู้เอาประกันชีวิตเดิมอายุ 110 ปี หากมีการเปลี่ยนผู้เอาประกันชีวิต)',
      ],
      featureHighlight: {
        title: 'รายได้รายเดือนตลอดชีพเริ่มตั้งแต่ปีที่ 4',
        description:
          'ให้ผลประโยชน์เงินสดรายเดือนแบบรับประกัน 0.864% ต่อปี บวกกับไม่รับประกัน 2.004% ต่อปีของมูลค่าหน้า เริ่มตั้งแต่เดือนที่ 49 ของกรมธรรม์ มูลค่าหน้าเท่ากับเบี้ยประกันรายปีคูณด้วยระยะเวลาชำระเบี้ยประกัน (มูลค่าหน้าขั้นต่ำ: S$45,000 สำหรับระยะเวลา 4 ปี, S$23,000 สำหรับระยะเวลา 10 ปี)',
      },
      evaluationFocus: [
        'ความถูกต้องของข้อมูลผลิตภัณฑ์ PRULifetime Income Plus ที่พนักงานขายให้',
        'การอธิบายที่ถูกต้องเกี่ยวกับโครงสร้างผลประโยชน์เงินสดรายเดือน (ส่วนประกอบที่รับประกันและไม่รับประกัน)',
        'ระยะเวลาชำระเบี้ยประกันที่ถูกต้อง (4 หรือ 10 ปีเท่านั้น)',
        'การอธิบายที่เหมาะสมเกี่ยวกับขอบเขตและข้อจำกัดของการออกกรมธรรม์แบบรับประกัน (GIO)',
        'ระยะเวลาที่ถูกต้องของผลประโยชน์ (ผลประโยชน์เงินสดรายเดือนเริ่มจากเดือนที่ 49)',
        'การคำนวณผลประโยชน์กรณีเสียชีวิตที่ถูกต้องและบทบัญญัติการเสียชีวิตจากอุบัติเหตุ',
        'การอธิบายที่เหมาะสมเกี่ยวกับความแตกต่างของระยะเวลามูลค่าเวนคืนระหว่างระยะเวลา 4 ปีและ 10 ปี',
        'ความเข้าใจเกี่ยวกับโปรไฟล์ลูกค้าเป้าหมายและความเหมาะสม',
        'ความรู้เกี่ยวกับคุณสมบัติเฉพาะเช่นผลประโยชน์การยกเว้นเบี้ยประกันกรณีทุพพลภาพและผลประโยชน์การถูกเลิกจ้าง',
        'แยกแยะระหว่างพื้นที่ปรับปรุงทั่วไป ("คำเตือน") และข้อผิดพลาดเชิงข้อเท็จจริง ("ข้อผิดพลาด")',
      ],
      callCriteria: {
        title: 'บัตรคะแนน Prudential PRULifetime Income Plus',
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
      name: 'PRULifetime Income Plus (RP)',
      keyFeatures: [
        'Regular premium participating whole life plan sa Singapore Dollar denomination',
        'Premium payment term choices: 4 o 10 years lang',
        'Monthly Cash Benefits nagsugod gikan sa policy month 49 (guaranteed 0.864% + non-guaranteed 2.004% per annum sa Face Value)',
        'Guaranteed Issue (GIO) - walay medical underwriting required para sa basic plan',
        'Death benefit: 101% sa total premiums paid o surrender value (105% para sa accidental death)',
        'Disability Waiver Benefit hangtod age 70',
        'Retrenchment Benefit (50% sa annual premium para sa 4-year term, 100% para sa 10-year term)',
        'Replacement of Life Assured option para sa wealth transfer',
        'Policy loans, surgical & care loans available',
        'Lifetime coverage (matures sa age 110 sa original life assured kung life assured gi-replace)',
      ],
      featureHighlight: {
        title: 'Monthly Lifetime Income Starting from Year 4',
        description:
          'Naghatag ug guaranteed monthly cash benefits nga 0.864% per annum plus non-guaranteed 2.004% per annum sa Face Value, nagsugod gikan sa policy month 49. Face Value pareho sa Annual Premium nga gi-multiply sa Premium Payment Term (minimum Face Value: S$45,000 para sa 4-year term, S$23,000 para sa 10-year term).',
      },
      evaluationFocus: [
        'Accuracy sa PRULifetime Income Plus product information nga gihatag sa salesperson',
        'Correct explanation sa monthly cash benefit structure (guaranteed vs non-guaranteed components)',
        'Accurate premium payment terms (4 o 10 years lang)',
        'Proper explanation sa Guaranteed Issue (GIO) scope ug limitations',
        'Correct timing sa benefits (monthly cash benefits start from month 49)',
        'Accurate death benefit calculations ug accidental death provisions',
        'Proper explanation sa surrender value timeline differences tali sa 4-year ug 10-year terms',
        'Understanding sa target customer profile ug suitability',
        'Knowledge sa unique features sama sa Disability Waiver Benefit ug Retrenchment Benefit',
        'Distinguish between general improvement areas ("warning") ug factual errors ("error")',
      ],
      callCriteria: {
        title: 'Prudential PRULifetime Income Plus Scorecard',
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
      name: 'PRULifetime Income Plus (RP)',
      keyFeatures: [
        'Kế hoạch bảo hiểm trọn đời có tham gia phí thông thường tính bằng Đô la Singapore',
        'Lựa chọn thời hạn đóng phí: chỉ 4 hoặc 10 năm',
        'Quyền lợi tiền mặt hàng tháng bắt đầu từ tháng thứ 49 của hợp đồng (đảm bảo 0.864% + không đảm bảo 2.004% mỗi năm của Mệnh giá)',
        'Phát hành đảm bảo (GIO) - không yêu cầu thẩm định y tế cho kế hoạch cơ bản',
        'Quyền lợi tử vong: 101% tổng phí đã đóng hoặc giá trị hoàn lại (105% cho tử vong do tai nạn)',
        'Quyền lợi miễn phí do khuyết tật đến 70 tuổi',
        'Quyền lợi mất việc làm (50% phí hàng năm cho thời hạn 4 năm, 100% cho thời hạn 10 năm)',
        'Tùy chọn thay thế Người được bảo hiểm để chuyển giao tài sản',
        'Cho vay từ hợp đồng, cho vay phẫu thuật và chăm sóc có sẵn',
        'Bảo hiểm trọn đời (đáo hạn ở tuổi 110 của người được bảo hiểm gốc nếu người được bảo hiểm được thay thế)',
      ],
      featureHighlight: {
        title: 'Thu nhập hàng tháng trọn đời bắt đầu từ năm thứ 4',
        description:
          'Cung cấp quyền lợi tiền mặt hàng tháng đảm bảo 0.864% mỗi năm cộng với không đảm bảo 2.004% mỗi năm của Mệnh giá, bắt đầu từ tháng thứ 49 của hợp đồng. Mệnh giá bằng Phí hàng năm nhân với Thời hạn đóng phí (Mệnh giá tối thiểu: S$45.000 cho thời hạn 4 năm, S$23.000 cho thời hạn 10 năm).',
      },
      evaluationFocus: [
        'Độ chính xác của thông tin sản phẩm PRULifetime Income Plus do nhân viên bán hàng cung cấp',
        'Giải thích đúng về cấu trúc quyền lợi tiền mặt hàng tháng (thành phần đảm bảo so với không đảm bảo)',
        'Thời hạn đóng phí chính xác (chỉ 4 hoặc 10 năm)',
        'Giải thích thích hợp về phạm vi và hạn chế của Phát hành đảm bảo (GIO)',
        'Thời điểm đúng của quyền lợi (quyền lợi tiền mặt hàng tháng bắt đầu từ tháng 49)',
        'Tính toán quyền lợi tử vong chính xác và các điều khoản tử vong do tai nạn',
        'Giải thích thích hợp về sự khác biệt thời gian giá trị hoàn lại giữa thời hạn 4 năm và 10 năm',
        'Hiểu biết về hồ sơ khách hàng mục tiêu và sự phù hợp',
        'Kiến thức về các tính năng độc đáo như Quyền lợi miễn phí do khuyết tật và Quyền lợi mất việc làm',
        'Phân biệt giữa các lĩnh vực cải thiện chung ("cảnh báo") và lỗi thực tế ("lỗi")',
      ],
      callCriteria: {
        title: 'Bảng điểm Prudential PRULifetime Income Plus',
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

    // Traditional Chinese (Taiwan)
    cmn: {
      name: 'PRULifetime Income Plus（定期繳費）',
      keyFeatures: [
        '以新加坡幣計價的分紅型終身壽險定期繳費計劃',
        '繳費年期選項：僅限 4 年或 10 年',
        '每月現金給付從保單第 49 個月開始（保證 0.864% + 非保證 2.004%，按年計算保額）',
        '保證核保（GIO）- 基本計劃無需醫療核保',
        '身故給付：已繳保費總額的 101% 或解約金（意外身故為 105%）',
        '失能豁免保費給付至 70 歲',
        '裁員給付（4 年期為年繳保費的 50%，10 年期為 100%）',
        '可更換被保險人選項，用於財富傳承',
        '提供保單貸款、手術及照護貸款',
        '終身保障（若更換被保險人，則於原被保險人 110 歲時滿期）',
      ],
      featureHighlight: {
        title: '從第 4 年開始的終身每月收入',
        description:
          '從保單第 49 個月起，每月提供保證現金給付年利率 0.864%，加上非保證的年利率 2.004%，以保額計算。保額等於年繳保費乘以繳費年期（最低保額：4 年期 S$45,000，10 年期 S$23,000）。',
      },
      evaluationFocus: [
        '業務人員提供的 PRULifetime Income Plus 產品資訊準確性',
        '正確說明每月現金給付結構（保證與非保證成分）',
        '準確的繳費年期（僅限 4 年或 10 年）',
        '適當說明保證核保（GIO）的範圍與限制',
        '正確的給付時程（每月現金給付從第 49 個月開始）',
        '準確的身故給付計算及意外身故條款',
        '適當說明 4 年期與 10 年期解約金時程差異',
        '了解目標客戶輪廓與適合度',
        '了解失能豁免保費給付及裁員給付等獨特功能',
        '區分一般改進建議（「警告」）與事實錯誤（「錯誤」）',
      ],
      callCriteria: {
        title: '保德信 PRULifetime Income Plus 評分卡',
        description:
          '為了在此次練習中獲得最佳成績，請努力達成以下所有關鍵評估標準：',
        criteria: [
          '運用 3F（Feel感受、Felt認同、Found發現）框架',
          '提供產品說明',
          '展示營運知識',
          '處理客戶異議',
        ],
      },
    },
  },
};
