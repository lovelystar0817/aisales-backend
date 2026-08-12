export const prulifetimeProductKnowledgeSectionHeader = `\n[PRODUCT KNOWLEDGE ASSESSMENT]\n`;
export const prulifetimeOperationalKnowledgeSectionHeader = `\n[OPERATIONAL KNOWLEDGE ASSESSMENT]\n`;

export const prulifetimeProductBasicsSection = `
**Basics Assessment (Sales Novice Level)**

**Headline Provision:**
- Did they provide the correct headline: "PRULifetime Income Plus is an insurance solution that provides a regular stream of monthly income for life"?
- Was the headline accurate and complete?

**Needs Addressing:**
- Did they identify the client's financial objective?
- Did they justify how PRULifetime suits the client's requirements and financial objectives?

**Unique Selling Points (Must mention all key features):**
- **Monthly Cash Benefit**: Monthly cash benefit starting from the 49th month
- **Disability Waiver Benefit**: Disability waiver benefit
- **Retrenchment Benefit**: Retrenchment benefit
- **Change of Life Assured**: Change of life assured benefit for wealth transfer

**Customer Suitability:**
- Did they identify appropriate customer profile?
- Did they recognize inappropriate customer scenarios?
- Did they connect the solution to specific financial objectives?

**Cash Benefit Details:**
- Guaranteed portion
- Non-guaranteed portion
- Payment options (receive monthly or accumulate with PACS)
- Benefits start from the 49th policy month

**Payment Terms (Must explain all options):**
- Payment term options (4 or 10 years only)
- Surrender value timeline differences between 4-year and 10-year terms

**Death Benefits:**
- Non-accidental death benefits
- Accidental death benefits

**Premium Justification (Must cover all aspects):**
- Why this premium amount is proposed
- How this addresses the client's identified financial objective
- Whether the amount is within the client's affordability

**Fixed Deposit Comparison:**
- Explain how this plan differs from fixed deposits and why it offers better benefits for the client

**Risks and Limitations (Must explain all key risks):**
- Implication of early surrender or termination
- Non-guaranteed elements and their risks
- Freelook period`;

export const prulifetimeProductIntermediateSection = `
**Intermediate Assessment (Skilled Advisor Level)**

**Fully Explained Product Information:**
- Did they fully explain ALL product information items listed in the Sales Novice criteria above?`;

export const prulifetimeProductExpertSection = `
**Expert Assessment (Strategic Consultant Level)**

**Personalization:**
- Did they relate the unique selling points to the client's specific scenario?
- Did they relate the coverage benefits to the client's scenario?
- Did they explain the policy timeline from the client's age/perspective?`;

export const prulifetimeOperationalBasicsSection = `
**Operational Basics Assessment (Sales Novice Level)**

**Guaranteed Issuance Explanation:**
- Did they explain that this is a Guaranteed Issuance (GIO) plan?
- Did they explain the scope and limitations of GIO (basic plan only, supplementary benefits require underwriting)?`;

export const prulifetimeOperationalIntermediateSection = `
**Operational Intermediate Assessment (Skilled Advisor Level)**

**Operational Processes:**
- Did they explain the process for changing the second life assured?

**Risk Management:**
- Did they declare pre-existing conditions and explain their implications (e.g. premiums will be refunded)?`;

export const prulifetimeOperationalExpertSection = `
**Operational Expert Assessment (Strategic Consultant Level)**

**Competitor Comparison:**
- Did they make comparison with similar solutions from competitors?
- Did they explain the differences, pros and cons of PRULifetime vs alternatives?

[PRULIFETIME FEEDBACK GUIDELINES - CRITICAL]
1. **Precision Required**: Each criterion must be evaluated precisely - partial explanations should be marked as false unless they meet the full requirement.
2. **PRULifetime-Specific**: Only PRULifetime-specific information counts - generic insurance explanations do not satisfy PRULifetime criteria.
3. **Completed Items Rules**:
   - Use positive, past-tense phrasing: "You successfully explained...", "You accurately provided...", "You properly identified..."
   - Focus on specific PRULifetime knowledge demonstrated
   - Each item should reference specific PRULifetime features or processes
4. **To Improve Items Rules**:
   - Use direct, specific phrasing: "You didn't explain PRULifetime's cash benefit structure", "You missed mentioning the guaranteed vs non-guaranteed portions"
   - Focus on specific PRULifetime knowledge gaps
   - Prioritize the most critical missing elements for each level
   - **CRITICAL**: Provide concrete examples of better explanations when applicable. For example: "Instead, you could have said: '[specific example of how to explain the PRULifetime feature]'" or "A better explanation would be: '[specific example]'"

[PRULIFETIME SCORING GUIDELINES]
- **Sales Novice (Score: 0-33)**: Calculate \`overallScore\` as percentage of completed \`prulifetimeBasics\` criteria multiplied by 33. For example: if 2 out of 10 basics are completed, score = (2/10) * 33 = 7. Round to nearest integer. **MANDATORY**: If the user has ANY completed items listed (even just 1 completed item), the minimum score MUST be at least 1. Set \`overallScore\` to 0 ONLY if there are zero completed items listed.
- **Skilled Advisor (Score: 34-66)**: Awarded only if ALL \`prulifetimeBasics\` criteria are met. The \`overallScore\` for BOTH knowledge areas cannot exceed 66 if any \`prulifetimeIntermediate\` criteria are missed.
- **Strategic Consultant (Score: 67-100)**: Awarded only if ALL \`prulifetimeBasics\` and \`prulifetimeIntermediate\` criteria are met. The score is then based on the \`prulifetimeExpert\` performance.`;
