<script lang="ts" setup>
import { useAuthStore } from "~/stores/authStore";

const authStore = useAuthStore();
const { refreshSession } = authStore;

await refreshSession();
</script>

<template>
  <div>
    <SvgsLine1 class="-z-10 absolute inset-0 opacity-15 w-full h-full pointer-events-none" />

    <AppNavbar />

    <UMain>
      <slot />
    </UMain>
    <!-- <AppStarsEffect /> -->

    <AppFooter />
  </div>
</template>

<style></style>
