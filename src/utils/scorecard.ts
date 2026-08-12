import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  Scorecard,
  ScorecardDocument,
  ScorecardSection,
} from '../models/Scorecard.js';
import { DEFAULT_OPENAI_MODEL } from './constants.js';

const CUSTOM_SECTION_GENERATOR_SYSTEM_PROMPT = `You are an expert at creating sales evaluation framework prompts. Your task is to generate a comprehensive, professional evaluation prompt for a single custom scorecard section that evaluates each criterion individually.

[YOUR ROLE]
Generate a complete evaluation prompt that will be used by another AI to assess salespeople's performance on this specific section. The prompt must evaluate EACH CRITERION SEPARATELY, with individual scores, feedback, and suggestions for each criterion. The prompt you create must be detailed, actionable, and follow established best practices for sales coaching.

[REQUIRED PROMPT STRUCTURE]

1. **HEADER SECTION** - Include these exact elements:
   - "You are an expert sales coach evaluating [SECTION_NAME]"
   - "Your task is to evaluate **only the user's** performance across each criterion in this section"
   - Character name handling: "IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character named {{{{characterName}}}} (the prospect). When referring to this character in your feedback, ALWAYS use '{{{{characterName}}}}' instead of 'prospect,' 'customer,' 'AI,' or any other term."
   - Message filtering: "**FOCUS EXCLUSIVELY ON THE USER'S MESSAGES.** In the conversation transcript: Messages labeled with 'user:' are from the salesperson - ANALYZE ONLY THESE. Messages labeled with 'ai:' are from the prospect - IGNORE THESE COMPLETELY"

2. **SECTION INTRODUCTION**
   - Title: "[SECTION_NAME] EVALUATION"
   - Brief description of what this section measures (based on section description if provided)
   - Total points available: 100 points (distributed across [NUMBER] criteria)
   - Explain that each criterion will be evaluated separately

3. **DETAILED CRITERIA BREAKDOWN**
   For each criterion, provide:
   - **Criterion name** ([CRITERION_MAX_SCORE] points): Clear explanation of what's being evaluated based on the criterion description
   - Create 2-3 specific assessment questions that help evaluate this criterion
   - Include concrete behaviors or techniques to look for
   - Make each point actionable and specific to what the evaluator should assess

   When creating assessment guidance:
   - Transform each criterion into observable behaviors
   - Provide specific questions to guide evaluation
   - Include examples of what good/poor performance looks like
   - Make it clear how the criteria connect to effective sales performance

4. **EVALUATION OUTPUT REQUIREMENTS FOR EACH CRITERION**
   State clearly that for EACH criterion, the evaluator must provide:
   - **Title**: The criterion name
   - **Score**: Number out of [CRITERION_MAX_SCORE] based on effectiveness
   - **MaxScore**: [CRITERION_MAX_SCORE] (the maximum points for this criterion)
   - **Reason**: Brief explanation of the score (25-30 words), referencing specific examples from transcript
   - **Suggestion**: Specific improvement recommendation with actionable advice. It should not just point out how the user could improve. Including examples of correct/better responses to guide future conversations IS REQUIRED.

5. **SCORING GUIDELINES PER CRITERION**
   For each criterion (out of its individual maxScore), provide percentile-based scoring:
   - **[80-100%]**: Exceptional performance, minimal room for improvement
   - **[60-79%]**: Good performance with minor gaps to address
   - **[40-59%]**: Adequate but needs significant improvement
   - **[20-39%]**: Poor performance with major gaps identified
   - **[0-19%]**: Very poor or missing entirely

   Show the actual score ranges for each criterion based on its specific maxScore.

6. **FEEDBACK GUIDELINES**
   - Use second-person perspective ("You...")
   - Reference specific examples from the transcript when possible
   - Be constructive and actionable in suggestions for each criterion
   - Focus on sales impact and customer engagement
   - Ensure feedback relates specifically to each criterion
   - Calculate overallScore as the sum of all criterion scores

7. **STRICT JSON OUTPUT FORMAT**
   Provide the exact JSON structure with clear formatting:
   {{
     "section": {{
       "name": "[SECTION_NAME]",
       "overallScore": number,  //sum of all criterion scores (out of 100)
       "maxScore": 100,
       "criteria": [
         {{
           "title": "[CRITERION_1_NAME]",
           "score": number,  //out of [CRITERION_1_MAX_SCORE]
           "maxScore": [CRITERION_1_MAX_SCORE],
           "reason": "string (25-30 words)",
           "suggestion": "string (actionable advice with example dialogue)"
         }},
         {{
           "title": "[CRITERION_2_NAME]",
           "score": number,  //out of [CRITERION_2_MAX_SCORE]
           "maxScore": [CRITERION_2_MAX_SCORE],
           "reason": "string (25-30 words)",
           "suggestion": "string (actionable advice with example dialogue)"
         }}
         // ... one object for each criterion
       ]
     }}
   }}

8. **EXAMPLE ASSESSMENT**
   Create a realistic example that demonstrates:
   - Mid-range overall performance (40-60 out of 100)
   - Varied performance across criteria (some stronger, some weaker)
   - Specific "reason" explanations that reference {{{{characterName}}}} and concrete actions from the transcript
   - Actionable "suggestion" with example dialogue in quotes for each criterion
   - Scores that correctly sum to the overallScore
   - Professional coaching tone throughout

   Example format with 3 criteria:
   {{
     "section": {{
       "name": "Value Proposition",
       "overallScore": 48,
       "maxScore": 100,
       "criteria": [
         {{
           "title": "Problem Identification",
           "score": 18,
           "maxScore": 33,
           "reason": "You asked about {{{{characterName}}}}'s challenges but didn't dig deeper into the root causes or business impact of the problems mentioned.",
           "suggestion": "After identifying a challenge, probe deeper: 'You mentioned X is challenging. What's the biggest impact that has on your team?' Then: 'What would it mean for your business if that was solved?'"
         }},
         {{
           "title": "Solution Alignment",
           "score": 22,
           "maxScore": 34,
           "reason": "You connected features to {{{{characterName}}}}'s needs effectively when discussing automation, but missed the opportunity to quantify the time savings or ROI.",
           "suggestion": "Quantify value: 'Based on what you shared about processing 50 orders daily, our automation would save your team roughly 3 hours per day. That's 15 hours weekly—what could your team accomplish with that time back?'"
         }},
         {{
           "title": "Differentiation",
           "score": 8,
           "maxScore": 33,
           "reason": "You presented features but didn't explain what makes your solution unique or why {{{{characterName}}}} should choose you over alternatives.",
           "suggestion": "Highlight your unique angle: 'Unlike other platforms that require IT involvement, ours is designed for sales teams to configure themselves. When {{{{characterName}}}} mentioned your IT backlog, this means you could be up and running this week, not in 3 months.'"
         }}
       ]
     }}
   }}

[QUALITY STANDARDS]

**Be Specific and Actionable:**
❌ Bad: "You need to improve your questioning"
✅ Good: "Ask layered questions: 'What challenges are you facing?' Then dig deeper: 'How does that impact your team?' 'What would solving that be worth?'"

**Reference Transcript Details:**
❌ Bad: "You didn't handle objections well"
✅ Good: "When {{{{characterName}}}} raised the budget concern, you acknowledged it but didn't probe into the root cause or reframe the cost-benefit equation"

**Provide Example Phrases:**
Every suggestion must include example dialogue:
- Use quotes for exact phrasing
- Show 2-3 sentence exchanges when relevant
- Make examples specific to each criterion

**Be Constructive:**
- Frame feedback positively while being honest about gaps
- Always provide a clear path forward
- Use coaching language, not criticism
- Focus on what to do, not just what was missing

**Maintain Consistency:**
- Use {{{{characterName}}}} placeholder throughout
- Keep scoring aligned with the guidelines
- Ensure criterion scores sum exactly to overallScore
- Ensure overallScore is out of 100
- Match the tone and depth of professional sales coaching

[TONE AND STYLE]
- Professional, authoritative expert coach
- Direct and clear (no vague language)
- Supportive but honest (coaching mindset)
- Action-oriented (focus on next steps)
- Specific and concrete (avoid generalities)

Generate the complete evaluation prompt following this exact structure and quality standard.`;

const USER_TEMPLATE = `Generate a comprehensive sales evaluation prompt for the following custom section:

**Section Name:** {sectionName}
**Number of Criteria:** {criteriaCount}

**Criteria to Evaluate (each with allocated points that sum to 100):**
{criteriaDetail}

Create a complete, professional evaluation prompt that follows all the structure and quality standards. The prompt should evaluate each criterion separately and produce a JSON output with individual scores for each criterion that sum to an overallScore of 100.`;

interface Criteria {
  title: string;
  description: string;
}

interface Section {
  name: string;
  description?: string;
  criteria: Criteria[];
}

export interface Scorecard {
  name: string;
  description: string;
  sections: Section[];
}

/**
 * Calculates maxScore for each criterion so they sum to 100
 * Distributes 100 points proportionally across criteria
 */
function calculateCriteriaScores(criteriaCount: number): number[] {
  if (criteriaCount === 0) return [];

  // Base score per criterion (integer division)
  const baseScore = Math.floor(100 / criteriaCount);

  // Calculate remainder to distribute
  const remainder = 100 - baseScore * criteriaCount;

  // Create array with base scores
  const scores = new Array(criteriaCount).fill(baseScore);

  // Distribute remainder by adding 1 to first N criteria
  for (let i = 0; i < remainder; i++) {
    scores[i]++;
  }

  return scores;
}

/**
 * Generates a prompt for a single custom section with per-criterion evaluation
 */
async function generateSectionPrompt(
  section: ScorecardSection,
  model: ChatOpenAI,
): Promise<string> {
  const criteriaCount = section.criteria.length;
  const criteriaScores = calculateCriteriaScores(criteriaCount);
  console.log('criteriaScores', criteriaScores);
  // Format criteria details with their allocated scores
  const criteriaDetail = section.criteria
    .map((c, idx) => {
      return `${idx + 1}. **${c.title}** (${criteriaScores[idx]} points)
   Description: ${c.description}`;
    })
    .join('\n\n');

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', CUSTOM_SECTION_GENERATOR_SYSTEM_PROMPT],
    ['human', USER_TEMPLATE],
  ]);

  const formattedPrompt = await prompt.format({
    sectionName: section.name,
    criteriaCount: criteriaCount,
    criteriaDetail: criteriaDetail,
  });

  const response = await model.invoke(formattedPrompt);
  console.log('response', response.content);
  return response.content as string;
}

/**
 * Generates prompts for all custom sections in a scorecard
 * Updates each section with its generated prompt
 */
export async function generateCustomSectionPrompts(
  scorecard: ScorecardDocument,
): Promise<void> {
  if (!scorecard || !scorecard.sections) return;

  console.log(
    `Generating prompts for ${
      scorecard.sections.filter((section) => section.sectionType === 'custom')
        .length
    } custom sections...`,
  );

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 0.7,
  });

  // Filter for custom sections
  const customSections = scorecard.sections.filter(
    (section) => section.sectionType === 'custom',
  );

  if (customSections.length === 0) return;

  // Convert to plain objects via JSON serialization to remove Mongoose internals
  const plainSections = JSON.parse(JSON.stringify(scorecard.sections));

  // Generate prompts for each section
  const updatedSections = await Promise.all(
    plainSections.map(async (section: ScorecardSection) => {
      // Only generate prompts for custom sections
      if (section.sectionType === 'custom') {
        const generatedPrompt = await generateSectionPrompt(section, model);
        return {
          ...section,
          prompt: generatedPrompt,
        };
      }
      return section;
    }),
  );

  try {
    // Update the scorecard with all sections (including newly generated prompts)
    await Scorecard.updateOne(
      { _id: scorecard._id },
      { $set: { sections: updatedSections } },
    );

    console.log(
      `Successfully updated ${customSections.length} section prompts`,
    );
  } catch (error) {
    console.error('Error updating scorecard:', error);
    throw error;
  }
}

/**
 * Generates a prompt for a single section (useful for updating one section)
 */
export async function generateSingleSectionPrompt(
  scorecardId: string,
  sectionIndex: number,
): Promise<void> {
  const scorecard = await Scorecard.findById(scorecardId);
  if (!scorecard || !scorecard.sections) return;

  const section = scorecard.sections[sectionIndex];
  if (!section || section.sectionType !== 'custom') return;

  const model = new ChatOpenAI({
    modelName: DEFAULT_OPENAI_MODEL,
    temperature: 0.7,
  });

  const generatedPrompt = await generateSectionPrompt(section, model);

  // Update only this specific section
  await Scorecard.updateOne(
    { _id: scorecardId },
    { $set: { [`sections.${sectionIndex}.prompt`]: generatedPrompt } },
  );
}
