import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../../db/schema/index";

export default defineEventHandler(async (event) => {
  const { cloudflare } = event.context;
  const config = useRuntimeConfig();

  let connectionString: string;

  if (import.meta.dev) {
    connectionString = config.databaseUrl;
  }
  else {
    connectionString = cloudflare.env.HYPERDRIVE.connectionString;
  }

  const client = postgres(connectionString, {
    prepare: false,
  });

  try {
    const db = drizzle(client, {
      schema,
      casing: "snake_case",
    });

    const result = await db.execute(sql`SELECT NOW() AS current_time`);

    const listTables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);

    const users = await db.query.user.findMany({
      where: sql`email IS NOT NULL`,
    });

    return {
      success: true,
      time: result,
      hyperdrive: "connected",
      tables: listTables,
      users,
    };
  }
  catch (e) {
    console.error("Database connection failed", e);
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection failed",
    });
  }
  finally {
    // Clean up the connection
    await client.end();
  }
});
