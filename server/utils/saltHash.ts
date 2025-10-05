import { Buffer } from "node:buffer";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const keyLength = 64;

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
export async function hash(valueToHash: string) {
  return new Promise<string>((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");

    scrypt(valueToHash, salt, keyLength, (err, derivedKey) => {
      if (err)
        reject(err);
      resolve(`${salt}.${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verifies a raw value against a stored hashed value using scrypt and timing-safe comparison.
 *
 * @param storedHash - The stored hash string in the format "salt.hashKey".
 * @param rawValue - The raw value to verify against the stored hash.
 * @returns A promise that resolves to true if the raw value matches the stored hash, false otherwise.
 * @throws Will reject with an error if the scrypt operation fails.
 */
export async function verifyHashedValue(storedHash: string, rawValue: string) {
  return new Promise<boolean>((resolve, reject) => {
    const [salt, hashKey] = storedHash.split(".");

    const hashKeyBuffer = Buffer.from(hashKey, "hex");

    scrypt(rawValue, salt, keyLength, (err, derivedKey) => {
      if (err)
        reject(err);
      resolve(timingSafeEqual(hashKeyBuffer, derivedKey));
    });
  });
}
