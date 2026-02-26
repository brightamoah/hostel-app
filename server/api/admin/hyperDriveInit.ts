import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export default defineEventHandler(async (event) => {
  const { cloudflare } = event.context;
  const config = useRuntimeConfig();

  let connectionString: string;

  if (import.meta.dev) {
    connectionString = config.databaseUrl;
    console.log(`Local db connection ${connectionString}`);
  }
  else {
    connectionString = cloudflare.env.HYPERDRIVE.connectionString;
    console.log(`Hyperdrive db connection ${connectionString}`);
  }

  const client = postgres(connectionString, {
    prepare: false,
  });

  try {
    const db = drizzle(client);

    // Example query to verify connection
    const result = await db.execute(sql`SELECT NOW()` as any);

    return {
      success: true,
      time: result,
      hyperdrive: "connected",
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
