/**
 * Generates a secure, random temporary password.
 *
 * The password will be 12 characters long and is guaranteed to contain at least
 * one uppercase letter, one lowercase letter, one digit, and one special character.
 * The characters are shuffled to ensure the position of each character type is random.
 *
 * @returns A 12-character string representing the generated temporary password.
 */
export function generateTempPassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|/<>?";
  const allChars = upper + lower + digits + special;
  const totalLength = 12;

  const randomize = (s: string) => s[Math.floor(Math.random() * s.length)];

  // 1. Ensure at least one of each required type
  const passwordParts = [
    randomize(upper),
    randomize(lower),
    randomize(digits),
    randomize(special),
  ];

  for (let i = passwordParts.length; i < totalLength; i++) passwordParts.push(randomize(allChars));

  for (let i = passwordParts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordParts[i], passwordParts[j]] = [passwordParts[j], passwordParts[i]];
  }

  return passwordParts.join("");
}
