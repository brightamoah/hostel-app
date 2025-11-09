import { isIP } from "node:net";

/**
 * Normalize various raw IP header/connection values to a clean IP string.
 * - handles comma-separated forwarded lists (takes first)
 * - strips port suffixes and bracketed IPv6 ports
 * - removes IPv6 zone identifiers (%eth0)
 * - converts IPv4-mapped IPv6 (::ffff:127.0.0.1) and ::1 to 127.0.0.1
 * - returns "unknown" for empty/invalid inputs
 */
export function normalizeIp(rawIp?: string | null): string {
  if (!rawIp)
    return "unknown";

  let ip = rawIp.trim();

  // x-forwarded-for can be a comma separated list, take first
  ip = ip.split(",")[0].trim();

  // strip surrounding quotes
  ip = ip.replace(/^"(.+)"$/, "$1");

  // [IPv6]:port -> remove brackets (port will be ignored below)
  if (ip.startsWith("[")) {
    const end = ip.indexOf("]");
    if (end !== -1)
      ip = ip.slice(1, end);
  }

  // IPv4 with port => 127.0.0.1:3000
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) {
    ip = ip.split(":")[0];
  }

  // Remove IPv6 zone id (fe80::1%eth0)
  const zoneIndex = ip.indexOf("%");
  if (zoneIndex !== -1)
    ip = ip.slice(0, zoneIndex);

  // IPv4-mapped IPv6
  if (ip.startsWith("::ffff:"))
    ip = ip.split("::ffff:")[1];

  // IPv6 loopback -> canonical IPv4 loopback (preserve original behavior)
  if (ip === "::1")
    return "127.0.0.1";

  // Validate IP
  if (isIP(ip) === 0)
    return "unknown";

  return ip;
}
