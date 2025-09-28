"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = __importDefault(require("./utils/logger"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Trust proxy for proper IP detection behind reverse proxy
app.set('trust proxy', true);
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://95.217.190.154:3001", "ws://95.217.190.154:3001"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration for external access
const allowedOrigins = [
    'http://localhost:3000',
    'http://95.217.190.154:3000',
    'http://127.0.0.1:3000'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        logger_1.default.warn(`CORS blocked origin: ${origin}`);
        return callback(null, true); // Allow for development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-organization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        server_ip: req.ip,
        message: 'ComplykOrt API is running (Demo Mode - No Database)'
    });
});
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ComplykOrt API Server',
        status: 'running',
        version: '1.0.0',
        mode: 'demo',
        docs: '/api/v1',
    });
});
// Demo API endpoints
app.use('/api/v1', (req, res) => {
    res.json({
        message: 'ComplykOrt API v1.0.0',
        status: 'active',
        mode: 'demo',
        endpoints: [
            'POST /api/v1/auth/login',
            'POST /api/v1/auth/logout',
            'GET /api/v1/auth/me',
            'GET /api/v1/organizations',
            'GET /api/v1/projects',
            'GET /api/v1/tasks',
            'GET /api/v1/files',
        ],
        server_time: new Date().toISOString(),
        note: 'This is a demo API without database connection'
    });
});
// Demo dashboard data endpoint
app.get('/api/v1/dashboard', (req, res) => {
    res.json({
        projects: {
            total: 12,
            byStatus: {
                backlog: 2,
                inProgress: 6,
                inReview: 3,
                finished: 1,
            },
        },
        tasks: {
            assignedToMe: 8,
            dueSoon: [
                {
                    id: '1',
                    title: 'Complete security review',
                    projectName: 'SOC 2 Audit Q1',
                    dueDate: '2024-01-25',
                    priority: 'high',
                },
                {
                    id: '2',
                    title: 'Upload evidence documents',
                    projectName: 'PCI DSS Assessment',
                    dueDate: '2024-01-28',
                    priority: 'medium',
                },
            ],
        },
        files: {
            uploadedThisWeek: 23,
            totalSizeMB: 1250,
        },
        activity: [
            {
                action: 'Jane Smith assigned "Review IAM" to Bob Wilson',
                time: '2 hours ago',
            },
            {
                action: 'Alice Johnson completed "Upload evidence"',
                time: '4 hours ago',
            },
            {
                action: 'Project "SOC 2 Audit Q1" moved to In Review',
                time: '1 day ago',
            },
        ]
    });
});
// Global error handler
app.use((error, req, res, next) => {
    logger_1.default.error('Unhandled error:', error);
    res.status(500).json({
        error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
        },
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            code: 'NOT_FOUND',
            path: req.originalUrl,
        },
    });
});
// Start server on all interfaces
const server = app.listen(port, '0.0.0.0', () => {
    logger_1.default.info(`ComplykOrt API server running on 0.0.0.0:${port}`);
    logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger_1.default.info(`External access: http://95.217.190.154:${port}`);
    logger_1.default.info(`Mode: Demo (No Database)`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger_1.default.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    logger_1.default.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger_1.default.info('Process terminated');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=server-simple.js.map