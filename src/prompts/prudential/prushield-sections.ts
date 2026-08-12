export const prushieldProductKnowledgeSectionHeader = `\n[PRODUCT KNOWLEDGE ASSESSMENT]\n`;
export const prushieldOperationalKnowledgeSectionHeader = `\n[OPERATIONAL KNOWLEDGE ASSESSMENT]\n`;

export const prushieldProductBasicsSection = `
**Basics Assessment (Sales Novice Level)**

**Headline Provision:**
- Did they provide the correct headline: "PRUShield is a MediSave-approved Integrated Shield Plan that goes beyond providing access to affordable and quality healthcare. It's about ensuring peace of mind for you and your loved ones"?
- Was the headline accurate and complete?

**Needs Addressing:**
- Did they identify the client's financial objective?
- Did they justify how PRUShield suits the client's requirements and financial objectives?

**Unique Selling Points (Must cover all 3):**
- **Better Coverage**: Did they mention high annual coverage including cancer treatment, minimised out-of-pocket expenses and risk-based loading?
- **Better Savings**: Did they mention affordable plans tailored for different budgets?
- **Better Healthcare Experience**: Did they mention smooth hospitalisation with value-added services?
- Did they provide specific details for at least one USP?

**Existing Plan Inquiry:**
- Did they ask the customer if they currently hold an Integrated Shield Plan with another insurer?`;

export const prushieldProductIntermediateSection = `
**Intermediate Assessment (Skilled Advisor Level)**

**Coverage Details (Must explain all 3):**
- Did they explain the deductibles and co-insurance coverage?
- Did they explain Inpatient and Day Surgery Benefits?
- Did they explain Pre- and post-hospitalisation benefits?

**Premium Justification (Must cover all 3):**
- Did they explain why this premium amount is proposed?
- Did they explain how this addresses the client's identified shortfall/gap for the financial objective?
- Did they find out and explain if this amount is within the client's affordability?

**PRUPanel Connect Value-added Services (Must mention all 5):**
- Appointment booking
- Enhanced Letter of Guarantee
- Pre-authorisation process
- Concierge Service
- Extended Panel

**Risks and Limitations (Must explain all 4):**
- Implication of switching
- Pre-existing conditions
- Risks involved in this plan
- Freelook period`;

export const prushieldProductExpertSection = `
**Expert Assessment (Strategic Consultant Level)**

**Competitor Comparison:**
- Did they make comparison with similar solutions from competitors?
- Did they explain the differences between PRUShield and competitors?
- Did they provide pros and cons of PRUShield vs competitors?`;

export const prushieldOperationalBasicsSection = `
**Operational Basics Assessment (Sales Novice Level)**

**Underwriting Explanation:**
- Did they explain that this is a full medical underwriting plan?
- Did they explain that this will entail a full medical underwriting for the client?`;

export const prushieldOperationalIntermediateSection = `
**Operational Intermediate Assessment (Skilled Advisor Level)**

**Health Condition Probing:**
- Did they probe customers on existing health condition?
- Did they note down pre-existing condition if any?`;

export const prushieldOperationalExpertSection = `
**Operational Expert Assessment (Strategic Consultant Level)**

**Claims Process Explanation:**
- Did they explain the claim process for regular scenarios?
- Did they explain the claim process if the client has a company medical insurance plan?

**Claims-Based Pricing:**
- Did they explain how claims-based pricing works?
- Did they provide claims-based pricing scenarios for different sources of claims?
- Did they explain the impact to premiums?

**PRUWell Rewards:**
- Did they explain the benefits of PRUWell Rewards?
- Did they explain the conditions that need to be met?

[PRUSHIELD FEEDBACK GUIDELINES - CRITICAL]
1. **Precision Required**: Each criterion must be evaluated precisely - partial explanations should be marked as false unless they meet the full requirement.
2. **PRUShield-Specific**: Only PRUShield-specific information counts - generic insurance explanations do not satisfy PRUShield criteria.
3. **Completed Items Rules**:
   - Use positive, past-tense phrasing: "You successfully explained...", "You accurately provided...", "You properly identified..."
   - Focus on specific PRUShield knowledge demonstrated
   - Each item should reference specific PRUShield features or processes
4. **To Improve Items Rules**:
   - Use direct, specific phrasing: "You didn't explain PRUShield's deductible structure", "You missed mentioning the Enhanced Letter of Guarantee"
   - Focus on specific PRUShield knowledge gaps
   - Prioritize the most critical missing elements for each level
   - **CRITICAL**: Provide concrete examples of better explanations when applicable. For example: "Instead, you could have said: '[specific example of how to explain the PRUShield feature]'" or "A better explanation would be: '[specific example]'"

[PRUSHIELD SCORING GUIDELINES]
- **Sales Novice (Score: 0-33)**: Calculate \`overallScore\` as percentage of completed \`prushieldBasics\` criteria multiplied by 33. For example: if 2 out of 10 basics are completed, score = (2/10) * 33 = 7. Round to nearest integer. **MANDATORY**: If the user has ANY completed items listed (even just 1 completed item), the minimum score MUST be at least 1. Set \`overallScore\` to 0 ONLY if there are zero completed items listed.
- **Skilled Advisor (Score: 34-66)**: Awarded only if ALL \`prushieldBasics\` criteria are met. The \`overallScore\` for BOTH knowledge areas cannot exceed 66 if any \`prushieldIntermediate\` criteria are missed.
- **Strategic Consultant (Score: 67-100)**: Awarded only if ALL \`prushieldBasics\` and \`prushieldIntermediate\` criteria are met. The score is then based on the \`prushieldExpert\` performance.`;
