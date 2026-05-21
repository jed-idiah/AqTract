import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "./middleware/request-id.js";
import { rateLimit } from "./middleware/rate-limit.js";
import { errorHandler } from "./middleware/error-handler.js";
import { registerRoutes } from "./routes/index.js";

export function createApp() {
  const app = new Hono();

  app.use("*", cors());
  app.use("*", requestId);
  app.use("*", rateLimit);
  app.onError(errorHandler);

  registerRoutes(app);

  return app;
}
