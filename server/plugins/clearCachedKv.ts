export default defineNitroPlugin(async () => {
  const kv = useStorage("kv");

  const keys = await kv.getKeys();
  console.log(keys);

  await cleanupExpiredKV("nuxt:icon");
});
