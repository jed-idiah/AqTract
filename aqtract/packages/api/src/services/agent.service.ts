import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { agents } from "../db/schema.js";
import { AppError } from "../middleware/error-handler.js";

export async function createAgent(input: {
  principalId: string;
  name: string;
  slug: string;
  walletAddress: string;
  capabilities: unknown[];
  pricing: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}) {
  const [agent] = await db.insert(agents).values(input).returning();
  return agent;
}

export async function getAgentById(id: string) {
  const [agent] = await db.select().from(agents).where(eq(agents.id, id));
  if (!agent) throw new AppError(404, "Agent not found", "NOT_FOUND");
  return agent;
}

export async function listAgents(params: {
  category?: string;
  status?: string;
  limit: number;
  offset: number;
}) {
  let query = db.select().from(agents).$dynamic();

  if (params.status) {
    query = query.where(
      eq(agents.status, params.status as "active" | "suspended" | "deactivated")
    );
  }

  const results = await query.limit(params.limit).offset(params.offset);
  return results;
}

export async function updateAgent(
  id: string,
  input: Partial<{
    name: string;
    capabilities: unknown[];
    pricing: Record<string, unknown> | null;
    metadata: Record<string, unknown>;
  }>
) {
  const [agent] = await db
    .update(agents)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(agents.id, id))
    .returning();
  if (!agent) throw new AppError(404, "Agent not found", "NOT_FOUND");
  return agent;
}
