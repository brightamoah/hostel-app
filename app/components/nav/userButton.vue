<script setup lang="ts">
import type { User } from "#auth-utils";
import type { NavigationFailure, RouteLocationRaw } from "vue-router";

const { handleSignOut, isLoggedIn, user } = defineProps<{
  isLoggedIn: boolean;
  user: User | null;
  handleSignOut: () => Promise<false | void | RouteLocationRaw | NavigationFailure>;
}>();

const { userInitials, userBadgeColor, avatarBgColor } = useUseUserItems();

const dashboardIcon = computed(() =>
  user?.role === "admin" ? "i-lucide-shield" : "i-lucide-graduation-cap",
);

const userMenuItems = computed<UserMenuItem[][]>(() => {
  if (!isLoggedIn || !user)
    return [];

  return [
    [
      {
        label: user.name,
        avatar: {
          src: "https://github.com/benjamincanac.png",
        },
        slot: "profile",
        type: "label",
      },
    ],
    [
      {
        label: "View Profile",
        icon: "i-lucide-user",
        to: (user.role === "admin"
          ? { name: "admin-profile" }
          : { name: "student-profile" }),
      },
      {
        label: "Settings",
        icon: "i-lucide-settings",
        to: (user.role === "admin"
          ? { name: "admin-settings" }
          : { name: "student-settings" }),
      },
    ],
    [
      {
        label: "Dashboard",
        icon: dashboardIcon.value,
        to: (user.role === "admin"
          ? { name: "admin-dashboard" }
          : { name: "student-dashboard" }),
      },
    ],
    [
      {
        label: "Log Out",
        icon: "i-lucide-log-out",
        onSelect: () => handleSignOut(),
      },
    ],
  ];
});
</script>

<template>
  <div>
    <div class="-z-10 absolute opacity-0 pointer-events-none">
      <UIcon name="i-lucide-user" />

      <UIcon name="i-lucide-settings" />

      <UIcon name="i-lucide-shield" />

      <UIcon name="i-lucide-graduation-cap" />

      <UIcon name="i-lucide-log-out" />
    </div>

    <UDropdownMenu
      v-if="user && isLoggedIn"
      arrow
      :items="userMenuItems"
      :ui="{
        content: 'w-64',
        item: 'cursor-pointer rounded',
      }"
    >
      <UAvatar
        :alt="user?.name || 'User'"
        :src="user?.image!"
        :text="userInitials"
        size="lg"
        class="text-highlighted cursor-pointer"
        :ui="{ fallback: 'text-white' }"
        :style="`background-color: ${avatarBgColor}`"
      />

      <template #profile>
        <UUser
          :name="user?.name"
          :description="user?.email"
          size="lg"
          :avatar="{
            src: user?.image!,
            text: userInitials,
            style: `background-color: ${avatarBgColor}`,
            ui: { fallback: 'text-white' },
          }"
        >
          <template #description>
            <p>{{ user?.email }}</p>

            <UBadge
              :label="user?.role"
              :color="userBadgeColor"
              variant="subtle"
              size="sm"
              class="justify-center items-center mt-1 text-center"
            />
          </template>
        </UUser>
      </template>
    </UDropdownMenu>

    <div
      v-else-if="!isLoggedIn && user === null"
      class="flex justify-between gap-2"
    >
      <UButton
        label="Login"
        color="neutral"
        :to="{ name: 'auth-login' } as UserMenuItem['to']"
        block
        size="sm"
      />

      <UButton
        label="Signup"
        color="neutral"
        variant="subtle"
        :to="{ name: 'auth-signup' } as UserMenuItem['to']"
        block
        size="sm"
      />
    </div>

    <div
      v-else
      class="flex gap-2"
    >
      <USkeleton class="rounded w-16 h-8" />

      <USkeleton class="rounded w-16 h-8" />
    </div>
  </div>
</template>

<style scoped>

</style>
