<script lang="ts" setup>

</script>

<template>
  <UPageGrid class="gap-4 sm:gap-6 lg:gap-6 lg:grid-cols-4">
    <USkeleton
      v-for="n in 4"
      :key="n"
      class="rounded-xl h-24"
    />
  </UPageGrid>
</template>

<style scoped>

</style>
