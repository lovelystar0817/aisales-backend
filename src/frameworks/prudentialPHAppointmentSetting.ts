import { FrameworkConfiguration } from './types.js';

/**
 * Prudential PH Appointment Setting Framework
 * Used for evaluating cold-call appointment setting with Pru Life UK prospects
 */
export const prudentialPHAppointmentSettingConfiguration: FrameworkConfiguration =
  {
    base: {
      id: 'prudential-ph-appointment-setting',
      friendlyId: 'prudential-ph-appointment-setting',
      type: 'list',
    },

    localized: {
      en: {
        title: 'Appointment Setting',
        description:
          'Evaluation framework for appointment setting with Pru Life UK prospects.',
        parts: [
          {
            title: 'Client Verification',
            description:
              'Mandatory: Agent must identify themselves and the carrier (Pru Life UK), execute the permission check protocol, and gain prospect permission to continue.',
            items: [
              'Agent must clearly identify themselves and the carrier (Pru Life UK) to satisfy transparency standards',
              'Agent must execute the "Permission Check" protocol ("Is this a convenient time?") to establish a professional standard of care and respect for the prospect\'s time',
              "Successfully gains prospect's permission and attention to continue conversation",
            ],
          },
          // {
          //   title: 'Value Proposition',
          //   description:
          //     "Articulate relevant benefits with social proof and urgency tied to the prospect's life stage.",
          //   items: [
          //     "Clearly articulates specific, relevant benefit tied to prospect's life stage",
          //     'Provides concrete social proof with specificity',
          //     'Crystal clear, time-bounded request with urgency',
          //     "Uses accessible language that's polished",
          //     'Confident delivery; appropriate formality for relationship level',
          //   ],
          // },
          {
            title: 'Objection Handling',
            description:
              'Handle common objections raised by the prospect effectively.',
            items: [
              'Handles NOT INTERESTED / NOT IN THE MARKET objections',
              'Handles NO MONEY / NO NEED objections',
              'Handles CALL ME LATER / WASTING YOUR TIME objections',
              'Handles OBSTINATE OBJECTOR objections',
            ],
          },
        ],
      },
    },
  };
