import { breakpointsTailwind, useBreakpoints, useStorage } from "@vueuse/core";
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
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const isMobile = breakpoints.smaller("lg");
  const { user } = useUserSession();

  const stateKey = computed(() => `announcement-form-draft-${user.value?.id}`);

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

  const announcementState = useStorage<CreateAnnouncementSchema>(stateKey, { ...defaultState });

  const isFormValid = computed(() => {
    return (
      announcementState.value.title.trim() !== ""
      && announcementState.value.content.trim() !== ""
      && announcementState.value.priority.trim() !== ""
      && announcementState.value.targetAudience.trim() !== ""

    );
  });

  function resetAnnouncementState() {
    return announcementState.value = { ...defaultState };
  }

  return {
    open,
    isLoading,
    isMobile,
    announcementState,
    audience,
    priority,
    isFormValid,
    resetAnnouncementState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAnnouncementStore, import.meta.hot));
}
