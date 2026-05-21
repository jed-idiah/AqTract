import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      { error: { message: err.message, code: "HTTP_ERROR" } },
      err.status
    );
  }

  if (err instanceof AppError) {
    return c.json(
      { error: { message: err.message, code: err.code ?? "APP_ERROR" } },
      err.statusCode as 400
    );
  }

  console.error("Unhandled error:", err);
  return c.json(
    { error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
    500
  );
};
