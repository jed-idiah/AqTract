import type { MiddlewareHandler } from "hono";

const windowMs = 60_000;
const maxRequests = 100;
const store = new Map<string, { count: number; resetAt: number }>();

export const rateLimit: MiddlewareHandler = async (c, next) => {
  const key =
    c.req.header("x-forwarded-for") ??
    c.req.header("x-real-ip") ??
    "unknown";
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
  } else if (entry.count >= maxRequests) {
    c.header("retry-after", String(Math.ceil((entry.resetAt - now) / 1000)));
    return c.json(
      { error: { message: "Too many requests", code: "RATE_LIMITED" } },
      429
    );
  } else {
    entry.count++;
  }

  await next();
};
