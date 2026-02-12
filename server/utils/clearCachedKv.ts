export async function cleanupExpiredKV(prefix?: string) {
  const kv = useStorage("kv");

  const keys = await kv.keys(prefix);

  const now = Date.now();

  for (const key of keys) {
    const entry = await kv.get<{ expires?: number }>(key);

    if (!entry?.expires) continue;

    if (entry.expires <= now) await kv.del(key);
  }
}
