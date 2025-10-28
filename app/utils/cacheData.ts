import type { NuxtApp } from "#app";
import type { AsyncDataRefreshCause } from "#app/composables/asyncData";

export function getCachedDataBypassOnRefresh(key: string, nuxtApp: NuxtApp, ctx: {
  cause: AsyncDataRefreshCause;
}) {
  if (ctx.cause && ctx.cause.startsWith("refresh"))
    return undefined;
  return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
}
