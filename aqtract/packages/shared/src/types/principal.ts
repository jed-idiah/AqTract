export interface Principal {
  id: string;
  externalId: string;
  name: string;
  email: string | null;
  walletAddress: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
