import React from 'react';
import PrudentialOverall from '../prudential/PrudentialOverall.js';
import PrudentialPHAppointmentSettingSection from '../prudential-ph-appointment-setting/PrudentialPHAppointmentSettingSection.js';

interface PrudentialPHClosingCallAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const PrudentialPHClosingCallAssessmentMain: React.FC<
  PrudentialPHClosingCallAssessmentMainProps
> = ({ session, translations, localizedModuleName }) => {
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const closingCallTechniqueRaw = session?.roleplay?.feedback
    ?.prudentialPHClosingCallTechnique
    ? JSON.parse(
        String(session.roleplay.feedback.prudentialPHClosingCallTechnique),
      )
    : null;

  const sections: Array<{
    title: string;
    score: number;
    maxScore: number;
    why: string;
    suggestion: string;
  }> = closingCallTechniqueRaw?.sections || [];

  const getSectionStatus = (pct: number) => {
    let status = translations.beginner || 'Beginner';
    if (pct >= 67) status = translations.expert || 'Expert';
    else if (pct >= 34) status = translations.intermediate || 'Intermediate';
    if (pct > 0) status += ` (${pct}%)`;
    return status;
  };

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

  const prudentialSections = sections.map((s) => {
    const pct = s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0;
    return {
      title: s.title,
      score: pct,
      maxScore: 100,
      status: getSectionStatus(pct),
      isMandatory: false,
      completed: [],
      toImprove: [],
    };
  });

  return (
    <>
      <PrudentialOverall
        assessmentIdentifiers={assessmentIdentifiers}
        summary={
          closingCallTechniqueRaw?.overallFeedback || overview?.summary || ''
        }
        nextSteps={
          closingCallTechniqueRaw?.nextSteps ||
          overview?.suggestedNextSteps ||
          []
        }
        translations={translations}
        standing={session?.standing || null}
        mandatoryNotMet={false}
        prudentialSections={prudentialSections}
        hideBadge={true}
      />

      {sections.map((section, idx) => {
        const pct =
          section.maxScore > 0
            ? Math.round((section.score / section.maxScore) * 100)
            : 0;
        return (
          <PrudentialPHAppointmentSettingSection
            key={idx}
            sectionTitle={section.title}
            overallScore={pct}
            maxScore={100}
            description=""
            sections={[
              {
                title: section.title,
                score: pct,
                maxScore: 100,
                status: getSectionStatus(pct),
                why: section.why,
                suggestion: section.suggestion,
              },
            ]}
            translations={translations}
          />
        );
      })}
    </>
  );
};

export default PrudentialPHClosingCallAssessmentMain;
