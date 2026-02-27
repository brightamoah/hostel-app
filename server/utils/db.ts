import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { H3Event } from "h3";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../db/schema/index";

type ContextSource = {
  context: {
    cloudflare?: H3Event["context"]["cloudflare"];
  };
};

let _db: PostgresJsDatabase<typeof schema> | null = null;

export function useDB(eventOrContext?: ContextSource | H3Event) {
  if (_db) return { db: _db };

  const runtimeConfig = useRuntimeConfig();
  let connectionString: string | undefined;

  if (eventOrContext && "context" in eventOrContext) {
    const cfEnv = eventOrContext.context.cloudflare?.env;
    if (cfEnv?.HYPERDRIVE?.connectionString) {
      connectionString = cfEnv.HYPERDRIVE.connectionString;
      console.log(`connected to cloudflare hyperdrive  ${connectionString}`);
    }
  }

  if (!connectionString) connectionString = runtimeConfig.databaseUrl as string;

  if (!connectionString) {
    throw new Error(
      "Database connection string not found. Ensure HYPERDRIVE is bound in production or NUXT_DATABASE_URL is set.",
    );
  }

  const client = postgres(connectionString, {
    prepare: false,
  });

  _db = drizzle(client, {
    schema,
    casing: "snake_case",
  });

  return { db: _db };
}

export type DB = ReturnType<typeof useDB>["db"];
