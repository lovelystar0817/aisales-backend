import { PersonaConfiguration } from '../types.js';
import { ELEVEN_LABS_FEMALE_VOICE_ID } from '../../../utils/constants.js';

/**
 * Juan Maria Peng - Doctor (Patient, Analytical, Value-oriented, Focused, Empathetic)
 * TCM practitioner who recently purchased house in Johor, beginning retirement planning
 */
export const jtuanMariaPengMsigPersona: PersonaConfiguration = {
  base: {
    id: '67f8a1b2c3d4e5f6a7b8c9e0',
    friendlyId: 'jtuan-maria-peng-doctor-analytical',
    name: 'Juan Maria Peng',
    age: 55,
    image:
      'https://dmbxplgo7ci2f.cloudfront.net/682357a367e18980a534d57b/jtuan-maria-peng-9ee5a454.png',
    voiceId: ELEVEN_LABS_FEMALE_VOICE_ID,
    gender: 'female',
    annualIncome: 350000,
  },

  localized: {
    en: {
      occupation: 'Doctor',
      description:
        'TCM Practitioner with Masters of TCM. Just purchased a house in Johore; comfortable with current lifestyle; beginning to save for future retirement.',
      details: {
        location: 'Singapore',
        education: 'Masters of TCM',
        occupation: 'Doctor',
        workHistory: 'TCM PRACTICIONER',
        financialSituation:
          'Just purchased a house in Johore; comfortable with current lifestyle; beginning to save for future retirement.',
        keyPriorities: ['Growing wealth efficiently'],
        productKnowledge:
          'Limited Insurance knowledge; skeptical of insurance (mortgage liability, health insurance).',
        mainObjection: 'To do treatment in Malaysia is much cheaper',
        salesDescription:
          "You'll be speaking with Juan Maria Peng, 55, a Doctor. She prefers to handle dental treatment in Malaysia for better value.",
      },
      personalityDetails: {
        persona: 'Patient, analytical, value-oriented, focused, empathetic',
        communicationStyle: ['Friendly', 'Funny And More Traditional'],
        decisionMaking: ['Looking for cheap price, need convincing story'],
      },
    },
  },
};
