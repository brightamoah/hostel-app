import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";

export const useAnnouncementStore = defineStore("announcementStore", () => {
  const open = ref(false);
  const isLoading = ref(false);
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const isMobile = breakpoints.smaller("lg");

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

  const announcementState = ref<CreateAnnouncementSchema>({
    title: "",
    content: "",
    priority: "",
    targetAudience: "",
  });

  const isFormValid = computed(() => {
    return (
      announcementState.value.title.trim() !== ""
      && announcementState.value.content.trim() !== ""
      && announcementState.value.priority.trim() !== ""
      && announcementState.value.targetAudience.trim() !== ""

    );
  });

  function resetAnnouncementState() {
    return announcementState.value = {
      title: "",
      content: "",
      priority: "",
      targetAudience: "",
    };
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
