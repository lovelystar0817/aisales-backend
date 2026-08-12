export const pruvantageProductKnowledgeSectionHeader = `
[PRODUCT KNOWLEDGE ASSESSMENT]
`;
export const pruvantageOperationalKnowledgeSectionHeader = `
[OPERATIONAL KNOWLEDGE ASSESSMENT]
`;

export const pruvantageProductBasicsSection = `
**Basics Assessment (Sales Novice Level)**

**Headline Provision:**
- Did they provide the correct headline that PRUVantage Assure II is a regular premium, whole of life investment-linked policy with downside protection (Wealth Assure) and Dual Accounts?
- Was the headline accurate and complete?

**Needs Addressing:**
- Did they identify the client's financial objective (wealth accumulation, flexibility, protection)?
- Did they justify how PRUVantage Assure II suits the client's requirements and objectives?

**Unique Selling Points (Must cover all 3):**
- **Wealth Assure**: Locks the highest daily account value (up to S$20M or 3x lifetime premium)
- **Coverage Growth**: Sum Assured starts at 103% and increases 3% yearly up to 160%
- **Dual Accounts**: Growth vs Flex (Welcome Bonus, dividend timing differences)
- Did they provide specific details for at least one USP?

**Plan Mechanics (Must mention all 3):**
- Death/Accidental Disability payout: highest of (Sum Assured, Wealth Assure Value, Account value) plus Additional Investment Account
- Bonuses: Welcome Bonus (first 3 years) and Loyalty Bonus (0.5% annually after term)
- UOB specifics if applicable: default 100% Growth allocation; entry age up to 65 ANB`;

export const pruvantageProductIntermediateSection = `
**Intermediate Assessment (Skilled Advisor Level)**

**Account & Allocation Details:**
- Explained Dual Account allocation and that allocation is fixed during premium term
- Explained Additional Investment Account (Investment Booster top-ups, 3% charge, min S$1,000)

**Premium/Charges & Flexibility:**
- Explained surrender/withdrawal charge structure across premium terms
- Explained Premium Pass, Wealth Share, and Change of Life Assured processes at a high level

**Risk & Limitations:**
- Explained investment risk and impact of charges with age/market conditions
- Explained withdrawals reduce Sum Assured/Wealth Assure mechanics where applicable`;

export const pruvantageProductExpertSection = `
**Expert Assessment (Strategic Consultant Level)**

**Personalization & Comparison:**
- Related USPs and account choices to client scenario and objectives
- Compared vs similar ILPs or endowments, explaining differences, pros and cons
- Spoke the policy timeline in client age/perspective`;

export const pruvantageOperationalBasicsSection = `
**Operational Basics Assessment (Sales Novice Level)**

**Plan Rules & Basics:**
- Explained minimum contribution period (first 24 months) and consequences
- Explained fund switching basics and dividend options timing (Growth vs Flex)`;

export const pruvantageOperationalIntermediateSection = `
**Operational Intermediate Assessment (Skilled Advisor Level)**

**Servicing Processes:**
- Explained partial withdrawals, top-ups, and impact on values
- Explained how to activate Premium Pass and its effects
- Explained Wealth Share prerequisites at a high level`;

export const pruvantageOperationalExpertSection = `
**Operational Expert Assessment (Strategic Consultant Level)**

**Advanced Scenarios & Risk Management:**
- Explained administration/assurance charges and sustainability considerations
- Provided nuanced examples for allocation choices and portfolio scenarios
- Clarified non-consideration of Wealth Assure for surrender value calculation

[PRUVANTAGE FEEDBACK GUIDELINES - CRITICAL]
1. **Precision Required**: Each criterion must be evaluated precisely - partial explanations should be marked as false unless they meet the full requirement.
2. **PRUVantage-Specific**: Only PRUVantage-specific information counts - generic insurance explanations do not satisfy PRUVantage criteria.
3. **Completed Items Rules**:
   - Use positive, past-tense phrasing: "You successfully explained...", "You accurately provided...", "You properly identified..."
   - Focus on specific PRUVantage knowledge demonstrated
   - Each item should reference specific PRUVantage features or processes
4. **To Improve Items Rules**:
   - Use direct, specific phrasing: "You didn't explain PRUVantage's Wealth Assure feature", "You missed mentioning the Dual Account allocation"
   - Focus on specific PRUVantage knowledge gaps
   - Prioritize the most critical missing elements for each level
   - **CRITICAL**: Provide concrete examples of better explanations when applicable. For example: "Instead, you could have said: '[specific example of how to explain the PRUVantage feature]'" or "A better explanation would be: '[specific example]'"

[PRUVANTAGE SCORING GUIDELINES]
- **Sales Novice (Score: 0-33)**: Calculate \`overallScore\` as percentage of completed \`pruvantageBasics\` criteria multiplied by 33. For example: if 2 out of 10 basics are completed, score = (2/10) * 33 = 7. Round to nearest integer. **MANDATORY**: If the user has ANY completed items listed (even just 1 completed item), the minimum score MUST be at least 1. Set \`overallScore\` to 0 ONLY if there are zero completed items listed.
- **Skilled Advisor (Score: 34-66)**: Awarded only if ALL \`pruvantageBasics\` criteria are met. The \`overallScore\` for BOTH knowledge areas cannot exceed 66 if any \`pruvantageIntermediate\` criteria are missed.
- **Strategic Consultant (Score: 67-100)**: Awarded only if ALL \`pruvantageBasics\` and \`pruvantageIntermediate\` criteria are met. The score is then based on the \`pruvantageExpert\` performance.`;
