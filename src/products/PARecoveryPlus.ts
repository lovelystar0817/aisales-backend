// PARecovery Plus Product Information
export interface ProductBenefit {
  section: number;
  name: string;
  silver: string;
  gold: string;
  platinum: string;
}

export interface OccupationCategory {
  name: string;
  description?: string;
  occupations?: string[];
}

// Adult Cover Benefits
export const ADULT_ESSENTIAL_BENEFITS: ProductBenefit[] = [
  {
    section: 1,
    name: 'Accidental Death',
    silver: '$100,000',
    gold: '$200,000',
    platinum: '$300,000',
  },
  {
    section: 2,
    name: 'Permanent Disability (per policy year)',
    silver: '$150,000',
    gold: '$300,000',
    platinum: '$450,000',
  },
  {
    section: 3,
    name: 'Third-degree Burns (per policy year)',
    silver: '$100,000',
    gold: '$200,000',
    platinum: '$300,000',
  },
  {
    section: 4,
    name: 'Fractures',
    silver: '$2,000',
    gold: '$4,000',
    platinum: '$6,000',
  },
  {
    section: 5,
    name: 'Medical Expenses for Injury',
    silver: '$1,000',
    gold: '$2,000',
    platinum: '$3,000',
  },
  {
    section: 6,
    name: 'Alternative Treatment Expenses',
    silver: '$200 up to $40 per visit',
    gold: '$400 up to $50 per visit',
    platinum: '$600 up to $60 per visit',
  },
  {
    section: 7,
    name: 'Mobility Aid',
    silver: '$1,000',
    gold: '$2,000',
    platinum: '$3,000',
  },
  {
    section: 8,
    name: 'Daily Hospital Income',
    silver: '$50 per day up to 365 days, Max. $18,250',
    gold: '$100 per day up to 365 days, Max. $36,000',
    platinum: '$150 per day up to 365 days, Max. $54,750',
  },
  {
    section: 9,
    name: 'Double Hospital Income in ICU',
    silver: '$100 per day up to 30 days, Max. $3,000',
    gold: '$200 per day up to 30 days, Max. $6,000',
    platinum: '$300 per day up to 30 days, Max. $9,000',
  },
  {
    section: 10,
    name: 'Special Hospital Income (Dengue/Food poisoning/HFMD)',
    silver: '$50 per day up to 50 days, Max. $2,500',
    gold: '$100 per day up to 50 days, Max. $5,000',
    platinum: '$150 per day up to 50 days, Max. $7,500',
  },
];

export const ADULT_RECOVERY_BENEFITS: ProductBenefit[] = [
  {
    section: 11,
    name: 'Transport Allowance',
    silver: '$50, $10 per day',
    gold: '$75, $15 per day',
    platinum: '$100, $20 per day',
  },
  {
    section: 12,
    name: 'Home Nursing and Domestic Support Fund',
    silver: '$1,000',
    gold: '$2,000',
    platinum: '$3,000',
  },
  {
    section: 13,
    name: 'Home Modification for Mobility (per lifetime)',
    silver: '$5,000 (Home Care: $1,000, Car: $500)',
    gold: '$7,000 (Home Care: $2,000, Car: $1,000)',
    platinum: '$10,000 (Home Care: $3,000, Car: $1,500)',
  },
  {
    section: 14,
    name: 'Permanent Caregiver Grant (per lifetime)',
    silver: '$500',
    gold: '$750',
    platinum: '$1,000',
  },
  {
    section: 15,
    name: 'Trauma Counselling (per lifetime)',
    silver: '$500 up to $100 per visit',
    gold: '$750 up to $150 per visit',
    platinum: '$1,000 up to $200 per visit',
  },
];

export const ADULT_LIFESTYLE_BENEFITS: ProductBenefit[] = [
  {
    section: 16,
    name: 'Cosmetic Procedure for Face and Neck',
    silver: '$1,000',
    gold: '$2,000',
    platinum: '$3,000',
  },
  {
    section: 17,
    name: 'Petcare Allowance (per policy year)',
    silver: '$600, $20 per day, up to 30 days',
    gold: '$900, $30 per day, up to 30 days',
    platinum: '$1,200, $40 per day, up to 30 days',
  },
  {
    section: 18,
    name: 'Staycation and Entertainment Ticket Cancellation',
    silver: '$100',
    gold: '$200',
    platinum: '$300',
  },
  {
    section: 19,
    name: 'Fitness and Sports Membership Fees',
    silver: '$150, $50 per month, up to 3 months',
    gold: '$225, $75 per month, up to 3 months',
    platinum: '$300, $100 per month, up to 3 months',
  },
  {
    section: 20,
    name: 'Loss of Personal Belongings due to Assault and Robbery',
    silver: '$200',
    gold: '$400',
    platinum: '$600',
  },
];

// Child Cover Benefits
export const CHILD_BENEFITS: ProductBenefit[] = [
  {
    section: 1,
    name: 'Accidental Death',
    silver: '$30,000',
    gold: '$60,000',
    platinum: '$100,000',
  },
  {
    section: 2,
    name: 'Permanent Disability (per policy year)',
    silver: '$45,000',
    gold: '$90,000',
    platinum: '$150,000',
  },
  {
    section: 3,
    name: 'Third-degree Burns (per policy year)',
    silver: '$30,000',
    gold: '$60,000',
    platinum: '$100,000',
  },
  {
    section: 5,
    name: 'Medical Expenses for Injury',
    silver: '$300',
    gold: '$600',
    platinum: '$1,000',
  },
  {
    section: 6,
    name: 'Alternative Treatment Expenses',
    silver: '$100 up to $40 per visit',
    gold: '$200 up to $50 per visit',
    platinum: '$300 up to $60 per visit',
  },
  {
    section: 7,
    name: 'Mobility Aid',
    silver: '$100',
    gold: '$200',
    platinum: '$300',
  },
  {
    section: 8,
    name: 'Daily Hospital Income',
    silver: '$30 per day up to 100 days, Max. $3,000',
    gold: '$40 per day up to 100 days, Max. $4,000',
    platinum: '$50 per day up to 100 days, Max. $5,000',
  },
  {
    section: 10,
    name: 'Special Hospital Income (Dengue/Food poisoning/HFMD)',
    silver: '$30 per day up to 50 days, Max. $1,500',
    gold: '$40 per day up to 50 days, Max. $2,000',
    platinum: '$50 per day up to 50 days, Max. $2,500',
  },
  {
    section: 11,
    name: 'Transport Allowance',
    silver: '$50, $10 per day',
    gold: '$75, $15 per day',
    platinum: '$100, $20 per day',
  },
  {
    section: 24,
    name: 'Child Education Fund',
    silver: '$10,000',
    gold: '$20,000',
    platinum: '$30,000',
  },
];

// Senior Cover Benefits
export const SENIOR_BENEFITS: ProductBenefit[] = [
  {
    section: 1,
    name: 'Accidental Death',
    silver: '$10,000',
    gold: '$20,000',
    platinum: '$30,000',
  },
  {
    section: 2,
    name: 'Permanent Disability (per policy year)',
    silver: '$10,000',
    gold: '$20,000',
    platinum: '$30,000',
  },
  {
    section: 3,
    name: 'Third-degree Burns (per policy year)',
    silver: '$10,000',
    gold: '$20,000',
    platinum: '$30,000',
  },
  {
    section: 5,
    name: 'Medical Expenses for Injury',
    silver: '$300',
    gold: '$600',
    platinum: '$1,000',
  },
  {
    section: 6,
    name: 'Alternative Treatment Expenses',
    silver: '$100 up to $40 per visit',
    gold: '$200 up to $50 per visit',
    platinum: '$300 up to $60 per visit',
  },
  {
    section: 7,
    name: 'Mobility Aid',
    silver: '$100',
    gold: '$200',
    platinum: '$300',
  },
  {
    section: 8,
    name: 'Daily Hospital Income',
    silver: '$30 per day up to 50 days, Max. $1,500',
    gold: '$40 per day up to 50 days, Max. $2,000',
    platinum: '$50 per day up to 50 days, Max. $2,500',
  },
  {
    section: 10,
    name: 'Special Hospital Income (Dengue/Food poisoning/HFMD)',
    silver: '$30 per day up to 50 days, Max. $1,500',
    gold: '$40 per day up to 50 days, Max. $2,000',
    platinum: '$50 per day up to 50 days, Max. $2,500',
  },
  {
    section: 11,
    name: 'Transport Allowance',
    silver: '$50, $10 per day',
    gold: '$75, $15 per day',
    platinum: '$100, $20 per day',
  },
];

// Optional Covers
export const OPTIONAL_COVERS = [
  {
    section: 21,
    name: 'Additional Capital Sum Insured for Sections 1-3',
    description: 'Refer to schedule',
  },
  {
    section: 22,
    name: 'Additional Medical Expenses Sum Insured for Section 5',
    description: 'Refer to schedule',
  },
  {
    section: 23,
    name: 'Income Protection for Temporary Disability',
    description:
      'Limited to one accident at any one time, per week, up to 52 weeks - Refer to schedule',
  },
];

// Occupational Categories
export const GROUP_A_OCCUPATIONS: OccupationCategory[] = [
  {
    name: 'Banking, insurance and trading profession',
    occupations: [
      'Bank officer',
      'Investment analyst',
      'Remisier',
      'Private banker',
      'Actuary',
      'Claims officer',
      'Insurance agent or broker',
      'Underwriter',
    ],
  },
  {
    name: 'Business administrative and finance profession',
    occupations: [
      'Human resource executive',
      'Operations executive',
      'Office manager',
      'Receptionist',
      'Secretary',
      'Accountant',
      'Auditor',
      'Finance manager',
      'Finance analyst',
    ],
  },
  {
    name: 'Cleaning profession (indoor spaces of office, residential or commercial building)',
    occupations: [
      'Indoor cleaner',
      'Janitor',
      'Office cleaner',
      'Office tea lady',
    ],
  },
  {
    name: 'Creative, media and marketing profession',
    occupations: [
      'Architect',
      'Copywriter',
      'Designer',
      'Events planner',
      'Journalist',
      'Marketing manager',
      'Model',
      'Photographer',
      'Public relations manager',
    ],
  },
  {
    name: 'Domestic care and non-working persons',
    occupations: ['Domestic helper', 'Homemaker', 'Retiree', 'Student'],
  },
  {
    name: 'Education profession (non-sports)',
    occupations: [
      'Librarian',
      'Principal',
      'Student counsellor',
      'Teacher or tutor (for academic subjects, arts, language, music)',
    ],
  },
  {
    name: 'Healthcare profession (non-veterinary)',
    occupations: [
      'Acupuncturist',
      'Chinese Physician',
      'Chiropractors',
      'Dentist',
      'Doctor',
      'Nurse',
      'Optician',
      'Physiotherapist',
    ],
  },
  {
    name: 'IT profession',
    occupations: [
      'Helpdesk support specialist',
      'IT consultant',
      'Software engineer',
    ],
  },
  {
    name: 'Laboratory profession',
    occupations: [
      'Biologist',
      'Chemist',
      'Laboratory technician',
      'Research scientist',
    ],
  },
  {
    name: 'Legal profession',
    occupations: [
      'Arbitrator',
      'Judge',
      'Lawyer',
      'Legal officer',
      'Paralegal',
    ],
  },
  {
    name: 'Management executive',
    occupations: ['Chairman', 'CEO', 'CFO', 'Director'],
  },
  {
    name: 'Personal care profession',
    occupations: ['Beautician', 'Hairdresser', 'Manicurist', 'Masseuse'],
  },
  {
    name: 'Real estate profession',
    occupations: [
      'Property manager',
      'Real estate agent',
      'Real estate appraiser',
    ],
  },
  {
    name: 'Retail and service profession',
    occupations: [
      'Cashier',
      'Customer service officer',
      'Florist',
      'Jeweller',
      'Merchandiser',
      'Money changer',
      'Sales person',
      'Tailor',
      'Tour guide',
      'Waiter',
    ],
  },
  {
    name: 'Social and religious profession',
    occupations: [
      'Counsellor',
      'Social worker',
      'Pastor',
      'Priest',
      'Temple caretaker',
    ],
  },
  {
    name: 'Other Group A occupation',
    description:
      'Professional, administrative, deskbound duties, light manual work or activities',
    occupations: [],
  },
];

export const GROUP_B_OCCUPATIONS: OccupationCategory[] = [
  {
    name: 'Animal health and care profession',
    occupations: ['Pet groomer', 'Veterinarian', 'Zookeeper'],
  },
  {
    name: 'Cleaning profession (kitchen, outdoor or industrial spaces)',
    occupations: [
      'Dishwasher',
      'Kitchen cleaner',
      'Outdoor cleaner',
      'Trash collector',
    ],
  },
  {
    name: 'Delivery and moving profession',
    occupations: ['Deliveryman', 'Dispatch rider', 'Movers', 'Postman'],
  },
  {
    name: 'Emergency and security profession',
    occupations: ['Lifeguard', 'Paramedic', 'Security guard (unarmed)'],
  },
  {
    name: 'Food preparation and kitchen support profession',
    occupations: [
      'Baker',
      'Butcher',
      'Caterer (involving set up and kitchen work)',
      'Chef',
      'Cook',
      'Fishmonger',
      'Hawker assistant or cook',
      'Kitchen helper',
    ],
  },
  {
    name: 'Freight and transport profession',
    occupations: [
      'Crane operator',
      'Forklift operator',
      'Port worker',
      'Warehouse worker',
      'Chauffeur',
      'Driving Instructor',
      'Driver (for bus, lorry, private hire, taxi)',
    ],
  },
  {
    name: 'Manual and skilled profession (up to 30 ft)',
    occupations: [
      'Aircon repairman',
      'Carpenter',
      'Electrician',
      'Gardener',
      'Mechanic',
      'Painter (interior)',
      'Plumber',
      'Renovation worker',
      'Technician',
      'Worksite foreman',
    ],
  },
  {
    name: 'Manufacturing profession (light industries)',
    occupations: [
      'Production worker',
      'Machine operator',
      'Maintenance technician',
      'Quality control inspector',
    ],
  },
  {
    name: 'Nightlife and entertainment profession',
    occupations: ['Bartender', 'DJ', 'Live performers', 'Service staff'],
  },
  {
    name: 'Sports, dance and wellness coach or instructor',
    occupations: [
      'Instructor or coach for sports, dance, fitness, martial arts, rock-climbing (indoor and harnessed), wind surfing, yoga',
    ],
  },
  {
    name: 'Other Group B occupation',
    description:
      'Occupation which involves physical labour, use of tools or machinery in light industries, operation of vehicles, exposure to height or other hazards',
    occupations: [],
  },
];

export const EXCLUDED_OCCUPATIONS = [
  'Any occupation in military, naval, air force, law enforcement, fire-fighting, civil defence or as armed security guard',
  'Professional sportsman, entertainers, motor vehicle racer',
  'Work onboard sea vessel or any offshore occupation such as diver, rig workers, fisherman or ship crew',
  'Work onboard aircraft or as air crew',
  'Shipyard worker, construction workers, demolition worker, quarry worker, work underground or in tunnels',
  'Work at height over 30 feet or work involving the use of scaffolding, gondolas, climbing that requires the use of guides or ropes',
  'Any occupation dealing with explosives, poisonous or hazardous gases or substances',
];

export const KEY_PRODUCT_FACTS = [
  'Accident-only coverage (except Special Daily Hospitalisation for Dengue/Food poisoning/HFMD)',
  'No medical check-up required for application',
  'Pre-existing conditions not covered',
  'Coverage effective upon successful premium deduction',
  'Auto-renewal unless cancelled by customer or MSIG',
  '14-day free look period',
  "Protected under SDIC Policy Owners' Protection Scheme",
  'Contact: +65 6827 7602 or service@sg.msig-asia.com for occupation advice',
];

const TELESALES_COMPLIANCE_RULES: string[] = [
  '[CRITICAL] Telesales agents are NOT allowed to make direct product comparisons with competitors',
  '[CRITICAL] Agents can highlight PARecovery Plus benefits and USPs, but CANNOT directly compare or mention competitor products negatively',
  '[CRITICAL] The 14-day free-look period should NOT be mentioned as a sales tactic or reason to buy unless the customer specifically asks about it',
  '[CRITICAL] Free-look period should only be mentioned as part of mandatory disclosures or in response to customer concerns about commitment',
  '[CRITICAL] If the seller pitches ONLY one plan tier (e.g., only Platinum), there is NO need to mention other tiers (Silver/Gold) unless the customer specifically asks for lower premium/coverage options',
  '[CRITICAL] Telesales agents should focus on the campaign-specific plan tier; discussing multiple tiers is only necessary when the customer requests alternatives',
  '[CRITICAL] Telemarketers are not licensed to provide financial advice - avoid advisory statements like "This plan is good for you" or "You should buy this"',
  '[CRITICAL] When describing Daily Hospital Income, explicitly include "due to accident" to avoid misleading customers',
  '[CRITICAL] Do not sell on the basis of policy documents or late deduction as reasons to encourage purchase',
];

// Helper functions to format product information for prompts
export function formatBenefitsForPrompt(
  benefits: ProductBenefit[],
  category: string,
): string {
  return (
    `**${category.toUpperCase()}:**\n` +
    benefits
      .map(
        (benefit) =>
          `- Section ${benefit.section}: ${benefit.name}\n  Silver: ${benefit.silver} | Gold: ${benefit.gold} | Platinum: ${benefit.platinum}`,
      )
      .join('\n\n')
  );
}

export function formatOccupationsForPrompt(
  occupations: OccupationCategory[],
  groupName: string,
): string {
  return (
    `**${groupName}:**\n` +
    occupations
      .map(
        (category) =>
          `- ${category.name}${category.description ? ` (${category.description})` : ''}`,
      )
      .join('\n')
  );
}

export function getPARecoveryPlusProductInfoForPrompt(): string {
  return `
[PARECOVERY PLUS PRODUCT BENEFITS REFERENCE]
Use this official product information to evaluate accuracy of product details provided:

${formatBenefitsForPrompt(ADULT_ESSENTIAL_BENEFITS, 'Adult Essential Benefits')}

${formatBenefitsForPrompt(ADULT_RECOVERY_BENEFITS, 'Adult Recovery Support Benefits')}

${formatBenefitsForPrompt(ADULT_LIFESTYLE_BENEFITS, 'Adult Lifestyle Support Benefits')}

${formatBenefitsForPrompt(CHILD_BENEFITS, 'Child Benefits')}

${formatBenefitsForPrompt(SENIOR_BENEFITS, 'Senior Benefits')}

**OPTIONAL COVERS:**
${OPTIONAL_COVERS.map((cover) => `- Section ${cover.section}: ${cover.name} - ${cover.description}`).join('\n')}

**OCCUPATIONAL ELIGIBILITY:**
${formatOccupationsForPrompt(GROUP_A_OCCUPATIONS, 'Group A Occupations (eligible for all 3 plans + optional covers)')}

${formatOccupationsForPrompt(GROUP_B_OCCUPATIONS, 'Group B Occupations (per script: eligible for Silver/Gold plans + income protection only)')}

**EXCLUDED OCCUPATIONS:**
${EXCLUDED_OCCUPATIONS.map((occupation, index) => `${String.fromCharCode(97 + index)}) ${occupation}`).join('\n')}

**KEY PRODUCT FACTS:**
${KEY_PRODUCT_FACTS.map((fact) => `- ${fact}`).join('\n')}

[TELESALES COMPLIANCE RULES - CRITICAL FOR ASSESSMENT]
${TELESALES_COMPLIANCE_RULES.map((rule) => `- ${rule}`).join('\n')}

**IMPORTANT ASSESSMENT INSTRUCTIONS:**
When evaluating the salesperson's performance, you MUST consider these telesales compliance rules:
- Do NOT penalize the seller for not comparing with competitors - this is actually PROHIBITED in telesales
- Do NOT penalize the seller for not mentioning the free-look period during sales pitch - this should only appear in mandatory disclosures or when customer asks
- Do NOT penalize the seller for not mentioning all plan tiers (Silver/Gold/Platinum) if they focused on one - discussing multiple tiers is unnecessary unless customer requests alternatives
- Do NOT penalize for saying "Daily Hospital Income due to accident" - this is required clarity
- Do NOT penalize for avoiding advisory statements like "This is good for you" - telemarketers are not licensed to provide financial advice
`;
}

export function getPARecoveryPlusScriptReference(): string {
  return `
**OUTBOUND GREETING (PARecovery Plus):**
- "Good morning/afternoon, may I speak to Mr XX /Ms XX _______?"
- "I am ______, calling from MSIG Insurance (Singapore) Pte Ltd. Thank you for being a valued MSIG customer. As an appreciation for your support, we would like to extend our recently launched PARecovery Plus Plan. Please spare me a few minutes."

**PRODUCT INTRODUCTION (PARecovery Plus):**
- "PA Recovery Plus is a comprehensive personal accident plan designed to protect individuals at all stages of life. This plan offers extensive protection, including essential benefits, recovery support, and lifestyle benefits."

**OCCUPATION CHECK (PARecovery Plus):**
- "Before I proceed, may I ask what is your occupation?"

**ACCIDENT STATISTICS (PARecovery Plus):**
- "Although we try to keep ourselves safe, unfortunately, an accident can happen anytime, anywhere. Accidents are the top reason for hospitalization in Singapore. In fact, statistics from Data.gov.sg, shows that 9% of hospitalization is due to accident, food poisoning or violence."

**UNDERWRITING QUESTIONS (PARecovery Plus):**
1. "Do you suffer from, been investigated, diagnosed for or treated for any of the following conditions: a. diabetes, stroke, heart disease and any defects or impairment of the heart b. mental illness or any disorder of the brain, not limited to epilepsy, parkinson, alzheimer's c. cancer unless in remission for at least 5 years."
2. "Have you been declined, refused renewal, terminated or impose loading or coverage restriction for personal accident policy?"

**TRIAL CLOSING (PARecovery Plus):**
- "May I help you to enrol into PA RecoveryPlus ___ Plan?" (Note: Should use "purchase" not "enrol")

**MANDATORY DISCLOSURES (PARecovery Plus):**
1. "You have 14-day free look to review the benefits of the plan..."
2. "Please consider carefully if you intend to switch personal accident policies as this might be detrimental to your current and/or future needs."
3. "All the benefits of the PA Recovery Plus policy are only payable upon an accident occurring during the policy period except for the Special Daily Hospitalisation Benefit."
4. PDPA Marketing Consent: "In line with the Personal Data Protection Act, we would like to seek your consent to contact you in the future through SMS and Phone calls, to update you on MSIG's products, rewards and promotions. May I have your consent to receive sms and phone calls?"

**PAYMENT FLOW:**
- Acceptable: Collect Visa/Mastercard card details upfront to deduct first month premium.
- If customer is hesitant, offer a Payment Link via email and guide the customer through completing payment.

**UPSELL APPLICABILITY RULES:**
- Upsell to spouse, children, parents/parents-in-law when appropriate.

**ADDITIONAL COMPLIANCE REMINDERS:**
- Do NOT disclose the customer's banking relationship with the partner bank.
- Do NOT sell using 'free look' or 'flexibility to cancel' as reasons to buy.
- When describing Daily Hospital Income, explicitly include 'due to accident'.

`;
}
