/**
 * Manulife Assessment Main Component
 * Handles data transformation and renders sub-components
 */
import React from 'react';
import MSIGOverall from '../msig/MSIGOverall.js'; // Manulife uses same Overview as MSIG
import ManulifeSalesTechnique from './ManulifeSalesTechnique.js';
import { MANULIFE_SECTION_ORDER } from '../../services/constants.js';
import { SalesTechniqueSection } from '../../services/types.js';

interface ManulifeAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const ManulifeAssessmentMain: React.FC<ManulifeAssessmentMainProps> = ({
  session,
  translations,
  localizedModuleName,
}) => {
  // Parse feedback data
  const overview = session?.roleplay?.feedback?.overview
    ? JSON.parse(String(session.roleplay.feedback.overview))
    : null;

  const salesTechniquesRaw = session?.roleplay?.feedback?.salesTechniques
    ? JSON.parse(String(session.roleplay.feedback.salesTechniques))
    : null;

  // Transform Manulife sections
  const MANULIFE_SECTIONS = MANULIFE_SECTION_ORDER.map(
    (section) => section.key,
  );
  const manulifeSections = MANULIFE_SECTIONS.map((sectionKey: string) => {
    const sectionData = salesTechniquesRaw?.sections[sectionKey];
    if (!sectionData) return null;

    const passedCriteria = sectionData.evaluations.filter(
      (criteria: any) => criteria.pass === true,
    );
    const failedCriteria = sectionData.evaluations.filter(
      (criteria: any) => criteria.pass === false,
    );

    return {
      title: MANULIFE_SECTION_ORDER.find((s) => s.key === sectionKey)?.title,
      score: passedCriteria.length,
      maxScore: sectionData.evaluations.length,
      notApplicable: sectionData.notApplicable,
      completed: passedCriteria,
      toImprove: failedCriteria,
      evaluations: sectionData.evaluations,
    };
  }).filter(Boolean) as SalesTechniqueSection[];

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
        mandatoryNotMet={false} // Manulife doesn't have mandatory failures
      />

      {/* Sales Technique Section */}
      {salesTechniquesRaw && (
        <ManulifeSalesTechnique
          overallScore={salesTechniquesRaw.overallScore || 0}
          maxScore={100}
          description={
            salesTechniquesRaw.description ||
            translations.salesTechniqueDescription
          }
          sections={manulifeSections}
          translations={translations}
        />
      )}
    </>
  );
};

export default ManulifeAssessmentMain;
