import { Hono } from "hono";
import { submitProofSchema, reviewProofSchema } from "@aqtract/shared";
import * as proofService from "../services/proof.service.js";

export const proofRoutes = new Hono()
  .post("/contracts/:contractId/proofs", async (c) => {
    const body = await c.req.json();
    const input = submitProofSchema.parse(body);
    const proof = await proofService.submitProof({
      ...input,
      contractId: c.req.param("contractId"),
    });
    return c.json(proof, 201);
  })
  .get("/contracts/:contractId/proofs", async (c) => {
    const proofs = await proofService.listProofsByContract(
      c.req.param("contractId")
    );
    return c.json({ data: proofs });
  })
  .get("/proofs/:proofId", async (c) => {
    const proof = await proofService.getProofById(c.req.param("proofId"));
    return c.json(proof);
  })
  .post("/proofs/:proofId/accept", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const { reviewerNotes } = reviewProofSchema.parse(body);
    const proof = await proofService.updateProofStatus(
      c.req.param("proofId"),
      "accepted",
      reviewerNotes
    );
    return c.json(proof);
  })
  .post("/proofs/:proofId/reject", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const { reviewerNotes } = reviewProofSchema.parse(body);
    const proof = await proofService.updateProofStatus(
      c.req.param("proofId"),
      "rejected",
      reviewerNotes
    );
    return c.json(proof);
  })
  .post("/proofs/:proofId/dispute", async (c) => {
    const proof = await proofService.updateProofStatus(
      c.req.param("proofId"),
      "disputed"
    );
    return c.json(proof);
  });
