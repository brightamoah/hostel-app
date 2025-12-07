import { breakpointsTailwind, useBreakpoints, useDebounceFn, useStorage } from "@vueuse/core";
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
  const open = ref(false);
  const isLoading = ref(false);
  const isFetchingDraft = ref(false);

  const breakpoints = useBreakpoints(breakpointsTailwind);
  const isMobile = breakpoints.smaller("lg");
  // const { user } = useUserSession();

  // const stateKey = computed(() => `announcement-draft-${user.value?.id}`);

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

  // const announcementState = useStorage<CreateAnnouncementSchema>(stateKey, { ...defaultState });

  const announcementState = ref<CreateAnnouncementSchema>({ ...defaultState });

  const isFormValid = computed(() => {
    return (
      announcementState.value.title.trim() !== ""
      && announcementState.value.content.trim() !== ""
      && announcementState.value.priority.trim() !== ""
      && announcementState.value.targetAudience.trim() !== ""

    );
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
  }, 2000);

  watch(announcementState, (newState) => {
    saveDraft(newState);
  }, { deep: true });

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
    resetAnnouncementState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAnnouncementStore, import.meta.hot));
}
