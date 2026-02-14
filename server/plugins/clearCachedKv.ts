export default defineNitroPlugin(async () => {
  await cleanupExpiredKV("nuxt:icon");
});
