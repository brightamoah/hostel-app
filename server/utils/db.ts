/* eslint-disable no-console */
// import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { H3Event } from "h3";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../db/schema/index";

type ContextSource = {
  context: {
    cloudflare?: H3Event["context"]["cloudflare"];
  };
};

// let _db: PostgresJsDatabase<typeof schema> | null = null;

export function useDB(eventOrContext?: ContextSource | H3Event) {
  const runtimeConfig = useRuntimeConfig();

  let connectionString: string | undefined;

  if (import.meta.dev) {
    connectionString = runtimeConfig.databaseUrl;
    console.log(`Connected to database in development ${connectionString}`);
  }
  else {
    connectionString = eventOrContext?.context?.cloudflare?.env.HYPERDRIVE.connectionString;
    console.log(`Connected to hyperdrive in production ${connectionString}`);
  }

  if (!connectionString) {
    throw new Error(
      "Database connection string not found. Ensure HYPERDRIVE is bound in production or NUXT_DATABASE_URL is set.",
    );
  }

  console.log(`Initializing new DB connection. Using Hyperdrive: ${connectionString.includes("hyperdrive")}`);

  const client = postgres(connectionString, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
  });

  const _db = drizzle(client, {
    schema,
    casing: "snake_case",
  });

  return { db: _db };
}

export type DB = ReturnType<typeof useDB>["db"];
