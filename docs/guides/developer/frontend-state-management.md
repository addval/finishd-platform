# Frontend State Management - Rituality Platform

## 📋 Overview

This document covers state management strategies in the Rituality Platform frontend using React Query and Zustand.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🎯 State Management Architecture

The platform uses a **hybrid approach**:

- **React Query**: Server state (API data, caching, synchronization)
- **Zustand**: Client state (UI state, user preferences, forms)
- **React Context**: Global state (auth, theme - when needed)

---

## 📊 React Query (Server State)

### Purpose

Manage server data with automatic caching, refetching, and synchronization.

### Setup

**Already configured** in `apps/frontend/src/main.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Usage Examples

**Fetch data**:

```typescript
import { useQuery } from '@tanstack/react-query'
import { ritualService } from '@/services/ritual.service'

function RitualsList() {
  const { data: rituals, isLoading, error } = useQuery({
    queryKey: ['rituals'],
    queryFn: () => ritualService.getAll(),
  })

  if (isLoading) return <Loader />
  if (error) return <Error message={error.message} />

  return (
    <div>
      {rituals?.map(ritual => <RitualCard key={ritual.id} ritual={ritual} />)}
    </div>
  )
}
```

**Create data**:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function CreateRitualForm() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateRitualDto) => ritualService.create(data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['rituals'] })
      toast.success('Ritual created!')
    },
  })

  const handleSubmit = (data) => {
    createMutation.mutate(data)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## 🗄️ Zustand (Client State)

### Purpose

Lightweight state management for UI state, forms, and user preferences.

### Installation

```bash
npm install zustand
```

### Creating a Store

```typescript
// stores/authStore.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
```

### Usage

```typescript
function UserProfile() {
  const { user, logout } = useAuthStore()

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

## 📚 Best Practices

### When to Use What?

| Scenario | Solution |
|----------|----------|
| Fetch API data | React Query |
| Create/update/delete | React Query mutations |
| Form input state | useState or Zustand |
| User preferences | Zustand |
| Auth token | Zustand + localStorage |
| UI state (modals, tabs) | useState |
| Complex global state | Zustand |

### Patterns

**Combine React Query + Zustand**:

```typescript
// Zustand for auth state
const { token } = useAuthStore()

// React Query for data fetching (uses token from Zustand)
const { data } = useQuery({
  queryKey: ['rituals'],
  queryFn: () => ritualService.getAll(token),
})
```

---

## 📖 Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
