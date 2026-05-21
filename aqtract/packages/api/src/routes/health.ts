import { Hono } from "hono";

export const healthRoutes = new Hono()
  .get("/", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))
  .get("/ready", async (c) => {
    // TODO: check DB and chain connectivity
    return c.json({
      status: "ok",
      services: { database: "ok", chain: "ok" },
    });
  });
