# Drizzle Schema - Complete Guide

## Schema Definition Patterns

### Basic Table Structure

```typescript
// db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core"

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
  ]
)

// Type inference - Get types from schema
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### Using Enums

```typescript
import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core"

// Define PostgreSQL enum
export const userRoleEnum = pgEnum("user_role", ["admin", "user", "moderator"])
export const statusEnum = pgEnum("status", ["draft", "published", "archived"])

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  status: statusEnum("status").default("draft").notNull(),
  authorId: uuid("author_id").notNull(),
})

export type PostStatus = "draft" | "published" | "archived"
```

### JSON/JSONB Columns

```typescript
import { pgTable, uuid, varchar, jsonb } from "drizzle-orm/pg-core"

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  // Type-safe JSONB with custom type
  settings: jsonb("settings").$type<{
    theme: "light" | "dark"
    notifications: boolean
    language: string
  }>().default({ theme: "light", notifications: true, language: "en" }),
  // Array of strings
  tags: jsonb("tags").$type<string[]>().default([]),
  // Complex nested object
  metadata: jsonb("metadata").$type<{
    preferences?: Record<string, unknown>
    lastLogin?: string
  }>(),
})

export type Profile = typeof profiles.$inferSelect
export type ProfileSettings = Profile["settings"]
```

### Timestamps and Defaults

```typescript
import { pgTable, uuid, timestamp, text, boolean, sql } from "drizzle-orm/pg-core"

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),

  // Auto-set on insert
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Auto-update (requires trigger or application-level handling)
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // Custom SQL default
  publishedAt: timestamp("published_at"),

  // Soft delete pattern
  deletedAt: timestamp("deleted_at"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
})
```

### Indexes and Constraints

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  index,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core"

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sku: varchar("sku", { length: 50 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    category: varchar("category", { length: 100 }),
    price: integer("price").notNull(), // Store as cents
    stock: integer("stock").default(0).notNull(),
  },
  (table) => [
    // Single column unique index
    uniqueIndex("idx_products_sku").on(table.sku),
    // Composite index
    index("idx_products_category_price").on(table.category, table.price),
    // Expression index (for searching)
    index("idx_products_name_lower").on(sql`lower(${table.name})`),
  ]
)
```

## Query Patterns with Drizzle

### Basic CRUD Operations

```typescript
import { eq, and, or, ne, gt, lt, gte, lte, like, ilike, inArray, isNull, isNotNull } from "drizzle-orm"
import { db } from "./db"
import { users, type User, type NewUser } from "./schema"

// CREATE
async function createUser(data: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning()
  return user
}

// READ - Single record
async function getUserById(id: string): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
  })
}

// READ - Multiple records
async function getActiveUsers(): Promise<User[]> {
  return await db.query.users.findMany({
    where: eq(users.isActive, true),
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  })
}

// UPDATE
async function updateUser(id: string, data: Partial<NewUser>): Promise<User | undefined> {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return updated
}

// DELETE
async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id))
}

// Soft delete
async function softDeleteUser(id: string): Promise<void> {
  await db
    .update(users)
    .set({ deletedAt: new Date(), isActive: false })
    .where(eq(users.id, id))
}
```

### Complex Queries

```typescript
import { eq, and, or, like, ilike, between, sql, desc, asc } from "drizzle-orm"

// Search with multiple conditions
async function searchUsers(query: string, filters: {
  isActive?: boolean
  minAge?: number
  maxAge?: number
}) {
  return await db.query.users.findMany({
    where: and(
      or(
        ilike(users.firstName, `%${query}%`),
        ilike(users.lastName, `%${query}%`),
        ilike(users.email, `%${query}%`)
      ),
      filters.isActive !== undefined ? eq(users.isActive, filters.isActive) : undefined,
    ),
    orderBy: [desc(users.createdAt)],
  })
}

// Pagination
async function getPaginatedUsers(page: number, limit: number) {
  const offset = (page - 1) * limit

  const [data, countResult] = await Promise.all([
    db.query.users.findMany({
      limit,
      offset,
      orderBy: [desc(users.createdAt)],
    }),
    db.select({ count: sql<number>`count(*)::int` }).from(users),
  ])

  const total = countResult[0].count

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  }
}
```

### Aggregations

```typescript
import { sql, count, sum, avg, min, max } from "drizzle-orm"

// Count
async function countActiveUsers(): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.isActive, true))
  return result[0].count
}

// Group by with aggregation
async function getUserCountByRole() {
  return await db
    .select({
      role: users.role,
      count: count(),
    })
    .from(users)
    .groupBy(users.role)
}

// Sum
async function getTotalOrderValue() {
  const result = await db
    .select({ total: sum(orders.amount) })
    .from(orders)
    .where(eq(orders.status, "completed"))
  return result[0].total
}
```

### Transactions

```typescript
import { db } from "./db"
import { accounts, transactions } from "./schema"
import { eq, sql } from "drizzle-orm"

async function transferFunds(
  fromAccountId: string,
  toAccountId: string,
  amount: number
) {
  return await db.transaction(async (tx) => {
    // Get accounts with lock
    const fromAccount = await tx.query.accounts.findFirst({
      where: eq(accounts.id, fromAccountId),
    })

    const toAccount = await tx.query.accounts.findFirst({
      where: eq(accounts.id, toAccountId),
    })

    if (!fromAccount || !toAccount) {
      throw new Error("Account not found")
    }

    if (fromAccount.balance < amount) {
      throw new Error("Insufficient funds")
    }

    // Perform transfer
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} - ${amount}` })
      .where(eq(accounts.id, fromAccountId))

    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} + ${amount}` })
      .where(eq(accounts.id, toAccountId))

    // Create transaction record
    const [record] = await tx
      .insert(transactions)
      .values({
        fromAccountId,
        toAccountId,
        amount,
        type: "transfer",
        status: "completed",
      })
      .returning()

    return record
  })
}
```

### Raw SQL Queries

```typescript
import { sql } from "drizzle-orm"

// Raw SQL with type safety
async function getTopCustomers(limit: number) {
  return await db.execute(sql`
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      COUNT(o.id) as order_count,
      SUM(o.total) as total_spent
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.is_active = true
    GROUP BY u.id, u.first_name, u.last_name
    HAVING COUNT(o.id) > 0
    ORDER BY total_spent DESC
    LIMIT ${limit}
  `)
}

// SQL template literals
async function searchProducts(searchTerm: string) {
  return await db.execute(sql`
    SELECT * FROM products
    WHERE name ILIKE ${`%${searchTerm}%`}
    ORDER BY created_at DESC
  `)
}
```

## Migrations with Drizzle Kit

### Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
```

### Migration Commands

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Push schema directly (development)
pnpm drizzle-kit push

# Apply migrations
pnpm drizzle-kit migrate

# Open Drizzle Studio (database GUI)
pnpm drizzle-kit studio
```

### Migration File Example

```sql
-- 0001_create_users.sql
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "password_hash" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
```

## Best Practices

1. **Schema-First Design**: Define your schema in TypeScript and let Drizzle generate migrations
2. **Use Type Inference**: Leverage `$inferSelect` and `$inferInsert` for type safety
3. **JSONB for Flexible Data**: Use typed JSONB columns for structured flexible data
4. **Index Strategically**: Add indexes on frequently queried columns
5. **Use Transactions**: Wrap multi-step operations in transactions
6. **Soft Deletes**: Consider soft deletes for audit trails
7. **Naming Conventions**: Use snake_case for database columns, camelCase in TypeScript
8. **Relations in Schema**: Define relations separately from tables for better organization
9. **Environment-Specific Configs**: Use different configs for dev/prod migrations
10. **Test Migrations**: Always test migrations on a copy of production data
