import { Types } from 'mongoose';
import { StandingConfiguration } from '../../types/standings.js';
import { PRUDENTIAL_COMPANY_ID } from '../../utils/constants.js';
import { deepAllTrue, deepSomeTrue } from './common.js';

const prudentialColdCallStanding: StandingConfiguration = {
  base: {
    friendlyId: 'prudential-cold-call-v1',
    company: new Types.ObjectId(PRUDENTIAL_COMPANY_ID),
    module: 'cold-call',
    assessmentType: 'prudential',
    tiers: [
      {
        level: 1,
        criteria: [
          {
            assessmentArea: 'salesTechniques.clientVerification.completed',
            condition: 'is-true',
            value: true,
          },
        ],
      },
      {
        level: 2,
        criteria: [
          {
            assessmentArea: 'salesTechniques.clientVerification.completed',
            condition: 'is-true',
            value: true,
          },
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 34,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.successfulCount',
            condition: 'min-count',
            value: 1,
          },
        ],
      },
      {
        level: 3,
        criteria: [
          {
            assessmentArea: 'salesTechniques.clientVerification.completed',
            condition: 'is-true',
            value: true,
          },
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 67,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.successfulCount',
            condition: 'min-count',
            value: 2,
          },
        ],
      },
    ],
  },
  localized: {
    en: {
      name: 'Prudential Cold Call Standing V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: 'Complete client verification (Mandatory)',
              details: [
                "Open the call like 'Dear Mr/Ms/Mdm, I am <Name of CA/SCA>, CA/SCA from UOB. Is this a convenient time for you to talk?'",
                'Ask permission like "Before I proceed further with the call, may I do a simple verification with you to ensure that we\'re speaking to the intended recipient of this call?"',
                'Verify customer information by asking at least 2 eligible information',
              ],
            },
            {
              title: "Achieve at least 'Beginner' for 4C Execution",
              description:
                'Applies when there is either no attempt or only partial application of the 4C framework, which consists of:',
              subCriteria: [
                {
                  title: 'Capture:',
                  description:
                    "Get the prospect's attention by suggesting a hot or trending topic currently in the news.",
                },
                {
                  title: 'Context:',
                  description:
                    "Build rapport, frame the conversation, and acknowledge the client's situation with a relatable scenario and thought-provoking questions.",
                },
                {
                  title: 'Conflict:',
                  description:
                    'Identify and highlight potential financial risks to create urgency using pointed questions to prompt the client to consider consequences.',
                },
                {
                  title: 'Closure:',
                  description:
                    "Propose a clear solution and secure a follow-up meeting to discuss the client's specific needs.",
                },
              ],
            },
            {
              title: "Achieve at least 'Beginner' for Objection Handling",
              description:
                'Applies when objections are not handled or only minimally addressed.',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title: 'Complete client verification (Mandatory)',
              description: "See details in 'Sales Novice' criteria.",
            },
            {
              title: "Achieve at least 'Intermediate' for 4C Execution",
              description:
                "Apply all 4C framework steps in a scripted manner, e.g., reading the script word-for-word without adapting to the client's responses or showing real understanding (See 'Sales Novice' criteria for 4C framework explanation).",
            },
            {
              title: "Achieve at least 'Intermediate' for Objection Handling",
              description: 'Handle 1 objection.',
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: 'Complete client verification (Mandatory)',
              description: "See details in 'Sales Novice' criteria.",
            },
            {
              title: "Achieve at least 'Expert' for 4C Execution",
              description:
                "Apply the 4C framework dynamically, e.g., adjusted tone and phrasing based on the client's cues, asked clarifying questions, and naturally integrated the steps into the conversation (See 'Sales novice' criteria for 4C framework explanation).",
            },
            {
              title: "Achieve at least 'Expert' for Objection Handling",
              description: 'Handle 2 objection.',
            },
          ],
        },
      ],
    },
    id: {
      name: 'Prudential Cold Call Standing V1',
      tiers: [
        {
          name: 'Sales Pemula',
          criteria: [
            {
              title: 'Selesaikan verifikasi klien (Wajib)',
              details: [
                "Buka panggilan seperti 'Selamat pagi/siang/sore Bapak/Ibu, saya <Nama CA/SCA>, CA/SCA dari UOB. Apakah ini waktu yang tepat untuk berbicara?'",
                'Minta izin seperti "Sebelum saya melanjutkan panggilan ini, bolehkah saya melakukan verifikasi sederhana dengan Bapak/Ibu untuk memastikan bahwa kami berbicara dengan penerima yang tepat untuk panggilan ini?"',
                'Verifikasi informasi pelanggan dengan menanyakan setidaknya 2 informasi yang memenuhi syarat',
              ],
            },
            {
              title: "Mencapai setidaknya 'Pemula' untuk Eksekusi 4C",
              description: 'Menerapkan sebagian kerangka 4C yang terdiri dari:',
              subCriteria: [
                {
                  title: 'Capture:',
                  description:
                    'Dapatkan perhatian prospek dengan menyarankan topik hangat atau tren yang saat ini ada di berita.',
                },
                {
                  title: 'Context:',
                  description:
                    'Bangun hubungan baik, bentuk arah percakapan, dan akui situasi klien dengan skenario yang dapat dipahami serta pertanyaan yang merangsang pemikiran.',
                },
                {
                  title: 'Conflict:',
                  description:
                    'Identifikasi dan soroti potensi risiko keuangan untuk menciptakan urgensi dengan menggunakan pertanyaan terarah yang mendorong klien mempertimbangkan konsekuensinya.',
                },
                {
                  title: 'Closure:',
                  description:
                    'Usulkan solusi yang jelas dan pastikan pertemuan tindak lanjut untuk membahas kebutuhan spesifik klien.',
                },
              ],
            },
            {
              title: "Mencapai setidaknya 'Pemula' untuk Penanganan Keberatan",
              description: 'Berusaha menangani keberatan klien.',
            },
          ],
        },
        {
          name: 'Penasehat Berpengalaman',
          criteria: [
            {
              title: 'Selesaikan verifikasi klien (Wajib)',
              description: "Merujuk pada kriteria 'Sales Pemula'.",
            },
            {
              title: "Mencapai setidaknya 'Menengah' untuk Eksekusi 4C",
              description:
                "Terapkan semua langkah kerangka 4C secara terstruktur, misalnya membaca skrip kata demi kata tanpa menyesuaikan dengan tanggapan klien atau menunjukkan pemahaman mendalam (Lihat penjelasan kerangka 4C pada kriteria 'Sales Pemula').",
            },
            {
              title:
                "Mencapai setidaknya 'Menengah' untuk Penanganan Keberatan",
              description: 'Tangani 1 keberatan.',
            },
          ],
        },
        {
          name: 'Konsultan Strategis',
          criteria: [
            {
              title: 'Selesaikan verifikasi klien (Wajib)',
              description: "Lihat detail dalam kriteria 'Sales Pemula'.",
            },
            {
              title: "Mencapai setidaknya 'Ahli' untuk Eksekusi 4C",
              description:
                "Terapkan kerangka 4C secara dinamis, mis., nada dan ungkapan yang disesuaikan berdasarkan isyarat klien, mengajukan pertanyaan klarifikasi, dan secara alami mengintegrasikan langkah-langkah ke dalam percakapan (Lihat penjelasan kerangka 4C pada kriteria 'Sales Pemula').",
            },
            {
              title: "Mencapai setidaknya 'Ahli' untuk Penanganan Keberatan",
              description: 'Tangani 2 keberatan.',
            },
          ],
        },
      ],
    },
    ms: {
      name: 'Prudential Cold Call Standing V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: 'Lengkapkan pengesahan pelanggan (Wajib)',
              details: [
                "Buka panggilan seperti 'Tuan/Puan/Cik, saya <Nama CA/SCA>, CA/SCA dari UOB. Adakah ini masa yang sesuai untuk anda bercakap?'",
                'Minta izin seperti "Sebelum saya meneruskan panggilan ini, bolehkah saya membuat pengesahan ringkas dengan anda untuk memastikan bahawa kami bercakap dengan penerima yang sepatutnya bagi panggilan ini?"',
                'Sahkan maklumat pelanggan dengan menanyakan sekurang-kurangnya 2 maklumat yang layak',
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Permulaan' untuk Pelaksanaan 4C",
              description:
                'Guna pakai sebahagian rangka kerja 4C yang terdiri daripada:',
              subCriteria: [
                {
                  title: 'Capture:',
                  description:
                    'Dapatkan perhatian prospek dengan mencadangkan topik hangat atau tren yang sedang dibincangkan dalam berita.',
                },
                {
                  title: 'Context:',
                  description:
                    'Bina hubungan, rangkakan perbualan, dan akui keadaan pelanggan dengan senario yang boleh dikaitkan dan soalan yang merangsang pemikiran.',
                },
                {
                  title: 'Conflict:',
                  description:
                    'Kenal pasti dan serlahkan potensi risiko kewangan untuk mewujudkan kesegeraan menggunakan soalan-soalan yang ditujukan untuk mendorong pelanggan mempertimbangkan akibatnya.',
                },
                {
                  title: 'Closure:',
                  description:
                    'Cadangkan penyelesaian yang jelas dan aturkan mesyuarat susulan untuk membincangkan keperluan khusus pelanggan.',
                },
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Permulaan' untuk Pengendalian Bantahan",
              description: 'Cuba pengendalian bantahan.',
            },
          ],
        },
        {
          name: 'Penasihat Berkemahiran',
          criteria: [
            {
              title: 'Lengkapkan pengesahan pelanggan (Wajib)',
              description: "Lihat butiran dalam kriteria 'Sales Novice'.",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pelaksanaan 4C",
              description:
                "Gunakan semua langkah rangka kerja 4C secara skrip, cth., membaca skrip perkataan demi perkataan tanpa menyesuaikan diri dengan respons pelanggan atau menunjukkan pemahaman sebenar (Lihat penjelasan rangka kerja 4C dalam kriteria 'Sales novice').",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengendalian Bantahan",
              description: 'Kendalikan 1 bantahan.',
            },
          ],
        },
        {
          name: 'Perunding Strategik',
          criteria: [
            {
              title: 'Lengkapkan pengesahan pelanggan (Wajib)',
              description: "Lihat butiran dalam kriteria 'Sales Novice'.",
            },
            {
              title: "Capai sekurang-kurangnya 'Pakar' untuk Pelaksanaan 4C",
              description:
                "Gunakan rangka kerja 4C secara dinamik, cth., nada dan ungkapan yang disesuaikan berdasarkan isyarat pelanggan, bertanya soalan penjelasan, dan mengintegrasikan langkah-langkah secara semula jadi ke dalam perbualan (Lihat penjelasan rangka kerja 4C dalam kriteria 'Sales novice').",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengendalian Bantahan",
              description: 'Kendalikan 2 bantahan.',
            },
          ],
        },
      ],
    },
    tl: {
      name: 'Prudential Cold Call Standing V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: 'Kumpletuhin ang pag-verify ng kliyente (Mandatory)',
              details: [
                "Batiin ang kliyente tulad ng 'Magandang umaga/hapon/gabi po Mr/Ms/Mdm, ako po si <Pangalan ng CA/SCA>, CA/SCA mula sa UOB. Magandang oras po ba ito para makipag-usap?'",
                'Humingi ng pahintulot tulad ng "Bago ako magpatuloy sa tawag, maaari po ba akong magsagawa ng simpleng pag-verify sa inyo upang matiyak na kausap namin ang tamang tatanggap ng tawag na ito?"',
                'I-verify ang impormasyon ng customer sa pamamagitan ng pagtatanong ng hindi bababa sa 2 karapat-dapat na impormasyon',
              ],
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Beginner' para sa 4C Execution",
              description: 'Bahagyang ilapat ang 4C framework na binubuo ng:',
              subCriteria: [
                {
                  title: 'Capture:',
                  description:
                    'Kunin ang atensyon ng prospek sa pamamagitan ng pagmumungkahi ng isang mainit o trending na paksa na kasalukuyang nasa balita.',
                },
                {
                  title: 'Context:',
                  description:
                    'Bumuo ng ugnayan, i-frame ang pag-uusap, at kilalanin ang sitwasyon ng kliyente sa isang relatable na senaryo at mga tanong na nakakapukaw ng pag-iisip.',
                },
                {
                  title: 'Conflict:',
                  description:
                    'Tukuyin at i-highlight ang mga potensyal na panganib sa pananalapi upang lumikha ng pagkaapurahan gamit ang mga matutulis na tanong upang hikayatin ang kliyente na isaalang-alang ang mga kahihinatnan.',
                },
                {
                  title: 'Closure:',
                  description:
                    'Magmungkahi ng isang malinaw na solusyon at i-secure ang isang follow-up na pulong upang talakayin ang mga partikular na pangangailangan ng kliyente.',
                },
              ],
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Beginner' para sa Objection Handling",
              description: 'Subukang hawakan ang pagtutol.',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title: 'Kumpletuhin ang pag-verify ng kliyente (Mandatory)',
              description:
                "Tingnan ang mga detalye sa pamantayan ng 'Sales Novice'.",
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Intermediate' para sa 4C Execution",
              description:
                "Ilapat ang lahat ng mga hakbang sa 4C framework sa isang scripted na paraan, hal., pagbabasa ng script nang salita-sa-salita nang hindi umaangkop sa mga tugon ng kliyente o nagpapakita ng tunay na pag-unawa (Tingnan ang paliwanag ng 4C framework sa pamantayan ng 'Sales novice').",
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Intermediate' para sa Objection Handling",
              description: 'Hawakan ang 1 pagtutol.',
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: 'Kumpletuhin ang pag-verify ng kliyente (Mandatory)',
              description:
                "Tingnan ang mga detalye sa pamantayan ng 'Sales Novice'.",
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Expert' para sa 4C Execution",
              description:
                "Ilapat ang 4C framework nang pabago-bago, hal., inayos ang tono at pagpapahayag batay sa mga pahiwatig ng kliyente, nagtanong ng mga tanong sa paglilinaw, at natural na isinama ang mga hakbang sa pag-uusap (Tingnan ang paliwanag ng 4C framework sa pamantayan ng 'Sales novice').",
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Expert' para sa Objection Handling",
              description: 'Hawakan ang 2 pagtutol.',
            },
          ],
        },
      ],
    },
    vi: {
      name: 'Prudential Cold Call Standing V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: 'Hoàn thành xác minh khách hàng (Bắt buộc)',
              details: [
                "Mở đầu cuộc gọi như 'Chào buổi sáng/chiều/tối ạ, tôi là <Tên CA/SCA>, CA/SCA từ UOB. Bây giờ có phải là thời điểm thuận tiện để nói chuyện không ạ?'",
                'Xin phép như "Trước khi tôi tiếp tục cuộc gọi, tôi có thể thực hiện một xác minh đơn giản với ông/bà để đảm bảo rằng chúng tôi đang nói chuyện với người nhận dự định của cuộc gọi này không ạ?"',
                'Xác minh thông tin khách hàng bằng cách hỏi ít nhất 2 thông tin đủ điều kiện',
              ],
            },
            {
              title: "Đạt được ít nhất 'Người mới bắt đầu' cho Thực thi 4C",
              description: 'Áp dụng một phần khung 4C bao gồm:',
              subCriteria: [
                {
                  title: 'Capture:',
                  description:
                    'Thu hút sự chú ý của khách hàng tiềm năng bằng cách đề xuất một chủ đề nóng hoặc đang thịnh hành trên tin tức.',
                },
                {
                  title: 'Context:',
                  description:
                    'Xây dựng mối quan hệ, định hình cuộc trò chuyện và thừa nhận tình hình của khách hàng bằng một kịch bản dễ liên tưởng và các câu hỏi kích thích tư duy.',
                },
                {
                  title: 'Conflict:',
                  description:
                    'Xác định và làm nổi bật các rủi ro tài chính tiềm ẩn để tạo ra sự khẩn cấp bằng cách sử dụng các câu hỏi nhắm thẳng vào vấn đề để nhắc nhở khách hàng xem xét hậu quả.',
                },
                {
                  title: 'Closure:',
                  description:
                    'Đề xuất một giải pháp rõ ràng và đảm bảo một cuộc họp tiếp theo để thảo luận về nhu cầu cụ thể của khách hàng.',
                },
              ],
            },
            {
              title: "Đạt được ít nhất 'Người mới bắt đầu' cho Xử lý phản đối",
              description: 'Cố gắng xử lý phản đối.',
            },
          ],
        },
        {
          name: 'Cố vấn lành nghề',
          criteria: [
            {
              title: 'Hoàn thành xác minh khách hàng (Bắt buộc)',
              description: "Xem chi tiết trong tiêu chí 'Sales Novice'.",
            },
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Thực thi 4C",
              description:
                "Áp dụng tất cả các bước của khung 4C một cách có kịch bản, ví dụ: đọc kịch bản từng chữ một mà không điều chỉnh theo phản ứng của khách hàng hoặc thể hiện sự hiểu biết thực sự (Xem giải thích khung 4C trong tiêu chí 'Sales novice').",
            },
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Xử lý phản đối",
              description: 'Xử lý 1 phản đối.',
            },
          ],
        },
        {
          name: 'Tư vấn chiến lược',
          criteria: [
            {
              title: 'Hoàn thành xác minh khách hàng (Bắt buộc)',
              description: "Xem chi tiết trong tiêu chí 'Sales Novice'.",
            },
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Thực thi 4C",
              description:
                "Áp dụng khung 4C một cách linh hoạt, ví dụ: điều chỉnh giọng điệu và cách diễn đạt dựa trên tín hiệu của khách hàng, đặt câu hỏi làm rõ và tích hợp các bước một cách tự nhiên vào cuộc trò chuyện (Xem giải thích khung 4C trong tiêu chí 'Sales novice').",
            },
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Xử lý phản đối",
              description: 'Xử lý 2 phản đối.',
            },
          ],
        },
      ],
    },
    // Thai
    th: {
      name: 'Prudential Cold Call Standing V1',
      tiers: [
        {
          name: 'นักขายมือใหม่',
          criteria: [
            {
              title: 'ทำการยืนยันตัวตนลูกค้าให้สำเร็จ (บังคับ)',
              details: [
                "เปิดการสนทนาเช่น 'สวัสดีครับ/ค่ะ คุณ[ชื่อลูกค้า] ดิฉัน/ผมชื่อ <ชื่อ CA/SCA> เป็น CA/SCA จาก UOB ครับ/ค่ะ ตอนนี้สะดวกที่จะคุยไหมครับ/ค่ะ'",
                'ขออนุญาตเช่น "ก่อนที่จะดำเนินการสนทนาต่อ ขอความกรุณาทำการยืนยันตัวตนอย่างง่ายกับท่านเพื่อให้แน่ใจว่าเรากำลังพูดคุยกับผู้รับที่ถูกต้องของการโทรนี้ได้ไหมครับ/ค่ะ"',
                'ยืนยันข้อมูลลูกค้าโดยถามข้อมูลที่มีสิทธิ์อย่างน้อย 2 รายการ',
              ],
            },
            {
              title: "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับการดำเนินการ 4C",
              description: 'ใช้กรอบ 4C บางส่วนประกอบด้วย:',
              subCriteria: [
                {
                  title: 'Capture:',
                  description:
                    'ดึงดูดความสนใจของลูกค้าด้วยการเสนอหัวข้อที่กำลังเป็นที่นิยมหรือเป็นข่าวในปัจจุบัน',
                },
                {
                  title: 'Context:',
                  description:
                    'สร้างความสัมพันธ์ กำหนดกรอบการสนทนา และรับรู้สถานการณ์ของลูกค้าด้วยสถานการณ์ที่เข้าใจได้และคำถามที่กระตุ้นความคิด',
                },
                {
                  title: 'Conflict:',
                  description:
                    'ระบุและเน้นความเสี่ยงทางการเงินที่อาจเกิดขึ้นเพื่อสร้างความเร่งด่วนโดยใช้คำถามที่ชี้ประเด็นเพื่อกระตุ้นให้ลูกค้าพิจารณาผลที่ตามมา',
                },
                {
                  title: 'Closure:',
                  description:
                    'เสนอทางออกที่ชัดเจนและรับประกันการนัดหมายต่อไปเพื่อหารือเกี่ยวกับความต้องการเฉพาะของลูกค้า',
                },
              ],
            },
            {
              title: "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับการจัดการข้อโต้แย้ง",
              description: 'พยายามจัดการข้อโต้แย้ง',
            },
          ],
        },
        {
          name: 'ที่ปรึกษาที่มีทักษะ',
          criteria: [
            {
              title: 'ทำการยืนยันตัวตนลูกค้าให้สำเร็จ (บังคับ)',
              description: "ดูรายละเอียดในเกณฑ์ 'นักขายมือใหม่'",
            },
            {
              title: "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับการดำเนินการ 4C",
              description:
                "ใช้ขั้นตอนทั้งหมดของกรอบ 4C ในลักษณะที่เป็นสคริปต์ เช่น อ่านสคริปต์คำต่อคำโดยไม่ปรับตามการตอบสนองของลูกค้าหรือแสดงความเข้าใจที่แท้จริง (ดูคำอธิบายกรอบ 4C ในเกณฑ์ 'นักขายมือใหม่')",
            },
            {
              title: "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับการจัดการข้อโต้แย้ง",
              description: 'จัดการข้อโต้แย้ง 1 ข้อ',
            },
          ],
        },
        {
          name: 'ที่ปรึกษาเชิงกลยุทธ์',
          criteria: [
            {
              title: 'ทำการยืนยันตัวตนลูกค้าให้สำเร็จ (บังคับ)',
              description: "ดูรายละเอียดในเกณฑ์ 'นักขายมือใหม่'",
            },
            {
              title: "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับการดำเนินการ 4C",
              description:
                "ใช้กรอบ 4C อย่างยืดหยุ่น เช่น ปรับน้ำเสียงและการใช้ถ้อยคำตามสัญญาณของลูกค้า ถามคำถามเพื่อความชัดเจน และผสมผสานขั้นตอนต่างๆ เข้ากับการสนทนาอย่างเป็นธรรมชาติ (ดูคำอธิบายกรอบ 4C ในเกณฑ์ 'นักขายมือใหม่')",
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับการจัดการข้อโต้แย้ง",
              description: 'จัดการข้อโต้แย้ง 2 ข้อ',
            },
          ],
        },
      ],
    },
    ceb: {
      name: 'Prudential Cold Call Standing V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: 'Kumpletuha ang pag-verify sa kliyente (Mandatory)',
              details: [
                "Ablihi ang tawag sama sa 'Maayong buntag/udto/gabii Mr/Ms/Mdm, ako si <Ngalan sa CA/SCA>, CA/SCA gikan sa UOB. Maayo ba kining panahona para makig-estorya?'",
                'Pangayo ug pagtugot sama sa "Sa dili pa ako magpadayon sa tawag, mahimo ba nakong buhaton ang yano nga pag-verify sa inyo aron masiguro nga kami nakig-estorya sa gitagana nga makadawat niining tawaga?"',
                'I-verify ang impormasyon sa kostumer pinaagi sa pagpangutana sa labing menos 2 angay nga impormasyon',
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa 4C Execution",
              description:
                'Magamit kon walay paningkamot o bahin lang sa aplikasyon sa 4C framework, nga naglangkob sa:',
              subCriteria: [
                {
                  title: 'Capture:',
                  description:
                    'Kuhaa ang atensyon sa prospect pinaagi sa pagsugyot sa init o trending nga hilisgutan nga karon anaa sa balita.',
                },
                {
                  title: 'Context:',
                  description:
                    'Pagtukod ug relasyon, i-frame ang pag-istoryahanay, ug dawata ang sitwasyon sa kliyente nga adunay relatable nga senaryo ug mga pangutana nga makapa-hunahuna.',
                },
                {
                  title: 'Conflict:',
                  description:
                    'Ilha ug pasiugdaha ang potensyal nga risgo sa pinansya aron makamugna ug pagdali gamit ang mga pangutana nga direkta aron madasig ang kliyente nga maghunahuna sa mga sangputanan.',
                },
                {
                  title: 'Closure:',
                  description:
                    'Isugyot ang tin-aw nga solusyon ug siguroha ang follow-up nga miting aron hisgotan ang piho nga mga panginahanglan sa kliyente.',
                },
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa Objection Handling",
              description:
                'Magamit kon ang mga pagsupak wala mahawaa o gamay lang nga gitubag.',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title: 'Kumpletuha ang pag-verify sa kliyente (Mandatory)',
              description:
                "Tan-awa ang mga detalye sa 'Sales Novice' nga mga sukdanan.",
            },
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa 4C Execution",
              description:
                "Gamita ang tanan nga mga lakang sa 4C framework sa scripted nga pamaagi, pananglitan, pagbasa sa script nga pulong-sa-pulong nga wala mag-adjust sa mga tubag sa kliyente o nagpakita sa tinuod nga pagsabot (Tan-awa ang pagpatin-aw sa 4C framework sa 'Sales Novice' nga mga sukdanan).",
            },
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa Objection Handling",
              description: 'Hawaka ang 1 ka pagsupak.',
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: 'Kumpletuha ang pag-verify sa kliyente (Mandatory)',
              description:
                "Tan-awa ang mga detalye sa 'Sales Novice' nga mga sukdanan.",
            },
            {
              title: "Makab-ot ang labing menos 'Expert' para sa 4C Execution",
              description:
                "Gamita ang 4C framework nga dinamiko, pananglitan, gi-adjust ang tono ug pagpahayag base sa mga pahimangnon sa kliyente, nangutana ug mga pangutana sa pagtin-aw, ug natural nga gilakip ang mga lakang sa pag-istoryahanay (Tan-awa ang pagpatin-aw sa 4C framework sa 'Sales Novice' nga mga sukdanan).",
            },
            {
              title:
                "Makab-ot ang labing menos 'Expert' para sa Objection Handling",
              description: 'Hawaka ang 2 ka pagsupak.',
            },
          ],
        },
      ],
    },
  },
};

// PLI Product Positioning Standing
const prudentialPLIProductPositioningStanding: StandingConfiguration = {
  base: {
    friendlyId: 'prudential-pli-product-positioning-v1',
    company: new Types.ObjectId(PRUDENTIAL_COMPANY_ID),
    module: 'product-positioning',
    product: 'prulifetime-income-plus',
    assessmentType: 'prudential',
    tiers: [
      {
        level: 1,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 0,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.attemptCount',
            condition: 'min-count',
            value: 0,
          },
        ],
      },
      {
        level: 2,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 34,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.successfulCount',
            condition: 'min-count',
            value: 1,
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.prulifetimeAssessment.prulifetimeBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.prulifetimeAssessment?.prulifetimeBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.prulifetimeAssessment.prulifetimeBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.prulifetimeAssessment?.prulifetimeBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
        ],
      },
      {
        level: 3,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 67,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.successfulCount',
            condition: 'min-count',
            value: 2,
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.prulifetimeAssessment.prulifetimeBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.prulifetimeAssessment?.prulifetimeBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.prulifetimeAssessment.prulifetimeIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.prulifetimeAssessment?.prulifetimeIntermediate;
              if (!intermediate) return false;
              return deepAllTrue(intermediate);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.prulifetimeAssessment.prulifetimeBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.prulifetimeAssessment?.prulifetimeBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.prulifetimeAssessment.prulifetimeIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.prulifetimeAssessment?.prulifetimeIntermediate;
              if (!intermediate) return false;
              return deepAllTrue(intermediate);
            },
          },
        ],
      },
    ],
  },
  localized: {
    en: {
      name: 'Prudential PLI Product Positioning V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: "Achieve at least 'Beginner' for 3F Execution",
              description:
                'Partially apply the 3F framework by covering some (but not all) of the three steps:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    "Acknowledge the client's concern by reflecting how they feel.",
                },
                {
                  title: 'Felt:',
                  description:
                    'Share that others have felt similarly to build rapport.',
                },
                {
                  title: 'Found:',
                  description:
                    'Explain what others found helpful or reassuring about this plan.',
                },
              ],
            },
            {
              title: "Achieve at least 'Beginner' for Objection Handling",
              description:
                'Applies when objections are not handled or only minimally addressed.',
            },
            {
              title: "Achieve at least 'Beginner' for Product Knowledge",
              description:
                'Provide a partial explanation of the product information, covering some (but not all) of the following key items:',
              details: [
                'Provide the headline of the solution: It is an insurance solution that provides a regular stream of monthly income for life.',
                "Explain how this solution addresses client's needs: State client's identified financial objective, the justification of how this plan suits client's requirements and financial objectives.",
                'Explain Unique Selling Points of the solution: Monthly cash benefit starting from the 49th month, Other built-in benefits (Disability waiver benefit, retrenchment benefit, change of life assured benefit)',
                'Explain coverage provided in the solution: Death benefit, accidental death benefit',
                'Explain the guaranteed and non-guaranteed portions in the solution: Cash Benefit, Death Benefit, Maturity Benefit (if any)',
                "Explain the timeline of the policy: Available premium payment terms, policy term, how does this solution fits into client's time horizon for this financial objective",
                "Explain the premium amount proposed for the solution: Why this amount is proposed, how can this address client's identified shortfall/gap for the financial objective, find out and explain if this amount is within client's affordability",
                'Explain the risks and limitations of the solution: implication of early surrender or termination, pre-existing conditions, fees and charges involved, risks involved in this plan, free-look period',
                'Explain how this plan differs from fixed deposits and highlight why it offers better benefits for the client.',
              ],
            },
            {
              title: "Achieve at least 'Beginner' for Operational Knowledge",
              description:
                'Explain the nature of this solution: This is a Guaranteed Issuance Offer plan and what does this mean.',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title: "Achieve at least 'Intermediate' for 3F Execution",
              description:
                "Apply all the 3F framework steps in a scripted manner, e.g., reading the script word-for-word without adapting to the client's responses or showing real understanding (See 'Sales novice' criteria for 3F framework explanation).",
            },
            {
              title: "Achieve at least 'Intermediate' for Objection Handling",
              description: 'Handle 1 objection.',
            },
            {
              title: "Achieve at least 'Intermediate' for Product Knowledge",
              description:
                "Fully explain all product information (Refer to the 'Sales Novice' criteria for the full list of product information items).",
            },
            {
              title:
                "Achieve at least 'Intermediate' for Operational Knowledge",
              description:
                "Meet all requirements of the 'Beginner' level, plus:",
              details: [
                'Declare any pre-existing conditions, and the implications ie. Premiums will be refunded.',
                'Explain the process required to any servicing requests specific to the solution: How to change second life assured.',
              ],
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: "Achieve at least 'Expert' for 3F Execution",
              description:
                "Apply the 3F framework dynamically, e.g., adjusted tone and phrasing based on the client's cues, asked clarifying questions, and naturally integrated the steps into the conversation (See 'Sales Novice' criteria for 3F framework explanation).",
            },
            {
              title: "Achieve at least 'Expert' for Objection Handling",
              description: 'Handle 2 objection.',
            },
            {
              title: "Achieve at least 'Expert' for Product Knowledge",
              description:
                "Meet all requirements of the 'Intermediate' level, plus:",
              details: [
                "Relate unique selling points to client's scenario",
                "Relate coverage benefits to client's scenario",
                "Speak the timeline of the policy in client's age and perspective",
              ],
            },
            {
              title: "Achieve at least 'Expert' for Operational Knowledge",
              description:
                "Meet all requirements of the 'Intermediate' level, plus:",
              details: [
                'Make comparison with similar solutions from competitor and explain briefly the differences, the pros and cons.',
              ],
            },
          ],
        },
      ],
    },
    id: {
      name: 'Prudential PLI Product Positioning V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: "Mencapai setidaknya 'Pemula' untuk Eksekusi 3F",
              description:
                'Menerapkan sebagian kerangka 3F dengan mencakup beberapa (tetapi tidak semua) dari tiga langkah:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    'Akui kekhawatiran klien dengan merefleksikan perasaan mereka.',
                },
                {
                  title: 'Felt:',
                  description:
                    'Bagikan bahwa orang lain pernah merasakan hal yang sama untuk membangun hubungan.',
                },
                {
                  title: 'Found:',
                  description:
                    'Jelaskan apa yang orang lain anggap membantu atau meyakinkan tentang rencana ini.',
                },
              ],
            },
            {
              title: "Mencapai setidaknya 'Pemula' untuk Penanganan Keberatan",
              description: 'Berusaha menangani keberatan klien.',
            },
            {
              title: "Mencapai setidaknya 'Pemula' untuk Pengetahuan Produk",
              description:
                'Berikan penjelasan mengenai informasi produk, minimal mencakup beberapa dari item penting berikut:',
              details: [
                'Berikan judul utama solusi: Ini adalah solusi asuransi yang menyediakan aliran pendapatan bulanan yang teratur seumur hidup.',
                'Jelaskan bagaimana solusi ini mengatasi kebutuhan klien: Sampaikan tujuan keuangan yang telah diidentifikasi klien, dan jelaskan bagaimana rencana ini sesuai dengan kebutuhan serta tujuan keuangan klien.',
                'Jelaskan Keunggulan Unik dari solusi: Manfaat tunai bulanan mulai dari bulan ke-49, Manfaat tambahan lainnya (manfaat bebas premi karena cacat, manfaat PHK, manfaat perubahan tertanggung)',
                'Jelaskan perlindungan yang diberikan dalam solusi: Manfaat kematian, manfaat kematian akibat kecelakaan',
                'Jelaskan bagian yang dijamin dan tidak dijamin dalam solusi: Manfaat Tunai, Manfaat Kematian, Manfaat Jatuh Tempo (jika ada)',
                'Jelaskan jangka waktu polis: Pilihan masa pembayaran premi yang tersedia, masa berlaku polis, dan bagaimana solusi ini sesuai dengan target waktu klien untuk tujuan keuangan ini',
                'Jelaskan jumlah premi yang diusulkan untuk solusi: Alasan mengapa jumlah ini diusulkan, bagaimana hal ini dapat mengatasi kekurangan/kesenjangan yang diidentifikasi klien untuk tujuan keuangan, pastikan dan jelaskan apakah jumlah ini sesuai dengan kemampuan finansial klien',
                'Jelaskan risiko dan batasan solusi: implikasi dari penyerahan atau penghentian awal, kondisi yang sudah ada sebelumnya, biaya dan ongkos yang terlibat, risiko yang terlibat dalam rencana ini, masa peninjauan bebas',
                'Jelaskan bagaimana rencana ini berbeda dari deposito berjangka dan soroti mengapa ini menawarkan manfaat yang lebih baik bagi klien.',
              ],
            },
            {
              title: "Mencapai setidaknya 'Pemula' untuk Pengetahuan Operasi",
              description:
                'Jelaskan sifat solusi ini: Ini adalah rencana Guaranteed Issuance Offer dan penjelasan mengenai artinya.',
            },
          ],
        },
        {
          name: 'Penasihat Terampil',
          criteria: [
            {
              title: "Mencapai setidaknya 'Menengah' untuk Eksekusi 3F",
              description:
                "Terapkan semua langkah kerangka 3F secara skrip, mis., membaca skrip kata demi kata tanpa beradaptasi dengan respons klien atau menunjukkan pemahaman nyata (Lihat penjelasan kerangka 3F pada kriteria 'Sales novice').",
            },
            {
              title:
                "Mencapai setidaknya 'Menengah' untuk Penanganan Keberatan",
              description: 'Tangani 1 keberatan.',
            },
            {
              title: "Mencapai setidaknya 'Menengah' untuk Pengetahuan Produk",
              description:
                "Jelaskan sepenuhnya semua informasi produk (Lihat kriteria 'Sales Novice' untuk daftar lengkap item informasi produk).",
            },
            {
              title:
                "Mencapai setidaknya 'Menengah' untuk Pengetahuan Operasional",
              description:
                "Penuhi semua persyaratan tingkat 'Pemula', ditambah:",
              details: [
                'Menyatakan kondisi kesehatan yang sudah ada sebelumnya, dan implikasinya yaitu premi akan dikembalikan.',
                'Jelaskan proses yang diperlukan untuk permintaan layanan khusus terkait solusi: Cara mengubah tertanggung kedua.',
              ],
            },
          ],
        },
        {
          name: 'Konsultan Strategis',
          criteria: [
            {
              title: "Mencapai setidaknya 'Ahli' untuk Eksekusi 3F",
              description:
                "Terapkan kerangka 3F secara dinamis, mis., nada dan ungkapan yang disesuaikan berdasarkan isyarat klien, mengajukan pertanyaan klarifikasi, dan secara alami mengintegrasikan langkah-langkah ke dalam percakapan (Lihat penjelasan kerangka 3F pada kriteria 'Sales novice').",
            },
            {
              title: "Mencapai setidaknya 'Ahli' untuk Penanganan Keberatan",
              description: 'Tangani 2 keberatan.',
            },
            {
              title: "Mencapai setidaknya 'Ahli' untuk Pengetahuan Produk",
              description:
                "Penuhi semua persyaratan tingkat 'Menengah', ditambah:",
              details: [
                'Kaitkan poin penjualan unik dengan skenario klien',
                'Kaitkan manfaat pertanggungan dengan skenario klien',
                'Bicarakan jangka waktu polis sesuai usia dan perspektif klien',
              ],
            },
            {
              title: "Mencapai setidaknya 'Ahli' untuk Pengetahuan Operasional",
              description:
                "Penuhi semua persyaratan tingkat 'Menengah', ditambah:",
              details: [
                'Bandingkan dengan solusi serupa dari pesaing dan jelaskan secara singkat perbedaan, pro, dan kontranya.',
              ],
            },
          ],
        },
      ],
    },
    ms: {
      name: 'Prudential PLI Product Positioning V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title:
                "Capai sekurang-kurangnya 'Permulaan' untuk Pelaksanaan 3F",
              description:
                'Guna pakai sebahagian rangka kerja 3F dengan merangkumi beberapa (tetapi bukan semua) daripada tiga langkah:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    'Akui kebimbangan pelanggan dengan mencerminkan perasaan mereka.',
                },
                {
                  title: 'Felt:',
                  description:
                    'Kongsikan bahawa orang lain pernah merasa perkara yang sama untuk membina hubungan.',
                },
                {
                  title: 'Found:',
                  description:
                    'Terangkan apa yang orang lain dapati membantu atau meyakinkan tentang pelan ini.',
                },
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Permulaan' untuk Pengendalian Bantahan",
              description: 'Cuba pengendalian bantahan.',
            },
            {
              title:
                "Capai sekurang-kurangnya 'Permulaan' untuk Pengetahuan Produk",
              description:
                'Berikan penjelasan sebahagian tentang maklumat produk, merangkumi beberapa (tetapi tidak semua) item utama berikut:',
              details: [
                'Berikan tajuk utama penyelesaian: Ia adalah penyelesaian insurans yang menyediakan aliran pendapatan bulanan yang tetap seumur hidup.',
                'Terangkan bagaimana penyelesaian ini menangani keperluan pelanggan: Nyatakan objektif kewangan pelanggan yang dikenal pasti, justifikasi bagaimana pelan ini sesuai dengan keperluan dan objektif kewangan pelanggan.',
                'Terangkan Titik Jualan Unik penyelesaian: Faedah tunai bulanan bermula dari bulan ke-49, Faedah terbina dalam yang lain (faedah pengecualian hilang upaya, faedah pemberhentian kerja, faedah penukaran hayat yang diinsuranskan)',
                'Terangkan perlindungan yang disediakan dalam penyelesaian: Faedah kematian, faedah kematian akibat kemalangan',
                'Terangkan bahagian yang dijamin dan tidak dijamin dalam penyelesaian: Faedah Tunai, Faedah Kematian, Faedah Kematangan (jika ada)',
                'Terangkan garis masa polisi: Tempoh pembayaran premium yang tersedia, tempoh polisi, bagaimana penyelesaian ini sesuai dengan horizon masa pelanggan untuk objektif kewangan ini',
                'Terangkan jumlah premium yang dicadangkan untuk penyelesaian: Mengapa jumlah ini dicadangkan, bagaimana ia dapat menangani kekurangan/jurang yang dikenal pasti pelanggan untuk objektif kewangan, ketahui dan terangkan jika jumlah ini berada dalam kemampuan pelanggan',
                'Terangkan risiko dan batasan penyelesaian: implikasi penyerahan atau penamatan awal, keadaan sedia ada, yuran dan caj yang terlibat, risiko yang terlibat dalam pelan ini, tempoh percubaan',
                'Terangkan bagaimana pelan ini berbeza daripada simpanan tetap dan serlahkan mengapa ia menawarkan faedah yang lebih baik untuk pelanggan.',
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Permulaan' untuk Pengetahuan Operasi",
              description:
                'Terangkan sifat penyelesaian ini: Ini adalah pelan Tawaran Pengunderaitan Terjamin dan apa maksudnya.',
            },
          ],
        },
        {
          name: 'Penasihat Berkemahiran',
          criteria: [
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pelaksanaan 3F",
              description:
                "Gunakan semua langkah rangka kerja 3F secara skrip, cth., membaca skrip perkataan demi perkataan tanpa menyesuaikan diri dengan respons pelanggan atau menunjukkan pemahaman sebenar (Lihat penjelasan rangka kerja 3F dalam kriteria 'Sales novice').",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengendalian Bantahan",
              description: 'Kendalikan 1 bantahan.',
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengetahuan Produk",
              description:
                "Terangkan sepenuhnya semua maklumat produk (Rujuk kriteria 'Sales Novice' untuk senarai penuh item maklumat produk).",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengetahuan Operasi",
              description:
                "Penuhi semua keperluan tahap 'Permulaan', ditambah:",
              details: [
                'Isytiharkan sebarang keadaan sedia ada, dan implikasinya iaitu. Premium akan dibayar balik.',
                'Terangkan proses yang diperlukan untuk sebarang permintaan perkhidmatan khusus untuk penyelesaian: Cara menukar hayat kedua yang diinsuranskan.',
              ],
            },
          ],
        },
        {
          name: 'Perunding Strategik',
          criteria: [
            {
              title: "Capai sekurang-kurangnya 'Pakar' untuk Pelaksanaan 3F",
              description:
                "Gunakan rangka kerja 3F secara dinamik, cth., nada dan ungkapan yang disesuaikan berdasarkan isyarat pelanggan, bertanya soalan penjelasan, dan mengintegrasikan langkah-langkah secara semula jadi ke dalam perbualan (Lihat penjelasan rangka kerja 3F dalam kriteria 'Sales novice').",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengendalian Bantahan",
              description: 'Kendalikan 2 bantahan.',
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengetahuan Produk",
              description:
                "Penuhi semua keperluan tahap 'Pertengahan', ditambah:",
              details: [
                'Kaitkan titik jualan unik dengan senario pelanggan',
                'Kaitkan faedah perlindungan dengan senario pelanggan',
                'Sebutkan garis masa polisi mengikut umur dan perspektif pelanggan',
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengetahuan Operasi",
              description:
                "Penuhi semua keperluan tahap 'Pertengahan', ditambah:",
              details: [
                'Bandingkan dengan penyelesaian serupa daripada pesaing: Terangkan secara ringkas perbezaan, kebaikan dan keburukan.',
              ],
            },
          ],
        },
      ],
    },
    tl: {
      name: 'Prudential PLI Product Positioning V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title:
                "Makamit ang hindi bababa sa 'Beginner' para sa 3F Execution",
              description:
                'Bahagyang ilapat ang 3F framework sa pamamagitan ng pag-cover ng ilan (ngunit hindi lahat) sa tatlong hakbang:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    'Kilalanin ang alalahanin ng kliyente sa pamamagitan ng pagpapakita kung ano ang kanilang nararamdaman.',
                },
                {
                  title: 'Felt:',
                  description:
                    'Ibahagi na ang iba ay naramdaman din ng katulad upang bumuo ng ugnayan.',
                },
                {
                  title: 'Found:',
                  description:
                    'Ipaliwanag kung ano ang natuklasan ng iba na nakakatulong o nakakapanatag sa planong ito.',
                },
              ],
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Beginner' para sa Objection Handling",
              description: 'Subukang hawakan ang pagtutol.',
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Beginner' para sa Product Knowledge",
              description:
                'Magbigay ng paliwanag sa produkto, na sumasaklaw sa ilan o lahat ng mga sumusunod na pangunahing item:',
              details: [
                'Ibigay ang headline ng solusyon: Ang 3F framework ay isang Guaranteed Issuance Offer plan at ano ang ibig sabihin nito.',
                'Ipaliwanag kung paano tinutugunan ng solusyon na ito ang mga pangangailangan ng kliyente: Sabihin ang natukoy na layunin sa pananalapi ng kliyente, ang katwiran kung paano nababagay ang planong ito sa mga kinakailangan at layunin sa pananalapi ng kliyente.',
                'Ipaliwanag ang Mga Natatanging Selling Point ng solusyon: Manfaat tunai bulanan mulai sa ika-49 na buwan, Iba pang built-in benepisyo (benepisyo sa pag-waive ng kapansanan, benepisyo sa retrenchment, benepisyo sa pagbabago ng life assured)',
                'Ipaliwanag ang saklaw na ibinigay sa solusyon: Benepisyo sa pagkamatay, benepisyo sa aksidenteng pagkamatay',
                'Ipaliwanag ang garantisado at hindi garantisadong mga bahagi sa solusyon: Cash Benefit, Death Benefit, Maturity Benefit (kung mayroon man)',
                'Ipaliwanag ang timeline ng patakaran: Mga magagamit na termino sa pagbabayad ng premium, termino ng patakaran, paano umaangkop ang solusyon na ito sa time horizon ng kliyente para sa layuning ito sa pananalapi',
                'Ipaliwanag ang iminungkahing halaga ng premium para sa solusyon: Bakit iminungkahi ang halagang ito, paano nito matutugunan ang natukoy na kakulangan/puwang ng kliyente para sa layunin sa pananalapi, alamin at ipaliwanag kung ang halagang ito ay nasa abot-kayang halaga ng kliyente',
                'Ipaliwanag ang mga panganib at limitasyon ng solusyon: implikasyon ng maagang pagsuko o pagwawakas, mga pre-existing na kondisyon, mga bayarin at singil na kasangkot, mga panganib na kasangkot sa planong ito, free-look period',
                'Ipaliwanag kung paano naiiba ang planong ito mula sa mga fixed deposit at i-highlight kung bakit nag-aalok ito ng mas mahusay na mga benepisyo para sa kliyente.',
              ],
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Beginner' para sa Operational Knowledge",
              description:
                'Ipaliwanag ang kalikasan ng solusyon na ito: Ito ay isang full medical underwriting plan at mangangailangan ito ng full medical underwriting para sa kliyente',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title:
                "Makamit ang hindi bababa sa 'Intermediate' para sa 3F Execution",
              description:
                "Ilapat ang lahat ng mga hakbang sa 3F framework sa isang scripted na paraan, hal., pagbabasa ng script nang salita-sa-salita nang hindi umaangkop sa mga tugon ng kliyente o nagpapakita ng tunay na pag-unawa (Tingnan ang paliwanag ng 3F framework sa pamantayan ng 'Sales novice').",
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Intermediate' para sa Objection Handling",
              description: 'Hawakan ang 1 pagtutol.',
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Intermediate' para sa Product Knowledge",
              description:
                "Ganap na ipaliwanag ang lahat ng impormasyon ng produkto (Sumangguni sa pamantayan ng 'Sales Novice' para sa buong listahan ng mga item ng impormasyon ng produkto).",
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Intermediate' para sa Operational Knowledge",
              description:
                "Matugunan ang lahat ng mga kinakailangan ng antas ng 'Beginner', kasama ang:",
              details: [
                'Idedeklara ang anumang pre-existing na kondisyon, at ang mga implikasyon nito, hal. Ibabalik ang mga premium.',
                'Ipaliwanag ang proseso na kinakailangan sa anumang mga kahilingan sa serbisyo na partikular sa solusyon: Cara baguhin ang pangalawang life assured.',
              ],
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title:
                "Makamit ang hindi bababa sa 'Expert' para sa 3F Execution",
              description:
                "Ilapat ang 3F framework nang pabago-bago, hal., inayos ang tono at pagpapahayag batay sa mga pahiwatig ng kliyente, nagtanong ng mga tanong sa paglilinaw, at natural na isinama ang mga hakbang sa pag-uusap (Tingnan ang paliwanag ng 3F framework sa pamantayan ng 'Sales novice').",
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Expert' para sa Objection Handling",
              description: 'Hawakan ang 2 pagtutol.',
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Expert' para sa Product Knowledge",
              description:
                "Matugunan ang lahat ng mga kinakailangan ng antas ng 'Intermediate', kasama ang:",
              details: [
                'Iugnay ang mga natatanging selling point sa senaryo ng kliyente',
                'Iugnay ang mga benepisyo sa saklaw sa senaryo ng kliyente',
                'Sabihin ang timeline ng patakaran sa edad at pananaw ng kliyente',
              ],
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Expert' para sa Operational Knowledge",
              description:
                "Matugunan ang lahat ng mga kinakalaman ng antas ng 'Intermediate', kasama ang:",
              details: [
                'Bandingkan dengan mga katulad na solusyon mula sa kakumpitensya: Ipaliwanag nang maikli ang mga pagkakaiba, ang mga kalamangan at kahinaan.',
              ],
            },
          ],
        },
      ],
    },
    vi: {
      name: 'Prudential PLI Product Positioning V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: "Đạt được ít nhất 'Người mới bắt đầu' cho Thực thi 3F",
              description:
                'Áp dụng một phần khung 3F bằng cách bao gồm một số (nhưng không phải tất cả) trong ba bước:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    'Thừa nhận mối quan tâm của khách hàng bằng cách phản ánh cảm xúc của họ.',
                },
                {
                  title: 'Felt:',
                  description:
                    'Chia sẻ rằng những người khác cũng đã cảm thấy tương tự để xây dựng mối quan hệ.',
                },
                {
                  title: 'Found:',
                  description:
                    'Giải thích những gì người khác thấy hữu ích hoặc yên tâm về kế hoạch này.',
                },
              ],
            },
            {
              title: "Đạt được ít nhất 'Người mới bắt đầu' cho Xử lý phản đối",
              description: 'Cố gắng xử lý phản đối.',
            },
            {
              title:
                "Đạt được ít nhất 'Người mới bắt đầu' cho Kiến thức sản phẩm",
              description:
                'Cung cấp giải thích về sản phẩm, bao gồm một số hoặc tất cả các mục chính sau:',
              details: [
                'Cung cấp tiêu đề của giải pháp: 3F framework là một kế hoạch phát hành được bảo đảm và điều này có nghĩa là gì.',
                'Giải thích cách giải pháp này giải quyết nhu cầu của khách hàng: Nêu rõ mục tiêu tài chính đã xác định của khách hàng, lý do tại sao kế hoạch này phù hợp với yêu cầu và mục tiêu tài chính của khách hàng.',
                'Giải thích các điểm bán hàng độc đáo của giải pháp: Manfaat tunai bulanan mulai dari bulan ke-49, Iba built-in manfaat (manfaat pembebasan cacat, manfaat pemutusan hubungan kerja, manfaat perubahan hayat yang diinsuranskan)',
                'Giải thích pertanggungan yang diberikan dalam solusi: Manfaat kematian, manfaat kematian akibat kemalangan',
                'Giải thích bagian yang dijamin dan tidak dijamin dalam solusi: Manfaat Tunai, Manfaat Kematian, Manfaat Jatuh Tempo (jika ada)',
                'Giải thích dòng thời gian của hợp đồng: Thời hạn đóng phí có sẵn, thời hạn hợp đồng, giải pháp này phù hợp như thế nào với tầm nhìn thời gian của khách hàng cho mục tiêu tài chính này',
                'Giải thích số tiền phí bảo hiểm được đề xuất cho giải pháp: Tại sao lại đề xuất số tiền này, làm thế nào nó có thể giải quyết sự thiếu hụt/khoảng cách đã xác định của khách hàng cho mục tiêu tài chính, tìm hiểu và giải thích xem số tiền này có nằm trong khả năng chi trả của khách hàng hay không',
                'Giải thích các rủi ro và hạn chế của giải pháp: hàm ý của việc chuyển đổi, các bệnh lý có sẵn, các rủi ro liên quan đến kế hoạch này, thời gian xem xét miễn phí',
                'Giải thích kế hoạch này khác với tiền gửi có kỳ hạn như thế nào và nhấn mạnh lý do tại sao nó mang lại lợi ích tốt hơn cho khách hàng.',
              ],
            },
            {
              title:
                "Đạt được ít nhất 'Người mới bắt đầu' cho Kiến thức vận hành",
              description:
                'Giải thích bản chất của giải pháp này: Đây là một kế hoạch bảo hiểm y tế đầy đủ và điều này sẽ đòi hỏi một cuộc kiểm tra y tế đầy đủ cho khách hàng',
            },
          ],
        },
        {
          name: 'Cố vấn lành nghề',
          criteria: [
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Thực thi 3F",
              description:
                "Áp dụng tất cả các bước của khung 3F một cách có kịch bản, ví dụ: đọc kịch bản từng chữ một mà không điều chỉnh theo phản ứng của khách hàng hoặc thể hiện sự hiểu biết thực sự (Xem giải thích khung 3F trong tiêu chí 'Sales novice').",
            },
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Xử lý phản đối",
              description: 'Xử lý 1 phản đối.',
            },
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Kiến thức sản phẩm",
              description:
                "Giải thích đầy đủ tất cả thông tin sản phẩm (Tham khảo tiêu chí 'Sales Novice' để biết danh sách đầy đủ các mục thông tin sản phẩm), cộng với:",
              details: [
                'Giải thích phạm vi bảo hiểm được cung cấp trong giải pháp: Manfaat kematian, manfaat kematian akibat kemalangan',
                'Giải thích số tiền phí bảo hiểm được đề xuất cho giải pháp: Tại sao lại đề xuất số tiền này, làm thế nào nó có thể giải quyết sự thiếu hụt/khoảng cách đã xác định của khách hàng cho mục tiêu tài chính, tìm hiểu và giải thích xem số tiền này có nằm trong khả năng chi trả của khách hàng hay không',
                'Giải thích các dịch vụ giá trị gia tăng của PRUPanel Connect: Pemesanan janji temu, Surat Jaminan yang Ditingkatkan, Proses pra-otorisasi, Serbisyo Pramutamu, Panel Lanjutan',
                'Giải thích các rủi ro và hạn chế của giải pháp: Implikasi dari peralihan, Kondisi yang sudah ada sebelumnya, Risiko yang terlibat dalam pelan ini, Freelook period',
              ],
            },
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Kiến thức vận hành",
              description:
                "Đáp ứng tất cả các yêu cầu của cấp độ 'Người mới bắt đầu', cộng với:",
              details: [
                'Có thể thăm dò khách hàng về tình trạng sức khỏe hiện tại và ghi nhận tình trạng bệnh lý có sẵn nếu có.',
              ],
            },
          ],
        },
        {
          name: 'Tư vấn chiến lược',
          criteria: [
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Thực thi 3F",
              description:
                "Áp dụng khung 3F một cách linh hoạt, ví dụ: điều chỉnh giọng điệu và cách diễn đạt dựa trên tín hiệu của khách hàng, đặt câu hỏi làm rõ và tích hợp các bước một cách tự nhiên vào cuộc trò chuyện (Xem giải thích khung 3F trong tiêu chí 'Sales novice').",
            },
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Xử lý phản đối",
              description: 'Xử lý 2 phản đối.',
            },
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Kiến thức sản phẩm",
              description:
                "Đáp ứng tất cả các yêu cầu của cấp độ 'Trung cấp', cộng với:",
              details: [
                'Liên hệ các điểm bán hàng độc đáo với kịch bản của khách hàng',
                'Liên hệ các quyền lợi bảo hiểm với kịch bản của khách hàng',
                'Nói về dòng thời gian của hợp đồng theo độ tuổi và quan điểm của khách hàng',
              ],
            },
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Kiến thức vận hành",
              description:
                "Đáp ứng tất cả các yêu cầu của cấp độ 'Trung cấp', cộng với:",
              details: [
                'Bandingkan dengan penyelesaian serupa daripada pesaing: Giải thích ngắn gọn những điểm khác biệt, ưu và nhược điểm.',
              ],
            },
          ],
        },
      ],
    },
    // Thai
    th: {
      name: 'การจัดตำแหน่งผลิตภัณฑ์ Prudential PLI V1',
      tiers: [
        {
          name: 'นักขายมือใหม่',
          criteria: [
            {
              title: "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับการดำเนินการ 3F",
              description:
                'ใช้กรอบ 3F บางส่วนโดยครอบคลุมบาง (แต่ไม่ใช่ทั้งหมด) ในสามขั้นตอน:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    'รับรู้ความกังวลของลูกค้าโดยสะท้อนถึงความรู้สึกของพวกเขา',
                },
                {
                  title: 'Felt:',
                  description:
                    'แบ่งปันว่าคนอื่นๆ ก็เคยรู้สึกเช่นเดียวกันเพื่อสร้างความสัมพันธ์',
                },
                {
                  title: 'Found:',
                  description:
                    'อธิบายว่าคนอื่นพบว่าอะไรที่เป็นประโยชน์หรือทำให้มั่นใจเกี่ยวกับแผนนี้',
                },
              ],
            },
            {
              title: "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับการจัดการข้อโต้แย้ง",
              description:
                'ใช้เมื่อข้อโต้แย้งไม่ได้รับการจัดการหรือได้รับการจัดการเพียงเล็กน้อย',
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับความรู้เกี่ยวกับผลิตภัณฑ์",
              description:
                'ให้คำอธิบายบางส่วนของข้อมูลผลิตภัณฑ์ ครอบคลุมบาง (แต่ไม่ใช่ทั้งหมด) ของรายการสำคัญต่อไปนี้:',
              details: [
                'ให้หัวข้อหลักของโซลูชัน: เป็นโซลูชันประกันภัยที่ให้รายได้รายเดือนอย่างต่อเนื่องตลอดชีวิต',
                'อธิบายว่าโซลูชันนี้ตอบสนองความต้องการของลูกค้าอย่างไร: ระบุวัตถุประสงค์ทางการเงินที่ระบุของลูกค้า เหตุผลว่าแผนนี้เหมาะกับความต้องการและวัตถุประสงค์ทางการเงินของลูกค้าอย่างไร',
                'อธิบายจุดขายที่โดดเด่นของโซลูชัน: ผลประโยชน์เงินสดรายเดือนเริ่มตั้งแต่เดือนที่ 49, ผลประโยชน์อื่นๆ ที่รวมอยู่ (ผลประโยชน์การยกเว้นเบี้ยประกันกรณีทุพพลภาพ, ผลประโยชน์การถูกเลิกจ้าง, ผลประโยชน์การเปลี่ยนผู้เอาประกันภัย)',
                'อธิบายความคุ้มครองที่ให้ในโซลูชัน: ผลประโยชน์กรณีเสียชีวิต, ผลประโยชน์กรณีเสียชีวิตจากอุบัติเหตุ',
                'อธิบายส่วนที่รับประกันและไม่รับประกันในโซลูชัน: ผลประโยชน์เงินสด, ผลประโยชน์กรณีเสียชีวิต, ผลประโยชน์ครบกำหนด (ถ้ามี)',
                'อธิบายไทม์ไลน์ของกรมธรรม์: ระยะเวลาชำระเบี้ยประกันที่มีให้เลือก, ระยะเวลากรมธรรม์, โซลูชันนี้เข้ากับระยะเวลาของลูกค้าสำหรับวัตถุประสงค์ทางการเงินนี้อย่างไร',
                'อธิบายจำนวนเบี้ยประกันที่เสนอสำหรับโซลูชัน: ทำไมจึงเสนอจำนวนนี้, จำนวนนี้สามารถตอบสนองช่องว่าง/ความขาดแคลนที่ระบุของลูกค้าสำหรับวัตถุประสงค์ทางการเงินได้อย่างไร, ค้นหาและอธิบายว่าจำนวนนี้อยู่ในความสามารถในการจ่ายของลูกค้าหรือไม่',
                'อธิบายความเสี่ยงและข้อจำกัดของโซลูชัน: ผลกระทบของการยกเลิกหรือสิ้นสุดก่อนกำหนด, เงื่อนไขที่มีอยู่ก่อน, ค่าธรรมเนียมและค่าใช้จ่ายที่เกี่ยวข้อง, ความเสี่ยงที่เกี่ยวข้องในแผนนี้, ระยะเวลาพิจารณา',
                'อธิบายว่าแผนนี้แตกต่างจากเงินฝากประจำอย่างไรและเน้นว่าทำไมจึงมีผลประโยชน์ที่ดีกว่าสำหรับลูกค้า',
              ],
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับความรู้ด้านการปฏิบัติงาน",
              description:
                'อธิบายลักษณะของโซลูชันนี้: นี่คือแผน Guaranteed Issuance Offer และหมายความว่าอย่างไร',
            },
          ],
        },
        {
          name: 'ที่ปรึกษาที่มีทักษะ',
          criteria: [
            {
              title: "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับการดำเนินการ 3F",
              description:
                "ใช้ขั้นตอนทั้งหมดของกรอบ 3F ในลักษณะที่เป็นสคริปต์ เช่น อ่านสคริปต์คำต่อคำโดยไม่ปรับตามการตอบสนองของลูกค้าหรือแสดงความเข้าใจที่แท้จริง (ดูคำอธิบายกรอบ 3F ในเกณฑ์ 'นักขายมือใหม่')",
            },
            {
              title: "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับการจัดการข้อโต้แย้ง",
              description: 'จัดการข้อโต้แย้ง 1 ข้อ',
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับความรู้เกี่ยวกับผลิตภัณฑ์",
              description:
                "ตอบสนองความต้องการทั้งหมดของระดับ 'นักขายมือใหม่' รวมถึง:",
              details: [
                'ลำดับความสำคัญของข้อมูลที่เกี่ยวข้องกับความต้องการของลูกค้า',
                'อธิบายผลประโยชน์เงินฝากประจำในแผนนี้: วิธีการทำงานและผลประโยชน์',
              ],
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับความรู้ด้านการปฏิบัติงาน",
              description:
                "ตอบสนองความต้องการทั้งหมดของระดับ 'นักขายมือใหม่' รวมถึง:",
              details: [
                'อธิบายประเภทของลูกค้าที่มีสิทธิ์สำหรับโปรแกรมนี้',
                'อธิบายกระบวนการขั้นตอนต่อไป',
              ],
            },
          ],
        },
        {
          name: 'ที่ปรึกษาเชิงกลยุทธ์',
          criteria: [
            {
              title: "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับการดำเนินการ 3F",
              description:
                "ใช้กรอบ 3F อย่างยืดหยุ่น เช่น ปรับน้ำเสียงและการใช้ถ้อยคำตามสัญญาณของลูกค้า ถามคำถามเพื่อความชัดเจน และผสมผสานขั้นตอนต่างๆ เข้ากับการสนทนาอย่างเป็นธรรมชาติ (ดูคำอธิบายกรอบ 3F ในเกณฑ์ 'นักขายมือใหม่')",
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับการจัดการข้อโต้แย้ง",
              description: 'จัดการข้อโต้แย้ง 2 ข้อ',
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับความรู้เกี่ยวกับผลิตภัณฑ์",
              description:
                "ตอบสนองความต้องการทั้งหมดของระดับ 'ที่ปรึกษาที่มีทักษะ' รวมถึง:",
              details: [
                'เชื่อมโยงจุดขายที่โดดเด่นกับสถานการณ์ของลูกค้า',
                'เชื่อมโยงความคุ้มครองกับสถานการณ์ของลูกค้า',
                'พูดถึงไทม์ไลน์ของกรมธรรม์ในแง่ของอายุและมุมมองของลูกค้า',
              ],
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับความรู้ด้านการปฏิบัติงาน",
              description:
                "ตอบสนองความต้องการทั้งหมดของระดับ 'ที่ปรึกษาที่มีทักษะ' รวมถึง:",
              details: [
                'เปรียบเทียบกับโซลูชันที่คล้ายกันจากคู่แข่ง: อธิบายสั้นๆ เกี่ยวกับความแตกต่าง ข้อดีและข้อเสีย',
              ],
            },
          ],
        },
      ],
    },
    ceb: {
      name: 'Prudential PLI Product Positioning Standing V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa 3F Execution",
              description:
                'Gamita ang bahin sa 3F framework nga naglangkob sa pipila (apan dili tanan) sa tulo ka mga lakang:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    'Dawata ang kabalaka sa kostumer pinaagi sa pagpakita sa ilang mga pagbati',
                },
                {
                  title: 'Felt:',
                  description:
                    'Ipaambit nga ang uban gibati usab ang samang butang aron matukod ang koneksyon',
                },
                {
                  title: 'Found:',
                  description:
                    'Ipasabut kon unsay nakit-an sa uban nga mapuslanon o nagpalig-on bahin sa kini nga plano',
                },
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa Objection Handling",
              description:
                'Magamit kon ang mga pagsupak wala mahawaa o gamay lang nga giatubang',
            },
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa Product Knowledge",
              description:
                'Paghatag ug bahin nga pagpatin-aw sa impormasyon sa produkto, nga naglangkob sa pipila (apan dili tanan) sa mosunod nga importante nga mga butang:',
              details: [
                'Ihatag ang nag-unang hilisgutan sa solusyon: kini usa ka solusyon sa seguro nga naghatag ug padayon nga binuwan nga kita hangtod sa kinabuhi',
                'Ipasabut kon giunsa ang solusyon nagtubag sa panginahanglan sa kostumer: ilha ang piho nga panginahanglan sa pinansya sa kostumer, ngano nga kini nga plano angay sa panginahanglan ug tumong sa pinansya sa kostumer',
                'Ipasabut ang nag-unang mga punto sa pagbaligya sa solusyon: binuwan nga cash benefit nga magsugod sa ika-49 nga bulan, uban pang mga benepisyo nga gilakip (premium waiver benefit kon dunay disability, retrenchment benefit, change of insured benefit)',
                'Ipasabut ang proteksyon nga gihatag sa solusyon: death benefit, accidental death benefit',
                'Ipasabut ang garantisado ug dili garantisado nga mga bahin sa solusyon: cash benefits, death benefit, maturity benefit (kon adunay)',
                'Ipasabut ang timeline sa polisiya: pagpili sa premium payment term, policy term, kon giunsa kini nga solusyon moangay sa timeframe sa kostumer alang niining pinansyal nga tumong',
                'Ipasabut ang gikuha nga premium amount alang sa solusyon: ngano nga kini nga kantidad gisugyot, kon giunsa kini nga kantidad makasulbad sa nakit-ang gap/kulang sa kostumer alang sa pinansyal nga tumong, pangitaa ug ipasabut kon kini nga kantidad sulod sa abot sa kostumer',
                'Ipasabut ang mga risgo ug limitasyon sa solusyon: epekto sa sayo nga pagkanselar o pagtapos, pre-existing conditions, mga bayad ug gasto nga involved, mga risgo nga involved sa kini nga plano, free-look period',
                'Ipasabut kon sa unsang paagi kini nga plano lahi sa fixed deposit ug pasiugdaha ngano nga mas maayo ang benepisyo niini alang sa kostumer',
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa Operational Knowledge",
              description:
                'Paghatag ug bahin nga impormasyon sa operational, nga naglangkob sa pipila (apan dili tanan) sa mosunod:',
              details: [
                'Ipasabut ang mga lakang aron mo-onboard: unsay sunod nga mga lakang human sa karon, unsay gilauman sa kostumer, pila ka dugay ang proseso, unsay mga dokumento nga gikinahanglan',
                'Hisguti ang timeline sa polisiya sa edad ug panan-aw sa kostumer',
              ],
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa 3F Execution",
              description:
                "Gamita ang tanan nga mga lakang sa 3F framework sa scripted nga pamaagi, pananglitan, pagbasa sa script nga pulong-sa-pulong nga wala mag-adjust sa mga tubag sa kostumer o nagpakita sa tinuod nga pagsabot (Tan-awa ang pagpatin-aw sa 3F framework sa 'Sales Novice' nga mga sukdanan).",
            },
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa Objection Handling",
              description: 'Hawaka ang 1 ka pagsupak.',
            },
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa Product Knowledge",
              description:
                "Katumanan ang tanang kinahanglanon sa 'Sales Novice' level ug dugang pa:",
              details: [
                'Ipasabut kon sa unsang paagi ang proposal nakabase sa panginahanglan sa kostumer',
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa Operational Knowledge",
              description:
                "Katumanan ang tanang kinahanglanon sa 'Sales Novice' level.",
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: "Makab-ot ang labing menos 'Expert' para sa 3F Execution",
              description:
                "Gamita ang 3F framework nga dinamiko, pananglitan, gi-adjust ang tono ug pagpahayag base sa mga pahimangnon sa kostumer, nangutana ug mga pangutana sa pagtin-aw, ug natural nga gilakip ang mga lakang sa pag-istoryahanay (Tan-awa ang pagpatin-aw sa 3F framework sa 'Sales Novice' nga mga sukdanan).",
            },
            {
              title:
                "Makab-ot ang labing menos 'Expert' para sa Objection Handling",
              description: 'Hawaka ang 2 ka pagsupak.',
            },
            {
              title:
                "Makab-ot ang labing menos 'Expert' para sa Product Knowledge",
              description:
                "Katumanan ang tanang kinahanglanon sa 'Skilled Advisor' level ug dugang pa:",
              details: [
                'Ipatin-aw ang mga benepisyo sa kini nga plano kumpara sa uban pang mga solusyon',
                'Hisguti ang timeline sa polisiya sa edad ug panan-aw sa kostumer',
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Expert' para sa Operational Knowledge",
              description:
                "Katumanan ang tanang kinahanglanon sa 'Skilled Advisor' level ug dugang pa:",
              details: [
                'Itandi sa managsamang solusyon gikan sa mga kakompetensya: mubo nga pagpatin-aw sa kalainan, mga bentaha ug disbentaha',
              ],
            },
          ],
        },
      ],
    },
  },
};

// PRUShield Product Positioning Standing
const prudentialPRUShieldProductPositioningStanding: StandingConfiguration = {
  base: {
    friendlyId: 'prudential-prushield-product-positioning-v1',
    company: new Types.ObjectId(PRUDENTIAL_COMPANY_ID),
    module: 'product-positioning',
    product: 'prushield',
    assessmentType: 'prudential',
    tiers: [
      {
        level: 1,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 0,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.attemptCount',
            condition: 'min-count',
            value: 0,
          },
        ],
      },
      {
        level: 2,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 34,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.successfulCount',
            condition: 'min-count',
            value: 1,
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.prushieldAssessment.prushieldBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.prushieldAssessment?.prushieldBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.prushieldAssessment.prushieldIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.prushieldAssessment?.prushieldIntermediate;
              if (!intermediate) return false;
              return deepSomeTrue(intermediate);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.prushieldAssessment.prushieldBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.prushieldAssessment?.prushieldBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.prushieldAssessment.prushieldIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.prushieldAssessment?.prushieldIntermediate;
              if (!intermediate) return false;
              return deepSomeTrue(intermediate);
            },
          },
        ],
      },
      {
        level: 3,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 67,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.successfulCount',
            condition: 'min-count',
            value: 2,
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.prushieldAssessment.prushieldBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.prushieldAssessment?.prushieldBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.prushieldAssessment.prushieldIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.prushieldAssessment?.prushieldIntermediate;
              if (!intermediate) return false;
              return deepAllTrue(intermediate);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.prushieldAssessment.prushieldBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.prushieldAssessment?.prushieldBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.prushieldAssessment.prushieldIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.prushieldAssessment?.prushieldIntermediate;
              if (!intermediate) return false;
              return deepAllTrue(intermediate);
            },
          },
        ],
      },
    ],
  },
  localized: {
    en: {
      name: 'Prudential PRUShield Product Positioning V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: "Achieve at least 'Beginner' for 3F Execution",
              description:
                'Partially apply the 3F framework by covering some (but not all) of the three steps:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    "Acknowledge the client's concern by reflecting how they feel.",
                },
                {
                  title: 'Felt:',
                  description:
                    'Share that others have felt similarly to build rapport.',
                },
                {
                  title: 'Found:',
                  description:
                    'Explain what others found helpful or reassuring about this plan.',
                },
              ],
            },
            {
              title: "Achieve at least 'Beginner' for Objection Handling",
              description:
                'Applies when objections are not handled or only minimally addressed.',
            },
            {
              title: "Achieve at least 'Beginner' for Product Knowledge",
              description:
                'Provide an explanation of the product, covering some or all of the following key items:',
              details: [
                "Provide the headline of the solution: PRUShield is a MediSave-approved Integrated Shield Plan that goes beyond providing access to affordable and quality healthcare. It's about ensuring peace of mind for you and your loved ones.",
                "Explain how this solution addresses client's needs: State client's identified financial objective, the justification of how this plan suits client's requirements and financial objectives.",
                `Explain Unique Selling Points of the solution:
- **Better Coverage** - High annual coverage including cancer treatment, minimised out-of-pocket expenses and risk-based loading
- **Better Savings** - Affordable plans tailored for different budgets
- **Better Healthcare Experience** - Smooth hospitalisation with value-added services`,
                'Ask the customer if they currently hold an Integrated Shield Plan with another insurer.',
              ],
            },
            {
              title: "Achieve at least 'Beginner' for Operational Knowledge",
              description:
                'Explain the nature of this solution: This is a full medical underwriting plan and that this will entail a full medical underwriting for the client',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title: "Achieve at least 'Intermediate' for 3F Execution",
              description:
                "Apply all the 3F framework steps in a scripted manner, e.g., reading the script word-for-word without adapting to the client's responses or showing real understanding (See 'Sales novice' criteria for 3F framework explanation).",
            },
            {
              title: "Achieve at least 'Intermediate' for Objection Handling",
              description: 'Handle 1 objection.',
            },
            {
              title: "Achieve at least 'Intermediate' for Product Knowledge",
              description:
                "Fully explain all product information (Refer to the 'Sales Novice' criteria for the full list of product information items), plus:",
              details: [
                `Explain coverage provided in the solution:
- Explain the deductibles and co-insurance coverage
- Inpatient and Day Surgery Benefits
- Pre- and post-hospitalisation benefits`,
                `Explain the premium amount proposed for the solution:
- Why this amount is proposed
- How can this address client's identified shortfall/gap for the financial objective
- Find out and explain if this amount is within client's affordability`,
                `Explain PRUPanel Connect Value-added Services:
- Appointment booking
- Enhanced Letter of Guarantee
- Pre-authorisation process
- Concierge Service
- Extended Panel`,
                `Explain the risks and limitations of the solution:
- Implication of switching
- Pre-existing conditions
- Risks involved in this plan
- Freelook period`,
              ],
            },
            {
              title:
                "Achieve at least 'Intermediate' for Operational Knowledge",
              description:
                "Meet all requirements of the 'Beginner' level, plus:",
              details: [
                'Able to probe customers on existing health condition and note down pre-existing condition if any.',
              ],
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: "Achieve at least 'Expert' for 3F Execution",
              description:
                "Apply the 3F framework dynamically, e.g., adjusted tone and phrasing based on the client's cues, asked clarifying questions, and naturally integrated the steps into the conversation (See 'Sales Novice' criteria for 3F framework explanation).",
            },
            {
              title: "Achieve at least 'Expert' for Objection Handling",
              description: 'Handle 2 objection.',
            },
            {
              title: "Achieve at least 'Expert' for Product Knowledge",
              description:
                "Meet all requirements of the 'Intermediate' level, plus:",
              details: [
                'Make comparison with similar solutions from competitor and explain briefly the differences, the pros and cons.',
              ],
            },
            {
              title: "Achieve at least 'Expert' for Operational Knowledge",
              description:
                "Meet all requirements of the 'Intermediate' level, plus:",
              details: [
                `Explain the process required to any servicing requests specific to the solution
- Able to explain to client the claim process
- Able to explain to the client the claim process if they have a company medical insurance plan`,
                `Explain how claims-based pricing work
- Claims-based pricing scenarios for different sources of claim and the Impact to premiums
- Benefits of PRUWell Rewards if conditions are met`,
              ],
            },
          ],
        },
      ],
    },
    id: {
      name: 'Prudential PRUShield Product Positioning V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: "Mencapai setidaknya 'Pemula' untuk Eksekusi 3F",
              description:
                'Menerapkan sebagian kerangka 3F dengan mencakup beberapa (tetapi tidak semua) dari tiga langkah:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    'Akui kekhawatiran klien dengan merefleksikan perasaan mereka.',
                },
                {
                  title: 'Felt:',
                  description:
                    'Bagikan bahwa orang lain pernah merasakan hal yang sama untuk membina hubungan.',
                },
                {
                  title: 'Found:',
                  description:
                    'Jelaskan apa yang orang lain dapati membantu atau meyakinkan tentang pelan ini.',
                },
              ],
            },
            {
              title: "Mencapai setidaknya 'Pemula' untuk Penanganan Keberatan",
              description: 'Berusaha menangani keberatan klien.',
            },
            {
              title: "Mencapai setidaknya 'Pemula' untuk Pengetahuan Produk",
              description:
                'Berikan penjelasan tentang produk, mencakup beberapa atau semua item kunci berikut:',
              details: [
                'Berikan judul utama solusi: PRUShield adalah Rencana Perlindungan Terintegrasi yang disetujui MediSave yang memberikan akses ke layanan kesehatan berkualitas dan terjangkau. Ini tentang memastikan ketenangan pikiran untuk Anda dan orang-orang tercinta.',
                'Jelaskan bagaimana solusi ini mengatasi kebutuhan pelanggan: Sampaikan tujuan keuangan pelanggan yang telah diidentifikasi, dan jelaskan bagaimana rencana ini sesuai dengan kebutuhan dan tujuan keuangan pelanggan.',
                `Jelaskan Keunggulan Unik solusi:
- **Perlindungan Lebih Baik** - Perlindungan tahunan yang tinggi termasuk perawatan kanker, biaya out-of-pocket yang diminimalkan dan loading berdasarkan risiko
- **Penghematan Lebih Baik** - Rencana terjangkau yang disesuaikan untuk berbagai anggaran
- **Pengalaman Layanan Kesehatan Lebih Baik** - Rawat inap yang lancar dengan layanan bernilai tambah`,
                'Tanyakan kepada pelanggan apakah mereka saat ini memiliki Rencana Perlindungan Terintegrasi dengan perusahaan asuransi lain.',
              ],
            },
            {
              title: "Mencapai setidaknya 'Pemula' untuk Pengetahuan Operasi",
              description:
                'Jelaskan sifat solusi ini: Ini adalah rencana underwriting medis penuh yang akan memerlukan underwriting medis lengkap untuk pelanggan',
            },
          ],
        },
        {
          name: 'Penasihat Berkemahiran',
          criteria: [
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pelaksanaan 3F",
              description:
                "Gunakan semua langkah rangka kerja 3F secara skrip, cth., membaca skrip perkataan demi perkataan tanpa menyesuaikan diri dengan respons pelanggan atau menunjukkan pemahaman sebenar (Lihat penjelasan rangka kerja 3F dalam kriteria 'Sales novice').",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengendalian Bantahan",
              description: 'Kendalikan 1 bantahan.',
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengetahuan Produk",
              description:
                "Terangkan sepenuhnya semua maklumat produk (Rujuk kriteria 'Sales Novice' untuk senarai penuh item maklumat produk), ditambah:",
              details: [
                `Terangkan perlindungan yang disediakan dalam penyelesaian:
- Terangkan potongan dan perlindungan insurans bersama
- Manfaat Kemasukan Hospital dan Pembedahan Harian
- Manfaat sebelum dan selepas kemasukan ke hospital`,
                `Terangkan jumlah premium yang dicadangkan untuk penyelesaian:
- Mengapa jumlah ini dicadangkan
- Bagaimana ia dapat menangani kekurangan/jurang yang dikenal pasti pelanggan untuk objektif kewangan
- Ketahui dan terangkan jika jumlah ini berada dalam kemampuan pelanggan`,
                `Terangkan Perkhidmatan Nilai Tambah PRUPanel Connect:
- Tempahan janji temu
- Surat Jaminan yang Dipertingkatkan
- Proses pra-kebenaran
- Perkhidmatan Pramutamu
- Panel Lanjutan`,
                `Terangkan risiko dan batasan penyelesaian:
- Implikasi penukaran
- Keadaan sedia ada
- Risiko yang terlibat dalam pelan ini
- Tempoh Percubaan`,
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengetahuan Operasional",
              description:
                "Penuhi semua keperluan tahap 'Permulaan', ditambah:",
              details: [
                'Mampu menyoal siasat pelanggan mengenai keadaan kesihatan sedia ada dan mencatat keadaan sedia ada jika ada.',
              ],
            },
          ],
        },
        {
          name: 'Perunding Strategik',
          criteria: [
            {
              title: "Capai sekurang-kurangnya 'Pakar' untuk Pelaksanaan 3F",
              description:
                "Gunakan rangka kerja 3F secara dinamik, cth., nada dan ungkapan yang disesuaikan berdasarkan isyarat pelanggan, bertanya soalan penjelasan, dan mengintegrasikan langkah-langkah secara semula jadi ke dalam perbualan (Lihat penjelasan rangka kerja 3F dalam kriteria 'Sales novice').",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengendalian Bantahan",
              description: 'Kendalikan 2 bantahan.',
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengetahuan Produk",
              description:
                "Penuhi semua keperluan tahap 'Pertengahan', ditambah:",
              details: [
                'Bandingkan dengan penyelesaian serupa daripada pesaing: Terangkan secara ringkas perbezaan, kebaikan dan keburukan.',
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengetahuan Operasi",
              description:
                "Penuhi semua keperluan tahap 'Pertengahan', ditambah:",
              details: [
                `Terangkan proses yang diperlukan untuk sebarang permintaan perkhidmatan khusus untuk penyelesaian
- Mampu menerangkan kepada pelanggan proses tuntutan
- Mampu menerangkan kepada pelanggan proses tuntutan jika mereka mempunyai pelan insurans perubatan syarikat`,
                `Terangkan cara kerja penetapan harga berasaskan tuntutan
- Senario penetapan harga berasaskan tuntutan untuk sumber tuntutan yang berbeza dan Kesannya terhadap premium
- Manfaat Ganjaran PRUWell jika syarat dipenuhi`,
              ],
            },
          ],
        },
      ],
    },
    vi: {
      name: 'Prudential PRUShield Product Positioning V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: "Đạt được ít nhất 'Người mới bắt đầu' cho Thực thi 3F",
              description:
                'Áp dụng một phần khung 3F bằng cách bao gồm một số (nhưng không phải tất cả) trong ba bước:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    'Thừa nhận mối quan tâm của khách hàng bằng cách phản ánh cảm xúc của họ.',
                },
                {
                  title: 'Felt:',
                  description:
                    'Chia sẻ rằng những người khác cũng đã cảm thấy tương tự để xây dựng mối quan hệ.',
                },
                {
                  title: 'Found:',
                  description:
                    'Giải thích những gì người khác thấy hữu ích hoặc yên tâm về kế hoạch này.',
                },
              ],
            },
            {
              title: "Đạt được ít nhất 'Người mới bắt đầu' cho Xử lý phản đối",
              description: 'Cố gắng xử lý phản đối.',
            },
            {
              title:
                "Đạt được ít nhất 'Người mới bắt đầu' cho Kiến thức sản phẩm",
              description:
                'Cung cấp giải thích về sản phẩm, bao gồm một số hoặc tất cả các mục chính sau:',
              details: [
                'Cung cấp tiêu đề của giải pháp: PRUShield là một Kế hoạch lá chắn tích hợp được MediSave phê duyệt, không chỉ cung cấp quyền truy cập vào dịch vụ chăm sóc sức khỏe chất lượng và giá cả phải chăng. Đó là việc đảm bảo sự yên tâm cho bạn và những người thân yêu của bạn.',
                'Giải thích cách giải pháp này giải quyết nhu cầu của khách hàng: Nêu rõ mục tiêu tài chính đã xác định của khách hàng, lý do tại sao kế hoạch này phù hợp với yêu cầu và mục tiêu tài chính của khách hàng.',
                `Giải thích các điểm bán hàng độc đáo của giải pháp:
- **Bảo hiểm tốt hơn** - Mức chi trả hàng năm cao bao gồm điều trị ung thư, chi phí tự trả được giảm thiểu và phụ phí dựa trên rủi ro
- **Tiết kiệm tốt hơn** - Các gói cước phải chăng phù hợp với các ngân sách khác nhau
- **Trải nghiệm chăm sóc sức khỏe tốt hơn** - Nhập viện suôn sẻ với các dịch vụ giá trị gia tăng`,
                'Hỏi khách hàng xem họ hiện có đang tham gia Kế hoạch lá chắn tích hợp với một công ty bảo hiểm khác không.',
              ],
            },
            {
              title:
                "Đạt được ít nhất 'Người mới bắt đầu' cho Kiến thức vận hành",
              description:
                'Giải thích bản chất của giải pháp này: Đây là một kế hoạch bảo hiểm y tế đầy đủ và điều này sẽ đòi hỏi một cuộc kiểm tra y tế đầy đủ cho khách hàng',
            },
          ],
        },
        {
          name: 'Cố vấn lành nghề',
          criteria: [
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Thực thi 3F",
              description:
                "Áp dụng tất cả các bước của khung 3F một cách có kịch bản, ví dụ: đọc kịch bản từng chữ một mà không điều chỉnh theo phản ứng của khách hàng hoặc thể hiện sự hiểu biết thực sự (Xem giải thích khung 3F trong tiêu chí 'Sales novice').",
            },
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Xử lý phản đối",
              description: 'Xử lý 1 phản đối.',
            },
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Kiến thức sản phẩm",
              description:
                "Giải thích đầy đủ tất cả thông tin sản phẩm (Tham khảo tiêu chí 'Sales Novice' để biết danh sách đầy đủ các mục thông tin sản phẩm), cộng với:",
              details: [
                'Giải thích phạm vi bảo hiểm được cung cấp trong giải pháp: Manfaat kematian, manfaat kematian akibat kemalangan',
                'Giải thích số tiền phí bảo hiểm được đề xuất cho giải pháp: Tại sao lại đề xuất số tiền này, làm thế nào nó có thể giải quyết sự thiếu hụt/khoảng cách đã xác định của khách hàng cho mục tiêu tài chính, tìm hiểu và giải thích xem số tiền này có nằm trong khả năng chi trả của khách hàng hay không',
                'Giải thích các dịch vụ giá trị gia tăng của PRUPanel Connect: Pemesanan janji temu, Surat Jaminan yang Dipertingkatkan, Proses pra-kebenaran, Perkhidmatan Pramutamu, Panel Lanjutan',
                'Giải thích các rủi ro và hạn chế của giải pháp: Implikasi dari peralihan, Kondisi yang sudah ada sebelumnya, Risiko yang terlibat trong kế hoạch này, Thời gian xem xét miễn phí',
              ],
            },
            {
              title: "Đạt được ít nhất 'Trung cấp' cho Kiến thức vận hành",
              description:
                "Đáp ứng tất cả các yêu cầu của cấp độ 'Người mới bắt đầu', cộng với:",
              details: [
                'Có thể thăm dò khách hàng về tình trạng sức khỏe hiện tại và ghi nhận tình trạng bệnh lý có sẵn nếu có.',
              ],
            },
          ],
        },
        {
          name: 'Tư vấn chiến lược',
          criteria: [
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Thực thi 3F",
              description:
                "Áp dụng khung 3F một cách linh hoạt, ví dụ: điều chỉnh giọng điệu và cách diễn đạt dựa trên tín hiệu của khách hàng, đặt câu hỏi làm rõ và tích hợp các bước một cách tự nhiên vào cuộc trò chuyện (Xem giải thích khung 3F trong tiêu chí 'Sales novice').",
            },
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Xử lý phản đối",
              description: 'Xử lý 2 phản đối.',
            },
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Kiến thức sản phẩm",
              description:
                "Đáp ứng tất cả các yêu cầu của cấp độ 'Trung cấp', cộng với:",
              details: [
                'Liên hệ các điểm bán hàng độc đáo với kịch bản của khách hàng',
                'Liên hệ các quyền lợi bảo hiểm với kịch bản của khách hàng',
                'Nói về dòng thời gian của hợp đồng theo độ tuổi và quan điểm của khách hàng',
              ],
            },
            {
              title: "Đạt được ít nhất 'Chuyên gia' cho Kiến thức vận hành",
              description:
                "Đáp ứng tất cả các yêu cầu của cấp độ 'Trung cấp', cộng với:",
              details: [
                'Bandingkan dengan penyelesaian serupa daripada pesaing: Giải thích ngắn gọn những điểm khác biệt, ưu và nhược điểm.',
              ],
            },
          ],
        },
      ],
    },
    // Malaysian (Malay)
    ms: {
      name: 'Posisi Produk Prudential PRUShield V1',
      tiers: [
        {
          name: 'Pemula Jualan',
          criteria: [
            {
              title: "Capai sekurang-kurangnya 'Pemula' untuk Pelaksanaan 3F",
              description:
                'Gunakan sebahagian kerangka 3F dengan merangkumi beberapa (tetapi bukan semua) daripada tiga langkah:',
              subCriteria: [
                {
                  title: 'Feel (Rasa):',
                  description:
                    'Akui kebimbangan pelanggan dengan mencerminkan perasaan mereka.',
                },
                {
                  title: 'Felt (Dirasai):',
                  description:
                    'Kongsi bahawa orang lain pernah merasa perkara yang sama untuk membina hubungan.',
                },
                {
                  title: 'Found (Ditemui):',
                  description:
                    'Terangkan apa yang orang lain dapati membantu atau meyakinkan tentang pelan ini.',
                },
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pemula' untuk Pengendalian Bantahan",
              description: 'Cuba mengendalikan bantahan.',
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pemula' untuk Pengetahuan Produk",
              description:
                'Berikan penjelasan produk, merangkumi beberapa atau semua item utama berikut:',
              details: [
                'Berikan tajuk utama penyelesaian: PRUShield ialah Pelan Shield Bersepadu yang diluluskan MediSave yang melangkaui penyediaan akses kepada penjagaan kesihatan yang berpatutan dan berkualiti. Ia mengenai memastikan ketenangan minda untuk anda dan orang tersayang.',
                'Terangkan bagaimana penyelesaian ini menangani keperluan pelanggan: Nyatakan objektif kewangan pelanggan yang dikenal pasti, justifikasi bagaimana pelan ini sesuai dengan keperluan dan objektif kewangan pelanggan.',
                `Terangkan Titik Jualan Unik penyelesaian:
- **Liputan Lebih Baik** - Liputan tahunan tinggi termasuk rawatan kanser, perbelanjaan poket diminimumkan dan pemuatan berasaskan risiko
- **Penjimatan Lebih Baik** - Pelan berpatutan disesuaikan untuk belanjawan berbeza
- **Pengalaman Penjagaan Kesihatan Lebih Baik** - Rawatan hospital yang lancar dengan perkhidmatan nilai tambah`,
                'Tanya pelanggan jika mereka kini memegang Pelan Shield Bersepadu dengan syarikat insurans lain.',
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pemula' untuk Pengetahuan Operasi",
              description:
                'Terangkan sifat penyelesaian ini: Ini adalah pelan pengunderaitan perubatan penuh dan ini akan memerlukan pengunderaitan perubatan penuh untuk pelanggan',
            },
          ],
        },
        {
          name: 'Penasihat Mahir',
          criteria: [
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pelaksanaan 3F",
              description:
                "Gunakan semua langkah kerangka 3F secara berskrip, contohnya, membaca skrip perkataan demi perkataan tanpa menyesuaikan dengan respons pelanggan atau menunjukkan pemahaman sebenar (Lihat kriteria 'Pemula Jualan' untuk penjelasan kerangka 3F).",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengendalian Bantahan",
              description: 'Kendalikan 1 bantahan.',
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengetahuan Produk",
              description:
                "Terangkan sepenuhnya semua maklumat produk (Rujuk kriteria 'Pemula Jualan' untuk senarai penuh item maklumat produk), ditambah:",
              details: [
                `Terangkan liputan yang disediakan dalam penyelesaian:
- Terangkan deduktibel dan liputan insurans bersama
- Manfaat Pesakit Dalam dan Pembedahan Hari
- Manfaat pra dan pasca rawatan hospital`,
                `Terangkan jumlah premium yang dicadangkan untuk penyelesaian:
- Mengapa jumlah ini dicadangkan
- Bagaimana ini boleh menangani kekurangan/jurang yang dikenal pasti pelanggan untuk objektif kewangan
- Ketahui dan terangkan jika jumlah ini dalam kemampuan pelanggan`,
                `Terangkan Perkhidmatan Nilai Tambah PRUPanel Connect:
- Tempahan janji temu
- Surat Jaminan Dipertingkat
- Proses pra-kebenaran
- Perkhidmatan Concierge
- Panel Diperpanjang`,
                `Terangkan risiko dan had penyelesaian:
- Implikasi penukaran
- Keadaan sedia ada
- Risiko yang terlibat dalam pelan ini
- Tempoh tinjauan percuma`,
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pertengahan' untuk Pengetahuan Operasi",
              description: "Memenuhi semua keperluan tahap 'Pemula', ditambah:",
              details: [
                'Mampu menyiasat pelanggan mengenai keadaan kesihatan sedia ada dan mencatat keadaan sedia ada jika ada.',
              ],
            },
          ],
        },
        {
          name: 'Perunding Strategik',
          criteria: [
            {
              title: "Capai sekurang-kurangnya 'Pakar' untuk Pelaksanaan 3F",
              description:
                "Gunakan kerangka 3F secara dinamik, contohnya, menyesuaikan nada dan frasa berdasarkan isyarat pelanggan, bertanya soalan penjelasan, dan mengintegrasikan langkah secara semula jadi ke dalam perbualan (Lihat kriteria 'Pemula Jualan' untuk penjelasan kerangka 3F).",
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengendalian Bantahan",
              description: 'Kendalikan 2 bantahan.',
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengetahuan Produk",
              description:
                "Memenuhi semua keperluan tahap 'Pertengahan', ditambah:",
              details: [
                'Buat perbandingan dengan penyelesaian serupa dari pesaing: Terangkan secara ringkas perbezaan, kebaikan dan keburukan.',
              ],
            },
            {
              title:
                "Capai sekurang-kurangnya 'Pakar' untuk Pengetahuan Operasi",
              description:
                "Memenuhi semua keperluan tahap 'Pertengahan', ditambah:",
              details: [
                `Terangkan proses yang diperlukan untuk sebarang permintaan perkhidmatan khusus untuk penyelesaian
- Mampu menerangkan kepada pelanggan proses tuntutan
- Mampu menerangkan kepada pelanggan proses tuntutan jika mereka mempunyai pelan insurans perubatan syarikat`,
                `Terangkan bagaimana harga berasaskan tuntutan berfungsi
- Senario harga berasaskan tuntutan untuk sumber tuntutan berbeza dan Kesan kepada premium
- Manfaat Ganjaran PRUWell jika syarat dipenuhi`,
              ],
            },
          ],
        },
      ],
    },

    // Tagalog (Filipino)
    tl: {
      name: 'Posisyon ng Produktong Prudential PRUShield V1',
      tiers: [
        {
          name: 'Baguhan sa Pagbebenta',
          criteria: [
            {
              title:
                "Makamit ang hindi bababa sa 'Simula' para sa Pagpapatupad ng 3F",
              description:
                'Bahagyang gamitin ang 3F framework sa pamamagitan ng pagsaklaw sa ilan (ngunit hindi lahat) ng tatlong hakbang:',
              subCriteria: [
                {
                  title: 'Feel (Damdamin):',
                  description:
                    'Kilalanin ang alalahanin ng kliyente sa pamamagitan ng pagsasalamin kung paano nila nararamdaman.',
                },
                {
                  title: 'Felt (Naramdaman):',
                  description:
                    'Ibahagi na ang iba ay nakaramdam ng katulad upang makabuo ng ugnayan.',
                },
                {
                  title: 'Found (Natuklasan):',
                  description:
                    'Ipaliwanag kung ano ang natuklasan ng iba na nakakatulong o nakakaginhawa tungkol sa planong ito.',
                },
              ],
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Simula' para sa Paghawak ng Pagtutol",
              description: 'Subukan ang paghawak ng pagtutol.',
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Simula' para sa Kaalaman sa Produkto",
              description:
                'Magbigay ng paliwanag ng produkto, na sumasaklaw sa ilan o lahat ng mga sumusunod na pangunahing item:',
              details: [
                'Ibigay ang headline ng solusyon: Ang PRUShield ay isang MediSave-approved Integrated Shield Plan na lumalampas sa pagbibigay ng access sa abot-kayang at de-kalidad na healthcare. Ito ay tungkol sa pagtitiyak ng kapayapaan ng isip para sa iyo at sa mga mahal mo sa buhay.',
                'Ipaliwanag kung paano tinutugunan ng solusyong ito ang pangangailangan ng kliyente: Sabihin ang natukoy na layuning pampinansyal ng kliyente, ang pagkakatwiran kung paano angkop ang planong ito sa mga pangangailangan at layuning pampinansyal ng kliyente.',
                `Ipaliwanag ang mga Natatanging Punto ng Pagbebenta ng solusyon:
- **Mas Magandang Saklaw** - Mataas na taunang saklaw kasama ang paggamot sa kanser, nabawasang gastos sa bulsa at risk-based loading
- **Mas Magandang Pag-iimpok** - Abot-kayang mga plano na inangkop para sa iba't ibang budget
- **Mas Magandang Karanasan sa Healthcare** - Maayos na pagkakarawat sa ospital na may value-added services`,
                'Tanungin ang customer kung mayroon silang Integrated Shield Plan sa ibang insurer.',
              ],
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Simula' para sa Kaalaman sa Operasyon",
              description:
                'Ipaliwanag ang kalikasan ng solusyong ito: Ito ay isang buong medical underwriting plan at ito ay mangangailangan ng buong medical underwriting para sa kliyente',
            },
          ],
        },
        {
          name: 'Bihasang Tagapayo',
          criteria: [
            {
              title:
                "Makamit ang hindi bababa sa 'Gitna' para sa Pagpapatupad ng 3F",
              description:
                "Gamitin ang lahat ng hakbang ng 3F framework sa nakasulat na paraan, hal., pagbabasa ng script nang salita-salita nang hindi umaangkop sa mga tugon ng kliyente o nagpapakita ng tunay na pag-unawa (Tingnan ang 'Baguhan sa Pagbebenta' na pamantayan para sa paliwanag ng 3F framework).",
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Gitna' para sa Paghawak ng Pagtutol",
              description: 'Hawakan ang 1 pagtutol.',
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Gitna' para sa Kaalaman sa Produkto",
              description:
                "Lubos na ipaliwanag ang lahat ng impormasyon ng produkto (Sumangguni sa 'Baguhan sa Pagbebenta' na pamantayan para sa kumpletong listahan ng mga item ng impormasyon ng produkto), kasama pa:",
              details: [
                `Ipaliwanag ang saklaw na ibinigay sa solusyon:
- Ipaliwanag ang mga deductible at co-insurance coverage
- Mga Benepisyo sa Inpatient at Day Surgery
- Mga benepisyo bago at pagkatapos ng pagkakarawat sa ospital`,
                `Ipaliwanag ang halaga ng premium na iminungkahi para sa solusyon:
- Bakit iminumungkahi ang halagang ito
- Paano ito makatutugon sa natukoy na kakulangan/puwang ng kliyente para sa layuning pampinansyal
- Alamin at ipaliwanag kung ang halagang ito ay nasa kakayahan ng kliyente`,
                `Ipaliwanag ang mga Value-added Services ng PRUPanel Connect:
- Pag-book ng appointment
- Enhanced Letter of Guarantee
- Pre-authorisation process
- Concierge Service
- Extended Panel`,
                `Ipaliwanag ang mga panganib at limitasyon ng solusyon:
- Epekto ng paglilipat
- Mga kondisyong umiiral na
- Mga panganib na kasangkot sa planong ito
- Panahon ng freelook`,
              ],
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Gitna' para sa Kaalaman sa Operasyon",
              description:
                "Matugunan ang lahat ng pangangailangan ng antas na 'Simula', kasama pa:",
              details: [
                'Kayang mag-probe sa mga customer tungkol sa kasalukuyang kondisyon ng kalusugan at itala ang pre-existing condition kung mayroon.',
              ],
            },
          ],
        },
        {
          name: 'Strategic na Konsultant',
          criteria: [
            {
              title:
                "Makamit ang hindi bababa sa 'Eksperto' para sa Pagpapatupad ng 3F",
              description:
                "Gamitin ang 3F framework nang dynamic, hal., inayos ang tono at pagkakasabi batay sa mga hudyat ng kliyente, nagtanong ng mga tanong na naglilinaw, at natural na pinagsama ang mga hakbang sa pag-uusap (Tingnan ang 'Baguhan sa Pagbebenta' na pamantayan para sa paliwanag ng 3F framework).",
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Eksperto' para sa Paghawak ng Pagtutol",
              description: 'Hawakan ang 2 pagtutol.',
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Eksperto' para sa Kaalaman sa Produkto",
              description:
                "Matugunan ang lahat ng pangangailangan ng antas na 'Gitna', kasama pa:",
              details: [
                'Gumawa ng paghahambing sa mga katulad na solusyon mula sa competitor: Ipaliwanag nang maikli ang mga pagkakaiba, ang mga pabor at laban.',
              ],
            },
            {
              title:
                "Makamit ang hindi bababa sa 'Eksperto' para sa Kaalaman sa Operasyon",
              description:
                "Matugunan ang lahat ng pangangailangan ng antas na 'Gitna', kasama pa:",
              details: [
                `Ipaliwanag ang prosesong kinakailangan sa anumang mga kahilingan sa serbisyo na tukoy sa solusyon
- Kayang ipaliwanag sa kliyente ang proseso ng claim
- Kayang ipaliwanag sa kliyente ang proseso ng claim kung mayroon silang company medical insurance plan`,
                `Ipaliwanag kung paano gumagana ang claims-based pricing
- Mga senaryong claims-based pricing para sa iba't ibang pinagmulan ng claim at ang Epekto sa mga premium
- Mga benepisyo ng PRUWell Rewards kung natutugunan ang mga kondisyon`,
              ],
            },
          ],
        },
      ],
    },

    // Thai
    th: {
      name: 'การจัดตำแหน่งผลิตภัณฑ์ Prudential PRUShield V1',
      tiers: [
        {
          name: 'นักขายมือใหม่',
          criteria: [
            {
              title: "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับการดำเนินการ 3F",
              description:
                'ใช้กรอบ 3F บางส่วนโดยครอบคลุมบาง (แต่ไม่ใช่ทั้งหมด) ในสามขั้นตอน:',
              subCriteria: [
                {
                  title: 'Feel (รู้สึก):',
                  description:
                    'รับทราบความกังวลของลูกค้าโดยสะท้อนให้เห็นถึงความรู้สึกของพวกเขา',
                },
                {
                  title: 'Felt (เคยรู้สึก):',
                  description:
                    'แบ่งปันว่าคนอื่นๆ เคยรู้สึกในทำนองเดียวกันเพื่อสร้างสายสัมพันธ์',
                },
                {
                  title: 'Found (พบว่า):',
                  description:
                    'อธิบายสิ่งที่คนอื่นๆ พบว่าเป็นประโยชน์หรือสร้างความมั่นใจเกี่ยวกับแผนนี้',
                },
              ],
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับการจัดการกับข้อโต้แย้ง",
              description: 'พยายามจัดการกับข้อโต้แย้ง',
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับความรู้เกี่ยวกับผลิตภัณฑ์",
              description:
                'ให้คำอธิบายเกี่ยวกับผลิตภัณฑ์ ครอบคลุมบางส่วนหรือทั้งหมดของรายการสำคัญต่อไปนี้:',
              details: [
                'ให้หัวข้อหลักของโซลูชัน: PRUShield เป็นแผน Integrated Shield ที่ได้รับการอนุมัติจาก MediSave ที่เกินกว่าการให้การเข้าถึงการดูแลสุขภาพที่ราคาไม่แพงและมีคุณภาพ เป็นเรื่องของการรับประกันความสบายใจสำหรับคุณและคนที่คุณรัก',
                'อธิบายว่าโซลูชันนี้ตอบสนองความต้องการของลูกค้าอย่างไร: ระบุวัตถุประสงค์ทางการเงินที่ระบุของลูกค้า เหตุผลที่แผนนี้เหมาะสมกับความต้องการและวัตถุประสงค์ทางการเงินของลูกค้า',
                `อธิบายจุดขายเฉพาะของโซลูชัน:
- **ความคุ้มครองที่ดีกว่า** - ความคุ้มครองรายปีสูงรวมถึงการรักษามะเร็ง ค่าใช้จ่ายจากกระเป๋าที่ลดลงและการโหลดตามความเสี่ยง
- **การประหยัดที่ดีกว่า** - แผนราคาไม่แพงที่ปรับแต่งสำหรับงบประมาณที่แตกต่างกัน
- **ประสบการณ์การดูแลสุขภาพที่ดีกว่า** - การรักษาในโรงพยาบาลที่ราบรื่นพร้อมบริการที่เพิ่มมูลค่า`,
                'ถามลูกค้าว่าพวกเขามีแผน Integrated Shield กับบริษัทประกันภัยอื่นหรือไม่',
              ],
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับเริ่มต้น' สำหรับความรู้ด้านการดำเนินงาน",
              description:
                'อธิบายลักษณะของโซลูชันนี้: นี่คือแผนการรับประกันทางการแพทย์แบบเต็มรูปแบบและจะต้องมีการรับประกันทางการแพทย์แบบเต็มรูปแบบสำหรับลูกค้า',
            },
          ],
        },
        {
          name: 'ที่ปรึกษาที่มีทักษะ',
          criteria: [
            {
              title: "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับการดำเนินการ 3F",
              description:
                "ใช้ขั้นตอนกรอบ 3F ทั้งหมดในลักษณะตามสคริปต์ เช่น อ่านสคริปต์ทีละคำโดยไม่ปรับให้เข้ากับการตอบสนองของลูกค้าหรือแสดงความเข้าใจที่แท้จริง (ดูเกณฑ์ 'นักขายมือใหม่' สำหรับคำอธิบายกรอบ 3F)",
            },
            {
              title: "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับการจัดการกับข้อโต้แย้ง",
              description: 'จัดการกับข้อโต้แย้ง 1 ข้อ',
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับความรู้เกี่ยวกับผลิตภัณฑ์",
              description:
                "อธิบายข้อมูลผลิตภัณฑ์ทั้งหมดอย่างครบถ้วน (อ้างอิงเกณฑ์ 'นักขายมือใหม่' สำหรับรายการข้อมูลผลิตภัณฑ์ทั้งหมด) บวกกับ:",
              details: [
                `อธิบายความคุ้มครองที่ให้ไว้ในโซลูชัน:
- อธิบายเงินหักและความคุ้มครองการประกันร่วม
- ผลประโยชน์ผู้ป่วยในและการผ่าตัดแบบไม่ค้างคืน
- ผลประโยชน์ก่อนและหลังการรักษาในโรงพยาบาล`,
                `อธิบายจำนวนเบี้ยประกันที่เสนอสำหรับโซลูชัน:
- เหตุใดจึงเสนอจำนวนนี้
- สิ่งนี้สามารถตอบสนองช่องว่าง/ความขาดแคลนที่ระบุของลูกค้าสำหรับวัตถุประสงค์ทางการเงินได้อย่างไร
- ค้นหาและอธิบายว่าจำนวนนี้อยู่ในความสามารถของลูกค้าหรือไม่`,
                `อธิบายบริการที่เพิ่มมูลค่า PRUPanel Connect:
- การจองนัดหมาย
- จดหมายค้ำประกันที่ปรับปรุงแล้ว
- กระบวนการอนุมัติล่วงหน้า
- บริการคอนเซียร์จ
- แผงขยาย`,
                `อธิบายความเสี่ยงและข้อจำกัดของโซลูชัน:
- ผลกระทบของการเปลี่ยนแปลง
- เงื่อนไขที่มีอยู่แล้ว
- ความเสี่ยงที่เกี่ยวข้องในแผนนี้
- ระยะเวลาการดูฟรี`,
              ],
            },
            {
              title: "บรรลุอย่างน้อย 'ระดับกลาง' สำหรับความรู้ด้านการดำเนินงาน",
              description: "ตอบสนองข้อกำหนดทั้งหมดของระดับ 'เริ่มต้น' บวกกับ:",
              details: [
                'สามารถสอบถามลูกค้าเกี่ยวกับสภาวะสุขภาพที่มีอยู่และจดบันทึกเงื่อนไขที่มีอยู่แล้วหากมี',
              ],
            },
          ],
        },
        {
          name: 'ที่ปรึกษาเชิงกลยุทธ์',
          criteria: [
            {
              title: "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับการดำเนินการ 3F",
              description:
                "ใช้กรอบ 3F อย่างไดนามิก เช่น ปรับโทนและวลีตามสัญญาณของลูกค้า ถามคำถามเพื่อชี้แจง และรวมขั้นตอนเข้ากับการสนทนาอย่างเป็นธรรมชาติ (ดูเกณฑ์ 'นักขายมือใหม่' สำหรับคำอธิบายกรอบ 3F)",
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับการจัดการกับข้อโต้แย้ง",
              description: 'จัดการกับข้อโต้แย้ง 2 ข้อ',
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับความรู้เกี่ยวกับผลิตภัณฑ์",
              description: "ตอบสนองข้อกำหนดทั้งหมดของระดับ 'กลาง' บวกกับ:",
              details: [
                'เปรียบเทียบกับโซลูชันที่คล้ายกันจากคู่แข่ง: อธิบายความแตกต่าง ข้อดีและข้อเสียโดยสังเขป',
              ],
            },
            {
              title:
                "บรรลุอย่างน้อย 'ระดับผู้เชี่ยวชาญ' สำหรับความรู้ด้านการดำเนินงาน",
              description: "ตอบสนองข้อกำหนดทั้งหมดของระดับ 'กลาง' บวกกับ:",
              details: [
                `อธิบายกระบวนการที่จำเป็นสำหรับคำขอบริการใดๆ ที่เฉพาะเจาะจงกับโซลูชัน
- สามารถอธิบายให้ลูกค้าฟังเกี่ยวกับกระบวนการเคลม
- สามารถอธิบายให้ลูกค้าฟังเกี่ยวกับกระบวนการเคลมหากพวกเขามีแผนประกันการแพทย์ของบริษัท`,
                `อธิบายว่าการกำหนดราคาตามการเคลมทำงานอย่างไร
- สถานการณ์การกำหนดราคาตามการเคลมสำหรับแหล่งการเคลมที่แตกต่างกันและผลกระทบต่อเบี้ยประกัน
- ผลประโยชน์ของ PRUWell Rewards หากเงื่อนไขได้รับการปฏิบัติตาม`,
              ],
            },
          ],
        },
      ],
    },
    ceb: {
      name: 'Prudential PRUShield Product Positioning Standing V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa 3F Execution",
              description:
                'Gamita ang bahin sa 3F framework nga naglangkob sa pipila (apan dili tanan) sa tulo ka mga lakang:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    'Dawata ang kabalaka sa kostumer pinaagi sa pagpakita sa ilang mga pagbati',
                },
                {
                  title: 'Felt:',
                  description:
                    'Ipaambit nga ang uban gibati usab ang samang butang aron matukod ang koneksyon',
                },
                {
                  title: 'Found:',
                  description:
                    'Ipasabut kon unsay nakit-an sa uban nga mapuslanon o nagpalig-on bahin sa kini nga plano',
                },
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa Objection Handling",
              description: 'Sulayi ang paghawak sa pagsupak',
            },
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa Product Knowledge",
              description:
                'Paghatag ug pagpatin-aw sa produkto, nga naglangkob sa pipila o tanan sa mosunod nga importante nga mga butang:',
              details: [
                'Ihatag ang headline sa solusyon: Ang PRUShield usa ka MediSave-approved Integrated Shield Plan nga molabaw sa paghatag ug access sa abot-kayang ug de-kalidad nga healthcare. Kini bahin sa pagsiguro sa kalinaw sa hunahuna alang kanimo ug sa imong mga minahal.',
                'Ipasabut kon giunsa ang solusyon nagtubag sa panginahanglan sa kostumer: Isulti ang piho nga panginahanglan sa pinansya sa kostumer, ang katarongan kon ngano nga angay kini nga plano sa panginahanglan ug tumong sa pinansya sa kostumer.',
                `Ipasabut ang Unique Selling Points sa solusyon:
- **Mas Maayong Coverage** - Taas nga tuig-tuig nga coverage lakip ang pagtambal sa cancer, minos nga out-of-pocket nga gasto ug risk-based loading
- **Mas Maayong Savings** - Abot-kaya nga mga plano nga gipahiangay alang sa lain-laing budget
- **Mas Maayong Healthcare Experience** - Hapsay nga ospital treatment nga may value-added services`,
                'Pangutana ang kostumer kon adunay sila Integrated Shield Plan sa lain nga insurer.',
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Beginner' para sa Operational Knowledge",
              description:
                'Ipasabut ang kinaiya sa kini nga solusyon: Kini usa ka bug-os nga medical underwriting plan ug kinahanglan niini ang bug-os nga medical underwriting para sa kostumer',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa 3F Execution",
              description:
                "Gamita ang tanan nga mga lakang sa 3F framework sa scripted nga pamaagi, pananglitan, pagbasa sa script nga pulong-sa-pulong nga wala mag-adjust sa mga tubag sa kostumer o nagpakita sa tinuod nga pagsabot (Tan-awa ang 'Sales Novice' nga mga sukdanan alang sa pagpatin-aw sa 3F framework).",
            },
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa Objection Handling",
              description: 'Hawaka ang 1 ka pagsupak.',
            },
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa Product Knowledge",
              description:
                "Tin-awng ipasabut ang tanan nga impormasyon sa produkto (Tan-awa ang 'Sales Novice' nga mga sukdanan alang sa kompleto nga listahan sa mga butang sa impormasyon sa produkto), lakip pa:",
              details: [
                `Ipasabut ang coverage nga gihatag sa solusyon:
- Ipasabut ang deductible ug co-insurance coverage
- Inpatient ug Day Surgery benefits
- Pre ug post-hospitalization benefits`,
                `Ipasabut ang premium amount nga gisugyot alang sa solusyon:
- Ngano nga gisugyot kini nga kantidad
- Kon giunsa kini makasulbad sa nakit-ang gap/kulang sa kostumer alang sa pinansyal nga tumong
- Pangitaa ug ipasabut kon kini nga kantidad sulod sa abot sa kostumer`,
                `Ipasabut ang Value-added Services sa PRUPanel Connect:
- Pag-book sa appointment
- Enhanced Letter of Guarantee
- Pre-authorisation process
- Concierge Service
- Extended Panel`,
                `Ipasabut ang mga risgo ug limitasyon sa solusyon:
- Epekto sa pagbalhin gikan sa existing Integrated Shield plan ngadto sa PRUShield
- Pre-existing conditions
- Mga bayad ug gasto nga involved
- Mga risgo nga involved sa kini nga plano
- Free-look period`,
                'Ipasabut kon sa unsang paagi kini nga plano lahi sa uban pang Integrated Shield Plans ug pasiugdaha ngano nga mas maayo ang benepisyo niini alang sa kostumer',
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Intermediate' para sa Operational Knowledge",
              description:
                "Katumanan ang tanang kinahanglanon sa 'Sales Novice' level ug dugang pa:",
              details: [
                `Ipasabut ang mga lakang aron mo-onboard:
- Unsay sunod nga mga lakang human sa karon
- Unsay gilauman sa kostumer
- Pila ka dugay ang proseso
- Unsay mga dokumento nga gikinahanglan`,
                `Ipasabut ang timeline sa polisiya base sa edad ug panan-aw sa kostumer
- Pag-upgrade sa panigulang: kon ang kostumer nagtuo nga molapas sa edad nga mga hagdan sa among MediSave Shield Benefit, ipasabut ang benepisyo sa paglapas sa edad nga hagdan (18, 60, 70)`,
                `Ipasabut ang proseso nga gikinahanglan alang sa bisan unsang pag-claim nga piho sa solusyon
- Makaipasabut sa kostumer bahin sa proseso sa pag-claim`,
              ],
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: "Makab-ot ang labing menos 'Expert' para sa 3F Execution",
              description:
                "Gamita ang 3F framework nga dinamiko, pananglitan, gi-adjust ang tono ug pagpahayag base sa mga pahimangnon sa kostumer, nangutana ug mga pangutana sa pagtin-aw, ug natural nga gilakip ang mga lakang sa pag-istoryahanay (Tan-awa ang 'Sales Novice' nga mga sukdanan alang sa pagpatin-aw sa 3F framework).",
            },
            {
              title:
                "Makab-ot ang labing menos 'Expert' para sa Objection Handling",
              description: 'Hawaka ang 2 ka pagsupak',
            },
            {
              title:
                "Makab-ot ang labing menos 'Expert' para sa Product Knowledge",
              description:
                "Katumanan ang tanang kinahanglanon sa 'Intermediate' level ug dugang pa:",
              details: [
                'Itandi sa managsamang solusyon gikan sa mga kakompetensya: mubo nga pagpatin-aw sa kalainan, mga bentaha ug disbentaha',
              ],
            },
            {
              title:
                "Makab-ot ang labing menos 'Expert' para sa Operational Knowledge",
              description:
                "Katumanan ang tanang kinahanglanon sa 'Intermediate' level ug dugang pa:",
              details: [
                `Ipasabut ang proseso nga gikinahanglan alang sa bisan unsang pag-claim nga piho sa solusyon
- Makaipasabut sa kostumer bahin sa proseso sa pag-claim
- Makaipasabut sa kostumer bahin sa proseso sa pag-claim kon sila adunay corporate medical plan`,
                `Ipasabut kon giunsa ang claim-based pricing molihok
- Mga sitwasyon sa claim-based pricing alang sa lain-laing claim sources ug epekto sa premium
- Mga benepisyo sa PRUWell Rewards kon ang mga kondisyon natuman`,
              ],
            },
          ],
        },
      ],
    },
  },
};

const prudentialPruvantageProductPositioningStanding: StandingConfiguration = {
  base: {
    friendlyId: 'prudential-pruvantage-product-positioning-v1',
    company: new Types.ObjectId(PRUDENTIAL_COMPANY_ID),
    module: 'product-positioning',
    product: 'pruvantage-assure-ii',
    assessmentType: 'prudential',
    tiers: [
      {
        level: 1,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 0,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.attemptCount',
            condition: 'min-count',
            value: 0,
          },
          // {
          //   assessmentArea:
          //     'technicalKnowledge.productKnowledge.pruvantageAssessment.pruvantageBasics',
          //   condition: 'custom',
          //   check: (assessmentData: any) => {
          //     const basics =
          //       assessmentData?.technicalKnowledge?.productKnowledge?.pruvantageAssessment?.pruvantageBasics;
          //     if (!basics) return false;
          //     return deepAllTrue(basics);
          //   },
          // },
          // {
          //   assessmentArea:
          //     'technicalKnowledge.operationalKnowledge.pruvantageAssessment.pruvantageBasics',
          //   condition: 'custom',
          //   check: (assessmentData: any) => {
          //     const basics =
          //       assessmentData?.technicalKnowledge?.operationalKnowledge?.pruvantageAssessment?.pruvantageBasics;
          //     if (!basics) return false;
          //     return deepAllTrue(basics);
          //   },
          // },
        ],
      },
      {
        level: 2,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 34,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.attemptCount',
            condition: 'min-count',
            value: 1,
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.pruvantageAssessment.pruvantageBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.pruvantageAssessment?.pruvantageBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.pruvantageAssessment.pruvantageIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.pruvantageAssessment?.pruvantageIntermediate;
              if (!intermediate) return false;
              return deepSomeTrue(intermediate);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.pruvantageAssessment.pruvantageBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.pruvantageAssessment?.pruvantageBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.pruvantageAssessment.pruvantageIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.pruvantageAssessment?.pruvantageIntermediate;
              if (!intermediate) return false;
              return deepSomeTrue(intermediate);
            },
          },
        ],
      },
      {
        level: 3,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 67,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.attemptCount',
            condition: 'min-count',
            value: 2,
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.pruvantageAssessment.pruvantageBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.pruvantageAssessment?.pruvantageBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.pruvantageAssessment.pruvantageIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.pruvantageAssessment?.pruvantageIntermediate;
              if (!intermediate) return false;
              return deepAllTrue(intermediate);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.pruvantageAssessment.pruvantageBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.pruvantageAssessment?.pruvantageBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.pruvantageAssessment.pruvantageIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.pruvantageAssessment?.pruvantageIntermediate;
              if (!intermediate) return false;
              return deepAllTrue(intermediate);
            },
          },
        ],
      },
    ],
  },
  localized: {
    en: {
      name: 'Prudential PRUVantage Product Positioning',
      type: 'tier-based',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: "Achieve at least 'Beginner' for 3F Execution",
              description:
                'Partially apply the 3F framework by covering some (but not all) of the three steps:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    "Acknowledge the client's concern by reflecting how they feel.",
                },
                {
                  title: 'Felt:',
                  description:
                    'Share that others have felt similarly to build rapport.',
                },
                {
                  title: 'Found:',
                  description:
                    'Explain what others found helpful or reassuring about this plan.',
                },
              ],
            },
            {
              title: "Achieve at least 'Beginner' for Objection Handling",
              description:
                'Applies when objections are not handled or only minimally addressed.',
            },
            {
              title: "Achieve at least 'Beginner' for Product Knowledge",
              description:
                'Provide a partial explanation of the PRUVantage Assure II product information, covering some (but not all) of the following key items:',
              details: [
                'Provide the headline of the solution: PRUVantage Assure II is a regular premium, whole-of-life investment-linked policy with first-in-market Wealth Assure downside protection and Dual Accounts (Growth/Flex).',
                "Explain how this solution addresses client's needs: State client's identified financial objective (wealth accumulation, flexibility, protection) and justify how the plan fits.",
                `Explain Unique Selling Points of the solution:
- Wealth Assure - Locks the highest daily account value (up to S$20M or 3x lifetime premium)
- Coverage Growth - Sum Assured starts at 103% and increases 3% yearly (simple interest) up to 160%
- Dual Accounts - Growth (higher Welcome Bonus; dividends from year 11) vs Flex (dividends from day 1)`,
                'Explain coverage provided in the solution: Death & Accidental Disability benefits based on the highest of Sum Assured, Wealth Assure Value, or account value (plus Additional Investment Account).',
                'Explain bonuses: Welcome Bonus (first 3 years) and Loyalty Bonus (0.5% annually after the premium term).',
                'Explain policy timeline/mechanics: Premium terms (5/10/15/20/25 years), allocation fixed during premium term, UOB-specific default 100% Growth allocation, maximum entry age up to 65 ANB.',
                'Explain risks and limitations: Investment risk and market fluctuation, impact of charges with age, effect of withdrawals on Sum Assured/Wealth Assure, surrender/withdrawal charges, free-look period.',
              ],
            },
            {
              title: "Achieve at least 'Beginner' for Operational Knowledge",
              description:
                'Explain the nature of this solution: An investment-linked policy with Dual Accounts and an Additional Investment Account (for Investment Booster top-ups); basic fund switching eligibility; minimum contribution period (first 24 months).',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title: "Achieve at least 'Intermediate' for 3F Execution",
              description:
                "Apply all the 3F framework steps in a scripted manner, e.g., reading the script word-for-word without adapting to the client's responses or showing real understanding (See 'Sales novice' criteria for 3F framework explanation).",
            },
            {
              title: "Achieve at least 'Intermediate' for Objection Handling",
              description: 'Handle 1 objection.',
            },
            {
              title: "Achieve at least 'Intermediate' for Product Knowledge",
              description:
                "Fully explain all PRUVantage product information (Refer to the 'Sales Novice' criteria for the full list of product information items), plus:",
              details: [
                'Account & Allocation Details: Explain Dual Account allocation (fixed during premium term) and the Additional Investment Account (Investment Booster minimum S$1,000; 3% premium charge; unit crediting).',
                'Premium/Charge Structure: Explain surrender charge durations by premium term; withdrawal charges during the charge period; how withdrawals affect Sum Assured/Wealth Assure.',
                'Flexibility Options: Explain Premium Pass eligibility and effects; Wealth Share overview (what it does); Change of Life Assured timing and impact.',
              ],
            },
            {
              title:
                "Achieve at least 'Intermediate' for Operational Knowledge",
              description:
                "Meet all requirements of the 'Beginner' level, plus:",
              details: [
                'Explain partial withdrawals and top-ups processes and their impact on values.',
                'Explain fund switching basics and any relevant constraints.',
                'Explain how UOB default allocation applies operationally during the premium term.',
              ],
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: "Achieve at least 'Expert' for 3F Execution",
              description:
                "Apply the 3F framework dynamically, e.g., adjusted tone and phrasing based on the client's cues, asked clarifying questions, and naturally integrated the steps into the conversation (See 'Sales Novice' criteria for 3F framework explanation).",
            },
            {
              title: "Achieve at least 'Expert' for Objection Handling",
              description: 'Handle 2 objection.',
            },
            {
              title: "Achieve at least 'Expert' for Product Knowledge",
              description:
                "Meet all requirements of the 'Intermediate' level, plus:",
              details: [
                "Relate unique selling points and Dual Account choices to the client's scenario and objectives.",
                'Make comparison with similar ILPs or endowments and explain briefly the differences, the pros and cons.',
                "Speak the policy timeline in the client's age and perspective.",
              ],
            },
            {
              title: "Achieve at least 'Expert' for Operational Knowledge",
              description:
                "Meet all requirements of the 'Intermediate' level, plus:",
              details: [
                'Explain servicing processes: activating Premium Pass, performing Wealth Share (minimums and impact), Change of Life Assured (effects on riders/benefits).',
                'Discuss policy sustainability considerations (assurance charges vs account value) and mitigation levers (reduce coverage, top-up, asset allocation).',
                'Clarify that Wealth Assure is not considered for surrender value calculation (only for Death/Accidental Disability).',
              ],
            },
          ],
        },
      ],
    },
  },
};

const prudentialPruwealthProductPositioningStanding: StandingConfiguration = {
  base: {
    friendlyId: 'prudential-pruwealth-product-positioning-v1',
    company: new Types.ObjectId(PRUDENTIAL_COMPANY_ID),
    module: 'product-positioning',
    product: 'pruwealth-plus',
    assessmentType: 'prudential',
    tiers: [
      {
        level: 1,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 0,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.attemptCount',
            condition: 'min-count',
            value: 0,
          },
        ],
      },
      {
        level: 2,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 34,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.attemptCount',
            condition: 'min-count',
            value: 1,
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.pruwealthAssessment.pruwealthBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.pruwealthAssessment?.pruwealthBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.pruwealthAssessment.pruwealthIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.pruwealthAssessment?.pruwealthIntermediate;
              if (!intermediate) return false;
              return deepSomeTrue(intermediate);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.pruwealthAssessment.pruwealthBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.pruwealthAssessment?.pruwealthBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.pruwealthAssessment.pruwealthIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.pruwealthAssessment?.pruwealthIntermediate;
              if (!intermediate) return false;
              return deepSomeTrue(intermediate);
            },
          },
        ],
      },
      {
        level: 3,
        criteria: [
          {
            assessmentArea: 'salesTechniques.frameworkExecution.overallScore',
            condition: 'min-score',
            value: 67,
          },
          {
            assessmentArea: 'salesTechniques.objectionHandling.attemptCount',
            condition: 'min-count',
            value: 2,
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.pruwealthAssessment.pruwealthBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.pruwealthAssessment?.pruwealthBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.productKnowledge.pruwealthAssessment.pruwealthIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.productKnowledge
                  ?.pruwealthAssessment?.pruwealthIntermediate;
              if (!intermediate) return false;
              return deepAllTrue(intermediate);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.pruwealthAssessment.pruwealthBasics',
            condition: 'custom',
            check: (assessmentData: any) => {
              const basics =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.pruwealthAssessment?.pruwealthBasics;
              if (!basics) return false;
              return deepAllTrue(basics);
            },
          },
          {
            assessmentArea:
              'technicalKnowledge.operationalKnowledge.pruwealthAssessment.pruwealthIntermediate',
            condition: 'custom',
            check: (assessmentData: any) => {
              const intermediate =
                assessmentData?.technicalKnowledge?.operationalKnowledge
                  ?.pruwealthAssessment?.pruwealthIntermediate;
              if (!intermediate) return false;
              return deepAllTrue(intermediate);
            },
          },
        ],
      },
    ],
  },
  localized: {
    en: {
      name: 'Prudential PRUWealth Plus Product Positioning',
      type: 'tier-based',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: "Achieve at least 'Beginner' for 3F Execution",
              description:
                'Partially apply the 3F framework by covering some (but not all) of the three steps:',
              subCriteria: [
                {
                  title: 'Feel:',
                  description:
                    "Acknowledge the client's concern by reflecting how they feel.",
                },
                {
                  title: 'Felt:',
                  description:
                    'Share that others have felt similarly to build rapport.',
                },
                {
                  title: 'Found:',
                  description:
                    'Explain what others found helpful or reassuring about this plan.',
                },
              ],
            },
            {
              title: "Achieve at least 'Beginner' for Objection Handling",
              description:
                'Applies when objections are not handled or only minimally addressed.',
            },
            {
              title: "Achieve at least 'Beginner' for Product Knowledge",
              description:
                'Provide a partial explanation of the PRUWealth Plus product information, covering some (but not all) of the following key items:',
              details: [
                'Provide the headline of the solution: PRUWealth Plus is a single premium participating whole life policy until age 130 with wealth accumulation and comprehensive protection.',
                "Explain how this solution addresses client's needs: State client's identified financial objective (wealth accumulation, protection, retirement planning, wealth transfer) and justify how the plan fits.",
                `Explain Unique Selling Points of the solution:
- Extended Coverage - Protection until age 130 (vs competitors' age 99-100)
- Retrenchment Benefit - 10% of single premium in first 5 years (one-time)
- Secondary Life Assured - Policy continues on primary life assured death
- Change of Life Assured - Unlimited changes after 2 years for estate planning
- SRS Compatibility - Can be purchased with SRS funds for retirement planning`,
                'Explain coverage provided in the solution: Death benefit (101% premium/surrender value, 105% for accidental death), reversionary and performance bonuses, maturity benefit at age 130.',
                'Explain bonuses: Reversionary bonus (non-guaranteed, becomes guaranteed when declared from year 2) and Performance bonus (non-guaranteed, paid at surrender/claim/maturity).',
                'Explain policy timeline/mechanics: Single premium payment, coverage to age 130, face value vs sum assured distinction, policy loans (70% of surrender value), surgical/nursing loans (interest-free).',
                'Explain risks and limitations: Early surrender value may be less than premium paid, bonuses are non-guaranteed, SRS policies have restrictions (no joint ownership, no secondary LA, no loans).',
              ],
            },
            {
              title: "Achieve at least 'Beginner' for Operational Knowledge",
              description:
                'Explain the nature of this solution: A single premium participating whole life policy; basic policy loan mechanics (up to 70% surrender value); surgical/nursing loan availability (interest-free, up to 10%).',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title: "Achieve at least 'Intermediate' for 3F Execution",
              description:
                "Apply all the 3F framework steps in a scripted manner, e.g., reading the script word-for-word without adapting to the client's responses or showing real understanding (See 'Sales novice' criteria for 3F framework explanation).",
            },
            {
              title: "Achieve at least 'Intermediate' for Objection Handling",
              description: 'Handle 1 objection.',
            },
            {
              title: "Achieve at least 'Intermediate' for Product Knowledge",
              description:
                "Fully explain all PRUWealth Plus product information (Refer to the 'Sales Novice' criteria for the full list of product information items), plus:",
              details: [
                'Bonus Structure Details: Explain reversionary bonus calculation from face value; performance bonus percentage of accumulated reversionary bonuses; how bonuses affect maturity benefit.',
                'Death Benefit Calculations: Explain regular death (101%) vs accidental death (105%); pre-existing condition exclusions (12 months); suicide clause (12 months void).',
                'Wealth Transfer Features: Explain secondary life assured mechanics (primary dies, secondary becomes new primary, no death benefit paid); change of life assured process (2-year waiting, cover end date unchanged).',
                'Loan Facilities: Explain policy loan (70% surrender value, variable interest); surgical/nursing loan (interest-free, 10% max, exclusions apply).',
                'Retrenchment Benefit Details: 10% single premium, first 5 years only, 90-day waiting period, 30-day unemployment minimum, eligibility criteria (full-time, 6+ months employed).',
              ],
            },
            {
              title:
                "Achieve at least 'Intermediate' for Operational Knowledge",
              description:
                "Meet all requirements of the 'Beginner' level, plus:",
              details: [
                'Explain SRS compatibility and restrictions (no joint ownership, no secondary LA, no change LA, no policy loans).',
                'Explain nomination/trust options (49L, 49M, Juvenile, Educational) and mutual exclusivity with secondary life assured.',
                'Explain bonus surrender process (can surrender reversionary bonus for cash value less than face value; performance bonus cannot be surrendered separately).',
                'Explain reinstatement window (24 months, under age 65, health evidence required).',
              ],
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: "Achieve at least 'Expert' for 3F Execution",
              description:
                "Apply the 3F framework dynamically, e.g., adjusted tone and phrasing based on the client's cues, asked clarifying questions, and naturally integrated the steps into the conversation (See 'Sales Novice' criteria for 3F framework explanation).",
            },
            {
              title: "Achieve at least 'Expert' for Objection Handling",
              description: 'Handle 2 objection.',
            },
            {
              title: "Achieve at least 'Expert' for Product Knowledge",
              description:
                "Meet all requirements of the 'Intermediate' level, plus:",
              details: [
                "Relate unique selling points (age 130 coverage, retrenchment benefit, wealth transfer features) to the client's specific scenario and objectives.",
                'Compare with similar single premium participating products (Great Eastern, AIA, NTUC Income) and explain competitive advantages.',
                "Speak the policy timeline in the client's age and perspective (e.g., 'for a 45-year-old, this provides 85 years of coverage').",
                'Explain face value vs sum assured distinction clearly and how it affects bonus calculations vs death benefit.',
              ],
            },
            {
              title: "Achieve at least 'Expert' for Operational Knowledge",
              description:
                "Meet all requirements of the 'Intermediate' level, plus:",
              details: [
                'Explain wealth transfer strategies: secondary life assured for continuation planning, change of life assured for estate planning flexibility, wealth transfer to next generation.',
                'Discuss policy sustainability for long-term coverage (to age 130): managing surrender value, when to consider bonus surrender, impact of policy loans on long-term value.',
                'Clarify retrenchment benefit exclusions (part-time, self-employed, contract workers, resignation, retirement, poor performance dismissal).',
                'Explain critical timeframes: 14-day free look, 90-day retrenchment waiting, 12-month pre-existing/suicide exclusions, 2-year incontestability and change of LA eligibility.',
              ],
            },
          ],
        },
      ],
    },
  },
};

const prudentialObjectionHandlingStanding: StandingConfiguration = {
  base: {
    friendlyId: 'prudential-objection-handling-v1',
    company: new Types.ObjectId(PRUDENTIAL_COMPANY_ID),
    module: 'prudential-objection-handling',
    assessmentType: 'prudential-objection-handling',
    tiers: [
      {
        level: 1,
        criteria: [],
      },
      {
        level: 2,
        criteria: [
          {
            assessmentArea: 'salesTechnique.overallScore',
            condition: 'min-score',
            value: 50,
          },
          {
            assessmentArea: 'objectionHandling.overallScore',
            condition: 'min-score',
            value: 50,
          },
        ],
      },
      {
        level: 3,
        criteria: [
          {
            assessmentArea: 'salesTechnique.overallScore',
            condition: 'min-score',
            value: 75,
          },
          {
            assessmentArea: 'objectionHandling.overallScore',
            condition: 'min-score',
            value: 75,
          },
        ],
      },
    ],
  },
  localized: {
    en: {
      name: 'Prudential Objection Handling Standing V1',
      tiers: [
        {
          name: 'Sales Novice',
          criteria: [
            {
              title: 'Complete the roleplay session',
              description:
                'Attempt to engage the customer using the 3F and LAPR frameworks.',
            },
            {
              title: 'Apply 3F Model (Feel, Felt, Found)',
              description:
                'Show some effort to build rapport and empathy with the customer.',
            },
            {
              title: 'Apply LAPR Framework',
              description:
                'Attempt to Listen, Acknowledge, Probe, and Reframe customer objections.',
            },
          ],
        },
        {
          name: 'Skilled Advisor',
          criteria: [
            {
              title: 'Achieve at least 50% for Sales Technique (3F)',
              description:
                'Effectively demonstrate empathy, share relatable experiences, and present solutions that address customer concerns.',
            },
            {
              title: 'Achieve at least 50% for Objection Handling (LAPR)',
              description:
                'Demonstrate solid listening skills, genuine acknowledgment, thoughtful probing, and relevant reframing of objections.',
            },
          ],
        },
        {
          name: 'Strategic Consultant',
          criteria: [
            {
              title: 'Achieve at least 75% for Sales Technique (3F)',
              description:
                'Master the 3F Model with exceptional empathy, highly relatable stories, and compelling value presentations tailored to the customer.',
            },
            {
              title: 'Achieve at least 75% for Objection Handling (LAPR)',
              description:
                'Excel at all LAPR components: active listening without assumptions, genuine acknowledgment, insightful probing, and masterful reframing that naturally addresses concerns.',
            },
          ],
        },
      ],
    },
  },
};

export const prudentialStandings: StandingConfiguration[] = [
  prudentialColdCallStanding,
  prudentialPLIProductPositioningStanding,
  prudentialPRUShieldProductPositioningStanding,
  prudentialPruvantageProductPositioningStanding,
  prudentialPruwealthProductPositioningStanding,
  prudentialObjectionHandlingStanding,
];
