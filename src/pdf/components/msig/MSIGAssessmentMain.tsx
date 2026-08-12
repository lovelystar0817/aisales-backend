/**
 * MSIG Assessment Main Component
 * Handles data transformation and renders sub-components
 */
import React from 'react';
import MSIGOverall from './MSIGOverall.js';
import MSIGSalesTechnique from './MSIGSalesTechnique.js';
import { MSIG_SECTION_ORDER } from '../../services/constants.js';
import { SalesTechniqueSection } from '../../services/types.js';

interface MSIGAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const MSIGAssessmentMain: React.FC<MSIGAssessmentMainProps> = ({
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

  // Transform MSIG sections
  const MSIG_SECTIONS = MSIG_SECTION_ORDER.map((section) => section.key);
  const msigSections = MSIG_SECTIONS.map((sectionKey: string) => {
    const sectionData = salesTechniquesRaw?.sections[sectionKey];
    if (!sectionData) return null;

    const passedCriteria = sectionData.evaluations.filter(
      (criteria: any) => criteria.pass === true,
    );
    const failedCriteria = sectionData.evaluations.filter(
      (criteria: any) => criteria.pass === false,
    );

    return {
      title: (translations as any)?.[sectionKey],
      score: passedCriteria.length,
      maxScore: sectionData.evaluations.length,
      isMandatory: true,
      notApplicable: sectionData.notApplicable,
      completed: passedCriteria,
      toImprove: failedCriteria,
      evaluations: sectionData.evaluations,
      hasFailedMandatory:
        failedCriteria.length > 0 &&
        failedCriteria.some((evaluation: any) => evaluation.mandatory === true),
      hasFailedItem: passedCriteria.length < sectionData.evaluations.length,
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

  const mandatoryNotMet = msigSections.some(
    (section: any) => !section?.notApplicable && section.hasFailedMandatory,
  );

  return (
    <>
      {/* Overall Section */}
      <MSIGOverall
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
        mandatoryNotMet={mandatoryNotMet}
      />

      {/* Sales Technique Section */}
      {salesTechniquesRaw && (
        <MSIGSalesTechnique
          overallScore={salesTechniquesRaw.overallScore || 0}
          maxScore={100}
          description={
            salesTechniquesRaw.description ||
            translations.salesTechniqueDescription
          }
          sections={msigSections}
          translations={translations}
        />
      )}
    </>
  );
};

export default MSIGAssessmentMain;
