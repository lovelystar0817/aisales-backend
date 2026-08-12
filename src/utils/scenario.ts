import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import z from 'zod';
import {
  DEFAULT_OPENAI_MODEL,
  SUPPORTED_LANGUAGES_WITH_NAMES,
} from './constants.js';
import {
  IScenario,
  Scenario,
  ScenarioLocalization,
  ScenarioLocalizations,
} from '../models/Scenario.js';
import {
  Module,
  ModuleDocument,
  ModuleLocalization,
  ModuleLocalizations,
} from '../models/Module.js';
import { PersonaDocument } from '../models/Persona.js';
import { SalesProductDocument } from '../models/SalesProduct.js';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

// Structured output schema for consistent AI responses
const scenarioSchema = z.object({
  title: z
    .string()
    .describe(
      'Clear, engaging scenario title that includes the persona name and scenario type',
    ),
  description: z
    .string()
    .describe(
      'Detailed scenario description in second person, setting up the context, stakes, and objectives in a conversational tone',
    ),
  primaryObjection: z
    .string()
    .describe(
      'The main realistic objection the persona would raise, phrased as a direct quote from the persona',
    ),
});

const SCENARIO_GENERATION_SYSTEM_PROMPT = `You are an expert sales training scenario creator. Generate realistic, engaging sales roleplay scenarios that follow this EXACT format:

Title: [Scenario Type] with [Persona Name]
Description: You're [current situation with persona]. [Their readiness state]. [Specific context about product/decision]. Your objective is to [key objectives].

Primary Objection: [Direct quote of the main objection the persona would raise]

CRITICAL FORMATTING RULES:
- Title must follow "[Scenario Type] with [Persona Name]" format
- Description must start with "You're" and be in second person
- Primary objection must be a direct quote from the persona
- Keep descriptions concise but impactful
- Make scenarios realistic and challenging but achievable
- Align with the specified learning objectives`;

const REFINEMENT_SYSTEM_PROMPT = `You are refining an existing sales training scenario based on user feedback. Maintain the original format but improve it according to the refinement prompt.

ORIGINAL FORMAT:
Title: [Scenario Type] with [Persona Name]
Description: You're [situation]. [Context]. Your objective is to [objectives].
Primary Objection: [Direct quote]

Apply the refinement while keeping the same structure and tone. Make the scenario more engaging, challenging, or specific as requested.`;

interface ScenarioGenerationData {
  module: any;
  persona: any | null;
  scorecard: any | null;
  product: any | null;
}

export async function generateInitialScenario(data: ScenarioGenerationData) {
  const { module, persona, scorecard, product } = data;

  const promptData = {
    moduleTitle: module.title,
    moduleDescription: module.description,
    scenarioSetup: module.scenarioSetup || '',
    objectives: Array.isArray(module.objectives)
      ? module.objectives.join(', ')
      : module.objectives || '',

    personaName: persona?.name || '',
    personaAge: persona?.age || '',
    personaGender: persona?.gender || '',
    personaOccupation: persona?.occupation || '',
    personaDetails: formatPersonaDetails(persona),

    scorecardName: scorecard?.name || '',
    productName: product?.name || '',
  };

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', SCENARIO_GENERATION_SYSTEM_PROMPT],
    [
      'human',
      `Create a sales roleplay scenario with these details:

Module: {moduleTitle}
- Description: {moduleDescription}
- Setup: {scenarioSetup}
- Objectives: {objectives}

${
  persona
    ? `Persona: {personaName}
- Age: {personaAge}
- Gender: {personaGender}
- Occupation: {personaOccupation}
- Details: {personaDetails}`
    : ''
}

${scorecard ? `Scorecard Focus: {scorecardName}` : ''}
${product ? `Product: {productName}` : ''}

Generate a scenario following the exact format specified. Make it realistic and engaging for sales training.`,
    ],
  ]);

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 0.7,
  }).withStructuredOutput(scenarioSchema);

  const formattedPrompt = await prompt.format(promptData);
  const response = await model.invoke(formattedPrompt);

  return response;
}

export async function refineScenario(
  initialPreview: any,
  refinementPrompt: string,
) {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', REFINEMENT_SYSTEM_PROMPT],
    [
      'human',
      `Refine this scenario based on the following feedback:

ORIGINAL SCENARIO:
Title: {originalTitle}
Description: {originalDescription}
Primary Objection: {originalObjection}

REFINEMENT REQUEST: {refinementPrompt}

Please provide the refined scenario in the same format, making it more engaging and effective for sales training.`,
    ],
  ]);

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 0.7,
  }).withStructuredOutput(scenarioSchema);

  const formattedPrompt = await prompt.format({
    originalTitle: initialPreview.title,
    originalDescription: initialPreview.description,
    originalObjection: initialPreview.primaryObjection,
    refinementPrompt,
  });

  const response = await model.invoke(formattedPrompt);
  return response;
}
export async function generateModuleVisuals(
  title: string,
  description: string,
  objectives: string,
) {
  const visualSchema = z.object({
    icon: z.string().describe('A relevant emoji that represents the module'),
    backgroundColor: z
      .string()
      .describe('A light, pastel hex color code (e.g., #E0E7FF)'),
  });

  const colorOptions = [
    'Light Blue/Indigo (#DBEAFE, #E0E7FF, #E0F2FE): Trust, professionalism, communication',
    'Light Green (#D1FAE5, #DCFCE7, #D9F99D): Growth, success, solutions',
    'Light Purple (#EDE9FE, #F3E8FF, #E9D5FF): Creativity, innovation, strategy',
    'Light Orange/Amber (#FED7AA, #FEF3C7, #FDE68A): Energy, enthusiasm, action',
    'Light Teal/Cyan (#CCFBF1, #CFFAFE, #D1FAE5): Balance, clarity, insight',
    'Light Pink/Rose (#FCE7F3, #FEE2E2, #FECDD3): Empathy, relationships, warmth',
    'Light Gray/Slate (#F1F5F9, #E2E8F0, #F8FAFC): Neutral, professional, versatile',
  ].sort(() => Math.random() - 0.5);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a UI/UX designer who creates DIVERSE and VISUALLY DISTINCT identities for educational modules.

CORE PRINCIPLE: Maximum variety. Never default to the same color families. Each module must feel unique.`,
    ],
    [
      'human',
      `Generate visual elements for this training module:

TITLE: {title}
DESCRIPTION: {description}
OBJECTIVES: {objectives}

Select:
1. An emoji icon that DIRECTLY represents the module's specific theme
   1. An emoji icon that DIRECTLY represents the module's specific theme and content:
   - Choose icons that immediately communicate what the module teaches
   - Match the icon to the primary skill or topic being covered
   - Consider what visual symbol best represents the learning outcome
   
   Examples of relevant icon matching:
   - Negotiation/deals → 🤝 (handshake)
   - Phone/cold calling → 📞 (phone)
   - Email outreach → ✉️ or 📧 (email)
   - Objection handling → 🛡️ or 💬 (shield or conversation)
   - Closing deals → ✅ or 🎯 (checkmark or target)
   - Product demos → 🖥️ or 📊 (computer or presentation)
   - Relationship building → 🤗 or 💼 (handshake or briefcase)
   - Discovery questions → 🔍 or ❓ (magnifying glass or question)
   - Pricing discussions → 💰 or 💵 (money)
   - Contract negotiation → 📝 or 📋 (document)
   - Follow-up strategies → 🔄 or ⏰ (cycle or clock)
   - Presentation skills → 🎤 or 📽️ (microphone or projector)
   - Active listening → 👂 or 🎧 (ear or headphones)
   - Time management → ⏱️ or 📅 (timer or calendar)

2. A LIGHT, PASTEL hex color from ONE of these categories:
${colorOptions.map((opt, i) => `   ${i + 1}. ${opt}`).join('\n')}

SELECTION RULES:
- Choose the color category that best matches the module's theme
- Use DIFFERENT categories for variety across modules
- All colors must be light/pastel (suitable for backgrounds with dark text)
- Be creative - don't always pick the "safest" option`,
    ],
  ]);

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 1.2,
  }).withStructuredOutput(visualSchema);

  const formattedPrompt = await prompt.format({
    title,
    description,
    objectives,
  });

  const response = await model.invoke(formattedPrompt);

  return response;
}
export const generateScenarioPrompt = async (
  scenario:
    | (Omit<IScenario, 'persona' | 'module' | 'product'> & {
        persona: PersonaDocument;
        module: ModuleDocument;
        product: SalesProductDocument;
      })
    | undefined,
): Promise<void> => {
  if (!scenario) {
    return;
  }

  const promptGenerationSchema = z.object({
    contextPrompt: z
      .string()
      .describe(
        "Complete, rich roleplay prompt covering identity, personality, concerns, conversation flow, and appropriate context for the call stage. Use {{userName}} as placeholder for sales rep's name.",
      ),
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are an expert at creating realistic, nuanced roleplay prompts for AI sales training.

Your goal: Generate a prompt that makes an AI convincingly act as a specific person being contacted by a sales representative.

CRITICAL ROLE CLARITY:
The AI you're writing for is the PROSPECT/CLIENT - someone receiving a sales pitch.
They should NEVER:
- Offer to help the sales rep
- Ask "How can I help you?" or "What can I do for you?"
- Take initiative to move the conversation forward during awkward pauses
- Act like they're trying to close a deal

They SHOULD:
- Wait for the sales rep to speak first and explain themselves
- React naturally based on their personality and the situation
- Raise concerns and objections authentically WHEN CONTEXTUALLY APPROPRIATE
- Ask questions to understand what's being offered
- Show progression (warm up if convinced, stay cold if not)

UNDERSTANDING CALL CONTEXT:
Before writing anything, determine what type of call this is:

**COLD CALL INDICATORS**: "first time," "initial contact," "cold outreach," "hasn't spoken before"
→ Prospect has NO idea who this is. Guarded. Needs introduction. May interrupt with "Who is this?" or "What is this about?"

**FOLLOW-UP INDICATORS**: "second call," "spoke last week," "follow-up," "continuing discussion," "previously discussed"
→ Prospect remembers prior conversation. Has had time to think. May have new questions. Expects sales rep to reference what was discussed.

**CLOSING CALL INDICATORS**: "final decision," "ready to close," "third meeting," "make a decision today," "final negotiation"
→ Prospect is familiar with everything. Most questions answered. Focus is on final concerns, terms, pricing, commitment.

**DISCOVERY INDICATORS**: "needs analysis," "fact-finding," "understanding requirements," "exploratory"
→ Rapport established but early stage. Prospect is open to sharing info about their situation. Not ready to buy, just exploring.

OUTPUT STRUCTURE - Generate sections in this EXACT ORDER:

1. [RELATIONSHIP & CALL CONTEXT]

This section establishes the relationship foundation that all other rules will reference.

**Format:**
Call Type: [Specify: Cold Call / Follow-Up Call / Closing Call / Discovery Call]

**Then include ONE of these blocks based on call type:**

FOR COLD CALLS:
IMPORTANT: You do NOT know {{userName}} and have NO IDEA why they're calling.
- Wait for {{userName}} to introduce themselves and explain the purpose
- React with confusion or guardedness: "Who is this?" or "What is this about?"
- Do not acknowledge any familiarity - this is your first interaction

FOR FOLLOW-UP CALLS:
IMPORTANT: You DO know {{userName}} and remember your previous conversation(s).
- When {{userName}} calls, acknowledge familiarity: "Hi {{userName}}, thanks for calling back"
- You remember discussing [brief mention of what was discussed]
- You expect {{userName}} to reference prior discussions
- You can ask follow-up questions: "Did you find out about [X] like you said?"
- Do NOT act confused about who they are or why they're calling

FOR CLOSING CALLS:
IMPORTANT: You KNOW {{userName}} well after multiple conversations.
- Greet with familiarity: "Hi {{userName}}, thanks for following up"
- You remember all previous discussions about [product/solution]
- You're ready to make a final decision pending your remaining concerns
- You expect {{userName}} to recap key terms and address your final concerns
- Do NOT act like this is a first conversation

FOR DISCOVERY/NEEDS ANALYSIS:
IMPORTANT: You've had initial contact with {{userName}} and some rapport exists.
- Polite, professional acknowledgment: "Hi {{userName}}"
- You're open to discussing your situation and needs
- You're exploratory, not ready to buy yet
- Willing to share information but cautious about commitment

2. [IDENTITY & CONTEXT]
Write 3-4 rich sentences that establish:
- Full identity: "{personaName}, a {personaAge}-year-old {personaOccupation}"
- Why they're being contacted: "{{userName}} is calling you about {productName}"
- Current situation and circumstances
- Current mental state: How busy/skeptical/interested are they right now?

3. [PERSONALITY & COMMUNICATION]  
Write 4-5 sentences covering:
- 2-3 core personality traits that affect how they interact
- Communication style: Direct? Warm? Formal? Skeptical? Chatty? Terse?
- Decision-making approach: Data-driven? Emotional? Consensus-seeking? Impulsive?
- What they value most in interactions: Efficiency? Relationships? Expertise? Transparency?

Be specific and behavioral, not generic. Bad: "They are professional." Good: "They cut through small talk quickly and ask pointed questions about ROI."

4. [CONCERNS & OBJECTIONS]
Structure this clearly:

Primary Concern: "{mainObjection}"

IMPORTANT - When to raise this concern:
- DO NOT blurt it out immediately or randomly
- Raise it ONLY when contextually appropriate:
  * When {{userName}} asks about your thoughts/concerns
  * When {{userName}} mentions pricing/cost/investment (if it's a budget concern)
  * When {{userName}} explains the product/solution (if it's a relevance/fit concern)
  * When {{userName}} asks about your situation (if it relates to your circumstances)
  * When the conversation naturally leads there
- Wait for the right moment - let it come up organically in the flow

How to phrase it naturally (give 2-3 variations):
- "[Natural way they'd express this concern in conversation]"
- "[Alternative phrasing]"
- "[Another way to say it]"

If {{userName}} addresses the primary concern well, then move to:
Secondary Concerns (raise these later in conversation):
- [Specific concern #1 - when/how to bring it up]
- [Specific concern #2 - when/how to bring it up]

Warming Triggers (what makes them more receptive):
- [Specific behavior from sales rep that would build trust]
- [Another specific thing that would interest them]
- [What would make them think "okay, this person gets it"]

Do NOT list generic objections. Make them specific to this person's situation, personality, and the product.

5. [CONVERSATION FLOW]
Break down the conversation into stages with SPECIFIC behavioral guidance:

**OPENING (Exchanges 1-2):**
[Match to call type from section 1]
- Cold call: "Who is this?" or "What is this about?" - Guarded, confused
- Follow-up: "Hi {{userName}}, yes, I remember" - Familiar but cautious
- Close: "Thanks for calling back" - Comfortable, decision-focused

First thing you'll likely say: "[Exact quote based on call type]"
Initial tone: [skeptical/curious/busy/defensive/neutral/familiar]
What you're waiting for: [What {{userName}} needs to explain/establish first]

**EARLY PHASE (Exchanges 3-4):**
What you do:
- Ask clarifying questions to understand what this is about
- Listen to {{userName}}'s explanation
- React based on how well they explain things
- If your primary concern comes up naturally in discussion, raise it now

Example questions/reactions:
- "[Specific question about what they're offering]"
- "[Question about relevance to your situation]"
- IF {{userName}} is vague: "[How you push back]"
- IF {{userName}} asks about concerns: "[Now you can mention your main concern]"

**MIDDLE PHASE (Exchanges 5-7):**
If {{userName}} is doing well:
- [Specific sign of warming - ask deeper questions, acknowledge good points]
- [What you say when something resonates: "That actually makes sense because..."]
- Ask about implementation/details that show growing interest

If {{userName}} is doing poorly:
- [Specific sign of disengagement - check time, show impatience]
- [What you say: "I'm not sure this is the right fit..."]

If primary concern hasn't come up yet but is relevant: [How to bring it up naturally now]

**LATE PHASE (Exchanges 8+):**
If convinced: 
- [What you say/ask - focus on next steps, pricing, implementation]
- [Specific questions about moving forward]

If not convinced: 
- [How you politely decline or end the call]
- [What you say: exact phrases]

Final decision factors: [What determines yes vs no]

6. [LANGUAGE & STYLE]
Vocabulary Level: [Simple/Professional/Technical]

Speech patterns and typical expressions:
Describe how this person talks and give 4-5 example phrases they'd naturally use in conversation.

Examples:
- If analytical and data-driven: "What's the ROI on that?" / "Do you have numbers to back that up?" / "Walk me through the metrics"
- If casual and friendly: "That's pretty cool" / "I hear you" / "Fair enough"
- If formal and cautious: "I would need to review this carefully" / "What are the terms?" / "I appreciate the information"
- If busy and direct: "Cut to the chase" / "What's the bottom line?" / "I don't have time for..."

Your examples should match {personaName}'s personality:
- "[Typical phrase they'd use #1]"
- "[Typical phrase they'd use #2]"
- "[Typical phrase they'd use #3]"
- "[Typical phrase they'd use #4]"
- "[Typical phrase they'd use #5]"

Phrases this person would NEVER use (out of character for them):
- "[Too casual/formal for their style]"
- "[Doesn't match their personality]"
- "[Wrong vocabulary level]"
- "[Mismatched tone]"

Overall tone: [Formal/Casual/Direct/Cautious/Warm/Cold/Professional] - be specific

7. [DECISION BEHAVIOR - {difficulty} DIFFICULTY]

Based on {difficulty} difficulty:

**EASY:** You need 2-3 strong answers to warm up. You're receptive and want this to work. Quick to see value when demonstrated clearly.

Warming timeline:
- Exchanges 1-2: Polite and open, waiting to understand what this is about
- Exchanges 3-4: If {{userName}} explains well, ask interested follow-up questions
- Exchanges 5-6: Show clear interest, raise your main concern when contextually appropriate
- Exchanges 7+: If concern is addressed well, ready to discuss next steps

**MEDIUM:** You need 3-4 solid answers to warm up. You're professionally cautious but fair. Need clear value proposition.

Warming timeline:
- Exchanges 1-3: Cautiously polite, need {{userName}} to prove relevance
- Exchanges 4-5: If {{userName}} demonstrates value, engage more deeply
- Exchanges 6-7: Raise your main concern when appropriate in the conversation
- Exchanges 8+: If addressed properly with specifics, ready to move forward

**HARD:** You need 5+ exceptional answers to warm up. You're highly selective and analytical. Need flawless expertise.

Warming timeline:
- Exchanges 1-4: Very guarded, {{userName}} must earn your attention
- Exchanges 5-7: If {{userName}} demonstrates exceptional expertise, ask probing questions
- Exchanges 8-10: Raise your main concern and other detailed questions
- Exchanges 11+: Consider next steps only if everything checks out perfectly

What makes you say YES: [Specific conditions - be concrete]
What makes you say NO: [Specific behaviors or failures from {{userName}}]

CRITICAL REMINDERS:
- START with [RELATIONSHIP & CALL CONTEXT] section - this is MANDATORY and MUST BE FIRST
- Make the call type and relationship status crystal clear in that first section
- Always use {{userName}} when referring to the sales representative
- Make every instruction behaviorally specific, not generic
- Objections should come up NATURALLY when contextually appropriate, not immediately
- The "speech patterns" section should show HOW this person talks with realistic examples
- Focus on HOW they act, not just WHO they are
- Give exact phrases they would/wouldn't use that match their personality
- Tie everything to their personality and the difficulty level
- Make objections specific to their actual situation
- Show clear progression from skeptical to convinced (or not)`,
    ],
    [
      'human',
      `Generate a comprehensive, behaviorally-specific roleplay prompt for this scenario:

**MODULE CONTEXT:**
Title: {moduleTitle}
Description: {moduleDescription}
Scenario Setup: {scenarioSetup}
Learning Objectives: {objectives}

**WHO THEY ARE:**
Name: {personaName}
Age: {personaAge}
Occupation: {personaOccupation}
Location: {location}
Education: {education}
Financial Situation: {financialSituation}
Key Priorities: {keyPriorities}

**THEIR PERSONALITY:**
Core Persona: {personality}
Communication Style: {communicationStyle}
Decision Making: {decisionMaking}
Product Knowledge: {productKnowledge}

**WHAT'S BEING SOLD:**
Product: {productName}
Key Features: {keyFeatures}
Feature Highlight: {featureHighlight}

**THIS SPECIFIC SCENARIO:**
Main Concern: "{mainObjection}"
Situation Context: "{salesDescription}"
Sales Rep's Goal: "{salesGoal}"
Difficulty Level: {difficulty}

**YOUR TASK:**
1. **FIRST**: Analyze the "Scenario Setup" and "Situation Context" to determine call type (cold/follow-up/close/discovery)
2. **START YOUR OUTPUT** with [RELATIONSHIP & CALL CONTEXT] section that EXPLICITLY states:
   - What type of call this is
   - Whether the prospect knows {{userName}} or not
   - Clear override instructions based on the call type
3. Generate all remaining 6 sections with the exact headers shown in your instructions
4. For objections: Specify WHEN they should come up naturally (when sales rep asks, or when topic arises), NOT immediately
5. For speech patterns: Give realistic examples of phrases that match their personality and occupation
6. Make EVERY instruction behaviorally specific - what they say, how they react, when they warm up
7. Use {{userName}} placeholder throughout
8. Tie all behavior to their personality ({personality}) and difficulty ({difficulty})

**CRITICAL**: If the scenario indicates previous discussions, follow-ups, closing stage, or multiple conversations, make it ABUNDANTLY CLEAR in the [RELATIONSHIP & CALL CONTEXT] section that the prospect KNOWS {{userName}} and should NOT act confused about who's calling.

Focus on creating a rich, realistic, behaviorally-driven prompt that will make the AI feel like a real person in this exact situation.`,
    ],
  ]);

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 0.7,
  }).withStructuredOutput(promptGenerationSchema);

  try {
    const formattedPrompt = await prompt.format({
      moduleTitle: scenario.module.title || 'Sales Roleplay',
      moduleDescription: scenario.module.description || 'Not provided',
      scenarioSetup: scenario.module.scenarioSetup || 'Not provided',
      objectives:
        scenario.module.objectives?.join('\n- ') || 'Practice sales skills',
      personaName: scenario.persona.name,
      personaAge: scenario.persona.age || 'Not specified',
      personaOccupation: scenario.persona.occupation || 'Not specified',
      personality:
        scenario.persona.personalityDetails?.persona ||
        'Professional and practical',
      communicationStyle:
        scenario.persona.personalityDetails?.communicationStyle?.join(', ') ||
        'Direct and clear',
      decisionMaking:
        scenario.persona.personalityDetails?.decisionMaking?.join(', ') ||
        'Analytical',
      financialSituation:
        scenario.persona.details?.financialSituation || 'Not specified',
      keyPriorities:
        scenario.persona.details?.keyPriorities?.join(', ') ||
        'Value and reliability',
      location: scenario.persona.details?.location || 'Not specified',
      education: scenario.persona.details?.education || 'Not specified',
      productKnowledge:
        scenario.persona.details?.productKnowledge || 'Limited knowledge',
      productName: scenario.product?.name || 'Product/Service',
      keyFeatures:
        scenario.product?.keyFeatures?.join('\n- ') || 'Various features',
      featureHighlight: scenario.product?.featureHighlight
        ? `Title: ${scenario.product.featureHighlight.title},\nDescription: ${scenario.product.featureHighlight.description}`
        : 'Not specified',
      mainObjection:
        scenario.scenarioDetails.mainObjection ||
        'Not sure if this is right for me',
      salesDescription:
        scenario.scenarioDetails.salesDescription || 'A sales call',
      salesGoal: scenario.scenarioDetails.salesGoal || 'Make a sale',
      difficulty: scenario.difficultyLevel || 'medium',
    });

    const result = await model.invoke(formattedPrompt);

    if (!result.contextPrompt || result.contextPrompt.length < 300) {
      console.warn('Prompt generation failed or too short, skipping');
      return;
    }

    await Scenario.updateOne(
      { _id: scenario._id },
      { $set: { contextPrompt: result.contextPrompt } },
    );

    console.log(
      '✅ Generated rich contextual prompt for scenario:',
      scenario._id,
    );
  } catch (error) {
    console.error('Prompt generation failed:', error);
    return;
  }
};

function formatPersonaDetails(persona: any | null): string {
  if (!persona) return '';

  const details = [];
  if (persona.details?.location)
    details.push(`from ${persona.details.location}`);
  if (persona.details?.education)
    details.push(`educated at ${persona.details.education}`);
  if (persona.details?.keyPriorities?.length) {
    details.push(`priorities: ${persona.details.keyPriorities.join(', ')}`);
  }
  if (persona.details?.workHistory) {
    details.push(`work history: ${persona.details.workHistory}`);
  }
  if (persona.details?.companySizeAndSpend) {
    details.push(
      `company size & spend: ${persona.details.companySizeAndSpend}`,
    );
  }

  return details.length > 0 ? details.join(', ') : '';
}

// Languages to translate to (excluding English as it's the source)
const targetLanguages = SUPPORTED_LANGUAGES_WITH_NAMES.filter(
  (lang) => lang.code !== 'en',
);

/**
 * Translates scenario content to supported languages asynchronously.
 * This is a fire-and-forget function that updates the scenario's localizations field.
 *
 * @param params.targetLanguage - Optional. If provided, only translate to this language.
 *                                Otherwise, translate to all supported languages.
 */
export function translateScenarioContent(params: {
  scenarioId: string;
  scenarioDetails: ScenarioLocalization;
  targetLanguage?: string;
}): void {
  const { scenarioId, scenarioDetails, targetLanguage } = params;

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 0.3,
    maxRetries: 2,
  });

  translateToAllLanguages(scenarioDetails, model, targetLanguage)
    .then(async (localizations) => {
      const scenario = await Scenario.findById(scenarioId);
      if (!scenario) {
        console.error(
          `Scenario ${scenarioId} not found for translation update`,
        );
        return;
      }

      // Convert existing localizations to plain object (avoid Mongoose map internals)
      const existingLocalizations = scenario.localizations
        ? JSON.parse(JSON.stringify(scenario.localizations))
        : {};

      const mergedLocalizations: ScenarioLocalizations = {
        ...existingLocalizations,
        ...localizations,
      };

      await Scenario.findByIdAndUpdate(scenarioId, {
        localizations: mergedLocalizations,
      });

      const langCount = Object.keys(localizations).length;
      const langInfo = targetLanguage
        ? `to ${targetLanguage}`
        : `in ${langCount} languages`;
      console.log(
        `✓ Translations completed for scenario ${scenarioId} ${langInfo}`,
      );
    })
    .catch((error) => {
      console.error(`Error translating scenario ${scenarioId}:`, error);
    });
}

/**
 * Translates content to target languages
 */
async function translateToAllLanguages(
  content: ScenarioLocalization,
  model: ChatOpenAI,
  targetLanguage?: string,
): Promise<Record<string, ScenarioLocalization>> {
  const translations: Record<string, ScenarioLocalization> = {};

  // Determine which languages to translate to
  let languagesToTranslate: Language[];

  if (targetLanguage) {
    const targetLang = targetLanguages.find(
      (lang) => lang.code.toLowerCase() === targetLanguage.toLowerCase(),
    );

    if (!targetLang) {
      if (targetLanguage.toLowerCase() === 'en') {
        console.log('Skipping translation: English is the source language');
        return translations;
      }
      console.error(`Unsupported target language: ${targetLanguage}`);
      return translations;
    }

    languagesToTranslate = [targetLang];
  } else {
    languagesToTranslate = targetLanguages;
  }

  // Process translations in parallel with concurrency limit
  const batchSize = 3;
  for (let i = 0; i < languagesToTranslate.length; i += batchSize) {
    const batch = languagesToTranslate.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((lang) => translateToLanguage(content, lang, model)),
    );

    results.forEach((result, index) => {
      const lang = batch[index];
      if (result.status === 'fulfilled') {
        translations[lang.code] = result.value;
      } else {
        console.error(`Failed to translate to ${lang.name}:`, result.reason);
      }
    });
  }

  return translations;
}

/**
 * Translates scenario content to a specific language
 */
async function translateToLanguage(
  content: ScenarioLocalization,
  targetLang: Language,
  model: ChatOpenAI,
): Promise<ScenarioLocalization> {
  const prompt = buildTranslationPrompt(content, targetLang);

  const response = await model.invoke(prompt);
  const responseText = (response.content as string).trim();

  try {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      responseText,
    ];
    const jsonStr = jsonMatch[1]?.trim() || responseText;
    const parsed = JSON.parse(jsonStr) as ScenarioLocalization;

    return {
      mainObjection: parsed.mainObjection || content.mainObjection,
      salesDescription: parsed.salesDescription || content.salesDescription,
      salesGoal: parsed.salesGoal || content.salesGoal,
    };
  } catch (parseError) {
    console.error(
      `Failed to parse translation response for ${targetLang.name}:`,
      parseError,
    );
    throw new Error(
      `Invalid translation response format for ${targetLang.name}`,
    );
  }
}

/**
 * Builds the translation prompt for OpenAI
 */
function buildTranslationPrompt(
  content: ScenarioLocalization,
  targetLang: Language,
): string {
  const contentToTranslate = {
    mainObjection: content.mainObjection || null,
    salesDescription: content.salesDescription || null,
    salesGoal: content.salesGoal || null,
  };

  return `You are a professional translator. Translate the following scenario content from English to ${targetLang.name} (${targetLang.nativeName}).

IMPORTANT RULES:
1. Translate all text naturally and fluently in ${targetLang.name}
2. Maintain the same tone and meaning
3. Keep proper nouns (names, company names, product names) unchanged
4. Return ONLY valid JSON with no additional text
5. Keep null values as null

Content to translate:
${JSON.stringify(contentToTranslate, null, 2)}

Return the translated content as a JSON object with the EXACT same structure:
{
  "mainObjection": "translated main objection or null",
  "salesDescription": "translated sales description or null",
  "salesGoal": "translated sales goal or null"
}

Translate now to ${targetLang.name}:`;
}

/**
 * Translates module content to supported languages asynchronously.
 * This is a fire-and-forget function that updates the module's localizations field.
 *
 * @param params.moduleId - The ID of the module to translate
 * @param params.moduleContent - The content to translate
 * @param params.targetLanguage - Optional. If provided, only translate to this language.
 *                                Otherwise, translate to all supported languages.
 */
export function translateModuleContent(params: {
  moduleId: string;
  moduleContent: ModuleLocalization;
  targetLanguage?: string;
}): void {
  const { moduleId, moduleContent, targetLanguage } = params;

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 0.3,
    maxRetries: 2,
  });

  translateModuleToAllLanguages(moduleContent, model, targetLanguage)
    .then(async (localizations) => {
      const module = await Module.findById(moduleId);
      if (!module) {
        console.error(`Module ${moduleId} not found for translation update`);
        return;
      }

      // Convert existing localizations to plain object (avoid Mongoose map internals)
      const existingLocalizations = module.localizations
        ? JSON.parse(JSON.stringify(module.localizations))
        : {};

      const mergedLocalizations: ModuleLocalizations = {
        ...existingLocalizations,
        ...localizations,
      };

      await Module.findByIdAndUpdate(moduleId, {
        localizations: mergedLocalizations,
      });

      const langCount = Object.keys(localizations).length;
      const langInfo = targetLanguage
        ? `to ${targetLanguage}`
        : `in ${langCount} languages`;
      console.log(
        `✓ Translations completed for module ${moduleId} ${langInfo}`,
      );
    })
    .catch((error) => {
      console.error(`Error translating module ${moduleId}:`, error);
    });
}

/**
 * Translates module content to target languages
 */
async function translateModuleToAllLanguages(
  content: ModuleLocalization,
  model: ChatOpenAI,
  targetLanguage?: string,
): Promise<Record<string, ModuleLocalization>> {
  const translations: Record<string, ModuleLocalization> = {};

  // Determine which languages to translate to
  let languagesToTranslate: Language[];

  if (targetLanguage) {
    const targetLang = targetLanguages.find(
      (lang) => lang.code.toLowerCase() === targetLanguage.toLowerCase(),
    );

    if (!targetLang) {
      if (targetLanguage.toLowerCase() === 'en') {
        console.log('Skipping translation: English is the source language');
        return translations;
      }
      console.error(`Unsupported target language: ${targetLanguage}`);
      return translations;
    }

    languagesToTranslate = [targetLang];
  } else {
    languagesToTranslate = targetLanguages;
  }

  // Process translations in parallel with concurrency limit
  const batchSize = 3;
  for (let i = 0; i < languagesToTranslate.length; i += batchSize) {
    const batch = languagesToTranslate.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((lang) => translateModuleToLanguage(content, lang, model)),
    );

    results.forEach((result, index) => {
      const lang = batch[index];
      if (result.status === 'fulfilled') {
        translations[lang.code] = result.value;
      } else {
        console.error(`Failed to translate to ${lang.name}:`, result.reason);
      }
    });
  }

  return translations;
}

/**
 * Translates module content to a specific language
 */
async function translateModuleToLanguage(
  content: ModuleLocalization,
  targetLang: Language,
  model: ChatOpenAI,
): Promise<ModuleLocalization> {
  const prompt = buildModuleTranslationPrompt(content, targetLang);

  const response = await model.invoke(prompt);
  const responseText = (response.content as string).trim();

  try {
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [
      null,
      responseText,
    ];
    const jsonStr = jsonMatch[1]?.trim() || responseText;
    const parsed = JSON.parse(jsonStr) as ModuleLocalization;

    return {
      title: parsed.title || content.title,
      description: parsed.description || content.description,
      scenarioSetup: parsed.scenarioSetup || content.scenarioSetup,
      objectives: parsed.objectives || content.objectives,
    };
  } catch (parseError) {
    console.error(
      `Failed to parse translation response for ${targetLang.name}:`,
      parseError,
    );
    throw new Error(
      `Invalid translation response format for ${targetLang.name}`,
    );
  }
}

/**
 * Builds the translation prompt for OpenAI
 */
function buildModuleTranslationPrompt(
  content: ModuleLocalization,
  targetLang: Language,
): string {
  const contentToTranslate = {
    title: content.title || null,
    description: content.description || null,
    scenarioSetup: content.scenarioSetup || null,
    objectives: content.objectives || null,
  };

  return `You are a professional translator. Translate the following module content from English to ${targetLang.name} (${targetLang.nativeName}).

IMPORTANT RULES:
1. Translate all text naturally and fluently in ${targetLang.name}
2. Maintain the same tone and meaning
3. Keep proper nouns (names, company names, product names) unchanged
4. Return ONLY valid JSON with no additional text
5. Keep null values as null
6. For the "objectives" array, translate each item individually while maintaining the array structure

Content to translate:
${JSON.stringify(contentToTranslate, null, 2)}

Return the translated content as a JSON object with the EXACT same structure:
{
  "title": "translated title or null",
  "description": "translated description or null",
  "scenarioSetup": "translated scenario setup or null",
  "objectives": ["translated objective 1", "translated objective 2"] or null
}

Translate now to ${targetLang.name}:`;
}
