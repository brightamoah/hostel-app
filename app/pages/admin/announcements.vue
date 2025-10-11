<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const title = ref("Announcements");
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="announcements">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <div class="p-4">
          <h1 class="mb-4 font-bold text-2xl">
            Student Dashboard
          </h1>
          <!-- Analytics content goes here -->
          <p>This is where you can display various dashboard data.</p>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>
