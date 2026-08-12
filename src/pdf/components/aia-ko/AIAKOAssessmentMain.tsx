import React from 'react';
import AIAKOOverall from './AIAKOOverall.js';
import AIAKOSection from './AIAKOSection.js';
import AIAKOEndToEndOverall from './AIAKOEndToEndOverall.js';
import AIAKOEndToEndSection from './AIAKOEndToEndSection.js';

interface AIAKOAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const AIAKOAssessmentMain: React.FC<AIAKOAssessmentMainProps> = ({
  session,
  translations,
  localizedModuleName,
}) => {
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const assessmentType = session?.assessmentType;
  const isOpeningObjectionCall =
    assessmentType === 'aia-ko-opening-objection-call';
  const isProductPitch = assessmentType === 'aia-ko-product-pitch';
  const isEndToEndOutboundCall =
    assessmentType === 'aia-ko-end-to-end-outbound-call';

  // Opening Objection Call assessments
  const introductionRaw = session?.roleplay?.feedback?.aiaKoIntroduction
    ? JSON.parse(String(session.roleplay.feedback.aiaKoIntroduction))
    : null;

  const objectionHandlingRaw = session?.roleplay?.feedback
    ?.aiaKoObjectionHandling
    ? JSON.parse(String(session.roleplay.feedback.aiaKoObjectionHandling))
    : null;

  const needsExplorationRaw = session?.roleplay?.feedback?.aiaKoNeedsExploration
    ? JSON.parse(String(session.roleplay.feedback.aiaKoNeedsExploration))
    : null;

  // Product Pitch assessments
  const needsAnalysisRaw = session?.roleplay?.feedback?.aiaKoNeedsAnalysis
    ? JSON.parse(String(session.roleplay.feedback.aiaKoNeedsAnalysis))
    : null;

  const productPitchRaw = session?.roleplay?.feedback?.aiaKoProductPitch
    ? JSON.parse(String(session.roleplay.feedback.aiaKoProductPitch))
    : null;

  const productPitchObjectionHandlingRaw = session?.roleplay?.feedback
    ?.aiaKoProductPitchObjectionHandling
    ? JSON.parse(
        String(session.roleplay.feedback.aiaKoProductPitchObjectionHandling),
      )
    : null;

  // End-to-End assessment
  const e2eAssessmentRaw = session?.roleplay?.feedback?.aiaKoE2EAssessment
    ? JSON.parse(String(session.roleplay.feedback.aiaKoE2EAssessment))
    : null;
  const e2eAssessment = e2eAssessmentRaw || null;

  const assessmentIdentifiers = [
    {
      label: translations.module,
      text: localizedModuleName,
    },
    {
      label: translations.product,
      text: session?.product?.name || '',
    },
    {
      label: translations.persona,
      text:
        session?.persona?.name && session?.persona?.occupation
          ? `${session.persona.name}, ${session.persona.occupation}`
          : '',
    },
  ];

  // Determine which scores to display based on assessment type
  const score1 = isOpeningObjectionCall
    ? introductionRaw?.overallScore
    : needsAnalysisRaw?.overallScore;
  const score2 = isOpeningObjectionCall
    ? objectionHandlingRaw?.overallScore
    : productPitchRaw?.overallScore;
  const score3 = isOpeningObjectionCall
    ? needsExplorationRaw?.overallScore
    : productPitchObjectionHandlingRaw?.overallScore;

  const maxScore1 = isOpeningObjectionCall
    ? introductionRaw?.maxScore || 100
    : needsAnalysisRaw?.maxScore || 100;
  const maxScore2 = isOpeningObjectionCall
    ? objectionHandlingRaw?.maxScore || 100
    : productPitchRaw?.maxScore || 100;
  const maxScore3 = isOpeningObjectionCall
    ? needsExplorationRaw?.maxScore || 100
    : productPitchObjectionHandlingRaw?.maxScore || 100;

  const label1 = isOpeningObjectionCall
    ? translations.introduction
    : translations.needsAnalysis || 'Needs Analysis';
  const label2 = isOpeningObjectionCall
    ? translations.objectionHandling
    : translations.productPitch || 'Product Pitch';
  const label3 = isOpeningObjectionCall
    ? translations.needsHealthExploration || 'Needs & Health Exploration'
    : translations.objectionHandling;

  return (
    <>
      {!isEndToEndOutboundCall && (
        <AIAKOOverall
          score1={score1}
          score2={score2}
          score3={score3}
          maxScore1={maxScore1}
          maxScore2={maxScore2}
          maxScore3={maxScore3}
          label1={label1}
          label2={label2}
          label3={label3}
          isOpeningObjectionCall={isOpeningObjectionCall}
          assessmentIdentifiers={assessmentIdentifiers}
          summary={overview?.summary || ''}
          nextSteps={overview?.suggestedNextSteps || []}
          translations={translations}
        />
      )}

      {/* Opening Objection Call sections */}
      {isOpeningObjectionCall && introductionRaw && (
        <AIAKOSection
          overallScore={introductionRaw.overallScore || 0}
          maxScore={introductionRaw.maxScore || 100}
          description={introductionRaw.description || ''}
          sectionTitle={translations.introduction}
          sections={introductionRaw.sections || []}
          translations={translations}
        />
      )}

      {isOpeningObjectionCall && objectionHandlingRaw && (
        <AIAKOSection
          overallScore={objectionHandlingRaw.overallScore || 0}
          maxScore={objectionHandlingRaw.maxScore || 100}
          description={objectionHandlingRaw.description || ''}
          sectionTitle={translations.objectionHandling}
          sections={objectionHandlingRaw.sections || []}
          translations={translations}
        />
      )}

      {isOpeningObjectionCall && needsExplorationRaw && (
        <AIAKOSection
          overallScore={needsExplorationRaw.overallScore || 0}
          maxScore={needsExplorationRaw.maxScore || 100}
          description={needsExplorationRaw.description || ''}
          sectionTitle={
            translations.needsHealthExploration || 'Needs & Health Exploration'
          }
          sections={needsExplorationRaw.sections || []}
          translations={translations}
        />
      )}

      {/* Product Pitch sections */}
      {isProductPitch && needsAnalysisRaw && (
        <AIAKOSection
          overallScore={needsAnalysisRaw.overallScore || 0}
          maxScore={needsAnalysisRaw.maxScore || 100}
          description={needsAnalysisRaw.description || ''}
          sectionTitle={translations.needsAnalysis || 'Needs Analysis'}
          sections={needsAnalysisRaw.sections || []}
          translations={translations}
        />
      )}

      {isProductPitch && productPitchRaw && (
        <AIAKOSection
          overallScore={productPitchRaw.overallScore || 0}
          maxScore={productPitchRaw.maxScore || 100}
          description={productPitchRaw.description || ''}
          sectionTitle={translations.productPitch || 'Product Pitch'}
          sections={productPitchRaw.sections || []}
          translations={translations}
        />
      )}

      {isProductPitch && productPitchObjectionHandlingRaw && (
        <AIAKOSection
          overallScore={productPitchObjectionHandlingRaw.overallScore || 0}
          maxScore={productPitchObjectionHandlingRaw.maxScore || 100}
          description={productPitchObjectionHandlingRaw.description || ''}
          sectionTitle={translations.objectionHandling}
          sections={productPitchObjectionHandlingRaw.sections || []}
          translations={translations}
        />
      )}

      {/* End-to-End Outbound Call sections */}
      {isEndToEndOutboundCall && e2eAssessment && (
        <AIAKOEndToEndOverall
          overallScore={e2eAssessment.overallScore || 0}
          maxScore={e2eAssessment.maxScore || 100}
          assessmentIdentifiers={assessmentIdentifiers}
          summary={overview?.summary || ''}
          nextSteps={overview?.suggestedNextSteps || []}
          translations={translations}
        />
      )}

      {isEndToEndOutboundCall &&
        e2eAssessment &&
        (e2eAssessment.sections || []).map((section: any) => (
          <AIAKOEndToEndSection
            key={section.title}
            section={section}
            translations={translations}
          />
        ))}
    </>
  );
};

export default AIAKOAssessmentMain;
