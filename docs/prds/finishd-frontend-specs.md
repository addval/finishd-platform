# Finishd — Frontend Component Specifications

**Version:** 1.0  
**Last Updated:** January 2025  
**Stack:** React 18 + Vite + shadcn/ui + Tailwind CSS + Zustand + TanStack Query

---

## Table of Contents

1. [Design System Foundation](#1-design-system-foundation)
2. [Shared Components](#2-shared-components)
3. [Screen Specifications](#3-screen-specifications)
4. [State Management](#4-state-management)
5. [API Integration](#5-api-integration)

---

## 1. Design System Foundation

### 1.1 Color Tokens

```typescript
// tailwind.config.ts
const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',  // Main brand
    600: '#0284c7',
    700: '#0369a1',
  },
  success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
  warning: { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
  error: { 50: '#fef2f2', 500: '#ef4444', 700: '#b91c1c' },
  status: {
    draft: '#6b7280',
    seeking: '#3b82f6',
    progress: '#22c55e',
    completed: '#8b5cf6',
    cancelled: '#ef4444',
  },
};
```

### 1.2 Typography

```typescript
const fontSize = {
  'display': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
  'h1': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],
  'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
  'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
  'h4': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
  'body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
  'body': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
  'body-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
};
```

### 1.3 Spacing & Radius

```typescript
const spacing = {
  'screen-padding': '1rem',
  'section-gap': '1.5rem',
  'card-padding': '1rem',
};

const borderRadius = {
  'card': '0.75rem',
  'button': '0.5rem',
  'input': '0.5rem',
  'badge': '9999px',
  'avatar': '9999px',
};
```

---

## 2. Shared Components

### 2.1 Layout Components

#### AppShell
Main layout wrapper with bottom navigation.

```tsx
// components/layout/AppShell.tsx
interface AppShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  activeTab?: string;
  userType: 'homeowner' | 'designer' | 'contractor';
}

// Structure:
// ┌────────────────────────────────┐
// │ {children}                     │
// │                                │
// ├────────────────────────────────┤
// │ [BottomNavigation]             │
// └────────────────────────────────┘

// Tailwind: min-h-screen flex flex-col bg-gray-50 pb-16
```

#### BottomNavigation
Tab navigation fixed at bottom.

```tsx
// components/layout/BottomNavigation.tsx

// Homeowner tabs: Home, Designers, Contractors, Projects, Profile
// Designer tabs: Home, Requests, Projects, Profile
// Contractor tabs: Home, Opportunities, My Work, Profile

// Tailwind:
// Container: fixed bottom-0 left-0 right-0 bg-white border-t h-16
// Item active: text-primary-600
// Item inactive: text-gray-500
```

#### ScreenHeader
Consistent header with back button, title, actions.

```tsx
// components/layout/ScreenHeader.tsx
interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActions?: React.ReactNode;
  subtitle?: string;
}

// shadcn: Button (variant="ghost", size="icon")
// Tailwind: sticky top-0 z-10 bg-white border-b px-4 py-3
```

### 2.2 Card Components

#### DesignerCard

```tsx
// components/cards/DesignerCard.tsx
interface DesignerCardProps {
  designer: {
    id: string;
    name: string;
    firmName?: string;
    profilePhotoUrl?: string;
    serviceAreas: string[];
    startingPrice: number;
    styles: string[];
    portfolioImages: string[];
    isVerified: boolean;
  };
  onViewProfile: () => void;
  onRequestProposal: () => void;
}

// Structure:
// ┌─────────────────────────────────────────┐
// │ [Avatar]  Name                          │
// │           Firm Name                     │
// │           📍 Service areas              │
// │           💰 Starting from ₹XX,XXX      │
// │ [Tag] [Tag] [Tag]                       │
// │ [img] [img] [img]                       │
// │ [View Profile]    [Request Proposal]    │
// └─────────────────────────────────────────┘

// shadcn: Card, CardContent, Avatar, Badge, Button
```

#### ContractorCard

```tsx
// components/cards/ContractorCard.tsx
interface ContractorCardProps {
  contractor: {
    id: string;
    name: string;
    profilePhotoUrl?: string;
    trades: string[];
    serviceAreas: string[];
    yearsExperience: number;
    isVerified: boolean;
    workPhotos: string[];
  };
  onViewProfile: () => void;
  onInvite: () => void;
}

// Similar structure to DesignerCard
// Trade badges instead of style tags
```

#### ProjectCard

```tsx
// components/cards/ProjectCard.tsx
interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    status: 'draft' | 'seeking_designer' | 'in_progress' | 'completed' | 'cancelled';
    tasksCompleted: number;
    tasksTotal: number;
    nextMilestoneDate?: string;
    propertyAddress: string;
  };
  onClick: () => void;
}

// Structure:
// ┌─────────────────────────────────────────┐
// │ Project Title              [Status]     │
// │ 📍 Property address                     │
// │ [████████░░░░] 5/12 tasks               │
// │ Next milestone: Jan 25                  │
// └─────────────────────────────────────────┘

// shadcn: Card, CardContent, Badge, Progress
```

#### ProposalCard

```tsx
// components/cards/ProposalCard.tsx
interface ProposalCardProps {
  proposal: {
    id: string;
    designer: { id: string; name: string; firmName?: string; profilePhotoUrl?: string };
    timeline: number;
    totalCost: number;
    submittedAt: string;
  };
  onClick: () => void;
}

// shadcn: Card, CardContent, Avatar, Button
```

### 2.3 Form Components

#### PhoneInput

```tsx
// components/form/PhoneInput.tsx
interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

// Structure: [+91 ▼] [Phone number input]
// Validation: 10 digits only
// Format display: XXXXX XXXXX
// shadcn: Input, Select
```

#### OTPInput

```tsx
// components/form/OTPInput.tsx
interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  length?: number;
}

// 6 individual input boxes
// Auto-advance on input
// shadcn: InputOTP
```

#### CurrencyInput

```tsx
// components/form/CurrencyInput.tsx
interface CurrencyInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  error?: string;
}

// Structure: ₹ [1,00,000]
// Indian number formatting (lakhs, crores)
// shadcn: Input
```

#### ImageUploader

```tsx
// components/form/ImageUploader.tsx
interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  minImages?: number;
  error?: string;
}

// Grid of images with add/remove
// Click or drag to upload
// shadcn: Button (for add)
```

#### CounterInput

```tsx
// components/form/CounterInput.tsx
interface CounterInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

// Structure: Label [-] 2 [+]
// shadcn: Button (variant="outline", size="icon")
```

### 2.4 Feedback Components

#### LoadingSkeleton

```tsx
// components/feedback/LoadingSkeleton.tsx
interface SkeletonCardProps {
  variant: 'designer' | 'contractor' | 'project' | 'proposal';
}

// Matches structure of each card type
// shadcn: Skeleton
```

#### EmptyState

```tsx
// components/feedback/EmptyState.tsx
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

// Centered content with optional CTA
// shadcn: Button
```

#### ConfirmDialog

```tsx
// components/feedback/ConfirmDialog.tsx
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  isLoading?: boolean;
}

// shadcn: AlertDialog
```

### 2.5 Status Components

#### StatusBadge

```tsx
// components/ui/StatusBadge.tsx
type ProjectStatus = 'draft' | 'seeking_designer' | 'in_progress' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: ProjectStatus;
  type: 'project' | 'proposal' | 'contractor' | 'task';
}

// Color mapping:
// draft: bg-gray-100 text-gray-700
// seeking_designer: bg-blue-100 text-blue-700
// in_progress: bg-green-100 text-green-700
// completed: bg-purple-100 text-purple-700
// cancelled: bg-red-100 text-red-700

// shadcn: Badge
```

---

## 3. Screen Specifications

### 3.1 Authentication Screens

#### WelcomeScreen
**Route:** `/welcome`  
**Access:** Unauthenticated only

```
┌────────────────────────────────────────┐
│                           [EN/हिंदी]   │
│                                        │
│              [Logo]                    │
│                                        │
│     From bare walls to finished        │
│            interiors                   │
│                                        │
│         [Illustration]                 │
│                                        │
│        [Get Started]                   │
│   [I already have an account]          │
└────────────────────────────────────────┘
```

**Components:** Button, language toggle  
**Actions:**
- Get Started → `/auth/phone`
- Language toggle → Update i18n

---

#### PhoneEntryScreen
**Route:** `/auth/phone`

```
┌────────────────────────────────────────┐
│ [←]                                    │
│                                        │
│ Enter your phone number                │
│ We'll send you a verification code     │
│                                        │
│ [+91 ▼] [Phone number input]           │
│                                        │
│ By continuing, you agree to our        │
│ Terms of Service and Privacy Policy    │
│                                        │
│              [Continue]                │
└────────────────────────────────────────┘
```

**Components:** ScreenHeader, PhoneInput, Button  
**API:** `POST /auth/send-otp`  
**Validation:** 10 digits required

---

#### OTPScreen
**Route:** `/auth/otp`

```
┌────────────────────────────────────────┐
│ [←]                                    │
│                                        │
│ Verify your number                     │
│ Enter the 6-digit code sent to         │
│ +91 XXXXX XXXXX                        │
│                                        │
│     [1] [2] [3] [4] [5] [6]            │
│                                        │
│     Resend code in 0:30                │
│                                        │
│              [Verify]                  │
└────────────────────────────────────────┘
```

**Components:** ScreenHeader, OTPInput, Button  
**API:** `POST /auth/verify-otp`  
**Flow:**
- New user → `/auth/user-type`
- Existing user → Home (based on user type)

---

#### UserTypeSelectionScreen
**Route:** `/auth/user-type`

```
┌────────────────────────────────────────┐
│                                        │
│ How will you use Finishd?              │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🏠 Homeowner                       │ │
│ │ I want to design and build my home │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🎨 Interior Designer               │ │
│ │ I design interiors for clients     │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🔧 Contractor                      │ │
│ │ I provide construction services    │ │
│ └────────────────────────────────────┘ │
│                                        │
│              [Continue]                │
└────────────────────────────────────────┘
```

**Components:** Selection cards, Button  
**API:** `PATCH /users/me` (set user_type)  
**Flow:** → `/onboarding/{userType}`

---

### 3.2 Homeowner Screens

#### HomeownerOnboarding (3 steps)
**Route:** `/onboarding/homeowner`

**Step 1 - Profile:**
- Full name input (required)
- Email input (optional)
- [Continue] / [Skip for now]

**Step 2 - Location:**
- City dropdown (Delhi NCR, Chandigarh Tricity)
- Locality input
- [Continue] / [Back]

**Step 3 - Property:**
- Property type selector (Apartment/House/Villa)
- Size input (sq ft, optional)
- Room counters (Bedrooms, Bathrooms, Living areas)
- [Finish Setup] / [Back]

**API:** 
- `PATCH /homeowners/me`
- `POST /homeowners/me/properties`

---

#### HomeownerHomeScreen
**Route:** `/` (for homeowner)

```
┌────────────────────────────────────────┐
│ Hello, {name}                     [🔔] │
│ 📍 {city}                              │
│                                        │
│ Your Projects (if any)                 │
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │Proj1│ │Proj2│ │Proj3│ → scroll      │
│ └─────┘ └─────┘ └─────┘               │
│                                        │
│ -- OR Empty State --                   │
│ Start your home journey                │
│ [Find a Designer]                      │
│ [Browse Contractors]                   │
│                                        │
│ Quick Actions                          │
│ ┌─────────┐ ┌─────────┐               │
│ │Designers│ │Contract.│               │
│ ├─────────┤ ├─────────┤               │
│ │  Post   │ │  Cost   │               │
│ │Requirem.│ │Estimate │               │
│ └─────────┘ └─────────┘               │
│                                        │
│ Top Designers in {city}                │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ → scroll      │
│ └───┘ └───┘ └───┘ └───┘               │
│                                        │
│ [Home] [Design] [Contr] [Proj] [Prof]  │
└────────────────────────────────────────┘
```

**Components:** AppShell, ProjectCard, QuickActionCard, DesignerCardCompact  
**API:**
- `GET /users/me`
- `GET /projects`
- `GET /designers?city={city}&limit=5`

---

#### BrowseDesignersScreen
**Route:** `/designers`

```
┌────────────────────────────────────────┐
│ Designers                   [🔍] [⚙️]  │
│                                        │
│ [Search input]              [Filters]  │
│                                        │
│ [Budget ▼] [Style ▼] [Available]       │
│                                        │
│ 42 designers found                     │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ DesignerCard 1                     │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ DesignerCard 2                     │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ DesignerCard 3                     │ │
│ └────────────────────────────────────┘ │
│                                        │
│         [Load More]                    │
│                                        │
│ [Home] [Design] [Contr] [Proj] [Prof]  │
└────────────────────────────────────────┘
```

**Components:** AppShell, Input, FilterChips, DesignerCard, Sheet (filters)  
**API:** `GET /search/designers?q=&city=&budget=&styles=&page=`  
**Features:**
- Debounced search (300ms)
- Infinite scroll pagination
- Filter sheet with budget, styles, availability

---

#### DesignerProfileScreen
**Route:** `/designers/:id`

```
┌────────────────────────────────────────┐
│ [←]                      [Share] [Save]│
│                                        │
│              [Avatar]                  │
│          Name ✓ (verified)             │
│            Firm Name                   │
│        Serves: Delhi NCR               │
│                                        │
│   XX Projects  |  X years  |  ₹XX,XXX+ │
│                                        │
│ About                                  │
│ Designer bio text here...              │
│                                        │
│ Services                               │
│ ✓ Full home interiors                  │
│ ✓ Kitchen design                       │
│ ✓ Bedroom design                       │
│                                        │
│ Portfolio                              │
│ [img] [img] [img]                      │
│ [img] [img] [img]                      │
│ [View All (20)]                        │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │       [Request Proposal]           │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Components:** Avatar, Badge, Button, Dialog (gallery)  
**API:** `GET /designers/:id`

---

#### RequestProposalFlow (3 steps)
**Route:** `/request-proposal?designer=:id`

**Step 1 - Select Property:**
- Property selection cards (radio)
- [+ Add New Property]
- [Continue]

**Step 2 - Scope:**
- Full home / Specific rooms (radio)
- Room checkboxes (if specific)
- [Continue] / [Back]

**Step 3 - Details:**
- Budget range (slider/chips)
- Timeline (radio: Immediately / 1 month / 1-3 months / 3+ months / Not sure)
- Additional notes (textarea, optional)
- [Send Request] / [Back]

**API:**
- `POST /projects` (create)
- `POST /projects/:id/requests` (send to designer)

**Success Screen:**
- Success animation
- [View Project] / [Browse More Designers]

---

#### ProjectDetailScreen (Homeowner)
**Route:** `/projects/:id`

```
┌────────────────────────────────────────┐
│ [←] Project Title                 [⋮]  │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ [Status: In Progress]              │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [Overview] [Tasks] [Miles] [Costs] [Team]
│ ─────────────────────────────────────  │
│                                        │
│ TAB CONTENT HERE                       │
│ (See tab specs below)                  │
│                                        │
│                                        │
│                                        │
│ [Home] [Design] [Contr] [Proj] [Prof]  │
└────────────────────────────────────────┘
```

**Tabs:**

**Overview Tab:**
- Progress card (circular indicator, tasks/milestones counts)
- Project info (property, scope, budget, timeline)
- Upcoming (next milestone, next 3 tasks)
- Recent activity (last 5 items)

**Tasks Tab:**
- Filter bar (status, assignee)
- Task list with checkboxes
- [+ Add Task] FAB (if designer role)

**Milestones Tab:**
- Vertical timeline
- Each: status indicator, title, date, amount, payment status
- [Mark as Paid] button (homeowner only)

**Costs Tab:**
- Budget summary card (total, estimated, actual, remaining)
- Cost breakdown by category (expandable)

**Team Tab:**
- Designer card (if assigned)
- Contractors list with status
- [+ Add Contractor] button

**API:**
- `GET /projects/:id`
- `GET /projects/:id/tasks`
- `GET /projects/:id/milestones`
- `GET /projects/:id/costs`
- `GET /projects/:id/contractors`
- `GET /projects/:id/activity`

---

### 3.3 Designer Screens

#### DesignerOnboarding (4 steps)
**Route:** `/onboarding/designer`

**Step 1 - Profile:**
- Profile photo upload
- Full name (required)
- Firm/Studio name (optional)
- Bio textarea (required, min 50 chars)

**Step 2 - Services:**
- Multi-select checkboxes (Full Home, Living Room, Bedroom, Kitchen, etc.)

**Step 3 - Location & Pricing:**
- Cities multi-select (Delhi NCR, Chandigarh Tricity)
- Starting price input (₹)

**Step 4 - Portfolio:**
- Image uploader (min 3, max 20)
- [Finish Setup]

**API:** `PATCH /designers/me`  
**Flow:** → Verification Pending screen

---

#### DesignerHomeScreen
**Route:** `/` (for designer)

```
┌────────────────────────────────────────┐
│ Hello, {name}                     [🔔] │
│                                        │
│ [⚠️ Profile under review - banner]     │
│                                        │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │Active: 3│ │Pending:2│ │₹1.5L    │   │
│ │Projects │ │Requests │ │This Mo. │   │
│ └─────────┘ └─────────┘ └─────────┘   │
│                                        │
│ New Project Requests                   │
│ ┌────────────────────────────────────┐ │
│ │ Request Card 1                     │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ Request Card 2                     │ │
│ └────────────────────────────────────┘ │
│ [View All Requests]                    │
│                                        │
│ Your Active Projects                   │
│ → horizontal scroll                    │
│                                        │
│ [Home] [Requests] [Projects] [Profile] │
└────────────────────────────────────────┘
```

**Components:** Stats cards, RequestCard, ProjectCard  
**API:**
- `GET /designers/me`
- `GET /projects?role=designer`
- `GET /projects/requests?status=pending`

---

#### CreateProposalFlow (3 steps)
**Route:** `/proposals/create?request=:id`

**Step 1 - Scope:**
- Project reference card
- Scope description textarea (required, min 100 chars)

**Step 2 - Approach & Timeline:**
- Design approach textarea (required)
- Timeline input (weeks)
- Phase breakdown (optional)

**Step 3 - Cost Estimate:**
- Homeowner budget reference
- Cost breakdown inputs:
  - Design Fees
  - Estimated Labor
  - Estimated Materials
  - Other
- Total (calculated)
- Notes textarea

**API:** `POST /projects/:id/proposals`

---

### 3.4 Contractor Screens

#### ContractorOnboarding (3 steps)
**Route:** `/onboarding/contractor`

**Step 1 - Profile:**
- Profile photo upload
- Full name (required)
- Years experience (required)

**Step 2 - Skills:**
- Trade multi-select (Electrician, Plumber, Mason, Carpenter, Painter, etc.)
- Service areas (city + locality)

**Step 3 - Work Photos:**
- Image uploader (min 2, max 10)

**API:** `PATCH /contractors/me`

---

#### ContractorHomeScreen
**Route:** `/` (for contractor)

Similar to Designer Home with:
- Stats: Active Assignments, Pending Invitations, This Month earnings
- Invitations section
- Active work section
- Bottom nav: Home, Opportunities, My Work, Profile

---

#### InvitationDetailScreen
**Route:** `/invitations/:id`

```
┌────────────────────────────────────────┐
│ [←] Project Invitation                 │
│                                        │
│ Project Overview                       │
│ - Project title                        │
│ - Property location                    │
│ - Project scope                        │
│                                        │
│ Invited By                             │
│ [Designer/Homeowner card]              │
│                                        │
│ Work Required                          │
│ - Description                          │
│ - Expected timeline                    │
│                                        │
│ Your Quote                             │
│ ₹ [Amount input]                       │
│ [Quote details textarea]               │
│                                        │
│ [Decline]           [Submit Quote]     │
└────────────────────────────────────────┘
```

**API:** `PATCH /projects/:id/contractors/:id` (status: quote_submitted)

---

### 3.5 Shared Screens

#### NotificationsScreen
**Route:** `/notifications`

- Grouped by date (Today, Yesterday, Earlier)
- Notification items with icon, title, description, timestamp
- Unread indicator dot
- Tap to navigate to relevant screen
- [Mark All Read] action

---

#### ProfileScreen
**Route:** `/profile`

- Profile header (photo, name, user type badge)
- User-type specific sections:
  - Homeowner: My Properties
  - Designer: Portfolio, Services
  - Contractor: Skills, Work Photos
- Settings section:
  - Language (English / हिंदी)
  - Notifications
  - Help & Support
  - Terms of Service
  - Privacy Policy
  - About Finishd
- [Logout] button

---

## 4. State Management

### 4.1 Zustand Stores

```typescript
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// stores/uiStore.ts
interface UIStore {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  bottomSheetOpen: string | null;
  openBottomSheet: (id: string) => void;
  closeBottomSheet: () => void;
}
```

### 4.2 TanStack Query Keys

```typescript
const queryKeys = {
  user: ['user', 'me'],
  projects: ['projects'],
  project: (id: string) => ['projects', id],
  projectTasks: (id: string) => ['projects', id, 'tasks'],
  projectMilestones: (id: string) => ['projects', id, 'milestones'],
  projectCosts: (id: string) => ['projects', id, 'costs'],
  projectContractors: (id: string) => ['projects', id, 'contractors'],
  designers: ['designers'],
  designerSearch: (params: SearchParams) => ['designers', 'search', params],
  designer: (id: string) => ['designers', id],
  contractors: ['contractors'],
  contractor: (id: string) => ['contractors', id],
  notifications: ['notifications'],
};
```

---

## 5. API Integration

### 5.1 API Client Setup

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add language header
apiClient.interceptors.request.use((config) => {
  const lang = localStorage.getItem('language') || 'en';
  config.headers['Accept-Language'] = lang;
  return config;
});
```

### 5.2 API Modules

```typescript
// lib/api/auth.ts
export const authApi = {
  sendOtp: (phone: string) => apiClient.post('/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otp: string) => apiClient.post('/auth/verify-otp', { phone, otp }),
  logout: () => apiClient.post('/auth/logout'),
};

// lib/api/users.ts
export const usersApi = {
  getMe: () => apiClient.get('/users/me'),
  updateUserType: (userType: string) => apiClient.patch('/users/me', { user_type: userType }),
};

// lib/api/homeowners.ts
export const homeownersApi = {
  updateProfile: (data: HomeownerProfile) => apiClient.patch('/homeowners/me', data),
  getProperties: () => apiClient.get('/homeowners/me/properties'),
  addProperty: (data: Property) => apiClient.post('/homeowners/me/properties', data),
  saveDesigner: (id: string) => apiClient.post(`/homeowners/me/saved-designers/${id}`),
};

// lib/api/designers.ts
export const designersApi = {
  updateProfile: (data: DesignerProfile) => apiClient.patch('/designers/me', data),
  getById: (id: string) => apiClient.get(`/designers/${id}`),
  search: (params: DesignerSearchParams) => apiClient.get('/search/designers', { params }),
  list: (params?: { city?: string; limit?: number }) => apiClient.get('/designers', { params }),
};

// lib/api/contractors.ts
export const contractorsApi = {
  updateProfile: (data: ContractorProfile) => apiClient.patch('/contractors/me', data),
  getById: (id: string) => apiClient.get(`/contractors/${id}`),
  search: (params: ContractorSearchParams) => apiClient.get('/search/contractors', { params }),
  getInvitations: () => apiClient.get('/contractors/me/invitations'),
  getAssignments: () => apiClient.get('/contractors/me/assignments'),
};

// lib/api/projects.ts
export const projectsApi = {
  list: () => apiClient.get('/projects'),
  getById: (id: string) => apiClient.get(`/projects/${id}`),
  create: (data: CreateProject) => apiClient.post('/projects', data),
  update: (id: string, data: UpdateProject) => apiClient.patch(`/projects/${id}`, data),
  sendRequest: (projectId: string, designerId: string) => 
    apiClient.post(`/projects/${projectId}/requests`, { designer_id: designerId }),
  getTasks: (id: string) => apiClient.get(`/projects/${id}/tasks`),
  getMilestones: (id: string) => apiClient.get(`/projects/${id}/milestones`),
  getCosts: (id: string) => apiClient.get(`/projects/${id}/costs`),
  getContractors: (id: string) => apiClient.get(`/projects/${id}/contractors`),
  getActivity: (id: string) => apiClient.get(`/projects/${id}/activity`),
  getProposals: (id: string) => apiClient.get(`/projects/${id}/proposals`),
  submitProposal: (id: string, data: CreateProposal) => 
    apiClient.post(`/projects/${id}/proposals`, data),
  acceptProposal: (projectId: string, proposalId: string) => 
    apiClient.post(`/projects/${projectId}/proposals/${proposalId}/accept`),
  inviteContractor: (projectId: string, contractorId: string) => 
    apiClient.post(`/projects/${projectId}/contractors`, { contractor_id: contractorId }),
};
```

---

## 6. i18n Setup

### 6.1 Configuration

```typescript
// lib/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi } },
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### 6.2 Sample Translation Keys

```json
// locales/en.json
{
  "common": {
    "continue": "Continue",
    "back": "Back",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "loading": "Loading...",
    "viewAll": "View All",
    "seeAll": "See All",
    "loadMore": "Load More",
    "skipForNow": "Skip for now",
    "comingSoon": "Coming Soon"
  },
  "auth": {
    "phone": {
      "title": "Enter your phone number",
      "subtitle": "We'll send you a verification code"
    },
    "otp": {
      "title": "Verify your number",
      "subtitle": "Enter the 6-digit code sent to {{phone}}",
      "resendIn": "Resend code in {{seconds}}s",
      "resend": "Resend Code",
      "verify": "Verify"
    }
  },
  "home": {
    "greeting": "Hello, {{name}}",
    "yourProjects": "Your Projects",
    "quickActions": "Quick Actions",
    "topDesigners": "Top Designers in {{city}}"
  },
  "designer": {
    "viewProfile": "View Profile",
    "requestProposal": "Request Proposal",
    "serves": "Serves",
    "projects": "Projects",
    "years": "Years",
    "startingPrice": "Starting"
  }
}
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2025 | Initial version |
