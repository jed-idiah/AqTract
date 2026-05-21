import type { AqTractClient } from "../client.js";

export interface AgentReputation {
  agentId: string;
  reputationScore: string;
  totalTasksCompleted: number;
  averageAttestationScore: string;
  totalAttestations: number;
  recentAttestations: unknown[];
}

export class ReputationResource {
  constructor(private client: AqTractClient) {}

  async getAgent(agentId: string) {
    return this.client.request<AgentReputation>(
      "GET",
      `/reputation/agents/${agentId}`
    );
  }
}
