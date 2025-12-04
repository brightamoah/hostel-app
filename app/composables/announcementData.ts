export function useAnnouncementData() {
  const { user } = useUserSession();

  const announcementKey = computed(() => `announcement-data-${user.value?.id}`,
  );

  const { data, status, refresh } = useFetch<AnnouncementResponse>("/api/announcement/getAnnouncementData", {
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

  const updateTrigger = useState("announcement-update-trigger", () => 0);

  const selectedTab = useState<string>(`announcement-tab-${user.value?.id}`, () => "all");
  const selectedAnnouncement = useState<Announcement | null>(`announcement-selected-${user.value?.id}`, () => null);

  const processingIds = new Set<number>();

  const announcements = computed<Announcement[]>(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    updateTrigger.value;
    return data.value?.announcements ? [...data.value.announcements] : [];
  });

  const filteredAnnouncements = computed<Announcement[]>(() => {
    if (selectedTab.value === "all") {
      return announcements.value;
    }

    if (selectedTab.value === "unread") {
      return announcements.value.filter((announcement) => {
        const isUnread = !announcement.isRead;
        const isCurrentlySelected = announcement.id === selectedAnnouncement.value?.id;

        return isUnread || isCurrentlySelected;
      });
    }

    return announcements.value;
  });

  const unreadAnnouncementCount = computed(() => announcements.value.filter(announcement => !announcement.isRead).length);

  const updateReadStatus = async (announcementId: number, actionToTake: ReadStatusSchema) => {
    if (!data.value?.announcements) return;

    const announcement = data.value?.announcements.find(a => a.id === announcementId);

    if (!announcement) return;

    const shouldBeRead = actionToTake.action === "read";

    if (announcement.isRead === shouldBeRead || processingIds.has(announcementId)) return;

    const previousState = announcement.isRead;
    announcement.isRead = shouldBeRead;
    processingIds.add(announcementId);

    updateTrigger.value++;

    try {
      await $fetch(`/api/announcement/read/${announcementId}`, {
        method: "PATCH",
        body: actionToTake,
      });
    }
    catch (error) {
      announcement.isRead = previousState;
      updateTrigger.value++;

      console.error(`Failed to mark announcement ${announcementId} as ${actionToTake.action}`, error);
    }
    finally {
      processingIds.delete(announcementId);
    }
  };

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
    refresh,
    updateReadStatus,
  };
}
