import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Chain,
} from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const ESCROW_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS as Address | undefined;
const ATTESTATION_ADDRESS = process.env.ATTESTATION_CONTRACT_ADDRESS as Address | undefined;
const OPERATOR_KEY = process.env.OPERATOR_PRIVATE_KEY as `0x${string}` | undefined;
const RPC_URL = process.env.RPC_URL ?? "https://sepolia.base.org";

const chain: Chain = baseSepolia;

export const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

export function getWalletClient() {
  if (!OPERATOR_KEY) {
    throw new Error("OPERATOR_PRIVATE_KEY not configured");
  }
  const account = privateKeyToAccount(OPERATOR_KEY);
  return createWalletClient({
    account,
    chain,
    transport: http(RPC_URL),
  });
}

export function getEscrowAddress(): Address {
  if (!ESCROW_ADDRESS) {
    throw new Error("ESCROW_CONTRACT_ADDRESS not configured");
  }
  return ESCROW_ADDRESS;
}

export function getAttestationAddress(): Address {
  if (!ATTESTATION_ADDRESS) {
    throw new Error("ATTESTATION_CONTRACT_ADDRESS not configured");
  }
  return ATTESTATION_ADDRESS;
}

export const agentEscrowAbi = [
  { type: "function", name: "createEscrow", inputs: [{ name: "escrowId", type: "bytes32" }, { name: "provider", type: "address" }, { name: "token", type: "address" }, { name: "milestoneAmounts", type: "uint256[]" }, { name: "deadline", type: "uint256" }], outputs: [], stateMutability: "payable" },
  { type: "function", name: "releaseMilestone", inputs: [{ name: "escrowId", type: "bytes32" }, { name: "milestoneIndex", type: "uint8" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "dispute", inputs: [{ name: "escrowId", type: "bytes32" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "resolveDispute", inputs: [{ name: "escrowId", type: "bytes32" }, { name: "toProvider", type: "uint256" }, { name: "toRequester", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "refund", inputs: [{ name: "escrowId", type: "bytes32" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "getEscrow", inputs: [{ name: "escrowId", type: "bytes32" }], outputs: [{ name: "", type: "tuple", components: [{ name: "requester", type: "address" }, { name: "provider", type: "address" }, { name: "token", type: "address" }, { name: "totalAmount", type: "uint256" }, { name: "releasedAmount", type: "uint256" }, { name: "milestoneCount", type: "uint8" }, { name: "milestonesReleased", type: "uint8" }, { name: "status", type: "uint8" }, { name: "deadline", type: "uint256" }, { name: "createdAt", type: "uint256" }] }], stateMutability: "view" },
  { type: "function", name: "getMilestoneAmount", inputs: [{ name: "escrowId", type: "bytes32" }, { name: "index", type: "uint8" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "platformFeeBps", inputs: [], outputs: [{ name: "", type: "uint16" }], stateMutability: "view" },
  { type: "event", name: "EscrowCreated", inputs: [{ name: "escrowId", type: "bytes32", indexed: true }, { name: "requester", type: "address", indexed: true }, { name: "provider", type: "address", indexed: true }, { name: "token", type: "address", indexed: false }, { name: "totalAmount", type: "uint256", indexed: false }, { name: "milestoneCount", type: "uint8", indexed: false }], anonymous: false },
  { type: "event", name: "MilestoneReleased", inputs: [{ name: "escrowId", type: "bytes32", indexed: true }, { name: "milestoneIndex", type: "uint8", indexed: false }, { name: "amount", type: "uint256", indexed: false }, { name: "fee", type: "uint256", indexed: false }], anonymous: false },
  { type: "event", name: "EscrowCompleted", inputs: [{ name: "escrowId", type: "bytes32", indexed: true }], anonymous: false },
  { type: "event", name: "DisputeOpened", inputs: [{ name: "escrowId", type: "bytes32", indexed: true }, { name: "initiator", type: "address", indexed: false }], anonymous: false },
  { type: "event", name: "DisputeResolved", inputs: [{ name: "escrowId", type: "bytes32", indexed: true }, { name: "toProvider", type: "uint256", indexed: false }, { name: "toRequester", type: "uint256", indexed: false }], anonymous: false },
  { type: "event", name: "EscrowRefunded", inputs: [{ name: "escrowId", type: "bytes32", indexed: true }, { name: "amount", type: "uint256", indexed: false }], anonymous: false },
] as const;

export const attestationRegistryAbi = [
  { type: "function", name: "attest", inputs: [{ name: "subject", type: "address" }, { name: "contractHash", type: "bytes32" }, { name: "attestationType", type: "uint8" }, { name: "score", type: "uint8" }, { name: "contentHash", type: "bytes32" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "getAttestation", inputs: [{ name: "id", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "attester", type: "address" }, { name: "subject", type: "address" }, { name: "contractHash", type: "bytes32" }, { name: "attestationType", type: "uint8" }, { name: "score", type: "uint8" }, { name: "contentHash", type: "bytes32" }, { name: "timestamp", type: "uint256" }] }], stateMutability: "view" },
  { type: "function", name: "getAttestationCount", inputs: [{ name: "subject", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getSubjectAttestationIds", inputs: [{ name: "subject", type: "address" }, { name: "offset", type: "uint256" }, { name: "limit", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }], stateMutability: "view" },
  { type: "event", name: "AttestationCreated", inputs: [{ name: "id", type: "uint256", indexed: true }, { name: "attester", type: "address", indexed: true }, { name: "subject", type: "address", indexed: true }, { name: "attestationType", type: "uint8", indexed: false }, { name: "score", type: "uint8", indexed: false }], anonymous: false },
] as const;
