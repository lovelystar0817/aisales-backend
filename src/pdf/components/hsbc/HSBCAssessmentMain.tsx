/**
 * HSBC Assessment Main Component
 * Handles data transformation and renders sub-components
 */
import React from 'react';
import HSBCOverall from './HSBCOverall.js';
import HSBCRelationshipManagement from './HSBCRelationshipManagement.js';
import HSBCProcessAdherence from './HSBCProcessAdherence.js';
import HSBCRepresentation from './HSBCRepresentation.js';
import HSBCCommunicationAndPresence from './HSBCCommunicationAndPresence.js';
import { CallType } from '../../../models/SalesSession.js';

interface HSBCAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const HSBCAssessmentMain: React.FC<HSBCAssessmentMainProps> = ({
  session,
  translations,
  localizedModuleName,
}) => {
  // Parse feedback data
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  // HSBC assessment fields
  const relationshipManagementRaw = session?.roleplay?.feedback
    ?.relationshipManagement
    ? JSON.parse(String(session.roleplay.feedback.relationshipManagement))
    : null;

  const processAdherenceRaw = session?.roleplay?.feedback?.processAdherence
    ? JSON.parse(String(session.roleplay.feedback.processAdherence))
    : null;

  const representationRaw = session?.roleplay?.feedback?.representation
    ? JSON.parse(String(session.roleplay.feedback.representation))
    : null;

  const communicationAndPresenceRaw = session?.roleplay?.feedback
    ?.communicationAndPresence
    ? JSON.parse(String(session.roleplay.feedback.communicationAndPresence))
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
      <HSBCOverall
        relationshipManagementScore={relationshipManagementRaw?.overallScore}
        hsbcProcessAdherenceScore={processAdherenceRaw?.overallScore}
        representationScore={representationRaw?.overallScore}
        communicationAndPresenceScore={
          communicationAndPresenceRaw?.overallScore
        }
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
      />

      {/* Relationship Management Section */}
      {relationshipManagementRaw && (
        <HSBCRelationshipManagement
          overallScore={relationshipManagementRaw.overallScore || 0}
          maxScore={relationshipManagementRaw.maxScore || 100}
          description={
            relationshipManagementRaw.description ||
            translations.relationshipManagementDescription
          }
          sections={relationshipManagementRaw.sections || []}
          translations={translations}
        />
      )}

      {/* Process Adherence Section */}
      {processAdherenceRaw && (
        <HSBCProcessAdherence
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

      {/* Representation Section */}
      {representationRaw && (
        <HSBCRepresentation
          overallScore={representationRaw.overallScore || 0}
          maxScore={representationRaw.maxScore || 100}
          description={
            representationRaw.description ||
            translations.relationshipManagementDescription
          }
          sections={representationRaw.sections || []}
          why={representationRaw.why}
          suggestion={representationRaw.suggestion}
          title={representationRaw.title}
          translations={translations}
        />
      )}

      {/* Communication and Presence Section */}
      {communicationAndPresenceRaw && (
        <HSBCCommunicationAndPresence
          overallScore={communicationAndPresenceRaw.overallScore || 0}
          maxScore={communicationAndPresenceRaw.maxScore || 100}
          description={
            communicationAndPresenceRaw.description ||
            translations.communicationAndPresenceDescription
          }
          sections={communicationAndPresenceRaw.sections || []}
          translations={translations}
        />
      )}
    </>
  );
};

export default HSBCAssessmentMain;
