# Finishd Marketplace - Implementation Plan

## Overview

Build **Finishd** - a marketplace connecting Indian homeowners with interior designers and contractors. Target markets: Delhi NCR and Chandigarh Tricity.

## Architecture Decisions

### Technology Stack (Per PRD)

| Layer | Technology | Notes |
|-------|------------|-------|
| Backend | Node.js + TypeScript + Fastify | Switch from Express |
| ORM | Drizzle ORM | Switch from Sequelize |
| Database | PostgreSQL | Keep existing |
| Cache | Redis | Keep existing |
| Search | Typesense | New addition |
| Frontend | React 18 + Vite + shadcn/ui | Enhance existing |
| State | Zustand + TanStack Query | New additions |
| Testing | Vitest + Playwright | Keep existing |

### Key Architecture Decisions

1. **Phone OTP Authentication** (not email/password)
   - Primary auth method for India market
   - Mock OTP provider in dev (accept "123456")
   - Store OTP in Redis with 5-minute expiry

2. **User Type Separation**
   - Single `users` table with `user_type` field
   - Separate profile tables: `homeowner_profiles`, `designer_profiles`, `contractor_profiles`
   - Profile created during onboarding

3. **Project State Machine**
   - States: draft → seeking_designer → in_progress → completed/cancelled
   - State transitions enforced at service layer
   - Activity logging for all state changes

4. **Search Strategy**
   - Typesense for fast full-text search
   - Sync on create/update via application hooks
   - Daily full reindex job

## Data Model Summary

### Core Entities

```
users                   - Base user account (phone, user_type)
homeowner_profiles      - Homeowner-specific data
designer_profiles       - Designer data (portfolio, services, pricing)
contractor_profiles     - Contractor data (trades, experience)
properties              - Homeowner properties
projects                - Interior projects
project_requests        - Request sent to designer
proposals               - Designer proposals
project_contractors     - Contractor assignments
tasks                   - Project tasks
milestones              - Project milestones with payments
cost_estimates          - Budget breakdown
activity_logs           - Project activity feed
```

## Implementation Phases

### Phase 1: Backend Foundation (Week 1)

**Goal:** Core data models and authentication

1. **Database Schema**
   - Set up Drizzle ORM with PostgreSQL
   - Create all entity tables with proper relations
   - Add indexes for performance
   - Create migration scripts

2. **Auth Module (Phone OTP)**
   - POST /api/v1/auth/send-otp
   - POST /api/v1/auth/verify-otp
   - POST /api/v1/auth/logout
   - Mock OTP provider (always accept "123456" in dev)
   - JWT token generation

3. **User/Profile CRUD**
   - GET/PATCH /api/v1/users/me
   - Homeowner profile endpoints
   - Designer profile endpoints
   - Contractor profile endpoints

4. **File Upload**
   - POST /api/v1/upload
   - Local storage for dev, S3 for prod
   - Image optimization

### Phase 2: Core Features (Week 2)

**Goal:** Search, projects, and workflows

5. **Search (Typesense)**
   - Add Typesense to docker-compose
   - Designer search with filters
   - Contractor search with filters
   - Sync hooks for data updates

6. **Projects Module**
   - Full CRUD operations
   - State machine enforcement
   - Access control by role

7. **Requests & Proposals**
   - Send request to designer
   - Designer submits proposal
   - Accept/reject proposal
   - Auto-assign designer on accept

8. **Tasks, Milestones, Costs**
   - Task CRUD with status updates
   - Milestone CRUD with payment tracking
   - Cost estimate management
   - Activity logging

9. **Contractor Integration**
   - Invite contractor to project
   - Contractor submits quote
   - Hire contractor

### Phase 3: Frontend Foundation (Week 3)

**Goal:** UI components and layout

10. **Design System Setup**
    - Configure tailwind with custom tokens
    - Set up shadcn/ui
    - Create color scheme and typography

11. **Layout Components**
    - AppShell with bottom nav
    - ScreenHeader
    - Loading/error states

12. **Form Components**
    - PhoneInput
    - OTPInput
    - CurrencyInput (Indian format)
    - ImageUploader

13. **Card Components**
    - DesignerCard
    - ContractorCard
    - ProjectCard
    - ProposalCard

14. **Feedback Components**
    - Skeletons
    - EmptyState
    - ConfirmDialog

### Phase 4: Frontend Screens (Week 4)

**Goal:** All user-facing screens

15. **Auth Flow**
    - Welcome screen
    - Phone entry
    - OTP verification
    - User type selection

16. **Onboarding Flows**
    - Homeowner (3 steps)
    - Designer (4 steps)
    - Contractor (3 steps)

17. **Home Screens**
    - Homeowner home
    - Designer home
    - Contractor home

18. **Browse & Search**
    - Browse designers
    - Browse contractors
    - Designer profile
    - Contractor profile

19. **Project Detail**
    - Overview tab
    - Tasks tab
    - Milestones tab
    - Costs tab
    - Team tab

20. **Profile & Settings**
    - Profile screen (all types)
    - Language switching
    - Logout

### Phase 5: Testing & Polish (Week 5)

**Goal:** Quality assurance and data

21. **Backend Tests**
    - Unit tests for services
    - Integration tests for APIs
    - 80%+ coverage target

22. **Frontend Tests**
    - Component tests
    - Integration tests

23. **E2E Tests**
    - Critical user journeys
    - Auth flow
    - Project creation flow

24. **Seed Data**
    - 10 homeowners
    - 6 designers (4 verified)
    - 4 contractors
    - Projects in all states
    - Tasks, milestones, costs

25. **i18n**
    - English translations
    - Hindi translations

## API Structure

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
│   └── /properties (CRUD)
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
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PATCH /:id
│   ├── /requests (CRUD)
│   ├── /proposals (CRUD)
│   ├── /contractors (CRUD)
│   ├── /tasks (CRUD)
│   ├── /milestones (CRUD)
│   ├── /costs (CRUD)
│   └── /activity (GET)
└── /search
    ├── GET /designers
    └── GET /contractors
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Sequelize to Drizzle migration | Keep both temporarily, migrate incrementally |
| Express to Fastify | Create Fastify app alongside, migrate routes gradually |
| Complex state machine | Comprehensive tests, clear state transition rules |
| Search sync issues | Idempotent sync, daily full reindex |

## Success Criteria

1. All API endpoints functional and tested
2. Frontend flows working for all user types
3. Search returns relevant results < 100ms
4. 80%+ test coverage
5. Seed data demonstrates all features
6. English and Hindi translations complete

## References

- PRD: `docs/prds/finishd-prd.md`
- User Flows: `docs/prds/finishd-user-flows.md`
- Frontend Specs: `docs/prds/finishd-frontend-specs.md`
