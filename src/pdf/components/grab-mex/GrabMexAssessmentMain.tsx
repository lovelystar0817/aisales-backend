/**
 * Grab MEX Assessment Main Component
 * Handles data transformation and renders sub-components for Grab MEX assessments
 */
import React from 'react';
import GrabMexSoftSkills from './GrabMexSoftSkills.js';
import RegularOverall from '../regular/RegularOverall.js';
import RegularSalesTechnique from '../regular/RegularSalesTechnique.js';
import RegularProductKnowledge from '../regular/RegularProductKnowledge.js';
import { CallType } from '../../../models/SalesSession.js';

interface GrabMexAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const GrabMexAssessmentMain: React.FC<GrabMexAssessmentMainProps> = ({
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

  const grabMexSoftSkillsRaw = session?.roleplay?.feedback?.grabMexSoftSkills
    ? JSON.parse(String(session.roleplay.feedback.grabMexSoftSkills))
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

      {/* Grab MEX Soft Skills Section */}
      {grabMexSoftSkillsRaw && (
        <GrabMexSoftSkills
          overallScore={grabMexSoftSkillsRaw.overallScore}
          maxScore={grabMexSoftSkillsRaw.maxScore}
          description={grabMexSoftSkillsRaw.description}
          sections={grabMexSoftSkillsRaw.sections}
          translations={{
            softSkills: translations.softSkills,
            strengths: translations.strengths,
            toImprove: translations.toImprove,
            example: translations.example,
            ratings: translations.ratings,
          }}
        />
      )}

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

export default GrabMexAssessmentMain;
