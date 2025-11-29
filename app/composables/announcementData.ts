export function useAnnouncementData() {
  const { data, status, refresh } = useFetch<AnnouncementResponse>("/api/announcement/getAnnouncementData ", {
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

  const announcements = computed<Announcement[]>(() => data.value?.announcements ?? []);

  const filteredAnnouncements = computed<Announcement[]>(() => {
    if (selectedTab.value === "unread") {
      return announcements.value.filter(announcement => !announcement.isRead);
    }
    return announcements.value;
  });

  return {
    data,
    status,
    announcements,
    selectedTab,
    filteredAnnouncements,
    selectedAnnouncement,
    refresh,
  };
}
