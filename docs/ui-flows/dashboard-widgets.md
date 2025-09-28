# ComplykOrt Dashboard Widgets & KPIs

## Dashboard Overview
The ComplykOrt dashboard provides role-specific analytics and quick access to critical information. Different user roles see different widgets based on their permissions and responsibilities.

## Widget Specifications

### 1. Project Status Overview
**Purpose**: Show project health and progress across the organization
**Audience**: Admins, Managers
**Position**: Top-left, primary widget

**Data Sources**:
- `projects` table grouped by `status`
- Recent status changes from `activity_logs`

**Display**:
```
Projects Overview                    [View All Projects]
┌─────────────────┬──────────┬──────────────────────┐
│ Status          │ Count    │ Progress Bar         │
├─────────────────┼──────────┼──────────────────────┤
│ 🔄 In Progress  │    12    │ ██████████░░░░░░░░░░ │
│ 📋 Backlog      │     8    │ ████████░░░░░░░░░░░░ │
│ 👁 In Review    │     4    │ ████░░░░░░░░░░░░░░░░ │
│ ✅ Finished     │     3    │ ███░░░░░░░░░░░░░░░░░ │
│ 📦 Archived     │     2    │ ██░░░░░░░░░░░░░░░░░░ │
└─────────────────┴──────────┴──────────────────────┘
Total Active Projects: 27
```

**Interactions**:
- Click status row → Filter projects by status
- Click "View All Projects" → Navigate to projects list

### 2. My Tasks Due Soon
**Purpose**: Show user's upcoming deadlines
**Audience**: All roles
**Position**: Top-right

**Data Sources**:
- `tasks` where `assignee_id = current_user` AND `due_date <= NOW() + interval '14 days'`
- Ordered by `due_date ASC`

**Display**:
```
My Tasks Due Soon                    [View All Tasks]
┌─────────────────────────────────────────────────────┐
│ 🔴 Complete security review        │ Due in 2 days  │
│    SOC 2 Audit Q1                 │ High Priority   │
├─────────────────────────────────────────────────────┤
│ 🟡 Upload evidence documents       │ Due in 5 days  │
│    PCI DSS Assessment             │ Medium Priority │
├─────────────────────────────────────────────────────┤
│ 🟢 Review access policies          │ Due in 9 days  │
│    Security Audit                 │ Low Priority    │
└─────────────────────────────────────────────────────┘
```

**Color Coding**:
- 🔴 Red: Due in ≤ 3 days
- 🟡 Yellow: Due in 4-7 days  
- 🟢 Green: Due in 8-14 days

**Interactions**:
- Click task → Open task details drawer
- Click project name → Navigate to project

### 3. Evidence & File Activity
**Purpose**: Show recent file uploads and evidence collection progress
**Audience**: Admins, Managers, Contributors
**Position**: Bottom-left

**Data Sources**:
- `files` uploaded in last 7 days
- `activity_logs` for file-related actions

**Display**:
```
Evidence & Files                     [View File Library]
┌─────────────────────────────────────────────────────┐
│ This Week                                           │
│ 📎 Files Uploaded: 23    📊 Total Size: 1.2 GB    │
├─────────────────────────────────────────────────────┤
│ Recent Uploads                                      │
│ 📄 incident-response-plan.pdf      2 hours ago     │
│ 📊 risk-assessment-matrix.xlsx     4 hours ago     │
│ 🔐 access-control-policy.docx      1 day ago       │
│ 📋 audit-checklist.pdf             2 days ago      │
└─────────────────────────────────────────────────────┘
```

**Interactions**:
- Click file name → Preview/download file
- Click "View File Library" → Navigate to files page

### 4. Team Activity Feed  
**Purpose**: Show recent team activities and changes
**Audience**: Admins, Managers
**Position**: Bottom-right

**Data Sources**:
- `activity_logs` for last 20 activities
- Filtered by importance (role changes, completions, deadlines)

**Display**:
```
Recent Activity                      [View Full Feed]
┌─────────────────────────────────────────────────────┐
│ 👤 Jane Smith assigned "Review IAM" to Bob Wilson  │
│    2 hours ago                                      │
├─────────────────────────────────────────────────────┤
│ ✅ Alice Johnson completed "Upload evidence"       │
│    4 hours ago                                      │
├─────────────────────────────────────────────────────┤
│ 🔄 Project "SOC 2 Audit Q1" moved to In Review    │
│    1 day ago                                        │
├─────────────────────────────────────────────────────┤
│ 👥 New user "Mike Chen" joined as Contributor      │
│    2 days ago                                       │
└─────────────────────────────────────────────────────┘
```

**Interactions**:
- Click activity → Navigate to related resource
- Click "View Full Feed" → Navigate to activity page

### 5. Personal Dashboard (Contributors/Viewers)
**Purpose**: Show personalized view for individual contributors
**Audience**: Contributors, Viewers
**Position**: Replaces org-wide widgets

**Data Sources**:
- Tasks assigned to current user
- Projects where user is owner or member
- Files uploaded by user

**Display**:
```
My Workspace                         [View All Projects]
┌─────────────────────────────────────────────────────┐
│ Active Projects: 3      │ Tasks Assigned: 8         │
│ Files Uploaded: 12      │ Due This Week: 2          │
└─────────────────────────────────────────────────────┘

My Projects
┌─────────────────────────────────────────────────────┐
│ 🔄 SOC 2 Audit Q1             │ 8 tasks │ Due Mar 31 │
│ 📋 PCI DSS Assessment         │ 3 tasks │ Due Apr 15 │
│ 👁 Security Policy Review     │ 1 task  │ Due Feb 28 │
└─────────────────────────────────────────────────────┘
```

## Widget Filters & Customization

### Time Range Filters
All widgets support time range selection:
- Last 7 days (default)
- Last 30 days
- Last 90 days
- Custom date range

### Role-Based Widget Display

**Admin Dashboard**:
- Project Status Overview (full org)
- My Tasks Due Soon
- Evidence & File Activity (full org)
- Team Activity Feed (full org)
- Organization Statistics

**Manager Dashboard**:
- Project Status Overview (managed projects)
- My Tasks Due Soon
- Evidence & File Activity (managed projects)
- Team Activity Feed (managed projects)
- Project Performance Metrics

**Contributor Dashboard**:
- Personal Dashboard
- My Tasks Due Soon
- My File Uploads
- Project Activity (assigned projects only)

**Viewer Dashboard**:
- Personal Dashboard (read-only)
- Assigned Tasks (view only)
- Project Status (assigned projects only)

## Widget Refresh & Real-time Updates

### Automatic Refresh
- Dashboard data refreshes every 5 minutes
- Real-time updates via WebSocket for:
  - Task assignments
  - Status changes
  - New file uploads
  - Activity feed items

### Manual Refresh
- Refresh button on each widget
- Pull-to-refresh on mobile
- Cmd+R / Ctrl+R refreshes entire dashboard

## Responsive Design

### Desktop (≥1200px)
```
┌─────────────────┬─────────────────┐
│ Project Status  │ Tasks Due Soon  │
│                 │                 │
├─────────────────┼─────────────────┤
│ File Activity   │ Team Activity   │
│                 │                 │
└─────────────────┴─────────────────┘
```

### Tablet (768px - 1199px)
```
┌─────────────────────────────────────┐
│ Project Status Overview             │
├─────────────────────────────────────┤
│ Tasks Due Soon                      │
├─────────────────────────────────────┤
│ File Activity                       │
├─────────────────────────────────────┤
│ Team Activity                       │
└─────────────────────────────────────┘
```

### Mobile (≤767px)
```
┌─────────────────────────────────────┐
│ My Tasks (Collapsed Cards)          │
├─────────────────────────────────────┤
│ Project Quick Stats                 │
├─────────────────────────────────────┤
│ Recent Activity (Condensed)         │
└─────────────────────────────────────┘
```

## Performance Requirements

### Load Times
- Initial dashboard load: ≤ 2 seconds
- Widget refresh: ≤ 500ms
- Data updates: Real-time via WebSocket

### Data Limits
- Activity feed: Last 20 items
- Due tasks: Next 14 days
- File activity: Last 7 days
- Charts: Aggregate data points

### Caching Strategy
- Widget data cached for 5 minutes
- User preferences cached locally
- Real-time updates override cache

## Accessibility

### Screen Reader Support
- ARIA labels for all charts and widgets
- Semantic HTML structure
- Tab navigation support
- Screen reader announcements for updates

### Keyboard Navigation
- Tab through widgets in logical order
- Enter/Space to interact with elements
- Arrow keys for chart navigation
- Escape to close drawers/modals

### Color & Contrast
- High contrast mode support
- Color-blind friendly palette
- Focus indicators for all interactive elements
- Text alternatives for color-coded information

## Phase 1 Compliance Extensions

Future dashboard widgets will include:
- **Compliance Score**: Overall framework completion percentage
- **Evidence Status**: Evidence collection progress by section
- **Audit Timeline**: Upcoming audit milestones and deadlines
- **Risk Metrics**: Risk assessment scores and trends
- **Framework Progress**: Section-by-section completion status
