<script setup lang="ts">
import type { CalendarDate } from "@internationalized/date";

import { getLocalTimeZone, today } from "@internationalized/date";

const minDate = today(getLocalTimeZone());

type CreateVisitor = Omit<RegisterVisitorSchema, "status" | "hostelId" | "studentId" | "dateOfVisit"> & {
  dateOfVisit: CalendarDate | undefined;
};

const state = reactive<CreateVisitor>({
  name: "",
  email: "",
  phoneNumber: "",
  relationship: "",
  dateOfVisit: undefined,
  purposeOfVisit: "",
});
</script>

<template>
  <UModal
    title="Register New Visitor"
    description="Fill in the details below to add a new visitor to the system."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-4xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <UButton
      variant="solid"
      color="primary"
      size="lg"
      label="Add New Visitor"
      icon="i-lucide-user-plus"
      class="justify-center items-center w-full sm:w-auto cursor-pointer"
    />

    <template #body>
      <UForm
        :state
        :schema="registerVisitorSchema"
      >
        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Name"
            name="name"
            class="w-full"
          >
            <UInput
              v-model="state.name"
              placeholder="Enter visitor name"
              class="w-full"
              size="xl"
            />
          </UFormField>

          <UFormField
            required
            label="Visit Date"
            name="visitDate"
            class="w-full"
          >
            <AppDatePicker
              v-model:date="state.dateOfVisit as CalendarDate"
              :min="minDate"
            />
          </UFormField>
        </div>

        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Purpose of Visit"
            name="purpose"
            class="w-full"
          >
            <UInput
              v-model="state.purposeOfVisit"
              placeholder="Enter purpose of visit"
              class="w-full"
              size="xl"
            />
          </UFormField>

          <UFormField
            required
            label="Contact Number"
            name="contactNumber"
            class="w-full"
          >
            <UInput
              v-model="state.phoneNumber"
              placeholder="Enter contact number"
              class="w-full"
              size="xl"
            />
          </UFormField>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<style scoped>

</style>
