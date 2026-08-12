import { ProductConfiguration } from './types.js';

/**
 * PRUVantage Assure II - Investment-linked whole life plan
 * Dual Accounts with Wealth Assure downside protection
 */
export const pruvantageAssureIIConfiguration: ProductConfiguration = {
  base: {
    id: 'pruvantage-assure-ii',
    friendlyId: 'pruvantage-assure-ii',
    category: 'insurance',
  },

  localized: {
    // English (Original)
    en: {
      name: 'PRUVantage Assure II',
      keyFeatures: [
        'Regular premium, whole of life investment-linked policy in Singapore Dollars',
        'Premium terms: 5, 10, 15, 20, or 25 years',
        'Dual Accounts: Growth Account (higher Welcome Bonus, dividends from year 11) and Flex Account (dividends from day 1)',
        'First-in-market Wealth Assure feature: locks highest daily account value (up to S$20M or 3x lifetime premium)',
        'Sum Assured starts at 103% of total regular premiums paid, increases 3% yearly (simple interest) up to 160%',
        'Death and Accidental Disability benefits: highest of Sum Assured, Wealth Assure Value, or account value (plus Additional Investment Account)',
        'Welcome Bonus in first 3 years; Loyalty Bonus 0.5% annually after premium term',
        'Investment Booster (Lump Sum) top-ups from S$1,000 (3% charge) credited to Additional Investment Account',
        'Premium Pass for a temporary premium break after minimum paid years; Wealth Share to divide policy into sub-policies',
        'UOB distribution specifics: default 100% allocation to Growth Account, max entry age up to 65 ANB',
      ],
      featureHighlight: {
        title:
          'Wealth Assure downside protection with flexible Dual Account growth',
        description:
          'Lock in the peak of your portfolio via Wealth Assure while balancing growth and income flexibility through Growth and Flex Accounts. Coverage grows as your Sum Assured increases 3% annually up to 160%, with Welcome and Loyalty Bonuses enhancing long-term value.',
      },
      evaluationFocus: [
        'Correct explanation of Wealth Assure and its maximum limits',
        'Dual Account structure differences (Growth vs Flex) and UOB-specific allocation',
        'Sum Assured mechanics: 103% starting point, +3% yearly up to 160%',
        'Death and Accidental Disability benefit calculation logic',
        'Welcome Bonus, Loyalty Bonus, and Investment Booster operations',
        'Flexibility options: Premium Pass, Wealth Share, Change of Life Assured',
      ],
      callCriteria: {
        title: 'Prudential PRUVantage Assure II Scorecard',
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
      name: 'PRUVantage Assure II',
      keyFeatures: [
        'Polis tautan investasi seumur hidup dengan premi reguler dalam Dolar Singapura',
        'Pilihan masa bayar: 5, 10, 15, 20, atau 25 tahun',
        'Akun Ganda: Growth Account (Welcome Bonus lebih tinggi, dividen mulai tahun ke-11) dan Flex Account (dividen sejak hari pertama)',
        'Fitur Wealth Assure pertama di pasar: mengunci nilai akun harian tertinggi (hingga S$20 juta atau 3x premi seumur hidup)',
        'Uang Pertanggungan mulai 103% dari total premi reguler, meningkat 3% per tahun (bunga sederhana) hingga 160%',
        'Manfaat Kematian & Cacat Akibat Kecelakaan: tertinggi dari Sum Assured, Wealth Assure Value, atau nilai akun (ditambah Additional Investment Account)',
        'Welcome Bonus pada 3 tahun pertama; Loyalty Bonus 0,5% per tahun setelah masa bayar',
        'Investment Booster (Lump Sum) mulai S$1.000 (biaya 3%) dikreditkan ke Additional Investment Account',
        'Premium Pass untuk jeda premi; Wealth Share untuk membagi polis menjadi sub-polis',
        'Khusus UOB: alokasi default 100% ke Growth Account; usia masuk maksimal 65 ANB',
      ],
      featureHighlight: {
        title:
          'Perlindungan penurunan Wealth Assure dengan pertumbuhan Akun Ganda',
        description:
          'Kunci puncak portofolio melalui Wealth Assure sambil menyeimbangkan pertumbuhan dan fleksibilitas pendapatan lewat Growth dan Flex Account. Cakupan meningkat dengan kenaikan Sum Assured 3% per tahun hingga 160%, ditambah Welcome & Loyalty Bonus untuk nilai jangka panjang.',
      },
      evaluationFocus: [
        'Penjelasan tepat tentang Wealth Assure dan batas maksimum',
        'Perbedaan struktur Akun Ganda (Growth vs Flex) dan alokasi khusus UOB',
        'Mekanisme Sum Assured: mulai 103%, naik 3%/tahun hingga 160%',
        'Logika perhitungan manfaat Kematian & Cacat Akibat Kecelakaan',
        'Welcome Bonus, Loyalty Bonus, dan mekanisme Investment Booster',
        'Opsi fleksibilitas: Premium Pass, Wealth Share, dan Change of Life Assured',
      ],
      callCriteria: {
        title: 'Kartu Skor Prudential PRUVantage Assure II',
        description:
          'Untuk mendapatkan kedudukan terbaik, penuhi seluruh kriteria evaluasi utama:',
        criteria: [
          'Terapkan Kerangka 3F (Feel, Felt, Found)',
          'Berikan penjelasan produk yang akurat',
          'Tunjukkan pengetahuan operasional',
          'Tangani keberatan',
        ],
      },
    },
    // Malaysian
    ms: {
      name: 'PRUVantage Assure II',
      keyFeatures: [
        'Polisi pautan pelaburan seumur hidup dengan premium tetap dalam Dolar Singapura',
        'Pilihan tempoh bayaran: 5, 10, 15, 20, atau 25 tahun',
        'Akaun Berkembar: Growth Account (Welcome Bonus lebih tinggi, dividen bermula tahun ke-11) dan Flex Account (dividen dari hari pertama)',
        'Ciri Wealth Assure pertama di pasaran: mengunci nilai akaun harian tertinggi (sehingga S$20 juta atau 3x premium seumur hidup)',
        'Jumlah Diinsuranskan bermula 103% daripada jumlah premium tetap, meningkat 3% setahun (faedah ringkas) sehingga 160% ',
        'Manfaat Kematian & Hilang Upaya Akibat Kemalangan: tertinggi daripada Sum Assured, Wealth Assure Value, atau nilai akaun (ditambah Additional Investment Account)',
        'Welcome Bonus untuk 3 tahun pertama; Loyalty Bonus 0.5% setahun selepas tempoh bayaran',
        'Investment Booster (Lump Sum) dari S$1,000 (caj 3%) dikreditkan ke Additional Investment Account',
        'Premium Pass untuk jeda premium; Wealth Share untuk membahagi polisi kepada sub-polisi',
        'Khusus UOB: peruntukan lalai 100% ke Growth Account; umur masuk sehingga 65 ANB',
      ],
      featureHighlight: {
        title:
          'Perlindungan susut nilai Wealth Assure dengan pertumbuhan Akaun Berkembar',
        description:
          'Kunci puncak portfolio melalui Wealth Assure sambil mengimbangi pertumbuhan dan fleksibiliti pendapatan melalui Growth dan Flex Account. Perlindungan meningkat apabila Sum Assured bertambah 3% setahun sehingga 160%, dengan Welcome & Loyalty Bonus menambah nilai jangka panjang.',
      },
      evaluationFocus: [
        'Penjelasan tepat tentang Wealth Assure dan had maksimum',
        'Perbezaan struktur Akaun Berkembar (Growth vs Flex) dan peruntukan khusus UOB',
        'Mekanisme Sum Assured: bermula 103%, naik 3%/tahun hingga 160%',
        'Logik pengiraan manfaat Kematian & Hilang Upaya Akibat Kemalangan',
        'Welcome Bonus, Loyalty Bonus, dan mekanisme Investment Booster',
        'Opsyen fleksibiliti: Premium Pass, Wealth Share, Change of Life Assured',
      ],
      callCriteria: {
        title: 'Kad Skor Prudential PRUVantage Assure II',
        description:
          'Untuk mendapat kedudukan terbaik, penuhi semua kriteria penilaian utama:',
        criteria: [
          'Gunakan Kerangka 3F (Feel, Felt, Found)',
          'Berikan penjelasan produk',
          'Tunjukkan pengetahuan operasi',
          'Kendalikan bantahan',
        ],
      },
    },
    // Tagalog (Filipino)
    tl: {
      name: 'PRUVantage Assure II',
      keyFeatures: [
        'Regular premium, whole-of-life na investment-linked policy sa Singapore Dollars',
        'Mga term ng bayad: 5, 10, 15, 20, o 25 taon',
        'Dual Accounts: Growth Account (mas mataas na Welcome Bonus, dividends mula year 11) at Flex Account (dividends mula day 1)',
        'First-in-market na Wealth Assure: nilalak ang pinakamataas na daily account value (hanggang S$20M o 3x lifetime premium)',
        'Sum Assured nagsisimula sa 103% ng total regular premiums, tumataas ng 3% kada taon (simple interest) hanggang 160%',
        'Death at Accidental Disability benefits: pinakamataas ng Sum Assured, Wealth Assure Value, o account value (plus Additional Investment Account)',
        'Welcome Bonus sa unang 3 taon; Loyalty Bonus na 0.5% taon-taon pagkatapos ng premium term',
        'Investment Booster (Lump Sum) mula S$1,000 (3% charge) papunta sa Additional Investment Account',
        'Premium Pass para sa pansamantalang premium break; Wealth Share para hatiin ang policy sa sub-policies',
        'UOB specifics: default 100% allocation sa Growth Account; max entry age hanggang 65 ANB',
      ],
      featureHighlight: {
        title:
          'Wealth Assure downside protection na may flexible Dual Account growth',
        description:
          'I-lock ang peak ng portfolio gamit ang Wealth Assure habang binabalanse ang growth at income flexibility sa Growth at Flex Accounts. Lumalaki ang coverage kasabay ng 3% taunang pagtaas ng Sum Assured hanggang 160%, kasama ang Welcome at Loyalty Bonus para sa pangmatagalang halaga.',
      },
      evaluationFocus: [
        'Tamang paliwanag ng Wealth Assure at maximum limits',
        'Pagkakaiba ng Dual Accounts (Growth vs Flex) at UOB-specific allocation',
        'Mekanismo ng Sum Assured: 103% simula, +3%/taon hanggang 160%',
        'Logika ng Death & Accidental Disability benefit computation',
        'Welcome Bonus, Loyalty Bonus, at Investment Booster mechanics',
        'Flex options: Premium Pass, Wealth Share, Change of Life Assured',
      ],
      callCriteria: {
        title: 'Prudential PRUVantage Assure II Scorecard',
        description:
          'Para makakuha ng pinakamataas na ranggo, tuparin ang mga pangunahing evaluation criteria:',
        criteria: [
          'Gamitin ang 3F (Feel, Felt, Found) Framework',
          'Magbigay ng malinaw na paliwanag sa produkto',
          'Ipakita ang operational knowledge',
          'Pamahalaan ang objections',
        ],
      },
    },
    // Vietnamese
    vi: {
      name: 'PRUVantage Assure II',
      keyFeatures: [
        'Hợp đồng bảo hiểm liên kết đầu tư trọn đời với phí định kỳ bằng Đồng Singapore',
        'Lựa chọn thời hạn đóng phí: 5, 10, 15, 20 hoặc 25 năm',
        'Tài khoản Kép: Growth Account (Welcome Bonus cao hơn, cổ tức từ năm 11) và Flex Account (cổ tức từ ngày đầu)',
        'Tính năng Wealth Assure đầu tiên trên thị trường: khóa giá trị tài khoản cao nhất theo ngày (tối đa S$20 triệu hoặc 3x phí trọn đời)',
        'Số tiền bảo hiểm bắt đầu từ 103% tổng phí định kỳ, tăng 3% mỗi năm (lãi đơn) tối đa 160%',
        'Quyền lợi Tử vong & Thương tật do Tai nạn: cao nhất giữa Sum Assured, Wealth Assure Value hoặc giá trị tài khoản (cộng Giá trị Tài khoản Đầu tư Bổ sung)',
        'Welcome Bonus trong 3 năm đầu; Loyalty Bonus 0,5% mỗi năm sau thời hạn đóng phí',
        'Investment Booster (Khoản nộp thêm) từ S$1.000 (phí 3%) ghi vào Additional Investment Account',
        'Premium Pass để tạm dừng đóng phí; Wealth Share để chia hợp đồng thành các hợp đồng nhỏ',
        'Dành cho UOB: phân bổ mặc định 100% vào Growth Account; tuổi tham gia tối đa 65 ANB',
      ],
      featureHighlight: {
        title:
          'Bảo vệ giảm giá trị bằng Wealth Assure cùng tăng trưởng linh hoạt với Tài khoản Kép',
        description:
          'Khóa đỉnh danh mục với Wealth Assure đồng thời cân bằng tăng trưởng và linh hoạt thu nhập qua Growth và Flex Accounts. Phạm vi bảo hiểm tăng khi Sum Assured tăng 3% mỗi năm tối đa 160%, cùng Welcome & Loyalty Bonus gia tăng giá trị dài hạn.',
      },
      evaluationFocus: [
        'Giải thích chính xác về Wealth Assure và giới hạn tối đa',
        'Khác biệt giữa Growth và Flex Account và phân bổ riêng của UOB',
        'Cơ chế Sum Assured: bắt đầu 103%, +3%/năm đến 160%',
        'Cách tính quyền lợi Tử vong & Thương tật do Tai nạn',
        'Welcome Bonus, Loyalty Bonus và Investment Booster',
        'Tùy chọn linh hoạt: Premium Pass, Wealth Share, Change of Life Assured',
      ],
      callCriteria: {
        title: 'Thẻ Điểm PRUVantage Assure II của Prudential',
        description:
          'Để đạt xếp hạng tốt nhất, hãy đáp ứng đầy đủ các tiêu chí đánh giá chính:',
        criteria: [
          'Áp dụng Khung 3F (Feel, Felt, Found)',
          'Cung cấp giải thích rõ ràng về sản phẩm',
          'Thể hiện kiến thức vận hành',
          'Xử lý các phản đối',
        ],
      },
    },
    // Thai
    th: {
      name: 'PRUVantage Assure II',
      keyFeatures: [
        'กรมธรรม์ชีวิตแบบเชื่อมโยงการลงทุนตลอดชีพ ชำระเบี้ยเป็นงวดด้วยสกุลดอลลาร์สิงคโปร์',
        'ตัวเลือกชำระเบี้ย: 5, 10, 15, 20 หรือ 25 ปี',
        'บัญชีคู่: Growth Account (Welcome Bonus สูงกว่า ปันผลตั้งแต่ปีที่ 11) และ Flex Account (ปันผลตั้งแต่วันแรก)',
        'คุณสมบัติ Wealth Assure แห่งแรกในตลาด: ล็อกมูลค่าบัญชีรายวันที่สูงสุด (สูงสุด S$20 ล้าน หรือ 3 เท่าของเบี้ยตลอดชีพ)',
        'จำนวนเงินเอาประกันเริ่มต้นที่ 103% ของเบี้ยประกันรวม เพิ่มขึ้น 3% ต่อปี (ดอกเบี้ยแบบ simple) จนถึง 160%',
        'ผลประโยชน์กรณีเสียชีวิตและทุพพลภาพจากอุบัติเหตุ: สูงสุดระหว่าง Sum Assured, Wealth Assure Value หรือมูลค่าบัญชี (บวก Additional Investment Account)',
        'Welcome Bonus ใน 3 ปีแรก; Loyalty Bonus 0.5% ต่อปีหลังจบระยะชำระเบี้ย',
        'Investment Booster (Lump Sum) ตั้งแต่ S$1,000 (ค่าธรรมเนียม 3%) เข้าสู่ Additional Investment Account',
        'Premium Pass สำหรับพักการชำระเบี้ยชั่วคราว; Wealth Share สำหรับแบ่งกรมธรรม์เป็นกรมธรรม์ย่อย',
        'สำหรับลูกค้า UOB: การจัดสรรเริ่มต้น 100% ไปยัง Growth Account; อายุรับประกันสูงสุด 65 ANB',
      ],
      featureHighlight: {
        title:
          'ปกป้องการลดลงด้วย Wealth Assure พร้อมการเติบโตที่ยืดหยุ่นผ่านบัญชีคู่',
        description:
          'ล็อกจุดสูงสุดของพอร์ตด้วย Wealth Assure ควบคู่กับสมดุลระหว่างการเติบโตและความยืดหยุ่นของรายได้ผ่านบัญชี Growth และ Flex ความคุ้มครองเพิ่มขึ้นตาม Sum Assured ที่เพิ่มขึ้นปีละ 3% จนถึง 160% พร้อม Welcome และ Loyalty Bonus เพื่อมูลค่าระยะยาว',
      },
      evaluationFocus: [
        'อธิบาย Wealth Assure และขีดจำกัดสูงสุดได้อย่างถูกต้อง',
        'ความแตกต่างระหว่างบัญชี Growth และ Flex และการจัดสรรเฉพาะของ UOB',
        'กลไก Sum Assured: เริ่มที่ 103% เพิ่ม 3% ต่อปี สูงสุด 160%',
        'ตรรกะการคำนวณผลประโยชน์กรณีเสียชีวิตและทุพพลภาพจากอุบัติเหตุ',
        'Welcome Bonus, Loyalty Bonus และ Investment Booster',
        'ทางเลือกด้านความยืดหยุ่น: Premium Pass, Wealth Share, Change of Life Assured',
      ],
      callCriteria: {
        title: 'บัตรคะแนน Prudential PRUVantage Assure II',
        description:
          'เพื่อให้ได้อันดับที่ดีที่สุด โปรดปฏิบัติตามเกณฑ์การประเมินหลักทั้งหมด:',
        criteria: [
          'ใช้กรอบ 3F (Feel, Felt, Found)',
          'ให้คำอธิบายผลิตภัณฑ์ที่ชัดเจน',
          'แสดงความรู้ด้านการดำเนินงาน',
          'จัดการกับข้อโต้แย้ง',
        ],
      },
    },

    // Traditional Chinese (Taiwan)
    cmn: {
      name: 'PRUVantage Assure II',
      keyFeatures: [
        '以新加坡幣計價的投資連結型終身壽險，定期繳費',
        '繳費年期選項：5、10、15、20 或 25 年',
        '雙帳戶：Growth Account（較高歡迎獎金，第 11 年起領取紅利）與 Flex Account（第一天起領取紅利）',
        '市場首創 Wealth Assure 功能：鎖定每日最高帳戶價值（最高 S$2,000 萬或 3 倍終身保費）',
        '保險金額從已繳定期保費的 103% 起算，每年增加 3%（單利）最高至 160%',
        '身故與意外失能給付：保險金額、Wealth Assure Value 或帳戶價值三者取高（另加額外投資帳戶）',
        '前 3 年歡迎獎金；繳費期滿後每年 0.5% 忠誠獎金',
        '投資加碼（整筆投入）最低 S$1,000 起（3% 費用）記入額外投資帳戶',
        'Premium Pass 提供暫停繳費；Wealth Share 可將保單分割為子保單',
        'UOB 通路專屬：預設 100% 配置至 Growth Account；最高投保年齡 65 ANB',
      ],
      featureHighlight: {
        title: 'Wealth Assure 下跌保護搭配靈活的雙帳戶成長',
        description:
          '透過 Wealth Assure 鎖定投資組合高峰，同時透過 Growth 與 Flex 帳戶平衡成長與收益彈性。保障隨保險金額每年增加 3%（最高 160%）而提升，加上歡迎獎金與忠誠獎金增進長期價值。',
      },
      evaluationFocus: [
        '正確說明 Wealth Assure 及其最高上限',
        '雙帳戶結構差異（Growth vs Flex）及 UOB 專屬配置',
        '保險金額機制：103% 起算、每年 +3% 最高 160%',
        '身故與意外失能給付計算邏輯',
        '歡迎獎金、忠誠獎金與投資加碼運作方式',
        '彈性選項：Premium Pass、Wealth Share、更換被保險人',
      ],
      callCriteria: {
        title: '保德信 PRUVantage Assure II 評分卡',
        description: '為了獲得最佳成績，請達成以下所有關鍵評估標準：',
        criteria: [
          '運用 3F（Feel感受、Felt認同、Found發現）框架',
          '提供清楚的產品說明',
          '展示營運知識',
          '處理客戶異議',
        ],
      },
    },
  },
};
