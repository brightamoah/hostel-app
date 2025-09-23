<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  collapsed?: boolean;
}>();

const colorMode = useColorMode();
const appConfig = useAppConfig();

const { user: currentUser } = useUserSession();

const { userInitials, avatarBgColor, userBadgeColor } = useUseUserItems();

const authStore = useAuthStore();

const colors = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];
const neutrals = ["slate", "gray", "zinc", "neutral", "stone"];

const user = ref({
  name: currentUser.value?.name,
  avatar: {
    src: currentUser.value?.image ?? undefined,
    alt: currentUser.value?.name,
    text: userInitials.value,
    ui: { fallback: "text-white" },
    style: `background-color: ${avatarBgColor.value}`,
  },
});

const themeItems = computed<DropdownMenuItem[]>(() => [
  {
    label: "Primary",
    slot: "chip",
    chip: appConfig.ui.colors.primary,
    content: {
      align: "center" as const,
      collisionPadding: 16,
    },
    children: colors.map((color): DropdownMenuItem => ({
      label: color,
      chip: color,
      slot: "chip",
      type: "checkbox" as const,
      checked: appConfig.ui.colors.primary === color,
      onSelect: (e: Event) => {
        e.preventDefault();
        appConfig.ui.colors.primary = color;
      },
    })),
  },
  {
    label: "Neutral",
    slot: "chip",
    chip: appConfig.ui.colors.neutral === "neutral" ? "old-neutral" : appConfig.ui.colors.neutral,
    content: {
      align: "end" as const,
      collisionPadding: 16,
    },
    children: neutrals.map((color): DropdownMenuItem => ({
      label: color,
      chip: color === "neutral" ? "old-neutral" : color,
      slot: "chip",
      type: "checkbox" as const,
      checked: appConfig.ui.colors.neutral === color,
      onSelect: (e: Event) => {
        e.preventDefault();
        appConfig.ui.colors.neutral = color;
      },
    })),
  },
]);

const appearanceItems = computed<DropdownMenuItem[]>(() => [
  {
    label: "Light",
    icon: "i-lucide-sun",
    type: "checkbox" as const,
    checked: colorMode.value === "light",
    onSelect: (e: Event) => {
      e.preventDefault();
      colorMode.preference = "light";
    },
  },
  {
    label: "Dark",
    icon: "i-lucide-moon",
    type: "checkbox" as const,
    checked: colorMode.value === "dark",
    onSelect: (e: Event) => {
      e.preventDefault();
      colorMode.preference = "dark";
    },
  },
]);

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: "label" as const,
      label: user.value.name,
      avatar: user.value.avatar,
      slot: "profile",
    },
  ],
  [
    {
      label: "Profile",
      icon: "i-lucide-user",
      to: { name: "student-profile" },
    },
    {
      label: "Billing",
      icon: "i-lucide-credit-card",
      to: { name: "student-billing" },
    },
    {
      label: "Settings",
      icon: "i-lucide-settings",
      to: { name: "student-settings" },
    },
  ],
  [
    {
      label: "Theme",
      icon: "i-lucide-palette",
      children: themeItems.value,
    },
    {
      label: "Appearance",
      icon: "i-lucide-sun-moon",
      children: appearanceItems.value,
    },
  ],
  [
    {
      label: "GitHub repository",
      icon: "i-simple-icons-github",
      to: "https://github.com/brightamoah/hostel-app.git" as string,
      target: "_blank" as const,
    },
    {
      label: "Log out",
      icon: "i-lucide-log-out",
      onSelect: () => {
        // e.preventDefault();
        authStore.signout();
      },
    },
  ],
]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)',
           item: 'cursor-pointer rounded',
    }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated cursor-pointer"
      :ui="{
        trailingIcon: 'text-dimmed',
        leadingAvatarSize: 'md',
        label: 'ml-0.5 text-base',
      }"
    />

    <template #profile>
      <UUser
        :name="user?.name"
        :description="currentUser?.email"
        size="lg"
        :avatar="{
          src: user?.avatar.src!,
          text: userInitials,
          style: `background-color: ${avatarBgColor}`,
          ui: { fallback: 'text-white' },
        }"
      >
        <template #description>
          <p>{{ currentUser?.email }}</p>
          <UBadge
            :label="currentUser?.role"
            :color="userBadgeColor"
            variant="subtle"
            size="sm"
            class="justify-center items-center mt-1 text-center"
          />
        </template>
      </UUser>
    </template>

    <template #chip-leading="{ item }">
      <span
        :style="{
          '--chip-light': `var(--color-${(item as any).chip}-500)`,
          '--chip-dark': `var(--color-${(item as any).chip}-400)`,
        }"
        class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
      />
    </template>
  </UDropdownMenu>
</template>
