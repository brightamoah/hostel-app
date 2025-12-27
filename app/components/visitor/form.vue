<script lang="ts" setup generic="T extends object">
import type { CalendarDate } from "@internationalized/date";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { z } from "zod";

import { getLocalTimeZone, today } from "@internationalized/date";

defineProps<{
  schema: z.ZodType<T>;
}>();

const emit = defineEmits<{
  submit: [payload: FormSubmitEvent<T>];
}>();

const minDate = today(getLocalTimeZone());

const state = defineModel<CreateVisitor | EditVisitor["data"]>("state", { required: true });

const visitorForm = useTemplateRef("visitorForm");

defineExpose({
  visitorForm,
});
</script>

<template>
  <UForm
    ref="visitorForm"
    :state
    :schema
    @submit.prevent="(e) => emit('submit', e)"
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
        label="Email"
        name="email"
        class="w-full"
      >
        <UInput
          v-model="state.email"
          placeholder="Enter visitor email"
          class="w-full"
          size="xl"
        />
      </UFormField>
    </div>

    <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
      <UFormField
        required
        label="Phone Number"
        name="phoneNumber"
        class="w-full"
      >
        <UInput
          v-model="state.phoneNumber"
          placeholder="Enter Visitor's Phone number"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <UFormField
        required
        label="Date of Visit"
        name="visitDate"
        class="w-full"
      >
        <AppDatePicker
          :date="state.visitDate"
          :min="minDate"
          @update:date="(newVal) => state.visitDate = newVal ? (markRaw(newVal) as CalendarDate) : undefined"
        />
      </UFormField>
    </div>

    <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
      <UFormField
        required
        label="Relationship"
        name="relationship"
        class="w-full"
      >
        <UInput
          v-model="state.relationship"
          placeholder="Enter Relationship to Visitor"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <UFormField
        required
        label="Purpose of Visit"
        name="purpose"
        class="w-full"
      >
        <UInput
          v-model="state.purpose"
          placeholder="Enter Purpose of Visit"
          class="w-full"
          size="xl"
        />
      </UFormField>
    </div>
  </UForm>
</template>

<style scoped>

</style>
