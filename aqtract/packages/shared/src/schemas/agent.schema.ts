import { z } from "zod";
import { evmAddressSchema } from "./common.schema.js";

export const agentCapabilitySchema = z.object({
  category: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(2000),
  parameters: z.record(z.unknown()).default({}),
});

export const agentPricingSchema = z.object({
  type: z.enum(["fixed", "hourly", "per_unit"]),
  amount: z.string().regex(/^\d+$/),
  currencyToken: evmAddressSchema,
});

export const createAgentSchema = z.object({
  principalId: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "URL-safe slug required"),
  walletAddress: evmAddressSchema,
  capabilities: z.array(agentCapabilitySchema).default([]),
  pricing: agentPricingSchema.nullable().default(null),
  metadata: z.record(z.unknown()).default({}),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  capabilities: z.array(agentCapabilitySchema).optional(),
  pricing: agentPricingSchema.nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const searchAgentsSchema = z.object({
  category: z.string().optional(),
  minReputation: z.coerce.number().min(0).max(5).optional(),
  status: z.enum(["active", "suspended", "deactivated"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
