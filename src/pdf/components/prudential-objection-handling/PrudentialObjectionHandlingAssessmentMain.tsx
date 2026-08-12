/**
 * Prudential Objection Handling Assessment Main Component
 * Handles 3F (Sales Technique) and LAPR (Objection Handling) frameworks
 */
import React from 'react';
import PrudentialOverall from '../prudential/PrudentialOverall.js';
import PrudentialObjectionHandlingSalesTechnique from './PrudentialObjectionHandlingSalesTechnique.js';
import PrudentialObjectionHandlingLAPR from './PrudentialObjectionHandlingLAPR.js';

interface PrudentialObjectionHandlingAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const PrudentialObjectionHandlingAssessmentMain: React.FC<
  PrudentialObjectionHandlingAssessmentMainProps
> = ({ session, translations, localizedModuleName }) => {
  // Parse feedback data - for prudential-objection-handling, data is stored separately
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  // Sales Technique (3F) data
  const salesTechniqueData = session?.roleplay?.feedback
    ?.prudentialOHSalesTechnique
    ? JSON.parse(String(session.roleplay.feedback.prudentialOHSalesTechnique))
    : null;

  // Objection Handling (LAPR) data
  const objectionHandlingData = session?.roleplay?.feedback
    ?.prudentialOHObjectionHandling
    ? JSON.parse(
        String(session.roleplay.feedback.prudentialOHObjectionHandling),
      )
    : null;

  // Helper to get section status
  const getSectionStatus = (score: number, maxScore: number = 100) => {
    const percentage = (score / maxScore) * 100;
    let status = translations.beginner || 'Beginner';
    if (percentage >= 67) status = translations.expert || 'Expert';
    else if (percentage >= 34)
      status = translations.intermediate || 'Intermediate';

    if (score > 0) {
      status += ` (${Math.round(percentage)}%)`;
    }

    return status;
  };

  // Transform Sales Technique (3F) sections
  const salesTechniqueSections =
    salesTechniqueData?.sections?.map((section: any) => ({
      title: section.title,
      score: section.score,
      maxScore: section.maxScore || 33,
      status: getSectionStatus(section.score, section.maxScore || 33),
      why: section.why,
      suggestion: section.suggestion,
    })) || [];

  // Transform Objection Handling (LAPR) sections
  const objectionHandlingSections =
    objectionHandlingData?.sections?.map((section: any) => ({
      title: section.title,
      score: section.score,
      maxScore: section.maxScore || 25,
      status: getSectionStatus(section.score, section.maxScore || 25),
      why: section.why,
      suggestion: section.suggestion,
    })) || [];

  // Build assessment identifiers
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

  // Build prudentialSections for the overview standing display
  const prudentialSections = [
    ...(salesTechniqueData
      ? [
          {
            title: translations.salesTechnique || 'Sales Technique (3F)',
            score: salesTechniqueData.overallScore || 0,
            maxScore: 100,
            status: getSectionStatus(salesTechniqueData.overallScore || 0),
            isMandatory: false,
            completed: [],
            toImprove: [],
          },
        ]
      : []),
    ...(objectionHandlingData
      ? [
          {
            title:
              translations.objectionHandling || 'Objection Handling (LAPR)',
            score: objectionHandlingData.overallScore || 0,
            maxScore: 100,
            status: getSectionStatus(objectionHandlingData.overallScore || 0),
            isMandatory: false,
            completed: [],
            toImprove: [],
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Overall Section */}
      <PrudentialOverall
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
        standing={session?.standing || null}
        mandatoryNotMet={false}
        prudentialSections={prudentialSections}
      />

      {/* Sales Technique (3F) Section */}
      {salesTechniqueData && (
        <PrudentialObjectionHandlingSalesTechnique
          overallScore={salesTechniqueData.overallScore || 0}
          maxScore={100}
          description={
            salesTechniqueData.description ||
            translations.salesTechniqueDescription ||
            'Measures the ability to apply the 3F Model (Feel, Felt, Found) to create empathy, build credibility, and present compelling solutions.'
          }
          sections={salesTechniqueSections}
          translations={translations}
        />
      )}

      {/* Objection Handling (LAPR) Section */}
      {objectionHandlingData && (
        <PrudentialObjectionHandlingLAPR
          overallScore={objectionHandlingData.overallScore || 0}
          maxScore={100}
          description={
            objectionHandlingData.description ||
            translations.laprDescription ||
            'Measures the ability to apply the LAPR framework (Listen, Acknowledge, Probe, Reframe) to handle customer objections effectively.'
          }
          sections={objectionHandlingSections}
          translations={translations}
        />
      )}
    </>
  );
};

export default PrudentialObjectionHandlingAssessmentMain;
