/**
 * BBL Scenario-based objections for randomization
 * Each scenario type has its own pool of objections
 * - 1 primary objection is randomly selected per roleplay
 * - 3-4 mini objections are randomly selected from the remaining pool
 */

export type BBLScenarioType =
  | 'bbl-portfolio-review'
  | 'bbl-client-revival'
  | 'bbl-client-upgrade';

export interface BBLObjection {
  en: string;
  th: string;
}

export interface BBLScenarioObjections {
  objections: BBLObjection[];
}

export const BBL_SCENARIO_OBJECTIONS: Record<
  BBLScenarioType,
  BBLScenarioObjections
> = {
  'bbl-portfolio-review': {
    objections: [
      {
        en: "I don't see why we need to go through all this detail in the review.",
        th: 'ฉันไม่เห็นว่าทำไมเราต้องลงรายละเอียดขนาดนี้ในการรีวิว',
      },
      {
        en: 'This is a sensitive topic, so I do not want to answer.',
        th: 'นี่เป็นเรื่องละเอียดอ่อน ฉันไม่อยากตอบ',
      },
      {
        en: 'I do not believe in the benefit of portfolio rebalancing.',
        th: 'ฉันไม่เชื่อในประโยชน์ของการปรับสมดุลพอร์ต',
      },
      {
        en: 'Every time the market drops, why do you recommend rebalancing?',
        th: 'ทุกครั้งที่ตลาดตก ทำไมคุณถึงแนะนำให้ปรับสมดุล?',
      },
      {
        en: "My portfolio is for the long term, so I don't need to worry about this much.",
        th: 'พอร์ตของฉันเป็นการลงทุนระยะยาว ไม่ต้องกังวลมากขนาดนี้',
      },
      {
        en: 'I do not see any impact on my portfolio.',
        th: 'ฉันไม่เห็นผลกระทบต่อพอร์ตของฉัน',
      },
      {
        en: 'I am still unhappy that the previous investment advice resulted in a loss.',
        th: 'ฉันยังไม่พอใจที่คำแนะนำการลงทุนครั้งก่อนทำให้ขาดทุน',
      },
      {
        en: "I am concerned about the losses I'm seeing in my funds.",
        th: 'ฉันกังวลเกี่ยวกับการขาดทุนที่เห็นในกองทุนของฉัน',
      },
      {
        en: 'I am reluctant to sell long-held funds.',
        th: 'ฉันไม่อยากขายกองทุนที่ถือมานาน',
      },
      {
        en: "I don't want to sell stocks at a loss.",
        th: 'ฉันไม่อยากขายหุ้นขาดทุน',
      },
      {
        en: 'I am not comfortable with the risk involved with investing more.',
        th: 'ฉันไม่สบายใจกับความเสี่ยงที่เกี่ยวข้องกับการลงทุนเพิ่ม',
      },
      {
        en: "I read some bad news about certain funds and I don't like that market. I have a bias—for example, I feel the U.S. market is overpriced based on the news.",
        th: 'ฉันอ่านข่าวร้ายเกี่ยวกับกองทุนบางตัวและไม่ชอบตลาดนั้น ฉันมีอคติ—เช่น รู้สึกว่าตลาดสหรัฐราคาแพงเกินไปจากข่าว',
      },
      {
        en: 'I disagree with the CIO View.',
        th: 'ฉันไม่เห็นด้วยกับมุมมองของ CIO',
      },
      {
        en: "I don't want to top-up now, I have enough.",
        th: 'ฉันไม่อยากเติมเงินตอนนี้ มีพออยู่แล้ว',
      },
      {
        en: 'I want to compare the pros and cons of each investment option.',
        th: 'ฉันอยากเปรียบเทียบข้อดีข้อเสียของแต่ละตัวเลือกการลงทุน',
      },
      {
        en: 'I would like to delay this as I am still waiting for market clarity.',
        th: 'ฉันอยากเลื่อนออกไปเพราะยังรอความชัดเจนของตลาด',
      },
      {
        en: 'I want to know more about the fund manager / portfolio team and their experience.',
        th: 'ฉันอยากรู้เพิ่มเติมเกี่ยวกับผู้จัดการกองทุน / ทีมพอร์ตและประสบการณ์ของพวกเขา',
      },
      {
        en: 'I am worried about the high fees as compared to the returns.',
        th: 'ฉันกังวลเรื่องค่าธรรมเนียมที่สูงเมื่อเทียบกับผลตอบแทน',
      },
    ],
  },

  'bbl-client-revival': {
    objections: [
      {
        en: "I don't want to talk about it.",
        th: 'ฉันไม่อยากพูดเรื่องนี้',
      },
      {
        en: 'I may be irritable or use strong language.',
        th: 'ฉันอาจหงุดหงิดหรือใช้ภาษาที่รุนแรง',
      },
      {
        en: 'I have not had a good experience as the advisors could not provide comprehensive care.',
        th: 'ฉันไม่มีประสบการณ์ที่ดีเพราะที่ปรึกษาไม่สามารถให้การดูแลอย่างครอบคลุม',
      },
      {
        en: "I am still unsure about the solution. I don't think it's suitable for me.",
        th: 'ฉันยังไม่แน่ใจเกี่ยวกับโซลูชัน ฉันไม่คิดว่ามันเหมาะกับฉัน',
      },
      {
        en: 'I am not ready to transfer money back for investment right now.',
        th: 'ฉันยังไม่พร้อมที่จะโอนเงินกลับมาลงทุนตอนนี้',
      },
      {
        en: "I will think about it but I don't want to schedule a meeting.",
        th: 'ฉันจะคิดดู แต่ไม่อยากนัดประชุม',
      },
      {
        en: "I don't think the communication was transparent as product recommendations seem driven by commission rather than needs or goals.",
        th: 'ฉันไม่คิดว่าการสื่อสารโปร่งใสเพราะคำแนะนำผลิตภัณฑ์ดูเหมือนขับเคลื่อนด้วยค่าคอมมิชชั่นมากกว่าความต้องการหรือเป้าหมาย',
      },
      {
        en: 'My past consultation did not meet expectations as the advisor did not provide clear information about the fees and procedures.',
        th: 'การปรึกษาในอดีตไม่เป็นไปตามที่คาดหวังเพราะที่ปรึกษาไม่ได้ให้ข้อมูลที่ชัดเจนเกี่ยวกับค่าธรรมเนียมและขั้นตอน',
      },
      {
        en: 'The advisor is difficult to contact and does not reply within a reasonable time.',
        th: 'ที่ปรึกษาติดต่อยากและไม่ตอบภายในเวลาที่เหมาะสม',
      },
      {
        en: 'The advisor does not follow-up when there is an urgent issue like a severe market drop.',
        th: 'ที่ปรึกษาไม่ติดตามเมื่อมีปัญหาเร่งด่วนเช่นตลาดตกรุนแรง',
      },
      {
        en: "I don't want to as my advisors in the past got changed frequently without proper handover of information or history forcing me to always start from scratch.",
        th: 'ฉันไม่ต้องการเพราะที่ปรึกษาในอดีตเปลี่ยนบ่อยโดยไม่มีการส่งต่อข้อมูลหรือประวัติที่เหมาะสม ทำให้ต้องเริ่มต้นใหม่ทุกครั้ง',
      },
    ],
  },

  'bbl-client-upgrade': {
    objections: [
      {
        en: 'I see little difference from my existing service.',
        th: 'ฉันเห็นความแตกต่างเพียงเล็กน้อยจากบริการที่มีอยู่',
      },
      {
        en: "I question the importance, since I rarely use the bank's services.",
        th: 'ฉันสงสัยความสำคัญ เพราะแทบไม่ได้ใช้บริการของธนาคาร',
      },
      {
        en: 'I worry about hidden fees.',
        th: 'ฉันกังวลเรื่องค่าธรรมเนียมแฝง',
      },
      {
        en: 'I perceive the privileges as inferior to those offered by other banks.',
        th: 'ฉันมองว่าสิทธิพิเศษด้อยกว่าที่ธนาคารอื่นเสนอ',
      },
      {
        en: 'I doubt the significance/value.',
        th: 'ฉันสงสัยในความสำคัญ/คุณค่า',
      },
      {
        en: 'I find the specific services recommended still unsuitable for my needs.',
        th: 'ฉันพบว่าบริการเฉพาะที่แนะนำยังไม่เหมาะกับความต้องการของฉัน',
      },
      {
        en: 'I resent having to provide information again when I have already done so.',
        th: 'ฉันไม่พอใจที่ต้องให้ข้อมูลอีกครั้งทั้งที่ให้ไปแล้ว',
      },
      {
        en: 'I ask if I will truly benefit from providing more information.',
        th: 'ฉันถามว่าจะได้ประโยชน์จริงๆ ไหมจากการให้ข้อมูลเพิ่มเติม',
      },
      {
        en: 'I question the actual usage of these privileges.',
        th: 'ฉันสงสัยการใช้งานจริงของสิทธิพิเศษเหล่านี้',
      },
      {
        en: 'I worry about a commitment being too long-term.',
        th: 'ฉันกังวลว่าข้อผูกมัดจะยาวนานเกินไป',
      },
      {
        en: 'I express uncertainty about needing this service right now.',
        th: 'ฉันแสดงความไม่แน่ใจว่าต้องการบริการนี้ตอนนี้หรือไม่',
      },
      {
        en: 'I hesitate to give consent, or doubt the importance of the consent.',
        th: 'ฉันลังเลที่จะให้ความยินยอม หรือสงสัยความสำคัญของการยินยอม',
      },
      {
        en: 'I hesitate to schedule a follow-up meeting or phone call.',
        th: 'ฉันลังเลที่จะนัดประชุมหรือโทรศัพท์ติดตามผล',
      },
    ],
  },
};

/**
 * Get objections for a specific BBL scenario
 */
export function getBBLObjectionsForScenario(
  scenarioType: string,
): BBLScenarioObjections | null {
  if (scenarioType in BBL_SCENARIO_OBJECTIONS) {
    return BBL_SCENARIO_OBJECTIONS[scenarioType as BBLScenarioType];
  }
  return null;
}

/**
 * Randomly select 1 primary objection and mini objections
 * For bbl-portfolio-review: 1 primary + 2 mini = 3 total
 * For other scenarios: 1 primary + 3-4 mini = 4-5 total
 * Returns a flat array where:
 * - index 0 = primary objection
 * - indices 1+ = mini objections
 * Returns null if the scenario type is not supported
 */
export function selectRandomBBLObjections(
  scenarioType: string,
  language: 'en' | 'th' = 'en',
  options?: { excludeTopupObjection?: boolean },
): string[] | null {
  const scenarioObjections = getBBLObjectionsForScenario(scenarioType);
  if (!scenarioObjections || scenarioObjections.objections.length < 2) {
    return null;
  }

  let objections = scenarioObjections.objections;

  // Filter out topup-related objection when client wants topup
  if (options?.excludeTopupObjection) {
    objections = objections.filter(
      (obj) => !obj.en.includes("don't want to top-up"),
    );
  }

  // Shuffle the objections array
  const shuffled = [...objections].sort(() => Math.random() - 0.5);

  // Portfolio review: 1 primary + 2 mini (3 total)
  // Other scenarios: 1 primary + 3-4 mini (4-5 total)
  const numMiniObjections =
    scenarioType === 'bbl-portfolio-review'
      ? Math.min(2, shuffled.length - 1)
      : Math.min(3 + Math.floor(Math.random() * 2), shuffled.length - 1);

  const totalToSelect = 1 + numMiniObjections;

  return shuffled.slice(0, totalToSelect).map((obj) => obj[language] || obj.en);
}
