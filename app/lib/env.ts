import * as z from "zod";

import tryParseEnv from "./tryParseEnv";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  NUXT_SESSION_PASSWORD: z.string(),
  NUXT_SESSION_NAME: z.string(),
  NUXT_DATABASE_URL: z.string(),
  NUXT_NODEMAILER_FROM: z.string(),
  NUXT_NODEMAILER_HOST: z.string(),
  NUXT_NODEMAILER_PORT: z.coerce.number(),
  NUXT_NODEMAILER_AUTH_USER: z.string(),
  NUXT_NODEMAILER_AUTH_PASS: z.string(),
  NUXT_HUB_PROJECT_KEY: z.string(),
  NUXT_HUB_USER_TOKEN: z.string(),
  NUXT_HUB_CLOUDFLARE_ACCOUNT_ID: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

tryParseEnv(EnvSchema);

// eslint-disable-next-line node/no-process-env
export const env = EnvSchema.parse(process.env);
