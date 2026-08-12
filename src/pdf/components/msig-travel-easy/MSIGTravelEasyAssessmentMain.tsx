/**
 * MSIG Travel Easy Assessment Main Component
 * Handles data transformation and renders sub-components for MSIG Travel Easy assessments
 */
import React from 'react';
import MSIGTravelEasyOverall from './MSIGTravelEasyOverall.js';
import MSIGTravelEasySkillsSection from './MSIGTravelEasySkillsSection.js';

interface MSIGTravelEasyAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const MSIGTravelEasyAssessmentMain: React.FC<
  MSIGTravelEasyAssessmentMainProps
> = ({ session, translations, localizedModuleName }) => {
  // Parse feedback data
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const softSkillsRaw = session?.roleplay?.feedback?.msigTravelEasySoftSkills
    ? JSON.parse(String(session.roleplay.feedback.msigTravelEasySoftSkills))
    : null;

  const knowledgeSkillsRaw = session?.roleplay?.feedback
    ?.msigTravelEasyKnowledgeSkills
    ? JSON.parse(
        String(session.roleplay.feedback.msigTravelEasyKnowledgeSkills),
      )
    : null;

  const productKnowledgeRaw = session?.roleplay?.feedback
    ?.msigTravelEasyProductKnowledge
    ? JSON.parse(
        String(session.roleplay.feedback.msigTravelEasyProductKnowledge),
      )
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
      <MSIGTravelEasyOverall
        softSkillsScore={softSkillsRaw?.overallScore}
        knowledgeSkillsScore={knowledgeSkillsRaw?.overallScore}
        productKnowledgeScore={productKnowledgeRaw?.overallScore}
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
        standing={session?.standing || null}
      />

      {/* Soft Skills Section */}
      {softSkillsRaw && (
        <MSIGTravelEasySkillsSection
          title={(translations as any).softSkills || 'Soft Skills'}
          description={softSkillsRaw.description || ''}
          overallScore={softSkillsRaw.overallScore || 0}
          maxScore={softSkillsRaw.maxScore || 30}
          sections={softSkillsRaw.sections || []}
          translations={translations}
        />
      )}

      {/* Knowledge Skills Section */}
      {knowledgeSkillsRaw && (
        <MSIGTravelEasySkillsSection
          title={(translations as any).knowledgeSkills || 'Knowledge Skills'}
          description={knowledgeSkillsRaw.description || ''}
          overallScore={knowledgeSkillsRaw.overallScore || 0}
          maxScore={knowledgeSkillsRaw.maxScore || 30}
          sections={knowledgeSkillsRaw.sections || []}
          translations={translations}
        />
      )}

      {/* Product Knowledge Section */}
      {productKnowledgeRaw && (
        <MSIGTravelEasySkillsSection
          title={(translations as any).productKnowledge || 'Product Knowledge'}
          description={productKnowledgeRaw.description || ''}
          overallScore={productKnowledgeRaw.overallScore || 0}
          maxScore={productKnowledgeRaw.maxScore || 40}
          sections={productKnowledgeRaw.sections || []}
          translations={translations}
        />
      )}
    </>
  );
};

export default MSIGTravelEasyAssessmentMain;
