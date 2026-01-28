CREATE TYPE "public"."generation_mode" AS ENUM('single-shot', 'autonomous', 'confirm_first');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('queued', 'generating', 'completed', 'failed', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."snapshot_type" AS ENUM('automatic', 'manual', 'checkpoint');--> statement-breakpoint
CREATE TABLE "generation_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"app_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"app_name" text NOT NULL,
	"prompt" text NOT NULL,
	"status" "generation_status" DEFAULT 'queued' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"download_url" text,
	"github_url" text,
	"artifacts_github_url" text,
	"deployment_url" text,
	"error_message" text,
	"mode" "generation_mode" DEFAULT 'single-shot' NOT NULL,
	"initial_prompt" text NOT NULL,
	"max_iterations" integer DEFAULT 10 NOT NULL,
	"current_iteration" integer DEFAULT 0 NOT NULL,
	"last_session_id" text,
	"conversation" jsonb
);
--> statement-breakpoint
CREATE TABLE "iteration_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"generation_request_id" integer NOT NULL,
	"iteration_number" integer NOT NULL,
	"snapshot_type" "snapshot_type" DEFAULT 'automatic' NOT NULL,
	"files_snapshot" text NOT NULL,
	"prompt_used" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "iteration_snapshots" ADD CONSTRAINT "iteration_snapshots_generation_request_id_generation_requests_id_fk" FOREIGN KEY ("generation_request_id") REFERENCES "public"."generation_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "generation_requests_user_id_idx" ON "generation_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "generation_requests_app_id_idx" ON "generation_requests" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "iteration_snapshots_generation_id_idx" ON "iteration_snapshots" USING btree ("generation_request_id");--> statement-breakpoint
CREATE INDEX "iteration_snapshots_number_idx" ON "iteration_snapshots" USING btree ("generation_request_id","iteration_number");