export default defineNitroPlugin((plugin) => {
  plugin.hooks.hook("render:response", (response) => {
    if (response.body && typeof response.body === "string") {
      response.body = response.body.replace(/<link\s[^>]*>/gi, (tag) => {
        // Check if this specific tag is a "preload" or "modulepreload"
        if (/rel\s*=\s*["'](?:module)?preload["']/i.test(tag)) {
          // 3. Remove the integrity attribute safely
          // This regex finds 'integrity="..."' regardless of where it is in the tag

          return tag.replace(/\s*integrity\s*=\s*["'][^"']*["']/, "");
        }
        // Return the tag unchanged if it's not a preload link
        return tag;
      });
    }
  });
});
