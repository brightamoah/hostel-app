// https://nuxt.com/docs/api/configuration/nuxt-config
import { env } from "./app/lib/env";

export default defineNuxtConfig({
  compatibilityDate: "latest",
  modules: [
    "nuxt-security",
    "@nuxt/eslint",
    "@nuxtjs/seo",
    "@nuxt/image",
    "@nuxt/ui",
    "@pinia/nuxt",
    "nuxt-auth-utils",
    "@formkit/auto-animate",
    "nuxt-tiptap-editor",
    "@nuxthub/core",
  ],

  $development: {
    modules: ["nuxt-nodemailer"],

    runtimeConfig: {
      public: {
        siteUrl: "http://localhost:3000",
      },
    },

    nitro: {
      preset: "nitro-dev",
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

    hub: {
      kv: true,
      cache: true,
    },

    security: {
      csrf: true,
      rateLimiter: {
        driver: {
          name: "lruCache",
        },
      },
    },

    routeRules: {
      "/_nitro/tasks/**": {
        security: {
          csrf: false,
        },
      },
      "/_nitro/**": {
        security: {
          csrf: false,
        },
      },
    },

    site: {
      url: env.NUXT_PUBLIC_SITE_URL,
      name: env.NUXT_EMAIL_FROM_NAME,
    },
  },

  devtools: { enabled: true },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  css: ["~/assets/css/main.css"],

  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: false,
      wrangler: {
        kv_namespaces: [
          {
            binding: "KV",
            id: env.NUXT_KV_NAMESPACE_ID,
            preview_id: env.NUXT_KV_PREVIEW_NAMESPACE_ID,
          },
          {
            binding: "CACHE",
            id: env.NUXT_KV_NAMESPACE_ID,
            preview_id: env.NUXT_KV_PREVIEW_NAMESPACE_ID,
          },
        ],
      },
    },
    externals: {
      external: ["jspdf", "jspdf-autotable", "node:process", "node:buffer", "node:events"],
    },
    rollupConfig: {
      external: [
        "cloudflare:sockets",
        "node:assert",
        "node:buffer",
        "node:crypto",
        "node:stream",
        "node:util",
        "node:url",
        "jspdf",
        "jspdf-autotable",
      ],
    },
    experimental: {
      tasks: true,
      openAPI: true,
    },
    scheduledTasks: {
      "0 0 * * *": ["clearExpiredCache"],
      "0 1 * * *": ["checkOverdueBillings"],
    },
    externals: {
      external: [
        "cloudflare:sockets",
        "node:assert",
        "node:buffer",
        "node:crypto",
        "node:stream",
        "node:util",
        "node:url",
        "jspdf",
        "jspdf-autotable",
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: env.NUXT_PUBLIC_SITE_URL,
    },
    session: {
      password: env.NUXT_SESSION_PASSWORD,
      name: env.NUXT_SESSION_NAME,
      cookie: {
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    },
    databaseUrl: env.NUXT_DATABASE_URL,
    nodemailerFrom: env.NUXT_NODEMAILER_FROM,
    nodemailerHost: env.NUXT_NODEMAILER_HOST,
    nodemailerPort: env.NUXT_NODEMAILER_PORT,
    nodemailerAuthUser: env.NUXT_NODEMAILER_AUTH_USER,
    nodemailerAuthPass: env.NUXT_NODEMAILER_AUTH_PASS,
    emailFromName: env.NUXT_EMAIL_FROM_NAME,
    emailFromEmail: env.NUXT_EMAIL_FROM_EMAIL,
    nodeEnv: env.NODE_ENV,
  },

  experimental: {
    typedPages: true,
    typescriptPlugin: true,
    viteEnvironmentApi: true,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  routeRules: {
    "/_nitro/tasks/**": {
      security: {
        csrf: false,
      },
    },
    "/api/announcement/**": {
      security: {
        xssValidator: false,
      },
    },
    "/_nitro/**": {
      security: {
        csrf: false,
      },
    },
  },

  security: {
    csrf: true,
    rateLimiter: {
      driver: {
        name: "lruCache",
      },
    },
    headers: {
      contentSecurityPolicy: {
        "img-src": ["'self'", "data:", "https://res.cloudinary.com"],
      },
    },
  },

  site: {
    url: env.NUXT_PUBLIC_SITE_URL,
    name: env.NUXT_EMAIL_FROM_NAME,
  },

  sitemap: {
    zeroRuntime: true,
  },
  ogImage: {
    enabled: false,
  },
});
