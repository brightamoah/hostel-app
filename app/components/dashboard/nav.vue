<script setup lang="ts">
// import type { DropdownMenuItem } from "@nuxt/ui";

import { useDashboard } from "~/composables/useDashboard";

defineProps<{
  title: string;
}>();

const { isNotificationsSlideoverOpen } = useDashboard();

const { loggedIn: isLoggedIn, user } = useUserSession();

const { signout } = useAuthStore();

const { filteredAnnouncements } = useAnnouncementData();
const unreadCount = computed(() => {
  return filteredAnnouncements.value?.filter(a => !a.isRead).length || 0;
});
</script>

<template>
  <UDashboardNavbar
    :title
    :ui="{ right: 'gap-3' }"
  >
    <template #leading>
      <UDashboardSidebarCollapse class="cursor-pointer" />
    </template>

    <template #right>
      <AppThemeToggle />

      <UTooltip
        text="Notifications"
        :shortcuts="['N']"
      >
        <UButton
          color="neutral"
          variant="ghost"
          square
          class="cursor-pointer"
          @click="isNotificationsSlideoverOpen = true"
        >
          <UChip
            color="error"
            inset
            :show="unreadCount > 0"
            :text="unreadCount"
            size="2xl"
            class="text-highlighted"
            :ui="{
              base: 'text-highlighted ',
            }"
          >
            <UIcon
              name="i-lucide-bell"
              class="size-5 shrink-0"
            />
          </UChip>
        </UButton>
      </UTooltip>

      <NavUserButton
        :user
        :is-logged-in
        :handle-sign-out="signout"
      />
    </template>
  </UDashboardNavbar>
</template>

<style scoped>

</style>
