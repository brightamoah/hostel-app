export default defineTask({
  meta: {
    name: "clearExpiredCache",
    description: "Clears expired cache entries from the key-value store.",
  },
  async run() {
    await cleanupExpiredKV("nuxt:icon");
    return { result: "Expired cache entries cleared." };
  },
});
