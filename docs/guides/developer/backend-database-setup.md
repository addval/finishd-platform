# Backend Database Setup - Finishd Platform

## Overview

This document provides a comprehensive guide for setting up, managing, and working with the PostgreSQL database in the Finishd Platform using Drizzle ORM.

**Last Updated**: January 28, 2026
**Version**: 2.0.0

---

## Database Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Database** | PostgreSQL | 14+ | Relational database |
| **ORM** | Drizzle ORM | 0.38+ | Type-safe database abstraction |
| **Migrations** | Drizzle Kit | 0.30+ | Schema version control |
| **GUI** | Drizzle Studio | - | Database visualization |

---

## Database Overview

### Connection Details

**Environment Variables** (`.env`):
```bash
DATABASE_URL=postgres://postgres:password@localhost:5432/finishd_platform
```

### Naming Conventions

- **Database Columns**: `snake_case` (e.g., `email_verified_at`, `created_at`)
- **TypeScript Fields**: `camelCase` in schema (e.g., `emailVerifiedAt`, `createdAt`)
- **Table Names**: Plural `snake_case` (e.g., `users`, `designer_profiles`)
- **Table Variables**: `camelCase` in code (e.g., `users`, `designerProfiles`)

---

## Initial Setup

### Prerequisites

1. **PostgreSQL Installation**:
   ```bash
   # macOS (Homebrew)
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql-14
   sudo systemctl start postgresql

   # Windows
   # Download from: https://www.postgresql.org/download/windows/
   ```

2. **Create Database**:
   ```bash
   # Login to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE finishd_platform;

   # Exit
   \q
   ```

3. **Install Dependencies**:
   ```bash
   cd apps/backend
   pnpm install
   ```

4. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

---

## Drizzle Schema

### Schema Location

The database schema is defined in: `apps/backend/src/db/schema.ts`

### Schema Structure

```typescript
// Example schema definition
import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  userType: userTypeEnum('user_type'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Defining Relations

```typescript
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ one }) => ({
  homeownerProfile: one(homeownerProfiles, {
    fields: [users.id],
    references: [homeownerProfiles.userId],
  }),
}));
```

---

## Database Commands

### Development Workflow

**Push schema directly (recommended for development)**:
```bash
pnpm db:push
```
This directly syncs your schema with the database without generating migration files.

**Open Drizzle Studio (database GUI)**:
```bash
pnpm db:studio
```

### Production Workflow

**Generate migrations from schema changes**:
```bash
pnpm db:generate
```

**Run pending migrations**:
```bash
pnpm db:migrate
```

### Seed Data

**Run Finishd seed data**:
```bash
pnpm db:seed:finishd
```

This creates test data including:
- 10 homeowners with properties
- 6 interior designers (4 verified)
- 4 contractors (3 verified)
- Projects in various states
- Sample requests, proposals, tasks, milestones

---

## Working with Drizzle

### Basic Queries

**Find records**:
```typescript
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Find one
const user = await db.select().from(users).where(eq(users.phone, '1234567890')).limit(1);

// Find all
const allUsers = await db.select().from(users);
```

**Insert records**:
```typescript
const [newUser] = await db.insert(users).values({
  phone: '1234567890',
  userType: 'homeowner',
}).returning();
```

**Update records**:
```typescript
await db.update(users)
  .set({ isActive: false })
  .where(eq(users.id, userId));
```

**Delete records**:
```typescript
await db.delete(users).where(eq(users.id, userId));
```

### Joins with Relations

```typescript
// Using relations (requires relations defined in schema)
const result = await db.query.projects.findMany({
  with: {
    homeowner: true,
    designer: true,
    tasks: true,
  },
});
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({
    phone: '1234567890',
    userType: 'homeowner',
  }).returning();

  await tx.insert(homeownerProfiles).values({
    userId: user.id,
    name: 'John Doe',
  });
});
```

---

## Schema Best Practices

### 1. Use Type-Safe Enums

```typescript
export const userTypeEnum = pgEnum('user_type', ['homeowner', 'designer', 'contractor']);
```

### 2. Add Indexes for Performance

```typescript
export const users = pgTable('users', {
  // columns...
}, (table) => [
  index('idx_users_phone').on(table.phone),
  index('idx_users_user_type').on(table.userType),
]);
```

### 3. Use JSON for Flexible Data

```typescript
rooms: jsonb('rooms').$type<{
  bedrooms?: number;
  bathrooms?: number;
}>(),
```

### 4. Export Types

```typescript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

---

## Troubleshooting

### Common Issues

**1. Connection refused**:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Check if PostgreSQL is running:
```bash
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql       # Linux
```

**2. Database doesn't exist**:
```
Error: database "finishd_platform" does not exist
```
**Solution**: Create the database:
```bash
psql -U postgres -c "CREATE DATABASE finishd_platform;"
```

**3. Relation does not exist**:
```
Error: relation "table_name" does not exist
```
**Solution**: Push the schema to the database:
```bash
pnpm db:push
```

**4. Schema out of sync**:
If your schema changes don't appear, run:
```bash
pnpm db:push --force
```

---

## Related Documentation

- [Backend Architecture](./backend-architecture.md) - Architecture overview
- [Services Guide](./backend-services-guide.md) - Service layer patterns
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
