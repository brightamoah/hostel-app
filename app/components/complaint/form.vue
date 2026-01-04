<script setup lang="ts" generic="T extends object">
import type { FormSubmitEvent } from "@nuxt/ui";
import type z from "zod";

import { capitalize } from "vue";

const { student, roomsInHostel, status } = defineProps<{
  student: DashboardStudent["student"];
  roomsInHostel: RoomInHostel[];
  status: Status;
  schema: z.ZodType<T>;
}>();

const emit = defineEmits<{
  submit: [payload: FormSubmitEvent<T>];
}>();

const state = defineModel<Partial<ComplaintInsert>>("state", { required: true });

const complaintTypes = computed(() => {
  const types = createComplaintSchema.shape.type.options.map(type => ({
    label: capitalize(type),
    value: type,
  }));

  return types;
});

const roomsOptions = computed(() => {
  return roomsInHostel.map(room => ({
    label: `${room.roomNumber} (${getOrdinalString(room.floor)} Floor)`,
    value: room.id,
  }));
});

const priorityOptions = computed(() => createComplaintSchema.shape.priority.def.options[0].options.map(priority => ({
  label: capitalize(priority),
  value: priority,
})));

const rooms = computed(() => student?.allocation?.room);

const hostelOptions = computed(() => {
  const hostel = rooms.value?.hostel ? [rooms.value.hostel] : [];

  return hostel.length > 0
    ? hostel.map(hostel => ({
        label: capitalize(hostel.name),
        value: hostel.id,
      }))
    : [];
});

watchEffect(() => {
  if (roomsOptions.value.length === 1 && !state.value.roomId) state.value.roomId = roomsOptions.value[0]?.value;

  if (hostelOptions.value.length === 1 && !state.value.hostelId) state.value.hostelId = hostelOptions.value[0]?.value;

  if (student?.id && !state.value.studentId) state.value.studentId = student.id;
});

const complaintForm = useTemplateRef("complaintForm");

defineExpose({
  complaintForm,
});
</script>

<template>
  <UForm
    ref="complaintForm"
    :state
    :schema
    @submit="(payload) => emit('submit', payload)"
  >
    <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
      <UFormField
        required
        label="Issue Type"
        name="type"
        class="w-full"
      >
        <USelectMenu
          v-model="state.type"
          :items="complaintTypes"
          placeholder="Select issue type"
          value-key="value"
          class="w-full cursor-pointer"
          size="xl"
          clear
        />
      </UFormField>

      <UFormField
        label="Room (Optional)"
        name="roomId"
        class="w-full"
      >
        <USelectMenu
          v-model="state.roomId"
          :items="roomsOptions"
          :loading="status === 'pending'"
          placeholder="Select room (if applicable)"
          value-key="value"
          class="w-full cursor-pointer"
          size="xl"
        />
      </UFormField>
    </div>

    <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
      <UFormField
        required
        label="Hostel"
        name="hostelId"
        class="w-full"
      >
        <USelectMenu
          v-model="state.hostelId"
          :items="hostelOptions"
          placeholder="Select Hostel"
          class="w-full cursor-pointer"
          size="xl"
          value-key="value"
        />
      </UFormField>

      <UFormField
        required
        label="Priority"
        name="priority"
        class="w-full"
      >
        <USelectMenu
          v-model="state.priority"
          :items="priorityOptions"
          placeholder="Select Priority"
          class="w-full cursor-pointer"
          size="xl"
          value-key="value"
        />
      </UFormField>
    </div>

    <UFormField
      required
      label="Description"
      name="description"
      class="gap-5 mb-2 px-4 w-full"
    >
      <UTextarea
        v-model="state.description"
        placeholder="Describe the issue in detail"
        class="w-full"
        size="xl"
        :rows="4"
      />
    </UFormField>
  </UForm>
</template>

<style scoped></style>
