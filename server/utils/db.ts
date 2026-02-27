import type { H3Event } from "h3";

import { drizzle } from "drizzle-orm/postgres-js";
// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";
import postgres from "postgres";

import * as schema from "../db/schema/index";

type ContextSource = {
  context: {
    cloudflare?: H3Event["context"]["cloudflare"];
  };
};

export function useDB(_eventOrContext?: ContextSource | H3Event) {
  // const runtimeConfig = useRuntimeConfig();

  // const connectionString: string = runtimeConfig.databaseUrl;

  // const sql = neon(connectionString!);
  // const db = drizzle(sql, {
  //   schema,
  //   casing: "snake_case",
  // });

  // return { db };

  const context = _eventOrContext?.context;
  const config = useRuntimeConfig();

  let connectionString: string | undefined;

  if (import.meta.dev) {
    connectionString = config.databaseUrl;
  }
  else {
    connectionString = context?.cloudflare?.env.HYPERDRIVE.connectionString;
  }

  const client = postgres(connectionString!, {
    prepare: false,
  });

  try {
    const db = drizzle(client, {
      schema,
      casing: "snake_case",
    });

    return { db };
  }
  catch (error) {
    console.error("Database connection failed", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection failed",
    });
  }
}

export type DB = ReturnType<typeof useDB>["db"];
