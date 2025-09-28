# ComplykOrt Phase 0 - Data Models

## Core Entities

### Organization
**Primary tenant boundary - all other entities scoped by org_id**

```sql
organizations {
  id: UUID PRIMARY KEY
  name: VARCHAR(255) NOT NULL
  slug: VARCHAR(100) UNIQUE NOT NULL  -- URL-safe identifier
  plan: VARCHAR(50) DEFAULT 'basic'   -- basic, pro, enterprise
  settings: JSONB DEFAULT '{}'        -- org-level configuration
  status: VARCHAR(20) DEFAULT 'active' -- active, suspended, deleted
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  deleted_at: TIMESTAMP WITH TIME ZONE NULL -- soft delete
}
```

### User
**Global users can belong to multiple organizations**

```sql
users {
  id: UUID PRIMARY KEY
  email: VARCHAR(255) UNIQUE NOT NULL
  name: VARCHAR(255) NOT NULL
  avatar_url: VARCHAR(500) NULL
  password_hash: VARCHAR(255) NULL      -- NULL for SSO-only users
  email_verified: BOOLEAN DEFAULT false
  status: VARCHAR(20) DEFAULT 'active'  -- active, suspended, deleted
  timezone: VARCHAR(50) DEFAULT 'UTC'
  locale: VARCHAR(10) DEFAULT 'en'
  last_login_at: TIMESTAMP WITH TIME ZONE NULL
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
}
```

### Membership
**Links users to organizations with roles**

```sql
memberships {
  id: UUID PRIMARY KEY
  user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
  org_id: UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  role: VARCHAR(20) NOT NULL            -- admin, manager, contributor, viewer
  status: VARCHAR(20) DEFAULT 'active'  -- active, suspended
  joined_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  UNIQUE(user_id, org_id)
}
```

### Project
**Assessment container - neutral name for MVP, compliance-specific later**

```sql
projects {
  id: UUID PRIMARY KEY
  org_id: UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  name: VARCHAR(255) NOT NULL
  description: TEXT NULL
  status: VARCHAR(20) DEFAULT 'backlog' -- backlog, in_progress, in_review, finished, archived
  priority: VARCHAR(10) DEFAULT 'medium' -- low, medium, high, critical
  owner_id: UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
  framework_id: UUID NULL               -- Future: references frameworks(id)
  metadata: JSONB DEFAULT '{}'          -- extensible project data
  start_date: DATE NULL
  due_date: DATE NULL
  completed_at: TIMESTAMP WITH TIME ZONE NULL
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  deleted_at: TIMESTAMP WITH TIME ZONE NULL -- soft delete
  
  INDEX(org_id, status)
  INDEX(org_id, owner_id)
}
```

### Task
**Granular work items within projects**

```sql
tasks {
  id: UUID PRIMARY KEY
  project_id: UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
  title: VARCHAR(255) NOT NULL
  description: TEXT NULL
  status: VARCHAR(20) DEFAULT 'backlog' -- backlog, in_progress, in_review, completed
  priority: VARCHAR(10) DEFAULT 'medium' -- low, medium, high, critical
  assignee_id: UUID NULL REFERENCES users(id) ON DELETE SET NULL
  reporter_id: UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
  section_key: VARCHAR(100) NULL        -- Future: compliance section reference
  labels: JSONB DEFAULT '[]'            -- array of label strings
  estimate_hours: INTEGER NULL
  actual_hours: INTEGER NULL
  due_date: DATE NULL
  completed_at: TIMESTAMP WITH TIME ZONE NULL
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  deleted_at: TIMESTAMP WITH TIME ZONE NULL -- soft delete
  
  INDEX(project_id, status)
  INDEX(project_id, assignee_id)
  INDEX(project_id, section_key) -- for future compliance grouping
}
```

### File
**Secure file storage with audit trail**

```sql
files {
  id: UUID PRIMARY KEY
  org_id: UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  project_id: UUID NULL REFERENCES projects(id) ON DELETE SET NULL
  task_id: UUID NULL REFERENCES tasks(id) ON DELETE SET NULL
  section_key: VARCHAR(100) NULL        -- Future: compliance section reference
  name: VARCHAR(255) NOT NULL           -- original filename
  path: VARCHAR(500) NOT NULL           -- storage path/key
  size: BIGINT NOT NULL                 -- bytes
  mime_type: VARCHAR(100) NOT NULL
  hash_sha256: VARCHAR(64) NOT NULL     -- file integrity check
  tags: JSONB DEFAULT '[]'              -- searchable tags
  metadata: JSONB DEFAULT '{}'          -- file-specific data
  uploaded_by: UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
  scan_status: VARCHAR(20) DEFAULT 'pending' -- pending, clean, infected, error
  scan_result: JSONB DEFAULT '{}'       -- virus scan details
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  deleted_at: TIMESTAMP WITH TIME ZONE NULL -- soft delete
  
  INDEX(org_id, project_id)
  INDEX(org_id, section_key) -- for future compliance evidence
  INDEX(hash_sha256) -- deduplication
}
```

### ActivityLog
**Comprehensive audit trail for sensitive actions**

```sql
activity_logs {
  id: UUID PRIMARY KEY
  org_id: UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  actor_id: UUID NULL REFERENCES users(id) ON DELETE SET NULL -- NULL for system actions
  action: VARCHAR(100) NOT NULL         -- create, update, delete, invite, role_change, etc.
  target_type: VARCHAR(50) NOT NULL     -- project, task, file, membership, etc.
  target_id: UUID NOT NULL              -- ID of the affected resource
  target_name: VARCHAR(255) NULL        -- human-readable target name
  payload: JSONB DEFAULT '{}'           -- action-specific data (old/new values, etc.)
  ip_address: INET NULL
  user_agent: TEXT NULL
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  INDEX(org_id, created_at DESC)
  INDEX(org_id, actor_id, created_at DESC)
  INDEX(org_id, target_type, target_id, created_at DESC)
}
```

### Invitation
**Secure team member invitation system**

```sql
invitations {
  id: UUID PRIMARY KEY
  org_id: UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  email: VARCHAR(255) NOT NULL
  role: VARCHAR(20) NOT NULL            -- intended role: admin, manager, contributor, viewer
  token: VARCHAR(255) UNIQUE NOT NULL   -- secure random token
  invited_by: UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT
  status: VARCHAR(20) DEFAULT 'pending' -- pending, accepted, expired, cancelled
  expires_at: TIMESTAMP WITH TIME ZONE NOT NULL
  accepted_at: TIMESTAMP WITH TIME ZONE NULL
  created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  
  INDEX(org_id, status)
  INDEX(token) -- for redemption lookup
}
```

## Relationships Summary

```
Organization (1) -> (*) Membership -> (1) User
Organization (1) -> (*) Project
Organization (1) -> (*) File
Organization (1) -> (*) ActivityLog
Organization (1) -> (*) Invitation

Project (1) -> (*) Task
Project (1) -> (*) File [optional relationship]

Task (1) -> (*) File [optional relationship]
```

## Data Lifecycle Rules

1. **Tenant Isolation**: All queries MUST include org_id filter
2. **Soft Deletes**: Projects, Tasks, and Files use deleted_at timestamps
3. **Audit Requirements**: Log all role changes, deletions, exports, and sensitive data access
4. **File Security**: Validate MIME types, scan for viruses, compute hashes
5. **Cascade Rules**: Deleting organization cascades to all related data; deleting projects cascades to tasks but preserves files (orphaned)

## Phase 1 Integration Points

The following fields are designed for future compliance module integration:
- `projects.framework_id` - will reference compliance frameworks
- `tasks.section_key` - will group tasks by compliance section
- `files.section_key` - will categorize evidence by section
- `projects.metadata` - will store assessment-specific configuration
- JSON fields throughout for extensible compliance data
