# Finishd — User Flows

**Version:** 1.0  
**Last Updated:** January 2025  
**Related Document:** PRD v1.0

---

## Table of Contents

1. [Authentication Flows](#1-authentication-flows)
2. [Homeowner Flows](#2-homeowner-flows)
3. [Designer Flows](#3-designer-flows)
4. [Contractor Flows](#4-contractor-flows)
5. [Shared Flows](#5-shared-flows)
6. [State Definitions](#6-state-definitions)
7. [Error States & Edge Cases](#7-error-states--edge-cases)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [Analytics Events](#9-analytics-events)
10. [Internationalization](#10-internationalization-i18n)

---

## 1. Authentication Flows

### 1.1 Sign Up / Sign In (All Users)

**Entry Point:** App launch or "Get Started" button

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Welcome                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Logo                                                          │
│ - Tagline: "From bare walls to finished interiors"              │
│ - [Get Started] button (primary)                                │
│ - [I already have an account] link                              │
│ - Language toggle (EN / हिंदी)                                   │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Get Started] → Phone Entry screen                            │
│ - [I already have an account] → Phone Entry screen              │
│ - Language toggle → Update app language, persist preference     │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Phone Entry                                             │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Back button                                                   │
│ - Title: "Enter your phone number"                              │
│ - Subtitle: "We'll send you a verification code"                │
│ - Country code selector (default: +91)                          │
│ - Phone number input (10 digits)                                │
│ - [Continue] button (disabled until valid phone)                │
│ - Terms text: "By continuing, you agree to our Terms of         │
│   Service and Privacy Policy"                                   │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - Phone must be 10 digits                                       │
│ - Show inline error for invalid format                          │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Continue] → API: POST /auth/send-otp                         │
│   - On success → OTP Entry screen                               │
│   - On error → Show error toast, stay on screen                 │
│ - Back → Welcome screen                                         │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: OTP Entry                                               │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Back button                                                   │
│ - Title: "Verify your number"                                   │
│ - Subtitle: "Enter the 6-digit code sent to +91 XXXXX XXXXX"    │
│ - 6 individual OTP input boxes (auto-advance on input)          │
│ - Resend timer: "Resend code in 0:30"                           │
│ - [Resend Code] link (enabled after timer)                      │
│ - [Verify] button (disabled until 6 digits entered)             │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - OTP must be 6 digits                                          │
│ - Auto-submit when 6 digits entered (optional UX choice)        │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Verify] → API: POST /auth/verify-otp                         │
│   - If new user → User Type Selection screen                    │
│   - If existing user → Home screen (based on user type)         │
│   - If invalid OTP → Show error, clear inputs                   │
│ - [Resend Code] → API: POST /auth/send-otp, reset timer         │
│ - Back → Phone Entry screen                                     │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼ (new user only)
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: User Type Selection                                     │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Title: "How will you use Finishd?"                            │
│ - Three selection cards:                                        │
│   1. Homeowner                                                  │
│      Icon: 🏠                                                   │
│      Description: "I want to design and build my home"          │
│   2. Interior Designer                                          │
│      Icon: 🎨                                                   │
│      Description: "I design interiors for clients"              │
│   3. Contractor / Technician                                    │
│      Icon: 🔧                                                   │
│      Description: "I provide construction services"             │
│ - [Continue] button (disabled until selection)                  │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - Select card → Highlight selected, enable Continue             │
│ - [Continue] → API: PATCH /users/me (set user_type)             │
│   - Homeowner → Homeowner Onboarding                            │
│   - Designer → Designer Onboarding                              │
│   - Contractor → Contractor Onboarding                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Homeowner Flows

### 2.1 Homeowner Onboarding

**Entry Point:** After user type selection (new homeowner)

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Homeowner Onboarding - Step 1 (Profile)                 │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 1 of 3                               │
│ - Title: "Let's set up your profile"                            │
│ - Full name input (required)                                    │
│ - Email input (optional)                                        │
│ - [Continue] button                                             │
│ - [Skip for now] link                                           │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - Name: minimum 2 characters                                    │
│ - Email: valid format if provided                               │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Continue] → Save to local state → Step 2                     │
│ - [Skip for now] → Step 2 (name defaults to "Homeowner")        │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Homeowner Onboarding - Step 2 (Location)                │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 2 of 3                               │
│ - Title: "Where is your property?"                              │
│ - City dropdown (Delhi NCR, Chandigarh Tricity)                 │
│ - Locality/Area input (autocomplete from known areas)           │
│ - [Continue] button                                             │
│ - [Back] link                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - City: required                                                │
│ - Locality: required, minimum 3 characters                      │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Continue] → Save to local state → Step 3                     │
│ - [Back] → Step 1                                               │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Homeowner Onboarding - Step 3 (Property)                │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 3 of 3                               │
│ - Title: "Tell us about your property"                          │
│ - Property type selector (Apartment / House / Villa)            │
│ - Size input (sq ft) - optional                                 │
│ - Room configuration (optional):                                │
│   - Bedrooms: counter (1-6)                                     │
│   - Bathrooms: counter (1-4)                                    │
│   - Living areas: counter (1-3)                                 │
│ - [Finish Setup] button                                         │
│ - [Back] link                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - Property type: required                                       │
│ - Size: if provided, must be positive number                    │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Finish Setup] →                                              │
│   - API: PATCH /homeowners/me (profile data)                    │
│   - API: POST /homeowners/me/properties (property data)         │
│   - On success → Homeowner Home screen                          │
│ - [Back] → Step 2                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Homeowner Home Screen

**Entry Point:** After onboarding or app launch (authenticated homeowner)

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Homeowner Home                                          │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│                                                                 │
│ [Header]                                                        │
│ - Greeting: "Hello, {name}"                                     │
│ - Location badge: "{city}"                                      │
│ - Notification bell icon (with badge count if any)              │
│                                                                 │
│ [Active Projects Section] (if projects exist)                   │
│ - Section title: "Your Projects"                                │
│ - Horizontal scrollable project cards:                          │
│   - Project title                                               │
│   - Status badge (Draft / In Progress / etc.)                   │
│   - Progress indicator (tasks completed / total)                │
│   - Next milestone date                                         │
│ - [View All] link → Projects tab                                │
│                                                                 │
│ [Empty State] (if no projects)                                  │
│ - Illustration                                                  │
│ - Title: "Start your home journey"                              │
│ - Subtitle: "Find designers and contractors to transform        │
│   your space"                                                   │
│ - [Find a Designer] button (primary)                            │
│ - [Browse Contractors] button (secondary)                       │
│                                                                 │
│ [Quick Actions Section]                                         │
│ - Grid of action cards:                                         │
│   - "Find Designers" → Designers tab                            │
│   - "Find Contractors" → Contractors tab                        │
│   - "Post Requirement" → Create Project flow                    │
│   - "Get Cost Estimate" → Cost Calculator (future)              │
│                                                                 │
│ [Recommended Designers Section]                                 │
│ - Section title: "Top Designers in {city}"                      │
│ - Horizontal scrollable designer cards:                         │
│   - Profile photo                                               │
│   - Name                                                        │
│   - Specialty tags (2 max)                                      │
│   - Starting price                                              │
│ - [See All] link → Designers tab                                │
│                                                                 │
│ [Bottom Navigation]                                             │
│ - Home (active)                                                 │
│ - Designers                                                     │
│ - Contractors                                                   │
│ - Projects                                                      │
│ - Profile                                                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Data Requirements:                                              │
│ - API: GET /users/me (user profile)                             │
│ - API: GET /projects (homeowner's projects)                     │
│ - API: GET /designers?city={city}&limit=5 (recommended)         │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - Tap project card → Project Detail screen                      │
│ - Tap designer card → Designer Profile screen                   │
│ - Tap quick action → Navigate to respective screen              │
│ - Tap notification bell → Notifications screen                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Browse Designers

**Entry Point:** Designers tab or "Find Designers" action

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Browse Designers                                        │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│                                                                 │
│ [Header]                                                        │
│ - Title: "Designers"                                            │
│ - Search icon → Expand search bar                               │
│                                                                 │
│ [Search Bar] (when expanded)                                    │
│ - Text input: "Search by name or specialty"                     │
│ - Clear button (when text present)                              │
│                                                                 │
│ [Filter Bar]                                                    │
│ - Horizontal scrollable filter chips:                           │
│   - Location (dropdown): All / Specific locality                │
│   - Budget (dropdown): Any / Under ₹50k / ₹50k-1L / ₹1L-2L / 2L+│
│   - Style (multi-select): Modern / Traditional / Minimalist /   │
│     Contemporary / Luxury                                       │
│   - Availability (toggle): Available now                        │
│ - [Filters] button → Full filter sheet                          │
│                                                                 │
│ [Results Count]                                                 │
│ - "{n} designers found"                                         │
│                                                                 │
│ [Designer List]                                                 │
│ - Vertical list of designer cards:                              │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Profile Photo]  Name                                   │   │
│   │                  Firm Name (if any)                     │   │
│   │                  ★ 4.5 (23 reviews) — future            │   │
│   │                  📍 Service areas                       │   │
│   │                  💰 Starting from ₹XX,XXX               │   │
│   │                                                         │   │
│   │  [Tag] [Tag] [Tag]                                      │   │
│   │                                                         │   │
│   │  Portfolio preview (3 thumbnail images)                 │   │
│   │                                                         │   │
│   │  [View Profile]                     [Request Proposal]  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ [Empty State] (if no results)                                   │
│ - Illustration                                                  │
│ - "No designers found matching your criteria"                   │
│ - [Clear Filters] button                                        │
│                                                                 │
│ [Loading State]                                                 │
│ - Skeleton cards (3-4)                                          │
│                                                                 │
│ [Pagination]                                                    │
│ - Infinite scroll with loading indicator                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Data Requirements:                                              │
│ - API: GET /search/designers                                    │
│   - Query params: q, city, locality, budget_min, budget_max,    │
│     styles[], available, page, limit                            │
│ - Uses Typesense for search                                     │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - Tap designer card → Designer Profile screen                   │
│ - [View Profile] → Designer Profile screen                      │
│ - [Request Proposal] → Request Proposal sheet                   │
│ - Apply filter → Re-fetch with filters                          │
│ - Search input → Debounced search (300ms)                       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Designer Profile

**Entry Point:** Tap on designer card from browse or recommendations

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Designer Profile                                        │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│                                                                 │
│ [Header]                                                        │
│ - Back button                                                   │
│ - Share icon                                                    │
│ - Bookmark icon (save designer)                                 │
│                                                                 │
│ [Profile Header]                                                │
│ - Large profile photo                                           │
│ - Name                                                          │
│ - Firm name (if any)                                            │
│ - Verified badge (if verified)                                  │
│ - Location: "Serves {cities}"                                   │
│                                                                 │
│ [Stats Row]                                                     │
│ - Projects completed: "XX Projects"                             │
│ - Experience: "X years"                                         │
│ - Starting price: "From ₹XX,XXX"                                │
│                                                                 │
│ [Bio Section]                                                   │
│ - Section title: "About"                                        │
│ - Bio text (expandable if long)                                 │
│ - [Read more] link if truncated                                 │
│                                                                 │
│ [Services Section]                                              │
│ - Section title: "Services"                                     │
│ - List of services with icons:                                  │
│   - Full home interiors                                         │
│   - Kitchen design                                              │
│   - Bedroom design                                              │
│   - Living room design                                          │
│   - Bathroom design                                             │
│   - Office interiors                                            │
│                                                                 │
│ [Portfolio Section]                                             │
│ - Section title: "Portfolio"                                    │
│ - Grid of portfolio images (tap to enlarge)                     │
│ - [View All] if more than 6 images                              │
│                                                                 │
│ [Service Areas Section]                                         │
│ - Section title: "Service Areas"                                │
│ - List of localities/areas served                               │
│                                                                 │
│ [Sticky Bottom CTA]                                             │
│ - Designer name + price                                         │
│ - [Request Proposal] button (primary, full width)               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Data Requirements:                                              │
│ - API: GET /designers/:id                                       │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Request Proposal] → Request Proposal flow                    │
│ - Tap portfolio image → Full screen gallery                     │
│ - Share → Native share sheet                                    │
│ - Bookmark → API: POST /homeowners/me/saved-designers/:id       │
│ - Back → Previous screen                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Request Proposal Flow

**Entry Point:** "Request Proposal" from designer profile or browse

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Request Proposal - Step 1 (Select Property)             │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Header: "Request Proposal"                                    │
│ - Close button (X)                                              │
│ - Progress: Step 1 of 3                                         │
│                                                                 │
│ - Title: "Which property is this for?"                          │
│                                                                 │
│ [Property Cards] (if properties exist)                          │
│ - Radio selection cards for each property:                      │
│   - Property type icon                                          │
│   - Address                                                     │
│   - Size (if available)                                         │
│ - [+ Add New Property] card                                     │
│                                                                 │
│ [No Properties State]                                           │
│ - "You haven't added any properties yet"                        │
│ - [+ Add Property] button                                       │
│                                                                 │
│ - [Continue] button (disabled until selection)                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - Select property → Enable Continue                             │
│ - [+ Add New Property] → Add Property sheet (inline)            │
│ - [Continue] → Step 2                                           │
│ - Close → Confirm discard, return to previous screen            │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Request Proposal - Step 2 (Scope)                       │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Header: "Request Proposal"                                    │
│ - Back button                                                   │
│ - Progress: Step 2 of 3                                         │
│                                                                 │
│ - Title: "What do you need designed?"                           │
│                                                                 │
│ [Scope Selection]                                               │
│ - Radio: "Full home interior"                                   │
│ - Radio: "Specific rooms/areas"                                 │
│                                                                 │
│ [Room Selection] (if "Specific rooms" selected)                 │
│ - Checkbox grid:                                                │
│   - [ ] Living Room                                             │
│   - [ ] Master Bedroom                                          │
│   - [ ] Bedroom 2                                               │
│   - [ ] Bedroom 3                                               │
│   - [ ] Kitchen                                                 │
│   - [ ] Bathroom(s)                                             │
│   - [ ] Dining Area                                             │
│   - [ ] Balcony                                                 │
│   - [ ] Study/Office                                            │
│   - [ ] Other (text input appears)                              │
│                                                                 │
│ - [Continue] button                                             │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - If "Specific rooms": at least one room selected               │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Continue] → Step 3                                           │
│ - Back → Step 1                                                 │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Request Proposal - Step 3 (Details)                     │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Header: "Request Proposal"                                    │
│ - Back button                                                   │
│ - Progress: Step 3 of 3                                         │
│                                                                 │
│ - Title: "A few more details"                                   │
│                                                                 │
│ [Budget Range]                                                  │
│ - Label: "What's your budget?"                                  │
│ - Dual slider or dropdown:                                      │
│   - Min: ₹50,000 to ₹50,00,000                                  │
│   - Max: ₹50,000 to ₹50,00,000                                  │
│ - Quick select chips: "Under ₹2L" / "₹2-5L" / "₹5-10L" / "₹10L+"│
│                                                                 │
│ [Timeline]                                                      │
│ - Label: "When do you want to start?"                           │
│ - Radio options:                                                │
│   - Immediately                                                 │
│   - Within 1 month                                              │
│   - 1-3 months                                                  │
│   - 3+ months                                                   │
│   - Not sure yet                                                │
│                                                                 │
│ [Additional Notes]                                              │
│ - Label: "Anything else the designer should know?"              │
│ - Textarea (optional)                                           │
│ - Placeholder: "Style preferences, specific requirements..."    │
│ - Character count: "0/500"                                      │
│                                                                 │
│ - [Send Request] button (primary)                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - Budget: min < max                                             │
│ - Timeline: required selection                                  │
│ - Notes: max 500 characters                                     │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Send Request] →                                              │
│   - API: POST /projects (create project if needed)              │
│   - API: POST /projects/:id/requests (send to designer)         │
│   - On success → Success screen                                 │
│   - On error → Show error, stay on screen                       │
│ - Back → Step 2                                                 │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Request Sent Success                                    │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Success illustration / animation                              │
│ - Title: "Request Sent!"                                        │
│ - Subtitle: "{Designer name} will review your request and       │
│   send a proposal soon"                                         │
│ - [View Project] button (primary)                               │
│ - [Browse More Designers] button (secondary)                    │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [View Project] → Project Detail screen                        │
│ - [Browse More Designers] → Designers tab                       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 View & Compare Proposals

**Entry Point:** Project detail or notification

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Proposals List                                          │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Header: "Proposals"                                           │
│ - Back button                                                   │
│ - Project title subtitle                                        │
│                                                                 │
│ [Pending Requests Section] (if any)                             │
│ - Title: "Awaiting Response ({n})"                              │
│ - Compact cards showing designers who haven't responded         │
│                                                                 │
│ [Proposals Section]                                             │
│ - Title: "Proposals Received ({n})"                             │
│ - Proposal cards:                                               │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Designer Photo]  Designer Name                         │   │
│   │                   Firm Name                             │   │
│   │                   Submitted: "2 days ago"               │   │
│   │                                                         │   │
│   │  Timeline: X weeks                                      │   │
│   │  Cost: ₹X,XX,XXX                                        │   │
│   │                                                         │   │
│   │  [View Details]                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ [Empty State]                                                   │
│ - "No proposals yet"                                            │
│ - "Designers typically respond within 2-3 days"                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Data Requirements:                                              │
│ - API: GET /projects/:id/requests                               │
│ - API: GET /projects/:id/proposals                              │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - Tap proposal card → Proposal Detail screen                    │
│ - Back → Project Detail                                         │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Proposal Detail                                         │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Header: "Proposal"                                            │
│ - Back button                                                   │
│                                                                 │
│ [Designer Info Card]                                            │
│ - Photo, name, firm                                             │
│ - [View Profile] link                                           │
│                                                                 │
│ [Scope Section]                                                 │
│ - Title: "Scope of Work"                                        │
│ - Description text                                              │
│                                                                 │
│ [Approach Section]                                              │
│ - Title: "Design Approach"                                      │
│ - Description text                                              │
│                                                                 │
│ [Timeline Section]                                              │
│ - Title: "Timeline"                                             │
│ - "{X} weeks"                                                   │
│ - Phase breakdown (if provided)                                 │
│                                                                 │
│ [Cost Section]                                                  │
│ - Title: "Cost Estimate"                                        │
│ - Total: ₹X,XX,XXX                                              │
│ - Breakdown table:                                              │
│   - Design fees: ₹XX,XXX                                        │
│   - Estimated labor: ₹X,XX,XXX                                  │
│   - Estimated materials: ₹X,XX,XXX                              │
│   - Other: ₹XX,XXX                                              │
│ - Note: "Final costs may vary based on material selection"      │
│                                                                 │
│ [Sticky Bottom CTAs]                                            │
│ - [Reject] button (secondary/outline)                           │
│ - [Accept Proposal] button (primary)                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Data Requirements:                                              │
│ - API: GET /projects/:projectId/proposals/:proposalId           │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Accept Proposal] → Confirm dialog →                          │
│   API: POST /proposals/:id/accept                               │
│   - On success → Project Detail (with designer assigned)        │
│ - [Reject] → Confirm dialog with optional reason →              │
│   - API: PATCH /proposals/:id (status: rejected)                │
│   - Return to Proposals List                                    │
│ - [View Profile] → Designer Profile screen                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.7 Project Detail & Management

**Entry Point:** Projects tab or project card tap

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Project Detail                                          │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│                                                                 │
│ [Header]                                                        │
│ - Back button                                                   │
│ - Project title                                                 │
│ - More menu (⋮): Edit project, Cancel project                   │
│                                                                 │
│ [Status Banner]                                                 │
│ - Current status with color coding:                             │
│   - Draft (gray)                                                │
│   - Seeking Designer (blue)                                     │
│   - In Progress (green)                                         │
│   - Completed (purple)                                          │
│ - Status-specific message                                       │
│                                                                 │
│ [Tab Navigation]                                                │
│ - Overview | Tasks | Milestones | Costs | Team                  │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ [TAB: Overview]                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ [Progress Card]                                                 │
│ - Circular progress indicator                                   │
│ - "X of Y tasks completed"                                      │
│ - "X of Y milestones reached"                                   │
│                                                                 │
│ [Project Info]                                                  │
│ - Property: address                                             │
│ - Scope: Full home / Specific rooms                             │
│ - Budget: ₹X - ₹Y                                               │
│ - Timeline: X weeks                                             │
│                                                                 │
│ [Upcoming Section]                                              │
│ - Next milestone with date                                      │
│ - Next 3 tasks due                                              │
│                                                                 │
│ [Recent Activity]                                               │
│ - Last 5 activity items with timestamps                         │
│ - [View All Activity] link                                      │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ [TAB: Tasks]                                                    │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ [Filter Bar]                                                    │
│ - Status filter: All / To Do / In Progress / Completed          │
│ - Assignee filter: All / Unassigned / {team members}            │
│                                                                 │
│ [Task List]                                                     │
│ - Grouped by status or due date                                 │
│ - Task cards:                                                   │
│   - Checkbox (tap to complete)                                  │
│   - Task title                                                  │
│   - Assignee avatar                                             │
│   - Due date (color coded if overdue)                           │
│   - Tap → Task Detail sheet                                     │
│                                                                 │
│ [+ Add Task] FAB (for designer/homeowner)                       │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ [TAB: Milestones]                                               │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ [Timeline View]                                                 │
│ - Vertical timeline with milestone nodes                        │
│ - Each milestone:                                               │
│   - Status indicator (pending/completed)                        │
│   - Title                                                       │
│   - Target date                                                 │
│   - Payment amount                                              │
│   - Payment status badge (Not Paid / Paid)                      │
│   - [Mark as Paid] button (homeowner only, if not paid)         │
│                                                                 │
│ [+ Add Milestone] (designer only)                               │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ [TAB: Costs]                                                    │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ [Budget Summary Card]                                           │
│ - Total Budget: ₹X,XX,XXX                                       │
│ - Estimated: ₹X,XX,XXX                                          │
│ - Actual Spent: ₹X,XX,XXX                                       │
│ - Remaining: ₹X,XX,XXX                                          │
│ - Visual bar comparing estimate vs actual                       │
│                                                                 │
│ [Cost Breakdown]                                                │
│ - Expandable sections by category:                              │
│   - Design Fees                                                 │
│   - Labor                                                       │
│   - Materials (placeholder for V2)                              │
│   - Miscellaneous                                               │
│ - Each line item shows estimate vs actual                       │
│                                                                 │
│ [+ Add Cost Item] (designer only)                               │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│ [TAB: Team]                                                     │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ [Designer Section]                                              │
│ - Designer card (if assigned)                                   │
│ - OR "No designer assigned" + [Find Designer] button            │
│                                                                 │
│ [Contractors Section]                                           │
│ - List of hired contractors                                     │
│ - Each card:                                                    │
│   - Photo, name, trade                                          │
│   - Status: Invited / Hired / Completed                         │
│   - [View Profile] / [Remove] actions                           │
│ - [+ Add Contractor] button → Contractor browse                 │
│                                                                 │
│ [Pending Invitations]                                           │
│ - Contractors invited but not yet confirmed                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Data Requirements:                                              │
│ - API: GET /projects/:id                                        │
│ - API: GET /projects/:id/tasks                                  │
│ - API: GET /projects/:id/milestones                             │
│ - API: GET /projects/:id/costs                                  │
│ - API: GET /projects/:id/contractors                            │
│ - API: GET /projects/:id/activity                               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.8 Browse & Hire Contractors

**Entry Point:** Contractors tab or "Add Contractor" from project

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Browse Contractors                                      │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│                                                                 │
│ [Header]                                                        │
│ - Title: "Contractors"                                          │
│ - Search icon                                                   │
│                                                                 │
│ [Search Bar] (when expanded)                                    │
│ - Text input: "Search by name or skill"                         │
│                                                                 │
│ [Filter Bar]                                                    │
│ - Trade filter (multi-select):                                  │
│   - All                                                         │
│   - Electrician                                                 │
│   - Plumber                                                     │
│   - Mason                                                       │
│   - Carpenter                                                   │
│   - Painter                                                     │
│   - General Contractor                                          │
│ - Location filter                                               │
│ - Availability filter                                           │
│                                                                 │
│ [Results Count]                                                 │
│ - "{n} contractors found"                                       │
│                                                                 │
│ [Contractor List]                                               │
│ - Contractor cards:                                             │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [Photo]  Name                                           │   │
│   │          Trade badges: [Electrician] [Plumber]          │   │
│   │          📍 Service area                                │   │
│   │          🛠️ X years experience                          │   │
│   │          ✓ Verified (if verified)                       │   │
│   │                                                         │   │
│   │  Work photos (3 thumbnails)                             │   │
│   │                                                         │   │
│   │  [View Profile]              [Invite to Project]        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Data Requirements:                                              │
│ - API: GET /search/contractors                                  │
│   - Query params: q, trades[], city, locality, available        │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [View Profile] → Contractor Profile screen                    │
│ - [Invite to Project] → Project selection sheet (if multiple)   │
│   → Confirm invite → API: POST /projects/:id/contractors        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Designer Flows

### 3.1 Designer Onboarding

**Entry Point:** After user type selection (new designer)

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Designer Onboarding - Step 1 (Profile)                  │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 1 of 4                               │
│ - Title: "Set up your designer profile"                         │
│ - Profile photo upload (camera/gallery)                         │
│ - Full name input (required)                                    │
│ - Firm/Studio name input (optional)                             │
│ - Bio textarea (required, min 50 chars)                         │
│ - [Continue] button                                             │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - Name: required, min 2 chars                                   │
│ - Bio: required, min 50 chars, max 500 chars                    │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - Upload photo → Image picker → Crop → Upload to storage        │
│ - [Continue] → Step 2                                           │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Designer Onboarding - Step 2 (Services)                 │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 2 of 4                               │
│ - Title: "What services do you offer?"                          │
│ - Multi-select checkbox grid:                                   │
│   - [ ] Full Home Interiors                                     │
│   - [ ] Living Room Design                                      │
│   - [ ] Bedroom Design                                          │
│   - [ ] Kitchen Design                                          │
│   - [ ] Bathroom Design                                         │
│   - [ ] Office/Study Design                                     │
│   - [ ] Modular Furniture                                       │
│   - [ ] Renovation/Remodeling                                   │
│   - [ ] Space Planning                                          │
│   - [ ] 3D Visualization                                        │
│ - [Continue] button                                             │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - At least one service selected                                 │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Continue] → Step 3                                           │
│ - [Back] → Step 1                                               │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Designer Onboarding - Step 3 (Location & Pricing)       │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 3 of 4                               │
│ - Title: "Where do you work and your pricing?"                  │
│                                                                 │
│ [Service Cities]                                                │
│ - Label: "Cities you serve"                                     │
│ - Multi-select: Delhi NCR, Chandigarh Tricity                   │
│                                                                 │
│ [Pricing]                                                       │
│ - Label: "Starting price for full home interior"                │
│ - Number input with ₹ prefix                                    │
│                                                                 │
│ - [Continue] button                                             │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - At least one city selected                                    │
│ - Starting price: required, positive number                     │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Continue] → Step 4                                           │
│ - [Back] → Step 2                                               │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Designer Onboarding - Step 4 (Portfolio)                │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 4 of 4                               │
│ - Title: "Show off your work"                                   │
│ - Subtitle: "Upload at least 3 photos of your best projects"    │
│                                                                 │
│ [Photo Grid]                                                    │
│ - Upload slots (minimum 3, maximum 20)                          │
│ - [+ Add Photo] button for each empty slot                      │
│ - Uploaded photos with [X] remove button                        │
│                                                                 │
│ - [Finish Setup] button                                         │
├─────────────────────────────────────────────────────────────────┤
│ Validation:                                                     │
│ - Minimum 3 photos uploaded                                     │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Finish Setup] →                                              │
│   - API: PATCH /designers/me (all profile data)                 │
│   - On success → Verification Pending screen                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Designer Home Screen

**Entry Point:** App launch (authenticated designer)

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Designer Home                                           │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│                                                                 │
│ [Header]                                                        │
│ - Greeting: "Hello, {name}"                                     │
│ - Notification bell                                             │
│                                                                 │
│ [Verification Banner] (if not verified)                         │
│ - Yellow banner: "Profile under review"                         │
│ - "You'll receive project requests once verified"               │
│                                                                 │
│ [Stats Cards Row]                                               │
│ - Active Projects: X                                            │
│ - Pending Requests: X                                           │
│ - This Month Earnings: ₹X,XX,XXX                                │
│                                                                 │
│ [New Requests Section]                                          │
│ - Title: "New Project Requests"                                 │
│ - Request cards (max 3)                                         │
│ - [View All Requests] link                                      │
│                                                                 │
│ [Active Projects Section]                                       │
│ - Title: "Your Active Projects"                                 │
│ - Project cards (horizontal scroll)                             │
│ - [View All] link                                               │
│                                                                 │
│ [Bottom Navigation]                                             │
│ - Home (active)                                                 │
│ - Requests                                                      │
│ - Projects                                                      │
│ - Profile                                                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Data Requirements:                                              │
│ - API: GET /designers/me                                        │
│ - API: GET /projects?role=designer                              │
│ - API: GET /projects/requests?status=pending                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Create Proposal

**Entry Point:** "Submit Proposal" from request detail

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Create Proposal - Step 1 (Scope)                        │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Header: "Create Proposal"                                     │
│ - Progress: Step 1 of 3                                         │
│ - Title: "Define the scope of work"                             │
│ - Scope description textarea (required, min 100 chars)          │
│ - [Continue] button                                             │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Create Proposal - Step 2 (Approach & Timeline)          │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress: Step 2 of 3                                         │
│ - Design approach textarea (required)                           │
│ - Timeline input (weeks)                                        │
│ - Phase breakdown (optional)                                    │
│ - [Continue] button                                             │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Create Proposal - Step 3 (Cost Estimate)                │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress: Step 3 of 3                                         │
│ - Homeowner budget reference                                    │
│ - Cost breakdown inputs:                                        │
│   - Design Fees                                                 │
│   - Estimated Labor                                             │
│   - Estimated Materials                                         │
│   - Other                                                       │
│ - Total (calculated)                                            │
│ - Notes textarea                                                │
│ - [Submit Proposal] button                                      │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Submit Proposal] → API: POST /projects/:id/proposals         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Contractor Flows

### 4.1 Contractor Onboarding

**Entry Point:** After user type selection (new contractor)

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Contractor Onboarding - Step 1 (Profile)                │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 1 of 3                               │
│ - Profile photo upload                                          │
│ - Full name input (required)                                    │
│ - Years of experience input (required)                          │
│ - [Continue] button                                             │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Contractor Onboarding - Step 2 (Skills)                 │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 2 of 3                               │
│ - Trade multi-select:                                           │
│   - Electrician, Plumber, Mason, Carpenter, Painter             │
│   - General Contractor, False Ceiling, Flooring, HVAC           │
│ - Service areas (city + locality)                               │
│ - [Continue] button                                             │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Contractor Onboarding - Step 3 (Work Photos)            │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Progress indicator: Step 3 of 3                               │
│ - Photo grid (min 2, max 10)                                    │
│ - [Finish Setup] button                                         │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Finish Setup] → API: PATCH /contractors/me                   │
│   → Verification Pending screen                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Contractor Home Screen

**Entry Point:** App launch (authenticated contractor)

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Contractor Home                                         │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Greeting header                                               │
│ - Verification banner (if not verified)                         │
│ - Stats cards (Active, Invitations, Earnings)                   │
│ - Invitations section                                           │
│ - Active work section                                           │
│ - Bottom navigation: Home | Opportunities | My Work | Profile   │
├─────────────────────────────────────────────────────────────────┤
│ Data Requirements:                                              │
│ - API: GET /contractors/me                                      │
│ - API: GET /contractors/me/invitations                          │
│ - API: GET /contractors/me/assignments                          │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Respond to Invitation

**Entry Point:** Invitation detail screen

```
┌─────────────────────────────────────────────────────────────────┐
│ SCREEN: Invitation Detail                                       │
├─────────────────────────────────────────────────────────────────┤
│ Elements:                                                       │
│ - Project overview                                              │
│ - Invited by (designer/homeowner)                               │
│ - Work required description                                     │
│ - Quote amount input                                            │
│ - Quote details textarea                                        │
│ - [Decline] / [Submit Quote] buttons                            │
├─────────────────────────────────────────────────────────────────┤
│ Actions:                                                        │
│ - [Submit Quote] → API: PATCH /projects/:id/contractors/:id     │
│   { status: 'quote_submitted', quote_amount, quote_details }    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Shared Flows

### 5.1 Profile Management

**Entry Point:** Profile tab (all user types)

- Profile header with photo and name
- User-type specific sections
- Settings (Language, Notifications, Help, Terms, Privacy)
- Logout button

### 5.2 Notifications

- Grouped by date (Today, Yesterday, Earlier)
- Type-specific icons and content
- Tap to navigate to relevant screen
- Mark all as read

### 5.3 Language Switching

- Toggle between English and Hindi
- Persists to local storage and API
- Uses react-i18next (web) / i18next (React Native)

---

## 6. State Definitions

### 6.1 Project States

| State | Description |
|-------|-------------|
| `draft` | Project created but not published |
| `seeking_designer` | Looking for designer proposals |
| `in_progress` | Designer assigned, work ongoing |
| `completed` | All work finished |
| `cancelled` | Project cancelled |

### 6.2 Proposal States

| State | Description |
|-------|-------------|
| `submitted` | Designer submitted proposal |
| `accepted` | Homeowner accepted |
| `rejected` | Homeowner rejected |

### 6.3 Contractor Assignment States

| State | Description |
|-------|-------------|
| `invited` | Contractor invited to project |
| `quote_submitted` | Contractor submitted quote |
| `hired` | Contractor confirmed on project |
| `completed` | Contractor's work finished |
| `removed` | Contractor removed from project |

### 6.4 Task States

| State | Transitions |
|-------|-------------|
| `todo` | → `in_progress` |
| `in_progress` | → `completed` or → `todo` |
| `completed` | → `in_progress` (reopen) |

### 6.5 Milestone States

| State | Payment Status | Description |
|-------|----------------|-------------|
| `pending` | `not_paid` | Milestone not yet reached |
| `pending` | `paid` | Advance payment made |
| `completed` | `not_paid` | Milestone reached, payment pending |
| `completed` | `paid` | Milestone reached and paid |

---

## 7. Error States & Edge Cases

### 7.1 Network Errors

- Icon: No connection
- Title: "No internet connection"
- Subtitle: "Check your connection and try again"
- [Retry] button

### 7.2 Empty States

| Screen | Message | CTA |
|--------|---------|-----|
| Homeowner Projects | "No projects yet" | [Start a Project] |
| Designer Requests | "No new requests" | - |
| Contractor Invitations | "No invitations yet" | - |
| Search Results | "No results found" | [Clear Filters] |
| Proposals | "No proposals yet" | - |
| Tasks | "No tasks yet" | [+ Add Task] |
| Notifications | "No notifications" | - |

### 7.3 Loading States

| Component | Behavior |
|-----------|----------|
| Lists | Skeleton cards (3-4 items) |
| Profile | Skeleton with photo placeholder |
| Project Detail | Tab-specific skeleton |
| Search | Skeleton cards with shimmer |
| Buttons | Spinner replaces text |

### 7.4 Validation Error Messages

| Field | Error Message |
|-------|---------------|
| Phone (empty) | "Phone number is required" |
| Phone (invalid) | "Enter a valid 10-digit phone number" |
| OTP (invalid) | "Invalid code. Please try again." |
| Name (empty) | "Name is required" |
| Budget (min > max) | "Minimum budget cannot exceed maximum" |

### 7.5 Confirmation Dialogs

| Action | Title | Message |
|--------|-------|---------|
| Accept Proposal | "Accept this proposal?" | "This will assign {designer} to your project" |
| Reject Proposal | "Reject this proposal?" | Includes optional reason input |
| Cancel Project | "Cancel this project?" | "This action cannot be undone" |
| Logout | "Log out?" | "You'll need to sign in again" |

---

## 8. Accessibility Requirements

### 8.1 General

- Minimum touch target: 44x44 points
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- All images must have alt text
- Form fields must have visible labels
- Focus states must be visible

### 8.2 Screen Reader

- Descriptive screen titles
- Properly labeled navigation
- Status changes announced
- Form validation errors announced

### 8.3 Motion

- Respect "reduce motion" preference
- Animations under 300ms for UI feedback

---

## 9. Analytics Events

### 9.1 Key Events

| Event | Trigger |
|-------|---------|
| `user_signed_up` | Onboarding complete |
| `project_created` | Project creation |
| `proposal_requested` | Send request to designer |
| `proposal_submitted` | Designer submits proposal |
| `proposal_accepted` | Homeowner accepts |
| `contractor_invited` | Invite sent |
| `contractor_hired` | Contractor hired |
| `task_completed` | Task marked complete |
| `milestone_completed` | Milestone reached |
| `search_performed` | Search executed |

---

## 10. Internationalization (i18n)

### 10.1 Supported Languages

| Language | Code | Direction |
|----------|------|-----------|
| English | `en` | LTR |
| Hindi | `hi` | LTR |

### 10.2 Formatting

| Type | English | Hindi |
|------|---------|-------|
| Currency | ₹1,00,000 | ₹1,00,000 |
| Date | Jan 15, 2025 | 15 जन॰ 2025 |
| Time | 2:30 PM | दोपहर 2:30 |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2025 | Initial version |
