import { getAddress, isAddress } from "viem";

export function isValidEvmAddress(address: string): boolean {
  return isAddress(address);
}

export function checksumAddress(address: string): string {
  return getAddress(address);
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
