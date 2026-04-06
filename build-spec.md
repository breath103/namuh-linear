# Build Spec — Linear Clone (namuh-linear)

> **Status**: COMPLETE — all pages inspected, ready for build phase

## Product Overview

Linear is a keyboard-first issue tracking and project management tool for software teams. It emphasizes speed, clean design, and opinionated workflows.

**Core features (must build first):**
1. **Issues** — The atomic unit. Workflow states, priority, estimates, labels, assignees, due dates, relations.
2. **Teams** — Organizational unit with namespaced identifiers (ENG-123) and custom workflows.
3. **Command Palette (Cmd+K)** — Search, navigate, create — all from keyboard.
4. **Projects** — Time-bound deliverables grouping issues across teams, with milestones and progress tracking.
5. **Triage** — Intake queue for incoming issues.

**Secondary features:**
- Cycles (automated sprints), Initiatives (strategic goals), Custom Views, Inbox/Notifications, My Issues, Display Options, Filters

**Key differentiators:** Command palette, keyboard shortcuts everywhere, real-time sync, clean minimal dark-mode-first UI.

## Tech Stack

- **Framework**: Next.js 16 App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Database**: Drizzle ORM + PostgreSQL (AWS RDS)
- **Cache/Realtime**: Redis (AWS ElastiCache) — real-time sync, pub/sub
- **Storage**: AWS S3 — file attachments, avatars
- **Email**: AWS SES — magic link auth, notifications
- **Auth**: Better Auth (Google OAuth + email magic links)
- **Deployment**: AWS ECS Fargate + ALB

## Site Map

### Overall Layout
- **Sidebar** (244px, left) — persistent navigation with workspace switcher, search, create issue button
- **Content area** (right) — 12px border-radius container, 8px margin from edges
- **Ask Linear** — floating AI chat button (bottom-right)
- **Command palette** — Cmd+K global overlay

### Pages
| Section | Page | URL Pattern | Type |
|---------|------|-------------|------|
| Personal | Inbox | `/inbox` | Notification list |
| Personal | My Issues | `/my-issues/assigned` | Filtered issue list (tabs: Assigned, Created, Subscribed, Activity) |
| Workspace | Projects | `/projects/all` | Project table |
| Workspace | Views | `/views/issues` | View list (tabs: Issues, Projects) |
| Team | Triage | `/team/{key}/triage` | Triage queue |
| Team | Issues | `/team/{key}/all` | Issue list (tabs: All, Active, Backlog + custom) |
| Team | Board | `/team/{key}/board` | Kanban board |
| Team | Projects | `/team/{key}/projects/all` | Team projects |
| Team | Views | `/team/{key}/views/issues` | Team views |
| Team | Cycles | `/team/{key}/cycles` | Cycle list |
| Global | Initiatives | `/initiatives` | Initiative list (tabs: Active, Planned, Completed) |
| Detail | Issue | `/issue/{id}` | Full issue page |
| Detail | Project | `/project/{slug}/overview` | Project detail (tabs: Overview, Activity, Issues) |
| Settings | Account | `/settings/account/*` | 6 pages: Preferences, Profile, Notifications, Security, Connected, Agents |
| Settings | Issues | `/settings/issue-*` | Labels, Templates, SLAs |
| Settings | Projects | `/settings/project-*` | Labels, Templates, Statuses, Updates |
| Settings | Features | `/settings/{feature}` | AI, Initiatives, Documents, Customer requests, Pulse, Asks, Emojis, Integrations |
| Settings | Admin | `/settings/{admin}` | Workspace, Teams, Members, Security, API, Applications, Billing, Import/export |
| Settings | Team | `/settings/teams/{key}/*` | General, Members, Notifications, Labels, Templates, Recurring, Statuses, Workflow, Triage, Cycles, Agents, AI |

## Authentication (P1)

### Methods
1. **Google OAuth** — Better Auth Google provider
2. **Email Magic Links** — Better Auth email + SES, 6-digit code + clickable link
3. No passwords — fully passwordless

### Flow
- Login page: "Continue with Google" + "Continue with Email"
- New users → workspace creation → default team auto-created
- Existing users → redirect to last workspace
- Sessions in Postgres via Better Auth Drizzle adapter
- Protected routes via Next.js middleware

## Onboarding (P2-P3)

1. Sign up (Google or magic link)
2. Create workspace (name + URL slug) — auto-creates default team
3. Invite team members (skippable)
4. Land on dashboard with empty states

## Design System

### Colors
| Token | Dark (default) | Light |
|-------|---------------|-------|
| Sidebar bg | #090909 | #f5f5f5 |
| Content bg | #0f0f11 | #fcfcfd |
| Border | #1c1e21 | #e0e0e0 |
| Text primary | #ffffff | #23252a |
| Text secondary | #6b6f76 | #b0b5c0 |
| Accent | #7180ff | #7180ff |

### Typography
- Font: Inter Variable (preloaded woff2)
- Issue titles: ~14px semibold
- Secondary text: ~12px
- Sidebar items: ~13px

### Layout
- Sidebar: 244px fixed, collapsible
- Content: 12px border-radius, 8px margin
- Board columns: Equal-width, individually scrollable
- Issue rows: ~40px height, compact

### Key Components
- **Priority icons**: Urgent (red !), High (orange ↑), Medium (yellow =), Low (blue ↓), None (gray —)
- **Status indicators**: Circle icons — empty (backlog/triage), half (started), check (done), X (canceled)
- **Labels**: Colored dots with text
- **Avatars**: 20px circular with initials fallback
- **Issue card** (board): title, identifier, priority, labels, assignee, project
- **Issue row** (list): identifier, title, assignee, priority, labels, project, date
- **Modals**: Centered, backdrop, close button

### Issue Creation Modal
- Team selector (ENG), title (contenteditable), description (rich text)
- Bottom toolbar: Status, Priority, Assignee, Project, Labels (combobox dropdowns)
- More actions, file attachment, "Create more" toggle, submit

### Display Options Panel
- Layout: List / Board toggle
- Columns (Status), Rows (grouping), Ordering (Priority)
- Toggles: sub-issues, triage, empty columns, completed recency
- Display properties: ID, Status, Assignee, Priority, Project, Due date, Milestone, Labels, Links, Time in status, Created, Updated, PRs

### Command Palette (Cmd+K)
- Search: "Type a command or search..." — quick results with issue matching
- "Ask Linear" tab for AI
- Grouped commands: Views, Issues, Projects, Documents, Filter, Templates, Navigation
- Keyboard shortcuts shown (C=create, V=fullscreen, N+P=project, N+U=update)
- Bottom: Open (Enter), Advanced search (Cmd+/), More actions, Quick look

## Workflow State Machine

Issues flow through these state categories:

| Category | States | Icon |
|----------|--------|------|
| Triage | Triage | Orange circle |
| Backlog | Backlog (default), Spec Needed, Research Needed | Empty circle |
| Unstarted | Todo | Empty circle |
| Started | Research In Progress, Research in Review, Ready for Plan, Plan in Progress, Plan in Review, Ready for Dev, In Dev, Code Review | Half circle |
| Completed | Done | Green check |
| Canceled | Canceled, Duplicate | Gray X |

Teams can customize statuses within each category. Default for new issues: Backlog.

## Data Models

### Workspace
- id, name, urlSlug, createdAt, updatedAt
- Settings: login methods, security, approved email domains

### Team
- id, name, key (e.g. "ENG"), workspaceId
- Settings: workflow states, labels, estimates, cycles enabled, triage enabled
- Private flag, memberCount

### WorkflowState
- id, name, teamId, category (triage/backlog/unstarted/started/completed/canceled)
- color, description, position (sort order)

### Issue
- id, number (auto-increment per team), identifier (ENG-123)
- title, description (rich text markdown)
- teamId, stateId, assigneeId, creatorId
- priority (0=none, 1=urgent, 2=high, 3=medium, 4=low), estimate
- labelIds[], parentIssueId, projectId, projectMilestoneId, cycleId
- dueDate, sortOrder
- createdAt, updatedAt, archivedAt, canceledAt, completedAt

### IssueRelation
- id, issueId, relatedIssueId, type (blocks/blocked_by/duplicate/related)

### Project
- id, name, description, icon (emoji), status (planned/started/paused/completed/canceled)
- priority (urgent/high/medium/low/none), leadId, memberIds[]
- startDate, targetDate, teamIds[]
- slackChannelId, createdAt, updatedAt

### ProjectMilestone
- id, name, projectId, sortOrder
- Progress: issueCount, completedIssueCount

### Cycle
- id, name, number, teamId
- startDate, endDate, autoRollover
- Progress: issueCount, completedIssueCount

### Initiative
- id, name, description, status (active/planned/completed)
- projectIds[], parentInitiativeId

### Label
- id, name, color, workspaceId (or teamId for team-scoped)

### CustomView
- id, name, ownerId, filterState (JSON), layout (list/board/timeline)
- isPersonal, teamId (optional)

### Comment
- id, body (rich text), issueId, userId, createdAt
- Reactions: [{emoji, userId}]

### Notification
- id, userId, issueId, actorId, type (assigned/mentioned/status_change/comment/duplicate)
- readAt, createdAt

### Member
- id, userId, workspaceId, role (owner/admin/member/guest)

## API Architecture

REST API routes (Next.js App Router API routes):
- `POST /api/auth/*` — Better Auth endpoints
- `GET/POST/PATCH/DELETE /api/workspaces/*`
- `GET/POST/PATCH/DELETE /api/teams/*`
- `GET/POST/PATCH/DELETE /api/issues/*`
- `GET/POST/PATCH/DELETE /api/projects/*`
- `GET/POST/PATCH/DELETE /api/cycles/*`
- `GET/POST/PATCH/DELETE /api/initiatives/*`
- `GET/POST/PATCH/DELETE /api/views/*`
- `GET/POST/PATCH/DELETE /api/labels/*`
- `GET/PATCH /api/notifications/*`
- `POST /api/issues/*/comments`
- `POST /api/issues/*/relations`

## Settings Architecture

### Team Settings (per-team configuration)
- **General**: Name, identifier (key), timezone, estimates, broader settings
- **Members**: Team member management
- **Notifications**: Slack channel broadcasting
- **Issue Labels**: Team-scoped labels (11 default)
- **Templates**: Issue/document/project templates
- **Recurring Issues**: Scheduled auto-creation
- **Issue Statuses**: Customizable workflow states (16 states in categories: Triage, Backlog, Unstarted, Started, Completed, Canceled)
- **Workflows & Automations**: Git workflows, auto-assignment, status transitions
- **Triage**: Enable/disable, triage settings
- **Cycles**: Enable/disable, schedule configuration
- **Agents**: AI agent guidance per team
- **Danger Zone**: Leave/retire/delete team

### Account Settings
- Preferences: Home view, display names, first day of week, emoticons, comment shortcut, theme, font, sidebar
- Profile: Name, avatar, username
- Notifications: Desktop/mobile/email/Slack channels
- Security: Passkeys, sessions
- Connected accounts: OAuth connections

## Build Order

1. **P0 — Infrastructure** (infra-001 to infra-004)
   - Database schema with Drizzle ORM — all tables listed in Data Models
   - Redis connection (ioredis + ElastiCache)
   - S3 storage utilities (presigned URLs)
   - SES email utilities

2. **P1 — Auth** (auth-001 to auth-004)
   - Google OAuth via Better Auth
   - Email magic links via Better Auth + SES
   - Session management + protected routes middleware
   - Login/signup page UI

3. **P2 — Core Layout & Onboarding** (layout-001, layout-002, design-001, onboarding-001)
   - App shell: sidebar + content area, dark/light theme
   - Sidebar navigation with all sections
   - Design system: colors, typography, icons, components
   - Workspace creation flow + default team

4. **P3 — Issues (Core)** (feature-001 to feature-004, feature-040)
   - Issue list view grouped by workflow state
   - Issue board view (kanban columns)
   - Issue detail page (title, description, properties, activity, comments)
   - Create issue modal with all properties
   - Command palette (Cmd+K) with search + commands

5. **P4 — Filters & My Issues** (feature-005, feature-006, feature-021)
   - Display options panel (layout, grouping, ordering, properties)
   - Filter bar (status, priority, assignee, label, project, date)
   - My Issues page (Assigned/Created/Subscribed/Activity tabs)

6. **P5 — Projects & Triage** (feature-010, feature-011, feature-032)
   - Projects list (table with name, health, priority, lead, date, status)
   - Project detail (overview, milestones, progress, activity, issues tabs)
   - Triage queue (incoming issues, accept/decline)

7. **P6 — Views & Inbox** (feature-041, feature-020)
   - Custom views (saved filter configurations)
   - Inbox notifications (notification list, mark read)

8. **P7 — Cycles** (feature-030)
   - Cycle management, auto-start/end, progress tracking

9. **P8 — Initiatives** (feature-031)
   - Initiative management, project grouping, progress at scale

10. **P9 — Settings** (settings pages)
    - Account preferences + profile
    - Team settings (workflow states, labels, templates, members)
    - Workspace administration

11. **P10 — Onboarding Polish** (onboarding-002, onboarding-003)
    - Invite team members flow
    - Empty states for all features

12. **Last — Deployment**
    - Docker build, ECR push, ECS Fargate + ALB
