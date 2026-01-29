# Drizzle Relations - Complete Guide

## Relation Types

Drizzle ORM supports all standard relationship types through the `relations` function:

1. **One-to-One** - User has one Profile
2. **One-to-Many** - User has many Posts
3. **Many-to-One** - Post belongs to User
4. **Many-to-Many** - Post has many Tags (through junction table)

## 1. One-to-One Relations

### Example: User has one Profile

```typescript
// db/schema.ts
import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core"

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Profiles table (one-to-one with users)
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique() // Unique constraint enforces one-to-one
      .references(() => users.id, { onDelete: "cascade" }),
    bio: text("bio"),
    avatar: varchar("avatar", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_profiles_user_id").on(table.userId)]
)

// Define relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))

// Types
export type User = typeof users.$inferSelect
export type Profile = typeof profiles.$inferSelect
```

### Usage

```typescript
import { db } from "./db"
import { users, profiles } from "./schema"
import { eq } from "drizzle-orm"

// Create user with profile
async function createUserWithProfile(email: string, bio: string) {
  return await db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({ email }).returning()

    const [profile] = await tx
      .insert(profiles)
      .values({ userId: user.id, bio })
      .returning()

    return { user, profile }
  })
}

// Fetch user with profile
async function getUserWithProfile(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      profile: true,
    },
  })
}
```

## 2. One-to-Many Relations

### Example: User has many Posts

```typescript
// db/schema.ts
import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
})

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content"),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_posts_author_id").on(table.authorId)]
)

// One-to-many: User has many posts
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))

// Many-to-one: Post belongs to user
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}))

export type User = typeof users.$inferSelect
export type Post = typeof posts.$inferSelect
```

### Usage

```typescript
import { db } from "./db"
import { users, posts } from "./schema"
import { eq, desc } from "drizzle-orm"

// Create post for user
async function createPost(authorId: string, title: string, content: string) {
  const [post] = await db
    .insert(posts)
    .values({ authorId, title, content })
    .returning()
  return post
}

// Get user with all posts
async function getUserWithPosts(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: {
        orderBy: [desc(posts.createdAt)],
      },
    },
  })
}

// Get post with author
async function getPostWithAuthor(postId: string) {
  return await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      author: true,
    },
  })
}

// Get posts with filtering
async function getUserPublishedPosts(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: {
        where: eq(posts.status, "published"),
        orderBy: [desc(posts.createdAt)],
        limit: 10,
      },
    },
  })
}
```

## 3. Many-to-Many Relations

### Example: Posts have many Tags

```typescript
// db/schema.ts
import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core"

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
})

// Junction table for many-to-many
export const postsTags = pgTable(
  "posts_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
  ]
)

// Relations
export const postsRelations = relations(posts, ({ many }) => ({
  postsTags: many(postsTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  postsTags: many(postsTags),
}))

export const postsTagsRelations = relations(postsTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postsTags.tagId],
    references: [tags.id],
  }),
}))
```

### Usage

```typescript
import { db } from "./db"
import { posts, tags, postsTags } from "./schema"
import { eq, inArray } from "drizzle-orm"

// Add tags to post
async function addTagsToPost(postId: string, tagIds: string[]) {
  await db.insert(postsTags).values(
    tagIds.map((tagId) => ({ postId, tagId }))
  )
}

// Remove tag from post
async function removeTagFromPost(postId: string, tagId: string) {
  await db
    .delete(postsTags)
    .where(and(eq(postsTags.postId, postId), eq(postsTags.tagId, tagId)))
}

// Get post with tags
async function getPostWithTags(postId: string) {
  return await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      postsTags: {
        with: {
          tag: true,
        },
      },
    },
  })
}

// Get posts by tag
async function getPostsByTag(tagName: string) {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.name, tagName),
    with: {
      postsTags: {
        with: {
          post: true,
        },
      },
    },
  })

  return tag?.postsTags.map((pt) => pt.post) ?? []
}

// Replace all tags on a post
async function setPostTags(postId: string, tagIds: string[]) {
  await db.transaction(async (tx) => {
    // Remove existing tags
    await tx.delete(postsTags).where(eq(postsTags.postId, postId))

    // Add new tags
    if (tagIds.length > 0) {
      await tx.insert(postsTags).values(
        tagIds.map((tagId) => ({ postId, tagId }))
      )
    }
  })
}
```

## 4. Self-Referential Relations

### Example: User follows Users

```typescript
// db/schema.ts
import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
})

// Self-referential junction table
export const userFollows = pgTable(
  "user_follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
  ]
)

export const usersRelations = relations(users, ({ many }) => ({
  // Users this user follows
  following: many(userFollows, { relationName: "following" }),
  // Users following this user
  followers: many(userFollows, { relationName: "followers" }),
}))

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "following",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "followers",
  }),
}))
```

### Usage

```typescript
// Follow a user
async function followUser(followerId: string, followingId: string) {
  await db.insert(userFollows).values({ followerId, followingId })
}

// Get user with followers and following
async function getUserWithFollows(userId: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      followers: {
        with: { follower: true },
      },
      following: {
        with: { following: true },
      },
    },
  })
}
```

## 5. Nested Relations

### Example: Deep nesting

```typescript
// Fetch post with author, comments, and comment authors
async function getPostWithComments(postId: string) {
  return await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      author: {
        columns: {
          id: true,
          name: true,
        },
      },
      comments: {
        with: {
          author: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [desc(comments.createdAt)],
      },
    },
  })
}
```

## Best Practices

1. **Define Relations Separately**: Keep relation definitions in a separate section for clarity
2. **Use Descriptive Relation Names**: Name relations clearly (e.g., `author` instead of `user`)
3. **Foreign Key Constraints**: Always add `references()` for referential integrity
4. **Cascade Deletes**: Use `onDelete: "cascade"` for dependent records
5. **Index Foreign Keys**: Add indexes on foreign key columns
6. **Limit Deep Nesting**: Avoid deeply nested `with` queries for performance
7. **Use Transactions**: Wrap related inserts/updates in transactions
8. **Select Only Needed Columns**: Use `columns` to limit returned data
9. **Handle Nullability**: Consider nullable foreign keys for optional relations
10. **Test Relations**: Verify cascade behavior in tests
