import type { MiddlewareHandler } from "hono";
import { nanoid } from "nanoid";

export const requestId: MiddlewareHandler = async (c, next) => {
  const id = c.req.header("x-request-id") ?? nanoid();
  c.set("requestId", id);
  c.header("x-request-id", id);
  await next();
};
