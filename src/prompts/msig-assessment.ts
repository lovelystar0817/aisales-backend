import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  getPARecoveryPlusProductInfoForPrompt,
  getPARecoveryPlusScriptReference,
} from '../products/PARecoveryPlus.js';
import {
  getDentiPlusProductInfoForPrompt,
  getDentiPlusScriptReference,
} from '../products/DentiPlus.js';

// Define criteria for each section (only obligatory items marked with (O))
// *** indicates mandatory criteria - immediate failure if not addressed
export interface Criterion {
  id: string;
  text: string;
  description: string;
  mandatory: boolean;
}

export interface SectionData {
  weight: number;
  description: string;
  criteria: Criterion[];
}

export interface SectionCriteria {
  introduction: SectionData;
  presentation: SectionData;
  communication: SectionData;
  salesConfirmation: SectionData;
  mandatoryDisclosure: SectionData;
  closure: SectionData;
}

export const SECTION_CRITERIA: SectionCriteria = {
  introduction: {
    weight: 5,
    description:
      'Evaluates the opening of the call, including greeting, identification, and stating purpose of call',
    criteria: [
      {
        id: 'introduction_polite_greeting',
        text: 'Asked politely for the customer',
        description:
          "Look for: Agent responds promptly when call connects and asks politely for the customer by name (e.g., 'May I speak to Mr/Ms [Name]?'). Agent should answer immediately without delays or distractions. Ensure Telesales Executives responds promptly to customer when the call gets connected. FAIL if: Agent is distracted (talking to colleagues/eating/drinking), rude, doesn't ask for customer properly, or has delayed response when call connects.",
        mandatory: false,
      },
      {
        id: 'introduction_standard_greeting',
        text: 'Use standard greeting with good phone manners and enthusiasm',
        description:
          "Look for: Agent uses complete standard greeting sequence: 1) Professional greeting that politely asks for customer by name (time-appropriate greeting like 'Good morning/afternoon' is preferred but not mandatory), 2) Identifies who and where calling from ('I am [name], calling from MSIG Insurance Singapore Pte Ltd'), 3) Asks if customer is convenient to talk. Agent demonstrates enthusiasm and professionalism throughout with cheerful and lively tone. FAIL if: Missing key elements (professional greeting with name request, identification, convenience check), sounds unprofessional, lacks enthusiasm, or poor phone manners.",
        mandatory: false,
      },
      {
        id: 'introduction_state_purpose',
        text: 'State purpose of call',
        description:
          "Look for: Agent clearly states purpose following proper format (e.g., 'We are calling from MSIG Insurance (Singapore) Pte. Ltd, in partnership with [Partner Name] Limited to share with you our [product name] plan'). For PARecovery Plus calls, should mention it's as appreciation for support and explain it's a comprehensive personal accident plan for all life stages. Agent must NOT disclose customer's banking relationship with the bank. FAIL if: Purpose unclear, doesn't mention PARecovery Plus specifically, or reveals banking relationship details.",
        mandatory: false,
      },
    ],
  },

  presentation: {
    weight: 40,
    description:
      'Evaluates product knowledge, sales skills, objection handling, and adherence to sales process',
    criteria: [
      {
        id: 'presentation_script_adherence',
        text: 'Adhere to script given',
        description:
          'Look for: Agent follows the official script structure and logical flow - outbound greeting → product introduction → occupation check → accident statistics → underwriting questions → benefits presentation → trial closing. Telesales Executives are highly encouraged to adhere to the script; slight variations are acceptable provided that the contents are not lost. Presents key Platinum Plan benefits ($300k accidental death, $450k permanent disablement, $300k burns, $3k medical, $6k fractures, $150 daily hospital). FAIL if: Major script deviations that lose essential content, missing key sections, wrong sequence, or missing key benefit amounts.',
        mandatory: false,
      },
      {
        id: 'presentation_correct_product_info',
        text: 'Provide correct, complete and appropriate information on product',
        description:
          "Look for: Agent provides accurate and complete PARecovery Plus information per official product benefits summary - correct benefit amounts (Platinum: $300k death, $450k disability, $300k burns, $3k medical, $6k fractures, $150 daily hospital), uses precise language ('up to', 'coverage', 'per injury', 'accidental death'), mentions accident-only nature except Special Daily Hospitalisation, covers essential/recovery/lifestyle benefits accurately. Must reference official occupational eligibility (Group A vs Group B). Ensure that Telesales Executive discloses all mandatory items and does not provide wrong/incorrect information on products. Example: Must say 'We will pay up to a maximum of $XX...' instead of 'We will pay out $XX...'. FAIL if: Any incorrect facts, wrong amounts, misleading coverage information, wrong occupational eligibility, incomplete benefit categories, missing mandatory product disclosures, or any misinformation about the product.",
        mandatory: false,
      },
      {
        id: 'presentation_correct_procedures',
        text: 'Provide correct procedures and process',
        description:
          'Look for: Agent explains correct application process, eligibility requirements, underwriting steps, payment procedures as per official script and guidelines. Must not provide wrong/incorrect procedures and processes. For example, Telesales executive must provide COA (Change of Address) procedure when customer mentions there is a change in address. FAIL if: Gives wrong information about how to apply, eligibility requirements, incorrect processes, misleading procedural information, or any incorrect guidance that could confuse the customer.',
        mandatory: false,
      },
      {
        id: 'presentation_no_personal_opinion_advice',
        text: 'No expression of personal opinion & advice',
        description:
          "Look for: Agent avoids personal opinions and stereotypes and avoids giving comparative advice about other insurers/products. Apply the Personal Opinion Detection Guideline below.\n\nSTEP 1: Check for salesperson personal feelings or experience\n- Pattern indicators: first-person pronouns combined with emotion or preference words\n  Examples: 'I love this plan', 'I like this plan', 'I prefer this plan', 'I use this plan', 'I bought this myself'\nAction: If detected → FLAG as personal opinion\n\nSTEP 2: Check for stereotypes or group assumptions\nUNSAFE (no factual source, just assumption): 'Foreigners like this.', 'Older people usually prefer this.', 'Young customers go for this.', 'Families always choose this.'\nSAFE (group statement + factual source): 'Many of our expat customers choose this plan because it includes worldwide coverage.', 'From what we\'ve seen in our claims data, families with young children often go for this option.', 'Last year, more than half of our customers over 50 selected this plan for its critical illness cover.'\nRule: If you mention a group, you must connect it to verified data or approved observed trends; if none is mentioned, FLAG as personal opinion.\nAction: If unsafe detected → FLAG as personal opinion\n\nSTEP 3: Check for guesses without verifiable evidence\n- Predictive/certainty words without factual support\n  Examples: 'You will definitely like this', 'You will love this', 'Obviously this is the best', 'This is perfect for you' (unless tied to profile + facts)\nAction: If detected → FLAG as personal opinion\n\nSTEP 4: Needs-based recommendations (SAFE)\nCriteria for SAFE classification: recommendation is directly linked to the customer\'s expressed needs and supported by factual product features\n  Examples: 'I think this suits you because it includes maternity coverage, which you said you need', 'I recommend this as it offers worldwide coverage, and you travel often'\nAction: If criteria met → CLASSIFY AS SAFE\n\nSTEP 5: Factual product information (SAFE)\nCriteria for SAFE classification: statement describes product features, terms, or benefits from approved materials\n  Examples: 'This plan covers up to $100,000 in hospitalization', 'It includes dental benefits after six months'\n\nDETECTION RULE: If the statement fails STEP 4 and STEP 5, and passes STEP 1, STEP 2, or STEP 3 → CLASSIFY AS PERSONAL OPINION.\nIf asked for advice about other insurers/products, use a neutral disclaimer such as: 'I understand there are many products in the market and different insurers have different benefits and premiums, but I\'m not in a position to advise on other companies\' products.'\nFAIL if: Any flagged personal opinion, stereotypes without evidence, guesses without support, or comparative advice about other insurers/products.",
        mandatory: false,
      },
      {
        id: 'presentation_simple_explanations',
        text: 'Give precise, simple and easy to understand explanations and relevant examples; avoid using jargon',
        description:
          "Look for: Agent cites examples with relevance to the customer's profile, explains in a simple and clear-cut manner to allow customer to have better understanding, and where appropriate, explains definitions of certain terms. Agent should avoid technical jargon and use language that is accessible to the customer. FAIL if: Uses excessive jargon, gives confusing explanations, provides irrelevant examples, or fails to clarify technical terms when needed.",
        mandatory: false,
      },
      {
        id: 'presentation_benefits_to_create_need',
        text: 'Present and highlight the product benefits/features to create need for customer to take up the protection',
        description:
          "Look for: Agent highlights accident statistics (9% hospitalization), emphasizes everyday accident risks (kitchen cuts, sports injuries), presents comprehensive coverage connecting to customer needs. Ensure that Telesales Executive knows what he/she is selling and is able to relate to the customer the product benefits/features that are beneficial to the customer. Agent should create urgency and relevance by connecting benefits to customer's lifestyle and potential risks, demonstrating clear understanding of the product value proposition. FAIL if: Just lists benefits without creating urgency or relevance to customer, fails to highlight how benefits address customer's specific protection needs, or shows lack of product knowledge.",
        mandatory: false,
      },
      {
        id: 'presentation_no_misrepresentation',
        text: 'No misrepresentation/mislead/hard-sell tactics',
        description:
          "Look for: Agent does NOT sell the policy with intention to hide certain clauses, does not intentionally deceive the customer, does not pressure customer into buying the policy. When discussing medical leave (Daily benefit), agent specifically states 'due to accident'. Agent should not engage in aggressive hard-sell tactics or pressure customers into immediate decisions. FAIL if: Any misrepresentation, misleading information, or aggressive hard-sell tactics that pressure customer inappropriately. NOTE: Mentioning free look period in response to customer questions or concerns is acceptable.",
        mandatory: true,
      },
      {
        id: 'presentation_maintain_call_control',
        text: 'Maintain control of the call',
        description:
          'Look for: Agent leads the customer back on track if customer side tracks and deviates, answers in a straightforward and coherent manner to keep the call on track, and avoids lengthy conversation. Agent should demonstrate ability to guide the conversation effectively while remaining professional. FAIL if: Loses control of conversation, allows excessive deviation from sales process, engages in lengthy irrelevant discussions, or fails to redirect customer back to the topic.',
        mandatory: false,
      },
      {
        id: 'presentation_recognize_buying_signals',
        text: 'Recognize buying signal & opportunity to up sell',
        description:
          "Look for: From the customer\'s words and intent, the Telesales Executive identifies buying signals and closes the sale. Upsell (Deluxe/Family/Child) as appropriate to profile and needs. Applicable upsell rules include: spouse, children, parents/parents-in-law. FAIL if: Misses clear buying signals, fails to capitalize on purchase interest, attempts inappropriate upselling that doesn\'t match customer profile.",
        mandatory: false,
      },
      {
        id: 'presentation_trial_close_timing',
        text: 'Trial close the call at the right time',
        description:
          'Look for: Agent attempts to trial close after presenting 3 benefits/features. If customer is still uncertain, agent brings in another benefit and attempts to trial close again. Agent should attempt a trial close after handling an objection. Must use proper purchase language and get clear consent - do NOT use "enrollment" as a purchase question. FAIL if: Poor timing of trial closes, doesn\'t attempt trial close after benefits presentation, uses "enrollment" instead of "purchase", or fails to secure clear commitment.',
        mandatory: false,
      },
      {
        id: 'presentation_no_policy_document_selling',
        text: 'Do not sell on Policy Document/Late deduction',
        description:
          "Look for: Agent does NOT mention policy documents or late deduction to entice and influence customer's decision as a provision to read, review, purchase first and decide later. Agent should not use statements like 'you can read the policy document later' or 'billing is flexible, you can pay later' as selling points to encourage hasty purchase decisions. FAIL if: Uses policy document ('you can review it later'), late deduction, billing flexibility, or payment timing as reasons to buy or to pressure customer into immediate decision without proper consideration.",
        mandatory: false,
      },
      {
        id: 'presentation_identify_objection_reasons',
        text: 'Ask questions to identify the underlying reasons for the objection',
        description:
          "Look for: Agent proactively asks probing questions in a polite and non-intrusive manner to understand real concerns, such as 'May I know what is holding you back? Premium or coverage?' Agent should explore objections professionally without being pushy, demonstrating genuine interest in addressing customer concerns rather than just overcoming resistance. FAIL if: Doesn't probe objections, accepts rejection without exploring reasons, asks intrusive/inappropriate questions that make customer uncomfortable, or fails to identify the real underlying concerns behind objections.",
        mandatory: false,
      },
      {
        id: 'presentation_respond_objections_effectively',
        text: 'Respond to all objections effectively and to the point',
        description:
          "Look for: Agent responds to objections with relevant, targeted responses that address the specific concern raised. For example, if customer says they already have many insurance policies, agent could say: \"Yes Mr. XXX, I'm glad to hear that you believe in insurance. But with this protection, it can further enhance your current protection. As you are aware, with the rising cost of living/medical/education, the amount of protection now may not be sufficient for us 10 or 20 years down the road...\" FAIL if: Gives generic responses that don't address specific objections, provides irrelevant information, or fails to effectively counter the customer's concerns.",
        mandatory: false,
      },
      {
        id: 'presentation_three_attempts_rule',
        text: "Use the '3 attempts rule'",
        description:
          "Look for: The '3 attempts rule' serves as a guideline to the number of times a Telesales Executive should attempt to handle objection. Agent attempts to handle objections up to 3 times before backing off. If the objection remains unresolved after 3 attempts to address it, the agent should respectfully acknowledge the customer's stance and refrain from pushing further. Agent must demonstrate respect for customer's decision after 3 attempts. FAIL if: Gives up immediately without attempting to address objections, keeps pushing beyond 3 attempts inappropriately, or fails to respectfully acknowledge customer's stance after 3 unsuccessful attempts.",
        mandatory: false,
      },
    ],
  },

  communication: {
    weight: 10,
    description:
      'Evaluates telephone communication skills, professionalism, and customer engagement',
    criteria: [
      {
        id: 'communication_listening_attention',
        text: 'Pay attention to what customer is saying and with no abrupt interruption',
        description:
          'Look for: Agent focuses on customer and listens with care, ensures customer does not have to repeat the same thing more than once when they have already expressed themselves clearly, and allows customer to finish what they have to say before responding. FAIL if: Interrupts customer abruptly, makes customer repeat clear statements, or shows lack of attention to what customer is saying.',
        mandatory: false,
      },
      {
        id: 'communication_probing_skills',
        text: 'Probing skills',
        description:
          'Look for: Agent probes and finds out more information from customers where necessary. For example: if customer asks if plan covers them when they migrate, agent must probe further if customer has any plans to migrate in the near future. During presentation, if customer declares they work as an Engineer, agent must probe further for the industry. FAIL if: Misses opportunities to gather important information through probing, or fails to ask relevant follow-up questions.',
        mandatory: false,
      },
      {
        id: 'communication_clarify_concerns',
        text: "Clarify customer's interest/concerns",
        description:
          "Look for: Agent clarifies customer's interest/concerns if unsure, before attempting to address the issue. Agent should ensure understanding before providing responses. FAIL if: Responds to concerns without clarifying what customer actually means, or makes assumptions about customer's interests without verification.",
        mandatory: false,
      },
      {
        id: 'communication_acknowledge_needs',
        text: "Understand & acknowledge the customer's needs",
        description:
          "Look for: Agent is empathetic to customer's needs and highlights product benefits accordingly, proactively asks relevant questions (where applicable) to find out and understand customer's needs, and ensures customer's concerns are being addressed. FAIL if: Shows lack of empathy, doesn't ask relevant questions to understand needs, or fails to address customer concerns properly.",
        mandatory: false,
      },
      {
        id: 'communication_use_customer_name',
        text: 'Address the customer by his/her name to personalize the call',
        description:
          "Look for: Agent uses customer's name multiple times throughout call, asks for preferred name if customer's name is long, and when customer starts to drift off from conversation, uses customer's name to engage and lead them back to the context of the call. FAIL if: Rarely or never uses customer's name during conversation, or fails to use name to re-engage customer when needed.",
        mandatory: false,
      },
      // {
      //   id: 'communication_proper_hold_technique',
      //   text: 'Proper hold technique /Appropriate holding time',
      //   description:
      //     'Look for: Agent asks permission to hold, states an estimated time, thanks customer for holding when back on call. Ensures customer is not put on hold for more than 2-3 minutes. If it will take longer than expected, suggests a call back. FAIL if: Puts customer on hold without permission, exceeds appropriate hold time, or fails to thank customer when returning to call.',
      //   mandatory: false,
      // },
      {
        id: 'communication_courteous_phrases',
        text: "Use courteous phrases such as 'thank you, please', 'May I...'",
        description:
          "Look for: Agent uses polite language consistently - 'thank you', 'please', 'may I', 'would you mind', etc. throughout conversation. FAIL if: Sounds demanding, rude, or lacks basic courtesy phrases.",
        mandatory: false,
      },
      {
        id: 'communication_engaging_customer',
        text: 'Engaging the customer appropriately',
        description:
          'Look for: Agent ensures a two-way conversation to create interest and avoids awkward long silences. Agent should maintain customer engagement throughout the call. FAIL if: Creates one-way monologue, allows long awkward silences, or fails to engage customer in meaningful dialogue.',
        mandatory: false,
      },
      {
        id: 'communication_professional_manner',
        text: 'Speak in a professional manner and with correct grammar & pronunciation',
        description:
          "Look for: Agent speaks in English language uniformly throughout the conversation unless requested otherwise, has minimal use of fillers and Singlish (for example: 'argh', 'yah', 'urgh', 'no lahhh') and avoids being too casual. Evaluate based on wording and phrasing only; do not infer audio qualities. FAIL if: Excessive fillers, poor grammar, too casual tone or language, uses excessive Singlish expressions, or unprofessional wording that undermines credibility.",
        mandatory: false,
      },
      {
        id: 'communication_proper_tone_diction',
        text: 'Use proper tone and clear diction',
        description:
          'Look for: Agent uses positive, professional language and clear word choices. Assess via textual cues only; do not judge accent, inflection, intonation, or loudness. FAIL if: Wording suggests negative or unprofessional tone, unclear phrasing, or inappropriate word choices.',
        mandatory: false,
      },
    ],
  },

  salesConfirmation: {
    weight: 20,
    description:
      'Evaluates the sales closing process, eligibility verification, and data collection (only applicable if customer agrees to purchase)',
    criteria: [
      {
        id: 'sales_clear_consent_and_eligibility',
        text: 'Getting clear consent to purchase / Eligibility',
        description:
          'Look for: Agent gets clear commitment from customer before closing the sale; do NOT use "enrollment" as a purchase question. Telesales Executive should ask a clear question e.g., "May I help you with the purchase for this plan?" or "Would you like to buy this for yourself and your spouse/children?" Agent must ensure that the customer says "YES", and not "um." before closing the sale. Must check eligibility including Usual Country of Residence (UCOR) - reject applicants who declare staying outside Singapore for more than 6 consecutive months. If customer mentions plans to do so, get country, duration, purpose and occupation details for underwriting. Also check medical conditions per general guidelines and probe for more information if condition not found in guideline. FAIL if: Uses "enrollment" instead of "purchase", doesn\'t get clear "YES" consent (accepts "um" or unclear responses), skips UCOR eligibility check, proceeds despite eligibility red flags, or fails to probe medical conditions properly.',
        mandatory: true,
      },
      {
        id: 'sales_verification_of_particulars',
        text: 'Verification of personal particulars',
        description:
          "Look for: After the sale has been confirmed, agent verifies the customer's full name, NRIC no., date of birth, address, email address, and occupation. Telesales executive is NOT allowed to read out any of the information to customer - the customer must provide/read out all information to the agent for verification. Agent should ask customer to provide each detail rather than confirming pre-populated information. FAIL if: Agent reads out any information to customer instead of having customer provide it (e.g., saying 'Your name is John Smith, correct?' instead of 'Could you please provide your full name?'), skips verification of any required particulars, or fails to collect all mandatory personal details.",
        mandatory: true,
      },
      {
        id: 'sales_administrative_accuracy',
        text: 'Administrative accuracy',
        description:
          'Look for: Agent indicates the correct occupation in the system and sales submission form, ensures all administrative details are captured accurately. FAIL if: Records incorrect occupation, makes administrative errors, or fails to update system properly.',
        mandatory: false,
      },
      {
        id: 'sales_premium_and_payment',
        text: 'Premium confirmation & payment details',
        description:
          'Look for: Agent reads premium from the closing script and explains the payment process accurately. Both flows are acceptable: (1) collect Visa/Mastercard card details upfront to deduct the first month premium; (2) if customer is hesitant to provide card details, offer to trigger a Payment Link via email and guide customer through the steps. PASS if either flow is handled correctly and transparently. FAIL if: Incorrect premium information, unclear process, pressuring for card despite clear hesitation, or no link fallback when customer is hesitant.',
        mandatory: false,
      },
      {
        id: 'sales_account_details_consent',
        text: 'Consent to retrieve account details (if applicable)',
        description:
          'Look for: If applicable, agent asks permission to retrieve account details for processing. FAIL if: Accesses account information without consent when required.',
        mandatory: false,
      },
      {
        id: 'sales_marketing_consent_pdpa',
        text: 'Marketing Consent - PDPA compliance',
        description:
          "Look for: Agent asks for marketing consent using proper PDPA compliance language. If Telesales Executive fails to ask and indicates 'Yes' to Marketing Consent, this will be tagged as Fatal Error. FAIL if: Fails to ask for marketing consent, assumes consent without asking, or incorrectly records marketing consent without customer agreement.",
        mandatory: true,
      },
    ],
  },

  mandatoryDisclosure: {
    weight: 20,
    description:
      'Evaluates compliance with mandatory disclosure requirements and regulatory statements (only applicable if customer agrees to purchase)',
    criteria: [
      {
        id: 'mandatory_underwriting_questions_pa',
        text: 'Applicable to PA (ask the 2 underwriting questions - only proceed if pass the 2 UWQ)',
        description:
          "Look for: Agent asks ALL TWO underwriting questions for PA: 1) Medical conditions (diabetes, stroke, heart disease, mental illness, brain disorders, cancer unless 5+ years remission), 2) Previous PA policy declined/restricted. Only proceeds if customer passes all underwriting questions. FAIL if: Skips any underwriting question, doesn't wait for clear answers, or proceeds despite failing underwriting.",
        mandatory: true,
      },
      {
        id: 'mandatory_free_look_disclosure',
        text: '14-day free look period disclosure',
        description:
          "Look for: Agent states proper free look disclosure: 'You have 14-day free look to review the benefits of the plan. If you decide that the insurance does not meet your needs, please inform MSIG within the free look period. Any premium charged within this period will be refunded subject to no claims.' FAIL if: Significantly different wording or missing key elements.",
        mandatory: false,
      },
      {
        id: 'mandatory_effective_date',
        text: 'Policy effective date',
        description:
          "Look for: Agent clearly states 'Your policy is effective upon successful deduction of the premiums.' FAIL if: Unclear about when coverage starts or gives wrong effective date information.",
        mandatory: false,
      },
      {
        id: 'mandatory_policy_document_delivery',
        text: 'E-policy document to be sent out upon policy activation',
        description:
          "Look for: Agent states 'Do take note that the policy documents will be sent to your email address. Please keep a lookout for them.' FAIL if: Doesn't mention document delivery or gives wrong delivery method.",
        mandatory: false,
      },
      {
        id: 'mandatory_auto_renewal',
        text: 'Auto renewal condition',
        description:
          "Look for: Agent explains 'The Policy will be renewed automatically as long as the terms of the Policy are observed, unless either You or MSIG cancel the Policy. No renewal advice will be issued.' FAIL if: Doesn't mention auto-renewal or gives incorrect renewal information.",
        mandatory: false,
      },
      {
        id: 'mandatory_occupation_residence_change',
        text: 'Notify insurer changes of occupation / Intend to live outside Singapore for more than 6 months',
        description:
          "Look for: Agent states 'Should there be a change in your occupation, or you intend to live outside Singapore for more than 6 consecutive months, please inform MSIG.' FAIL if: Doesn't mention notification requirements for these changes.",
        mandatory: false,
      },
      {
        id: 'mandatory_pre_existing_exclusions',
        text: 'Pre-existing conditions, for PA-physical impairment and any illness will not be covered',
        description:
          "Look for: Agent states 'Please note that, pre-existing medical conditions are not covered by this plan and Injuries from physical defects, disabilities, mental illnesses, or brain disorders. There are also other exclusions applicable to this plan e.g the Insured being under the influence of drugs and alcohol. You are advised to read the full list of exclusions when you receive your policy contract upon purchasing the plan.' FAIL if: Missing major exclusion categories or unclear about what's not covered.",
        mandatory: false,
      },
      // {
      //   id: 'mandatory_dental_waiting_period',
      //   text: 'Applicable to Dental (90-day waiting period for all benefits except for emergency dental services)',
      //   description:
      //     'Look for: For dental products, agent mentions 90-day waiting period for all benefits except emergency dental services. FAIL if: Fails to mention waiting period for dental products when applicable.',
      //   mandatory: false,
      // },
      {
        id: 'mandatory_accident_only_coverage',
        text: 'Applicable to PA (PA covers on occurrence of Accident only) except for the Special Daily Hospitalization Benefit',
        description:
          "Look for: Agent clearly states 'All the benefits of the PA Recovery Plus policy are only payable upon an accident occurring during the policy period except for the Special Daily Hospitalisation Benefit.' FAIL if: Doesn't emphasize accident-only nature or gives impression it covers illness.",
        mandatory: false,
      },
      {
        id: 'mandatory_pa_switching_advisory',
        text: 'Applicable to PA (Switching information)',
        description:
          "Look for: Agent states 'Please consider carefully if you intend to switch personal accident policies as this might be detrimental to your current and/or future needs.' FAIL if: Significantly different wording or doesn't give switching warning.",
        mandatory: true,
      },
      {
        id: 'mandatory_personal_data_disclosure',
        text: 'Disclosure for Consent to disclose information to insurer',
        description:
          "Look for: Agent provides proper data disclosure: 'You understand and give consent to MSIG that your personal particulars will be collected, used and disclosed by MSIG in accordance with the Personal Data Protection Act and MSIG's Privacy & Cookies policy (available on our website at msig.com.sg/privacy-cookies-policy), for the provision of all services related to, and protection under this insurance Policy. MSIG may disclose your personal particulars to its business partners and third party service providers for these purpose. You confirm all persons to be insured have consented to MSIG's collection, use and disclosure of their personal particulars. MSIG may also send you mailers by post or emails. You can read the full privacy policy at MSIG's website.' FAIL if: Doesn't provide complete data disclosure or missing key privacy elements.",
        mandatory: true,
      },
      {
        id: 'mandatory_sdic_protection',
        text: 'SDIC Information',
        description:
          "Look for: Agent explains 'This policy is protected under the Policy Owners' Protection Scheme which is administered by the Singapore Deposit Insurance Corporation (SDIC). Coverage for your policy is automatic and no further action is required from you. For more information on the types of benefits that are covered under the scheme as well as the limits of coverage, where applicable, please contact MSIG or visit the GIA or SDIC websites.' FAIL if: Doesn't mention SDIC protection or gives incorrect information about scheme.",
        mandatory: true,
      },
    ],
  },

  closure: {
    weight: 5,
    description:
      'Evaluates the professional closing of the call, follow-up arrangements, and call termination',
    criteria: [
      {
        id: 'closure_standard_closing',
        text: 'Use standard closing in a professional manner',
        description:
          "Look for: Agent uses standard closing like 'Thank you for purchasing the [product name], Ms/Mr Customer' in a professional manner. Agent leaves down name and contact details and may mention MSIG customer service hotline. FAIL if: Abrupt ending, no contact details, or unprofessional closing.",
        mandatory: false,
      },
      {
        id: 'closure_reschedule_callback',
        text: 'Reschedule a specific time to call back if customer expressed interest',
        description:
          "Look for: If customer shows interest but doesn't purchase, agent schedules specific callback date and time. FAIL if: Customer interested but no follow-up arranged, or vague callback commitment.",
        mandatory: false,
      },
    ],
  },
};

// DENTIPlus-specific criteria
export const DENTAL_SECTION_CRITERIA: SectionCriteria = {
  introduction: {
    weight: 5,
    description:
      'Evaluates the opening of the call, including greeting, identification, and stating purpose of call',
    criteria: [
      {
        id: 'introduction_polite_greeting',
        text: 'Asked politely for the customer',
        description:
          "Look for: Agent responds promptly when call connects and asks politely for the customer by name (e.g., 'May I speak to Mr/Ms [Name]?'). Agent should answer immediately without delays or distractions. FAIL if: Agent is distracted, rude, doesn't ask for customer properly, or has delayed response when call connects.",
        mandatory: false,
      },
      {
        id: 'introduction_standard_greeting',
        text: 'Use standard greeting with good phone manners and enthusiasm',
        description:
          "Look for: Agent uses complete standard greeting sequence: 1) Professional greeting that politely asks for customer (time-appropriate greeting like 'Good morning/afternoon' is preferred but not mandatory), 2) Identifies who and where calling from ('I am [name], calling from MSIG Insurance Singapore Pte Ltd'), 3) Asks if customer is convenient to talk. FAIL if: Missing key elements (professional greeting, identification, convenience check), unprofessional manner, or low enthusiasm.",
        mandatory: false,
      },
      {
        id: 'introduction_state_purpose',
        text: 'State purpose of call',
        description:
          "Look for: Agent clearly states purpose (e.g., '...to share with you our DentiPlus dental plan with Classic and Platinum options'). FAIL if: Purpose unclear or does not mention DentiPlus specifically.",
        mandatory: false,
      },
    ],
  },
  presentation: {
    weight: 40,
    description:
      'Evaluates product knowledge, sales skills, objection handling, and adherence to sales process',
    criteria: [
      {
        id: 'presentation_script_adherence',
        text: 'Adhere to script given',
        description:
          'Look for: Agent follows the official script structure and logical flow - outbound greeting → product presentation → confirmation/verification process → closing verbatim. Telesales Executives are encouraged to adhere to the script; slight variations are acceptable provided that the contents are not lost. FAIL if: Major script deviations that lose essential content, missing key sections, or wrong sequence.',
        mandatory: false,
      },
      {
        id: 'presentation_correct_product_info_dental',
        text: 'Provide correct, complete and appropriate information on DentiPlus',
        description:
          'Look for: Agent provides accurate DentiPlus information per product summary/policy: two tiers (Classic S$1,000; Platinum S$1,500 overall annual limit), one preventive visit per Policy Year, radiology x-ray allowances (bitewing/panoramic/skull survey limits per year), conservative treatments (amalgam/composite/glass ionomer), non-surgical extractions (simple/complicated), endodontics (root canal, therapeutic pulpotomy excl. final restoration), in-network vs out-of-network handling (direct billing vs reimbursement), automatic renewal, e-policy delivery, SDIC protection, up to 20% discount available to all policyholders on dental treatments when booked through Inova Care panel (no waiting period, no usage limit), emergency dental covered worldwide/overseas for pain/swelling/bleeding relief. IMPORTANT: If seller pitches ONLY one plan tier (e.g., Platinum), there is NO requirement to mention the other tier (Classic) unless customer asks for lower premium/coverage options. Campaign-specific plan focus is acceptable and preferred. FAIL if: Incorrect facts (e.g., wrong premium amounts, wrong annual limits, wrong waiting periods), misleading coverage, or omits key plan structure/limits for the tier being discussed.',
        mandatory: true,
      },
      {
        id: 'presentation_correct_procedures_dental',
        text: 'Provide correct procedures and process (appointments/claims)',
        description:
          'Look for: Agent instructs non-emergency care to schedule with Contracted Providers (e.g., via hotline) for direct billing; explains out-of-network reimbursement requires claim form and original paid receipt within 30 days; mentions 14-business-day free look; cancellation and renewal terms; coverage effective upon successful premium deduction. FAIL if: Gives wrong appointment/claims process or renewal/effective date information.',
        mandatory: false,
      },
      {
        id: 'presentation_simple_explanations',
        text: 'Give precise, simple and easy to understand explanations and relevant examples; avoid jargon',
        description:
          'Look for: Clear, customer-friendly explanations; examples relevant to routine dental care and emergencies. FAIL if: Excessive jargon, confusing or irrelevant examples.',
        mandatory: false,
      },
      {
        id: 'presentation_network_advantage',
        text: 'Explain Contracted Providers network advantage vs Out-of-Contract',
        description:
          'Look for: Agent highlights direct billing and typically higher coverage at Contracted Providers; explains out-of-network reimbursement with receipts. FAIL if: Misstates network process or omits key differences.',
        mandatory: false,
      },
      {
        id: 'presentation_no_misrepresentation',
        text: 'No misrepresentation/mislead/hard-sell/selling on 14 days Free look / Flexibility to cancel',
        description:
          'Look for: Agent does NOT sell the policy with intention to hide certain clauses, does not intentionally deceive the customer, does not pressure customer into buying the policy. Agent should not engage in aggressive hard-sell tactics or pressure customers into immediate decisions. Agent does NOT mention policy documents or late deduction to entice purchase decisions. Agent does NOT sell on the basis of the 14-day free look period as a reason to buy. Agent does NOT position "flexibility to cancel" as a reason to buy. Uses precise language (e.g., "up to", "per policy year"). IMPORTANT: Mentioning the free-look period is ONLY acceptable in three contexts: (1) as part of mandatory disclosures after purchase, (2) in response to customer questions/concerns about commitment, or (3) when customer is reading the enrollment wrapper. It is NOT allowed as a sales tactic to encourage purchase. FAIL if: Any misrepresentation, misleading information, aggressive hard-sell tactics, using policy document/late deduction as selling points, using free look period proactively as sales lever to overcome objections, or encouraging purchase by emphasizing cancellation flexibility.',
        mandatory: true,
      },
      {
        id: 'presentation_maintain_call_control',
        text: 'Maintain control of the call',
        description:
          'Look for: Keeps conversation on track and concise. FAIL if: Loses control or engages in lengthy irrelevant discussions.',
        mandatory: false,
      },
      {
        id: 'presentation_recognize_buying_signals',
        text: 'Recognize buying signal & opportunity to up sell (e.g., add spouse)',
        description:
          'Look for: Identifies purchase interest; explores adding spouse/family where appropriate. FAIL if: Misses clear buying signals.',
        mandatory: false,
      },
      {
        id: 'presentation_trial_close_timing',
        text: 'Trial close the call at the right time',
        description:
          'Look for: Attempts trial close after benefits presentation/objection handling using proper “purchase” language. FAIL if: Poor timing or uses “enrollment” language.',
        mandatory: false,
      },
    ],
  },
  communication: {
    weight: 10,
    description:
      'Evaluates telephone communication skills, professionalism, and customer engagement',
    criteria: [
      {
        id: 'communication_listening_attention',
        text: 'Pay attention to what customer is saying and with no abrupt interruption',
        description:
          'Look for: Attentive listening; lets customer finish. FAIL if: Interrupts abruptly or makes customer repeat unnecessarily.',
        mandatory: false,
      },
      {
        id: 'communication_probing_skills',
        text: 'Probing skills',
        description:
          'Look for: Probes to clarify needs/concerns (e.g., regular check-ups, preferred clinics). FAIL if: Misses opportunities to probe.',
        mandatory: false,
      },
      {
        id: 'communication_clarify_concerns',
        text: "Clarify customer's interest/concerns",
        description:
          'Look for: Clarifies before addressing concerns. FAIL if: Assumes or responds without clarifying.',
        mandatory: false,
      },
      {
        id: 'communication_acknowledge_needs',
        text: "Understand & acknowledge the customer's needs",
        description:
          'Look for: Empathy; aligns benefits with preventive and common dental treatment needs. FAIL if: Lacks empathy or relevance.',
        mandatory: false,
      },
      {
        id: 'communication_appropriate_pace',
        text: 'Speak at an appropriate pace',
        description:
          'Look for: Comfortable pace. FAIL if: Too fast or too slow.',
        mandatory: false,
      },
      {
        id: 'communication_use_customer_name',
        text: 'Address the customer by his/her name to personalize the call',
        description:
          "Look for: Uses customer's name appropriately to engage. FAIL if: Rarely uses name.",
        mandatory: false,
      },
      {
        id: 'communication_courteous_phrases',
        text: "Use courteous phrases such as 'thank you, please', 'May I...'",
        description:
          'Look for: Consistent polite language. FAIL if: Sounds demanding or rude.',
        mandatory: false,
      },
      {
        id: 'communication_engaging_customer',
        text: 'Engaging the customer appropriately',
        description:
          'Look for: Two-way conversation; avoids long silences. FAIL if: One-way monologue or awkward silences.',
        mandatory: false,
      },
      {
        id: 'communication_professional_manner',
        text: 'Speak in a professional manner and with correct grammar & pronunciation',
        description:
          'Look for: Professional tone and grammar; minimal fillers. FAIL if: Unprofessional language or excessive fillers.',
        mandatory: false,
      },
      {
        id: 'communication_proper_tone_diction',
        text: 'Use proper tone and clear diction',
        description:
          'Look for: Pleasant tone, clear diction. FAIL if: Negative tone or unclear speech.',
        mandatory: false,
      },
      {
        id: 'communication_enthusiasm_confidence',
        text: 'Projecting enthusiasm and confidence in voice',
        description:
          'Look for: Positive, confident delivery. FAIL if: Flat or monotonous.',
        mandatory: false,
      },
    ],
  },
  salesConfirmation: {
    weight: 20,
    description:
      'Evaluates the sales closing process, eligibility verification, and data collection (only applicable if customer agrees to purchase)',
    criteria: [
      {
        id: 'sales_clear_consent_and_eligibility',
        text: 'Getting clear consent to purchase / Eligibility',
        description:
          "Look for: Uses clear 'purchase' language and secures explicit 'YES'; checks eligibility (age 18 to below 60 at start; usual country of residence Singapore; intends to live outside SG >6 months). FAIL if: No clear consent or skips eligibility checks.",
        mandatory: true,
      },
      {
        id: 'sales_verification_of_particulars',
        text: 'Verification of personal particulars',
        description:
          'Look for: Verifies name/NRIC/DOB/address/email/occupation by having customer provide details. FAIL if: Reads out customer data to confirm.',
        mandatory: true,
      },
      {
        id: 'sales_administrative_accuracy',
        text: 'Administrative accuracy',
        description:
          'Look for: Captures administrative details accurately. FAIL if: Errors in records.',
        mandatory: false,
      },
      {
        id: 'sales_premium_and_payment',
        text: 'Premium confirmation & payment details',
        description:
          'Look for: Reads closing script on premium and explains payment process (e.g., Payment Link/email). FAIL if: Incorrect premium or payment info.',
        mandatory: false,
      },
      {
        id: 'sales_marketing_consent_pdpa',
        text: 'Marketing Consent - PDPA compliance',
        description:
          'Look for: Asks for marketing consent with proper PDPA language. FAIL if: Fails to ask or records consent incorrectly.',
        mandatory: true,
      },
    ],
  },
  mandatoryDisclosure: {
    weight: 20,
    description:
      'Evaluates compliance with mandatory disclosure requirements and regulatory statements (only applicable if customer agrees to purchase)',
    criteria: [
      {
        id: 'mandatory_free_look_disclosure',
        text: '14-business-day free look period disclosure',
        description:
          "Look for: States free look: 'You have 14 business days to review the plan...' FAIL if: Missing key elements.",
        mandatory: false,
      },
      {
        id: 'mandatory_effective_date',
        text: 'Policy effective date',
        description:
          "Look for: 'Your policy is effective upon successful deduction of the premiums.' FAIL if: Gives wrong effective date.",
        mandatory: false,
      },
      {
        id: 'mandatory_policy_document_delivery',
        text: 'E-policy document to be sent out upon policy activation',
        description:
          'Look for: Mentions e-policy delivery to email. FAIL if: No mention or wrong method.',
        mandatory: false,
      },
      {
        id: 'mandatory_auto_renewal',
        text: 'Auto renewal condition',
        description:
          'Look for: Explains automatic yearly renewal unless cancelled by either party. FAIL if: Omits or misstates auto-renewal.',
        mandatory: false,
      },
      {
        id: 'mandatory_ucor_notice',
        text: 'Notify insurer if usual country of residence changes (>6 months abroad)',
        description:
          'Look for: Advises to inform MSIG if residing outside SG >6 months; terms may change. FAIL if: No mention when applicable.',
        mandatory: false,
      },
      {
        id: 'mandatory_pre_existing_exclusions',
        text: 'Pre-existing conditions not covered',
        description:
          'Look for: States pre-existing conditions are excluded and other key exclusions exist; advise reading full policy. FAIL if: Omits pre-existing exclusions.',
        mandatory: false,
      },
      {
        id: 'mandatory_not_medisave',
        text: 'Not a Medisave-approved policy',
        description:
          'Look for: States policy is not Medisave-approved. FAIL if: Misstates Medisave eligibility.',
        mandatory: false,
      },
      {
        id: 'mandatory_personal_data_disclosure',
        text: 'Disclosure for Consent to disclose information to insurer',
        description:
          'Look for: Provides PDPA data disclosure statement consistent with MSIG policy. FAIL if: Missing key privacy elements.',
        mandatory: true,
      },
      {
        id: 'mandatory_sdic_protection',
        text: 'SDIC Information',
        description:
          "Look for: Explains Policy Owners' Protection Scheme (SDIC). FAIL if: Omits SDIC info.",
        mandatory: true,
      },
    ],
  },
  closure: {
    weight: 5,
    description:
      'Evaluates the professional closing of the call, follow-up arrangements, and call termination',
    criteria: [
      {
        id: 'closure_standard_closing',
        text: 'Use standard closing in a professional manner',
        description:
          'Look for: Professional closing; mentions any applicable promotion and MSIG customer service hotline. FAIL if: Abrupt/unprofessional closing.',
        mandatory: false,
      },
      {
        id: 'closure_reschedule_callback',
        text: 'Reschedule a specific time to call back if customer expressed interest',
        description:
          'Look for: Schedules specific callback when appropriate. FAIL if: No follow-up for interested customer.',
        mandatory: false,
      },
    ],
  },
};

// DentiPlus Telesales-specific criteria - uses dental-specific criteria from DENTAL_SECTION_CRITERIA
export const DENTAL_TELESALES_SECTION_CRITERIA: SectionCriteria = {
  ...DENTAL_SECTION_CRITERIA,
  mandatoryDisclosure: {
    weight: 20,
    description:
      'Evaluates compliance with mandatory disclosure requirements and regulatory statements (only applicable if customer agrees to purchase)',
    criteria: SECTION_CRITERIA.mandatoryDisclosure.criteria.filter(
      (criterion) =>
        criterion.id !== 'mandatory_underwriting_questions_pa' &&
        criterion.id !== 'mandatory_accident_only_coverage' &&
        criterion.id !== 'mandatory_pa_switching_advisory',
    ),
  },
};

// Evaluation response interface
export interface CriterionEvaluation {
  criteriaId: string;
  criteriaText: string;
  pass: boolean;
  mandatory: boolean;
  evidence: string;
}

export interface SectionEvaluation {
  sectionType: keyof SectionCriteria;
  sectionWeight: number;
  description: string;
  evaluations: CriterionEvaluation[];
}

export interface EvaluationResponse {
  sectionEvaluation: SectionEvaluation;
}

const msigEvaluationPrompt = `You are an expert sales coach specializing in MSIG telesales quality assurance for product sales. Your task is to evaluate a sales roleplay transcript based on specific MSIG QA guidelines for the {{sectionType}} section.

IMPORTANT: In the transcript, the user (salesperson) is speaking with an AI character (the prospect). Focus exclusively on the salesperson's performance in selling the specified product.

[SPEECH-TO-TEXT ARTIFACT HANDLING]
**CRITICAL: User messages are transcribed from speech-to-text (STT), so minor stylistic issues are likely due to this process. Do NOT flag these unless they fundamentally change the meaning or represent genuine product misinformation.**

- **COMMON STT ARTIFACTS TO IGNORE**: Number substitutions ("4" for "for", "2" for "to", "u" for "you"), missing spaces in compound words, capitalization variations, and punctuation inconsistencies should NOT be flagged as errors.
- **PRODUCT NAME STT VARIATIONS TO IGNORE**: Minor variations in product names that are clearly STT artifacts (e.g., "PA Recovery Plus" vs "PARecovery Plus", "Power Recovery Plus" vs "PA Recovery Plus", "MSIG" vs "M-SIG", "DentiPlus" vs "Denti Plus", missing spaces, capitalization differences) should NOT be flagged as errors.
- **PRONUNCIATION/NAME VARIATIONS TO IGNORE**: Do NOT flag pronunciation-related issues or proper-name formatting differences for products or company names (spacing, hyphenation, capitalization, or phonetic spellings caused by STT). Only flag if the identity changes (entirely different product/company) or if meaning is materially altered.
- **ONLY flag as genuine errors**: Factual mistakes about features, pricing, coverage, terms, or entirely wrong product names - NOT minor pronunciation or formatting variations.

[SCRIPT AND PRODUCT REFERENCE]
Use the following official references based on the product being sold.

{{scriptReference}}

{{productReference}}

[TELESALES COMPLIANCE CONTEXT]
**IMPORTANT**: When evaluating telesales conversations, consider these regulatory and compliance requirements:

1. **Competitor Comparisons**: Direct competitor comparisons are PROHIBITED in Singapore General Insurance telesales. Agents can ONLY highlight their product benefits and USPs. Avoiding competitor mentions is CORRECT and MANDATORY compliance behavior. Score based on quality of own-product presentation.

2. **Plan Tier Mentions**: Pitching ONE campaign-specific plan tier (e.g., only Platinum) is CORRECT telesales practice. Mentioning other tiers is NOT required unless customer specifically asks for alternatives. Campaign focus is the preferred approach.

3. **Free-Look Period Usage**: The 14-day free-look period belongs ONLY in mandatory disclosures or responses to customer concerns. Using it proactively as a sales tactic is PROHIBITED. Only flag if used to pressure purchase or overcome objections.

4. **Member Discounts and Benefits**: For DentiPlus, the up to 20% discount through Inova Care panel is a legitimate product benefit. Mentioning this is accurate and correct.

5. **Emergency Coverage**: For DentiPlus, worldwide/overseas emergency dental coverage (pain relief, swelling, bleeding) is accurate product information. This is correct to mention.

[CRITICAL RESTRICTIONS]
**FOCUS ON THE USER'S PERFORMANCE.** In the conversation transcript:
- Messages labeled with "user:" are from the salesperson - EVALUATE THESE
- Messages labeled with "ai:" are from the prospect - USE FOR CONTEXT ONLY

**Do NOT evaluate the prospect's responses, but DO use them to understand the conversation flow and context.** 
Focus exclusively on analyzing how well the salesperson met the specified criteria based on the full conversation context.

[EVALUATION SECTION]
Section: {{sectionType}}
Weight: {{sectionWeight}}%
Total Criteria: {{totalCriteria}}

[CRITERIA TO EVALUATE]
{{criteriaList}}

[SECTION APPLICABILITY]
**IMPORTANT**: Before evaluating criteria, determine if this section is applicable:

- **Sales Confirmation & Mandatory Disclosure sections**: Only applicable if the customer explicitly agreed to purchase the product. Look for clear customer consent like "Yes, I want to buy", "I agree to purchase", "Let's proceed with the plan", etc. If the customer declined, said "maybe later", "I need to think about it", or the conversation ended without purchase agreement, mark isApplicable: false.

- **All other sections**: Always applicable regardless of purchase outcome.

[ASSESSMENT INSTRUCTIONS]
For each criterion, provide a simple **Pass/Fail** assessment:

**Pass (true)**: The salesperson clearly demonstrated or mentioned the required element
**Fail (false)**: The salesperson failed to address or adequately demonstrate the required element  

**If section is not applicable**: Set isApplicable: false, provide notApplicableReason, and leave evaluations array empty.

[EVIDENCE REQUIREMENTS]
For each assessment, provide brief evidence from the transcript showing what the salesperson said or did.

[MANDATORY CRITERIA]
Criteria marked with mandatory: true are critical requirements. 

[STRICT JSON OUTPUT FORMAT]
{{
  "sectionEvaluation": {{
    "sectionType": "{{sectionType}}",
    "sectionWeight": {{sectionWeight}},
    "description": "string", // What this section measures
    "isApplicable": "boolean", // true if section is applicable, false if not applicable
    "notApplicableReason": "string", // Required if isApplicable is false - reason why section is not applicable
    "evaluations": [
      {{
        "criteriaId": "string",
        "criteriaText": "string",
        "pass": "boolean", // true/false for pass/fail
        "mandatory": "boolean", // true if this is a mandatory criterion
        "evidence": "string" // Brief evidence from transcript
      }}
    ]
  }}
}}`;

const userTemplate = `[SALES CONVERSATION CONTEXT]
Call Type: {callType}
Scenario: {scenario}  
Objectives: {objectives}
Framework: {framework}

[TRANSCRIPT START]
{transcript}
[TRANSCRIPT END]

Generate a {{sectionType}} section assessment based strictly on the salesperson's adherence to MSIG QA criteria. Output ONLY valid JSON using the exact format specified.

**Key Requirements:**
- **IGNORE STT ARTIFACTS**: Do NOT flag minor product name variations, capitalization differences, missing spaces, or pronunciation-based spellings that are clearly STT artifacts (e.g., "Power Recovery Plus" vs "PA Recovery Plus", "M-SIG" vs "MSIG"). Only flag genuine product errors.
- Evaluate each criterion with pass: true/false
- mandatory: must match exactly the [MANDATORY] or [NOT MANDATORY] label from the criteria list above — do NOT override these labels
- Simple pass/fail assessment with evidence`;

export function getMSIGSectionPrompt({
  sectionType,
  language,
  productId,
  callType,
}: {
  sectionType: keyof SectionCriteria;
  language?: string;
  productId?: string;
  callType?: string;
}) {
  const isDental = productId === 'dentiplus';
  const isTelesales = callType === 'telesales';

  // Determine which criteria set to use:
  // - DentiPlus + Telesales: use DENTAL_TELESALES_SECTION_CRITERIA
  // - DentiPlus + Other: use DENTAL_SECTION_CRITERIA
  // - PARecoveryPlus: use SECTION_CRITERIA
  let criteriaSet: SectionCriteria;
  if (isDental && isTelesales) {
    criteriaSet = DENTAL_TELESALES_SECTION_CRITERIA;
  } else if (isDental) {
    criteriaSet = DENTAL_SECTION_CRITERIA;
  } else {
    criteriaSet = SECTION_CRITERIA;
  }

  const sectionData = criteriaSet[sectionType];

  if (!sectionData) {
    throw new Error(`Invalid section type: ${sectionType}`);
  }

  // Format criteria list for prompt
  const criteriaList = sectionData.criteria
    .map(
      (criterion, index) =>
        `${index + 1}. **${criterion.text}** (ID: ${criterion.id})${criterion.mandatory ? ' [MANDATORY]' : ' [NOT MANDATORY]'}
   Description: ${criterion.description}`,
    )
    .join('\n\n');

  // Select product reference based on productId
  const scriptReference = isDental
    ? getDentiPlusScriptReference()
    : getPARecoveryPlusScriptReference();
  const productReference = isDental
    ? getDentiPlusProductInfoForPrompt()
    : getPARecoveryPlusProductInfoForPrompt();

  let basePrompt = msigEvaluationPrompt
    .replaceAll('{{sectionType}}', sectionType)
    .replaceAll('{{sectionWeight}}', sectionData.weight.toString())
    .replaceAll('{{totalCriteria}}', sectionData.criteria.length.toString())
    .replaceAll('{{criteriaList}}', criteriaList)
    .replaceAll('{{scriptReference}}', scriptReference)
    .replaceAll('{{productReference}}', productReference);

  let userPrompt = userTemplate.replaceAll('{{sectionType}}', sectionType);

  if (language) {
    basePrompt = `${basePrompt}

[LANGUAGE]
IMPORTANT: The output should be in ${language} language.`;
    userPrompt += `

[IMPORTANT] The assessment should be in ${language} language.`;
  }

  return {
    prompt: ChatPromptTemplate.fromMessages([
      ['system', basePrompt],
      ['user', userPrompt],
    ]),
    sectionData: {
      ...sectionData,
      description: sectionData.description,
    },
  };
}

// Helper functions
export function getAvailableSections(): Array<keyof SectionCriteria> {
  return Object.keys(SECTION_CRITERIA) as Array<keyof SectionCriteria>;
}

export function getSectionWeight(sectionType: keyof SectionCriteria): number {
  return SECTION_CRITERIA[sectionType]?.weight || 0;
}

export function isMandatoryCriterion(criteriaId: string): boolean {
  for (const section of Object.values(SECTION_CRITERIA)) {
    const criterion = section.criteria.find(
      (c: Criterion) => c.id === criteriaId,
    );
    if (criterion) {
      return criterion.mandatory === true;
    }
  }
  return false;
}

export function getMandatoryCriteria(
  sectionType: keyof SectionCriteria,
): Criterion[] {
  return (
    SECTION_CRITERIA[sectionType]?.criteria.filter(
      (c) => c.mandatory === true,
    ) || []
  );
}

export function getTotalCriteria(sectionType: keyof SectionCriteria): number {
  return SECTION_CRITERIA[sectionType]?.criteria.length || 0;
}
