import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { tasks } from "../db/schema.js";
import { AppError } from "../middleware/error-handler.js";

export async function createTask(input: {
  requesterAgentId: string;
  title: string;
  description: string;
  category: string;
  deliverables: unknown[];
  budgetMin: string;
  budgetMax: string;
  currencyToken: string;
  deadline: Date;
  proofRequirements: unknown[];
  metadata: Record<string, unknown>;
}) {
  const [task] = await db.insert(tasks).values(input).returning();
  return task;
}

export async function getTaskById(id: string) {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
  if (!task) throw new AppError(404, "Task not found", "NOT_FOUND");
  return task;
}

export async function listTasks(params: {
  status?: string;
  category?: string;
  limit: number;
  offset: number;
}) {
  let query = db.select().from(tasks).$dynamic();

  if (params.status) {
    query = query.where(eq(tasks.status, params.status as any));
  }
  if (params.category) {
    query = query.where(eq(tasks.category, params.category));
  }

  return await query.limit(params.limit).offset(params.offset);
}

export async function updateTask(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    deliverables: unknown[];
    budgetMin: string;
    budgetMax: string;
    deadline: Date;
    proofRequirements: unknown[];
    metadata: Record<string, unknown>;
    status: string;
    assignedAgentId: string;
    contractId: string;
  }>
) {
  const [task] = await db
    .update(tasks)
    .set({ ...input, updatedAt: new Date() } as any)
    .where(eq(tasks.id, id))
    .returning();
  if (!task) throw new AppError(404, "Task not found", "NOT_FOUND");
  return task;
}
