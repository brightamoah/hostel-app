<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

import * as z from "zod";

const { profile } = useAppConfig();
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
    await $fetch("/api/emails/send", {
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

const title = "Bright Kweku Amoah | Contact";
const description = "Contact me for any inquiries or collaborations.";
const image = "/images/hostel.jpg";
const url = "https://bkamoah.vercel.app/contact";

useHead({
  titleTemplate: title,
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { name: "charset", content: "utf-8" },
    { name: "color-scheme", content: "light dark" },
  ],
  link: [
    { rel: "icon", type: "image/x-icon", href: "/fav.svg" },
    { rel: "canonical", href: url },
  ],
});

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
});
</script>

<template>
  <section class="flex flex-col mx-auto p-7 max-w-4xl">
    <h1 class="text-white-shadow font-newsreader text-4xl text-center italic">
      Get In Touch With Us
    </h1>

    <h2 class="font-extralight text-muted text-lg text-center italic">
      Have questions about accommodation, payments, or maintenance? We're
      here to help.
    </h2>

    <div class="mt-2 mb-8 linebreak" />

    <div class="flex flex-col sm:justify-between sm:items-center">
      <UForm
        :state
        :schema
        class="flex flex-col gap-3 w-full max-w-[40rem]"
        @submit="onSubmit"
      >
        <UFormField
          label="Fullname"
          name="fullname"
          required
        >
          <UInput
            v-model="state.fullname"
            type="text"
            autocomplete="name"
            class="w-full"
            placeholder="John Doe"
          />
        </UFormField>

        <UFormField
          label="Email"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            autocomplete="email"
            class="w-full"
            placeholder="john.doe@gmail.com"
          />
        </UFormField>

        <UFormField
          label="Phone"
          name="phone"
        >
          <UInput
            v-model="state.phone"
            autocomplete="tel"
            class="w-full"
            placeholder="123-456-7890"
          />
        </UFormField>

        <UFormField
          label="Subject"
          name="subject"
          required
        >
          <USelectMenu
            v-model="state.subject"
            placeholder="Select a subject"
            :items="subjectItems"
            class="w-full"
          />
          <!-- <UInput
                  v-model="state.subject"
                  class="w-full"
                  placeholder="Subject of your message"
               /> -->
        </UFormField>

        <UFormField
          label="Message"
          name="message"
          required
        >
          <UTextarea
            v-model="state.message"
            autoresize
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
              class="rounded-full"
            >
              Send Message
            </UButton>
          </UTooltip>
        </div>
      </UForm>

      <div class="my-10 linebreak" />

      <div class="flex sm:flex-row flex-col justify-between items-center gap-4 w-full">
        <div class="flex flex-col gap-3">
          <dd class="flex items-center gap-3 text-neutral-400">
            <UIcon
              name="i-lucide-phone"
              class="size-6"
              aria-hidden="true"
            />

            <span>
              {{ profile.phone }}
            </span>
          </dd>

          <dd class="flex items-center gap-3 text-neutral-400">
            <UIcon
              name="i-lucide-mail"
              class="size-6"
              aria-hidden="true"
            />

            <UTooltip
              text="Send an email"
              :shortcuts="['⌘', 'O']"
            >
              <NuxtLink
                :to="`mailto:${profile.email}`"
                target="_blank"
                rel="noopener"
                external
                class="transition-colors duration-300 cursor-pointer"
              >
                {{ profile.email }}
              </NuxtLink>
            </UTooltip>
          </dd>
        </div>

        <div>
          <!-- <HomeMeeting /> -->
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
