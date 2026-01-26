---
name: react-component-development
description: Create React components with TypeScript, custom hooks, state management, and best practices. Use when building UI components, implementing hooks, managing state, or structuring React applications.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# React Component Development

Build production-ready React components with TypeScript, modern hooks, and best practices for scalable applications.

## Architecture Principles

### Feature-Based Structure

Organize components by feature/domain rather than type:

```
src/
├── components/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── PasswordReset.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   └── index.ts
│   │   └── posts/
│   │       ├── components/
│   │       │   ├── PostList.tsx
│   │       │   ├── PostCard.tsx
│   │       │   └── CreatePost.tsx
│   │       ├── hooks/
│   │       │   └── usePosts.ts
│   │       └── services/
│   │           └── post.service.ts
│   └── shared/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Loader.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── useFetch.ts
├── context/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── utils/
│   ├── helpers.ts
│   └── validators.ts
└── types/
    ├── index.ts
    └── api.types.ts
```

## Component Best Practices

### 1. Functional Components Only

```typescript
// ✅ GOOD - Functional component with hooks
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

export const UserProfile: React.FC<{ userId: number }> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <Loader />;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};
```

### 2. TypeScript for Everything

```typescript
// types/index.ts
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string | null;
}

// components/PostCard.tsx
import { User } from '../../types';

interface PostCardProps {
  id: number;
  title: string;
  excerpt: string;
  author: User;
  publishedAt: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  excerpt,
  author,
  publishedAt,
  onEdit,
  onDelete
}) => {
  return (
    <article className="post-card">
      <h3>{title}</h3>
      <p>{excerpt}</p>
      <div className="post-meta">
        <span>By {author.firstName} {author.lastName}</span>
        <time>{new Date(publishedAt).toLocaleDateString()}</time>
      </div>
      <div className="post-actions">
        {onEdit && <button onClick={() => onEdit(id)}>Edit</button>}
        {onDelete && <button onClick={() => onDelete(id)}>Delete</button>}
      </div>
    </article>
  );
};
```

### 3. Custom Hooks for Logic Reuse

```typescript
// hooks/useFetch.ts
import { useState, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
```

```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

```typescript
// hooks/useAuth.ts
import { useContext, createContext } from 'react';
import { AuthContextValue, User } from '../types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 4. Proper State Management

```typescript
// components/features/posts/CreatePost.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePostInput } from '../../../types';
import { createPost } from '../services/post.service';

export const CreatePost: React.FC = () => {
  const [formData, setFormData] = useState<CreatePostInput>({
    title: '',
    content: '',
    tags: [],
    status: 'draft'
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      alert('Post created successfully!');
      setFormData({ title: '', content: '', tags: [], status: 'draft' });
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Post title"
        required
      />
      <textarea
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder="Post content"
        required
      />
      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
};
```

### 5. Context for Global State

```typescript
// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Verify token and get user
        try {
          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const { user, token } = await response.json();
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Component Patterns

### Container/Presenter Pattern

```typescript
// components/features/posts/PostListContainer.tsx
import { PostList } from './PostList';
import { usePosts } from '../hooks/usePosts';

export const PostListContainer: React.FC = () => {
  const { posts, loading, error, refetch } = usePosts();

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return <PostList posts={posts} onRefresh={refetch} />;
};

// components/features/posts/PostList.tsx
import { Post } from '../../../types';

interface PostListProps {
  posts: Post[];
  onRefresh: () => void;
}

export const PostList: React.FC<PostListProps> = ({ posts, onRefresh }) => {
  return (
    <div>
      <button onClick={onRefresh}>Refresh</button>
      {posts.map(post => (
        <PostCard key={post.id} {...post} />
      ))}
    </div>
  );
};
```

### Compound Components

```typescript
// components/shared/Tabs.tsx
import { useState, ReactNode } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export const Tabs: React.FC<{ defaultTab: string; children: ReactNode }> & {
  Tab: typeof Tab;
  TabList: typeof TabList;
  TabPanel: typeof TabPanel;
} = ({ defaultTab, children }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

const TabList: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="tab-list">{children}</div>;
};

const Tab: React.FC<{ value: string; children: ReactNode }> = ({ value, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab must be used within Tabs');

  const { activeTab, setActiveTab } = context;

  return (
    <button
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

const TabPanel: React.FC<{ value: string; children: ReactNode }> = ({ value, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabPanel must be used within Tabs');

  const { activeTab } = context;

  if (activeTab !== value) return null;

  return <div className="tab-panel">{children}</div>;
};

Tabs.TabList = TabList;
Tabs.Tab = Tab;
Tabs.TabPanel = TabPanel;

// Usage
<Tabs defaultTab="tab1">
  <Tabs.TabList>
    <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
  </Tabs.TabList>
  <Tabs.TabPanel value="tab1">Content 1</Tabs.TabPanel>
  <Tabs.TabPanel value="tab2">Content 2</Tabs.TabPanel>
</Tabs>
```

## Performance Optimization

### useMemo for Expensive Computations

```typescript
import { useMemo } from 'react';

export const ExpensiveComponent: React.FC<{ items: number[] }> = ({ items }) => {
  const sortedItems = useMemo(() => {
    console.log('Sorting...');
    return items.sort((a, b) => a - b);
  }, [items]);

  return <div>{sortedItems.join(', ')}</div>;
};
```

### useCallback for Function Stability

```typescript
import { useCallback } from 'react';

export const ParentComponent: React.FC = () => {
  const handleClick = useCallback((id: number) => {
    console.log('Clicked:', id);
  }, []);

  return <ChildComponent onClick={handleClick} />;
};
```

### React.memo for Component Memoization

```typescript
export const ExpensiveChild = React.memo<{ value: number }>(({ value }) => {
  console.log('Rendering ExpensiveChild');
  return <div>{value}</div>;
});
```

### Code Splitting and Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export const App: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <HeavyComponent />
    </Suspense>
  );
};
```

## Form Handling

### Controlled Components

```typescript
export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Additional Resources

- [COMPONENTS.md](COMPONENTS.md) - Component patterns and examples
- [HOOKS.md](HOOKS.md) - Custom hooks and patterns

See detailed implementation examples in the supporting documentation.
