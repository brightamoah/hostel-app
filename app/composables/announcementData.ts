export function useAnnouncementData() {
  const { user } = useUserSession();

  const announcementKey = computed(() => `announcement-data-${user.value?.id}`,
  );

  const url = computed(() => user.value?.role === "admin"
    ? "/api/announcement/getAnnouncementData"
    : "/api/announcement/student/getAnnouncements");

  const { data, status, error, refresh } = useFetch<AnnouncementResponse>(url.value, {
    key: announcementKey,
    lazy: true,
    default: () => ({
      announcements: [],
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === "refresh:manual" || ctx.cause === "refresh:hook") return undefined;
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const {
    selectedTab,
    selectedAnnouncement,
    announcements,
    filteredAnnouncements,
    unreadAnnouncementCount,
    updateReadStatus,
    getAnnouncementFromCache,
  } = useAnnouncementTrigger(data, user);

  watch(selectedAnnouncement, (newAnnouncement) => {
    if (newAnnouncement && !newAnnouncement.isRead) updateReadStatus(newAnnouncement.id, { action: "read" });
  });

  return {
    data,
    status,
    announcements,
    selectedTab,
    filteredAnnouncements,
    selectedAnnouncement,
    unreadAnnouncementCount,
    error,
    refresh,
    updateReadStatus,
    getAnnouncementFromCache,
  };
}
