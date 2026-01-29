# Frontend Architecture - Finishd Platform

## 📋 Overview

This document provides a comprehensive overview of the Finishd Platform frontend architecture, including design patterns, folder structure, technology stack, and implementation status.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🏗️ Architecture Pattern

The frontend follows a **feature-based organization** pattern with React, focusing on scalability, maintainability, and developer experience.

### Why Feature-Based Organization?

- **Scalability**: Easy to add new features without affecting existing code
- **Co-location**: Related code (components, hooks, services) lives together
- **Team collaboration**: Multiple developers can work on different features simultaneously
- **Easy onboarding**: Clear structure for new developers
- **Code splitting**: Natural boundaries for lazy loading and code splitting

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                   (React Components)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              UI Components Layer                     │    │
│  │  • Shadcn/ui components (reusable)                   │    │
│  │  • Feature components (auth, posts, users)           │    │
│  └─────────────────────────────────────────────────────┘    │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Business Logic Layer                    │    │
│  │  • Custom hooks (useAuth, useRituals, etc.)         │    │
│  │  • Context providers (Auth, Theme)                  │    │
│  └─────────────────────────────────────────────────────┘    │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Data Layer                             │    │
│  │  • React Query (server state)                       │    │
│  │  • Zustand (client state)                           │    │
│  │  • API services (Axios)                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
apps/frontend/src/
├── assets/              # Static assets (fonts, images, styles)
│   ├── fonts/          # Custom fonts
│   ├── images/         # Images and icons
│   └── styles/         # Global styles (Tailwind CSS)
├── components/         # React components
│   ├── ui/            # Shadcn/ui base components
│   ├── features/      # Feature-specific components
│   │   ├── auth/      # Authentication feature
│   │   ├── posts/     # Posts feature
│   │   └── users/     # Users feature
│   └── shared/        # Shared/reusable components
├── context/           # React Context providers
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── services/          # API services
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
├── tests/             # Test files
├── App.tsx            # Root component
└── main.tsx           # Application entry point
```

---

## 🔧 Core Components

### 1. **Components Layer** (`/components`)

#### UI Components (`/components/ui/`)

Shadcn/ui base components - pre-built, customizable components.

**Available Components**:
- `Button` - Button with variants (default, destructive, outline, ghost, link)
- `Card` - Card container with header, content, footer
- `Input` - Text input with validation support
- `Label` - Form label component

**Usage**:
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

#### Feature Components (`/components/features/`)

Feature-based organization where each feature has its own subfolder.

**Structure**:
```
features/
├── auth/              # Authentication feature
│   ├── components/    # Auth-specific components
│   ├── hooks/         # Auth-specific hooks
│   └── services/      # Auth API services
├── posts/             # Posts feature
│   ├── components/
│   ├── hooks/
│   └── services/
└── users/             # Users feature
    ├── components/
    ├── hooks/
    └── services/
```

**Example**:
```typescript
// components/features/auth/components/LoginForm.tsx
import { useLogin } from '../../hooks/useLogin';

export function LoginForm() {
  const { login, loading, error } = useLogin();

  return (
    <form onSubmit={login}>
      {/* Form fields */}
    </form>
  );
}
```

#### Shared Components (`/components/shared/`)

Reusable components that don't belong to any specific feature.

**Structure**:
```
shared/
├── Button/
├── Card/
├── Form/
├── Input/
├── Loader/
└── Modal/
```

---

### 2. **Hooks Layer** (`/hooks`)

Custom React hooks for reusable logic.

**Planned Hooks**:
```typescript
// hooks/useAuth.ts - Authentication logic
const { user, login, logout, loading } = useAuth();

// hooks/useRituals.ts - Ritual data management
const { rituals, createRitual, updateRitual } = useRituals();

// hooks/useLocalStorage.ts - Local storage operations
const [value, setValue] = useLocalStorage('key', defaultValue);

// hooks/useDebounce.ts - Debounce values
const debouncedValue = useDebounce(value, 500);
```

---

### 3. **Context Layer** (`/context`)

React Context for global state.

**Planned Providers**:
```typescript
// context/AuthContext.tsx - Authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // ... auth logic
};

// context/ThemeContext.tsx - Theme management
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  // ... theme logic
};
```

---

### 4. **Services Layer** (`/services`)

API integration layer using Axios and React Query.

**Structure**:
```typescript
// services/api.ts - Axios configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

// services/auth.service.ts - Auth API calls
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  // ...
};

// services/ritual.service.ts - Ritual API calls
export const ritualService = {
  getAll: () => api.get('/rituals'),
  getById: (id) => api.get(`/rituals/${id}`),
  create: (data) => api.post('/rituals', data),
  // ...
};
```

---

### 5. **Types Layer** (`/types`)

TypeScript type definitions.

**Example**:
```typescript
// types/auth.types.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  email_verified: boolean;
  // ...
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
  device: Device;
}

// types/ritual.types.ts
export interface Ritual {
  id: string;
  title: string;
  description: string;
  frequency: string;
  created_at: string;
}
```

---

### 6. **Utils Layer** (`/utils`)

Helper functions and utilities.

**Available Utils**:
```typescript
// lib/utils.ts - Class name utility
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Planned utilities:
// utils/format.ts - Date, number formatting
// utils/validation.ts - Form validation helpers
// utils/storage.ts - Local storage helpers
```

---

## 🛠️ Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 19.2.3 | UI framework |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Build Tool** | Vite | 7.3.1 | Fast build tool |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Components** | Shadcn/ui | - | Pre-built components |
| **State Management** | Zustand | 5.0.9 | Client state |
| **Data Fetching** | React Query | 5.90.16 | Server state |
| **Routing** | React Router | 7.12.0 | Client routing |
| **HTTP Client** | Axios | - | API calls |
| **Notifications** | Sonner | 2.0.7 | Toast notifications |
| **Testing** | Vitest | - | Unit tests |
| **Testing Lib** | React Testing Library | - | Component tests |

---

## 🎯 Code Conventions

### Component Standards

**Use functional components with hooks**:
```typescript
// ✅ Good
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  if (!user) return <Loader />;

  return <div>{user.name}</div>;
}

// ❌ Bad - No class components
class UserProfile extends React.Component {
  // ...
}
```

**TypeScript for props**:
```typescript
// ✅ Good - Interface for props
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} onClick={onClick}>
      {children}
    </button>
  );
}

// ❌ Bad - No types
export function Button({ variant, size, children, onClick }) {
  // ...
}
```

---

### File Naming

**Components**: PascalCase
```
components/features/auth/components/LoginForm.tsx
components/features/auth/components/RegisterForm.tsx
```

**Hooks**: camelCase with `use` prefix
```
hooks/useAuth.ts
hooks/useRituals.ts
hooks/useLocalStorage.ts
```

**Services**: camelCase with `.service` suffix
```
services/auth.service.ts
services/ritual.service.ts
services/api.ts
```

**Types**: camelCase with `.types` suffix
```
types/auth.types.ts
types/ritual.types.ts
types/index.ts
```

---

### Import Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react';
import { useRouter } from 'react-router';

// 2. Third-party libraries
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

// 3. Internal imports (use aliases)
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';

// 4. Types
import type { User } from '@/types/auth.types';

// 5. CSS modules (if any)
import styles from './Component.module.css';
```

---

### Component Organization

```
FeatureComponent/
├── index.ts              # Public API exports
├── FeatureComponent.tsx  # Main component
├── FeatureComponent.test.tsx  # Tests
├── components/          # Sub-components
│   ├── SubComponent1.tsx
│   └── SubComponent2.tsx
├── hooks/               # Feature-specific hooks
│   └── useFeatureLogic.ts
└── types.ts             # Feature-specific types
```

---

## 🚀 Getting Started

See [Local Development Setup](./local-development-setup.md) for detailed setup instructions.

**Quick Start**:
```bash
cd apps/frontend
npm install
npm run dev
```

**Access the app**: http://localhost:5173

---

## 📚 Related Documentation

- [Component Library](./frontend-component-library.md) - Shadcn/ui guide
- [State Management](./frontend-state-management.md) - Zustand and React Query
- [API Integration](./frontend-api-integration.md) - API service patterns
- [Development Guide](./frontend-development-guide.md) - Feature development workflow

---

## 🔄 Next Steps

1. **Authentication Flow**: Implement login, register, email verification components
2. **Routing Setup**: Configure protected routes and auth flow
3. **Context Providers**: Create AuthContext for global auth state
4. **API Services**: Set up authService with Axios interceptors
5. **Custom Hooks**: Build useAuth, useRituals hooks
6. **Form Validation**: Integrate React Hook Form + Zod
7. **Error Handling**: Add error boundaries and toast notifications
8. **Loading States**: Implement skeleton loaders
9. **Testing**: Write component and hook tests
10. **Performance**: Add code splitting and lazy loading
