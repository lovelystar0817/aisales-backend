import { FrameworkConfiguration } from './types.js';

// MTL Prospect Framework - for roles-reversed scenario where user plays prospect
export const mtlProspectConfiguration: FrameworkConfiguration = {
  base: {
    id: 'mtl-prospect-framework',
    friendlyId: 'mtl-prospect',
    type: 'list',
  },

  localized: {
    // English
    en: {
      title: 'MTL Prospect Assessment Framework',
      description:
        'Framework for evaluating prospect performance in role-play scenarios focusing on realism, needs clarity, question quality, engagement, and progression',
      parts: [
        {
          title: 'Prospect Realism',
          description:
            "How believable and consistent was the user's portrayal of a real prospect?",
          items: [
            'Portrayed authentic prospect behavior and reactions',
            'Maintained consistent character throughout the conversation',
            "Responded naturally to the agent's approach and questions",
            'Avoided breaking character or unrealistic responses',
          ],
        },
        {
          title: 'Clarity of Needs & Concerns',
          description:
            'Did the user express relevant needs, doubts, and decision factors?',
          items: [
            'Clearly articulated financial goals and priorities',
            'Expressed genuine concerns and hesitations',
            'Identified relevant decision-making factors',
            'Communicated needs in a way that helps the agent understand',
          ],
        },
        {
          title: 'Quality of Questions Asked',
          description:
            'Did the user ask meaningful questions a real prospect would ask?',
          items: [
            'Asked relevant questions about the product or service',
            'Inquired about costs, benefits, and implementation',
            'Explored concerns and sought clarifications',
            'Questions demonstrated genuine interest and engagement',
          ],
        },
        {
          title: 'Engagement & Responsiveness',
          description:
            "How well did the user respond to the agent's discovery and explanations?",
          items: [
            "Actively listened and responded to agent's questions",
            'Engaged with explanations and demonstrations',
            'Showed appropriate interest and curiosity',
            'Balanced skepticism with openness to learning',
          ],
        },
        {
          title: 'Conversation Completion',
          description:
            'Did the user help complete needs discovery and product explanation in the conversation?',
          items: [
            'Demonstrated natural progression in the conversation',
            'Showed appropriate interest when value was demonstrated',
            'Engaged fully with product explanations and discovery questions',
            'Helped the conversation reach a natural conclusion',
          ],
        },
      ],
    },

    // Thai
    th: {
      title: 'กรอบการประเมินลูกค้าเป้าหมาย MTL',
      description:
        'กรอบการทำงานสำหรับประเมินประสิทธิภาพของลูกค้าเป้าหมายในสถานการณ์บทบาทสมมติโดยเน้นความสมจริง ความชัดเจนของความต้องการ คุณภาพของคำถาม การมีส่วนร่วม และความก้าวหน้า',
      parts: [
        {
          title: 'ความสมจริงของลูกค้าเป้าหมาย',
          description:
            'การแสดงบทบาทของลูกค้าเป้าหมายจริงมีความน่าเชื่อถือและสอดคล้องกันเพียงใด?',
          items: [
            'แสดงพฤติกรรมและปฏิกิริยาของลูกค้าเป้าหมายที่แท้จริง',
            'รักษาบทบาทที่สอดคล้องกันตลอดการสนทนา',
            'ตอบสนองอย่างเป็นธรรมชาติต่อแนวทางและคำถามของตัวแทน',
            'หลีกเลี่ยงการทำลายบทบาทหรือการตอบสนองที่ไม่สมจริง',
          ],
        },
        {
          title: 'ความชัดเจนของความต้องการและความกังวล',
          description:
            'ผู้ใช้แสดงความต้องการ ข้อสงสัย และปัจจัยการตัดสินใจที่เกี่ยวข้องหรือไม่?',
          items: [
            'ระบุเป้าหมายและลำดับความสำคัญทางการเงินอย่างชัดเจน',
            'แสดงความกังวลและความลังเลอย่างแท้จริง',
            'ระบุปัจจัยการตัดสินใจที่เกี่ยวข้อง',
            'สื่อสารความต้องการในลักษณะที่ช่วยให้ตัวแทนเข้าใจ',
          ],
        },
        {
          title: 'คุณภาพของคำถามที่ถาม',
          description:
            'ผู้ใช้ถามคำถามที่มีความหมายที่ลูกค้าเป้าหมายจริงจะถามหรือไม่?',
          items: [
            'ถามคำถามที่เกี่ยวข้องเกี่ยวกับผลิตภัณฑ์หรือบริการ',
            'สอบถามเกี่ยวกับต้นทุน ประโยชน์ และการดำเนินการ',
            'สำรวจความกังวลและแสวงหาความชัดเจน',
            'คำถามแสดงความสนใจและการมีส่วนร่วมอย่างแท้จริง',
          ],
        },
        {
          title: 'การมีส่วนร่วมและการตอบสนอง',
          description:
            'ผู้ใช้ตอบสนองต่อการค้นพบและคำอธิบายของตัวแทนได้ดีเพียงใด?',
          items: [
            'ฟังอย่างกระตือรือร้นและตอบสนองต่อคำถามของตัวแทน',
            'มีส่วนร่วมกับคำอธิบายและการสาธิต',
            'แสดงความสนใจและความอยากรู้อย่างเหมาะสม',
            'สร้างสมดุลระหว่างความสงสัยกับการเปิดรับการเรียนรู้',
          ],
        },
        {
          title: 'ความสมบูรณ์ของการสนทนา',
          description:
            'ผู้ใช้ช่วยให้การค้นพบความต้องการและการอธิบายผลิตภัณฑ์เสร็จสมบูรณ์ในการสนทนาหรือไม่?',
          items: [
            'แสดงความก้าวหน้าอย่างเป็นธรรมชาติในการสนทนา',
            'แสดงความสนใจอย่างเหมาะสมเมื่อมีการแสดงคุณค่า',
            'มีส่วนร่วมอย่างเต็มที่กับการอธิบายผลิตภัณฑ์และคำถามการค้นพบ',
            'ช่วยให้การสนทนาถึงข้อสรุปที่เป็นธรรมชาติ',
          ],
        },
      ],
    },
  },
};

// Evaluation prompt for MTL Prospect Framework
export const mtlProspectFrameworkEvaluationPrompt = `You are an expert sales training coach specializing in role-play assessment. Your task is to evaluate **only the user's** performance as a prospect in this role-play scenario.

IMPORTANT: In the transcript, the user is playing the role of a PROSPECT, and an AI character named {{characterName}} is playing the role of an insurance sales agent. When referring to the AI character in your feedback, ALWAYS use "{{characterName}}" instead of "agent," "salesperson," "AI," or any other term. Focus exclusively on evaluating how well the user performed as a prospect.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the prospect (the user being evaluated) - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the sales agent ({{characterName}}) - IGNORE THESE COMPLETELY

[MTL PROSPECT ASSESSMENT FRAMEWORK EVALUATION]
Evaluate against these 5 components, each scored out of 20:

1. **Prospect Realism** (0-20): How believable and consistent was the user's portrayal of a real prospect?
2. **Clarity of Needs & Concerns** (0-20): Did the user express relevant needs, doubts, and decision factors?
3. **Quality of Questions Asked** (0-20): Did the user ask meaningful questions a real prospect would ask?
4. **Engagement & Responsiveness** (0-20): How well did the user respond to {{characterName}}'s discovery and explanations?
5. **Conversation Completion** (0-20): Did the user help complete needs discovery and product explanation in the conversation?

[EVALUATION CRITERIA]
For each component:
- **Score**: Number out of 20 based on effectiveness
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. It should not just point out how the user could improve. Including examples of correct/better responses to guide future role-plays IS REQUIRED.

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
- Focus on prospect performance and realism
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "salesTechnique": {{
    "description": "string",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Prospect Realism",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Clarity of Needs & Concerns",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Quality of Questions Asked",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Engagement & Responsiveness",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Progression Toward Next Steps",
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
    "description": "Measures the ability to authentically portray a prospect in role-play scenarios, demonstrating realistic needs, concerns, and engagement.",
    "overallScore": 65,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Prospect Realism",
        "score": 14,
        "maxScore": 20,
        "why": "You maintained a consistent cautious prospect persona and responded naturally to {{characterName}}'s questions, though some responses felt slightly scripted.",
        "suggestion": "Vary your language more naturally. Instead of 'I'm interested but cautious,' try 'Hmm, that sounds interesting, but I'm not sure if it's right for me right now.' Show more hesitation and natural pauses."
      }},
      {{
        "title": "Clarity of Needs & Concerns",
        "score": 13,
        "maxScore": 20,
        "why": "You mentioned wanting flexibility and education savings, but didn't elaborate on specific concerns about risk or commitment that a real prospect would express.",
        "suggestion": "Express concerns more specifically: 'I'm worried about locking money away if I need it for emergencies' or 'How risky is this compared to my current mutual funds?' This helps {{characterName}} address real objections."
      }},
      {{
        "title": "Quality of Questions Asked",
        "score": 12,
        "maxScore": 20,
        "why": "You asked basic questions about costs and features, but missed opportunities to probe deeper into how the product works or what happens in different scenarios.",
        "suggestion": "Ask more probing questions: 'What happens if I can't pay the premium one month?' or 'How does this compare to just putting money in a savings account?' Real prospects dig deeper before committing."
      }},
      {{
        "title": "Engagement & Responsiveness",
        "score": 13,
        "maxScore": 20,
        "why": "You responded to {{characterName}}'s questions but didn't show much engagement or curiosity when they explained features. Real prospects would show more interest.",
        "suggestion": "Show more active listening: 'Oh, that's interesting - so I can adjust payments?' or 'I see, that makes sense.' Acknowledge what {{characterName}} says before moving to your next concern."
      }},
      {{
        "title": "Progression Toward Next Steps",
        "score": 13,
        "maxScore": 20,
        "why": "You showed some interest but didn't naturally progress toward agreeing to an appointment. Real prospects would show more willingness when value is demonstrated.",
        "suggestion": "When {{characterName}} addresses your concerns well, show progression: 'Okay, that sounds reasonable. Maybe we can talk more about this?' or 'I'd be interested in seeing how this works for my situation.' Help move the conversation forward."
      }}
    ]
  }}
}}`;
