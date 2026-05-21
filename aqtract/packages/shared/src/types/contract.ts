import type { ContractStatus, ContractType, MilestoneStatus } from "./enums.js";

export interface ContractMilestone {
  id: string;
  contractId: string;
  sequence: number;
  title: string;
  description: string | null;
  amount: string;
  deadline: Date | null;
  status: MilestoneStatus;
  proofPackageId: string | null;
  releasedAt: Date | null;
  createdAt: Date;
}

export interface ContractTerms {
  scope: string;
  milestones: { title: string; amount: string; deadline?: string }[];
  paymentSchedule: string;
  disputeRules: string;
}

export interface Contract {
  id: string;
  taskId: string | null;
  requesterAgentId: string;
  providerAgentId: string;
  contractType: ContractType;
  status: ContractStatus;
  terms: ContractTerms;
  totalValue: string;
  currencyToken: string;
  escrowTxHash: string | null;
  escrowContractId: string | null;
  proofRequirements: unknown[];
  deadline: Date;
  completedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
