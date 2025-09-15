import { z } from "zod";

import tryParseEnv from "./tryParseEnv";

const EnvSchema = z.object({
  NUXT_SESSION_PASSWORD: z.string(),
  NUXT_SESSION_NAME: z.string(),
  NUXT_DATABASE_URL: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

tryParseEnv(EnvSchema);

// eslint-disable-next-line node/no-process-env
export const env = EnvSchema.parse(process.env);
