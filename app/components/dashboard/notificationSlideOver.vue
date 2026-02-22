<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard();

const {
  filteredAnnouncements,
  selectedAnnouncement,
} = useAnnouncementData();
</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Notifications"
    description="Recent notifications"
    :ui="{
      close: 'cursor-pointer',
      body: 'p-1 sm:p-1',
    }"
  >
    <template #body>
      <AnnouncementList
        v-model="selectedAnnouncement"
        :announcements="filteredAnnouncements"
        class="mb-2"
      />
    </template>
  </USlideover>
</template>
