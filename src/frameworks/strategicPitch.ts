import { FrameworkConfiguration } from './types.js';

export const strategicPitchConfiguration: FrameworkConfiguration = {
  base: {
    id: 'strategic-pitch',
    friendlyId: 'strategic-pitch',
    type: 'list',
  },

  localized: {
    // English (Original)
    en: {
      title: 'Strategic Pitch',
      description: 'Strategic Pitch Framework',
      parts: [
        {
          title: 'Strategic Pitch',
          description: 'Strategic Pitch',
          items: [
            'I understand how you feel about the premium cost',
            "It's natural to be concerned about the financial commitment",
          ],
        },
      ],
    },

    // Indonesian
    id: {
      title: 'Strategic Pitch',
      description: 'Framework Strategic Pitch',
      parts: [
        {
          title: 'Strategic Pitch',
          description: 'Strategic Pitch',
          items: [
            'Saya memahami perasaan Anda tentang biaya premi',
            'Wajar untuk merasa khawatir tentang komitmen finansial',
          ],
        },
      ],
    },

    // Malaysian
    ms: {
      title: 'Strategic Pitch',
      description: 'Framework Strategic Pitch',
      parts: [
        {
          title: 'Strategic Pitch',
          description: 'Strategic Pitch',
          items: [
            'Saya faham perasaan anda tentang kos premium',
            'Wajar untuk risau tentang komitmen kewangan',
          ],
        },
      ],
    },

    // Tagalog (Filipino)
    tl: {
      title: 'Strategic Pitch',
      description: 'Framework Strategic Pitch',
      parts: [
        {
          title: 'Strategic Pitch',
          description: 'Strategic Pitch',
          items: [
            'Nauunawaan ko ang inyong nararamdaman tungkol sa premium cost',
            'Natural na maging concerned sa financial commitment',
          ],
        },
      ],
    },

    // Vietnamese
    vi: {
      title: 'Bài thuyết trình chiến lược',
      description: 'Khung công việc Bài thuyết trình chiến lược',
      parts: [
        {
          title: 'Bài thuyết trình chiến lược',
          description: 'Bài thuyết trình chiến lược',
          items: [
            'Tôi hiểu cảm nhận của bạn về chi phí cao cấp',
            'Việc lo lắng về cam kết tài chính là điều tự nhiên',
          ],
        },
      ],
    },

    // Thai
    th: {
      title: 'การนำเสนอเชิงกลยุทธ์',
      description: 'กรอบการทำงาน การนำเสนอเชิงกลยุทธ์',
      parts: [
        {
          title: 'การนำเสนอเชิงกลยุทธ์',
          description: 'การนำเสนอเชิงกลยุทธ์',
          items: [
            'ฉันเข้าใจความรู้สึกของคุณเกี่ยวกับค่าใช้จ่ายพรีเมี่ยม',
            'เป็นเรื่องปกติที่จะกังวลเกี่ยวกับภาระผูกพันทางการเงิน',
          ],
        },
      ],
    },

    // Cebuano
    ceb: {
      title: 'Strategic Pitch',
      description: 'Framework sa Strategic Pitch',
      parts: [
        {
          title: 'Strategic Pitch',
          description: 'Strategic Pitch',
          items: [
            'Nasabtan nako ang inyong gibati mahitungod sa premium cost',
            'Natural ra nga mag-alala bahin sa financial commitment',
          ],
        },
      ],
    },
  },
};

// Evaluation prompt for Strategic Pitch framework
export const strategicPitchFrameworkEvaluationPrompt = `You are an expert sales coach specializing in the Strategic Pitch Framework. Your task is to evaluate **only the user's** sales technique performance.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[STRATEGIC PITCH FRAMEWORK EVALUATION]
Evaluate against these 5 components, each scored out of 20:

1. **Problem/Opportunity** (0-20): How well did they identify and articulate the prospect's pain points or growth opportunities?
2. **Vision** (0-20): How effectively did they paint a compelling picture of the desired future state?
3. **Solution** (0-20): How clearly did they present their product/service as the bridge to that vision?
4. **Impact** (0-20): How well did they quantify and communicate the measurable value/ROI?
5. **Ask** (0-20): How clear and actionable was their call-to-action or next steps?

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
- Focus on sales impact and customer engagement
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "salesTechnique": {{
    "description": "string",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Problem / Opportunity",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Vision",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Solution",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Impact",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Ask",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }}
}}

[EXAMPLE ASSESSMENT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to apply the Strategic Pitch Framework to drive a successful conversation.",
    "overallScore": 40,
    "maxScore": 100,
    "sections": [
       {{
        "title": "Problem / Opportunity",
        "score": 8,
        "maxScore": 20,
        "why": "You didn’t articulate specific corporate spend leakage, manual claims burden, or policy control gaps that Grab For Business addresses, so the problem felt generic and not anchored in {{characterName}}’s operations.",
        "suggestion": "Ground in pains: 'How many hours on expense claims weekly?' 'Where do out‑of‑policy rides slip through?' 'What would 20% admin time saved change in your team?'"
      }},
      {{
        "title": "Vision",
        "score": 6,
        "maxScore": 20,
        "why": "You didn’t paint a concrete future with governance, SFTP HR sync, and real‑time analytics milestones, so the destination with GFB wasn’t vivid or measurable.",
        "suggestion": "Storyboard: '30 days—pilot with policy controls; 60—SFTP HR sync live; 90—real‑time reporting to Finance, admin hours down 25%. Here’s how each stakeholder wins.'"
      }},
      {{
        "title": "Solution",
        "score": 8,
        "maxScore": 20,
        "why": "You listed features without tying them to outcomes (policy enforcement → reduced leakage, SSO/SFTP → admin savings) or differentiating vs incumbents.",
        "suggestion": "Bridge explicitly: 'GFB’s policy engine + direct billing cut out‑of‑policy spend by ~18%. SFTP HR sync removes manual onboarding. Compared to X, reporting is real‑time, not weekly.'"
      }},
      {{
        "title": "Impact",
        "score": 10,
        "maxScore": 20,
        "why": "You stated benefits without baseline vs target (spend, hours, leakage) or concrete ranges, so finance justification remained weak.",
        "suggestion": "Size impact: 'Current monthly spend $X; with policy controls, expect 10–20% reduction. Claims admin 200 hrs/month → 120. Leakage 12% → <3%.' Tie to budget cycles."
      }},
      {{
        "title": "Ask",
        "score": 8,
        "maxScore": 20,
        "why": "Your CTA lacked a GFB‑specific agenda (pilot scope, integration, compliance) and outcome, so the next step didn’t feel purposeful.", 
        "suggestion": "Propose: '30‑min fit review: pilot scope, SFTP/SSO, procurement/security checklist, ROI model. Tues 2pm or Wed 11am?' Confirm attendees (Finance, HR Ops)." 
      }}
    ]
  }}
}}
`;
