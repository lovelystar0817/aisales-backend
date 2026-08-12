import { ProductConfiguration } from './types.js';

/**
 * Manulife GoalReady - Smart and affordable life and savings plan
 * Combining insurance protection with investment benefits
 */
export const manulifeGoalReadyConfiguration: ProductConfiguration = {
  base: {
    id: 'manulife-goalready',
    friendlyId: 'manulife-goalready',
    category: 'insurance',
  },

  localized: {
    // English (Original)
    en: {
      name: 'GoalReady',
      keyFeatures: [
        'Smart and affordable life and savings plan combining insurance protection with investment benefits',
        'Life insurance coverage until age 99 or until fund value is depleted',
        'Long-term loyalty bonus: 1.75% of fund value from years 6-10, 0.75% from year 11 onwards',
        'Flexible goal-based payment duration: 5 years or longer',
        'Wide range of high-performing global and local funds (Fixed Income, Multi-Asset, Equity)',
        'Two death benefit options: Face Plus (protection-focused) and Level Face (savings-focused)',
        'Customizable face amount multipliers from 5x to 60x based on age',
        'Life Event Benefit: increase coverage by 20% (up to PHP 1M) during major life events without medical exam',
        "Packaged riders: Accidental Death Benefit, Total Disability Waiver, Payor's Benefit",
        'Optional riders: Maccimax Plans, Term Rider, Hospital Income Benefit',
        'Fund switching flexibility with minimum 20% allocation per fund',
        'Suggested fund allocations based on risk profile (High/Medium/Low)',
        'Minimum annual premium: PHP 60,000 (5-Pay) or PHP 24,000 (Regular Pay)',
      ],
      featureHighlight: {
        title:
          'Goal-based wealth accumulation with comprehensive life insurance protection',
        description:
          'Manulife GoalReady is a versatile life and savings plan that combines insurance protection until age 99 with investment growth through expertly managed global and local funds. Build your wealth with long-term loyalty bonuses (1.75% for years 6-10, 0.75% thereafter), flexible premium payment terms, and customizable coverage that adjusts with your life milestones—all designed to help you achieve your financial goals whether for retirement, education, or business expansion.',
      },
      evaluationFocus: [
        '**Product Understanding**: Clear explanation of GoalReady as a combined life insurance and investment product',
        '**Four Key Value Propositions**: Ability to articulate diverse investment options, long-term bonus, flexible payments, and life insurance coverage',
        '**Long-term Bonus Structure**: Correct knowledge of 1.75% bonus (years 6-10) and 0.75% bonus (year 11 onwards) with qualifying conditions',
        '**Death Benefit Options**: Understanding of Face Plus (protection-focused) vs Level Face (savings-focused) and their calculations',
        '**Face Amount Multipliers**: Knowledge of age-based multiplier ranges (5x-60x) and adjustment rules',
        '**Life Event Benefit**: Understanding of 20% coverage increase during major life events without medical exam',
        '**Rider Options**: Knowledge of packaged riders (ADB, TDW, PB) and optional riders (Maccimax, Term, Hospital Income)',
        '**Fund Categories**: Understanding of Fixed Income, Multi-Asset, and Equity funds (both local and global)',
        '**Key Fund Features**: Knowledge of GMAI (diversified multi-asset) and GMLF (global market leaders) characteristics',
        '**Risk-Based Allocations**: Understanding of suggested fund allocations for High/Medium/Low risk profiles',
        '**Premium Requirements**: Correct minimum premiums (PHP 60,000 for 5-Pay, PHP 24,000 for Regular Pay)',
        '**Target Market Alignment**: Appropriate positioning for different customer profiles (Gen Z professionals, Millennials, Gen X)',
        '**Use Case Examples**: Knowledge of Frank, Iris, Dina, and Dan personas and their specific goals',
        '**Investment Flexibility**: Understanding of fund switching, top-ups, and minimum 20% allocation per fund',
        '**Coverage Flexibility**: Knowledge of multiplier adjustments (within 6 months, after 5 years, before age 70)',
        '**Risk Disclosures**: Clear communication that earnings are not assured and principal is at risk',
        '**Cost of Insurance Impact**: Understanding that higher multipliers increase COI charges and decrease Account Value',
        '**Policy Termination**: Knowledge that coverage ends at age 99 or fund value depletion',
        '**Competitive Positioning**: Ability to explain advantages over traditional savings or pure investment products',
        "**Assessment Distinction**: Distinction between general improvement areas ('warning') and factual errors about GoalReady ('error')",
      ],
    },

    // Tagalog (Filipino)
    tl: {
      name: 'GoalReady',
      keyFeatures: [
        'Matalinong at abot-kayang plano sa buhay at ipon na pinagsasama ang proteksyon sa insurance at mga benepisyo sa pamumuhunan',
        'Saklaw ng life insurance hanggang edad 99 o hanggang maubos ang halaga ng pondo',
        'Long-term loyalty bonus: 1.75% ng halaga ng pondo mula taon 6-10, 0.75% mula taon 11 pataas',
        'Flexible na goal-based na tagal ng pagbabayad: 5 taon o mas matagal',
        'Malawak na hanay ng mataas na performance na global at lokal na mga pondo (Fixed Income, Multi-Asset, Equity)',
        'Dalawang opsyon sa death benefit: Face Plus (nakatuon sa proteksyon) at Level Face (nakatuon sa ipon)',
        'Customizable na face amount multipliers mula 5x hanggang 60x batay sa edad',
        'Life Event Benefit: dagdagan ang coverage ng 20% (hanggang PHP 1M) sa mahahalagang kaganapan sa buhay nang walang medical exam',
        "Kasamang mga rider: Accidental Death Benefit, Total Disability Waiver, Payor's Benefit",
        'Opsyonal na mga rider: Maccimax Plans, Term Rider, Hospital Income Benefit',
        'Flexibility sa pagpapalit ng pondo na may minimum na 20% allocation bawat pondo',
        'Inirerekomendang mga allocation ng pondo batay sa risk profile (Mataas/Katamtaman/Mababa)',
        'Minimum na taunang premium: PHP 60,000 (5-Pay) o PHP 24,000 (Regular Pay)',
      ],
      featureHighlight: {
        title:
          'Pagtipong yaman batay sa layunin na may komprehensibong proteksyon sa buhay',
        description:
          'Ang Manulife GoalReady ay isang versatile na plano sa buhay at ipon na pinagsasama ang proteksyon sa insurance hanggang edad 99 sa paglaki ng investment sa pamamagitan ng mga dalubhasang pinamamahalaang global at lokal na pondo. Palakasin ang iyong yaman gamit ang long-term loyalty bonuses (1.75% para sa taon 6-10, 0.75% pagkatapos), flexible na mga tuntunin sa pagbabayad ng premium, at customizable na coverage na umaangkop sa iyong mga milestone sa buhay—lahat ay dinisenyo upang tulungan kang makamit ang iyong mga layuning pinansyal maging para sa retirement, edukasyon, o pagpapalaki ng negosyo.',
      },
      evaluationFocus: [
        '**Pag-unawa sa Produkto**: Malinaw na paliwanag ng GoalReady bilang pinagsama ng life insurance at investment product',
        '**Apat na Pangunahing Value Propositions**: Kakayahang ipaliwanag ang iba-ibang investment options, long-term bonus, flexible payments, at life insurance coverage',
        '**Long-term Bonus Structure**: Tamang kaalaman sa 1.75% bonus (taon 6-10) at 0.75% bonus (taon 11 pataas) kasama ang qualifying conditions',
        '**Death Benefit Options**: Pag-unawa sa Face Plus (nakatuon sa proteksyon) vs Level Face (nakatuon sa ipon) at ang kanilang mga kalkulasyon',
        '**Face Amount Multipliers**: Kaalaman sa age-based multiplier ranges (5x-60x) at adjustment rules',
        '**Life Event Benefit**: Pag-unawa sa 20% coverage increase sa mahahalagang kaganapan sa buhay nang walang medical exam',
        '**Rider Options**: Kaalaman sa packaged riders (ADB, TDW, PB) at optional riders (Maccimax, Term, Hospital Income)',
        '**Fund Categories**: Pag-unawa sa Fixed Income, Multi-Asset, at Equity funds (lokal at global)',
        '**Key Fund Features**: Kaalaman sa GMAI (diversified multi-asset) at GMLF (global market leaders) characteristics',
        '**Risk-Based Allocations**: Pag-unawa sa inirerekomendang fund allocations para sa Mataas/Katamtaman/Mababang risk profiles',
        '**Premium Requirements**: Tamang minimum premiums (PHP 60,000 para sa 5-Pay, PHP 24,000 para sa Regular Pay)',
        '**Target Market Alignment**: Angkop na positioning para sa iba-ibang customer profiles (Gen Z professionals, Millennials, Gen X)',
        '**Use Case Examples**: Kaalaman sa Frank, Iris, Dina, at Dan personas at ang kanilang mga tiyak na layunin',
        '**Investment Flexibility**: Pag-unawa sa fund switching, top-ups, at minimum 20% allocation bawat pondo',
        '**Coverage Flexibility**: Kaalaman sa multiplier adjustments (sa loob ng 6 buwan, pagkatapos ng 5 taon, bago ang edad 70)',
        '**Risk Disclosures**: Malinaw na komunikasyon na ang kita ay hindi garantisado at ang principal ay may panganib',
        '**Cost of Insurance Impact**: Pag-unawa na ang mas mataas na multipliers ay nagpapataas ng COI charges at nagpapababa ng Account Value',
        '**Policy Termination**: Kaalaman na ang coverage ay nagtatapos sa edad 99 o pagkaubos ng fund value',
        '**Competitive Positioning**: Kakayahang ipaliwanag ang mga pakinabang kumpara sa tradisyonal na savings o purong investment products',
        "**Assessment Distinction**: Pagkakaiba sa pagitan ng pangkalahatang mga lugar ng pagpapabuti ('warning') at factual errors tungkol sa GoalReady ('error')",
      ],
    },

    // Cebuano
    ceb: {
      name: 'GoalReady',
      keyFeatures: [
        'Maalamon ug barato nga plano sa kinabuhi ug tigum nga naghiusa sa proteksyon sa insurance ug mga benepisyo sa pagpuhunan',
        'Saklaw sa life insurance hangtod edad 99 o hangtod maubos ang bili sa pondo',
        'Long-term loyalty bonus: 1.75% sa bili sa pondo gikan tuig 6-10, 0.75% gikan tuig 11 pataas',
        'Flexible nga goal-based nga gidugayon sa pagbayad: 5 ka tuig o mas taas pa',
        'Daghang klase sa taas nga performance nga global ug lokal nga mga pondo (Fixed Income, Multi-Asset, Equity)',
        'Duha ka opsyon sa death benefit: Face Plus (nakapokus sa proteksyon) ug Level Face (nakapokus sa tigum)',
        'Customizable nga face amount multipliers gikan 5x hangtod 60x base sa edad',
        'Life Event Benefit: dugangan ang coverage og 20% (hangtod PHP 1M) sa importanteng mga panghitabo sa kinabuhi walay medical exam',
        "Kasamang mga rider: Accidental Death Benefit, Total Disability Waiver, Payor's Benefit",
        'Opsyonal nga mga rider: Maccimax Plans, Term Rider, Hospital Income Benefit',
        'Flexibility sa pagbag-o sa pondo nga adunay minimum nga 20% allocation kada pondo',
        'Girekomendar nga mga allocation sa pondo base sa risk profile (Taas/Tunga/Ubos)',
        'Minimum nga tinuig nga premium: PHP 60,000 (5-Pay) o PHP 24,000 (Regular Pay)',
      ],
      featureHighlight: {
        title:
          'Pagtigum sa bahandi base sa tumong nga adunay komprehensibo nga proteksyon sa kinabuhi',
        description:
          'Ang Manulife GoalReady usa ka versatile nga plano sa kinabuhi ug tigum nga naghiusa sa proteksyon sa insurance hangtod edad 99 sa pagtubo sa investment pinaagi sa eksperto nga gipangdumala nga global ug lokal nga mga pondo. Palig-ona ang imong bahandi gamit ang long-term loyalty bonuses (1.75% para sa tuig 6-10, 0.75% pagkahuman), flexible nga mga termino sa pagbayad sa premium, ug customizable nga coverage nga mopahiangay sa imong mga milestone sa kinabuhi—tanan gidesinyo aron makatabang kanimo nga makab-ot ang imong mga tumong sa pinansyal bisan para sa retirement, edukasyon, o pagpadako sa negosyo.',
      },
      evaluationFocus: [
        '**Pagsabot sa Produkto**: Tin-aw nga pagpatin-aw sa GoalReady isip gihiusa nga life insurance ug investment product',
        '**Upat ka Importanteng Value Propositions**: Abilidad sa pagpatin-aw sa lain-laing investment options, long-term bonus, flexible payments, ug life insurance coverage',
        '**Long-term Bonus Structure**: Hustong kahibalo sa 1.75% bonus (tuig 6-10) ug 0.75% bonus (tuig 11 pataas) uban sa qualifying conditions',
        '**Death Benefit Options**: Pagsabot sa Face Plus (nakapokus sa proteksyon) vs Level Face (nakapokus sa tigum) ug ang ilang mga kalkulasyon',
        '**Face Amount Multipliers**: Kahibalo sa age-based multiplier ranges (5x-60x) ug adjustment rules',
        '**Life Event Benefit**: Pagsabot sa 20% coverage increase sa importanteng mga panghitabo sa kinabuhi walay medical exam',
        '**Rider Options**: Kahibalo sa packaged riders (ADB, TDW, PB) ug optional riders (Maccimax, Term, Hospital Income)',
        '**Fund Categories**: Pagsabot sa Fixed Income, Multi-Asset, ug Equity funds (lokal ug global)',
        '**Key Fund Features**: Kahibalo sa GMAI (diversified multi-asset) ug GMLF (global market leaders) characteristics',
        '**Risk-Based Allocations**: Pagsabot sa girekomendar nga fund allocations para sa Taas/Tunga/Ubos nga risk profiles',
        '**Premium Requirements**: Hustong minimum premiums (PHP 60,000 para sa 5-Pay, PHP 24,000 para sa Regular Pay)',
        '**Target Market Alignment**: Angay nga positioning para sa lain-laing customer profiles (Gen Z professionals, Millennials, Gen X)',
        '**Use Case Examples**: Kahibalo sa Frank, Iris, Dina, ug Dan personas ug ang ilang piho nga mga tumong',
        '**Investment Flexibility**: Pagsabot sa fund switching, top-ups, ug minimum 20% allocation kada pondo',
        '**Coverage Flexibility**: Kahibalo sa multiplier adjustments (sulod sa 6 ka bulan, pagkahuman sa 5 ka tuig, sa wala pa ang edad 70)',
        '**Risk Disclosures**: Tin-aw nga komunikasyon nga ang kita dili garantisado ug ang principal adunay peligro',
        '**Cost of Insurance Impact**: Pagsabot nga ang mas taas nga multipliers nagpataas sa COI charges ug nagpaubos sa Account Value',
        '**Policy Termination**: Kahibalo nga ang coverage matapos sa edad 99 o pagkaubos sa fund value',
        '**Competitive Positioning**: Abilidad sa pagpatin-aw sa mga bentaha kumpara sa tradisyonal nga savings o purong investment products',
        "**Assessment Distinction**: Kalainan tali sa kinatibuk-ang mga lugar sa pagpauswag ('warning') ug factual errors bahin sa GoalReady ('error')",
      ],
    },
  },
};
