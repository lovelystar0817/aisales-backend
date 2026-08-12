import { ProductConfiguration } from './types.js';

/**
 * PRUShield - Comprehensive hospital coverage
 * Enhanced MediShield Life with convenient MediSave payment
 */
export const prushieldConfiguration: ProductConfiguration = {
  base: {
    id: 'prushield',
    friendlyId: 'prushield',
    category: 'insurance',
  },

  localized: {
    // English (Original)
    en: {
      name: 'PRUShield',
      keyFeatures: [
        'Enhancement plans offered on top of MediShield Life for additional coverage',
        'Two plan options: PRUShield A (higher coverage) and PRUShield B (standard coverage)',
        'Covers hospitalization at B2/C wards of restructured hospitals and private hospitals',
        'Renewable annually till lifetime with guaranteed renewability',
        'Premium payment through MediSave account with cash top-up if required',
        'Policy year limits: S$150,000 (Plan A) / S$120,000 (Plan B) with unlimited lifetime limits',
        'Coverage includes hospitalization, day surgery, hospital outpatient benefits, and other benefits',
        '10% co-insurance and deductibles ranging from S$1,500 to S$3,500 depending on ward class',
        'Pro-ration applies for Plan B at higher class wards (85% coverage)',
        'Maximum entry age: 75 years old',
        '60-day review period for policy cancellation with full premium refund',
      ],
      featureHighlight: {
        title:
          'Comprehensive hospitalization coverage with convenient MediSave payment',
        description:
          'PRUShield enhances your MediShield Life coverage with higher benefit limits and wider hospital choices. Premiums are automatically deducted from your MediSave account annually, with flexibility for cash top-up if needed. Plan A offers coverage up to S$150,000 per year while Plan B provides S$120,000, both with lifetime renewability and no lifetime limits.',
      },
      evaluationFocus: [
        '**Current vs Legacy Plans**: Understanding of active PRUShield Premier/Plus vs legacy A/B plans',
        '**Value Proposition**: Ability to articulate "Better Coverage, Better Healthcare Experience, Better Savings"',
        '**Competitive Position**: Knowledge of "one of the lowest out-of-pocket costs" and premium advantages',
        '**Cancer Coverage**: Understanding of 20x enhanced MediShield Life limits and comprehensive CDL/non-CDL coverage',
        '**PRUExtra Supplementary Plans**: Knowledge of different CoPay options and their features',
        '**PRUPanel Connect**: Awareness of 1000+ specialist network and value-added services',
        '**Claims-Based Pricing**: Understanding of first-in-market approach and PRUWell Reward',
        '**PRUShield EasySwitch**: Knowledge of seamless switching benefits and eligibility',
        '**Refresh Benefits**: Understanding of policy limit reset for different medical conditions',
        '**Premium Benchmarking**: Awareness of 8.8-12.8% below market average positioning',
        '**MIC@Home Coverage**: Knowledge of Mobile Inpatient Care at Home benefits',
        '**Stop-Loss Feature**: Understanding of S$3,000 maximum co-payment with rider',
        '**Pre-authorization**: Knowledge of bill-matching up to S$1 million for cancer treatment',
        '**Market Statistics**: Awareness of medical inflation trends and Singapore healthcare challenges',
        '**Distinguish between general improvement areas ("warning") and factual errors about PRUShield ("error")',
      ],
      callCriteria: {
        title: 'Prudential PRUShield Scorecard',
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
      name: 'PRUShield',
      keyFeatures: [
        'Paket peningkatan yang ditawarkan di atas MediShield Life untuk cakupan tambahan',
        'Dua opsi paket: PRUShield A (cakupan lebih tinggi) dan PRUShield B (cakupan standar)',
        'Mencakup rawat inap di bangsal B2/C rumah sakit restrukturisasi dan rumah sakit swasta',
        'Dapat diperpanjang setiap tahun hingga seumur hidup dengan jaminan perpanjangan',
        'Pembayaran premi melalui akun MediSave dengan top-up tunai jika diperlukan',
        'Batas tahun polis: S$150.000 (Paket A) / S$120.000 (Paket B) dengan batas seumur hidup tanpa batas',
        'Cakupan termasuk rawat inap, operasi sehari, manfaat rumah sakit rawat jalan, dan manfaat lainnya',
        'Co-insurance 10% dan deductible berkisar S$1.500 hingga S$3.500 tergantung kelas bangsal',
        'Pro-ration berlaku untuk Paket B di bangsal kelas lebih tinggi (cakupan 85%)',
        'Usia masuk maksimum: 75 tahun',
        'Periode review 60 hari untuk pembatalan polis dengan pengembalian premi penuh',
      ],
      featureHighlight: {
        title:
          'Cakupan rawat inap komprehensif dengan kemudahan pembayaran MediSave',
        description:
          'PRUShield meningkatkan cakupan MediShield Life Anda dengan batas manfaat yang lebih tinggi dan pilihan rumah sakit yang lebih luas. Premi otomatis dipotong dari akun MediSave Anda setiap tahun, dengan fleksibilitas top-up tunai jika diperlukan. Paket A menawarkan cakupan hingga S$150.000 per tahun sementara Paket B memberikan S$120.000, keduanya dengan perpanjangan seumur hidup dan tanpa batas seumur hidup.',
      },
      evaluationFocus: [
        '**Paket Saat Ini vs Lama**: Pemahaman tentang PRUShield Premier/Plus aktif vs paket lama A/B',
        '**Proposisi Nilai**: Kemampuan mengartikulasikan "Cakupan Lebih Baik, Pengalaman Kesehatan Lebih Baik, Penghematan Lebih Baik"',
        '**Posisi Kompetitif**: Pengetahuan tentang "salah satu biaya out-of-pocket terendah" dan keunggulan premi',
        '**Cakupan Kanker**: Pemahaman tentang batas MediShield Life 20x yang ditingkatkan dan cakupan CDL/non-CDL komprehensif',
        '**Paket Tambahan PRUExtra**: Pengetahuan tentang opsi CoPay yang berbeda dan fitur-fiturnya',
        '**PRUPanel Connect**: Kesadaran tentang jaringan 1000+ spesialis dan layanan nilai tambah',
        '**Harga Berbasis Klaim**: Pemahaman tentang pendekatan first-in-market dan PRUWell Reward',
        '**PRUShield EasySwitch**: Pengetahuan tentang manfaat perpindahan seamless dan eligibilitas',
        '**Manfaat Refresh**: Pemahaman tentang reset batas polis untuk kondisi medis yang berbeda',
        '**Benchmarking Premi**: Kesadaran tentang posisi 8.8-12.8% di bawah rata-rata pasar',
        '**Cakupan MIC@Home**: Pengetahuan tentang manfaat Mobile Inpatient Care at Home',
        '**Fitur Stop-Loss**: Pemahaman tentang co-payment maksimum S$3.000 dengan rider',
        '**Pra-otorisasi**: Pengetahuan tentang bill-matching hingga S$1 juta untuk perawatan kanker',
        '**Statistik Pasar**: Kesadaran tentang tren inflasi medis dan tantangan kesehatan di Singapura',
        '**Membedakan antara area peningkatan umum ("peringatan") dan kesalahan faktual tentang PRUShield ("error")',
      ],
      callCriteria: {
        title: 'Kartu Skor Prudential PRUShield',
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
      name: 'PRUShield',
      keyFeatures: [
        'Pelan peningkatan yang ditawarkan di atas MediShield Life untuk liputan tambahan',
        'Dua pilihan pelan: PRUShield A (liputan lebih tinggi) dan PRUShield B (liputan standard)',
        'Meliputi rawatan hospital di wad B2/C hospital berstruktur semula dan hospital swasta',
        'Boleh diperbaharui setiap tahun hingga seumur hidup dengan jaminan pembaharuan',
        'Pembayaran premium melalui akaun MediSave dengan tambahan tunai jika diperlukan',
        'Had tahun polisi: S$150,000 (Pelan A) / S$120,000 (Pelan B) dengan had seumur hidup tanpa had',
        'Liputan termasuk rawatan hospital, pembedahan hari, manfaat hospital pesakit luar, dan manfaat lain',
        'Insurans bersama 10% dan deduktibel berkisar S$1,500 hingga S$3,500 bergantung pada kelas wad',
        'Pro-ration terpakai untuk Pelan B di wad kelas lebih tinggi (liputan 85%)',
        'Umur kemasukan maksimum: 75 tahun',
        'Tempoh semakan 60 hari untuk pembatalan polisi dengan pemulangan premium penuh',
      ],
      featureHighlight: {
        title:
          'Liputan rawatan hospital menyeluruh dengan kemudahan pembayaran MediSave',
        description:
          'PRUShield meningkatkan liputan MediShield Life anda dengan had manfaat yang lebih tinggi dan pilihan hospital yang lebih luas. Premium dipotong secara automatik dari akaun MediSave anda setiap tahun, dengan fleksibiliti tambahan tunai jika diperlukan. Pelan A menawarkan liputan hingga S$150,000 setahun manakala Pelan B menyediakan S$120,000, kedua-duanya dengan pembaharuan seumur hidup dan tanpa had seumur hidup.',
      },
      evaluationFocus: [
        '**Pelan Semasa vs Lama**: Pemahaman tentang PRUShield Premier/Plus aktif vs pelan lama A/B',
        '**Proposisi Nilai**: Keupayaan mengartikulasi "Liputan Lebih Baik, Pengalaman Penjagaan Kesihatan Lebih Baik, Penjimatan Lebih Baik"',
        '**Kedudukan Kompetitif**: Pengetahuan tentang "salah satu kos out-of-pocket terendah" dan kelebihan premium',
        '**Liputan Kanser**: Pemahaman tentang had MediShield Life 20x yang dipertingkatkan dan liputan CDL/bukan-CDL menyeluruh',
        '**Pelan Tambahan PRUExtra**: Pengetahuan tentang pilihan CoPay yang berbeza dan ciri-cirinya',
        '**PRUPanel Connect**: Kesedaran tentang rangkaian 1000+ pakar dan perkhidmatan nilai tambah',
        '**Harga Berasaskan Tuntutan**: Pemahaman tentang pendekatan first-in-market dan PRUWell Reward',
        '**PRUShield EasySwitch**: Pengetahuan tentang manfaat perpindahan lancar dan kelayakan',
        '**Manfaat Refresh**: Pemahaman tentang set semula had polisi untuk keadaan perubatan yang berbeza',
        '**Penandaarasan Premium**: Kesedaran tentang kedudukan 8.8-12.8% di bawah purata pasaran',
        '**Liputan MIC@Home**: Pengetahuan tentang manfaat Mobile Inpatient Care at Home',
        '**Ciri Stop-Loss**: Pemahaman tentang pembayaran bersama maksimum S$3,000 dengan rider',
        '**Pra-kebenaran**: Pengetahuan tentang padanan bil hingga S$1 juta untuk rawatan kanser',
        '**Statistik Pasaran**: Kesedaran tentang trend inflasi perubatan dan cabaran kesihatan di Singapura',
        '**Membezakan antara kawasan penambahbaikan umum ("amaran") dan kesilapan fakta tentang PRUShield ("ralat")',
      ],
      callCriteria: {
        title: 'Kad Skor Prudential PRUShield',
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
      name: 'PRUShield',
      keyFeatures: [
        'Enhancement plans na inooffer on top ng MediShield Life para sa additional coverage',
        'Dalawang plan options: PRUShield A (higher coverage) at PRUShield B (standard coverage)',
        'Covers hospitalization sa B2/C wards ng restructured hospitals at private hospitals',
        'Renewable annually till lifetime na may guaranteed renewability',
        'Premium payment through MediSave account na may cash top-up kung required',
        'Policy year limits: S$150,000 (Plan A) / S$120,000 (Plan B) na may unlimited lifetime limits',
        'Coverage includes hospitalization, day surgery, hospital outpatient benefits, at other benefits',
        '10% co-insurance at deductibles ranging from S$1,500 to S$3,500 depending sa ward class',
        'Pro-ration applies para sa Plan B sa higher class wards (85% coverage)',
        'Maximum entry age: 75 years old',
        '60-day review period para sa policy cancellation na may full premium refund',
      ],
      featureHighlight: {
        title:
          'Comprehensive hospitalization coverage na may convenient MediSave payment',
        description:
          'Ang PRUShield ay nag-eenhance ng inyong MediShield Life coverage na may higher benefit limits at wider hospital choices. Ang premiums ay automatically deducted from inyong MediSave account annually, na may flexibility para sa cash top-up kung needed. Plan A nag-ooffer ng coverage up to S$150,000 per year habang Plan B nagbibigay ng S$120,000, parehong may lifetime renewability at walang lifetime limits.',
      },
      evaluationFocus: [
        '**Current vs Legacy Plans**: Understanding ng active PRUShield Premier/Plus vs legacy A/B plans',
        '**Value Proposition**: Kakayahang articulate ang "Better Coverage, Better Healthcare Experience, Better Savings"',
        '**Competitive Position**: Kaalaman sa "one of the lowest out-of-pocket costs" at premium advantages',
        '**Cancer Coverage**: Understanding ng 20x enhanced MediShield Life limits at comprehensive CDL/non-CDL coverage',
        '**PRUExtra Supplementary Plans**: Kaalaman sa different CoPay options at ang kanilang features',
        '**PRUPanel Connect**: Awareness ng 1000+ specialist network at value-added services',
        '**Claims-Based Pricing**: Understanding ng first-in-market approach at PRUWell Reward',
        '**PRUShield EasySwitch**: Kaalaman sa seamless switching benefits at eligibility',
        '**Refresh Benefits**: Understanding ng policy limit reset para sa different medical conditions',
        '**Premium Benchmarking**: Awareness ng 8.8-12.8% below market average positioning',
        '**MIC@Home Coverage**: Kaalaman sa Mobile Inpatient Care at Home benefits',
        '**Stop-Loss Feature**: Understanding ng S$3,000 maximum co-payment na may rider',
        '**Pre-authorization**: Kaalaman sa bill-matching up to S$1 million para sa cancer treatment',
        '**Market Statistics**: Awareness ng medical inflation trends at Singapore healthcare challenges',
        '**Distinguish between general improvement areas ("warning") at factual errors about PRUShield ("error")',
      ],
      callCriteria: {
        title: 'Prudential PRUShield Scorecard',
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

    // Vietnamese
    vi: {
      name: 'PRUShield',
      keyFeatures: [
        'Các kế hoạch nâng cấp được cung cấp trên cơ sở MediShield Life để có thêm bảo hiểm',
        'Hai lựa chọn kế hoạch: PRUShield A (bảo hiểm cao hơn) và PRUShield B (bảo hiểm tiêu chuẩn)',
        'Bảo hiểm nằm viện tại phòng B2/C của bệnh viện tái cấu trúc và bệnh viện tư nhân',
        'Có thể gia hạn hàng năm cho đến trọn đời với khả năng gia hạn được đảm bảo',
        'Thanh toán phí bảo hiểm thông qua tài khoản MediSave với việc bổ sung tiền mặt nếu cần',
        'Giới hạn năm bảo hiểm: S$150,000 (Kế hoạch A) / S$120,000 (Kế hoạch B) với giới hạn trọn đời không giới hạn',
        'Bảo hiểm bao gồm nằm viện, phẫu thuật ban ngày, lợi ích bệnh nhân ngoại trú và các lợi ích khác',
        'Đồng bảo hiểm 10% và khoản khấu trừ từ S$1,500 đến S$3,500 tùy thuộc vào hạng phòng',
        'Áp dụng tính theo tỷ lệ cho Kế hoạch B tại các phòng hạng cao hơn (bảo hiểm 85%)',
        'Độ tuổi nhập tối đa: 75 tuổi',
        'Thời gian xem xét 60 ngày để hủy bỏ bảo hiểm với hoàn lại phí bảo hiểm đầy đủ',
      ],
      featureHighlight: {
        title: 'Bảo hiểm nằm viện toàn diện với thanh toán MediSave thuận tiện',
        description:
          'PRUShield nâng cao bảo hiểm MediShield Life của bạn với giới hạn lợi ích cao hơn và lựa chọn bệnh viện rộng hơn. Phí bảo hiểm được tự động khấu trừ từ tài khoản MediSave của bạn hàng năm, với tính linh hoạt cho việc bổ sung tiền mặt nếu cần. Kế hoạch A cung cấp bảo hiểm lên đến S$150,000 mỗi năm trong khi Kế hoạch B cung cấp S$120,000, cả hai đều có khả năng gia hạn trọn đời và không có giới hạn trọn đời.',
      },
      evaluationFocus: [
        '**Kế hoạch hiện tại vs Kế hoạch cũ**: Hiểu biết về PRUShield Premier/Plus đang hoạt động so với kế hoạch A/B cũ',
        '**Giá trị đề xuất**: Khả năng diễn đạt "Bảo hiểm tốt hơn, Trải nghiệm chăm sóc sức khỏe tốt hơn, Tiết kiệm tốt hơn"',
        '**Vị thế cạnh tranh**: Kiến thức về "một trong những chi phí tự trả thấp nhất" và lợi thế phí bảo hiểm',
        '**Bảo hiểm ung thư**: Hiểu biết về giới hạn MediShield Life được nâng cao gấp 20 lần và bảo hiểm CDL/non-CDL toàn diện',
        '**Kế hoạch bổ sung PRUExtra**: Kiến thức về các lựa chọn CoPay khác nhau và các tính năng của chúng',
        '**PRUPanel Connect**: Nhận thức về mạng lưới 1000+ chuyên gia và dịch vụ giá trị gia tăng',
        '**Định giá dựa trên khiếu nại**: Hiểu biết về cách tiếp cận đầu tiên trên thị trường và PRUWell Reward',
        '**PRUShield EasySwitch**: Kiến thức về lợi ích chuyển đổi liền mạch và điều kiện',
        '**Lợi ích làm mới**: Hiểu biết về việc đặt lại giới hạn bảo hiểm cho các tình trạng y tế khác nhau',
        '**Đánh giá phí bảo hiểm**: Nhận thức về vị trí dưới mức trung bình thị trường 8,8-12,8%',
        '**Bảo hiểm MIC@Home**: Kiến thức về lợi ích chăm sóc nội trú di động tại nhà',
        '**Tính năng Stop-Loss**: Hiểu biết về đồng thanh toán tối đa S$3,000 với rider',
        '**Ủy quyền trước**: Kiến thức về việc khớp hóa đơn lên đến S$1 triệu cho điều trị ung thư',
        '**Thống kê thị trường**: Nhận thức về xu hướng lạm phát y tế và thách thức chăm sóc sức khỏe Singapore',
        '**Phân biệt giữa các lĩnh vực cải thiện chung ("cảnh báo") và lỗi thực tế về PRUShield ("lỗi")',
      ],
      callCriteria: {
        title: 'Thẻ Điểm Prudential PRUShield',
        description:
          'Để đạt được vị trí tốt nhất trong phiên này, hãy cố gắng đáp ứng tất cả các tiêu chí đánh giá chính:',
        criteria: [
          'Áp dụng Khung 3F (Feel, Felt, Found)',
          'Cung cấp giải thích về sản phẩm',
          'Thể hiện kiến thức vận hành',
          'Xử lý các phản đối',
        ],
      },
    },

    // Thai
    th: {
      name: 'PRUShield',
      keyFeatures: [
        'แผนเสริมที่เสนอบนพื้นฐานของ MediShield Life เพื่อความคุ้มครองเพิ่มเติม',
        'ตัวเลือกแผนสองแบบ: PRUShield A (ความคุ้มครองสูงกว่า) และ PRUShield B (ความคุ้มครองมาตรฐาน)',
        'ครอบคลุมการรักษาในโรงพยาบาลที่หอพัก B2/C ของโรงพยาบาลรัฐและโรงพยาบาลเอกชน',
        'ต่ออายุได้ประจำปีจนตลอดชีวิตพร้อมการรับประกันการต่ออายุ',
        'การชำระเบี้ยประกันผ่านบัญชี MediSave พร้อมการเสริมเงินสดหากจำเป็น',
        'ขีดจำกัดความคุ้มครองต่อปี: S$150,000 (แผน A) / S$120,000 (แผน B) ไม่จำกัดความคุ้มครองตลอดชีวิต',
        'ความคุ้มครองรวมถึงการรักษาในโรงพยาบาล การผ่าตัดแบบไม่ค้างคืน สิทธิประโยชน์ผู้ป่วยนอกและสิทธิประโยชน์อื่นๆ',
        'การประกันร่วม 10% และเงินหักพื้นฐานตั้งแต่ S$1,500 ถึง S$3,500 ขึ้นอยู่กับชั้นของหอพัก',
        'การคำนวณตามสัดส่วนใช้กับแผน B ที่หอพักชั้นสูงกว่า (ความคุ้มครอง 85%)',
        'อายุเข้าสูงสุด: 75 ปี',
        'ระยะเวลาทบทวน 60 วันสำหรับการยกเลิกกรมธรรม์พร้อมการคืนเบี้ยประกันเต็มจำนวน',
      ],
      featureHighlight: {
        title:
          'ความคุ้มครองการรักษาในโรงพยาบาลที่ครอบคลุมพร้อมการชำระเงิน MediSave ที่สะดวก',
        description:
          'PRUShield ยกระดับความคุ้มครอง MediShield Life ของคุณด้วยขีดจำกัดสิทธิประโยชน์ที่สูงขึ้นและตัวเลือกโรงพยาบาลที่กว้างขึ้น เบี้ยประกันจะถูกหักโดยอัตโนมัติจากบัญชี MediSave ของคุณเป็นรายปี โดยมีความยืดหยุ่นสำหรับการเสริมเงินสดหากจำเป็น แผน A เสนอความคุ้มครองถึง S$150,000 ต่อปี ในขณะที่แผน B ให้ S$120,000 ทั้งสองมีการต่ออายุตลอดชีวิตและไม่มีขีดจำกัดตลอดชีวิต',
      },
      evaluationFocus: [
        '**แผนปัจจุบันเทียบกับแผนเก่า**: ความเข้าใจเกี่ยวกับ PRUShield Premier/Plus ที่ใช้งานอยู่เทียบกับแผน A/B เก่า',
        '**ข้อเสนอคุณค่า**: ความสามารถในการแสดงออก "ความคุ้มครองที่ดีกว่า ประสบการณ์การรักษาที่ดีกว่า การประหยัดที่ดีกว่า"',
        '**ตำแหน่งการแข่งขัน**: ความรู้เกี่ยวกับ "หนึ่งในค่าใช้จ่ายจากกระเป๋าตัวเองที่ต่ำที่สุด" และข้อได้เปรียบของเบี้ยประกัน',
        '**ความคุ้มครองมะเร็ง**: ความเข้าใจเกี่ยวกับขีดจำกัด MediShield Life ที่เพิ่มขึ้น 20 เท่าและความคุ้มครอง CDL/non-CDL แบบครอบคลุม',
        '**แผนเสริม PRUExtra**: ความรู้เกี่ยวกับตัวเลือก CoPay ที่แตกต่างกันและคุณสมบัติของพวกเขา',
        '**PRUPanel Connect**: ความตระหนักเกี่ยวกับเครือข่ายผู้เชี่ยวชาญกว่า 1000+ และบริการที่เพิ่มมูลค่า',
        '**การกำหนดราคาตามการเรียกร้อง**: ความเข้าใจเกี่ยวกับแนวทางแรกในตลาดและ PRUWell Reward',
        '**PRUShield EasySwitch**: ความรู้เกี่ยวกับผลประโยชน์การเปลี่ยนแปลงที่ราบรื่นและคุณสมบัติ',
        '**ผลประโยชน์การรีเฟรช**: ความเข้าใจเกี่ยวกับการรีเซ็ตขีดจำกัดกรมธรรม์สำหรับเงื่อนไขทางการแพทย์ที่แตกต่างกัน',
        '**การเปรียบเทียบเบี้ยประกัน**: ความตระหนักเกี่ยวกับตำแหน่งที่ต่ำกว่าค่าเฉลี่ยตลาด 8.8-12.8%',
        '**ความคุ้มครอง MIC@Home**: ความรู้เกี่ยวกับผลประโยชน์การรักษาผู้ป่วยในแบบเคลื่อนที่ที่บ้าน',
        '**คุณสมบัติ Stop-Loss**: ความเข้าใจเกี่ยวกับการจ่ายร่วมสูงสุด S$3,000 พร้อมไรเดอร์',
        '**การอนุญาตล่วงหน้า**: ความรู้เกี่ยวกับการจับคู่บิลถึง S$1 ล้านสำหรับการรักษามะเร็ง',
        '**สถิติตลาด**: ความตระหนักเกี่ยวกับแนวโน้มเงินเฟ้อทางการแพทย์และความท้าทายด้านการรักษาพยาบาลของสิงคโปร์',
        '**แยกแยะระหว่างพื้นที่ปรับปรุงทั่วไป ("คำเตือน") และข้อผิดพลาดเชิงข้อเท็จจริงเกี่ยวกับ PRUShield ("ข้อผิดพลาด")',
      ],
      callCriteria: {
        title: 'บัตรคะแนน Prudential PRUShield',
        description:
          'เพื่อให้ได้ผลลัพธ์ที่ดีที่สุดในเซสชันนี้ ให้มุ่งมั่นตอบสนองเกณฑ์การประเมินหลักทั้งหมด:',
        criteria: [
          'ใช้กรอบ 3F (Feel, Felt, Found)',
          'ให้คำอธิบายเกี่ยวกับผลิตภัณฑ์',
          'แสดงความรู้ด้านการดำเนินงาน',
          'จัดการกับข้อโต้แย้ง',
        ],
      },
    },

    // Cebuano
    ceb: {
      name: 'PRUShield',
      keyFeatures: [
        'Enhancement plans nga gi-offer on top sa MediShield Life para sa additional coverage',
        'Duha ka plan options: PRUShield A (higher coverage) ug PRUShield B (standard coverage)',
        'Covers hospitalization sa B2/C wards sa restructured hospitals ug private hospitals',
        'Renewable annually hangtod lifetime nga may guaranteed renewability',
        'Premium payment pinaagi sa MediSave account nga may cash top-up kung gikinahanglan',
        'Policy year limits: S$150,000 (Plan A) / S$120,000 (Plan B) nga may unlimited lifetime limits',
        'Coverage includes hospitalization, day surgery, hospital outpatient benefits, ug uban pang benefits',
        '10% co-insurance ug deductibles ranging gikan S$1,500 hangtod S$3,500 depende sa ward class',
        'Pro-ration applies para sa Plan B sa higher class wards (85% coverage)',
        'Maximum entry age: 75 years old',
        '60-day review period para sa policy cancellation nga may full premium refund',
      ],
      featureHighlight: {
        title:
          'Comprehensive hospitalization coverage nga may convenient MediSave payment',
        description:
          'Ang PRUShield nag-enhance sa imong MediShield Life coverage nga may higher benefit limits ug wider hospital choices. Ang premiums automatically deducted gikan sa imong MediSave account kada tuig, nga may flexibility para sa cash top-up kung gikinahanglan. Plan A nag-offer ug coverage up to S$150,000 matag tuig samtang Plan B naghatag ug S$120,000, parehong may lifetime renewability ug walay lifetime limits.',
      },
      evaluationFocus: [
        '**Current vs Legacy Plans**: Pagsabot sa active PRUShield Premier/Plus vs legacy A/B plans',
        '**Value Proposition**: Abilidad sa pag-articulate sa "Better Coverage, Better Healthcare Experience, Better Savings"',
        '**Competitive Position**: Kahibalo sa "one of the lowest out-of-pocket costs" ug premium advantages',
        '**Cancer Coverage**: Pagsabot sa 20x enhanced MediShield Life limits ug comprehensive CDL/non-CDL coverage',
        '**PRUExtra Supplementary Plans**: Kahibalo sa lain-laing CoPay options ug ilang features',
        '**PRUPanel Connect**: Kahibalo sa 1000+ specialist network ug value-added services',
        '**Claims-Based Pricing**: Pagsabot sa first-in-market approach ug PRUWell Reward',
        '**PRUShield EasySwitch**: Kahibalo sa seamless switching benefits ug eligibility',
        '**Refresh Benefits**: Pagsabot sa policy limit reset para sa lain-laing medical conditions',
        '**Premium Benchmarking**: Kahibalo sa 8.8-12.8% below market average positioning',
        '**MIC@Home Coverage**: Kahibalo sa Mobile Inpatient Care at Home benefits',
        '**Stop-Loss Feature**: Pagsabot sa S$3,000 maximum co-payment nga may rider',
        '**Pre-authorization**: Kahibalo sa bill-matching up to S$1 million para sa cancer treatment',
        '**Market Statistics**: Kahibalo sa medical inflation trends ug Singapore healthcare challenges',
        '**Distinguish between general improvement areas ("warning") ug factual errors about PRUShield ("error")',
      ],
      callCriteria: {
        title: 'Prudential PRUShield Scorecard',
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

    // Traditional Chinese (Taiwan)
    cmn: {
      name: 'PRUShield 保倍住院醫療',
      keyFeatures: [
        '在 MediShield Life 基礎上提供額外保障的增強型計劃',
        '兩種方案選項：PRUShield A（較高保障）和 PRUShield B（標準保障）',
        '涵蓋公立醫院 B2/C 病房及私立醫院住院',
        '每年可續保至終身，保證續保',
        '透過 MediSave 帳戶繳納保費，必要時可現金補足',
        '保單年度限額：S$150,000（A方案）/ S$120,000（B方案），終身無上限',
        '保障範圍包括住院、日間手術、門診給付及其他給付',
        '10% 共同保險，自付額依病房等級從 S$1,500 至 S$3,500 不等',
        'B 方案於較高等級病房適用比例給付（85% 給付）',
        '最高投保年齡：75 歲',
        '60 天審閱期，取消保單可全額退還保費',
      ],
      featureHighlight: {
        title: '全方位住院保障，便利的 MediSave 繳費',
        description:
          'PRUShield 透過更高的給付上限與更多醫院選擇，強化您的 MediShield Life 保障。保費每年自動從您的 MediSave 帳戶扣除，必要時可彈性現金補足。A 方案提供每年最高 S$150,000 的保障，B 方案則提供 S$120,000，兩者皆可終身續保且無終身上限。',
      },
      evaluationFocus: [
        '**現行與舊方案比較**：了解現行 PRUShield Premier/Plus 與舊版 A/B 方案的差異',
        '**價值主張**：能清楚表達「更佳保障、更好醫療體驗、更多節省」',
        '**競爭定位**：了解「最低自付費用之一」及保費優勢',
        '**癌症保障**：了解 MediShield Life 20 倍增強上限及完整 CDL/非 CDL 保障',
        '**PRUExtra 附加計劃**：了解不同 CoPay 選項及其特色',
        '**PRUPanel Connect**：了解 1000+ 專科醫師網絡及增值服務',
        '**理賠定價**：了解市場首創的定價方式及 PRUWell Reward',
        '**PRUShield EasySwitch**：了解無縫轉換的優惠及資格',
        '**刷新給付**：了解不同疾病的保單額度重置機制',
        '**保費基準**：了解低於市場平均 8.8-12.8% 的定位',
        '**MIC@Home 保障**：了解居家住院護理給付',
        '**Stop-Loss 功能**：了解附加條款下 S$3,000 最高共付額',
        '**預先授權**：了解癌症治療最高 S$100 萬的帳單配對',
        '**市場統計**：了解醫療通膨趨勢及新加坡醫療挑戰',
        '**區分一般改進建議（「警告」）與 PRUShield 事實錯誤（「錯誤」）',
      ],
      callCriteria: {
        title: '保德信 PRUShield 評分卡',
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
