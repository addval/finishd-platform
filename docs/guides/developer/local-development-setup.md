# Local Development Setup - Finishd Platform

## 📋 Overview

Complete guide to setting up the Finishd Platform for local development.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 📦 Prerequisites

### Required Software

| Software | Version | Install |
|----------|---------|---------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **PostgreSQL** | 14+ | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **Redis** (optional) | 6+ | [redis.io](https://redis.io/download) |

### Verify Installations

```bash
node --version   # v18.x.x
npm --version    # 9.x.x
psql --version   # 14.x
git --version    # 2.x.x
redis-cli --version  # 6.x (optional)
```

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd finishd-platform
```

### 2. Install Dependencies

```bash
# Backend
cd apps/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Setup Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE finishd_platform;"

# Run migrations
cd apps/backend
npm run migrate

# Run seeders
npm run seed
```

### 4. Environment Variables

**Backend** (`apps/backend/.env`):
```bash
# Database
DB_NAME=finishd_platform
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Server
PORT=3000
NODE_ENV=development

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Frontend** (`apps/frontend/.env`):
```bash
VITE_API_URL=http://localhost:3000/api
```

### 5. Start Development Servers

**Backend** (Terminal 1):
```bash
cd apps/backend
npm run dev
# Server running at http://localhost:3000
```

**Frontend** (Terminal 2):
```bash
cd apps/frontend
npm run dev
# App running at http://localhost:5173
```

---

## ✅ Verify Setup

### Backend Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected"
  }
}
```

### Frontend Access

Open browser: http://localhost:5173

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL from Services
```

### Migration Errors

**Error**: `relation "users" already exists`

**Solution**:
```bash
npm run migrate:undo:all
npm run migrate
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

---

## 📚 Next Steps

- [Backend Architecture](./backend-architecture.md)
- [Frontend Architecture](./frontend-architecture.md)
- [API Reference](./backend-api-reference.md)
