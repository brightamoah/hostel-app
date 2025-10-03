<script setup lang="ts">
import { useRoleBasedRoute } from "~/composables/useRoleBasedRoutes";

const roleRoutes = useRoleBasedRoute();
</script>

<template>
  <div>
    <h1>about</h1>
    <ULink
      :to="roleRoutes?.profile"
      label="Go to home"
    >
      {{ roleRoutes?.profile.name }}
    </ULink>

    <pre
      class="flex justify-center items-center min-h-screen"
    >
      {{ roleRoutes }}
    </pre>
  </div>
</template>

<style scoped>

</style>
