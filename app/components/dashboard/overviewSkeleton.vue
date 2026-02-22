<script setup lang="ts">
// No logic needed, purely presentational
</script>

<template>
  <UPageGrid class="gap-6 mt-3">
    <UCard class="h-full">
      <div class="relative flex flex-col justify-center items-center gap-6 w-full h-80 min-h-75">
        <USkeleton class="rounded-full w-56 h-56" />

        <div class="flex gap-4 mt-2">
          <USkeleton class="w-16 h-4" />

          <USkeleton class="w-16 h-4" />
        </div>
      </div>
    </UCard>

    <UCard class="md:col-span-2 h-full">
      <div class="relative flex justify-between items-end gap-4 px-4 pt-8 w-full h-80 min-h-75">
        <USkeleton class="rounded-t-md w-full h-[40%]" />

        <USkeleton class="rounded-t-md w-full h-[70%]" />

        <USkeleton class="rounded-t-md w-full h-[30%]" />

        <USkeleton class="rounded-t-md w-full h-[85%]" />

        <USkeleton class="rounded-t-md w-full h-[60%]" />

        <USkeleton class="rounded-t-md w-full h-full" />
      </div>
    </UCard>

    <UCard class="h-full">
      <div class="relative flex flex-col justify-center items-center gap-6 w-full h-80 min-h-75">
        <USkeleton class="rounded-full w-56 h-56" />

        <div class="flex gap-4 mt-2">
          <USkeleton class="w-20 h-4" />

          <USkeleton class="w-20 h-4" />
        </div>
      </div>
    </UCard>
  </UPageGrid>
</template>
