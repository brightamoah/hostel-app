<script setup lang="ts">
import type { NuxtError } from "#app";

import colors from "tailwindcss/colors";

const { error } = defineProps<{ error: NuxtError }>();

const appConfig = useAppConfig();
const colorMode = useColorMode();

const color = computed(() => colorMode.value === "dark" ? (colors as any)[appConfig.ui.colors.neutral][900] : "white");
const radius = computed(() => `:root { --ui-radius: ${appConfig.theme.radius}rem; }`);
const blackAsPrimary = computed(() => appConfig.theme.blackAsPrimary ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }` : ":root {}");

useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { key: "theme-color", name: "theme-color", content: color },
  ],
  link: [
    // { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' }
  ],
  style: [
    { innerHTML: radius, id: "nuxt-ui-radius", tagPriority: -2 },
    { innerHTML: blackAsPrimary, id: "nuxt-ui-black-as-primary", tagPriority: -2 },
  ],
  htmlAttrs: {
    lang: "en",
  },
});

useSeoMeta({
  titleTemplate: "%s - Kings Hostel Management",
  title: String(error.statusCode),
});

useServerSeoMeta({
  ogSiteName: "Kings Hostel Management",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <UApp :toaster="{ position: 'bottom-right', duration: 5000 }">
    <NuxtRouteAnnouncer />

    <NuxtLoadingIndicator
      color="var(--ui-primary)"
      :height="2"
    />

    <AppNavbar />

    <UError :error="error" />

    <AppFooter />
  </UApp>
</template>

<style scoped>

</style>
