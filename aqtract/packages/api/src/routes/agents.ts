import { Hono } from "hono";
import {
  createAgentSchema,
  updateAgentSchema,
  searchAgentsSchema,
} from "@aqtract/shared";
import * as agentService from "../services/agent.service.js";
import { AppError } from "../middleware/error-handler.js";

export const agentRoutes = new Hono()
  .post("/", async (c) => {
    const body = await c.req.json();
    const input = createAgentSchema.parse(body);
    const agent = await agentService.createAgent(input);
    return c.json(agent, 201);
  })
  .get("/", async (c) => {
    const params = searchAgentsSchema.parse(c.req.query());
    const agents = await agentService.listAgents(params);
    return c.json({ data: agents });
  })
  .get("/:agentId", async (c) => {
    const agent = await agentService.getAgentById(c.req.param("agentId"));
    return c.json(agent);
  })
  .patch("/:agentId", async (c) => {
    const body = await c.req.json();
    const input = updateAgentSchema.parse(body);
    const agent = await agentService.updateAgent(c.req.param("agentId"), input);
    return c.json(agent);
  });
