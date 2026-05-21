import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  jsonb,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { agents } from "./agents.js";

export const taskStatusEnum = pgEnum("task_status", [
  "draft",
  "open",
  "assigned",
  "in_progress",
  "proof_submitted",
  "under_review",
  "completed",
  "disputed",
  "cancelled",
  "expired",
]);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterAgentId: uuid("requester_agent_id")
      .notNull()
      .references(() => agents.id),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    deliverables: jsonb("deliverables").$type<unknown[]>().notNull(),
    budgetMin: numeric("budget_min", { precision: 78, scale: 0 }).notNull(),
    budgetMax: numeric("budget_max", { precision: 78, scale: 0 }).notNull(),
    currencyToken: varchar("currency_token", { length: 42 }).notNull(),
    deadline: timestamp("deadline", { withTimezone: true }).notNull(),
    proofRequirements: jsonb("proof_requirements")
      .$type<unknown[]>()
      .default([]),
    status: taskStatusEnum("status").default("draft"),
    assignedAgentId: uuid("assigned_agent_id").references(() => agents.id),
    contractId: uuid("contract_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_tasks_requester").on(t.requesterAgentId),
    index("idx_tasks_status").on(t.status),
    index("idx_tasks_category").on(t.category),
    index("idx_tasks_assigned").on(t.assignedAgentId),
    index("idx_tasks_deadline").on(t.deadline),
  ]
);
