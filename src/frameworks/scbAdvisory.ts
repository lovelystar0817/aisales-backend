import { FrameworkConfiguration } from './types.js';

export const scbAdvisoryEvaluationPrompt = `You are an expert SCB wealth management advisor coach specializing in the SCB Advisory Framework. Your task is to evaluate **only the user's** advisory technique performance.

IMPORTANT:
In the transcript, the user (wealth advisor) is speaking with an AI character named {{characterName}} (the client). When referring to this character in your feedback, ALWAYS use "{{characterName}}" instead of "prospect," "customer," "AI," or any other term. Focus exclusively on the advisor's technique.
Ignore typos or mistakes in pronunciation or name formatting.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the wealth advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the client - IGNORE THESE COMPLETELY

[SCB ADVISORY FRAMEWORK EVALUATION]
Evaluate the advisor's performance across 4 key dimensions:

1. **Advisory Skills Demonstration (0-25 points)**
   - Demonstrates clear understanding of client needs through effective discovery
   - Articulates value propositions aligned with client priorities and suitability
   - Applies appropriate advisory techniques (e.g. portfolio logic, risk discussion, consolidation rationale)
   - Uses language and framing appropriate to client sophistication level

2. **Client Engagement & Objection Handling (0-25 points)**
   - Responds effectively to client objections and challenges
   - Addresses client concerns with clarity, confidence, and rationale
   - Avoids defensive, vague, or overly generic responses
   - Maintains professional tone and relationship throughout resistance moments

3. **Structure, Progression & Outcome Management (0-25 points)**
   - Conversation follows a logical advisory flow (opening → discovery → value discussion → recommendation → next steps)
   - Demonstrates ability to steer the conversation without losing client engagement
   - Clearly articulates next steps or outcomes (e.g. follow-up, proposal, consolidation ask)
   - Adjusts approach based on client reactions during the session

4. **Actionability of Coaching Insights (0-25 points)**
   - Clearly identifies strengths and development areas
   - Demonstrates improvement based on feedback and suggestions
   - Shows preparedness for real client interactions through practice

[ASSESSMENT STRUCTURE]
For each dimension provide:
- **Score**: Number out of 25 based on advisor's performance
- **Why**: Brief explanation of the score highlighting specific observations
- **Suggestion**: Concrete, actionable improvement advice with specific examples or scripts

[SCORING GUIDELINES]
- **20-25 (80-100%)**: Excellent performance with strong advisory technique
- **15-19 (60-79%)**: Good performance with minor areas to refine
- **10-14 (40-59%)**: Moderate performance with several important gaps
- **0-9 (<40%)**: Poor performance with major advisory technique concerns

[JSON OUTPUT FORMAT]
Return ONLY valid JSON with this exact structure:
{{
  "salesTechnique": {{
    "description": "Measures the advisor's SCB advisory skills and client engagement",
    "overallScore": <number 0-100>,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Advisory Skills Demonstration",
        "score": <number 0-25>,
        "maxScore": 25,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }},
      {{
        "title": "Client Engagement & Objection Handling",
        "score": <number 0-25>,
        "maxScore": 25,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }},
      {{
        "title": "Structure, Progression & Outcome Management",
        "score": <number 0-25>,
        "maxScore": 25,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }},
      {{
        "title": "Actionability of Coaching Insights",
        "score": <number 0-25>,
        "maxScore": 25,
        "why": "<brief explanation>",
        "suggestion": "<actionable advice with examples>"
      }}
    ]
  }}
}}`;

export const scbAdvisoryConfiguration: FrameworkConfiguration = {
  base: {
    id: 'scb-advisory-framework',
    friendlyId: 'scb-advisory',
    type: 'list',
  },

  localized: {
    en: {
      title: 'SCB Advisory Framework',
      description:
        'Evaluation framework for SCB advisory services simulation, assessing advisory skills, client engagement, conversation management, and coaching actionability.',
      parts: [
        {
          title: 'Advisory skills demonstration',
          description:
            'Demonstrates clear understanding of client needs through effective discovery and appropriate advisory techniques.',
          items: [
            'Demonstrates clear understanding of client needs through effective discovery',
            'Articulates value propositions aligned with client priorities and suitability',
            'Applies appropriate advisory techniques (e.g. portfolio logic, risk discussion, consolidation rationale)',
            'Uses language and framing appropriate to client sophistication level',
          ],
        },
        {
          title: 'Client engagement & objection handling',
          description:
            'Responds effectively to client objections and maintains professional tone throughout.',
          items: [
            'Responds effectively to client objections and challenges',
            'Addresses client concerns with clarity, confidence, and rationale',
            'Avoids defensive, vague, or overly generic responses',
            'Maintains professional tone and relationship throughout resistance moments',
          ],
        },
        {
          title: 'Structure, progression & outcome management',
          description:
            'Follows a logical advisory flow and clearly articulates next steps.',
          items: [
            'Conversation follows a logical advisory flow (opening \u2192 discovery \u2192 value discussion \u2192 recommendation \u2192 next steps)',
            'Demonstrates ability to steer the conversation without losing client engagement',
            'Clearly articulates next steps or outcomes (e.g. follow-up, proposal, consolidation ask)',
            'Adjusts approach based on client reactions during the session',
          ],
        },
        {
          title: 'Actionability of coaching insights',
          description:
            'Identifies strengths and development areas and improves through AI feedback.',
          items: [
            'Clearly identifies strengths and development areas after using AI demonstration tool',
            "Re-practises according to AI's feedback and suggestions and gets better score/result",
            'Gets well prepared when meeting the real client via practising with AI coaching insights',
          ],
        },
      ],
    },
  },
};
