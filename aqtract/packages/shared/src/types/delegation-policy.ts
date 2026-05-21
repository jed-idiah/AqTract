export interface DelegationPolicy {
  id: string;
  principalId: string;
  agentId: string;
  maxSpendPerTx: string;
  maxSpendDaily: string;
  maxSpendTotal: string | null;
  allowedCategories: string[];
  requiresApprovalAbove: string | null;
  autoAcceptBelow: string | null;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
