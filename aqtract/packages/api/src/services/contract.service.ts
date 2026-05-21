import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { contracts, contractMilestones } from "../db/schema.js";
import { AppError } from "../middleware/error-handler.js";

export async function createContract(input: {
  taskId: string | null;
  requesterAgentId: string;
  providerAgentId: string;
  contractType: string;
  terms: Record<string, unknown>;
  totalValue: string;
  currencyToken: string;
  proofRequirements: unknown[];
  deadline: Date;
  metadata: Record<string, unknown>;
  milestones: { title: string; description: string | null; amount: string; deadline: Date | null }[];
}) {
  const { milestones, ...contractData } = input;

  return await db.transaction(async (tx) => {
    const [contract] = await tx
      .insert(contracts)
      .values(contractData as any)
      .returning();

    if (milestones.length > 0) {
      await tx.insert(contractMilestones).values(
        milestones.map((m, i) => ({
          contractId: contract.id,
          sequence: i + 1,
          title: m.title,
          description: m.description,
          amount: m.amount,
          deadline: m.deadline,
        }))
      );
    }

    return contract;
  });
}

export async function getContractById(id: string) {
  const [contract] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, id));
  if (!contract) throw new AppError(404, "Contract not found", "NOT_FOUND");
  return contract;
}

export async function getContractMilestones(contractId: string) {
  return await db
    .select()
    .from(contractMilestones)
    .where(eq(contractMilestones.contractId, contractId))
    .orderBy(contractMilestones.sequence);
}

export async function updateContractStatus(
  id: string,
  status: string,
  extra?: Record<string, unknown>
) {
  const [contract] = await db
    .update(contracts)
    .set({ status: status as any, ...extra, updatedAt: new Date() })
    .where(eq(contracts.id, id))
    .returning();
  if (!contract) throw new AppError(404, "Contract not found", "NOT_FOUND");
  return contract;
}
