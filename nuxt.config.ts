// https://nuxt.com/docs/api/configuration/nuxt-config
import { env } from "./app/lib/env";

export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@pinia/nuxt",
    "nuxt-auth-utils",
    "nuxt-nodemailer",
    "@formkit/auto-animate",
    "@nuxthub/core",
  ],
  devtools: { enabled: true },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  css: ["~/assets/css/main.css"],

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  runtimeConfig: {
    session: {
      password: env.NUXT_SESSION_PASSWORD,
      name: env.NUXT_SESSION_NAME,
      cookie: {
        maxAge: 60 * 24 * 7, // 7 days
      },
    },
    databaseUrl: env.NUXT_DATABASE_URL,
    nodemailerFrom: env.NUXT_NODEMAILER_FROM,
    nodemailerHost: env.NUXT_NODEMAILER_HOST,
    nodemailerPort: env.NUXT_NODEMAILER_PORT,
    nodemailerAuthUser: env.NUXT_NODEMAILER_AUTH_USER,
    nodemailerAuthPass: env.NUXT_NODEMAILER_AUTH_PASS,
    nodeEnv: env.NODE_ENV,
  },

  experimental: {
    typedPages: true,
    typescriptPlugin: true,
    // viteEnvironmentApi: true,
  },
  compatibilityDate: "2025-07-15",

  eslint: {
    config: {
      standalone: false,
    },
  },

  nodemailer: {
    from: env.NUXT_NODEMAILER_FROM,
    host: env.NUXT_NODEMAILER_HOST,
    port: env.NUXT_NODEMAILER_PORT,
    secure: true,
    auth: {
      user: env.NUXT_NODEMAILER_AUTH_USER,
      pass: env.NUXT_NODEMAILER_AUTH_PASS,
    },
  },
});
