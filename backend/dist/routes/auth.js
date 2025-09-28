"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                memberships: {
                    include: {
                        organization: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Verify password
        if (!user.passwordHash) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            name: user.name
        }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        // Return user data (without password hash)
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified,
            timezone: user.timezone,
            locale: user.locale,
            lastLoginAt: user.lastLoginAt,
            organizations: user.memberships.map(m => ({
                id: m.organization.id,
                name: m.organization.name,
                slug: m.organization.slug,
                role: m.role,
                permissions: m.permissions
            }))
        };
        logger_1.default.info('User logged in successfully', {
            userId: user.id,
            email: user.email,
            organizationCount: user.memberships.length
        });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userData,
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, organizationSlug } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and name are required'
            });
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                name,
                passwordHash,
                emailVerified: false
            }
        });
        // If organization slug provided, try to find and join
        let organization = null;
        if (organizationSlug) {
            organization = await prisma.organization.findUnique({
                where: { slug: organizationSlug }
            });
            if (organization) {
                await prisma.membership.create({
                    data: {
                        userId: user.id,
                        organizationId: organization.id,
                        role: 'viewer' // Default role for new registrations
                    }
                });
            }
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            name: user.name
        }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        logger_1.default.info('User registered successfully', {
            userId: user.id,
            email: user.email,
            organizationJoined: !!organization
        });
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified,
                    organizations: organization ? [{
                            id: organization.id,
                            name: organization.name,
                            slug: organization.slug,
                            role: 'viewer'
                        }] : []
                },
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get current user profile
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token required'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                memberships: {
                    include: {
                        organization: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified,
            timezone: user.timezone,
            locale: user.locale,
            lastLoginAt: user.lastLoginAt,
            organizations: user.memberships.map(m => ({
                id: m.organization.id,
                name: m.organization.name,
                slug: m.organization.slug,
                role: m.role,
                permissions: m.permissions
            }))
        };
        res.json({
            success: true,
            data: { user: userData }
        });
    }
    catch (error) {
        logger_1.default.error('Get user profile error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
});
// Logout endpoint (client-side token invalidation)
router.post('/logout', (req, res) => {
    // In a production app, you might want to maintain a blacklist of invalidated tokens
    // For now, we'll just send a success response and let the client handle token removal
    logger_1.default.info('User logged out');
    res.json({
        success: true,
        message: 'Logout successful'
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map