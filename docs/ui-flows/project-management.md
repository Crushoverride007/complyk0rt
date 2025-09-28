# ComplykOrt Project Management User Flows

## Navigation Structure

### Main Navigation
```
┌─ ComplykOrt Logo ────────────────────────────────────┐
├ 📊 Dashboard                                         │
├ 📁 Projects                                          │
├ 📎 Files                                            │
├ 👥 People                                           │
├ ⚙️ Settings                                         │
└ 👤 Profile Menu ─────────────────────────────────────┘
```

### Project Sub-Navigation
Once inside a project:
```
Project: SOC 2 Audit Q1    [⭐ Star] [📤 Share] [⚙️ Settings]
├ 🏠 Overview
├ 📋 Board  
├ 📎 Files
├ 📈 Activity
└ 👥 Members
```

## User Flow 1: Project List & Management

### 1.1 Projects List View (Kanban)
**URL**: `/projects`
**Audience**: Managers, Admins

```
Projects                                    [+ New Project]

┌─ Backlog (3) ────┬─ In Progress (6) ─┬─ In Review (2) ──┬─ Finished (4) ───┐
│                  │                    │                  │                  │
│ SOC 2 Readiness  │ PCI DSS Audit     │ ISO 27001 Prep  │ Q4 Security      │
│ Due: Mar 15      │ Due: Feb 28       │ Due: Jan 30      │ Review           │
│ 👤 Jane Smith    │ 👤 Bob Wilson     │ 👤 Alice Chen    │ ✅ Completed     │
│ 🏷 compliance    │ 🏷 payment        │ 🏷 certification │                  │
│                  │                    │                  │                  │
│ GDPR Assessment  │ Cloud Security    │ Vendor Risk      │ Data Privacy     │
│ Due: Apr 10      │ Due: Mar 5        │ Assessment       │ Audit            │
│ 👤 Mike Davis    │ 👤 Sarah Johnson  │ Due: Feb 15      │ ✅ Completed     │
│ 🏷 privacy       │ 🏷 infrastructure │ 👤 Tom Brown     │                  │
│                  │                    │ 🏷 vendor        │                  │
│                  │                    │                  │                  │
│ Risk Management  │ Security Policies │                  │ Compliance       │
│ Framework        │ Review            │                  │ Training         │
│ Due: May 20      │ Due: Feb 20       │                  │ ✅ Completed     │
│ 👤 Lisa Park     │ 👤 David Kim      │                  │                  │
│ 🏷 risk          │ 🏷 policies       │                  │                  │
└──────────────────┴────────────────────┴──────────────────┴──────────────────┘
```

**Interactions**:
- Drag projects between columns to change status
- Click project card → Navigate to project overview
- Click "+" → Create new project modal
- Click user avatar → Filter by owner
- Click tag → Filter by label

### 1.2 Projects List View (Table)
**Toggle Option**: List view for detailed information

```
Projects                           [Kanban] [Table] [+ New Project]

┌──────────────────┬─────────────┬──────────────┬────────────┬───────────────┬─────────┐
│ Project Name     │ Owner       │ Status       │ Due Date   │ Tasks         │ Files   │
├──────────────────┼─────────────┼──────────────┼────────────┼───────────────┼─────────┤
│ SOC 2 Readiness  │ Jane Smith  │ Backlog      │ Mar 15     │ 0/12         │ 5       │
│ PCI DSS Audit    │ Bob Wilson  │ In Progress  │ Feb 28     │ 8/15         │ 23      │
│ ISO 27001 Prep   │ Alice Chen  │ In Review    │ Jan 30     │ 12/12        │ 18      │
│ Cloud Security   │ Sarah J.    │ In Progress  │ Mar 5      │ 3/8          │ 7       │
└──────────────────┴─────────────┴──────────────┴────────────┴───────────────┴─────────┘
```

### 1.3 Create Project Flow
**Trigger**: Click "[+ New Project]" button

**Step 1**: Basic Information
```
Create New Project                                          [×]

┌─────────────────────────────────────────────────────────────┐
│ Project Name *                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SOC 2 Type II Assessment                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Description                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Annual SOC 2 Type II audit for Q1 2024 including       │ │
│ │ security, availability, and confidentiality controls   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Project Owner *                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Jane Smith ▼                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                              [Cancel]  [Next: Details →]
```

**Step 2**: Project Details
```
Project Details                                             [×]

┌─────────────────────────────────────────────────────────────┐
│ Start Date                    │ Due Date                    │
│ ┌───────────────────────────┐ │ ┌───────────────────────────┐ │
│ │ 2024-01-15      📅        │ │ │ 2024-03-31      📅        │ │
│ └───────────────────────────┘ │ └───────────────────────────┘ │
│                                                             │
│ Priority                                                    │
│ ○ Low    ● Medium    ○ High    ○ Critical                  │
│                                                             │
│ Labels (press Enter to add)                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ compliance, soc2, audit                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ 🏷 compliance  🏷 soc2  🏷 audit                           │
│                                                             │
│ Framework (Optional - Phase 1 feature)                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ None selected ▼                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

[← Back]                                    [Create Project]
```

## User Flow 2: Project Board (Kanban)

### 2.1 Project Board Overview
**URL**: `/projects/{id}/board`
**Audience**: All roles (filtered by permissions)

```
SOC 2 Audit Q1                    📅 Due: Mar 31, 2024    👤 Jane Smith

Board   Files   Activity   Members                     [+ Add Task]

┌─ Backlog (8) ────┬─ In Progress (5) ─┬─ In Review (3) ──┬─ Completed (12) ─┐
│                  │                    │                  │                  │
│ Review IAM       │ Update Firewall    │ Document DR      │ Policy Review    │
│ Policies         │ Rules              │ Procedures       │ ✅ Completed     │
│ 👤 Bob Wilson    │ 👤 Alice Johnson   │ 👤 Mike Davis    │ 👤 Sarah Kim     │
│ 📅 Feb 15        │ 📅 Feb 12          │ 📅 Feb 10        │ Jan 28           │
│ 🏷 security      │ 🏷 network         │ 🏷 documentation │                  │
│ 🔴 High Priority │                    │                  │                  │
│                  │                    │                  │                  │
│ Conduct Risk     │ Implement MFA      │ Security         │ Access Control   │
│ Assessment       │ 👤 Tom Brown       │ Awareness        │ Matrix           │
│ 👤 Lisa Park     │ 📅 Feb 18          │ Training         │ ✅ Completed     │
│ 📅 Feb 20        │ 🏷 authentication  │ 👤 Jane Smith    │ 👤 Bob Wilson    │
│ 🏷 risk          │                    │ 📅 Feb 8         │ Jan 25           │
│ 🟡 Medium        │                    │ 🏷 training      │                  │
│                  │                    │                  │                  │
│ [+ Add Task]     │ Backup Testing     │ Evidence         │ Incident         │
│                  │ 👤 David Kim       │ Collection       │ Response Plan    │
│                  │ 📅 Feb 25          │ 👤 Alice Chen    │ ✅ Completed     │
│                  │ 🏷 backup          │ 📅 Feb 5         │ 👤 Mike Davis    │
│                  │                    │ 🏷 evidence      │ Jan 22           │
│                  │                    │                  │                  │
│                  │ [+ Add Task]       │ [+ Add Task]     │ [View All (12)]  │
└──────────────────┴────────────────────┴──────────────────┴──────────────────┘
```

### 2.2 Task Card Details (Hover/Click)
```
┌─ Review IAM Policies ──────────────────────────── [Edit] [×] ┐
│ Assigned to: Bob Wilson                                      │
│ Reporter: Jane Smith                                         │  
│ Due: Feb 15, 2024                                           │
│ Priority: High                                              │
│ Labels: security, iam, policies                             │
│                                                             │
│ Description:                                                │
│ Review all current IAM policies for SOC 2 compliance.      │
│ Ensure proper access controls and documentation.           │
│                                                             │
│ Attachments: 2 files                                       │
│ 📄 current-iam-policy.pdf                                  │
│ 📊 access-matrix.xlsx                                      │
│                                                             │
│ Comments: 3                                                 │
│ 💬 "Need to update the vendor access section" - Jane       │
│ 💬 "Working on it, will update by Friday" - Bob           │
│                                                             │
│ ⏱ Time Tracking:                                          │
│ Estimated: 8 hours  |  Spent: 4 hours                     │
│                                                             │
│ [Move to In Progress]  [Add Comment]  [Attach File]       │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Add Task Flow
**Trigger**: Click "[+ Add Task]" in any column

```
Create New Task                                             [×]

┌─────────────────────────────────────────────────────────────┐
│ Task Title *                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Review access control policies                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Description                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Review current access control policies and identify     │ │
│ │ gaps for SOC 2 compliance requirements                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Assignee                        │ Due Date                  │
│ ┌─────────────────────────────┐ │ ┌─────────────────────────┐ │
│ │ Bob Wilson ▼               │ │ │ 2024-02-15    📅       │ │
│ └─────────────────────────────┘ │ └─────────────────────────┘ │
│                                                             │
│ Priority                       │ Estimate (hours)           │
│ ○ Low  ● Medium  ○ High       │ ┌─────────────────────────┐ │
│                               │ │ 8                       │ │
│                               │ └─────────────────────────┘ │
│                                                             │
│ Labels                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ security, access-control, policies                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Section (Phase 1)                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ None selected ▼                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                                      [Cancel]  [Create Task]
```

## User Flow 3: File Management

### 3.1 Project Files View
**URL**: `/projects/{id}/files`

```
SOC 2 Audit Q1 - Files                                [↗ Upload Files]

┌─ Folders ───────────┬─ Files ──────────────────────────────────────────────┐
│                     │                                                      │
│ 📁 Policies         │ Search files...                            [🔍]     │
│ 📁 Evidence         │                                                      │
│ 📁 Reports          │ ┌─ Name ──────────────┬─ Size ──┬─ Modified ──────┐ │
│ 📁 Documentation    │ │ 📄 iam-policy.pdf   │ 2.3 MB  │ 2 hours ago     │ │
│ 📁 Templates        │ │ 📊 risk-matrix.xlsx │ 856 KB  │ 1 day ago       │ │
│                     │ │ 📄 audit-plan.docx  │ 1.2 MB  │ 3 days ago      │ │
│ 🏷 Tags             │ │ 📋 checklist.pdf    │ 445 KB  │ 1 week ago      │ │
│ policy              │ │ 📸 network-diagram  │ 3.1 MB  │ 2 weeks ago     │ │
│ evidence            │ │   .png               │         │                 │ │
│ security            │ └─────────────────────┴─────────┴─────────────────┘ │
│ compliance          │                                                      │
│ documentation       │ Showing 5 of 23 files                   [Load More] │
└─────────────────────┴──────────────────────────────────────────────────────┘
```

### 3.2 File Upload Flow
**Trigger**: Click "[↗ Upload Files]"

```
Upload Files                                                [×]

┌─────────────────────────────────────────────────────────────┐
│ Drag files here or click to browse                         │
│                                                             │
│ ┌─ 📄 incident-response-plan.pdf ─────────────── [×] ─────┐ │
│ │ Size: 2.3 MB                                           │ │
│ │ ✅ Uploaded successfully                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ 📊 compliance-matrix.xlsx ────────────────── [×] ──────┐ │
│ │ Size: 856 KB                                           │ │
│ │ 🔄 Uploading... ████████░░░░ 67%                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ File Details                                                │
│ Project: SOC 2 Audit Q1                                    │
│ Folder: 📁 Evidence                                        │
│                                                             │
│ Tags (comma separated)                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ evidence, incident-response, security                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Link to Task (optional)                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Review incident response procedures ▼                   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                                      [Cancel]  [Upload All]
```

### 3.3 File Preview/Actions
**Trigger**: Click on file name

```
📄 iam-policy.pdf                                          [×]

┌─ File Actions ──────────────────────────────────────────────┐
│ [📥 Download] [👁 Preview] [🏷 Edit Tags] [🗑 Delete]      │
└─────────────────────────────────────────────────────────────┘

┌─ File Information ──────────────────────────────────────────┐
│ Size: 2.3 MB                                               │
│ Type: PDF Document                                         │
│ Uploaded: 2 hours ago by Jane Smith                       │
│ Last Modified: 2 hours ago                                │
│ Hash: 5f4dcc3b5aa...                                      │
│                                                            │
│ Tags: 🏷 policy 🏷 iam 🏷 security 🏷 compliance         │
│                                                            │
│ Linked Tasks:                                              │
│ • Review IAM Policies (Bob Wilson)                        │
│                                                            │
│ Version History:                                           │
│ v1.2 - 2 hours ago (Current)                             │
│ v1.1 - 1 day ago                                          │
│ v1.0 - 1 week ago                                         │
└────────────────────────────────────────────────────────────┘

┌─ File Preview ──────────────────────────────────────────────┐
│                                                             │
│ [PDF Preview Content Area]                                  │
│                                                             │
│ Identity and Access Management Policy                      │
│ Version 1.2                                                │
│                                                             │
│ 1. Purpose and Scope                                       │
│ This policy establishes the requirements for...           │
│                                                             │
│ 2. Access Control Principles                               │
│ - Least privilege access                                   │
│ - Segregation of duties                                    │
│ - Need-to-know basis                                       │
│                                                             │
│                                      [Full Screen View]    │
└─────────────────────────────────────────────────────────────┘
```

## User Flow 4: Task Management Details

### 4.1 Task Details Drawer (Extended)
**URL**: `/projects/{id}/tasks/{taskId}` or drawer overlay

```
Review IAM Policies                    [Edit] [Delete] [×]

┌─ Task Information ──────────────────────────────────────────┐
│ Status: In Progress        │ Priority: High                 │
│ Assignee: Bob Wilson       │ Reporter: Jane Smith           │
│ Due: Feb 15, 2024         │ Created: Jan 28, 2024          │
│ Labels: 🏷 security 🏷 iam 🏷 policies                     │
└─────────────────────────────────────────────────────────────┘

┌─ Description ───────────────────────────────────────────────┐
│ Review all current IAM policies for SOC 2 compliance.      │
│ Focus on:                                                   │
│ • User access provisioning/deprovisioning                  │
│ • Role-based access controls                               │
│ • Privileged access management                             │
│ • Vendor/contractor access                                 │
└─────────────────────────────────────────────────────────────┘

┌─ Time Tracking ─────────────────────────────────────────────┐
│ Estimated: 8 hours           │ Time Spent: 4.5 hours       │
│ ⏰ [Start Timer] [Log Time]   │ Remaining: 3.5 hours        │
│                                                             │
│ Time Logs:                                                  │
│ • 2.5 hrs - Jan 30 - Initial policy review                │
│ • 2.0 hrs - Feb 2 - Gap analysis                          │
└─────────────────────────────────────────────────────────────┘

┌─ Attachments (3) ───────────────────────────────────────────┐
│ 📄 current-iam-policy.pdf        2.3 MB    [View] [Remove] │
│ 📊 access-control-matrix.xlsx    856 KB    [View] [Remove] │
│ 📄 gap-analysis-notes.docx       445 KB    [View] [Remove] │
│                                                             │
│ [➕ Add Attachment]                                         │
└─────────────────────────────────────────────────────────────┘

┌─ Comments (4) ───────────────────────────────────────────────┐
│ Jane Smith - 3 hours ago                                    │
│ 💬 Need to update the vendor access section based on new   │
│    requirements. Let me know if you need the updated docs. │
│                                                             │
│ Bob Wilson - 2 hours ago                                   │
│ 💬 @jane Thanks, I've reviewed the current policy. The     │
│    vendor section definitely needs updates. Can you share  │
│    the new requirements doc?                               │
│                                                             │
│ Jane Smith - 1 hour ago                                    │
│ 💬 Just uploaded the vendor-requirements.pdf to the files  │
│    section. It includes the new approval workflows.        │
│                                                             │
│ Bob Wilson - 30 minutes ago                                │
│ 💬 Perfect! Working on the updates now. Should be done by  │
│    end of day Friday.                                      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Add a comment...                                        │ │
│ │                                                         │ │
│ │                                               [@] [📎]  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                      [Cancel] [Comment]    │
└─────────────────────────────────────────────────────────────┘

┌─ Activity History ──────────────────────────────────────────┐
│ • Bob Wilson logged 2 hours - 2 hours ago                 │
│ • Jane Smith added attachment - 3 hours ago                │
│ • Bob Wilson moved to In Progress - 1 day ago             │
│ • Jane Smith created task - 3 days ago                    │
│                                                             │
│ [View All Activity]                                         │
└─────────────────────────────────────────────────────────────┘

[Move to] ▼  [Assign to] ▼  [Set Due Date] 📅  [Add Label] 🏷
```

### 4.2 Bulk Task Operations
**Trigger**: Select multiple tasks on board

```
3 tasks selected                              [Clear Selection]

┌─────────────────────────────────────────────────────────────┐
│ 🔲 Review IAM Policies           🔲 Update Firewall Rules   │
│ 🔲 Conduct Risk Assessment                                  │
└─────────────────────────────────────────────────────────────┘

Bulk Actions:
[Move to] ▼   [Assign to] ▼   [Set Priority] ▼   [Add Label] 🏷

┌─ Move Tasks ──────────────────────────────────┐
│ Move 3 selected tasks to:                     │
│ ○ Backlog                                     │
│ ● In Progress                                 │
│ ○ In Review                                   │
│ ○ Completed                                   │
│                                               │
│          [Cancel]  [Move Tasks]               │
└───────────────────────────────────────────────┘
```

## Responsive Design Adaptations

### Mobile Project Board (≤768px)
```
SOC 2 Audit Q1                    [≡] [+ Task]

Status Filter: [All] [Backlog] [In Progress] [Review] [Done]

┌─────────────────────────────────────────────────┐
│ Review IAM Policies              🔴 High        │
│ 👤 Bob Wilson                   📅 Feb 15       │
│ 🏷 security  🏷 iam                            │
│                                  [View Details] │
├─────────────────────────────────────────────────┤
│ Update Firewall Rules                           │
│ 👤 Alice Johnson               📅 Feb 12       │
│ 🏷 network                                      │
│                                  [View Details] │
├─────────────────────────────────────────────────┤
│ Implement MFA                                   │
│ 👤 Tom Brown                   📅 Feb 18       │
│ 🏷 authentication                               │
│                                  [View Details] │
└─────────────────────────────────────────────────┘

[Load More Tasks]
```

## Performance Considerations

### Board Optimization
- Virtualized scrolling for large task lists (>100 tasks)
- Lazy load task details on demand
- Debounced drag-and-drop operations
- Optimistic UI updates with rollback on error

### Real-time Updates
- WebSocket connection for live board updates
- Conflict resolution for simultaneous edits
- Visual indicators for other users' actions
- Auto-refresh stale data

### Caching Strategy
- Browser cache for project metadata
- Local storage for user preferences (column widths, filters)
- Service worker for offline task viewing
- Incremental sync when reconnected
