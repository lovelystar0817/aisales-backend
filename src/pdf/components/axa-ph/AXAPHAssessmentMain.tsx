/**
 * AXA PH Assessment Main Component
 * Handles data transformation and renders sub-components for AXA Philippines assessments
 */
import React from 'react';
import AXAPHOverall from './AXAPHOverall.js';
import AXAPHSkillsSection from './AXAPHSkillsSection.js';

interface AXAPHAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const AXAPHAssessmentMain: React.FC<AXAPHAssessmentMainProps> = ({
  session,
  translations,
  localizedModuleName,
}) => {
  // Parse feedback data
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const softSkillsRaw = session?.roleplay?.feedback?.axaPhSoftSkills
    ? JSON.parse(String(session.roleplay.feedback.axaPhSoftSkills))
    : null;

  const knowledgeSkillsRaw = session?.roleplay?.feedback?.axaPhKnowledgeSkills
    ? JSON.parse(String(session.roleplay.feedback.axaPhKnowledgeSkills))
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
      <AXAPHOverall
        softSkillsScore={softSkillsRaw?.overallScore}
        knowledgeSkillsScore={knowledgeSkillsRaw?.overallScore}
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
      />

      {/* Soft Skills Section */}
      {softSkillsRaw && (
        <AXAPHSkillsSection
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
        <AXAPHSkillsSection
          title={(translations as any).knowledgeSkills || 'Knowledge Skills'}
          description={knowledgeSkillsRaw.description || ''}
          overallScore={knowledgeSkillsRaw.overallScore || 0}
          maxScore={knowledgeSkillsRaw.maxScore || 100}
          sections={knowledgeSkillsRaw.sections || []}
          translations={translations}
        />
      )}
    </>
  );
};

export default AXAPHAssessmentMain;
