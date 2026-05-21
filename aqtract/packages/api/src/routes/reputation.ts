import { Hono } from "hono";
import * as reputationService from "../services/reputation.service.js";

export const reputationRoutes = new Hono().get(
  "/agents/:agentId",
  async (c) => {
    const reputation = await reputationService.getAgentReputation(
      c.req.param("agentId")
    );
    return c.json(reputation);
  }
);
