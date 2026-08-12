import { FrameworkConfiguration } from './types.js';

export const axaPhObjectionHandlingEvaluationPrompt = `You are an expert sales coach specializing in objection handling and fact-finding conversations. Your task is to evaluate **only the user's** sales technique performance.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{characterName}} (the prospect). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the salesperson's technique.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY

[AXA-PH OBJECTION HANDLING EVALUATION FRAMEWORK]
Evaluate against these 5 components:

**SOFT SKILLS (60 points total)**
1. **Relationship Building** (0-20): How effectively did they build and maintain respectful, trust-based communication throughout the conversation?
2. **Adaptability** (0-20): How well did they adapt their approach based on {{characterName}}'s responses, showing flexibility in addressing changing concerns and situations?
3. **Customer Orientation** (0-20): How well did they focus on {{characterName}}'s needs, satisfaction, and providing service rather than just selling?

**KNOWLEDGE SKILLS (40 points total)**
4. **Problem-Solving** (0-20): How effectively did they identify issues and find appropriate solutions to address {{characterName}}'s concerns about education funding, affordability, and protection?
5. **Sales & Negotiation Skills** (0-20): How well did they handle objections and negotiate effectively while maintaining a friendly, exploratory tone?

[EVALUATION CRITERIA]
For each component:
- **Score**: Number out of 20 based on effectiveness
- **Why**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
- **Suggestion**: Specific improvement recommendation with actionable advice. Including examples of correct/better responses to guide future conversations IS REQUIRED.

[SCORING GUIDELINES]
- **16-20 (80-100%)**: Exceptional performance, minimal room for improvement
- **12-15 (60-79%)**: Good performance with minor gaps to address
- **8-11 (40-59%)**: Adequate but needs significant improvement
- **4-7 (20-39%)**: Poor performance with major gaps identified
- **0-3 (0-19%)**: Very poor or missing entirely

[OBJECTION HANDLING FOCUS]
The scenario focuses on education funding and protection. Key objections to evaluate handling for:
- "I want something small - what if I can't keep up with payments?" (Affordability)
- "Is this better than a normal bank savings account?" (Guaranteed returns)
- "What if I need the money earlier?" (Early withdrawal/flexibility)
- "What if something happens before the plan matures?" (Protection)
- "Is this really guaranteed?" (Trust/guarantees)

[SOFT SKILLS DETAILED]

**RELATIONSHIP BUILDING (20 points)**
- Did they establish rapport and trust early in the conversation?
- Did they maintain a warm, respectful tone throughout?
- Did they show genuine interest in {{characterName}}'s situation and family?
- Did they create a comfortable environment for open discussion?

**ADAPTABILITY (20 points)**
- Did they adjust their approach based on {{characterName}}'s reactions?
- Did they handle objections with flexibility and understanding?
- Did they modify their pace or style to match {{characterName}}'s needs?
- Did they recover well from any misunderstandings or challenges?

**CUSTOMER ORIENTATION (20 points)**
- Did they prioritize {{characterName}}'s needs over making a sale?
- Did they show genuine interest in {{characterName}}'s education funding goals?
- Did they focus on providing value and solutions?
- Did they build trust throughout the conversation?

[KNOWLEDGE SKILLS DETAILED]

**PROBLEM-SOLVING (20 points)**
- Did they identify {{characterName}}'s core concerns effectively?
- Did they provide practical solutions for affordability concerns?
- Did they address early withdrawal and flexibility questions adequately?
- Did they find creative ways to resolve objections?

**SALES & NEGOTIATION SKILLS (20 points)**
- Did they handle objections professionally without being pushy?
- Did they present alternatives when facing resistance?
- Did they maintain a friendly, exploratory tone while negotiating?
- Did they work toward mutually beneficial outcomes?

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on objection handling impact and customer engagement
- Calculate overall score as sum of all component scores

[STRICT JSON OUTPUT FORMAT]
{{
  "salesTechnique": {{
    "description": "Measures the ability to conduct effective objection handling conversations with family-oriented clients focused on education funding.",
    "overallScore": "number", //out of 100
    "maxScore": 100,
    "sections": [
      {{
        "title": "Relationship Building",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Adaptability",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Customer Orientation",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Problem-Solving",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }},
      {{
        "title": "Sales & Negotiation Skills",
        "score": "number",  //out of 20
        "maxScore": 20,
        "why": "string",
        "suggestion": "string"
      }}
    ]
  }}
}}`;

// AXA-PH General Objection Handling Framework - for education funding and protection scenarios
export const axaPhObjectionHandlingConfiguration: FrameworkConfiguration = {
  base: {
    id: 'axa-ph-objection-handling-framework',
    friendlyId: 'axa-ph-objection-handling',
    type: 'list',
  },

  localized: {
    // English
    en: {
      title: 'AXA-PH General Objection Handling Framework',
      description:
        'Framework for evaluating soft skills and knowledge skills during objection handling conversations focused on education funding and protection',
      parts: [
        // Soft Skills Section
        {
          title: 'Soft Skills',
          description:
            'Evaluates interpersonal and communication abilities during objection handling',
          items: [
            'Relationship Building: Building and maintaining respectful communication',
            'Adaptability: Flexibility in changing and understanding the concerns of the customer',
            'Customer Orientation: Focus on customer satisfaction and service',
          ],
        },
        // Knowledge Skills Section
        {
          title: 'Knowledge Skills',
          description:
            'Evaluates problem-solving and negotiation abilities during objection handling',
          items: [
            'Problem-Solving: Ability to identify issues and find solutions',
            'Sales & Negotiation Skills: Ability to close deals and negotiate effectively',
          ],
        },
      ],
    },

    // Tagalog
    tl: {
      title: 'AXA-PH General Objection Handling Framework',
      description:
        'Framework para sa pagsusuri ng soft skills at knowledge skills sa mga pag-uusap ng objection handling na nakatuon sa education funding at protection',
      parts: [
        // Soft Skills Section
        {
          title: 'Soft Skills',
          description:
            'Sinusuri ang mga kakayahan sa interpersonal at komunikasyon sa panahon ng objection handling',
          items: [
            'Relationship Building: Pagbuo at pagpapanatili ng magalang na komunikasyon',
            'Adaptability: Kakayahang umangkop at maunawaan ang mga alalahanin ng customer',
            'Customer Orientation: Focus sa kasiyahan at serbisyo ng customer',
          ],
        },
        // Knowledge Skills Section
        {
          title: 'Knowledge Skills',
          description:
            'Sinusuri ang kakayahan sa paglutas ng problema at negosasyon sa panahon ng objection handling',
          items: [
            'Problem-Solving: Kakayahang tukuyin ang mga isyu at makahanap ng solusyon',
            'Sales & Negotiation Skills: Kakayahang isara ang mga deal at makipagnegosasyon nang epektibo',
          ],
        },
      ],
    },
  },
};
