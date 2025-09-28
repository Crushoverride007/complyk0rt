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
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Verify password against hash
 */
export declare const verifyPassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Generate JWT access token
 */
export declare const generateAccessToken: (payload: JWTPayload) => string;
/**
 * Generate JWT refresh token
 */
export declare const generateRefreshToken: (payload: {
    userId: string;
}) => string;
/**
 * Verify JWT access token
 */
export declare const verifyAccessToken: (token: string) => JWTPayload;
/**
 * Verify JWT refresh token
 */
export declare const verifyRefreshToken: (token: string) => {
    userId: string;
};
/**
 * Get user permissions based on role
 */
export declare const getUserPermissions: (role: string) => string[];
/**
 * Check if user has required permission
 */
export declare const hasPermission: (userPermissions: string[], requiredPermission: string) => boolean;
/**
 * Generate secure random token for invitations
 */
export declare const generateInvitationToken: () => string;
/**
 * Verify invitation token
 */
export declare const verifyInvitationToken: (token: string) => boolean;
//# sourceMappingURL=auth.d.ts.map