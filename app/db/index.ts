import * as schema from "~~/server/db/schema/index";
import { drizzle } from "drizzle-orm/neon-http";

const { databaseUrl } = useRuntimeConfig();

export const db = drizzle(databaseUrl, {
  schema,
  casing: "snake_case",
});
