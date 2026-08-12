import { ChatOpenAI } from '@langchain/openai';
import { callbackHandler } from '../../libs/langchain.js';
import { HttpError } from '../errors.js';
import { parseResponse } from '../json.js';
import { LangChainCallbackHandler } from '@posthog/ai';
import { SalesSession } from '../../models/SalesSession.js';
import { Message } from '../../models/Message.js';
import { OPENAI_MODEL_GPT_4_1 } from '../constants.js';
import { isSessionTooBrief } from '../session.js';
import { getLanguageName } from '../languages.js';
import { SalesFeedbackInput } from './regular.js';
import {
  getHSBCAdvisoryTechniquePrompt,
  getHSBCCommunicationAndPresencePrompt,
  getHSBCProcessAdherencePrompt,
  getHSBCRepresentationPrompt,
} from '../../prompts/hsbc/index.js';
import { formatPersonaProfile } from '../assessment.js';

// Generate HSBC Advisory Technique assessment (replaces Sales Technique)
export const generateHSBCAdvisoryTechnique = async (
  param: SalesFeedbackInput & {
    callback: LangChainCallbackHandler;
    personaProfile?: string;
  },
) => {
  try {
    const {
      callType,
      scenario,
      objectives,
      framework,
      messages,
      characterName,
      callback,
      languageCode,
      productInfo,
      personaProfile = '',
    } = param;

    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });

    const prompt = getHSBCAdvisoryTechniquePrompt(
      characterName,
      framework,
      getLanguageName(languageCode),
    );

    const conversationContext = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const extraContext = `${productInfo}${personaProfile}`;

    const formattedPrompt = await prompt.format({
      callType,
      scenario,
      objectives: objectives.join('\n'),
      framework,
      transcript: conversationContext,
      extraContext,
    });

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: [callback],
    });

    let techniqueData;
    try {
      techniqueData = parseResponse(response);
    } catch (error) {
      console.error('Failed to parse HSBC advisory technique response:', error);
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in HSBC advisory technique response',
      );
    }

    console.log('generateHSBCAdvisoryTechnique techniqueData:', techniqueData);

    return techniqueData.advisoryTechnique;
  } catch (error) {
    console.error(
      'Error generating HSBC advisory technique assessment:',
      error,
    );
    throw new HttpError(
      500,
      'HSBC advisory technique assessment generation failed',
    );
  }
};

// Generate HSBC Communication and Presence assessment (replaces Product Knowledge)
export const generateHSBCCommunicationAndPresence = async ({
  callType,
  scenario,
  objectives,
  framework,
  messages,
  characterName,
  callback,
  languageCode,
  productInfo,
  product,
  personaProfile = '',
}: SalesFeedbackInput & {
  callback: LangChainCallbackHandler;
  personaProfile?: string;
}) => {
  try {
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const prompt = getHSBCCommunicationAndPresencePrompt({
      characterName,
      language: getLanguageName(languageCode),
      evaluationFocus: product?.evaluationFocus?.join('\n'),
      productName: product?.name,
      productInformation: product?.knowledgePrompt,
      framework,
    });

    const conversationContext = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      callType,
      scenario,
      objectives: objectives.join('\n'),
      framework,
      transcript: conversationContext,
      productInfo: `${productInfo}${personaProfile}`,
    });

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: [callback],
    });

    let communicationAndPresenceData;
    try {
      communicationAndPresenceData = parseResponse(response);
    } catch (error) {
      console.error(
        'Failed to parse HSBC communication and presence response:',
        error,
      );
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in HSBC communication and presence response',
      );
    }

    return communicationAndPresenceData.communicationAndPresence;
  } catch (error) {
    console.error(
      'Error generating HSBC communication and presence assessment:',
      error,
    );
    throw new HttpError(
      500,
      'HSBC communication and presence assessment generation failed',
    );
  }
};

// Job function for generating HSBC advisory technique assessment (like generateSalesTechniqueJob)
export const generateHSBCAdvisoryTechniqueJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting HSBC advisory technique generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if assessment already exists
    if (session.roleplay.feedback?.advisoryTechnique) {
      console.log(
        `HSBC advisory technique already exists for session: ${sessionId}`,
      );
      // Clear generating flag if data exists
      await session.updateOne({
        $set: { 'roleplay.feedback.advisoryTechniqueGenerating': false },
      });
      return;
    }

    // Mark as generating
    await session.updateOne({
      $set: { 'roleplay.feedback.advisoryTechniqueGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for HSBC advisory technique assessment: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.advisoryTechniqueGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const callback = callbackHandler({
      userId: session.user?.toString(),
      sessionId: session.id,
      type: 'hsbc_advisory_technique_assessment',
    });

    // Format persona profile for context
    const personaProfile = formatPersonaProfile(session.persona);

    // Generate assessment
    const advisoryTechnique = await generateHSBCAdvisoryTechnique({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives || [],
      framework,
      messages,
      characterName: session.persona?.name || 'Client',
      callback,
      languageCode,
      productInfo: '',
      product: session.product,
      sessionId: session._id.toString(),
      personaProfile,
    });

    if (advisoryTechnique) {
      await session.updateOne({
        $set: {
          'roleplay.feedback.advisoryTechnique':
            JSON.stringify(advisoryTechnique),
          'roleplay.feedback.advisoryTechniqueGenerating': false,
        },
      });
      console.log(
        `HSBC advisory technique generated for session: ${sessionId}`,
      );
    } else {
      await session.updateOne({
        $set: { 'roleplay.feedback.advisoryTechniqueGenerating': false },
      });
    }
  } catch (error) {
    console.error('HSBC advisory technique generation failed:', error);
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.advisoryTechniqueGenerating': false },
    }).catch(console.error);
  }
};

// Job function for generating HSBC communication and presence assessment (like generateProductKnowledgeJob)
export const generateHSBCCommunicationAndPresenceJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting HSBC communication and presence generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if assessment already exists
    if (session.roleplay.feedback?.communicationAndPresence) {
      console.log(
        `HSBC communication and presence already exists for session: ${sessionId}`,
      );
      // Clear generating flag if data exists
      await session.updateOne({
        $set: { 'roleplay.feedback.communicationAndPresenceGenerating': false },
      });
      return;
    }

    // Mark as generating
    await session.updateOne({
      $set: { 'roleplay.feedback.communicationAndPresenceGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ createdAt: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for HSBC communication and presence assessment: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.communicationAndPresenceGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const callback = callbackHandler({
      userId: session.user?.toString(),
      sessionId: session.id,
      type: 'hsbc_communication_and_presence_assessment',
    });

    // Format persona profile for context
    const personaProfile = formatPersonaProfile(session.persona);

    // Generate assessment
    const communicationAndPresence = await generateHSBCCommunicationAndPresence(
      {
        callType: session.callType,
        scenario: session.roleplay.title || '',
        objectives: session.roleplay.objectives || [],
        framework,
        messages,
        characterName: session.persona?.name || 'Client',
        callback,
        languageCode,
        productInfo: '',
        product: session.product,
        personaProfile,
      },
    );

    if (communicationAndPresence) {
      await session.updateOne({
        $set: {
          'roleplay.feedback.communicationAndPresence': JSON.stringify(
            communicationAndPresence,
          ),
          'roleplay.feedback.communicationAndPresenceGenerating': false,
        },
      });
      console.log(
        `HSBC communication and presence generated for session: ${sessionId}`,
      );
    } else {
      await session.updateOne({
        $set: { 'roleplay.feedback.communicationAndPresenceGenerating': false },
      });
    }
  } catch (error) {
    console.error('HSBC communication and presence generation failed:', error);
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.communicationAndPresenceGenerating': false },
    }).catch(console.error);
  }
};

// Generate HSBC Process Adherence assessment
export const generateHSBCProcessAdherence = async ({
  callType,
  scenario,
  objectives,
  framework,
  messages,
  characterName,
  callback,
  languageCode,
  productInfo,
  product,
  personaProfile = '',
}: SalesFeedbackInput & {
  callback: LangChainCallbackHandler;
  personaProfile?: string;
}) => {
  try {
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const prompt = getHSBCProcessAdherencePrompt({
      characterName,
      language: getLanguageName(languageCode),
      evaluationFocus: product?.evaluationFocus?.join('\n'),
      productName: product?.name,
      productInformation: product?.knowledgePrompt,
      framework,
    });

    const conversationContext = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      callType,
      scenario,
      objectives: objectives.join('\n'),
      framework,
      transcript: conversationContext,
      productInfo: `${productInfo}${personaProfile}`,
    });

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: [callback],
    });

    let processAdherenceData;
    try {
      processAdherenceData = parseResponse(response);
    } catch (error) {
      console.error('Failed to parse HSBC process adherence response:', error);
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in HSBC process adherence response',
      );
    }

    return processAdherenceData.processAdherence;
  } catch (error) {
    console.error('Error generating HSBC process adherence assessment:', error);
    throw new HttpError(
      500,
      'HSBC process adherence assessment generation failed',
    );
  }
};

// Generate HSBC Representation assessment
export const generateHSBCRepresentation = async ({
  callType,
  scenario,
  objectives,
  framework,
  messages,
  characterName,
  callback,
  languageCode,
  productInfo,
  personaProfile = '',
}: SalesFeedbackInput & {
  callback: LangChainCallbackHandler;
  personaProfile?: string;
}) => {
  try {
    const model = new ChatOpenAI({ modelName: OPENAI_MODEL_GPT_4_1 });
    const prompt = getHSBCRepresentationPrompt({
      characterName,
      language: getLanguageName(languageCode),
      framework,
    });

    const conversationContext = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .filter(Boolean)
      .join('\n');

    const formattedPrompt = await prompt.format({
      callType,
      scenario,
      objectives: objectives.join('\n'),
      framework,
      transcript: conversationContext,
      productInfo: `${productInfo}${personaProfile}`,
    });

    const response: any = await model.invoke(formattedPrompt, {
      callbacks: [callback],
    });

    let representationData;
    try {
      representationData = parseResponse(response);
    } catch (error) {
      console.error('Failed to parse HSBC representation response:', error);
      console.log('response.content:', response.content);
      throw new HttpError(
        500,
        'Invalid JSON format in HSBC representation response',
      );
    }

    return representationData.representation;
  } catch (error) {
    console.error('Error generating HSBC representation assessment:', error);
    throw new HttpError(
      500,
      'HSBC representation assessment generation failed',
    );
  }
};

// Job function for generating HSBC relationship management (maps to advisory technique)
export const generateHSBCRelationshipManagementJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting HSBC relationship management generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if assessment already exists
    if (session.roleplay.feedback?.relationshipManagement) {
      console.log(
        `HSBC relationship management already exists for session: ${sessionId}`,
      );
      // Clear generating flag if data exists
      await session.updateOne({
        $set: {
          'roleplay.feedback.isHsbcRelationshipManagementGenerating': false,
        },
      });
      return;
    }

    // Mark as generating
    await session.updateOne({
      $set: {
        'roleplay.feedback.isHsbcRelationshipManagementGenerating': true,
      },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for HSBC relationship management assessment: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: {
          'roleplay.feedback.isHsbcRelationshipManagementGenerating': false,
        },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const callback = callbackHandler({
      userId: session.user?.toString(),
      sessionId: session.id,
      type: 'hsbc_relationship_management_assessment',
    });

    // Format persona profile for context
    const personaProfile = formatPersonaProfile(session.persona);

    // Generate assessment using advisory technique
    const relationshipManagement = await generateHSBCAdvisoryTechnique({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives || [],
      framework,
      messages,
      characterName: session.persona?.name || 'Client',
      callback,
      languageCode,
      productInfo: '',
      product: session.product,
      sessionId: session._id.toString(),
      personaProfile,
    });

    if (relationshipManagement) {
      await session.updateOne({
        $set: {
          'roleplay.feedback.relationshipManagement': JSON.stringify(
            relationshipManagement,
          ),
          'roleplay.feedback.isHsbcRelationshipManagementGenerating': false,
        },
      });
      console.log(
        `HSBC relationship management generated for session: ${sessionId}`,
      );
    } else {
      await session.updateOne({
        $set: {
          'roleplay.feedback.isHsbcRelationshipManagementGenerating': false,
        },
      });
    }
  } catch (error) {
    console.error('HSBC relationship management generation failed:', error);
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: {
        'roleplay.feedback.isHsbcRelationshipManagementGenerating': false,
      },
    }).catch(console.error);
  }
};

// Job function for generating HSBC process adherence
export const generateHSBCProcessAdherenceJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting HSBC process adherence generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if assessment already exists
    if (session.roleplay.feedback?.processAdherence) {
      console.log(
        `HSBC process adherence already exists for session: ${sessionId}`,
      );
      // Clear generating flag if data exists
      await session.updateOne({
        $set: { 'roleplay.feedback.isHsbcProcessAdherenceGenerating': false },
      });
      return;
    }

    // Mark as generating
    await session.updateOne({
      $set: { 'roleplay.feedback.isHsbcProcessAdherenceGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for HSBC process adherence assessment: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.isHsbcProcessAdherenceGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const callback = callbackHandler({
      userId: session.user?.toString(),
      sessionId: session.id,
      type: 'hsbc_process_adherence_assessment',
    });

    // Format persona profile for context
    const personaProfile = formatPersonaProfile(session.persona);

    // Generate assessment
    const processAdherence = await generateHSBCProcessAdherence({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives || [],
      framework,
      messages,
      characterName: session.persona?.name || 'Client',
      callback,
      languageCode,
      productInfo: '',
      product: session.product,
      personaProfile,
    });

    if (processAdherence) {
      await session.updateOne({
        $set: {
          'roleplay.feedback.processAdherence':
            JSON.stringify(processAdherence),
          'roleplay.feedback.isHsbcProcessAdherenceGenerating': false,
        },
      });
      console.log(`HSBC process adherence generated for session: ${sessionId}`);
    } else {
      await session.updateOne({
        $set: { 'roleplay.feedback.isHsbcProcessAdherenceGenerating': false },
      });
    }
  } catch (error) {
    console.error('HSBC process adherence generation failed:', error);
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.isHsbcProcessAdherenceGenerating': false },
    }).catch(console.error);
  }
};

// Job function for generating HSBC representation
export const generateHSBCRepresentationJob = async (job: any) => {
  const { sessionId, languageCode = 'en' } = job.attrs.data;

  console.log(
    `Starting HSBC representation generation job for session: ${sessionId}`,
  );

  try {
    const session = await SalesSession.findById(sessionId)
      .populate('product')
      .populate('user')
      .orFail();

    if (!session.roleplay) {
      console.log(`No roleplay found for session: ${sessionId}`);
      return;
    }

    // Check if assessment already exists
    if (session.roleplay.feedback?.representation) {
      console.log(
        `HSBC representation already exists for session: ${sessionId}`,
      );
      // Clear generating flag if data exists
      await session.updateOne({
        $set: { 'roleplay.feedback.isHsbcRepresentationGenerating': false },
      });
      return;
    }

    // Mark as generating
    await session.updateOne({
      $set: { 'roleplay.feedback.isHsbcRepresentationGenerating': true },
    });

    const messages = await Message.find({
      _id: { $in: session.messages },
      content: { $exists: true },
    })
      .sort({ sent: 1 })
      .select('role content');

    if (isSessionTooBrief(messages)) {
      console.log(
        `Session too brief for HSBC representation assessment: ${sessionId}`,
      );
      // Clear generating flag
      await session.updateOne({
        $set: { 'roleplay.feedback.isHsbcRepresentationGenerating': false },
      });
      return;
    }

    const framework = session.roleplay.framework ?? 'DEFAULT_FRAMEWORK';
    const callback = callbackHandler({
      userId: session.user?.toString(),
      sessionId: session.id,
      type: 'hsbc_representation_assessment',
    });

    // Format persona profile for context
    const personaProfile = formatPersonaProfile(session.persona);

    // Generate assessment
    const representation = await generateHSBCRepresentation({
      callType: session.callType,
      scenario: session.roleplay.title || '',
      objectives: session.roleplay.objectives || [],
      framework,
      messages,
      characterName: session.persona?.name || 'Client',
      callback,
      languageCode,
      productInfo: '',
      product: session.product,
      personaProfile,
    });

    if (representation) {
      await session.updateOne({
        $set: {
          'roleplay.feedback.representation': JSON.stringify(representation),
          'roleplay.feedback.isHsbcRepresentationGenerating': false,
        },
      });
      console.log(`HSBC representation generated for session: ${sessionId}`);
    } else {
      await session.updateOne({
        $set: { 'roleplay.feedback.isHsbcRepresentationGenerating': false },
      });
    }
  } catch (error) {
    console.error('HSBC representation generation failed:', error);
    // Clear generating flag on error
    await SalesSession.findByIdAndUpdate(sessionId, {
      $set: { 'roleplay.feedback.isHsbcRepresentationGenerating': false },
    }).catch(console.error);
  }
};
