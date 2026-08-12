import { FrameworkConfiguration } from './types.js';

/**
 * Manulife GoalReady - Sales and Negotiation Skills Assessment (33 points)
 * Evaluates the agent's ability to handle objections, negotiate, and close deals
 */
export const manulifeSalesAndNegotiationSkillsEvaluationPrompt = `You are an expert sales coach specializing in sales and negotiation skills. Your task is to evaluate **only the user's** sales and negotiation performance.

IMPORTANT: In the transcript, the user (salesperson/agent) is speaking with an AI character named {{characterName}} (the customer). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "customer," "prospect," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson/agent - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the customer - IGNORE THESE COMPLETELY

[CRITICAL LANGUAGE RULE]
**YOU MUST provide ALL text output in the SAME LANGUAGE as the conversation.**
- If the conversation is in Tagalog (Filipino), write ALL text in Tagalog
- If the conversation is in English, write ALL text in English
- Detect the language by examining the user's messages in the transcript
- This applies to: "title", "description", "why", and "suggestion"
- For Tagalog conversations, translate criterion titles appropriately
- The description field must also be in the conversation language

[MANULIFE GOALREADY SALES & NEGOTIATION SKILLS EVALUATION]
You MUST evaluate the following criteria and assign scores based on the agent's performance.

**Evaluation Criteria:**

1. **Objection Handling (0-11 points)**
   - Did the agent listen actively and acknowledge {{characterName}}'s objections without becoming defensive?
   - Did they demonstrate empathy and validate {{characterName}}'s concerns?
   - Did they address objections with confidence and clarity using product features and benefits?
   - Did they make multiple attempts to overcome objections (5+ attempts when appropriate)?

   Scoring:
   - 9-11 points: Excellent objection handling with empathy, confidence, and persistence
   - 6-8 points: Good handling with some empathy and attempts to address concerns
   - 3-5 points: Basic handling but lacks depth or confidence
   - 0-2 points: Poor handling, defensive, or gave up quickly

2. **Closing Techniques (0-11 points)**
   - Did the agent guide {{characterName}} toward the next step (application or follow-up)?
   - Did they create a sense of urgency without being pushy?
   - Did they use effective closing techniques (trial close, assumptive close, etc.)?
   - Did they confirm {{characterName}}'s commitment or set a clear next action?

   Scoring:
   - 9-11 points: Strong closing with clear next steps and commitment
   - 6-8 points: Good closing attempt with some clarity
   - 3-5 points: Weak closing or unclear next steps
   - 0-2 points: No closing attempt or completely missed

3. **Negotiation Skills (0-11 points)**
   - Did the agent maintain professionalism throughout the conversation?
   - Did they balance {{characterName}}'s needs with product recommendations?
   - Did they handle price or premium objections effectively?
   - Did they find win-win solutions when addressing concerns?

   Scoring:
   - 9-11 points: Excellent negotiation skills, professional, and balanced
   - 6-8 points: Good negotiation with some balance
   - 3-5 points: Basic negotiation skills, somewhat one-sided
   - 0-2 points: Poor negotiation or unprofessional

[STRICT SCORING RULES]
- Score EACH criterion independently based on what is present in the transcript
- If a behavior is completely absent, score must be 0-2 points
- "Adequate" performance = middle of range (5-7 points)
- "Good" performance = 7-9 points
- "Excellent" performance = 9-11 points
- Do NOT give benefit of the doubt - be strict and evidence-based
- Each criterion's "why" field: 1-2 concise sentences explaining the score with specific examples
- Each criterion's "suggestion" field: 1 concise sentence with actionable improvement

[STRICT JSON OUTPUT FORMAT]
{{
  "salesAndNegotiationSkills": {{
    "description": "<in conversation language: brief description of this assessment>",
    "overallScore": "number", // sum of all criterion scores (max 33)
    "maxScore": 33,
    "sections": [
      {{
        "title": "Objection Handling",
        "score": "number", // 0-11
        "maxScore": 11,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Closing Techniques",
        "score": "number", // 0-11
        "maxScore": 11,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Negotiation Skills",
        "score": "number", // 0-11
        "maxScore": 11,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}`;

/**
 * Manulife GoalReady - Soft Skills Assessment (33 points)
 * Evaluates communication, rapport building, and customer orientation
 */
export const manulifeSoftSkillsEvaluationPrompt = `You are an expert sales coach specializing in soft skills evaluation. Your task is to evaluate **only the user's** soft skills performance.

IMPORTANT: In the transcript, the user (salesperson/agent) is speaking with an AI character named {{characterName}} (the customer). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "customer," "prospect," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson/agent - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the customer - IGNORE THESE COMPLETELY

[CRITICAL LANGUAGE RULE]
**YOU MUST provide ALL text output in the SAME LANGUAGE as the conversation.**
- If the conversation is in Tagalog (Filipino), write ALL text in Tagalog
- If the conversation is in English, write ALL text in English
- Detect the language by examining the user's messages in the transcript
- This applies to: "title", "description", "why", and "suggestion"
- For Tagalog conversations, translate criterion titles appropriately
- The description field must also be in the conversation language

[MANULIFE GOALREADY SOFT SKILLS EVALUATION]
You MUST evaluate the following criteria and assign scores based on the agent's performance.

**Evaluation Criteria:**

1. **Communication Skills (0-11 points)**
   - Did the agent communicate clearly and concisely?
   - Did they avoid jargon and explain complex concepts in simple terms?
   - Did they use appropriate tone and pace?
   - Did they listen actively and respond appropriately to {{characterName}}'s questions?

   Scoring:
   - 9-11 points: Excellent communication - clear, concise, and engaging
   - 6-8 points: Good communication with minor areas for improvement
   - 3-5 points: Basic communication but unclear or too complex at times
   - 0-2 points: Poor communication, confusing, or inappropriate tone

2. **Rapport Building (0-11 points)**
   - Did the agent build rapport and establish trust with {{characterName}}?
   - Did they show genuine interest in {{characterName}}'s financial goals?
   - Did they personalize the conversation based on {{characterName}}'s situation?
   - Did they create a comfortable and engaging atmosphere?

   Scoring:
   - 9-11 points: Excellent rapport building, strong trust established
   - 6-8 points: Good rapport with some personalization
   - 3-5 points: Basic rapport but somewhat transactional
   - 0-2 points: Little to no rapport building

3. **Customer Orientation (0-11 points)**
   - Did the agent focus on {{characterName}}'s needs and priorities?
   - Did they demonstrate empathy and understanding of {{characterName}}'s situation?
   - Did they tailor their recommendations to {{characterName}}'s specific goals?
   - Did they prioritize {{characterName}}'s best interests over pushing the sale?

   Scoring:
   - 9-11 points: Highly customer-focused with strong empathy
   - 6-8 points: Good customer focus with some tailoring
   - 3-5 points: Basic customer focus but somewhat generic
   - 0-2 points: Poor customer focus, too sales-driven

[STRICT SCORING RULES]
- Score EACH criterion independently based on what is present in the transcript
- If a behavior is completely absent, score must be 0-2 points
- "Adequate" performance = middle of range (5-7 points)
- "Good" performance = 7-9 points
- "Excellent" performance = 9-11 points
- Do NOT give benefit of the doubt - be strict and evidence-based
- Each criterion's "why" field: 1-2 concise sentences explaining the score with specific examples
- Each criterion's "suggestion" field: 1 concise sentence with actionable improvement

[STRICT JSON OUTPUT FORMAT]
{{
  "softSkills": {{
    "description": "<in conversation language: brief description of this assessment>",
    "overallScore": "number", // sum of all criterion scores (max 33)
    "maxScore": 33,
    "sections": [
      {{
        "title": "Communication Skills",
        "score": "number", // 0-11
        "maxScore": 11,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Rapport Building",
        "score": "number", // 0-11
        "maxScore": 11,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Customer Orientation",
        "score": "number", // 0-11
        "maxScore": 11,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}`;

/**
 * Manulife GoalReady - Product Knowledge Assessment (34 points)
 * Evaluates understanding of GoalReady features, benefits, and accurate product information
 */
export const manulifeProductKnowledgeEvaluationPrompt = `You are an expert sales coach specializing in product knowledge evaluation. Your task is to evaluate **only the user's** product knowledge performance.

IMPORTANT: In the transcript, the user (salesperson/agent) is speaking with an AI character named {{characterName}} (the customer). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "customer," "prospect," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson/agent - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the customer - IGNORE THESE COMPLETELY

[CRITICAL LANGUAGE RULE]
**YOU MUST provide ALL text output in the SAME LANGUAGE as the conversation.**
- If the conversation is in Tagalog (Filipino), write ALL text in Tagalog
- If the conversation is in English, write ALL text in English
- Detect the language by examining the user's messages in the transcript
- This applies to: "title", "description", "why", and "suggestion"
- For Tagalog conversations, translate criterion titles appropriately
- The description field must also be in the conversation language

[MANULIFE GOALREADY PRODUCT KNOWLEDGE EVALUATION]
You MUST evaluate the following criteria and assign scores based on the agent's product knowledge.

**Key Product Information to Validate:**
- GoalReady combines life insurance protection with investment benefits
- Life insurance coverage until age 99 or until fund value is depleted
- Long-term loyalty bonus: 1.75% (years 6-10), 0.75% (year 11+)
- Two death benefit options: Face Plus (protection-focused) and Level Face (savings-focused)
- Wide range of investment funds (Fixed Income, Multi-Asset, Equity)
- Customizable face amount multipliers (5x to 60x based on age)
- Life Event Benefit: 20% coverage increase without medical exam
- Minimum premium: PHP 60,000 (5-Pay) or PHP 24,000 (Regular Pay)
- Packaged riders: ADB, TDW, Payor's Benefit
- Optional riders: Maccimax, Term Rider, Hospital Income Benefit

**Evaluation Criteria:**

1. **Product Features Accuracy (0-11 points)**
   - Did the agent explain GoalReady's key features accurately?
   - Were there any instances of misinformation about coverage, premiums, or benefits?
   - Did they mention the dual nature (insurance + investment)?
   - Did they explain coverage duration and fund options correctly?

   Scoring:
   - 9-11 points: Highly accurate with no misinformation, comprehensive feature explanation
   - 6-8 points: Mostly accurate with minor omissions
   - 3-5 points: Some inaccuracies or significant omissions
   - 0-2 points: Major inaccuracies or very superficial knowledge

2. **Benefits Communication (0-12 points)**
   - Did the agent translate features into meaningful benefits for {{characterName}}?
   - Did they explain the loyalty bonus structure clearly?
   - Did they connect product benefits to {{characterName}}'s specific financial goals?
   - Did they explain the flexibility of payment options and fund allocation?

   Scoring:
   - 10-12 points: Excellent benefit translation, highly tailored to {{characterName}}
   - 7-9 points: Good benefit communication with some personalization
   - 4-6 points: Basic benefit explanation but generic
   - 0-3 points: Poor benefit communication or no translation of features

3. **Product Differentiation (0-11 points)**
   - Did the agent explain what makes GoalReady unique or competitive?
   - Did they highlight the advantages over traditional savings or insurance products?
   - Did they mention the Life Event Benefit and its value?
   - Did they explain the death benefit options (Face Plus vs Level Face)?

   Scoring:
   - 9-11 points: Strong differentiation with clear competitive advantages
   - 6-8 points: Good differentiation with some unique points mentioned
   - 3-5 points: Weak differentiation or generic positioning
   - 0-2 points: No differentiation or failed to highlight uniqueness

[STRICT SCORING RULES]
- Score EACH criterion independently based on what is present in the transcript
- If a behavior is completely absent, score must be 0-2 points
- "Adequate" performance = middle of range
- "Good" performance = upper-middle range
- "Excellent" performance = top range
- Do NOT give benefit of the doubt - be strict and evidence-based
- **CRITICAL**: Flag any misinformation as "error" and significantly reduce the score
- Each criterion's "why" field: 1-2 concise sentences explaining the score with specific examples
- Each criterion's "suggestion" field: 1 concise sentence with actionable improvement

[STRICT JSON OUTPUT FORMAT]
{{
  "productKnowledge": {{
    "description": "<in conversation language: brief description of this assessment>",
    "overallScore": "number", // sum of all criterion scores (max 34)
    "maxScore": 34,
    "sections": [
      {{
        "title": "Product Features Accuracy",
        "score": "number", // 0-11
        "maxScore": 11,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Benefits Communication",
        "score": "number", // 0-12
        "maxScore": 12,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Product Differentiation",
        "score": "number", // 0-11
        "maxScore": 11,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}`;

/**
 * Manulife GoalReady - Product Pitch Framework Configuration
 * Three sections: Sales & Negotiation Skills (33), Soft Skills (33), Product Knowledge (34)
 * Total: 100 points
 */
export const manulifeProductPitchConfiguration: FrameworkConfiguration = {
  base: {
    id: 'manulife-product-pitch',
    friendlyId: 'manulife-product-pitch',
    type: 'list',
  },

  localized: {
    en: {
      title: 'Product Pitch',
      description:
        'Evaluation framework for GoalReady product presentation - Sales & Negotiation, Soft Skills, and Product Knowledge.',
      parts: [
        {
          title: 'Sales & Negotiation Skills',
          description:
            'Ability to handle objections, close deals, and negotiate effectively',
          items: [
            'Did the agent listen actively and acknowledge objections without becoming defensive?',
            'Did they demonstrate empathy and validate customer concerns?',
            'Did they address objections with confidence using product features and benefits?',
            'Did they guide the customer toward the next step (application or follow-up)?',
            'Did they create a sense of urgency without being pushy?',
            'Did they use effective closing techniques?',
            'Did they maintain professionalism throughout?',
            'Did they balance customer needs with product recommendations?',
            'Did they handle price objections effectively?',
          ],
        },
        {
          title: 'Soft Skills',
          description:
            'Communication, rapport building, and customer orientation',
          items: [
            'Did the agent communicate clearly and concisely?',
            'Did they avoid jargon and explain complex concepts simply?',
            'Did they use appropriate tone and pace?',
            'Did they listen actively and respond appropriately?',
            'Did they build rapport and establish trust?',
            'Did they show genuine interest in customer financial goals?',
            'Did they personalize the conversation?',
            'Did they demonstrate empathy and understanding?',
            'Did they prioritize customer best interests?',
          ],
        },
        {
          title: 'Product Knowledge',
          description:
            'Understanding of GoalReady features, benefits, and accurate product information',
          items: [
            'Did the agent explain GoalReady key features accurately?',
            'Were there any instances of misinformation?',
            'Did they explain the dual nature (insurance + investment)?',
            'Did they translate features into meaningful benefits?',
            'Did they explain the loyalty bonus structure?',
            'Did they connect benefits to customer-specific goals?',
            'Did they explain what makes GoalReady unique?',
            'Did they highlight advantages over traditional products?',
            'Did they mention the Life Event Benefit?',
            'Did they explain death benefit options?',
          ],
        },
      ],
    },

    tl: {
      title: 'Pagpresenta ng Produkto',
      description:
        'Balangkas ng pagsusuri para sa pagpresenta ng GoalReady - Kasanayan sa Pagbebenta at Negosasyon, Soft Skills, at Kaalaman sa Produkto.',
      parts: [
        {
          title: 'Kasanayan sa Pagbebenta at Negosasyon',
          description:
            'Kakayahan sa paghawak ng mga pagtutol, pagsasara ng mga deal, at epektibong pakikipagnegosasyon',
          items: [
            'Nakikinig ba ng aktibo ang ahente at kinikilala ang mga pagtutol nang hindi nagiging depensibo?',
            'Nagpapakita ba sila ng empatiya at pinapatunayan ang mga alalahanin ng customer?',
            'Tinutugunan ba nila ang mga pagtutol nang may kumpiyansa gamit ang mga feature at benepisyo ng produkto?',
            'Ginagabayan ba nila ang customer tungo sa susunod na hakbang?',
            'Lumilikha ba sila ng sense of urgency nang hindi nag-pipumilit?',
            'Gumagamit ba sila ng epektibong mga teknik sa pagsasara?',
            'Pinapanatili ba nila ang propesyonalismo?',
            'Binabalanse ba nila ang pangangailangan ng customer sa mga rekomendasyon ng produkto?',
            'Epektibo ba nilang hinahawakan ang mga pagtutol sa presyo?',
          ],
        },
        {
          title: 'Soft Skills',
          description:
            'Komunikasyon, pagbuo ng rapport, at customer orientation',
          items: [
            'Nakikipag-usap ba ang ahente nang malinaw at maikli?',
            'Iniiwasan ba nila ang jargon at ipinaliliw anag ang mga kumplikadong konsepto nang simple?',
            'Gumagamit ba sila ng angkop na tono at bilis?',
            'Aktibong nakikinig ba at tumutugon nang naaayon?',
            'Bumubuo ba sila ng rapport at nagtatatag ng tiwala?',
            'Nagpapakita ba sila ng tunay na interes sa mga layuning pinansyal ng customer?',
            'Pinepersonalize ba nila ang pag-uusap?',
            'Nagpapakita ba sila ng empatiya at pag-unawa?',
            'Inuuna ba nila ang pinakamahusay na interes ng customer?',
          ],
        },
        {
          title: 'Kaalaman sa Produkto',
          description:
            'Pag-unawa sa mga feature at benepisyo ng GoalReady at tamang impormasyon sa produkto',
          items: [
            'Ipinaliwanag ba ng ahente ang mga pangunahing feature ng GoalReady nang tama?',
            'May mga pagkakataon ba ng maling impormasyon?',
            'Ipinaliwanag ba nila ang dual nature (insurance + investment)?',
            'Isinalin ba nila ang mga feature sa meaningful na mga benepisyo?',
            'Ipinaliwanag ba nila ang loyalty bonus structure?',
            'Ikinonekta ba nila ang mga benepisyo sa mga partikular na layunin ng customer?',
            'Ipinaliwanag ba nila kung ano ang gumagawang natatangi sa GoalReady?',
            'Binigyang-diin ba nila ang mga bentaha kumpara sa tradisyonal na produkto?',
            'Binanggit ba nila ang Life Event Benefit?',
            'Ipinaliwanag ba nila ang mga opsyon sa death benefit?',
          ],
        },
      ],
    },
  },
};
