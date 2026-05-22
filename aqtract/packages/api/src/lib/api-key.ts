import { createHash, randomBytes } from "node:crypto";

const PREFIX = "aq_";

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const bytes = randomBytes(32);
  const raw = PREFIX + bytes.toString("base64url");
  const hash = hashKey(raw);
  const prefix = raw.slice(0, PREFIX.length + 8);
  return { raw, hash, prefix };
}

export function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
