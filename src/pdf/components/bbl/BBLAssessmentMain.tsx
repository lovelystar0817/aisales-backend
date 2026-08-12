/**
 * BBL Assessment Main Component
 * Handles data transformation and renders sub-components
 */
import React from 'react';
import BBLOverall from './BBLOverall.js';
import BBLAdvisoryTechnique from './BBLAdvisoryTechnique.js';
import BBLProcessAdherence from './BBLProcessAdherence.js';
import { CallType } from '../../../models/SalesSession.js';

interface BBLAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const BBLAssessmentMain: React.FC<BBLAssessmentMainProps> = ({
  session,
  translations,
  localizedModuleName,
}) => {
  // Parse feedback data
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  // BBL uses advisoryTechnique and processAdherence fields
  const advisoryTechniqueRaw = session?.roleplay?.feedback?.advisoryTechnique
    ? JSON.parse(String(session.roleplay.feedback.advisoryTechnique))
    : null;

  const processAdherenceRaw = session?.roleplay?.feedback?.processAdherence
    ? JSON.parse(String(session.roleplay.feedback.processAdherence))
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

  const isColdCall = session?.callType === CallType.COLD_CALL;

  return (
    <>
      {/* Overall Section */}
      <BBLOverall
        salesTechniqueScore={advisoryTechniqueRaw?.overallScore}
        productKnowledgeScore={processAdherenceRaw?.overallScore}
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
      />

      {/* Advisory Technique Section */}
      {advisoryTechniqueRaw && (
        <BBLAdvisoryTechnique
          overallScore={advisoryTechniqueRaw.overallScore || 0}
          maxScore={advisoryTechniqueRaw.maxScore || 100}
          description={
            advisoryTechniqueRaw.description ||
            translations.advisoryTechniqueDescription
          }
          sections={advisoryTechniqueRaw.sections || []}
          translations={translations}
        />
      )}

      {/* Process Adherence Section */}
      {!isColdCall && processAdherenceRaw && (
        <BBLProcessAdherence
          overallScore={processAdherenceRaw.overallScore || 0}
          maxScore={processAdherenceRaw.maxScore || 100}
          description={
            processAdherenceRaw.description ||
            translations.processAdherenceDescription
          }
          sections={processAdherenceRaw.sections || []}
          translations={translations}
        />
      )}
    </>
  );
};

export default BBLAssessmentMain;
