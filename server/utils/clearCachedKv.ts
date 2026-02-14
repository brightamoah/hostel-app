import { log } from "node:console";

export async function cleanupExpiredKV(prefix?: string) {
  const kv = useStorage("kv");

  const keys = await kv.keys(prefix);

  log("Checking KV for expired entries...", { prefix, totalKeys: keys.length });

  const now = Date.now();

  for (const key of keys) {
    const entry = await kv.get<{ expires?: number }>(key);

    if (!entry?.expires) continue;

    if (entry.expires <= now) {
      await kv.del(key);
      log("Deleted expired KV entry", { key });
    }
    else {
      log("KV entry still valid", { key, expiresIn: entry.expires - now });
    }
  }
}
