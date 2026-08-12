import { Types } from 'mongoose';
import { FastifyRequest } from 'fastify';
import { AdminLog, AdminAction, AdminLogCategory } from '../models/AdminLog.js';

export interface AdminLogParams {
  action: AdminAction;
  category: AdminLogCategory;
  targetType?: string;
  targetId?: Types.ObjectId | string;
  targetName?: string;
  details?: Record<string, unknown>;
}

/**
 * Safely converts a string to ObjectId, returns undefined if invalid
 */
function safeObjectId(
  id: Types.ObjectId | string | undefined,
): Types.ObjectId | undefined {
  if (!id) return undefined;
  if (id instanceof Types.ObjectId) return id;
  try {
    return new Types.ObjectId(id);
  } catch {
    return undefined;
  }
}

/**
 * Logs an admin action to the AdminLog collection.
 * This function is designed to never throw - all errors are caught and logged.
 * @param req - Fastify request object (must have authenticated admin user)
 * @param params - Admin log parameters
 */
export async function logAdminAction(
  req: FastifyRequest,
  params: AdminLogParams,
): Promise<void> {
  try {
    const user = req?.user as any;

    if (!user?._id || !user?.company) {
      req?.log?.warn?.(
        'Attempted to log admin action without authenticated user',
      );
      return;
    }

    await AdminLog.create({
      adminUser: user._id,
      adminEmail: user.email,
      company: user.company,
      action: params.action,
      category: params.category,
      targetType: params.targetType,
      targetId: safeObjectId(params.targetId),
      targetName: params.targetName,
      details: params.details,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (error) {
    // Use optional chaining to prevent any possibility of throwing
    try {
      req?.log?.error?.({ err: error }, 'Failed to log admin action');
    } catch {
      // Silently ignore if even logging fails
      console.error('Failed to log admin action:', error);
    }
  }
}

/**
 * Helper to create details object for update operations
 * @param before - Previous state
 * @param after - New state
 */
export function createUpdateDetails(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, unknown> {
  return { before, after };
}
