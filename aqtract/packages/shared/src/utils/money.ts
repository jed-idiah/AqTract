import { formatEther, parseEther } from "viem";

export function weiToEth(wei: string): string {
  return formatEther(BigInt(wei));
}

export function ethToWei(eth: string): string {
  return parseEther(eth).toString();
}

export function addWei(a: string, b: string): string {
  return (BigInt(a) + BigInt(b)).toString();
}

export function subtractWei(a: string, b: string): string {
  const result = BigInt(a) - BigInt(b);
  if (result < 0n) throw new Error("Subtraction would result in negative wei");
  return result.toString();
}

export function multiplyWeiBps(amount: string, bps: number): string {
  return ((BigInt(amount) * BigInt(bps)) / 10000n).toString();
}
