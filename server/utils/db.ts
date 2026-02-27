import type { H3Event } from "h3";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema/index";

type ContextSource = {
  context: {
    cloudflare?: H3Event["context"]["cloudflare"];
  };
};

export function useDB(_eventOrContext?: ContextSource | H3Event) {
  const runtimeConfig = useRuntimeConfig();

  const connectionString: string = runtimeConfig.databaseUrl;

  const sql = neon(connectionString!);
  const db = drizzle(sql, {
    schema,
    casing: "snake_case",
  });

  return { db };
}

export type DB = ReturnType<typeof useDB>["db"];
