export function generateUserColor(userId: string | number): string {
  // Convert userId to string and create a simple hash
  const str = userId.toString();
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the hash to generate HSL values for better color distribution
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85% saturation
  const lightness = 45 + (Math.abs(hash) % 15); // 45-60% lightness

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
