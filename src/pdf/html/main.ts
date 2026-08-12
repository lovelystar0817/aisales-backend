import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { generatePdfCss } from '../css/generatePDFCSS.js';

// Import all components directly
import RegularAssessmentMain from '../components/regular/RegularAssessmentMain.js';
import PrudentialAssessmentMain from '../components/prudential/PrudentialAssessmentMain.js';
import MSIGAssessmentMain from '../components/msig/MSIGAssessmentMain.js';
import ManulifeAssessmentMain from '../components/manulife/ManulifeAssessmentMain.js';
import BBLAssessmentMain from '../components/bbl/BBLAssessmentMain.js';
import HSBCAssessmentMain from '../components/hsbc/HSBCAssessmentMain.js';
import GrabMexAssessmentMain from '../components/grab-mex/GrabMexAssessmentMain.js';
import CustomAssessmentMain from '../components/custom/CustomAssessmentMain.js';
import AXAPHAssessmentMain from '../components/axa-ph/AXAPHAssessmentMain.js';
import KTAXAAssessmentMain from '../components/kt-axa/KTAXAAssessmentMain.js';
import PrudentialObjectionHandlingAssessmentMain from '../components/prudential-objection-handling/PrudentialObjectionHandlingAssessmentMain.js';
import MSIGTravelEasyAssessmentMain from '../components/msig-travel-easy/MSIGTravelEasyAssessmentMain.js';
import PrudentialPHAppointmentSettingAssessmentMain from '../components/prudential-ph-appointment-setting/PrudentialPHAppointmentSettingAssessmentMain.js';
import PrudentialPHFactFindingAssessmentMain from '../components/prudential-ph-fact-finding/PrudentialPHFactFindingAssessmentMain.js';
import PrudentialPHClosingCallAssessmentMain from '../components/prudential-ph-closing-call/PrudentialPHClosingCallAssessmentMain.js';
import GreatEasternAssessmentMain from '../components/great-eastern/GreatEasternAssessmentMain.js';
import AIAKOAssessmentMain from '../components/aia-ko/AIAKOAssessmentMain.js';
import ManulifeGoalReadyAssessmentMain from '../components/manulife-goalready/ManulifeGoalReadyAssessmentMain.js';

interface Data {
  session: any; // Raw session data
  translations: any;
  localizedModuleName: string;
  host?: string;
}

export default function generateMainHtml(
  host: string | undefined,
  data: Data,
): string {
  const protocol = 'https';
  const baseUrl = `${protocol}://${host}`;
  // Generate CSS without CJK fonts - they are injected separately via page.addStyleTag()
  const customStyle = generatePdfCss(baseUrl, true);
  const headerHeight = '120px';

  // Determine assessment type
  const assessmentType = data.session?.assessmentType || 'regular';
  const isPrudential = assessmentType === 'prudential';
  const isMSIG = assessmentType === 'msig';
  const isMSIG3F = assessmentType === 'msig-3f';
  const isMSIGTravelEasy = assessmentType === 'msig-travel-easy';
  const isManulife = assessmentType === 'manulife';
  const isManulifeGoalReady = assessmentType === 'manulife-goalready';
  const isBBL = assessmentType === 'bbl';
  const isHSBC = assessmentType === 'hsbc';
  const isGrabMex = assessmentType === 'grab-mex';
  const isRegular = assessmentType === 'regular';
  const isScorecard = assessmentType === 'scorecard';
  const isGreatEastern = assessmentType === 'great-eastern';
  const isAXAPH = assessmentType === 'axa-ph-recruitment';
  const isAXAPHObjectionHandling =
    assessmentType === 'axa-ph-objection-handling';
  const isKTAXA =
    assessmentType === 'kt-axa-recruitment' ||
    assessmentType === 'kt-axa-fna' ||
    assessmentType === 'kt-axa-wealthplus';
  const isPrudentialObjectionHandling =
    assessmentType === 'prudential-objection-handling';
  const isPrudentialPHAppointmentSetting =
    assessmentType === 'prudential-ph-appointment-setting';
  const isPrudentialPHFactFinding =
    assessmentType === 'prudential-ph-fact-finding';
  const isPrudentialPHClosingCall =
    assessmentType === 'prudential-ph-closing-call';
  const isAIAKO =
    assessmentType === 'aia-ko-opening-objection-call' ||
    assessmentType === 'aia-ko-product-pitch' ||
    assessmentType === 'aia-ko-end-to-end-outbound-call';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${customStyle}</style>
<style>
    html, body {
        margin: 0;
        padding: 0;
        font-family: var(--font-sans);
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    @page {
        margin-top: ${headerHeight};
        margin-bottom: 0px;
        margin-left: 0;
        margin-right: 0;
        size: A4;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    html, body, #content, #header, #footer, .page {
        background-color: #EFEFEF !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
    }
    
    #root {
        width: 100%;
        min-height: 100vh;
        box-sizing: border-box;
        display: block;
        padding-top: 0;
    }
    
    * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    .bg-[#EFEFEF] {
        background-color: #EFEFEF !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
    }
    
    .breakable {
        display: block !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
    }
    
    .avoid-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }
</style>
</head>

<body style="background-color: #EFEFEF">
<div id="root" class="content-without-header">
        ${ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column' } },
            [
              isPrudential &&
                React.createElement(PrudentialAssessmentMain, {
                  key: 'prudential',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              (isRegular || isMSIG3F) &&
                React.createElement(RegularAssessmentMain, {
                  key: 'regular',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isGreatEastern &&
                React.createElement(GreatEasternAssessmentMain, {
                  key: 'great-eastern',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isMSIG &&
                React.createElement(MSIGAssessmentMain, {
                  key: 'msig',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isManulife &&
                React.createElement(ManulifeAssessmentMain, {
                  key: 'manulife',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isManulifeGoalReady &&
                React.createElement(ManulifeGoalReadyAssessmentMain, {
                  key: 'manulife-goalready',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isBBL &&
                React.createElement(BBLAssessmentMain, {
                  key: 'bbl',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isHSBC &&
                React.createElement(HSBCAssessmentMain, {
                  key: 'hsbc',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isGrabMex &&
                React.createElement(GrabMexAssessmentMain, {
                  key: 'grab-mex',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isScorecard &&
                React.createElement(CustomAssessmentMain, {
                  key: 'scorecard',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                }),
              isAXAPH &&
                React.createElement(AXAPHAssessmentMain, {
                  key: 'axa-ph',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isAXAPHObjectionHandling &&
                React.createElement(AXAPHAssessmentMain, {
                  key: 'axa-ph-objection-handling',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isKTAXA &&
                React.createElement(KTAXAAssessmentMain, {
                  key: 'kt-axa',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isPrudentialObjectionHandling &&
                React.createElement(PrudentialObjectionHandlingAssessmentMain, {
                  key: 'prudential-objection-handling',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isPrudentialPHAppointmentSetting &&
                React.createElement(
                  PrudentialPHAppointmentSettingAssessmentMain,
                  {
                    key: 'prudential-ph-appointment-setting',
                    session: data.session,
                    translations: data.translations,
                    localizedModuleName: data.localizedModuleName,
                    host,
                  },
                ),
              isMSIGTravelEasy &&
                React.createElement(MSIGTravelEasyAssessmentMain, {
                  key: 'msig-travel-easy',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isPrudentialPHFactFinding &&
                React.createElement(PrudentialPHFactFindingAssessmentMain, {
                  key: 'prudential-ph-fact-finding',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isPrudentialPHClosingCall &&
                React.createElement(PrudentialPHClosingCallAssessmentMain, {
                  key: 'prudential-ph-closing-call',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
              isAIAKO &&
                React.createElement(AIAKOAssessmentMain, {
                  key: 'aia-ko',
                  session: data.session,
                  translations: data.translations,
                  localizedModuleName: data.localizedModuleName,
                  host,
                }),
            ].filter(Boolean),
          ),
        )}
</div>
</body>
</html>`;

  return html;
}
