import { randomBytes } from "node:crypto";

function generatePassword(length = 11) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}
console.warn(generatePassword());

/**
 * Generates a secure temporary password that is guaranteed
 * to pass the passwordSchema validation.
 */
function generateTempPassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|/<>?";
  const allChars = upper + lower + digits + special;
  const totalLength = 12; // Length 12 (between 8-20)

  // Helper to get a random char
  const rand = (s: string) => s[Math.floor(Math.random() * s.length)];

  // 1. Ensure at least one of each required type
  const passwordParts = [
    rand(upper),
    rand(lower),
    rand(digits),
    rand(special),
  ];

  // 2. Fill the rest of the password length
  for (let i = passwordParts.length; i < totalLength; i++) {
    passwordParts.push(rand(allChars));
  }

  // 3. Shuffle the array to randomize order (Fisher-Yates shuffle)
  for (let i = passwordParts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordParts[i], passwordParts[j]] = [passwordParts[j], passwordParts[i]];
  }

  return passwordParts.join("");
}

console.warn(generateTempPassword());
