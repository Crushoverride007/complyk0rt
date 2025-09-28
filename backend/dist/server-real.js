"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const frameworks_1 = require("./frameworks");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = parseInt(process.env.PORT || '3001');
const host = process.env.HOST || '0.0.0.0';
// If behind a proxy/load balancer, trust X-Forwarded-For for correct client IPs
// This prevents rate limiters from grouping many users under one IP
app.set('trust proxy', 1);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://95.217.190.154:3000'
    ],
    credentials: true
}));
// Rate limiting
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || String(15 * 60 * 1000), 10);
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
// Return JSON instead of plain text for rate-limited responses
const rateLimitHandler = (req, res, _next, options) => {
    res.status(options.statusCode).json({
        success: false,
        message: 'Too many requests',
    });
};
// General limiter for all endpoints except auth login and high-traffic assessment endpoints
const devMode = (process.env.NODE_ENV !== 'production') || process.env.DISABLE_RATE_LIMIT === '1';
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    skip: (req) => {
        const p = req.path || '';
        if (p === '/api/auth/login')
            return true;
        // Exempt assessment structure and answers endpoints from global limiter
        if (p.startsWith('/assessments/') && (p.endsWith('/answers') || p.endsWith('/structure')))
            return true;
        return false;
    },
});
if (!devMode)
    app.use(generalLimiter);
// Dedicated (more lenient) limiter for login endpoint
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
    max: devMode ? 1000000 : parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '60', 10), // 60 logins/min/IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});
// Very lenient limiter for answers saves (protects from accidental storms but avoids blocking normal use)
// --- Assessment collaboration helpers ---
function isAdmin(req) {
    const email = req.user?.email || '';
    const roles = (req.user?.rolesByOrg || []);
    if (email.toLowerCase() === 'admin@acme.example.com')
        return true;
    return roles.some(r => String(r.role || '').toLowerCase() === 'admin');
}
function getCollaboratorRole(assessmentId, userId) {
    try {
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const list = (data.collaboratorsByAssessment || {})[assessmentId] || [];
        const found = list.find((c) => c.userId === userId);
        return found?.role || null;
    }
    catch {
        return null;
    }
}
function canReadAssessment(req, assessmentId) {
    if (isAdmin(req))
        return true;
    const ur = (req.user?.rolesByOrg || []);
    const orgId = req.user?.orgId || ur[0]?.orgId || null;
    const role = ur.find(r => r.orgId === orgId)?.role || req.user?.role || 'viewer';
    const rbac = ['admin', 'manager', 'viewer', 'qa', 'assessor', 'consultant', 'team_leader'];
    if (rbac.includes(role))
        return true;
    const collab = getCollaboratorRole(assessmentId, req.user?.userId);
    return !!collab; // viewer or editor
}
function canWriteAssessment(req, assessmentId) {
    if (isAdmin(req))
        return true;
    const ur = (req.user?.rolesByOrg || []);
    const orgId = req.user?.orgId || ur[0]?.orgId || null;
    const role = ur.find(r => r.orgId === orgId)?.role || req.user?.role || 'viewer';
    const rbac = ['admin', 'manager', 'assessor', 'consultant', 'team_leader'];
    if (rbac.includes(role))
        return true;
    const collab = getCollaboratorRole(assessmentId, req.user?.userId);
    return collab === 'editor';
}
const answersLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.ANSWERS_RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: devMode ? 1000000 : parseInt(process.env.ANSWERS_RATE_LIMIT_MAX || '600', 10),
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const RolePolicy = {
    admin: ['users.read', 'users.write', 'projects.read', 'projects.write', 'assessments.read', 'assessments.write', 'attachments.read', 'attachments.write'],
    manager: ['users.read', 'projects.read', 'projects.write', 'assessments.read', 'assessments.write', 'attachments.read', 'attachments.write'],
    viewer: ['projects.read', 'assessments.read', 'attachments.read'],
    guest: ['projects.read'],
    qa: ['projects.read', 'assessments.read', 'attachments.read'],
    assessor: ['projects.read', 'assessments.read', 'assessments.write', 'attachments.read', 'attachments.write'],
    consultant: ['projects.read', 'assessments.read', 'assessments.write', 'attachments.read', 'attachments.write'],
    team_leader: ['users.read', 'projects.read', 'projects.write', 'assessments.read', 'assessments.write', 'attachments.read', 'attachments.write'],
};
function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        if (!token)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = payload;
        const headerOrg = req.headers['x-org-id'] || req.headers['x-organization'];
        if (headerOrg)
            req.user.orgId = headerOrg;
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}
function authorizeRoles(roles) {
    return (req, res, next) => {
        const ur = (req.user?.rolesByOrg || []);
        const orgId = req.user?.orgId || ur[0]?.orgId || null;
        const role = ur.find(r => r.orgId === orgId)?.role || req.user?.role || 'viewer';
        if (roles.includes(role) || (req.user?.email === 'admin@acme.example.com' && (!Array.isArray(req.user?.rolesByOrg) || !req.user.rolesByOrg.length)))
            return next();
        return res.status(403).json({ success: false, message: 'Forbidden' });
    };
}
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            server_ip: req.ip,
            message: 'ComplykOrt API is running with database connection'
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            message: 'Database connection failed'
        });
    }
});
// Who am I / roles
app.get('/api/me/roles', requireAuth, async (req, res) => {
    try {
        const { userId } = req.user || {};
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const memberships = await prisma.membership.findMany({ where: { userId }, select: { orgId: true, role: true } });
        res.json({ success: true, rolesByOrg: memberships });
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to fetch roles' });
    }
});
// Authentication endpoints
app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (!user || !user.passwordHash) {
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
        // Load memberships to embed roles in the token
        const memberships = await prisma.membership.findMany({
            where: { userId: user.id },
            select: { orgId: true, role: true }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, name: user.name, rolesByOrg: memberships }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified
                },
                token
            }
        });
        console.log('User logged in:', user.email);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get current user endpoint
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token required'
            });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        }
        catch {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
                createdAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user information'
        });
    }
});
// Dashboard data endpoint
app.get('/api/dashboard/overview', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token required'
            });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        }
        catch {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        // Get basic counts from database
        const organizationCount = await prisma.organization.count();
        const userCount = await prisma.user.count();
        const projectCount = await prisma.project.count();
        const taskCount = await prisma.task.count();
        // Get recent users for activity feed
        const recentUsers = await prisma.user.findMany({
            take: 4,
            orderBy: { createdAt: 'desc' },
            select: { name: true, email: true, createdAt: true }
        });
        res.json({
            success: true,
            data: {
                stats: {
                    organizations: organizationCount,
                    users: userCount,
                    projects: projectCount,
                    tasks: taskCount
                },
                projectStats: {
                    total: projectCount,
                    inProgress: Math.floor(projectCount * 0.6),
                    completed: Math.floor(projectCount * 0.25),
                    onTrackPercentage: 87
                },
                taskStats: {
                    total: taskCount,
                    todo: Math.floor(taskCount * 0.4),
                    inProgress: Math.floor(taskCount * 0.35),
                    done: Math.floor(taskCount * 0.25)
                },
                recentActivity: recentUsers.map((user, index) => ({
                    id: `activity-${index}`,
                    description: `${user.name} joined the platform`,
                    user: user.name,
                    createdAt: user.createdAt
                })),
                complianceHealth: {
                    frameworks: [
                        { name: 'SOC 2', score: 94 },
                        { name: 'ISO 27001', score: 89 },
                        { name: 'GDPR', score: 97 },
                        { name: 'PCI DSS', score: 92 }
                    ]
                }
            }
        });
    }
    catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
});
// Get all organizations
app.get('/api/organizations', async (req, res) => {
    try {
        const organizations = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: organizations
        });
    }
    catch (error) {
        console.error('Organizations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch organizations'
        });
    }
});
// Get all users
app.get('/api/users', requireAuth, authorizeRoles(['admin', 'team_leader', 'manager']), async (req, res) => {
    try {
        const ur = (req.user?.rolesByOrg || []);
        let orgId = req.user?.orgId || ur[0]?.orgId || null;
        if (!orgId) {
            const anyOrg = await prisma.organization.findFirst({ select: { id: true } });
            orgId = anyOrg?.id || null;
        }
        if (!orgId)
            return res.status(400).json({ success: false, message: 'orgId not resolved' });
        const members = await prisma.membership.findMany({
            where: { orgId },
            include: { user: { select: { id: true, email: true, name: true, status: true } } },
            orderBy: { joinedAt: 'desc' }
        });
        const data = members.map(m => ({ id: m.user.id, email: m.user.email, name: m.user.name, role: m.role, active: String(m.user.status || 'active').toLowerCase() !== 'inactive' }));
        return res.json({ success: true, data });
    }
    catch (error) {
        console.error('Users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});
// Invite or upsert a user by email and add to current org
app.post('/api/users/invite', requireAuth, authorizeRoles(['admin', 'team_leader', 'manager']), async (req, res) => {
    try {
        const { email, name, role, orgId: bodyOrgId } = req.body || {};
        if (!email)
            return res.status(400).json({ success: false, message: 'email required' });
        const rolesAllowed = ['viewer', 'guest', 'admin', 'qa', 'assessor', 'consultant', 'team_leader', 'manager'];
        const desiredRole = rolesAllowed.includes(role) ? role : 'viewer';
        const rolesByOrg = (req.user?.rolesByOrg || []);
        let orgId = bodyOrgId || req.user?.orgId || (rolesByOrg[0]?.orgId);
        if (!orgId) {
            const anyOrg = await prisma.organization.findFirst({ select: { id: true } });
            orgId = anyOrg?.id || null;
        }
        if (!orgId)
            return res.status(400).json({ success: false, message: 'orgId not resolved (provide x-org-id header or body.orgId)' });
        let user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
        if (!user) {
            user = await prisma.user.create({ data: { email: String(email).toLowerCase(), name: name || String(email).split('@')[0], emailVerified: false } });
        }
        const existing = await prisma.membership.findFirst({ where: { userId: user.id, orgId } });
        let membership = existing;
        if (!existing) {
            membership = await prisma.membership.create({ data: { userId: user.id, orgId, role: desiredRole } });
        }
        return res.status(201).json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name }, membership: { orgId, role: membership?.role || desiredRole } } });
    }
    catch (e) {
        console.error('Invite error', e);
        return res.status(500).json({ success: false, message: 'Failed to invite user' });
    }
});
// Organization members endpoints
app.get('/api/orgs/:orgId/members', requireAuth, async (req, res) => {
    try {
        const { orgId: orgParam } = req.params;
        // resolve org id (accept uuid or slug)
        let orgId = orgParam;
        if (!/^[-0-9a-f]{36}$/i.test(orgId)) {
            const org = await prisma.organization.findFirst({ where: { OR: [{ id: orgId }, { slug: orgId }] }, select: { id: true } });
            orgId = org?.id || orgId;
        }
        // verify requester belongs to org
        const member = await prisma.membership.findFirst({ where: { userId: req.user.userId, orgId } });
        if (!member)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const members = await prisma.membership.findMany({
            where: { orgId },
            include: { user: { select: { id: true, email: true, name: true } } },
            orderBy: { joinedAt: 'desc' }
        });
        const data = members.map(m => ({ userId: m.userId, role: m.role, user: m.user }));
        return res.json({ success: true, members: data });
    }
    catch (e) {
        console.error('Org members error', e);
        return res.status(500).json({ success: false, message: 'Failed to fetch members' });
    }
});
app.put('/api/orgs/:orgId/members/:userId', requireAuth, authorizeRoles(['admin', 'team_leader', 'manager']), async (req, res) => {
    try {
        const { orgId: orgParam, userId } = req.params;
        const { role } = req.body || {};
        const rolesAllowed = ['viewer', 'guest', 'admin', 'qa', 'assessor', 'consultant', 'team_leader', 'manager'];
        if (!rolesAllowed.includes(role))
            return res.status(400).json({ success: false, message: 'Invalid role' });
        let orgId = orgParam;
        if (!/^[-0-9a-f]{36}$/i.test(orgId)) {
            const org = await prisma.organization.findFirst({ where: { OR: [{ id: orgId }, { slug: orgId }] }, select: { id: true } });
            orgId = org?.id || orgId;
        }
        // upsert membership
        const existing = await prisma.membership.findFirst({ where: { orgId, userId } });
        let membership = existing;
        if (!existing) {
            membership = await prisma.membership.create({ data: { orgId, userId, role } });
        }
        else if (existing.role !== role) {
            membership = await prisma.membership.update({ where: { id: existing.id }, data: { role } });
        }
        return res.json({ success: true, membership: { orgId, userId, role: membership?.role || role } });
    }
    catch (e) {
        console.error('Update member role error', e);
        return res.status(500).json({ success: false, message: 'Failed to update member role' });
    }
});
// Assessments endpoints
app.get('/assessments', async (req, res) => {
    try {
        const archived = req.query.archived === 'true';
        // Load real data from data.json
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const assessments = data.assessments.map(assessment => ({
            id: assessment.id,
            title: assessment.title,
            col: assessment.col,
            dueIn: assessment.dueIn,
            framework: assessment.framework || 'PCI DSS 4.0',
            description: assessment.description || '',
            assignedTo: assessment.assignedTo || '',
            template: assessment.template || ''
        }));
        res.json({
            success: true,
            assessments: archived ? assessments.filter(a => a.col === 'archived') : assessments
        });
    }
    catch (error) {
        console.error('Assessments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assessments'
        });
    }
});
app.post('/assessments', async (req, res) => {
    try {
        const { title, col = 'backlog', dueIn, framework, description, assignedTo, template } = req.body || {};
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const newAssessment = {
            id: 'A-' + Math.random().toString(36).slice(2, 8),
            title,
            col,
            dueIn: dueIn || '30 days',
            framework: framework || 'Custom',
            description: description || '',
            assignedTo: assignedTo || '',
            template: template || ''
        };
        data.assessments = Array.isArray(data.assessments) ? data.assessments : [];
        data.assessments.unshift(newAssessment);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        res.json({ success: true, assessment: newAssessment });
    }
    catch (error) {
        console.error('Create assessment error:', error);
        res.status(500).json({ success: false, message: 'Failed to create assessment' });
    }
});
// Update an assessment (title, col, dueIn, framework, description, assignedTo, template)
app.put('/assessments/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, col, dueIn, framework, description, assignedTo, template } = req.body || {};
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const aIdx = (data.assessments || []).findIndex((a) => a.id === id);
        if (aIdx === -1)
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        const a = data.assessments[aIdx];
        if (typeof title === 'string')
            a.title = title;
        if (typeof col === 'string')
            a.col = col;
        if (typeof dueIn === 'string')
            a.dueIn = dueIn;
        if (typeof framework === 'string')
            a.framework = framework;
        if (typeof description === 'string')
            a.description = description;
        if (typeof assignedTo === 'string')
            a.assignedTo = assignedTo;
        if (typeof template === 'string')
            a.template = template;
        data.assessments[aIdx] = a;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return res.json({ success: true, assessment: a });
    }
    catch (e) {
        console.error('Update assessment error', e);
        return res.status(500).json({ success: false, message: 'Failed to update assessment' });
    }
});
// Archive or hard delete an assessment (aligns with demo frontend expectations)
// - DELETE /assessments/:id            -> archive (set col = 'archived')
// - DELETE /assessments/:id?hard=true  -> hard delete and remove related data
app.delete('/assessments/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!canWriteAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const hard = (req.query.hard === 'true' || req.query.hard === '1');
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const aIdx = (data.assessments || []).findIndex((a) => a.id === id);
        if (aIdx === -1)
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        if (hard) {
            const removed = data.assessments.splice(aIdx, 1)[0];
            // clean related collections if present
            if (data.tasksByAssessment)
                delete data.tasksByAssessment[id];
            if (data.messagesByAssessment)
                delete data.messagesByAssessment[id];
            if (data.attachmentsByAssessment)
                delete data.attachmentsByAssessment[id];
            if (data.answersByAssessment)
                delete data.answersByAssessment[id];
            if (data.sectionAttachmentsByAssessment)
                delete data.sectionAttachmentsByAssessment[id];
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
            return res.json({ success: true, removed });
        }
        else {
            data.assessments[aIdx].col = 'archived';
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
            return res.json({ success: true, assessment: data.assessments[aIdx] });
        }
    }
    catch (error) {
        console.error('Delete/Archive assessment error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete/archive assessment' });
    }
});
// Unarchive an assessment (set col back to backlog by default)
app.put('/assessments/:id/unarchive', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!canWriteAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const aIdx = (data.assessments || []).findIndex((a) => a.id === id);
        if (aIdx === -1)
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        data.assessments[aIdx].col = 'backlog';
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return res.json({ success: true, assessment: data.assessments[aIdx] });
    }
    catch (error) {
        console.error('Unarchive assessment error:', error);
        res.status(500).json({ success: false, message: 'Failed to unarchive assessment' });
    }
});
app.get('/assessments/:id/tasks', async (req, res) => {
    try {
        const { id } = req.params;
        if (!canReadAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        // Load real data from data.json
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const tasks = data.tasksByAssessment[id] || [];
        res.json({
            success: true,
            tasks
        });
    }
    catch (error) {
        console.error('Tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
});
const maybeAuthMessages = (process.env.DEV_ALLOW_UNAUTH === 'true' ? ((_, __, next) => next()) : requireAuth);
app.get('/assessments/:id/messages', maybeAuthMessages, async (req, res) => {
    try {
        const { id } = req.params;
        if (!canReadAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        // Load real data from data.json
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const messages = data.messagesByAssessment[id] || [];
        res.json({
            success: true,
            messages
        });
    }
    catch (error) {
        console.error('Messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
});
// Create a message (reply or root)
app.post('/assessments/:id/messages', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!canWriteAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const { user = 'System', text = '', parentId = null, sections = [], attachments = [], mentions = [] } = req.body || {};
        if (!text || typeof text !== 'string')
            return res.status(400).json({ success: false, message: 'text required' });
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const msg = {
            id: 'M-' + Math.random().toString(36).slice(2, 8),
            user,
            time: new Date().toLocaleString('en-US', { hour12: false }),
            text,
            parentId: parentId || null,
            sections: Array.isArray(sections) ? sections.filter(Boolean) : [],
            attachments: Array.isArray(attachments) ? attachments.filter(Boolean) : [],
            mentions: Array.isArray(mentions) ? mentions.filter(Boolean) : [],
        };
        const mapping = data.messagesByAssessment = data.messagesByAssessment || {};
        const list = mapping[id] = Array.isArray(mapping[id]) ? mapping[id] : [];
        list.push(msg);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return res.status(201).json({ success: true, message: msg });
    }
    catch (e) {
        console.error('Create message error:', e);
        return res.status(500).json({ success: false, message: 'Failed to post message' });
    }
});
// Delete a message
app.delete('/assessments/:id/messages/:msgId', requireAuth, async (req, res) => {
    try {
        const { id, msgId } = req.params;
        if (!canWriteAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const list = (data.messagesByAssessment && data.messagesByAssessment[id]) || [];
        const idx = list.findIndex((m) => m.id === msgId);
        if (idx === -1)
            return res.status(404).json({ success: false, message: 'Message not found' });
        const removed = list.splice(idx, 1)[0];
        if (!data.messagesByAssessment)
            data.messagesByAssessment = {};
        data.messagesByAssessment[id] = list;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return res.json({ success: true, removed });
    }
    catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
});
app.get('/assessments/:id/attachments', async (req, res) => {
    try {
        const { id } = req.params;
        if (!canReadAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        // Load real data from data.json
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const attachments = data.attachmentsByAssessment[id] || [];
        res.json({
            success: true,
            attachments
        });
    }
    catch (error) {
        console.error('Attachments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attachments'
        });
    }
});
// Delete an attachment (metadata only; physical file cleanup is outside scope here)
app.delete('/assessments/:id/attachments/:attId', requireAuth, async (req, res) => {
    try {
        const { id, attId } = req.params;
        if (!canWriteAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const list = (data.attachmentsByAssessment && data.attachmentsByAssessment[id]) || [];
        const idx = list.findIndex((a) => a.id === attId);
        if (idx === -1)
            return res.status(404).json({ success: false, message: 'Attachment not found' });
        const removed = list.splice(idx, 1)[0];
        if (!data.attachmentsByAssessment)
            data.attachmentsByAssessment = {};
        data.attachmentsByAssessment[id] = list;
        // also unlink from section mappings if present
        if (data.sectionAttachmentsByAssessment && data.sectionAttachmentsByAssessment[id]) {
            const mapping = data.sectionAttachmentsByAssessment[id];
            for (const key of Object.keys(mapping)) {
                mapping[key] = (mapping[key] || []).filter((x) => x !== attId);
            }
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return res.json({ success: true, removed });
    }
    catch (error) {
        console.error('Delete attachment error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete attachment' });
    }
});
app.get('/assessments/:id/structure', async (req, res) => {
    try {
        const { id } = req.params;
        // Load real data from data.json
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        // 1) Prefer any explicit per-assessment structure if present (preserves edits)
        let structure = data.structureByAssessment?.[id];
        // 2) Otherwise fall back to framework template
        if (!structure) {
            const assessment = (data.assessments || []).find((a) => a.id === id);
            const fwName = assessment?.framework || 'PCI DSS 4.0';
            const fw = frameworks_1.frameworkStructures[fwName];
            structure = (fw && fw.parts) ? { parts: fw.parts } : undefined;
        }
        // 3) Fallback to minimal demo when nothing else available
        if (!structure) {
            structure = {
                parts: [
                    {
                        id: 'part1',
                        title: 'Security Controls',
                        sections: [
                            {
                                id: 'section1',
                                number: '1',
                                heading: 'Access Control',
                                items: [
                                    {
                                        id: 'item1',
                                        label: 'User Authentication',
                                        number: '1.1',
                                        fields: [
                                            { id: 'field1', type: 'checkbox', label: 'Multi-factor authentication enabled', required: true }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
        }
        res.json({ success: true, structure });
    }
    catch (error) {
        console.error('Structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch structure'
        });
    }
});
app.get('/assessments/:id/answers', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!canReadAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        // Load real data from data.json
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const answers = data.answersByAssessment[id] || {};
        res.json({
            success: true,
            answers
        });
    }
    catch (error) {
        console.error('Answers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch answers'
        });
    }
});
// Save answers patch: { [subsectionId]: { fieldId: value } }
app.put('/assessments/:id/answers', requireAuth, answersLimiter, async (req, res) => {
    try {
        const { id } = req.params;
        const patch = req.body || {};
        if (typeof patch !== 'object' || Array.isArray(patch)) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const current = (data.answersByAssessment = data.answersByAssessment || {});
        const per = (current[id] = current[id] || {});
        for (const key of Object.keys(patch)) {
            const value = patch[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                per[key] = { ...(per[key] || {}), ...value };
            }
            else {
                per[key] = value;
            }
        }
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return res.json({ success: true, answers: per });
    }
    catch (error) {
        console.error('Save answers error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save answers' });
    }
});
// Collaborators endpoints
app.get('/assessments/:id/collaborators', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const list = (data.collaboratorsByAssessment || {})[id] || [];
        return res.json({ success: true, collaborators: list });
    }
    catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to fetch collaborators' });
    }
});
app.post('/assessments/:id/collaborators', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.body || {};
        if (!userId || !role || !['viewer', 'editor'].includes(role))
            return res.status(400).json({ success: false, message: 'userId and role (viewer|editor) required' });
        // Allow editors to add collaborators on their assessment, or org privileged roles
        if (!(canWriteAssessment(req, id) || ['admin', 'manager', 'team_leader'].includes((req.user?.role || '').toLowerCase()))) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const mapping = data.collaboratorsByAssessment = data.collaboratorsByAssessment || {};
        const list = mapping[id] = Array.isArray(mapping[id]) ? mapping[id] : [];
        const idx = list.findIndex((c) => c.userId === userId);
        if (idx === -1)
            list.push({ userId, role });
        else
            list[idx].role = role;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return res.status(201).json({ success: true, collaborators: list });
    }
    catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to add collaborator' });
    }
});
app.delete('/assessments/:id/collaborators/:userId', requireAuth, async (req, res) => {
    try {
        const { id, userId } = req.params;
        if (!(canWriteAssessment(req, id) || ['admin', 'manager', 'team_leader'].includes((req.user?.role || '').toLowerCase()))) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const mapping = data.collaboratorsByAssessment = data.collaboratorsByAssessment || {};
        const list = mapping[id] = Array.isArray(mapping[id]) ? mapping[id] : [];
        const before = list.length;
        const filtered = list.filter((c) => c.userId !== userId);
        mapping[id] = filtered;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return res.json({ success: true, removed: before - filtered.length });
    }
    catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to remove collaborator' });
    }
});
// Assessment permissions
app.get('/assessments/:id/permissions', requireAuth, (req, res) => {
    const { id } = req.params;
    const canRead = canReadAssessment(req, id);
    const canWrite = canWriteAssessment(req, id);
    return res.json({ success: true, permissions: { canRead, canWrite } });
});
// Section attachments endpoints
app.get('/assessments/:id/sections/:subId/attachments', requireAuth, async (req, res) => {
    try {
        const { id, subId } = req.params;
        if (!canReadAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const refs = ((data.sectionAttachmentsByAssessment || {})[id] || {})[subId] || [];
        const all = (data.attachmentsByAssessment || {})[id] || [];
        const set = new Set(refs);
        const resolved = all.filter((a) => set.has(a.id));
        return res.json({ success: true, ids: refs, attachments: resolved });
    }
    catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to fetch section attachments' });
    }
});
app.put('/assessments/:id/sections/:subId/attachments', requireAuth, async (req, res) => {
    try {
        const { id, subId } = req.params;
        if (!canWriteAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const { add = [], remove = [] } = req.body || {};
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const mapping = data.sectionAttachmentsByAssessment = data.sectionAttachmentsByAssessment || {};
        const current = mapping[id] = mapping[id] || {};
        const list = new Set(current[subId] || []);
        const allIds = new Set(((data.attachmentsByAssessment || {})[id] || []).map((a) => a.id));
        (Array.isArray(add) ? add : []).forEach((attId) => { if (allIds.has(attId))
            list.add(attId); });
        (Array.isArray(remove) ? remove : []).forEach((attId) => { list.delete(attId); });
        current[subId] = Array.from(list);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        const resolved = ((data.attachmentsByAssessment || {})[id] || []).filter((a) => list.has(a.id));
        return res.json({ success: true, ids: current[subId], attachments: resolved });
    }
    catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to update section attachments' });
    }
});
app.delete('/assessments/:id/sections/:subId/attachments/:attId', requireAuth, async (req, res) => {
    try {
        const { id, subId, attId } = req.params;
        if (!canWriteAssessment(req, id))
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, '../data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const mapping = data.sectionAttachmentsByAssessment = data.sectionAttachmentsByAssessment || {};
        const current = mapping[id] = mapping[id] || {};
        const list = new Set(current[subId] || []);
        const existed = list.delete(attId);
        current[subId] = Array.from(list);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return res.json({ success: true, removed: existed ? attId : null, ids: current[subId] });
    }
    catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to unlink section attachment' });
    }
});
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ComplykOrt API Server with Real Database',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            login: '/api/auth/login',
            me: '/api/auth/me',
            dashboard: '/api/dashboard/overview',
            organizations: '/api/organizations',
            users: '/api/users',
            assessments: '/assessments'
        }
    });
});
// --- Simple Users management (file-backed) under /api/users ---
function readData() {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, '../data.json');
    let data = {};
    try {
        data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    catch { }
    if (!data.users)
        data.users = [];
    return { data, dataPath, fs };
}
function normalizeRole(role) {
    const r = String(role || '').toLowerCase();
    // canonical roles supported by UI
    const allowed = ['admin', 'manager', 'assessor', 'qa', 'viewer', 'guest'];
    if (allowed.includes(r))
        return r === 'guest' ? 'viewer' : r;
    // legacy mappings
    if (r === 'contributor' || r === 'member' || r === 'editor')
        return 'assessor';
    return 'viewer';
}
app.get('/api/users', (req, res) => {
    // allow reading without auth in dev if flag is set
    if (!(process.env.DEV_ALLOW_UNAUTH === 'true')) {
        if (!req.headers.authorization)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { data } = readData();
    const users = (data.users || []).map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role || 'viewer', active: u.active !== false }));
    return res.json({ success: true, data: users });
});
app.post('/api/users', (req, res, next) => {
    if (process.env.DEV_ALLOW_UNAUTH === 'true')
        return next();
    return requireAuth(req, res, next);
}, (req, res, next) => {
    if (process.env.DEV_ALLOW_UNAUTH === 'true')
        return next();
    const ok = (req.user && (req.user.email === 'admin@acme.example.com' || ((req.user.rolesByOrg || []).some((r) => ['admin', 'manager'].includes(String(r.role).toLowerCase())))));
    if (!ok)
        return res.status(403).json({ success: false, message: 'Forbidden' });
    return next();
}, async (req, res) => {
    try {
        const { email, name, role } = req.body || {};
        if (!email || !name)
            return res.status(400).json({ success: false, message: 'email and name required' });
        const desiredRole = normalizeRole(role);
        // resolve org
        const ur = (req.user?.rolesByOrg || []);
        let orgId = req.user?.orgId || ur[0]?.orgId || null;
        if (!orgId) {
            const anyOrg = await prisma.organization.findFirst({ select: { id: true } });
            orgId = anyOrg?.id || null;
        }
        if (!orgId)
            return res.status(400).json({ success: false, message: 'orgId not resolved' });
        // find or create user
        let user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
        if (!user) {
            user = await prisma.user.create({ data: { email: String(email).toLowerCase(), name: name, status: 'active', emailVerified: false } });
        }
        // upsert membership
        const existing = await prisma.membership.findFirst({ where: { userId: user.id, orgId } });
        if (!existing)
            await prisma.membership.create({ data: { userId: user.id, orgId, role: desiredRole } });
        else if (existing.role !== desiredRole)
            await prisma.membership.update({ where: { id: existing.id }, data: { role: desiredRole } });
        return res.status(201).json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: desiredRole, active: (user.status || 'active').toLowerCase() !== 'inactive' } });
    }
    catch (e) {
        console.error('Create user error', e);
        return res.status(500).json({ success: false, message: 'Failed to create user' });
    }
});
app.put('/api/users/:id', (req, res, next) => {
    if (process.env.DEV_ALLOW_UNAUTH === 'true')
        return next();
    return requireAuth(req, res, next);
}, async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, role, active } = req.body || {};
        // resolve org
        const ur = (req.user?.rolesByOrg || []);
        let orgId = req.user?.orgId || ur[0]?.orgId || null;
        if (!orgId) {
            const anyOrg = await prisma.organization.findFirst({ select: { id: true } });
            orgId = anyOrg?.id || null;
        }
        if (!orgId)
            return res.status(400).json({ success: false, message: 'orgId not resolved' });
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        // name update
        if (name !== undefined) {
            user = await prisma.user.update({ where: { id: userId }, data: { name } });
        }
        // role update via membership
        if (role !== undefined) {
            const desiredRole = normalizeRole(role);
            const existing = await prisma.membership.findFirst({ where: { userId, orgId } });
            if (!existing)
                await prisma.membership.create({ data: { userId, orgId, role: desiredRole } });
            else if (existing.role != desiredRole)
                await prisma.membership.update({ where: { id: existing.id }, data: { role: desiredRole } });
        }
        // active toggle (admin only)
        if (active !== undefined) {
            const isAdminRole = (req.user && (req.user.email === 'admin@acme.example.com' || ((req.user.rolesByOrg || []).some((r) => String(r.role).toLowerCase() === 'admin'))));
            if (!(process.env.DEV_ALLOW_UNAUTH === 'true') && !isAdminRole)
                return res.status(403).json({ success: false, message: 'Forbidden (admin required for activation change)' });
            user = await prisma.user.update({ where: { id: userId }, data: { status: active ? 'active' : 'inactive' } });
        }
        // compose response role/active
        const mem = await prisma.membership.findFirst({ where: { userId, orgId }, select: { role: true } });
        const resp = { id: user.id, email: user.email, name: user.name, role: mem?.role || 'viewer', active: (user.status || 'active').toLowerCase() != 'inactive' };
        return res.json({ success: true, data: resp });
    }
    catch (e) {
        console.error('Update user error', e);
        return res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});
app.delete('/api/users/:id', (req, res, next) => {
    if (process.env.DEV_ALLOW_UNAUTH === 'true')
        return next();
    return requireAuth(req, res, next);
}, async (req, res) => {
    try {
        // admin only
        const isAdminRole = (req.user && (req.user.email === 'admin@acme.example.com' || ((req.user.rolesByOrg || []).some((r) => String(r.role).toLowerCase() === 'admin'))));
        if (!(process.env.DEV_ALLOW_UNAUTH === 'true') && !isAdminRole)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const userId = req.params.id;
        const hard = (req.query.hard === 'true' || req.query.hard === '1');
        if (hard) {
            const ur = (req.user?.rolesByOrg || []);
            let orgId = req.user?.orgId || ur[0]?.orgId || null;
            if (!orgId) {
                const anyOrg = await prisma.organization.findFirst({ select: { id: true } });
                orgId = anyOrg?.id || null;
            }
            if (!orgId)
                return res.status(400).json({ success: false, message: 'orgId not resolved' });
            await prisma.membership.deleteMany({ where: { userId, orgId } });
            const remaining = await prisma.membership.count({ where: { userId } });
            if (remaining === 0) {
                await prisma.user.update({ where: { id: userId }, data: { status: 'inactive' } });
            }
            return res.json({ success: true, removed: true, userId });
        }
        else {
            const user = await prisma.user.update({ where: { id: userId }, data: { status: 'inactive' } });
            return res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: 'viewer', active: false } });
        }
    }
    catch (e) {
        console.error('Delete user error', e);
        return res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
});
// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});
// Start server
app.listen(port, host, () => {
    console.log(`🚀 ComplykOrt API server running on ${host}:${port}`);
    console.log(`📍 External access: http://95.217.190.154:${port}`);
    console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: Connected to PostgreSQL`);
    console.log(`🔑 Demo credentials: admin@acme.example.com / demo123!`);
});
exports.default = app;
//# sourceMappingURL=server-real.js.map