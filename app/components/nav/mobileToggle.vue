<script setup lang="ts">
const isMobileMenuOpen = ref(false);
</script>

<template>
  <USlideover
    v-model:open="isMobileMenuOpen"
    side="left"
    :ui="{ content: 'left-0 inset-y-0 w-[65vw] max-w-none' }"
    class="md:hidden"
  >
    <UButton
      :icon="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
      color="neutral"
      variant="ghost"
      class="transition-transform duration-300 cursor-pointer"
    />
    <template #body>
      <AppPlaceholder class="h-full min-h-48" />
    </template>
  </USlideover>
</template>
