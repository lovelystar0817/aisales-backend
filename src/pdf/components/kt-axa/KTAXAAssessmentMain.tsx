/**
 * KT AXA Assessment Main Component
 * Handles data transformation and renders sub-components for KT AXA assessments
 */
import React from 'react';
import KTAXAOverall from './KTAXAOverall.js';
import KTAXASkillsSection from './KTAXASkillsSection.js';

interface KTAXAAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const KTAXAAssessmentMain: React.FC<KTAXAAssessmentMainProps> = ({
  session,
  translations,
  localizedModuleName,
}) => {
  // Parse feedback data
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const softSkillsRaw = session?.roleplay?.feedback?.ktAxaSoftSkills
    ? JSON.parse(String(session.roleplay.feedback.ktAxaSoftSkills))
    : null;

  const knowledgeSkillsRaw = session?.roleplay?.feedback?.ktAxaKnowledgeSkills
    ? JSON.parse(String(session.roleplay.feedback.ktAxaKnowledgeSkills))
    : null;

  // Parse product knowledge feedback (for FNA and WealthPlus assessment types)
  const productKnowledgeRaw = session?.roleplay?.feedback?.ktAxaProductKnowledge
    ? JSON.parse(String(session.roleplay.feedback.ktAxaProductKnowledge))
    : null;

  // Build assessment identifiers
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

  // Add product if available
  if (session?.product?.name) {
    assessmentIdentifiers.splice(1, 0, {
      label: translations.product,
      text: session.product.name,
    });
  }

  return (
    <>
      {/* Overall Section */}
      <KTAXAOverall
        softSkillsScore={softSkillsRaw?.overallScore}
        knowledgeSkillsScore={knowledgeSkillsRaw?.overallScore}
        productKnowledgeScore={productKnowledgeRaw?.overallScore}
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
      />

      {/* Soft Skills Section */}
      {softSkillsRaw && (
        <KTAXASkillsSection
          title={(translations as any).softSkills || 'Soft Skills'}
          description={softSkillsRaw.description || ''}
          overallScore={softSkillsRaw.overallScore || 0}
          maxScore={softSkillsRaw.maxScore || 100}
          sections={softSkillsRaw.sections || []}
          translations={translations}
        />
      )}

      {/* Knowledge Skills Section */}
      {knowledgeSkillsRaw && (
        <KTAXASkillsSection
          title={(translations as any).knowledgeSkills || 'Knowledge Skills'}
          description={knowledgeSkillsRaw.description || ''}
          overallScore={knowledgeSkillsRaw.overallScore || 0}
          maxScore={knowledgeSkillsRaw.maxScore || 100}
          sections={knowledgeSkillsRaw.sections || []}
          translations={translations}
        />
      )}

      {/* Product Knowledge Section (for FNA and WealthPlus) */}
      {productKnowledgeRaw && (
        <KTAXASkillsSection
          title={(translations as any).productKnowledge || 'Product Knowledge'}
          description={productKnowledgeRaw.description || ''}
          overallScore={productKnowledgeRaw.overallScore || 0}
          maxScore={productKnowledgeRaw.maxScore || 100}
          sections={productKnowledgeRaw.sections || []}
          translations={translations}
        />
      )}
    </>
  );
};

export default KTAXAAssessmentMain;
