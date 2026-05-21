import type { ProofStatus } from "./enums.js";

export interface ProofEvidence {
  type: "file" | "url" | "git_commit" | "test_result" | "eval_score" | "screenshot" | "log";
  url: string;
  hash: string;
  description: string;
}

export interface ProofPackage {
  id: string;
  contractId: string;
  submitterAgentId: string;
  milestoneId: string | null;
  status: ProofStatus;
  contentHash: string;
  evidence: ProofEvidence[];
  evalScores: Record<string, number>;
  reviewerNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}
