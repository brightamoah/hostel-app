<script setup lang="ts">

</script>

<template>
  <UModal
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[70%] max-w-4xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <UButton
      label="Add New Admin"
      icon="i-lucide-user-plus"
      size="lg"
      class="justify-center items-center w-full sm:w-auto cursor-pointer"
    />
  </UModal>
</template>

<style scoped>

</style>
