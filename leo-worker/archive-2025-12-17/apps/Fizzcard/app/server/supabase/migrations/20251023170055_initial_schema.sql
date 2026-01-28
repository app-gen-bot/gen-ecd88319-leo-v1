CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_type" text NOT NULL,
	"earned_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"connected_user_id" integer NOT NULL,
	"exchange_id" integer,
	"relationship_note" text,
	"tags" jsonb DEFAULT '[]' NOT NULL,
	"strength_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contactExchanges" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"method" text NOT NULL,
	"latitude" real,
	"longitude" real,
	"location_name" text,
	"met_at" timestamp NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eventAttendees" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"check_in_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"location" text,
	"latitude" real,
	"longitude" real,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_exclusive" boolean DEFAULT false NOT NULL,
	"min_fizzcoin_required" numeric(18, 2) DEFAULT '0' NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fizzCards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"display_name" text NOT NULL,
	"title" text,
	"company" text,
	"phone" text,
	"email" text,
	"website" text,
	"address" text,
	"bio" text,
	"avatar_url" text,
	"theme_color" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fizzCoinTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"transaction_type" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fizzCoinWallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_earned" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_spent" numeric(18, 2) DEFAULT '0' NOT NULL,
	"last_transaction_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fizzCoinWallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "introductions" (
	"id" serial PRIMARY KEY NOT NULL,
	"introducer_id" integer NOT NULL,
	"person_a_id" integer NOT NULL,
	"person_b_id" integer NOT NULL,
	"context" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"fizzcoin_reward" numeric(18, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "searchHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"query" text NOT NULL,
	"filters" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "socialLinks" (
	"id" serial PRIMARY KEY NOT NULL,
	"fizzcard_id" integer NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"phone" text,
	"company" text,
	"address" text,
	"website" text,
	"bio" text,
	"avatar_url" text,
	"role" text DEFAULT 'user' NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_connected_user_id_users_id_fk" FOREIGN KEY ("connected_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_exchange_id_contactExchanges_id_fk" FOREIGN KEY ("exchange_id") REFERENCES "public"."contactExchanges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contactExchanges" ADD CONSTRAINT "contactExchanges_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contactExchanges" ADD CONSTRAINT "contactExchanges_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventAttendees" ADD CONSTRAINT "eventAttendees_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventAttendees" ADD CONSTRAINT "eventAttendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fizzCards" ADD CONSTRAINT "fizzCards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fizzCoinTransactions" ADD CONSTRAINT "fizzCoinTransactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fizzCoinWallets" ADD CONSTRAINT "fizzCoinWallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_introducer_id_users_id_fk" FOREIGN KEY ("introducer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_person_a_id_users_id_fk" FOREIGN KEY ("person_a_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "introductions" ADD CONSTRAINT "introductions_person_b_id_users_id_fk" FOREIGN KEY ("person_b_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "searchHistory" ADD CONSTRAINT "searchHistory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "socialLinks" ADD CONSTRAINT "socialLinks_fizzcard_id_fizzCards_id_fk" FOREIGN KEY ("fizzcard_id") REFERENCES "public"."fizzCards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "badges_user_id_idx" ON "badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "badges_badge_type_idx" ON "badges" USING btree ("badge_type");--> statement-breakpoint
CREATE INDEX "connections_user_id_idx" ON "connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "connections_connected_user_id_idx" ON "connections" USING btree ("connected_user_id");--> statement-breakpoint
CREATE INDEX "connections_strength_score_idx" ON "connections" USING btree ("strength_score");--> statement-breakpoint
CREATE INDEX "contactExchanges_sender_id_idx" ON "contactExchanges" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "contactExchanges_receiver_id_idx" ON "contactExchanges" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "contactExchanges_status_idx" ON "contactExchanges" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contactExchanges_met_at_idx" ON "contactExchanges" USING btree ("met_at");--> statement-breakpoint
CREATE INDEX "eventAttendees_event_id_idx" ON "eventAttendees" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "eventAttendees_user_id_idx" ON "eventAttendees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "events_is_exclusive_idx" ON "events" USING btree ("is_exclusive");--> statement-breakpoint
CREATE INDEX "events_created_by_idx" ON "events" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "fizzCards_user_id_idx" ON "fizzCards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "fizzCards_is_active_idx" ON "fizzCards" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "fizzCoinTransactions_user_id_idx" ON "fizzCoinTransactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "fizzCoinTransactions_transaction_type_idx" ON "fizzCoinTransactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "fizzCoinTransactions_created_at_idx" ON "fizzCoinTransactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "fizzCoinWallets_user_id_idx" ON "fizzCoinWallets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "fizzCoinWallets_balance_idx" ON "fizzCoinWallets" USING btree ("balance");--> statement-breakpoint
CREATE INDEX "introductions_introducer_id_idx" ON "introductions" USING btree ("introducer_id");--> statement-breakpoint
CREATE INDEX "introductions_status_idx" ON "introductions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "searchHistory_user_id_idx" ON "searchHistory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "searchHistory_created_at_idx" ON "searchHistory" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "socialLinks_fizzcard_id_idx" ON "socialLinks" USING btree ("fizzcard_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");