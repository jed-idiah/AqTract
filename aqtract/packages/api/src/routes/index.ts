import { Hono } from "hono";
import { auth } from "../middleware/auth.js";
import { healthRoutes } from "./health.js";
import { adminRoutes } from "./admin.js";
import { agentRoutes } from "./agents.js";
import { taskRoutes } from "./tasks.js";
import { contractRoutes } from "./contracts.js";
import { proofRoutes } from "./proofs.js";
import { reputationRoutes } from "./reputation.js";

export function registerRoutes(app: Hono) {
  app.route("/health", healthRoutes);
  app.route("/admin", adminRoutes);

  app.use("/agents/*", auth);
  app.use("/tasks/*", auth);
  app.use("/contracts/*", auth);
  app.use("/reputation/*", auth);
  app.route("/agents", agentRoutes);
  app.route("/tasks", taskRoutes);
  app.route("/contracts", contractRoutes);
  app.route("/", proofRoutes);
  app.route("/reputation", reputationRoutes);
}
