import { Hono } from "hono";
import { createContractSchema, updateContractTermsSchema } from "@aqtract/shared";
import * as contractService from "../services/contract.service.js";
import * as escrowService from "../services/escrow.service.js";
import { type Address } from "viem";
import { db } from "../db/index.js";
import { agents } from "../db/schema.js";
import { eq } from "drizzle-orm";

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
    const contractId = c.req.param("contractId");
    const contract = await contractService.getContractById(contractId);
    const milestones = await contractService.getContractMilestones(contractId);

    const [provider] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, contract.providerAgentId));

    const milestoneAmounts = milestones.map((m) => BigInt(m.amount));
    const deadline = BigInt(Math.floor(new Date(contract.deadline).getTime() / 1000));

    const tx = await escrowService.buildCreateEscrowTx({
      contractId,
      providerWallet: provider.walletAddress as Address,
      token: contract.currencyToken as Address,
      milestoneAmounts,
      deadline,
    });

    const updated = await contractService.updateContractStatus(contractId, "funded", {
      escrowContractId: tx.escrowId,
    });

    return c.json({
      contract: updated,
      transaction: {
        to: tx.to,
        data: tx.data,
        value: tx.value.toString(),
      },
    });
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
  .post("/:contractId/milestones/:index/release", async (c) => {
    const contractId = c.req.param("contractId");
    const milestoneIndex = parseInt(c.req.param("index"), 10);

    const { hash, receipt } = await escrowService.executeReleaseMilestone(
      contractId,
      milestoneIndex
    );

    const milestones = await contractService.getContractMilestones(contractId);
    const allReleased = milestoneIndex === milestones.length - 1;

    if (allReleased) {
      await contractService.updateContractStatus(contractId, "settled", {
        completedAt: new Date(),
      });
    }

    return c.json({
      txHash: hash,
      status: receipt.status,
      allReleased,
    });
  })
  .post("/:contractId/dispute", async (c) => {
    const contractId = c.req.param("contractId");
    const { hash, receipt } = await escrowService.executeDispute(contractId);

    await contractService.updateContractStatus(contractId, "disputed");

    return c.json({ txHash: hash, status: receipt.status });
  })
  .post("/:contractId/complete", async (c) => {
    const contract = await contractService.updateContractStatus(
      c.req.param("contractId"),
      "settled",
      { completedAt: new Date() }
    );
    return c.json(contract);
  });
