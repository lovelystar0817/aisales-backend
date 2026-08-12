import { FrameworkConfiguration } from './types.js';

/**
 * Prudential PH Closing Call Framework
 * Scenario 3: Close Call (in-person meeting)
 * Evaluates objection handling, urgency creation, and closing technique
 *
 * Assessment Split:
 * - 40 points: Objection Handling
 * - 30 points: Urgency Creation
 * - 30 points: Closing Technique
 * Total: 100 points
 */
export const prudentialPhClosingCallConfiguration: FrameworkConfiguration = {
  base: {
    id: 'prudential-ph-closing-call',
    friendlyId: 'prudential-ph-closing-call',
    type: 'list',
  },

  localized: {
    en: {
      title: 'Close Call',
      description:
        'Evaluation framework for the in-person closing call with Pru Life UK prospects. Assesses objection handling, urgency creation, and closing technique.',
      parts: [
        {
          title: 'Objection Handling',
          description: 'Evaluates the ability to address prospect objections with evidence-based responses tied to specific product features.',
          items: [
            'Evidence-based resolution with specific product features tied to concern',
            'Clearly positions unique advantages using specific product features',
            'Demonstrates knowledge of market alternatives without denigrating competitors',
            'Converts features to quantified value with precision',
          ],
        },
        {
          title: 'Urgency Creation',
          description: 'Evaluates the ability to create appropriate urgency using investment horizon logic without fear-mongering.',
          items: [
            'Creates appropriate urgency without fear-mongering',
            'Uses investment horizon logic',
            'Ties to prospect\'s specific goals whilst creating vivid mental pictures',
          ],
        },
        {
          title: 'Closing Technique',
          description: 'Evaluates the ability to gauge buying signals and secure commitment through strategic trial closes.',
          items: [
            'Open-ended questions that gauge commitment',
            'Recognizes verbal and non-verbal buying signals; doesn\'t rush disinterested prospects',
            'Secures specific commitment with multiple strategic trial closes throughout',
          ],
        },
      ],
    },
    tl: {
      title: 'Close Call',
      description:
        'Framework ng pagtatasa para sa in-person closing call sa mga prospect ng Pru Life UK. Sinusukat ang objection handling, urgency creation, at closing technique.',
      parts: [
        {
          title: 'Objection Handling',
          description: 'Sinusukat ang kakayahang tugunan ang mga objection ng prospect gamit ang evidence-based na mga sagot na nakakonekta sa mga specific na feature ng produkto.',
          items: [
            'Evidence-based na resolusyon gamit ang mga specific na feature ng produkto na nakatuon sa alalahanin',
            'Malinaw na nagpoposisyon ng natatanging mga kalamangan gamit ang mga specific na feature ng produkto',
            'Nagpapakita ng kaalaman sa mga alternatibo sa merkado nang hindi ninegatibo ang mga kakumpitensya',
            'Kino-convert ang mga feature sa quantified na halaga nang may katumpakan',
          ],
        },
        {
          title: 'Urgency Creation',
          description: 'Sinusukat ang kakayahang lumikha ng angkop na urgency gamit ang investment horizon logic nang walang fear-mongering.',
          items: [
            'Lumilikha ng angkop na urgency nang walang fear-mongering',
            'Gumagamit ng investment horizon logic',
            'Iniuugnay sa mga specific na layunin ng prospect habang lumilikha ng malinaw na mental picture',
          ],
        },
        {
          title: 'Closing Technique',
          description: 'Sinusukat ang kakayahang matukoy ang mga buying signal at ma-secure ang commitment sa pamamagitan ng strategic trial closes.',
          items: [
            'Mga open-ended na tanong na sumusukat ng commitment',
            'Kinikilala ang verbal at non-verbal na buying signals; hindi nagmamadali sa mga disinterested na prospect',
            'Nag-se-secure ng specific na commitment gamit ang maraming strategic trial closes sa buong conversation',
          ],
        },
      ],
    },
  },
};
