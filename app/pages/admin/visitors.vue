<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const title = ref("Visitors Dashboard");
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="visitors">
      <template #header>
        <DashboardNav :title />
      </template>
      <template #body>
        <div class="p-4">
          <h1 class="mb-4 font-bold text-2xl">
            Visitors Dashboard
          </h1>
          <!-- Analytics content goes here -->
          <p>This is where you can display various visitors data.</p>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>
