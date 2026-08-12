/**
 * MSIG Product-based objections for randomization
 * Each product type has its own pool of objections
 * - 1 primary objection is randomly selected per roleplay
 * - 3-4 mini objections are randomly selected from the remaining pool
 *
 * Note: DentiPlus uses the persona's mainObjection directly (not randomized)
 */

export type MSIGProductType = 'parecovery-plus' | 'travel-easy';

export interface MSIGObjection {
  en: string;
}

export interface MSIGProductObjections {
  objections: MSIGObjection[];
}

export const MSIG_PRODUCT_OBJECTIONS: Record<
  MSIGProductType,
  MSIGProductObjections
> = {
  'parecovery-plus': {
    objections: [
      {
        en: 'I already have health insurance, why do I need personal accident coverage?',
      },
      {
        en: "I'm careful and rarely have accidents. I don't think I need this.",
      },
      {
        en: 'The premium seems expensive for something I might never use.',
      },
      {
        en: "I'm not sure what personal accident insurance actually covers.",
      },
      {
        en: 'My company already provides some accident coverage as part of my benefits.',
      },
      {
        en: "I'd rather save the money and pay out of pocket if something happens.",
      },
      {
        en: 'Can I just get the basic plan? The higher tiers seem unnecessary.',
      },
      {
        en: "I don't understand the difference between the Silver, Gold, and Platinum plans.",
      },
      {
        en: 'What if I need to make a claim? Is the process complicated?',
      },
      {
        en: "I've heard insurance claims are often rejected. How do I know this won't happen to me?",
      },
      {
        en: 'I need to think about it and discuss with my spouse first.',
      },
      {
        en: 'Is this really worth it compared to just having savings for emergencies?',
      },
      {
        en: "I'm young and healthy, I don't think I need accident insurance right now.",
      },
      {
        en: 'What happens if I change jobs? Can I keep this coverage?',
      },
      {
        en: 'Are there any waiting periods before I can make a claim?',
      },
    ],
  },

  'travel-easy': {
    objections: [
      {
        en: 'My credit card already includes travel insurance, why would I need more?',
      },
      {
        en: 'I only travel occasionally, is it worth getting insurance each time?',
      },
      {
        en: 'Travel insurance seems like an unnecessary expense on top of my trip costs.',
      },
      {
        en: "I've travelled many times without insurance and nothing has happened.",
      },
      {
        en: "What's the difference between your plan and what airlines offer?",
      },
      {
        en: "Is COVID-19 really covered? I've heard some policies have exclusions.",
      },
      {
        en: 'The claim process sounds complicated. What if something happens overseas?',
      },
      {
        en: "I'm just going for a short trip, do I really need coverage?",
      },
      {
        en: 'Can I buy this closer to my departure date instead of now?',
      },
      {
        en: "I'm not sure which plan tier is right for me.",
      },
      {
        en: 'What if my trip gets cancelled? Will I get a refund on the insurance too?',
      },
      {
        en: "I'm travelling with family, is it cheaper to get individual or family coverage?",
      },
      {
        en: "Does this cover adventure activities? I'm planning to do some hiking.",
      },
      {
        en: "I've had bad experiences with insurance claims before. How is yours different?",
      },
      {
        en: 'Let me compare with other providers first before deciding.',
      },
    ],
  },
};

/**
 * Get objections for a specific MSIG product
 */
export function getMSIGObjectionsForProduct(
  productFriendlyId: string,
): MSIGProductObjections | null {
  if (productFriendlyId in MSIG_PRODUCT_OBJECTIONS) {
    return MSIG_PRODUCT_OBJECTIONS[productFriendlyId as MSIGProductType];
  }
  return null;
}

/**
 * Randomly select 1 primary objection and 3-4 mini objections
 * Returns a flat array where:
 * - index 0 = primary objection
 * - indices 1-4 = mini objections
 * Returns null if the product type is not supported
 */
export function selectRandomMSIGObjections(
  productFriendlyId: string,
): string[] | null {
  const productObjections = getMSIGObjectionsForProduct(productFriendlyId);
  if (!productObjections || productObjections.objections.length < 2) {
    return null;
  }

  const objections = productObjections.objections;

  // Shuffle the objections array
  const shuffled = [...objections].sort(() => Math.random() - 0.5);

  // Select 1 primary + 3-4 mini objections (total 4-5)
  const numMiniObjections = Math.min(
    3 + Math.floor(Math.random() * 2), // 3 or 4
    shuffled.length - 1,
  );

  const totalToSelect = 1 + numMiniObjections; // 1 primary + 3-4 mini

  // Return flat array: [primary, mini1, mini2, mini3, (mini4)]
  return shuffled.slice(0, totalToSelect).map((obj) => obj.en);
}
