import type { FormSubmitEvent } from "@nuxt/ui";

import { breakpointsTailwind, useBreakpoints, useDebounceFn } from "@vueuse/core";
// import { isDeepStrictEqual } from "node:util";
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

  const editingId = ref<number | null>(null);

  const shouldResetReadStatus = ref(false);

  const editAnnouncementState = ref<EditAnnouncementSchema["data"]>({
    title: "",
    content: "",
    priority: "low",
    targetAudience: "all",
    targetHostelId: undefined,
    targetRoomId: undefined,
    targetUserId: undefined,
  });

  const originalEditState = ref<EditAnnouncementSchema["data"] | null>(null);

  const initEditSession = (announcement: Announcement) => {
    editingId.value = announcement.id;

    const mappedState: EditAnnouncementSchema["data"] = {
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      targetHostelId: announcement.targetHostel?.id,
      targetRoomId: announcement.targetRoom?.id,
      targetUserId: announcement.targetUser?.id,
    };

    editAnnouncementState.value = structuredClone(mappedState);
    originalEditState.value = structuredClone(mappedState);
  };

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

  const isEditFormValid = computed(() => {
    const { title, content, priority, targetAudience, targetUserId, targetHostelId, targetRoomId } = editAnnouncementState.value;

    const hasBasicFields = (title?.trim() ?? "") !== "" && (content?.trim() ?? "") !== "" && (priority?.trim() ?? "") !== "" && (targetAudience?.trim() ?? "") !== "";

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

  /**
   * Computed: Check if there are actual changes
   */
  const hasChanges = computed(() => {
    if (!originalEditState.value) return false;

    return JSON.stringify(editAnnouncementState.value) !== JSON.stringify(originalEditState.value);
  });

  // const isSame = isDeepStrictEqual(editAnnouncementState.value, originalEditState.value);

  // console.log("isSame:", isSame);

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

      await refreshNuxtData(announcementDataKey.value);

      toast.add({
        title: "Announcement Published Successfully",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

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

  const editAnnouncement = async () => {
    if (!editingId.value) return;
    if (!isEditFormValid.value) return;
    if (!hasChanges.value) {
      toast.add({
        title: "No changes detected",
        description: "There are no changes to update for this announcement.",
        color: "warning",
        icon: "i-lucide-alert-triangle",
      });
      return;
    }

    const changes: Partial<EditAnnouncementSchema["data"]> = {};
    const current = editAnnouncementState.value;
    const original = originalEditState.value!;

    (Object.keys(current) as Array<keyof typeof current>).forEach((key) => {
      if (current[key] !== original?.[key]) {
        // @ts-expect-error - Typescript gets strict about partial assignments, but this is safe
        changes[key] = current[key];
      }
    });

    const payload = {
      announcementId: editingId.value,
      data: changes,
      resetReadStatus: shouldResetReadStatus.value,
    } satisfies EditAnnouncementSchema;

    isLoading.value = true;

    try {
      const response = await $fetch(`/api/announcement/edit/${payload.announcementId}`, {
        method: "PATCH",
        body: payload,
      });

      await refreshNuxtData(announcementDataKey.value);

      toast.add({
        title: "Update Successful",
        description: response.message,
        color: "success",
        icon: "i-lucide-check-circle",
      });

      originalEditState.value = null;
      editingId.value = null;

      return true;
    }
    catch (error) {
      const message = (error as any)?.data?.message;

      toast.add({
        title: `Failed to update announcement with id: ${payload.announcementId}`,
        description: message,
        color: "error",
        icon: "i-lucide-alert-circle",
        duration: 8000,
      });

      return false;
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
    editAnnouncementState,
    audience,
    priority,
    isFormValid,
    isEditFormValid,
    isFetchingDraft,
    hasChanges,
    shouldResetReadStatus,
    loadDraft,
    saveDraft,
    createAnnouncement,
    editAnnouncement,
    initEditSession,
    resetAnnouncementState,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAnnouncementStore, import.meta.hot));
}
