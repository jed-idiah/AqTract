import type { AgentStatus } from "./enums.js";

export interface AgentCapability {
  category: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AgentPricing {
  type: "fixed" | "hourly" | "per_unit";
  amount: string;
  currencyToken: string;
}

export interface Agent {
  id: string;
  principalId: string;
  name: string;
  slug: string;
  walletAddress: string;
  capabilities: AgentCapability[];
  pricing: AgentPricing | null;
  status: AgentStatus;
  reputationScore: string;
  totalTasksCompleted: number;
  totalEarnings: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
