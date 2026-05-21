import type { MiddlewareHandler } from "hono";
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

  if (authorization.startsWith("Bearer ")) {
    const apiKey = authorization.slice(7);
    // TODO: look up API key in database, resolve to principal
    // For now, accept any key and extract principal from header
    const principalId = c.req.header("x-principal-id");
    if (!principalId) {
      throw new AppError(
        401,
        "x-principal-id header required with API key auth",
        "MISSING_PRINCIPAL"
      );
    }
    c.set("auth", {
      principalId,
      agentId: c.req.header("x-agent-id") ?? null,
    } satisfies AuthContext);
  } else {
    throw new AppError(
      401,
      "Unsupported authorization scheme",
      "UNSUPPORTED_AUTH"
    );
  }

  await next();
};
