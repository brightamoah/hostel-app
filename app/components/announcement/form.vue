<script setup lang="ts" generic="T extends object">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { z } from "zod";

interface Props {
  isMobile: boolean;
  status: Status;
  roomStatus: Status;
  audience: string[];
  priority: string[];
  userOptions: FilterOption[];
  hostelOptions: FilterOption[];
  roomOptions: FilterOption[];
  schema: z.ZodType<T>;
}

const {
  isMobile,
  status,
  roomStatus,
  audience,
  priority,
  userOptions,
  hostelOptions,
  roomOptions,
  schema,
} = defineProps<Props>();

const emit = defineEmits<{
  submit: [payload: FormSubmitEvent<T>];
}>();

const announcementState = defineModel<CreateAnnouncementSchema | EditAnnouncementSchema["data"]>("announcement", { required: true });

const form = useTemplateRef("announcementForm");

const isPending = (s: Status) => unref(s) === "pending";

watch(() => announcementState.value.targetAudience, (newVal) => {
  if (newVal !== "hostel") announcementState.value.targetHostelId = undefined;
  if (newVal !== "room") announcementState.value.targetRoomId = undefined;
  if (newVal !== "user") announcementState.value.targetUserId = undefined;
});

defineExpose({
  form,
});
</script>

<template>
  <UForm
    ref="announcementForm"
    :schema
    :state="announcementState"
    @submit.prevent="(e) => emit('submit', e)"
  >
    <UFormField
      required
      label="Announcement Title"
      name="title"
      class="mb-4 px-4 w-full"
    >
      <UInput
        v-model="announcementState.title"
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
          v-model="announcementState.targetAudience"
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
          v-model="announcementState.priority"
          :items="priority"
          :size="isMobile ? 'lg' : 'xl'"
          value-key="value"
          placeholder="Select Priority Level"
          class="w-full cursor-pointer"
        />
      </UFormField>
    </div>

    <UFormField
      v-if="announcementState.targetAudience === 'user'"
      required
      label="Select User"
      name="targetUserId"
      class="mb-4 px-4 w-full"
    >
      <USelectMenu
        v-model="announcementState.targetUserId"
        :items="userOptions"
        :loading="isPending(status)"
        :size="isMobile ? 'lg' : 'xl'"
        placeholder="Search for a user..."
        searchable
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      v-if="announcementState.targetAudience === 'hostel'"
      required
      label="Select Hostel"
      name="targetHostelId"
      class="mb-4 px-4 w-full"
    >
      <USelectMenu
        v-model="announcementState.targetHostelId"
        :items="hostelOptions"
        :loading="isPending(roomStatus)"
        :size="isMobile ? 'lg' : 'xl'"
        placeholder="Search for a hostel..."
        searchable
        value-key="value"
        class="w-full"
      />
    </UFormField>

    <UFormField
      v-if="announcementState.targetAudience === 'room'"
      required
      label="Select Room"
      name="targetRoomId"
      class="mb-4 px-4 w-full"
    >
      <USelectMenu
        v-model="announcementState.targetRoomId"
        :items="roomOptions"
        :loading="isPending(roomStatus)"
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
      <ClientOnly>
        <TiptapEditorMain
          v-model:content="announcementState.content"
          class="w-full"
        />
      </ClientOnly>
    </UFormField>
  </UForm>
</template>

<style scoped>

</style>
