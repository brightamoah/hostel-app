<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const authStore = useAuthStore();

onMounted(async () => await authStore.signout());
</script>

<template>
  <div class="flex flex-col justify-center items-center h-full">
    <UIcon
      name="i-lucide-loader"
      size="48"
      class="mx-auto mb-4 text-primary animate-spin"
    />

    <h2 class="mb-2 font-semibold text-2xl">
      Logging Out...
    </h2>

    <p class="text-muted">
      You are being logged out of your account.
    </p>
  </div>
</template>

<style scoped>

</style>
