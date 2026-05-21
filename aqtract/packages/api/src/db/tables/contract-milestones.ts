import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { contracts } from "./contracts.js";

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending",
  "completed",
  "disputed",
]);

export const contractMilestones = pgTable(
  "contract_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => contracts.id),
    sequence: integer("sequence").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    amount: numeric("amount", { precision: 78, scale: 0 }).notNull(),
    deadline: timestamp("deadline", { withTimezone: true }),
    status: milestoneStatusEnum("status").default("pending"),
    proofPackageId: uuid("proof_package_id"),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("uq_contract_milestone_seq").on(t.contractId, t.sequence),
    index("idx_milestones_contract").on(t.contractId),
  ]
);
