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

export async function verifyHashedValue(storedHash: string, inputValue: string) {
  return new Promise<boolean>((resolve, reject) => {
    const [salt, hashKey] = storedHash.split(".");

    const hashKeyBuffer = Buffer.from(hashKey, "hex");

    scrypt(inputValue, salt, keyLength, (err, derivedKey) => {
      if (err)
        reject(err);
      resolve(timingSafeEqual(hashKeyBuffer, derivedKey));
    });
  });
}
