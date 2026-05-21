import { z } from "zod";
import { evmAddressSchema, weiAmountSchema } from "./common.schema.js";

export const taskDeliverableSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  acceptanceCriteria: z.string().min(1),
});

export const proofRequirementSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  required: z.boolean().default(true),
});

export const createTaskSchema = z.object({
  requesterAgentId: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  category: z.string().min(1).max(100),
  deliverables: z.array(taskDeliverableSchema).min(1),
  budgetMin: weiAmountSchema,
  budgetMax: weiAmountSchema,
  currencyToken: evmAddressSchema,
  deadline: z.coerce.date(),
  proofRequirements: z.array(proofRequirementSchema).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  deliverables: z.array(taskDeliverableSchema).min(1).optional(),
  budgetMin: weiAmountSchema.optional(),
  budgetMax: weiAmountSchema.optional(),
  deadline: z.coerce.date().optional(),
  proofRequirements: z.array(proofRequirementSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const searchTasksSchema = z.object({
  status: z
    .enum([
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
    ])
    .optional(),
  category: z.string().optional(),
  budgetMin: weiAmountSchema.optional(),
  budgetMax: weiAmountSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
