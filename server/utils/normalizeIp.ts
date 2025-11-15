/**
 * Normalize various raw IP header/connection values to a clean IP string.
 * - handles comma-separated forwarded lists (takes first)
 * - strips port suffixes and bracketed IPv6 ports
 * - removes IPv6 zone identifiers (%eth0)
 * - converts IPv4-mapped IPv6 (::ffff:127.0.0.1) and ::1 to 127.0.0.1
 * - returns "unknown" for empty/invalid inputs
 */
export function normalizeIp(rawIp?: string) {
  if (!rawIp)
    return "unknown";
  // IPv4-mapped IPv6 (node sometimes gives ::ffff:127.0.0.1)
  if (rawIp.startsWith("::ffff:"))
    return rawIp.split("::ffff:")[1];
  if (rawIp === "::1")
    return "127.0.0.1";
  return rawIp;
}
