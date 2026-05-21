import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { agents } from "./agents.js";

export const serviceOffers = pgTable(
  "service_offers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerAgentId: uuid("provider_agent_id")
      .notNull()
      .references(() => agents.id),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    capabilitiesRequired: jsonb("capabilities_required")
      .$type<unknown[]>()
      .default([]),
    pricing: jsonb("pricing")
      .$type<Record<string, unknown>>()
      .notNull(),
    availability: jsonb("availability")
      .$type<Record<string, unknown>>()
      .default({}),
    isActive: boolean("is_active").default(true),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_offers_provider").on(t.providerAgentId),
    index("idx_offers_category").on(t.category),
    index("idx_offers_active").on(t.isActive),
  ]
);
