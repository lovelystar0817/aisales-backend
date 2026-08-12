import { Job } from '@hokify/agenda';
import { isProd } from '../../env.js';
import { WebClient } from '@slack/web-api';
import {
  HUPO_COMPANY_ID,
  SLACK_REPORTER_CHANNEL_ID,
  SLACK_REPORT_TYPES,
  SLACK_USER_BELLA,
  SLACK_USER_GROUP_PRODUCT_ID,
  SLACK_USER_KELLY,
  START_END_NOTIFICATIONS_OFF_COMPANIES,
} from '../../utils/constants.js';
import { getLanguageName } from '../../utils/languages.js';
import { addEnglishTranslationsToResponses } from '../../utils/feedback-translation.js';

type Data = any;

type Handler = (job: Job<Data>) => Promise<void>;

export const postSlackReport: Handler = async (job) => {
  const { data } = job.attrs;

  const slackClient = new WebClient(process.env.REPORTING_SLACK_BOT_TOKEN);

  if (!isProd) {
    console.log('Ignoring postSlackReport, since not in production', { data });
    return;
  }
  const { type, payload } = data;
  if (!type || !payload) {
    console.log('Ignoring postSlackReport, since type or payload is missing');
    return;
  }
  if (payload.company?._id?.toString() === HUPO_COMPANY_ID) {
    console.log('Ignoring postSlackReport for Hupo users', { data });
    return;
  }
  let channel = payload.channel;
  let text = '';
  switch (type) {
    case SLACK_REPORT_TYPES.USER_ONBOARDED_REPORT: {
      const { user, company } = payload;
      text = `New user signed up: ${user.email} (${user.name}) from company: ${company.name}`;
      break;
    }
    case SLACK_REPORT_TYPES.SESSION_FEEDBACK_SUBMITTED: {
      const {
        user,
        company,
        responses,
        conversation,
        link,
        language,
        persona,
        module,
        product,
      } = payload;

      const responsesWithTranslations = await addEnglishTranslationsToResponses(
        responses,
        language,
      );

      // Format ElevenLabs link to prevent unfurling
      const conversationLink = conversation
        ? `\`${conversation}\`` // Wrap in backticks to prevent unfurling
        : null;

      const languageName = getLanguageName(language);

      text = [
        `User submitted feedback:`,
        `- Name: ${user.name} (${user.email})`,
        `- Company: ${company.name}`,
        ...(languageName ? [`- Language: ${languageName}`] : []),
        ...(persona ? [`- Persona: ${persona}`] : []),
        ...(module ? [`- Module: ${module}`] : []),
        ...(product ? [`- Product: ${product}`] : []),
        `- Responses:`,
        ...responsesWithTranslations.map(
          (response: { question: string; answer: string }) =>
            `      - ${response.question}: ${response.answer}`,
        ),
        ...(conversationLink ? [`- Conversation: ${conversationLink}`] : []),
        ...(link ? [`- Link: ${link}`] : []),
        '',
        `${SLACK_USER_GROUP_PRODUCT_ID}${SLACK_USER_KELLY}${SLACK_USER_BELLA}`,
      ].join('\n');
      break;
    }
    case SLACK_REPORT_TYPES.CALL_ANALYSIS_FEEDBACK_SUBMITTED: {
      const { user, company, responses, audioFileName, language } = payload;

      const responsesWithTranslations = await addEnglishTranslationsToResponses(
        responses,
        language,
      );

      const languageName = getLanguageName(language);

      text = [
        `User submitted call analysis feedback:`,
        `- Name: ${user.name} (${user.email})`,
        `- Company: ${company.name}`,
        ...(languageName ? [`- Language: ${languageName}`] : []),
        `- Audio File: ${audioFileName}`,
        `- Responses:`,
        ...responsesWithTranslations.map(
          (response: { question: string; answer: string }) =>
            `      - ${response.question}: ${response.answer}`,
        ),
        '',
        `${SLACK_USER_GROUP_PRODUCT_ID}${SLACK_USER_KELLY}${SLACK_USER_BELLA}`,
      ].join('\n');
      break;
    }
    case SLACK_REPORT_TYPES.ROLEPLAY_STARTED: {
      const { user, company, link, callType, product } = payload;
      // Skip notifications for companies in the exclusion list
      if (
        START_END_NOTIFICATIONS_OFF_COMPANIES.includes(company._id?.toString())
      ) {
        console.log('Ignoring Slack notification for roleplay started event', {
          company: company.name,
        });
        return;
      }
      text = [
        `New roleplay has started:`,
        `- Name: ${user.name} (${user.email})`,
        `- Company: ${company.name}`,
        `- Call Type: ${callType}`,
        `- Product: ${product}`,
        `- Link: ${link}`,
      ].join('\n');
      break;
    }
    case SLACK_REPORT_TYPES.ROLEPLAY_ENDED: {
      const { user, company, callType, link, product, conversation } = payload;
      // Skip notifications for companies in the exclusion list
      if (
        START_END_NOTIFICATIONS_OFF_COMPANIES.includes(company._id?.toString())
      ) {
        console.log('Ignoring Slack notification for roleplay ended event', {
          company: company.name,
        });
        return;
      }
      // Format ElevenLabs link to prevent unfurling
      const conversationLink = conversation
        ? `\`${conversation}\`` // Wrap in backticks to prevent unfurling
        : null;

      text = [
        'Voice roleplay session has ended:',
        `- Name: ${user.name} (${user.email})`,
        `- Company: ${company.name}`,
        `- Scenario: ${callType}`,
        `- Link: ${link}`,
        ...(conversationLink ? [`- Conversation: ${conversationLink}`] : []),
      ].join('\n');
      break;
    }
    case SLACK_REPORT_TYPES.AUTH0_ERROR: {
      text = [
        'Auth0 error occured:',
        `- Error: ${payload.error}`,
        `- Description: ${payload.error_description}`,
        '- Full JSON dump:',
        '```' + JSON.stringify(payload, null, 2) + '```',
        '',
        `${SLACK_USER_GROUP_PRODUCT_ID}`,
      ].join('\n');
      break;
    }
    case SLACK_REPORT_TYPES.ISSUE_REPORT_SUBMITTED: {
      const { reporter, reporterType, company, issueReport } = payload;
      text = [
        `User reported an issue:`,
        `- Name: ${reporter.name} - ${reporter.email} (${reporterType})`,
        `- Company: ${company.name}`,
        `- Issue ID: ${issueReport.id}`,
        `- Description: ${issueReport.description}`,
        ...(issueReport.url ? [`- URL: ${issueReport.url}`] : []),
        `- Reported at: ${issueReport.createdAt}`,
        '',
        `${SLACK_USER_GROUP_PRODUCT_ID}${SLACK_USER_KELLY}${SLACK_USER_BELLA}`,
      ].join('\n');
      break;
    }
    default:
      console.log('Ignoring postSlackReport, since type is not recognized', {
        type,
      });
      break;
  }
  try {
    const channelsToPost: string[] = [channel || SLACK_REPORTER_CHANNEL_ID];
    channelsToPost.forEach(async (channelId: string) => {
      try {
        const result = await slackClient.chat.postMessage({
          token: process.env.REPORTING_SLACK_BOT_TOKEN,
          channel: channelId,
          ...(text && { text }),
          attachments: [],
          unfurl_links: false,
          unfurl_media: false,
        });
        console.log('slack post result:', {
          ok: result.ok,
          channel: result.channel,
        });
      } catch (error) {
        console.warn('Error posting to slack', error);
        console.log({
          token: process.env.REPORTING_SLACK_BOT_TOKEN,
          channel: channelId,
          ...(text && { text }),
        });
      }
    });
  } catch (error) {
    console.error('Error sending slack message', error);
  }
};
