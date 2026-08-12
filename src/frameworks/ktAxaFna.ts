import { FrameworkConfiguration } from './types.js';

export const ktAxaFNAEvaluationPrompt = `You are an expert sales coach specializing in financial needs analysis conversations for life insurance and critical illness products. Your task is to evaluate **only the user's** sales technique performance.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[KT-AXA FNA EVALUATION FRAMEWORK]
Evaluate against these 4 components, each scored out of 25:

1. **Communication Skills** (0-25): How effectively did they communicate with clarity, professionalism, and respect throughout the conversation?
2. **Adaptability** (0-25): How well did they adapt their approach based on {{characterName}}'s responses, showing flexibility in addressing changing concerns and situations?
3. **Customer Orientation** (0-25): How well did they focus on {{characterName}}'s needs, satisfaction, and providing service rather than just selling?
4. **Fact Finding** (0-25): How thoroughly did they gather key client information including Name, Age, Occupation, Annual Income, Financial Situation, and Financial Objectives through appropriate questioning?

[EVALUATION CRITERIA]
For each component:
- **Score**: Number out of 25 based on effectiveness
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
- **20-25 (80-100%)**: Exceptional performance, minimal room for improvement
- **15-19 (60-79%)**: Good performance with minor gaps to address
- **10-14 (40-59%)**: Adequate but needs significant improvement
- **5-9 (20-39%)**: Poor performance with major gaps identified
- **0-4 (0-19%)**: Very poor or missing entirely

[FNA COMPONENTS DETAILED]

**COMMUNICATION SKILLS (25 points)**
- Did they speak clearly and professionally?
- Did they maintain a respectful and warm tone throughout?
- Did they listen actively and respond appropriately?
- Did they explain concepts in an understandable way?

**ADAPTABILITY (25 points)**
- Did they adjust their approach based on {{characterName}}'s reactions?
- Did they handle objections or concerns with flexibility?
- Did they modify their pace or style to match {{characterName}}'s needs?
- Did they recover well from any misunderstandings or challenges?

**CUSTOMER ORIENTATION (25 points)**
- Did they prioritize {{characterName}}'s needs over making a sale?
- Did they show genuine interest in {{characterName}}'s situation?
- Did they focus on providing value and solutions?
- Did they build trust and rapport throughout the conversation?

**FACT FINDING (25 points)**
- Did they ask about {{characterName}}'s name and personal details?
- Did they inquire about age, family situation, and life stage?
- Did they explore occupation and income information?
- Did they understand financial objectives, priorities, and concerns?
- Did they ask about existing insurance coverage and gaps?

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on sales impact and customer engagement
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to conduct effective financial needs analysis conversations with prospects interested in life insurance and critical illness coverage.",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Communication Skills",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Adaptability",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Customer Orientation",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Fact Finding",
        "score": "number",  //out of 25
        "maxScore": 25,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}`;

/**
 * KT-AXA Financial Needs Analysis Framework
 * Used for evaluating FNA conversations with prospects interested in Life Ready + CI 123
 */
export const ktAxaFNAConfiguration: FrameworkConfiguration = {
  base: {
    id: 'kt-axa-fna-framework',
    friendlyId: 'kt-axa-fna',
    type: 'list',
  },

  localized: {
    en: {
      title: 'KT-AXA Financial Needs Analysis Framework',
      description:
        'Framework for evaluating sales technique and product knowledge during financial needs analysis conversations with prospects interested in Life Ready and CI 123 Critical Illness coverage.',
      parts: [
        {
          title: 'Sales Technique',
          description:
            'Evaluates communication and sales abilities during financial needs discussions',
          items: [
            'Communication Skills: Clear delivery and respectful communication',
            'Adaptability: Flexibility in addressing changing concerns and situations',
            'Customer Orientation: Focus on customer needs, satisfaction, and providing value',
            'Fact Finding: Gather key client information including Name, Age, Occupation, Income, Financial Situation, and Financial Objectives',
          ],
        },
        {
          title: 'Product Knowledge',
          description:
            'Evaluates understanding of Life Ready and CI 123 products and ability to match solutions to client needs',
          items: [
            'Product Pitch: Understanding of Life Ready and CI 123 features and benefits, and providing a product solution aligned with the customer profile and financial needs',
          ],
        },
      ],
    },

    th: {
      title: 'กรอบการวิเคราะห์ความต้องการทางการเงิน KT-AXA',
      description:
        'กรอบสำหรับประเมินเทคนิคการขายและความรู้ผลิตภัณฑ์ในการสนทนาวิเคราะห์ความต้องการทางการเงินกับลูกค้าที่สนใจ Life Ready และ CI 123 ความคุ้มครองโรคร้ายแรง',
      parts: [
        {
          title: 'เทคนิคการขาย',
          description:
            'ประเมินความสามารถในการสื่อสารและการขายในการพูดคุยเรื่องความต้องการทางการเงิน',
          items: [
            'ทักษะการสื่อสาร: การนำเสนอที่ชัดเจนและการสื่อสารที่สุภาพ',
            'ความสามารถในการปรับตัว: ความยืดหยุ่นในการตอบสนองต่อความกังวลและสถานการณ์ที่เปลี่ยนแปลง',
            'การมุ่งเน้นลูกค้า: มุ่งเน้นความต้องการของลูกค้า ความพึงพอใจ และการให้คุณค่า',
            'การค้นหาข้อมูล: รวบรวมข้อมูลลูกค้าที่สำคัญ รวมถึงชื่อ อายุ อาชีพ รายได้ สถานการณ์ทางการเงิน และวัตถุประสงค์ทางการเงิน',
          ],
        },
        {
          title: 'ความรู้ผลิตภัณฑ์',
          description:
            'ประเมินความเข้าใจในผลิตภัณฑ์ Life Ready และ CI 123 และความสามารถในการเสนอโซลูชันที่ตรงกับความต้องการของลูกค้า',
          items: [
            'การนำเสนอผลิตภัณฑ์: ความเข้าใจในคุณสมบัติและสิทธิประโยชน์ของ Life Ready และ CI 123 และการนำเสนอโซลูชันที่สอดคล้องกับโปรไฟล์และความต้องการทางการเงินของลูกค้า',
          ],
        },
      ],
    },
  },
};
