import { SalesFramework } from '../../frameworks/types.js';

// Helper function to get framework-specific example assessment
function getHSBCExampleAssessment(
  framework: string,
  characterName: string,
): string {
  switch (framework) {
    case SalesFramework.HSBC_CLIENT_UPGRADE_ADVISORY_MODEL:
      return `{{
  "communicationAndPresence": {{
    "description": "Measures how well company best-practice processes are followed to drive a successful conversation.",
    "overallScore": 70,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Greeting & Context Setting",
        "score": 18,
        "maxScore": 25,
        "strengths": [
          "Warmly welcomed ${characterName} and acknowledged their loyalty to HSBC",
          "Asked about current life priorities and upcoming financial goals"
        ],
        "toImprove": [
          {{  
            "text": "You opened the call professionally but didn't acknowledge ${characterName}'s recent achievements with the bank. Start by recognizing their milestone: 'Congratulations on reaching Premier status with us, ${characterName}! Your account has grown significantly over the past year, and we really value your continued trust in HSBC.' This sets a positive tone and makes them feel valued right from the start.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You asked about general plans but missed probing into upcoming life events that could impact financial needs. Try asking: 'Looking ahead to the next 12-18 months, are there any major life events coming up—perhaps a child's education, property purchase, or retirement planning—that we should factor into your financial strategy?' This helps uncover planning opportunities and shows you're thinking long-term with them.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Introduction to New Status & Offerings",
        "score": 15,
        "maxScore": 25,
        "strengths": [
          "Mentioned new investment opportunities available to ${characterName}"
        ],
        "toImprove": [
          {{
            "text": "You listed available products but didn't frame them as recognition of ${characterName}'s success. Instead, position it as: 'Because you've achieved Premier status, you now have access to exclusive investment opportunities that aren't available to regular customers. This is our way of recognizing your financial success and offering you tools to grow your wealth even further.' This makes the offerings feel like rewards rather than sales pitches.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You mentioned new offerings generally without connecting them to ${characterName}'s specific goals mentioned earlier. Bridge the gap by saying: 'Earlier you mentioned wanting to build your retirement fund and protect your family's future. These new Premier investment solutions are specifically designed to help clients like you achieve exactly those goals—let me show you how they align with what you're trying to accomplish.' This creates relevance and shows you were listening.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You jumped directly into presenting products without first understanding ${characterName}'s current needs and priorities, which violates HSBC's process flow.",
            "status": "error",
            "correction": "Always follow HSBC's consultative process: First, establish context by acknowledging their status and recent journey with the bank. Second, explore their current financial situation, goals, and any changes since your last interaction. Third, understand their priorities by asking 'What's most important to you financially right now?' Only after gathering this context should you introduce relevant offerings that directly address their stated needs. For example: 'Based on what you've shared about wanting to grow your retirement savings while protecting your family, let me show you two solutions that could help...'"
          }}
        ]
      }},
      {{
        "title": "Client Information Update",
        "score": 17,
        "maxScore": 25,
        "strengths": [
          "Asked ${characterName} to confirm their contact details and employment status",
          "Explained that updated information helps provide better service"
        ],
        "toImprove": [
          {{
            "text": "You requested information updates but didn't clearly explain the specific value to ${characterName}. Frame it as a benefit: 'Let me update a few details to ensure we're providing recommendations that fit your current situation perfectly. This also ensures you receive important account notifications and that we can reach you promptly if opportunities arise that match your investment profile.' This helps ${characterName} see it as value-added rather than administrative.",
            "status": "warning",
            "correction": null
          }},
          {{
            "text": "You asked questions in a checklist manner without showing genuine interest in changes. Make it conversational: 'I see your occupation was listed as Marketing Manager when we last spoke. Are you still with the same company, or have there been any career changes? Sometimes promotions or job changes impact financial priorities, so I want to make sure we're aligned with where you are now.' This turns data collection into relationship building.",
            "status": "warning",
            "correction": null
          }}
        ]
      }},
      {{
        "title": "Call to Action",
        "score": 20,
        "maxScore": 25,
        "strengths": [
          "Proposed a follow-up meeting to discuss investment details",
          "Summarized key points before moving to next steps"
        ],
        "toImprove": [
          {{
            "text": "Your next steps could be more specific. Be action-oriented: 'Here's what I propose: I'll prepare a detailed proposal showing how the Premier Wealth Growth Fund can help you reach your retirement goal of 10 million baht. I'll email this to you by Friday. Then let's schedule a 30-minute call next Tuesday at 2pm to review it together and address any questions. Does that work for your schedule?' This creates commitment and clear expectations.",
            "status": "warning",
            "correction": null
          }}
        ]
      }}
    ]
  }}
}}`;

    default:
      throw new Error(
        `Unknown HSBC framework for example assessment: ${framework}`,
      );
  }
}

// Communication and Presence evaluation criteria (framework-independent)
function getCommunicationCriteria(characterName: string): string {
  return `1. **Tone of Voice** (0-33 points):
   - Demonstrates confidence without arrogance
   - Maintains warm, professional demeanor throughout
   - Balances enthusiasm with authority
   - Conveys trustworthiness and credibility
   - Adapts tone to ${characterName}'s energy and communication style
   - Avoids hesitant or overly tentative language
   - Uses appropriate pacing and inflection

2. **Diction & Clarity** (0-33 points):
   - Articulates concepts clearly and concisely
   - Uses plain language, avoids unnecessary jargon
   - Structures explanations logically (context → benefit → action)
   - Translates complex financial terms into relatable examples
   - Ensures ${characterName} understands before progressing
   - Avoids filler words, vague phrases, or ambiguous statements
   - Provides specific details when discussing products or processes

3. **Engagement & Active Listening** (0-34 points):
   - Picks up on ${characterName}'s verbal cues and concerns
   - Paraphrases or reflects back key points to confirm understanding
   - Asks follow-up questions based on ${characterName}'s responses
   - Acknowledges ${characterName}'s emotions and priorities
   - Avoids interrupting or rushing through ${characterName}'s responses
   - Builds on ${characterName}'s input rather than following a script
   - Demonstrates genuine curiosity about ${characterName}'s situation`;
}

// HSBC Communication and Presence prompt function
export function getHSBCCommunicationAndPresencePrompt({
  characterName,
  language,
  evaluationFocus,
  productName,
  productInformation,
  framework,
}: {
  characterName: string;
  language?: string;
  evaluationFocus?: string;
  productName?: string;
  productInformation?: string;
  framework: string;
}) {
  const communicationCriteria = getCommunicationCriteria(characterName);

  // All frameworks use the same 3 communication dimensions
  const sectionTitles = [
    'Tone of Voice',
    'Diction & Clarity',
    'Engagement & Active Listening',
  ];
  const numSections = 3;

  let basePrompt = `You are an expert HSBC wealth management coach specializing in communication and presence evaluation. Your task is to evaluate **only the user's** communication skills and professional presence.

IMPORTANT: 
In the transcript, the user (wealth advisor) is speaking with an AI character named ${characterName} (the client). When referring to this character in your feedback, ALWAYS use "${characterName}" instead of "prospect," "customer," "AI," or any other term.
Ignore typos or mistakes in pronunciation or name formatting.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the wealth advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the client - IGNORE THESE COMPLETELY

**CLIENT PROFILE AWARENESS:**
The client profile information will be provided in the context. When making suggestions and providing example dialogues, ensure they are contextually appropriate to the client's demographics, marital status, family situation, and financial profile. Never make assumptions that contradict the client's profile.

Product: ${productName}
${evaluationFocus ? `Evaluation Focus: ${evaluationFocus}` : ''}
${productInformation ? `Product Information: ${productInformation}` : ''}

[HSBC COMMUNICATION AND PRESENCE EVALUATION]
Evaluate across 3 key communication dimensions (total 100 points):

${communicationCriteria}

[ASSESSMENT STRUCTURE]
For each dimension provide:
- **Score**: Number based on communication quality (Tone of Voice: 0-33, Diction & Clarity: 0-33, Engagement & Active Listening: 0-34)
- **Why**: Brief explanation (30-50 words) of the score, highlighting specific strengths or weaknesses observed
- **What to improve**: Actionable advice (50-80 words) with specific examples of how to enhance communication, including concrete phrases or techniques the advisor should use

[SCORING GUIDELINES]
**Per dimension:**
- **27-33/34 (80-100%)**: Excellent communication with strong professional presence
- **20-26 (60-79%)**: Good communication with minor areas to refine
- **13-19 (40-59%)**: Moderate communication with several gaps
- **0-12 (<40%)**: Poor communication with major concerns

[CRITICAL RULES]
1. ONLY analyze the wealth advisor's messages (labeled "user:")
2. Use "${characterName}" when referring to the client
3. Provide specific, actionable feedback with examples
4. Focus on communication quality, not just content accuracy
5. Be constructive but honest about communication gaps
6. Calculate overall score as sum of all dimension scores (should equal 100)

[JSON OUTPUT FORMAT]
Return ONLY valid JSON with this exact structure:
{{
  "communicationAndPresence": {{
    "description": "Measures the advisor's communication skills and professional presence",
    "overallScore": <number 0-100>,
    "maxScore": 100,
    "sections": [
      {{
        "title": "Tone of Voice",
        "score": <number 0-33>,
        "maxScore": 33,
        "why": "<brief explanation of score>",
        "whatToImprove": "<actionable advice with specific examples>"
      }},
      {{
        "title": "Diction & Clarity",
        "score": <number 0-33>,
        "maxScore": 33,
        "why": "<brief explanation of score>",
        "whatToImprove": "<actionable advice with specific examples>"
      }},
      {{
        "title": "Engagement & Active Listening",
        "score": <number 0-34>,
        "maxScore": 34,
        "why": "<brief explanation of score>",
        "whatToImprove": "<actionable advice with specific examples>"
      }}
    ]
  }}
}}`;

  let userPrompt =
    'Generate assessment based on conversation transcript and HSBC Communication and Presence criteria.';
  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE - CRITICAL REQUIREMENT]
⚠️ MANDATORY: The ENTIRE assessment INCLUDING the JSON response structure MUST be in ${language} language.

**JSON Response Structure Requirements:**
1. ALL "title" field values in the sections array MUST be in ${language}
   - For Cantonese: Use "語調" NOT "Tone of Voice"
   - For Cantonese: Use "措辭同清晰度" NOT "Diction & Clarity"
   - For Cantonese: Use "參與同主動聆聽" NOT "Engagement & Active Listening"

2. ALL "why" explanations MUST be written entirely in ${language}

3. ALL "whatToImprove" recommendations MUST be written entirely in ${language}

4. The "description" field MUST be in ${language}

5. Use ${language} equivalents for all technical terms

**VERIFICATION CHECKLIST:**
- ✓ Section titles in JSON are in ${language}
- ✓ All "why" fields contain only ${language} text
- ✓ All "whatToImprove" fields contain only ${language} text
- ✓ Description field is in ${language}
- ✓ No English text appears anywhere in the assessment`;
  }

  return {
    format: async (params: any) => `${basePrompt}

Call Type: ${params.callType}
Scenario: ${params.scenario}
Objectives: ${params.objectives}
Framework: ${params.framework}
Product Info: ${params.productInfo}

Conversation Transcript:
${params.transcript}

${userPrompt}`,
  };
}
