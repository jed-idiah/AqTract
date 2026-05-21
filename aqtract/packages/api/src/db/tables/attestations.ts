import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  numeric,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { contracts } from "./contracts.js";
import { agents } from "./agents.js";

export const attestationTypeEnum = pgEnum("attestation_type", [
  "completion",
  "quality",
  "timeliness",
  "dispute_resolution",
]);

export const attestations = pgTable(
  "attestations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id),
    subjectAgentId: uuid("subject_agent_id")
      .notNull()
      .references(() => agents.id),
    attesterAgentId: uuid("attester_agent_id")
      .notNull()
      .references(() => agents.id),
    attestationType: attestationTypeEnum("attestation_type").notNull(),
    score: numeric("score", { precision: 3, scale: 2 }).notNull(),
    contentHash: varchar("content_hash", { length: 66 }),
    txHash: varchar("tx_hash", { length: 66 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_attestations_subject").on(t.subjectAgentId),
    index("idx_attestations_contract").on(t.contractId),
    index("idx_attestations_type").on(t.attestationType),
  ]
);
