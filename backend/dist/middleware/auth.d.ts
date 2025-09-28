import { Request, Response, NextFunction } from 'express';
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
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Require specific permission
 */
export declare const requirePermission: (permission: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Require specific role (admin, manager, contributor, viewer)
 */
export declare const requireRole: (roles: string | string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Ensure user is in organization context
 */
export declare const requireOrganization: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Admin-only endpoints
 */
export declare const adminOnly: (((req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>) | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * Manager+ endpoints (admin or manager)
 */
export declare const managerOrAbove: (((req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>) | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * Contributor+ endpoints (admin, manager, or contributor)
 */
export declare const contributorOrAbove: (((req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>) | ((req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined))[];
/**
 * Any authenticated user in organization
 */
export declare const authenticatedInOrg: ((req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>)[];
//# sourceMappingURL=auth.d.ts.map