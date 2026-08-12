import { SalesFramework } from '../../frameworks/types.js';

// HSBC Process Adherence prompt function
export function getHSBCProcessAdherencePrompt({
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
  // Get section titles and max scores for this framework
  let sectionTitles: string[];
  let maxScorePerSection: number;
  let numSections: number;
  let processSteps: string;

  switch (framework) {
    case SalesFramework.HSBC_CLIENT_ONBOARDING_ADVISORY_MODEL:
      sectionTitles = [
        'Greeting and context setting',
        'Introduction to HSBC wealth proposition',
        'Client profiling & onboarding',
        'Call to action & next steps',
      ];
      maxScorePerSection = 25;
      numSections = 4;
      processSteps = `1. **Greeting and context setting** (0-25 points):
   - Welcome the client and establish rapport
   - Introduce the bank's wealth management relationship model (dedicated RM, tailored advisory, digital tools)
   - Explore client background and motivations for joining the bank (career, family, financial goals)

2. **Introduction to HSBC wealth proposition** (0-25 points):
   - Overview of wealth services addressing different client needs (saving, investing, protection, planning)
   - Highlight key value propositions (holistic wealth planning, expert advisory, exclusive solutions, global access, preferential rates)
   - Introduce specific benefits:
     * Goal-based Wealth Management: Tailored investment plans aligned with life goals
     * Portfolio Diversification: Active asset allocation in equity and fixed income securities
     * Lifestyle Benefits: Premium perks like travel miles, lounge access, F&B benefits, entertainment access

3. **Client profiling & onboarding** (0-25 points):
   - Collect personal and financial details (age, occupation, family situation, income, goals)
   - Discuss overall financial position (assets, liabilities, income sources)
   - Explore product interests (deposits, investments, insurance, FX, etc.)
   - Assess risk appetite and investment experience
   - Capture necessary documentation for KYC/onboarding
   - Obtain consent & disclosures

4. **Call to action & next steps** (0-25 points):
   - Recommend initial advisory session or portfolio review
   - Align on immediate next steps (e.g., investment profiling, account setup, meeting with investment advisor)
   - Reassure the client of ongoing relationship support and access to dedicated wealth resources
   - Invitation to and securing the next meeting
   - **Bonus**: Successfully inviting the client and their partners for a next consultation in person`;
      break;

    case SalesFramework.HSBC_CLIENT_UPGRADE_ADVISORY_MODEL:
      sectionTitles = [
        'Greeting & Context Setting',
        'Introduction to New Status & Offerings',
        'Client Information Update',
        'Call to Action',
      ];
      maxScorePerSection = 25;
      numSections = 4;
      processSteps = `1. **Greeting & Context Setting** (0-25 points):
   - Greet warmly and thank ${characterName} for their growing relationship with the bank
   - Reference something personal from past interactions
   - Acknowledge their journey and show appreciation for their trust
   - Explore upcoming personal or financial priorities

2. **Introduction to New Status & Offerings** (0-25 points):
   - Position the Wealth upgrade as recognition of ${characterName}'s trust and growth
   - Clearly outline the new benefits of the Wealth status
   - Connect benefits to ${characterName}'s priorities and aspirations

3. **Client Information Update** (0-25 points):
   - Request any new or missing personal information
   - Explain that complete information helps tailor the right solutions
   - Update financial profile, goals, and preferences

4. **Call to Action** (0-25 points):
   - Recap key points and confirm mutual understanding
   - Suggest next actions (investment advisory session, etc.)
   - Reinforce the long-term partnership and ongoing support from the bank`;
      break;

    default:
      throw new Error(
        `Unknown HSBC framework for process adherence: ${framework}`,
      );
  }

  let basePrompt = `You are an expert HSBC wealth management coach specializing in process adherence evaluation. Your task is to evaluate how well the wealth advisor follows HSBC's structured process.

IMPORTANT: 
In the transcript, the user (wealth advisor) is speaking with an AI character named ${characterName} (the client). When referring to this character in your feedback, ALWAYS use "${characterName}" instead of "prospect," "customer," "AI," or any other term.
Ignore typos or mistakes in pronunciation or name formatting.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the wealth advisor - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the client - IGNORE THESE COMPLETELY

**CLIENT PROFILE AWARENESS:**
The client profile information will be provided in the context. When making suggestions and providing example dialogues, ensure they are contextually appropriate to the client's demographics, marital status, family situation, and financial profile. Never make assumptions that contradict the client's profile.

Product: ${productName || 'N/A'}
${evaluationFocus ? `Evaluation Focus: ${evaluationFocus}` : ''}
${productInformation ? `Product Information: ${productInformation}` : ''}

[HSBC PROCESS ADHERENCE EVALUATION]
Evaluate across ${numSections} key process areas, each scored out of ${maxScorePerSection} points (total 100):

${processSteps}

[ASSESSMENT STRUCTURE]
For each area provide:
- **Score**: Number out of ${maxScorePerSection} based on adherence to HSBC's process reference
- **Why**: Brief explanation (30-50 words) of the score, highlighting what the advisor did well or missed
- **Suggestion**: Actionable improvement advice (50-80 words) with specific examples or scripts of what the advisor should say or do differently

[SCORING GUIDELINES]
- **${Math.floor(maxScorePerSection * 0.8)}-${maxScorePerSection} (80-100%)**: Excellent process adherence with minimal room for improvement
- **${Math.floor(maxScorePerSection * 0.6)}-${Math.floor(maxScorePerSection * 0.8) - 1} (60-79%)**: Good adherence with minor process gaps to address
- **${Math.floor(maxScorePerSection * 0.4)}-${Math.floor(maxScorePerSection * 0.6) - 1} (40-59%)**: Moderate adherence with several important process steps missed
- **0-${Math.floor(maxScorePerSection * 0.4) - 1} (<40%)**: Poor adherence with major process violations

[CRITICAL RULES]
1. ONLY analyze the wealth advisor's messages (labeled "user:")
2. Use "${characterName}" when referring to the client
3. Provide specific, actionable feedback with examples
4. Focus on process adherence, not just outcomes
5. Be constructive but honest about gaps

[JSON OUTPUT FORMAT]
Return ONLY valid JSON with this exact structure:
{
  "processAdherence": {
    "description": "Measures how well HSBC's structured process is followed",
    "overallScore": <number 0-100>,
    "maxScore": 100,
    "sections": [
      {
        "title": "${sectionTitles[0]}",
        "score": <number 0-${maxScorePerSection}>,
        "maxScore": ${maxScorePerSection},
        "why": "<brief explanation of score>",
        "suggestion": "<actionable improvement advice with examples>"
      },
      ... (${numSections} sections total)
    ]
  }
}`;

  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE - CRITICAL REQUIREMENT]
⚠️ MANDATORY: The ENTIRE assessment INCLUDING the JSON response structure MUST be in ${language} language.

**JSON Response Structure Requirements:**
1. ALL "title" field values in the sections array MUST be in ${language}
   - For Cantonese hsbc-client-onboarding: Use "問候同設定背景" NOT "Greeting and context setting"
   - For Cantonese hsbc-client-onboarding: Use "介紹 HSBC 財富主張" NOT "Introduction to HSBC wealth proposition"
   - For Cantonese hsbc-client-onboarding: Use "客戶資料同入門" NOT "Client profiling & onboarding"
   - For Cantonese hsbc-client-onboarding: Use "行動呼籲同下一步" NOT "Call to action & next steps"

2. ALL "why" explanations MUST be written entirely in ${language}

3. ALL "suggestion" recommendations MUST be written entirely in ${language}

4. The "description" field MUST be in ${language}

5. Use ${language} equivalents for all technical terms

**VERIFICATION CHECKLIST:**
- ✓ Section titles in JSON are in ${language}
- ✓ All "why" fields contain only ${language} text
- ✓ All "suggestion" fields contain only ${language} text
- ✓ Description field is in ${language}
- ✓ No English text appears anywhere in the assessment`;
  }

  // Create the full prompt template with transcript section
  const fullPromptTemplate = `${basePrompt}

[HSBC WEALTH MANAGEMENT CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

Generate an HSBC process adherence assessment based strictly on the wealth advisor's performance. Output ONLY valid JSON using the exact format specified.`;

  return {
    format: async (values: Record<string, any>) => {
      let formatted = fullPromptTemplate;
      for (const [key, value] of Object.entries(values)) {
        formatted = formatted.replace(`{${key}}`, String(value));
      }
      return formatted;
    },
  };
}
