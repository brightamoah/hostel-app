import { defineConfig } from "drizzle-kit";

import { env } from "./app/lib/env";

export default defineConfig({
  out: "./server/db/migrations",
  schema: "./server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.NUXT_DATABASE_URL,
  },
  casing: "snake_case",
});
