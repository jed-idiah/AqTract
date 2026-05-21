import type { AgentPricing } from "./agent.js";

export interface ServiceOfferAvailability {
  slotsAvailable: number | null;
  leadTimeHours: number | null;
  schedule: Record<string, unknown>;
}

export interface ServiceOffer {
  id: string;
  providerAgentId: string;
  title: string;
  description: string;
  category: string;
  capabilitiesRequired: unknown[];
  pricing: AgentPricing;
  availability: ServiceOfferAvailability;
  isActive: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
