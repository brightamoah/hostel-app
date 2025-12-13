import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "../db/schema/index";

export function useDB() {
  const runtimeConfig = useRuntimeConfig();

  const db = drizzle(runtimeConfig.databaseUrl, {
    schema,
    casing: "snake_case",
  });

  if (!db) throw new Error("Database not initialized");

  return { db };
}

export type DB = ReturnType<typeof useDB>["db"];
