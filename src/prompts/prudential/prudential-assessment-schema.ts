import { z } from 'zod';

const fourCFrameworkExecutionSchema = z.object({
  overallScore: z.number(),
  completedItems: z.array(z.string()),
  toImproveItems: z.array(z.string()),
});

const threeFFrameworkExecutionSchema = z.object({
  overallScore: z.number(),
  completedItems: z.array(z.string()),
  toImproveItems: z.array(z.string()),
});

const objectionHandlingSchema = z.object({
  overallScore: z.number(),
  completedItems: z.array(z.string()),
  toImproveItems: z.array(z.string()),
  objections: z.array(
    z.object({
      objection: z.string(),
      userResponse: z.string(),
      isSuccessful: z.boolean(),
      feedback: z.string(),
    }),
  ),
});

const clientVerificationSchema = z.object({
  completed: z.boolean(),
  completedItems: z.array(z.string()),
  toImproveItems: z.array(z.string()),
});

export const prudentialColdCallSalesTechniqueSchema = z.object({
  frameworkExecution: fourCFrameworkExecutionSchema,
  objectionHandling: objectionHandlingSchema,
  clientVerification: clientVerificationSchema,
});

export const prudentialProductPositioningSchema = z.object({
  frameworkExecution: threeFFrameworkExecutionSchema,
  objectionHandling: objectionHandlingSchema,
});

// PRUShield Product Knowledge - Basics Level (Sales Novice)
const prushieldProductBasicsSchema = z.object({
  headline: z.object({
    provided: z
      .boolean()
      .describe(
        'Did they provide correct headline about MediSave-approved Integrated Shield Plan?',
      ),
    accurate: z
      .boolean()
      .describe("Was the headline accurate? (doesn't have to be verbatim)"),
  }),
  needsAddressing: z.object({
    identified: z
      .boolean()
      .describe("Did they identify client's financial objective?"),
    justified: z
      .boolean()
      .describe("Did they justify how PRUShield suits client's requirements?"),
  }),
  uniqueSellingPoints: z.object({
    betterCoverage: z
      .boolean()
      .describe(
        'Mentioned Better Coverage USP (high annual coverage including cancer treatment, minimised out-of-pocket expenses and risk-based loading)',
      ),
    betterSavings: z
      .boolean()
      .describe(
        'Mentioned Better Savings USP (affordable plans tailored for different budgets)',
      ),
    betterExperience: z
      .boolean()
      .describe(
        'Mentioned Better Healthcare Experience USP (smooth hospitalisation with value-added services)',
      ),
  }),
  existingPlanInquiry: z.object({
    asked: z
      .boolean()
      .describe(
        'Asked if customer currently holds Integrated Shield Plan with another insurer',
      ),
  }),
});

// PRUShield Product Knowledge - Intermediate Level (Skilled Advisor)
const prushieldProductIntermediateSchema = z.object({
  coverageDetails: z.object({
    deductiblesCoinsurance: z
      .boolean()
      .describe('Explained deductibles and co-insurance coverage'),
    inpatientDaySurgery: z
      .boolean()
      .describe('Explained Inpatient and Day Surgery Benefits'),
    prePostHospitalization: z
      .boolean()
      .describe('Explained Pre- and post-hospitalisation benefits'),
  }),
  premiumJustification: z.object({
    whyProposed: z.boolean().describe('Explained why this amount is proposed'),
    addressesShortfall: z
      .boolean()
      .describe("How this addresses client's identified shortfall/gap"),
    affordabilityCheck: z
      .boolean()
      .describe(
        "Found out and explained if amount is within client's affordability",
      ),
  }),
  pruPanelServices: z.object({
    appointmentBooking: z.boolean().describe('Mentioned appointment booking'),
    enhancedLOG: z.boolean().describe('Mentioned Enhanced Letter of Guarantee'),
    preauthorization: z
      .boolean()
      .describe('Mentioned Pre-authorisation process'),
    conciergeService: z.boolean().describe('Mentioned Concierge Service'),
    extendedPanel: z
      .boolean()
      .describe(
        'Mentioned Extended Panel (wider network of healthcare providers)',
      ),
  }),
  risksLimitations: z.object({
    switchingImplications: z
      .boolean()
      .describe('Explained implication of switching'),
    preexistingConditions: z
      .boolean()
      .describe('Explained pre-existing conditions'),
    risksInvolved: z
      .boolean()
      .describe('Explained risks involved in this plan'),
    freelookPeriod: z.boolean().describe('Explained freelook period'),
  }),
});

// PRUShield Product Knowledge - Expert Level (Strategic Consultant)
const prushieldProductExpertSchema = z.object({
  competitorComparison: z.object({
    compared: z
      .boolean()
      .describe('Made comparison with similar solutions from competitor'),
    explainedDifferences: z
      .boolean()
      .describe(
        'Explained key differences between PRUShield and competitor plans',
      ),
    providedProsCons: z
      .boolean()
      .describe(
        'Provided pros and cons of PRUShield versus competitor alternatives',
      ),
  }),
});

// PRUShield Operational Knowledge - Basics Level (Sales Novice)
const prushieldOperationalBasicsSchema = z.object({
  underwritingExplanation: z.object({
    explained: z
      .boolean()
      .describe('Explained that PRUShield is a full medical underwriting plan'),
    consequences: z
      .boolean()
      .describe(
        'Explained the implications for the client (additional medical underwriting requirements)',
      ),
  }),
});

// PRUShield Operational Knowledge - Intermediate Level (Skilled Advisor)
const prushieldOperationalIntermediateSchema = z.object({
  healthConditionProbing: z.object({
    probed: z
      .boolean()
      .describe('Probed the customer about existing health conditions'),
    documented: z
      .boolean()
      .describe('Documented any pre-existing conditions, if applicable'),
  }),
});

// PRUShield Operational Knowledge - Expert Level (Strategic Consultant)
const prushieldOperationalExpertSchema = z.object({
  claimsProcess: z.object({
    regularClaims: z
      .boolean()
      .describe(
        'Explained claim process for standard scenarios under PRUShield',
      ),
    companyInsurance: z
      .boolean()
      .describe(
        'Explained claim process if they have company medical insurance plan',
      ),
  }),
  claimsBasedPricing: z.object({
    explained: z.boolean().describe('Explained how claims-based pricing works'),
    scenarios: z
      .boolean()
      .describe(
        'Provided claims-based pricing scenarios for different sources',
      ),
    premiumImpact: z.boolean().describe('Explained impact to premiums'),
  }),
  pruWellRewards: z.object({
    explained: z.boolean().describe('Explained benefits of PRUWell Rewards'),
    conditions: z
      .boolean()
      .describe('Explained conditions that need to be met'),
  }),
});

// PRULifetime Product Knowledge - Basics Level (Sales Novice)
const prulifetimeProductBasicsSchema = z.object({
  headline: z.object({
    provided: z
      .boolean()
      .describe(
        'Did they provide correct headline about insurance solution providing monthly income for life?',
      ),
    accurate: z.boolean().describe('Was the headline accurate?'),
  }),
  needsAddressing: z.object({
    identified: z
      .boolean()
      .describe("Did they identify client's financial objective?"),
    justified: z
      .boolean()
      .describe(
        "Did they justify how PRULifetime suits client's requirements and financial objectives?",
      ),
  }),
  customerSuitability: z.object({
    appropriate: z
      .boolean()
      .describe('Identified appropriate customer profile'),
    relevant: z
      .boolean()
      .describe('Connected solution to specific financial objectives'),
  }),
  uniqueSellingPoints: z.object({
    monthlyIncome: z
      .boolean()
      .describe('Mentioned monthly cash benefit starting from 49th month'),
    disabilityWaiver: z
      .boolean()
      .describe('Mentioned disability waiver benefit'),
    retrenchmentBenefit: z.boolean().describe('Mentioned retrenchment benefit'),
    changeOfLifeAssured: z
      .boolean()
      .describe('Mentioned change of life assured benefit'),
  }),
  deathBenefits: z.object({
    regularDeath: z
      .boolean()
      .describe('Explained non-accidental death benefits'),
    accidentalDeath: z
      .boolean()
      .describe('Explained accidental death benefits'),
  }),
  cashBenefitDetails: z.object({
    guaranteedPortion: z
      .boolean()
      .describe(
        'Explained guaranteed portion (0.864% per annum of Face Value)',
      ),
    nonGuaranteedPortion: z
      .boolean()
      .describe(
        'Explained non-guaranteed portion (2.004% per annum of Face Value)',
      ),
    paymentOptions: z
      .boolean()
      .describe(
        'Explained payment options (receive monthly or accumulate with PACS)',
      ),
    timing: z
      .boolean()
      .describe('Explained benefits start from 49th policy month'),
  }),
  paymentTerms: z.object({
    options: z.boolean().describe('Explained available payment term options'),
  }),
  premiumJustification: z.object({
    whyProposed: z.boolean().describe('Explained why this amount is proposed'),
    addressesObjective: z
      .boolean()
      .describe("How this addresses client's identified financial objective"),
    affordabilityCheck: z
      .boolean()
      .describe(
        "Found out and explained if amount is within client's affordability",
      ),
  }),
  risksLimitations: z.object({
    earlyTermination: z
      .boolean()
      .describe('Explained implication of early surrender or termination'),
    nonGuaranteedElements: z
      .boolean()
      .describe('Explained non-guaranteed elements and their risks'),
    freelookPeriod: z.boolean().describe('Explained freelook period'),
  }),
  fixedDepositComparison: z.object({
    explainedDifferences: z
      .boolean()
      .describe(
        'Explain how this plan differs from fixed deposits and highlight why it offers better benefits for the client.',
      ),
  }),
});

// PRULifetime Product Knowledge - Intermediate Level (Skilled Advisor)
const prulifetimeProductIntermediateSchema = z.object({
  fully: z.object({
    explained: z
      .boolean()
      .describe(
        'Fully explained all product information (Refer to the "Sales Novice" criteria for the full list of product information items).',
      ),
  }),
});

// PRULifetime Product Knowledge - Expert Level (Strategic Consultant)
const prulifetimeProductExpertSchema = z.object({
  personalization: z.object({
    uspScenario: z
      .boolean()
      .describe("Related unique selling points to client's scenario"),
    coverageScenario: z
      .boolean()
      .describe("Related coverage benefits to client's scenario"),
    timelinePerspective: z
      .boolean()
      .describe("Spoke the policy timeline in client's age/perspective"),
  }),
});

// PRULifetime Operational Knowledge - Basics Level (Sales Novice)
const prulifetimeOperationalBasicsSchema = z.object({
  guaranteedIssuance: z.object({
    explained: z
      .boolean()
      .describe('Explained this is a Guaranteed Issuance (GIO) plan'),
  }),
});

// PRULifetime Operational Knowledge - Intermediate Level (Skilled Advisor)
const prulifetimeOperationalIntermediateSchema = z.object({
  operationalProcesses: z.object({
    changeLifeAssured: z
      .boolean()
      .describe(
        'Explain the process required to any servicing requests specific to the solution: How to change second life assured.',
      ),
  }),
  riskManagement: z.object({
    preexistingConditions: z
      .boolean()
      .describe(
        'Declared pre-existing conditions and explained implications (e.g. premiums will be refunded)',
      ),
  }),
});

// PRULifetime Operational Knowledge - Expert Level (Strategic Consultant)
const prulifetimeOperationalExpertSchema = z.object({
  competitorComparison: z.object({
    compared: z
      .boolean()
      .describe('Made comparison with similar solutions from competitor'),
    explainedDifferences: z
      .boolean()
      .describe(
        'Explained differences, pros and cons of PRULifetime vs alternatives',
      ),
  }),
});

// PRUShield Product Knowledge Assessment Schema (tiered)
const prushieldProductAssessmentSchema = z.object({
  prushieldBasics: prushieldProductBasicsSchema,
  prushieldIntermediate: prushieldProductIntermediateSchema,
  prushieldExpert: prushieldProductExpertSchema,
});

// PRUShield Operational Knowledge Assessment Schema (tiered)
const prushieldOperationalAssessmentSchema = z.object({
  prushieldBasics: prushieldOperationalBasicsSchema,
  prushieldIntermediate: prushieldOperationalIntermediateSchema,
  prushieldExpert: prushieldOperationalExpertSchema,
});

// PRULifetime Product Knowledge Assessment Schema (tiered)
const prulifetimeProductAssessmentSchema = z.object({
  prulifetimeBasics: prulifetimeProductBasicsSchema,
  prulifetimeIntermediate: prulifetimeProductIntermediateSchema,
  prulifetimeExpert: prulifetimeProductExpertSchema,
});

// PRULifetime Operational Knowledge Assessment Schema (tiered)
const prulifetimeOperationalAssessmentSchema = z.object({
  prulifetimeBasics: prulifetimeOperationalBasicsSchema,
  prulifetimeIntermediate: prulifetimeOperationalIntermediateSchema,
  prulifetimeExpert: prulifetimeOperationalExpertSchema,
});

// PRUVantage Product Knowledge - Basics Level (Sales Novice)
const pruvantageProductBasicsSchema = z.object({
  headline: z.object({
    provided: z
      .boolean()
      .describe(
        'Did they provide correct headline that PRUVantage Assure II is a regular premium, whole of life investment-linked policy with downside protection (Wealth Assure) and Dual Accounts?',
      ),
    accurate: z.boolean().describe('Was the headline accurate and complete?'),
  }),
  needsAddressing: z.object({
    identified: z
      .boolean()
      .describe(
        "Did they identify client's financial objective (wealth accumulation, flexibility, protection)?",
      ),
    justified: z
      .boolean()
      .describe(
        "Did they justify how PRUVantage Assure II suits client's requirements and objectives?",
      ),
  }),
  uniqueSellingPoints: z.object({
    wealthAssure: z
      .boolean()
      .describe(
        'Mentioned Wealth Assure USP (locks the highest daily account value up to S$20M or 3x lifetime premium)',
      ),
    coverageGrowth: z
      .boolean()
      .describe(
        'Mentioned Coverage Growth USP (Sum Assured starts at 103% and increases 3% yearly up to 160%)',
      ),
    dualAccounts: z
      .boolean()
      .describe(
        'Mentioned Dual Accounts USP (Growth vs Flex - Welcome Bonus, dividend timing differences)',
      ),
  }),
  planMechanics: z.object({
    deathBenefits: z
      .boolean()
      .describe(
        'Explained Death/Accidental Disability payout: highest of (Sum Assured, Wealth Assure Value, Account value) plus Additional Investment Account',
      ),
    bonuses: z
      .boolean()
      .describe(
        'Mentioned bonuses: Welcome Bonus (first 3 years) and Loyalty Bonus (0.5% annually after term)',
      ),
    uobSpecifics: z
      .boolean()
      .describe(
        'Mentioned UOB specifics if applicable: default 100% Growth allocation; entry age up to 65 ANB',
      ),
  }),
});

// PRUVantage Product Knowledge - Intermediate Level (Skilled Advisor)
const pruvantageProductIntermediateSchema = z.object({
  accountAllocationDetails: z.object({
    dualAccountAllocation: z
      .boolean()
      .describe(
        'Explained Dual Account allocation and that allocation is fixed during premium term',
      ),
    additionalInvestmentAccount: z
      .boolean()
      .describe(
        'Explained Additional Investment Account (Investment Booster top-ups, 3% charge, min S$1,000)',
      ),
  }),
  premiumChargesFlexibility: z.object({
    surrenderWithdrawalCharges: z
      .boolean()
      .describe(
        'Explained surrender/withdrawal charge structure across premium terms',
      ),
    premiumPassWealthShare: z
      .boolean()
      .describe(
        'Explained Premium Pass, Wealth Share, and Change of Life Assured processes at a high level',
      ),
  }),
  risksLimitations: z.object({
    investmentRisk: z
      .boolean()
      .describe(
        'Explained investment risk and impact of charges with age/market conditions',
      ),
    withdrawalImpact: z
      .boolean()
      .describe(
        'Explained withdrawals reduce Sum Assured/Wealth Assure mechanics where applicable',
      ),
  }),
});

// PRUVantage Product Knowledge - Expert Level (Strategic Consultant)
const pruvantageProductExpertSchema = z.object({
  personalizationComparison: z.object({
    relatedToClientScenario: z
      .boolean()
      .describe(
        'Related USPs and account choices to client scenario and objectives',
      ),
    comparedAlternatives: z
      .boolean()
      .describe(
        'Compared vs similar ILPs or endowments, explaining differences, pros and cons',
      ),
    clientPerspectiveTimeline: z
      .boolean()
      .describe('Spoke the policy timeline in client age/perspective'),
  }),
});

// PRUVantage Operational Knowledge - Basics Level (Sales Novice)
const pruvantageOperationalBasicsSchema = z.object({
  planRulesBasics: z.object({
    minimumContribution: z
      .boolean()
      .describe(
        'Explained minimum contribution period (first 24 months) and consequences',
      ),
    fundSwitchingDividends: z
      .boolean()
      .describe(
        'Explained fund switching basics and dividend options timing (Growth vs Flex)',
      ),
  }),
});

// PRUVantage Operational Knowledge - Intermediate Level (Skilled Advisor)
const pruvantageOperationalIntermediateSchema = z.object({
  servicingProcesses: z.object({
    partialWithdrawalsTopups: z
      .boolean()
      .describe('Explained partial withdrawals, top-ups, and impact on values'),
    premiumPassActivation: z
      .boolean()
      .describe('Explained how to activate Premium Pass and its effects'),
    wealthSharePrerequisites: z
      .boolean()
      .describe('Explained Wealth Share prerequisites at a high level'),
  }),
});

// PRUVantage Operational Knowledge - Expert Level (Strategic Consultant)
const pruvantageOperationalExpertSchema = z.object({
  advancedScenariosRiskManagement: z.object({
    administrationCharges: z
      .boolean()
      .describe(
        'Explained administration/assurance charges and sustainability considerations',
      ),
    allocationPortfolioExamples: z
      .boolean()
      .describe(
        'Provided nuanced examples for allocation choices and portfolio scenarios',
      ),
    wealthAssureSurrenderClarification: z
      .boolean()
      .describe(
        'Clarified non-consideration of Wealth Assure for surrender value calculation',
      ),
  }),
});

// PRUVantage Product Knowledge Assessment Schema (tiered)
const pruvantageProductAssessmentSchema = z.object({
  pruvantageBasics: pruvantageProductBasicsSchema,
  pruvantageIntermediate: pruvantageProductIntermediateSchema,
  pruvantageExpert: pruvantageProductExpertSchema,
});

// PRUVantage Operational Knowledge Assessment Schema (tiered)
const pruvantageOperationalAssessmentSchema = z.object({
  pruvantageBasics: pruvantageOperationalBasicsSchema,
  pruvantageIntermediate: pruvantageOperationalIntermediateSchema,
  pruvantageExpert: pruvantageOperationalExpertSchema,
});

// ========================================
// PRUWealth Plus Assessment Schemas
// ========================================

// PRUWealth Plus Product Knowledge - Basics Level (Sales Novice)
const pruwealthProductBasicsSchema = z.object({
  headline: z.object({
    provided: z
      .boolean()
      .describe(
        'Did they provide correct headline that PRUWealth Plus is a single premium participating whole life policy until age 130 with wealth accumulation and comprehensive protection?',
      ),
    accurate: z.boolean().describe('Was the headline accurate and complete?'),
  }),
  needsAddressing: z.object({
    identified: z
      .boolean()
      .describe(
        "Did they identify client's financial objective (wealth accumulation, protection, retirement, wealth transfer)?",
      ),
    justified: z
      .boolean()
      .describe(
        "Did they justify how PRUWealth Plus suits client's requirements and objectives?",
      ),
  }),
  uniqueSellingPoints: z.object({
    extendedCoverage: z
      .boolean()
      .describe(
        'Explained extended coverage to age 130 vs competitors age 99-100',
      ),
    retrenchmentBenefit: z
      .boolean()
      .describe(
        'Explained retrenchment benefit (10% single premium, first 5 years, one-time)',
      ),
    secondaryLifeAssured: z
      .boolean()
      .describe(
        'Explained secondary life assured (policy continues on primary death)',
      ),
    changeOfLifeAssured: z
      .boolean()
      .describe(
        'Explained change of life assured (unlimited changes after 2 years for estate planning)',
      ),
    srsCompatibility: z
      .boolean()
      .describe(
        'Explained SRS compatibility (can be purchased with SRS funds for retirement)',
      ),
  }),
  coverageProvided: z.object({
    deathBenefits: z
      .boolean()
      .describe(
        'Explained death benefits (101% premium/surrender value regular, 105% accidental)',
      ),
    bonuses: z
      .boolean()
      .describe('Explained reversionary and performance bonuses'),
    maturityBenefit: z
      .boolean()
      .describe('Explained maturity benefit at age 130'),
  }),
  bonuses: z.object({
    reversionaryBonus: z
      .boolean()
      .describe(
        'Explained reversionary bonus (non-guaranteed, becomes guaranteed when declared from year 2)',
      ),
    performanceBonus: z
      .boolean()
      .describe(
        'Explained performance bonus (non-guaranteed, paid at surrender/claim/maturity)',
      ),
  }),
  policyTimeline: z.object({
    singlePremium: z
      .boolean()
      .describe('Explained single premium payment structure'),
    ageThirtyCoverage: z
      .boolean()
      .describe('Explained coverage extends to age 130'),
    faceValueVsSumAssured: z
      .boolean()
      .describe(
        'Explained face value vs sum assured distinction (face value for bonus calculations)',
      ),
    policyLoans: z
      .boolean()
      .describe('Explained policy loans (70% of surrender value)'),
    surgicalNursingLoans: z
      .boolean()
      .describe(
        'Explained surgical/nursing loans (interest-free, up to 10% premium/surrender value)',
      ),
  }),
  risksLimitations: z.object({
    earlySurrenderValue: z
      .boolean()
      .describe(
        'Explained early surrender value may be less than premium paid',
      ),
    nonGuaranteedBonuses: z
      .boolean()
      .describe('Explained bonuses are non-guaranteed'),
    srsRestrictions: z
      .boolean()
      .describe(
        'Explained SRS policies have restrictions (no joint ownership, no secondary LA, no loans)',
      ),
  }),
});

// PRUWealth Plus Product Knowledge - Intermediate Level (Skilled Advisor)
const pruwealthProductIntermediateSchema = z.object({
  bonusStructureDetails: z.object({
    reversionaryCalculation: z
      .boolean()
      .describe(
        'Explained reversionary bonus calculation from face value and how it becomes guaranteed',
      ),
    performancePercentage: z
      .boolean()
      .describe(
        'Explained performance bonus as percentage of accumulated reversionary bonuses',
      ),
    maturityBenefitFormula: z
      .boolean()
      .describe('Explained how bonuses affect maturity benefit calculation'),
  }),
  deathBenefitCalculations: z.object({
    regularVsAccidental: z
      .boolean()
      .describe(
        'Explained regular death (101%) vs accidental death (105%) calculations',
      ),
    preExistingExclusions: z
      .boolean()
      .describe('Explained pre-existing condition exclusions (12 months)'),
    suicideClause: z
      .boolean()
      .describe('Explained suicide clause (12 months void period)'),
  }),
  wealthTransferFeatures: z.object({
    secondaryLifeAssuredMechanics: z
      .boolean()
      .describe(
        'Explained secondary life assured mechanics (primary dies, secondary becomes new primary, no death benefit paid)',
      ),
    changeOfLifeAssuredProcess: z
      .boolean()
      .describe(
        'Explained change of life assured process (2-year waiting, cover end date unchanged)',
      ),
  }),
  loanFacilities: z.object({
    policyLoanDetails: z
      .boolean()
      .describe(
        'Explained policy loan details (70% surrender value, variable interest)',
      ),
    surgicalNursingLoanDetails: z
      .boolean()
      .describe(
        'Explained surgical/nursing loan details (interest-free, 10% max, exclusions apply)',
      ),
  }),
  retrenchmentBenefitDetails: z.object({
    eligibilityCriteria: z
      .boolean()
      .describe(
        'Explained retrenchment eligibility (10% premium, first 5 years, 90-day waiting, 30-day unemployment, full-time 6+ months employed)',
      ),
  }),
});

// PRUWealth Plus Product Knowledge - Expert Level (Strategic Consultant)
const pruwealthProductExpertSchema = z.object({
  personalizationComparison: z.object({
    relatedToClientScenario: z
      .boolean()
      .describe(
        'Related USPs (age 130, retrenchment, wealth transfer) to client specific scenario and objectives',
      ),
    comparedCompetitors: z
      .boolean()
      .describe(
        'Compared vs similar single premium participating products (Great Eastern, AIA, NTUC Income) and explained competitive advantages',
      ),
    clientPerspectiveTimeline: z
      .boolean()
      .describe(
        "Spoke the policy timeline in client age/perspective (e.g., 'for a 45-year-old, this provides 85 years of coverage')",
      ),
    faceValueDistinction: z
      .boolean()
      .describe(
        'Explained face value vs sum assured distinction clearly and how it affects bonus calculations vs death benefit',
      ),
  }),
});

// PRUWealth Plus Operational Knowledge - Basics Level (Sales Novice)
const pruwealthOperationalBasicsSchema = z.object({
  planRulesBasics: z.object({
    singlePremiumStructure: z
      .boolean()
      .describe('Explained single premium participating whole life structure'),
    policyLoanBasics: z
      .boolean()
      .describe(
        'Explained basic policy loan mechanics (up to 70% surrender value)',
      ),
    surgicalNursingLoanAvailability: z
      .boolean()
      .describe(
        'Explained surgical/nursing loan availability (interest-free, up to 10%)',
      ),
  }),
});

// PRUWealth Plus Operational Knowledge - Intermediate Level (Skilled Advisor)
const pruwealthOperationalIntermediateSchema = z.object({
  srsAndNominations: z.object({
    srsCompatibilityRestrictions: z
      .boolean()
      .describe(
        'Explained SRS compatibility and restrictions (no joint ownership, no secondary LA, no change LA, no policy loans)',
      ),
    nominationTrustOptions: z
      .boolean()
      .describe(
        'Explained nomination/trust options (49L, 49M, Juvenile, Educational) and mutual exclusivity with secondary life assured',
      ),
  }),
  bonusPolicyManagement: z.object({
    bonusSurrenderProcess: z
      .boolean()
      .describe(
        'Explained bonus surrender process (can surrender reversionary bonus for cash value less than face value; performance bonus cannot be surrendered separately)',
      ),
    reinstatementWindow: z
      .boolean()
      .describe(
        'Explained reinstatement window (24 months, under age 65, health evidence required)',
      ),
  }),
});

// PRUWealth Plus Operational Knowledge - Expert Level (Strategic Consultant)
const pruwealthOperationalExpertSchema = z.object({
  wealthTransferStrategies: z.object({
    secondaryLifeAssuredPlanning: z
      .boolean()
      .describe(
        'Explained wealth transfer strategies using secondary life assured for continuation planning',
      ),
    changeOfLifeAssuredFlexibility: z
      .boolean()
      .describe(
        'Explained change of life assured for estate planning flexibility and wealth transfer to next generation',
      ),
  }),
  policySustainability: z.object({
    longTermValueManagement: z
      .boolean()
      .describe(
        'Discussed policy sustainability for long-term coverage to age 130 (managing surrender value, when to consider bonus surrender, impact of policy loans)',
      ),
  }),
  retrenchmentExclusionsCriticalTimeframes: z.object({
    retrenchmentExclusions: z
      .boolean()
      .describe(
        'Clarified retrenchment benefit exclusions (part-time, self-employed, contract workers, resignation, retirement, poor performance dismissal)',
      ),
    criticalTimeframes: z
      .boolean()
      .describe(
        'Explained critical timeframes (14-day free look, 90-day retrenchment waiting, 12-month pre-existing/suicide exclusions, 2-year incontestability and change of LA eligibility)',
      ),
  }),
});

// PRUWealth Plus Product Knowledge Assessment Schema (tiered)
const pruwealthProductAssessmentSchema = z.object({
  pruwealthBasics: pruwealthProductBasicsSchema,
  pruwealthIntermediate: pruwealthProductIntermediateSchema,
  pruwealthExpert: pruwealthProductExpertSchema,
});

// PRUWealth Plus Operational Knowledge Assessment Schema (tiered)
const pruwealthOperationalAssessmentSchema = z.object({
  pruwealthBasics: pruwealthOperationalBasicsSchema,
  pruwealthIntermediate: pruwealthOperationalIntermediateSchema,
  pruwealthExpert: pruwealthOperationalExpertSchema,
});

// Helper function to get product-specific schema
export function getPrudentialTechnicalKnowledgeSchema(productId: string) {
  switch (productId) {
    case 'prulifetime-income-plus':
      return z.object({
        productKnowledge: z.object({
          overallScore: z.number(),
          completedItems: z.array(z.string()),
          toImproveItems: z.array(z.string()),
          prulifetimeAssessment: prulifetimeProductAssessmentSchema,
        }),
        operationalKnowledge: z.object({
          overallScore: z.number(),
          completedItems: z.array(z.string()),
          toImproveItems: z.array(z.string()),
          prulifetimeAssessment: prulifetimeOperationalAssessmentSchema,
        }),
      });
    case 'prushield':
      return z.object({
        productKnowledge: z.object({
          overallScore: z.number(),
          completedItems: z.array(z.string()),
          toImproveItems: z.array(z.string()),
          prushieldAssessment: prushieldProductAssessmentSchema,
        }),
        operationalKnowledge: z.object({
          overallScore: z.number(),
          completedItems: z.array(z.string()),
          toImproveItems: z.array(z.string()),
          prushieldAssessment: prushieldOperationalAssessmentSchema,
        }),
      });
    case 'pruvantage-assure-ii':
      return z.object({
        productKnowledge: z.object({
          overallScore: z.number(),
          completedItems: z.array(z.string()),
          toImproveItems: z.array(z.string()),
          pruvantageAssessment: pruvantageProductAssessmentSchema,
        }),
        operationalKnowledge: z.object({
          overallScore: z.number(),
          completedItems: z.array(z.string()),
          toImproveItems: z.array(z.string()),
          pruvantageAssessment: pruvantageOperationalAssessmentSchema,
        }),
      });
    case 'pruwealth-plus':
      return z.object({
        productKnowledge: z.object({
          overallScore: z.number(),
          completedItems: z.array(z.string()),
          toImproveItems: z.array(z.string()),
          pruwealthAssessment: pruwealthProductAssessmentSchema,
        }),
        operationalKnowledge: z.object({
          overallScore: z.number(),
          completedItems: z.array(z.string()),
          toImproveItems: z.array(z.string()),
          pruwealthAssessment: pruwealthOperationalAssessmentSchema,
        }),
      });
    default:
      return z.object({});
  }
}
