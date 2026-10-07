# LaunchFlow

**LaunchFlow** is a full-stack SaaS project management platform built with **Next.js, TypeScript, Supabase and Resend**. It combines project and task management, team collaboration, role-based permissions, bilingual UI and production-ready deployment in a polished responsive dashboard.

[Live Demo](https://launchflow-saas-five.vercel.app) · [Repository](https://github.com/rodriguezgabriel083/launchflow-saas)

---

## Overview

LaunchFlow was built as a production-style SaaS MVP focused on the core workflows teams need to organize projects, assign work and collaborate securely inside shared workspaces.

The application is backed by real Supabase data and authentication. It includes granular employee permissions, Row Level Security, invitation workflows, transactional email delivery and persistent URL-based navigation.

## Features

- **Authentication**
  - Email/password sign up and sign in with Supabase Auth
  - Email confirmation flow
  - Persistent authenticated sessions
  - Logout and session recovery

- **Workspace management**
  - Personal workspace created automatically for new users
  - Editable workspace name for administrators
  - Active workspace persistence
  - Workspace-isolated data access

- **Projects**
  - Create, edit and delete projects
  - Planning, in-progress and completed states
  - Priority levels and due dates
  - Real-time project progress calculated from tasks

- **Tasks**
  - Create, edit, delete and complete tasks
  - Assign tasks to workspace members
  - Priority, status and due-date management
  - Dashboard task metrics and deadline tracking

- **Team & permissions**
  - Administrator and employee roles
  - Granular employee permissions:
    - Create projects
    - Edit projects
    - Create tasks
    - Assign tasks
    - Manage users
  - Protection against deleting or demoting the last administrator
  - Permission-aware UI and backend enforcement

- **Invitations**
  - Invite users to a workspace
  - Accept or reject pending invitations
  - Re-send pending invitation emails
  - Transactional email delivery through **Resend**
  - Secure Supabase Edge Function validates the authenticated sender and workspace permission before sending

- **Security**
  - PostgreSQL Row Level Security
  - Workspace-level data isolation
  - Role and permission checks enforced at the database layer
  - Sensitive email credentials stored as Supabase Edge Function secrets
  - No service-role credentials exposed to the browser

- **Internationalization**
  - English and Spanish interface
  - Language preference persistence

- **UX**
  - Persistent URL-based navigation
  - Refresh-safe routes
  - Responsive layout
  - Dark glass / neon SaaS design system
  - Loading, success, error and empty states

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 |
| Language | TypeScript |
| UI | React 19, Tailwind CSS |
| Icons | Lucide React |
| Authentication | Supabase Auth |
| Database | Supabase / PostgreSQL |
| Security | PostgreSQL Row Level Security |
| Backend logic | Supabase RPCs, triggers and Edge Functions |
| Transactional email | Resend |
| Deployment | Vercel |
| Version control | Git + GitHub |

## Architecture Highlights

### Workspace-scoped authorization

Projects, tasks, members and invitations are associated with a workspace. Database policies restrict access so authenticated users can only operate on data belonging to workspaces where they are members.

### Role-based and granular permissions

Administrators receive full workspace access. Employees can be granted independent permissions for project creation/editing, task creation/assignment and team management.

Permission checks are not limited to hidden buttons in the frontend: the database and server-side flows also enforce authorization.

### Secure invitation delivery

Workspace invitation emails are sent through a Supabase Edge Function integrated with Resend.

The function:

1. Requires a valid authenticated user.
2. Loads the invitation directly from the database.
3. Verifies that the invitation is still pending.
4. Confirms the sender belongs to the workspace and is authorized to manage users.
5. Reads workspace and inviter information server-side.
6. Sends the invitation through Resend without exposing private API keys to the client.

### Database automation

Supabase/PostgreSQL handles several application rules through schema constraints, triggers and RPC functions, including profile/workspace creation and invitation acceptance.

## Routes

```text
/dashboard
/projects
/tasks
/team
/settings
```

Navigation is URL-based, so browser refresh, tab switching and back/forward navigation preserve the current application section.

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/rodriguezgabriel083/launchflow-saas.git
cd launchflow-saas
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

### 4. Configure Supabase

Apply the SQL schema and migrations in the `supabase/` directory to your Supabase project.

The project includes migrations for:

- Projects
- Tasks
- Team management
- Invitation acceptance
- Permission enforcement

### 5. Optional: configure invitation emails

The Edge Function in:

```text
supabase/functions/send-workspace-invitation
```

requires server-side secrets such as the Resend API key and sender configuration.

Never expose service-role or Resend credentials through `NEXT_PUBLIC_*` variables.

### 6. Start development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production

LaunchFlow is deployed on Vercel and connected to a hosted Supabase project.

**Live application:**  
https://launchflow-saas-five.vercel.app

## What I Practiced Building LaunchFlow

This project was designed to go beyond a static frontend and practice the full lifecycle of a SaaS application:

- Designing and implementing relational application data
- Authentication and session management
- Multi-user workspace architecture
- CRUD workflows backed by a real database
- Row Level Security
- Role-based authorization
- Transactional email infrastructure
- Production environment configuration
- Responsive UI design
- Git-based development workflow
- Production deployment and testing

## Current Scope

LaunchFlow is an MVP focused on project, task and team-management workflows. Features such as account deletion, workspace logo uploads, custom email domains and more advanced collaboration tools are intentionally outside the current scope.

## Author

**Gabriel Rodriguez**

Built as a full-stack SaaS portfolio project.

---

If you found the project interesting, feel free to explore the live demo or review the implementation in this repository.
