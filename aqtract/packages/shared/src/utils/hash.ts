import { keccak256, toBytes } from "viem";

export function hashContent(content: string): `0x${string}` {
  return keccak256(toBytes(content));
}

export function hashJson(obj: unknown): `0x${string}` {
  const serialized = JSON.stringify(obj, Object.keys(obj as object).sort());
  return hashContent(serialized);
}
