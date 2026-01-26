# React Hooks - Patterns and Examples

## Data Fetching Hooks

### useFetch Hook

```typescript
// hooks/useFetch.ts
import { useState, useEffect, useCallback } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, options);
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
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
```

### useAsync Hook

```typescript
// hooks/useAsync.ts
import { useState, useEffect } from 'react';

type AsyncFunction<T> = () => Promise<T>;

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>(asyncFunction: AsyncFunction<T>, dependencies: any[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    asyncFunction()
      .then((data) => {
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
}

// Usage
const { data, loading, error } = useAsync(() => fetchUser(userId), [userId]);
```

## Form Hooks

### useForm Hook

```typescript
// hooks/useForm.ts
import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<keyof T, string>;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((name: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setValues(prev => ({ ...prev, [name]: e.target.value }));
  }, []);

  const handleBlur = useCallback((name: keyof T) => () => {
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
      setValues(initialValues);
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  }, [values, validate, onSubmit, initialValues]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    submitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
}

// Usage
interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm = () => {
  const {
    values,
    errors,
    submitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
    validate: (values) => {
      const errors: any = {};
      if (!values.email) errors.email = 'Email is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    },
    onSubmit: async (values) => {
      await login(values.email, values.password);
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
      />
      {errors.email && <span>{errors.email}</span>}
      <button type="submit" disabled={submitting}>Login</button>
    </form>
  );
};
```

## Utility Hooks

### useDebounce Hook

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

useEffect(() => {
  // Perform search with debounced term
  performSearch(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

### useLocalStorage Hook

```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

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

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
setTheme('dark');
```

### useToggle Hook

```typescript
// hooks/useToggle.ts
import { useCallback, useState } from 'react';

export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return { value, toggle, setTrue, setFalse, setValue };
}

// Usage
const { value: isOpen, toggle, setTrue: open, setFalse: close } = useToggle();
```

### usePrevious Hook

```typescript
// hooks/usePrevious.ts
import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
const [count, setCount] = useState(0);
const prevCount = usePrevious(count);

useEffect(() => {
  if (prevCount !== count) {
    console.log(`Count changed from ${prevCount} to ${count}`);
  }
}, [count, prevCount]);
```

## Lifecycle Hooks

### useOnMount Hook

```typescript
// hooks/useOnMount.ts
import { useEffect } from 'react';

export function useOnMount(callback: () => void) {
  useEffect(callback, []);
}

// Usage
useOnMount(() => {
  console.log('Component mounted');
  analytics.track('page_view');
});
```

### useOnUnmount Hook

```typescript
// hooks/useOnUnmount.ts
import { useEffect } from 'react';

export function useOnUnmount(callback: () => void) {
  useEffect(() => {
    return () => {
      callback();
    };
  }, [callback]);
}

// Usage
useOnUnmount(() => {
  console.log('Component unmounted');
  cleanup();
});
```

### useUpdateEffect Hook

```typescript
// hooks/useUpdateEffect.ts
import { useEffect, useRef } from 'react';

export function useUpdateEffect(callback: () => void, dependencies: any[]) {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      callback();
    } else {
      isMounted.current = true;
    }
  }, dependencies);
}

// Usage
// Skip the first render, run on updates
useUpdateEffect(() => {
  console.log('Component updated');
}, [someValue]);
```

## Browser API Hooks

### useMediaQuery Hook

```typescript
// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery('(max-width: 768px)');
const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
```

### useViewport Hook

```typescript
// hooks/useViewport.ts
import { useState, useEffect } from 'react';

interface ViewportSize {
  width: number;
  height: number;
}

export function useViewport(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

// Usage
const { width, height } = useViewport();
const isTablet = width >= 768 && width < 1024;
```

### useOnClickOutside Hook

```typescript
// hooks/useOnClickOutside.ts
import { useEffect, RefObject } from 'react';

export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Usage
const ref = useRef<HTMLDivElement>(null);
useOnClickOutside(ref, () => {
  console.log('Clicked outside');
  closeDropdown();
});
```

## Animation Hooks

### useTimeout Hook

```typescript
// hooks/useTimeout.ts
import { useEffect, useRef } from 'react';

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const timer = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);
}

// Usage
useTimeout(() => {
  console.log('Timeout fired!');
}, 5000);
```

### useInterval Hook

```typescript
// hooks/useInterval.ts
import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const timer = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(timer);
  }, [delay]);
}

// Usage
useInterval(() => {
  console.log('Interval tick');
}, 1000);
```

## Advanced Patterns

### useReducerWithLocalStorage Hook

```typescript
// hooks/useReducerWithLocalStorage.ts
import { useReducer, useEffect } from 'react';

export function useReducerWithLocalStorage<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  localStorageKey: string
) {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    const saved = localStorage.getItem(localStorageKey);
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [localStorageKey, state]);

  return [state, dispatch] as const;
}
```

### useLogger Hook

```typescript
// hooks/useLogger.ts
import { useEffect } from 'react';

export function useLogger<T>(value: T, name: string = 'value') {
  useEffect(() => {
    console.log(`${name} changed:`, value);
  }, [value, name]);
}

// Usage
const [count, setCount] = useState(0);
useLogger(count, 'count');
```

## Best Practices

1. **Always start hook names with "use"**
2. **Keep hooks focused and reusable**
3. **Return consistent types from custom hooks**
4. **Clean up side effects in useEffect**
5. **Use TypeScript for type safety**
6. **Document hook usage and parameters**
7. **Test hooks separately**
8. **Don't call hooks inside loops or conditions**
9. **Extract complex logic into custom hooks**
10. **Use dependency arrays correctly in useEffect**
