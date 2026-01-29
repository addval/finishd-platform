CREATE TYPE "public"."contractor_status" AS ENUM('invited', 'quote_submitted', 'hired', 'completed', 'removed');--> statement-breakpoint
CREATE TYPE "public"."cost_category" AS ENUM('design_fees', 'labor', 'materials', 'miscellaneous');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('en', 'hi');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('not_paid', 'paid');--> statement-breakpoint
CREATE TYPE "public"."project_scope" AS ENUM('full_home', 'partial');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'seeking_designer', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('apartment', 'house', 'villa');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('submitted', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'proposal_submitted', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."trade" AS ENUM('electrician', 'plumber', 'mason', 'carpenter', 'painter', 'general_contractor', 'false_ceiling', 'flooring', 'hvac');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('homeowner', 'designer', 'contractor');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contractor_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"profile_picture_url" varchar(500),
	"trades" jsonb DEFAULT '[]'::jsonb,
	"experience_years" integer,
	"service_areas" jsonb DEFAULT '[]'::jsonb,
	"work_photos" jsonb DEFAULT '[]'::jsonb,
	"bio" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contractor_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "cost_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"category" "cost_category" NOT NULL,
	"description" varchar(500) NOT NULL,
	"estimated_amount" integer NOT NULL,
	"actual_amount" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "designer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"firm_name" varchar(200),
	"bio" text,
	"profile_picture_url" varchar(500),
	"portfolio_images" jsonb DEFAULT '[]'::jsonb,
	"services" jsonb DEFAULT '[]'::jsonb,
	"service_cities" jsonb DEFAULT '[]'::jsonb,
	"styles" jsonb DEFAULT '[]'::jsonb,
	"price_range_min" integer,
	"price_range_max" integer,
	"experience_years" integer,
	"projects_completed" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "designer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "homeowner_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255),
	"city" varchar(100),
	"locality" varchar(200),
	"profile_picture_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "homeowner_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" text,
	"target_date" timestamp,
	"payment_amount" integer,
	"payment_status" "payment_status" DEFAULT 'not_paid' NOT NULL,
	"paid_at" timestamp,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_contractors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"contractor_id" uuid NOT NULL,
	"invited_by" uuid,
	"status" "contractor_status" DEFAULT 'invited' NOT NULL,
	"quote_amount" integer,
	"quote_details" text,
	"hired_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"designer_id" uuid NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"homeowner_id" uuid NOT NULL,
	"property_id" uuid,
	"designer_id" uuid,
	"title" varchar(200) NOT NULL,
	"scope" "project_scope" NOT NULL,
	"scope_details" jsonb,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"budget_min" integer,
	"budget_max" integer,
	"timeline_weeks" integer,
	"start_timeline" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"homeowner_id" uuid NOT NULL,
	"type" "property_type" NOT NULL,
	"address" varchar(500),
	"city" varchar(100),
	"locality" varchar(200),
	"size_sqft" integer,
	"rooms" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_request_id" uuid NOT NULL,
	"designer_id" uuid NOT NULL,
	"scope_description" text NOT NULL,
	"approach" text,
	"timeline_weeks" integer NOT NULL,
	"cost_estimate" integer NOT NULL,
	"cost_breakdown" jsonb,
	"notes" text,
	"status" "proposal_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"assigned_to" uuid,
	"created_by" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"user_type" "user_type",
	"language_preference" "language" DEFAULT 'en' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contractor_profiles" ADD CONSTRAINT "contractor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_estimates" ADD CONSTRAINT "cost_estimates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designer_profiles" ADD CONSTRAINT "designer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homeowner_profiles" ADD CONSTRAINT "homeowner_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_contractors" ADD CONSTRAINT "project_contractors_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_contractors" ADD CONSTRAINT "project_contractors_contractor_id_contractor_profiles_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractor_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_contractors" ADD CONSTRAINT "project_contractors_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_requests" ADD CONSTRAINT "project_requests_designer_id_designer_profiles_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."designer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_homeowner_id_homeowner_profiles_id_fk" FOREIGN KEY ("homeowner_id") REFERENCES "public"."homeowner_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_designer_id_designer_profiles_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."designer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_homeowner_id_homeowner_profiles_id_fk" FOREIGN KEY ("homeowner_id") REFERENCES "public"."homeowner_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_project_request_id_project_requests_id_fk" FOREIGN KEY ("project_request_id") REFERENCES "public"."project_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_designer_id_designer_profiles_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."designer_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activity_logs_project_id" ON "activity_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_created_at" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_contractor_profiles_user_id" ON "contractor_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_contractor_profiles_verified" ON "contractor_profiles" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "idx_cost_estimates_project_id" ON "cost_estimates" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_cost_estimates_category" ON "cost_estimates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_designer_profiles_user_id" ON "designer_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_designer_profiles_verified" ON "designer_profiles" USING btree ("is_verified");--> statement-breakpoint
CREATE INDEX "idx_homeowner_profiles_user_id" ON "homeowner_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_milestones_project_id" ON "milestones" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_milestones_status" ON "milestones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_project_contractors_project_id" ON "project_contractors" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_contractors_contractor_id" ON "project_contractors" USING btree ("contractor_id");--> statement-breakpoint
CREATE INDEX "idx_project_contractors_status" ON "project_contractors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_project_requests_project_id" ON "project_requests" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_requests_designer_id" ON "project_requests" USING btree ("designer_id");--> statement-breakpoint
CREATE INDEX "idx_project_requests_status" ON "project_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_projects_homeowner_id" ON "projects" USING btree ("homeowner_id");--> statement-breakpoint
CREATE INDEX "idx_projects_designer_id" ON "projects" USING btree ("designer_id");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_properties_homeowner_id" ON "properties" USING btree ("homeowner_id");--> statement-breakpoint
CREATE INDEX "idx_proposals_project_request_id" ON "proposals" USING btree ("project_request_id");--> statement-breakpoint
CREATE INDEX "idx_proposals_designer_id" ON "proposals" USING btree ("designer_id");--> statement-breakpoint
CREATE INDEX "idx_proposals_status" ON "proposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_project_id" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_assigned_to" ON "tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_user_type" ON "users" USING btree ("user_type");