"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedInOrg = exports.contributorOrAbove = exports.managerOrAbove = exports.adminOnly = exports.requireOrganization = exports.requireRole = exports.requirePermission = exports.authenticate = void 0;
const auth_1 = require("../utils/auth");
const server_1 = require("../server");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Authenticate user via JWT token
 */
const authenticate = async (req, res, next) => {
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
        let payload;
        try {
            payload = (0, auth_1.verifyAccessToken)(token);
        }
        catch (error) {
            return res.status(401).json({
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token',
                },
            });
        }
        // Get user from database with memberships
        const user = await server_1.prisma.user.findUnique({
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
        await server_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        next();
    }
    catch (error) {
        logger_1.default.error('Authentication error:', error);
        res.status(500).json({
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'Authentication failed',
            },
        });
    }
};
exports.authenticate = authenticate;
/**
 * Require specific permission
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: {
                    code: 'AUTHENTICATION_REQUIRED',
                    message: 'Authentication required',
                },
            });
        }
        if (!(0, auth_1.hasPermission)(req.user.permissions, permission)) {
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
exports.requirePermission = requirePermission;
/**
 * Require specific role (admin, manager, contributor, viewer)
 */
const requireRole = (roles) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
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
exports.requireRole = requireRole;
/**
 * Ensure user is in organization context
 */
const requireOrganization = async (req, res, next) => {
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
        const orgSlug = req.headers['x-organization'] || req.params.orgSlug;
        if (!orgSlug) {
            return res.status(400).json({
                error: {
                    code: 'ORGANIZATION_REQUIRED',
                    message: 'Organization context required',
                },
            });
        }
        // Verify user membership in organization
        const membership = await server_1.prisma.membership.findFirst({
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
    }
    catch (error) {
        logger_1.default.error('Organization context error:', error);
        res.status(500).json({
            error: {
                code: 'ORGANIZATION_ERROR',
                message: 'Failed to verify organization access',
            },
        });
    }
};
exports.requireOrganization = requireOrganization;
/**
 * Admin-only endpoints
 */
exports.adminOnly = [
    exports.authenticate,
    exports.requireOrganization,
    (0, exports.requireRole)('admin'),
];
/**
 * Manager+ endpoints (admin or manager)
 */
exports.managerOrAbove = [
    exports.authenticate,
    exports.requireOrganization,
    (0, exports.requireRole)(['admin', 'manager']),
];
/**
 * Contributor+ endpoints (admin, manager, or contributor)
 */
exports.contributorOrAbove = [
    exports.authenticate,
    exports.requireOrganization,
    (0, exports.requireRole)(['admin', 'manager', 'contributor']),
];
/**
 * Any authenticated user in organization
 */
exports.authenticatedInOrg = [
    exports.authenticate,
    exports.requireOrganization,
];
//# sourceMappingURL=auth.js.map