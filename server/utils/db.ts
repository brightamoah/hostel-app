/* eslint-disable no-console */
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
let _activeUrl: string | null = null;

export function useDB(eventOrContext?: ContextSource | H3Event) {
  const runtimeConfig = useRuntimeConfig();

  let connectionString: string | undefined;

  if (eventOrContext && "context" in eventOrContext) {
    const cfEnv = eventOrContext.context.cloudflare?.env;
    if (cfEnv?.HYPERDRIVE?.connectionString) {
      connectionString = cfEnv.HYPERDRIVE.connectionString;
      console.log("Connected to ");
    }
  }

  if (!connectionString) connectionString = runtimeConfig.databaseUrl as string;

  if (!connectionString) {
    throw new Error(
      "Database connection string not found. Ensure HYPERDRIVE is bound in production or NUXT_DATABASE_URL is set.",
    );
  }

  if (_db && _activeUrl === connectionString) {
    return { db: _db };
  }

  console.log(`Initializing new DB connection. Using Hyperdrive: ${connectionString.includes("hyperdrive")}`);

  const client = postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
  });

  _db = drizzle(client, {
    schema,
    casing: "snake_case",
  });

  _activeUrl = connectionString;

  return { db: _db };
}

export type DB = ReturnType<typeof useDB>["db"];
