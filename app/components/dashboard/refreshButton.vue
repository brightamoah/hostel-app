<script setup lang="ts">
defineProps<{
  refreshIsLoading: boolean;
  canResend: boolean;
  coolDownTime: number;
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
    variant="outline"
    color="primary"
    class="justify-center items-center w-full md:max-w-sm cursor-pointer"
    @click="handleRefresh()"
  />
</template>

<style scoped>

</style>
