export function getOrdinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const value = n % 100;
  return s[(value - 20) % 10] || s[value] || s[0];
}

export function getOrdinalString(n: number): string {
  return `${n}${getOrdinal(n)}`;
}
