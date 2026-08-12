import { FrameworkConfiguration } from './types.js';

// AXA-PH Recruitment Framework - for unit manager recruitment scenario
export const axaPhRecruitmentConfiguration: FrameworkConfiguration = {
  base: {
    id: 'axa-ph-recruitment-framework',
    friendlyId: 'axa-ph-recruitment',
    type: 'list',
  },

  localized: {
    // English
    en: {
      title: 'AXA-PH Unit Manager Recruitment Framework',
      description:
        'Framework for evaluating soft skills and knowledge skills during unit manager recruitment conversations',
      parts: [
        // Soft Skills Section
        {
          title: 'Soft Skills',
          description:
            'Evaluates interpersonal and communication abilities during recruitment',
          items: [
            'Communication Skills: Clear delivery and respectful communication',
            'Relationship Building: Building and maintaining rapport with the recruit',
            'Adaptability: Flexibility in understanding the concerns of the recruit',
            'Customer Orientation: Providing a clear convincing presentation about the Company',
          ],
        },
        // Knowledge Skills Section
        {
          title: 'Knowledge Skills',
          description:
            'Evaluates business knowledge and problem-solving abilities',
          items: [
            'Fact Finding: Knowledge of basic requirements such as Legal and Compliance',
            'Business Knowledge: Understanding of remuneration, commission, contests, and rewards',
            'Problem-Solving: Ability to identify issues and provide solutions',
            'Sales & Negotiation Skills: Ability to convince and negotiate effectively',
          ],
        },
      ],
    },

    // Tagalog
    tl: {
      title: 'AXA-PH Unit Manager Recruitment Framework',
      description:
        'Framework para sa pagsusuri ng soft skills at knowledge skills sa mga pag-uusap para sa recruitment ng unit manager',
      parts: [
        // Soft Skills Section
        {
          title: 'Soft Skills',
          description:
            'Sinusuri ang mga kakayahan sa interpersonal at komunikasyon sa panahon ng recruitment',
          items: [
            'Communication Skills: Malinaw na paghahatid at magalang na komunikasyon',
            'Relationship Building: Pagbuo at pagpapanatili ng rapport sa recruit',
            'Adaptability: Kakayahang umangkop sa pag-unawa sa mga alalahanin ng recruit',
            'Customer Orientation: Pagbibigay ng malinaw at nakakakumbinsing presentasyon tungkol sa Kompanya',
          ],
        },
        // Knowledge Skills Section
        {
          title: 'Knowledge Skills',
          description:
            'Sinusuri ang kaalaman sa negosyo at kakayahan sa paglutas ng problema',
          items: [
            'Fact Finding: Kaalaman sa mga pangunahing kinakailangan tulad ng Legal at Compliance',
            'Business Knowledge: Pag-unawa sa remuneration, commission, contests, at rewards',
            'Problem-Solving: Kakayahang tukuyin ang mga isyu at magbigay ng solusyon',
            'Sales & Negotiation Skills: Kakayahang kumbinsihin at makipagnegosasyon nang epektibo',
          ],
        },
      ],
    },
  },
};
