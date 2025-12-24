<script setup lang="ts">
type Variant = "link" | "outline" | "solid" | "soft" | "subtle" | "ghost" | undefined;

const { variant = "outline", color = "primary" } = defineProps<{
  refreshIsLoading: boolean;
  canResend: boolean;
  coolDownTime: number;
  variant?: Variant;
  color?: ColorType;
  handleRefresh: () => Promise<boolean>;

}>();
</script>

<template>
  <UButton
    :label="refreshIsLoading ? 'Refreshing...' : canResend ? 'Refresh' : `Wait ${coolDownTime}s`"
    icon="i-lucide-refresh-cw"
    :loading="refreshIsLoading"
    :disabled="!canResend || refreshIsLoading"
    size="lg"
    :variant
    :color
    class="justify-center items-center cursor-pointer"
    @click="handleRefresh()"
  />
</template>

<style scoped>

</style>
