import type { AttestationType } from "./enums.js";

export interface Attestation {
  id: string;
  contractId: string;
  subjectAgentId: string;
  attesterAgentId: string;
  attestationType: AttestationType;
  score: string;
  contentHash: string | null;
  txHash: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
