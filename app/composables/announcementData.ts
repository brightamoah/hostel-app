export function useAnnouncementData() {
  const { data, status, refresh } = useFetch<AnnouncementResponse>("/api/announcement/getAnnouncementData", {
    key: "admin-announcements",
    lazy: true,
    default: () => ({
      announcements: [],
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook")
        return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const selectedTab = ref("all");

  const selectedAnnouncement = ref<Announcement | null>(null);

  const processingIds = new Set<number>();

  const announcements = computed<Announcement[]>(() => data.value?.announcements ?? []);

  const filteredAnnouncements = computed<Announcement[]>(() => {
    if (selectedTab.value === "unread") {
      return announcements.value.filter(announcement => !announcement.isRead);
    }
    return announcements.value;
  });

  const markAsRead = async (announcementId: number) => {
    if (!data.value?.announcements)
      return;

    const announcement = data.value.announcements.find(a => a.id === announcementId);

    if (!announcement || announcement.isRead || processingIds.has(announcementId))
      return;

    announcement.isRead = true;
    processingIds.add(announcementId);

    try {
      await $fetch(`/api/announcement/read/${announcementId}`, {
        method: "PATCH",
      });
    }
    catch (error) {
      announcement.isRead = false;
      console.error(`Failed to mark announcement ${announcementId} as read`, error);
    }
    finally {
      processingIds.delete(announcementId);
    }
  };

  watch(selectedAnnouncement, (newAnnouncement) => {
    if (newAnnouncement && !newAnnouncement.isRead) {
      markAsRead(newAnnouncement.id);
    }
  });

  return {
    data,
    status,
    announcements,
    selectedTab,
    filteredAnnouncements,
    selectedAnnouncement,
    refresh,
    markAsRead,
  };
}
