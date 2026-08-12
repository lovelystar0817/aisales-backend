export const pruwealthProductKnowledgeSectionHeader = `
[PRODUCT KNOWLEDGE ASSESSMENT]
`;
export const pruwealthOperationalKnowledgeSectionHeader = `
[OPERATIONAL KNOWLEDGE ASSESSMENT]
`;

export const pruwealthProductBasicsSection = `
**Basics Assessment (Sales Novice Level)**

**Headline Provision:**
- Did they provide the correct headline that PRUWealth Plus is a single premium participating whole life policy until age 130 with wealth accumulation and comprehensive protection?
- Was the headline accurate and complete?

**Needs Addressing:**
- Did they identify the client's financial objective (wealth accumulation, protection, retirement planning, wealth transfer)?
- Did they justify how PRUWealth Plus suits the client's requirements and objectives?

**Unique Selling Points (Must cover all 5):**
- **Extended Coverage**: Protection until age 130 (vs competitors' age 99-100)
- **Retrenchment Benefit**: 10% of single premium in first 5 years (one-time)
- **Secondary Life Assured**: Policy continues on primary life assured death
- **Change of Life Assured**: Unlimited changes after 2 years for estate planning
- **SRS Compatibility**: Can be purchased with SRS funds for retirement planning
- Did they provide specific details for at least one USP?

**Coverage Provided (Must mention all 3):**
- Death benefits: 101% premium/surrender value (regular), 105% (accidental death)
- Bonuses: Reversionary and performance bonuses
- Maturity benefit at age 130

**Bonuses Explanation:**
- Reversionary bonus: Non-guaranteed, becomes guaranteed when declared from year 2
- Performance bonus: Non-guaranteed, paid at surrender/claim/maturity

**Policy Timeline/Mechanics (Must mention all):**
- Single premium payment structure
- Coverage extends to age 130
- Face value vs sum assured distinction (face value for bonus calculations)
- Policy loans (70% of surrender value)
- Surgical/nursing loans (interest-free, up to 10% premium/surrender value)

**Risks & Limitations:**
- Early surrender value may be less than premium paid
- Bonuses are non-guaranteed
- SRS policies have restrictions (no joint ownership, no secondary LA, no loans)`;

export const pruwealthProductIntermediateSection = `
**Intermediate Assessment (Skilled Advisor Level)**

**Bonus Structure Details:**
- Explained reversionary bonus calculation from face value and how it becomes guaranteed
- Explained performance bonus as percentage of accumulated reversionary bonuses
- Explained how bonuses affect maturity benefit calculation

**Death Benefit Calculations:**
- Explained regular death (101%) vs accidental death (105%) calculations
- Explained pre-existing condition exclusions (12 months)
- Explained suicide clause (12 months void period)

**Wealth Transfer Features:**
- Explained secondary life assured mechanics (primary dies, secondary becomes new primary, no death benefit paid)
- Explained change of life assured process (2-year waiting, cover end date unchanged)

**Loan Facilities:**
- Explained policy loan details (70% surrender value, variable interest)
- Explained surgical/nursing loan details (interest-free, 10% max, exclusions apply)

**Retrenchment Benefit Details:**
- Explained retrenchment eligibility (10% premium, first 5 years, 90-day waiting, 30-day unemployment, full-time 6+ months employed)`;

export const pruwealthProductExpertSection = `
**Expert Assessment (Strategic Consultant Level)**

**Personalization & Comparison:**
- Related USPs (age 130, retrenchment, wealth transfer) to client specific scenario and objectives
- Compared vs similar single premium participating products (Great Eastern, AIA, NTUC Income) and explained competitive advantages
- Spoke the policy timeline in client age/perspective (e.g., 'for a 45-year-old, this provides 85 years of coverage')
- Explained face value vs sum assured distinction clearly and how it affects bonus calculations vs death benefit`;

export const pruwealthOperationalBasicsSection = `
**Operational Basics Assessment (Sales Novice Level)**

**Plan Rules & Basics:**
- Explained single premium participating whole life structure
- Explained basic policy loan mechanics (up to 70% surrender value)
- Explained surgical/nursing loan availability (interest-free, up to 10%)`;

export const pruwealthOperationalIntermediateSection = `
**Operational Intermediate Assessment (Skilled Advisor Level)**

**SRS & Nominations:**
- Explained SRS compatibility and restrictions (no joint ownership, no secondary LA, no change LA, no policy loans)
- Explained nomination/trust options (49L, 49M, Juvenile, Educational) and mutual exclusivity with secondary life assured

**Bonus & Policy Management:**
- Explained bonus surrender process (can surrender reversionary bonus for cash value less than face value; performance bonus cannot be surrendered separately)
- Explained reinstatement window (24 months, under age 65, health evidence required)`;

export const pruwealthOperationalExpertSection = `
**Operational Expert Assessment (Strategic Consultant Level)**

**Wealth Transfer Strategies:**
- Explained wealth transfer strategies using secondary life assured for continuation planning
- Explained change of life assured for estate planning flexibility and wealth transfer to next generation

**Policy Sustainability:**
- Discussed policy sustainability for long-term coverage to age 130 (managing surrender value, when to consider bonus surrender, impact of policy loans)

**Retrenchment Exclusions & Critical Timeframes:**
- Clarified retrenchment benefit exclusions (part-time, self-employed, contract workers, resignation, retirement, poor performance dismissal)
- Explained critical timeframes (14-day free look, 90-day retrenchment waiting, 12-month pre-existing/suicide exclusions, 2-year incontestability and change of LA eligibility)

[PRUWEALTH FEEDBACK GUIDELINES - CRITICAL]
1. **Precision Required**: Each criterion must be evaluated precisely - partial explanations should be marked as false unless they meet the full requirement.
2. **PRUWealth-Specific**: Only PRUWealth-specific information counts - generic insurance explanations do not satisfy PRUWealth criteria.
3. **Completed Items Rules**:
   - Use positive, past-tense phrasing: "You successfully explained...", "You accurately provided...", "You properly identified..."
   - Focus on specific PRUWealth knowledge demonstrated
   - Each item should reference specific PRUWealth features or processes
4. **To Improve Items Rules**:
   - Use direct, specific phrasing: "You didn't explain PRUWealth's single premium structure", "You missed mentioning the secondary life assured feature"
   - Focus on specific PRUWealth knowledge gaps
   - Prioritize the most critical missing elements for each level
   - **CRITICAL**: Provide concrete examples of better explanations when applicable. For example: "Instead, you could have said: '[specific example of how to explain the PRUWealth feature]'" or "A better explanation would be: '[specific example]'"

[PRUWEALTH SCORING GUIDELINES]
- **Sales Novice (Score: 0-33)**: Calculate \`overallScore\` as percentage of completed \`pruwealthBasics\` criteria multiplied by 33. For example: if 2 out of 10 basics are completed, score = (2/10) * 33 = 7. Round to nearest integer. **MANDATORY**: If the user has ANY completed items listed (even just 1 completed item), the minimum score MUST be at least 1. Set \`overallScore\` to 0 ONLY if there are zero completed items listed.
- **Skilled Advisor (Score: 34-66)**: Awarded only if ALL \`pruwealthBasics\` criteria are met. The \`overallScore\` for BOTH knowledge areas cannot exceed 66 if any \`pruwealthIntermediate\` criteria are missed.
- **Strategic Consultant (Score: 67-100)**: Awarded only if ALL \`pruwealthBasics\` and \`pruwealthIntermediate\` criteria are met. The score is then based on the \`pruwealthExpert\` performance.`;
