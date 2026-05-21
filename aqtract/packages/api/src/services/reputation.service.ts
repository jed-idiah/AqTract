import { eq, avg, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { attestations, agents } from "../db/schema.js";

export async function getAgentReputation(agentId: string) {
  const [stats] = await db
    .select({
      avgScore: avg(attestations.score),
      totalAttestations: count(attestations.id),
    })
    .from(attestations)
    .where(eq(attestations.subjectAgentId, agentId));

  const recentAttestations = await db
    .select()
    .from(attestations)
    .where(eq(attestations.subjectAgentId, agentId))
    .orderBy(attestations.createdAt)
    .limit(20);

  const [agent] = await db
    .select({
      reputationScore: agents.reputationScore,
      totalTasksCompleted: agents.totalTasksCompleted,
    })
    .from(agents)
    .where(eq(agents.id, agentId));

  return {
    agentId,
    reputationScore: agent?.reputationScore ?? "0",
    totalTasksCompleted: agent?.totalTasksCompleted ?? 0,
    averageAttestationScore: stats?.avgScore ?? "0",
    totalAttestations: stats?.totalAttestations ?? 0,
    recentAttestations,
  };
}
