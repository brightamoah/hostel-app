import type { H3Event } from "h3";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema/index";

type ContextSource = {
  context: {
    cloudflare?: H3Event["context"]["cloudflare"];
  };
};

export function useDB(eventOrContext?: ContextSource | H3Event) {
  const runtimeConfig = useRuntimeConfig();

  let connectionString: string | undefined;

  if (import.meta.dev) {
    connectionString = runtimeConfig.databaseUrl;
    console.log("Development connected directly to the db");
  }
  else if ("context" in (eventOrContext || {}) && eventOrContext?.context.cloudflare) {
    connectionString = eventOrContext.context.cloudflare.env.HYPERDRIVE.connectionString;
    console.log("Production connected to the db via HyperDrive");
  }

  const sql = neon(connectionString!);
  const db = drizzle(sql, {
    schema,
    casing: "snake_case",
  });

  return { db };
}

export type DB = ReturnType<typeof useDB>["db"];
