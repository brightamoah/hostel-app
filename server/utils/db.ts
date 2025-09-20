import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema/index";

export function useDB() {
  const { databaseUrl } = useRuntimeConfig();

  const db = drizzle(databaseUrl, {
    schema,
    casing: "snake_case",
  });

  return { db };
}
