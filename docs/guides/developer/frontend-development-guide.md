# Frontend Development Guide - Rituality Platform

## 📋 Overview

This guide covers the development workflow for adding new features to the Rituality Platform frontend.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🎯 Feature Development Workflow

### 1. Create Feature Structure

```bash
cd apps/frontend/src/components/features
mkdir my-feature
cd my-feature
mkdir components hooks services types
```

**Structure**:
```
my-feature/
├── components/
│   ├── MyFeatureList.tsx
│   └── MyFeatureCard.tsx
├── hooks/
│   └── useMyFeature.ts
├── services/
│   └── myFeature.service.ts
├── types/
│   └── myFeature.types.ts
└── index.ts
```

### 2. Define Types

```typescript
// types/myFeature.types.ts
export interface MyFeature {
  id: string
  title: string
  description: string
}

export interface CreateMyFeatureDto {
  title: string
  description: string
}
```

### 3. Create Service

```typescript
// services/myFeature.service.ts
import { api } from '@/services/api'

export const myFeatureService = {
  getAll: () => api.get('/my-features'),
  getById: (id: string) => api.get(`/my-features/${id}`),
  create: (data: CreateMyFeatureDto) => api.post('/my-features', data),
}
```

### 4. Create Hook

```typescript
// hooks/useMyFeature.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { myFeatureService } from '../services/myFeature.service'

export function useMyFeature() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-features'],
    queryFn: () => myFeatureService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: myFeatureService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-features'] })
    },
  })

  return { data, isLoading, createMutation }
}
```

### 5. Create Components

```typescript
// components/MyFeatureList.tsx
import { useMyFeature } from '../../hooks/useMyFeature'

export function MyFeatureList() {
  const { data, isLoading } = useMyFeature()

  if (isLoading) return <Loader />

  return (
    <div>
      {data?.map(item => <MyFeatureCard key={item.id} item={item} />)}
    </div>
  )
}
```

### 6. Add Route

```typescript
// App.tsx
import { MyFeatureList } from '@/components/features/my-feature'

<Route path="/my-features" element={<MyFeatureList />} />
```

---

## ✅ Code Quality

### Component Checklist

- [ ] TypeScript types defined
- [ ] Props interface exported
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Empty state handled
- [ ] Accessibility (ARIA labels)
- [ ] Responsive design

---

## 🧪 Testing

```typescript
// hooks/useMyFeature.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useMyFeature } from './useMyFeature'

test('fetches data', async () => {
  const { result } = renderHook(() => useMyFeature())

  await waitFor(() => {
    expect(result.current.data).toHaveLength(3)
  })
})
```

---

## 📚 Resources

- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
