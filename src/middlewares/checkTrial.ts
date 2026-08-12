import { FastifyReply, FastifyRequest } from 'fastify';
import { Company } from '../models/Company.js';

export async function checkTrialMiddleware(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const companyId = req.user?.company._id;
  const company = await Company.findById(companyId).select('trialEndsAt');

  if (company?.trialEndsAt) {
    const now = new Date();
    if (company.trialEndsAt < now) {
      return reply.code(402).send({
        statusCode: 402,
        error: 'Payment Required',
        message: 'Your trial has expired',
      });
    }
  }
}
