# Finishd — Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Draft

---

## 1. Product Overview

**Product Name:** Finishd

**One-line Positioning:** The platform that takes homeowners from bare walls to finished interiors.

### Problem Statement

In India's housing market, apartments are typically delivered without finished interiors. Homeowners must independently coordinate interior designers, contractors, electricians, plumbers, and masons — a fragmented, stressful process with no visibility into costs, timelines, or quality. There is no unified platform to discover trusted professionals, manage projects, and track progress.

### Solution

Finishd is a marketplace and project management platform that connects homeowners with verified interior designers and contractors. Homeowners can scope work (full home or specific rooms/areas), receive proposals from designers, hire contractors, and manage the entire project — tasks, costs, materials, and payments — in one place.

---

## 2. Target Users

### Primary User: Homeowner

- Recently purchased an apartment (bare shell or semi-finished)
- Renovating or upgrading an existing home
- Needs full interior work or partial work (single room, kitchen, bathroom, etc.)
- Located in Delhi NCR or Chandigarh Tricity
- Comfortable with English or Hindi

### Secondary Users

**Interior Designer**
- Independent designers or small firms
- Looking for qualified leads and project opportunities
- Needs tools to submit proposals and manage client projects

**Contractor / Technician**
- Electricians, plumbers, masons, carpenters, painters
- General contractors managing multiple trades
- Seeking verified project opportunities

---

## 3. V1 Scope

### In Scope

- Designer marketplace (browse, filter, view portfolios, request proposals)
- Contractor/technician marketplace (browse, filter, view profiles, hire)
- Project management (tasks, milestones, calendar)
- Cost management (estimates, actuals, tracking)
- Payment milestones (tracking, not escrow in v1)
- Multi-language support (English + Hindi)

### Out of Scope (V2+)

- Material procurement marketplace (V2)
- AI design generation (V3)
- Escrow payments (V2)
- Reviews and ratings (V1.5 or V2)

---

## 4. Platform Strategy

| Platform | Technology | Timeline |
|----------|------------|----------|
| Web (mobile-responsive) | React + Vite + shadcn/ui + Tailwind + Zustand + TanStack Query | V1 (parallel) |
| iOS / Android | React Native + Tamagui | V1 (parallel) |
| Backend | Node.js + Postgres + Redis + Typesense | V1 |

---

## 5. Core User Journeys

### 5.1 Homeowner Journey

```
Sign Up (Phone OTP)
    ↓
Onboarding (location, property type, scope of work)
    ↓
Browse Designers / Post Requirements
    ↓
View Portfolios → Request Proposals
    ↓
Receive & Compare Proposals
    ↓
Select Designer → Project Created
    ↓
Designer adds Scope, Tasks, Milestones, Cost Estimate
    ↓
Homeowner approves Plan
    ↓
Hire Contractors (via marketplace or designer recommendation)
    ↓
Track Progress (tasks, calendar, costs)
    ↓
Mark Milestones Complete → Payment Tracking
    ↓
Project Complete
```

### 5.2 Designer Journey

```
Sign Up (Phone OTP)
    ↓
Onboarding (profile, portfolio, services, service areas, pricing)
    ↓
Verification (manual review by Finishd team)
    ↓
Receive Project Requests / Browse Open Requirements
    ↓
Submit Proposal (scope, approach, timeline, cost)
    ↓
If Selected → Project Assigned
    ↓
Create Project Plan (tasks, milestones, materials, cost breakdown)
    ↓
Manage Project (update tasks, communicate with homeowner)
    ↓
Project Complete
```

### 5.3 Contractor / Technician Journey

```
Sign Up (Phone OTP)
    ↓
Onboarding (profile, skills, service areas, past work photos)
    ↓
Verification (manual review by Finishd team)
    ↓
Browse Available Projects / Receive Invitations
    ↓
Express Interest / Submit Quote
    ↓
If Hired → Assigned to Project
    ↓
Complete Tasks → Mark as Done
    ↓
Payment Milestone Tracked
    ↓
Project Complete
```

---

## 6. Feature Specifications (V1)

### 6.1 Authentication & Onboarding

| Feature | Description |
|---------|-------------|
| Phone OTP Login | Primary auth method, works for all user types |
| User Type Selection | Homeowner / Designer / Contractor selection post-OTP |
| Homeowner Onboarding | Location (city, locality), property type (apartment/house), scope (full home / specific areas), timeline, budget range |
| Designer Onboarding | Name, firm (optional), portfolio images, services offered, cities served, starting price range |
| Contractor Onboarding | Name, trade(s), experience, service areas, past work photos |

### 6.2 Designer Marketplace

| Feature | Description |
|---------|-------------|
| Browse Designers | List view with filters (location, budget, style, availability) |
| Designer Profile | Portfolio gallery, services, pricing, service areas, bio |
| Request Proposal | Homeowner sends project brief to designer |
| Proposal Inbox | Homeowner views received proposals |
| Proposal Detail | Scope, approach, timeline, cost breakdown, accept/reject |

### 6.3 Contractor Marketplace

| Feature | Description |
|---------|-------------|
| Browse Contractors | List view with filters (trade, location, availability) |
| Contractor Profile | Skills, experience, past work photos, service areas |
| Invite to Project | Homeowner or designer invites contractor to a project |
| Quote Submission | Contractor submits quote for the work |
| Hire | Homeowner confirms contractor for the project |

### 6.4 Project Management

| Feature | Description |
|---------|-------------|
| Project Dashboard | Overview of active project(s) — status, progress, upcoming tasks |
| Task Management | Create, assign, update, complete tasks |
| Milestones | Key deliverables with target dates and payment amounts |
| Calendar View | Visual timeline of tasks and milestones |
| Activity Feed | Log of all project updates |

### 6.5 Cost Management

| Feature | Description |
|---------|-------------|
| Cost Estimate | Initial estimate created by designer |
| Cost Breakdown | Categories: design fees, labor, materials (placeholder for V2), miscellaneous |
| Actuals Tracking | Record actual spend against estimates |
| Budget Alerts | Notify homeowner when approaching or exceeding budget |

### 6.6 Payment Milestone Tracking (V1 — No Escrow)

| Feature | Description |
|---------|-------------|
| Milestone Amounts | Each milestone has an associated payment amount |
| Payment Status | Not Paid / Paid (manually marked by homeowner) |
| Payment History | Record of all milestone payments |

*Note: Actual payment processing and escrow deferred to V2.*

---

## 7. Information Architecture

### 7.1 Homeowner App Structure

```
Home (Tab)
├── Active Projects Summary
├── Recommended Designers
└── Quick Actions (Post Requirement, Browse)

Designers (Tab)
├── Search / Filters
├── Designer List
└── Designer Profile → Request Proposal

Contractors (Tab)
├── Search / Filters
├── Contractor List
└── Contractor Profile → Invite to Project

Projects (Tab)
├── Active Projects
├── Past Projects
└── Project Detail
    ├── Overview
    ├── Tasks
    ├── Milestones
    ├── Costs
    ├── Calendar
    └── Team (Designer, Contractors)

Profile (Tab)
├── My Properties
├── Settings
├── Language
└── Logout
```

### 7.2 Designer App Structure

```
Home (Tab)
├── Active Projects
├── New Requests
└── Earnings Summary

Requests (Tab)
├── Incoming Requests
└── Request Detail → Submit Proposal

Projects (Tab)
├── Active Projects
├── Past Projects
└── Project Detail
    ├── Overview
    ├── Tasks (create/manage)
    ├── Milestones (create/manage)
    ├── Costs (create/manage)
    ├── Calendar
    └── Team

Profile (Tab)
├── Portfolio
├── Services
├── Settings
└── Logout
```

### 7.3 Contractor App Structure

```
Home (Tab)
├── Active Assignments
├── Invitations
└── Earnings Summary

Opportunities (Tab)
├── Open Projects (browse)
├── Invitations
└── Project Detail → Submit Quote

My Work (Tab)
├── Active Assignments
├── Past Work
└── Assignment Detail
    ├── Tasks Assigned
    ├── Milestones
    └── Payment Status

Profile (Tab)
├── Skills & Services
├── Past Work Photos
├── Settings
└── Logout
```

---

## 8. Data Model (Core Entities)

```
User
├── id (uuid)
├── phone (string, unique)
├── user_type (enum: homeowner, designer, contractor)
├── language_preference (enum: en, hi)
├── created_at
└── updated_at

HomeownerProfile
├── id (uuid)
├── user_id (fk → User)
├── name (string)
├── city (string)
├── locality (string)
└── properties (relation → Property[])

Property
├── id (uuid)
├── homeowner_id (fk → HomeownerProfile)
├── type (enum: apartment, house, villa)
├── address (string)
├── size_sqft (integer, optional)
└── rooms (jsonb, optional — bedroom count, bathroom count, etc.)

DesignerProfile
├── id (uuid)
├── user_id (fk → User)
├── name (string)
├── firm_name (string, optional)
├── bio (text)
├── portfolio_images (string[])
├── services (string[])
├── service_cities (string[])
├── price_range_min (integer)
├── price_range_max (integer)
├── verified (boolean)
└── verified_at (timestamp)

ContractorProfile
├── id (uuid)
├── user_id (fk → User)
├── name (string)
├── trades (enum[]: electrician, plumber, mason, carpenter, painter, general_contractor)
├── experience_years (integer)
├── service_areas (string[])
├── work_photos (string[])
├── verified (boolean)
└── verified_at (timestamp)

Project
├── id (uuid)
├── homeowner_id (fk → HomeownerProfile)
├── property_id (fk → Property)
├── designer_id (fk → DesignerProfile, nullable)
├── title (string)
├── scope (enum: full_home, partial)
├── scope_details (jsonb — rooms/areas included)
├── status (enum: draft, seeking_designer, in_progress, completed, cancelled)
├── budget_min (integer)
├── budget_max (integer)
├── timeline_weeks (integer)
├── created_at
└── updated_at

ProjectRequest
├── id (uuid)
├── project_id (fk → Project)
├── designer_id (fk → DesignerProfile)
├── status (enum: pending, proposal_submitted, accepted, rejected)
├── message (text)
├── created_at
└── updated_at

Proposal
├── id (uuid)
├── project_request_id (fk → ProjectRequest)
├── designer_id (fk → DesignerProfile)
├── scope_description (text)
├── approach (text)
├── timeline_weeks (integer)
├── cost_estimate (integer)
├── cost_breakdown (jsonb)
├── status (enum: submitted, accepted, rejected)
├── created_at
└── updated_at

ProjectContractor
├── id (uuid)
├── project_id (fk → Project)
├── contractor_id (fk → ContractorProfile)
├── status (enum: invited, quote_submitted, hired, completed, removed)
├── quote_amount (integer, nullable)
├── quote_details (text, nullable)
├── hired_at (timestamp)
└── created_at

Task
├── id (uuid)
├── project_id (fk → Project)
├── assigned_to (fk → User, nullable)
├── title (string)
├── description (text)
├── status (enum: todo, in_progress, completed)
├── due_date (date, nullable)
├── completed_at (timestamp)
├── created_by (fk → User)
├── created_at
└── updated_at

Milestone
├── id (uuid)
├── project_id (fk → Project)
├── title (string)
├── description (text)
├── target_date (date)
├── payment_amount (integer)
├── payment_status (enum: not_paid, paid)
├── paid_at (timestamp)
├── status (enum: pending, completed)
├── completed_at (timestamp)
├── created_at
└── updated_at

CostEstimate
├── id (uuid)
├── project_id (fk → Project)
├── category (enum: design_fees, labor, materials, miscellaneous)
├── description (string)
├── estimated_amount (integer)
├── actual_amount (integer, nullable)
├── created_at
└── updated_at

ActivityLog
├── id (uuid)
├── project_id (fk → Project)
├── user_id (fk → User)
├── action (string)
├── details (jsonb)
├── created_at
```

---

## 9. Technical Architecture

### 9.1 Stack Summary

| Layer | Technology |
|-------|------------|
| Web Frontend | React 18 + Vite + shadcn/ui + Tailwind CSS + Zustand + TanStack Query |
| Mobile Frontend | React Native + Tamagui |
| Backend | Node.js (Express or Fastify) + TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| Search | Typesense |
| Testing | Vitest (frontend and backend) |
| Auth | Phone OTP (provider TBD — MSG91, Twilio, Firebase Auth) |
| File Storage | S3-compatible (AWS S3 / Cloudflare R2 / MinIO) |
| Hosting | TBD (AWS / GCP / Vercel+Railway) |

### 9.2 API Design

RESTful API with the following resource structure:

```
/api/v1
├── /auth
│   ├── POST /send-otp
│   ├── POST /verify-otp
│   └── POST /logout
├── /users
│   ├── GET /me
│   └── PATCH /me
├── /homeowners
│   ├── GET /me
│   ├── PATCH /me
│   └── /properties
│       ├── GET /
│       ├── POST /
│       ├── GET /:id
│       ├── PATCH /:id
│       └── DELETE /:id
├── /designers
│   ├── GET / (browse)
│   ├── GET /:id
│   ├── GET /me
│   └── PATCH /me
├── /contractors
│   ├── GET / (browse)
│   ├── GET /:id
│   ├── GET /me
│   └── PATCH /me
├── /projects
│   ├── GET / (my projects)
│   ├── POST /
│   ├── GET /:id
│   ├── PATCH /:id
│   ├── /requests
│   │   ├── POST / (send request to designer)
│   │   ├── GET / (list requests)
│   │   └── GET /:id
│   ├── /proposals
│   │   ├── GET /
│   │   ├── POST / (designer submits)
│   │   ├── GET /:id
│   │   └── POST /:id/accept
│   ├── /contractors
│   │   ├── GET /
│   │   ├── POST / (invite contractor)
│   │   ├── PATCH /:id (update status, hire)
│   │   └── DELETE /:id
│   ├── /tasks
│   │   ├── GET /
│   │   ├── POST /
│   │   ├── GET /:id
│   │   ├── PATCH /:id
│   │   └── DELETE /:id
│   ├── /milestones
│   │   ├── GET /
│   │   ├── POST /
│   │   ├── GET /:id
│   │   ├── PATCH /:id
│   │   └── DELETE /:id
│   ├── /costs
│   │   ├── GET /
│   │   ├── POST /
│   │   ├── PATCH /:id
│   │   └── DELETE /:id
│   └── /activity
│       └── GET /
└── /search
    ├── GET /designers
    └── GET /contractors
```

### 9.3 Search (Typesense)

**Collections:**
- `designers` — searchable by name, services, cities, bio
- `contractors` — searchable by name, trades, service areas

**Sync Strategy:**
- Database triggers or application-level hooks sync to Typesense on create/update
- Full reindex job (daily or on-demand)

---

## 10. Success Metrics (90-Day Goals)

| Metric | Target |
|--------|--------|
| Cities Live | 2 (Delhi NCR, Chandigarh Tricity) |
| Verified Designers | 40 (20 per city) |
| Verified Contractors/Technicians | 500 |
| Registered Homeowners | 200 |
| Projects Created | 50 |
| Proposals Submitted | 100 |
| Projects with Hired Designer | 20 |

---

## 11. Open Questions / Decisions Needed

| Question | Status |
|----------|--------|
| OTP Provider (MSG91 / Twilio / Firebase) | TBD |
| Hosting provider (AWS / GCP / Vercel+Railway) | TBD |
| File storage (S3 / R2 / MinIO) | TBD |
| Admin panel approach (custom / Retool / Forest Admin) | TBD |
| Verification workflow for designers/contractors | TBD |
| Monetization details (lead fee amount, subscription tiers) | TBD |

---

## 12. Document Roadmap

| Document | Purpose | Status |
|----------|---------|--------|
| PRD | Product vision, scope, features | ✅ This document |
| User Flows (detailed) | Step-by-step flows with screens | Next |
| Wireframes / UI Specs | Screen-by-screen specs for devs | Next |
| API Specification | OpenAPI/Swagger spec | Next |
| Data Model (DB schema) | SQL migrations, indexes | Next |
| Component Library Guide | shadcn + Tamagui component mapping | Next |
