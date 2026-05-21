import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { proofPackages } from "../db/schema.js";
import { AppError } from "../middleware/error-handler.js";

export async function submitProof(input: {
  contractId: string;
  submitterAgentId: string;
  milestoneId: string | null;
  contentHash: string;
  evidence: unknown[];
  evalScores: Record<string, number>;
}) {
  const [proof] = await db.insert(proofPackages).values(input).returning();
  return proof;
}

export async function getProofById(id: string) {
  const [proof] = await db
    .select()
    .from(proofPackages)
    .where(eq(proofPackages.id, id));
  if (!proof) throw new AppError(404, "Proof not found", "NOT_FOUND");
  return proof;
}

export async function listProofsByContract(contractId: string) {
  return await db
    .select()
    .from(proofPackages)
    .where(eq(proofPackages.contractId, contractId));
}

export async function updateProofStatus(
  id: string,
  status: "accepted" | "rejected" | "disputed",
  reviewerNotes?: string | null
) {
  const [proof] = await db
    .update(proofPackages)
    .set({ status, reviewerNotes, reviewedAt: new Date() })
    .where(eq(proofPackages.id, id))
    .returning();
  if (!proof) throw new AppError(404, "Proof not found", "NOT_FOUND");
  return proof;
}
