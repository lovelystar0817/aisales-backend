import { FrameworkConfiguration } from './types.js';

/**
 * Prudential PH Fact Finding Framework
 * Scenario 2: Fact Finding + Product Pitch
 * Used for evaluating fact-finding conversations with product pitch for Pru Life UK prospects
 *
 * Assessment Split:
 * - 100 points: Fact Finding (SPIN methodology)
 * - 100 points: Product Knowledge (FAB framework)
 * Both normalized to /100 for display (50/50 weighting)
 */
export const prudentialPhFactFindingConfiguration: FrameworkConfiguration = {
  base: {
    id: 'prudential-ph-fact-finding',
    friendlyId: 'prudential-ph-fact-finding',
    type: 'list',
  },

  localized: {
    en: {
      title: 'Product Pitch',
      description:
        'Evaluation framework for fact-finding conversations and product pitch with Pru Life UK prospects. Assesses SPIN methodology (50%) and product knowledge (50%).',
      parts: [
        {
          title: 'Fact Finding (SPIN Methodology)',
          description:
            'Evaluates the ability to uncover prospect needs using SPIN questioning technique: Situation, Problem, Implication, and Need-Payoff questions.',
          items: [
            "Situation Questions (25 pts): Ask about current situation, background, and context to understand the prospect's life stage, family situation, occupation, and existing financial arrangements",
            'Problem Questions (25 pts): Identify difficulties, dissatisfactions, or gaps in current situation related to financial protection, insurance coverage, or future planning',
            'Implication Questions (25 pts): Explore consequences and impact of identified problems - what happens if the problem is not solved, risks to family or financial security',
            'Need-Payoff Questions (25 pts): Help prospect articulate value of solving the problem - benefits of having proper coverage, impact on family security, peace of mind',
          ],
        },
        {
          title: 'Product Knowledge',
          description: 'Product pitch',
          items: [
            'Demonstrate clear understanding of product features, benefits, and value proposition.',
            "Explain how features solve the customer's problems.",
            'Communicate product advantages clearly and concisely.',
            "Tailor product information to the customer's needs and context.",
            'Present accurate product information.',
          ],
        },
      ],
    },
    tl: {
      title: 'Product Pitch',
      description:
        'Framework ng pagtatasa para sa fact-finding conversations at product pitch sa mga prospect ng Pru Life UK. Sinusukat ang SPIN methodology (50%) at product knowledge (50%).',
      parts: [
        {
          title: 'Fact Finding (SPIN Methodology)',
          description:
            'Sinusukat ang kakayahang matuklasan ang pangangailangan ng prospect gamit ang SPIN questioning technique: Situation, Problem, Implication, at Need-Payoff questions.',
          items: [
            'Situation Questions (25 pts): Magtanong tungkol sa kasalukuyang sitwasyon, background, at konteksto upang maintindihan ang life stage, family situation, occupation, at existing financial arrangements ng prospect',
            'Problem Questions (25 pts): Tukuyin ang mga kahirapan, dissatisfactions, o gaps sa kasalukuyang sitwasyon na may kaugnayan sa financial protection, insurance coverage, o future planning',
            'Implication Questions (25 pts): Galugarin ang mga consequences at impact ng natukoy na mga problema - ano ang mangyayari kung hindi malulutas ang problema, mga panganib sa pamilya o financial security',
            'Need-Payoff Questions (25 pts): Tulungan ang prospect na maipahayag ang halaga ng paglutas ng problema - mga benepisyo ng pagkakaroon ng tamang coverage, impact sa family security, peace of mind',
          ],
        },
        {
          title: 'Product Knowledge',
          description: 'Product pitch',
          items: [
            'Magpakita ng malinaw na pag-unawa sa mga features, benefits, at value proposition ng produkto.',
            'Ipaliwanag kung paano nalulutas ng mga features ang mga problema ng customer.',
            'Ipahayag ang mga advantages ng produkto nang malinaw at maigsi.',
            'I-angkop ang impormasyon ng produkto sa mga pangangailangan at konteksto ng customer.',
            'Magpresenta ng tumpak na impormasyon ng produkto.',
          ],
        },
      ],
    },
  },
};
