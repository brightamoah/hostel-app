<script lang="ts" setup>
definePageMeta({
  middleware: ["requires-auth"],
  layout: "student-dashboard",
});

const title = "Announcements";
const tabItems = [{
  label: "All",
  value: "all",
}, {
  label: "Unread",
  value: "unread",
}];

const selectedTab = ref<string>("all");

const filteredAnnouncements = computed(() => {
  // Placeholder logic for filtering announcements
  // Replace with actual data fetching and filtering logic
  const allAnnouncements = [
    { id: 1, title: "Announcement 1", read: false },
    { id: 2, title: "Announcement 2", read: true },
    { id: 3, title: "Announcement 3", read: false },
  ];

  if (selectedTab.value === "unread") {
    return allAnnouncements.filter(announcement => !announcement.read);
  }
  return allAnnouncements;
});
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel
      id="announcements"
      resizable
      :default-size="30"
      :min-size="30"
      :max-size="30"
      :ui="{
        body: 'p-2 sm:p-0',
      }"
    >
      <template #header>
        <UDashboardNavbar :title>
          <template #leading>
            <UDashboardSidebarCollapse class="cursor-pointer" />
          </template>

          <template #trailing>
            <UBadge
              :label="filteredAnnouncements.length"
              variant="subtle"
            />
          </template>

          <template #right>
            <UTabs
              v-model="selectedTab"
              :items="tabItems"
              :content="false"
              size="xs"
              :ui="{
                trigger: 'cursor-pointer',
              }"
            />
          </template>
        </UDashboardNavbar>
      </template>
    </UDashboardPanel>
  </div>
</template>

<style>

</style>
