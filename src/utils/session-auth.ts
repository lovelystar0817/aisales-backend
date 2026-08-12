import { FastifyRequest } from 'fastify';
import { SalesSession, ISalesSession } from '../models/SalesSession.js';
import { Types, Document } from 'mongoose';
import { UserDocument } from '../models/User.js';

// Type for the Mongoose document that includes both the data and methods
export type SalesSessionDocument = ISalesSession & Document;

export interface SessionAuthOptions {
  allowAdmins?: boolean;
  skipOwnershipCheck?: boolean;
}

/**
 * Verifies that the authenticated user owns the session or has permission to access it.
 * Throws appropriate HTTP errors if access is denied.
 *
 * @param sessionId - The ID of the session to verify
 * @param user - The authenticated user document
 * @param app - The Fastify app instance for HTTP error handling
 * @param options - Optional configuration for authorization checks
 * @returns The session document if authorized
 */
export async function verifySessionOwnership(
  sessionId: string,
  user: UserDocument,
  app: any,
  options: SessionAuthOptions = {},
): Promise<SalesSessionDocument> {
  const session = await SalesSession.findById(sessionId).orFail(
    app.httpErrors.notFound('Session not found'),
  );

  // Skip ownership check if explicitly disabled (use with caution)
  if (options.skipOwnershipCheck) {
    return session;
  }

  // Check if the authenticated user owns this session
  const userId = user._id.toString();
  const sessionUserId = session.user.toString();

  // Check if user has special access permissions
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const isHupoTestUser = user.email.endsWith('@hupo.co');

  console.log('verifySessionOwnership ::: ', sessionId);
  console.log('sessionUserId', sessionUserId);
  console.log('userId', userId);
  console.log('isAdmin', isAdmin);
  console.log('isHupoTestUser', isHupoTestUser);

  if (sessionUserId !== userId && !isAdmin && !isHupoTestUser) {
    // User doesn't own this session and doesn't have special permissions
    throw app.httpErrors.forbidden(
      'You do not have permission to access this session',
    );
  }

  return session;
}

/**
 * Populates and verifies session ownership with additional related data.
 * Useful when you need both authorization and populated fields.
 *
 * @param sessionId - The ID of the session to verify
 * @param user - The authenticated user
 * @param app - The Fastify app instance
 * @param populateFields - Fields to populate on the session
 * @param options - Optional configuration
 * @returns The populated session document if authorized
 */
export async function verifyAndPopulateSession(
  sessionId: string,
  user: UserDocument,
  app: any,
  populateFields: string | string[] | any[] = [],
  options: SessionAuthOptions = {},
): Promise<SalesSessionDocument> {
  let query = SalesSession.findById(sessionId);
  const userId = user._id.toString();

  // Apply population if specified
  if (populateFields) {
    if (Array.isArray(populateFields)) {
      populateFields.forEach((field) => {
        // Handle both string and object populate options
        if (typeof field === 'string' || typeof field === 'object') {
          query = query.populate(field);
        }
      });
    } else {
      query = query.populate(populateFields);
    }
  }

  const session = await query.orFail(
    app.httpErrors.notFound('Session not found'),
  );

  // Skip ownership check if explicitly disabled
  if (options.skipOwnershipCheck) {
    return session;
  }

  // Verify ownership
  const sessionUserId = session.user.toString();

  // Check if user has special access permissions
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const isHupoTestUser = user.email.endsWith('@hupo.co');

  if (sessionUserId !== userId && !isAdmin && !isHupoTestUser) {
    // User doesn't own this session and doesn't have special permissions
    throw app.httpErrors.forbidden(
      'You do not have permission to access this session',
    );
  }

  return session;
}
