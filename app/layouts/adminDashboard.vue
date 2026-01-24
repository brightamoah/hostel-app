<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const toast = useToast();

const open = ref(false);

const { refreshSession } = useAuthStore();

const { unreadAnnouncementCount } = useAnnouncementData();

const links = computed(() => [[
  {
    label: "Dashboard",
    icon: "i-lucide-house",
    to: { name: "admin-dashboard" },
    onSelect: () => open.value = false,
  },
  {
    label: "Rooms",
    icon: "i-lucide-building-2",
    to: { name: "admin-rooms" },
    onSelect: () => open.value = false,
  },
  {
    label: "Users",
    icon: "i-lucide-user",
    to: { name: "admin-users" },
    onSelect: () => open.value = false,
  },
  {
    label: "Visitors",
    icon: "i-lucide-users",
    to: { name: "admin-visitors" },
    onSelect: () => open.value = false,
  },
  {
    label: "Maintenance",
    icon: "i-heroicons-wrench-screwdriver",
    to: { name: "admin-maintenance" },
    onSelect: () => open.value = false,
  },
  {
    label: "Complaints",
    icon: "i-lucide-message-square-warning",
    to: { name: "admin-complaints" },
    onSelect: () => open.value = false,
  },
  {
    label: "Billings",
    icon: "i-lucide-credit-card",
    to: { name: "admin-billings" },
    onSelect: () => open.value = false,
  },
  {
    label: "Announcements",
    icon: "i-lucide-megaphone",
    to: { name: "admin-announcements" },
    badge: unreadAnnouncementCount.value,
    onSelect: () => open.value = false,
  },
  {
    label: "Analytics",
    icon: "i-lucide-chart-no-axes-combined",
    to: { name: "admin-analytics" },
    onSelect: () => open.value = false,
  },
  // {
  //   label: "Settings",
  //   to: "/settings",
  //   icon: "i-lucide-settings",
  //   defaultOpen: true,
  //   type: "trigger",
  //   children: [{
  //     label: "General",
  //     to: "/settings",
  //     exact: true,
  //     onSelect: () => {
  //       open.value = false;
  //     },
  //   }, {
  //     label: "Members",
  //     to: "/settings/members",
  //     onSelect: () => {
  //       open.value = false;
  //     },
  //   }, {
  //     label: "Notifications",
  //     to: "/settings/notifications",
  //     onSelect: () => {
  //       open.value = false;
  //     },
  //   }, {
  //     label: "Security",
  //     to: "/settings/security",
  //     onSelect: () => {
  //       open.value = false;
  //     },
  //   }],
  // },
], [{
  label: "Feedback",
  icon: "i-lucide-message-circle",
  to: "https://github.com/brightamoah/hostel-app.git",
  target: "_blank",
}, {
  label: "Help & Support",
  icon: "i-lucide-info",
  to: "https://github.com/brightamoah/hostel-app.git",
  target: "_blank",
}]] satisfies NavigationMenuItem[][]);

const groups = computed(() => [
  {
    id: "links",
    label: "Go to",
    items: links.value.flat(),
  },
  {
    id: "code",
    label: "Code",
    items: [{
      id: "source",
      label: "View page source",
      icon: "i-lucide-github",
      to: "https://github.com/brightamoah/hostel-app.git",
      target: "_blank",
    }],
  },
]);

onMounted(async () => {
  await refreshSession();

  const cookie = useCookie("cookie-consent");
  if (cookie.value === "accepted") return;

  toast.add({
    title: "We use first-party cookies to enhance your experience on our website.",
    duration: 0,
    close: false,
    actions: [{
      label: "Accept",
      color: "neutral",
      variant: "outline",
      onClick: () => {
        cookie.value = "accepted";
      },
    }, {
      label: "Opt out",
      color: "neutral",
      variant: "ghost",
    }],
  });
});
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="admin-sidebar"
      v-model:open="open"
      collapsible
      collapsed
      resizable
      class="bg-elevated/25"
      :menu="{
        transition: true,
      }"
      :ui="{
        footer: 'lg:border-t lg:border-default',
        content: 'w-[65dvw] max-w-[65dvw] sm:w-full sm:max-w-xs',
      }"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          :to="{ name: 'admin-dashboard' }"
          class="flex justify-center items-center gap-2"
        >
          <AppLogo
            class="size-6 md:size-8"
            :class="{
              'mx-auto': collapsed,
              'mx-0': !collapsed,
            }"
          />

          <h2
            v-if="!collapsed"
            class="font-newsreader font-semibold text-2xl"
          >
            Kings Hostel
          </h2>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default cursor-pointer"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
          :ui="{
            item: 'py-2 last:py-0 last:mt-2',
            linkLabel: 'text-base',
            linkLeadingIcon: 'size-5',
          }"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <DashboardNotificationSlideOver />
  </UDashboardGroup>
</template>
