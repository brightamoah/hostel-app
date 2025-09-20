<script lang="ts" setup>
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
