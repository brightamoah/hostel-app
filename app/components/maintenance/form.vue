<script lang="ts" setup generic="T extends object">
import type { FormSubmitEvent } from "@nuxt/ui";
import type z from "zod";

import { capitalize } from "vue";

const { student } = defineProps<{
  student: DashboardStudent["student"];
  schema: z.ZodType<T>;
}>();

const emit = defineEmits<{
  submit: [payload: FormSubmitEvent<T>];
}>();

const state = defineModel<Partial<CreateMaintenanceSchema>>("state", { required: true });

const issueTypes = ref<{ label: string; value: CreateMaintenanceSchema["issueType"] }[]>([
  { label: "Plumbing", value: "plumbing" },
  { label: "Electrical", value: "electrical" },
  { label: "Furniture", value: "furniture" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Internet/Wi-Fi", value: "internet/Wi-Fi" },
  { label: "Pest Control", value: "pest control" },
  { label: "Structural", value: "structural" },
  { label: "Appliance", value: "appliance" },
  { label: "Other", value: "other" },
]);

const rooms = computed(() => student?.allocation?.room);

const roomOptions = computed(() => {
  const room = [rooms.value];

  return room[0]
    ? room.map(r => ({
        label: `${capitalize(r.hostel.name)} - Room ${r.roomNumber} (${getOrdinalString(r.floor)} Floor)`,
        value: r.id,
      }))
    : [];
});

const hostelOptions = computed(() => {
  const hostel = rooms.value?.hostel ? [rooms.value.hostel] : [];

  return hostel.length > 0
    ? hostel.map(h => ({
        label: capitalize(h.name),
        value: h.id,
      }))
    : [];
});

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Emergency", value: "emergency" },
];

watchEffect(() => {
  if (roomOptions.value.length === 1 && !state.value.roomId) state.value.roomId = roomOptions.value[0]?.value;

  if (hostelOptions.value.length === 1 && !state.value.hostelId) state.value.hostelId = hostelOptions.value[0]?.value;

  if (student?.id && !state.value.studentId) state.value.studentId = student.id;
});

const maintenanceForm = useTemplateRef("maintenanceForm");

defineExpose({
  maintenanceForm,
});
</script>

<template>
  <UForm
    ref="maintenanceForm"
    :state
    :schema
    @submit.prevent="(e) => emit('submit', e)"
  >
    <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
      <UFormField
        required
        label="Issue Type"
        name="issueType"
        class="w-full"
      >
        <USelectMenu
          v-model="state.issueType"
          :items="issueTypes"
          placeholder="Select issue type"
          value-key="value"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <UFormField
        required
        label="Room"
        name="roomId"
        class="w-full"
      >
        <USelectMenu
          v-model="state.roomId"
          :items="roomOptions"
          placeholder="Select room"
          class="w-full cursor-pointer"
          size="xl"
          value-key="value"
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

<style scoped>

</style>
