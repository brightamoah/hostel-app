// https://nuxt.com/docs/api/configuration/nuxt-config
import { env } from "./app/lib/env";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@pinia/nuxt",
    "nuxt-auth-utils",
    "nuxt-nodemailer",
  ],

  css: ["~/assets/css/main.css"],

  experimental: {
    typedPages: true,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
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
