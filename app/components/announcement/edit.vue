<script setup lang="ts">
const { announcementId } = defineProps<{ announcementId: number }>();

const { getAnnouncementFromCache } = useAnnouncementData();
const announcementStore = useAnnouncementStore();
const {
  isLoading,
  isEditFormValid,
  audience,
  priority,
  editAnnouncementState,
  shouldResetReadStatus,
} = storeToRefs(announcementStore);
const { editAnnouncement, initEditSession } = announcementStore;

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

const isMobile = inject("isMobile") as ComputedRef<boolean>;

const isOpen = defineModel<boolean>("open", { required: true });

const announcementFormRef = useTemplateRef("formRef");
const submitLabel = computed(() => isMobile.value ? "Update" : "Update Announcement");
const checkboxLabel = computed(() => isMobile.value ? "Mark as unread" : "Mark as unread (Notify users)");

const data = getAnnouncementFromCache(announcementId);

if (data) initEditSession(data!);

async function handleSubmit() {
  const success = await editAnnouncement();

  if (success) isOpen.value = false;
}

function handleFormError(event: any) {
  console.error("Form validation failed:", event);
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="`Edit Announcement with ID: ${announcementId}`"
    description="Modify the details of the announcement below"
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'max-w-5xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-base md:text-xl font-semibold',
      close: 'cursor-pointer',
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #body>
      <AnnouncementForm
        ref="formRef"
        v-model:announcement="editAnnouncementState"
        :schema="editAnnouncementSchema.shape.data"
        :is-mobile
        :audience
        :priority
        :user-options
        :hostel-options
        :room-options
        :status
        :room-status
        @submit="handleSubmit"
        @error="handleFormError"
      />
    </template>

    <template #footer="{ close }">
      <div class="flex justify-between items-center w-full">
        <UCheckbox
          v-model="shouldResetReadStatus"
          :label="checkboxLabel"
          :ui="{
            root: 'cursor-pointer',
            label: 'cursor-pointer',
            wrapper: 'cursor-pointer',
          }"
        />

        <div class="flex gap-2 5">
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
            :size="isMobile ? 'sm' : 'md'"
            class="cursor-pointer"
            :label="isLoading ? 'Submitting...' : submitLabel"
            :loading="isLoading"
            :disabled="!isEditFormValid"
            @click="announcementFormRef?.form?.submit()"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>
