import React from 'react';
import KTAXAOverall from '../kt-axa/KTAXAOverall.js';
import KTAXASkillsSection from '../kt-axa/KTAXASkillsSection.js';

interface PrudentialPHFactFindingAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const PrudentialPHFactFindingAssessmentMain: React.FC<
  PrudentialPHFactFindingAssessmentMainProps
> = ({ session, translations, localizedModuleName }) => {
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const factFindingTechniqueRaw = session?.roleplay?.feedback
    ?.prudentialPHFactFindingTechnique
    ? JSON.parse(
        String(session.roleplay.feedback.prudentialPHFactFindingTechnique),
      )
    : null;

  const productKnowledgeRaw = session?.roleplay?.feedback
    ?.prudentialPHProductKnowledge
    ? JSON.parse(String(session.roleplay.feedback.prudentialPHProductKnowledge))
    : null;

  const factFindingMax = factFindingTechniqueRaw?.maxScore || 100;
  const productKnowledgeMax = productKnowledgeRaw?.maxScore || 100;

  const factFindingPct =
    factFindingTechniqueRaw?.overallScore != null
      ? Math.round(
          (factFindingTechniqueRaw.overallScore / factFindingMax) * 100,
        )
      : undefined;

  const productKnowledgePct =
    productKnowledgeRaw?.overallScore != null
      ? Math.round(
          (productKnowledgeRaw.overallScore / productKnowledgeMax) * 100,
        )
      : undefined;

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
      <KTAXAOverall
        softSkillsScore={factFindingPct}
        knowledgeSkillsScore={productKnowledgePct}
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={{
          ...translations,
          softSkills:
            (translations as any).factFindingTechnique ||
            'Fact Finding Technique',
          knowledgeSkills:
            (translations as any).productKnowledge || 'Product Knowledge',
        }}
      />

      {factFindingTechniqueRaw && (
        <KTAXASkillsSection
          title={
            (translations as any).factFindingTechnique ||
            'Fact Finding Technique'
          }
          description={factFindingTechniqueRaw.description || ''}
          overallScore={factFindingTechniqueRaw.overallScore || 0}
          maxScore={factFindingMax}
          sections={factFindingTechniqueRaw.sections || []}
          translations={translations}
        />
      )}

      {productKnowledgeRaw && (
        <KTAXASkillsSection
          title={(translations as any).productKnowledge || 'Product Knowledge'}
          description={productKnowledgeRaw.description || ''}
          overallScore={productKnowledgeRaw.overallScore || 0}
          maxScore={productKnowledgeMax}
          sections={productKnowledgeRaw.sections || []}
          translations={translations}
        />
      )}
    </>
  );
};

export default PrudentialPHFactFindingAssessmentMain;
