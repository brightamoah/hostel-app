import type { H3Event } from "h3";

import { getRequestHeader, getRequestIP } from "h3";

export function getIP(event: H3Event, customIpHeader?: string) {
  const cfIp = getRequestHeader(event, "cf-connecting-ip");
  if (cfIp) return cfIp;

  const ip = customIpHeader
    ? getRequestHeader(event, customIpHeader) || ""
    : getRequestIP(event, { xForwardedFor: true }) || "";

  return ip;
}
