import { pgTable, index, unique, serial, uuid, text, timestamp, foreignKey, integer, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const creditTransactionType = pgEnum("credit_transaction_type", ['grant', 'deduction', 'refund', 'adjustment'])
export const feedbackStatus = pgEnum("feedback_status", ['new', 'reviewed', 'in_progress', 'resolved', 'closed'])
export const feedbackType = pgEnum("feedback_type", ['feature_request', 'bug_report'])
export const generationMode = pgEnum("generation_mode", ['single-shot', 'autonomous', 'confirm_first'])
export const generationStatus = pgEnum("generation_status", ['queued', 'generating', 'completed', 'failed', 'paused', 'cancelled'])
export const generationType = pgEnum("generation_type", ['new', 'resume'])
export const userRole = pgEnum("user_role", ['user', 'dev', 'admin'])
export const userStatus = pgEnum("user_status", ['pending_approval', 'approved', 'rejected', 'suspended'])


export const apps = pgTable("apps", {
	id: serial().primaryKey().notNull(),
	appUuid: uuid("app_uuid").defaultRandom().notNull(),
	userId: uuid("user_id").notNull(),
	appName: text("app_name").notNull(),
	githubUrl: text("github_url"),
	deploymentUrl: text("deployment_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	cumulativeCost: text("cumulative_cost").default('0'),
}, (table) => [
	index("apps_app_uuid_idx").using("btree", table.appUuid.asc().nullsLast().op("uuid_ops")),
	index("apps_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	unique("apps_user_app_unique").on(table.userId, table.appName),
]);

export const generationRequests = pgTable("generation_requests", {
	id: serial().primaryKey().notNull(),
	appRefId: integer("app_ref_id").notNull(),
	prompt: text().notNull(),
	status: generationStatus().default('queued').notNull(),
	generationType: generationType("generation_type").default('new').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	errorMessage: text("error_message"),
	mode: generationMode().default('single-shot').notNull(),
	initialPrompt: text("initial_prompt").notNull(),
	maxIterations: integer("max_iterations").default(10).notNull(),
	currentIteration: integer("current_iteration").default(0).notNull(),
	lastSessionId: text("last_session_id"),
	githubCommit: text("github_commit"),
	totalCost: text("total_cost"),
	totalDuration: integer("total_duration"),
	warnings: jsonb(),
	iterationData: jsonb("iteration_data"),
	poolIndex: integer("pool_index"),
	attachments: jsonb(),
}, (table) => [
	index("generation_requests_app_ref_id_idx").using("btree", table.appRefId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.appRefId],
			foreignColumns: [apps.id],
			name: "generation_requests_app_ref_id_apps_id_fk"
		}).onDelete("cascade"),
]);

export const userFeedback = pgTable("user_feedback", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: feedbackType().notNull(),
	content: text().notNull(),
	status: feedbackStatus().default('new').notNull(),
	sourcePage: text("source_page").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_feedback_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("user_feedback_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
]);

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	role: userRole().default('user').notNull(),
	status: userStatus().default('pending_approval').notNull(),
	creditsRemaining: integer("credits_remaining").default(0).notNull(),
	creditsUsed: integer("credits_used").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("profiles_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("profiles_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
]);

export const settings = pgTable("settings", {
	id: serial().primaryKey().notNull(),
	key: text().notNull(),
	value: jsonb().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("settings_key_unique").on(table.key),
]);

export const creditTransactions = pgTable("credit_transactions", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: creditTransactionType().notNull(),
	amount: integer().notNull(),
	balanceBefore: integer("balance_before").notNull(),
	balanceAfter: integer("balance_after").notNull(),
	description: text(),
	generationRequestId: integer("generation_request_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid("created_by"),
}, (table) => [
	index("credit_transactions_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("credit_transactions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "credit_transactions_user_id_profiles_id_fk"
		}).onDelete("cascade"),
]);
