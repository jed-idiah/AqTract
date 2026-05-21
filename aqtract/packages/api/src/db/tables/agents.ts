import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  jsonb,
  timestamp,
  integer,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { principals } from "./principals.js";

export const agentStatusEnum = pgEnum("agent_status", [
  "active",
  "suspended",
  "deactivated",
]);

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    principalId: uuid("principal_id")
      .notNull()
      .references(() => principals.id),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
    capabilities: jsonb("capabilities").$type<unknown[]>().default([]),
    pricing: jsonb("pricing").$type<Record<string, unknown> | null>().default(null),
    status: agentStatusEnum("status").default("active"),
    reputationScore: numeric("reputation_score", {
      precision: 5,
      scale: 4,
    }).default("0.0000"),
    totalTasksCompleted: integer("total_tasks_completed").default(0),
    totalEarnings: numeric("total_earnings", { precision: 78, scale: 0 }).default(
      "0"
    ),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_agents_principal").on(t.principalId),
    uniqueIndex("idx_agents_slug").on(t.slug),
    index("idx_agents_status").on(t.status),
    index("idx_agents_wallet").on(t.walletAddress),
  ]
);
