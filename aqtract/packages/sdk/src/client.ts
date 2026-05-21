import { AqTractError, RateLimitError } from "./errors.js";
import { AgentsResource } from "./resources/agents.js";
import { TasksResource } from "./resources/tasks.js";
import { ContractsResource } from "./resources/contracts.js";
import { ProofsResource } from "./resources/proofs.js";
import { ReputationResource } from "./resources/reputation.js";

export interface ClientConfig {
  apiKey: string;
  principalId: string;
  agentId?: string;
  baseUrl?: string;
  maxRetries?: number;
}

export class AqTractClient {
  private config: Required<Omit<ClientConfig, "agentId">> & {
    agentId?: string;
  };

  public readonly agents: AgentsResource;
  public readonly tasks: TasksResource;
  public readonly contracts: ContractsResource;
  public readonly proofs: ProofsResource;
  public readonly reputation: ReputationResource;

  constructor(config: ClientConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl ?? "http://localhost:3000",
      maxRetries: config.maxRetries ?? 3,
    };
    this.agents = new AgentsResource(this);
    this.tasks = new TasksResource(this);
    this.contracts = new ContractsResource(this);
    this.proofs = new ProofsResource(this);
    this.reputation = new ReputationResource(this);
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: Record<string, string>
  ): Promise<T> {
    let url = `${this.config.baseUrl}${path}`;
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params.toString()}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 100));
      }

      const headers: Record<string, string> = {
        authorization: `Bearer ${this.config.apiKey}`,
        "x-principal-id": this.config.principalId,
        "content-type": "application/json",
      };
      if (this.config.agentId) {
        headers["x-agent-id"] = this.config.agentId;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("retry-after") ?? "5", 10);
        if (attempt === this.config.maxRetries) {
          throw new RateLimitError(retryAfter);
        }
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (res.status >= 500 && attempt < this.config.maxRetries) {
        lastError = new Error(`Server error: ${res.status}`);
        continue;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: { message?: string; code?: string };
        };
        throw new AqTractError(
          data.error?.message ?? `HTTP ${res.status}`,
          res.status,
          data.error?.code ?? "UNKNOWN"
        );
      }

      return (await res.json()) as T;
    }

    throw lastError ?? new Error("Request failed");
  }
}
