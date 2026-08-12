import { FrameworkConfiguration } from './types.js';

export const lalamoveDriverRecruitmentEvaluationPrompt = `You are an expert coach specializing in driver recruitment for delivery and logistics platforms. Your task is to evaluate **only the user's** recruitment technique performance.

IMPORTANT: In the transcript, the user (recruiter) is speaking with an AI character named {{characterName}} (the driver). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "candidate," "AI," or any other term. Focus exclusively on the recruiter's technique.
Ignore typos or mistakes in pronunciation or name formatting.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the recruiter - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the driver - IGNORE THESE COMPLETELY

[LALAMOVE DRIVER RECRUITMENT FRAMEWORK EVALUATION]
Evaluate the recruiter's performance across 3 key dimensions with 6 total criteria:

1. **Soft Skills (0-35 points)**

   a. **Communication Skills (0-12 points)**: Clear delivery, respectful communication, good word choices not too technical.
      - Did the user explain the registration process in simple language, avoiding jargon?
      - Did they maintain a polite, patient, respectful tone even when handling objections?
      - Did they provide clear, specific, actionable instructions?
      - Did they use positive, encouraging language without being pushy?
      - Did they check for understanding at key moments?

   b. **Relationship Building (0-12 points)**: Building and maintaining rapport with the driver.
      - Did they show genuine interest, use {{characterName}}'s name, and ask about goals?
      - Did they actively listen and respond to concerns, making {{characterName}} feel heard?
      - Did they personalize the conversation rather than deliver a generic pitch?
      - Did they maintain a warm, conversational tone?
      - Did they leave a positive impression with appreciation and continued support?

   c. **Adaptability (0-11 points)**: Ability to persist through objections by asking probing questions and adjusting approach.
      - When {{characterName}} expressed hesitation, did the agent ask probing follow-up questions?
      - Did they adjust their approach when the initial strategy wasn't working?
      - Did they suggest callbacks or smaller next steps when {{characterName}} wasn't ready?
      - Did they remain persistent without being aggressive?
      - Did they respond flexibly to unexpected objections?

2. **Knowledge Skills (0-35 points)**

   a. **Problem-Solving (0-18 points)**: Ability to identify issues and find solutions, answer driver's questions.
      - Did they accurately identify {{characterName}}'s specific barriers to registration?
      - Did they provide clear, accurate, helpful answers without leaving questions unresolved?
      - When lacking an answer, did they offer to find information or escalate?
      - Did they proactively offer practical solutions or workarounds?
      - Did they handle unexpected questions confidently?

   b. **Sales & Negotiation Skills (0-17 points)**: Ability to guide and convince the driver to complete registration.
      - Did they clearly communicate benefits relevant to {{characterName}}'s situation?
      - Did they handle objections with persuasive, honest answers?
      - Did they guide the conversation step-by-step toward registration?
      - Did they use motivational techniques (urgency, earning potential, incentives)?
      - Did they close with a clear outcome (completed registration, committed time, or follow-up)?

3. **Product Knowledge (0-30 points)**

   a. **Product Knowledge (0-30 points)**: Understanding of products, benefits, promotions, and compliance.
      - Did they demonstrate thorough understanding of how Lalamove works?
      - Did they communicate current promotions and sign-up bonuses?
      - Did they accurately explain registration requirements and compliance policies?
      - Did they answer product and policy questions correctly and confidently?
      - Did they proactively share relevant product details at the right moments?

[ASSESSMENT STRUCTURE]
For each criterion provide:
- **Score**: Number based on the criterion's maximum score
- **Why**: Brief explanation of the score highlighting specific observations from the transcript
- **Suggestion**: Concrete, actionable improvement advice with specific examples or scripts

[SCORING GUIDELINES]
- **80-100% of max**: Excellent performance with strong recruitment technique
- **60-79% of max**: Good performance with minor areas to refine
- **40-59% of max**: Moderate performance with several important gaps
- **Below 40% of max**: Poor performance with major recruitment technique concerns

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on recruitment impact and driver engagement
- Calculate overall score as sum of all criterion scores (out of 100)

[STRICT JSON OUTPUT FORMAT]
Return ONLY valid JSON with this exact structure:
{{
  "salesTechnique": {{
    "description": "Measures the recruiter's ability to apply the Lalamove Driver Recruitment Framework to successfully recruit and onboard drivers.",
    "overallScore": <number 0-100>,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Communication Skills",
        "score": <number 0-12>,
        "maxScore": 12,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }},
      {{
        "title": "Relationship Building",
        "score": <number 0-12>,
        "maxScore": 12,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }},
      {{
        "title": "Adaptability",
        "score": <number 0-11>,
        "maxScore": 11,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }},
      {{
        "title": "Problem-Solving",
        "score": <number 0-18>,
        "maxScore": 18,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }},
      {{
        "title": "Sales & Negotiation Skills",
        "score": <number 0-17>,
        "maxScore": 17,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }},
      {{
        "title": "Product Knowledge",
        "score": <number 0-30>,
        "maxScore": 30,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }}
    ]
  }}
}}`;

export const lalamoveDriverRecruitmentConfiguration: FrameworkConfiguration = {
  base: {
    id: 'lalamove-driver-recruitment',
    friendlyId: 'lalamove-driver-recruitment',
    type: 'list',
  },

  localized: {
    en: {
      title: 'Lalamove Driver Recruitment Framework',
      description:
        'Evaluation framework for Lalamove driver recruitment conversations, assessing soft skills, knowledge skills, and product knowledge.',
      parts: [
        {
          title: 'Soft Skills',
          description:
            'Evaluates communication, relationship building, and adaptability in driver recruitment conversations.',
          items: [
            'Communication Skills (0-12 pts): Clear delivery, respectful communication, good word choices not too technical',
            'Relationship Building (0-12 pts): Building and maintaining rapport with the driver, showing genuine interest and personalizing the conversation',
            'Adaptability (0-11 pts): Ability to persist through objections by asking probing questions and adjusting approach',
          ],
        },
        {
          title: 'Knowledge Skills',
          description:
            'Evaluates problem-solving ability and sales & negotiation skills in guiding drivers toward registration.',
          items: [
            'Problem-Solving (0-18 pts): Ability to identify issues and find solutions, answer driver questions accurately and helpfully',
            'Sales & Negotiation Skills (0-17 pts): Ability to guide and convince the driver to complete registration using persuasion and motivational techniques',
          ],
        },
        {
          title: 'Product Knowledge',
          description:
            'Evaluates understanding of Lalamove products, benefits, promotions, and compliance requirements.',
          items: [
            'Product Knowledge (0-30 pts): Understanding of how Lalamove works, current promotions, sign-up bonuses, registration requirements, and compliance policies',
          ],
        },
      ],
    },

    th: {
      title: 'กรอบการสรรหาคนขับ Lalamove',
      description:
        'กรอบการประเมินสำหรับการสนทนาสรรหาคนขับ Lalamove ประเมินซอฟต์สกิล ทักษะความรู้ และความรู้เกี่ยวกับผลิตภัณฑ์',
      parts: [
        {
          title: 'ซอฟต์สกิล',
          description:
            'ประเมินการสื่อสาร การสร้างความสัมพันธ์ และความสามารถในการปรับตัวในการสนทนาสรรหาคนขับ',
          items: [
            'ทักษะการสื่อสาร (0-12 คะแนน): การนำเสนอที่ชัดเจน การสื่อสารด้วยความเคารพ การเลือกใช้คำที่ดีไม่เป็นเทคนิคมากเกินไป',
            'การสร้างความสัมพันธ์ (0-12 คะแนน): การสร้างและรักษาความสัมพันธ์กับคนขับ แสดงความสนใจอย่างแท้จริงและปรับแต่งการสนทนา',
            'ความสามารถในการปรับตัว (0-11 คะแนน): ความสามารถในการยืนหยัดผ่านข้อโต้แย้งโดยการถามคำถามเชิงลึกและปรับแนวทาง',
          ],
        },
        {
          title: 'ทักษะความรู้',
          description:
            'ประเมินความสามารถในการแก้ปัญหาและทักษะการขายและการเจรจาในการนำคนขับไปสู่การลงทะเบียน',
          items: [
            'การแก้ปัญหา (0-18 คะแนน): ความสามารถในการระบุปัญหาและหาทางแก้ไข ตอบคำถามของคนขับอย่างถูกต้องและเป็นประโยชน์',
            'ทักษะการขายและการเจรจา (0-17 คะแนน): ความสามารถในการนำทางและโน้มน้าวคนขับให้ลงทะเบียนสำเร็จโดยใช้เทคนิคการโน้มน้าวและแรงจูงใจ',
          ],
        },
        {
          title: 'ความรู้เกี่ยวกับผลิตภัณฑ์',
          description:
            'ประเมินความเข้าใจเกี่ยวกับผลิตภัณฑ์ Lalamove สิทธิประโยชน์ โปรโมชั่น และข้อกำหนดการปฏิบัติตามกฎระเบียบ',
          items: [
            'ความรู้เกี่ยวกับผลิตภัณฑ์ (0-30 คะแนน): ความเข้าใจเกี่ยวกับวิธีการทำงานของ Lalamove โปรโมชั่นปัจจุบัน โบนัสการสมัคร ข้อกำหนดการลงทะเบียน และนโยบายการปฏิบัติตามกฎระเบียบ',
          ],
        },
      ],
    },
  },
};
