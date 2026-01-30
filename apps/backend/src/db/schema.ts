/**
 * Finishd Database Schema
 * Drizzle ORM schema definitions for the Finishd marketplace platform
 */

import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

// ============================================================================
// ENUMS
// ============================================================================

export const userTypeEnum = pgEnum("user_type", ["homeowner", "designer", "contractor"])
export const languageEnum = pgEnum("language", ["en", "hi"])
export const propertyTypeEnum = pgEnum("property_type", ["apartment", "house", "villa"])
export const projectScopeEnum = pgEnum("project_scope", ["full_home", "partial"])
export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "seeking_designer",
  "in_progress",
  "completed",
  "cancelled",
])
export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "proposal_submitted",
  "accepted",
  "rejected",
])
export const proposalStatusEnum = pgEnum("proposal_status", ["submitted", "accepted", "rejected"])
export const contractorStatusEnum = pgEnum("contractor_status", [
  "invited",
  "quote_submitted",
  "hired",
  "completed",
  "removed",
])
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "completed"])
export const milestoneStatusEnum = pgEnum("milestone_status", ["pending", "completed"])
export const paymentStatusEnum = pgEnum("payment_status", ["not_paid", "paid"])
export const costCategoryEnum = pgEnum("cost_category", [
  "design_fees",
  "labor",
  "materials",
  "miscellaneous",
])
export const tradeEnum = pgEnum("trade", [
  "electrician",
  "plumber",
  "mason",
  "carpenter",
  "painter",
  "general_contractor",
  "false_ceiling",
  "flooring",
  "hvac",
])

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    userType: userTypeEnum("user_type"),
    languagePreference: languageEnum("language_preference").default("en").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_users_phone").on(table.phone),
    index("idx_users_user_type").on(table.userType),
  ],
)

// ============================================================================
// HOMEOWNER PROFILES
// ============================================================================

export const homeownerProfiles = pgTable(
  "homeowner_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    city: varchar("city", { length: 100 }),
    locality: varchar("locality", { length: 200 }),
    profilePictureUrl: varchar("profile_picture_url", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("idx_homeowner_profiles_user_id").on(table.userId)],
)

// ============================================================================
// DESIGNER PROFILES
// ============================================================================

export const designerProfiles = pgTable(
  "designer_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    firmName: varchar("firm_name", { length: 200 }),
    bio: text("bio"),
    profilePictureUrl: varchar("profile_picture_url", { length: 500 }),
    portfolioImages: jsonb("portfolio_images").$type<string[]>().default([]),
    services: jsonb("services").$type<string[]>().default([]),
    serviceCities: jsonb("service_cities").$type<string[]>().default([]),
    styles: jsonb("styles").$type<string[]>().default([]),
    priceRangeMin: integer("price_range_min"),
    priceRangeMax: integer("price_range_max"),
    experienceYears: integer("experience_years"),
    projectsCompleted: integer("projects_completed").default(0),
    isVerified: boolean("is_verified").default(false).notNull(),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_designer_profiles_user_id").on(table.userId),
    index("idx_designer_profiles_verified").on(table.isVerified),
  ],
)

// ============================================================================
// CONTRACTOR PROFILES
// ============================================================================

export const contractorProfiles = pgTable(
  "contractor_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    profilePictureUrl: varchar("profile_picture_url", { length: 500 }),
    trades: jsonb("trades").$type<string[]>().default([]),
    experienceYears: integer("experience_years"),
    serviceAreas: jsonb("service_areas").$type<string[]>().default([]),
    workPhotos: jsonb("work_photos").$type<string[]>().default([]),
    bio: text("bio"),
    isVerified: boolean("is_verified").default(false).notNull(),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_contractor_profiles_user_id").on(table.userId),
    index("idx_contractor_profiles_verified").on(table.isVerified),
  ],
)

// ============================================================================
// PROPERTIES
// ============================================================================

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    homeownerId: uuid("homeowner_id")
      .notNull()
      .references(() => homeownerProfiles.id, { onDelete: "cascade" }),
    type: propertyTypeEnum("type").notNull(),
    address: varchar("address", { length: 500 }),
    city: varchar("city", { length: 100 }),
    locality: varchar("locality", { length: 200 }),
    sizeSqft: integer("size_sqft"),
    rooms: jsonb("rooms").$type<{
      bedrooms?: number
      bathrooms?: number
      livingAreas?: number
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("idx_properties_homeowner_id").on(table.homeownerId)],
)

// ============================================================================
// PROJECTS
// ============================================================================

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    homeownerId: uuid("homeowner_id")
      .notNull()
      .references(() => homeownerProfiles.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
    designerId: uuid("designer_id").references(() => designerProfiles.id, { onDelete: "set null" }),
    title: varchar("title", { length: 200 }).notNull(),
    scope: projectScopeEnum("scope").notNull(),
    scopeDetails: jsonb("scope_details").$type<{
      rooms?: string[]
      areas?: string[]
      notes?: string
    }>(),
    status: projectStatusEnum("status").default("draft").notNull(),
    budgetMin: integer("budget_min"),
    budgetMax: integer("budget_max"),
    timelineWeeks: integer("timeline_weeks"),
    startTimeline: varchar("start_timeline", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_projects_homeowner_id").on(table.homeownerId),
    index("idx_projects_designer_id").on(table.designerId),
    index("idx_projects_status").on(table.status),
  ],
)

// ============================================================================
// PROJECT REQUESTS
// ============================================================================

export const projectRequests = pgTable(
  "project_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    designerId: uuid("designer_id")
      .notNull()
      .references(() => designerProfiles.id, { onDelete: "cascade" }),
    status: requestStatusEnum("status").default("pending").notNull(),
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_project_requests_project_id").on(table.projectId),
    index("idx_project_requests_designer_id").on(table.designerId),
    index("idx_project_requests_status").on(table.status),
  ],
)

// ============================================================================
// PROPOSALS
// ============================================================================

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectRequestId: uuid("project_request_id")
      .notNull()
      .references(() => projectRequests.id, { onDelete: "cascade" }),
    designerId: uuid("designer_id")
      .notNull()
      .references(() => designerProfiles.id, { onDelete: "cascade" }),
    scopeDescription: text("scope_description").notNull(),
    approach: text("approach"),
    timelineWeeks: integer("timeline_weeks").notNull(),
    costEstimate: integer("cost_estimate").notNull(),
    costBreakdown: jsonb("cost_breakdown").$type<{
      designFees?: number
      labor?: number
      materials?: number
      other?: number
    }>(),
    notes: text("notes"),
    status: proposalStatusEnum("status").default("submitted").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_proposals_project_request_id").on(table.projectRequestId),
    index("idx_proposals_designer_id").on(table.designerId),
    index("idx_proposals_status").on(table.status),
  ],
)

// ============================================================================
// PROJECT CONTRACTORS
// ============================================================================

export const projectContractors = pgTable(
  "project_contractors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    contractorId: uuid("contractor_id")
      .notNull()
      .references(() => contractorProfiles.id, { onDelete: "cascade" }),
    invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
    status: contractorStatusEnum("status").default("invited").notNull(),
    quoteAmount: integer("quote_amount"),
    quoteDetails: text("quote_details"),
    hiredAt: timestamp("hired_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_project_contractors_project_id").on(table.projectId),
    index("idx_project_contractors_contractor_id").on(table.contractorId),
    index("idx_project_contractors_status").on(table.status),
  ],
)

// ============================================================================
// TASKS
// ============================================================================

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 300 }).notNull(),
    description: text("description"),
    status: taskStatusEnum("status").default("todo").notNull(),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tasks_project_id").on(table.projectId),
    index("idx_tasks_assigned_to").on(table.assignedTo),
    index("idx_tasks_status").on(table.status),
  ],
)

// ============================================================================
// MILESTONES
// ============================================================================

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 300 }).notNull(),
    description: text("description"),
    targetDate: timestamp("target_date"),
    paymentAmount: integer("payment_amount"),
    paymentStatus: paymentStatusEnum("payment_status").default("not_paid").notNull(),
    paidAt: timestamp("paid_at"),
    status: milestoneStatusEnum("status").default("pending").notNull(),
    completedAt: timestamp("completed_at"),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_milestones_project_id").on(table.projectId),
    index("idx_milestones_status").on(table.status),
  ],
)

// ============================================================================
// COST ESTIMATES
// ============================================================================

export const costEstimates = pgTable(
  "cost_estimates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    category: costCategoryEnum("category").notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    estimatedAmount: integer("estimated_amount").notNull(),
    actualAmount: integer("actual_amount"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_cost_estimates_project_id").on(table.projectId),
    index("idx_cost_estimates_category").on(table.category),
  ],
)

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(),
    details: jsonb("details").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_activity_logs_project_id").on(table.projectId),
    index("idx_activity_logs_created_at").on(table.createdAt),
  ],
)

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    data: jsonb("data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_is_read_idx").on(table.userId, table.isRead),
  ],
)

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ one }) => ({
  homeownerProfile: one(homeownerProfiles, {
    fields: [users.id],
    references: [homeownerProfiles.userId],
  }),
  designerProfile: one(designerProfiles, {
    fields: [users.id],
    references: [designerProfiles.userId],
  }),
  contractorProfile: one(contractorProfiles, {
    fields: [users.id],
    references: [contractorProfiles.userId],
  }),
}))

export const homeownerProfilesRelations = relations(homeownerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [homeownerProfiles.userId],
    references: [users.id],
  }),
  properties: many(properties),
  projects: many(projects),
}))

export const designerProfilesRelations = relations(designerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [designerProfiles.userId],
    references: [users.id],
  }),
  projectRequests: many(projectRequests),
  proposals: many(proposals),
  projects: many(projects),
}))

export const contractorProfilesRelations = relations(contractorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [contractorProfiles.userId],
    references: [users.id],
  }),
  projectContractors: many(projectContractors),
}))

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  homeowner: one(homeownerProfiles, {
    fields: [properties.homeownerId],
    references: [homeownerProfiles.id],
  }),
  projects: many(projects),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  homeowner: one(homeownerProfiles, {
    fields: [projects.homeownerId],
    references: [homeownerProfiles.id],
  }),
  property: one(properties, {
    fields: [projects.propertyId],
    references: [properties.id],
  }),
  designer: one(designerProfiles, {
    fields: [projects.designerId],
    references: [designerProfiles.id],
  }),
  requests: many(projectRequests),
  contractors: many(projectContractors),
  tasks: many(tasks),
  milestones: many(milestones),
  costEstimates: many(costEstimates),
  activityLogs: many(activityLogs),
}))

export const projectRequestsRelations = relations(projectRequests, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectRequests.projectId],
    references: [projects.id],
  }),
  designer: one(designerProfiles, {
    fields: [projectRequests.designerId],
    references: [designerProfiles.id],
  }),
  proposals: many(proposals),
}))

export const proposalsRelations = relations(proposals, ({ one }) => ({
  projectRequest: one(projectRequests, {
    fields: [proposals.projectRequestId],
    references: [projectRequests.id],
  }),
  designer: one(designerProfiles, {
    fields: [proposals.designerId],
    references: [designerProfiles.id],
  }),
}))

export const projectContractorsRelations = relations(projectContractors, ({ one }) => ({
  project: one(projects, {
    fields: [projectContractors.projectId],
    references: [projects.id],
  }),
  contractor: one(contractorProfiles, {
    fields: [projectContractors.contractorId],
    references: [contractorProfiles.id],
  }),
  inviter: one(users, {
    fields: [projectContractors.invitedBy],
    references: [users.id],
  }),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}))

export const milestonesRelations = relations(milestones, ({ one }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
}))

export const costEstimatesRelations = relations(costEstimates, ({ one }) => ({
  project: one(projects, {
    fields: [costEstimates.projectId],
    references: [projects.id],
  }),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  project: one(projects, {
    fields: [activityLogs.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}))

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type HomeownerProfile = typeof homeownerProfiles.$inferSelect
export type NewHomeownerProfile = typeof homeownerProfiles.$inferInsert

export type DesignerProfile = typeof designerProfiles.$inferSelect
export type NewDesignerProfile = typeof designerProfiles.$inferInsert

export type ContractorProfile = typeof contractorProfiles.$inferSelect
export type NewContractorProfile = typeof contractorProfiles.$inferInsert

export type Property = typeof properties.$inferSelect
export type NewProperty = typeof properties.$inferInsert

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type ProjectRequest = typeof projectRequests.$inferSelect
export type NewProjectRequest = typeof projectRequests.$inferInsert

export type Proposal = typeof proposals.$inferSelect
export type NewProposal = typeof proposals.$inferInsert

export type ProjectContractor = typeof projectContractors.$inferSelect
export type NewProjectContractor = typeof projectContractors.$inferInsert

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert

export type Milestone = typeof milestones.$inferSelect
export type NewMilestone = typeof milestones.$inferInsert

export type CostEstimate = typeof costEstimates.$inferSelect
export type NewCostEstimate = typeof costEstimates.$inferInsert

export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
