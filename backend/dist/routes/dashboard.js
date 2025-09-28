"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Apply authentication middleware to all dashboard routes
router.use(auth_1.authenticate);
// Get dashboard overview data
router.get('/overview', async (req, res) => {
    try {
        const { user } = req;
        // Get user's organizations
        const memberships = await prisma.membership.findMany({
            where: { userId: user.id },
            include: { organization: true }
        });
        if (memberships.length === 0) {
            return res.json({
                success: true,
                data: {
                    organizations: 0,
                    projects: 0,
                    tasks: 0,
                    files: 0,
                    recentActivity: []
                }
            });
        }
        const organizationIds = memberships.map(m => m.organizationId);
        // Get projects count by status
        const projectStats = await prisma.project.groupBy({
            by: ['status'],
            where: { organizationId: { in: organizationIds } },
            _count: { id: true }
        });
        // Get tasks count by status  
        const taskStats = await prisma.task.groupBy({
            by: ['status'],
            where: {
                project: {
                    organizationId: { in: organizationIds }
                }
            },
            _count: { id: true }
        });
        // Get total counts
        const totalProjects = await prisma.project.count({
            where: { organizationId: { in: organizationIds } }
        });
        const totalTasks = await prisma.task.count({
            where: {
                project: {
                    organizationId: { in: organizationIds }
                }
            }
        });
        const totalFiles = await prisma.file.count({
            where: { organizationId: { in: organizationIds } }
        });
        // Get recent activity
        const recentActivity = await prisma.activityLog.findMany({
            where: { organizationId: { in: organizationIds } },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        // Calculate project progress
        const inProgressProjects = projectStats.find(p => p.status === 'in_progress')?._count.id || 0;
        const completedProjects = projectStats.find(p => p.status === 'completed')?._count.id || 0;
        const onTrackPercentage = totalProjects > 0
            ? Math.round(((inProgressProjects + completedProjects) / totalProjects) * 100)
            : 0;
        res.json({
            success: true,
            data: {
                organizations: memberships.length,
                projects: {
                    total: totalProjects,
                    inProgress: inProgressProjects,
                    completed: completedProjects,
                    onTrackPercentage
                },
                tasks: {
                    total: totalTasks,
                    byStatus: taskStats.reduce((acc, task) => {
                        acc[task.status] = task._count.id;
                        return acc;
                    }, {})
                },
                files: totalFiles,
                recentActivity: recentActivity.map(activity => ({
                    id: activity.id,
                    action: activity.action,
                    description: activity.description,
                    user: activity.user.name,
                    createdAt: activity.createdAt,
                    metadata: activity.metadata
                }))
            }
        });
    }
    catch (error) {
        logger_1.default.error('Dashboard overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
});
// Get projects for dashboard
router.get('/projects', async (req, res) => {
    try {
        const { user } = req;
        // Get user's organizations
        const memberships = await prisma.membership.findMany({
            where: { userId: user.id },
            select: { organizationId: true }
        });
        if (memberships.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }
        const organizationIds = memberships.map(m => m.organizationId);
        const projects = await prisma.project.findMany({
            where: { organizationId: { in: organizationIds } },
            include: {
                organization: {
                    select: { name: true, slug: true }
                },
                createdBy: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json({
            success: true,
            data: projects.map(project => ({
                id: project.id,
                name: project.name,
                description: project.description,
                status: project.status,
                priority: project.priority,
                dueDate: project.dueDate,
                createdAt: project.createdAt,
                organization: project.organization,
                createdBy: project.createdBy,
                taskCount: project._count.tasks,
                settings: project.settings
            }))
        });
    }
    catch (error) {
        logger_1.default.error('Dashboard projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
});
// Get tasks assigned to current user
router.get('/my-tasks', async (req, res) => {
    try {
        const { user } = req;
        const tasks = await prisma.task.findMany({
            where: {
                assigneeId: user.id,
                status: { not: 'done' }
            },
            include: {
                project: {
                    select: { name: true, slug: true }
                },
                assignedTo: {
                    select: { name: true, email: true }
                }
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' }
            ],
            take: 10
        });
        res.json({
            success: true,
            data: tasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                createdAt: task.createdAt,
                project: task.project,
                assignedTo: task.assignedTo
            }))
        });
    }
    catch (error) {
        logger_1.default.error('Dashboard my-tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
});
// Get compliance health metrics
router.get('/compliance', async (req, res) => {
    try {
        const { user } = req;
        // Get user's organizations
        const memberships = await prisma.membership.findMany({
            where: { userId: user.id },
            select: { organizationId: true }
        });
        if (memberships.length === 0) {
            return res.json({
                success: true,
                data: {
                    frameworks: [],
                    overallHealth: 0
                }
            });
        }
        // For now, return mock compliance data
        // In a real implementation, this would calculate actual compliance scores
        const frameworks = [
            { name: 'SOC 2', score: 94, status: 'good' },
            { name: 'ISO 27001', score: 89, status: 'good' },
            { name: 'GDPR', score: 97, status: 'excellent' },
            { name: 'PCI DSS', score: 92, status: 'good' }
        ];
        const overallHealth = Math.round(frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length);
        res.json({
            success: true,
            data: {
                frameworks,
                overallHealth
            }
        });
    }
    catch (error) {
        logger_1.default.error('Dashboard compliance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch compliance data'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map