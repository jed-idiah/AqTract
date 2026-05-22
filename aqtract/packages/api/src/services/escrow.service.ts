import { type Address, type Hex, encodeFunctionData, keccak256, toHex } from "viem";
import {
  publicClient,
  getWalletClient,
  getEscrowAddress,
  agentEscrowAbi,
} from "../lib/chain.js";

export function generateEscrowId(contractId: string): Hex {
  return keccak256(toHex(contractId));
}

export async function buildCreateEscrowTx(params: {
  contractId: string;
  providerWallet: Address;
  token: Address;
  milestoneAmounts: bigint[];
  deadline: bigint;
}) {
  const escrowId = generateEscrowId(params.contractId);
  const isEth = params.token === "0x0000000000000000000000000000000000000000";
  const totalValue = params.milestoneAmounts.reduce((a, b) => a + b, 0n);

  const data = encodeFunctionData({
    abi: agentEscrowAbi,
    functionName: "createEscrow",
    args: [
      escrowId,
      params.providerWallet,
      params.token,
      params.milestoneAmounts,
      params.deadline,
    ],
  });

  return {
    escrowId,
    to: getEscrowAddress(),
    data,
    value: isEth ? totalValue : 0n,
  };
}

export async function buildReleaseMilestoneTx(
  contractId: string,
  milestoneIndex: number
) {
  const escrowId = generateEscrowId(contractId);
  const data = encodeFunctionData({
    abi: agentEscrowAbi,
    functionName: "releaseMilestone",
    args: [escrowId, milestoneIndex],
  });

  return { to: getEscrowAddress(), data, value: 0n };
}

export async function buildDisputeTx(contractId: string) {
  const escrowId = generateEscrowId(contractId);
  const data = encodeFunctionData({
    abi: agentEscrowAbi,
    functionName: "dispute",
    args: [escrowId],
  });

  return { to: getEscrowAddress(), data, value: 0n };
}

export async function getEscrowOnChain(contractId: string) {
  const escrowId = generateEscrowId(contractId);
  return await publicClient.readContract({
    address: getEscrowAddress(),
    abi: agentEscrowAbi,
    functionName: "getEscrow",
    args: [escrowId],
  });
}

export async function executeReleaseMilestone(
  contractId: string,
  milestoneIndex: number
) {
  const escrowId = generateEscrowId(contractId);
  const walletClient = getWalletClient();

  const hash = await walletClient.writeContract({
    address: getEscrowAddress(),
    abi: agentEscrowAbi,
    functionName: "releaseMilestone",
    args: [escrowId, milestoneIndex],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function executeDispute(contractId: string) {
  const escrowId = generateEscrowId(contractId);
  const walletClient = getWalletClient();

  const hash = await walletClient.writeContract({
    address: getEscrowAddress(),
    abi: agentEscrowAbi,
    functionName: "dispute",
    args: [escrowId],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, receipt };
}

export async function getPlatformFeeBps(): Promise<number> {
  const fee = await publicClient.readContract({
    address: getEscrowAddress(),
    abi: agentEscrowAbi,
    functionName: "platformFeeBps",
  });
  return fee;
}
