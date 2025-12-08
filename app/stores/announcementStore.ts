import type { FormSubmitEvent } from "@nuxt/ui";

import { breakpointsTailwind, useBreakpoints, useDebounceFn } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";

const defaultState: CreateAnnouncementSchema = {
  title: "",
  content: "",
  priority: "",
  targetAudience: "",
  targetHostelId: undefined,
  targetRoomId: undefined,
  targetUserId: undefined,
};

export const useAnnouncementStore = defineStore("announcementStore", () => {
  const toast = useToast();

  const open = ref(false);
  const isLoading = ref(false);
  const isFetchingDraft = ref(false);

  const breakpoints = useBreakpoints(breakpointsTailwind);
  const isMobile = breakpoints.smaller("lg");

  const { user } = useUserSession();

  const announcementDataKey = computed(() => `announcement-data-${user.value?.id}`);

  const audience = ref<CreateAnnouncementSchema["targetAudience"][]>([
    "all",
    "students",
    "admins",
    "hostel",
    "room",
    "user",
  ]);

  const priority = ref<CreateAnnouncementSchema["priority"][]>([
    "low",
    "medium",
    "high",
    "emergency",
  ]);

  const announcementState = ref<CreateAnnouncementSchema>({ ...defaultState });

  const isFormValid = computed(() => {
    const { title, content, priority, targetAudience, targetUserId, targetHostelId, targetRoomId } = announcementState.value;

    const hasBasicFields = title.trim() !== "" && content.trim() !== "" && priority.trim() !== "" && targetAudience.trim() !== "";

    const hasValidTarget = (() => {
      switch (targetAudience) {
        case "user":
          return targetUserId !== undefined;
        case "hostel":
          return targetHostelId !== undefined;
        case "room":
          return targetRoomId !== undefined;
        case "all":
        case "students":
        case "admins":
          return true;
        default:
          return false;
      }
    })();

    return hasBasicFields && hasValidTarget;
  });

  const loadDraft = async () => {
    isFetchingDraft.value = true;

    try {
      const draft = await $fetch<CreateAnnouncementSchema>("/api/announcement/draft", {
        method: "GET",
      });

      if (draft) {
        announcementState.value = { ...defaultState, ...draft };
      }
    }
    catch (error) {
      console.error("Failed to load draft:", error);
    }
    finally {
      isFetchingDraft.value = false;
    }
  };

  const saveDraft = useDebounceFn(async (newState: Partial<CreateAnnouncementSchema>) => {
    try {
      await $fetch("/api/announcement/draft", {
        method: "POST",
        body: newState,
      });
    }
    catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, 5000);

  watch(announcementState, (newState) => {
    saveDraft(newState);
  }, { deep: true });

  const createAnnouncement = async (payload: FormSubmitEvent<CreateAnnouncementSchema>) => {
    if (!isFormValid) return;

    isLoading.value = true;

    try {
      const response = await $fetch("/api/announcement/create", {
        method: "POST",
        body: payload.data,
      });

      toast.add({
        title: "Announcement Published Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      await refreshNuxtData(announcementDataKey.value);

      await resetAnnouncementState();

      open.value = false;
    }
    catch (error) {
      const message = (error as any)?.data?.message;

      toast.add({
        title: "Failed to publish the announcement",
        description: message,
        color: "error",
        icon: "i-lucide-alert-circle",
        duration: 8000,
      });
    }
    finally {
      isLoading.value = false;
    }
  };

  async function resetAnnouncementState() {
    announcementState.value = { ...defaultState };
    await $fetch("/api/announcement/draft", {
      method: "DELETE",
    });
  }

  if (import.meta.client) {
    loadDraft();
  }

  return {
    open,
    isLoading,
    isMobile,
    announcementState,
    audience,
    priority,
    isFormValid,
    isFetchingDraft,
    loadDraft,
    saveDraft,
    createAnnouncement,
    resetAnnouncementState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAnnouncementStore, import.meta.hot));
}
