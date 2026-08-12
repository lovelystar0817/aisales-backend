/**
 * Prudential Assessment Main Component
 * Handles data transformation and renders sub-components
 */
import React from 'react';
import PrudentialOverall from './PrudentialOverall.js';
import PrudentialSalesTechnique from './PrudentialSalesTechnique.js';
import PrudentialTechnicalKnowledge from './PrudentialTechnicalKnowledge.js';

interface PrudentialAssessmentMainProps {
  session: any;
  translations: any;
  localizedModuleName: string;
  host?: string;
}

const PrudentialAssessmentMain: React.FC<PrudentialAssessmentMainProps> = ({
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

  const technicalKnowledgeRaw = session?.roleplay?.feedback?.technicalKnowledge
    ? JSON.parse(String(session.roleplay.feedback.technicalKnowledge))
    : null;

  // Check if this is a cold call module
  const isColdCall = session?.module?.friendlyId === 'cold-call';

  // Helper to get section status (matches web PrudentialSessionCard.tsx logic)
  const getSectionStatus = (score: number, sectionType: string = 'default') => {
    if (sectionType === 'clientVerification') {
      return score >= 100 ? translations.completed : translations.incomplete;
    }

    let status = translations.beginner; // Lowest level is Beginner, not Needs Improvement
    if (score >= 67) status = translations.expert;
    else if (score >= 34) status = translations.intermediate;

    // Append percentage like web version does (lines 696-698)
    if (score > 0 && sectionType !== 'clientVerification') {
      status += ` (${Math.round(score)}%)`;
    }

    return status;
  };

  // Transform Prudential sections (for Sales Technique component)
  const prudentialSections = [];

  // All sections including technical knowledge (for Overall component dots)
  const allSectionsForDots = [];

  // 1. Client Verification
  if (salesTechniquesRaw?.clientVerification) {
    const { completedItems = [], toImproveItems = [] } =
      salesTechniquesRaw.clientVerification;
    const totalItems = completedItems.length + toImproveItems.length;
    const score =
      totalItems > 0
        ? Math.round((completedItems.length / totalItems) * 100)
        : 0;

    const clientVerificationSection = {
      title: translations.clientVerification,
      score,
      maxScore: 100,
      status: getSectionStatus(score, 'clientVerification'),
      isMandatory: true,
      completed: completedItems,
      toImprove: toImproveItems,
    };

    prudentialSections.push(clientVerificationSection);
    allSectionsForDots.push(clientVerificationSection);
  }

  // 2. Dynamic Framework Execution
  if (salesTechniquesRaw?.frameworkExecution) {
    const { overallScore, completedItems, toImproveItems } =
      salesTechniquesRaw.frameworkExecution;

    // Use same logic as web frontend: detect call type for framework label
    // Match PrudentialSessionCard.tsx lines 674-677
    const isProductPositioning = session?.callType === 'product-positioning';
    const frameworkTitle = isProductPositioning
      ? translations.threeFExecution || '3F Execution'
      : translations.fourCExecution || '4C Execution';

    const frameworkExecutionSection = {
      title: frameworkTitle,
      score: overallScore,
      maxScore: 100,
      status: getSectionStatus(overallScore, 'frameworkExecution'),
      isMandatory: false,
      completed: completedItems || [],
      toImprove: toImproveItems || [],
    };

    prudentialSections.push(frameworkExecutionSection);
    allSectionsForDots.push(frameworkExecutionSection);
  }

  // 3. Objection Handling
  if (salesTechniquesRaw?.objectionHandling) {
    const {
      overallScore = 0,
      objections = [],
      completedItems = [],
      toImproveItems = [],
    } = salesTechniquesRaw.objectionHandling;

    // Extract feedback from objections array
    const objectionToImprove = objections
      .filter((o: any) => !o.isSuccessful)
      .map((o: any) => o.feedback);

    const objectionCompleted = objections
      .filter((o: any) => o.isSuccessful)
      .map((o: any) => o.feedback);

    // Combine direct arrays with objection-extracted feedback
    const completed = [...completedItems, ...objectionCompleted].filter(
      Boolean,
    );
    const toImprove = [...toImproveItems, ...objectionToImprove].filter(
      Boolean,
    );

    const objectionHandlingSection = {
      title: translations.objectionHandling,
      score: overallScore,
      maxScore: 100,
      status: getSectionStatus(overallScore, 'objectionHandling'),
      isMandatory: false,
      completed,
      toImprove,
    };

    prudentialSections.push(objectionHandlingSection);
    allSectionsForDots.push(objectionHandlingSection);
  }

  // Transform Technical Knowledge sections (only if not cold call)
  const technicalSections = [];

  if (!isColdCall && technicalKnowledgeRaw) {
    // Product Knowledge
    if (technicalKnowledgeRaw.productKnowledge) {
      const {
        overallScore = 0,
        completedItems = [],
        toImproveItems = [],
      } = technicalKnowledgeRaw.productKnowledge;

      const productKnowledgeSection = {
        title: translations.productKnowledge || 'Product Knowledge',
        score: overallScore,
        maxScore: 100,
        status: getSectionStatus(overallScore, 'default'),
        completed: completedItems,
        toImprove: toImproveItems,
      };

      technicalSections.push(productKnowledgeSection);
      // Add to dots display but NOT to prudentialSections (to avoid duplication in Sales Technique section)
      allSectionsForDots.push(productKnowledgeSection);
    }

    // Operational Knowledge
    if (technicalKnowledgeRaw.operationalKnowledge) {
      const {
        overallScore = 0,
        completedItems = [],
        toImproveItems = [],
      } = technicalKnowledgeRaw.operationalKnowledge;

      const operationalKnowledgeSection = {
        title: translations.operationalKnowledge || 'Operational Knowledge',
        score: overallScore,
        maxScore: 100,
        status: getSectionStatus(overallScore, 'default'),
        completed: completedItems,
        toImprove: toImproveItems,
      };

      technicalSections.push(operationalKnowledgeSection);
      // Add to dots display but NOT to prudentialSections (to avoid duplication in Sales Technique section)
      allSectionsForDots.push(operationalKnowledgeSection);
    }
  }

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

  const mandatoryNotMet =
    salesTechniquesRaw?.clientVerification &&
    !salesTechniquesRaw.clientVerification.completed;

  return (
    <>
      {/* Overall Section */}
      <PrudentialOverall
        assessmentIdentifiers={assessmentIdentifiers}
        summary={overview?.summary || ''}
        nextSteps={overview?.suggestedNextSteps || []}
        translations={translations}
        standing={session?.standing || null}
        mandatoryNotMet={mandatoryNotMet}
        prudentialSections={allSectionsForDots}
      />

      {/* Sales Technique Section */}
      {salesTechniquesRaw && (
        <PrudentialSalesTechnique
          overallScore={salesTechniquesRaw.overallScore || 0}
          maxScore={100}
          description={
            salesTechniquesRaw.description ||
            translations.salesTechniqueDescription
          }
          sections={prudentialSections}
          translations={translations}
        />
      )}

      {/* Technical Knowledge Section (only if not cold call) */}
      {!isColdCall && technicalSections.length > 0 && (
        <PrudentialTechnicalKnowledge
          sections={technicalSections}
          translations={translations}
          description={
            technicalKnowledgeRaw?.description ||
            translations.technicalKnowledgeDescription
          }
        />
      )}
    </>
  );
};

export default PrudentialAssessmentMain;
