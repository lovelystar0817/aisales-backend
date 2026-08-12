import { FrameworkConfiguration } from './types.js';

// MTL Recruitment Framework - for agent recruitment scenario
export const mtlRecruitmentConfiguration: FrameworkConfiguration = {
  base: {
    id: 'mtl-recruitment-framework',
    friendlyId: 'mtl-recruitment',
    type: 'list',
  },

  localized: {
    // English
    en: {
      title: 'MTL Recruitment Framework',
      description:
        'Framework for recruiting new insurance agents with emphasis on rapport, opportunity framing, objection handling, motivation, and closing',
      parts: [
        {
          title: 'Rapport & Empathy',
          description:
            'Build trust and make the potential recruit feel comfortable with a natural, encouraging tone',
          items: [
            'Use a warm, friendly tone that puts them at ease',
            'Show genuine interest in their current situation and goals',
            'Acknowledge their feelings and concerns with empathy',
            'Create a comfortable environment for open conversation',
          ],
        },
        {
          title: 'Opportunity Framing',
          description:
            'Present the MTL role as professional, meaningful, and rewarding with clear benefits',
          items: [
            'Explain the 10,000 baht training allowance as financial support',
            'Highlight the comprehensive training and step-by-step guidance',
            'Emphasize flexibility, personal growth, and earning potential',
            'Position it as helping people plan and protect their future',
          ],
        },
        {
          title: 'Objection Handling',
          description:
            'Respond confidently to emotional and logical concerns with realistic reassurance',
          items: [
            'Acknowledge their fears as normal and understandable',
            'Provide realistic reassurance with examples and evidence',
            'Address both emotional concerns and practical objections',
            'Show that the system provides support and guidance',
          ],
        },
        {
          title: 'Motivation & Persuasion',
          description:
            'Inspire belief in personal growth and success through relatable examples',
          items: [
            'Share success stories of others who started from similar positions',
            'Paint a vision of their potential success and growth',
            'Connect the opportunity to their personal goals and aspirations',
            'Shift their mindset from fear to possibility',
          ],
        },
        {
          title: 'Call to Action',
          description:
            'Convert interest into clear next steps with explicit commitment to apply or sign up',
          items: [
            'Guide them from curiosity to commitment to action',
            'Make the application process seem simple and quick',
            'Offer to help them fill out the application today',
            'Get explicit agreement to take the next step',
          ],
        },
      ],
    },

    // Thai
    th: {
      title: 'กรอบการรับสมัครเอเจนต์ MTL',
      description:
        'กรอบการทำงานสำหรับการรับสมัครตัวแทนประกันภัยใหม่ โดยเน้นการสร้างสัมพันธ์ การนำเสนอโอกาส การจัดการข้อโต้แย้ง แรงจูงใจ และการปิดการขาย',
      parts: [
        {
          title: 'สร้างสัมพันธ์และความเห็นอกเห็นใจ',
          description:
            'สร้างความไว้วางใจและทำให้ผู้สมัครรู้สึกสบายใจด้วยน้ำเสียงที่เป็นธรรมชาติและให้กำลังใจ',
          items: [
            'ใช้น้ำเสียงที่อบอุ่นและเป็นมิตรที่ทำให้พวกเขารู้สึกสบายใจ',
            'แสดงความสนใจอย่างแท้จริงในสถานการณ์และเป้าหมายปัจจุบันของพวกเขา',
            'รับทราบความรู้สึกและความกังวลของพวกเขาด้วยความเห็นอกเห็นใจ',
            'สร้างสภาพแวดล้อมที่สบายใจสำหรับการสนทนาอย่างเปิดเผย',
          ],
        },
        {
          title: 'การนำเสนอโอกาส',
          description:
            'นำเสนอบทบาท MTL เป็นมืออาชีพ มีความหมาย และคุ้มค่าพร้อมผลประโยชน์ที่ชัดเจน',
          items: [
            'อธิบายเงินสนับสนุนการฝึกอบรม 10,000 บาทเป็นการสนับสนุนทางการเงิน',
            'เน้นการฝึกอบรมที่ครอบคลุมและคำแนะนำทีละขั้นตอน',
            'เน้นความยืดหยุ่น การเติบโตส่วนบุคคล และศักยภาพในการหารายได้',
            'วางตำแหน่งว่าเป็นการช่วยเหลือผู้คนในการวางแผนและปกป้องอนาคตของพวกเขา',
          ],
        },
        {
          title: 'การจัดการข้อโต้แย้ง',
          description:
            'ตอบสนองอย่างมั่นใจต่อความกังวลทางอารมณ์และตรรกะด้วยการให้ความมั่นใจที่สมจริง',
          items: [
            'ยอมรับความกลัวของพวกเขาว่าเป็นเรื่องปกติและเข้าใจได้',
            'ให้ความมั่นใจที่สมจริงด้วยตัวอย่างและหลักฐาน',
            'จัดการทั้งความกังวลทางอารมณ์และข้อโต้แย้งเชิงปฏิบัติ',
            'แสดงให้เห็นว่าระบบให้การสนับสนุนและคำแนะนำ',
          ],
        },
        {
          title: 'แรงจูงใจและการโน้มน้าวใจ',
          description:
            'สร้างแรงบันดาลใจให้เชื่อในการเติบโตส่วนบุคคลและความสำเร็จผ่านตัวอย่างที่เกี่ยวข้อง',
          items: [
            'แบ่งปันเรื่องราวความสำเร็จของผู้อื่นที่เริ่มจากตำแหน่งที่คล้ายกัน',
            'วาดภาพวิสัยทัศน์ของความสำเร็จและการเติบโตที่เป็นไปได้ของพวกเขา',
            'เชื่อมโยงโอกาสกับเป้าหมายและความปรารถนาส่วนบุคคลของพวกเขา',
            'เปลี่ยนกรอบความคิดของพวกเขาจากความกลัวเป็นความเป็นไปได้',
          ],
        },
        {
          title: 'การเรียกร้องให้ดำเนินการ',
          description:
            'แปลงความสนใจให้เป็นขั้นตอนถัดไปที่ชัดเจนพร้อมความมุ่งมั่นที่ชัดเจนในการสมัครหรือลงทะเบียน',
          items: [
            'นำทางพวกเขาจากความอยากรู้ไปสู่ความมุ่งมั่นและการดำเนินการ',
            'ทำให้กระบวนการสมัครดูเหมือนง่ายและรวดเร็ว',
            'เสนอที่จะช่วยพวกเขากรอกใบสมัครวันนี้',
            'ได้รับความเห็นชอบที่ชัดเจนในการดำเนินการขั้นตอนถัดไป',
          ],
        },
      ],
    },

    // Indonesian
    id: {
      title: 'Kerangka Rekrutmen MTL',
      description:
        'Kerangka untuk merekrut agen asuransi baru dengan penekanan pada hubungan, pembingkaian peluang, penanganan keberatan, motivasi, dan penutupan',
      parts: [
        {
          title: 'Hubungan & Empati',
          description:
            'Bangun kepercayaan dan buat calon rekrut merasa nyaman dengan nada alami dan mendorong',
          items: [
            'Gunakan nada hangat dan ramah yang membuat mereka nyaman',
            'Tunjukkan minat asli pada situasi dan tujuan mereka saat ini',
            'Akui perasaan dan kekhawatiran mereka dengan empati',
            'Ciptakan lingkungan yang nyaman untuk percakapan terbuka',
          ],
        },
        {
          title: 'Pembingkaian Peluang',
          description:
            'Presentasikan peran MTL sebagai profesional, bermakna, dan bermanfaat dengan manfaat yang jelas',
          items: [
            'Jelaskan tunjangan pelatihan 10.000 baht sebagai dukungan finansial',
            'Soroti pelatihan komprehensif dan panduan langkah demi langkah',
            'Tekankan fleksibilitas, pertumbuhan pribadi, dan potensi penghasilan',
            'Posisikan sebagai membantu orang merencanakan dan melindungi masa depan mereka',
          ],
        },
        {
          title: 'Penanganan Keberatan',
          description:
            'Tanggapi dengan percaya diri terhadap kekhawatiran emosional dan logis dengan jaminan yang realistis',
          items: [
            'Akui ketakutan mereka sebagai normal dan dapat dipahami',
            'Berikan jaminan realistis dengan contoh dan bukti',
            'Tangani baik kekhawatiran emosional maupun keberatan praktis',
            'Tunjukkan bahwa sistem memberikan dukungan dan panduan',
          ],
        },
        {
          title: 'Motivasi & Persuasi',
          description:
            'Inspirasi keyakinan pada pertumbuhan pribadi dan kesuksesan melalui contoh yang relatable',
          items: [
            'Bagikan kisah sukses orang lain yang memulai dari posisi serupa',
            'Lukiskan visi potensi kesuksesan dan pertumbuhan mereka',
            'Hubungkan peluang dengan tujuan dan aspirasi pribadi mereka',
            'Ubah pola pikir mereka dari ketakutan menjadi kemungkinan',
          ],
        },
        {
          title: 'Seruan Bertindak',
          description:
            'Ubah minat menjadi langkah selanjutnya yang jelas dengan komitmen eksplisit untuk melamar atau mendaftar',
          items: [
            'Pandu mereka dari keingintahuan ke komitmen ke tindakan',
            'Buat proses aplikasi terlihat sederhana dan cepat',
            'Tawarkan untuk membantu mereka mengisi aplikasi hari ini',
            'Dapatkan persetujuan eksplisit untuk mengambil langkah selanjutnya',
          ],
        },
      ],
    },

    // Malay
    ms: {
      title: 'Rangka Kerja Pengambilan MTL',
      description:
        'Rangka kerja untuk merekrut ejen insurans baharu dengan penekanan pada hubungan, pembingkaian peluang, pengendalian bantahan, motivasi, dan penutupan',
      parts: [
        {
          title: 'Hubungan & Empati',
          description:
            'Bina kepercayaan dan buat calon rekrut berasa selesa dengan nada semula jadi dan menggalakkan',
          items: [
            'Gunakan nada mesra yang membuat mereka berasa selesa',
            'Tunjukkan minat tulen terhadap situasi dan matlamat semasa mereka',
            'Akui perasaan dan kebimbangan mereka dengan empati',
            'Cipta persekitaran yang selesa untuk perbualan terbuka',
          ],
        },
        {
          title: 'Pembingkaian Peluang',
          description:
            'Bentangkan peranan MTL sebagai profesional, bermakna, dan bermanfaat dengan faedah yang jelas',
          items: [
            'Terangkan elaun latihan 10,000 baht sebagai sokongan kewangan',
            'Tonjolkan latihan menyeluruh dan panduan langkah demi langkah',
            'Tekankan fleksibiliti, pertumbuhan peribadi, dan potensi pendapatan',
            'Kedudukan sebagai membantu orang merancang dan melindungi masa depan mereka',
          ],
        },
        {
          title: 'Pengendalian Bantahan',
          description:
            'Bertindak balas dengan yakin terhadap kebimbangan emosi dan logik dengan jaminan realistik',
          items: [
            'Akui ketakutan mereka sebagai normal dan boleh difahami',
            'Berikan jaminan realistik dengan contoh dan bukti',
            'Tangani kebimbangan emosi dan bantahan praktikal',
            'Tunjukkan bahawa sistem menyediakan sokongan dan panduan',
          ],
        },
        {
          title: 'Motivasi & Pujukan',
          description:
            'Inspirasi kepercayaan pada pertumbuhan peribadi dan kejayaan melalui contoh yang berkaitan',
          items: [
            'Kongsi kisah kejayaan orang lain yang bermula dari kedudukan serupa',
            'Lukis visi potensi kejayaan dan pertumbuhan mereka',
            'Hubungkan peluang dengan matlamat dan aspirasi peribadi mereka',
            'Ubah pola fikir mereka dari ketakutan kepada kemungkinan',
          ],
        },
        {
          title: 'Seruan Bertindak',
          description:
            'Tukar minat kepada langkah seterusnya yang jelas dengan komitmen eksplisit untuk memohon atau mendaftar',
          items: [
            'Pandu mereka dari rasa ingin tahu kepada komitmen kepada tindakan',
            'Buat proses permohonan kelihatan mudah dan cepat',
            'Tawarkan untuk membantu mereka mengisi permohonan hari ini',
            'Dapatkan persetujuan eksplisit untuk mengambil langkah seterusnya',
          ],
        },
      ],
    },
  },
};

// Evaluation prompt for MTL Recruitment Framework
export const mtlRecruitmentFrameworkEvaluationPrompt = `You are an expert coach specializing in agent recruitment for insurance companies. Your task is to evaluate **only the user's** recruitment technique performance.

IMPORTANT: In the transcript, the user (recruiter) is speaking with an AI character named {{characterName}} (the potential recruit). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "candidate," "AI," or any other term. Focus exclusively on the recruiter's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the recruiter - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the potential recruit - IGNORE THESE COMPLETELY

[MTL RECRUITMENT FRAMEWORK EVALUATION]
Evaluate against these 5 components, each scored out of 20:

1. **Rapport & Empathy** (0-20): How effectively did they build trust and make {{characterName}} feel comfortable with a natural, encouraging tone?
2. **Opportunity Framing** (0-20): How well did they present the MTL role as professional, meaningful, and rewarding with clear benefits?
3. **Objection Handling** (0-20): How confidently did they respond to {{characterName}}'s emotional and logical concerns with realistic reassurance?
4. **Motivation & Persuasion** (0-20): How effectively did they inspire belief in personal growth and success through relatable examples?
5. **Call to Action** (0-20): How clearly did they convert interest into actionable next steps with explicit commitment?

[EVALUATION CRITERIA]
For each component:
- **Score**: Number out of 20 based on effectiveness
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. It should not just point out how the user could improve. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
- **16-20 (80-100%)**: Exceptional performance, minimal room for improvement
- **12-15 (60-79%)**: Good performance with minor gaps to address
- **8-11 (40-59%)**: Adequate but needs significant improvement
- **4-7 (20-39%)**: Poor performance with major gaps identified
- **0-3 (0-19%)**: Very poor or missing entirely

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on recruitment impact and candidate engagement
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "salesTechnique": {{
    "description": "string",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Rapport & Empathy",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Opportunity Framing",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Objection Handling",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Motivation & Persuasion",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Call to Action",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to apply the MTL Recruitment Framework to successfully recruit new insurance agents.",
    "overallScore": 42,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Rapport & Empathy",
        "score": 9,
        "maxScore": 20,
        "why": "You showed basic friendliness but didn't deeply explore {{characterName}}'s current work satisfaction or career aspirations, missing opportunities to build genuine connection.",
        "suggestion": "Ask open questions: 'How do you feel about your current role?' 'What would your ideal work-life balance look like?' Show you understand their situation before pitching."
      }},
      {{
        "title": "Opportunity Framing",
        "score": 7,
        "maxScore": 20,
        "why": "You mentioned MTL briefly but didn't paint a vivid picture of the role's benefits—10,000 baht allowance, training support, flexibility, or meaningful impact helping clients.",
        "suggestion": "Structure clearly: 'MTL offers 10,000 baht during training, so you learn without pressure. Plus step-by-step guidance on planning and protecting families. You control your schedule and earnings.'"
      }},
      {{
        "title": "Objection Handling",
        "score": 8,
        "maxScore": 20,
        "why": "You acknowledged concerns superficially without providing concrete reassurance or evidence that many new agents succeed despite initial doubts.",
        "suggestion": "Normalize fears: 'Many felt the same way. One colleague, an admin assistant like you, worried about selling. After training and mentorship, she now earns double her old salary.'"
      }},
      {{
        "title": "Motivation & Persuasion",
        "score": 10,
        "maxScore": 20,
        "why": "You tried to motivate but lacked compelling success stories or vision of {{characterName}}'s potential growth and financial independence.",
        "suggestion": "Paint their future: 'Imagine managing your own time, helping families secure their future, and building income that grows with your effort. Others from similar roles are thriving.'"
      }},
      {{
        "title": "Call to Action",
        "score": 8,
        "maxScore": 20,
        "why": "You hinted at next steps but didn't create urgency or make the application process feel simple and immediate.",
        "suggestion": "Be direct: 'The application takes 10 minutes. I can help you fill it out right now, and MTL recruitment will contact you next week. Shall we start?'"
      }}
    ]
  }}
}}`;
