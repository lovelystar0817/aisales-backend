import { FrameworkConfiguration } from './types.js';

// MEX-specific MEDDPICC framework focused on budget constraint handling
export const mexMeddpiccConfiguration: FrameworkConfiguration = {
  base: {
    id: 'grab-mex-meddpicc',
    friendlyId: 'grab-mex-meddpicc',
    type: 'list',
  },

  localized: {
    // English (Original)
    en: {
      title: 'Partial MEDDPICC',
      description:
        'Qualification methodology for Grab Mega Sales campaign focusing on key decision factors',
      parts: [
        {
          title: 'Metrics',
          description:
            'Understand budget, measurement criteria, and ROI expectations',
          items: [
            "What is client's current budget for this type of campaign?",
            'What metrics does client care about? Incremental sales? Reach? Post campaign retention? Share those metrics',
            'Showcase ROI of our campaigns through case study',
          ],
        },
        {
          title: 'Competitors',
          description:
            'Understand competitive landscape and differentiation opportunities',
          items: [
            'How does our campaign, reach, results compared to our competitors?',
            "What would make client choose our campaign over a competitor's or indirect competitor (e.g traditional ads) even with budget constraints?",
          ],
        },
        {
          title: 'Decision Criteria',
          description:
            'Understand evaluation factors and decision-making process',
          items: [
            'What are the top three criteria client considers when deciding on a campaign investment?',
            'What would it take for client to reconsider your budget allocation for this campaign?',
            "Who else in client's organization needs to be involved in the budget decision?",
            'What other concerns do they have regarding budget allocation for this campaign?',
          ],
        },
        // {
        //   title: 'Listen',
        //   description: 'Practice active listening when client raises objections or concerns',
        //   items: [
        //     'Allow client to fully express their concerns without interrupting',
        //     'Demonstrate patience and attention when client explains their constraints',
        //     'Resist the urge to immediately respond with a pitch',
        //     'Show active listening by acknowledging what was said',
        //   ],
        // },
        // {
        //   title: 'Acknowledge',
        //   description: 'Validate client concerns and show understanding',
        //   items: [
        //     'Use empathetic language to demonstrate you heard the objection',
        //     'Relate to client\'s situation with phrases like "I understand" or "That makes sense"',
        //     'Avoid dismissing or minimizing their concerns',
        //     'Normalize their concerns by sharing that others felt similarly',
        //   ],
        // },
        // {
        //   title: 'Explore',
        //   description: 'Probe deeper to understand the root cause of objections',
        //   items: [
        //     'Ask follow-up questions to uncover the real concern behind the objection',
        //     'Determine if the concern is about budget, value, timing, or authority',
        //     'Use open-ended questions to gather more information',
        //     'Understand the specific nature and context of their concern',
        //   ],
        // },
        // {
        //   title: 'Respond',
        //   description: 'Address concerns with tailored solutions',
        //   items: [
        //     'Provide solutions specifically addressing their stated concerns',
        //     'Share relevant case studies or examples of similar merchants',
        //     'Offer alternatives or flexible options to overcome objections',
        //     'Work collaboratively with client to find mutually beneficial solutions',
        //   ],
        // },
      ],
    },

    // Indonesian
    id: {
      title: 'MEDDPICC Parsial',
      description:
        'Metodologi kualifikasi untuk kampanye Grab Mega Sales yang fokus pada faktor keputusan kunci',
      parts: [
        {
          title: 'Metrics',
          description:
            'Memahami anggaran, kriteria pengukuran, dan ekspektasi ROI',
          items: [
            'Berapa anggaran klien saat ini untuk jenis kampanye ini?',
            'Metrik apa yang diperhatikan klien? Penjualan tambahan? Jangkauan? Retensi pasca kampanye? Bagikan metrik tersebut',
            'Tunjukkan ROI kampanye kami melalui studi kasus',
          ],
        },
        {
          title: 'Competitors',
          description: 'Memahami lanskap kompetitif dan peluang diferensiasi',
          items: [
            'Bagaimana kampanye, jangkauan, dan hasil kami dibandingkan dengan kompetitor?',
            'Apa yang akan membuat klien memilih kampanye kami daripada kompetitor atau pesaing tidak langsung (misalnya iklan tradisional) bahkan dengan kendala anggaran?',
          ],
        },
        {
          title: 'Decision Criteria',
          description:
            'Memahami faktor evaluasi dan proses pengambilan keputusan',
          items: [
            'Apa tiga kriteria teratas yang dipertimbangkan klien saat memutuskan investasi kampanye?',
            'Apa yang diperlukan agar klien mempertimbangkan kembali alokasi anggaran untuk kampanye ini?',
            'Siapa lagi dalam organisasi klien yang perlu terlibat dalam keputusan anggaran?',
            'Kekhawatiran lain apa yang mereka miliki terkait alokasi anggaran untuk kampanye ini?',
          ],
        },
      ],
    },

    // Malaysian
    ms: {
      title: 'MEDDPICC Separa',
      description:
        'Metodologi kelayakan untuk kempen mega sale Grab yang fokus pada faktor keputusan utama',
      parts: [
        {
          title: 'Metrics',
          description:
            'Memahami belanjawan, kriteria pengukuran, dan jangkaan ROI',
          items: [
            'Apakah belanjawan semasa klien untuk jenis kempen ini?',
            'Metrik apa yang klien ambil berat? Jualan tambahan? Capaian? Pengekalan selepas kempen? Kongsi metrik tersebut',
            'Tunjukkan ROI kempen kami melalui kajian kes',
          ],
        },
        {
          title: 'Competitors',
          description: 'Memahami landskap persaingan dan peluang pembezaan',
          items: [
            'Bagaimana kempen, capaian, dan hasil kami berbanding dengan pesaing?',
            'Apa yang akan membuat klien memilih kempen kami berbanding pesaing atau pesaing tidak langsung (contohnya iklan tradisional) walaupun dengan kekangan belanjawan?',
          ],
        },
        {
          title: 'Decision Criteria',
          description: 'Memahami faktor penilaian dan proses membuat keputusan',
          items: [
            'Apakah tiga kriteria teratas yang dipertimbangkan klien semasa memutuskan pelaburan kempen?',
            'Apa yang diperlukan untuk klien mempertimbangkan semula peruntukan belanjawan untuk kempen ini?',
            'Siapa lagi dalam organisasi klien yang perlu terlibat dalam keputusan belanjawan?',
            'Kebimbangan lain apa yang mereka ada berkaitan peruntukan belanjawan untuk kempen ini?',
          ],
        },
      ],
    },

    // Tagalog (Filipino)
    tl: {
      title: 'Partial MEDDPICC',
      description:
        'Qualification methodology para sa Grab Mega Sales campaign na naka-focus sa key decision factors',
      parts: [
        {
          title: 'Metrics',
          description:
            'Unawain ang budget, measurement criteria, at ROI expectations',
          items: [
            'Ano ang kasalukuyang budget ng kliyente para sa ganitong uri ng campaign?',
            'Anong metrics ang importante sa kliyente? Incremental sales? Reach? Post campaign retention? I-share ang mga metrics na yan',
            'I-showcase ang ROI ng aming campaigns through case study',
          ],
        },
        {
          title: 'Competitors',
          description:
            'Unawain ang competitive landscape at differentiation opportunities',
          items: [
            'Paano inihahambing ang aming campaign, reach, at results sa mga competitors?',
            'Ano ang magpapadali sa kliyente na piliin ang aming campaign kaysa sa competitor o indirect competitor (tulad ng traditional ads) kahit may budget constraints?',
          ],
        },
        {
          title: 'Decision Criteria',
          description:
            'Unawain ang evaluation factors at decision-making process',
          items: [
            'Anong tatlong criteria ang pinaka-importante sa kliyente kapag nagdedesisyon ng campaign investment?',
            'Ano ang kailangan para magreconsider ang kliyente ng budget allocation para sa campaign na ito?',
            'Sino pa sa organisasyon ng kliyente ang kailangang maging involved sa budget decision?',
            'Anong ibang concerns ang meron sila tungkol sa budget allocation para sa campaign na ito?',
          ],
        },
      ],
    },

    // Vietnamese
    vi: {
      title: 'MEDDPICC Một Phần',
      description:
        'Phương pháp đủ điều kiện cho chiến dịch Grab Mega Sales tập trung vào các yếu tố quyết định chính',
      parts: [
        {
          title: 'Chỉ số',
          description: 'Hiểu ngân sách, tiêu chí đo lường và kỳ vọng ROI',
          items: [
            'Ngân sách hiện tại của khách hàng cho loại chiến dịch này là bao nhiêu?',
            'Khách hàng quan tâm đến chỉ số nào? Bán hàng gia tăng? Tiếp cận? Duy trì sau chiến dịch? Chia sẻ những chỉ số đó',
            'Thể hiện ROI của các chiến dịch của chúng tôi thông qua nghiên cứu trường hợp',
          ],
        },
        {
          title: 'Đối thủ cạnh tranh',
          description: 'Hiểu bối cảnh cạnh tranh và cơ hội khác biệt hóa',
          items: [
            'Chiến dịch, tiếp cận và kết quả của chúng tôi so với đối thủ cạnh tranh như thế nào?',
            'Điều gì sẽ khiến khách hàng chọn chiến dịch của chúng tôi thay vì đối thủ cạnh tranh hoặc cạnh tranh gián tiếp (ví dụ: quảng cáo truyền thống) dù có ràng buộc ngân sách?',
          ],
        },
        {
          title: 'Tiêu chí quyết định',
          description: 'Hiểu các yếu tố đánh giá và quy trình ra quyết định',
          items: [
            'Ba tiêu chí hàng đầu mà khách hàng xem xét khi quyết định đầu tư chiến dịch là gì?',
            'Cần có gì để khách hàng xem xét lại phân bổ ngân sách cho chiến dịch này?',
            'Ai khác trong tổ chức khách hàng cần tham gia vào quyết định ngân sách?',
            'Họ còn có những mối quan tâm nào khác về phân bổ ngân sách cho chiến dịch này?',
          ],
        },
      ],
    },

    // Thai
    th: {
      title: 'MEDDPICC บางส่วน',
      description:
        'วิธีการคัดเลือกสำหรับแคมเปญเมก้าเซลของ Grab ที่เน้นปัจจัยการตัดสินใจที่สำคัญ',
      parts: [
        {
          title: 'Metrics',
          description: 'เข้าใจงบประมาณ เกณฑ์การวัด และความคาดหวัง ROI',
          items: [
            'งบประมาณปัจจุบันของลูกค้าสำหรับแคมเปญประเภทนี้คือเท่าไร?',
            'ลูกค้าสนใจเมตริกอะไร? ยอดขายที่เพิ่มขึ้น? การเข้าถึง? การรักษาลูกค้าหลังแคมเปญ? แชร์เมตริกเหล่านั้น',
            'แสดง ROI ของแคมเปญของเราผ่านกรณีศึกษา',
          ],
        },
        {
          title: 'Competitors',
          description: 'เข้าใจภูมิทัศน์การแข่งขันและโอกาสในการสร้างความแตกต่าง',
          items: [
            'แคมเปญ การเข้าถึง และผลลัพธ์ของเราเทียบกับคู่แข่งเป็นอย่างไร?',
            'อะไรจะทำให้ลูกค้าเลือกแคมเปญของเราแทนคู่แข่งหรือคู่แข่งทางอ้อม (เช่น โฆษณาแบบดั้งเดิม) แม้จะมีข้อจำกัดด้านงบประมาณ?',
          ],
        },
        {
          title: 'Decision Criteria',
          description: 'เข้าใจปัจจัยการประเมินและกระบวนการตัดสินใจ',
          items: [
            'เกณฑ์สามอันดับแรกที่ลูกค้าพิจารณาเมื่อตัดสินใจลงทุนในแคมเปญคืออะไร?',
            'จะต้องทำอย่างไรจึงจะทำให้ลูกค้าพิจารณาการจัดสรรงบประมาณสำหรับแคมเปญนี้ใหม่?',
            'ใครอีกในองค์กรของลูกค้าที่จำเป็นต้องมีส่วนร่วมในการตัดสินใจเรื่องงบประมาณ?',
            'พวกเขามีข้อกังวลอื่นๆ อะไรเกี่ยวกับการจัดสรรงบประมาณสำหรับแคมเปญนี้?',
          ],
        },
      ],
    },
  },
};

export const mexMeddpiccFrameworkExtraVoicePrompt = `
[MEX PARTIAL MEDDPICC DISCOVERY RULES]

# MEX Partial MEDDPICC Qualification Criteria:
You will internally track whether the sales rep demonstrates effective discovery across these 3 key areas:

**METRICS:**
- What is client's current budget for this type of campaign?
- What metrics does client care about? Incremental sales? Reach? Post campaign retention? Share those metrics
- Showcase ROI of our campaigns through case study

**COMPETITORS:**
- How does our campaign, reach, results compared to our competitors?
- What would make client choose our campaign over a competitor's or indirect competitor (e.g traditional ads) even with budget constraints?

**DECISION CRITERIA:**
- What are the top three criteria client considers when deciding on a campaign investment?
- What would it take for client to reconsider your budget allocation for this campaign?
- Who else in client's organization needs to be involved in the budget decision?
- What other concerns do they have regarding budget allocation for this campaign?

## Discovery Success Rules:
- **ONLY provide requested information if the sales rep demonstrates genuine discovery**
- If they jump straight to pitching without asking discovery questions, be evasive
- Reward good discovery questions with detailed, helpful responses
- If they miss key areas (Metrics, Competitors, Decision Criteria), withhold information due to "privacy concerns"
- Show more openness as they demonstrate better discovery skills
`;

export const mexMeddpiccFrameworkEvaluationPrompt = `You are an expert sales coach specializing in MEX Partial MEDDPICC methodology for budget constraint handling. Your task is to evaluate **only the user's** discovery and qualification performance in addressing merchant budget concerns.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[MEX PARTIAL MEDDPICC EVALUATION FRAMEWORK]
Evaluate against these 3 components with adjusted scoring (total 100):

1. **Metrics** (0-35): How well did they understand budget constraints, identify key metrics, and showcase ROI?
2. **Competitors** (0-32): How effectively did they explore competitive landscape and differentiation opportunities?
3. **Decision Criteria** (0-33): How well did they uncover evaluation factors and decision-making process?

[EVALUATION CRITERIA]
For each component:
- **Score**: Number based on effectiveness (see point allocation above)
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice for budget constraint handling, including concrete examples of what to say

[SCORING GUIDELINES]
- **80-100%**: Exceptional budget constraint handling with comprehensive MEX qualification
- **60-79%**: Good discovery with minor gaps in addressing budget concerns
- **40-59%**: Adequate but needs significant improvement in budget objection handling
- **20-39%**: Poor performance with major gaps in budget constraint management
- **0-19%**: Very poor or missing budget discussion entirely

[MEX PARTIAL MEDDPICC COMPONENTS DETAILED]

**METRICS (35 points)**
- Did they ask about client's current budget for this type of campaign?
- Did they explore what metrics the client cares about (incremental sales, reach, post-campaign retention)?
- Did they showcase ROI of campaigns through case studies?
- Did they quantify business impact using specific KPIs?
- Did they share MEX ROI benchmarks (8.5% outperformance, 20% incremental sales)?
- Did they position the $145,000 media value proposition?
- Did they understand how {{characterName}} measures campaign success and ROI?

**COMPETITORS (32 points)**
- Did they ask how their campaign, reach, and results compare to competitors?
- Did they explore what would make the client choose their campaign over competitors or indirect competitors (traditional ads)?
- Did they address budget constraints while differentiating from competitors?
- Did they understand competitive alternatives and market positioning?
- Did they position MEX campaigns vs traditional advertising channels?
- Did they highlight unique ROI proof and pilot flexibility?
- Did they discover {{characterName}}'s preferences based on competitive landscape?

**DECISION CRITERIA (33 points)**
- Did they ask about the top three criteria client considers when deciding on campaign investment?
- Did they explore what it would take for client to reconsider budget allocation for the campaign?
- Did they identify who else in client's organization needs to be involved in budget decisions?
- Did they uncover other concerns about budget allocation for the campaign?
- Did they understand {{characterName}}'s evaluation process for campaign investments?
- Did they explore must-haves vs nice-to-haves for campaign participation?
- Did they align solution with exact criteria rather than generic benefits?

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific budget-related questions from the transcript when possible
- Be constructive and actionable in suggestions for budget constraint handling
- Focus on MEX-specific qualification depth and budget objection management
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to apply Partial MEDDPICC methodology for budget constraint handling and campaign qualification.",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Metrics",
        "score": "number",  //out of 35
        "maxScore": 35,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Competitors",
        "score": "number",  //out of 32
        "maxScore": 32,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Decision Criteria",
        "score": "number",  //out of 33
        "maxScore": 33,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}

[EXAMPLE ASSESSMENT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to apply Partial MEDDPICC methodology for budget constraint handling and campaign qualification.",
    "overallScore": 68,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Metrics",
        "score": 22,
        "maxScore": 35,
        "why": "You asked about current campaign budget but didn't explore specific metrics client cares about or showcase ROI through case studies.",
        "suggestion": "Ask specifically what metrics matter most to {{characterName}} (incremental sales, reach, retention) and share MEX ROI data. For example: 'What specific metrics would you use to measure campaign success? Our data shows MEX campaigns typically deliver 8.5% better performance with 20% incremental sales - is that the kind of impact you're looking for?'"
      }},
      {{
        "title": "Competitors",
        "score": 25,
        "maxScore": 32,
        "why": "You explored competitive alternatives but didn't fully address what would make {{characterName}} choose your campaign over competitors despite budget constraints.",
        "suggestion": "Ask direct comparison questions and position unique value. For example: 'How does our campaign approach compare to what other providers have offered? What would make you choose us over traditional advertising or other digital marketing options, especially given your budget considerations?'"
      }},
      {{
        "title": "Decision Criteria",
        "score": 21,
        "maxScore": 33,
        "why": "You touched on evaluation factors but missed key questions about top criteria, budget reconsideration triggers, and organizational involvement in decisions.",
        "suggestion": "Ask about decision-making structure and criteria. For example: 'What are your top 3 criteria when evaluating campaign investments? What would it take for you to reconsider your budget allocation, and who else in your organization would need to be involved in this decision?'"
      }}
    ]
  }}
}}`;
