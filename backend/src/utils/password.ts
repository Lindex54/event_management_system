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

const passwordPattern = {
  length: /.{8,}/,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

export function passwordStrengthError(password: string): string | null {
  if (!passwordPattern.length.test(password)) return "Password must be at least 8 characters long";
  if (!passwordPattern.upper.test(password)) return "Password must contain at least one uppercase letter";
  if (!passwordPattern.lower.test(password)) return "Password must contain at least one lowercase letter";
  if (!passwordPattern.number.test(password)) return "Password must contain at least one number";
  if (!passwordPattern.special.test(password)) return "Password must contain at least one special character";
  return null;
}
