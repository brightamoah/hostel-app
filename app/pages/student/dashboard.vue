<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth"],
  layout: "student-dashboard",
});

const title = ref("Student Dashboard");
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="home">
      <template #header>
        <DashboardNav :title />
      </template>
      <template #body>
        <div class="p-4">
          <h1 class="mb-4 font-bold text-2xl">
            Student dashboard
          </h1>
          <!-- Analytics content goes here -->
          <p>This is where you can display various announcements.</p>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>
