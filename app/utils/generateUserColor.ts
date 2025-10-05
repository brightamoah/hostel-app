export function generateUserColor(userId: string | number): string {
  const str = userId.toString();

  // A simple but consistent hash from the user ID (FNV-1a inspired)
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  // Use the hash to spread hues evenly across the color wheel
  // The golden angle (137.508) helps avoid colors that look too similar
  const hue = (hash * 137.508) % 360;

  const saturation = 65 + (hash % 25); // range 65–90%
  const lightness = 45 + (hash % 15); // range 45–60%

  return `hsl(${Math.abs(hue)}, ${saturation}%, ${lightness}%)`;
}
