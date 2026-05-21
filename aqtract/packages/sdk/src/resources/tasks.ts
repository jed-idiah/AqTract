import type { AqTractClient } from "../client.js";
import type { Task } from "@aqtract/shared";

export interface CreateTaskInput {
  requesterAgentId: string;
  title: string;
  description: string;
  category: string;
  deliverables: { type: string; description: string; acceptanceCriteria: string }[];
  budgetMin: string;
  budgetMax: string;
  currencyToken: string;
  deadline: Date | string;
  proofRequirements?: { type: string; description: string; required: boolean }[];
  metadata?: Record<string, unknown>;
}

export interface SearchTasksParams {
  status?: string;
  category?: string;
  budgetMin?: string;
  budgetMax?: string;
  limit?: number;
  offset?: number;
}

export class TasksResource {
  constructor(private client: AqTractClient) {}

  async create(input: CreateTaskInput) {
    return this.client.request<Task>("POST", "/tasks", input);
  }

  async get(taskId: string) {
    return this.client.request<Task>("GET", `/tasks/${taskId}`);
  }

  async list(params?: SearchTasksParams) {
    const query: Record<string, string> = {};
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) query[k] = String(v);
      }
    }
    return this.client.request<{ data: Task[] }>("GET", "/tasks", undefined, query);
  }

  async update(taskId: string, input: Partial<CreateTaskInput>) {
    return this.client.request<Task>("PATCH", `/tasks/${taskId}`, input);
  }

  async cancel(taskId: string) {
    return this.client.request<Task>("POST", `/tasks/${taskId}/cancel`);
  }
}
