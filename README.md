# ComplykOrt - Secure Multi-Tenant Compliance Platform

## Project Overview

ComplykOrt is a comprehensive, secure, multi-tenant compliance management platform designed to help organizations manage assessments, evidence collection, and regulatory requirements. The platform follows a phased approach, starting with a solid project management foundation (Phase 0) and evolving into specialized compliance functionality (Phase 1).

## Architecture Documentation

This repository contains the complete architectural specification for ComplykOrt, including data models, API design, user flows, and security considerations.

### 📁 Documentation Structure

```
docs/
├── architecture/
│   ├── phase0-foundation.md          # Core platform overview
│   ├── rbac-matrix.md               # Role-based access control
│   ├── phase1-compliance-integration.md  # Future compliance features
│   └── security-audit-migration.md  # Security & migration strategy
├── database/
│   └── entities.md                  # Complete data model specifications
├── api/
│   └── endpoints.md                 # REST API specification
└── ui-flows/
    ├── dashboard-widgets.md         # Dashboard design & KPIs
    ├── project-management.md        # Project/task management flows
    └── user-team-management.md      # User invitation & team flows
```

## Phase 0 - Foundation Capabilities

### Core Features
- **Multi-tenant Architecture**: Complete organizational isolation with secure data boundaries
- **Project Management**: Kanban boards, task tracking, file management
- **Team Collaboration**: User invitations, role-based permissions, activity feeds
- **Dashboard Analytics**: Real-time insights on project status and team productivity
- **Secure File Handling**: Virus scanning, integrity checks, signed URLs
- **Comprehensive Audit Trail**: Complete logging of sensitive actions

### Key Entities
- **Organization**: Tenant boundary with settings and billing
- **User**: Global user accounts with multi-org membership
- **Membership**: Org-specific roles and permissions
- **Project**: Assessment containers with lifecycle management
- **Task**: Granular work items with assignments and tracking
- **File**: Secure document storage with metadata and versioning
- **ActivityLog**: Immutable audit trail for compliance
- **Invitation**: Secure team member onboarding

### Security Features
- **Authentication**: JWT with refresh tokens, 2FA support, SSO ready
- **Authorization**: 4-tier RBAC (Admin, Manager, Contributor, Viewer)
- **Data Isolation**: Row-level security, org_id filtering on all queries
- **File Security**: Upload validation, virus scanning, hash verification
- **Audit Logging**: Comprehensive tracking of all sensitive operations
- **Encryption**: TLS 1.3 in transit, AES-256 at rest

## Phase 1 - Compliance Module Extensions

### Additional Capabilities
- **Framework Management**: Support for SOC 2, ISO 27001, PCI DSS, GDPR
- **Evidence Collection**: Structured evidence linking with validation workflows
- **Compliance Scoring**: Automated calculation of compliance percentages
- **Report Generation**: Professional compliance reports and documentation packages
- **Assessment Workflows**: Specialized project types for compliance audits

### Integration Points
- **Document Parsing Service**: Integration with Docling for content extraction
- **Report Generation Service**: Integration with docxtpl for professional reports
- **RAG Agent Tools**: Future AI-powered compliance assistance

### Migration Strategy
- **Backward Compatible**: Phase 0 functionality remains unchanged
- **User-Driven**: Organizations choose when to adopt compliance features
- **Zero Downtime**: Gradual rollout with feature flags and rollback capability

## Technical Specifications

### Technology Stack
- **Backend**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL with row-level security
- **Authentication**: JWT with OIDC support
- **File Storage**: S3-compatible with server-side encryption
- **Frontend**: React/Next.js SPA
- **Deployment**: Docker containers, cloud-native

### Performance Requirements
- **Dashboard Load Time**: ≤ 2 seconds
- **API Response Time**: ≤ 500ms for standard operations
- **File Upload**: Support up to 100MB per file
- **Concurrent Users**: 1000+ per organization
- **Uptime SLA**: 99.9% availability

### Compliance Readiness
- **GDPR Compliant**: Data subject rights, privacy by design
- **SOC 2 Ready**: Comprehensive controls for security and availability
- **Enterprise Security**: Encryption, audit logging, access controls
- **Data Retention**: Configurable policies with automated cleanup

## Getting Started

### For Product Teams
1. Review the [Phase 0 Foundation](docs/architecture/phase0-foundation.md) document
2. Examine the [Database Entities](docs/database/entities.md) specification
3. Study the [API Endpoints](docs/api/endpoints.md) for integration planning
4. Review [UI Flows](docs/ui-flows/) for user experience design

### For Engineering Teams
1. Start with [Database Entities](docs/database/entities.md) for schema design
2. Implement [API Endpoints](docs/api/endpoints.md) following the specification
3. Review [Security & Migration](docs/architecture/security-audit-migration.md) for implementation guidelines
4. Use [RBAC Matrix](docs/architecture/rbac-matrix.md) for permission implementation

### For Design Teams
1. Study [Dashboard Widgets](docs/ui-flows/dashboard-widgets.md) for analytics design
2. Review [Project Management Flows](docs/ui-flows/project-management.md) for task interfaces
3. Examine [User Management Flows](docs/ui-flows/user-team-management.md) for onboarding design
4. Consider responsive design patterns and accessibility requirements

### For Compliance Teams
1. Review [Phase 1 Integration](docs/architecture/phase1-compliance-integration.md) for compliance features
2. Examine evidence collection and validation workflows
3. Study report generation and audit trail capabilities
4. Plan framework-specific customizations and integrations

## Key Success Metrics

### Phase 0 MVP Acceptance Criteria
- ✅ Multi-tenant organization setup and user invitations
- ✅ Project creation with kanban board task management
- ✅ Secure file upload, storage, and sharing
- ✅ Role-based access control enforcement
- ✅ Real-time dashboard with project/task analytics
- ✅ Comprehensive audit logging for sensitive actions

### Performance Targets
- **User Onboarding**: < 5 minutes from invitation to productive use
- **Project Setup**: < 10 minutes to create project with initial tasks
- **File Operations**: < 30 seconds for 50MB file upload and processing
- **Dashboard Loading**: < 2 seconds for widget refresh
- **Search Performance**: < 1 second for cross-project search results

### Compliance Targets (Phase 1)
- **Assessment Setup**: < 30 minutes to configure framework-based assessment
- **Evidence Upload**: > 95% success rate with validation
- **Report Generation**: < 5 minutes for standard compliance reports
- **Framework Coverage**: Support for top 5 compliance frameworks
- **User Adoption**: > 60% of projects converted to assessments within 6 months

## Risk Mitigation

### Security Risks
- **Cross-tenant data leakage**: Database RLS policies + application filtering
- **Privilege escalation**: Least privilege principle + audit logging
- **File-based attacks**: Virus scanning + MIME validation + sandboxing

### Operational Risks  
- **Database corruption**: PITR backups + integrity checks + replication
- **Service unavailability**: Multi-region deployment + health monitoring + auto-scaling

### Compliance Risks
- **Audit failures**: Comprehensive logging + regular compliance reviews
- **Data privacy violations**: GDPR compliance + consent management + retention policies

## Next Steps

### Phase 0 Implementation (Weeks 1-12)
1. **Database & API Development** (Weeks 1-6)
   - Implement core data models and relationships
   - Build REST API with authentication and authorization
   - Set up secure file handling and audit logging

2. **Frontend Development** (Weeks 4-10)
   - Create dashboard with analytics widgets
   - Build project management interface with kanban board
   - Implement user management and invitation flows

3. **Testing & Security** (Weeks 8-12)
   - Comprehensive security testing and penetration testing
   - Performance testing with realistic data loads
   - Compliance audit preparation and documentation

### Phase 1 Planning (Weeks 10-16)
1. **Compliance Requirements** (Weeks 10-12)
   - Detailed framework analysis and mapping
   - Evidence collection workflow design
   - Report template development

2. **Integration Design** (Weeks 12-14)
   - Document parsing service integration specification
   - Report generation service integration planning
   - Data migration strategy refinement

3. **Pilot Preparation** (Weeks 14-16)
   - Beta user selection and onboarding
   - Feedback collection mechanisms
   - Performance monitoring and optimization

This comprehensive specification provides the foundation for building a secure, scalable, and compliance-ready platform that can evolve from a powerful project management tool into a specialized compliance management solution.

---

## 🚀 Development Setup

### Quick Start

1. **Clone and Setup**:
   ```bash
   git clone <repository-url>
   cd complykort
   ./setup-dev.sh
   ```

2. **Start Development Servers**:
   
   **Option A: Manual (Recommended for development)**
   ```bash
   # Terminal 1 - Backend API
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend  
   npm run dev
   ```
   
   **Option B: Docker Compose**
   ```bash
   docker-compose up
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432 (complykort/complykort_password)

### Development Workflow

#### Backend Development
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server with hot reload
npm run dev

# Run tests
npm test

# View database in Prisma Studio
npx prisma studio
```

#### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check
```

### Project Structure

```
complykort/
├── docs/                          # Architecture documentation
├── backend/                       # Express.js API server
│   ├── src/
│   │   ├── controllers/          # Route controllers
│   │   ├── middleware/           # Authentication, validation, etc.
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Helper functions
│   │   └── server.ts            # Main server file
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── package.json
├── frontend/                     # Next.js React application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   ├── components/         # Reusable components
│   │   ├── theme/              # Material-UI theme
│   │   └── lib/                # Utility functions
│   └── package.json
└── docker-compose.yml           # Development environment
```

### Technology Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs for password hashing
- Winston for logging

**Frontend:**
- Next.js 14 (App Router)
- React 19
- Material-UI (MUI)
- TypeScript
- Axios for API calls
- React Hook Form

**Development:**
- Docker & Docker Compose
- ESLint + Prettier
- Jest for testing

### Environment Variables

#### Backend (.env)
```
DATABASE_URL="postgresql://complykort:complykort_password@localhost:5432/complykort_dev"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-characters"
NODE_ENV="development"
PORT=3001
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ComplykOrt
```

### Database Management

```bash
# Create and run migration
npx prisma migrate dev --name your-migration-name

# Reset database (caution: deletes all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database with sample data
npm run db:seed
```

### Available Scripts

#### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

#### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Troubleshooting

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# View PostgreSQL logs
docker-compose logs postgres
```

#### Port Conflicts
- Backend (3001): Change `PORT` in backend/.env
- Frontend (3000): Change port with `npm run dev -- -p 3002`
- Database (5432): Change port mapping in docker-compose.yml

#### Permission Errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo usermod -aG docker $USER
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test` in both backend and frontend)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Production Deployment

The application is designed for cloud-native deployment with:
- Docker containers
- PostgreSQL database
- S3-compatible file storage
- Environment-based configuration
- Health checks and graceful shutdown

See the deployment documentation in `/docs/architecture/` for detailed production setup instructions.
