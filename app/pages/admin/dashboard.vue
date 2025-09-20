<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "dashboard",
});
</script>

<template>
  <div>
    <h1>dashboard</h1>
  </div>
</template>

<style scoped></style>
