// src/constants/manulife-goalready-scripts.ts

export interface ObjectionHandlingScript {
  techniques: string[];
  examples: string[];
  frameworks: string[]; // e.g., LAPR, 3F
}

export interface GoalReadySalesScripts {
  premiumObjection: ObjectionHandlingScript;
  retirementTimingObjection: ObjectionHandlingScript;
  consultationObjection: ObjectionHandlingScript;
  closingTechniques: {
    methods: string[];
    examples: string[];
    transitions: string[];
  };
  generalFrameworks: {
    lapr: string; // Listen, Acknowledge, Probe, Reframe
    threef: string; // Feel, Felt, Found
  };
}

export const GOALREADY_SALES_SCRIPTS: GoalReadySalesScripts = {
  premiumObjection: {
    techniques: [
      'Reframe premium as investment in future security',
      'Compare cost of insurance vs cost of being uninsured',
      'Break down premium into daily/weekly amounts to show affordability',
      'Emphasize long-term value and loyalty bonus benefits',
      'Show how premium flexibility features accommodate variable income',
      'Demonstrate total value including protection and savings components',
    ],
    examples: [
      "I understand, Mr./Ms. [Name]. However, in fact, your expenses will be even more expensive if you unexpectedly get ill. We don't know what will happen, but in the moment of an unexpected event, where will your loved ones get daily expenses, especially if they are used to you being the breadwinner providing for their needs. Why don't we start this plan? Or would you rather see a plan with a lower premium?",
      "Indeed, the cost of living is high. And sadly, it's inevitable that it will continue to increase. At the end of the day, what costs more? Paying a premium or avoiding insurance and ending up in desperate need of coverage due to a sudden unexpected event? You cannot solve this problem by not getting insurance.",
      'I know exactly what you mean, things are tough all over since your budget is loaded, and so everything hinges on your paychecks. Let me ask you this: Where do you normally get the budget from when an unexpected expense comes up? It is important that we set aside a budget for unexpected events, and this is where the value of insurance comes in. My job as an insurance advisor includes helping you plan the right budget from the limited resources you have, so that somehow there is an amount from it that can be allocated for your future and the future of your family.',
    ],
    frameworks: ['LAPR', '3F'],
  },
  retirementTimingObjection: {
    techniques: [
      'Emphasize benefits of starting early (lower premiums, more time for growth)',
      'Create urgency through statistics about retirement preparedness',
      'Explain compound growth advantage of early start',
      'Address "still young" objection by highlighting future self\'s needs',
      'Show projection comparisons: starting now vs starting later',
    ],
    examples: [
      'I can clearly see that and you are fortunate to be young and still healthy. Just like they say, the young and healthy YOU has the pressing responsibility TODAY to take good care of the OLD and probably UNHEALTHY YOU in the FUTURE. I think you will agree with me when I say that an illness is uncertain when it is going to happen to us but it is certain that being covered and protected from it is better to be done now.',
      'If you wait for the "next year" to get insurance, then, your premium will be higher than if you decide to get it now - as the cost of insurance is based on the age of the customer which is one of the primary factors that an insurance company looks at upon analyzing risks. Then, while you wait for the "next year", you are not covered by insurance protection for this year. Just like if the insurance on your house should expire today, would you take the risk that your house would not burn before next year?',
      'Do you realize that after many years there will be an old man/woman dependent on you? That old man/woman is yourself. GoalReady helps you prepare for that future today.',
    ],
    frameworks: ['LAPR'],
  },
  consultationObjection: {
    techniques: [
      'Acknowledge the need to consult while maintaining momentum',
      'Offer to provide materials for family discussion',
      'Schedule specific follow-up appointment',
      'Address underlying concerns before ending conversation',
      'Position yourself as resource for family questions',
      'Use "gift analogy" for spouse consultation',
    ],
    examples: [
      "I'm glad to hear you say that. Let's think it over together. Perhaps I didn't make myself clear. This program will provide your children not only with the money they will need for food, clothing and shelter, but also the love of a mother which they will really need in their growing up years.",
      "If you were to buy her a present, you wouldn't ask her advice as to whether you should get it or not. Why make her say YES? This is a gift of protection and security for your family.",
      "Thank you for your time. Before I leave, could I ask one question? Mr/Mrs/Ms Prospect, I've tried to identify your problem and present you with the best solution, but I feel that I must have failed you somehow. Would you mind telling me why you decided not to go ahead with my proposal?",
    ],
    frameworks: ['LAPR', '3F'],
  },
  closingTechniques: {
    methods: [
      'Proceeds Close: Ask about beneficiary designation to imply consent',
      'Your Obligation, Our Obligation: Frame decision as choice of who bears the financial responsibility',
      "You Can't Lose - Live, Die, or Quit: Show value in all scenarios",
      'Assumptive Close: Proceed as if decision is made',
      'Alternative Close: Offer two positive choices',
    ],
    examples: [
      'PROCEEDS CLOSE: To whom would you like the proceeds payable? Do we assign your spouse as primary beneficiary? Who would you like to assign as trustee?',
      "YOUR OBLIGATION, OUR OBLIGATION: Your obligation under this plan is to save Php ____. Manulife's obligation is to provide you with a guaranteed critical illness benefit in the event you are diagnosed with an advanced stage of illness, and you need a large amount of money for treatment and anticipated hospital bills. In case something unfortunate happens to you, your family will be given a guaranteed amount of Php ______. But if you won't save Php _____, then our obligation becomes your obligation, and you will have to provide the Php _____for your treatment. Should something unfortunate happen, your family will have to produce Php _____ for final expenses from some other source. Don't you think it's easier for my Company to assume this obligation?",
      "YOU CAN'T LOSE: (Prospect's name), you can't lose, live, die or quit. If you live, my Company will guarantee you Php ___ when you reach age 65, plus accumulated dividends. Your earned dividends can also be withdrawn anytime should the need arises or left to accumulate more until maturity. If you are diagnosed with any of the advanced stages of critical illnesses covered by your chosen plan, you will receive a guaranteed lump sum benefit. If you quit paying before all premiums are paid, we will endorse your plan for a reduced amount and mark it paid in full or you may choose to get Php ___ and surrender the plan. If something unfortunate would happen to you at any given time, my Company will pay your wife/children Php ___ to go on living the kind of lifestyle they are accustomed to.",
    ],
    transitions: [
      'With all these benefits that you can enjoy for [need], you only need to set aside [premium] each year/semi-annually/quarterly/monthly.',
      'What can you say about the plan?',
      'How does that sound to you?',
      'Does this address your concern about [specific need]?',
      "Are you ready to get started with protecting your family's future?",
      "Let's get you GoalReady! Shall we proceed with the application?",
    ],
  },
  generalFrameworks: {
    lapr: "Listen - Acknowledge - Probe - Reframe: First, truly listen to the customer's objection without interrupting. Then, acknowledge their concern to show understanding. Next, probe with questions to understand the real issue behind the objection. Finally, reframe the objection by presenting it in a new light that addresses their underlying concern.",
    threef:
      'Feel - Felt - Found: "I know how you feel. Many of my customers have felt the same way when trying to decide whether to use this plan. However, they have found that once they have started the plan and gained the security it offers for their family, they have been very happy they acted as they did." This technique builds empathy, normalizes the concern, and provides social proof.',
  },
};
