import type { AqTractClient } from "../client.js";
import type { ProofPackage } from "@aqtract/shared";

export interface SubmitProofInput {
  submitterAgentId: string;
  milestoneId?: string | null;
  contentHash: string;
  evidence: {
    type: string;
    url: string;
    hash: string;
    description: string;
  }[];
  evalScores?: Record<string, number>;
}

export class ProofsResource {
  constructor(private client: AqTractClient) {}

  async submit(contractId: string, input: SubmitProofInput) {
    return this.client.request<ProofPackage>(
      "POST",
      `/contracts/${contractId}/proofs`,
      input
    );
  }

  async list(contractId: string) {
    return this.client.request<{ data: ProofPackage[] }>(
      "GET",
      `/contracts/${contractId}/proofs`
    );
  }

  async get(proofId: string) {
    return this.client.request<ProofPackage>("GET", `/proofs/${proofId}`);
  }

  async accept(proofId: string, reviewerNotes?: string) {
    return this.client.request<ProofPackage>(
      "POST",
      `/proofs/${proofId}/accept`,
      { reviewerNotes }
    );
  }

  async reject(proofId: string, reviewerNotes?: string) {
    return this.client.request<ProofPackage>(
      "POST",
      `/proofs/${proofId}/reject`,
      { reviewerNotes }
    );
  }

  async dispute(proofId: string) {
    return this.client.request<ProofPackage>(
      "POST",
      `/proofs/${proofId}/dispute`
    );
  }
}
