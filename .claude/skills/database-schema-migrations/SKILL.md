---
name: database-schema-migrations
description: Design PostgreSQL database schemas with Drizzle ORM, manage migrations, create type-safe schema definitions, and implement database best practices. Use when creating tables, modifying schema, setting up relationships, or working with database operations.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Database Schema & Migrations

Comprehensive guide for PostgreSQL database design with Drizzle ORM, migrations, and best practices.

## Core Principles

### Type-Safe Schema First
- **Schema** defines tables, columns, and relations in TypeScript
- **Migrations** are generated from schema changes
- **Types** are inferred from schema automatically

### Naming Conventions

| Level | Convention | Example |
|-------|-----------|---------|
| Database Table | snake_case, plural | `user_profiles`, `order_items` |
| Schema Variable | camelCase | `userProfiles`, `orderItems` |
| TypeScript Fields | camelCase | `firstName`, `orderId` |
| Database Columns | snake_case | `first_name`, `order_id` |

## Quick Start

### Creating a New Table

1. Define table in `src/db/schema.ts`
2. Add relations if needed
3. Export types
4. Push to database: `pnpm db:push` (dev) or `pnpm db:generate && pnpm db:migrate` (prod)

### Modifying Existing Table

1. Update table definition in `src/db/schema.ts`
2. Push changes: `pnpm db:push`

## File Structure

```
backend/src/db/
├── schema.ts       # All table definitions, relations, and types
├── index.ts        # Database connection and client export
├── migrate.ts      # Migration runner for production
└── seed-finishd.ts # Seed data for development
```

## Schema Definition

### Basic Table

```typescript
// src/db/schema.ts
import { pgTable, uuid, varchar, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_users_email').on(table.email),
]);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Using Enums

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);
export const roleEnum = pgEnum('role', ['user', 'admin', 'super_admin']);

export const users = pgTable('users', {
  // ...
  status: userStatusEnum('status').default('active').notNull(),
  role: roleEnum('role').default('user').notNull(),
});
```

### Foreign Keys

```typescript
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_posts_author_id').on(table.authorId),
]);
```

### Defining Relations

```typescript
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

### JSON Columns

```typescript
export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  rooms: jsonb('rooms').$type<{
    bedrooms?: number;
    bathrooms?: number;
    livingAreas?: number;
  }>(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
});
```

### Many-to-Many Relations

```typescript
// Junction table
export const postTags = pgTable('post_tags', {
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.postId, table.tagId] }),
]);

// Relations
export const postsRelations = relations(posts, ({ many }) => ({
  postTags: many(postTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));
```

## Database Commands

```bash
# Push schema directly to database (development)
pnpm db:push

# Generate migrations from schema changes
pnpm db:generate

# Run pending migrations (production)
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Run seed data
pnpm db:seed:finishd
```

## Query Examples

### Basic Queries

```typescript
import { db } from '../db';
import { users } from '../db/schema';
import { eq, and, or, like, desc } from 'drizzle-orm';

// Find one
const [user] = await db.select().from(users).where(eq(users.email, 'test@example.com'));

// Find all with conditions
const activeUsers = await db.select()
  .from(users)
  .where(and(
    eq(users.isActive, true),
    like(users.firstName, '%John%')
  ))
  .orderBy(desc(users.createdAt));

// Insert
const [newUser] = await db.insert(users).values({
  email: 'new@example.com',
  firstName: 'John',
  lastName: 'Doe',
}).returning();

// Update
await db.update(users)
  .set({ isActive: false })
  .where(eq(users.id, userId));

// Delete
await db.delete(users).where(eq(users.id, userId));
```

### Queries with Relations

```typescript
// Using the query API with relations
const result = await db.query.posts.findMany({
  where: eq(posts.status, 'published'),
  with: {
    author: true,
    postTags: {
      with: {
        tag: true,
      },
    },
  },
});
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({
    email: 'new@example.com',
    firstName: 'John',
    lastName: 'Doe',
  }).returning();

  await tx.insert(userPermissions).values({
    userId: user.id,
    notificationsEnabled: true,
  });
});
```

## Best Practices

### 1. Always Use Type Inference

```typescript
// Export types from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Use in services
async function createUser(data: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}
```

### 2. Add Indexes for Performance

```typescript
export const users = pgTable('users', {
  // columns...
}, (table) => [
  index('idx_users_email').on(table.email),
  index('idx_users_status').on(table.status),
  index('idx_users_created_at').on(table.createdAt),
]);
```

### 3. Use Appropriate Data Types

| Use Case | Drizzle Type | Example |
|----------|-------------|---------|
| Short text | `varchar(255)` | Email, username |
| Long text | `text` | Post content |
| UUID | `uuid` | Primary keys |
| Integer | `integer` | Count, quantity |
| Decimal | `decimal(10, 2)` | Price, amount |
| Boolean | `boolean` | Flags |
| Date/time | `timestamp` | Created at |
| Enum | `pgEnum` | Status, role |
| JSON | `jsonb` | Metadata |

### 4. Soft Deletes Pattern

```typescript
export const users = pgTable('users', {
  // ...
  deletedAt: timestamp('deleted_at'),
});

// Query only active records
const activeUsers = await db.select()
  .from(users)
  .where(isNull(users.deletedAt));
```

## Drizzle Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
