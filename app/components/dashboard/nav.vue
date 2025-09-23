<script setup lang="ts">
// import type { DropdownMenuItem } from "@nuxt/ui";

import { useDashboard } from "~/composables/useDashboard";

defineProps<{
  title: string;
}>();

const { isNotificationsSlideoverOpen } = useDashboard();

const { loggedIn: isLoggedIn, user } = useUserSession();

const { signout } = useAuthStore();

// const items = [[{
//   label: "New mail",
//   icon: "i-lucide-send",
//   to: "/inbox",
// }, {
//   label: "New customer",
//   icon: "i-lucide-user-plus",
//   to: "/customers",
// }]] satisfies DropdownMenuItem[][];
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

      <!-- <UDropdownMenu
        :items="items"
        arrow
      >
        <UButton
          icon="i-lucide-plus"
          size="md"
          class="rounded-full"
        />
      </UDropdownMenu> -->
    </template>
  </UDashboardNavbar>
</template>

<style scoped>

</style>
