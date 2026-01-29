# Finishd - Interior Design Marketplace

A marketplace platform connecting Indian homeowners with interior designers and contractors, serving Delhi NCR and Chandigarh Tricity regions.

## Overview

Finishd enables homeowners to find and hire verified interior designers for their home projects. Designers can showcase their work and receive project requests, while contractors can be invited to participate in projects.

### Target Markets
- **Delhi NCR**: Delhi, Gurgaon, Noida, Faridabad, Ghaziabad
- **Chandigarh Tricity**: Chandigarh, Mohali, Panchkula

### User Types
- **Homeowners**: Create projects, browse designers, send requests
- **Designers**: Receive requests, submit proposals, manage projects
- **Contractors**: Get invited to projects by designers

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- **Drizzle ORM** with PostgreSQL
- **Typesense** for full-text search (designers/contractors)
- **Redis** for OTP storage and caching
- JWT authentication with phone OTP

### Frontend
- React 18 + TypeScript + Vite
- Zustand for state management
- TanStack Query for server state
- Tailwind CSS + shadcn/ui components

## Local Development Setup

### Prerequisites

1. **Node.js 20+** and **pnpm 8+**
2. **PostgreSQL 16+**
3. **Redis 7+**
4. **Typesense** (optional, for search functionality)

### Step 1: Install Dependencies

```bash
cd finishd-platform
pnpm install
```

### Step 2: Set Up PostgreSQL

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql-16
sudo systemctl start postgresql

# Create database
createdb finishd_dev
```

### Step 3: Set Up Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis
```

### Step 4: Set Up Typesense (Optional)

Typesense is used for designer/contractor search. Skip this if you don't need search functionality.

```bash
# macOS
brew install typesense

# Or download from https://typesense.org/downloads/
# Run with:
typesense-server --data-dir=/tmp/typesense-data --api-key=xyz123
```

### Step 5: Configure Environment Variables

```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:

```env
# Database
DATABASE_URL=postgresql://localhost:5432/finishd_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (generate your own for production)
JWT_SECRET=your-jwt-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Typesense (optional)
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_API_KEY=xyz123

# OTP Settings
OTP_DEV_MODE=true  # Accepts "123456" as valid OTP in dev mode
```

### Step 6: Run Database Migrations

```bash
pnpm --filter backend db:migrate
```

### Step 7: Seed Test Data (Optional)

```bash
pnpm --filter backend db:seed:finishd
```

This creates test accounts you can use for manual testing.

### Step 8: Start Development Servers

```bash
# Start both backend and frontend
pnpm dev

# Or start separately:
pnpm --filter backend dev    # Backend on http://localhost:3000
pnpm --filter frontend dev   # Frontend on http://localhost:5173
```

## Test Accounts

After running the seed command, these accounts are available:

| User Type | Phone | OTP (dev mode) |
|-----------|-------|----------------|
| Homeowner | +91 9876543210 | 123456 |
| Homeowner | +91 9876543211 | 123456 |
| Designer (verified) | +91 9876543220 | 123456 |
| Designer (verified) | +91 9876543221 | 123456 |
| Contractor (verified) | +91 9876543230 | 123456 |

## API Endpoints

### Authentication
```
POST /api/finishd/auth/send-otp     # Send OTP to phone
POST /api/finishd/auth/verify-otp   # Verify OTP and get tokens
POST /api/finishd/auth/refresh      # Refresh access token
POST /api/finishd/auth/logout       # Logout
```

### Profiles
```
GET/POST /api/finishd/homeowners/profile
GET/POST /api/finishd/designers/profile
GET/POST /api/finishd/contractors/profile
```

### Search
```
GET /api/finishd/search/designers?q=modern&city=Delhi
GET /api/finishd/search/contractors?q=carpentry&city=Gurgaon
```

### Projects
```
GET    /api/finishd/projects
POST   /api/finishd/projects
GET    /api/finishd/projects/:id
PATCH  /api/finishd/projects/:id
DELETE /api/finishd/projects/:id
```

### Requests & Proposals
```
POST /api/finishd/requests           # Homeowner sends request
POST /api/finishd/requests/:id/proposal  # Designer submits proposal
POST /api/finishd/requests/:id/accept    # Homeowner accepts
POST /api/finishd/requests/:id/reject    # Homeowner rejects
```

## Frontend Routes

All Finishd routes are prefixed with `/finishd`:

| Route | Description |
|-------|-------------|
| `/finishd/login` | Phone login page |
| `/finishd/verify-otp` | OTP verification |
| `/finishd/onboarding` | User type selection |
| `/finishd/onboarding/homeowner` | Homeowner profile setup |
| `/finishd/onboarding/designer` | Designer profile setup |
| `/finishd/onboarding/contractor` | Contractor profile setup |
| `/finishd/dashboard` | User dashboard |
| `/finishd/designers` | Browse designers |
| `/finishd/projects/new` | Create new project |

## Project Structure

```
apps/
├── backend/src/
│   ├── modules/finishd/
│   │   ├── auth/           # Phone OTP authentication
│   │   ├── homeowners/     # Homeowner profiles
│   │   ├── designers/      # Designer profiles + Typesense
│   │   ├── contractors/    # Contractor profiles + Typesense
│   │   ├── projects/       # Project state machine
│   │   ├── requests/       # Request/proposal workflow
│   │   ├── tasks/          # Tasks, milestones, costs
│   │   └── search/         # Typesense search
│   └── db/
│       ├── schema/finishd/ # Drizzle schema
│       └── seed-finishd.ts # Test data seeder
│
└── frontend/src/
    └── features/finishd/
        ├── pages/          # Route components
        ├── services/       # API services
        ├── store/          # Zustand stores
        └── routes/         # Route configuration
```

## Running Tests

```bash
# Run all Finishd tests
pnpm --filter backend test -- --grep finishd

# Run specific test file
pnpm --filter backend test src/modules/finishd/auth/auth.service.test.ts
```

## Project State Machine

Projects follow this state flow:

```
draft → seeking_designer → in_progress → completed
                    ↓              ↓
                cancelled      cancelled
```

Valid transitions:
- `draft` → `seeking_designer`, `cancelled`
- `seeking_designer` → `in_progress`, `cancelled`
- `in_progress` → `completed`, `cancelled`
- `completed` → (terminal)
- `cancelled` → (terminal)

## Indian Localization

- **Phone format**: +91 followed by 10 digits
- **Currency**: Indian Rupees (₹) with Lakh/Crore formatting
- **Cities**: Delhi NCR and Chandigarh Tricity localities

## Troubleshooting

### Database connection failed
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep finishd
```

### Redis connection failed
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### OTP not working
Make sure `OTP_DEV_MODE=true` in your `.env` file. In dev mode, any phone number accepts `123456` as valid OTP.

### Search not returning results
1. Make sure Typesense is running
2. Check TYPESENSE_* env variables are set
3. Run seed data to populate search index

## License

MIT
