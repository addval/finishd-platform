# ADR 001: MVC + Service Layer Architecture

## Status
Accepted

## Context
The Finishd Platform backend requires a scalable, maintainable architecture to handle business logic complexity as the application grows.

## Decision
Adopt **MVC (Model-View-Controller) + Service Layer** pattern:
- **Controllers**: Thin HTTP request/response handlers
- **Services**: Fat business logic layer
- **Schema/Models**: Data access with Drizzle ORM

## Benefits
- Clear separation of concerns
- Testable business logic (services isolated from HTTP)
- Reusable services across multiple controllers
- Easy to maintain and scale

## Consequences
- More files and boilerplate initially
- Team must follow the pattern consistently
- Requires understanding of layer responsibilities

## Alternatives Considered
- **MVC only**: Controllers become bloated with business logic
- **Clean Architecture**: Too complex for current needs
- **Layered Architecture**: Similar to chosen approach

---

## Date
January 12, 2026
