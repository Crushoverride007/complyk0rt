# ComplykOrt User & Team Management Flows

## User Flow 1: Organization Settings & Member Management

### 1.1 Organization Settings Overview
**URL**: `/settings/organization`
**Audience**: Admins, Managers (limited)

```
Organization Settings                           [Save Changes]

┌─ Organization Details ──────────────────────────────────────┐
│ Organization Name *                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Acme Corporation                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ URL Slug *                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ acme-corp                                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ complykort.com/acme-corp                                   │
│                                                             │
│ Plan                                                        │
│ ● Basic ($49/month)  ○ Pro ($149/month)  ○ Enterprise     │
│                                                             │
│ Billing Contact                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ billing@acme.com                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─ Security Settings ─────────────────────────────────────────┐
│ Two-Factor Authentication                                   │
│ ☑ Require 2FA for all users                               │
│ ☑ Require 2FA for admin users                             │
│                                                             │
│ Single Sign-On (SSO)                                       │
│ ○ Disabled  ● SAML 2.0  ○ OAuth 2.0 / OIDC               │
│                                                             │
│ Session Management                                          │
│ Session Timeout: [8 hours ▼]                              │
│ ☑ Force logout on password change                         │
│ ☑ Single session per user                                 │
└─────────────────────────────────────────────────────────────┘

┌─ Data & Privacy ────────────────────────────────────────────┐
│ Data Retention                                              │
│ Activity Logs: [1 year ▼]                                 │
│ Deleted Items: [90 days ▼]                                │
│                                                             │
│ Export & Compliance                                         │
│ [📥 Export Organization Data]                              │
│ [📋 Compliance Report]                                     │
│ [🗑 Delete Organization] (Irreversible)                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Members Management
**URL**: `/settings/members`
**Audience**: Admins, Managers

```
Team Members                    [+ Invite Member]    [🔍 Search]

┌─ Active Members (12) ───────────────────────────────────────────────────────┐
│                                                                             │
│ ┌─ Name & Email ─────────────┬─ Role ─────┬─ Status ───┬─ Last Active ──┐  │
│ │ 👤 Jane Smith              │ Admin      │ ●  Active  │ 2 hours ago    │  │
│ │    jane.smith@acme.com     │            │            │                │  │
│ │    [Edit] [Remove]         │            │            │                │  │
│ ├────────────────────────────┼────────────┼────────────┼────────────────┤  │
│ │ 👤 Bob Wilson              │ Manager ▼  │ ●  Active  │ 5 minutes ago  │  │
│ │    bob.wilson@acme.com     │            │            │                │  │
│ │    [Edit] [Remove]         │            │            │                │  │
│ ├────────────────────────────┼────────────┼────────────┼────────────────┤  │
│ │ 👤 Alice Johnson           │ Contributor│ ●  Active  │ 1 day ago      │  │
│ │    alice@acme.com          │            │            │                │  │
│ │    [Edit] [Remove]         │            │            │                │  │
│ ├────────────────────────────┼────────────┼────────────┼────────────────┤  │
│ │ 👤 Mike Davis              │ Contributor│ ○  Inactive│ 2 weeks ago    │  │
│ │    mike.davis@acme.com     │            │            │                │  │
│ │    [Edit] [Remove]         │            │            │                │  │
│ ├────────────────────────────┼────────────┼────────────┼────────────────┤  │
│ │ 👤 Sarah Kim               │ Viewer     │ ●  Active  │ 30 minutes ago │  │
│ │    sarah.kim@acme.com      │            │            │                │  │
│ │    [Edit] [Remove]         │            │            │                │  │
│ └────────────────────────────┴────────────┴────────────┴────────────────┘  │
│                                                                             │
│ Showing 5 of 12 members                                      [Load More]   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ Pending Invitations (3) ───────────────────────────────────────────────────┐
│ ┌─ Email ───────────────────┬─ Role ─────┬─ Invited By ──┬─ Expires ─────┐  │
│ │ tom.brown@contractor.com  │ Contributor│ Jane Smith    │ In 5 days     │  │
│ │ [Resend] [Cancel]         │            │               │               │  │
│ ├───────────────────────────┼────────────┼───────────────┼───────────────┤  │
│ │ lisa.park@external.com    │ Viewer     │ Bob Wilson    │ In 2 days     │  │
│ │ [Resend] [Cancel]         │            │               │               │  │
│ ├───────────────────────────┼────────────┼───────────────┼───────────────┤  │
│ │ david.kim@acme.com        │ Manager    │ Jane Smith    │ Expired       │  │
│ │ [Resend] [Cancel]         │            │               │               │  │
│ └───────────────────────────┴────────────┴───────────────┴───────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Invite Member Flow
**Trigger**: Click "[+ Invite Member]"

**Step 1**: Basic Information
```
Invite Team Member                                          [×]

┌─────────────────────────────────────────────────────────────┐
│ Email Address *                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ new.user@example.com                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Role *                                                      │
│ ○ Admin     ● Manager     ○ Contributor     ○ Viewer       │
│                                                             │
│ ℹ️ Manager can:                                            │
│ • Manage projects and tasks                                │
│ • Invite users (up to Manager role)                       │
│ • View organization analytics                              │
│ • Cannot: Change billing, delete organization             │
│                                                             │
│ Personal Message (Optional)                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Welcome to our compliance team! Looking forward to     │ │
│ │ working with you on our upcoming audits.               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Invite Expires                                             │
│ ● 7 days     ○ 14 days     ○ 30 days     ○ Custom        │
└─────────────────────────────────────────────────────────────┘

                                  [Cancel]  [Send Invitation]
```

**Step 2**: Invitation Sent
```
Invitation Sent Successfully                                [×]

┌─────────────────────────────────────────────────────────────┐
│ ✅ Invitation sent to new.user@example.com                 │
│                                                             │
│ The user will receive an email with instructions to:       │
│ 1. Create their ComplykOrt account                         │
│ 2. Set up their password                                   │
│ 3. Join your organization as Manager                       │
│                                                             │
│ The invitation will expire in 7 days.                     │
│                                                             │
│ 📧 Preview Email                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Subject: You're invited to join Acme Corporation       │ │
│ │                                                         │ │
│ │ Hi there,                                               │ │
│ │                                                         │ │
│ │ Jane Smith has invited you to join Acme Corporation    │ │
│ │ on ComplykOrt as a Manager.                            │ │
│ │                                                         │ │
│ │ Welcome to our compliance team! Looking forward to     │ │
│ │ working with you on our upcoming audits.               │ │
│ │                                                         │ │
│ │ [Accept Invitation]                                     │ │
│ │                                                         │ │
│ │ This invitation expires on March 1, 2024.             │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                              [View Members]  [Invite Another]
```

### 1.4 Edit Member Role Flow
**Trigger**: Click "[Edit]" next to member

```
Edit Member: Bob Wilson                                     [×]

┌─────────────────────────────────────────────────────────────┐
│ Current Role: Manager                                       │
│                                                             │
│ New Role                                                    │
│ ○ Admin     ● Manager     ○ Contributor     ○ Viewer       │
│                                                             │
│ ⚠️  Role Change Confirmation                                │
│                                                             │
│ You are about to change Bob Wilson's role from Manager     │
│ to Contributor. This will:                                 │
│                                                             │
│ ❌ Remove access to:                                       │
│ • Organization settings                                    │
│ • User management                                          │
│ • Billing information                                      │
│ • Organization-wide analytics                              │
│                                                             │
│ ✅ Keep access to:                                         │
│ • Assigned projects and tasks                              │
│ • Project files and evidence                               │
│ • Personal dashboard                                       │
│                                                             │
│ Reason for Change (Required for audit log)                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Role adjustment based on new team structure             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ☑ I understand this change will be logged for audit       │
│ ☑ I have confirmed this change with the user              │
└─────────────────────────────────────────────────────────────┘

                              [Cancel]  [Confirm Role Change]
```

## User Flow 2: Invitation Acceptance

### 2.1 Email Invitation Landing
**URL**: `/invitations/{token}`
**Audience**: Invited users (public)

```
You're Invited to Join Acme Corporation

┌─────────────────────────────────────────────────────────────┐
│ 🎉 Welcome to ComplykOrt!                                  │
│                                                             │
│ Jane Smith has invited you to join                         │
│ Acme Corporation as a Manager                              │
│                                                             │
│ Personal Message:                                           │
│ "Welcome to our compliance team! Looking forward to        │
│ working with you on our upcoming audits."                  │
│                                                             │
│ Your Role: Manager                                          │
│ You'll be able to:                                         │
│ ✅ Manage projects and tasks                               │
│ ✅ Invite team members                                     │
│ ✅ View organization analytics                             │
│ ✅ Upload and manage files                                 │
│                                                             │
│ This invitation expires: March 1, 2024 (5 days remaining) │
└─────────────────────────────────────────────────────────────┘

Do you already have a ComplykOrt account?

[Yes, I have an account] [No, I'm new to ComplykOrt]
```

### 2.2A Existing User Flow
**Trigger**: Click "Yes, I have an account"

```
Sign In to Accept Invitation

┌─────────────────────────────────────────────────────────────┐
│ Sign in to your existing ComplykOrt account to join         │
│ Acme Corporation                                            │
│                                                             │
│ Email                                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ bob.wilson@email.com                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Password                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ••••••••••••                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Forgot Password?]                                         │
│                                                             │
│ Or sign in with:                                           │
│ [Google] [Microsoft] [SAML SSO]                           │
└─────────────────────────────────────────────────────────────┘

                         [Back to Invitation] [Sign In & Join]
```

### 2.2B New User Flow
**Trigger**: Click "No, I'm new to ComplykOrt"

```
Create Your Account

┌─────────────────────────────────────────────────────────────┐
│ Create your ComplykOrt account and join Acme Corporation   │
│                                                             │
│ Full Name *                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Bob Wilson                                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Email *                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ bob.wilson@email.com                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ✅ This matches the invited email address                  │
│                                                             │
│ Password *                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ••••••••••••••••                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ 🟢 Strong password                                         │
│                                                             │
│ Confirm Password *                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ••••••••••••••••                                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ✅ Passwords match                                         │
│                                                             │
│ Timezone                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ America/New_York (Eastern Time) ▼                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ☑ I agree to the Terms of Service and Privacy Policy      │
│ ☑ Send me product updates and compliance insights         │
└─────────────────────────────────────────────────────────────┘

                    [Back to Invitation] [Create Account & Join]
```

### 2.3 Welcome & Onboarding
**After successful account creation/login**

```
Welcome to Acme Corporation!

┌─────────────────────────────────────────────────────────────┐
│ 🎉 You've successfully joined Acme Corporation             │
│                                                             │
│ Your Role: Manager                                          │
│ Organization: Acme Corporation                              │
│ Team Size: 12 members                                       │
│                                                             │
│ Let's get you started with a quick tour:                   │
│                                                             │
│ 1. 📊 Dashboard - Your project and task overview           │
│ 2. 📁 Projects - Active compliance projects                │
│ 3. 👥 Team - Manage team members and roles                 │
│ 4. 📎 Files - Evidence and document library                │
│                                                             │
│ ⏰ Estimated setup time: 5 minutes                         │
└─────────────────────────────────────────────────────────────┘

[Skip Tour] [Start Tour] [Go to Dashboard]
```

## User Flow 3: Profile & Account Management

### 3.1 User Profile Settings
**URL**: `/settings/profile`
**Audience**: All users

```
Profile Settings                                   [Save Changes]

┌─ Personal Information ──────────────────────────────────────┐
│ Profile Photo                                               │
│ ┌─ 👤 ─────────────────────────────────────────────────────┐ │
│ │     [📷 Upload Photo] [Remove]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Full Name *                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Bob Wilson                                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Email Address *                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ bob.wilson@acme.com                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ⚠️ Changing email requires verification                    │
│                                                             │
│ Timezone                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ America/New_York (Eastern Time) ▼                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Language                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ English ▼                                               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─ Security ──────────────────────────────────────────────────┐
│ Password                                                    │
│ [Change Password]                                           │
│ Last changed: 3 months ago                                 │
│                                                             │
│ Two-Factor Authentication                                   │
│ ● Enabled via Authenticator App                            │
│ [Reconfigure 2FA] [View Backup Codes]                     │
│                                                             │
│ Active Sessions                                             │
│ 🖥 Desktop (Current) - New York, NY                       │
│ 📱 Mobile App - Last active 2 days ago                    │
│ [View All Sessions] [Sign Out Other Sessions]             │
└─────────────────────────────────────────────────────────────┘

┌─ Notifications ─────────────────────────────────────────────┐
│ Email Notifications                                         │
│ ☑ Task assignments and updates                             │
│ ☑ Project status changes                                   │
│ ☑ Due date reminders                                       │
│ ☑ Weekly activity summary                                  │
│ ☐ Marketing and product updates                            │
│                                                             │
│ In-App Notifications                                        │
│ ☑ Real-time task updates                                   │
│ ☑ Comments and mentions                                    │
│ ☑ File uploads and changes                                 │
│                                                             │
│ Notification Schedule                                       │
│ Quiet Hours: [10:00 PM] to [8:00 AM]                      │
│ Weekend Notifications: ● Enabled  ○ Disabled              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Change Password Flow
**Trigger**: Click "[Change Password]"

```
Change Password                                             [×]

┌─────────────────────────────────────────────────────────────┐
│ Current Password *                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ••••••••••••                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ New Password *                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ••••••••••••••••••                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Password Requirements:                                      │
│ ✅ At least 12 characters                                  │
│ ✅ Contains uppercase letter                               │
│ ✅ Contains lowercase letter                               │
│ ✅ Contains number                                         │
│ ✅ Contains special character                              │
│ 🟢 Strong password                                         │
│                                                             │
│ Confirm New Password *                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ••••••••••••••••••                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ✅ Passwords match                                         │
│                                                             │
│ ☑ Sign out all other sessions after password change       │
│ ☑ Require 2FA verification for this change                │
└─────────────────────────────────────────────────────────────┘

                                    [Cancel]  [Change Password]
```

## User Flow 4: Organization Switching

### 4.1 Organization Switcher
**Trigger**: Click organization name in header

```
Switch Organization

┌─ Current Organization ──────────────────────────────────────┐
│ ✅ Acme Corporation                                         │
│    Manager • 12 members                                    │
└─────────────────────────────────────────────────────────────┘

┌─ Other Organizations ───────────────────────────────────────┐
│ TechCorp Solutions                                          │
│ Contributor • 8 members                                     │
│ [Switch]                                                    │
│                                                             │
│ Startup Inc                                                 │
│ Admin • 3 members                                           │  
│ [Switch]                                                    │
└─────────────────────────────────────────────────────────────┘

┌─ Actions ───────────────────────────────────────────────────┐
│ [+ Create New Organization]                                 │
│ [🔍 Join Organization]                                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Create New Organization
**Trigger**: Click "[+ Create New Organization]"

```
Create New Organization                                     [×]

┌─────────────────────────────────────────────────────────────┐
│ You'll become the admin of this new organization           │
│                                                             │
│ Organization Name *                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ My New Company                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ URL Slug *                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ my-new-company                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ✅ Available: complykort.com/my-new-company                │
│                                                             │
│ Industry                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Technology ▼                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Company Size                                                │
│ ○ 1-10  ● 11-50  ○ 51-200  ○ 201-1000  ○ 1000+           │
│                                                             │
│ Primary Use Case                                            │
│ ● SOC 2 Compliance                                         │
│ ○ ISO 27001 Certification                                  │
│ ○ PCI DSS Compliance                                       │
│ ○ GDPR/Privacy Compliance                                  │
│ ○ General Risk Management                                  │
│ ○ Other                                                    │
│                                                             │
│ ☑ I agree to the Terms of Service                         │
│ ☑ Set up billing later (14-day free trial)                │
└─────────────────────────────────────────────────────────────┘

                          [Cancel]  [Create Organization]
```

## User Flow 5: Access Requests (Future Feature)

### 5.1 Request Access to Project
**Trigger**: User sees project they can't access

```
Request Project Access                                      [×]

┌─────────────────────────────────────────────────────────────┐
│ Project: SOC 2 Audit Q1                                    │
│ Owner: Jane Smith                                           │
│                                                             │
│ You don't currently have access to this project.          │
│ Request access to view project details, tasks, and files.  │
│                                                             │
│ Access Level Requested                                      │
│ ● Viewer - Read-only access to project                    │
│ ○ Contributor - Can edit tasks and upload files           │
│                                                             │
│ Reason for Access (Optional)                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Need to review security policies for network audit     │ │
│ │ project. Will coordinate with current team members.    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Your request will be sent to:                              │
│ • Jane Smith (Project Owner)                               │
│ • Organization Administrators                               │
└─────────────────────────────────────────────────────────────┘

                                [Cancel]  [Send Access Request]
```

## Security & Audit Considerations

### Audit Log Entries
All user and team management actions generate audit logs:

```
Activity Log Entry Examples:

{
  "action": "user_role_changed",
  "actor_id": "admin_user_id",
  "target_type": "membership", 
  "target_id": "membership_id",
  "target_name": "Bob Wilson",
  "payload": {
    "old_role": "manager",
    "new_role": "contributor",
    "reason": "Role adjustment based on new team structure"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2024-01-20T15:30:00Z"
}

{
  "action": "user_invited",
  "actor_id": "admin_user_id", 
  "target_type": "invitation",
  "target_id": "invitation_id",
  "target_name": "new.user@example.com",
  "payload": {
    "role": "manager",
    "expires_at": "2024-01-27T15:30:00Z"
  }
}

{
  "action": "user_removed",
  "actor_id": "admin_user_id",
  "target_type": "membership",
  "target_id": "membership_id", 
  "target_name": "Former Employee",
  "payload": {
    "removed_role": "contributor",
    "reason": "Employee departure"
  }
}
```

### Security Validations
- Email domain verification for organization invites
- Rate limiting on invitation sends (max 10/hour per user)
- Token expiration and secure random generation
- Role elevation requires current user authentication
- Session invalidation on role changes
- 2FA requirement for sensitive operations

### GDPR Compliance Features
- Data export capabilities for departing users
- Right to be forgotten (account deletion)
- Consent management for communications
- Audit trail for data access and modifications
- Privacy-compliant user data handling
