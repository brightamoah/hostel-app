/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  KV: KVNamespace;
  HYPERDRIVE: Hyperdrive;
}

declare module "h3" {
  interface H3EventContext {
    cloudflare: {
      env: CloudflareEnv;
    };
  }
}

export {};
