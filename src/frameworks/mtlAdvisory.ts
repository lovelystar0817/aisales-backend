import { FrameworkConfiguration } from './types.js';

// MTL Advisory Framework - for Muang Thai UL Plus sales consultations
export const mtlAdvisoryConfiguration: FrameworkConfiguration = {
  base: {
    id: 'mtl-advisory-framework',
    friendlyId: 'mtl-advisory',
    type: 'list',
  },

  localized: {
    // English
    en: {
      title: 'MTL Advisory Framework',
      description:
        'Framework for financial advisory consultations focusing on rapport building, needs discovery, product framing, and closing',
      parts: [
        {
          title: 'Rapport Building',
          description:
            'Establish comfort and trust quickly, relate to customer naturally',
          items: [
            'Sound natural, relatable, and curious about their situation',
            'Personalize the conversation based on their context',
            'Maintain warmth and credibility throughout',
            'Respond to their tone (friendly, neutral, or cautious)',
          ],
        },
        {
          title: 'Needs Discovery',
          description:
            'Use open-ended questions to understand real priorities and financial goals',
          items: [
            'Ask what matters most: savings, protection, or returns',
            'Explore education planning for family members',
            'Understand current investment situation and satisfaction',
            'Identify gaps between current state and desired outcomes',
          ],
        },
        {
          title: 'Product Framing',
          description:
            'Introduce Muang Thai UL Plus naturally and link it accurately to identified needs',
          items: [
            'Position UL Plus as combining protection with investment',
            'Explain flexibility in premiums and fund selection',
            'Highlight how it addresses their specific concerns',
            'Differentiate from existing solutions they mentioned',
          ],
        },
        {
          title: 'Objection Handling & Closing',
          description:
            'Address concerns clearly and secure appointment confidently',
          items: [
            'Acknowledge hesitations as completely understandable',
            'Provide reassurance with specific product features',
            'Propose a short consultation to explore options',
            'Get explicit commitment to meet at a specific time',
          ],
        },
      ],
    },

    // Thai
    th: {
      title: 'กรอบการให้คำปรึกษา MTL',
      description:
        'กรอบการทำงานสำหรับการให้คำปรึกษาทางการเงินโดยเน้นการสร้างสัมพันธ์ การค้นพบความต้องการ การนำเสนอผลิตภัณฑ์ และการปิดการขาย',
      parts: [
        {
          title: 'การสร้างสัมพันธ์',
          description:
            'สร้างความสบายใจและความไว้วางใจอย่างรวดเร็ว เชื่อมโยงกับลูกค้าอย่างเป็นธรรมชาติ',
          items: [
            'ฟังดูเป็นธรรมชาติ เข้าถึงได้ และอยากรู้เกี่ยวกับสถานการณ์ของพวกเขา',
            'ปรับแต่งการสนทนาตามบริบทของพวกเขา',
            'รักษาความอบอุ่นและความน่าเชื่อถือตลอดเวลา',
            'ตอบสนองต่อน้ำเสียงของพวกเขา (เป็นมิตร เป็นกลาง หรือระมัดระวัง)',
          ],
        },
        {
          title: 'การค้นพบความต้องการ',
          description:
            'ใช้คำถามปลายเปิดเพื่อเข้าใจลำดับความสำคัญที่แท้จริงและเป้าหมายทางการเงิน',
          items: [
            'ถามว่าอะไรสำคัญที่สุด: การออม การปกป้อง หรือผลตอบแทน',
            'สำรวจการวางแผนการศึกษาสำหรับสมาชิกในครอบครัว',
            'เข้าใจสถานการณ์การลงทุนปัจจุบันและความพึงพอใจ',
            'ระบุช่องว่างระหว่างสถานะปัจจุบันและผลลัพธ์ที่ต้องการ',
          ],
        },
        {
          title: 'การนำเสนอผลิตภัณฑ์',
          description:
            'แนะนำ Muang Thai UL Plus อย่างเป็นธรรมชาติและเชื่อมโยงอย่างแม่นยำกับความต้องการที่ระบุ',
          items: [
            'วางตำแหน่ง UL Plus เป็นการรวมการปกป้องกับการลงทุน',
            'อธิบายความยืดหยุ่นในเบี้ยประกันและการเลือกกองทุน',
            'เน้นว่ามันจัดการกับความกังวลเฉพาะของพวกเขาอย่างไร',
            'แยกความแตกต่างจากโซลูชันที่มีอยู่ที่พวกเขากล่าวถึง',
          ],
        },
        {
          title: 'การจัดการข้อโต้แย้งและการปิดการขาย',
          description:
            'จัดการกับความกังวลอย่างชัดเจนและรักษาการนัดหมายอย่างมั่นใจ',
          items: [
            'ยอมรับความลังเลว่าเข้าใจได้อย่างสมบูรณ์',
            'ให้ความมั่นใจด้วยคุณสมบัติผลิตภัณฑ์ที่เฉพาะเจาะจง',
            'เสนอการปรึกษาสั้น ๆ เพื่อสำรวจตัวเลือก',
            'ได้รับความมุ่งมั่นที่ชัดเจนในการพบกันในเวลาที่เฉพาะเจาะจง',
          ],
        },
      ],
    },

    // Indonesian
    id: {
      title: 'Kerangka Penasihat MTL',
      description:
        'Kerangka untuk konsultasi penasihat keuangan yang fokus pada membangun hubungan, penemuan kebutuhan, pembingkaian produk, dan penutupan',
      parts: [
        {
          title: 'Membangun Hubungan',
          description:
            'Membangun kenyamanan dan kepercayaan dengan cepat, berhubungan dengan pelanggan secara alami',
          items: [
            'Terdengar alami, relatable, dan ingin tahu tentang situasi mereka',
            'Personalisasi percakapan berdasarkan konteks mereka',
            'Pertahankan kehangatan dan kredibilitas sepanjang waktu',
            'Tanggapi nada mereka (ramah, netral, atau hati-hati)',
          ],
        },
        {
          title: 'Penemuan Kebutuhan',
          description:
            'Gunakan pertanyaan terbuka untuk memahami prioritas nyata dan tujuan keuangan',
          items: [
            'Tanyakan apa yang paling penting: tabungan, perlindungan, atau pengembalian',
            'Jelajahi perencanaan pendidikan untuk anggota keluarga',
            'Pahami situasi investasi saat ini dan kepuasan',
            'Identifikasi kesenjangan antara keadaan saat ini dan hasil yang diinginkan',
          ],
        },
        {
          title: 'Pembingkaian Produk',
          description:
            'Perkenalkan Muang Thai UL Plus secara alami dan hubungkan secara akurat dengan kebutuhan yang diidentifikasi',
          items: [
            'Posisikan UL Plus sebagai menggabungkan perlindungan dengan investasi',
            'Jelaskan fleksibilitas dalam premi dan pemilihan dana',
            'Soroti bagaimana itu menangani kekhawatiran spesifik mereka',
            'Bedakan dari solusi yang ada yang mereka sebutkan',
          ],
        },
        {
          title: 'Penanganan Keberatan & Penutupan',
          description:
            'Tangani kekhawatiran dengan jelas dan amankan janji temu dengan percaya diri',
          items: [
            'Akui keraguan sebagai sepenuhnya dapat dipahami',
            'Berikan jaminan dengan fitur produk spesifik',
            'Usulkan konsultasi singkat untuk menjelajahi pilihan',
            'Dapatkan komitmen eksplisit untuk bertemu pada waktu tertentu',
          ],
        },
      ],
    },

    // Malay
    ms: {
      title: 'Rangka Kerja Penasihat MTL',
      description:
        'Rangka kerja untuk perundingan penasihat kewangan yang memberi tumpuan kepada membina hubungan, penemuan keperluan, pembingkaian produk, dan penutupan',
      parts: [
        {
          title: 'Membina Hubungan',
          description:
            'Wujudkan keselesaan dan kepercayaan dengan cepat, berhubung dengan pelanggan secara semula jadi',
          items: [
            'Kedengaran semula jadi, mudah didekati, dan ingin tahu tentang keadaan mereka',
            'Personalisasi perbualan berdasarkan konteks mereka',
            'Kekalkan kehangatan dan kredibiliti sepanjang masa',
            'Bertindak balas terhadap nada mereka (mesra, neutral, atau berhati-hati)',
          ],
        },
        {
          title: 'Penemuan Keperluan',
          description:
            'Gunakan soalan terbuka untuk memahami keutamaan sebenar dan matlamat kewangan',
          items: [
            'Tanya apa yang paling penting: simpanan, perlindungan, atau pulangan',
            'Terokai perancangan pendidikan untuk ahli keluarga',
            'Fahami situasi pelaburan semasa dan kepuasan',
            'Kenal pasti jurang antara keadaan semasa dan hasil yang diinginkan',
          ],
        },
        {
          title: 'Pembingkaian Produk',
          description:
            'Perkenalkan Muang Thai UL Plus secara semula jadi dan kaitkan dengan tepat dengan keperluan yang dikenal pasti',
          items: [
            'Kedudukan UL Plus sebagai menggabungkan perlindungan dengan pelaburan',
            'Terangkan fleksibiliti dalam premium dan pemilihan dana',
            'Tonjolkan bagaimana ia menangani kebimbangan khusus mereka',
            'Bezakan dari penyelesaian sedia ada yang mereka sebut',
          ],
        },
        {
          title: 'Pengendalian Bantahan & Penutupan',
          description:
            'Tangani kebimbangan dengan jelas dan pastikan temu janji dengan yakin',
          items: [
            'Akui keraguan sebagai boleh difahami sepenuhnya',
            'Berikan jaminan dengan ciri produk tertentu',
            'Cadangkan perundingan ringkas untuk meneroka pilihan',
            'Dapatkan komitmen eksplisit untuk bertemu pada masa tertentu',
          ],
        },
      ],
    },
  },
};

// Evaluation prompt for MTL Advisory Framework
export const mtlAdvisoryFrameworkEvaluationPrompt = `You are an expert financial advisory coach specializing in insurance and investment product consultations. Your task is to evaluate **only the user's** advisory technique performance.

IMPORTANT: In the transcript, the user (advisor) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the advisor's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[MTL ADVISORY FRAMEWORK EVALUATION]
Evaluate against these 4 components, each scored out of 25:

1. **Rapport Building** (0-25): How effectively did they establish comfort and trust quickly, relating to {{characterName}} naturally?
2. **Needs Discovery** (0-25): How well did they use open-ended questions to understand {{characterName}}'s real priorities and financial goals?
3. **Product Framing** (0-25): How naturally and accurately did they introduce Muang Thai UL Plus and link it to {{characterName}}'s identified needs?
4. **Objection Handling & Closing** (0-25): How clearly did they address concerns and secure an appointment commitment confidently?

[EVALUATION CRITERIA]
For each component:
- **Score**: Number out of 25 based on effectiveness
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. It should not just point out how the user could improve. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
- **20-25 (80-100%)**: Exceptional performance, minimal room for improvement
- **15-19 (60-79%)**: Good performance with minor gaps to address
- **10-14 (40-59%)**: Adequate but needs significant improvement
- **5-9 (20-39%)**: Poor performance with major gaps identified
- **0-4 (0-19%)**: Very poor or missing entirely

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on advisory impact and customer engagement
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "salesTechnique": {{
    "description": "string",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Rapport Building",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Needs Discovery",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Product Framing",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Objection Handling & Closing",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to apply the MTL Advisory Framework for effective financial consultations.",
    "overallScore": 48,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Rapport Building",
        "score": 13,
        "maxScore": 25,
        "why": "You greeted {{characterName}} professionally but didn't personalize to his café business or acknowledge clicking on the ad, making the connection feel generic rather than warm.",
        "suggestion": "Reference his context: 'I saw you're running a café in Bangkok—tough years but things are steady now, right? Thank you for your interest in UL Plus. How's business treating you?'"
      }},
      {{
        "title": "Needs Discovery",
        "score": 11,
        "maxScore": 25,
        "why": "You asked general questions but didn't probe deeply into daughter's education planning, satisfaction with current mutual funds, or the specific balance between protection and growth {{characterName}} seeks.",
        "suggestion": "Use targeted questions: 'What's most important right now—saving for your daughter's school, protecting your family, or growing your money?' 'How are your mutual funds performing? Still meeting your goals?'"
      }},
      {{
        "title": "Product Framing",
        "score": 12,
        "maxScore": 25,
        "why": "You mentioned UL Plus features (flexibility, funds, coverage) but didn't connect them explicitly to {{characterName}}'s self-employed income variability or desire for protection plus returns.",
        "suggestion": "Link directly: 'UL Plus fits self-employed owners like you—adjust premiums when café income fluctuates, choose funds by risk level, and keep life coverage. You get both protection and growth potential.'"
      }},
      {{
        "title": "Objection Handling & Closing",
        "score": 12,
        "maxScore": 25,
        "why": "You acknowledged hesitation but didn't provide compelling reassurance about UL Plus simplicity or urgency, and the appointment ask felt vague without specific time/date.",
        "suggestion": "Reassure and close: 'It's straightforward once you see examples. How about a 20-minute chat Wednesday afternoon? I'll show how UL Plus works for flexible income like yours. No decision needed yet—just exploring.'"
      }}
    ]
  }}
}}`;
