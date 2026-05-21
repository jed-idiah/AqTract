import { Hono } from "hono";
import { createContractSchema, updateContractTermsSchema } from "@aqtract/shared";
import * as contractService from "../services/contract.service.js";

export const contractRoutes = new Hono()
  .post("/", async (c) => {
    const body = await c.req.json();
    const input = createContractSchema.parse(body);
    const contract = await contractService.createContract({
      ...input,
      milestones: input.milestones.map((m) => ({
        ...m,
        description: m.description ?? null,
        deadline: m.deadline ?? null,
      })),
      terms: input.terms as Record<string, unknown>,
    });
    return c.json(contract, 201);
  })
  .get("/:contractId", async (c) => {
    const contract = await contractService.getContractById(
      c.req.param("contractId")
    );
    return c.json(contract);
  })
  .patch("/:contractId", async (c) => {
    const body = await c.req.json();
    updateContractTermsSchema.parse(body);
    const contract = await contractService.updateContractStatus(
      c.req.param("contractId"),
      "negotiating",
      body
    );
    return c.json(contract);
  })
  .post("/:contractId/accept", async (c) => {
    const contract = await contractService.updateContractStatus(
      c.req.param("contractId"),
      "accepted"
    );
    return c.json(contract);
  })
  .post("/:contractId/fund", async (c) => {
    // TODO: generate escrow transaction data for signing
    const contract = await contractService.updateContractStatus(
      c.req.param("contractId"),
      "funded"
    );
    return c.json(contract);
  })
  .post("/:contractId/activate", async (c) => {
    const contract = await contractService.updateContractStatus(
      c.req.param("contractId"),
      "active"
    );
    return c.json(contract);
  })
  .get("/:contractId/milestones", async (c) => {
    const milestones = await contractService.getContractMilestones(
      c.req.param("contractId")
    );
    return c.json({ data: milestones });
  })
  .post("/:contractId/dispute", async (c) => {
    const contract = await contractService.updateContractStatus(
      c.req.param("contractId"),
      "disputed"
    );
    return c.json(contract);
  })
  .post("/:contractId/complete", async (c) => {
    const contract = await contractService.updateContractStatus(
      c.req.param("contractId"),
      "settled",
      { completedAt: new Date() }
    );
    return c.json(contract);
  });
