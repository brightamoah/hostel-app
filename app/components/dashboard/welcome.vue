<script setup lang="ts">
defineProps<{
  userName: string;
}>();
</script>

<template>
  <UCard
    variant="subtle"
    class="bg-accented"
    :ui="{
      body: 'flex flex-col justify-between md:flex-row md:items-center',
    }"
  >
    <div class="">
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
      height="250"
      class="md:-mt-5 md:-mb-4"
    />
  </UCard>
</template>

<style scoped>

</style>
