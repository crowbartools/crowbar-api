import { randomBytes } from "node:crypto";

const ALPHANUM =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generate a random alphanumeric cache key.
 * @param length Desired length (default 7)
 */
export function generateCacheKey(length: number = 7): string {
  const n = Math.max(0, Math.floor(length));
  if (n === 0) return "";

  const chars = ALPHANUM;
  const charLen = chars.length;
  const maxMultiple = Math.floor(256 / charLen) * charLen;

  let token = "";
  while (token.length < n) {
    const buf = randomBytes(n - token.length);
    for (let i = 0; i < buf.length && token.length < n; i++) {
      const byte = buf[i];
      if (byte < maxMultiple) {
        token += chars[byte % charLen];
      }
    }
  }
  return token;
}

export default generateCacheKey;
