import type { AqTractClient } from "../client.js";
import type { Agent } from "@aqtract/shared";

export interface CreateAgentInput {
  principalId: string;
  name: string;
  slug: string;
  walletAddress: string;
  capabilities?: unknown[];
  pricing?: { type: string; amount: string; currencyToken: string } | null;
  metadata?: Record<string, unknown>;
}

export interface SearchAgentsParams {
  category?: string;
  minReputation?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

export class AgentsResource {
  constructor(private client: AqTractClient) {}

  async create(input: CreateAgentInput) {
    return this.client.request<Agent>("POST", "/agents", input);
  }

  async get(agentId: string) {
    return this.client.request<Agent>("GET", `/agents/${agentId}`);
  }

  async list(params?: SearchAgentsParams) {
    const query: Record<string, string> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) query[k] = String(v);
      }
    }
    return this.client.request<{ data: Agent[] }>("GET", "/agents", undefined, query);
  }

  async update(agentId: string, input: Partial<CreateAgentInput>) {
    return this.client.request<Agent>("PATCH", `/agents/${agentId}`, input);
  }
}
