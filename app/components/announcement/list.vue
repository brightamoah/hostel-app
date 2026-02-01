<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseAbsolute, toCalendarDate, today } from "@internationalized/date";

const { announcements } = defineProps<{
  announcements: Announcement[];
}>();

const announcementRefs = ref<Element[]>([]);

const selectedAnnouncement = defineModel<Announcement | null>();

watch(selectedAnnouncement, () => {
  if (!selectedAnnouncement.value) return;

  const elementRef = announcementRefs.value[selectedAnnouncement.value.id];

  if (elementRef) elementRef.scrollIntoView({ block: "nearest" });
});

defineShortcuts({
  arrowdown: () => {
    const index = announcements
      .findIndex(announcement => announcement.id === selectedAnnouncement.value?.id);

    if (index === -1) selectedAnnouncement.value = announcements[0];

    else if (index < announcements.length - 1) selectedAnnouncement.value = announcements[index + 1];
  },
  arrowup: () => {
    const index = announcements
      .findIndex(announcement => announcement.id === selectedAnnouncement.value?.id);

    if (index === -1) selectedAnnouncement.value = announcements[announcements.length - 1];

    else if (index > 0) selectedAnnouncement.value = announcements[index - 1];
  },
});

function formatAnnouncementDate(dateStr: string | Date) {
  const date = new Date(dateStr);
  const tz = getLocalTimeZone();
  const zdt = parseAbsolute(date.toISOString(), tz);
  const current = today(tz);

  if (toCalendarDate(zdt).compare(current) === 0) {
    return new DateFormatter("en-GH", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  }
  return new DateFormatter("en-GH", { day: "2-digit", month: "short" }).format(date);
}
</script>

<template>
  <div class="divide-y divide-default overflow-y-auto">
    <div
      v-for="announcement in announcements"
      :key="announcement.id"
      :ref="el => { announcementRefs[announcement.id] = el as Element }"
    >
      <div
        class="p-4 sm:px-6 border-l-2 rounded-lg text-sm transition-colors cursor-pointer"
        :class="[
          !announcement.isRead ? 'text-highlighted' : 'text-toned',
          selectedAnnouncement && selectedAnnouncement.id === announcement.id
            ? 'border-primary bg-primary/10'
            : 'border-bg hover:border-primary/40 hover:bg-primary/2',
        ]"
        @click="selectedAnnouncement = announcement"
      >
        <div
          class="flex justify-between items-center"
          :class="[!announcement.isRead && 'font-bold']"
        >
          <div class="flex items-center gap-3">
            {{ announcement.title }}

            <UBadge
              variant="subtle"
              size="sm"
              :label="announcement.priority"
              :color="priorityColorMap[announcement.priority]"
            />

            <UChip
              v-if="!announcement.isRead"
              color="primary"
            />
          </div>

          <span>{{ formatAnnouncementDate(announcement.postedAt) }}</span>
        </div>

        <p
          class="text-xs truncate"
          :class="[!announcement.isRead && 'font-semibold']"
        >
          from {{ announcement.postedByAdmin.user.name }}
        </p>

        <div
          v-if="announcement.content"
          class="text-dimmed line-clamp-1"
          v-html="announcement.content"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
