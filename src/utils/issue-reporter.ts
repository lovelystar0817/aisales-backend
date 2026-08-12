import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IssueReport } from '../models/IssueReport.js';
import { getAgenda } from '../jobs/agenda.js';
import { SLACK_FEEDBACK_CHANNEL_ID, SLACK_REPORT_TYPES } from './constants.js';
import { Company } from '../models/Company.js';

export const issueBodySchema = z.object({
  description: z.string().min(1).max(2000),
  userAgent: z.string().optional(),
  url: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type IssueBody = z.infer<typeof issueBodySchema>;

export async function createIssueHandler(
  req: FastifyRequest,
  reply: FastifyReply,
  reporterType: 'user' | 'admin',
) {
  const { description, userAgent, url, metadata } = req.body as IssueBody;

  const issueReport = await IssueReport.create({
    reporter: req.user!._id,
    reporterType,
    company: req.user!.company,
    description,
    userAgent,
    url,
    metadata,
  });

  const company = await Company.findById(req.user?.company).select('name');

  try {
    await getAgenda().now('post-slack-report', {
      type: SLACK_REPORT_TYPES.ISSUE_REPORT_SUBMITTED,
      payload: {
        channel: SLACK_FEEDBACK_CHANNEL_ID,
        reporter: req.user,
        reporterType,
        company,
        issueReport: {
          id: issueReport._id,
          description,
          url,
          createdAt: issueReport.createdAt,
        },
      },
    });
  } catch (error) {
    req.log.error(
      { err: error },
      'Failed to send Slack notification for issue report',
    );
  }

  return reply.send({
    success: true,
    issueId: issueReport._id,
  });
}
