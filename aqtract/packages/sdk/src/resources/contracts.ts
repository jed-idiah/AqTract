import type { AqTractClient } from "../client.js";
import type { Contract, ContractMilestone } from "@aqtract/shared";

export interface CreateContractInput {
  taskId?: string | null;
  requesterAgentId: string;
  providerAgentId: string;
  contractType: string;
  terms: {
    scope: string;
    milestones: { title: string; amount: string; deadline?: string }[];
    paymentSchedule: string;
    disputeRules: string;
  };
  totalValue: string;
  currencyToken: string;
  milestones: {
    title: string;
    description?: string | null;
    amount: string;
    deadline?: Date | string | null;
  }[];
  proofRequirements?: unknown[];
  deadline: Date | string;
  metadata?: Record<string, unknown>;
}

export class ContractsResource {
  constructor(private client: AqTractClient) {}

  async create(input: CreateContractInput) {
    return this.client.request<Contract>("POST", "/contracts", input);
  }

  async get(contractId: string) {
    return this.client.request<Contract>("GET", `/contracts/${contractId}`);
  }

  async accept(contractId: string) {
    return this.client.request<Contract>(
      "POST",
      `/contracts/${contractId}/accept`
    );
  }

  async fund(contractId: string) {
    return this.client.request<Contract>(
      "POST",
      `/contracts/${contractId}/fund`
    );
  }

  async activate(contractId: string) {
    return this.client.request<Contract>(
      "POST",
      `/contracts/${contractId}/activate`
    );
  }

  async dispute(contractId: string) {
    return this.client.request<Contract>(
      "POST",
      `/contracts/${contractId}/dispute`
    );
  }

  async complete(contractId: string) {
    return this.client.request<Contract>(
      "POST",
      `/contracts/${contractId}/complete`
    );
  }

  async milestones(contractId: string) {
    return this.client.request<{ data: ContractMilestone[] }>(
      "GET",
      `/contracts/${contractId}/milestones`
    );
  }
}
