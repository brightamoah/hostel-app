import { scrypt as nobleScrypt } from "@noble/hashes/scrypt.js";
import { Buffer } from "node:buffer";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { getRandomValues } from "uncrypto";

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
async function hash(valueToHash: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");

    scrypt(
      valueToHash,
      salt,
      keyLength,
      (err, derivedKey) => {
        if (err) return reject(err);
        resolve(`${salt}.${derivedKey.toString("hex")}`);
      },
    );
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
async function verifyHashedValue(storedHash: string, rawValue: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hashKey] = storedHash.split(".");

    if (!salt || !hashKey) return resolve(false);

    const hashKeyBuffer = Buffer.from(hashKey, "hex");

    scrypt(
      rawValue,
      salt,
      keyLength,
      (err, derivedKey) => {
        if (err) return reject(err);

        if (derivedKey.length !== hashKeyBuffer.length) return resolve(false);

        resolve(timingSafeEqual(hashKeyBuffer, derivedKey));
      },
    );
  });
}

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  dkLen: 64,
};

const SALT_LENGTH = 32;

function getSalt(): Uint8Array {
  const salt = new Uint8Array(SALT_LENGTH);
  getRandomValues(salt);
  return salt;
}

function toBase64(data: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data).toString("base64");
  }
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function newTimingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    diff |= ai ^ bi;
  }
  return diff === 0;
}

function parseScryptPhcString(value: string) {
  const parts = value.split("$");
  const [, algorithm, paramStr = "", saltPart = "", hashPart = ""] = parts;
  if (parts.length !== 5 || algorithm !== "scrypt") {
    throw new Error("Invalid scrypt hash format");
  }

  const params = paramStr.split(",").reduce<Record<string, number>>((acc, entry) => {
    const [k, v] = entry.split("=");
    if (!k || v === undefined) return acc;
    acc[k] = Number(v);
    return acc;
  }, {});

  return {
    params,
    salt: fromBase64(saltPart),
    hash: fromBase64(hashPart),
  };
}

async function hashPasswordWorker(plain: string): Promise<string> {
  const salt = getSalt();
  const encoded = typeof plain === "string" ? new TextEncoder().encode(plain) : new Uint8Array();
  const derived = nobleScrypt(encoded, salt, SCRYPT_PARAMS);
  return `$scrypt$n=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${toBase64(salt)}$${toBase64(derived)}`;
}

async function verifyPasswordWorker(hashedPassword: string, plain: string): Promise<boolean> {
  try {
    const { params, salt, hash } = parseScryptPhcString(hashedPassword);
    const encoded = typeof plain === "string" ? new TextEncoder().encode(plain) : new Uint8Array();
    const derived = nobleScrypt(encoded, salt, {
      N: Number(params.n) || SCRYPT_PARAMS.N,
      r: Number(params.r) || SCRYPT_PARAMS.r,
      p: Number(params.p) || SCRYPT_PARAMS.p,
      dkLen: hash.length || SCRYPT_PARAMS.dkLen,
    });
    return newTimingSafeEqual(hash, derived);
  }
  catch {
    return false;
  }
}

export {
  hash,
  hashPasswordWorker,
  verifyHashedValue,
  verifyPasswordWorker,
};
