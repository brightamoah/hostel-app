import { getRandomValues, subtle } from "uncrypto";

import { bytesToHex, fromHexToBytes, timingSafeEqual } from "./nodeUtils";

const KEY_LENGTH = 32;
const ITERATIONS = 100000;
const DIGEST = "SHA-256";

/**
 * Hashes the provided value using scrypt with a randomly generated salt.
 *
 * This function generates a 16-byte random salt, derives a key using scrypt,
 * and returns a promise that resolves to a string in the format "salt.derivedKey".
 *
 * @param {string} valueToHash - The string value to be hashed.
 * @returns A promise that resolves to the hashed value as a string in the format "salt.derivedKey".
 * @throws Will throw an error if the scrypt operation fails.
 */
async function hash(valueToHash: string): Promise<string> {
  const saltBytes = new Uint8Array(16);
  getRandomValues(saltBytes);
  const salt = bytesToHex(saltBytes);

  const derivedKey = await deriveKey(valueToHash, salt);
  const derivedKeyHex = bytesToHex(new Uint8Array(derivedKey));

  return `${salt}.${derivedKeyHex}`;
}

/**
 * Verifies a raw value against a stored hash using timing-safe comparison.
 * @param storedHash - The stored hash in "salt.hashKey" format (hex-encoded)
 * @param rawValue - The raw value to verify against the stored hash
 * @returns A promise that resolves to true if the values match, false otherwise
 * @throws May throw if the hash derivation process fails
 */
async function verifyHashedValue(storedHash: string, rawValue: string): Promise<boolean> {
  const [salt, hashKey] = storedHash.split(".");

  if (!salt || !hashKey) return false;

  const hashKeyBuffer = fromHexToBytes(hashKey);

  const derivedKey = await deriveKey(rawValue, salt);
  const derivedKeyBuffer = new Uint8Array(derivedKey);

  if (derivedKeyBuffer.length !== hashKeyBuffer.length) return false;

  return timingSafeEqual(hashKeyBuffer, derivedKeyBuffer);
}

/**
 * Derives a cryptographic key from a password and salt using the PBKDF2 algorithm.
 *
 * @param password - The plaintext password to derive the key from.
 * @param salt - The salt value (as a hexadecimal string) to use in the key derivation.
 * @returns A Promise that resolves to the derived key as an ArrayBuffer.
 *
 * @remarks
 * - Uses the Web Crypto API's `subtle` interface for key derivation.
 * - The number of iterations, hash algorithm, and key length are determined by the constants `ITERATIONS`, `DIGEST`, and `KEY_LENGTH`.
 * - The `fromHexToBytes` utility function is used to convert the salt from a hex string to a byte array.
 */
async function deriveKey(password: string, salt: string) {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const saltBytes = fromHexToBytes(salt);

  const keyMaterial = await subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const derivedBits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  return derivedBits;
}

export { hash, verifyHashedValue };
