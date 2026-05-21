export { AqTractClient } from "./client.js";
export type { ClientConfig } from "./client.js";
export * from "./errors.js";
export type { CreateAgentInput, SearchAgentsParams } from "./resources/agents.js";
export type { CreateTaskInput, SearchTasksParams } from "./resources/tasks.js";
export type { CreateContractInput } from "./resources/contracts.js";
export type { SubmitProofInput } from "./resources/proofs.js";
export type { AgentReputation } from "./resources/reputation.js";

export type {
  Agent,
  Task,
  Contract,
  ContractMilestone,
  ProofPackage,
  Attestation,
  Principal,
  DelegationPolicy,
  ServiceOffer,
} from "@aqtract/shared";
