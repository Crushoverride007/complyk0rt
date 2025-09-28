import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, hasPermission, JWTPayload } from '../utils/auth';
import { prisma } from '../server';
import logger from '../utils/logger';

// Extend Express Request to include user and organization info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        permissions: string[];
        currentOrg?: {
          id: string;
          name: string;
          slug: string;
          role: string;
        };
      };
    }
  }
}

/**
 * Authenticate user via JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication token required',
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    let payload: JWTPayload;
    try {
      payload = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
    }

    // Get user from database with memberships
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: {
          where: { status: 'active' },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or inactive',
        },
      });
    }

    // Set user info in request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      permissions: payload.permissions || [],
      currentOrg: payload.orgId
        ? {
            id: payload.orgId,
            name: payload.orgId, // Will be filled with actual org data
            slug: payload.orgId, // Will be filled with actual org data
            role: payload.role || 'viewer',
          }
        : undefined,
    };

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

/**
 * Require specific permission
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        },
      });
    }

    if (!hasPermission(req.user.permissions, permission)) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Required permission: ${permission}`,
        },
      });
    }

    next();
  };
};

/**
 * Require specific role (admin, manager, contributor, viewer)
 */
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.currentOrg) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication and organization context required',
        },
      });
    }

    if (!allowedRoles.includes(req.user.currentOrg.role)) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Required role: ${allowedRoles.join(' or ')}`,
        },
      });
    }

    next();
  };
};

/**
 * Ensure user is in organization context
 */
export const requireOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        },
      });
    }

    // Get organization from header or URL parameter
    const orgSlug = req.headers['x-organization'] as string || req.params.orgSlug;
    
    if (!orgSlug) {
      return res.status(400).json({
        error: {
          code: 'ORGANIZATION_REQUIRED',
          message: 'Organization context required',
        },
      });
    }

    // Verify user membership in organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId: req.user.id,
        organization: { slug: orgSlug },
        status: 'active',
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        error: {
          code: 'ORGANIZATION_ACCESS_DENIED',
          message: 'Access to organization denied',
        },
      });
    }

    // Update user context with organization info
    req.user.currentOrg = {
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role,
    };

    next();
  } catch (error) {
    logger.error('Organization context error:', error);
    res.status(500).json({
      error: {
        code: 'ORGANIZATION_ERROR',
        message: 'Failed to verify organization access',
      },
    });
  }
};

/**
 * Admin-only endpoints
 */
export const adminOnly = [
  authenticate,
  requireOrganization,
  requireRole('admin'),
];

/**
 * Manager+ endpoints (admin or manager)
 */
export const managerOrAbove = [
  authenticate,
  requireOrganization,
  requireRole(['admin', 'manager']),
];

/**
 * Contributor+ endpoints (admin, manager, or contributor)
 */
export const contributorOrAbove = [
  authenticate,
  requireOrganization,
  requireRole(['admin', 'manager', 'contributor']),
];

/**
 * Any authenticated user in organization
 */
export const authenticatedInOrg = [
  authenticate,
  requireOrganization,
];
