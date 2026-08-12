import { Types } from 'mongoose';
import { StandingConfiguration } from '../../types/standings.js';
import { MSIG_COMPANY_ID } from '../../utils/constants.js';

const msigTelesalesStanding: StandingConfiguration = {
  base: {
    friendlyId: 'msig-general-v1',
    company: new Types.ObjectId(MSIG_COMPANY_ID),
    module: 'telesales',
    assessmentType: 'msig',
    type: 'score-based',
    tiers: [
      {
        level: 1,
        scoreRange: 'Score: <85',
        criteria: [], // Empty for score-based standings
      },
      {
        level: 2,
        scoreRange: 'Score: 85-89',
        criteria: [],
      },
      {
        level: 3,
        scoreRange: 'Score: 90-94',
        criteria: [],
      },
      {
        level: 4,
        scoreRange: 'Score: 95-100',
        criteria: [],
      },
    ],
    // Shared criteria for all tiers - these don't affect evaluation, just display
    sharedCriteria: [],
  },
  localized: {
    en: {
      name: 'MSIG Sales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Score: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Score: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Score: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Score: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Introduction',
          details: [
            'Asked politely for the customer',
            'Use standard greeting with good phone manners and enthusiasm',
            'State purpose of call',
          ],
        },
        {
          title: 'Presentation',
          details: [
            'Adhere to script given',
            'Provide correct, complete and appropriate information on product',
            'Provide correct procedures and process',
            'No expression of personal opinion & advice',
            'Give precise, simple and easy to understand explanations and relevant examples; avoid using jargon',
            'Present and highlight the product benefits/features to create need for customer to take up the protection',
            'No misrepresentation/mislead/hard-sell/selling on 14 days Free look / Flexibility to cancel',
            'Maintain control of the call',
            'Recognize buying signal & opportunity to up sell',
            'Trial close the call at the right time',
            'Do not sell on Policy Document/Late deduction',
            'Ask questions to identify the underlying reasons for the objection',
            'Respond to all objections effectively and to the point',
            'Use the "3 attempts rule"',
          ],
        },
        {
          title: 'Communication',
          details: [
            'Pay attention to what customer is saying and with no abrupt interruption',
            'Probing skills',
            "Clarify customer's interest/concerns",
            "Understand & acknowledge the customer's needs",
            'Address the customer by his/her name to personalize the call',
            "Use courteous phrases such as 'thank you, please', 'May I...'",
            'Engaging the customer appropriately',
            'Speak in a professional manner and with correct grammar & pronunciation',
            'Use proper tone and clear diction',
          ],
        },
        {
          title: 'Sales Confirmation',
          details: [
            'Getting clear consent to purchase / Eligibility',
            'Verification of personal particulars',
            'Premium confirmation & payment details',
            'Consent to retrieve account details (if applicable)',
            'Marketing Consent - PDPA compliance',
          ],
        },
        {
          title: 'Mandatory Disclosure',
          details: [
            'Applicable to PA (ask the 2 underwriting questions - only proceed if pass the 2 UWQ)',
            '14-day free look period disclosure',
            'Policy effective date',
            'E-policy document to be sent out upon policy activation',
            'Auto renewal condition',
            'Notify insurer changes of occupation / Intend to live outside Singapore for more than 6 months',
            'Pre-existing conditions, for PA-physical impairment and any illness will not be covered',
            'Applicable to PA (PA covers on occurrence of Accident only) except for the Special Daily Hospitalization Benefit',
            'Applicable to PA (Switching information)',
            'Disclosure for Consent to disclose information to insurer',
            'SDIC Information',
          ],
        },
        {
          title: 'Closure',
          details: [
            'Use standard closing in a professional manner',
            'Reschedule a specific time to call back if customer expressed interest',
          ],
        },
      ],
    },
    ceb: {
      name: 'MSIG Sales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Puntos: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Puntos: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Puntos: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Puntos: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Introduksyon',
          details: [
            'Nangutana nga maayo alang sa kostumer',
            'Gamita ang standard nga pagtimbaya nga may maayong phone manners ug kadasig',
            'Ipahayag ang katuyoan sa tawag',
          ],
        },
        {
          title: 'Presentasyon',
          details: [
            'Sunda ang gihatag nga script',
            'Paghatag ug tukma, kompleto ug angay nga impormasyon sa produkto',
            'Paghatag ug tukma nga mga pamaagi ug proseso',
            'Walay pagpahayag sa personal nga opinyon ug tambag',
            'Paghatag ug tukma, yano ug dali masabtan nga mga pagpatin-aw ug may kalabutan nga mga panig-ingnan; likayi ang paggamit sa jargon',
            'Ipresentar ug pasiugdahon ang mga benepisyo/features sa produkto aron makamugna ug panginahanglan sa kostumer nga kuhaon ang proteksyon',
            'Walay sayop nga representasyon/pagpahisalaag/hard-sell/pagbaligya sa 14 days Free look / Flexibility sa pag-kanselar',
            'Magpadayon sa kontrol sa tawag',
            'Ilha ang buying signal ug kahigayonan sa pag-up sell',
            'Trial close sa tawag sa husto nga panahon',
            'Ayaw pagbaligya sa Policy Document/Late deduction',
            'Mangutana aron mailhan ang hinungdan sa pagsupak',
            'Tubaga ang tanang pagsupak nga epektibo ug sa punto',
            'Gamita ang "3 attempts rule"',
          ],
        },
        {
          title: 'Komunikasyon',
          details: [
            'Hatagi ug pagtagad kon unsay giingon sa kostumer ug walay kalit nga pagputol',
            'Mga kahanas sa pagsusi',
            'Tin-aw nga ipahayag ang interes/kabalaka sa kostumer',
            'Sabta ug dawata ang mga panginahanglan sa kostumer',
            'Tawagun ang kostumer sa iyang ngalan aron personal ang tawag',
            "Gamita ang matinahuron nga mga hugpong sa pulong sama sa 'salamat, palihog', 'Mahimo ba ako...'",
            'Makig-uban sa kostumer sa angay',
            'Magsulti sa propesyonal nga pamaagi ug may husto nga gramatika ug pagbigkas',
            'Gamita ang husto nga tono ug tin-aw nga pagbigkas',
          ],
        },
        {
          title: 'Pagkompirma sa Pagbaligya',
          details: [
            'Pagkuha ug tin-aw nga pagtugot sa pagpalit / Eligibility',
            'Pagberipika sa personal nga mga detalye',
            'Pagkompirma sa premium ug mga detalye sa pagbayad',
            'Pagtugot sa pagkuha sa mga detalye sa account (kon magamit)',
            'Marketing Consent - PDPA compliance',
          ],
        },
        {
          title: 'Mandatory Disclosure',
          details: [
            'Magamit sa PA (pangutana ang 2 underwriting questions - magpadayon lang kon makapasar sa 2 UWQ)',
            '14-day free look period disclosure',
            'Policy effective date',
            'E-policy document nga ipadala kon aktibo na ang polisiya',
            'Auto renewal condition',
            'Ipahibalo sa insurer ang mga kausaban sa trabaho / Plano nga mopuyo sa gawas sa Singapore sulod sa mas taas sa 6 ka bulan',
            'Pre-existing conditions, para sa PA-physical impairment ug bisan unsang sakit dili covered',
            'Magamit sa PA (PA covers sa occurrence sa Accident lang) gawas sa Special Daily Hospitalization Benefit',
            'Magamit sa PA (Switching information)',
            'Disclosure para sa Consent sa pagpadayag sa impormasyon sa insurer',
            'SDIC Information',
          ],
        },
        {
          title: 'Pagtapos',
          details: [
            'Gamita ang standard closing sa propesyonal nga pamaagi',
            'I-reschedule ang piho nga oras aron motawag balik kon ang kostumer mipakita ug interes',
          ],
        },
      ],
    },
  },
};

const msigTelesalesDentiplusStanding: StandingConfiguration = {
  base: {
    friendlyId: 'msig-dentiplus-telesales-v1',
    company: new Types.ObjectId(MSIG_COMPANY_ID),
    module: 'telesales',
    product: 'dentiplus',
    assessmentType: 'msig',
    type: 'score-based',
    tiers: [
      {
        level: 1,
        scoreRange: 'Score: <85',
        criteria: [], // Empty for score-based standings
      },
      {
        level: 2,
        scoreRange: 'Score: 85-89',
        criteria: [],
      },
      {
        level: 3,
        scoreRange: 'Score: 90-94',
        criteria: [],
      },
      {
        level: 4,
        scoreRange: 'Score: 95-100',
        criteria: [],
      },
    ],
    // Shared criteria for all tiers - these don't affect evaluation, just display
    sharedCriteria: [],
  },
  localized: {
    en: {
      name: 'MSIG DentiPlus Telesales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Score: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Score: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Score: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Score: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Introduction',
          details: [
            'Asked politely for the customer',
            'Use standard greeting with good phone manners and enthusiasm.',
            'State purpose of call.',
          ],
        },
        {
          title: 'Presentation',
          details: [
            'Adhere to script given',
            'Provide correct, complete and appropriate information on product',
            'Provide correct procedures and process',
            'No expression of personal opinion & advice.',
            'Give precise, simple and easy to understand explanations and relevant examples; avoid using jargon',
            'Present and highlight the product benefits/features to create the need for customer to take up the protection.',
            'No misrepresentation/mislead/hard-sell/selling on 14 days Free look / Flexibility to cancel',
            'Maintain control of the call',
            'Recognize buying signal & opportunity to up sell.',
            'Trial close the call at the right time',
            'Do not sell on Policy Document/Late deduction',
            'Ask questions to identify the underlying reasons for the objection.',
            'Respond to all objections effectively and to the point',
            'Use the "3 attempts rule"',
          ],
        },
        {
          title: 'Communication',
          details: [
            'Pay attention to what the customer is saying and with no abrupt interruption.',
            'Probing skills',
            "Clarify customer's interest/concerns",
            "Understand & acknowledge the customer's needs",
            'Address the customer by his/her name to personalize the call.',
            'Use courteous phrases such as "thank you, please", "May I..."',
            'Engaging the customer appropriately',
            'Speak in a professional manner and with correct grammar & pronunciation.',
            'Use proper tone and clear diction',
          ],
        },
        {
          title: 'Sales Confirmation',
          details: [
            'Getting clear consent to purchase / Eligibility',
            'Verification of personal particulars',
            'Premium confirmation & payment details',
            'Marketing Consent',
          ],
        },
        {
          title: 'Mandatory Statements',
          details: [
            'Freelook condition',
            'Effective date',
            'E-policy document to be send out upon policy activation.',
            'Auto renewal condition',
            'Notify insurer changes of occupation / Intend to live outside Singapore for more than 6 months.',
            'Pre-existing conditions, for PA-physical impairment and any illness will not be covered.',
            'Disclosure for Consent to disclose information to insurer',
            'SDIC Information',
          ],
        },
        {
          title: 'Closing',
          details: [
            'Use standard closing.',
            'Reschedule a specific time to call back if the customer has expressed interest in the product',
          ],
        },
      ],
    },
  },
};

const msigTelesalesTravelEasyStanding: StandingConfiguration = {
  base: {
    friendlyId: 'msig-traveleasy-telesales-v1',
    company: new Types.ObjectId(MSIG_COMPANY_ID),
    module: 'telesales',
    product: 'travel-easy',
    assessmentType: 'msig-travel-easy',
    type: 'score-based',
    tiers: [
      {
        level: 1,
        scoreRange: 'Score: <85',
        criteria: [], // Empty for score-based standings
      },
      {
        level: 2,
        scoreRange: 'Score: 85-89',
        criteria: [],
      },
      {
        level: 3,
        scoreRange: 'Score: 90-94',
        criteria: [],
      },
      {
        level: 4,
        scoreRange: 'Score: 95-100',
        criteria: [],
      },
    ],
    // Shared criteria for all tiers - these don't affect evaluation, just display
    sharedCriteria: [],
  },
  localized: {
    en: {
      name: 'MSIG TravelEasy Telesales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Score: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Score: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Score: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Score: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Soft Skills (30 points)',
          details: [
            'To earn full score for Soft Skills, you must demonstrate excellence across all four dimensions:',
          ],
          subCriteria: [
            {
              title: 'Communication Skills (7.5 pts)',
              description: '',
              items: [
                'Use clear and respectful communication throughout the call',
                'Choose words that are easy to understand and not overly technical',
                'Explain insurance terms in simple language (e.g., "we\'ll cover flying you home if you\'re seriously ill" instead of "emergency medical repatriation")',
                'Maintain professional tone and proper pronunciation',
                'Avoid jargon or explain it when necessary',
              ],
            },
            {
              title: 'Relationship Building (7.5 pts)',
              description: '',
              items: [
                'Build and maintain rapport with the customer naturally',
                'Show patience when dealing with demanding or high-networth clients',
                'Demonstrate genuine interest in their travel plans',
                "Personalize the conversation based on customer's specific situation",
                'Make the customer feel valued and understood',
              ],
            },
            {
              title: 'Adaptability (7.5 pts)',
              description: '',
              items: [
                'Adjust your approach based on customer responses and concerns',
                'Pivot effectively when customer expresses new objections',
                'Recognize when to switch between features and benefits discussion',
                'Demonstrate flexibility in presentation style',
                'Handle changing customer needs smoothly',
              ],
            },
            {
              title: 'Customer Orientation (7.5 pts)',
              description: '',
              items: [
                'Prioritize customer needs over making a sale',
                'Listen actively to customer concerns and questions',
                'Focus on finding the right solution for their specific situation',
                'Ask questions to understand their travel circumstances',
                'Demonstrate genuine care for customer satisfaction',
              ],
            },
          ],
        },
        {
          title: 'Knowledge Skills (30 points)',
          details: [
            'To earn full score for Knowledge Skills, you must excel in gathering information, solving problems, and closing sales:',
          ],
          subCriteria: [
            {
              title: 'Fact Finding (10 pts)',
              description: '',
              items: [
                'Ask about travel destination to recommend the right coverage area (A/B/C)',
                'Gather trip duration and departure date information',
                'Understand travel frequency to suggest Single Trip vs Annual Plan',
                'Inquire about number and ages of travelers',
                'Ask about planned activities (adventure sports, water activities)',
                'Check for existing coverage (credit card insurance, health insurance)',
                'Understand budget considerations and special concerns',
              ],
            },
            {
              title: 'Problem-Solving (10 pts)',
              description: '',
              items: [
                "Identify gaps in customer's current travel coverage",
                'Address specific travel risks for their destination',
                'Find solutions for budget constraints',
                'Resolve coverage questions and objections effectively',
                'Recommend appropriate plan tier based on needs',
                'Handle complex scenarios (multi-destination, family with different needs)',
              ],
            },
            {
              title: 'Sales & Negotiation Skills (10 pts)',
              description: '',
              items: [
                'Guide customer toward a decision with choice-based closing',
                'Create appropriate urgency (booking deadline, coverage start date)',
                'Handle price objections by demonstrating value',
                'Negotiate plan tiers based on needs vs budget',
                'Use trial closes to test readiness',
                'Maintain confidence when facing knowledgeable clients',
                'Close the sale confidently',
              ],
            },
          ],
        },
        {
          title: 'Product Knowledge (40 points)',
          details: [
            'To earn full score for Product Knowledge, you must demonstrate comprehensive understanding of TravelEasy and provide solutions aligned with customer profile:',
          ],
          subCriteria: [
            {
              title: 'Product Pitch (40 pts)',
              description: '',
              items: [
                'Explain plan tiers (Standard, Elite, Premier) and their key differences',
                'Describe coverage areas (Area A: ASEAN, Area B: Asia-Pacific, Area C: Worldwide)',
                'Present trip types (Single Return Trip up to 182 days vs Annual Plan)',
                'Highlight key benefits: COVID-19 coverage up to $750,000, travel inconvenience up to $12,500',
                'Explain medical coverage: overseas medical expenses and emergency evacuation up to $1,000,000',
                'Address how TravelEasy compares to credit card and health insurance',
                "Customize pitch to customer's specific travel profile and needs",
                'Provide clear premium calculations based on destination, tier, and duration',
              ],
            },
          ],
        },
      ],
    },
    ceb: {
      name: 'MSIG TravelEasy Telesales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Puntos: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Puntos: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Puntos: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Puntos: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Soft Skills (30 ka puntos)',
          details: [
            'Para makakuha og bug-os nga puntos sa Soft Skills, kinahanglan nimo ipakita ang kahanas sa tanan nga upat ka dimensyon:',
          ],
          subCriteria: [
            {
              title: 'Communication Skills (7.5 pts)',
              description: '',
              items: [
                'Gamita ang tin-aw ug respetable nga komunikasyon sa tibuok call',
                'Pilia ang mga pulong nga sayon sabton ug dili kaayo technical',
                'Ipasabut ang insurance terms sa simple nga pinulongan',
                'Hupti ang propesyonal nga tono ug hustong pagbigkas',
                'Likayi ang jargon o ipasabut kini kung gikinahanglan',
              ],
            },
            {
              title: 'Relationship Building (7.5 pts)',
              description: '',
              items: [
                'Pagtukod ug pagmintinar sa relasyon sa kostumer sa natural nga paagi',
                'Ipakita ang pailob sa pakig-uban sa demanding o high-networth nga mga kliyente',
                'Ipakita ang tinuod nga interes sa ilang mga plano sa pagbiyahe',
                'Personalisa ang panag-istoryahanay base sa piho nga sitwasyon sa kostumer',
                'Himoa nga gibati sa kostumer nga sila gipabilhan ug nasabtan',
              ],
            },
            {
              title: 'Adaptability (7.5 pts)',
              description: '',
              items: [
                'I-adjust ang imong pamaagi base sa mga tubag ug kabalaka sa kostumer',
                'Epektibo nga mo-pivot kon ang kostumer mopahayag og bag-ong mga pagsupak',
                'Ilha kon kanus-a mo-switch tali sa features ug benefits nga diskusyon',
                'Ipakita ang flexibility sa presentation style',
                'Hanapan ang nag-usab-usab nga mga panginahanglan sa kostumer sa hapsay nga paagi',
              ],
            },
            {
              title: 'Customer Orientation (7.5 pts)',
              description: '',
              items: [
                'I-prioritize ang mga panginahanglan sa kostumer labaw sa paghimog baligya',
                'Paminaw nga aktibo sa mga kabalaka ug pangutana sa kostumer',
                'Tutuki sa pagpangita sa hustong solusyon alang sa ilang piho nga sitwasyon',
                'Pangutana aron masabtan ang ilang mga kahimtang sa pagbiyahe',
                'Ipakita ang tinuod nga pag-atiman alang sa katagbawan sa kostumer',
              ],
            },
          ],
        },
        {
          title: 'Knowledge Skills (30 ka puntos)',
          details: [
            'Para makakuha og bug-os nga puntos sa Knowledge Skills, kinahanglan nimo mohanas sa pagtipon og impormasyon, pagsulbad sa mga problema, ug pagsara sa baligya:',
          ],
          subCriteria: [
            {
              title: 'Fact Finding (10 pts)',
              description: '',
              items: [
                'Pangutana bahin sa destinasyon sa pagbiyahe aron marekomenda ang hustong coverage area (A/B/C)',
                'Tigoma ang impormasyon sa gidugayon sa biyahe ug petsa sa pagbiya',
                'Sabta ang frequency sa pagbiyahe aron masugyot ang Single Trip vs Annual Plan',
                'Pangutana bahin sa gidaghanon ug edad sa mga biyahero',
                'Pangutana bahin sa giplano nga kalihokan (adventure sports, water activities)',
                'Susiha kon naa bay existing coverage (credit card insurance, health insurance)',
                'Sabta ang mga konsiderasyon sa badyet ug special nga mga kabalaka',
              ],
            },
            {
              title: 'Problem-Solving (10 pts)',
              description: '',
              items: [
                'Ilha ang mga gaps sa kasamtangang travel coverage sa kostumer',
                'Tubaga ang piho nga travel risks alang sa ilang destinasyon',
                'Pangitag mga solusyon alang sa mga hadlang sa badyet',
                'Sulbara ang mga pangutana sa coverage ug mga pagsupak nga epektibo',
                'Irekomenda ang angay nga plan tier base sa mga panginahanglan',
                'Atubangon ang komplikadong mga senaryo (multi-destination, pamilya nga may lain-laing panginahanglan)',
              ],
            },
            {
              title: 'Sales & Negotiation Skills (10 pts)',
              description: '',
              items: [
                'Giyahi ang kostumer padulong sa desisyon gamit ang choice-based closing',
                'Paghimo og angay nga urgency (booking deadline, coverage start date)',
                'Atubangon ang price objections pinaagi sa pagpakita sa bili',
                'Pagnegosyo sa plan tiers base sa panginahanglan vs badyet',
                'Gamita ang trial closes aron masulayan ang pagkaandam',
                'Hupti ang pagsalig kon nag-atubang sa mga kliyente nga may kahibalo',
                'Isara ang baligya nga may pagsalig',
              ],
            },
          ],
        },
        {
          title: 'Product Knowledge (40 ka puntos)',
          details: [
            'Para makakuha og bug-os nga puntos sa Product Knowledge, kinahanglan nimo ipakita ang bug-os nga pagsabut sa TravelEasy ug maghatag og mga solusyon nga naa sa linya sa profile sa kostumer:',
          ],
          subCriteria: [
            {
              title: 'Product Pitch (40 pts)',
              description: '',
              items: [
                'Ipasabut ang plan tiers (Standard, Elite, Premier) ug ilang mga importanting kalainan',
                'Ihulagway ang coverage areas (Area A: ASEAN, Area B: Asia-Pacific, Area C: Worldwide)',
                'Ipresentar ang trip types (Single Return Trip hangtod 182 days vs Annual Plan)',
                'I-highlight ang importanting mga benepisyo: COVID-19 coverage hangtod $750,000, travel inconvenience hangtod $12,500',
                'Ipasabut ang medical coverage: overseas medical expenses ug emergency evacuation hangtod $1,000,000',
                'Tubaga kon unsaon pagtandi sa TravelEasy sa credit card ug health insurance',
                'I-customize ang pitch sa piho nga travel profile ug panginahanglan sa kostumer',
                'Paghatag og tin-aw nga premium calculations base sa destinasyon, tier, ug gidugayon',
              ],
            },
          ],
        },
      ],
    },
    id: {
      name: 'MSIG TravelEasy Telesales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Skor: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Skor: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Skor: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Skor: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Keterampilan Lunak (30 poin)',
          details: [
            'Untuk mendapatkan nilai penuh pada Keterampilan Lunak, Anda harus menunjukkan keunggulan di semua empat dimensi:',
          ],
          subCriteria: [
            {
              title: 'Keterampilan Komunikasi (7,5 pts)',
              description: '',
              items: [
                'Gunakan komunikasi yang jelas dan penuh hormat sepanjang panggilan',
                'Pilih kata-kata yang mudah dipahami dan tidak terlalu teknis',
                'Jelaskan istilah asuransi dalam bahasa yang sederhana',
                'Pertahankan nada profesional dan pengucapan yang tepat',
                'Hindari jargon atau jelaskan saat diperlukan',
              ],
            },
            {
              title: 'Membangun Hubungan (7,5 pts)',
              description: '',
              items: [
                'Bangun dan pertahankan hubungan baik dengan pelanggan secara alami',
                'Tunjukkan kesabaran saat menghadapi klien yang menuntut atau berpenghasilan tinggi',
                'Tunjukkan minat yang tulus pada rencana perjalanan mereka',
                'Personalisasi percakapan berdasarkan situasi spesifik pelanggan',
                'Buat pelanggan merasa dihargai dan dipahami',
              ],
            },
            {
              title: 'Adaptabilitas (7,5 pts)',
              description: '',
              items: [
                'Sesuaikan pendekatan Anda berdasarkan tanggapan dan kekhawatiran pelanggan',
                'Pivot secara efektif ketika pelanggan mengungkapkan keberatan baru',
                'Kenali kapan harus beralih antara diskusi fitur dan manfaat',
                'Tunjukkan fleksibilitas dalam gaya presentasi',
                'Tangani kebutuhan pelanggan yang berubah dengan lancar',
              ],
            },
            {
              title: 'Orientasi Pelanggan (7,5 pts)',
              description: '',
              items: [
                'Prioritaskan kebutuhan pelanggan di atas penjualan',
                'Dengarkan secara aktif kekhawatiran dan pertanyaan pelanggan',
                'Fokus pada menemukan solusi yang tepat untuk situasi spesifik mereka',
                'Ajukan pertanyaan untuk memahami keadaan perjalanan mereka',
                'Tunjukkan kepedulian yang tulus terhadap kepuasan pelanggan',
              ],
            },
          ],
        },
        {
          title: 'Keterampilan Pengetahuan (30 poin)',
          details: [
            'Untuk mendapatkan nilai penuh pada Keterampilan Pengetahuan, Anda harus unggul dalam mengumpulkan informasi, memecahkan masalah, dan menutup penjualan:',
          ],
          subCriteria: [
            {
              title: 'Pencarian Fakta (10 pts)',
              description: '',
              items: [
                'Tanyakan tentang destinasi perjalanan untuk merekomendasikan area cakupan yang tepat (A/B/C)',
                'Kumpulkan informasi durasi perjalanan dan tanggal keberangkatan',
                'Pahami frekuensi perjalanan untuk menyarankan Perjalanan Tunggal vs Paket Tahunan',
                'Tanyakan tentang jumlah dan usia pelancong',
                'Tanyakan tentang aktivitas yang direncanakan (olahraga petualangan, aktivitas air)',
                'Periksa cakupan yang ada (asuransi kartu kredit, asuransi kesehatan)',
                'Pahami pertimbangan anggaran dan kekhawatiran khusus',
              ],
            },
            {
              title: 'Pemecahan Masalah (10 pts)',
              description: '',
              items: [
                'Identifikasi kesenjangan dalam cakupan perjalanan pelanggan saat ini',
                'Tangani risiko perjalanan spesifik untuk destinasi mereka',
                'Temukan solusi untuk kendala anggaran',
                'Selesaikan pertanyaan cakupan dan keberatan secara efektif',
                'Rekomendasikan tingkatan paket yang sesuai berdasarkan kebutuhan',
                'Tangani skenario kompleks (multi-destinasi, keluarga dengan kebutuhan berbeda)',
              ],
            },
            {
              title: 'Keterampilan Penjualan & Negosiasi (10 pts)',
              description: '',
              items: [
                'Pandu pelanggan menuju keputusan dengan penutupan berbasis pilihan',
                'Ciptakan urgensi yang tepat (batas waktu pemesanan, tanggal mulai cakupan)',
                'Tangani keberatan harga dengan menunjukkan nilai',
                'Negosiasikan tingkatan paket berdasarkan kebutuhan vs anggaran',
                'Gunakan penutupan percobaan untuk menguji kesiapan',
                'Pertahankan kepercayaan diri saat menghadapi klien yang berpengetahuan',
                'Tutup penjualan dengan percaya diri',
              ],
            },
          ],
        },
        {
          title: 'Pengetahuan Produk (40 poin)',
          details: [
            'Untuk mendapatkan nilai penuh pada Pengetahuan Produk, Anda harus menunjukkan pemahaman komprehensif tentang TravelEasy dan memberikan solusi yang selaras dengan profil pelanggan:',
          ],
          subCriteria: [
            {
              title: 'Presentasi Produk (40 pts)',
              description: '',
              items: [
                'Jelaskan tingkatan paket (Standard, Elite, Premier) dan perbedaan utamanya',
                'Gambarkan area cakupan (Area A: ASEAN, Area B: Asia-Pasifik, Area C: Seluruh Dunia)',
                'Presentasikan jenis perjalanan (Perjalanan Pulang Pergi Tunggal hingga 182 hari vs Paket Tahunan)',
                'Soroti manfaat utama: cakupan COVID-19 hingga $750.000, ketidaknyamanan perjalanan hingga $12.500',
                'Jelaskan cakupan medis: biaya medis luar negeri dan evakuasi darurat hingga $1.000.000',
                'Tangani bagaimana TravelEasy dibandingkan dengan asuransi kartu kredit dan kesehatan',
                'Sesuaikan presentasi dengan profil dan kebutuhan perjalanan spesifik pelanggan',
                'Berikan perhitungan premi yang jelas berdasarkan destinasi, tingkatan, dan durasi',
              ],
            },
          ],
        },
      ],
    },
    ms: {
      name: 'MSIG TravelEasy Telesales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Skor: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Skor: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Skor: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Skor: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Kemahiran Lembut (30 mata)',
          details: [
            'Untuk mendapat markah penuh pada Kemahiran Lembut, anda mesti menunjukkan kecemerlangan merentas keempat-empat dimensi:',
          ],
          subCriteria: [
            {
              title: 'Kemahiran Komunikasi (7.5 pts)',
              description: '',
              items: [
                'Gunakan komunikasi yang jelas dan penuh hormat sepanjang panggilan',
                'Pilih perkataan yang mudah difahami dan tidak terlalu teknikal',
                'Terangkan istilah insurans dalam bahasa yang mudah',
                'Kekalkan nada profesional dan sebutan yang betul',
                'Elakkan jargon atau terangkan apabila perlu',
              ],
            },
            {
              title: 'Pembinaan Hubungan (7.5 pts)',
              description: '',
              items: [
                'Bina dan kekalkan hubungan baik dengan pelanggan secara semula jadi',
                'Tunjukkan kesabaran apabila menghadapi pelanggan yang menuntut atau berpendapatan tinggi',
                'Tunjukkan minat yang tulen terhadap rancangan perjalanan mereka',
                'Personalkan perbualan berdasarkan situasi khusus pelanggan',
                'Buat pelanggan berasa dihargai dan difahami',
              ],
            },
            {
              title: 'Kebolehsuaian (7.5 pts)',
              description: '',
              items: [
                'Sesuaikan pendekatan anda berdasarkan tindak balas dan kebimbangan pelanggan',
                'Beralih dengan berkesan apabila pelanggan menyatakan bantahan baru',
                'Kenali bila perlu menukar antara perbincangan ciri dan manfaat',
                'Tunjukkan fleksibiliti dalam gaya pembentangan',
                'Tangani keperluan pelanggan yang berubah dengan lancar',
              ],
            },
            {
              title: 'Orientasi Pelanggan (7.5 pts)',
              description: '',
              items: [
                'Utamakan keperluan pelanggan berbanding membuat jualan',
                'Dengar secara aktif kebimbangan dan soalan pelanggan',
                'Fokus pada mencari penyelesaian yang tepat untuk situasi khusus mereka',
                'Tanya soalan untuk memahami keadaan perjalanan mereka',
                'Tunjukkan kepedulian yang tulen terhadap kepuasan pelanggan',
              ],
            },
          ],
        },
        {
          title: 'Kemahiran Pengetahuan (30 mata)',
          details: [
            'Untuk mendapat markah penuh pada Kemahiran Pengetahuan, anda mesti cemerlang dalam mengumpul maklumat, menyelesaikan masalah, dan menutup jualan:',
          ],
          subCriteria: [
            {
              title: 'Pencarian Fakta (10 pts)',
              description: '',
              items: [
                'Tanya tentang destinasi perjalanan untuk mengesyorkan kawasan perlindungan yang tepat (A/B/C)',
                'Kumpul maklumat tempoh perjalanan dan tarikh berlepas',
                'Fahami kekerapan perjalanan untuk mencadangkan Perjalanan Tunggal vs Pelan Tahunan',
                'Tanya tentang bilangan dan umur pengembara',
                'Tanya tentang aktiviti yang dirancang (sukan lasak, aktiviti air)',
                'Semak perlindungan sedia ada (insurans kad kredit, insurans kesihatan)',
                'Fahami pertimbangan bajet dan kebimbangan khas',
              ],
            },
            {
              title: 'Penyelesaian Masalah (10 pts)',
              description: '',
              items: [
                'Kenal pasti jurang dalam perlindungan perjalanan semasa pelanggan',
                'Tangani risiko perjalanan khusus untuk destinasi mereka',
                'Cari penyelesaian untuk kekangan bajet',
                'Selesaikan soalan perlindungan dan bantahan dengan berkesan',
                'Syorkan peringkat pelan yang sesuai berdasarkan keperluan',
                'Tangani senario kompleks (berbilang destinasi, keluarga dengan keperluan berbeza)',
              ],
            },
            {
              title: 'Kemahiran Jualan & Rundingan (10 pts)',
              description: '',
              items: [
                'Pandu pelanggan ke arah keputusan dengan penutupan berasaskan pilihan',
                'Cipta keperluan mendesak yang sesuai (tarikh akhir tempahan, tarikh mula perlindungan)',
                'Tangani bantahan harga dengan menunjukkan nilai',
                'Rundingan peringkat pelan berdasarkan keperluan vs bajet',
                'Gunakan penutupan percubaan untuk menguji kesediaan',
                'Kekalkan keyakinan apabila menghadapi pelanggan yang berpengetahuan',
                'Tutup jualan dengan yakin',
              ],
            },
          ],
        },
        {
          title: 'Pengetahuan Produk (40 mata)',
          details: [
            'Untuk mendapat markah penuh pada Pengetahuan Produk, anda mesti menunjukkan pemahaman menyeluruh tentang TravelEasy dan memberikan penyelesaian yang sejajar dengan profil pelanggan:',
          ],
          subCriteria: [
            {
              title: 'Pembentangan Produk (40 pts)',
              description: '',
              items: [
                'Terangkan peringkat pelan (Standard, Elite, Premier) dan perbezaan utama mereka',
                'Gambarkan kawasan perlindungan (Kawasan A: ASEAN, Kawasan B: Asia-Pasifik, Kawasan C: Seluruh Dunia)',
                'Bentangkan jenis perjalanan (Perjalanan Pergi Balik Tunggal sehingga 182 hari vs Pelan Tahunan)',
                'Tonjolkan manfaat utama: perlindungan COVID-19 sehingga $750,000, kesulitan perjalanan sehingga $12,500',
                'Terangkan perlindungan perubatan: perbelanjaan perubatan luar negara dan pemindahan kecemasan sehingga $1,000,000',
                'Tangani bagaimana TravelEasy berbanding dengan insurans kad kredit dan kesihatan',
                'Sesuaikan pembentangan dengan profil dan keperluan perjalanan khusus pelanggan',
                'Berikan pengiraan premium yang jelas berdasarkan destinasi, peringkat, dan tempoh',
              ],
            },
          ],
        },
      ],
    },
  },
};

const msigAgencysalesTravelEasyStanding: StandingConfiguration = {
  base: {
    friendlyId: 'msig-traveleasy-telesales-v1',
    company: new Types.ObjectId(MSIG_COMPANY_ID),
    module: 'agency-sales',
    product: 'travel-easy',
    assessmentType: 'msig-travel-easy',
    type: 'score-based',
    tiers: [
      {
        level: 1,
        scoreRange: 'Score: <85',
        criteria: [], // Empty for score-based standings
      },
      {
        level: 2,
        scoreRange: 'Score: 85-89',
        criteria: [],
      },
      {
        level: 3,
        scoreRange: 'Score: 90-94',
        criteria: [],
      },
      {
        level: 4,
        scoreRange: 'Score: 95-100',
        criteria: [],
      },
    ],
    // Shared criteria for all tiers - these don't affect evaluation, just display
    sharedCriteria: [],
  },
  localized: {
    en: {
      name: 'MSIG TravelEasy Telesales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Score: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Score: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Score: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Score: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Soft Skills (30 points)',
          details: [
            'To earn full score for Soft Skills, you must demonstrate excellence across all four dimensions:',
          ],
          subCriteria: [
            {
              title: 'Communication Skills (7.5 pts)',
              description: '',
              items: [
                'Use clear and respectful communication throughout the call',
                'Choose words that are easy to understand and not overly technical',
                'Explain insurance terms in simple language (e.g., "we\'ll cover flying you home if you\'re seriously ill" instead of "emergency medical repatriation")',
                'Maintain professional tone and proper pronunciation',
                'Avoid jargon or explain it when necessary',
              ],
            },
            {
              title: 'Relationship Building (7.5 pts)',
              description: '',
              items: [
                'Build and maintain rapport with the customer naturally',
                'Show patience when dealing with demanding or high-networth clients',
                'Demonstrate genuine interest in their travel plans',
                "Personalize the conversation based on customer's specific situation",
                'Make the customer feel valued and understood',
              ],
            },
            {
              title: 'Adaptability (7.5 pts)',
              description: '',
              items: [
                'Adjust your approach based on customer responses and concerns',
                'Pivot effectively when customer expresses new objections',
                'Recognize when to switch between features and benefits discussion',
                'Demonstrate flexibility in presentation style',
                'Handle changing customer needs smoothly',
              ],
            },
            {
              title: 'Customer Orientation (7.5 pts)',
              description: '',
              items: [
                'Prioritize customer needs over making a sale',
                'Listen actively to customer concerns and questions',
                'Focus on finding the right solution for their specific situation',
                'Ask questions to understand their travel circumstances',
                'Demonstrate genuine care for customer satisfaction',
              ],
            },
          ],
        },
        {
          title: 'Knowledge Skills (30 points)',
          details: [
            'To earn full score for Knowledge Skills, you must excel in gathering information, solving problems, and closing sales:',
          ],
          subCriteria: [
            {
              title: 'Fact Finding (10 pts)',
              description: '',
              items: [
                'Ask about travel destination to recommend the right coverage area (A/B/C)',
                'Gather trip duration and departure date information',
                'Understand travel frequency to suggest Single Trip vs Annual Plan',
                'Inquire about number and ages of travelers',
                'Ask about planned activities (adventure sports, water activities)',
                'Check for existing coverage (credit card insurance, health insurance)',
                'Understand budget considerations and special concerns',
              ],
            },
            {
              title: 'Problem-Solving (10 pts)',
              description: '',
              items: [
                "Identify gaps in customer's current travel coverage",
                'Address specific travel risks for their destination',
                'Find solutions for budget constraints',
                'Resolve coverage questions and objections effectively',
                'Recommend appropriate plan tier based on needs',
                'Handle complex scenarios (multi-destination, family with different needs)',
              ],
            },
            {
              title: 'Sales & Negotiation Skills (10 pts)',
              description: '',
              items: [
                'Guide customer toward a decision with choice-based closing',
                'Create appropriate urgency (booking deadline, coverage start date)',
                'Handle price objections by demonstrating value',
                'Negotiate plan tiers based on needs vs budget',
                'Use trial closes to test readiness',
                'Maintain confidence when facing knowledgeable clients',
                'Close the sale confidently',
              ],
            },
          ],
        },
        {
          title: 'Product Knowledge (40 points)',
          details: [
            'To earn full score for Product Knowledge, you must demonstrate comprehensive understanding of TravelEasy and provide solutions aligned with customer profile:',
          ],
          subCriteria: [
            {
              title: 'Product Pitch (40 pts)',
              description: '',
              items: [
                'Explain plan tiers (Standard, Elite, Premier) and their key differences',
                'Describe coverage areas (Area A: ASEAN, Area B: Asia-Pacific, Area C: Worldwide)',
                'Present trip types (Single Return Trip up to 182 days vs Annual Plan)',
                'Highlight key benefits: COVID-19 coverage up to $750,000, travel inconvenience up to $12,500',
                'Explain medical coverage: overseas medical expenses and emergency evacuation up to $1,000,000',
                'Address how TravelEasy compares to credit card and health insurance',
                "Customize pitch to customer's specific travel profile and needs",
                'Provide clear premium calculations based on destination, tier, and duration',
              ],
            },
          ],
        },
      ],
    },
    ceb: {
      name: 'MSIG TravelEasy Telesales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Puntos: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Puntos: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Puntos: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Puntos: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Soft Skills (30 ka puntos)',
          details: [
            'Para makakuha og bug-os nga puntos sa Soft Skills, kinahanglan nimo ipakita ang kahanas sa tanan nga upat ka dimensyon:',
          ],
          subCriteria: [
            {
              title: 'Communication Skills (7.5 pts)',
              description: '',
              items: [
                'Gamita ang tin-aw ug respetable nga komunikasyon sa tibuok call',
                'Pilia ang mga pulong nga sayon sabton ug dili kaayo technical',
                'Ipasabut ang insurance terms sa simple nga pinulongan',
                'Hupti ang propesyonal nga tono ug hustong pagbigkas',
                'Likayi ang jargon o ipasabut kini kung gikinahanglan',
              ],
            },
            {
              title: 'Relationship Building (7.5 pts)',
              description: '',
              items: [
                'Pagtukod ug pagmintinar sa relasyon sa kostumer sa natural nga paagi',
                'Ipakita ang pailob sa pakig-uban sa demanding o high-networth nga mga kliyente',
                'Ipakita ang tinuod nga interes sa ilang mga plano sa pagbiyahe',
                'Personalisa ang panag-istoryahanay base sa piho nga sitwasyon sa kostumer',
                'Himoa nga gibati sa kostumer nga sila gipabilhan ug nasabtan',
              ],
            },
            {
              title: 'Adaptability (7.5 pts)',
              description: '',
              items: [
                'I-adjust ang imong pamaagi base sa mga tubag ug kabalaka sa kostumer',
                'Epektibo nga mo-pivot kon ang kostumer mopahayag og bag-ong mga pagsupak',
                'Ilha kon kanus-a mo-switch tali sa features ug benefits nga diskusyon',
                'Ipakita ang flexibility sa presentation style',
                'Hanapan ang nag-usab-usab nga mga panginahanglan sa kostumer sa hapsay nga paagi',
              ],
            },
            {
              title: 'Customer Orientation (7.5 pts)',
              description: '',
              items: [
                'I-prioritize ang mga panginahanglan sa kostumer labaw sa paghimog baligya',
                'Paminaw nga aktibo sa mga kabalaka ug pangutana sa kostumer',
                'Tutuki sa pagpangita sa hustong solusyon alang sa ilang piho nga sitwasyon',
                'Pangutana aron masabtan ang ilang mga kahimtang sa pagbiyahe',
                'Ipakita ang tinuod nga pag-atiman alang sa katagbawan sa kostumer',
              ],
            },
          ],
        },
        {
          title: 'Knowledge Skills (30 ka puntos)',
          details: [
            'Para makakuha og bug-os nga puntos sa Knowledge Skills, kinahanglan nimo mohanas sa pagtipon og impormasyon, pagsulbad sa mga problema, ug pagsara sa baligya:',
          ],
          subCriteria: [
            {
              title: 'Fact Finding (10 pts)',
              description: '',
              items: [
                'Pangutana bahin sa destinasyon sa pagbiyahe aron marekomenda ang hustong coverage area (A/B/C)',
                'Tigoma ang impormasyon sa gidugayon sa biyahe ug petsa sa pagbiya',
                'Sabta ang frequency sa pagbiyahe aron masugyot ang Single Trip vs Annual Plan',
                'Pangutana bahin sa gidaghanon ug edad sa mga biyahero',
                'Pangutana bahin sa giplano nga kalihokan (adventure sports, water activities)',
                'Susiha kon naa bay existing coverage (credit card insurance, health insurance)',
                'Sabta ang mga konsiderasyon sa badyet ug special nga mga kabalaka',
              ],
            },
            {
              title: 'Problem-Solving (10 pts)',
              description: '',
              items: [
                'Ilha ang mga gaps sa kasamtangang travel coverage sa kostumer',
                'Tubaga ang piho nga travel risks alang sa ilang destinasyon',
                'Pangitag mga solusyon alang sa mga hadlang sa badyet',
                'Sulbara ang mga pangutana sa coverage ug mga pagsupak nga epektibo',
                'Irekomenda ang angay nga plan tier base sa mga panginahanglan',
                'Atubangon ang komplikadong mga senaryo (multi-destination, pamilya nga may lain-laing panginahanglan)',
              ],
            },
            {
              title: 'Sales & Negotiation Skills (10 pts)',
              description: '',
              items: [
                'Giyahi ang kostumer padulong sa desisyon gamit ang choice-based closing',
                'Paghimo og angay nga urgency (booking deadline, coverage start date)',
                'Atubangon ang price objections pinaagi sa pagpakita sa bili',
                'Pagnegosyo sa plan tiers base sa panginahanglan vs badyet',
                'Gamita ang trial closes aron masulayan ang pagkaandam',
                'Hupti ang pagsalig kon nag-atubang sa mga kliyente nga may kahibalo',
                'Isara ang baligya nga may pagsalig',
              ],
            },
          ],
        },
        {
          title: 'Product Knowledge (40 ka puntos)',
          details: [
            'Para makakuha og bug-os nga puntos sa Product Knowledge, kinahanglan nimo ipakita ang bug-os nga pagsabut sa TravelEasy ug maghatag og mga solusyon nga naa sa linya sa profile sa kostumer:',
          ],
          subCriteria: [
            {
              title: 'Product Pitch (40 pts)',
              description: '',
              items: [
                'Ipasabut ang plan tiers (Standard, Elite, Premier) ug ilang mga importanting kalainan',
                'Ihulagway ang coverage areas (Area A: ASEAN, Area B: Asia-Pacific, Area C: Worldwide)',
                'Ipresentar ang trip types (Single Return Trip hangtod 182 days vs Annual Plan)',
                'I-highlight ang importanting mga benepisyo: COVID-19 coverage hangtod $750,000, travel inconvenience hangtod $12,500',
                'Ipasabut ang medical coverage: overseas medical expenses ug emergency evacuation hangtod $1,000,000',
                'Tubaga kon unsaon pagtandi sa TravelEasy sa credit card ug health insurance',
                'I-customize ang pitch sa piho nga travel profile ug panginahanglan sa kostumer',
                'Paghatag og tin-aw nga premium calculations base sa destinasyon, tier, ug gidugayon',
              ],
            },
          ],
        },
      ],
    },
    id: {
      name: 'MSIG TravelEasy Telesales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Skor: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Skor: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Skor: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Skor: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Keterampilan Lunak (30 poin)',
          details: [
            'Untuk mendapatkan nilai penuh pada Keterampilan Lunak, Anda harus menunjukkan keunggulan di semua empat dimensi:',
          ],
          subCriteria: [
            {
              title: 'Keterampilan Komunikasi (7,5 pts)',
              description: '',
              items: [
                'Gunakan komunikasi yang jelas dan penuh hormat sepanjang panggilan',
                'Pilih kata-kata yang mudah dipahami dan tidak terlalu teknis',
                'Jelaskan istilah asuransi dalam bahasa yang sederhana',
                'Pertahankan nada profesional dan pengucapan yang tepat',
                'Hindari jargon atau jelaskan saat diperlukan',
              ],
            },
            {
              title: 'Membangun Hubungan (7,5 pts)',
              description: '',
              items: [
                'Bangun dan pertahankan hubungan baik dengan pelanggan secara alami',
                'Tunjukkan kesabaran saat menghadapi klien yang menuntut atau berpenghasilan tinggi',
                'Tunjukkan minat yang tulus pada rencana perjalanan mereka',
                'Personalisasi percakapan berdasarkan situasi spesifik pelanggan',
                'Buat pelanggan merasa dihargai dan dipahami',
              ],
            },
            {
              title: 'Adaptabilitas (7,5 pts)',
              description: '',
              items: [
                'Sesuaikan pendekatan Anda berdasarkan tanggapan dan kekhawatiran pelanggan',
                'Pivot secara efektif ketika pelanggan mengungkapkan keberatan baru',
                'Kenali kapan harus beralih antara diskusi fitur dan manfaat',
                'Tunjukkan fleksibilitas dalam gaya presentasi',
                'Tangani kebutuhan pelanggan yang berubah dengan lancar',
              ],
            },
            {
              title: 'Orientasi Pelanggan (7,5 pts)',
              description: '',
              items: [
                'Prioritaskan kebutuhan pelanggan di atas penjualan',
                'Dengarkan secara aktif kekhawatiran dan pertanyaan pelanggan',
                'Fokus pada menemukan solusi yang tepat untuk situasi spesifik mereka',
                'Ajukan pertanyaan untuk memahami keadaan perjalanan mereka',
                'Tunjukkan kepedulian yang tulus terhadap kepuasan pelanggan',
              ],
            },
          ],
        },
        {
          title: 'Keterampilan Pengetahuan (30 poin)',
          details: [
            'Untuk mendapatkan nilai penuh pada Keterampilan Pengetahuan, Anda harus unggul dalam mengumpulkan informasi, memecahkan masalah, dan menutup penjualan:',
          ],
          subCriteria: [
            {
              title: 'Pencarian Fakta (10 pts)',
              description: '',
              items: [
                'Tanyakan tentang destinasi perjalanan untuk merekomendasikan area cakupan yang tepat (A/B/C)',
                'Kumpulkan informasi durasi perjalanan dan tanggal keberangkatan',
                'Pahami frekuensi perjalanan untuk menyarankan Perjalanan Tunggal vs Paket Tahunan',
                'Tanyakan tentang jumlah dan usia pelancong',
                'Tanyakan tentang aktivitas yang direncanakan (olahraga petualangan, aktivitas air)',
                'Periksa cakupan yang ada (asuransi kartu kredit, asuransi kesehatan)',
                'Pahami pertimbangan anggaran dan kekhawatiran khusus',
              ],
            },
            {
              title: 'Pemecahan Masalah (10 pts)',
              description: '',
              items: [
                'Identifikasi kesenjangan dalam cakupan perjalanan pelanggan saat ini',
                'Tangani risiko perjalanan spesifik untuk destinasi mereka',
                'Temukan solusi untuk kendala anggaran',
                'Selesaikan pertanyaan cakupan dan keberatan secara efektif',
                'Rekomendasikan tingkatan paket yang sesuai berdasarkan kebutuhan',
                'Tangani skenario kompleks (multi-destinasi, keluarga dengan kebutuhan berbeda)',
              ],
            },
            {
              title: 'Keterampilan Penjualan & Negosiasi (10 pts)',
              description: '',
              items: [
                'Pandu pelanggan menuju keputusan dengan penutupan berbasis pilihan',
                'Ciptakan urgensi yang tepat (batas waktu pemesanan, tanggal mulai cakupan)',
                'Tangani keberatan harga dengan menunjukkan nilai',
                'Negosiasikan tingkatan paket berdasarkan kebutuhan vs anggaran',
                'Gunakan penutupan percobaan untuk menguji kesiapan',
                'Pertahankan kepercayaan diri saat menghadapi klien yang berpengetahuan',
                'Tutup penjualan dengan percaya diri',
              ],
            },
          ],
        },
        {
          title: 'Pengetahuan Produk (40 poin)',
          details: [
            'Untuk mendapatkan nilai penuh pada Pengetahuan Produk, Anda harus menunjukkan pemahaman komprehensif tentang TravelEasy dan memberikan solusi yang selaras dengan profil pelanggan:',
          ],
          subCriteria: [
            {
              title: 'Presentasi Produk (40 pts)',
              description: '',
              items: [
                'Jelaskan tingkatan paket (Standard, Elite, Premier) dan perbedaan utamanya',
                'Gambarkan area cakupan (Area A: ASEAN, Area B: Asia-Pasifik, Area C: Seluruh Dunia)',
                'Presentasikan jenis perjalanan (Perjalanan Pulang Pergi Tunggal hingga 182 hari vs Paket Tahunan)',
                'Soroti manfaat utama: cakupan COVID-19 hingga $750.000, ketidaknyamanan perjalanan hingga $12.500',
                'Jelaskan cakupan medis: biaya medis luar negeri dan evakuasi darurat hingga $1.000.000',
                'Tangani bagaimana TravelEasy dibandingkan dengan asuransi kartu kredit dan kesehatan',
                'Sesuaikan presentasi dengan profil dan kebutuhan perjalanan spesifik pelanggan',
                'Berikan perhitungan premi yang jelas berdasarkan destinasi, tingkatan, dan durasi',
              ],
            },
          ],
        },
      ],
    },
    ms: {
      name: 'MSIG TravelEasy Telesales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Skor: <85',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Skor: 85-89',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Skor: 90-94',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Skor: 95-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Kemahiran Lembut (30 mata)',
          details: [
            'Untuk mendapat markah penuh pada Kemahiran Lembut, anda mesti menunjukkan kecemerlangan merentas keempat-empat dimensi:',
          ],
          subCriteria: [
            {
              title: 'Kemahiran Komunikasi (7.5 pts)',
              description: '',
              items: [
                'Gunakan komunikasi yang jelas dan penuh hormat sepanjang panggilan',
                'Pilih perkataan yang mudah difahami dan tidak terlalu teknikal',
                'Terangkan istilah insurans dalam bahasa yang mudah',
                'Kekalkan nada profesional dan sebutan yang betul',
                'Elakkan jargon atau terangkan apabila perlu',
              ],
            },
            {
              title: 'Pembinaan Hubungan (7.5 pts)',
              description: '',
              items: [
                'Bina dan kekalkan hubungan baik dengan pelanggan secara semula jadi',
                'Tunjukkan kesabaran apabila menghadapi pelanggan yang menuntut atau berpendapatan tinggi',
                'Tunjukkan minat yang tulen terhadap rancangan perjalanan mereka',
                'Personalkan perbualan berdasarkan situasi khusus pelanggan',
                'Buat pelanggan berasa dihargai dan difahami',
              ],
            },
            {
              title: 'Kebolehsuaian (7.5 pts)',
              description: '',
              items: [
                'Sesuaikan pendekatan anda berdasarkan tindak balas dan kebimbangan pelanggan',
                'Beralih dengan berkesan apabila pelanggan menyatakan bantahan baru',
                'Kenali bila perlu menukar antara perbincangan ciri dan manfaat',
                'Tunjukkan fleksibiliti dalam gaya pembentangan',
                'Tangani keperluan pelanggan yang berubah dengan lancar',
              ],
            },
            {
              title: 'Orientasi Pelanggan (7.5 pts)',
              description: '',
              items: [
                'Utamakan keperluan pelanggan berbanding membuat jualan',
                'Dengar secara aktif kebimbangan dan soalan pelanggan',
                'Fokus pada mencari penyelesaian yang tepat untuk situasi khusus mereka',
                'Tanya soalan untuk memahami keadaan perjalanan mereka',
                'Tunjukkan kepedulian yang tulen terhadap kepuasan pelanggan',
              ],
            },
          ],
        },
        {
          title: 'Kemahiran Pengetahuan (30 mata)',
          details: [
            'Untuk mendapat markah penuh pada Kemahiran Pengetahuan, anda mesti cemerlang dalam mengumpul maklumat, menyelesaikan masalah, dan menutup jualan:',
          ],
          subCriteria: [
            {
              title: 'Pencarian Fakta (10 pts)',
              description: '',
              items: [
                'Tanya tentang destinasi perjalanan untuk mengesyorkan kawasan perlindungan yang tepat (A/B/C)',
                'Kumpul maklumat tempoh perjalanan dan tarikh berlepas',
                'Fahami kekerapan perjalanan untuk mencadangkan Perjalanan Tunggal vs Pelan Tahunan',
                'Tanya tentang bilangan dan umur pengembara',
                'Tanya tentang aktiviti yang dirancang (sukan lasak, aktiviti air)',
                'Semak perlindungan sedia ada (insurans kad kredit, insurans kesihatan)',
                'Fahami pertimbangan bajet dan kebimbangan khas',
              ],
            },
            {
              title: 'Penyelesaian Masalah (10 pts)',
              description: '',
              items: [
                'Kenal pasti jurang dalam perlindungan perjalanan semasa pelanggan',
                'Tangani risiko perjalanan khusus untuk destinasi mereka',
                'Cari penyelesaian untuk kekangan bajet',
                'Selesaikan soalan perlindungan dan bantahan dengan berkesan',
                'Syorkan peringkat pelan yang sesuai berdasarkan keperluan',
                'Tangani senario kompleks (berbilang destinasi, keluarga dengan keperluan berbeza)',
              ],
            },
            {
              title: 'Kemahiran Jualan & Rundingan (10 pts)',
              description: '',
              items: [
                'Pandu pelanggan ke arah keputusan dengan penutupan berasaskan pilihan',
                'Cipta keperluan mendesak yang sesuai (tarikh akhir tempahan, tarikh mula perlindungan)',
                'Tangani bantahan harga dengan menunjukkan nilai',
                'Rundingan peringkat pelan berdasarkan keperluan vs bajet',
                'Gunakan penutupan percubaan untuk menguji kesediaan',
                'Kekalkan keyakinan apabila menghadapi pelanggan yang berpengetahuan',
                'Tutup jualan dengan yakin',
              ],
            },
          ],
        },
        {
          title: 'Pengetahuan Produk (40 mata)',
          details: [
            'Untuk mendapat markah penuh pada Pengetahuan Produk, anda mesti menunjukkan pemahaman menyeluruh tentang TravelEasy dan memberikan penyelesaian yang sejajar dengan profil pelanggan:',
          ],
          subCriteria: [
            {
              title: 'Pembentangan Produk (40 pts)',
              description: '',
              items: [
                'Terangkan peringkat pelan (Standard, Elite, Premier) dan perbezaan utama mereka',
                'Gambarkan kawasan perlindungan (Kawasan A: ASEAN, Kawasan B: Asia-Pasifik, Kawasan C: Seluruh Dunia)',
                'Bentangkan jenis perjalanan (Perjalanan Pergi Balik Tunggal sehingga 182 hari vs Pelan Tahunan)',
                'Tonjolkan manfaat utama: perlindungan COVID-19 sehingga $750,000, kesulitan perjalanan sehingga $12,500',
                'Terangkan perlindungan perubatan: perbelanjaan perubatan luar negara dan pemindahan kecemasan sehingga $1,000,000',
                'Tangani bagaimana TravelEasy berbanding dengan insurans kad kredit dan kesihatan',
                'Sesuaikan pembentangan dengan profil dan keperluan perjalanan khusus pelanggan',
                'Berikan pengiraan premium yang jelas berdasarkan destinasi, peringkat, dan tempoh',
              ],
            },
          ],
        },
      ],
    },
  },
};

const msigProductPositioningDentiplusStanding: StandingConfiguration = {
  base: {
    friendlyId: 'msig-dentiplus-v1',
    company: new Types.ObjectId(MSIG_COMPANY_ID),
    module: 'product-positioning',
    product: 'dentiplus',
    assessmentType: 'msig-3f',
    type: 'score-based',
    tiers: [
      {
        level: 1,
        scoreRange: 'Score: 0-39',
        criteria: [], // Empty for score-based standings
      },
      {
        level: 2,
        scoreRange: 'Score: 40-59',
        criteria: [],
      },
      {
        level: 3,
        scoreRange: 'Score: 60-79',
        criteria: [],
      },
      {
        level: 4,
        scoreRange: 'Score: 80-100',
        criteria: [],
      },
    ],
    // Shared criteria for all tiers - these don't affect evaluation, just display
    sharedCriteria: [],
  },
  localized: {
    en: {
      name: 'MSIG Sales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Score: 0-39',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Score: 40-59',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Score: 60-79',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Score: 80-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Sales technique (3F Framework)',
          details: [
            'To earn full score for Sales Technique, you must demonstrate mastery of the 3F framework by doing the following:',
          ],
          subCriteria: [
            {
              title: 'Feel',
              description: '',
              items: [
                "Actively listen and acknowledge the customer's emotions and concerns.",
                "Use empathetic language that reflects the customer's perspective.",
                "Validate the customer's feelings without minimizing or dismissing them.",
                "Show genuine care for the customer's situation and challenges.",
                "Ask clarifying questions to deepen understanding of the customer's emotional state.",
              ],
            },
            {
              title: 'Felt',
              description: '',
              items: [
                'Share relevant, relatable examples or stories of others in similar situations.',
                "Ensure examples are credible and applicable to the customer's circumstances.",
                'Build trust by explaining how they or others have helped with comparable challenges.',
                'Use appropriate social proof (testimonials, outcomes, data) to normalize concerns.',
                'Create connection through shared experiences or common ground.',
              ],
            },
            {
              title: 'Found',
              description: '',
              items: [
                'Present clear solutions that directly address concerns surfaced in Feel and Felt.',
                'Explain positive outcomes and benefits others achieved with the proposed solution.',
                'Support recommendations with specific results or evidence to build confidence.',
                "Make the solution feel achievable and relevant to the customer's situation.",
                'Provide clear, logical next steps that move the conversation forward.',
              ],
            },
          ],
        },
        {
          title: 'Product Knowledge',
          details: [
            'To earn full credit for Product Knowledge, you must demonstrate deep product understanding and the ability to differentiate against competitors.',
          ],
          subCriteria: [
            {
              title: 'Product Pitch',
              description: '',
              items: [
                'Demonstrate clear understanding of product features, benefits, and value proposition.',
                "Explain how features solve the customer's problems.",
                'Communicate product advantages clearly and concisely.',
                "Tailor product information to the customer's needs and context.",
                'Present accurate product information.',
              ],
            },
            {
              title: 'Competitor Differentiation',
              description: '',
              items: [
                'Demonstrate knowledge of the competitive landscape relevant to the scenario.',
                'Position product advantages against competitors with concrete examples.',
                'Handle competitive objections or direct comparisons effectively.',
                "Articulate the product's unique value proposition and why it matters to the customer.",
              ],
            },
          ],
        },
      ],
    },
    ceb: {
      name: 'MSIG Sales Standing',
      type: 'score-based',
      tiers: [
        {
          name: 'Sales Novice',
          scoreRange: 'Puntos: 0-39',
          criteria: [],
        },
        {
          name: 'Emerging Seller',
          scoreRange: 'Puntos: 40-59',
          criteria: [],
        },
        {
          name: 'Skilled Advisor',
          scoreRange: 'Puntos: 60-79',
          criteria: [],
        },
        {
          name: 'Strategic Consultant',
          scoreRange: 'Puntos: 80-100',
          criteria: [],
        },
      ],
      sharedCriteria: [
        {
          title: 'Sales technique (3F Framework)',
          details: [
            'Aron makakuha ug bug-os nga puntos sa Sales Technique, kinahanglan nimo ipakita ang kahanas sa 3F framework pinaagi sa paghimo sa mosunod:',
          ],
          subCriteria: [
            {
              title: 'Feel',
              description: '',
              items: [
                'Aktibong paminaw ug dawata ang mga emosyon ug kabalaka sa kostumer.',
                'Gamita ang empatiko nga pinulongan nga nagpakita sa panglantaw sa kostumer.',
                'Balido ang mga pagbati sa kostumer nga walay pagkunhod o pagpasagad niini.',
                'Ipakita ang tinuod nga kabalaka sa sitwasyon ug mga hagit sa kostumer.',
                'Mangutana ug mga pangutana sa pag-atin-aw aron mas masabtan ang emosyonal nga kahimtang sa kostumer.',
              ],
            },
            {
              title: 'Felt',
              description: '',
              items: [
                'Ipaambit ang may kalabutan, relatable nga mga panig-ingnan o istorya sa uban nga anaa sa samang sitwasyon.',
                'Siguroha nga ang mga panig-ingnan kasaligan ug magamit sa mga kahimtang sa kostumer.',
                'Pagtukod ug pagsalig pinaagi sa pagpatin-aw kon giunsa nila o sa uban ang pagtabang sa managsama nga mga hagit.',
                'Gamita ang angay nga social proof (mga testimonial, resulta, datos) aron ma-normalize ang mga kabalaka.',
                'Paghimo ug koneksyon pinaagi sa gipaambit nga mga kasinatian o kasagaran nga yuta.',
              ],
            },
            {
              title: 'Found',
              description: '',
              items: [
                'Ipresentar ang tin-aw nga mga solusyon nga direktang nagtubag sa mga kabalaka nga gibangon sa Feel ug Felt.',
                'Ipasabut ang positibo nga mga resulta ug benepisyo nga nakuha sa uban sa gisugyot nga solusyon.',
                'Suportahi ang mga rekomendasyon sa piho nga mga resulta o ebidensya aron mapalig-on ang pagsalig.',
                'Himoa nga ang solusyon makab-ot ug may kalabutan sa sitwasyon sa kostumer.',
                'Paghatag ug tin-aw, lohikal nga sunod nga mga lakang nga magdala sa pag-uusap sa unahan.',
              ],
            },
          ],
        },
        {
          title: 'Kahibalo sa Produkto',
          details: [
            'Aron makakuha ug bug-os nga kredito sa Kahibalo sa Produkto, kinahanglan nimo ipakita ang lawom nga pagsabut sa produkto ug abilidad sa pagkalahi batok sa mga kakompetensya.',
          ],
          subCriteria: [
            {
              title: 'Product Pitch',
              description: '',
              items: [
                'Ipakita ang tin-aw nga pagsabut sa mga feature, benepisyo, ug value proposition sa produkto.',
                'Ipasabut kon giunsa ang mga feature nagsulbad sa mga problema sa kostumer.',
                'Ipahibalo ang mga bentaha sa produkto nga tin-aw ug mubo.',
                'Ipahiangay ang impormasyon sa produkto sa mga panginahanglan ug konteksto sa kostumer.',
                'Ipresentar ang tukma nga impormasyon sa produkto.',
              ],
            },
            {
              title: 'Competitor Differentiation',
              description: '',
              items: [
                'Ipakita ang kahibalo sa competitive landscape nga may kalabutan sa senaryo.',
                'Iposisyon ang mga bentaha sa produkto batok sa mga kakompetensya gamit ang kongkreto nga mga panig-ingnan.',
                'Hawakan ang competitive objections o direktang pagtandi nga epektibo.',
                'Ipahayag ang talagsaon nga value proposition sa produkto ug nganong importante kini sa kostumer.',
              ],
            },
          ],
        },
      ],
    },
  },
};

export const msigStandings = [
  msigTelesalesStanding,
  msigTelesalesDentiplusStanding,
  msigTelesalesTravelEasyStanding,
  msigAgencysalesTravelEasyStanding,
  msigProductPositioningDentiplusStanding,
];
