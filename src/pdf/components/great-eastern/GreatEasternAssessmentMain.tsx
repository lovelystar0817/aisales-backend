/**
 * Great Eastern Assessment Main Component
 * Handles Soft Skills, Knowledge Skills, and Financial Planning/Product Knowledge/Product Review sections
 * Uses standalone sections (not nested under Sales Technique) like Prudential PH Appointment Setting
 * For Product Pitch (Stage 2), also includes standard Product Knowledge assessment
 */
import React from 'react';
import GreatEasternOverall from './GreatEasternOverall.js';
import GreatEasternSection from './GreatEasternSection.js';
import RegularProductKnowledge from '../regular/RegularProductKnowledge.js';

interface GreatEasternAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const GreatEasternAssessmentMain: React.FC<GreatEasternAssessmentMainProps> = ({
  session,
  translations,
  localizedModuleName,
}) => {
  // Read from greatEasternAssessment (new structure)
  const assessmentRaw = session?.roleplay?.feedback?.greatEasternAssessment
    ? JSON.parse(String(session.roleplay.feedback.greatEasternAssessment))
    : null;

  // Read product knowledge (only for product pitch module)
  const productKnowledgeRaw = session?.roleplay?.feedback?.productKnowledge
    ? JSON.parse(String(session.roleplay.feedback.productKnowledge))
    : null;

  // Extract sections and overall score from the assessment
  const sections = assessmentRaw?.sections || [];
  const overallScore = assessmentRaw?.overallScore || 0;

  // Check if this is the product pitch module (Stage 2)
  const isProductPitch = session?.callType === 'great-eastern-product-pitch';

  const assessmentIdentifiers = [
    {
      label: translations.module,
      text: localizedModuleName,
    },
    {
      label: translations.persona,
      text:
        session?.persona?.name && session?.persona?.occupation
          ? `${session.persona.name}, ${session.persona.occupation}`
          : '',
    },
  ];

  if (session?.product?.name) {
    assessmentIdentifiers.splice(1, 0, {
      label: translations.product,
      text: session.product.name,
    });
  }

  return (
    <>
      <GreatEasternOverall
        overallScore={overallScore}
        assessmentIdentifiers={assessmentIdentifiers}
        summary={assessmentRaw?.overallFeedback || ''}
        nextSteps={assessmentRaw?.nextSteps || []}
        translations={translations}
      />

      {/* Render each Great Eastern section (Soft Skills, Knowledge Skills, etc.) */}
      {sections.map((section: any, index: number) => (
        <GreatEasternSection
          key={index}
          title={section.title}
          score={section.score}
          maxScore={section.maxScore}
          feedback={section.feedback}
          strengths={section.strengths || []}
          improvements={section.improvements || []}
          criteria={section.criteria || []}
          translations={translations}
        />
      ))}

      {/* Product Knowledge Section - Only for Product Pitch (Stage 2) */}
      {isProductPitch && productKnowledgeRaw && (
        <RegularProductKnowledge
          overallScore={productKnowledgeRaw.overallScore || 0}
          maxScore={productKnowledgeRaw.maxScore || 100}
          description={
            productKnowledgeRaw.description ||
            translations.productKnowledgeDescription
          }
          sections={productKnowledgeRaw.sections || []}
          translations={translations}
        />
      )}
    </>
  );
};

export default GreatEasternAssessmentMain;
