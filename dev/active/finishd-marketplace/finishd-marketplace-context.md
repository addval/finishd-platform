# Finishd Marketplace - Context

## SESSION PROGRESS (2026-01-28)

### Current Status: PHASE 2 COMPLETE, READY FOR PHASE 3

**Session Goal:** Build Finishd marketplace backend foundation

### Completed This Session (Phase 1 + Phase 2)
- [x] Read and analyzed PRD documents
- [x] Reviewed existing codebase structure
- [x] Created dev docs (plan, tasks, context)
- [x] Updated docker-compose.yml with Typesense service
- [x] Set up Drizzle ORM with full database schema
- [x] Implemented phone OTP authentication module
- [x] Created user/profile CRUD for all user types
- [x] Implemented file upload endpoint
- [x] Typesense integration for search (designers/contractors)
- [x] Projects module with state machine
- [x] Requests & proposals workflow
- [x] Tasks, milestones, costs management
- [x] Activity logging

### Blockers
- None currently

## Key Files Created

### Database Layer
- `apps/backend/src/db/schema.ts` - Complete Drizzle schema with all tables
- `apps/backend/src/db/index.ts` - Database connection
- `apps/backend/src/db/migrate.ts` - Migration script
- `apps/backend/drizzle.config.ts` - Drizzle configuration

### Auth Module
- `apps/backend/src/modules/auth/otp.service.ts` - OTP generation/verification
- `apps/backend/src/modules/auth/sms.service.ts` - Mock SMS provider
- `apps/backend/src/modules/auth/auth.service.ts` - Authentication logic
- `apps/backend/src/modules/auth/auth.controller.ts` - HTTP handlers
- `apps/backend/src/modules/auth/auth.routes.ts` - API routes
- `apps/backend/src/modules/auth/auth.middleware.ts` - JWT middleware

### User Module
- `apps/backend/src/modules/users/users.service.ts` - User management
- `apps/backend/src/modules/users/users.controller.ts` - HTTP handlers
- `apps/backend/src/modules/users/users.routes.ts` - API routes

### Profile Modules
- `apps/backend/src/modules/homeowners/*` - Homeowner profile & properties
- `apps/backend/src/modules/designers/*` - Designer profile & browse
- `apps/backend/src/modules/contractors/*` - Contractor profile & browse

### Upload Module
- `apps/backend/src/modules/upload/upload.service.ts` - File handling
- `apps/backend/src/modules/upload/upload.controller.ts` - HTTP handlers
- `apps/backend/src/modules/upload/upload.routes.ts` - API routes

### Search Module (NEW)
- `apps/backend/src/modules/search/typesense.config.ts` - Typesense client & collections
- `apps/backend/src/modules/search/search.service.ts` - Index & search operations
- `apps/backend/src/modules/search/search.controller.ts` - HTTP handlers
- `apps/backend/src/modules/search/search.routes.ts` - API routes

### Projects Module (NEW)
- `apps/backend/src/modules/projects/projects.service.ts` - Project CRUD & state machine
- `apps/backend/src/modules/projects/projects.controller.ts` - HTTP handlers
- `apps/backend/src/modules/projects/projects.routes.ts` - API routes

### Requests Module (NEW)
- `apps/backend/src/modules/requests/requests.service.ts` - Requests & proposals workflow
- `apps/backend/src/modules/requests/requests.controller.ts` - HTTP handlers
- `apps/backend/src/modules/requests/requests.routes.ts` - API routes

### Tasks Module (NEW)
- `apps/backend/src/modules/tasks/tasks.service.ts` - Tasks, milestones, costs
- `apps/backend/src/modules/tasks/tasks.controller.ts` - HTTP handlers
- `apps/backend/src/modules/tasks/tasks.routes.ts` - API routes

### Configuration
- `docker/docker-compose.yml` - Added Typesense, updated naming
- `apps/backend/package.json` - Added Drizzle, Typesense deps
- `apps/backend/.env.example` - Full environment template

## API Endpoints Implemented

### Auth (/api/v1/auth)
- `POST /send-otp` - Send OTP to phone
- `POST /verify-otp` - Verify OTP and get tokens
- `POST /refresh-token` - Refresh access token
- `POST /logout` - Logout user (auth required)

### Users (/api/v1/users)
- `GET /me` - Get current user
- `PATCH /me` - Update user type/language
- `DELETE /me` - Deactivate account

### Homeowners (/api/v1/homeowners)
- `GET /me` - Get profile
- `POST /me` - Create profile
- `PATCH /me` - Update profile
- `GET /me/properties` - List properties
- `POST /me/properties` - Add property
- `PATCH /me/properties/:id` - Update property
- `DELETE /me/properties/:id` - Delete property

### Designers (/api/v1/designers)
- `GET /` - Browse designers
- `GET /featured` - Featured designers
- `GET /:id` - Get designer
- `GET /me` - Get own profile
- `POST /me` - Create profile
- `PATCH /me` - Update profile

### Contractors (/api/v1/contractors)
- `GET /` - Browse contractors
- `GET /by-trade/:trade` - By trade
- `GET /:id` - Get contractor
- `GET /me` - Get own profile
- `POST /me` - Create profile
- `PATCH /me` - Update profile

### Upload (/api/v1/upload)
- `POST /` - Upload single file
- `POST /multiple` - Upload multiple files
- `DELETE /` - Delete file

### Search (/api/v1/search) - NEW
- `GET /designers` - Typesense search for designers
- `GET /contractors` - Typesense search for contractors

### Projects (/api/v1/projects) - NEW
- `GET /` - List homeowner's projects
- `POST /` - Create new project
- `GET /designer` - List designer's assigned projects
- `GET /:id` - Get project details
- `PATCH /:id` - Update project (draft only)
- `POST /:id/complete` - Mark project completed
- `POST /:id/cancel` - Cancel project
- `GET /:id/activity` - Get activity log

### Requests (/api/v1/requests) - NEW
- `POST /` - Send request to designer (homeowner)
- `GET /project/:projectId` - Get requests for project
- `GET /project/:projectId/proposals` - Get proposals for project
- `POST /proposals/:proposalId/accept` - Accept proposal
- `POST /proposals/:proposalId/reject` - Reject proposal
- `GET /designer` - Get requests for designer
- `GET /:requestId` - Get request details (designer)
- `POST /:requestId/decline` - Decline request
- `POST /:requestId/proposal` - Submit proposal

### Tasks & Milestones (/api/v1) - NEW
- `POST /projects/:projectId/tasks` - Create task
- `GET /projects/:projectId/tasks` - Get tasks
- `PATCH /tasks/:taskId` - Update task
- `PATCH /tasks/:taskId/status` - Update task status
- `DELETE /tasks/:taskId` - Delete task
- `POST /projects/:projectId/milestones` - Create milestone
- `GET /projects/:projectId/milestones` - Get milestones
- `PATCH /milestones/:milestoneId` - Update milestone
- `PATCH /milestones/:milestoneId/status` - Update status
- `PATCH /milestones/:milestoneId/payment` - Update payment
- `DELETE /milestones/:milestoneId` - Delete milestone
- `POST /projects/:projectId/costs` - Create cost estimate
- `GET /projects/:projectId/costs` - Get cost estimates with summary
- `PATCH /costs/:costEstimateId` - Update cost estimate
- `DELETE /costs/:costEstimateId` - Delete cost estimate

## Project State Machine

Valid transitions:
- `draft` → `seeking_designer` (when first request sent)
- `seeking_designer` → `in_progress` (when proposal accepted)
- `in_progress` → `completed` (when project finished)
- Any state → `cancelled` (homeowner can cancel)

## Database Tables (Drizzle Schema)

1. `users` - Base user accounts (phone, user_type, language)
2. `homeowner_profiles` - Homeowner profiles
3. `designer_profiles` - Designer profiles with portfolio
4. `contractor_profiles` - Contractor profiles with trades
5. `properties` - Homeowner properties
6. `projects` - Interior projects
7. `project_requests` - Requests sent to designers
8. `proposals` - Designer proposals
9. `project_contractors` - Contractor assignments
10. `tasks` - Project tasks
11. `milestones` - Project milestones
12. `cost_estimates` - Budget breakdown
13. `activity_logs` - Project activity feed

## Important Decisions Made

### 1. ORM Strategy - Drizzle alongside Sequelize
- New Finishd tables use Drizzle
- Legacy Sequelize code still works
- Can migrate gradually

### 2. Framework - Keep Express
- Faster delivery vs. Fastify migration
- Can evaluate Fastify post-MVP

### 3. Auth - Phone OTP only
- No email/password for Finishd
- Mock SMS provider accepts "123456" in dev
- JWT access (15m) + refresh (7d) tokens

### 4. File Storage - Local filesystem
- `uploads/` directory for dev
- Abstract behind interface for S3 later

### 5. Typesense Integration
- Auto-indexes designers/contractors on create/update/verify
- Collections: finishd_designers, finishd_contractors
- Search supports filters: city, styles, budget, trades

## Quick Resume

### To Continue Implementation:

**Next Steps (Phase 3):**
1. Set up frontend with Vite + React + shadcn/ui
2. Configure TanStack Query for API calls
3. Set up Zustand for state management
4. Create base layout components

**Commands:**
```bash
# Start services
cd docker && docker-compose up -d

# Install dependencies
cd apps/backend && pnpm install

# Generate migrations
cd apps/backend && pnpm db:generate

# Run migrations
cd apps/backend && pnpm db:migrate

# Run backend
cd apps/backend && pnpm dev
```

### Current Priority

**HIGH PRIORITY (Continue):**
1. Frontend foundation (React + shadcn/ui)
2. Auth screens (OTP flow)
3. Onboarding screens

**MEDIUM PRIORITY:**
1. Designer/contractor browse screens
2. Project creation flow
3. Dashboard screens

**LOW PRIORITY:**
1. Testing
2. Seed data
3. Production deployment

## Environment Setup

### Required Services
- PostgreSQL (port 5432) - finishd/finishd123
- Redis (port 6379)
- Typesense (port 8108) - finishd-typesense-api-key

### Test Auth Flow
```bash
# Send OTP
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# Verify OTP (use 123456 in dev)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456"}'
```

### Test Project Flow
```bash
# Create project (with auth token)
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Living Room Renovation","scope":"partial"}'
```

## Notes

- Phone numbers stored in E.164 format (+91XXXXXXXXXX)
- Indian currency: ₹1,00,000 format
- Languages: en (English), hi (Hindi)
- Designers/contractors need admin verification
- isVerified=false until manually approved

---

**Document Status:** Active
**Last Updated:** 2026-01-28
**Next Update:** After setting up frontend foundation
