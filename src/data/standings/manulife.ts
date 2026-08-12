import { Types } from 'mongoose';
import { StandingConfiguration } from '../../types/standings.js';
import { MANULIFE_COMPANY_ID } from '../../utils/constants.js';

const manulifeFNAStanding: StandingConfiguration = {
  base: {
    friendlyId: 'manulife-fna',
    company: new Types.ObjectId(MANULIFE_COMPANY_ID), // You'll need to define this
    module: 'fna',
    assessmentType: 'manulife',
    type: 'manulife-score-based',
    tiers: [
      {
        level: 1,
        scoreRange: 'Score: <24',
        criteria: [], // Empty for score-based standings
      },
      {
        level: 2,
        scoreRange: 'Score: 24-26',
        criteria: [],
      },
      {
        level: 3,
        scoreRange: 'Score: 27-30',
        criteria: [],
      },
    ],
    // Shared criteria for all tiers - these don't affect evaluation, just display
    sharedCriteria: [],
  },
  localized: {
    en: {
      name: 'Manulife FNA Standing',
      type: 'manulife-score-based',
      tiers: [
        {
          name: 'Failed',
          scoreRange: 'Score: <24',
          criteria: [], // Empty for score-based standings
        },
        {
          name: 'Pass',
          scoreRange: 'Score: 24-26',
          criteria: [],
        },
        {
          name: 'Champion',
          scoreRange: 'Score: 27-30',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Introduction to Manulife & Facts of Life',
          details: [
            'Did the Advisor greet the prospect and thanked him/her for his/her time?',
            "Did the Advisor use the prospect's name when addressing the prospect?",
            'Did the Advisor introduce him/herself as a Manulife Philippines Financial Advisor?',
            'Did the Advisor mention his/her role as a Manulife Philippines Financial Advisor?',
            'Did the Advisor provide a brief introduction of Manulife as a company and its Corporate Social Responsibility in the Philippines?',
            'Did the advisor walked the client through the different life stages?',
            'Did the advisor clearly discuss the Circle of Life and the concept of 28,000 days?',
            'When discussing the Hierarchy of Financial needs, did the advisor emphasize the importance of building a strong financial foundation through protection, life, and health coverage?',
            "When talking about life's DISRUPTIONS, did the advisor begin by asking an open-ended question related to death and/or sickness?",
            "When talking about life's DISRUPTIONS, did the advisor use the statistics to create a sense of urgency?",
            "When talking about DREAMS in life, did the advisor ask what the customers' dreams are for themselves and their loved ones?",
            'When talking about DREAMS in life, did the advisor use the statistics to build awareness and encourage action?',
          ],
        },
        {
          title: 'Financial Needs, Goal Guide and Conclusion',
          details: [
            'Did the advisor ask the client how much household income would he/she want to replace when death occurs?',
            'Did the advisor ask the client how long would he/she want the income replacement to continue for?',
            'Did the advisor accurately determine the Income Protection need based on the projection table?',
            "Did the advisor ask the client's preferred hospital from the list in case of a medical emergency or serious illness?",
            'Did the advisor provide the customer of the recommended Health Emergency Fund, based on their hospital of choice?',
            'When computing for the recommended Health Emergency Fund, did the advisor factor in 3-6 months worth of household income, and considered any other health or medical coverage the client may have? (eg. HMO)',
            "Did the advisor ask for the client's child's age and at which school they would like to send him/her to?",
            'Based on the information provided by the client, did the advisor accurately determine the Education Fund needed based on the projection table?',
            "Did the advisor ask for the client's desired retirement age and pension?",
            'Based on the information provided by the client, did the advisor accurately determine the Retirement Fund needed based on the projection table?',
            "Did the Advisor ask the coverage needed for each of the client's needs?",
            "Did the Advisor ask the client's financial needs priorities?",
            'Did the Advisor ask the answers to the Client Profile Section?',
            'Did the Advisor guide the customer in answering the Client Suitability Assessment and explained the results?',
            'Did the Advisor mention giving the customer a copy of the accomplished form to their email?',
            'Did the Advisor schedule a second meeting with the client?',
            'Did the Advisor ask the prospect for referrals?',
            'Did the Advisor invite the client to scan the QR code to provide feedback on the presentation?',
          ],
        },
      ],
    },
    ceb: {
      name: 'Manulife FNA Standing',
      type: 'manulife-score-based',
      tiers: [
        {
          name: 'Napakyas',
          scoreRange: 'Puntos: <24',
          criteria: [],
        },
        {
          name: 'Mipasar',
          scoreRange: 'Puntos: 24-26',
          criteria: [],
        },
        {
          name: 'Kampeon',
          scoreRange: 'Puntos: 27-30',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Introduksyon sa Manulife ug mga Kamatuoran sa Kinabuhi',
          details: [
            'Nagtimbaya ba ang Advisor sa prospect ug nagpasalamat sa iyang panahon?',
            'Gigamit ba sa Advisor ang ngalan sa prospect sa pagtawag sa prospect?',
            'Nagpaila ba ang Advisor sa iyang kaugalingon isip Manulife Philippines Financial Advisor?',
            'Gihisgutan ba sa Advisor ang iyang papel isip Manulife Philippines Financial Advisor?',
            'Naghatag ba ang Advisor ug mubo nga introduksyon sa Manulife isip kompanya ug sa iyang Corporate Social Responsibility sa Pilipinas?',
            'Gilakaw ba sa advisor ang kliyente sa lain-laing mga yugto sa kinabuhi?',
            'Tin-aw ba nga gihisgutan sa advisor ang Circle of Life ug ang konsepto sa 28,000 ka adlaw?',
            'Sa paghisgot sa Hierarchy of Financial needs, gipasiugda ba sa advisor ang kamahinungdanon sa pagtukod ug lig-on nga pundasyon sa pinansya pinaagi sa proteksyon, kinabuhi, ug panglawas nga coverage?',
            'Sa paghisgot bahin sa mga DISRUPTIONS sa kinabuhi, nagsugod ba ang advisor pinaagi sa pagpangutana ug bukas nga pangutana nga may kalabotan sa kamatayon ug/o sakit?',
            'Sa paghisgot bahin sa mga DISRUPTIONS sa kinabuhi, gigamit ba sa advisor ang mga estadistika aron makamugna ug pagkadinalian?',
            'Sa paghisgot bahin sa mga DAMGO sa kinabuhi, nangutana ba ang advisor kon unsa ang mga damgo sa mga kostumer alang sa ilang kaugalingon ug sa ilang mga minahal?',
            'Sa paghisgot bahin sa mga DAMGO sa kinabuhi, gigamit ba sa advisor ang mga estadistika aron makapalambo ug kahibalo ug makadasig sa aksyon?',
          ],
        },
        {
          title: 'Panginahanglan sa Pinansya, Giya sa Tumong ug Konklusyon',
          details: [
            'Nangutana ba ang advisor sa kliyente kon pila ang household income nga gusto niyang pulihan kon mamatay?',
            'Nangutana ba ang advisor sa kliyente kon unsa kadugay ang gusto niyang magpadayon ang pag-uli sa kita?',
            'Natino ba nga gitino sa advisor ang Income Protection need base sa projection table?',
            'Nangutana ba ang advisor sa gusto nga ospital sa kliyente gikan sa lista kon adunay emerhensya sa medikal o grabe nga sakit?',
            'Naghatag ba ang advisor sa kostumer sa girekomenda nga Health Emergency Fund, base sa ilang gipili nga ospital?',
            'Sa pagkalkula alang sa girekomenda nga Health Emergency Fund, gikonsiderar ba sa advisor ang 3-6 ka bulan nga household income, ug gikonsiderar ang bisan unsang uban pang panglawas o medikal nga coverage nga adunay kliyente? (pananglitan HMO)',
            'Nangutana ba ang advisor sa edad sa anak sa kliyente ug asa nga eskwelahan nila gusto nga ipadala siya?',
            'Base sa impormasyon nga gihatag sa kliyente, natino ba nga gitino sa advisor ang Education Fund nga gikinahanglan base sa projection table?',
            'Nangutana ba ang advisor sa gusto nga edad sa pagretiro sa kliyente ug pensyon?',
            'Base sa impormasyon nga gihatag sa kliyente, natino ba nga gitino sa advisor ang Retirement Fund nga gikinahanglan base sa projection table?',
            'Nangutana ba ang Advisor sa coverage nga gikinahanglan alang sa matag usa sa mga panginahanglan sa kliyente?',
            'Nangutana ba ang Advisor sa mga prayoridad sa pinansyal nga panginahanglan sa kliyente?',
            'Nangutana ba ang Advisor sa mga tubag sa Client Profile Section?',
            'Naggiya ba ang Advisor sa kostumer sa pagtubag sa Client Suitability Assessment ug gipasabut ang mga resulta?',
            'Gihisgutan ba sa Advisor ang paghatag sa kostumer ug kopya sa nahuman nga porma sa ilang email?',
            'Nag-iskedyul ba ang Advisor ug ikaduhang miting uban sa kliyente?',
            'Nangayo ba ang Advisor sa prospect alang sa mga referral?',
            'Nag-imbitar ba ang Advisor sa kliyente nga i-scan ang QR code aron makahatag ug feedback sa presentasyon?',
          ],
        },
      ],
    },
  },
};

const manulifeGoalReadyStanding: StandingConfiguration = {
  base: {
    friendlyId: 'manulife-goalready',
    company: new Types.ObjectId(MANULIFE_COMPANY_ID),
    module: 'manulife-goalready',
    assessmentType: 'manulife-goalready',
    type: 'manulife-score-based',
    tiers: [
      {
        level: 1,
        scoreRange: 'Score: <50',
        criteria: [],
      },
      {
        level: 2,
        scoreRange: 'Score: 50-79',
        criteria: [],
      },
      {
        level: 3,
        scoreRange: 'Score: 80-100',
        criteria: [],
      },
    ],
    sharedCriteria: [],
  },
  localized: {
    en: {
      name: 'Manulife GoalReady Standing',
      type: 'manulife-score-based',
      tiers: [
        {
          name: 'Failed',
          scoreRange: 'Score: <50',
          criteria: [],
        },
        {
          name: 'Pass',
          scoreRange: 'Score: 50-79',
          criteria: [],
        },
        {
          name: 'Champion',
          scoreRange: 'Score: 80-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Soft Skills',
          details: [
            'Clear delivery and respectful communication',
            'Building and maintaining rapport with the customer',
            'Flexibility in understanding the concerns of the customer',
            'Focus on customer satisfaction and service',
          ],
        },
        {
          title: 'Product Knowledge',
          details: [
            'Accurate explanation of GoalReady features and benefits',
            "Clear value proposition for customer's specific situation",
            'Explanation of premium structure and flexibility options',
          ],
        },
        {
          title: 'Sales & Negotiation Skills',
          details: [
            'Effective handling of premium objections',
            'Addressing retirement timing concerns',
            'Handling consultation/thinking objections',
            'Closing technique and next steps guidance',
          ],
        },
      ],
    },
    tl: {
      name: 'Manulife GoalReady Standing',
      type: 'manulife-score-based',
      tiers: [
        {
          name: 'Nabigo',
          scoreRange: 'Puntos: <50',
          criteria: [],
        },
        {
          name: 'Pumasa',
          scoreRange: 'Puntos: 50-79',
          criteria: [],
        },
        {
          name: 'Kampeon',
          scoreRange: 'Puntos: 80-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Mga Kasanayan sa Pakikipag-ugnayan',
          details: [
            'Malinaw na paghahatid at galang na komunikasyon',
            'Pagbuo at pagpapanatili ng rapport sa customer',
            'Flexibility sa pag-unawa sa mga alalahanin ng customer',
            'Pagtuon sa kasiyahan at serbisyo ng customer',
          ],
        },
        {
          title: 'Kaalaman sa Produkto',
          details: [
            'Tumpak na paliwanag ng mga feature at benepisyo ng GoalReady',
            'Malinaw na value proposition para sa partikular na sitwasyon ng customer',
            'Paliwanag ng premium structure at flexibility options',
          ],
        },
        {
          title: 'Mga Kasanayan sa Pagbebenta at Negosasyon',
          details: [
            'Epektibong paghawak ng premium objections',
            'Pagtugon sa mga alalahanin tungkol sa timing ng retirement',
            'Paghawak ng consultation/thinking objections',
            'Closing technique at gabay sa susunod na hakbang',
          ],
        },
      ],
    },
  },
};

export const manulifeStandings = [
  manulifeFNAStanding,
  manulifeGoalReadyStanding,
];
