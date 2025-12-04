<script setup lang="ts">
definePageMeta({
  middleware: ["requires-auth", "admin"],
  layout: "admin-dashboard",
});

const title = ref("Announcements");

const tabItems = [{
  label: "All",
  value: "all",
}, {
  label: "Unread",
  value: "unread",
}];

const {
  status,
  selectedTab,
  filteredAnnouncements,
  selectedAnnouncement,
  refresh,
} = useAnnouncementData();

const isLoading = ref<boolean>(false);

async function handleRefresh() {
  isLoading.value = true;

  await refresh().finally(() => {
    isLoading.value = false;
  });
}

const isAnnouncementPanelOpen = computed({
  get: () => !!selectedAnnouncement.value,
  set: (val: boolean) => {
    if (!val) selectedAnnouncement.value = null;
  },
});

watch(filteredAnnouncements, () => {
  if (!filteredAnnouncements.value.find(announcement => announcement.id === selectedAnnouncement.value?.id)) selectedAnnouncement.value = null;
});

const announcementStore = useAnnouncementStore();
const { isMobile } = storeToRefs(announcementStore);
</script>

<template>
  <div class="flex flex-1">
    <UDashboardPanel
      id="announcements"
      resizable
      :default-size="25"
      :min-size="20"
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

      <template #body>
        <UEmpty
          v-if="status === 'pending' || status === 'error' || filteredAnnouncements.length === 0"
          class="flex flex-1 justify-center items-center"
          variant="naked"
          icon="i-lucide-bell"
          title="No announcements"
          description="You're all caught up. New announcements will appear here."
          :actions="[
            {
              icon: 'i-lucide-loader',
              label: 'Refresh',
              color: 'neutral',
              variant: 'subtle',
              loading: isLoading || status === 'pending',
              onClick: handleRefresh,
            },
          ]"
        />

        <AnnouncementList
          v-else
          v-model="selectedAnnouncement"
          :announcements="filteredAnnouncements"
        />

        <AnnouncementCreateNew v-if="!selectedAnnouncement" />
      </template>
    </UDashboardPanel>

    <AnnouncementDetail
      v-if="selectedAnnouncement"
      :announcement="selectedAnnouncement"
      @close="selectedAnnouncement = null"
    />

    <div
      v-else
      class="hidden lg:flex flex-1 justify-center items-center"
    >
      <UIcon
        name="i-lucide-inbox"
        class="size-32 text-dimmed"
      />
    </div>

    <ClientOnly>
      <USlideover
        v-if="isMobile"
        v-model:open="isAnnouncementPanelOpen"
        title="Announcement Detail"
        description="View the details of the selected announcement."
      >
        <template #content>
          <AnnouncementDetail
            v-if="selectedAnnouncement"
            :announcement="selectedAnnouncement"
            @close="selectedAnnouncement = null"
          />
        </template>
      </USlideover>
    </ClientOnly>
  </div>
</template>

<style scoped>

</style>
