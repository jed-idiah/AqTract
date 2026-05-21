import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  jsonb,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { agents } from "./agents.js";
import { tasks } from "./tasks.js";

export const contractTypeEnum = pgEnum("contract_type", [
  "direct",
  "milestone",
  "bounty",
  "contest",
  "commerce",
  "recurring",
  "workflow",
  "human_gated",
]);

export const contractStatusEnum = pgEnum("contract_status", [
  "proposed",
  "negotiating",
  "accepted",
  "funded",
  "active",
  "proof_submitted",
  "verified",
  "settled",
  "disputed",
  "cancelled",
]);

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id").references(() => tasks.id),
    requesterAgentId: uuid("requester_agent_id")
      .notNull()
      .references(() => agents.id),
    providerAgentId: uuid("provider_agent_id")
      .notNull()
      .references(() => agents.id),
    contractType: contractTypeEnum("contract_type").notNull(),
    status: contractStatusEnum("status").default("proposed"),
    terms: jsonb("terms").$type<Record<string, unknown>>().notNull(),
    totalValue: numeric("total_value", { precision: 78, scale: 0 }).notNull(),
    currencyToken: varchar("currency_token", { length: 42 }).notNull(),
    escrowTxHash: varchar("escrow_tx_hash", { length: 66 }),
    escrowContractId: varchar("escrow_contract_id", { length: 66 }),
    proofRequirements: jsonb("proof_requirements")
      .$type<unknown[]>()
      .default([]),
    deadline: timestamp("deadline", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_contracts_requester").on(t.requesterAgentId),
    index("idx_contracts_provider").on(t.providerAgentId),
    index("idx_contracts_status").on(t.status),
    index("idx_contracts_task").on(t.taskId),
  ]
);
