/**
 * Prudential PH Appointment Setting Assessment Main Component
 * Handles Client Verification and Objection Handling sections
 * Layout matches PrudentialObjectionHandlingAssessmentMain pattern
 */
import React from 'react';
import PrudentialOverall from '../prudential/PrudentialOverall.js';
import PrudentialPHAppointmentSettingSection from './PrudentialPHAppointmentSettingSection.js';

interface PrudentialPHAppointmentSettingAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const PrudentialPHAppointmentSettingAssessmentMain: React.FC<
  PrudentialPHAppointmentSettingAssessmentMainProps
> = ({ session, translations, localizedModuleName }) => {
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const appointmentSettingData = session?.roleplay?.feedback
    ?.prudentialPHAppointmentSetting
    ? JSON.parse(
        String(session.roleplay.feedback.prudentialPHAppointmentSetting),
      )
    : null;

  // Helper to get section status
  const getSectionStatus = (score: number, maxScore: number = 100) => {
    if (maxScore === 0) return '';
    const percentage = (score / maxScore) * 100;
    let status = translations.beginner || 'Beginner';
    if (percentage >= 67) status = translations.expert || 'Expert';
    else if (percentage >= 34)
      status = translations.intermediate || 'Intermediate';

    if (score > 0) {
      status += ` (${Math.round(percentage)}%)`;
    }

    return status;
  };

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

  // Build prudentialSections for the overview standing display
  const prudentialSections = (appointmentSettingData?.sections || [])
    .filter((s: any) => !s.isMandatory)
    .map((section: any) => ({
      title: section.title,
      score: section.score * 2,
      maxScore: section.maxScore * 2,
      status: getSectionStatus(section.score * 2, section.maxScore * 2),
      isMandatory: false,
      completed: [],
      toImprove: [],
    }));

  // Check mandatory section
  const mandatorySection = appointmentSettingData?.sections?.find(
    (s: any) => s.isMandatory,
  );
  const mandatoryNotMet = mandatorySection ? !mandatorySection.passed : false;

  // Group sections by type for rendering
  const clientVerificationSection = appointmentSettingData?.sections?.find(
    (s: any) =>
      s.title?.toLowerCase().includes('client verification') ||
      s.title?.toLowerCase().includes('verification'),
  );

  const objectionHandlingSection = appointmentSettingData?.sections?.find(
    (s: any) =>
      s.title?.toLowerCase().includes('objection') ||
      s.title?.toLowerCase().includes('handling'),
  );

  return (
    <>
      {/* Overall Section */}
      <PrudentialOverall
        assessmentIdentifiers={assessmentIdentifiers}
        summary={
          appointmentSettingData?.overallFeedback || overview?.summary || ''
        }
        nextSteps={
          appointmentSettingData?.nextSteps ||
          overview?.suggestedNextSteps ||
          []
        }
        translations={translations}
        standing={session?.standing || null}
        mandatoryNotMet={mandatoryNotMet}
        prudentialSections={prudentialSections}
        hideBadge={true}
      />

      {/* Client Verification Section */}
      {clientVerificationSection && clientVerificationSection.why && (
        <PrudentialPHAppointmentSettingSection
          sectionTitle={
            translations.clientVerification || 'Client verification'
          }
          overallScore={clientVerificationSection.score * 2}
          maxScore={clientVerificationSection.maxScore * 2}
          description=""
          sections={[
            {
              title: clientVerificationSection.title,
              score: clientVerificationSection.score * 2,
              maxScore: clientVerificationSection.maxScore * 2,
              status: getSectionStatus(
                clientVerificationSection.score * 2,
                clientVerificationSection.maxScore * 2,
              ),
              why: clientVerificationSection.why,
              suggestion: clientVerificationSection.suggestion,
            },
          ]}
          translations={translations}
        />
      )}

      {/* Objection Handling Section */}
      {objectionHandlingSection && objectionHandlingSection.why && (
        <PrudentialPHAppointmentSettingSection
          sectionTitle={translations.objectionHandling || 'Objection handling'}
          overallScore={objectionHandlingSection.score * 2}
          maxScore={objectionHandlingSection.maxScore * 2}
          description=""
          sections={[
            {
              title: objectionHandlingSection.title,
              score: objectionHandlingSection.score * 2,
              maxScore: objectionHandlingSection.maxScore * 2,
              status: getSectionStatus(
                objectionHandlingSection.score * 2,
                objectionHandlingSection.maxScore * 2,
              ),
              why: objectionHandlingSection.why,
              suggestion: objectionHandlingSection.suggestion,
            },
          ]}
          translations={translations}
        />
      )}
    </>
  );
};

export default PrudentialPHAppointmentSettingAssessmentMain;
