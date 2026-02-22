<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard();

const {
  filteredAnnouncements,
  selectedAnnouncement,
} = useAnnouncementData();

watch(isNotificationsSlideoverOpen, (isOpen) => {
  if (!isOpen) {
    setTimeout(() => {
      selectedAnnouncement.value = null;
    }, 300);
  }
});
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
    <template
      v-if="selectedAnnouncement"
      #content
    >
      <div class="flex flex-col h-full">
        <div class="flex justify-between items-center p-3 border-default border-b shrink-0">
          <UButton
            label="Back"
            icon="i-lucide-arrow-left"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="selectedAnnouncement = null"
          />

          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="isNotificationsSlideoverOpen = false"
          />
        </div>

        <div class="relative flex-1 overflow-y-auto">
          <AnnouncementDetail
            :announcement="selectedAnnouncement"
            @close="selectedAnnouncement = null"
          />
        </div>
      </div>
    </template>

    <template
      v-if="!selectedAnnouncement"
      #body
    >
      <AnnouncementList
        v-if="filteredAnnouncements?.length"
        v-model="selectedAnnouncement"
        :announcements="filteredAnnouncements"
        class="mb-2"
      />

      <div
        v-else
        class="flex flex-col justify-center items-center p-8 text-muted-foreground text-center"
      >
        <UIcon
          name="i-lucide-bell-off"
          class="opacity-50 mb-2 size-12"
        />

        <p>No new notifications</p>
      </div>
    </template>
  </USlideover>
</template>
