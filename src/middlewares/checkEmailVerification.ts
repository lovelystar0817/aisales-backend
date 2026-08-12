import type { onRequestHookHandler } from 'fastify';

export const checkEmailVerification: onRequestHookHandler = async (
  req,
  reply,
) => {
  if (
    req.method !== 'GET' &&
    req.user &&
    !req.user.isGuest &&
    !req.user.emailVerified
  ) {
    return reply.code(403).send({
      statusCode: 403,
      error: 'Forbidden',
      message: 'Email not verified',
    });
  }
};
