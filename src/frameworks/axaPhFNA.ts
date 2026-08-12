import { FrameworkConfiguration } from './types.js';

export const axaPhFNAEvaluationPrompt = `You are an expert sales coach specializing in financial needs analysis conversations. Your task is to evaluate **only the user's** sales technique performance.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[AXA-PH FNA EVALUATION FRAMEWORK]
Evaluate against these 4 components, each scored out of 25:

1. **Communication Skills** (0-25): How effectively did they communicate with clarity, professionalism, and respect throughout the conversation?
2. **Adaptability** (0-25): How well did they adapt their approach based on {{characterName}}'s responses, showing flexibility in addressing changing concerns and situations?
3. **Customer Orientation** (0-25): How well did they focus on {{characterName}}'s needs, satisfaction, and providing service rather than just selling?
4. **Fact Finding** (0-25): How thoroughly did they gather key client information including Name, Age, Occupation, Annual Income, and Financial Objectives through appropriate questioning?

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
- Did they inquire about age and life stage?
- Did they explore occupation and income information?
- Did they understand financial objectives and priorities?
- Did they ask about current financial situation and concerns?

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on sales impact and customer engagement
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to conduct effective financial needs analysis conversations with first-time clients.",
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

// AXA-PH Financial Needs Analysis Framework - for sales scenario with first-time clients
export const axaPhFNAConfiguration: FrameworkConfiguration = {
  base: {
    id: 'axa-ph-fna-framework',
    friendlyId: 'axa-ph-fna',
    type: 'list',
  },

  localized: {
    // English
    en: {
      title: 'AXA-PH Financial Needs Analysis Framework',
      description:
        'Framework for evaluating sales technique and product knowledge during financial needs analysis conversations with first-time clients',
      parts: [
        // Sales Technique Section
        {
          title: 'Sales Technique',
          description:
            'Evaluates communication and sales abilities during financial needs discussions',
          items: [
            'Communication Skills: Clear delivery and respectful communication',
            'Adaptability: Flexibility in changing and understanding the concerns of the customer',
            'Customer Orientation: Focus on customer satisfaction and service',
            'Fact Finding: Ask all required information about the customer such as Name, Age, Occupation, Annual Income, and Financial Objectives',
          ],
        },
        // Product Knowledge Section
        {
          title: 'Product Knowledge',
          description:
            'Evaluates understanding of AXA Secure Future and ability to match solutions to client needs',
          items: [
            'Product Pitch: Understanding of AXA Secure Future features and benefits, and providing a product solution aligned with the customer profile',
          ],
        },
      ],
    },

    // Tagalog
    tl: {
      title: 'AXA-PH Financial Needs Analysis Framework',
      description:
        'Framework para sa pagsusuri ng sales technique at product knowledge sa mga pag-uusap ng financial needs analysis sa mga first-time clients',
      parts: [
        // Sales Technique Section
        {
          title: 'Sales Technique',
          description:
            'Sinusuri ang mga kakayahan sa komunikasyon at pagbebenta sa mga talakayan ng financial needs',
          items: [
            'Communication Skills: Malinaw na paghahatid at magalang na komunikasyon',
            'Adaptability: Kakayahang umangkop at maunawaan ang mga alalahanin ng customer',
            'Customer Orientation: Focus sa kasiyahan at serbisyo ng customer',
            'Fact Finding: Tanungin ang lahat ng kinakailangang impormasyon tungkol sa customer tulad ng Pangalan, Edad, Trabaho, Taunang Kita, at mga Financial Objectives',
          ],
        },
        // Product Knowledge Section
        {
          title: 'Product Knowledge',
          description:
            'Sinusuri ang pag-unawa sa AXA Secure Future at kakayahang itugma ang mga solusyon sa mga pangangailangan ng kliyente',
          items: [
            'Product Pitch: Pag-unawa sa mga features at benefits ng AXA Secure Future, at pagbibigay ng product solution na naaayon sa profile ng customer',
          ],
        },
      ],
    },
  },
};
