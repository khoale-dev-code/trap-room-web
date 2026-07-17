
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const value = String(password || "");

  if (value.length < 8) {
    const error = new Error("Mật khẩu phải có ít nhất 8 ký tự.");
    error.statusCode = 400;
    throw error;
  }

  const passwordSalt = randomBytes(16).toString("hex");
  const derived = await scrypt(value, passwordSalt, KEY_LENGTH);

  return {
    passwordSalt,
    passwordHash: Buffer.from(derived).toString("hex"),
  };
}

export async function verifyPassword(
  password,
  passwordSalt,
  passwordHash
) {
  if (!passwordSalt || !passwordHash) return false;

  const derived = Buffer.from(
    await scrypt(String(password || ""), passwordSalt, KEY_LENGTH)
  );

  const stored = Buffer.from(passwordHash, "hex");

  return (
    stored.length === derived.length &&
    timingSafeEqual(stored, derived)
  );
}
