import { Hono } from "hono";
import { healthRoutes } from "./health.js";
import { agentRoutes } from "./agents.js";
import { taskRoutes } from "./tasks.js";
import { contractRoutes } from "./contracts.js";
import { proofRoutes } from "./proofs.js";
import { reputationRoutes } from "./reputation.js";

export function registerRoutes(app: Hono) {
  app.route("/health", healthRoutes);
  app.route("/agents", agentRoutes);
  app.route("/tasks", taskRoutes);
  app.route("/contracts", contractRoutes);
  app.route("/", proofRoutes);
  app.route("/reputation", reputationRoutes);
}
