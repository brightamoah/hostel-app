<script setup lang="ts">
import { useRoleBasedRoute } from "~/composables/useRoleBasedRoutes";

const roleRoutes = useRoleBasedRoute();

const id = ref<number>(10000001);
const token = ref("e2470c9c-e68c-4ee8-be0f-11b853dfe964");

const parse = emailVerificationSchema.safeParse({ id: id.value, token: token.value });
</script>

<template>
  <div>
    <h1>{{ parse }}</h1>

    <ULink
      :to="roleRoutes?.profile"
      label="Go to home"
    >
      {{ roleRoutes?.profile.name }}
    </ULink>

    <pre class="flex justify-center items-center min-h-screen">
      {{ roleRoutes }}
    </pre>
  </div>
</template>

<style scoped>

</style>
