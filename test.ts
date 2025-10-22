import { randomBytes } from "node:crypto";

function generatePassword(length = 11) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}
console.warn(generatePassword());

console.warn(generateTempPassword());
