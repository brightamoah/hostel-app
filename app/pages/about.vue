<script setup lang="ts">
import { randomUUID } from "uncrypto";

const id = randomUUID();
const color = generateUserColor(id);
</script>

<template>
  <div>
    <h1>about</h1>
    <ULink
      :to="{ name: 'index' }"
      label="Go to home"
    />

    <div
      class="flex justify-center items-center min-h-screen"
      :style="{ backgroundColor: color }"
    >
      {{ color }}
      {{ id }}
    </div>
  </div>
</template>

<style scoped>

</style>
