export async function cleanupExpiredKV(prefix?: string) {
  const keys = await kv.keys(prefix);

  for (const key of keys) {
    const value = await kv.get<{ expiresAt?: number }>(key);

    if (!value?.expiresAt) continue;

    if (Date.now() > value.expiresAt) {
      await kv.del(key);
    }
  }
}
