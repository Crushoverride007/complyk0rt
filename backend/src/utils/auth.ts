import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Membership } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
  orgId?: string;
  role?: string;
  permissions?: string[];
}

export interface AuthenticatedUser extends User {
  memberships: (Membership & {
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  })[];
}

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'complykort',
    audience: 'complykort-api',
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (payload: { userId: string }): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'complykort',
    audience: 'complykort-api',
  });
};

/**
 * Verify JWT access token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'complykort',
      audience: 'complykort-api',
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'complykort',
      audience: 'complykort-api',
    }) as { userId: string };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Get user permissions based on role
 */
export const getUserPermissions = (role: string): string[] => {
  const permissions: Record<string, string[]> = {
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

/**
 * Check if user has required permission
 */
export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string
): boolean => {
  return userPermissions.includes(requiredPermission);
};

/**
 * Generate secure random token for invitations
 */
export const generateInvitationToken = (): string => {
  return jwt.sign(
    { type: 'invitation', timestamp: Date.now() },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '7d' }
  );
};

/**
 * Verify invitation token
 */
export const verifyInvitationToken = (token: string): boolean => {
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    return true;
  } catch {
    return false;
  }
};
