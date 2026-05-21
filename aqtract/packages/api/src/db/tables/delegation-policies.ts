import {
  pgTable,
  uuid,
  numeric,
  text,
  boolean,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { principals } from "./principals.js";
import { agents } from "./agents.js";

export const delegationPolicies = pgTable(
  "delegation_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    principalId: uuid("principal_id")
      .notNull()
      .references(() => principals.id),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id),
    maxSpendPerTx: numeric("max_spend_per_tx", {
      precision: 78,
      scale: 0,
    }).notNull(),
    maxSpendDaily: numeric("max_spend_daily", {
      precision: 78,
      scale: 0,
    }).notNull(),
    maxSpendTotal: numeric("max_spend_total", { precision: 78, scale: 0 }),
    allowedCategories: text("allowed_categories").array().default([]),
    requiresApprovalAbove: numeric("requires_approval_above", {
      precision: 78,
      scale: 0,
    }),
    autoAcceptBelow: numeric("auto_accept_below", {
      precision: 78,
      scale: 0,
    }),
    isActive: boolean("is_active").default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_delegation_principal_agent").on(t.principalId, t.agentId),
    index("idx_delegation_agent").on(t.agentId),
  ]
);
