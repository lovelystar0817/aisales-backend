import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getLanguageName } from '../../utils/languages.js';

const basePrudentialSalesOverviewPrompt = `You are an expert sales coach specializing in analyzing Prudential sales roleplay conversations. Your task is to analyze the salesperson's overall performance and provide a structured overview with understanding of Prudential-specific requirements.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI prospect. Focus exclusively on analyzing the salesperson's performance.

[CRITICAL RESTRICTION]
**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - ANALYZE ONLY THESE
- Messages labeled with "ai:" are from the prospect - IGNORE THESE COMPLETELY
`;

const coldCallSpecificSection = `
[PRUDENTIAL-SPECIFIC UNDERSTANDING]
For Prudential cold call sessions, recognize that the following are REQUIRED and POSITIVE behaviors:
- **Client Verification Process**: Following greeting scripts, requesting verification permission, and collecting client information for security purposes is MANDATORY and should be praised, not criticized
- **Scripted Language**: Using standardized banking verification language is required for compliance and should be viewed positively
- **Professional Verification**: Asking for multiple pieces of verification information (name, DOB, address, account details) is expected and appropriate

[ASSESSMENT FOCUS]
Evaluate the salesperson's:
1. Overall sales effectiveness and conversation management
2. Deal progression and relationship building
3. Compliance with verification requirements (POSITIVE when done correctly)
4. Sales technique application after verification process
5. Key gaps that impacted sales outcomes
`;

const productPositioningSpecificSection = `
[ASSESSMENT FOCUS]
Evaluate the salesperson's:
1. Overall sales effectiveness and conversation management
2. Deal progression and relationship building
3. Product knowledge demonstration and explanation clarity
4. Sales technique application (3F framework: Feel, Felt, Found)
5. Objection handling effectiveness
6. Key gaps that impacted sales outcomes
`;

const coldCallGuidelinesSection = `
[OVERVIEW STRUCTURE]
Provide:
- **Summary**: 2-3 sentences describing overall sales performance, balancing strengths and weaknesses
- **Suggested next steps**: Exactly 3 specific, actionable recommendations for improvement (10-15 words each), written in present continuous tense (verb+ing)

[GUIDELINES FOR SALES FEEDBACK]
1. **Summary Guidelines:**
   - Focus on sales impact and customer engagement effectiveness
   - Acknowledge proper verification process as a strength
   - Highlight both what worked well and key gaps
   - Consider deal progression and relationship building
   - Keep to 2-3 sentences maximum

2. **Next Steps Guidelines:**
   - Make recommendations specific and actionable
   - Focus on highest-impact sales improvements after verification
   - Each recommendation should be 10-15 words and start with a verb in present continuous tense ("-ing" form)
   - Prioritize practical sales skills over theoretical knowledge
   - Don't suggest improvements to required verification processes

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on sales impact and customer engagement
- Recognize verification compliance as professional and appropriate
`;

const productPositioningGuidelinesSection = `
[OVERVIEW STRUCTURE]
Provide:
- **Summary**: 2-3 sentences describing overall sales performance, balancing strengths and weaknesses
- **Suggested next steps**: Exactly 3 specific, actionable recommendations for improvement (10-15 words each), written in present continuous tense (verb+ing)

[GUIDELINES FOR SALES FEEDBACK]
1. **Summary Guidelines:**
   - Focus on sales impact and customer engagement effectiveness
   - Highlight product knowledge demonstration and 3F framework execution
   - Highlight both what worked well and key gaps
   - Consider deal progression and relationship building
   - Keep to 2-3 sentences maximum

2. **Next Steps Guidelines:**
   - Make recommendations specific and actionable
   - Focus on highest-impact sales improvements
   - Each recommendation should be 10-15 words and start with a verb in present continuous tense ("-ing" form)
   - Prioritize practical sales skills over theoretical knowledge

[FEEDBACK GUIDELINES]
- Use second-person perspective ("You...")
- Reference specific examples from the transcript when possible
- Be constructive and actionable in suggestions
- Focus on sales impact and customer engagement
`;

const commonSuffixSection = `
[STRICT JSON OUTPUT FORMAT]
{{
  "overview": {{
    "summary": "string",
    "suggestedNextSteps": [
      "string",
      "string",
      "string"
    ]
  }}
}}

[FINAL VERIFICATION]
Before submitting your analysis:
1. Confirm analysis focuses only on the salesperson's performance
2. Verify summary is 2-3 sentences describing sales effectiveness
3. Ensure exactly 3 next steps are provided
4. Check that recommendations are specific and actionable
5. Verify JSON format is valid with correct syntax
`;

const coldCallExample = `
[EXAMPLE OUTPUT]
{{
  "overview": {{
    "summary": "You followed the proper verification procedures professionally and established good rapport with the client. However, you missed opportunities to build on their expressed interest by not providing specific examples or clear next steps for the insurance solution discussed.",
    "suggestedNextSteps": [
      "Preparing concrete case studies to support product benefits and build client confidence.",
      "Practicing transitioning from verification to needs discovery with open-ended questions.",
      "Developing stronger closing techniques with specific next-step proposals and timelines."
    ]
  }}
}}
`;

const productPositioningExample = `
[EXAMPLE OUTPUT]
{{
  "overview": {{
    "summary": "You demonstrated solid product knowledge and applied the 3F framework effectively when addressing the client's concerns. However, there were missed opportunities to deepen the conversation around the client's specific financial goals and to propose concrete next steps.",
    "suggestedNextSteps": [
      "Practicing deeper needs discovery by asking more open-ended questions about goals.",
      "Preparing specific case studies that align product benefits with client situations.",
      "Developing stronger closing techniques with clear action items and timelines."
    ]
  }}
}}
`;

const coldCallUserTemplate = `
Generate a sales overview based **ONLY ON THE USER'S** contributions in the given sales roleplay conversation.

[Sales Conversation Context]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

Below is the conversation transcript. Remember:

ONLY analyze messages beginning with "user:"
COMPLETELY IGNORE messages beginning with "ai:"
Focus on sales effectiveness and deal progression

**IMPORTANT**: Client verification procedures are REQUIRED for cold calls and should be viewed as professional compliance, not criticized.

Output ONLY valid JSON using the specified format.

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}
`;

const productPositioningUserTemplate = `
Generate a sales overview based **ONLY ON THE USER'S** contributions in the given sales roleplay conversation.

[Sales Conversation Context]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

Below is the conversation transcript. Remember:

ONLY analyze messages beginning with "user:"
COMPLETELY IGNORE messages beginning with "ai:"
Focus on sales effectiveness, product knowledge demonstration, and deal progression

Output ONLY valid JSON using the specified format.

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}
`;

export function getPrudentialRoleplayOverviewPrompt(
  characterName: string,
  languageCode?: string,
  callType?: string,
) {
  const isColdCall = callType === 'cold-call';

  // Build the system prompt based on call type
  let basePrompt = basePrudentialSalesOverviewPrompt;

  if (isColdCall) {
    basePrompt +=
      coldCallSpecificSection +
      coldCallGuidelinesSection +
      coldCallExample +
      commonSuffixSection;
  } else {
    basePrompt +=
      productPositioningSpecificSection +
      productPositioningGuidelinesSection +
      productPositioningExample +
      commonSuffixSection;
  }

  // Select the appropriate user template
  let userPrompt = isColdCall
    ? coldCallUserTemplate.replaceAll('{{characterName}}', characterName)
    : productPositioningUserTemplate.replaceAll(
        '{{characterName}}',
        characterName,
      );

  if (languageCode) {
    const language = getLanguageName(languageCode);
    basePrompt = `${basePrompt}

[LANGUAGE]
IMPORTANT: The output should be in ${language} language.`;
    userPrompt += `
[IMPORTANT] The sales overview should be in ${language} language.`;
  }

  return ChatPromptTemplate.fromMessages([
    ['system', basePrompt],
    ['user', userPrompt],
  ]);
}
