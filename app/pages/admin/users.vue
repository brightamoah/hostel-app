<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const title = ref("Users Dashboard");
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="users">
      <template #header>
        <DashboardNav :title />
      </template>

      <template #body>
        <div class="p-4">
          <h1 class="mb-4 font-bold text-2xl">
            Users Dashboard
          </h1>
          <!-- Analytics content goes here -->
          <p>This is where you can display various users data.</p>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>
