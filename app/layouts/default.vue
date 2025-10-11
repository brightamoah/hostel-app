<script lang="ts" setup>
import { useAuthStore } from "~/stores/authStore";

const authStore = useAuthStore();
const { refreshSession } = authStore;

await refreshSession();
</script>

<template>
  <UContainer>
    <AppNavbar />

    <UMain>
      <slot />
    </UMain>

    <AppStarsEffect />
  </UContainer>
</template>

<style></style>
