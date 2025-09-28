# ComplykOrt Security, Audit & Migration Strategy

## Security Architecture

### Multi-Tenant Data Isolation

**Database-Level Isolation**
- All queries MUST include `org_id` filtering
- Row-level security (RLS) policies enforced at database level
- No cross-organization data leakage possible

```sql
-- Example RLS Policy
CREATE POLICY tenant_isolation ON projects
  FOR ALL
  TO application_role
  USING (org_id = current_setting('app.current_org_id')::UUID);

-- All application queries filtered by tenant
SELECT * FROM projects 
WHERE org_id = :current_user_org_id
  AND deleted_at IS NULL;
```

**Application-Level Security**
- Middleware validates org membership on every request
- JWT tokens include org context and roles
- API endpoints enforce org-scoped resource access

### Authentication & Authorization

**JWT Security**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "org_id": "uuid", 
  "role": "manager",
  "permissions": ["projects:read", "tasks:write"],
  "iat": 1640995200,
  "exp": 1641009600,
  "iss": "complykort",
  "aud": "complykort-api"
}
```

**Token Management**
- Access tokens: 1 hour expiry
- Refresh tokens: 7 days expiry  
- Automatic token refresh before expiration
- Secure HTTP-only cookies for refresh tokens
- Token revocation on password change/logout

**Password Security**
- Minimum 12 characters
- Must include uppercase, lowercase, number, special character
- Argon2id hashing with salt
- Password history prevention (last 5 passwords)
- Account lockout after 5 failed attempts (15 min lockout)

### File Security

**Upload Security**
```javascript
// File upload validation
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'text/plain',
  'text/csv'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES_PER_UPLOAD = 10;
```

**File Processing Pipeline**
1. **Client-side validation**: File type, size, count
2. **Server-side validation**: MIME type verification, magic number checking
3. **Virus scanning**: Integration with ClamAV or similar
4. **Hash calculation**: SHA-256 for integrity and deduplication  
5. **Storage**: S3-compatible with server-side encryption
6. **Access control**: Signed URLs with expiration

**File Storage Structure**
```
s3://complykort-files/
├── organizations/
│   └── {org_id}/
│       ├── projects/
│       │   └── {project_id}/
│       │       └── {year}/{month}/{file_hash}
│       └── evidence/
│           └── {section_key}/
│               └── {evidence_id}/{file_hash}
```

### API Security

**Rate Limiting**
```yaml
rate_limits:
  auth_endpoints:
    login: 5 requests/minute per IP
    password_reset: 3 requests/hour per IP
  api_endpoints:
    per_user: 1000 requests/hour
    per_org: 10000 requests/hour
  file_uploads:
    per_user: 100 files/hour
    total_size: 1GB/hour per org
```

**Input Validation & Sanitization**
- All inputs validated against schemas (Joi/Yup)
- SQL injection prevention through parameterized queries
- XSS prevention through output encoding
- CSRF protection via token validation
- Request size limits (JSON: 10MB, Files: 100MB)

**Security Headers**
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), location=()
```

### Encryption

**Data at Rest**
- Database: TDE (Transparent Data Encryption) enabled
- File storage: AES-256 server-side encryption
- Backups: Encrypted with customer-managed keys
- Logs: Encrypted with platform-managed keys

**Data in Transit** 
- TLS 1.3 minimum for all HTTP connections
- Certificate pinning for API clients
- HSTS headers enforced
- No HTTP redirects allowed

**Sensitive Data Handling**
- PII encrypted at application level (AES-256-GCM)
- Database connection strings in encrypted secrets
- API keys rotated every 90 days
- No sensitive data in logs or error messages

## Audit & Compliance

### Comprehensive Audit Logging

**Audit Events Tracked**
```typescript
interface AuditEvent {
  id: string;
  org_id: string;
  actor_id: string | null; // null for system actions
  action: string;
  target_type: string;
  target_id: string;
  target_name: string;
  payload: Record<string, any>;
  ip_address: string;
  user_agent: string;
  session_id: string;
  created_at: string;
}

// Critical actions that MUST be audited
const AUDIT_ACTIONS = [
  // Authentication
  'user_login_success',
  'user_login_failed', 
  'user_logout',
  'password_changed',
  '2fa_enabled',
  '2fa_disabled',
  
  // User Management
  'user_invited',
  'user_role_changed',
  'user_removed',
  'invitation_accepted',
  
  // Data Operations
  'project_created',
  'project_deleted',
  'file_uploaded',
  'file_deleted',
  'evidence_validated',
  
  // Security Events
  'permission_denied',
  'rate_limit_exceeded',
  'suspicious_activity',
  
  // Export Operations
  'data_exported',
  'report_generated',
  'bulk_operation'
];
```

**Audit Log Retention**
- Security events: 7 years
- User actions: 3 years  
- System events: 1 year
- Failed access attempts: 90 days

**Audit Log Protection**
- Write-only access for application
- Separate database/storage from operational data
- Integrity checks via hash chains
- Immutable storage (WORM compliance)
- Regular backup verification

### GDPR Compliance

**Data Subject Rights**
```typescript
// Right to Access (Article 15)
GET /api/v1/gdpr/data-export
// Returns all user data in machine-readable format

// Right to Rectification (Article 16)
PUT /api/v1/profile
// User can correct personal information

// Right to Erasure (Article 17)
DELETE /api/v1/gdpr/delete-account
// Anonymizes user data, keeps audit logs

// Right to Data Portability (Article 20)  
GET /api/v1/gdpr/data-export?format=json
// Structured data export

// Right to Object (Article 21)
PUT /api/v1/profile/consent
// Manage communication preferences
```

**Data Processing Lawfulness**
- Consent: Marketing communications, optional features
- Contract: Core service delivery, account management
- Legitimate Interest: Security monitoring, fraud prevention
- Legal Obligation: Audit logs, financial records

**Privacy by Design**
- Data minimization: Only collect necessary data
- Purpose limitation: Use data only for stated purposes
- Storage limitation: Automatic data purging
- Accuracy: User-correctable information
- Integrity: Encryption and access controls
- Accountability: Privacy impact assessments

### SOC 2 Compliance Readiness

**Security (CC) Controls**
- CC1: Control Environment - RBAC implementation
- CC2: Communication & Information - Security policies
- CC3: Risk Assessment - Regular security reviews
- CC4: Monitoring - Comprehensive logging
- CC5: Control Activities - Automated controls
- CC6: Logical Access - Authentication/authorization
- CC7: System Operations - Change management
- CC8: Change Management - Deployment controls
- CC9: Risk Mitigation - Incident response

**Availability (A) Controls**
- A1: Availability - 99.9% uptime SLA
- A2: Environmental Protections - Cloud infrastructure
- A3: Logical Access - Redundancy planning

**Confidentiality (C) Controls**
- C1: Confidentiality - Data encryption
- C2: Disposal - Secure data deletion

## Soft Delete & Data Lifecycle

### Soft Delete Implementation

**Soft Delete Pattern**
```sql
-- Projects table with soft delete
ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE tasks ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE files ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Queries automatically exclude soft-deleted records
SELECT * FROM projects 
WHERE org_id = :org_id 
  AND deleted_at IS NULL;

-- Admin restore capability
UPDATE projects 
SET deleted_at = NULL, updated_at = NOW()
WHERE id = :project_id AND org_id = :org_id;
```

**Data Recovery Windows**
- Projects: 90 days recovery window
- Tasks: 30 days recovery window  
- Files: 90 days recovery window
- User accounts: 30 days recovery window

**Hard Delete Process**
```typescript
// Automated cleanup job (daily)
async function purgeOldSoftDeletedRecords() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  
  // Hard delete old soft-deleted records
  await db.projects.deleteMany({
    deleted_at: { lt: cutoff },
    // Additional safety checks
  });
  
  // Log purge operations for audit
  await auditLog.create({
    action: 'data_purged',
    target_type: 'projects',
    payload: { records_purged: count }
  });
}
```

### Backup & Recovery

**Backup Strategy**
- **Database**: 
  - Point-in-time recovery (PITR) with 30-day retention
  - Daily automated backups with 1-year retention
  - Cross-region replication for disaster recovery
  
- **File Storage**:
  - Versioned objects with 90-day retention
  - Cross-region replication
  - Glacier archival after 1 year

**Recovery Testing**
- Monthly backup restoration tests
- Quarterly disaster recovery drills
- RTO target: 4 hours
- RPO target: 15 minutes

### Data Retention Policies

**Organizational Data**
```typescript
const RETENTION_POLICIES = {
  // Core business data
  projects: '7 years after completion',
  tasks: '3 years after completion',
  files: '7 years after upload',
  evidence: '10 years after collection',
  
  // User data
  user_accounts: '30 days after deletion',
  activity_logs: '3 years from creation',
  audit_logs: '7 years from creation',
  
  // Operational data  
  error_logs: '90 days from creation',
  performance_metrics: '1 year from creation',
  backup_files: '1 year from creation',
  
  // Security data
  failed_login_attempts: '90 days from attempt',
  security_incidents: '7 years from resolution',
  access_tokens: 'Immediate after expiry'
};
```

## Migration Strategy

### Phase 0 → Phase 1 Migration

**Zero-Downtime Migration Plan**

**Step 1: Database Schema Extension** (Week 1)
```sql
-- Add Phase 1 tables without affecting Phase 0
CREATE TABLE frameworks (...);
CREATE TABLE sections (...);
CREATE TABLE assessments (...);
CREATE TABLE evidence (...);
-- ... other Phase 1 tables

-- Seed reference data
INSERT INTO frameworks VALUES (...);
INSERT INTO sections VALUES (...);
```

**Step 2: Gradual Feature Rollout** (Week 2-3)
- Deploy Phase 1 API endpoints (disabled by feature flag)
- Internal testing with subset of users
- Validate backward compatibility
- Performance testing with real data

**Step 3: User-Driven Migration** (Week 4+)
- Enable Phase 1 features for opt-in beta users
- Projects remain Phase 0 unless explicitly converted
- Users choose when to convert projects to assessments
- Full rollback capability maintained

**Rollback Strategy**
```typescript
// Emergency rollback capability
async function rollbackToPhase0() {
  // Disable Phase 1 features
  await featureFlags.set('phase1_enabled', false);
  
  // Preserve Phase 0 functionality
  // Phase 1 data remains in database but inactive
  
  // Log rollback event
  await auditLog.create({
    action: 'system_rollback',
    payload: { from: 'phase1', to: 'phase0' }
  });
}
```

### Database Migration Best Practices

**Schema Changes**
- All migrations must be backward compatible
- Use feature flags for gradual rollouts
- Maintain separate migration history
- Test migrations on production-sized datasets

**Data Migration**
- Batch processing for large datasets (1000 records/batch)
- Progress tracking and resumability
- Validation checksums for data integrity
- Rollback scripts for each migration step

**Performance Considerations**
- Index creation during low-traffic periods
- Online schema changes where possible
- Query optimization before deploying new features
- Connection pooling adjustments for new load patterns

## Risk Assessment & Mitigation

### Security Risks

**High-Risk Scenarios**
1. **Cross-tenant data leakage**
   - Mitigation: Database RLS policies, application-level filtering
   - Detection: Automated testing, audit log monitoring

2. **Privilege escalation attacks**
   - Mitigation: Principle of least privilege, role validation
   - Detection: Permission change auditing, anomaly detection

3. **File-based attacks (malware)**
   - Mitigation: Virus scanning, MIME validation, sandboxing
   - Detection: File integrity monitoring, behavior analysis

**Medium-Risk Scenarios**
1. **DDoS attacks**
   - Mitigation: Rate limiting, CDN, auto-scaling
   - Detection: Traffic pattern analysis, performance monitoring

2. **Data breaches via compromised accounts**
   - Mitigation: MFA enforcement, session management
   - Detection: Failed login monitoring, geolocation analysis

### Operational Risks

**High-Risk Scenarios**  
1. **Database corruption**
   - Mitigation: Regular backups, PITR, checksums
   - Detection: Automated integrity checks, monitoring alerts

2. **Service unavailability**
   - Mitigation: Multi-region deployment, health checks
   - Detection: Uptime monitoring, performance metrics

### Compliance Risks

**High-Risk Scenarios**
1. **GDPR violations**
   - Mitigation: Privacy by design, consent management
   - Detection: Data access auditing, retention policy monitoring

2. **Audit failures**
   - Mitigation: Comprehensive logging, regular reviews
   - Detection: Log completeness checks, compliance monitoring

## Incident Response Plan

### Security Incident Classification

**P1 - Critical (Response: Immediate)**
- Data breach with PII exposure
- Authentication system compromise  
- Complete service outage
- Malware detection in uploads

**P2 - High (Response: 4 hours)**
- Individual account compromise
- Privilege escalation attempt
- Database performance degradation
- Partial service outage

**P3 - Medium (Response: 24 hours)**
- Failed login spikes
- Unusual access patterns
- Non-critical system errors
- Performance issues

### Response Procedures

**Immediate Actions (0-15 minutes)**
1. Isolate affected systems
2. Notify incident response team
3. Begin evidence collection
4. Assess blast radius

**Short-term Actions (15 minutes - 4 hours)**  
1. Contain the incident
2. Eradicate threats
3. Begin recovery procedures
4. Notify affected customers

**Long-term Actions (4+ hours)**
1. Full system recovery
2. Post-incident analysis
3. Update security controls
4. Document lessons learned

This comprehensive security and migration strategy ensures ComplykOrt maintains the highest security standards while providing a smooth path for feature evolution and compliance with regulatory requirements.
