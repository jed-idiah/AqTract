import { z } from "zod";
import { evmAddressSchema, weiAmountSchema } from "./common.schema.js";
import { proofRequirementSchema } from "./task.schema.js";

export const contractMilestoneInputSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().nullable().default(null),
  amount: weiAmountSchema,
  deadline: z.coerce.date().nullable().default(null),
});

export const contractTermsSchema = z.object({
  scope: z.string().min(1),
  milestones: z.array(
    z.object({
      title: z.string(),
      amount: z.string(),
      deadline: z.string().optional(),
    })
  ),
  paymentSchedule: z.string(),
  disputeRules: z.string(),
});

export const createContractSchema = z.object({
  taskId: z.string().uuid().nullable().default(null),
  requesterAgentId: z.string().uuid(),
  providerAgentId: z.string().uuid(),
  contractType: z.enum([
    "direct",
    "milestone",
    "bounty",
    "contest",
    "commerce",
    "recurring",
    "workflow",
    "human_gated",
  ]),
  terms: contractTermsSchema,
  totalValue: weiAmountSchema,
  currencyToken: evmAddressSchema,
  milestones: z.array(contractMilestoneInputSchema).min(1),
  proofRequirements: z.array(proofRequirementSchema).default([]),
  deadline: z.coerce.date(),
  metadata: z.record(z.unknown()).default({}),
});

export const updateContractTermsSchema = z.object({
  terms: contractTermsSchema.optional(),
  totalValue: weiAmountSchema.optional(),
  milestones: z.array(contractMilestoneInputSchema).min(1).optional(),
  deadline: z.coerce.date().optional(),
});
