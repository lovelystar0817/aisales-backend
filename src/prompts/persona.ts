import { ChatOpenAI } from '@langchain/openai';
import { PersonaDetails } from '../models/Persona.js';
import {
  Language,
  PersonaTranslationContent,
} from '../utils/manage/persona.js';

// Validate language code format (2-3 letter ISO codes or locale codes like en-US)
export function isValidLanguageCode(code: string): boolean {
  // Accept ISO 639-1 (2 letters), ISO 639-2 (3 letters), or locale format (en-US)
  const regex = /^[a-z]{2,3}(-[A-Z]{2})?$/;
  return regex.test(code);
}

export async function generateDescription(
  params: {
    name: string;
    age: number;
    role: string;
    gender: string;
    personalityTrait: string;
    decisionMakingStyle: string;
    communicationStyle: string;
    details: PersonaDetails;
  },
  model: ChatOpenAI,
): Promise<string> {
  const {
    name,
    age,
    role,
    gender,
    personalityTrait,
    decisionMakingStyle,
    communicationStyle,
    details,
  } = params;

  const prompt = `Generate a concise 2-3 sentence description for this persona:

Name: ${name}
Age: ${age}
Role: ${role}
Gender: ${gender}

Personality Trait: ${personalityTrait}

Decision Making Style:
${decisionMakingStyle}

Communication Style:
${communicationStyle}

${details.location ? `Location: ${details.location}` : ''}
${details.education ? `Education: ${details.education}` : ''}
${details.workHistory ? `Work History: ${details.workHistory}` : ''}

Create a natural, engaging description that captures who this person is, incorporating their personality, decision-making approach, and communication style. Keep it concise and professional.

Return ONLY the description text, no additional formatting or labels.`;

  const response = await model.invoke(prompt);
  return (response.content as string).trim();
}

export function createPersonalityGenerationPrompt(traits: {
  personality: Array<{ value: string; label: string }>;
  buyer: Array<{ value: string; label: string }>;
  communication: Array<{ value: string; label: string }>;
}) {
  // Nuanced combinations with guidance (using values for detection)
  const nuancedCombos: Record<string, { traits: string[]; guidance: string }> =
    {
      'priceSensitive-qualityFocused': {
        traits: ['priceSensitive', 'qualityFocused'],
        guidance:
          'Value-conscious: Expects best price for the spec. Will trade up if ROI is proven. Objections: "Why is this worth more than X?" "Show me the delta in uptime/support."',
      },
      'straightToThePoint-casualConversational': {
        traits: ['straightToThePoint', 'casualConversational'],
        guidance:
          'Warm but brisk: Small talk is fine, then fast pivot to bullets and pricing.',
      },
      'prefersRealExamples-visionaryStrategicFraming': {
        traits: ['prefersRealExamples', 'visionaryStrategicFraming'],
        guidance:
          '"Paint the vision, prove it fast." Pitch order: 1-sentence vision → one tight case study → quantified outcome.',
      },
      'talkative-guarded': {
        traits: ['talkative', 'guarded'],
        guidance:
          'Chatty, but evasive: Chatty on surface topics, but evasive on budget/timeline. Signals: answers quickly, deflects specifics. Tactics: ask closed questions; recap and confirm.',
      },
      'impatient-decisive': {
        traits: ['impatient', 'decisive'],
        guidance:
          'Moves quickly if satisfied: Tactics: lead with TL;DR, price band, and 2 proof points; always propose a next step.',
      },
      'impatient-indecisive': {
        traits: ['impatient', 'indecisive'],
        guidance:
          "Wants fast answers but won't commit: Tactics: timebox options (A/B), reduce choice, offer low-risk trial.",
      },
      'riskAverse-dataDriven': {
        traits: ['riskAverse', 'dataDriven'],
        guidance:
          'Heavy on compliance: Focuses on reliability, references, SLAs, security docs, roadmap stability, peer benchmarks.',
      },
      'riskTolerant-visionaryStrategicFraming': {
        traits: ['riskTolerant', 'visionaryStrategicFraming'],
        guidance:
          'Open to innovation: Interested in pilots and new features. Tactics: future upside, competitive edge, fast pilot path.',
      },
    };

  // Extract labels directly from the received trait objects
  const selectedTraits = {
    personality: traits.personality.map((t) => t.label),
    buyer: traits.buyer.map((t) => t.label),
    communication: traits.communication.map((t) => t.label),
  };

  // Detect nuanced combinations using values
  const allSelectedValues = [
    ...traits.personality.map((t) => t.value),
    ...traits.buyer.map((t) => t.value),
    ...traits.communication.map((t) => t.value),
  ];

  const detectedCombos: string[] = [];
  for (const [key, combo] of Object.entries(nuancedCombos)) {
    const hasAllTraits = combo.traits.every((trait) =>
      allSelectedValues.includes(trait),
    );
    if (hasAllTraits) {
      detectedCombos.push(combo.guidance);
    }
  }

  const nuancedComboGuidance =
    detectedCombos.length > 0
      ? `\n\nNuanced Trait Combinations Detected:
${detectedCombos.map((guidance, i) => `${i + 1}. ${guidance}`).join('\n')}

When writing the descriptions, incorporate these nuanced behaviors naturally.`
      : '';

  return [
    {
      role: 'system',
      content: `You are an expert at creating personality descriptions for roleplay personas. Generate concise, realistic descriptions based on selected traits. You must return ONLY valid JSON with no additional text.`,
    },
    {
      role: 'user',
      content: `Generate personality descriptions based on these traits:

Personality Tone: ${selectedTraits.personality.join(', ') || 'None'}
Buyer Behavior: ${selectedTraits.buyer.join(', ') || 'None'}
Communication Style: ${selectedTraits.communication.join(', ') || 'None'}${nuancedComboGuidance}

Return your response as a JSON object with this EXACT structure:
{
  "personalityTrait": "A 2-3 sentence paragraph describing the overall personality tone",
  "decisionMakingStyle": "Bullet points (using •) for each buyer behavior trait. Each bullet should be: • Trait name: One concise sentence explaining the behavior.",
  "communicationStyle": "Bullet points (using •) for each communication trait. Each bullet should be: • Trait name: One concise sentence explaining the behavior."
}

Example output:
{
  "personalityTrait": "Generally friendly in tone, approachable and willing to engage, but they don't have much patience for small talk. They want to get to the point quickly and expect clear, structured answers.",
  "decisionMakingStyle": "• Price-sensitive: They're focused on cost and will challenge pricing.\n• Data-driven: They expect numbers, facts, and proof points before making a decision.",
  "communicationStyle": "• Impatient: They don't like long explanations and may interrupt if things drag.\n• Straight to the point: Prefers concise responses with concrete examples rather than abstract benefits or stories."
}

Rules:
1. Return ONLY the JSON object, no additional text or markdown
2. personalityTrait: 2-3 sentences describing overall personality
3. decisionMakingStyle: Bullet points (•) for buyer traits, one sentence each
4. communicationStyle: Bullet points (•) for communication traits, one sentence each
5. Keep descriptions practical and behavioral
6. If nuanced combinations are detected, incorporate that behavior naturally

Generate the JSON now:`,
    },
  ];
}

export function createAvatarGenerationPrompt({
  gender,
  age,
  role,
  location,
}: {
  gender: string;
  age: number;
  role: string;
  location?: string;
}) {
  const locationGuidance = location
    ? `${location} ethnicity with authentic features, `
    : '';

  const prompt = `Professional corporate portrait photograph.

SUBJECT:
- ${age}-year-old ${gender} ${role}
- ${locationGuidance}centered in frame
- Dressed appropriately for their profession
- From upper chest to top of head
- Looking directly at camera with face straight forward
- Gentle, natural smile
- Warm and approachable expression
- Professional and confident demeanor

COMPOSITION:
- Subject centered and close to camera
- Person takes up 75-85% of frame width
- Close-up professional headshot with subject filling most of the frame
- Shot at eye level, straight on
- Not too far from camera - subject should appear close and prominent

BACKGROUND:
- Professional environment appropriate for their role with soft bokeh blur effect
- Natural indoor environment visible but out of focus
- Warm, neutral tones
- Professional, clean, upscale environment

LIGHTING:
- Natural window light or soft indoor lighting
- Even, flattering illumination on face
- Soft shadows, no harsh lighting
- Warm, natural color temperature

PHOTOGRAPHY STYLE:
- Shot with professional camera with shallow depth of field
- Sharp focus on face and eyes
- Beautiful bokeh background blur
- Photorealistic professional photography
- High resolution
- Natural skin tones and colors

AVOID: Subject too far from camera, distant shots, off-center positioning, side angles, solid color backgrounds, harsh studio lighting, artificial backdrop, multiple people, tilted composition.`;

  return prompt;
}

/**
 * Builds the translation prompt for OpenAI
 */
export function getPersonaTranslationPrompt(
  content: PersonaTranslationContent,
  targetLang: Language,
): string {
  const contentToTranslate = {
    occupation: content.occupation,
    description: content.description || null,
    details: {
      location: content.details.location || null,
      education: content.details.education || null,
      workHistory: content.details.workHistory || null,
      financialSituation: content.details.financialSituation || null,
      keyPriorities: content.details.keyPriorities || null,
      companySizeAndSpend: content.details.companySizeAndSpend || null,
    },
    personalityDetails: content.personalityDetails
      ? {
          persona: content.personalityDetails.persona,
          communicationStyle: content.personalityDetails.communicationStyle,
          decisionMaking: content.personalityDetails.decisionMaking,
        }
      : null,
  };

  return `You are a professional translator. Translate the following persona content from English to ${targetLang.name} (${targetLang.nativeName}).

IMPORTANT RULES:
1. Translate all text naturally and fluently in ${targetLang.name}
2. Maintain the same tone and meaning
3. Keep proper nouns (names, company names) unchanged
4. Preserve the structure exactly
5. Return ONLY valid JSON with no additional text
6. For arrays, translate each item in the array
7. Keep null values as null

Content to translate:
${JSON.stringify(contentToTranslate, null, 2)}

Return the translated content as a JSON object with the EXACT same structure:
{
  "occupation": "translated occupation",
  "description": "translated description or null",
  "details": {
    "location": "translated or null",
    "education": "translated or null",
    "workHistory": "translated or null",
    "financialSituation": "translated or null",
    "keyPriorities": ["translated items"] or null,
    "companySizeAndSpend": "translated or null"
  },
  "personalityDetails": {
    "persona": "translated persona description",
    "communicationStyle": ["translated items"],
    "decisionMaking": ["translated items"]
  } or null
}

Translate now to ${targetLang.name}:`;
}
