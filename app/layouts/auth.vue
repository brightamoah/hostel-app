<script setup lang="ts">
</script>

<template>
  <div class="flex justify-center items-center px-4 h-screen">
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

    <UColorModeButton class="top-8 right-8 z-10 fixed" />

    <UPageCard
      variant="subtle"
      class="w-full max-w-sm"
    >
      <slot />
    </UPageCard>
  </div>
</template>
