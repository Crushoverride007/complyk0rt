"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyInvitationToken = exports.generateInvitationToken = exports.hasPermission = exports.getUserPermissions = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = exports.verifyPassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
/**
 * Verify password against hash
 */
const verifyPassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
/**
 * Generate JWT access token
 */
const generateAccessToken = (payload) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
        issuer: 'complykort',
        audience: 'complykort-api',
    });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (payload) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
        issuer: 'complykort',
        audience: 'complykort-api',
    });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Verify JWT access token
 */
const verifyAccessToken = (token) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, {
            issuer: 'complykort',
            audience: 'complykort-api',
        });
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyAccessToken = verifyAccessToken;
/**
 * Verify JWT refresh token
 */
const verifyRefreshToken = (token) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET, {
            issuer: 'complykort',
            audience: 'complykort-api',
        });
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
/**
 * Get user permissions based on role
 */
const getUserPermissions = (role) => {
    const permissions = {
        admin: [
            'organizations:read',
            'organizations:write',
            'organizations:delete',
            'users:read',
            'users:write',
            'users:invite',
            'projects:read',
            'projects:write',
            'projects:delete',
            'tasks:read',
            'tasks:write',
            'tasks:delete',
            'files:read',
            'files:write',
            'files:delete',
            'activity:read',
        ],
        manager: [
            'organizations:read',
            'users:read',
            'users:invite',
            'projects:read',
            'projects:write',
            'tasks:read',
            'tasks:write',
            'files:read',
            'files:write',
            'activity:read',
        ],
        contributor: [
            'projects:read',
            'tasks:read',
            'tasks:write',
            'files:read',
            'files:write',
            'activity:read',
        ],
        viewer: [
            'projects:read',
            'tasks:read',
            'files:read',
            'activity:read',
        ],
    };
    return permissions[role] || [];
};
exports.getUserPermissions = getUserPermissions;
/**
 * Check if user has required permission
 */
const hasPermission = (userPermissions, requiredPermission) => {
    return userPermissions.includes(requiredPermission);
};
exports.hasPermission = hasPermission;
/**
 * Generate secure random token for invitations
 */
const generateInvitationToken = () => {
    return jsonwebtoken_1.default.sign({ type: 'invitation', timestamp: Date.now() }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
};
exports.generateInvitationToken = generateInvitationToken;
/**
 * Verify invitation token
 */
const verifyInvitationToken = (token) => {
    try {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
        return true;
    }
    catch {
        return false;
    }
};
exports.verifyInvitationToken = verifyInvitationToken;
//# sourceMappingURL=auth.js.map