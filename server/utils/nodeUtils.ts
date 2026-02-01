/**
 * Converts a Uint8Array to a hexadecimal string representation.
 * @param bytes - The byte array to convert.
 * @returns A lowercase hexadecimal string where each byte is represented as two characters.
 * @example
 * const bytes = new Uint8Array([255, 16, 0]);
 * toHex(bytes); // Returns "ff1000"
 */
function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(
  a: string | Uint8Array | ArrayBuffer | ArrayBufferView,
  b: string | Uint8Array | ArrayBuffer | ArrayBufferView,
): boolean {
  // Convert inputs to Uint8Array for uniform handling
  const bytesA = toUint8Array(a);
  const bytesB = toUint8Array(b);

  if (bytesA.length !== bytesB.length) {
    throw new RangeError("Input values must have the same byte length");
  }

  let result = 0;
  for (let i = 0; i < bytesA.length; i++) {
    result |= bytesA[i]! ^ bytesB[i]!;
  }

  return result === 0;
}

function toUint8Array(
  value: string | Uint8Array | ArrayBuffer | ArrayBufferView,
): Uint8Array {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }

  if (typeof value === "string") {
    return new TextEncoder().encode(value);
  }

  throw new TypeError(
    "Arguments must be one of type: string, Uint8Array, ArrayBuffer, TypedArray, or DataView",
  );
}

export {
  bytesToHex,
  fromHexToBytes,
  timingSafeEqual,
  toUint8Array,
};
