<script setup lang="ts">
import { useRoleBasedRoute } from "~/composables/useRoleBasedRoutes";

const roleRoutes = useRoleBasedRoute();
</script>

<template>
  <div>
    <VisitorDetails />

    <ULink
      :to="roleRoutes?.profile"
      label="Go to home"
    >
      {{ roleRoutes?.profile.name }}
    </ULink>
  </div>
</template>

<style scoped>

</style>
