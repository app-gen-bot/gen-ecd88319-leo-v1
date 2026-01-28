import { relations } from "drizzle-orm/relations";
import { apps, generationRequests, profiles, creditTransactions } from "./schema";

export const generationRequestsRelations = relations(generationRequests, ({one}) => ({
	app: one(apps, {
		fields: [generationRequests.appRefId],
		references: [apps.id]
	}),
}));

export const appsRelations = relations(apps, ({many}) => ({
	generationRequests: many(generationRequests),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({one}) => ({
	profile: one(profiles, {
		fields: [creditTransactions.userId],
		references: [profiles.id]
	}),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	creditTransactions: many(creditTransactions),
}));