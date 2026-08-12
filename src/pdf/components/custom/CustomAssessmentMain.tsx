/**
 * Regular Assessment Main Component
 * Handles data transformation and renders sub-components
 */
import React from 'react';
import CustomOverall from './CustomOverall.js';
import CustomSections from './CustomSections.js';
import CustomProductKnowledge from './CustomProductKnowledge.js';

interface CustomAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
}

const CustomAssessmentMain: React.FC<CustomAssessmentMainProps> = ({
  session,
  translations,
  localizedModuleName,
}) => {
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const scorecards = session?.roleplay?.feedback?.scorecards
    ? session?.roleplay?.feedback?.scorecards
    : null;

  const customSections = scorecards?.filter(
    (scorecard: any) => scorecard.sectionType === 'custom',
  );

  const productKnowledge = scorecards?.find(
    (scorecard: any) => scorecard.sectionType === 'product-knowledge',
  );

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

  return (
    <>
      {/* Overall Section */}
      <CustomOverall
        customSections={scorecards}
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
      />

      {/* Sales Technique Section */}
      {customSections?.length > 0 && (
        <CustomSections
          sections={customSections || []}
          translations={translations}
        />
      )}

      {/* Product Knowledge Section */}
      {productKnowledge && (
        <CustomProductKnowledge
          overallScore={productKnowledge.overallScore || 0}
          maxScore={productKnowledge.maxScore || 100}
          description={
            productKnowledge.description ||
            translations.productKnowledgeDescription
          }
          sections={productKnowledge.criteria || []}
          translations={translations}
        />
      )}
    </>
  );
};

export default CustomAssessmentMain;
