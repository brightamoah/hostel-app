<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const title = ref("Analytics Dashboard");
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel id="analytics">
      <template #header>
        <DashboardNav :title />
      </template>
      <template #body>
        <div class="p-4">
          <h1 class="mb-4 font-bold text-2xl">
            Analytics Dashboard
          </h1>
          <p>This is where you can display various analytics charts and data.</p>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style scoped>

</style>
