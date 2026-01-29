# Finishd Platform

> A modern full-stack JavaScript application built with Node.js, React, PostgreSQL, and Drizzle ORM in a monorepo architecture.

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16+
- **ORM**: Drizzle ORM
- **Caching**: Redis (optional)
- **Authentication**: JWT
- **Testing**: Vitest
- **Validation**: Zod

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS (Tailwind-ready)

### DevOps
- **Monorepo**: pnpm workspaces
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: Biome
- **Version Control**: Git with conventional commits

## 📁 Project Structure

```
finishd-platform/
├── .claude/                    # Claude Skills configuration
├── apps/
│   ├── backend/               # Node.js/Express API
│   └── frontend/              # React + TypeScript SPA
├── packages/                  # Shared packages
│   ├── shared-types/          # TypeScript types
│   ├── shared-utils/          # Utility functions
│   └── biome-config/          # Biome config
├── docker/                    # Docker configuration
├── docs/                      # Documentation
├── .github/workflows/         # CI/CD pipelines
└── package.json               # Root package.json
```

## 🛠️ Installation

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 16+
- Redis (optional)

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd finishd-platform

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Start development servers
pnpm dev
```

**That's it!** The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

For detailed setup instructions, see [Development Setup Guide](./docs/development/setup.md)

## 📝 Available Scripts

### Root Commands
```bash
pnpm dev              # Start both apps (dev mode)
pnpm build            # Build all apps
pnpm test             # Run all tests
pnpm test:coverage    # Generate coverage reports
pnpm lint             # Lint all code
pnpm format           # Format code
```

### Backend Commands
```bash
pnpm --filter backend dev              # Start backend
pnpm --filter backend test             # Run tests
pnpm --filter backend db:push          # Push schema to database
pnpm --filter backend db:generate      # Generate migrations
pnpm --filter backend db:migrate       # Run migrations
pnpm --filter backend db:studio        # Open Drizzle Studio
pnpm --filter backend db:seed:finishd  # Seed database
```

### Frontend Commands
```bash
pnpm --filter frontend dev             # Start frontend
pnpm --filter frontend test            # Run tests
pnpm --filter frontend build           # Build for production
```

## 🐳 Docker

Using Docker is recommended for development:

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter backend test
pnpm --filter frontend test

# Generate coverage reports
pnpm test:coverage

# Run tests in watch mode
pnpm --filter backend test:watch
```

## 📚 Documentation

- [Development Setup](./docs/development/setup.md) - Local development guide
- [Deployment Guide](./docs/deployment/README.md) - Production deployment
- [Claude Skills](./.claude/README.md) - AI-assisted development
- [API Documentation](./docs/api/README.md) - API reference (coming soon)

## 🏗️ Architecture

This project follows **world-class best practices**:

### Backend
- **MVC + Service Layer** pattern
- **RESTful API** design
- **TypeScript strict mode** for type safety
- **Comprehensive error handling**
- **Input validation** on all endpoints
- **Transaction management** for data integrity
- **Schema-first** database design with Drizzle

### Frontend
- **Feature-based** component organization
- **Custom hooks** for logic reuse
- **Context API** for global state
- **React Query** for server state
- **Optimized performance** with code splitting
- **TypeScript** for all components
- **Responsive design** ready

### Monorepo Benefits
- **Shared types** between backend and frontend
- **Unified code quality** standards
- **Simplified dependency management**
- **Atomic commits** across packages
- **Faster development** with tooling

## 🔐 Security

- **JWT authentication** with refresh tokens
- **Rate limiting** on public endpoints
- **CORS policies** configured
- **Helmet.js** for security headers
- **Input validation** and sanitization
- **Password hashing** with bcrypt
- **Environment variables** for secrets
- **SQL injection prevention** (Drizzle ORM)

## 🚀 Deployment

### Quick Deploy with Docker

```bash
# Build production images
docker build -f docker/Dockerfile.backend -t finishd-backend:latest .
docker build -f docker/Dockerfile.frontend -t finishd-frontend:latest .

# Run with Docker Compose
docker-compose -f docker/docker-compose.prod.yml up -d
```

See [Deployment Guide](./docs/deployment/README.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please follow our guidelines:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feat/your-feature`
3. **Commit** with conventional commits: `git commit -m "feat: add feature"`
4. **Push** to your branch: `git push origin feat/your-feature`
5. **Open a Pull Request**

### Commit Convention

We use [conventional commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

## 📊 Code Quality

We maintain high code quality standards:

- **80%+ test coverage**
- **TypeScript strict mode**
- **Biome** for linting and formatting
- **Automated CI/CD** checks
- **Code review** required

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Development Team**
- **Claude AI** - Assisted development with Claude Skills

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by industry best practices
- Powered by pnpm workspaces

---

**Made with ❤️ by the Finishd Platform Team**

For questions or support, please open a [GitHub Issue](../../issues)
