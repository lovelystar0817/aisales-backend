/**
 * Regular Assessment Main Component
 * Handles data transformation and renders sub-components
 */
import React from 'react';
import RegularOverall from './RegularOverall.js';
import RegularSalesTechnique from './RegularSalesTechnique.js';
import RegularProductKnowledge from './RegularProductKnowledge.js';
import { CallType } from '../../../models/SalesSession.js';

interface RegularAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const RegularAssessmentMain: React.FC<RegularAssessmentMainProps> = ({
  session,
  translations,
  localizedModuleName,
  host,
}) => {
  // Parse feedback data
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const salesTechniquesRaw = session?.roleplay?.feedback?.salesTechniques
    ? JSON.parse(String(session.roleplay.feedback.salesTechniques))
    : null;

  const productKnowledgeRaw = session?.roleplay?.feedback?.productKnowledge
    ? JSON.parse(String(session.roleplay.feedback.productKnowledge))
    : null;

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

  const isColdCall = session?.callType === CallType.COLD_CALL;

  return (
    <>
      {/* Overall Section */}
      <RegularOverall
        salesTechniqueScore={salesTechniquesRaw?.overallScore}
        productKnowledgeScore={productKnowledgeRaw?.overallScore}
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
      />

      {/* Sales Technique Section */}
      {salesTechniquesRaw && (
        <RegularSalesTechnique
          overallScore={salesTechniquesRaw.overallScore || 0}
          maxScore={salesTechniquesRaw.maxScore || 100}
          description={
            salesTechniquesRaw.description ||
            translations.salesTechniqueDescription
          }
          sections={salesTechniquesRaw.sections || []}
          translations={translations}
        />
      )}

      {/* Product Knowledge Section */}
      {!isColdCall && productKnowledgeRaw && (
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

export default RegularAssessmentMain;
