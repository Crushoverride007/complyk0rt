# ComplykOrt Phase 0 - API Specification

## API Design Principles
- **RESTful**: Standard HTTP methods with consistent URL patterns
- **JSON**: All requests/responses in JSON format
- **Tenant Isolation**: All endpoints enforce org_id scoping
- **Versioning**: v1 prefix for all endpoints
- **Pagination**: Cursor-based pagination for list endpoints
- **Rate Limiting**: 1000 req/hour per user, 10000/hour per organization

## Authentication & Authorization

### Authentication Flow
```http
POST /api/v1/auth/login
POST /api/v1/auth/logout  
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

**Login Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Login Response**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com", 
    "name": "John Doe",
    "avatar_url": "https://...",
    "timezone": "America/New_York"
  },
  "access_token": "jwt_token",
  "refresh_token": "jwt_refresh_token",
  "expires_in": 3600,
  "organizations": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "slug": "acme-corp", 
      "role": "admin"
    }
  ]
}
```

## Organization Management

### Organizations
```http
GET    /api/v1/organizations                 # List user's organizations
POST   /api/v1/organizations                 # Create organization (first user becomes admin)
GET    /api/v1/organizations/:slug           # Get organization details  
PUT    /api/v1/organizations/:slug           # Update organization
DELETE /api/v1/organizations/:slug           # Delete organization (admin only)
```

### Members & Invitations
```http
GET    /api/v1/organizations/:slug/members          # List members
PUT    /api/v1/organizations/:slug/members/:userId  # Update member role
DELETE /api/v1/organizations/:slug/members/:userId  # Remove member

GET    /api/v1/organizations/:slug/invitations      # List pending invitations
POST   /api/v1/organizations/:slug/invitations      # Send invitation
DELETE /api/v1/organizations/:slug/invitations/:id  # Cancel invitation

POST   /api/v1/invitations/:token/accept            # Accept invitation (public endpoint)
```

**Invite Request**:
```json
{
  "email": "newuser@example.com",
  "role": "contributor", 
  "message": "Welcome to our compliance team"
}
```

## Project Management

### Projects  
```http
GET    /api/v1/projects                    # List projects (filtered by role/access)
POST   /api/v1/projects                    # Create project
GET    /api/v1/projects/:id                # Get project details
PUT    /api/v1/projects/:id                # Update project  
DELETE /api/v1/projects/:id                # Delete project (soft delete)
POST   /api/v1/projects/:id/archive        # Archive project
POST   /api/v1/projects/:id/restore        # Restore archived project
```

**Project Response**:
```json
{
  "id": "uuid",
  "name": "SOC 2 Audit Q1",
  "description": "Annual SOC 2 Type II assessment",
  "status": "in_progress", 
  "priority": "high",
  "owner": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@acme.com"
  },
  "framework_id": null,
  "metadata": {},
  "start_date": "2024-01-15",
  "due_date": "2024-03-31", 
  "task_counts": {
    "backlog": 12,
    "in_progress": 8,
    "in_review": 3,
    "completed": 25
  },
  "file_count": 45,
  "created_at": "2024-01-10T10:00:00Z",
  "updated_at": "2024-01-20T14:30:00Z"
}
```

### Project Stats & Analytics
```http
GET /api/v1/projects/:id/stats             # Project statistics
GET /api/v1/projects/:id/activity          # Project activity feed
```

## Task Management

### Tasks
```http
GET    /api/v1/projects/:projectId/tasks   # List project tasks
POST   /api/v1/projects/:projectId/tasks   # Create task
GET    /api/v1/tasks/:id                   # Get task details
PUT    /api/v1/tasks/:id                   # Update task
DELETE /api/v1/tasks/:id                   # Delete task (soft delete)
```

**Task Response**:
```json
{
  "id": "uuid",
  "title": "Review access control policies", 
  "description": "Analyze current IAM policies for compliance gaps",
  "status": "in_progress",
  "priority": "medium",
  "assignee": {
    "id": "uuid",
    "name": "Bob Wilson", 
    "email": "bob@acme.com"
  },
  "reporter": {
    "id": "uuid", 
    "name": "Jane Smith",
    "email": "jane@acme.com"
  },
  "section_key": null,
  "labels": ["security", "iam", "urgent"],
  "estimate_hours": 8,
  "actual_hours": 5,
  "due_date": "2024-02-15",
  "created_at": "2024-01-15T09:00:00Z",
  "updated_at": "2024-01-18T16:45:00Z"
}
```

### Task Board Operations
```http
PUT /api/v1/tasks/:id/move                 # Move task between columns
PUT /api/v1/tasks/bulk-update             # Bulk update tasks (status, assignee)
```

## File Management

### Files
```http
GET    /api/v1/files                       # List files (org-wide, filtered by access)
POST   /api/v1/files/upload-url            # Get signed upload URL  
POST   /api/v1/files                       # Register uploaded file
GET    /api/v1/files/:id                   # Get file metadata
PUT    /api/v1/files/:id                   # Update file metadata
DELETE /api/v1/files/:id                   # Delete file (soft delete)
GET    /api/v1/files/:id/download          # Download file (signed URL)
```

**Upload URL Request**:
```json
{
  "filename": "policy-document.pdf",
  "size": 2048576,
  "mime_type": "application/pdf", 
  "project_id": "uuid",
  "task_id": "uuid", 
  "tags": ["policy", "security"]
}
```

**File Response**:
```json
{
  "id": "uuid",
  "name": "policy-document.pdf",
  "size": 2048576,
  "mime_type": "application/pdf",
  "hash_sha256": "abc123...",
  "tags": ["policy", "security"],
  "project": {
    "id": "uuid", 
    "name": "SOC 2 Audit Q1"
  },
  "uploaded_by": {
    "id": "uuid",
    "name": "Alice Johnson"
  },
  "scan_status": "clean",
  "created_at": "2024-01-20T11:30:00Z",
  "download_url": "https://signed-url..."
}
```

## Activity & Audit Logs

### Activity Feed
```http
GET /api/v1/activity                       # Organization activity feed
GET /api/v1/projects/:id/activity          # Project activity feed  
GET /api/v1/tasks/:id/activity             # Task activity feed
```

**Activity Response**:
```json
{
  "activities": [
    {
      "id": "uuid",
      "action": "task_assigned", 
      "actor": {
        "id": "uuid",
        "name": "Jane Smith"
      },
      "target_type": "task",
      "target_id": "uuid", 
      "target_name": "Review access policies",
      "description": "Assigned task to Bob Wilson",
      "created_at": "2024-01-20T15:30:00Z"
    }
  ],
  "pagination": {
    "cursor": "eyJ0aW1lc3RhbXAiOiIyMDI0...",
    "has_more": true
  }
}
```

## Dashboard & Analytics

### Dashboard Data
```http
GET /api/v1/dashboard                      # Main dashboard data
GET /api/v1/dashboard/projects             # Projects widget data
GET /api/v1/dashboard/tasks               # Tasks widget data  
GET /api/v1/dashboard/files               # Files widget data
GET /api/v1/dashboard/activity            # Activity widget data
```

**Dashboard Response**:
```json
{
  "projects": {
    "total": 12,
    "by_status": {
      "backlog": 2,
      "in_progress": 6, 
      "in_review": 3,
      "finished": 1
    }
  },
  "tasks": {
    "assigned_to_me": 8,
    "due_soon": [
      {
        "id": "uuid",
        "title": "Complete security review",
        "project_name": "SOC 2 Audit Q1", 
        "due_date": "2024-01-25",
        "days_until_due": 3
      }
    ]
  },
  "files": {
    "uploaded_this_week": 23,
    "total_size_mb": 1250
  },
  "activity": [
    {
      "action": "task_completed",
      "actor_name": "Alice Johnson", 
      "description": "Completed IAM policy review",
      "created_at": "2024-01-22T10:15:00Z"
    }
  ]
}
```

## Query Parameters & Filtering

### Common Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100) 
- `sort`: Sort field (e.g., `created_at`, `name`, `due_date`)
- `order`: Sort direction (`asc` or `desc`)
- `search`: Text search across relevant fields

### Project Filtering
- `status`: Filter by project status
- `owner_id`: Filter by project owner
- `priority`: Filter by priority level
- `framework_id`: Filter by compliance framework (Phase 1)

### Task Filtering  
- `status`: Filter by task status
- `assignee_id`: Filter by assignee
- `reporter_id`: Filter by reporter  
- `priority`: Filter by priority
- `due_date_from` / `due_date_to`: Date range filters
- `labels`: Filter by labels (comma-separated)

### File Filtering
- `project_id`: Filter by project
- `mime_type`: Filter by file type
- `tags`: Filter by tags (comma-separated) 
- `uploaded_by`: Filter by uploader
- `size_min` / `size_max`: File size filters

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes
- `AUTHENTICATION_REQUIRED` (401)
- `INSUFFICIENT_PERMISSIONS` (403) 
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (422)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

## Security Headers
All API responses include security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY  
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

## Rate Limiting Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642780800
```

## Phase 1 Integration Points

Future compliance endpoints will extend this API:
```http
# Framework Management
GET    /api/v1/frameworks
POST   /api/v1/frameworks
GET    /api/v1/frameworks/:id/sections

# Assessment Extensions  
POST   /api/v1/projects/:id/convert-to-assessment
GET    /api/v1/assessments/:id/evidence
POST   /api/v1/assessments/:id/generate-report

# Evidence Management
POST   /api/v1/evidence
GET    /api/v1/evidence/:id/validate
```
