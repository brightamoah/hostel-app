<script setup lang="ts">
defineProps<{
  userName: string;
}>();
</script>

<template>
  <div>
    <UCard
      variant="subtle"
      class="bg-accented max-h-64"
      :ui="{
        body: 'flex flex-col justify-between md:flex-row md:items-center sm:p-2',
      }"
    >
      <div class="sm:p-6">
        <h1 class="font-semibold text-xl">
          Welcome back, {{ userName }}
        </h1>

        <p class="mt-1 text-muted text-base">
          Manage your hostel stay efficiently from here!
        </p>

        <UButton
          label="View Profile"
          size="lg"
          class="mt-4 cursor-pointer"
          :to="{ name: 'student-profile' }"
        />
      </div>

      <NuxtImg
        src="/new.png"
        width="400"
        height="270"
        class="hidden md:block"
      />
    </UCard>
  </div>
</template>

<style scoped>

</style>
