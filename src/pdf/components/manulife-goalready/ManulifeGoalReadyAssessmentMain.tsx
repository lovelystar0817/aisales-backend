/**
 * Manulife GoalReady Assessment Main Component
 * Handles data transformation and renders sub-components for Manulife GoalReady assessments
 */
import React from 'react';
import MSIGOverall from '../msig/MSIGOverall.js';
import ManulifeGoalReadySkillsSection from './ManulifeGoalReadySkillsSection.js';

interface ManulifeGoalReadyAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const ManulifeGoalReadyAssessmentMain: React.FC<
  ManulifeGoalReadyAssessmentMainProps
> = ({ session, translations, localizedModuleName }) => {
  // Parse feedback data
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const salesAndNegotiationSkillsRaw = session?.roleplay?.feedback
    ?.manulifeSalesAndNegotiationSkills
    ? JSON.parse(
        String(session.roleplay.feedback.manulifeSalesAndNegotiationSkills),
      )
    : null;

  const softSkillsRaw = session?.roleplay?.feedback?.manulifeSoftSkills
    ? JSON.parse(String(session.roleplay.feedback.manulifeSoftSkills))
    : null;

  const productKnowledgeRaw = session?.roleplay?.feedback
    ?.manulifeProductKnowledge
    ? JSON.parse(String(session.roleplay.feedback.manulifeProductKnowledge))
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

  return (
    <>
      {/* Overall Section */}
      <MSIGOverall
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
        mandatoryNotMet={false}
      />

      {/* Sales & Negotiation Skills Section */}
      {salesAndNegotiationSkillsRaw && (
        <ManulifeGoalReadySkillsSection
          title={
            salesAndNegotiationSkillsRaw.title || 'Sales & Negotiation Skills'
          }
          overallScore={salesAndNegotiationSkillsRaw.score || 0}
          maxScore={salesAndNegotiationSkillsRaw.maxScore || 100}
          subsections={salesAndNegotiationSkillsRaw.subsections || []}
          translations={translations}
          type="why-suggestion"
        />
      )}

      {/* Soft Skills Section */}
      {softSkillsRaw && (
        <ManulifeGoalReadySkillsSection
          title={softSkillsRaw.title || 'Soft Skills'}
          overallScore={softSkillsRaw.score || 0}
          maxScore={softSkillsRaw.maxScore || 100}
          subsections={softSkillsRaw.subsections || []}
          translations={translations}
          type="why-suggestion"
        />
      )}

      {/* Product Knowledge Section */}
      {productKnowledgeRaw && (
        <ManulifeGoalReadySkillsSection
          title={productKnowledgeRaw.title || 'Product Knowledge'}
          overallScore={productKnowledgeRaw.score || 0}
          maxScore={productKnowledgeRaw.maxScore || 100}
          subsections={productKnowledgeRaw.subsections || []}
          translations={translations}
          type="strengths-improvements"
        />
      )}
    </>
  );
};

export default ManulifeGoalReadyAssessmentMain;
