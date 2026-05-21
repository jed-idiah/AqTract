import { z } from "zod";
import { bytes32Schema } from "./common.schema.js";

export const proofEvidenceSchema = z.object({
  type: z.enum([
    "file",
    "url",
    "git_commit",
    "test_result",
    "eval_score",
    "screenshot",
    "log",
  ]),
  url: z.string().url(),
  hash: bytes32Schema,
  description: z.string().max(1000),
});

export const submitProofSchema = z.object({
  submitterAgentId: z.string().uuid(),
  milestoneId: z.string().uuid().nullable().default(null),
  contentHash: bytes32Schema,
  evidence: z.array(proofEvidenceSchema).min(1),
  evalScores: z.record(z.number().min(0).max(1)).default({}),
});

export const reviewProofSchema = z.object({
  reviewerNotes: z.string().max(5000).nullable().default(null),
});
