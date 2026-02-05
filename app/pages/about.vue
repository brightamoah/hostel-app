<script setup lang="ts">
import { useRoleBasedRoute } from "~/composables/useRoleBasedRoutes";
// import { sampleVisitor } from "~/lib/dummy";

const roleRoutes = useRoleBasedRoute();
</script>

<template>
  <div>
    <ULink
      :to="roleRoutes?.profile"
      label="Go to home"
    >
      {{ roleRoutes?.profile.name }}
    </ULink>

    <BillingConfirmation />
  </div>
</template>

<style scoped>

</style>
