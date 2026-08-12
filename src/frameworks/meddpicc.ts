import { FrameworkConfiguration } from './types.js';

// New co-located structure with translations
export const meddpiccConfiguration: FrameworkConfiguration = {
  base: {
    id: 'meddpicc',
    friendlyId: 'meddpicc',
    type: 'list',
  },

  localized: {
    // English (Original)
    en: {
      title: 'MEDDPICC',
      description: 'Comprehensive B2B sales qualification methodology',
      parts: [
        {
          title: 'Metrics',
          description: 'Quantify business impact and value',
          items: [
            'What are your current operational costs for corporate transportation?',
            'How do you measure employee productivity and satisfaction?',
            'What ROI or cost savings are you targeting?',
            'How do you currently track and manage business expenses?',
          ],
        },
        {
          title: 'Economic Buyer',
          description: 'Identify budget authority and decision maker',
          items: [
            'Who has the authority to approve this type of investment?',
            'What is your budget allocation process for operational tools?',
            'How are purchasing decisions typically made in your organization?',
            'Who would need to sign off on a solution like this?',
          ],
        },
        {
          title: 'Decision Criteria',
          description: 'Understand evaluation factors and requirements',
          items: [
            'What factors are most important in selecting a corporate services provider?',
            'How do you evaluate vendor reliability and service quality?',
            'What security and compliance requirements must vendors meet?',
            'What would make you choose one solution over another?',
          ],
        },
        {
          title: 'Decision Process',
          description: 'Map the buying journey and timeline',
          items: [
            'What is your typical timeline for implementing new operational tools?',
            'Who else would be involved in evaluating this solution?',
            'What steps are involved in your vendor selection process?',
            'Are there any upcoming events or deadlines driving this decision?',
          ],
        },
        {
          title: 'Paper Process',
          description: 'Understand procurement and legal requirements',
          items: [
            'What is your vendor onboarding and approval process?',
            'Are there specific contract terms or compliance requirements?',
            'What documentation do you need for vendor evaluation?',
            'How long does your legal and procurement review typically take?',
          ],
        },
        {
          title: 'Identify Pain',
          description: 'Apply LAER methodology to identify and address pain',
          items: [
            'Listen: Let the client fully share frustrations (tight margins, skepticism about ROI, limited budgets)',
            'Acknowledge: Validate their concern ("That makes sense — many of our F&B partners felt the same at first")',
            'Explore: Ask deeper questions like "When you say budget feels high, is it more about this quarter\'s cash flow or uncertainty about ROI?" and "What happens if this challenge isn’t solved in the next quarter?"',
            'Respond: Show how your solution addresses pain points (measurable ROI, guaranteed visibility, pilot options)',
          ],
        },
        {
          title: 'Champion',
          description: 'Identify internal advocates and supporters',
          items: [
            'Who in your organization would benefit most from this solution?',
            'Are there any internal advocates who support operational improvements?',
            'Who else should we involve to ensure successful implementation?',
            'Which stakeholders would be excited about these capabilities?',
          ],
        },
        {
          title: 'Competition',
          description: 'Understand competitive landscape and alternatives',
          items: [
            'What other vendors or solutions are you currently considering?',
            "Have you worked with similar service providers in the past? What worked well or didn't?",
            'What would make you choose one solution over another?',
            "Are there any specific vendors or alternatives you're comparing us against?",
          ],
        },
      ],
    },

    // Indonesian
    id: {
      title: 'MEDDPICC',
      description: 'Metodologi kualifikasi penjualan B2B yang komprehensif',
      parts: [
        {
          title: 'Metrics',
          description: 'Mengukur dampak dan nilai bisnis',
          items: [
            'Berapa biaya operasional saat ini untuk transportasi korporat?',
            'Bagaimana Anda mengukur produktivitas dan kepuasan karyawan?',
            'ROI atau penghematan biaya apa yang Anda targetkan?',
            'Bagaimana Anda saat ini melacak dan mengelola biaya bisnis?',
          ],
        },
        {
          title: 'Economic Buyer',
          description:
            'Mengidentifikasi otoritas anggaran dan pembuat keputusan',
          items: [
            'Siapa yang memiliki otoritas untuk menyetujui investasi seperti ini?',
            'Bagaimana proses alokasi anggaran untuk tools operasional?',
            'Bagaimana keputusan pembelian biasanya dibuat di organisasi Anda?',
            'Siapa yang perlu memberikan persetujuan untuk solusi seperti ini?',
          ],
        },
        {
          title: 'Decision Criteria',
          description: 'Memahami faktor evaluasi dan persyaratan',
          items: [
            'Faktor apa yang paling penting dalam memilih penyedia layanan korporat?',
            'Bagaimana Anda mengevaluasi keandalan vendor dan kualitas layanan?',
            'Persyaratan keamanan dan kepatuhan apa yang harus dipenuhi vendor?',
            'Apa yang membuat Anda memilih satu solusi daripada yang lain?',
          ],
        },
        {
          title: 'Decision Process',
          description: 'Memetakan perjalanan pembelian dan timeline',
          items: [
            'Berapa timeline tipikal untuk mengimplementasikan tools operasional baru?',
            'Siapa lagi yang akan terlibat dalam mengevaluasi solusi ini?',
            'Langkah apa saja yang terlibat dalam proses seleksi vendor?',
            'Adakah event atau deadline yang akan datang yang mendorong keputusan ini?',
          ],
        },
        {
          title: 'Paper Process',
          description: 'Memahami persyaratan pengadaan dan legal',
          items: [
            'Bagaimana proses onboarding dan persetujuan vendor?',
            'Adakah syarat kontrak atau persyaratan kepatuhan khusus?',
            'Dokumentasi apa yang Anda butuhkan untuk evaluasi vendor?',
            'Berapa lama review legal dan pengadaan biasanya memakan waktu?',
          ],
        },
        {
          title: 'Implicate the Pain',
          description: 'Menemukan dan mengukur tantangan saat ini',
          items: [
            'Tantangan apa yang Anda hadapi dengan setup layanan korporat saat ini?',
            'Bagaimana inefisiensi dalam pengangkutan/penghantaran mempengaruhi operasi?',
            'Berapa biaya proses manual saat ini?',
            'Apa yang terjadi jika Anda tidak mengatasi tantangan operasional ini?',
          ],
        },
        {
          title: 'Champion',
          description: 'Mengidentifikasi advokat internal dan pendukung',
          items: [
            'Siapa di organisasi Anda yang paling diuntungkan dari solusi ini?',
            'Adakah advokat internal yang mendukung perbaikan operasional?',
            'Siapa lagi yang harus kita libatkan untuk memastikan implementasi sukses?',
            'Stakeholder mana yang akan antusias dengan kemampuan ini?',
          ],
        },
        {
          title: 'Competition',
          description: 'Memahami lanskap kompetitif dan alternatif',
          items: [
            'Vendor atau solusi lain apa yang sedang Anda pertimbangkan?',
            'Pernahkah bekerja dengan penyedia layanan serupa? Apa yang berhasil atau tidak?',
            'Apa yang membuat Anda memilih satu solusi daripada yang lain?',
            'Adakah vendor atau alternatif spesifik yang membandingkan kami?',
          ],
        },
      ],
    },

    // Malaysian
    ms: {
      title: 'MEDDPICC',
      description: 'Metodologi kelayakan jualan B2B yang komprehensif',
      parts: [
        {
          title: 'Metrics',
          description: 'Mengukur impak dan nilai perniagaan',
          items: [
            'Apakah kos operasi semasa untuk pengangkutan korporat?',
            'Bagaimana anda mengukur produktiviti dan kepuasan pekerja?',
            'ROI atau penjimatan kos apa yang anda sasarkan?',
            'Bagaimana anda pada masa ini menjejaki dan menguruskan perbelanjaan perniagaan?',
          ],
        },
        {
          title: 'Economic Buyer',
          description: 'Mengenal pasti kuasa belanjawan dan pembuat keputusan',
          items: [
            'Siapa yang mempunyai kuasa untuk meluluskan pelaburan jenis ini?',
            'Apakah proses peruntukan belanjawan untuk alat operasi?',
            'Bagaimana keputusan pembelian biasanya dibuat dalam organisasi anda?',
            'Siapa yang perlu meluluskan penyelesaian seperti ini?',
          ],
        },
        {
          title: 'Decision Criteria',
          description: 'Memahami faktor penilaian dan keperluan',
          items: [
            'Faktor apa yang paling penting dalam memilih penyedia perkhidmatan korporat?',
            'Bagaimana anda menilai kebolehpercayaan vendor dan kualiti perkhidmatan?',
            'Keperluan keselamatan dan pematuhan apa yang mesti dipenuhi vendor?',
            'Apa yang akan membuat anda memilih satu penyelesaian berbanding yang lain?',
          ],
        },
        {
          title: 'Decision Process',
          description: 'Memetakan perjalanan pembelian dan garis masa',
          items: [
            'Apakah garis masa biasa untuk melaksanakan alat operasi baharu?',
            'Siapa lagi yang akan terlibat dalam menilai penyelesaian ini?',
            'Langkah apa yang terlibat dalam proses pemilihan vendor?',
            'Adakah sebarang acara atau tarikh akhir yang akan datang yang mendorong keputusan ini?',
          ],
        },
        {
          title: 'Paper Process',
          description: 'Memahami keperluan perolehan dan undang-undang',
          items: [
            'Apakah proses onboarding dan kelulusan vendor?',
            'Adakah syarat kontrak atau keperluan pematuhan khusus?',
            'Dokumentasi apa yang anda perlukan untuk penilaian vendor?',
            'Berapa lama semakan undang-undang dan perolehan biasanya mengambil masa?',
          ],
        },
        {
          title: 'Implicate the Pain',
          description: 'Menemui dan mengukur cabaran semasa',
          items: [
            'Cabaran apa yang anda hadapi dengan setup perkhidmatan korporat semasa?',
            'Bagaimana ketidakcekapan dalam pengangkutan/penghantaran memberi kesan kepada operasi?',
            'Apakah kos proses manual semasa anda?',
            'Apa yang berlaku jika anda tidak menangani cabaran operasi ini?',
          ],
        },
        {
          title: 'Champion',
          description: 'Mengenal pasti penyokong dalaman dan penyokong',
          items: [
            'Siapa dalam organisasi anda yang akan mendapat manfaat paling banyak dari penyelesaian ini?',
            'Adakah sebarang penyokong dalaman yang menyokong penambahbaikan operasi?',
            'Siapa lagi yang harus kita libatkan untuk memastikan pelaksanaan berjaya?',
            'Pihak berkepentingan mana yang akan teruja dengan keupayaan ini?',
          ],
        },
        {
          title: 'Competition',
          description: 'Memahami landskap kompetitif dan alternatif',
          items: [
            'Vendor atau penyelesaian lain apa yang sedang anda pertimbangkan?',
            'Pernahkah bekerja dengan penyedia perkhidmatan serupa sebelum ini? Apa yang berkesan atau tidak?',
            'Apa yang akan membuat anda memilih satu penyelesaian berbanding yang lain?',
            'Adakah sebarang vendor atau alternatif khusus yang anda bandingkan dengan kami?',
          ],
        },
      ],
    },

    // Tagalog (Filipino)
    tl: {
      title: 'MEDDPICC',
      description: 'Kumpletong B2B sales qualification methodology',
      parts: [
        {
          title: 'Metrics',
          description: 'Sukatin ang business impact at halaga',
          items: [
            'Ano ang inyong kasalukuyang operational costs para sa corporate transportation?',
            'Paano ninyo sinusukat ang productivity at satisfaction ng mga empleyado?',
            'Anong ROI o cost savings ang inyong target?',
            'Paano ninyo kasalukuyang sinusubaybayan at namamahala ang business expenses?',
          ],
        },
        {
          title: 'Economic Buyer',
          description: 'Tukuyin ang budget authority at decision maker',
          items: [
            'Sino ang may karapatang mag-approve ng ganitong uri ng investment?',
            'Ano ang inyong budget allocation process para sa operational tools?',
            'Paano karaniwang ginagawa ang mga purchasing decisions sa inyong organisasyon?',
            'Sino ang kailangang mag-sign off sa solution na tulad nito?',
          ],
        },
        {
          title: 'Decision Criteria',
          description: 'Unawain ang evaluation factors at requirements',
          items: [
            'Anong mga factor ang pinaka-importante sa pagpili ng corporate services provider?',
            'Paano ninyo ine-evaluate ang vendor reliability at service quality?',
            'Anong security at compliance requirements ang dapat matugunan ng mga vendor?',
            'Ano ang magpapadali sa inyong pagpili ng isang solution kaysa sa iba?',
          ],
        },
        {
          title: 'Decision Process',
          description: 'I-map ang buying journey at timeline',
          items: [
            'Ano ang inyong typical timeline para sa pag-implement ng bagong operational tools?',
            'Sino pa ang magiging involve sa pag-evaluate ng solution na ito?',
            'Anong mga hakbang ang kasama sa inyong vendor selection process?',
            'May mga upcoming events o deadlines ba na nag-drive ng decision na ito?',
          ],
        },
        {
          title: 'Paper Process',
          description: 'Unawain ang procurement at legal requirements',
          items: [
            'Ano ang inyong vendor onboarding at approval process?',
            'May mga specific contract terms o compliance requirements ba?',
            'Anong dokumentasyon ang kailangan ninyo para sa vendor evaluation?',
            'Gaano katagal ang inyong legal at procurement review?',
          ],
        },
        {
          title: 'Implicate the Pain',
          description: 'Tuklasin at sukatin ang kasalukuyang mga hamon',
          items: [
            'Anong mga hamon ang kinakaharap ninyo sa kasalukuyang corporate services setup?',
            'Paano nakakaapekto ang mga inefficiency sa transportation/delivery sa inyong operations?',
            'Magkano ang gastos ng inyong kasalukuyang manual processes?',
            'Ano ang mangyayari kung hindi ninyo matutugunan ang mga operational challenges na ito?',
          ],
        },
        {
          title: 'Champion',
          description: 'Tukuyin ang internal advocates at supporters',
          items: [
            'Sino sa inyong organisasyon ang makaka-benefit ng pinakamarami sa solution na ito?',
            'May mga internal advocates ba na sumusuporta sa operational improvements?',
            'Sino pa ang dapat naming kasama para masiguro ang successful implementation?',
            'Aling mga stakeholders ang magiging excited sa mga capabilities na ito?',
          ],
        },
        {
          title: 'Competition',
          description: 'Unawain ang competitive landscape at alternatives',
          items: [
            'Anong ibang vendors o solutions ang kasalukuyang kinokonsider ninyo?',
            'Nakakwork na ba kayo sa mga katulad na service providers? Ano ang naging maganda o hindi?',
            'Ano ang magpapadali sa inyong pagpili ng isang solution kaysa sa iba?',
            'May mga specific vendors o alternatives ba na kinocompare ninyo sa amin?',
          ],
        },
      ],
    },

    // Vietnamese
    vi: {
      title: 'MEDDPICC',
      description: 'Phương pháp đánh giá khách hàng tiềm năng B2B toàn diện',
      parts: [
        {
          title: 'Số liệu',
          description: 'Lượng hóa tác động kinh doanh và giá trị',
          items: [
            'Chi phí vận hành hiện tại của bạn cho vận chuyển doanh nghiệp là bao nhiêu?',
            'Bạn đo lường năng suất và sự hài lòng của nhân viên như thế nào?',
            'ROI hoặc tiết kiệm chi phí nào mà bạn đang nhắm đến?',
            'Hiện tại bạn theo dõi và quản lý chi phí kinh doanh như thế nào?',
          ],
        },
        {
          title: 'Người mua có quyền quyết định ngân sách',
          description: 'Xác định quyền ngân sách và người ra quyết định',
          items: [
            'Ai có thẩm quyền phê duyệt loại đầu tư này?',
            'Quy trình phân bổ ngân sách của bạn cho các công cụ vận hành là gì?',
            'Các quyết định mua hàng thường được đưa ra như thế nào trong tổ chức của bạn?',
            'Ai cần phải ký duyệt giải pháp như thế này?',
          ],
        },
        {
          title: 'Tiêu chí quyết định',
          description: 'Hiểu các yếu tố đánh giá và yêu cầu',
          items: [
            'Những yếu tố nào quan trọng nhất trong việc lựa chọn nhà cung cấp dịch vụ doanh nghiệp?',
            'Bạn đánh giá độ tin cậy của nhà cung cấp và chất lượng dịch vụ như thế nào?',
            'Những yêu cầu bảo mật và tuân thủ nào mà các nhà cung cấp phải đáp ứng?',
            'Điều gì sẽ khiến bạn chọn một giải pháp này hơn giải pháp khác?',
          ],
        },
        {
          title: 'Quy trình quyết định',
          description: 'Lập sơ đồ hành trình mua hàng và thời gian',
          items: [
            'Thời gian điển hình của bạn để triển khai các công cụ vận hành mới là gì?',
            'Ai khác sẽ tham gia vào việc đánh giá giải pháp này?',
            'Những bước nào được bao gồm trong quy trình lựa chọn nhà cung cấp của bạn?',
            'Có bất kỳ sự kiện hoặc thời hạn sắp tới nào thúc đẩy quyết định này không?',
          ],
        },
        {
          title: 'Quy trình giấy tờ',
          description: 'Hiểu các yêu cầu mua sắm và pháp lý',
          items: [
            'Quy trình đưa nhà cung cấp vào danh sách và phê duyệt của bạn là gì?',
            'Có những điều khoản hợp đồng cụ thể hoặc yêu cầu tuân thủ nào không?',
            'Bạn cần tài liệu gì để đánh giá nhà cung cấp?',
            'Việc xem xét pháp lý và mua sắm của bạn thường mất bao lâu?',
          ],
        },
        {
          title: 'Làm rõ vấn đề',
          description: 'Khám phá và lượng hóa các thách thức hiện tại',
          items: [
            'Bạn gặp những thách thức gì với thiết lập dịch vụ doanh nghiệp hiện tại?',
            'Sự kém hiệu quả trong vận chuyển/giao hàng ảnh hưởng đến hoạt động của bạn như thế nào?',
            'Chi phí của các quy trình thủ công hiện tại của bạn là bao nhiêu?',
            'Điều gì sẽ xảy ra nếu bạn không giải quyết những thách thức vận hành này?',
          ],
        },
        {
          title: 'Người ủng hộ',
          description: 'Xác định các người ủng hộ và hỗ trợ nội bộ',
          items: [
            'Ai trong tổ chức của bạn sẽ được hưởng lợi nhiều nhất từ giải pháp này?',
            'Có những người ủng hộ nội bộ nào hỗ trợ cải tiến vận hành không?',
            'Chúng ta còn nên liên quan ai khác để đảm bảo triển khai thành công?',
            'Những bên liên quan nào sẽ hào hứng với những khả năng này?',
          ],
        },
        {
          title: 'Đối thủ cạnh tranh',
          description: 'Hiểu bối cảnh cạnh tranh và các lựa chọn thay thế',
          items: [
            'Những nhà cung cấp hoặc giải pháp nào khác mà bạn đang xem xét?',
            'Bạn đã từng làm việc với các nhà cung cấp dịch vụ tương tự chưa? Điều gì hiệu quả hoặc không hiệu quả?',
            'Điều gì sẽ khiến bạn chọn một giải pháp này hơn giải pháp khác?',
            'Có những nhà cung cấp hoặc lựa chọn thay thế cụ thể nào mà bạn đang so sánh chúng tôi không?',
          ],
        },
      ],
    },

    // Thai
    th: {
      title: 'MEDDPICC',
      description: 'วิธีการคัดกรองลูกค้าเป้าหมาย B2B ที่ครอบคลุม',
      parts: [
        {
          title: 'ตัวชี้วัด',
          description: 'วัดผลกระทบทางธุรกิจและคุณค่า',
          items: [
            'ต้นทุนในการดำเนินงานปัจจุบันสำหรับการขนส่งขององค์กรคือเท่าไร?',
            'คุณวัดผลผลิตและความพึงพอใจของพนักงานอย่างไร?',
            'ROI หรือการประหยัดต้นทุนใดที่คุณตั้งเป้าหมาย?',
            'คุณติดตามและจัดการค่าใช้จ่ายทางธุรกิจอย่างไรในปัจจุบัน?',
          ],
        },
        {
          title: 'ผู้ซื้อที่มีอำนาจทางเศรษฐกิจ',
          description: 'ระบุอำนาจงบประมาณและผู้ตัดสินใจ',
          items: [
            'ใครมีอำนาจในการอนุมัติการลงทุนประเภทนี้?',
            'กระบวนการจัดสรรงบประมาณของคุณสำหรับเครื่องมือในการดำเนินงานคืออะไร?',
            'การตัดสินใจซื้อมักจะทำอย่างไรในองค์กรของคุณ?',
            'ใครจะต้องลงนามอนุมัติโซลูชันแบบนี้?',
          ],
        },
        {
          title: 'เกณฑ์การตัดสินใจ',
          description: 'เข้าใจปัจจัยการประเมินและข้อกำหนด',
          items: [
            'ปัจจัยใดที่สำคัญที่สุดในการเลือกผู้ให้บริการองค์กร?',
            'คุณประเมินความน่าเชื่อถือของผู้ขายและคุณภาพบริการอย่างไร?',
            'ข้อกำหนดด้านความปลอดภัยและการปฏิบัติตามกฎระเบียบใดที่ผู้ขายต้องปฏิบัติตาม?',
            'อะไรจะทำให้คุณเลือกโซลูชันหนึ่งมากกว่าอีกอัน?',
          ],
        },
        {
          title: 'ขั้นตอนการตัดสินใจ',
          description: 'วางแผนเส้นทางการซื้อและกำหนดเวลา',
          items: [
            'ระยะเวลาทั่วไปของคุณในการใช้เครื่องมือดำเนินงานใหม่คืออะไร?',
            'ใครอีกที่จะมีส่วนร่วมในการประเมินโซลูชันนี้?',
            'ขั้นตอนใดบ้างที่เกี่ยวข้องในกระบวนการเลือกผู้ขายของคุณ?',
            'มีกิจกรรมหรือเส้นตายใดๆ ที่กำลังจะมาถึงที่กระตุ้นการตัดสินใจนี้หรือไม่?',
          ],
        },
        {
          title: 'ขั้นตอนเอกสาร',
          description: 'เข้าใจข้อกำหนดการจัดหาและกฎหมาย',
          items: [
            'กระบวนการออนบอร์ดและการอนุมัติผู้ขายของคุณคืออะไร?',
            'มีเงื่อนไขสัญญาเฉพาะหรือข้อกำหนดการปฏิบัติตามกฎระเบียบหรือไม่?',
            'คุณต้องการเอกสารใดสำหรับการประเมินผู้ขาย?',
            'การทบทวนทางกฎหมายและการจัดหาของคุณใช้เวลานานเท่าไร?',
          ],
        },
        {
          title: 'ทำให้เข้าใจปัญหา',
          description: 'ค้นหาและวัดความท้าทายปัจจุบัน',
          items: [
            'คุณประสบปัญหาใดกับการตั้งค่าบริการองค์กรปัจจุบัน?',
            'ความไม่มีประสิทธิภาพในการขนส่ง/การจัดส่งส่งผลกระทบต่อการดำเนินงานของคุณอย่างไร?',
            'ต้นทุนของกระบวนการปัจจุบันที่ทำด้วยมือของคุณคือเท่าไร?',
            'จะเกิดอะไรขึ้นหากคุณไม่จัดการกับความท้าทายในการดำเนินงานเหล่านี้?',
          ],
        },
        {
          title: 'ผู้สนับสนุน',
          description: 'ระบุผู้สนับสนุนและผู้สนับสนุนภายใน',
          items: [
            'ใครในองค์กรของคุณจะได้รับประโยชน์มากที่สุดจากโซลูชันนี้?',
            'มีผู้สนับสนุนภายในที่สนับสนุนการปรับปรุงการดำเนินงานหรือไม่?',
            'เราควรให้ใครอื่นมีส่วนร่วมเพื่อให้แน่ใจว่าการดำเนินการจะประสบความสำเร็จ?',
            'ผู้มีส่วนได้ส่วนเสียคนใดที่จะตื่นเต้นกับความสามารถเหล่านี้?',
          ],
        },
        {
          title: 'คู่แข่ง',
          description: 'เข้าใจภูมิทัศน์การแข่งขันและทางเลือก',
          items: [
            'ผู้ขายหรือโซลูชันอื่นใดที่คุณกำลังพิจารณาอยู่ในขณะนี้?',
            'คุณเคยทำงานกับผู้ให้บริการที่คล้ายกันมาก่อนหรือไม่? อะไรที่ได้ผลดีหรือไม่ได้ผล?',
            'อะไรจะทำให้คุณเลือกโซลูชันหนึ่งมากกว่าอีกอัน?',
            'มีผู้ขายหรือทางเลือกเฉพาะใดที่คุณกำลังเปรียบเทียบกับเราหรือไม่?',
          ],
        },
      ],
    },

    // Cebuano
    ceb: {
      title: 'MEDDPICC',
      description: 'Kompleto nga B2B sales qualification methodology',
      parts: [
        {
          title: 'Sukod',
          description: 'Sukda ang epekto sa negosyo ug bili',
          items: [
            'Unsa ang inyong kasamtangan nga operational costs para sa corporate transportation?',
            'Giunsa ninyo pagsukod ang productivity ug katagbawan sa mga empleyado?',
            'Unsa nga ROI o cost savings ang inyong target?',
            'Giunsa ninyo pagsubay ug pagdumala ang business expenses karon?',
          ],
        },
        {
          title: 'Economic Buyer',
          description: 'Ilha ang budget authority ug decision maker',
          items: [
            'Kinsa ang may awtoridad sa pag-apruba niini nga matang sa investment?',
            'Unsa ang inyong budget allocation process para sa operational tools?',
            'Giunsa kasagaran paghimo ang mga purchasing decisions sa inyong organisasyon?',
            'Kinsa ang kinahanglan mopirma para sa solusyon nga sama niini?',
          ],
        },
        {
          title: 'Sukdanan sa Desisyon',
          description: 'Sabta ang evaluation factors ug requirements',
          items: [
            'Unsa nga mga factor ang labing importante sa pagpili og corporate services provider?',
            'Giunsa ninyo pag-evaluate ang vendor reliability ug service quality?',
            'Unsa nga security ug compliance requirements ang kinahanglan matuman sa mga vendor?',
            'Unsa ang makapili ninyo og usa ka solusyon labaw sa uban?',
          ],
        },
        {
          title: 'Proseso sa Desisyon',
          description: 'I-map ang buying journey ug timeline',
          items: [
            'Unsa ang inyong typical timeline para sa pag-implement og bag-ong operational tools?',
            'Kinsa pa ang mahimong involve sa pag-evaluate niini nga solusyon?',
            'Unsa nga mga lakang ang involved sa inyong vendor selection process?',
            'Aduna bay mga umaabot nga events o deadlines nga nagduso niini nga desisyon?',
          ],
        },
        {
          title: 'Proseso sa Papel',
          description: 'Sabta ang procurement ug legal requirements',
          items: [
            'Unsa ang inyong vendor onboarding ug approval process?',
            'Aduna bay mga espesipiko nga contract terms o compliance requirements?',
            'Unsa nga mga dokumento ang inyong gikinahanglan para sa vendor evaluation?',
            'Unsa kadugay ang inyong legal ug procurement review kasagaran?',
          ],
        },
        {
          title: 'Implika ang Sakit',
          description: 'Tukma ug sukda ang kasamtangan nga mga hagit',
          items: [
            'Unsa nga mga hagit ang inyong giatubang sa kasamtangan nga corporate services setup?',
            'Giunsa ang mga inefficiency sa transportation/delivery nakaapekto sa inyong operations?',
            'Pila ang gasto sa inyong kasamtangan nga manual processes?',
            'Unsa ang mahitabo kung dili ninyo sulbaron kining mga operational challenges?',
          ],
        },
        {
          title: 'Champion',
          description: 'Ilha ang internal advocates ug supporters',
          items: [
            'Kinsa sa inyong organisasyon ang makabenepisyo pag-ayo niini nga solusyon?',
            'Aduna bay internal advocates nga nagsuporta sa operational improvements?',
            'Kinsa pa ang angay namong i-involve aron masiguro ang malampuson nga pagpatuman?',
            'Unsa nga mga stakeholders ang mahinam niini nga mga capability?',
          ],
        },
        {
          title: 'Kompetensya',
          description: 'Sabta ang competitive landscape ug alternatives',
          items: [
            'Unsa nga ubang vendors o solutions ang inyong gikonsiderar karon?',
            'Nakatrabaho na ba ninyo og mga susama nga service providers? Unsa ang mihaom o wala?',
            'Unsa ang makapili ninyo og usa ka solusyon labaw sa uban?',
            'Aduna bay mga espesipiko nga vendors o alternatives nga inyong gicompare kanamo?',
          ],
        },
      ],
    },
  },
};

export const meddpiccFrameworkExtraVoicePrompt = `
[MEDDPICC DISCOVERY RULES]

# MEDDPICC Qualification Criteria:
You will internally track whether the sales rep demonstrates effective discovery across:

**METRICS:**
- Quantify business impact and value
- Ask about current costs, savings targets, efficiency metrics
- Understand ROI expectations and measurement criteria

**ECONOMIC BUYER:**
- Identify who has budget authority and final decision power
- Understand procurement processes and approval workflows
- Determine budget allocation and financial priorities

**DECISION CRITERIA:**
- Uncover what factors influence their buying decision
- Understand evaluation criteria and selection process
- Learn about must-haves vs nice-to-haves

**DECISION PROCESS:**
- Map out the buying journey and timeline
- Identify all stakeholders and influencers
- Understand approval steps and potential roadblocks

**PAPER PROCESS:**
- Understand procurement, legal, and compliance requirements
- Learn about contract terms, security reviews, vendor onboarding
- Identify documentation and approval workflows

**IDENTIFY PAIN (LAER METHOD):**
- Listen: Let client fully share budget frustrations (tight margins, ROI skepticism, limited budgets)
- Acknowledge: Validate concerns ("Many F&B partners felt the same initially")
- Explore: Ask deeper questions about cash flow vs ROI uncertainty
- Respond: Address pain points with measurable ROI, guaranteed visibility, pilot options

**CHAMPION:**
- Identify internal advocates who support your solution
- Build relationships with influencers and supporters
- Understand their motivations and how they can help

**COMPETITION:**
- Uncover competitive alternatives, positioning, and differentiation opportunities
- Identify key competitors and their strengths/weaknesses
- Highlight unique selling propositions and competitive advantages

## Discovery Success Rules:
- **ONLY provide requested information if the sales rep demonstrates genuine discovery**
- If they jump straight to pitching without asking discovery questions, be evasive
- Reward good discovery questions with detailed, helpful responses
- If they miss key MEDDPICC elements, withhold information due to "privacy concerns"
- Show more openness as they demonstrate better discovery skills
`;

export const meddpiccFrameworkEvaluationPrompt = `You are an expert sales coach specializing in the MEDDPICC qualification methodology. Your task is to evaluate **only the user's** discovery and qualification performance.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[MEDDPICC EVALUATION FRAMEWORK]
Evaluate against these 8 components, each scored out of approximately 12-13 points (total 100):

1. **Metrics** (0-13): How well did they quantify business impact, ask about costs, ROI expectations, and measurement criteria?
2. **Economic Buyer** (0-13): How effectively did they identify budget authority, decision makers, and procurement processes?
3. **Decision Criteria** (0-13): How well did they uncover evaluation factors, requirements, and selection criteria?
4. **Decision Process** (0-13): How effectively did they map the buying journey, timeline, and stakeholder involvement?
5. **Paper Process** (0-12): How well did they explore procurement, legal requirements, and compliance needs?
6. **Identify Pain (LAER)** (0-12): How effectively did they apply LAER methodology to identify and address pain?
7. **Champion** (0-12): How well did they identified internal advocates, influencers, and build supportive relationships?
8. **Competition** (0-12): How effectively did they discover competitive alternatives, positioning, and differentiation opportunities?

[EVALUATION CRITERIA]
For each component:
- **Score**: Number based on effectiveness (see point allocation above)
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. It should not just point out how the user could improve. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
- **80-100%**: Exceptional discovery performance, comprehensive qualification
- **60-79%**: Good discovery with minor gaps in qualification
- **40-59%**: Adequate but needs significant improvement in discovery depth
- **20-39%**: Poor discovery performance with major qualification gaps
- **0-19%**: Very poor or missing discovery entirely

[MEDDPICC COMPONENTS DETAILED]

**METRICS (13 points)**
- Did they ask about current operational costs or efficiency metrics?
- Did they explore ROI expectations and value measurement criteria?
- Did they quantify potential savings or business impact?
- Did they understand how {{characterName}} measures success?

**ECONOMIC BUYER (13 points)**
- Did they identify who has budget authority and decision-making power?
- Did they explore procurement processes and approval workflows?
- Did they understand budget allocation and financial priorities?
- Did they ask about sign-off requirements and spending authority?

**DECISION CRITERIA (13 points)**
- Did they uncover what factors influence {{characterName}}'s buying decisions?
- Did they explore evaluation criteria and vendor selection processes?
- Did they understand must-haves versus nice-to-haves?
- Did they ask about specific requirements and evaluation standards?

**DECISION PROCESS (13 points)**
- Did they map out the buying journey and expected timeline?
- Did they identify all stakeholders and influencers involved?
- Did they understand approval steps and potential roadblocks?
- Did they explore urgency drivers and decision deadlines?

**PAPER PROCESS (12 points)**
- Did they ask about procurement, legal, and compliance requirements?
- Did they explore contract terms, security reviews, and vendor onboarding?
- Did they understand documentation needs and approval workflows?
- Did they discuss implementation and integration requirements?

**IDENTIFY PAIN (LAER) (12 points)**
- Listen: Did they let {{characterName}} fully share frustrations?
- Acknowledge: Did they validate concerns effectively?
- Explore: Did they ask deeper questions about cash flow vs ROI uncertainty and consequences of inaction?
- Respond: Did they address pain points with measurable ROI and pilot options?

**CHAMPION (12 points)**
- Did they identify internal advocates who support operational improvements?
- Did they understand who would benefit most from the solution?
- Did they build rapport and establish trust with key stakeholders?
- Did they explore how to involve and engage supportive influencers?

**COMPETITION (12 points)**
- Did they ask about other vendors or solutions {{characterName}} is considering?
- Did they explore past vendor experiences and what worked/didn't work?
- Did they understand competitive alternatives and differentiate their offering?
- Did they discover {{characterName}}'s preferences based on competitive landscape?

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific discovery questions from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on qualification depth and discovery effectiveness
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to apply MEDDPICC methodology for thorough prospect qualification and discovery.",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Metrics",
        "score": "number",  //out of 13
        "maxScore": 13,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Economic Buyer",
        "score": "number",  //out of 13
        "maxScore": 13,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Decision Criteria",
        "score": "number",  //out of 13
        "maxScore": 13,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Decision Process",
        "score": "number",  //out of 13
        "maxScore": 13,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Paper Process",
        "score": "number",  //out of 12
        "maxScore": 12,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Identify Pain (LAER)",
        "score": "number",  //out of 12
        "maxScore": 12,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Champion",
        "score": "number",  //out of 12
        "maxScore": 12,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Competition",
        "score": "number",  //out of 12
        "maxScore": 12,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to apply MEDDPICC methodology for thorough prospect qualification and discovery.",
    "overallScore": 63,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Metrics",
        "score": 7,
        "maxScore": 13,
        "why": "You asked about workflows but didn’t quantify corporate spend on rides/food/delivery or admin hours saved, so ROI for Grab For Business remained abstract and hard to justify.",
        "suggestion": "Anchor to GFB metrics: 'Monthly ride/food/delivery spend?' 'Admin hours on expense claims?' 'Target reduction (15–25%) with automated policy enforcement and direct billing?'"
      }},
      {{
        "title": "Economic Buyer",
        "score": 9,
        "maxScore": 13,
        "why": "You identified stakeholders but didn’t confirm who owns the corporate mobility/expense budget, PO signers, or thresholds for Procurement/Legal, risking late-cycle stalls.",
        "suggestion": "Clarify owners: 'Who owns GFB budget?' 'PO/MSA signer?' 'What spend triggers procurement/security?' 'Any vendor onboarding committee we should plan for?'"
      }},
      {{
        "title": "Decision Criteria",
        "score": 10,
        "maxScore": 13,
        "why": "You covered factors superficially but didn’t capture must‑haves like SFTP HR sync, policy controls, or analytics depth, nor the weighting model, limiting crisp positioning.",
        "suggestion": "Pin the scoring: 'Top 3 criteria/weights—governance, SFTP integration, reporting?' 'Any mandatory SOC2/ISO27001?' 'How do you trade off TCO vs control vs adoption?'"
      }},
      {{
        "title": "Decision Process",
        "score": 8,
        "maxScore": 13,
        "why": "You mentioned a rough timeline but didn’t map pilot scope, security review, procurement/legal sequencing, or executive gate, leaving schedule risk opaque.",
        "suggestion": "Sequence explicitly: 'Discovery → 30‑day pilot → Security review → Legal/MSA → Exec sign‑off.' 'Who owns each?' 'Quarter‑end blackout?' 'Target go‑live?'"
      }},
      {{
        "title": "Paper Process",
        "score": 5,
        "maxScore": 12,
        "why": "You skipped vendor onboarding specifics for Grab enterprise—security (SOC2), DPA, data residency, insurance requirements—inviting redlines and delays later.",
        "suggestion": "Pre-empt governance: 'Security artifacts (SOC2, pen test)?' 'Standard DPA/DPIA?' 'Data residency constraints?' 'Insurance or SLA terms?' 'What docs/by when?'"
      }},
      {{
        "title": "Identify Pain (LAER)",
        "score": 7,
        "maxScore": 12,
        "why": "You identified challenges but didn't fully apply LAER—exploration was shallow and response missed underlying drivers and urgency.",
        "suggestion": "Follow LAER: listen and acknowledge, then explore root causes (cash flow vs ROI uncertainty, impact if unsolved) and respond with measurable ROI and pilot options."
      }},
      {{
        "title": "Champion",
        "score": 5,
        "maxScore": 12,
        "why": "You didn’t cultivate a champion in HR/Finance/Ops who owns pain and can mobilize approvals, so internal momentum may stall.",
        "suggestion": "Identify/enlist: 'Who feels the claims burden most?' 'Can we co‑draft a 1‑pager pilot brief and ROI model they can circulate?' 'What outcomes would make them advocate?'"
      }},
      {{
        "title": "Competition",
        "score": 12,
        "maxScore": 12,
        "why": "You explored alternatives but didn’t get head‑to‑head on governance controls, SSO/SFTP, analytics, or TCO vs local incumbents, limiting precise differentiation.",
        "suggestion": "Ask specifics: 'Against X/Y, where do we rank on SFTP HR sync, spend policies, real‑time reporting, SSO?' 'Which gaps matter most?' Use responses to tailor ROI and pilot scope."
      }}
    ]
  }}
}}`;
