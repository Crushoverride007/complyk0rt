# ComplykOrt RBAC Policy Matrix

## Role Definitions

### Admin
- **Scope**: Full organizational control
- **Description**: Complete access to organization settings, billing, and all resources
- **Typical Users**: Organization owners, IT administrators

### Manager  
- **Scope**: Project and team management
- **Description**: Can manage projects, tasks, files, and invite users (up to Manager role)
- **Typical Users**: Project managers, team leads, compliance officers

### Contributor
- **Scope**: Content creation and task execution
- **Description**: Can edit assigned tasks, upload evidence, manage own files
- **Typical Users**: Analysts, consultants, subject matter experts

### Viewer
- **Scope**: Read-only access
- **Description**: Can view projects and tasks they're assigned to or granted access
- **Typical Users**: Stakeholders, auditors, external reviewers

## Permission Matrix

| Resource | Action | Admin | Manager | Contributor | Viewer |
|----------|--------|-------|---------|-------------|--------|
| **Organization** | | | | | |
| View settings | ✓ | ✓ | ✗ | ✗ |
| Update settings | ✓ | ✗ | ✗ | ✗ |
| Delete organization | ✓ | ✗ | ✗ | ✗ |
| View billing | ✓ | ✗ | ✗ | ✗ |
| **Users & Memberships** | | | | | |
| View all members | ✓ | ✓ | ✗ | ✗ |
| Invite users | ✓ | ✓* | ✗ | ✗ |
| Change user roles | ✓ | ✓* | ✗ | ✗ |
| Remove members | ✓ | ✓* | ✗ | ✗ |
| **Projects** | | | | | |
| View all projects | ✓ | ✓ | ✗ | ✗ |
| View assigned projects | ✓ | ✓ | ✓ | ✓ |
| Create projects | ✓ | ✓ | ✗ | ✗ |
| Edit any project | ✓ | ✓ | ✗ | ✗ |
| Edit assigned projects | ✓ | ✓ | ✓** | ✗ |
| Delete projects | ✓ | ✓ | ✗ | ✗ |
| Archive projects | ✓ | ✓ | ✗ | ✗ |
| **Tasks** | | | | | |
| View all tasks | ✓ | ✓ | ✗ | ✗ |
| View project tasks | ✓ | ✓ | ✓*** | ✓*** |
| Create tasks | ✓ | ✓ | ✓*** | ✗ |
| Edit any task | ✓ | ✓ | ✗ | ✗ |
| Edit assigned tasks | ✓ | ✓ | ✓ | ✗ |
| Delete tasks | ✓ | ✓ | ✗ | ✗ |
| Assign tasks | ✓ | ✓ | ✓*** | ✗ |
| **Files** | | | | | |
| View all files | ✓ | ✓ | ✗ | ✗ |
| View project files | ✓ | ✓ | ✓*** | ✓*** |
| Upload files | ✓ | ✓ | ✓*** | ✗ |
| Edit file metadata | ✓ | ✓ | ✓**** | ✗ |
| Delete any file | ✓ | ✓ | ✗ | ✗ |
| Delete own files | ✓ | ✓ | ✓ | ✗ |
| **Activity Logs** | | | | | |
| View all activity | ✓ | ✓ | ✗ | ✗ |
| View project activity | ✓ | ✓ | ✓*** | ✓*** |
| **Dashboard** | | | | | |
| View org dashboard | ✓ | ✓ | ✗ | ✗ |
| View personal dashboard | ✓ | ✓ | ✓ | ✓ |

## Permission Notes

\* **Manager Restrictions**:
- Can only invite/promote users up to Manager role (not Admin)
- Cannot remove Admin users
- Cannot change Admin user roles

\*\* **Project Assignment**:
- Contributors can edit project details only if they're the project owner or explicitly granted edit access
- Project-level permissions can override org-level permissions

\*\*\* **Project Context**:
- Access limited to projects where user is owner, assignee, or explicitly granted access
- Task and file access inherits from project access

\*\*\*\* **File Ownership**:
- Contributors can edit metadata only for files they uploaded
- Cannot edit files uploaded by others

## Special Permissions

### System Actions
- **Audit Log Access**: Only Admins and Managers can view full audit logs
- **Export Capabilities**: Only Admins and Managers can export data
- **API Access**: All roles can use API, but actions respect role permissions
- **Bulk Operations**: Only Admins and Managers can perform bulk actions

### Project-Level Overrides
Projects can have additional members with specific roles that override org membership:
- **Project Owner**: Full project control (like Manager scope but project-specific)
- **Project Member**: Can contribute to project (like Contributor scope but project-specific) 
- **Project Viewer**: Can view project details (like Viewer scope but project-specific)

## Implementation Guidelines

### Database Queries
```sql
-- All queries must include tenant isolation
WHERE org_id = :current_user_org_id

-- Role-based filtering example
WHERE org_id = :org_id 
  AND (
    :user_role IN ('admin', 'manager') 
    OR owner_id = :current_user_id 
    OR assignee_id = :current_user_id
  )
```

### API Middleware
```javascript
// Pseudo-code for permission checking
function requirePermission(resource, action) {
  return (req, res, next) => {
    if (!hasPermission(req.user, req.org, resource, action)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

### Audit Requirements
All permission-sensitive actions must be logged:
- Role changes (promotions, demotions)
- Resource deletions 
- Data exports
- Access grant/revoke operations
- Failed permission attempts (for security monitoring)

## Phase 1 Compliance Extensions

Future compliance features will extend this RBAC model with:
- **Compliance Officer**: Special role for framework management
- **External Auditor**: Read-only access with audit trail exemption
- **Section-Level Permissions**: Granular access to compliance sections
- **Evidence Classification**: Role-based access to sensitive evidence
