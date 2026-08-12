// DentiPlus Product Information for Prompting (aligned to PARecoveryPlus style)

type DentalService = {
  section: number;
  name: string;
  notes: string;
};

const DENTAL_SERVICES: DentalService[] = [
  {
    section: 1,
    name: 'Emergency Dental Services',
    notes:
      'Palliative treatment to stabilize severe pain, swelling, or uncontrollable bleeding',
  },
  {
    section: 2,
    name: 'Preventive Dental Benefits',
    notes:
      'Oral exam, prophylaxis (cleaning), fluoride – one (1) visit per Policy Year',
  },
  {
    section: 3,
    name: 'Dental Radiology Benefits',
    notes:
      'Up to two (2) bitewing intraoral x-rays OR one (1) skull/facial survey x-ray OR one (1) panoramic x-ray per Policy Year',
  },
  {
    section: 4,
    name: 'Conservative Benefits (Fillings)',
    notes: 'Amalgam (permanent); Composite/Resin (permanent); Glass ionomer',
  },
  {
    section: 5,
    name: 'Extraction Benefits (Non‑Surgical)',
    notes:
      'Simple extraction (erupted tooth or exposed root); Complicated extraction (tooth/root, partially bony)',
  },
  {
    section: 6,
    name: 'Endodontic Benefits',
    notes: 'Root canal; Therapeutic pulpotomy (excluding final restoration)',
  },
];

const PLAN_LIMITS: string[] = [
  'Classic: Overall limit S$1,000 per Policy Year',
  'Platinum: Overall limit S$1,500 per Policy Year',
];

const NETWORK_AND_CLAIMS: string[] = [
  'Contracted Providers (In‑Network): Direct billing; typically higher coverage',
  'Out‑of‑Contract (Out‑of‑Network): Reimbursement up to Benefit Allowable; submit claim form and original paid receipt within 30 days',
];

const WAITING_PERIOD: string[] = [
  '90‑day waiting period for non‑emergency benefits',
  'Emergency Dental is covered during waiting period on reimbursement basis',
];

const ELIGIBILITY_AND_RENEWAL: string[] = [
  'Eligibility: Age 18 to below 60 at policy commencement; usual country of residence Singapore',
  'Automatic renewal each year unless cancelled by customer or MSIG',
  'Notify MSIG if usual country of residence changes (>6 consecutive months abroad); terms may change or cover may be declined',
];

const PREMIUMS: string[] = [
  'Classic: Monthly S$36.57; Yearly S$428.89 (incl. 9% GST)',
  'Platinum: Monthly S$40.28; Yearly S$472.29 (incl. 9% GST)',
];

const KEY_DISCLOSURES: string[] = [
  'Pre‑existing conditions are not covered',
  'Coverage effective upon successful premium deduction',
  '14 business‑day free look period',
  'Not a Medisave‑approved policy',
  "Protected under SDIC Policy Owners' Protection Scheme",
];

const ADDITIONAL_BENEFITS: string[] = [
  'Member Discount: All policyholders are eligible for up to 20% discount on all dental treatments (including aesthetics and cosmetics) upon policy issuance',
  'Discount applies when appointments are made through Inova Care within the panel of clinics',
  'No 90-day waiting period for the discount benefit; available immediately upon policy issuance',
  'No limit on how many times policyholders can use the up to 20% discount',
  'Scheduled fee varies by clinic; discount applies to treatments at panel clinics',
  'Emergency dental treatment is covered worldwide/overseas (for pain relief, swelling, or bleeding) on a reimbursement basis',
];

const TELESALES_COMPLIANCE_RULES: string[] = [
  '[CRITICAL] Telesales agents are NOT allowed to make direct product comparisons with competitors',
  '[CRITICAL] Agents can highlight DentiPlus benefits and USPs, but CANNOT directly compare or mention competitor products negatively',
  '[CRITICAL] The 14-day free-look period should NOT be mentioned as a sales tactic or reason to buy unless the customer specifically asks about it',
  '[CRITICAL] Free-look period should only be mentioned as part of mandatory disclosures or in response to customer concerns about commitment',
  '[CRITICAL] If the seller pitches ONLY the Platinum plan, there is NO need to mention the Classic plan unless the customer specifically asks for lower premium/coverage options',
  '[CRITICAL] Telesales agents should focus on the campaign-specific plan tier; discussing multiple tiers is only necessary when the customer requests alternatives',
  '[CRITICAL] Preventive dental and dental radiology services are covered 100% once per year AFTER the 90-day waiting period (not before)',
  '[CRITICAL] The 20% discount on dental treatments is a separate benefit from the insurance coverage - it applies to all treatments including those not covered by the plan',
  '[CRITICAL] Cosmetic and aesthetic dental treatments are NOT covered by the insurance plan but ARE eligible for the up to 20% discount when booked through Inova Care',
];

function formatDentalServicesForPrompt(
  services: DentalService[],
  category: string,
): string {
  return (
    `**${category.toUpperCase()}:**\n` +
    services
      .map((s) => `- Section ${s.section}: ${s.name}\n  ${s.notes}`)
      .join('\n\n')
  );
}

function formatBulletListForPrompt(items: string[], heading: string): string {
  return `**${heading.toUpperCase()}:**\n${items
    .map((i) => `- ${i}`)
    .join('\n')}`;
}

export function getDentiPlusProductInfoForPrompt(): string {
  return `
[DENTIPLUS PRODUCT BENEFITS REFERENCE]
Use this official product information to evaluate accuracy of product details provided:

${formatDentalServicesForPrompt(DENTAL_SERVICES, 'Covered Dental Services')}

${formatBulletListForPrompt(PLAN_LIMITS, 'Plan Tiers and Overall Limits')}

${formatBulletListForPrompt(NETWORK_AND_CLAIMS, 'Network and Claims Process')}

${formatBulletListForPrompt(WAITING_PERIOD, 'Waiting Period')}

${formatBulletListForPrompt(ELIGIBILITY_AND_RENEWAL, 'Eligibility and Renewal')}

${formatBulletListForPrompt(PREMIUMS, 'Premiums')}

${formatBulletListForPrompt(KEY_DISCLOSURES, 'Key Disclosures and Exclusions')}

${formatBulletListForPrompt(ADDITIONAL_BENEFITS, 'Additional Benefits (Member Discounts and Emergency Coverage)')}

[TELESALES COMPLIANCE RULES - CRITICAL FOR ASSESSMENT]
${formatBulletListForPrompt(TELESALES_COMPLIANCE_RULES, 'Assessment Guidelines for Telesales Context')}

**IMPORTANT ASSESSMENT INSTRUCTIONS:**
When evaluating the salesperson's performance, you MUST consider these telesales compliance rules:
- Do NOT penalize the seller for not comparing with competitors - this is actually PROHIBITED in telesales
- Do NOT penalize the seller for not mentioning the free-look period during sales pitch - this should only appear in mandatory disclosures or when customer asks
- Do NOT penalize the seller for not mentioning the Classic plan if they pitched Platinum - discussing multiple tiers is unnecessary unless customer requests alternatives
- Do NOT penalize correct premium amounts (Classic: S$36.57/month, Platinum: S$40.28/month)
- Do NOT penalize for mentioning the 20% discount benefit - this is a legitimate product feature available to all policyholders
- Do NOT penalize for mentioning overseas/worldwide emergency coverage - this is accurate for emergency dental treatment
`;
}

export function getDentiPlusScriptReference(): string {
  return `
**OUTBOUND GREETING (DentiPlus):**
- "Good morning/afternoon, may I speak to Mr/Ms _______?"
- "I am ______, calling from MSIG Insurance (Singapore) Pte Ltd. I’d like to share about our DentiPlus dental plan with Classic and Platinum options."

**PRODUCT INTRODUCTION (DentiPlus):**
- "DentiPlus provides essential dental coverage with two tiers, including preventive services, x-rays, fillings, extractions and endodontics, with higher coverage and direct billing at Contracted Providers."

**NETWORK GUIDANCE (DentiPlus):**
- "For non-emergency care, please schedule with our Contracted Providers to enjoy direct billing."

**TRIAL CLOSING (DentiPlus):**
- "May I help you with the purchase of the DentiPlus [Classic/Platinum] plan today?"

**MANDATORY DISCLOSURES (DentiPlus):**
1. "You have 14 business days to review the plan (free look)."
2. "Policy is effective upon successful premium deduction; automatically renews yearly unless cancelled."
3. "Please inform MSIG if you intend to live outside Singapore for more than 6 consecutive months."
4. "Pre-existing conditions are not covered; refer to full policy for complete exclusions."
5. "This policy is not Medisave-approved."
6. "This policy is protected under the Policy Owners' Protection Scheme (SDIC)."
`;
}
