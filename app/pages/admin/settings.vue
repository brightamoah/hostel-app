<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});
</script>

<template>
  <div>
    <h1>settings</h1>
  </div>
</template>

<style scoped>

</style>
