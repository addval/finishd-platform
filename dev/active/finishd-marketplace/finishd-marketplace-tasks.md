# Finishd Marketplace - Tasks

## Phase 1: Backend Foundation

### 1.1 Database Schema Setup
- [ ] Update docker-compose.yml to add Typesense service
- [ ] Set up Drizzle ORM configuration
- [ ] Create schema file with all tables:
  - [ ] users table (phone, user_type, language_preference)
  - [ ] homeowner_profiles table
  - [ ] designer_profiles table
  - [ ] contractor_profiles table
  - [ ] properties table
  - [ ] projects table
  - [ ] project_requests table
  - [ ] proposals table
  - [ ] project_contractors table
  - [ ] tasks table
  - [ ] milestones table
  - [ ] cost_estimates table
  - [ ] activity_logs table
- [ ] Create database indexes
- [ ] Generate and run migrations
- [ ] Test database connection and schema

### 1.2 Phone OTP Authentication
- [ ] Create auth routes (Fastify)
- [ ] Implement POST /api/v1/auth/send-otp
  - [ ] Validate phone number (10 digits)
  - [ ] Generate 6-digit OTP
  - [ ] Store OTP in Redis (5 min expiry)
  - [ ] Mock SMS provider (log OTP, accept "123456")
- [ ] Implement POST /api/v1/auth/verify-otp
  - [ ] Validate OTP from Redis
  - [ ] Create user if new
  - [ ] Generate JWT tokens
  - [ ] Return isNewUser flag
- [ ] Implement POST /api/v1/auth/logout
  - [ ] Invalidate tokens
- [ ] Create auth middleware for protected routes
- [ ] Write auth tests

### 1.3 User/Profile CRUD
- [ ] Create user routes
- [ ] GET /api/v1/users/me
- [ ] PATCH /api/v1/users/me (set user_type)
- [ ] Homeowner routes:
  - [ ] GET /api/v1/homeowners/me
  - [ ] PATCH /api/v1/homeowners/me
  - [ ] Properties CRUD
- [ ] Designer routes:
  - [ ] GET /api/v1/designers
  - [ ] GET /api/v1/designers/:id
  - [ ] GET /api/v1/designers/me
  - [ ] PATCH /api/v1/designers/me
- [ ] Contractor routes:
  - [ ] GET /api/v1/contractors
  - [ ] GET /api/v1/contractors/:id
  - [ ] GET /api/v1/contractors/me
  - [ ] PATCH /api/v1/contractors/me
- [ ] Write profile tests

### 1.4 File Upload
- [ ] Create upload route
- [ ] POST /api/v1/upload
- [ ] Configure multer for file handling
- [ ] Local storage for development
- [ ] Image validation (type, size)
- [ ] Return file URL
- [ ] Write upload tests

## Phase 2: Core Features

### 2.1 Typesense Search
- [ ] Configure Typesense client
- [ ] Create designers collection schema
- [ ] Create contractors collection schema
- [ ] Implement sync on create/update
- [ ] GET /api/v1/search/designers
  - [ ] Text search (name, bio, services)
  - [ ] Filter by city
  - [ ] Filter by budget range
  - [ ] Filter by styles
  - [ ] Pagination
- [ ] GET /api/v1/search/contractors
  - [ ] Text search (name, trades)
  - [ ] Filter by trades
  - [ ] Filter by service areas
  - [ ] Pagination
- [ ] Write search tests

### 2.2 Projects Module
- [ ] Create project routes
- [ ] GET /api/v1/projects (list my projects)
- [ ] POST /api/v1/projects (create project)
- [ ] GET /api/v1/projects/:id
- [ ] PATCH /api/v1/projects/:id
- [ ] Implement state machine:
  - [ ] draft → seeking_designer
  - [ ] seeking_designer → in_progress (on proposal accept)
  - [ ] in_progress → completed
  - [ ] any → cancelled
- [ ] Access control by user type
- [ ] Write project tests

### 2.3 Requests & Proposals
- [ ] Project requests:
  - [ ] POST /api/v1/projects/:id/requests (send to designer)
  - [ ] GET /api/v1/projects/:id/requests
  - [ ] GET /api/v1/projects/:id/requests/:requestId
- [ ] Proposals:
  - [ ] GET /api/v1/projects/:id/proposals
  - [ ] POST /api/v1/projects/:id/proposals (designer submits)
  - [ ] GET /api/v1/projects/:id/proposals/:proposalId
  - [ ] POST /api/v1/projects/:id/proposals/:proposalId/accept
  - [ ] POST /api/v1/projects/:id/proposals/:proposalId/reject
- [ ] Auto-assign designer on accept
- [ ] Update project state on accept
- [ ] Write request/proposal tests

### 2.4 Tasks, Milestones, Costs
- [ ] Tasks:
  - [ ] GET /api/v1/projects/:id/tasks
  - [ ] POST /api/v1/projects/:id/tasks
  - [ ] GET /api/v1/projects/:id/tasks/:taskId
  - [ ] PATCH /api/v1/projects/:id/tasks/:taskId
  - [ ] DELETE /api/v1/projects/:id/tasks/:taskId
- [ ] Milestones:
  - [ ] GET /api/v1/projects/:id/milestones
  - [ ] POST /api/v1/projects/:id/milestones
  - [ ] GET /api/v1/projects/:id/milestones/:milestoneId
  - [ ] PATCH /api/v1/projects/:id/milestones/:milestoneId
  - [ ] DELETE /api/v1/projects/:id/milestones/:milestoneId
  - [ ] POST /api/v1/projects/:id/milestones/:milestoneId/mark-paid
- [ ] Costs:
  - [ ] GET /api/v1/projects/:id/costs
  - [ ] POST /api/v1/projects/:id/costs
  - [ ] PATCH /api/v1/projects/:id/costs/:costId
  - [ ] DELETE /api/v1/projects/:id/costs/:costId
- [ ] Activity log:
  - [ ] GET /api/v1/projects/:id/activity
  - [ ] Log all changes automatically
- [ ] Write task/milestone/cost tests

### 2.5 Contractor Integration
- [ ] GET /api/v1/projects/:id/contractors
- [ ] POST /api/v1/projects/:id/contractors (invite)
- [ ] PATCH /api/v1/projects/:id/contractors/:contractorId
  - [ ] Submit quote
  - [ ] Accept/hire
  - [ ] Remove
- [ ] Contractor views:
  - [ ] GET /api/v1/contractors/me/invitations
  - [ ] GET /api/v1/contractors/me/assignments
- [ ] Write contractor integration tests

## Phase 3: Frontend Foundation

### 3.1 Design System
- [ ] Configure tailwind.config.ts with custom tokens
- [ ] Set up color scheme (primary, success, warning, error, status)
- [ ] Configure typography scale
- [ ] Set up spacing and radius tokens
- [ ] Initialize shadcn/ui
- [ ] Configure component aliases

### 3.2 Layout Components
- [ ] AppShell component
  - [ ] Main content area
  - [ ] Bottom navigation slot
  - [ ] User type-specific tabs
- [ ] BottomNavigation component
  - [ ] Homeowner tabs
  - [ ] Designer tabs
  - [ ] Contractor tabs
- [ ] ScreenHeader component
  - [ ] Back button
  - [ ] Title and subtitle
  - [ ] Right actions slot

### 3.3 Form Components
- [ ] PhoneInput component
  - [ ] Country code selector (+91 default)
  - [ ] 10-digit validation
  - [ ] Format display (XXXXX XXXXX)
- [ ] OTPInput component
  - [ ] 6 individual boxes
  - [ ] Auto-advance on input
  - [ ] Auto-submit option
- [ ] CurrencyInput component
  - [ ] ₹ prefix
  - [ ] Indian number format (lakhs/crores)
- [ ] ImageUploader component
  - [ ] Grid display
  - [ ] Add/remove
  - [ ] Min/max validation
- [ ] CounterInput component
  - [ ] Increment/decrement buttons
  - [ ] Min/max limits

### 3.4 Card Components
- [ ] DesignerCard component
  - [ ] Avatar, name, firm
  - [ ] Service areas, price
  - [ ] Style tags
  - [ ] Portfolio thumbnails
  - [ ] Action buttons
- [ ] ContractorCard component
  - [ ] Avatar, name
  - [ ] Trade badges
  - [ ] Experience, service areas
  - [ ] Work photos
  - [ ] Action buttons
- [ ] ProjectCard component
  - [ ] Title, status badge
  - [ ] Progress indicator
  - [ ] Next milestone
- [ ] ProposalCard component
  - [ ] Designer info
  - [ ] Timeline, cost
  - [ ] Submitted date

### 3.5 Feedback Components
- [ ] LoadingSkeleton component
  - [ ] Designer variant
  - [ ] Contractor variant
  - [ ] Project variant
- [ ] EmptyState component
  - [ ] Icon, title, description
  - [ ] Optional action button
- [ ] ConfirmDialog component
  - [ ] Title, description
  - [ ] Confirm/cancel buttons
  - [ ] Destructive variant
- [ ] StatusBadge component
  - [ ] Project status colors
  - [ ] Proposal status colors
  - [ ] Contractor status colors

## Phase 4: Frontend Screens

### 4.1 Auth Flow
- [ ] WelcomeScreen
  - [ ] Logo, tagline
  - [ ] Language toggle
  - [ ] Get started button
- [ ] PhoneEntryScreen
  - [ ] Phone input
  - [ ] Terms text
  - [ ] Continue button
- [ ] OTPScreen
  - [ ] OTP input
  - [ ] Resend timer
  - [ ] Verify button
- [ ] UserTypeSelectionScreen
  - [ ] Three selection cards
  - [ ] Continue button

### 4.2 Onboarding
- [ ] HomeownerOnboarding (3 steps)
  - [ ] Step 1: Profile (name, email)
  - [ ] Step 2: Location (city, locality)
  - [ ] Step 3: Property (type, size, rooms)
- [ ] DesignerOnboarding (4 steps)
  - [ ] Step 1: Profile (photo, name, firm, bio)
  - [ ] Step 2: Services (multi-select)
  - [ ] Step 3: Location & pricing
  - [ ] Step 4: Portfolio (min 3 photos)
- [ ] ContractorOnboarding (3 steps)
  - [ ] Step 1: Profile (photo, name, experience)
  - [ ] Step 2: Skills (trades, service areas)
  - [ ] Step 3: Work photos (min 2)
- [ ] VerificationPendingScreen (designer/contractor)

### 4.3 Home Screens
- [ ] HomeownerHomeScreen
  - [ ] Greeting header
  - [ ] Active projects section
  - [ ] Empty state
  - [ ] Quick actions
  - [ ] Recommended designers
- [ ] DesignerHomeScreen
  - [ ] Greeting header
  - [ ] Verification banner
  - [ ] Stats cards
  - [ ] New requests
  - [ ] Active projects
- [ ] ContractorHomeScreen
  - [ ] Greeting header
  - [ ] Verification banner
  - [ ] Stats cards
  - [ ] Invitations
  - [ ] Active work

### 4.4 Browse & Search
- [ ] BrowseDesignersScreen
  - [ ] Search bar
  - [ ] Filter chips
  - [ ] Results count
  - [ ] Designer list
  - [ ] Empty state
  - [ ] Infinite scroll
- [ ] DesignerProfileScreen
  - [ ] Profile header
  - [ ] Stats row
  - [ ] Bio section
  - [ ] Services section
  - [ ] Portfolio gallery
  - [ ] Sticky CTA
- [ ] BrowseContractorsScreen
  - [ ] Search bar
  - [ ] Trade filter
  - [ ] Contractor list
- [ ] ContractorProfileScreen
  - [ ] Profile header
  - [ ] Skills section
  - [ ] Work photos
  - [ ] Invite CTA

### 4.5 Request Proposal Flow
- [ ] RequestProposal Step 1 (Select Property)
- [ ] RequestProposal Step 2 (Scope)
- [ ] RequestProposal Step 3 (Details)
- [ ] RequestSentSuccess

### 4.6 Project Detail
- [ ] ProjectDetailScreen
  - [ ] Status banner
  - [ ] Tab navigation
- [ ] OverviewTab
  - [ ] Progress card
  - [ ] Project info
  - [ ] Upcoming section
  - [ ] Recent activity
- [ ] TasksTab
  - [ ] Filter bar
  - [ ] Task list
  - [ ] Add task button
- [ ] MilestonesTab
  - [ ] Timeline view
  - [ ] Payment status
  - [ ] Mark as paid
- [ ] CostsTab
  - [ ] Budget summary
  - [ ] Cost breakdown
- [ ] TeamTab
  - [ ] Designer section
  - [ ] Contractors section

### 4.7 Proposals
- [ ] ProposalsListScreen
- [ ] ProposalDetailScreen
- [ ] CreateProposalFlow (designer)

### 4.8 Contractor Flows
- [ ] InvitationDetailScreen
- [ ] QuoteSubmissionForm
- [ ] MyAssignmentsScreen

### 4.9 Profile & Settings
- [ ] ProfileScreen (all types)
- [ ] SettingsSheet
- [ ] LanguageSwitcher
- [ ] NotificationsScreen

## Phase 5: Testing & Polish

### 5.1 Backend Tests
- [ ] Auth service unit tests
- [ ] User service unit tests
- [ ] Project service unit tests
- [ ] API integration tests
- [ ] Verify 80%+ coverage

### 5.2 Frontend Tests
- [ ] Form component tests
- [ ] Card component tests
- [ ] Screen integration tests
- [ ] Auth flow tests

### 5.3 E2E Tests
- [ ] Homeowner: Sign up → Browse → Request → View proposal
- [ ] Designer: Sign up → Onboard → Receive request → Submit proposal
- [ ] Contractor: Sign up → Onboard → Receive invite → Submit quote
- [ ] Project management flow

### 5.4 Seed Data
- [ ] Create seed script
- [ ] 10 homeowners with properties
- [ ] 6 designers (4 verified, 2 unverified)
  - [ ] Realistic names, bios
  - [ ] Portfolio images from Unsplash
  - [ ] Various price ranges
  - [ ] Different styles
- [ ] 4 contractors
  - [ ] Different trades
  - [ ] Various experience levels
- [ ] Projects in all states:
  - [ ] 2 draft
  - [ ] 2 seeking_designer (with requests/proposals)
  - [ ] 3 in_progress (with tasks, milestones, contractors, costs)
  - [ ] 1 completed
- [ ] Activity log entries

### 5.5 i18n
- [ ] Set up react-i18next
- [ ] Create en.json translation file
- [ ] Create hi.json translation file
- [ ] Implement language switcher
- [ ] Test all screens in Hindi

## Completion Checklist

- [ ] All API endpoints working
- [ ] All frontend screens functional
- [ ] Search returns results < 100ms
- [ ] Tests passing with 80%+ coverage
- [ ] Seed data populates successfully
- [ ] English/Hindi switching works
- [ ] Mobile responsive design
- [ ] Accessibility requirements met
