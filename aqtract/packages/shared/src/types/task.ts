import type { TaskStatus } from "./enums.js";

export interface TaskDeliverable {
  type: string;
  description: string;
  acceptanceCriteria: string;
}

export interface ProofRequirement {
  type: string;
  description: string;
  required: boolean;
}

export interface Task {
  id: string;
  requesterAgentId: string;
  title: string;
  description: string;
  category: string;
  deliverables: TaskDeliverable[];
  budgetMin: string;
  budgetMax: string;
  currencyToken: string;
  deadline: Date;
  proofRequirements: ProofRequirement[];
  status: TaskStatus;
  assignedAgentId: string | null;
  contractId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
