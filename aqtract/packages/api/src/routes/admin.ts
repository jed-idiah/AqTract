import { Hono } from "hono";
import { db } from "../db/index.js";
import { principals, apiKeys } from "../db/schema.js";
import { generateApiKey } from "../lib/api-key.js";
import { eq } from "drizzle-orm";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export const adminRoutes = new Hono()
  .use("*", async (c, next) => {
    if (!ADMIN_SECRET) {
      return c.json({ error: "Admin endpoint not configured" }, 503);
    }
    const secret = c.req.header("x-admin-secret");
    if (secret !== ADMIN_SECRET) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  })
  .post("/principals", async (c) => {
    const body = await c.req.json();
    const [principal] = await db
      .insert(principals)
      .values({
        externalId: body.externalId,
        name: body.name,
        email: body.email ?? null,
        walletAddress: body.walletAddress ?? null,
      })
      .returning();
    return c.json(principal, 201);
  })
  .post("/api-keys", async (c) => {
    const body = await c.req.json();
    const { raw, hash, prefix } = generateApiKey();

    const [record] = await db
      .insert(apiKeys)
      .values({
        principalId: body.principalId,
        keyHash: hash,
        keyPrefix: prefix,
        label: body.label ?? null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      })
      .returning();

    return c.json({ ...record, key: raw }, 201);
  })
  .delete("/api-keys/:id", async (c) => {
    const [record] = await db
      .update(apiKeys)
      .set({ active: false })
      .where(eq(apiKeys.id, c.req.param("id")))
      .returning();
    if (!record) return c.json({ error: "Not found" }, 404);
    return c.json({ revoked: true });
  });
