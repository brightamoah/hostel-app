<script setup lang="ts">
const announcementFormRef = useTemplateRef("formRef");

const announcementStore = useAnnouncementStore();
const {
  open,
  announcementState,
  isMobile,
  audience,
  priority,
  isLoading,
  isFormValid,
  isFetchingDraft,
} = storeToRefs(announcementStore);

const { createAnnouncement } = announcementStore;

const { users, status } = useFetchUserData();
const { hostels, rooms, status: roomStatus } = useFetchRoomData();

const userOptions = computed(() => {
  return users.value.map(user => ({
    label: `${user.name} (${user.email})`,
    value: user.id,
  }));
});

const hostelOptions = computed(() => {
  return hostels.value.map(hostel => ({
    label: hostel.name,
    value: hostel.id,
  }));
});

const roomOptions = computed(() => {
  return rooms.value.map(room => ({
    label: room.roomNumber,
    value: room.id,
  }));
});

watch(() => announcementState.value.targetAudience, (newVal) => {
  if (newVal !== "hostel") announcementState.value.targetHostelId = undefined;
  if (newVal !== "room") announcementState.value.targetRoomId = undefined;
  if (newVal !== "user") announcementState.value.targetUserId = undefined;
});
</script>

<template>
  <UModal
    v-model:open="open"
    title="Create New Announcement"
    description="Fill in the details below to create a new announcement."
    arrow
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'max-w-5xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <div
      class="right-8 bottom-10 z-10 absolute"
      :class="open ? 'hidden' : 'flex'"
    >
      <UTooltip
        text="Create New Announcement"
        arrow
        :delay-duration="300"
      >
        <AppSpotlightButton
          aria-label="scroll to top button"
          class="flex justify-center items-center p-1 size-13 text-muted hover:scale-110 transition-all hover:animate-pulse duration-200 cursor-pointer"
          rounded
        >
          <UIcon
            :name="open ? 'i-lucide-x' : 'i-lucide-message-circle-plus'"
            class="z-20 size-6"
          />
        </AppSpotlightButton>
      </UTooltip>
    </div>

    <template #body>
      <div
        v-if="isFetchingDraft"
        class="flex flex-col justify-center items-center py-12 text-muted"
      >
        <UIcon
          name="i-lucide-loader"
          class="mb-2 size-8 animate-spin"
        />

        <p>Restoring your draft...</p>
      </div>

      <AnnouncementForm
        v-else
        ref="formRef"
        :announcement-state
        :is-mobile
        :audience
        :priority
        :user-options
        :hostel-options
        :room-options
        :status
        :room-status
        :create-announcement
      />
    </template>

    <template #footer="{ close }">
      <div class="flex gap-2.5">
        <UButton
          label="Cancel"
          color="error"
          variant="outline"
          class="cursor-pointer"
          @click="close"
        />

        <UButton
          color="primary"
          icon="i-lucide-send"
          class="cursor-pointer"
          :label=" isLoading ? 'Submitting...' : 'Create Announcement'"
          :loading="isLoading"
          :disabled="!isFormValid"
          @click="announcementFormRef?.form?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>
