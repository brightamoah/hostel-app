<script lang="ts" setup>
function getGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Good Morning";
  }
  else if (currentHour < 18) {
    return "Good Afternoon";
  }
  else {
    return "Good Evening";
  }
}

const { user } = useUserSession();

const refreshContext = inject(refreshKey);

const {
  canResend,
  coolDownTime,
  refreshIsLoading,
  handleRefresh,
} = refreshContext ?? {};
</script>

<template>
  <UAlert
    variant="subtle"
    color="neutral"
    orientation="horizontal"
    class="w-full shrink-0"
  >
    <template #title>
      <h1 class="font-semibold text-xl">
        {{ getGreeting() }} {{ user?.name || "Admin" }}
      </h1>
    </template>

    <template #description>
      <p class="text-muted text-base">
        Manage Kings Hostel operations efficiently from your dashboard.
      </p>

      <div class="flex gap-2 mt-3">
        <UButton
          label="View Profile"
          variant="subtle"
          color="neutral"
          icon="i-lucide-user"
          class="cursor-pointer"
          :to="{ name: 'admin-profile' }"
        />

        <DashboardRefreshButton
          :cool-down-time="coolDownTime!"
          :handle-refresh="handleRefresh!"
          :can-resend="canResend!"
          :refresh-is-loading="refreshIsLoading!"
          label="Refresh Data"
          variant="solid"
          color="primary"
        />
      </div>
    </template>

    <template #actions>
      <UIcon
        v-if="getGreeting() === 'Good Morning'"
        name="i-lucide-cloud-sun"
        class="bg-yellow-400 size-20"
      />

      <UIcon
        v-else-if="getGreeting() === 'Good Afternoon'"
        name="i-lucide-sun"
        class="bg-warning size-20"
      />

      <UIcon
        v-else
        name="i-lucide-moon-star"
        class="bg-secondary size-20"
      />
    </template>
  </UAlert>
</template>

<style scoped>

</style>
