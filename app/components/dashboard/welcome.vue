<script setup lang="ts">
defineProps<{
  userName: string;
  refreshIsLoading: boolean;
  canResend: boolean;
  coolDownTime: number;
  handleRefresh: () => Promise<boolean>;
}>();
</script>

<template>
  <div>
    <UCard
      variant="subtle"
      class="bg-accented max-h-64"
      :ui="{
        body: 'flex flex-col justify-between md:flex-row md:items-center sm:p-2 h-full',
      }"
    >
      <div class="sm:p-6">
        <h1 class="font-semibold text-xl">
          Welcome back, {{ userName }}
        </h1>

        <p class="mt-1 text-muted text-base">
          Manage your hostel stay efficiently from here!
        </p>

        <div class="flex md:flex-row md:items-center gap-4 mt-4">
          <UButton
            label="View Profile"
            icon="i-lucide-circle-user-round"
            size="lg"
            class="justify-center items-center cursor-pointer"
            :to="{ name: 'student-profile' }"
          />

          <DashboardRefreshButton
            variant="solid"
            color="neutral"
            :can-resend
            :cool-down-time
            :refresh-is-loading
            :handle-refresh
          />
        </div>
      </div>

      <NuxtImg
        src="/new.png"
        width="400"
        height="250"
        class="hidden md:block max-w-100 max-h-64 object-cover"
      />
    </UCard>
  </div>
</template>

<style scoped>

</style>
