import { PersonaConfiguration } from './types.js';

// Individual persona imports
import { marcPersona } from './marc.js';
import { angelinePersona } from './angeline.js';
import { elainePersona } from './elaine.js';
import { gracePersona } from './grace.js';
import { yvonnePersona } from './yvonne.js';
import { amitPersona } from './amit.js';
import { raviPersona } from './ravi.js';
import { michaelPersona } from './michael.js';
import { nataliePersona } from './natalie.js';
import { prakashPersona } from './prakash.js';
import { afiqPersona } from './afiq.js';
import { kevinPersona } from './kevin.js';
import { hafizPersona } from './hafiz.js';
import { marcPhPersona } from './marc-ph.js';
import { angelinePhPersona } from './angeline-ph.js';
import { krisPersona } from './kris.js';
import { andyPersona } from './andy.js';
import { rachelPersona } from './rachel.js';
import { boonPersona } from './boon.js';
import { tutchaiPersona } from './tutchai.js';
import { ruksmeePersona } from './ruksmee.js';
import { khemjiraPersona } from './khemjira.js';
import { kanitPersona } from './kanit.js';
import { chutiPersona } from './chuti.js';
import { danielPersona } from './daniel.js';
import { melissaPersona } from './melissa.js';
import { rohanPersona } from './rohan.js';
import { sophiePersona } from './sophie.js';
import { maiPersona } from './mai.js';
import { napatPersona } from './napat.js';
import { joshuaPersona } from './joshua.js';
import { trinaPersona } from './trina.js';
import { melodyPersona } from './melody.js';
import { brianPersona } from './brian.js';
import { mariePersona } from './marie.js';
import { tsingLuPersona } from './tsing-lu.js';
import { chrisLiPersona } from './chris-li.js';

// MSIG personas
import { amandaLeeMsigPersona } from './msig/amanda-lee.js';
import { markCastilloMsigPersona } from './msig/mark-castillo.js';
import { darylTanMsigPersona } from './msig/daryl-tan.js';
import { karenSeowMsigPersona } from './msig/karen-seow.js';
import { samuelHoMsigPersona } from './msig/samuel-ho.js';
import { stephanieKohMsigPersona } from './msig/stephanie-koh.js';
import { arvindSharmaMsigPersona } from './msig/arvind-sharma.js';
import { melissaTanMsigPersona } from './msig/melissa-tan.js';
import { michelleGohMsigPersona } from './msig/michelle-goh.js';
import { darrenLimMsigPersona } from './msig/darren-lim.js';
import { sophiaClarkeMsigPersona } from './msig/sophia-clarke.js';
import { raymondOngMsigPersona } from './msig/raymond-ong.js';
import { nurHidayahMsigPersona } from './msig/nur-hidayah.js';
import { rohitNarayananMsigPersona } from './msig/rohit-narayanan.js';
import { evelynNgMsigPersona } from './msig/evelyn-ng.js';
import { ahmadFirdausMsigPersona } from './msig/ahmad-firdaus.js';
import { jtuanMariaPengMsigPersona } from './msig/jtuan-maria-peng.js';

// KT AXA WealthPlus Personas
import { thanaPersona } from './kt-axa/wealthplus-closing/thana.js';
import { sirionPersona } from './kt-axa/wealthplus-closing/sirion.js';
import { sajiPersona } from './kt-axa/wealthplus-closing/saji.js';
import { kornPersona } from './kt-axa/wealthplus-closing/korn.js';
import { naruemonPersona } from './kt-axa/wealthplus-closing/naruemon.js';
import { weerawatPersona } from './kt-axa/wealthplus-closing/weerawat.js';

// KT AXA Recruitment Personas
import { joeKtaxaPersona } from './kt-axa/recruitment/joe.js';
import { ployKtaxaPersona } from './kt-axa/recruitment/ploy.js';
import { nichaKtaxaPersona } from './kt-axa/recruitment/nicha.js';
import { kongpopKtaxaPersona } from './kt-axa/recruitment/kongpop.js';
import {
  piyaKtaxaEasyPersona,
  piyaKtaxaMediumPersona,
} from './kt-axa/recruitment/piya.js';
import { supapornKtaxaPersona } from './kt-axa/recruitment/supaporn.js';
import { yingKtaxaPersona } from './kt-axa/recruitment/ying.js';

// KT AXA FNA Personas
import {
  somsakKtaxaFnaEasyPersona,
  somsakKtaxaFnaMediumPersona,
} from './kt-axa/fna/somsak.js';
import {
  mintraKtaxaFnaEasyPersona,
  mintraKtaxaFnaMediumPersona,
} from './kt-axa/fna/mintra.js';
import {
  armKtaxaFnaEasyPersona,
  armKtaxaFnaMediumPersona,
} from './kt-axa/fna/arm.js';
import {
  jintanaKtaxaFnaEasyPersona,
  jintanaKtaxaFnaMediumPersona,
} from './kt-axa/fna/jintana.js';
import {
  manopKtaxaFnaEasyPersona,
  manopKtaxaFnaMediumPersona,
} from './kt-axa/fna/manop.js';

// Prudential PH Appointment Setting Personas
import {
  annaPersona,
  charliePersona,
  johnPersona,
  dannyPersona,
  celiaPersona,
} from './prudential-ph/index.js';
import { ethanKohGreatEasternPersona } from './great-eastern/ethan-koh.js';
import { danielLimGreatEasternPersona } from './great-eastern/daniel-lim.js';
import { clarissaNgGreatEasternPersona } from './great-eastern/clarissa-ng.js';
import { aishaRahmanGreatEasternPersona } from './great-eastern/aisha-rahman.js';
import { aishaRahmanGreatEasternHardPersona } from './great-eastern/aisha-rahman-hard.js';
import { ethanKohGreatEasternHardPersona } from './great-eastern/ethan-koh-hard.js';
import { danielLimGreatEasternHardPersona } from './great-eastern/daniel-lim-hard.js';
import { clarissaNgGreatEasternHardPersona } from './great-eastern/clarissa-ng-hard.js';
import { yvonnePersonaKo } from './aia-ko/yvonne-aia-ko.js';
import { kevinPersonaKo } from './aia-ko/kevin-aia-ko.js';
import { chutiPersonaKo } from './aia-ko/chuti-aia-ko.js';
import { choiSunHoPersonaKo } from './aia-ko/choi-sun-ho-aia-ko.js';
import { kimWooJungPersonaKo } from './aia-ko/kim-woo-jung-aia-ko.js';
import { leeSoonYoungPersonaKo } from './aia-ko/lee-soon-young-aia-ko.js';
import { parkJisooPersonaKo } from './aia-ko/park-jisoo-aia-ko.js';
import { yoonSunheePersonaKo } from './aia-ko/yoon-sunhee-aia-ko.js';
import { kangMiheePersonaKo } from './aia-ko/kang-mihee-aia-ko.js';

// Lalamove personas
import { pitakLalamovePersona } from './lalamove/pitak.js';
import { samsonLalamovePersona } from './lalamove/samson.js';
import { kanchaiLalamovePersona } from './lalamove/kanchai.js';
import { nadateLalamovePersona } from './lalamove/nadate.js';

// All persona configurations
export const ALL_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  marcPersona,
  angelinePersona,
  elainePersona,
  gracePersona,
  yvonnePersona,
  amitPersona,
  raviPersona,
  michaelPersona,
  nataliePersona,
  prakashPersona,
  afiqPersona,
  kevinPersona,
  hafizPersona,
  marcPhPersona,
  angelinePhPersona,
  boonPersona,
  tutchaiPersona,
  ruksmeePersona,
  khemjiraPersona,
  kanitPersona,
  chutiPersona,
  andyPersona,
  rachelPersona,
  danielPersona,
  melissaPersona,
  rohanPersona,
  sophiePersona,
  maiPersona,
  napatPersona,
  joshuaPersona,
  trinaPersona,
  melodyPersona,
  brianPersona,
  mariePersona,
  joeKtaxaPersona,
  ployKtaxaPersona,
  nichaKtaxaPersona,
  kongpopKtaxaPersona,
  piyaKtaxaEasyPersona,
  piyaKtaxaMediumPersona,
  supapornKtaxaPersona,
  yingKtaxaPersona,
  somsakKtaxaFnaEasyPersona,
  somsakKtaxaFnaMediumPersona,
  mintraKtaxaFnaEasyPersona,
  mintraKtaxaFnaMediumPersona,
  armKtaxaFnaEasyPersona,
  armKtaxaFnaMediumPersona,
  jintanaKtaxaFnaEasyPersona,
  jintanaKtaxaFnaMediumPersona,
  manopKtaxaFnaEasyPersona,
  manopKtaxaFnaMediumPersona,
  thanaPersona,
  sirionPersona,
  sajiPersona,
  kornPersona,
  naruemonPersona,
  weerawatPersona,
  tsingLuPersona,
  annaPersona,
  charliePersona,
  johnPersona,
  dannyPersona,
  celiaPersona,
  amandaLeeMsigPersona,
  markCastilloMsigPersona,
  darylTanMsigPersona,
  karenSeowMsigPersona,
  samuelHoMsigPersona,
  stephanieKohMsigPersona,
  arvindSharmaMsigPersona,
  melissaTanMsigPersona,
  michelleGohMsigPersona,
  darrenLimMsigPersona,
  sophiaClarkeMsigPersona,
  raymondOngMsigPersona,
  nurHidayahMsigPersona,
  rohitNarayananMsigPersona,
  evelynNgMsigPersona,
  ahmadFirdausMsigPersona,
  jtuanMariaPengMsigPersona,
  kevinPersonaKo,
  yvonnePersonaKo,
  chutiPersonaKo,
  choiSunHoPersonaKo,
  kimWooJungPersonaKo,
  leeSoonYoungPersonaKo,
  parkJisooPersonaKo,
  yoonSunheePersonaKo,
  kangMiheePersonaKo,
  ethanKohGreatEasternPersona,
  danielLimGreatEasternPersona,
  clarissaNgGreatEasternPersona,
  aishaRahmanGreatEasternPersona,
  aishaRahmanGreatEasternHardPersona,
  ethanKohGreatEasternHardPersona,
  danielLimGreatEasternHardPersona,
  clarissaNgGreatEasternHardPersona,
  chrisLiPersona,
  pitakLalamovePersona,
  samsonLalamovePersona,
  kanchaiLalamovePersona,
  nadateLalamovePersona,
  krisPersona,
];

// Default personas
export const DEFAULT_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  marcPersona,
  angelinePersona,
  elainePersona,
  gracePersona,
  yvonnePersona,
  amitPersona,
  raviPersona,
  michaelPersona,
  nataliePersona,
];

// Grab personas
export const GRAB_MEX_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  andyPersona,
  rachelPersona,
];

export const GRAB_DEFAULT_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  prakashPersona,
  hafizPersona,
];

// Research personas
export const RESEARCH_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  marcPersona,
  angelinePersona,
  elainePersona,
];

// Prudential personas
export const PRU_COLD_CALL_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  angelinePersona,
  elainePersona,
  marcPersona,
  gracePersona,
  yvonnePersona,
];

export const PRU_PLI_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  angelinePersona,
  elainePersona,
  gracePersona,
  yvonnePersona,
];

export const PRU_PRUSHIELD_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  marcPersona,
  angelinePersona,
  elainePersona,
  gracePersona,
  yvonnePersona,
  amitPersona,
];

// PLT personas
export const PLT_COLD_CALL_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  angelinePersona,
  elainePersona,
  marcPersona,
];

export const PLT_PLI_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  angelinePersona,
  elainePersona,
];

export const PLT_PRUSHIELD_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  marcPersona,
  angelinePersona,
  elainePersona,
  amitPersona,
];

// Prudential Taiwan personas
export const PRUDENTIAL_TW_COLD_CALL_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [marcPersona];
export const PRUDENTIAL_TW_PRUSHIELD_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [gracePersona, yvonnePersona];
export const PRUDENTIAL_TW_PRULIFETIME_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [elainePersona, gracePersona];

// Prudential Philippines personas (Scenario 2: Fact Finding and Product Pitch)
export const PRUDENTIAL_PH_SCENARIO_2_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [
    annaPersona,
    charliePersona,
    johnPersona,
    dannyPersona,
    celiaPersona,
  ];

// MSIG personas
export const MSIG_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  amandaLeeMsigPersona,
  markCastilloMsigPersona,
  darylTanMsigPersona,
  karenSeowMsigPersona,
  samuelHoMsigPersona,
  stephanieKohMsigPersona,
  arvindSharmaMsigPersona,
  melissaTanMsigPersona,
  michelleGohMsigPersona,
  darrenLimMsigPersona,
  sophiaClarkeMsigPersona,
  raymondOngMsigPersona,
  nurHidayahMsigPersona,
  rohitNarayananMsigPersona,
  evelynNgMsigPersona,
  ahmadFirdausMsigPersona,
  jtuanMariaPengMsigPersona,
  angelinePersona,
  elainePersona,
  marcPersona,
  gracePersona,
  yvonnePersona,
  afiqPersona,
  kevinPersona,
];

// Manulife personas
export const MANULIFE_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  marcPhPersona,
  angelinePhPersona,
  krisPersona,
];

// BBL personas
export const BBL_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  boonPersona,
  tutchaiPersona,
  ruksmeePersona,
  khemjiraPersona,
  kanitPersona,
  chutiPersona,
];

// HSBC personas
export const HSBC_CLIENT_ONBOARDING_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [danielPersona, melissaPersona];

export const HSBC_CLIENT_UPGRADE_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [rohanPersona, sophiePersona];

// HSBC-YUE personas (Cantonese)
export const HSBC_YUE_CLIENT_ONBOARDING_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [danielPersona];

// MTL personas
export const MTL_AGENT_RECRUITMENT_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [maiPersona];

export const MTL_UL_PLUS_SALES_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [maiPersona];

export const MTL_PROSPECT_PRACTICE_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [maiPersona];

// AXA PH personas
export const AXA_PH_UNIT_MANAGER_RECRUITMENT_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [joshuaPersona, trinaPersona, melodyPersona, brianPersona, mariePersona];

export const AXA_PH_FNA_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  joshuaPersona,
  trinaPersona,
  melodyPersona,
  brianPersona,
  mariePersona,
];

export const AXA_PH_OBJECTION_HANDLING_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [joshuaPersona, trinaPersona, melodyPersona, brianPersona, mariePersona];

// KT AXA personas
export const KT_AXA_AGENT_RECRUITMENT_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [
    joeKtaxaPersona,
    ployKtaxaPersona,
    nichaKtaxaPersona,
    kongpopKtaxaPersona,
    piyaKtaxaEasyPersona,
    piyaKtaxaMediumPersona,
    supapornKtaxaPersona,
    yingKtaxaPersona,
  ];

export const KT_AXA_FNA_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  somsakKtaxaFnaEasyPersona,
  somsakKtaxaFnaMediumPersona,
  mintraKtaxaFnaEasyPersona,
  mintraKtaxaFnaMediumPersona,
  armKtaxaFnaEasyPersona,
  armKtaxaFnaMediumPersona,
  jintanaKtaxaFnaEasyPersona,
  jintanaKtaxaFnaMediumPersona,
  manopKtaxaFnaEasyPersona,
  manopKtaxaFnaMediumPersona,
];

export const KT_AXA_WEALTHPLUS_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [
    thanaPersona,
    sirionPersona,
    sajiPersona,
    kornPersona,
    naruemonPersona,
    weerawatPersona,
  ];

// AIA Korea personas - using default personas which have Korean translations
export const AIA_KO_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  choiSunHoPersonaKo,
  kimWooJungPersonaKo,
  leeSoonYoungPersonaKo,
];

// AIA Korea S3 End-To-End Outbound Call personas
export const AIA_KO_S3_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  parkJisooPersonaKo,
  yoonSunheePersonaKo,
  kangMiheePersonaKo,
];

// Alibaba personas
export const ALIBABA_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  tsingLuPersona,
];

// SCB Demo personas
export const SCB_DEMO_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  chrisLiPersona,
];

// Prudential PH Appointment Setting personas
export const PRU_PH_APPOINTMENT_SETTING_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [
    annaPersona,
    charliePersona,
    johnPersona,
    dannyPersona,
    celiaPersona,
  ];

// Prudential PH Fact Finding personas - reusing appointment-setting personas
export const PRU_PH_FACT_FINDING_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [
    annaPersona,
    charliePersona,
    johnPersona,
    dannyPersona,
    celiaPersona,
  ];

// Prudential PH Closing Call personas
export const PRU_PH_CLOSING_CALL_PERSONA_CONFIGURATIONS: PersonaConfiguration[] =
  [
    annaPersona,
    charliePersona,
    johnPersona,
    dannyPersona,
    celiaPersona,
  ];

// Great Eastern personas (Fact Find, Product Pitch, Post Sale Service)
export const GREAT_EASTERN_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  aishaRahmanGreatEasternPersona,
  aishaRahmanGreatEasternHardPersona,
  ethanKohGreatEasternPersona,
  ethanKohGreatEasternHardPersona,
  danielLimGreatEasternPersona,
  danielLimGreatEasternHardPersona,
  clarissaNgGreatEasternPersona,
  clarissaNgGreatEasternHardPersona,
];

// Lalamove personas (Driver Registration)
export const LALAMOVE_PERSONA_CONFIGURATIONS: PersonaConfiguration[] = [
  pitakLalamovePersona,
  samsonLalamovePersona,
  kanchaiLalamovePersona,
  nadateLalamovePersona,
];

// Re-export individual personas for direct access
export {
  marcPersona,
  angelinePersona,
  elainePersona,
  gracePersona,
  yvonnePersona,
  amitPersona,
  raviPersona,
  michaelPersona,
  nataliePersona,
  prakashPersona,
  afiqPersona,
  kevinPersona,
  hafizPersona,
  marcPhPersona,
  angelinePhPersona,
  andyPersona,
  rachelPersona,
  boonPersona,
  tutchaiPersona,
  ruksmeePersona,
  khemjiraPersona,
  kanitPersona,
  chutiPersona,
  danielPersona,
  melissaPersona,
  rohanPersona,
  sophiePersona,
  maiPersona,
  napatPersona,
  joshuaPersona,
  trinaPersona,
  melodyPersona,
  brianPersona,
  mariePersona,
  joeKtaxaPersona,
  ployKtaxaPersona,
  nichaKtaxaPersona,
  kongpopKtaxaPersona,
  piyaKtaxaEasyPersona,
  piyaKtaxaMediumPersona,
  supapornKtaxaPersona,
  yingKtaxaPersona,
  somsakKtaxaFnaEasyPersona,
  somsakKtaxaFnaMediumPersona,
  mintraKtaxaFnaEasyPersona,
  mintraKtaxaFnaMediumPersona,
  armKtaxaFnaEasyPersona,
  armKtaxaFnaMediumPersona,
  jintanaKtaxaFnaEasyPersona,
  jintanaKtaxaFnaMediumPersona,
  manopKtaxaFnaEasyPersona,
  manopKtaxaFnaMediumPersona,
  thanaPersona,
  sirionPersona,
  sajiPersona,
  kornPersona,
  naruemonPersona,
  weerawatPersona,
  tsingLuPersona,
  annaPersona,
  charliePersona,
  johnPersona,
  dannyPersona,
  celiaPersona,
  amandaLeeMsigPersona,
  markCastilloMsigPersona,
  darylTanMsigPersona,
  karenSeowMsigPersona,
  samuelHoMsigPersona,
  stephanieKohMsigPersona,
  arvindSharmaMsigPersona,
  melissaTanMsigPersona,
  michelleGohMsigPersona,
  darrenLimMsigPersona,
  sophiaClarkeMsigPersona,
  raymondOngMsigPersona,
  nurHidayahMsigPersona,
  rohitNarayananMsigPersona,
  evelynNgMsigPersona,
  ahmadFirdausMsigPersona,
  jtuanMariaPengMsigPersona,
};

// Re-export types and localization utilities
export * from './types.js';
export * from './localization.js';
