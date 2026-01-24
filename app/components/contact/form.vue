<script lang="ts" setup>
import type { FormSubmitEvent } from "#ui/types";

import * as z from "zod";

const { $apiFetch } = useNuxtApp();
const toast = useToast();

// const isResendEnabled = useRuntimeConfig().public.resend;
const isResendEnabled = ref<boolean>(false);

const subjectItems = ref([
  "General Inquiry",
  "Booking Information",
  "Payment Issues",
  "Maintenance Request",
  "Feedback/Suggestions",
  "Other",
]);

const state = ref({
  email: "",
  message: "",
  phone: "",
  fullname: "",
  subject: "",
});

const loading = ref<boolean>(false);

const schema = z.object({
  email: z.email("Invalid email"),
  message: z.string().min(10, "Message is too short"),
  subject: z.string().min(5, "Subject is too short"),
  fullname: z.string().min(3, "Name is too short"),
});
type Schema = z.output<typeof schema>;

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    await $apiFetch("/api/emails/send", {
      method: "POST",
      body: event.data,
    });
    state.value = {
      email: "",
      message: "",
      phone: "",
      fullname: "",
      subject: "",
    };
    toast.add({
      title: "Message Sent",
      description: "Your message has been sent successfully!",
      color: "success",
    });
  }
  catch {
    toast.add({
      title: "Error",
      description:
            "There was an error sending your message. Please try again.",
      color: "error",
    });
  }
  loading.value = false;
}
</script>

<template>
  <UForm
    :state
    :schema
    class="flex flex-col gap-3 mx-auto"
    @submit="onSubmit"
  >
    <UFormField
      label="Fullname"
      name="fullname"
      class="w-full"
      required
    >
      <UInput
        v-model="state.fullname"
        type="text"
        autocomplete="name"
        size="xl"
        class="w-full"
        placeholder="John Doe"
      />
    </UFormField>

    <UFormField
      label="Email"
      name="email"
      class="w-full"
      required
    >
      <UInput
        v-model="state.email"
        autocomplete="email"
        size="xl"
        class="w-full"
        placeholder="john.doe@gmail.com"
      />
    </UFormField>

    <UFormField
      label="Phone"
      name="phone"
      class="w-full"
    >
      <UInput
        v-model="state.phone"
        autocomplete="tel"
        size="xl"
        class="w-full"
        placeholder="123-456-7890"
      />
    </UFormField>

    <UFormField
      label="Subject"
      name="subject"
      class="w-full"
      required
    >
      <USelectMenu
        v-model="state.subject"
        placeholder="Select a subject"
        size="xl"
        :items="subjectItems"
        class="w-full cursor-pointer"
        clear
      />
    </UFormField>

    <UFormField
      label="Message"
      name="message"
      class="w-full"
      required
    >
      <UTextarea
        v-model="state.message"
        autoresize
        size="xl"
        class="w-full"
        :rows="4"
        placeholder="Lets work together!"
      />
    </UFormField>

    <div class="flex justify-center mt-2">
      <UTooltip
        :disabled="isResendEnabled"
        text="Send message"
      >
        <UButton
          :loading
          :disabled="!isResendEnabled"
          type="submit"
          block
          size="xl"
        >
          Send Message
        </UButton>
      </UTooltip>
    </div>
  </UForm>
</template>

<style scoped>

</style>
