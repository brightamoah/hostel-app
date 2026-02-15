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
      nodeCompat: true,
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
    rollupConfig: {
      external: [
        "cloudflare:sockets",
      ],
    },
    experimental: {
      tasks: true,
      openAPI: true,
    },
    scheduledTasks: {
      "0 0 * * *": ["clearExpiredCache", "checkOverdueBillings"],
      "10 0 * * *": ["cancelUnpaidAllocations"],
      "0 1 * * SUN": ["applyOverdueLateFee"],
    },
    devStorage: {
      kv: {
        driver: "fs-lite",
        base: "./.data/kv",
      },
    },
    storage: {
      kv: {
        driver: "cloudflare-kv-binding",
        options: {
          binding: "KV",
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: env.NUXT_PUBLIC_SITE_URL,
      paystackPublicKey: env.NUXT_PAYSTACK_PUBLIC_KEY,
      paystackBaseUrl: env.NUXT_PAYSTACK_BASE_URL,
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
    paystackSecretKey: env.NUXT_PAYSTACK_SECRET_KEY,
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
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://js.paystack.co",
          "https://*.paystack.com",
          "https://*.paystack.co",
          "https://api.iconify.design/",
        ],
        "frame-src": [
          "'self'",
          "https://checkout.paystack.com",
          "https://*.paystack.com",
          "https://*.paystack.co",
          "https://api.iconify.design/",
        ],
        "connect-src": [
          "'self'",
          "https://api.paystack.co",
          "https://*.paystack.co",
          "https://*.paystack.com",
          "https://*.browser-intake-datadoghq.com",
          "https://api.iconify.design/",
        ],
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
