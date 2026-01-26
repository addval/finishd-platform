# Frontend API Integration - Rituality Platform

## 📋 Overview

This document covers API integration patterns using Axios and React Query in the Rituality Platform frontend.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🔧 Setup

### Axios Configuration

Create `apps/frontend/src/services/api.ts`:

```typescript
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (add auth token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)
```

---

## 📡 Service Layer

### Auth Service

```typescript
// services/auth.service.ts
import { api } from './api'

export const authService = {
  register: (data: RegisterDto) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  verifyEmail: (email: string, code: string) => api.post('/auth/verify-email', { email, code }),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refresh_token: refreshToken }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
}
```

### Ritual Service

```typescript
// services/ritual.service.ts
import { api } from './api'

export const ritualService = {
  getAll: () => api.get('/rituals'),
  getById: (id: string) => api.get(`/rituals/${id}`),
  create: (data: CreateRitualDto) => api.post('/rituals', data),
  update: (id: string, data: UpdateRitualDto) => api.patch(`/rituals/${id}`, data),
  delete: (id: string) => api.delete(`/rituals/${id}`),
}
```

---

## 🔄 React Query Integration

### Fetching Data

```typescript
import { useQuery } from '@tanstack/react-query'
import { ritualService } from '@/services/ritual.service'

function RitualsList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rituals'],
    queryFn: () => ritualService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) return <Loader />
  if (error) return <Error message={error.message} />

  return data.map(ritual => <RitualCard key={ritual.id} ritual={ritual} />)
}
```

### Mutations (Create/Update/Delete)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ritualService } from '@/services/ritual.service'
import { toast } from 'sonner'

function CreateRitualForm() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateRitualDto) => ritualService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] })
      toast.success('Ritual created!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create ritual')
    },
  })

  return <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData) }}>...</form>
}
```

---

## 📝 Environment Variables

**Create** `apps/frontend/.env`:

```bash
VITE_API_URL=http://localhost:3000/api
```

**Usage**:

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

---

## 📚 Resources

- [Axios Docs](https://axios-http.com/)
- [React Query Docs](https://tanstack.com/query/latest)
