<script lang="ts" setup generic="T extends object">
import type { CalendarDate } from "@internationalized/date";
import type { FormSubmitEvent } from "@nuxt/ui";
import type z from "zod";

import { getLocalTimeZone, today } from "@internationalized/date";
import { capitalize } from "vue";

defineProps<{
  schema: z.ZodType<T>;
}>();

const emit = defineEmits<{
  submit: [payload: FormSubmitEvent<T>];
}>();

const billingState = defineModel<Partial<CreateBillingSchema>>("billingState", { required: true });

const minDate = today(getLocalTimeZone());

const billingTypes = computed(() => {
  const types = createBillingSchema.shape.type.options.map(type => ({
    label: capitalize(type),
    value: type,
  }));

  return types;
});

const academicPeriods = computed(() => {
  const periods = createBillingSchema.shape.academicPeriod.options.map(period => ({
    label: capitalize(period),
    value: period,
  }));

  return periods;
});

const paymentTerms = computed(() => {
  const terms = createBillingSchema.shape.paymentTerms.unwrap().options.map(term => ({
    label: term,
    value: term,
  }));

  return terms;
});

const { studentOptions } = useGetSharedFilterOptions();

const form = useTemplateRef("form");

defineExpose({
  form,
});
</script>

<template>
  <UForm
    ref="form"
    :schema="schema"
    :state="billingState"
    @submit="(event) => emit('submit', event)"
  >
    <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
      <UFormField
        required
        label="Student"
        name="studentId"
        class="w-full"
      >
        <USelectMenu
          v-model="billingState.studentId"
          :items="studentOptions"
          placeholder="Select student"
          value-key="value"
          class="w-full cursor-pointer"
          size="xl"
          clear
        />
      </UFormField>

      <UFormField
        required
        label="Issue Type"
        name="type"
        class="w-full"
      >
        <USelectMenu
          v-model="billingState.type"
          :items="billingTypes"
          placeholder="Select issue type"
          value-key="value"
          class="w-full cursor-pointer"
          size="xl"
          clear
        />
      </UFormField>
    </div>

    <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
      <UFormField
        required
        label="Amount (GH₵)"
        name="amount"
        class="w-full"
      >
        <UInput
          v-model="billingState.amount"
          type="number"
          placeholder="Enter amount"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <UFormField
        label="Payment Terms"
        name="paymentTerms"
        class="w-full"
      >
        <USelectMenu
          v-model="billingState.paymentTerms"
          :items="paymentTerms"
          placeholder="Select payment terms"
          value-key="value"
          class="w-full cursor-pointer"
          size="xl"
          clear
        />
      </UFormField>
    </div>

    <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
      <UFormField
        required
        label="Academic Period"
        name="academicPeriod"
        class="w-full"
      >
        <USelectMenu
          v-model="billingState.academicPeriod"
          :items="academicPeriods"
          placeholder="Select academic period"
          value-key="value"
          class="w-full cursor-pointer"
          size="xl"
          clear
        />
      </UFormField>

      <UFormField
        required
        label="Due Date"
        name="dueDate"
        class="w-full"
      >
        <AppDatePicker
          :date="billingState.dueDate"
          :min="minDate"
          @update:date="(newVal) => billingState.dueDate = newVal ? (markRaw(newVal) as CalendarDate) : undefined"
        />
      </UFormField>
    </div>

    <UFormField
      required
      label="Description"
      name="description"
      class="w-full px-4"
    >
      <UTextarea
        v-model="billingState.description"
        label="Description"
        placeholder="Type your description here..."
        class="w-full"
        autoresize
        :rows="4"
        :maxrows="10"
      />
    </UFormField>

    <UCheckbox
      v-model="billingState.sendNotification"
      label="Send Email Notification to Student"
      class="mt-4 px-4"
    />
  </UForm>
</template>

<style>

</style>
