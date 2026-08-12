import { CompetitiveIntelligenceConfiguration } from './types.js';

// Default competitive intelligence with co-located translations
export const defaultCompetitiveIntelligenceConfiguration: CompetitiveIntelligenceConfiguration =
  {
    base: {
      id: 'default',
      company: 'default',
      targetMarket: 'general',
    },

    localized: {
      // English (Original)
      en: {
        competitors: [
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA Singapore',
            type: 'Investment-Linked Policy',
            keyFeatures: [
              '100% premium allocation from the start',
              'Welcome Bonuses totaling ~23% over first 3 years',
              'Access to AIA Elite Funds',
              'Premium holidays after certain years',
            ],
            strengths: [
              'Access to exclusive AIA Elite Funds',
              'Strong brand recognition',
              'Welcome bonus spread over 3 years (~23% total)',
            ],
            limitations: [
              'Lower welcome bonus compared to PRUVantage',
              'Minimal death benefit (only 101% of account value)',
              'Less generous loyalty bonuses',
            ],
            positioningStrategy:
              "PRUVantage Assure II offers significantly better protection with Sum Assured growing to 160% of premiums paid, whereas AIA Pro Achiever is 'very light on insurance component' with just 101% death benefit.",
          },
        ],
      },

      // Indonesian
      id: {
        competitors: [
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA Singapore',
            type: 'Polis Terkait Investasi',
            keyFeatures: [
              'Alokasi premi 100% sejak awal',
              'Bonus Selamat Datang total ~23% selama 3 tahun pertama',
              'Akses ke AIA Elite Funds',
              'Liburan premi setelah tahun tertentu',
            ],
            strengths: [
              'Akses ke AIA Elite Funds eksklusif',
              'Pengakuan merek yang kuat',
              'Bonus selamat datang tersebar selama 3 tahun (~23% total)',
            ],
            limitations: [
              'Bonus selamat datang lebih rendah dibanding PRUVantage',
              'Manfaat kematian minimal (hanya 101% dari nilai akun)',
              'Bonus loyalitas kurang murah hati',
            ],
            positioningStrategy:
              "PRUVantage Assure II menawarkan perlindungan yang jauh lebih baik dengan Sum Assured yang tumbuh hingga 160% dari premi yang dibayarkan, sedangkan AIA Pro Achiever 'sangat ringan pada komponen asuransi' dengan manfaat kematian hanya 101%.",
          },
        ],
      },

      // Malaysian
      ms: {
        competitors: [
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA Singapore',
            type: 'Polisi Berkaitan Pelaburan',
            keyFeatures: [
              '100% peruntukan premium dari permulaan',
              'Bonus Selamat Datang berjumlah ~23% selama 3 tahun pertama',
              'Akses kepada AIA Elite Funds',
              'Cuti premium selepas tahun tertentu',
            ],
            strengths: [
              'Akses kepada AIA Elite Funds eksklusif',
              'Pengiktirafan jenama yang kuat',
              'Bonus selamat datang tersebar selama 3 tahun (~23% jumlah)',
            ],
            limitations: [
              'Bonus selamat datang lebih rendah berbanding PRUVantage',
              'Manfaat kematian minimum (hanya 101% daripada nilai akaun)',
              'Bonus kesetiaan kurang murah hati',
            ],
            positioningStrategy:
              "PRUVantage Assure II menawarkan perlindungan yang jauh lebih baik dengan Sum Assured yang berkembang hingga 160% daripada premium yang dibayar, manakala AIA Pro Achiever 'sangat ringan pada komponen insurans' dengan manfaat kematian hanya 101%.",
          },
        ],
      },

      // Tagalog (Filipino)
      tl: {
        competitors: [
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA Singapore',
            type: 'Investment-Linked Policy',
            keyFeatures: [
              '100% premium allocation mula sa simula',
              'Welcome Bonuses na umabot ng ~23% sa unang 3 taon',
              'Access sa AIA Elite Funds',
              'Premium holidays pagkatapos ng ilang taon',
            ],
            strengths: [
              'Access sa exclusive AIA Elite Funds',
              'Malakas na brand recognition',
              'Welcome bonus na kumalat sa 3 taon (~23% total)',
            ],
            limitations: [
              'Mas mababang welcome bonus kumpara sa PRUVantage',
              'Minimal na death benefit (101% lang ng account value)',
              'Kulang sa loyalty bonuses',
            ],
            positioningStrategy:
              "Ang PRUVantage Assure II ay nag-ooffer ng mas magandang proteksyon na may Sum Assured na tumutubo hanggang 160% ng mga bayad na premiums, samantalang ang AIA Pro Achiever ay 'napaka-light sa insurance component' na may 101% death benefit lang.",
          },
        ],
      },

      // Vietnamese
      vi: {
        competitors: [
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA Singapore',
            type: 'Chính sách Liên kết Đầu tư',
            keyFeatures: [
              'Phân bổ 100% phí bảo hiểm ngay từ đầu',
              'Tiền thưởng chào mừng tổng cộng ~23% trong 3 năm đầu',
              'Truy cập vào AIA Elite Funds',
              'Kỳ nghỉ phí bảo hiểm sau một số năm nhất định',
            ],
            strengths: [
              'Truy cập vào AIA Elite Funds độc quyền',
              'Thương hiệu được công nhận mạnh mẽ',
              'Tiền thưởng chào mừng được phân bổ trong 3 năm (~23% tổng cộng)',
            ],
            limitations: [
              'Tiền thưởng chào mừng thấp hơn so với PRUVantage',
              'Quyền lợi tử vong tối thiểu (chỉ 101% giá trị tài khoản)',
              'Tiền thưởng trung thành ít hơn',
            ],
            positioningStrategy:
              "PRUVantage Assure II cung cấp sự bảo vệ tốt hơn đáng kể với Số tiền Bảo hiểm tăng lên 160% phí bảo hiểm đã trả, trong khi AIA Pro Achiever 'rất nhẹ về thành phần bảo hiểm' chỉ với quyền lợi tử vong 101%.",
          },
        ],
      },

      // Thai
      th: {
        competitors: [
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA Singapore',
            type: 'กรมธรรม์เชื่อมโยงการลงทุน',
            keyFeatures: [
              'การจัดสรรเบี้ยประกัน 100% ตั้งแต่เริ่มต้น',
              'โบนัสต้อนรับรวม ~23% ในช่วง 3 ปีแรก',
              'การเข้าถึง AIA Elite Funds',
              'การหยุดชำระเบี้ยประกันหลังจากปีที่กำหนด',
            ],
            strengths: [
              'การเข้าถึง AIA Elite Funds โดยเฉพาะ',
              'การรับรู้แบรนด์ที่แข็งแกร่ง',
              'โบนัสต้อนรับกระจายในช่วง 3 ปี (~23% รวม)',
            ],
            limitations: [
              'โบนัสต้อนรับที่ต่ำกว่าเมื่อเทียบกับ PRUVantage',
              'ผลประโยชน์กรณีเสียชีวิตน้อยที่สุด (เพียง 101% ของมูลค่าบัญชี)',
              'โบนัสความภักดีที่น้อยกว่า',
            ],
            positioningStrategy:
              "PRUVantage Assure II เสนอการปกป้องที่ดีกว่าอย่างมีนัยสำคัญด้วยจำนวนเงินประกันที่เติบโตถึง 160% ของเบี้ยประกันที่จ่าย ในขณะที่ AIA Pro Achiever 'เบาบางมากในส่วนประกันภัย' ด้วยผลประโยชน์เสียชีวิตเพียง 101%",
          },
        ],
      },

      // Cebuano
      ceb: {
        competitors: [
          {
            name: 'Pro Achiever 3.0',
            company: 'AIA Singapore',
            type: 'Investment-Linked Policy',
            keyFeatures: [
              '100% premium allocation gikan sa sinugdanan',
              'Welcome Bonuses nga moabot ug ~23% sa unang 3 ka tuig',
              'Access sa AIA Elite Funds',
              'Premium holidays human sa pipila ka tuig',
            ],
            strengths: [
              'Access sa eksklusibong AIA Elite Funds',
              'Lig-on nga pag-ila sa brand',
              'Welcome bonus nga gibulag-bulag sa 3 ka tuig (~23% total)',
            ],
            limitations: [
              'Mas ubos nga welcome bonus kay sa PRUVantage',
              'Minimal nga death benefit (101% lang sa account value)',
              'Kulang sa loyalty bonuses',
            ],
            positioningStrategy:
              "Ang PRUVantage Assure II nagtanyag ug mas maayong proteksyon nga adunay Sum Assured nga motubo hangtod 160% sa gibayad nga mga premiums, samtang ang AIA Pro Achiever 'gamay ra kaayo ang insurance component' nga adunay 101% death benefit lang.",
          },
        ],
      },
    },
  };
