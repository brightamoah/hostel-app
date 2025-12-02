<script setup lang="ts">
const {
  announcementState,
  isMobile,
  status,
  roomStatus,
  audience,
  priority,
  userOptions,
  hostelOptions,
  roomOptions,
} = defineProps<{
  announcementState: CreateAnnouncementSchema;
  isMobile: boolean;
  status: Status;
  roomStatus: Status;
  audience: string[];
  priority: string[];
  userOptions: FilterOption[];
  hostelOptions: FilterOption[];
  roomOptions: FilterOption[];
}>();

const announcementFormState = computed(() => announcementState);

const form = useTemplateRef("formRef");

const statusValue = computed(() => unref(status));

const roomStatusValue = computed(() => unref(roomStatus));

defineExpose({
  form,
});
</script>

<template>
  <UForm
    ref="formRef"
    :state="announcementFormState"
    :schema="createAnnouncementSchema"
    @submit.prevent="console.log($event.data)"
  >
    <UFormField
      required
      label="Announcement Title"
      name="title"
      class="mb-4 px-4 w-full"
    >
      <UInput
        v-model="announcementFormState.title"
        :size="isMobile ? 'lg' : 'xl'"
        placeholder="Enter Announcement Title"
        class="w-full"
      />
    </UFormField>

    <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
      <UFormField
        required
        label="Target Audience"
        name="targetAudience"
        class="w-full"
      >
        <USelectMenu
          v-model="announcementFormState.targetAudience"
          :items="audience"
          :size="isMobile ? 'lg' : 'xl'"
          value-key="value"
          placeholder="Select Target Audience"
          class="w-full cursor-pointer"
        />
      </UFormField>

      <UFormField
        required
        label="Priority"
        name="priority"
        class="w-full"
      >
        <USelectMenu
          v-model="announcementFormState.priority"
          :items="priority"
          :size="isMobile ? 'lg' : 'xl'"
          value-key="value"
          placeholder="Select Priority Level"
          class="w-full cursor-pointer"
        />
      </UFormField>
    </div>

    <UFormField
      v-if="announcementFormState.targetAudience === 'user'"
      required
      label="Select User"
      name="targetUserId"
      class="mb-4 px-4 w-full"
    >
      <USelectMenu
        v-model="announcementFormState.targetUserId"
        :items="userOptions"
        :loading="statusValue === 'pending'"
        :size="isMobile ? 'lg' : 'xl'"
        placeholder="Search for a user..."
        searchable
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      v-if="announcementFormState.targetAudience === 'hostel'"
      required
      label="Select Hostel"
      name="targetHostelId"
      class="mb-4 px-4 w-full"
    >
      <USelectMenu
        v-model="announcementFormState.targetHostelId"
        :items="hostelOptions"
        :loading="roomStatusValue === 'pending'"
        :size="isMobile ? 'lg' : 'xl'"
        placeholder="Search for a hostel..."
        searchable
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      v-if="announcementFormState.targetAudience === 'room'"
      required
      label="Select Room"
      name="targetRoomId"
      class="mb-4 px-4 w-full"
    >
      <USelectMenu
        v-model="announcementFormState.targetRoomId"
        :items="roomOptions"
        :loading="roomStatusValue === 'pending'"
        :size="isMobile ? 'lg' : 'xl'"
        placeholder="Search for a room..."
        searchable
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      required
      label="Content"
      name="content"
      class="mb-4 px-4 w-full"
    >
      <UTextarea
        v-model="announcementFormState.content"
        required
        autoresize
        placeholder="Compose Announcement Content..."
        :rows="4"
        class="w-full"
      />
    </UFormField>
  </UForm>
</template>

<style scoped>

</style>
