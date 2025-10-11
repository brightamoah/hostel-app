<script lang="ts" setup>
const { fetch: refreshSession } = useUserSession();

await refreshSession();
</script>

<template>
  <div>
    <div class="top-8 right-8 z-10 absolute">
      <AppThemeToggle />
    </div>

    <slot />

    <AppStarsEffect />
  </div>
</template>

<style scoped>

</style>
