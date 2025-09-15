import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema/index";

export default defineCachedEventHandler(async () => {
  const { databaseUrl } = useRuntimeConfig();

  const db = drizzle(databaseUrl, {
    schema,
    casing: "snake_case",
  });

  const result = await db.execute("select 1");

  console.log("result", result);

  return { result, db };
}, {
  maxAge: 60 * 60 * 24,
});
