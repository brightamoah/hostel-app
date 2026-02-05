<script setup lang="ts">
const isOpen = ref(false);
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Confirming Payment"
    description="Wait while payment is confirmed"
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold hidden',
      description: 'text-center hidden',
      close: 'cursor-pointer',
      header: 'hidden',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <h1>confirmation</h1>

    <template #body>
      <div class="flex flex-col justify-center items-center py-6 h-full">
        <UIcon
          name="i-lucide-loader"
          size="48"
          class="mx-auto mb-4 text-primary animate-spin"
        />

        <h2 class="mb-2 font-semibold text-2xl">
          Confirming Payment...
        </h2>

        <p class="text-muted">
          Please wait while we confirm your payment.
        </p>
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>
