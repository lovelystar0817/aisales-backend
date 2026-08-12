import jwt from 'jsonwebtoken';
import type { FastifyInstance } from 'fastify';

/**
 * Creates a conditional Auth0 JWT middleware that only applies to non-guest tokens
 * This ensures proper Express integration while allowing guest tokens through
 */
function createConditionalAuth0Middleware(app: FastifyInstance) {
  return (req: any, res: any, next: any) => {
    // Check if this is a guest token
    const authHeader = req.headers.authorization;
    let isGuestToken = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.sub && decoded.sub.startsWith('guest_')) {
          isGuestToken = true;
        }
      } catch (error) {
        // Not a valid token, treat as non-guest
      }
    }

    // For guest tokens, skip Auth0 JWT validation entirely
    if (isGuestToken) {
      return next();
    }

    // For non-guest tokens, apply the actual Auth0 JWT middleware
    app.checkAuth0JWT(req, res, next);
  };
}

/**
 * Convenience function to set up authentication for routes that need both Auth0 and guest support
 */
export function setupUniversalAuth(app: FastifyInstance) {
  app.use(createConditionalAuth0Middleware(app));
  app.addHook('preHandler', app.authenticate);
}

/**
 * Convenience function to set up authentication for routes that need Auth0, guest, and manage support
 * This allows the route to be accessed by regular users, guest users, and managers
 */
export function setupUniversalAuthWithManage(app: FastifyInstance) {
  app.use(createConditionalAuth0Middleware(app));

  // Create a custom authentication handler that tries both regular and manage auth
  const combinedAuth = async (req: any) => {
    const isManageClientRequest = () => {
      const headerValue = req.headers?.['x-client'];
      if (!headerValue) {
        return false;
      }

      if (Array.isArray(headerValue)) {
        return headerValue.some(
          (value) =>
            typeof value === 'string' && value.toLowerCase() === 'manage',
        );
      }

      return (
        typeof headerValue === 'string' &&
        headerValue.toLowerCase() === 'manage'
      );
    };

    const runRegularAuth = async () => {
      await (app.authenticate as any)(req);
    };

    const runManageAuth = async () => {
      await (app.authenticateManage as any)(req);
    };

    if (isManageClientRequest()) {
      try {
        await runManageAuth();
        return;
      } catch (manageError) {
        try {
          await runRegularAuth();
          return;
        } catch {
          throw manageError;
        }
      }
    }

    // Try regular authentication first (for regular/guest users)
    try {
      await runRegularAuth();
      return;
    } catch (authError) {
      // Not a regular user, try manage authentication next
    }

    // Try manage authentication (for manage users)
    await runManageAuth();
  };

  app.addHook('preHandler', combinedAuth as any);
}
