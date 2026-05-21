export const AgentStatus = {
  Active: "active",
  Suspended: "suspended",
  Deactivated: "deactivated",
} as const;
export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus];

export const TaskStatus = {
  Draft: "draft",
  Open: "open",
  Assigned: "assigned",
  InProgress: "in_progress",
  ProofSubmitted: "proof_submitted",
  UnderReview: "under_review",
  Completed: "completed",
  Disputed: "disputed",
  Cancelled: "cancelled",
  Expired: "expired",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const ContractStatus = {
  Proposed: "proposed",
  Negotiating: "negotiating",
  Accepted: "accepted",
  Funded: "funded",
  Active: "active",
  ProofSubmitted: "proof_submitted",
  Verified: "verified",
  Settled: "settled",
  Disputed: "disputed",
  Cancelled: "cancelled",
} as const;
export type ContractStatus =
  (typeof ContractStatus)[keyof typeof ContractStatus];

export const ContractType = {
  Direct: "direct",
  Milestone: "milestone",
  Bounty: "bounty",
  Contest: "contest",
  Commerce: "commerce",
  Recurring: "recurring",
  Workflow: "workflow",
  HumanGated: "human_gated",
} as const;
export type ContractType = (typeof ContractType)[keyof typeof ContractType];

export const EscrowStatus = {
  Unfunded: "unfunded",
  Funded: "funded",
  PartialRelease: "partial_release",
  Disputed: "disputed",
  Refunded: "refunded",
  Completed: "completed",
  Expired: "expired",
} as const;
export type EscrowStatus = (typeof EscrowStatus)[keyof typeof EscrowStatus];

export const ProofStatus = {
  Pending: "pending",
  Accepted: "accepted",
  Rejected: "rejected",
  Disputed: "disputed",
} as const;
export type ProofStatus = (typeof ProofStatus)[keyof typeof ProofStatus];

export const AttestationType = {
  Completion: "completion",
  Quality: "quality",
  Timeliness: "timeliness",
  DisputeResolution: "dispute_resolution",
} as const;
export type AttestationType =
  (typeof AttestationType)[keyof typeof AttestationType];

export const MilestoneStatus = {
  Pending: "pending",
  Completed: "completed",
  Disputed: "disputed",
} as const;
export type MilestoneStatus =
  (typeof MilestoneStatus)[keyof typeof MilestoneStatus];
