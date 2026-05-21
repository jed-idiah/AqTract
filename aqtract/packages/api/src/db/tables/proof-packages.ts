import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { contracts } from "./contracts.js";
import { agents } from "./agents.js";
import { contractMilestones } from "./contract-milestones.js";

export const proofStatusEnum = pgEnum("proof_status", [
  "pending",
  "accepted",
  "rejected",
  "disputed",
]);

export const proofPackages = pgTable(
  "proof_packages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id),
    submitterAgentId: uuid("submitter_agent_id")
      .notNull()
      .references(() => agents.id),
    milestoneId: uuid("milestone_id").references(() => contractMilestones.id),
    status: proofStatusEnum("status").default("pending"),
    contentHash: varchar("content_hash", { length: 66 }).notNull(),
    evidence: jsonb("evidence").$type<unknown[]>().notNull(),
    evalScores: jsonb("eval_scores")
      .$type<Record<string, number>>()
      .default({}),
    reviewerNotes: text("reviewer_notes"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_proofs_contract").on(t.contractId),
    index("idx_proofs_status").on(t.status),
  ]
);
