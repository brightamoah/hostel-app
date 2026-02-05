<script lang="ts" setup>

</script>

<template>
  <div class="relative flex flex-col justify-center items-center px-4 w-full h-dvh overflow-hidden">
    <div class="top-8 left-8 z-10 absolute">
      <AppSpotlightButton
        aria-label="scroll to top button"
        class="flex justify-center items-center p-1 size-10 text-muted transition-all duration-200 cursor-pointer"
        rounded
        @click="navigateTo({ name: 'index' })"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="z-20 size-6"
        />
      </AppSpotlightButton>
    </div>

    <div class="top-8 right-8 z-10 absolute">
      <AppThemeToggle />
    </div>

    <slot />
  </div>
</template>

<style scoped>

</style>
