import { connect, disconnect, Types } from 'mongoose';
import { IScorecard, Scorecard } from '../../models/Scorecard.js';
import * as dotenv from 'dotenv';
import {
  GRAB_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
} from '../../utils/constants.js';
import { envExtension } from '../../env.js';
import { join } from 'node:path';
import { meddpiccFrameworkEvaluationPrompt } from '../../frameworks/meddpicc.js';
import { mexMeddpiccFrameworkEvaluationPrompt } from '../../frameworks/mexMeddpicc.js';
import { laerSoftSkillsPrompt } from '../../prompts/grab-mex-soft-skills.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

// Parse company argument
const VALID_COMPANIES = ['grab', 'grab-test'] as const;
type CompanyArg = (typeof VALID_COMPANIES)[number];

function parseCompanyArg(): CompanyArg {
  const companyArg = process.argv.find((arg) => arg.startsWith('--company='));

  if (!companyArg) {
    console.error('Error: --company argument is required');
    console.error('Usage: npx tsx script.ts --company=grab|grab-test');
    process.exit(1);
  }

  const value = companyArg.split('=')[1] as CompanyArg;

  if (!VALID_COMPANIES.includes(value)) {
    console.error(
      `Error: Invalid company "${value}". Must be one of: ${VALID_COMPANIES.join(', ')}`,
    );
    process.exit(1);
  }

  return value;
}

const companyArg = parseCompanyArg();
const TARGET_COMPANY_ID =
  companyArg === 'grab' ? GRAB_COMPANY_ID : GRAB_TEST_COMPANY_ID;

// Generate different identifiers based on company to avoid collisions
// grab-test keeps original IDs, grab uses different hardcoded IDs
const meddpiccId = companyArg === 'grab' ? 'A7X9K2' : 'QHGanM';
const mexMeddpiccId = companyArg === 'grab' ? 'B8Y4M5' : 'XUDE4A';

const GRAB_SCORECARDS: Omit<IScorecard, 'createdAt' | 'updatedAt'>[] = [
  {
    _id: new Types.ObjectId(),
    friendlyId: `grab-meddpicc-assessment-${meddpiccId}`,
    name: 'Grab MEDDPICC Assessment',
    assessmentType: 'score',
    scormPolicy: {
      enabled: true,
    },
    sections: [
      {
        name: 'Sales Technique',
        sectionType: 'custom',
        criteria: [
          {
            title: 'Metrics',
            description:
              'How well was business impact, cost, ROI expectations, and measurement criteria quantified?\n• Were current operational costs or efficiency metrics explored?\n• Were ROI expectations and value measurement criteria discussed?\n• Was potential business impact or cost savings quantified?\n• Was an understanding shown of how the client defines and measures success?\n\nConversation starters (examples):\n• What are your current operational costs for corporate transportation?\n• How do you measure employee productivity and satisfaction?\n• What ROI or cost savings are you targeting?\n• How do you currently track and manage business expenses?',
          },
          {
            title: 'Economic Buyer',
            description:
              'How effectively were budget authority, decision-makers, and procurement processes identified?\n• Was budget ownership and decision-making authority identified?\n• Were procurement processes and approval workflows explored?\n• Was an understanding demonstrated of budget allocation and financial priorities?\n• Were sign-off requirements and spending authority clarified?\n\nConversation starters (examples):\n• Who typically has approval authority for investments of this type?\n• How are budgets allocated for operational or technology tools?\n• How are purchasing decisions usually made within the organization?\n• Who would need to be involved in approving a solution like this?',
          },
          {
            title: 'Decision Criteria',
            description:
              'How well were evaluation factors, requirements, and selection criteria uncovered?\n• Were the factors influencing buying decisions explored?\n• Were evaluation criteria and vendor selection processes discussed?\n• Was clarity established around must-haves versus nice-to-haves?\n• Were specific requirements and evaluation standards identified?\n\nConversation starters (examples):\n• What factors are most important when selecting a service provider?\n• How is vendor reliability or service quality typically evaluated?\n• What security, compliance, or operational requirements must be met?\n• What would ultimately differentiate one solution from another?',
          },
          {
            title: 'Decision Process',
            description:
              'How effectively were the buying journey, timeline, and stakeholder involvement mapped?\n• Was the overall buying process and expected timeline explored?\n• Were key stakeholders, influencers, and approvers identified?\n• Were approval steps and potential obstacles discussed?\n• Were urgency drivers and decision deadlines clarified?\n\nConversation starters (examples):\n• What does a typical timeline look like for implementing a solution like this?\n• Who else would usually be involved in evaluating or approving this decision?\n• What steps are involved in your selection or approval process?\n• Are there upcoming milestones or deadlines influencing timing?',
          },
          {
            title: 'Paper Process',
            description:
              'How well were procurement, legal requirements, and compliance needs explored?\n• Were procurement, legal, and compliance requirements discussed?\n• Were contract terms, security reviews, and onboarding processes explored?\n• Was an understanding demonstrated of documentation and approval workflows?\n• Were implementation and integration requirements addressed?\n\nConversation starters (examples):\n• What does your vendor onboarding or approval process typically involve?\n• Are there standard contract terms or compliance requirements to be aware of?\n• What documentation is usually required during vendor evaluation?\n• How long do legal or procurement reviews generally take?',
          },
          {
            title: 'Identify Pain',
            description:
              'How effectively was the LAER methodology applied to identify and address pain?\n• Listen: Was space given for the prospect to fully share challenges or frustrations?\n• Acknowledge: Were concerns validated and reflected back appropriately?\n• Explore: Were deeper questions asked about impact, risk, and consequences of inaction?\n• Respond: Were pain points addressed with relevant solutions, outcomes, or proof points?\n\nConversation starters (examples):\n• Allow space for challenges to be fully explained without interruption\n• Acknowledge concerns with empathy and validation\n• Explore underlying drivers such as cash flow, ROI uncertainty, or operational risk\n• Respond by connecting pain points to measurable outcomes, pilots, or mitigations',
          },
          {
            title: 'Champion',
            description:
              'How well were internal advocates, influencers, and supportive relationships identified?\n• Were internal advocates for change or improvement identified?\n• Was an understanding demonstrated of who benefits most from the solution?\n• Were rapport and trust established with key stakeholders?\n• Were ways to involve and engage supportive influencers explored?\n\nConversation starters (examples):\n• Who within the organization would benefit most from this solution?\n• Are there internal advocates who typically support operational improvements?\n• Who else should be involved to support successful implementation?\n• Which stakeholders are likely to be most excited about these capabilities?',
          },
          {
            title: 'Competition',
            description:
              "How effectively were competitive alternatives, positioning, and differentiation uncovered?\n• Were other vendors or solutions under consideration discussed?\n• Were prior experiences with similar vendors explored?\n• Was an understanding demonstrated of competitive alternatives and differentiation?\n• Were preferences within the competitive landscape identified?\n\nConversation starters (examples):\n• What other solutions or providers are currently being considered?\n• Have similar vendors been used in the past? What worked or didn't?\n• What factors typically influence choosing one solution over another?\n• Are there specific alternatives being compared against?",
          },
        ],
        prompt: meddpiccFrameworkEvaluationPrompt,
      },
      {
        name: 'Product Knowledge',
        sectionType: 'product-knowledge',
        criteria: [
          {
            title: 'Product pitch',
            description:
              "• Demonstrate clear understanding of product features, benefits, and value proposition.\n• Explain how features solve the customer's problems.\n• Communicate product advantages clearly and concisely.\n• Tailor product information to the customer's needs and context.\n• Present accurate product information.",
          },
          {
            title: 'Competitor differentiation',
            description:
              "• Demonstrate knowledge of the competitive landscape relevant to the scenario.\n• Position product advantages against competitors with concrete examples.\n• Handle competitive objections or direct comparisons effectively.\n• Articulate the product's unique value proposition and why it matters to the customer.",
          },
        ],
      },
    ],
    localizations: {
      id: {
        name: 'Penilaian MEDDPICC Grab',
        sections: [
          {
            name: 'Teknik Penjualan',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Metrics',
                description:
                  'Seberapa baik dampak bisnis, biaya, ekspektasi ROI, dan kriteria pengukuran dikuantifikasi?\n• Apakah biaya operasional atau metrik efisiensi saat ini dieksplorasi?\n• Apakah ekspektasi ROI dan kriteria pengukuran nilai dibahas?\n• Apakah dampak bisnis potensial atau penghematan biaya dikuantifikasi?\n• Apakah pemahaman ditunjukkan tentang bagaimana klien mendefinisikan dan mengukur kesuksesan?\n\nPembuka percakapan (contoh):\n• Berapa biaya operasional Anda saat ini untuk transportasi korporat?\n• Bagaimana Anda mengukur produktivitas dan kepuasan karyawan?\n• ROI atau penghematan biaya apa yang Anda targetkan?\n• Bagaimana Anda saat ini melacak dan mengelola pengeluaran bisnis?',
              },
              {
                title: 'Economic Buyer',
                description:
                  'Seberapa efektif otoritas anggaran, pembuat keputusan, dan proses pengadaan diidentifikasi?\n• Apakah kepemilikan anggaran dan otoritas pengambilan keputusan diidentifikasi?\n• Apakah proses pengadaan dan alur persetujuan dieksplorasi?\n• Apakah pemahaman ditunjukkan tentang alokasi anggaran dan prioritas keuangan?\n• Apakah persyaratan persetujuan dan otoritas pengeluaran diklarifikasi?\n\nPembuka percakapan (contoh):\n• Siapa yang biasanya memiliki otoritas persetujuan untuk investasi jenis ini?\n• Bagaimana anggaran dialokasikan untuk alat operasional atau teknologi?\n• Bagaimana keputusan pembelian biasanya dibuat dalam organisasi?\n• Siapa yang perlu dilibatkan dalam menyetujui solusi seperti ini?',
              },
              {
                title: 'Decision Criteria',
                description:
                  'Seberapa baik faktor evaluasi, persyaratan, dan kriteria seleksi diungkap?\n• Apakah faktor-faktor yang mempengaruhi keputusan pembelian dieksplorasi?\n• Apakah kriteria evaluasi dan proses seleksi vendor dibahas?\n• Apakah kejelasan ditetapkan seputar keharusan versus yang bagus untuk dimiliki?\n• Apakah persyaratan spesifik dan standar evaluasi diidentifikasi?\n\nPembuka percakapan (contoh):\n• Faktor apa yang paling penting saat memilih penyedia layanan?\n• Bagaimana keandalan vendor atau kualitas layanan biasanya dievaluasi?\n• Persyaratan keamanan, kepatuhan, atau operasional apa yang harus dipenuhi?\n• Apa yang pada akhirnya akan membedakan satu solusi dari yang lain?',
              },
              {
                title: 'Decision Process',
                description:
                  'Seberapa efektif perjalanan pembelian, timeline, dan keterlibatan pemangku kepentingan dipetakan?\n• Apakah proses pembelian keseluruhan dan timeline yang diharapkan dieksplorasi?\n• Apakah pemangku kepentingan utama, influencer, dan pemberi persetujuan diidentifikasi?\n• Apakah langkah-langkah persetujuan dan hambatan potensial dibahas?\n• Apakah pendorong urgensi dan tenggat waktu keputusan diklarifikasi?\n\nPembuka percakapan (contoh):\n• Seperti apa timeline tipikal untuk mengimplementasikan solusi seperti ini?\n• Siapa lagi yang biasanya terlibat dalam mengevaluasi atau menyetujui keputusan ini?\n• Langkah apa saja yang terlibat dalam proses seleksi atau persetujuan Anda?\n• Apakah ada milestone atau tenggat waktu yang akan datang yang mempengaruhi waktu?',
              },
              {
                title: 'Paper Process',
                description:
                  'Seberapa baik pengadaan, persyaratan hukum, dan kebutuhan kepatuhan dieksplorasi?\n• Apakah persyaratan pengadaan, hukum, dan kepatuhan dibahas?\n• Apakah ketentuan kontrak, tinjauan keamanan, dan proses onboarding dieksplorasi?\n• Apakah pemahaman ditunjukkan tentang dokumentasi dan alur persetujuan?\n• Apakah persyaratan implementasi dan integrasi ditangani?\n\nPembuka percakapan (contoh):\n• Apa yang biasanya terlibat dalam proses onboarding atau persetujuan vendor Anda?\n• Apakah ada ketentuan kontrak standar atau persyaratan kepatuhan yang perlu diketahui?\n• Dokumentasi apa yang biasanya diperlukan selama evaluasi vendor?\n• Berapa lama tinjauan hukum atau pengadaan biasanya berlangsung?',
              },
              {
                title: 'Identify Pain',
                description:
                  'Seberapa efektif metodologi LAER diterapkan untuk mengidentifikasi dan mengatasi masalah?\n• Listen: Apakah ruang diberikan kepada prospek untuk sepenuhnya membagikan tantangan atau frustrasi?\n• Acknowledge: Apakah kekhawatiran divalidasi dan direfleksikan kembali dengan tepat?\n• Explore: Apakah pertanyaan yang lebih dalam diajukan tentang dampak, risiko, dan konsekuensi tidak bertindak?\n• Respond: Apakah poin masalah ditangani dengan solusi, hasil, atau bukti yang relevan?\n\nPembuka percakapan (contoh):\n• Berikan ruang untuk tantangan dijelaskan sepenuhnya tanpa gangguan\n• Akui kekhawatiran dengan empati dan validasi\n• Eksplorasi pendorong mendasar seperti arus kas, ketidakpastian ROI, atau risiko operasional\n• Tanggapi dengan menghubungkan poin masalah ke hasil terukur, pilot, atau mitigasi',
              },
              {
                title: 'Champion',
                description:
                  'Seberapa baik advokat internal, influencer, dan hubungan yang mendukung diidentifikasi?\n• Apakah advokat internal untuk perubahan atau peningkatan diidentifikasi?\n• Apakah pemahaman ditunjukkan tentang siapa yang paling diuntungkan dari solusi?\n• Apakah hubungan baik dan kepercayaan dibangun dengan pemangku kepentingan utama?\n• Apakah cara untuk melibatkan dan mengajak influencer yang mendukung dieksplorasi?\n\nPembuka percakapan (contoh):\n• Siapa dalam organisasi yang akan paling diuntungkan dari solusi ini?\n• Apakah ada advokat internal yang biasanya mendukung peningkatan operasional?\n• Siapa lagi yang harus terlibat untuk mendukung implementasi yang sukses?\n• Pemangku kepentingan mana yang kemungkinan paling antusias tentang kemampuan ini?',
              },
              {
                title: 'Competition',
                description:
                  'Seberapa efektif alternatif kompetitif, positioning, dan diferensiasi diungkap?\n• Apakah vendor atau solusi lain yang sedang dipertimbangkan dibahas?\n• Apakah pengalaman sebelumnya dengan vendor serupa dieksplorasi?\n• Apakah pemahaman ditunjukkan tentang alternatif kompetitif dan diferensiasi?\n• Apakah preferensi dalam lanskap kompetitif diidentifikasi?\n\nPembuka percakapan (contoh):\n• Solusi atau penyedia lain apa yang saat ini sedang dipertimbangkan?\n• Apakah vendor serupa pernah digunakan di masa lalu? Apa yang berhasil atau tidak?\n• Faktor apa yang biasanya mempengaruhi pemilihan satu solusi dibanding yang lain?\n• Apakah ada alternatif spesifik yang dibandingkan?',
              },
            ],
          },
          {
            name: 'Pengetahuan Produk',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'Penjelasan produk',
                description:
                  'Menilai kemampuan dalam menjelaskan informasi produk.',
              },
              {
                title: 'Diferensiasi kompetitor',
                description:
                  'Menilai kemampuan dalam membedakan produk dari kompetitor.',
              },
            ],
          },
        ],
      },
      ms: {
        name: 'Penilaian MEDDPICC Grab',
        sections: [
          {
            name: 'Teknik Jualan',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Metrics',
                description:
                  'Sejauh mana impak perniagaan, kos, jangkaan ROI, dan kriteria pengukuran dikuantifikasi?\n• Adakah kos operasi atau metrik kecekapan semasa diterokai?\n• Adakah jangkaan ROI dan kriteria pengukuran nilai dibincangkan?\n• Adakah impak perniagaan yang berpotensi atau penjimatan kos dikuantifikasi?\n• Adakah pemahaman ditunjukkan tentang bagaimana klien mentakrifkan dan mengukur kejayaan?\n\nPemula perbualan (contoh):\n• Apakah kos operasi semasa anda untuk pengangkutan korporat?\n• Bagaimana anda mengukur produktiviti dan kepuasan pekerja?\n• Apakah ROI atau penjimatan kos yang anda sasarkan?\n• Bagaimana anda semasa menjejak dan mengurus perbelanjaan perniagaan?',
              },
              {
                title: 'Economic Buyer',
                description:
                  'Sejauh mana kuasa belanjawan, pembuat keputusan, dan proses perolehan dikenal pasti?\n• Adakah pemilikan belanjawan dan kuasa membuat keputusan dikenal pasti?\n• Adakah proses perolehan dan aliran kelulusan diterokai?\n• Adakah pemahaman ditunjukkan tentang peruntukan belanjawan dan keutamaan kewangan?\n• Adakah keperluan kelulusan dan kuasa perbelanjaan dijelaskan?\n\nPemula perbualan (contoh):\n• Siapa yang biasanya mempunyai kuasa kelulusan untuk pelaburan jenis ini?\n• Bagaimana belanjawan diperuntukkan untuk alat operasi atau teknologi?\n• Bagaimana keputusan pembelian biasanya dibuat dalam organisasi?\n• Siapa yang perlu terlibat dalam meluluskan penyelesaian seperti ini?',
              },
              {
                title: 'Decision Criteria',
                description:
                  'Sejauh mana faktor penilaian, keperluan, dan kriteria pemilihan ditemui?\n• Adakah faktor yang mempengaruhi keputusan pembelian diterokai?\n• Adakah kriteria penilaian dan proses pemilihan vendor dibincangkan?\n• Adakah kejelasan diwujudkan mengenai keperluan berbanding keinginan?\n• Adakah keperluan khusus dan piawaian penilaian dikenal pasti?\n\nPemula perbualan (contoh):\n• Faktor apa yang paling penting semasa memilih penyedia perkhidmatan?\n• Bagaimana kebolehpercayaan vendor atau kualiti perkhidmatan biasanya dinilai?\n• Apakah keperluan keselamatan, pematuhan, atau operasi yang mesti dipenuhi?\n• Apakah yang akhirnya akan membezakan satu penyelesaian daripada yang lain?',
              },
              {
                title: 'Decision Process',
                description:
                  'Sejauh mana perjalanan pembelian, garis masa, dan penglibatan pihak berkepentingan dipetakan?\n• Adakah proses pembelian keseluruhan dan garis masa yang dijangkakan diterokai?\n• Adakah pihak berkepentingan utama, pemberi pengaruh, dan pemberi kelulusan dikenal pasti?\n• Adakah langkah kelulusan dan halangan yang berpotensi dibincangkan?\n• Adakah pemacu keperluan dan tarikh akhir keputusan dijelaskan?\n\nPemula perbualan (contoh):\n• Apakah garis masa biasa untuk melaksanakan penyelesaian seperti ini?\n• Siapa lagi yang biasanya terlibat dalam menilai atau meluluskan keputusan ini?\n• Apakah langkah yang terlibat dalam proses pemilihan atau kelulusan anda?\n• Adakah milestone atau tarikh akhir yang akan datang yang mempengaruhi masa?',
              },
              {
                title: 'Paper Process',
                description:
                  'Sejauh mana perolehan, keperluan undang-undang, dan keperluan pematuhan diterokai?\n• Adakah keperluan perolehan, undang-undang, dan pematuhan dibincangkan?\n• Adakah terma kontrak, semakan keselamatan, dan proses onboarding diterokai?\n• Adakah pemahaman ditunjukkan tentang dokumentasi dan aliran kelulusan?\n• Adakah keperluan pelaksanaan dan integrasi ditangani?\n\nPemula perbualan (contoh):\n• Apakah yang biasanya terlibat dalam proses onboarding atau kelulusan vendor anda?\n• Adakah terma kontrak standard atau keperluan pematuhan yang perlu diketahui?\n• Dokumentasi apa yang biasanya diperlukan semasa penilaian vendor?\n• Berapa lama semakan undang-undang atau perolehan biasanya mengambil masa?',
              },
              {
                title: 'Identify Pain',
                description:
                  'Sejauh mana metodologi LAER digunakan untuk mengenal pasti dan menangani masalah?\n• Listen: Adakah ruang diberikan kepada prospek untuk berkongsi sepenuhnya cabaran atau kekecewaan?\n• Acknowledge: Adakah kebimbangan disahkan dan dicerminkan semula dengan sewajarnya?\n• Explore: Adakah soalan yang lebih mendalam ditanya tentang impak, risiko, dan akibat tidak bertindak?\n• Respond: Adakah titik masalah ditangani dengan penyelesaian, hasil, atau bukti yang berkaitan?\n\nPemula perbualan (contoh):\n• Berikan ruang untuk cabaran dijelaskan sepenuhnya tanpa gangguan\n• Akui kebimbangan dengan empati dan pengesahan\n• Terokai pemacu asas seperti aliran tunai, ketidakpastian ROI, atau risiko operasi\n• Balas dengan menghubungkan titik masalah kepada hasil yang boleh diukur, pilot, atau mitigasi',
              },
              {
                title: 'Champion',
                description:
                  'Sejauh mana penyokong dalaman, pemberi pengaruh, dan hubungan yang menyokong dikenal pasti?\n• Adakah penyokong dalaman untuk perubahan atau peningkatan dikenal pasti?\n• Adakah pemahaman ditunjukkan tentang siapa yang paling mendapat manfaat daripada penyelesaian?\n• Adakah hubungan baik dan kepercayaan dibina dengan pihak berkepentingan utama?\n• Adakah cara untuk melibatkan dan mengajak pemberi pengaruh yang menyokong diterokai?\n\nPemula perbualan (contoh):\n• Siapa dalam organisasi yang akan paling mendapat manfaat daripada penyelesaian ini?\n• Adakah penyokong dalaman yang biasanya menyokong peningkatan operasi?\n• Siapa lagi yang harus terlibat untuk menyokong pelaksanaan yang berjaya?\n• Pihak berkepentingan mana yang mungkin paling teruja tentang keupayaan ini?',
              },
              {
                title: 'Competition',
                description:
                  'Sejauh mana alternatif kompetitif, positioning, dan pembezaan ditemui?\n• Adakah vendor atau penyelesaian lain yang sedang dipertimbangkan dibincangkan?\n• Adakah pengalaman terdahulu dengan vendor serupa diterokai?\n• Adakah pemahaman ditunjukkan tentang alternatif kompetitif dan pembezaan?\n• Adakah pilihan dalam landskap kompetitif dikenal pasti?\n\nPemula perbualan (contoh):\n• Penyelesaian atau penyedia lain apa yang sedang dipertimbangkan?\n• Adakah vendor serupa pernah digunakan pada masa lalu? Apa yang berjaya atau tidak?\n• Faktor apa yang biasanya mempengaruhi pemilihan satu penyelesaian berbanding yang lain?\n• Adakah alternatif khusus yang dibandingkan?',
              },
            ],
          },
          {
            name: 'Pengetahuan Produk',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'Penerangan produk',
                description:
                  'Menilai kecekapan dalam menerangkan maklumat produk.',
              },
              {
                title: 'Pembezaan pesaing',
                description:
                  'Menilai kecekapan dalam membezakan produk daripada pesaing.',
              },
            ],
          },
        ],
      },
      tl: {
        name: 'Grab MEDDPICC Assessment',
        sections: [
          {
            name: 'Sales Technique',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Metrics',
                description:
                  'Gaano kahusay na na-quantify ang business impact, gastos, ROI expectations, at measurement criteria?\n• Na-explore ba ang kasalukuyang operational costs o efficiency metrics?\n• Napag-usapan ba ang ROI expectations at value measurement criteria?\n• Na-quantify ba ang potential business impact o cost savings?\n• Ipinakita ba ang pag-unawa kung paano tinutukoy at sinusukat ng kliyente ang tagumpay?\n\nPanimulang tanong (mga halimbawa):\n• Ano ang iyong kasalukuyang operational costs para sa corporate transportation?\n• Paano mo sinusukat ang productivity at satisfaction ng empleyado?\n• Anong ROI o cost savings ang iyong target?\n• Paano mo kasalukuyang sinusubaybayan at pinamamahalaan ang business expenses?',
              },
              {
                title: 'Economic Buyer',
                description:
                  'Gaano ka-epektibo ang pagkilala sa budget authority, decision-makers, at procurement processes?\n• Na-identify ba ang budget ownership at decision-making authority?\n• Na-explore ba ang procurement processes at approval workflows?\n• Ipinakita ba ang pag-unawa sa budget allocation at financial priorities?\n• Nalinaw ba ang sign-off requirements at spending authority?\n\nPanimulang tanong (mga halimbawa):\n• Sino ang karaniwang may approval authority para sa ganitong uri ng investment?\n• Paano inilalaan ang budget para sa operational o technology tools?\n• Paano karaniwang ginagawa ang purchasing decisions sa loob ng organisasyon?\n• Sino ang kailangang maging involved sa pag-approve ng ganitong solusyon?',
              },
              {
                title: 'Decision Criteria',
                description:
                  'Gaano kahusay na natuklasan ang evaluation factors, requirements, at selection criteria?\n• Na-explore ba ang mga factors na nakakaimpluwensya sa buying decisions?\n• Napag-usapan ba ang evaluation criteria at vendor selection processes?\n• Nalinaw ba ang must-haves versus nice-to-haves?\n• Na-identify ba ang specific requirements at evaluation standards?\n\nPanimulang tanong (mga halimbawa):\n• Anong mga factors ang pinaka-importante sa pagpili ng service provider?\n• Paano karaniwang nire-evaluate ang vendor reliability o service quality?\n• Anong security, compliance, o operational requirements ang dapat matugunan?\n• Ano ang sa huli ay magpapakita ng pagkakaiba ng isang solusyon sa iba?',
              },
              {
                title: 'Decision Process',
                description:
                  'Gaano ka-epektibo ang pag-map ng buying journey, timeline, at stakeholder involvement?\n• Na-explore ba ang overall buying process at expected timeline?\n• Na-identify ba ang key stakeholders, influencers, at approvers?\n• Napag-usapan ba ang approval steps at potential obstacles?\n• Nalinaw ba ang urgency drivers at decision deadlines?\n\nPanimulang tanong (mga halimbawa):\n• Ano ang karaniwang timeline para sa pag-implement ng ganitong solusyon?\n• Sino pa ang karaniwang involved sa pag-evaluate o pag-approve ng desisyon na ito?\n• Anong mga steps ang involved sa iyong selection o approval process?\n• Mayroon bang upcoming milestones o deadlines na nakakaimpluwensya sa timing?',
              },
              {
                title: 'Paper Process',
                description:
                  'Gaano kahusay na na-explore ang procurement, legal requirements, at compliance needs?\n• Napag-usapan ba ang procurement, legal, at compliance requirements?\n• Na-explore ba ang contract terms, security reviews, at onboarding processes?\n• Ipinakita ba ang pag-unawa sa documentation at approval workflows?\n• Tinugunan ba ang implementation at integration requirements?\n\nPanimulang tanong (mga halimbawa):\n• Ano ang karaniwang involved sa inyong vendor onboarding o approval process?\n• Mayroon bang standard contract terms o compliance requirements na dapat malaman?\n• Anong documentation ang karaniwang kailangan sa vendor evaluation?\n• Gaano katagal karaniwang tumatagal ang legal o procurement reviews?',
              },
              {
                title: 'Identify Pain',
                description:
                  'Gaano ka-epektibo ang paggamit ng LAER methodology para tukuyin at tugunan ang pain?\n• Listen: Binigyan ba ng espasyo ang prospect na ganap na ibahagi ang mga hamon o frustrations?\n• Acknowledge: Na-validate at na-reflect back ba nang tama ang mga alalahanin?\n• Explore: Nagtanong ba ng mas malalim tungkol sa impact, risk, at consequences ng hindi pag-aksyon?\n• Respond: Tinugunan ba ang pain points gamit ang relevant solutions, outcomes, o proof points?\n\nPanimulang tanong (mga halimbawa):\n• Bigyan ng espasyo ang mga hamon na maipaliwanag nang buo nang walang pagsasalita\n• Kilalanin ang mga alalahanin gamit ang empathy at validation\n• I-explore ang underlying drivers tulad ng cash flow, ROI uncertainty, o operational risk\n• Tumugon sa pamamagitan ng pag-connect ng pain points sa measurable outcomes, pilots, o mitigations',
              },
              {
                title: 'Champion',
                description:
                  'Gaano kahusay na na-identify ang internal advocates, influencers, at supportive relationships?\n• Na-identify ba ang internal advocates para sa pagbabago o improvement?\n• Ipinakita ba ang pag-unawa kung sino ang pinakakinakinabangan sa solusyon?\n• Nabuo ba ang rapport at tiwala sa key stakeholders?\n• Na-explore ba ang mga paraan para isama at makuha ang supportive influencers?\n\nPanimulang tanong (mga halimbawa):\n• Sino sa loob ng organisasyon ang pinakakinakinabangan sa solusyon na ito?\n• Mayroon bang internal advocates na karaniwang sumusuporta sa operational improvements?\n• Sino pa ang dapat maging involved para suportahan ang matagumpay na implementation?\n• Aling stakeholders ang malamang na pinaka-excited tungkol sa capabilities na ito?',
              },
              {
                title: 'Competition',
                description:
                  'Gaano ka-epektibo ang pagdiskubre ng competitive alternatives, positioning, at differentiation?\n• Napag-usapan ba ang ibang vendors o solutions na isinasaalang-alang?\n• Na-explore ba ang prior experiences sa similar vendors?\n• Ipinakita ba ang pag-unawa sa competitive alternatives at differentiation?\n• Na-identify ba ang preferences sa competitive landscape?\n\nPanimulang tanong (mga halimbawa):\n• Anong ibang solutions o providers ang kasalukuyang isinasaalang-alang?\n• Ginamit na ba ang similar vendors dati? Ano ang gumana o hindi?\n• Anong factors ang karaniwang nakakaimpluwensya sa pagpili ng isang solusyon kaysa sa iba?\n• Mayroon bang specific alternatives na kinukumpara?',
              },
            ],
          },
          {
            name: 'Product Knowledge',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'Product pitch',
                description:
                  'Sinusukat ang kakayahan sa pagpapaliwanag ng impormasyon ng produkto.',
              },
              {
                title: 'Competitor differentiation',
                description:
                  'Sinusukat ang kakayahan sa pagkakaiba ng produkto laban sa mga kakumpitensya.',
              },
            ],
          },
        ],
      },
      vi: {
        name: 'Đánh giá MEDDPICC Grab',
        sections: [
          {
            name: 'Kỹ thuật bán hàng',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Số liệu',
                description:
                  'Tác động kinh doanh, chi phí, kỳ vọng ROI và tiêu chí đo lường được lượng hóa tốt như thế nào?\n• Các chi phí hoạt động hiện tại hoặc chỉ số hiệu quả có được khám phá không?\n• Kỳ vọng ROI và tiêu chí đo lường giá trị có được thảo luận không?\n• Tác động kinh doanh tiềm năng hoặc tiết kiệm chi phí có được lượng hóa không?\n• Có thể hiện sự hiểu biết về cách khách hàng xác định và đo lường thành công không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• Chi phí hoạt động hiện tại của bạn cho vận chuyển công ty là bao nhiêu?\n• Bạn đo lường năng suất và sự hài lòng của nhân viên như thế nào?\n• Bạn đang nhắm mục tiêu ROI hoặc tiết kiệm chi phí nào?\n• Hiện tại bạn theo dõi và quản lý chi phí kinh doanh như thế nào?',
              },
              {
                title: 'Người mua có quyền quyết định ngân sách',
                description:
                  'Quyền ngân sách, người ra quyết định và quy trình mua sắm được xác định hiệu quả như thế nào?\n• Quyền sở hữu ngân sách và quyền ra quyết định có được xác định không?\n• Quy trình mua sắm và quy trình phê duyệt có được khám phá không?\n• Có thể hiện sự hiểu biết về phân bổ ngân sách và ưu tiên tài chính không?\n• Yêu cầu phê duyệt và thẩm quyền chi tiêu có được làm rõ không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• Ai thường có thẩm quyền phê duyệt cho loại đầu tư này?\n• Ngân sách được phân bổ như thế nào cho các công cụ hoạt động hoặc công nghệ?\n• Quyết định mua hàng thường được thực hiện như thế nào trong tổ chức?\n• Ai cần tham gia vào việc phê duyệt giải pháp như thế này?',
              },
              {
                title: 'Tiêu chí quyết định',
                description:
                  'Các yếu tố đánh giá, yêu cầu và tiêu chí lựa chọn được phát hiện tốt như thế nào?\n• Các yếu tố ảnh hưởng đến quyết định mua hàng có được khám phá không?\n• Tiêu chí đánh giá và quy trình lựa chọn nhà cung cấp có được thảo luận không?\n• Sự rõ ràng có được thiết lập xung quanh những điều bắt buộc so với những điều tốt để có không?\n• Yêu cầu cụ thể và tiêu chuẩn đánh giá có được xác định không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• Yếu tố nào quan trọng nhất khi chọn nhà cung cấp dịch vụ?\n• Độ tin cậy của nhà cung cấp hoặc chất lượng dịch vụ thường được đánh giá như thế nào?\n• Yêu cầu bảo mật, tuân thủ hoặc hoạt động nào phải được đáp ứng?\n• Cuối cùng điều gì sẽ phân biệt một giải pháp với giải pháp khác?',
              },
              {
                title: 'Quy trình quyết định',
                description:
                  'Hành trình mua hàng, thời gian và sự tham gia của các bên liên quan được lập bản đồ hiệu quả như thế nào?\n• Quy trình mua hàng tổng thể và thời gian dự kiến có được khám phá không?\n• Các bên liên quan chính, người có ảnh hưởng và người phê duyệt có được xác định không?\n• Các bước phê duyệt và trở ngại tiềm ẩn có được thảo luận không?\n• Các yếu tố thúc đẩy khẩn cấp và thời hạn quyết định có được làm rõ không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• Thời gian điển hình để triển khai giải pháp như thế này là bao lâu?\n• Ai khác thường tham gia vào việc đánh giá hoặc phê duyệt quyết định này?\n• Các bước nào liên quan đến quy trình lựa chọn hoặc phê duyệt của bạn?\n• Có các cột mốc hoặc thời hạn sắp tới nào ảnh hưởng đến thời gian không?',
              },
              {
                title: 'Paper Process',
                description:
                  'Mua sắm, yêu cầu pháp lý và nhu cầu tuân thủ được khám phá tốt như thế nào?\n• Yêu cầu mua sắm, pháp lý và tuân thủ có được thảo luận không?\n• Điều khoản hợp đồng, đánh giá bảo mật và quy trình tích hợp có được khám phá không?\n• Có thể hiện sự hiểu biết về tài liệu và quy trình phê duyệt không?\n• Yêu cầu triển khai và tích hợp có được giải quyết không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• Quy trình tích hợp hoặc phê duyệt nhà cung cấp của bạn thường liên quan đến điều gì?\n• Có các điều khoản hợp đồng tiêu chuẩn hoặc yêu cầu tuân thủ nào cần biết không?\n• Tài liệu nào thường được yêu cầu trong quá trình đánh giá nhà cung cấp?\n• Đánh giá pháp lý hoặc mua sắm thường mất bao lâu?',
              },
              {
                title: 'Làm rõ vấn đề',
                description:
                  'Phương pháp LAER được áp dụng để xác định và giải quyết vấn đề hiệu quả như thế nào?\n• Listen: Có dành không gian cho khách hàng tiềm năng để chia sẻ đầy đủ các thách thức hoặc thất vọng không?\n• Acknowledge: Các mối quan tâm có được xác nhận và phản ánh lại một cách phù hợp không?\n• Explore: Có đặt câu hỏi sâu hơn về tác động, rủi ro và hậu quả của việc không hành động không?\n• Respond: Các điểm đau có được giải quyết bằng các giải pháp, kết quả hoặc bằng chứng liên quan không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• Cho phép không gian để các thách thức được giải thích đầy đủ mà không bị gián đoạn\n• Thừa nhận các mối quan tâm với sự đồng cảm và xác nhận\n• Khám phá các yếu tố cơ bản như dòng tiền, sự không chắc chắn về ROI hoặc rủi ro hoạt động\n• Phản hồi bằng cách kết nối các điểm đau với các kết quả có thể đo lường, thí điểm hoặc giảm thiểu',
              },
              {
                title: 'Người ủng hộ',
                description:
                  'Những người ủng hộ nội bộ, người có ảnh hưởng và các mối quan hệ hỗ trợ được xác định tốt như thế nào?\n• Những người ủng hộ nội bộ cho sự thay đổi hoặc cải tiến có được xác định không?\n• Có thể hiện sự hiểu biết về ai được hưởng lợi nhiều nhất từ giải pháp không?\n• Mối quan hệ và sự tin tưởng có được thiết lập với các bên liên quan chính không?\n• Các cách để thu hút và thu hút những người có ảnh hưởng hỗ trợ có được khám phá không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• Ai trong tổ chức sẽ được hưởng lợi nhiều nhất từ giải pháp này?\n• Có những người ủng hộ nội bộ thường hỗ trợ cải tiến hoạt động không?\n• Ai khác nên tham gia để hỗ trợ triển khai thành công?\n• Các bên liên quan nào có khả năng hào hứng nhất về các khả năng này?',
              },
              {
                title: 'Đối thủ cạnh tranh',
                description:
                  'Các lựa chọn thay thế cạnh tranh, định vị và sự khác biệt được phát hiện hiệu quả như thế nào?\n• Các nhà cung cấp hoặc giải pháp khác đang được xem xét có được thảo luận không?\n• Kinh nghiệm trước đó với các nhà cung cấp tương tự có được khám phá không?\n• Có thể hiện sự hiểu biết về các lựa chọn thay thế cạnh tranh và sự khác biệt không?\n• Sở thích trong bối cảnh cạnh tranh có được xác định không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• Các giải pháp hoặc nhà cung cấp khác nào hiện đang được xem xét?\n• Các nhà cung cấp tương tự đã được sử dụng trong quá khứ chưa? Điều gì đã hoạt động hoặc không?\n• Yếu tố nào thường ảnh hưởng đến việc chọn một giải pháp hơn giải pháp khác?\n• Có các lựa chọn thay thế cụ thể nào đang được so sánh không?',
              },
            ],
          },
          {
            name: 'Kiến thức sản phẩm',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'Giới thiệu sản phẩm',
                description: 'Đánh giá khả năng giải thích thông tin sản phẩm.',
              },
              {
                title: 'Phân biệt đối thủ cạnh tranh',
                description:
                  'Đánh giá khả năng phân biệt sản phẩm với đối thủ cạnh tranh.',
              },
            ],
          },
        ],
      },
      th: {
        name: 'การประเมิน MEDDPICC ของ Grab',
        sections: [
          {
            name: 'เทคนิคการขาย',
            sectionType: 'custom',
            criteria: [
              {
                title: 'ตัวชี้วัด',
                description:
                  'ผลกระทบทางธุรกิจ ต้นทุน ความคาดหวัง ROI และเกณฑ์การวัดผลถูกระบุเป็นตัวเลขได้ดีเพียงใด?\n• มีการสำรวจต้นทุนการดำเนินงานหรือเมตริกประสิทธิภาพปัจจุบันหรือไม่?\n• มีการหารือเกี่ยวกับความคาดหวัง ROI และเกณฑ์การวัดมูลค่าหรือไม่?\n• มีการระบุผลกระทบทางธุรกิจที่เป็นไปได้หรือการประหยัดต้นทุนเป็นตัวเลขหรือไม่?\n• มีการแสดงความเข้าใจว่าลูกค้ากำหนดและวัดความสำเร็จอย่างไร?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• ต้นทุนการดำเนินงานปัจจุบันของคุณสำหรับการขนส่งองค์กรคือเท่าไร?\n• คุณวัดผลิตภาพและความพึงพอใจของพนักงานอย่างไร?\n• คุณกำหนดเป้าหมาย ROI หรือการประหยัดต้นทุนเท่าไร?\n• ปัจจุบันคุณติดตามและจัดการค่าใช้จ่ายทางธุรกิจอย่างไร?',
              },
              {
                title: 'ผู้ซื้อที่มีอำนาจทางเศรษฐกิจ',
                description:
                  'อำนาจงบประมาณ ผู้ตัดสินใจ และกระบวนการจัดซื้อถูกระบุได้อย่างมีประสิทธิภาพเพียงใด?\n• มีการระบุความเป็นเจ้าของงบประมาณและอำนาจในการตัดสินใจหรือไม่?\n• มีการสำรวจกระบวนการจัดซื้อและขั้นตอนการอนุมัติหรือไม่?\n• มีการแสดงความเข้าใจเกี่ยวกับการจัดสรรงบประมาณและลำดับความสำคัญทางการเงินหรือไม่?\n• มีการชี้แจงข้อกำหนดการอนุมัติและอำนาจในการใช้จ่ายหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• โดยปกติใครมีอำนาจอนุมัติสำหรับการลงทุนประเภทนี้?\n• งบประมาณถูกจัดสรรอย่างไรสำหรับเครื่องมือการดำเนินงานหรือเทคโนโลยี?\n• การตัดสินใจซื้อมักจะทำอย่างไรภายในองค์กร?\n• ใครจะต้องเข้ามาเกี่ยวข้องในการอนุมัติโซลูชั่นเช่นนี้?',
              },
              {
                title: 'เกณฑ์การตัดสินใจ',
                description:
                  'ปัจจัยการประเมิน ข้อกำหนด และเกณฑ์การคัดเลือกถูกค้นพบได้ดีเพียงใด?\n• มีการสำรวจปัจจัยที่มีอิทธิพลต่อการตัดสินใจซื้อหรือไม่?\n• มีการหารือเกี่ยวกับเกณฑ์การประเมินและกระบวนการคัดเลือกผู้ขายหรือไม่?\n• มีการสร้างความชัดเจนเกี่ยวกับสิ่งที่จำเป็นต้องมีเทียบกับสิ่งที่ดีที่จะมีหรือไม่?\n• มีการระบุข้อกำหนดเฉพาะและมาตรฐานการประเมินหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• ปัจจัยใดสำคัญที่สุดเมื่อเลือกผู้ให้บริการ?\n• ความน่าเชื่อถือของผู้ขายหรือคุณภาพการบริการมักจะถูกประเมินอย่างไร?\n• ข้อกำหนดด้านความปลอดภัย การปฏิบัติตามข้อกำหนด หรือการดำเนินงานใดที่ต้องปฏิบัติตาม?\n• ในที่สุดอะไรจะทำให้โซลูชั่นหนึ่งแตกต่างจากอีกโซลูชั่นหนึ่ง?',
              },
              {
                title: 'ขั้นตอนการตัดสินใจ',
                description:
                  'การเดินทางของการซื้อ กำหนดเวลา และการมีส่วนร่วมของผู้มีส่วนได้ส่วนเสียถูกจับคู่ได้อย่างมีประสิทธิภาพเพียงใด?\n• มีการสำรวจกระบวนการซื้อโดยรวมและกำหนดเวลาที่คาดหวังหรือไม่?\n• มีการระบุผู้มีส่วนได้ส่วนเสียหลัก ผู้มีอิทธิพล และผู้อนุมัติหรือไม่?\n• มีการหารือเกี่ยวกับขั้นตอนการอนุมัติและอุปสรรคที่อาจเกิดขึ้นหรือไม่?\n• มีการชี้แจงปัจจัยกระตุ้นความเร่งด่วนและกำหนดเวลาการตัดสินใจหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• กำหนดเวลาทั่วไปสำหรับการนำโซลูชั่นเช่นนี้ไปใช้คืออะไร?\n• ใครอีกที่มักจะเข้ามาเกี่ยวข้องในการประเมินหรืออนุมัติการตัดสินใจนี้?\n• ขั้นตอนใดบ้างที่เกี่ยวข้องกับกระบวนการคัดเลือกหรืออนุมัติของคุณ?\n• มีเหตุการณ์สำคัญหรือกำหนดเวลาที่จะมาถึงที่มีอิทธิพลต่อระยะเวลาหรือไม่?',
              },
              {
                title: 'Paper Process',
                description:
                  'การจัดซื้อ ข้อกำหนดทางกฎหมาย และความต้องการการปฏิบัติตามข้อกำหนดถูกสำรวจได้ดีเพียงใด?\n• มีการหารือเกี่ยวกับข้อกำหนดการจัดซื้อ ทางกฎหมาย และการปฏิบัติตามข้อกำหนดหรือไม่?\n• มีการสำรวจข้อกำหนดสัญญา การตรวจสอบความปลอดภัย และกระบวนการเริ่มต้นใช้งานหรือไม่?\n• มีการแสดงความเข้าใจเกี่ยวกับเอกสารและขั้นตอนการอนุมัติหรือไม่?\n• มีการจัดการกับข้อกำหนดการนำไปใช้และการรวมระบบหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• โดยปกติกระบวนการเริ่มต้นใช้งานหรืออนุมัติผู้ขายของคุณเกี่ยวข้องกับอะไรบ้าง?\n• มีข้อกำหนดสัญญามาตรฐานหรือข้อกำหนดการปฏิบัติตามข้อกำหนดที่ต้องทราบหรือไม่?\n• เอกสารใดบ้างที่มักจะต้องใช้ระหว่างการประเมินผู้ขาย?\n• การตรวจสอบทางกฎหมายหรือการจัดซื้อมักจะใช้เวลานานเท่าไร?',
              },
              {
                title: 'ทำให้เข้าใจปัญหา',
                description:
                  'วิธี LAER ถูกนำไปใช้เพื่อระบุและจัดการกับปัญหาได้อย่างมีประสิทธิภาพเพียงใด?\n• Listen: มีการให้พื้นที่แก่ผู้มีโอกาสเป็นลูกค้าเพื่อแบ่งปันความท้าทายหรือความไม่พอใจอย่างเต็มที่หรือไม่?\n• Acknowledge: มีการยืนยันและสะท้อนความกังวลกลับมาอย่างเหมาะสมหรือไม่?\n• Explore: มีการถามคำถามเชิงลึกเกี่ยวกับผลกระทบ ความเสี่ยง และผลที่ตามมาของการไม่ดำเนินการหรือไม่?\n• Respond: มีการจัดการกับจุดปวดด้วยโซลูชั่น ผลลัพธ์ หรือหลักฐานที่เกี่ยวข้องหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• ให้พื้นที่สำหรับความท้าทายที่จะอธิบายอย่างเต็มที่โดยไม่มีการขัดจังหวะ\n• รับทราบความกังวลด้วยความเห็นอกเห็นใจและการยืนยัน\n• สำรวจปัจจัยพื้นฐาน เช่น กระแสเงินสด ความไม่แน่นอนของ ROI หรือความเสี่ยงในการดำเนินงาน\n• ตอบสนองโดยการเชื่อมโยงจุดปวดกับผลลัพธ์ที่วัดได้ โครงการนำร่อง หรือการลดความเสี่ยง',
              },
              {
                title: 'ผู้สนับสนุน',
                description:
                  'ผู้สนับสนุนภายใน ผู้มีอิทธิพล และความสัมพันธ์ที่สนับสนุนถูกระบุได้ดีเพียงใด?\n• มีการระบุผู้สนับสนุนภายในสำหรับการเปลี่ยนแปลงหรือการปรับปรุงหรือไม่?\n• มีการแสดงความเข้าใจว่าใครได้รับประโยชน์มากที่สุดจากโซลูชั่นหรือไม่?\n• มีการสร้างความสัมพันธ์และความไว้วางใจกับผู้มีส่วนได้ส่วนเสียหลักหรือไม่?\n• มีการสำรวจวิธีการในการเกี่ยวข้องและดึงดูดผู้มีอิทธิพลที่สนับสนุนหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• ใครในองค์กรจะได้รับประโยชน์มากที่สุดจากโซลูชั่นนี้?\n• มีผู้สนับสนุนภายในที่มักจะสนับสนุนการปรับปรุงการดำเนินงานหรือไม่?\n• ใครอีกที่ควรเข้ามาเกี่ยวข้องเพื่อสนับสนุนการนำไปใช้ที่ประสบความสำเร็จ?\n• ผู้มีส่วนได้ส่วนเสียคนไหนที่น่าจะตื่นเต้นมากที่สุดเกี่ยวกับความสามารถเหล่านี้?',
              },
              {
                title: 'คู่แข่ง',
                description:
                  'ทางเลือกการแข่งขัน การวางตำแหน่ง และความแตกต่างถูกค้นพบได้อย่างมีประสิทธิภาพเพียงใด?\n• มีการหารือเกี่ยวกับผู้ขายหรือโซลูชั่นอื่นที่กำลังพิจารณาหรือไม่?\n• มีการสำรวจประสบการณ์ก่อนหน้านี้กับผู้ขายที่คล้ายกันหรือไม่?\n• มีการแสดงความเข้าใจเกี่ยวกับทางเลือกการแข่งขันและความแตกต่างหรือไม่?\n• มีการระบุความชอบในภูมิทัศน์การแข่งขันหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• โซลูชั่นหรือผู้ให้บริการอื่นใดที่กำลังพิจารณาอยู่?\n• เคยใช้ผู้ขายที่คล้ายกันในอดีตหรือไม่? อะไรได้ผลหรือไม่ได้ผล?\n• ปัจจัยใดมักจะมีอิทธิพลต่อการเลือกโซลูชั่นหนึ่งมากกว่าอีกโซลูชั่นหนึ่ง?\n• มีทางเลือกเฉพาะที่กำลังเปรียบเทียบหรือไม่?',
              },
            ],
          },
          {
            name: 'ความรู้เกี่ยวกับผลิตภัณฑ์',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'การนำเสนอผลิตภัณฑ์',
                description: 'ประเมินความสามารถในการอธิบายข้อมูลผลิตภัณฑ์',
              },
              {
                title: 'ความแตกต่างจากคู่แข่ง',
                description: 'ประเมินความสามารถในการแยกแยะผลิตภัณฑ์จากคู่แข่ง',
              },
            ],
          },
        ],
      },
    },
  },
  {
    _id: new Types.ObjectId(),
    friendlyId: `grab-mex-partial-meddpicc-assessment-${mexMeddpiccId}`,
    name: 'Grab MEX Partial MEDDPICC Assessment',
    assessmentType: 'score',
    scormPolicy: {
      enabled: true,
    },
    sections: [
      {
        name: 'Soft Skills',
        sectionType: 'custom',
        criteria: [
          {
            title: 'Listen',
            description:
              'How effectively was active listening demonstrated when objections or concerns were raised?\n• Did you let the prospect finish speaking without interrupting?\n• Did you demonstrate patience and attention when they explained their constraints?\n• Did you resist the urge to immediately respond with a pitch?\n• Did you show active listening by acknowledging what was said?\n\nConversation starters (examples):\n• Allow space for challenges to be fully explained without interruption\n• Use verbal acknowledgments like "I see," "I understand," or "Tell me more"\n• Pause before responding to show you\'re processing what was shared\n• Summarize what you heard to confirm understanding',
          },
          {
            title: 'Acknowledge',
            description:
              'How well were concerns validated and understanding demonstrated?\n• Did you use empathetic language to demonstrate you heard the objection?\n• Did you relate to their situation with phrases like "I understand" or "That makes sense"?\n• Did you avoid dismissing or minimizing their concerns?\n• Did you normalize their concerns by sharing that others felt similarly?\n\nConversation starters (examples):\n• "I completely understand - budget is always a big consideration"\n• "That makes perfect sense, especially in F&B where margins are tight"\n• "Many of our partners felt the same way when they first looked at our campaigns"\n• "If I were you, I\'d also want to be cautious about where every dollar goes"',
          },
          {
            title: 'Explore',
            description:
              'How effectively were follow-up questions used to uncover the root cause of objections?\n• Did you ask follow-up questions to uncover the real concern behind the objection?\n• Did you determine if the concern was about budget, value, timing, or authority?\n• Did you use open-ended questions to gather more information?\n• Did you understand the specific nature and context of their concern?\n\nConversation starters (examples):\n• "When you say the budget feels high, is it more about cash flow this quarter, or do you feel the value doesn\'t match the price?"\n• "Help me understand - what would need to happen for you to feel comfortable moving forward?"\n• "Is this primarily a budget concern, or are there other factors at play?"\n• "What specific aspect of the investment concerns you most?"',
          },
          {
            title: 'Respond',
            description:
              'How well were specific concerns addressed with tailored solutions and value propositions?\n• Did you provide solutions specifically addressing their stated concerns?\n• Did you share relevant case studies or examples of similar merchants?\n• Did you offer alternatives or flexible options to overcome objections?\n• Did you work collaboratively to find mutually beneficial solutions?\n\nConversation starters (examples):\n• "Given your concern about budget, let me share how merchants like you have seen ROI within the first month"\n• "We\'ve seen 30% increase in in-app visibility for participating merchants and boost in sales post-campaign"\n• "How about we explore ways to lower your upfront costs through bundling?"\n• "Would it help to start with a smaller pilot campaign to prove results first?"',
          },
        ],
        prompt: laerSoftSkillsPrompt,
      },
      {
        name: 'Sales Technique',
        sectionType: 'custom',
        criteria: [
          {
            title: 'Metrics',
            description:
              'How well were budget constraints, key metrics, and ROI expectations understood?\n• Did you ask about the current budget for this type of campaign?\n• Did you explore what metrics they care about (incremental sales, reach, post-campaign retention)?\n• Did you showcase ROI of campaigns through case studies?\n• Did you share specific KPIs and MEX ROI benchmarks?\n\nConversation starters (examples):\n• "What is your current budget for this type of campaign?"\n• "What metrics matter most to you - incremental sales, reach, or post-campaign retention?"\n• "Let me share how our campaigns typically perform through a case study"\n• "Our data shows MEX campaigns typically deliver 8.5% better performance with 20% incremental sales"',
          },
          {
            title: 'Competition',
            description:
              'How effectively were competitive landscape and differentiation opportunities explored?\n• Did you ask how your campaign, reach, and results compare to competitors?\n• Did you explore what would make them choose your campaign over competitors or indirect competitors (e.g., traditional ads) despite budget constraints?\n• Did you understand competitive alternatives and market positioning?\n• Did you highlight unique value propositions and ROI proof?\n\nConversation starters (examples):\n• "How does our campaign, reach, and results compare to what competitors have offered?"\n• "What would make you choose our campaign over traditional advertising or other digital marketing options?"\n• "Even with budget constraints, what differentiation would matter most to you?"\n• "How have other providers you\'ve worked with performed compared to what you expected?"',
          },
          {
            title: 'Decision Criteria',
            description:
              'How well were evaluation factors and the decision-making process uncovered?\n• Did you ask about the top three criteria they consider when deciding on campaign investment?\n• Did you explore what it would take for them to reconsider budget allocation for the campaign?\n• Did you identify who else in their organization needs to be involved in the budget decision?\n• Did you uncover other concerns about budget allocation for the campaign?\n\nConversation starters (examples):\n• "What are your top three criteria when evaluating campaign investments?"\n• "What would it take for you to reconsider your budget allocation for this campaign?"\n• "Who else in your organization would need to be involved in this budget decision?"\n• "What other concerns do you have regarding budget allocation for this campaign?"',
          },
        ],
        prompt: mexMeddpiccFrameworkEvaluationPrompt,
      },
      {
        name: 'Product Knowledge',
        sectionType: 'product-knowledge',
        criteria: [
          {
            title: 'Product pitch',
            description:
              "Product Pitch\n• Demonstrate clear understanding of product features, benefits, and value proposition.\n• Explain how features solve the customer's problems.\n• Communicate product advantages clearly and concisely.\n• Tailor product information to the customer's needs and context.\n• Present accurate product information.",
          },
          {
            title: 'Competitor differentiation',
            description:
              "Competitor Differentiation\n• Demonstrate knowledge of the competitive landscape relevant to the scenario.\n• Position product advantages against competitors with concrete examples.\n• Handle competitive objections or direct comparisons effectively.\n• Articulate the product's unique value proposition and why it matters to the customer.",
          },
        ],
      },
    ],
    localizations: {
      id: {
        name: 'Penilaian MEDDPICC Parsial Grab MEX',
        sections: [
          {
            name: 'Soft Skills',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Mendengarkan',
                description:
                  'Seberapa efektif mendengarkan aktif ditunjukkan ketika keberatan atau kekhawatiran diangkat?\n• Apakah Anda membiarkan prospek selesai berbicara tanpa menyela?\n• Apakah Anda menunjukkan kesabaran dan perhatian ketika mereka menjelaskan kendala mereka?\n• Apakah Anda menahan keinginan untuk segera merespons dengan promosi?\n• Apakah Anda menunjukkan mendengarkan aktif dengan mengakui apa yang dikatakan?\n\nPembuka percakapan (contoh):\n• Berikan ruang untuk tantangan dijelaskan sepenuhnya tanpa gangguan\n• Gunakan pengakuan verbal seperti "Saya mengerti," "Saya memahami," atau "Ceritakan lebih lanjut"\n• Jeda sebelum merespons untuk menunjukkan Anda memproses apa yang dibagikan\n• Ringkas apa yang Anda dengar untuk mengonfirmasi pemahaman',
              },
              {
                title: 'Mengakui',
                description:
                  'Seberapa baik kekhawatiran divalidasi dan pemahaman ditunjukkan?\n• Apakah Anda menggunakan bahasa empatik untuk menunjukkan Anda mendengar keberatan?\n• Apakah Anda berhubungan dengan situasi mereka dengan frasa seperti "Saya mengerti" atau "Itu masuk akal"?\n• Apakah Anda menghindari mengabaikan atau meminimalkan kekhawatiran mereka?\n• Apakah Anda menormalkan kekhawatiran mereka dengan membagikan bahwa orang lain merasakan hal yang sama?\n\nPembuka percakapan (contoh):\n• "Saya sangat memahami - anggaran selalu menjadi pertimbangan besar"\n• "Itu sangat masuk akal, terutama di F&B di mana margin ketat"\n• "Banyak mitra kami merasakan hal yang sama ketika mereka pertama kali melihat kampanye kami"\n• "Jika saya jadi Anda, saya juga ingin berhati-hati tentang kemana setiap dolar pergi"',
              },
              {
                title: 'Mengeksplorasi',
                description:
                  'Seberapa efektif pertanyaan lanjutan digunakan untuk mengungkap akar penyebab keberatan?\n• Apakah Anda mengajukan pertanyaan lanjutan untuk mengungkap kekhawatiran sebenarnya di balik keberatan?\n• Apakah Anda menentukan apakah kekhawatiran adalah tentang anggaran, nilai, waktu, atau otoritas?\n• Apakah Anda menggunakan pertanyaan terbuka untuk mengumpulkan lebih banyak informasi?\n• Apakah Anda memahami sifat spesifik dan konteks kekhawatiran mereka?\n\nPembuka percakapan (contoh):\n• "Ketika Anda mengatakan anggaran terasa tinggi, apakah lebih tentang arus kas kuartal ini, atau Anda merasa nilai tidak sesuai dengan harga?"\n• "Bantu saya memahami - apa yang perlu terjadi agar Anda merasa nyaman untuk melanjutkan?"\n• "Apakah ini terutama kekhawatiran anggaran, atau ada faktor lain yang berperan?"\n• "Aspek spesifik mana dari investasi yang paling mengkhawatirkan Anda?"',
              },
              {
                title: 'Merespons',
                description:
                  'Seberapa baik kekhawatiran spesifik ditangani dengan solusi dan proposisi nilai yang disesuaikan?\n• Apakah Anda memberikan solusi yang secara khusus menangani kekhawatiran yang mereka nyatakan?\n• Apakah Anda membagikan studi kasus atau contoh pedagang yang relevan?\n• Apakah Anda menawarkan alternatif atau opsi fleksibel untuk mengatasi keberatan?\n• Apakah Anda bekerja secara kolaboratif untuk menemukan solusi yang saling menguntungkan?\n\nPembuka percakapan (contoh):\n• "Mengingat kekhawatiran Anda tentang anggaran, izinkan saya membagikan bagaimana pedagang seperti Anda telah melihat ROI dalam bulan pertama"\n• "Kami telah melihat peningkatan 30% dalam visibilitas dalam aplikasi untuk pedagang yang berpartisipasi dan peningkatan penjualan pasca kampanye"\n• "Bagaimana jika kita menjelajahi cara untuk menurunkan biaya di muka Anda melalui bundling?"\n• "Apakah akan membantu untuk memulai dengan kampanye pilot yang lebih kecil untuk membuktikan hasil terlebih dahulu?"',
              },
            ],
          },
          {
            name: 'Teknik Penjualan',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Metrics',
                description:
                  'Seberapa baik kendala anggaran, metrik kunci, dan ekspektasi ROI dipahami?\n• Apakah Anda bertanya tentang anggaran saat ini untuk jenis kampanye ini?\n• Apakah Anda mengeksplorasi metrik apa yang mereka pedulikan (penjualan inkremental, jangkauan, retensi pasca kampanye)?\n• Apakah Anda menampilkan ROI kampanye melalui studi kasus?\n• Apakah Anda membagikan KPI spesifik dan tolok ukur ROI MEX?\n\nPembuka percakapan (contoh):\n• "Berapa anggaran Anda saat ini untuk jenis kampanye ini?"\n• "Metrik apa yang paling penting bagi Anda - penjualan inkremental, jangkauan, atau retensi pasca kampanye?"\n• "Izinkan saya berbagi bagaimana kampanye kami biasanya berkinerja melalui studi kasus"\n• "Data kami menunjukkan kampanye MEX biasanya memberikan kinerja 8,5% lebih baik dengan 20% penjualan inkremental"',
              },
              {
                title: 'Competition',
                description:
                  'Seberapa efektif lanskap kompetitif dan peluang diferensiasi dieksplorasi?\n• Apakah Anda bertanya bagaimana kampanye, jangkauan, dan hasil Anda dibandingkan dengan pesaing?\n• Apakah Anda mengeksplorasi apa yang akan membuat mereka memilih kampanye Anda daripada pesaing atau pesaing tidak langsung (misalnya, iklan tradisional) meskipun ada kendala anggaran?\n• Apakah Anda memahami alternatif kompetitif dan positioning pasar?\n• Apakah Anda menyoroti proposisi nilai unik dan bukti ROI?\n\nPembuka percakapan (contoh):\n• "Bagaimana kampanye, jangkauan, dan hasil kami dibandingkan dengan apa yang ditawarkan pesaing?"\n• "Apa yang akan membuat Anda memilih kampanye kami daripada iklan tradisional atau opsi pemasaran digital lainnya?"\n• "Bahkan dengan kendala anggaran, diferensiasi apa yang paling penting bagi Anda?"\n• "Bagaimana kinerja penyedia lain yang pernah Anda ajak bekerja dibandingkan dengan yang Anda harapkan?"',
              },
              {
                title: 'Decision Criteria',
                description:
                  'Seberapa baik faktor evaluasi dan proses pengambilan keputusan diungkap?\n• Apakah Anda bertanya tentang tiga kriteria teratas yang mereka pertimbangkan saat memutuskan investasi kampanye?\n• Apakah Anda mengeksplorasi apa yang diperlukan agar mereka mempertimbangkan kembali alokasi anggaran untuk kampanye?\n• Apakah Anda mengidentifikasi siapa lagi dalam organisasi mereka yang perlu terlibat dalam keputusan anggaran?\n• Apakah Anda mengungkap kekhawatiran lain tentang alokasi anggaran untuk kampanye?\n\nPembuka percakapan (contoh):\n• "Apa tiga kriteria teratas Anda saat mengevaluasi investasi kampanye?"\n• "Apa yang diperlukan agar Anda mempertimbangkan kembali alokasi anggaran Anda untuk kampanye ini?"\n• "Siapa lagi dalam organisasi Anda yang perlu terlibat dalam keputusan anggaran ini?"\n• "Kekhawatiran lain apa yang Anda miliki terkait alokasi anggaran untuk kampanye ini?"',
              },
            ],
          },
          {
            name: 'Pengetahuan Produk',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'Penjelasan produk',
                description:
                  'Menilai kemampuan dalam menjelaskan informasi produk.',
              },
              {
                title: 'Diferensiasi kompetitor',
                description:
                  'Menilai kemampuan dalam membedakan produk dari kompetitor.',
              },
            ],
          },
        ],
      },
      ms: {
        name: 'Penilaian MEDDPICC Separa Grab MEX',
        sections: [
          {
            name: 'Soft Skills',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Mendengar',
                description:
                  'Sejauh mana pendengaran aktif ditunjukkan apabila bantahan atau kebimbangan dibangkitkan?\n• Adakah anda membiarkan prospek selesai bercakap tanpa mengganggu?\n• Adakah anda menunjukkan kesabaran dan perhatian apabila mereka menerangkan kekangan mereka?\n• Adakah anda menahan keinginan untuk segera bertindak balas dengan promosi?\n• Adakah anda menunjukkan pendengaran aktif dengan mengakui apa yang diperkatakan?\n\nPemula perbualan (contoh):\n• Berikan ruang untuk cabaran dijelaskan sepenuhnya tanpa gangguan\n• Gunakan pengakuan lisan seperti "Saya faham," "Saya memahami," atau "Beritahu saya lebih lanjut"\n• Jeda sebelum bertindak balas untuk menunjukkan anda memproses apa yang dikongsi\n• Ringkaskan apa yang anda dengar untuk mengesahkan pemahaman',
              },
              {
                title: 'Mengakui',
                description:
                  'Sejauh mana kebimbangan disahkan dan pemahaman ditunjukkan?\n• Adakah anda menggunakan bahasa empati untuk menunjukkan anda mendengar bantahan?\n• Adakah anda berhubung dengan situasi mereka dengan frasa seperti "Saya faham" atau "Itu masuk akal"?\n• Adakah anda mengelakkan mengabaikan atau meminimumkan kebimbangan mereka?\n• Adakah anda menormalkan kebimbangan mereka dengan berkongsi bahawa orang lain merasakan perkara yang sama?\n\nPemula perbualan (contoh):\n• "Saya benar-benar memahami - belanjawan sentiasa menjadi pertimbangan besar"\n• "Itu sangat masuk akal, terutamanya dalam F&B di mana margin ketat"\n• "Ramai rakan kongsi kami merasakan perkara yang sama apabila mereka pertama kali melihat kempen kami"\n• "Jika saya jadi anda, saya juga ingin berhati-hati tentang ke mana setiap dolar pergi"',
              },
              {
                title: 'Meneroka',
                description:
                  'Sejauh mana soalan susulan digunakan untuk mendedahkan punca bantahan?\n• Adakah anda bertanya soalan susulan untuk mendedahkan kebimbangan sebenar di sebalik bantahan?\n• Adakah anda menentukan sama ada kebimbangan adalah tentang belanjawan, nilai, masa, atau kuasa?\n• Adakah anda menggunakan soalan terbuka untuk mengumpul lebih banyak maklumat?\n• Adakah anda memahami sifat khusus dan konteks kebimbangan mereka?\n\nPemula perbualan (contoh):\n• "Apabila anda mengatakan belanjawan terasa tinggi, adakah ia lebih tentang aliran tunai suku ini, atau anda rasa nilai tidak sepadan dengan harga?"\n• "Bantu saya memahami - apa yang perlu berlaku untuk anda berasa selesa untuk meneruskan?"\n• "Adakah ini terutamanya kebimbangan belanjawan, atau terdapat faktor lain yang bermain?"\n• "Aspek khusus mana dari pelaburan yang paling membimbangkan anda?"',
              },
              {
                title: 'Bertindak balas',
                description:
                  'Sejauh mana kebimbangan khusus ditangani dengan penyelesaian dan cadangan nilai yang disesuaikan?\n• Adakah anda memberikan penyelesaian yang secara khusus menangani kebimbangan yang mereka nyatakan?\n• Adakah anda berkongsi kajian kes atau contoh pedagang yang berkaitan?\n• Adakah anda menawarkan alternatif atau pilihan fleksibel untuk mengatasi bantahan?\n• Adakah anda bekerja secara kolaboratif untuk mencari penyelesaian yang saling menguntungkan?\n\nPemula perbualan (contoh):\n• "Memandangkan kebimbangan anda tentang belanjawan, izinkan saya berkongsi bagaimana pedagang seperti anda telah melihat ROI dalam bulan pertama"\n• "Kami telah melihat peningkatan 30% dalam keterlihatan dalam aplikasi untuk pedagang yang mengambil bahagian dan peningkatan jualan selepas kempen"\n• "Bagaimana jika kita meneroka cara untuk menurunkan kos pendahuluan anda melalui penggabungan?"\n• "Adakah ia akan membantu untuk bermula dengan kempen perintis yang lebih kecil untuk membuktikan hasil terlebih dahulu?"',
              },
            ],
          },
          {
            name: 'Teknik Jualan',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Metrics',
                description:
                  'Sejauh mana kekangan belanjawan, metrik utama, dan jangkaan ROI difahami?\n• Adakah anda bertanya tentang belanjawan semasa untuk jenis kempen ini?\n• Adakah anda meneroka metrik apa yang mereka ambil berat (jualan tambahan, capaian, pengekalan selepas kempen)?\n• Adakah anda mempamerkan ROI kempen melalui kajian kes?\n• Adakah anda berkongsi KPI khusus dan penanda aras ROI MEX?\n\nPemula perbualan (contoh):\n• "Apakah belanjawan semasa anda untuk jenis kempen ini?"\n• "Metrik apa yang paling penting kepada anda - jualan tambahan, capaian, atau pengekalan selepas kempen?"\n• "Izinkan saya berkongsi bagaimana kempen kami biasanya berprestasi melalui kajian kes"\n• "Data kami menunjukkan kempen MEX biasanya memberikan prestasi 8.5% lebih baik dengan 20% jualan tambahan"',
              },
              {
                title: 'Competition',
                description:
                  'Sejauh mana landskap kompetitif dan peluang pembezaan diterokai?\n• Adakah anda bertanya bagaimana kempen, capaian, dan hasil anda berbanding dengan pesaing?\n• Adakah anda meneroka apa yang akan membuat mereka memilih kempen anda berbanding pesaing atau pesaing tidak langsung (contohnya, iklan tradisional) walaupun dengan kekangan belanjawan?\n• Adakah anda memahami alternatif kompetitif dan kedudukan pasaran?\n• Adakah anda menyerlahkan cadangan nilai unik dan bukti ROI?\n\nPemula perbualan (contoh):\n• "Bagaimana kempen, capaian, dan hasil kami berbanding dengan apa yang ditawarkan pesaing?"\n• "Apa yang akan membuat anda memilih kempen kami berbanding pengiklanan tradisional atau pilihan pemasaran digital lain?"\n• "Walaupun dengan kekangan belanjawan, pembezaan apa yang paling penting kepada anda?"\n• "Bagaimana prestasi penyedia lain yang pernah anda bekerjasama berbanding dengan yang anda jangkakan?"',
              },
              {
                title: 'Decision Criteria',
                description:
                  'Sejauh mana faktor penilaian dan proses membuat keputusan ditemui?\n• Adakah anda bertanya tentang tiga kriteria teratas yang mereka pertimbangkan semasa memutuskan pelaburan kempen?\n• Adakah anda meneroka apa yang diperlukan untuk mereka mempertimbangkan semula peruntukan belanjawan untuk kempen?\n• Adakah anda mengenal pasti siapa lagi dalam organisasi mereka yang perlu terlibat dalam keputusan belanjawan?\n• Adakah anda mendedahkan kebimbangan lain tentang peruntukan belanjawan untuk kempen?\n\nPemula perbualan (contoh):\n• "Apakah tiga kriteria teratas anda semasa menilai pelaburan kempen?"\n• "Apa yang diperlukan untuk anda mempertimbangkan semula peruntukan belanjawan anda untuk kempen ini?"\n• "Siapa lagi dalam organisasi anda yang perlu terlibat dalam keputusan belanjawan ini?"\n• "Kebimbangan lain apa yang anda ada berkaitan peruntukan belanjawan untuk kempen ini?"',
              },
            ],
          },
          {
            name: 'Pengetahuan Produk',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'Penerangan produk',
                description:
                  'Menilai kecekapan dalam menerangkan maklumat produk.',
              },
              {
                title: 'Pembezaan pesaing',
                description:
                  'Menilai kecekapan dalam membezakan produk daripada pesaing.',
              },
            ],
          },
        ],
      },
      tl: {
        name: 'Grab MEX Partial MEDDPICC Assessment',
        sections: [
          {
            name: 'Soft Skills',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Makinig',
                description:
                  'Gaano ka-epektibo ang aktibong pakikinig na ipinakita nang may mga pagtutol o alalahanin?\n• Hinayaan mo ba ang prospect na matapos magsalita nang walang pagsasalita?\n• Ipinakita mo ba ang pasensya at atensyon nang ipinaliwanag nila ang kanilang mga hadlang?\n• Napigilan mo ba ang pagnanais na agad tumugon gamit ang pitch?\n• Ipinakita mo ba ang aktibong pakikinig sa pamamagitan ng pagkilala sa sinabi?\n\nPanimulang tanong (mga halimbawa):\n• Bigyan ng espasyo ang mga hamon na ganap na maipaliwanag nang walang pagsasalita\n• Gumamit ng verbal acknowledgments tulad ng "Nakikita ko," "Naiintindihan ko," o "Sabihin mo pa"\n• Mag-pause bago tumugon para ipakita na pinoproseso mo ang ibinahagi\n• I-summarize ang narinig mo para kumpirmahin ang pag-unawa',
              },
              {
                title: 'Kilalanin',
                description:
                  'Gaano kahusay na na-validate ang mga alalahanin at ipinakita ang pag-unawa?\n• Gumamit ka ba ng empathetic na wika para ipakita na narinig mo ang pagtutol?\n• Nag-relate ka ba sa kanilang sitwasyon gamit ang mga parirala tulad ng "Naiintindihan ko" o "May sense iyan"?\n• Iwasan mo ba ang pag-dismiss o pag-minimize ng kanilang mga alalahanin?\n• Na-normalize mo ba ang kanilang mga alalahanin sa pamamagitan ng pagbabahagi na iba ay nakaramdam din ng pareho?\n\nPanimulang tanong (mga halimbawa):\n• "Lubos kong nauunawaan - ang budget ay laging malaking pagsasaalang-alang"\n• "May perfect sense iyan, lalo na sa F&B kung saan masikip ang margins"\n• "Maraming partners namin ang nakaramdam ng pareho nang una nilang tingnan ang aming campaigns"\n• "Kung ako sa iyo, magiging maingat din ako kung saan mapupunta ang bawat dolyar"',
              },
              {
                title: 'Galugarin',
                description:
                  'Gaano ka-epektibo ang paggamit ng follow-up questions para matuklasan ang ugat ng mga pagtutol?\n• Nagtanong ka ba ng follow-up questions para matuklasan ang tunay na alalahanin sa likod ng pagtutol?\n• Natukoy mo ba kung ang alalahanin ay tungkol sa budget, value, timing, o authority?\n• Gumamit ka ba ng open-ended questions para makakuha ng higit pang impormasyon?\n• Naintindihan mo ba ang specific na kalikasan at konteksto ng kanilang alalahanin?\n\nPanimulang tanong (mga halimbawa):\n• "Kapag sinabi mong ang budget ay mataas, mas tungkol ba ito sa cash flow ngayong quarter, o nakakaramdam ka na ang value ay hindi tumutugma sa presyo?"\n• "Tulungan mo akong maintindihan - ano ang kailangang mangyari para makaramdam ka ng komportable na magpatuloy?"\n• "Ito ba ay primarily budget concern, o may ibang factors na involved?"\n• "Anong specific na aspeto ng investment ang pinaka-nag-aalala sa iyo?"',
              },
              {
                title: 'Tumugon',
                description:
                  'Gaano kahusay na natugon ang specific na mga alalahanin gamit ang tailored solutions at value propositions?\n• Nagbigay ka ba ng mga solusyon na specifically tumutulong sa kanilang stated concerns?\n• Nagbahagi ka ba ng relevant case studies o mga halimbawa ng similar merchants?\n• Nag-alok ka ba ng mga alternatibo o flexible options para malampasan ang mga pagtutol?\n• Nagtrabaho ka ba nang collaborative para makahanap ng mutually beneficial solutions?\n\nPanimulang tanong (mga halimbawa):\n• "Given ang concern mo tungkol sa budget, let me share kung paano nakita ng merchants tulad mo ang ROI sa loob ng first month"\n• "Nakita namin ang 30% increase sa in-app visibility para sa participating merchants at boost sa sales post-campaign"\n• "Paano kung i-explore natin ang mga paraan para ibaba ang upfront costs mo through bundling?"\n• "Makakatulong ba kung magsimula tayo sa mas maliit na pilot campaign para patunayan muna ang results?"',
              },
            ],
          },
          {
            name: 'Sales Technique',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Metrics',
                description:
                  'Gaano kahusay na nauunawaan ang budget constraints, key metrics, at ROI expectations?\n• Nagtanong ka ba tungkol sa kasalukuyang budget para sa ganitong uri ng campaign?\n• Ni-explore mo ba kung anong metrics ang mahalaga sa kanila (incremental sales, reach, post-campaign retention)?\n• Nag-showcase ka ba ng ROI ng campaigns through case studies?\n• Nagbahagi ka ba ng specific KPIs at MEX ROI benchmarks?\n\nPanimulang tanong (mga halimbawa):\n• "Ano ang kasalukuyang budget mo para sa ganitong uri ng campaign?"\n• "Anong metrics ang pinaka-importante sa iyo - incremental sales, reach, o post-campaign retention?"\n• "Let me share kung paano typically nag-perform ang aming campaigns through case study"\n• "Ang data namin ay nagpapakita na ang MEX campaigns ay typically nag-deliver ng 8.5% better performance with 20% incremental sales"',
              },
              {
                title: 'Competition',
                description:
                  'Gaano ka-epektibo ang pag-explore ng competitive landscape at differentiation opportunities?\n• Nagtanong ka ba kung paano inihahambing ang iyong campaign, reach, at results sa competitors?\n• Ni-explore mo ba kung ano ang magpapapili sa kanila sa iyong campaign kaysa sa competitors o indirect competitors (e.g., traditional ads) kahit may budget constraints?\n• Naintindihan mo ba ang competitive alternatives at market positioning?\n• Nag-highlight ka ba ng unique value propositions at ROI proof?\n\nPanimulang tanong (mga halimbawa):\n• "Paano inihahambing ang aming campaign, reach, at results sa inaalok ng competitors?"\n• "Ano ang magpapapili sa iyo ng aming campaign kaysa sa traditional advertising o ibang digital marketing options?"\n• "Kahit may budget constraints, anong differentiation ang pinaka-importante sa iyo?"\n• "Paano nag-perform ang ibang providers na nakasama mo compared sa inaasahan mo?"',
              },
              {
                title: 'Decision Criteria',
                description:
                  'Gaano kahusay na natuklasan ang evaluation factors at decision-making process?\n• Nagtanong ka ba tungkol sa top three criteria na isinasaalang-alang nila kapag nagde-decide ng campaign investment?\n• Ni-explore mo ba kung ano ang kailangan para reconsider nila ang budget allocation para sa campaign?\n• Na-identify mo ba kung sino pa sa kanilang organization ang kailangang maging involved sa budget decision?\n• Natuklasan mo ba ang ibang concerns tungkol sa budget allocation para sa campaign?\n\nPanimulang tanong (mga halimbawa):\n• "Anong top three criteria mo kapag nag-e-evaluate ng campaign investments?"\n• "Ano ang kailangan para reconsider mo ang budget allocation mo para sa campaign na ito?"\n• "Sino pa sa organization mo ang kailangang maging involved sa budget decision na ito?"\n• "Anong ibang concerns mayroon ka regarding budget allocation para sa campaign na ito?"',
              },
            ],
          },
          {
            name: 'Product Knowledge',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'Product pitch',
                description:
                  'Sinusukat ang kakayahan sa pagpapaliwanag ng impormasyon ng produkto.',
              },
              {
                title: 'Competitor differentiation',
                description:
                  'Sinusukat ang kakayahan sa pagkakaiba ng produkto laban sa mga kakumpitensya.',
              },
            ],
          },
        ],
      },
      vi: {
        name: 'Đánh giá MEDDPICC Một Phần Grab MEX',
        sections: [
          {
            name: 'Kỹ năng mềm',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Lắng nghe',
                description:
                  'Việc lắng nghe tích cực được thể hiện hiệu quả như thế nào khi có sự phản đối hoặc quan ngại?\n• Bạn có để khách hàng tiềm năng nói hết mà không ngắt lời không?\n• Bạn có thể hiện sự kiên nhẫn và chú ý khi họ giải thích các ràng buộc của họ không?\n• Bạn có kìm nén được mong muốn phản hồi ngay lập tức bằng một lời chào hàng không?\n• Bạn có thể hiện sự lắng nghe tích cực bằng cách thừa nhận những gì đã được nói không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• Cho phép không gian để các thách thức được giải thích đầy đủ mà không bị gián đoạn\n• Sử dụng các lời thừa nhận bằng lời nói như "Tôi hiểu," "Tôi thấu hiểu," hoặc "Hãy nói thêm"\n• Tạm dừng trước khi phản hồi để cho thấy bạn đang xử lý những gì được chia sẻ\n• Tóm tắt những gì bạn nghe được để xác nhận sự hiểu biết',
              },
              {
                title: 'Thừa nhận',
                description:
                  'Các mối quan ngại được xác nhận và sự hiểu biết được thể hiện tốt như thế nào?\n• Bạn có sử dụng ngôn ngữ đồng cảm để thể hiện rằng bạn đã nghe được sự phản đối không?\n• Bạn có liên hệ với tình huống của họ bằng các cụm từ như "Tôi hiểu" hoặc "Điều đó có ý nghĩa" không?\n• Bạn có tránh bác bỏ hoặc giảm thiểu các mối quan ngại của họ không?\n• Bạn có chuẩn hóa các mối quan ngại của họ bằng cách chia sẻ rằng những người khác cũng cảm thấy tương tự không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• "Tôi hoàn toàn hiểu - ngân sách luôn là một cân nhắc lớn"\n• "Điều đó hoàn toàn có ý nghĩa, đặc biệt trong F&B nơi lợi nhuận rất chặt"\n• "Nhiều đối tác của chúng tôi cũng cảm thấy như vậy khi họ lần đầu tiên xem các chiến dịch của chúng tôi"\n• "Nếu tôi là bạn, tôi cũng sẽ muốn thận trọng về việc mỗi đô la đi đâu"',
              },
              {
                title: 'Khám phá',
                description:
                  'Các câu hỏi tiếp theo được sử dụng hiệu quả như thế nào để khám phá nguyên nhân gốc rễ của sự phản đối?\n• Bạn có đặt các câu hỏi tiếp theo để khám phá mối quan ngại thực sự đằng sau sự phản đối không?\n• Bạn có xác định xem mối quan ngại là về ngân sách, giá trị, thời gian hay thẩm quyền không?\n• Bạn có sử dụng các câu hỏi mở để thu thập thêm thông tin không?\n• Bạn có hiểu bản chất cụ thể và bối cảnh của mối quan ngại của họ không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• "Khi bạn nói ngân sách cao, có phải là về dòng tiền quý này không, hay bạn cảm thấy giá trị không phù hợp với giá cả?"\n• "Hãy giúp tôi hiểu - điều gì cần xảy ra để bạn cảm thấy thoải mái để tiếp tục?"\n• "Đây chủ yếu là mối quan tâm về ngân sách, hay có các yếu tố khác đang tác động?"\n• "Khía cạnh cụ thể nào của khoản đầu tư khiến bạn quan tâm nhất?"',
              },
              {
                title: 'Phản hồi',
                description:
                  'Các mối quan ngại cụ thể được giải quyết tốt như thế nào bằng các giải pháp và đề xuất giá trị phù hợp?\n• Bạn có cung cấp các giải pháp giải quyết cụ thể các mối quan ngại mà họ đã nêu không?\n• Bạn có chia sẻ các nghiên cứu trường hợp hoặc ví dụ về các thương nhân tương tự không?\n• Bạn có đề xuất các lựa chọn thay thế hoặc tùy chọn linh hoạt để vượt qua sự phản đối không?\n• Bạn có làm việc cộng tác để tìm ra các giải pháp có lợi cho cả hai bên không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• "Với mối quan tâm của bạn về ngân sách, hãy để tôi chia sẻ cách các thương nhân như bạn đã thấy ROI trong tháng đầu tiên"\n• "Chúng tôi đã thấy sự gia tăng 30% về khả năng hiển thị trong ứng dụng đối với các thương nhân tham gia và tăng doanh số sau chiến dịch"\n• "Chúng ta có thể khám phá các cách để giảm chi phí trả trước của bạn thông qua gói không?"\n• "Liệu có giúp ích nếu bắt đầu bằng một chiến dịch thí điểm nhỏ hơn để chứng minh kết quả trước không?"',
              },
            ],
          },
          {
            name: 'Kỹ thuật bán hàng',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Chỉ số',
                description:
                  'Các ràng buộc về ngân sách, chỉ số chính và kỳ vọng ROI được hiểu rõ như thế nào?\n• Bạn có hỏi về ngân sách hiện tại cho loại chiến dịch này không?\n• Bạn có khám phá những chỉ số nào họ quan tâm (doanh số gia tăng, tiếp cận, giữ chân sau chiến dịch) không?\n• Bạn có trình bày ROI của các chiến dịch thông qua các nghiên cứu trường hợp không?\n• Bạn có chia sẻ các KPI cụ thể và các tiêu chuẩn ROI MEX không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• "Ngân sách hiện tại của bạn cho loại chiến dịch này là bao nhiêu?"\n• "Chỉ số nào quan trọng nhất đối với bạn - doanh số gia tăng, tiếp cận, hay giữ chân sau chiến dịch?"\n• "Hãy để tôi chia sẻ cách các chiến dịch của chúng tôi thường hoạt động thông qua một nghiên cứu trường hợp"\n• "Dữ liệu của chúng tôi cho thấy các chiến dịch MEX thường mang lại hiệu suất tốt hơn 8,5% với 20% doanh số gia tăng"',
              },
              {
                title: 'Đối thủ cạnh tranh',
                description:
                  'Bối cảnh cạnh tranh và cơ hội khác biệt hóa được khám phá hiệu quả như thế nào?\n• Bạn có hỏi cách chiến dịch, tiếp cận và kết quả của bạn so sánh với đối thủ cạnh tranh không?\n• Bạn có khám phá điều gì sẽ khiến họ chọn chiến dịch của bạn thay vì đối thủ cạnh tranh hoặc đối thủ cạnh tranh gián tiếp (ví dụ: quảng cáo truyền thống) mặc dù có ràng buộc về ngân sách không?\n• Bạn có hiểu các lựa chọn thay thế cạnh tranh và định vị thị trường không?\n• Bạn có nhấn mạnh các đề xuất giá trị độc đáo và bằng chứng ROI không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• "Chiến dịch, tiếp cận và kết quả của chúng tôi so với những gì đối thủ cạnh tranh đã cung cấp như thế nào?"\n• "Điều gì sẽ khiến bạn chọn chiến dịch của chúng tôi thay vì quảng cáo truyền thống hoặc các tùy chọn tiếp thị kỹ thuật số khác?"\n• "Ngay cả với ràng buộc về ngân sách, sự khác biệt nào sẽ quan trọng nhất đối với bạn?"\n• "Các nhà cung cấp khác mà bạn đã làm việc cùng đã hoạt động như thế nào so với những gì bạn mong đợi?"',
              },
              {
                title: 'Tiêu chí quyết định',
                description:
                  'Các yếu tố đánh giá và quy trình ra quyết định được khám phá tốt như thế nào?\n• Bạn có hỏi về ba tiêu chí hàng đầu mà họ xem xét khi quyết định đầu tư chiến dịch không?\n• Bạn có khám phá điều gì cần thiết để họ xem xét lại phân bổ ngân sách cho chiến dịch không?\n• Bạn có xác định ai khác trong tổ chức của họ cần tham gia vào quyết định ngân sách không?\n• Bạn có khám phá các mối quan tâm khác về phân bổ ngân sách cho chiến dịch không?\n\nCâu mở đầu cuộc trò chuyện (ví dụ):\n• "Ba tiêu chí hàng đầu của bạn khi đánh giá đầu tư chiến dịch là gì?"\n• "Cần có gì để bạn xem xét lại phân bổ ngân sách của mình cho chiến dịch này?"\n• "Ai khác trong tổ chức của bạn sẽ cần tham gia vào quyết định ngân sách này?"\n• "Bạn còn những mối quan tâm nào khác về phân bổ ngân sách cho chiến dịch này?"',
              },
            ],
          },
          {
            name: 'Kiến thức sản phẩm',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'Giới thiệu sản phẩm',
                description: 'Đánh giá khả năng giải thích thông tin sản phẩm.',
              },
              {
                title: 'Phân biệt đối thủ cạnh tranh',
                description:
                  'Đánh giá khả năng phân biệt sản phẩm với đối thủ cạnh tranh.',
              },
            ],
          },
        ],
      },
      th: {
        name: 'การประเมิน MEDDPICC บางส่วนของ Grab MEX',
        sections: [
          {
            name: 'ทักษะอ่อน',
            sectionType: 'custom',
            criteria: [
              {
                title: 'ฟัง',
                description:
                  'การฟังอย่างตั้งใจถูกแสดงอย่างมีประสิทธิภาพเพียงใดเมื่อมีการคัดค้านหรือความกังวล?\n• คุณปล่อยให้ผู้มีโอกาสเป็นลูกค้าพูดจนจบโดยไม่ขัดจังหวะหรือไม่?\n• คุณแสดงความอดทนและความใส่ใจเมื่อพวกเขาอธิบายข้อจำกัดของพวกเขาหรือไม่?\n• คุณต้านทานความปรารถนาที่จะตอบสนองทันทีด้วยการนำเสนอหรือไม่?\n• คุณแสดงการฟังอย่างตั้งใจโดยการรับทราบสิ่งที่พูดหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• ให้พื้นที่สำหรับความท้าทายที่จะอธิบายอย่างเต็มที่โดยไม่มีการขัดจังหวะ\n• ใช้การรับทราบด้วยคำพูดเช่น "ฉันเห็น" "ฉันเข้าใจ" หรือ "บอกฉันเพิ่มเติม"\n• หยุดชั่วคราวก่อนตอบสนองเพื่อแสดงว่าคุณกำลังประมวลผลสิ่งที่แบ่งปัน\n• สรุปสิ่งที่คุณได้ยินเพื่อยืนยันความเข้าใจ',
              },
              {
                title: 'ยอมรับ',
                description:
                  'ความกังวลถูกยืนยันและความเข้าใจถูกแสดงได้ดีเพียงใด?\n• คุณใช้ภาษาที่เห็นอกเห็นใจเพื่อแสดงว่าคุณได้ยินการคัดค้านหรือไม่?\n• คุณเชื่อมโยงกับสถานการณ์ของพวกเขาด้วยวลีเช่น "ฉันเข้าใจ" หรือ "มันสมเหตุสมผล" หรือไม่?\n• คุณหลีกเลี่ยงการปฏิเสธหรือลดความสำคัญของความกังวลของพวกเขาหรือไม่?\n• คุณทำให้ความกังวลของพวกเขาเป็นปกติโดยการแบ่งปันว่าคนอื่นรู้สึกในทำนองเดียวกันหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• "ฉันเข้าใจอย่างสมบูรณ์ - งบประมาณมักเป็นข้อพิจารณาที่สำคัญ"\n• "นั่นสมเหตุสมผลอย่างสมบูรณ์ โดยเฉพาะใน F&B ที่มีอัตรากำไรที่แคบ"\n• "พันธมิตรหลายคนของเรารู้สึกเหมือนกันเมื่อพวกเขาดูแคมเปญของเราครั้งแรก"\n• "ถ้าฉันเป็นคุณ ฉันก็จะระมัดระวังเกี่ยวกับการใช้เงินแต่ละดอลลาร์เช่นกัน"',
              },
              {
                title: 'สำรวจ',
                description:
                  'คำถามติดตามถูกใช้อย่างมีประสิทธิภาพเพียงใดเพื่อค้นหาสาเหตุที่แท้จริงของการคัดค้าน?\n• คุณถามคำถามติดตามเพื่อค้นหาความกังวลที่แท้จริงเบื้องหลังการคัดค้านหรือไม่?\n• คุณกำหนดว่าความกังวลเกี่ยวกับงบประมาณ มูลค่า เวลา หรือสิทธิ์หรือไม่?\n• คุณใช้คำถามปลายเปิดเพื่อรวบรวมข้อมูลเพิ่มเติมหรือไม่?\n• คุณเข้าใจลักษณะเฉพาะและบริบทของความกังวลของพวกเขาหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• "เมื่อคุณบอกว่างบประมาณสูง มันเกี่ยวกับกระแสเงินสดในไตรมาสนี้หรือไม่ หรือคุณรู้สึกว่ามูลค่าไม่ตรงกับราคา?"\n• "ช่วยฉันเข้าใจ - อะไรต้องเกิดขึ้นเพื่อให้คุณรู้สึกสบายใจที่จะดำเนินการต่อ?"\n• "นี่เป็นความกังวลเกี่ยวกับงบประมาณหลักหรือไม่ หรือมีปัจจัยอื่นที่เข้ามาเกี่ยวข้อง?"\n• "ด้านใดของการลงทุนที่คุณกังวลมากที่สุด?"',
              },
              {
                title: 'ตอบสนอง',
                description:
                  'ความกังวลเฉพาะถูกจัดการได้ดีเพียงใดด้วยโซลูชั่นและข้อเสนอคุณค่าที่เหมาะสม?\n• คุณให้โซลูชั่นที่จัดการกับความกังวลที่พวกเขาระบุโดยเฉพาะหรือไม่?\n• คุณแบ่งปันกรณีศึกษาที่เกี่ยวข้องหรือตัวอย่างของผู้ค้าที่คล้ายกันหรือไม่?\n• คุณเสนอทางเลือกหรือตัวเลือกที่ยืดหยุ่นเพื่อเอาชนะการคัดค้านหรือไม่?\n• คุณทำงานร่วมกันเพื่อค้นหาโซลูชั่นที่เป็นประโยชน์ร่วมกันหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• "เนื่องจากความกังวลของคุณเกี่ยวกับงบประมาณ ให้ฉันแบ่งปันว่าผู้ค้าเช่นคุณเห็น ROI ในเดือนแรกอย่างไร"\n• "เราเห็นการเพิ่มขึ้น 30% ในการมองเห็นในแอปสำหรับผู้ค้าที่เข้าร่วมและเพิ่มยอดขายหลังแคมเปญ"\n• "ถ้าเราสำรวจวิธีลดต้นทุนล่วงหน้าของคุณผ่านการรวมกันล่ะ?"\n• "จะช่วยได้หรือไม่ถ้าเราเริ่มต้นด้วยแคมเปญนำร่องที่เล็กกว่าเพื่อพิสูจน์ผลลัพธ์ก่อน?"',
              },
            ],
          },
          {
            name: 'เทคนิคการขาย',
            sectionType: 'custom',
            criteria: [
              {
                title: 'Metrics',
                description:
                  'ข้อจำกัดงบประมาณ เมตริกหลัก และความคาดหวัง ROI ได้รับความเข้าใจได้ดีเพียงใด?\n• คุณถามเกี่ยวกับงบประมาณปัจจุบันสำหรับแคมเปญประเภทนี้หรือไม่?\n• คุณสำรวจว่าพวกเขาใส่ใจเมตริกอะไร (ยอดขายที่เพิ่มขึ้น การเข้าถึง การรักษาลูกค้าหลังแคมเปญ) หรือไม่?\n• คุณแสดง ROI ของแคมเปญผ่านกรณีศึกษาหรือไม่?\n• คุณแบ่งปัน KPI เฉพาะและเกณฑ์มาตรฐาน ROI MEX หรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• "งบประมาณปัจจุบันของคุณสำหรับแคมเปญประเภทนี้คืออะไร?"\n• "เมตริกใดสำคัญที่สุดสำหรับคุณ - ยอดขายที่เพิ่มขึ้น การเข้าถึง หรือการรักษาลูกค้าหลังแคมเปญ?"\n• "ให้ฉันแบ่งปันว่าแคมเปญของเรามักจะทำงานอย่างไรผ่านกรณีศึกษา"\n• "ข้อมูลของเราแสดงให้เห็นว่าแคมเปญ MEX มักจะให้ผลลัพธ์ที่ดีกว่า 8.5% พร้อมยอดขายที่เพิ่มขึ้น 20%"',
              },
              {
                title: 'Competitors',
                description:
                  'ภูมิทัศน์การแข่งขันและโอกาสในการสร้างความแตกต่างถูกสำรวจอย่างมีประสิทธิภาพเพียงใด?\n• คุณถามว่าแคมเปญ การเข้าถึง และผลลัพธ์ของคุณเปรียบเทียบกับคู่แข่งอย่างไร?\n• คุณสำรวจว่าอะไรจะทำให้พวกเขาเลือกแคมเปญของคุณมากกว่าคู่แข่งหรือคู่แข่งทางอ้อม (เช่น โฆษณาแบบดั้งเดิม) แม้จะมีข้อจำกัดงบประมาณหรือไม่?\n• คุณเข้าใจทางเลือกการแข่งขันและการวางตำแหน่งในตลาดหรือไม่?\n• คุณเน้นข้อเสนอคุณค่าที่ไม่เหมือนใครและหลักฐาน ROI หรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• "แคมเปญ การเข้าถึง และผลลัพธ์ของเราเปรียบเทียบกับสิ่งที่คู่แข่งเสนออย่างไร?"\n• "อะไรจะทำให้คุณเลือกแคมเปญของเราแทนการโฆษณาแบบดั้งเดิมหรือตัวเลือกการตลาดดิจิทัลอื่น?"\n• "แม้จะมีข้อจำกัดงบประมาณ ความแตกต่างใดที่สำคัญที่สุดสำหรับคุณ?"\n• "ผู้ให้บริการอื่นที่คุณเคยทำงานด้วยทำงานได้อย่างไรเมื่อเทียบกับที่คุณคาดหวัง?"',
              },
              {
                title: 'Decision Criteria',
                description:
                  'ปัจจัยการประเมินและกระบวนการตัดสินใจถูกค้นพบได้ดีเพียงใด?\n• คุณถามเกี่ยวกับเกณฑ์สามอันดับแรกที่พวกเขาพิจารณาเมื่อตัดสินใจลงทุนในแคมเปญหรือไม่?\n• คุณสำรวจว่าจะต้องทำอย่างไรจึงจะทำให้พวกเขาพิจารณาการจัดสรรงบประมาณสำหรับแคมเปญใหม่หรือไม่?\n• คุณระบุว่าใครอีกในองค์กรของพวกเขาต้องเข้ามาเกี่ยวข้องในการตัดสินใจเรื่องงบประมาณหรือไม่?\n• คุณค้นพบความกังวลอื่นๆ เกี่ยวกับการจัดสรรงบประมาณสำหรับแคมเปญหรือไม่?\n\nการเริ่มต้นบทสนทนา (ตัวอย่าง):\n• "เกณฑ์สามอันดับแรกของคุณเมื่อประเมินการลงทุนแคมเปญคืออะไร?"\n• "จะต้องทำอย่างไรจึงจะทำให้คุณพิจารณาการจัดสรรงบประมาณของคุณสำหรับแคมเปญนี้ใหม่?"\n• "ใครอีกในองค์กรของคุณจะต้องเข้ามาเกี่ยวข้องในการตัดสินใจเรื่องงบประมาณนี้?"\n• "คุณมีความกังวลอื่นๆ อะไรเกี่ยวกับการจัดสรรงบประมาณสำหรับแคมเปญนี้?"',
              },
            ],
          },
          {
            name: 'ความรู้เกี่ยวกับผลิตภัณฑ์',
            sectionType: 'product-knowledge',
            criteria: [
              {
                title: 'การนำเสนอผลิตภัณฑ์',
                description: 'ประเมินความสามารถในการอธิบายข้อมูลผลิตภัณฑ์',
              },
              {
                title: 'ความแตกต่างจากคู่แข่ง',
                description: 'ประเมินความสามารถในการแยกแยะผลิตภัณฑ์จากคู่แข่ง',
              },
            ],
          },
        ],
      },
    },
  },
];

export async function seedGrabScorecards() {
  await connect(process.env.DATABASE_URL!);

  try {
    const operations = GRAB_SCORECARDS.map((scorecard) => {
      return {
        updateOne: {
          filter: {
            friendlyId: scorecard.friendlyId,
            company: new Types.ObjectId(TARGET_COMPANY_ID),
          },
          update: {
            $setOnInsert: {
              _id: new Types.ObjectId(),
              friendlyId: scorecard.friendlyId,
            },
            $set: {
              name: scorecard.name,
              company: new Types.ObjectId(TARGET_COMPANY_ID),
              assessmentType: scorecard.assessmentType,
              scormPolicy: scorecard.scormPolicy,
              sections: scorecard.sections,
              localizations: scorecard.localizations,
            },
          },
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      const result = await Scorecard.bulkWrite(operations, { ordered: false });
      console.log('Grab scorecards seeding completed:', {
        company: companyArg,
        companyId: TARGET_COMPANY_ID,
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        matched: result.matchedCount,
      });
    } else {
      console.log('No Grab scorecard operations to execute.');
    }
  } catch (error) {
    console.error('Error seeding Grab scorecards:', error);
  } finally {
    await disconnect();
  }
}

void seedGrabScorecards();
