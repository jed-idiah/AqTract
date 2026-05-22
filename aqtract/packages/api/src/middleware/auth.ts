import type { MiddlewareHandler } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { apiKeys } from "../db/schema.js";
import { hashKey } from "../lib/api-key.js";
import { AppError } from "./error-handler.js";

export interface AuthContext {
  principalId: string;
  agentId: string | null;
}

export const auth: MiddlewareHandler = async (c, next) => {
  const authorization = c.req.header("authorization");

  if (!authorization) {
    throw new AppError(401, "Missing authorization header", "UNAUTHORIZED");
  }

  if (!authorization.startsWith("Bearer ")) {
    throw new AppError(401, "Unsupported authorization scheme", "UNSUPPORTED_AUTH");
  }

  const rawKey = authorization.slice(7);
  const keyHash = hashKey(rawKey);

  const [record] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.active, true)));

  if (!record) {
    throw new AppError(401, "Invalid API key", "INVALID_KEY");
  }

  if (record.expiresAt && record.expiresAt < new Date()) {
    throw new AppError(401, "API key expired", "KEY_EXPIRED");
  }

  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, record.id))
    .execute()
    .catch(() => {});

  c.set("auth", {
    principalId: record.principalId,
    agentId: c.req.header("x-agent-id") ?? null,
  } satisfies AuthContext);

  await next();
};
