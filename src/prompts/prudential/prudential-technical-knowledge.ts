import { ChatPromptTemplate } from '@langchain/core/prompts';
import { getLanguageName } from '../../utils/languages.js';
import {
  prushieldProductKnowledgeSectionHeader,
  prushieldOperationalKnowledgeSectionHeader,
  prushieldProductBasicsSection,
  prushieldProductIntermediateSection,
  prushieldProductExpertSection,
  prushieldOperationalBasicsSection,
  prushieldOperationalIntermediateSection,
  prushieldOperationalExpertSection,
} from './prushield-sections.js';
import {
  prulifetimeProductKnowledgeSectionHeader,
  prulifetimeOperationalKnowledgeSectionHeader,
  prulifetimeProductBasicsSection,
  prulifetimeProductIntermediateSection,
  prulifetimeProductExpertSection,
  prulifetimeOperationalBasicsSection,
  prulifetimeOperationalIntermediateSection,
  prulifetimeOperationalExpertSection,
} from './prulifetime-sections.js';
import {
  pruvantageProductKnowledgeSectionHeader,
  pruvantageOperationalKnowledgeSectionHeader,
  pruvantageProductBasicsSection,
  pruvantageProductIntermediateSection,
  pruvantageProductExpertSection,
  pruvantageOperationalBasicsSection,
  pruvantageOperationalIntermediateSection,
  pruvantageOperationalExpertSection,
} from './pruvantage-sections.js';
import {
  pruwealthProductKnowledgeSectionHeader,
  pruwealthOperationalKnowledgeSectionHeader,
  pruwealthProductBasicsSection,
  pruwealthProductIntermediateSection,
  pruwealthProductExpertSection,
  pruwealthOperationalBasicsSection,
  pruwealthOperationalIntermediateSection,
  pruwealthOperationalExpertSection,
} from './pruwealth-sections.js';

const baseTemplate = `You are a precise data extraction agent and expert sales coach for Prudential. Your task is to analyze a sales conversation transcript and provide a comprehensive technical knowledge assessment covering all required areas.

**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.**
- Messages from "user:" are from the salesperson. Analyze ONLY these.
- Messages from "ai:" are from the prospect. IGNORE THESE COMPLETELY.

[ASSESSMENT CRITERIA]`;

const productKnowledgeSection = `
**1. Product Knowledge Assessment**
Analyze the user's demonstration of product knowledge against the provided product information. Evaluate their ability to accurately explain product features, benefits, and specifications.

**If the assessment includes detailed product-specific sections (e.g., for PRUShield), this section MUST be a high-level summary of those detailed checks. Synthesize the findings from the product-specific criteria (e.g., USPs, Coverage Details, Competitor Comparison) to generate the overall score and feedback items below. Do not perform a separate, redundant analysis.**

**Output for productKnowledge:**
- "overallScore": Score 0-100 based on product knowledge demonstration, adhering to the scoring guidelines
- "completedItems": List of product knowledge strengths demonstrated
- "toImproveItems": List of product knowledge areas that need improvement`;

const operationalKnowledgeSection = `
**2. Operational Knowledge Assessment**
Analyze the user's understanding of operational aspects, processes, and practical application of the product in real-world scenarios.

**If the assessment includes detailed product-specific sections (e.g., for PRUShield), this section MUST be a high-level summary of those detailed checks. Synthesize the findings from the operational-specific criteria (e.g., Underwriting, Claims Process, Servicing) to generate the overall score and feedback items below. Do not perform a separate, redundant analysis.**

**Output for operationalKnowledge:**
- "overallScore": Score 0-100 based on operational knowledge demonstration, adhering to the scoring guidelines
- "completedItems": List of operational knowledge strengths demonstrated
- "toImproveItems": List of operational knowledge areas that need improvement

[FEEDBACK GUIDELINES - CRITICAL]
1. **Holistic Assessment**: Focus on the most impactful successes and failures across the entire interaction.
2. **Completed Items Rules**:
   - Use positive, past-tense phrasing: "You successfully...", "You effectively...", "You demonstrated..."
   - Focus on genuine successes and strengths demonstrated
   - NEVER include mixed positive-negative feedback in completed items
   - Each item should clearly represent something done well
3. **To Improve Items Rules**:
   - Use direct, past-tense phrasing: "You didn't...", "You failed to...", "You missed..."
   - Focus on critical gaps and missed opportunities
   - Each item should be actionable and specific
   - Prioritize the most important areas for improvement
   - **CRITICAL**: Provide concrete examples of better explanations when applicable. For example: "Instead, you could have said: '[specific example of how to explain the feature]'" or "A better explanation would be: '[specific example]'"
4. **Quality Over Quantity**:
   - Aim for 2-4 completed items highlighting key successes
   - Aim for 3-5 to improve items focusing on critical gaps
   - Each item should provide meaningful, actionable insight`;

// Product-specific assessment sections are now imported from separate files

const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}
Objectives: {objectives}
Framework: {framework}

[PRODUCT INFORMATION]
{productInfo}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

{extraContext}

Please extract the required information and provide a technical knowledge assessment based on the user's messages in the transcript, adhering to all the criteria provided. Cross-reference all product claims against the provided product information to identify any inaccuracies. Output ONLY valid JSON using the exact format specified in the system prompt.`;

export function getPrudentialTechnicalKnowledgePrompt(
  callType: string,
  characterName: string,
  language?: string,
  productFriendlyId?: string,
) {
  const systemPromptSections = [baseTemplate];

  // Add product-specific sections based on the product
  if (productFriendlyId === 'prushield') {
    systemPromptSections.push(
      prushieldProductKnowledgeSectionHeader,
      productKnowledgeSection,
      prushieldProductBasicsSection,
      prushieldProductIntermediateSection,
      prushieldProductExpertSection,
      prushieldOperationalKnowledgeSectionHeader,
      operationalKnowledgeSection,
      prushieldOperationalBasicsSection,
      prushieldOperationalIntermediateSection,
      prushieldOperationalExpertSection,
    );
  } else if (productFriendlyId === 'prulifetime-income-plus') {
    systemPromptSections.push(
      prulifetimeProductKnowledgeSectionHeader,
      productKnowledgeSection,
      prulifetimeProductBasicsSection,
      prulifetimeProductIntermediateSection,
      prulifetimeProductExpertSection,
      prulifetimeOperationalKnowledgeSectionHeader,
      operationalKnowledgeSection,
      prulifetimeOperationalBasicsSection,
      prulifetimeOperationalIntermediateSection,
      prulifetimeOperationalExpertSection,
    );
  } else if (productFriendlyId === 'pruvantage-assure-ii') {
    systemPromptSections.push(
      pruvantageProductKnowledgeSectionHeader,
      productKnowledgeSection,
      pruvantageProductBasicsSection,
      pruvantageProductIntermediateSection,
      pruvantageProductExpertSection,
      pruvantageOperationalKnowledgeSectionHeader,
      operationalKnowledgeSection,
      pruvantageOperationalBasicsSection,
      pruvantageOperationalIntermediateSection,
      pruvantageOperationalExpertSection,
    );
  } else if (productFriendlyId === 'pruwealth-plus') {
    systemPromptSections.push(
      pruwealthProductKnowledgeSectionHeader,
      productKnowledgeSection,
      pruwealthProductBasicsSection,
      pruwealthProductIntermediateSection,
      pruwealthProductExpertSection,
      pruwealthOperationalKnowledgeSectionHeader,
      operationalKnowledgeSection,
      pruwealthOperationalBasicsSection,
      pruwealthOperationalIntermediateSection,
      pruwealthOperationalExpertSection,
    );
  }

  let systemPrompt = systemPromptSections.join('\n');
  systemPrompt = systemPrompt.replaceAll('{{characterName}}', characterName);

  let userPrompt = userTemplate;
  if (language) {
    const languageName = getLanguageName(language);
    systemPrompt = `${systemPrompt}\n\n[LANGUAGE]\nIMPORTANT: The output must be in ${languageName} language.`;

    userPrompt += `\n\n[LANGUAGE]\nIMPORTANT: The output must be in ${languageName} language.`;
  }

  return ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['user', userPrompt],
  ]);
}
