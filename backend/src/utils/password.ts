import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const keyLength = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, keyLength) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, encodedKey] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !encodedKey) return false;

  const storedKey = Buffer.from(encodedKey, "hex");
  if (storedKey.length !== keyLength) return false;
  const suppliedKey = await scryptAsync(password, salt, keyLength) as Buffer;
  return timingSafeEqual(storedKey, suppliedKey);
}
