# ADR 003: Feature-Based Frontend Organization

## Status
Accepted

## Context
The Finishd Platform frontend needs a scalable folder structure to accommodate growth and multiple developers.

## Decision
Organize frontend code by **features** rather than file types:
```
components/
  features/
    auth/
      components/
      hooks/
      services/
    rituals/
      components/
      hooks/
      services/
```

## Benefits
- Easy to locate feature-related code
- Clear boundaries for code splitting
- Team can work on features independently
- Natural lazy loading boundaries

## Consequences
- May duplicate some code across features (extract to shared when needed)
- More folders initially

## Alternatives Considered
- **Type-based** (components/, hooks/, services/): Harder to find related code
- **Atomic Design**: Too complex for current team size

---

## Date
January 12, 2026
