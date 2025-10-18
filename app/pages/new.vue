<script setup lang="ts">
import type { CalendarDate } from "@internationalized/date";
import type { FormSubmitEvent } from "@nuxt/ui";

import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { useMediaQuery } from "@vueuse/core";

definePageMeta({
  layout: "onboard",
});

const isMobile = useMediaQuery("(max-width: 640px)");

const desktopDateFormat = new DateFormatter("en-GH", {
  dateStyle: "full",
});

const mobileDateFormat = new DateFormatter("en-GH", {
  dateStyle: "long",
});

const dateVal = shallowRef<CalendarDate | null>(null);

const formattedDate = computed(() => {
  return isMobile.value
    ? mobileDateFormat.format(dateVal.value!.toDate(getLocalTimeZone()))
    : desktopDateFormat.format(dateVal.value!.toDate(getLocalTimeZone()));
});

const user = ref({
  name: "John Doe",
  email: "HbOgM@example.com",
  avatar: "https://github.com/benjamincanac.png",
  role: "student",
  plan: "pro",
  status: "active",
});

const description = ref(
  `Welcome, ${user.value.name}! Let's set up your student account.`,
);

const genderItems = ref(["male", "female"]);

const state = ref<PersonalDetailsSchema>({
  gender: "",
  dateOfBirth: null,
  phoneNumber: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhoneNumber: "",
  emergencyContactEmail: "",
  healthConditions: "",
});

watch(dateVal, (newVal) => {
  state.value.dateOfBirth = newVal ? newVal.toDate(getLocalTimeZone()) : null;
});

const isFormValid = computed(() => {
  return (
    state.value.gender.trim() !== ""
    && state.value.dateOfBirth !== null
    && state.value.phoneNumber.trim() !== ""
    && state.value.address.trim() !== ""
    && state.value.emergencyContactName.trim() !== ""
    && state.value.emergencyContactPhoneNumber.trim() !== ""
    && state.value.emergencyContactEmail.trim() !== ""
  );
});

function submitForm(payload: FormSubmitEvent<PersonalDetailsSchema>) {
  payload.preventDefault();
}
</script>

<template>
  <UPageSection
    title="Complete Your Profile"
    :description
    class="bg-transparent -mt-5 md:-mt-10 w-full"
    :ui="{
      title:
        'font-newsreader capitalize text-2xl md:text-3xl lg:text-4xl italics',
      description: ' -mt-0.5',
    }"
  >
    <template #headline>
      <div class="text-center">
        <UBadge
          variant="subtle"
          class="justify-center items-center"
        >
          Get Started By Providing Your Details
        </UBadge>
      </div>
    </template>

    <div class="flex flex-col sm:justify-between sm:items-center md:-mt-6">
      <UForm
        :schema="personalDetailsSchema"
        :state
        class="bg-transparent shadow-md backdrop-blur-xl p-2 md:p-4 border border-muted rounded-lg w-full max-w-4xl"
        @submit="submitForm"
      >
        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Gender"
            name="gender"
            class="w-full"
          >
            <USelectMenu
              v-model="state.gender"
              :items="genderItems"
              class="w-[100%] cursor-pointer"
              placeholder="Select your gender"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            required
            label="Date of Birth"
            name="dateOfBirth"
            class="w-full"
          >
            <UPopover>
              <UButton
                color="neutral"
                variant="subtle"
                icon="i-lucide-calendar-days"
                :size="isMobile ? 'lg' : 'xl'"
                class="bg-transparent w-[100%] text-muted cursor-pointer"
              >
                {{ dateVal ? formattedDate : "Select your date of birth" }}
              </UButton>

              <template #content>
                <UCalendar
                  v-model="dateVal"
                  class="p-2"
                />
              </template>
            </UPopover>
          </UFormField>
        </div>

        <div class="flex md:flex-row flex-col justify-between gap-5 mt-5 px-4">
          <UFormField
            required
            label="Phone Number"
            name="phoneNumber"
            class="w-full"
          >
            <UInput
              v-model="state.phoneNumber"
              placeholder="Enter your phone number"
              icon="i-lucide-phone"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
              type="tel"
            />
          </UFormField>

          <UFormField
            required
            label="Emergency Contact Name"
            name="emergencyContactName"
            class="w-full"
          >
            <UInput
              v-model="state.emergencyContactName"
              placeholder="Enter your emergency contact name"
              icon="i-lucide-users"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>

        <div class="flex md:flex-row flex-col justify-between gap-5 mt-5 px-4">
          <UFormField
            required
            label="Emergency Contact Phone Number"
            name="emergencyContactPhoneNumber"
            class="w-full"
          >
            <UInput
              v-model="state.emergencyContactPhoneNumber"
              placeholder="Enter your emergency contact's phone number"
              icon="i-lucide-phone"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
              type="tel"
            />
          </UFormField>

          <UFormField
            required
            label="Emergency Contact Email"
            name="emergencyContactEmail"
            class="w-full"
          >
            <UInput
              v-model="state.emergencyContactEmail"
              placeholder="Enter your emergency contact's email"
              icon="i-lucide-mail"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>

        <div class="flex flex-col justify-between gap-5 mt-5 px-4">
          <UFormField
            required
            label="Address"
            name="address"
            class="w-full"
          >
            <UTextarea
              v-model="state.address"
              placeholder="Enter your house address"
              icon="i-lucide-home"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            label="Health Conditions (if any)"
            name="healthConditions"
            class="w-full"
          >
            <UTextarea
              v-model="state.healthConditions"
              placeholder="Enter any health conditions you have (separated by commas)"
              icon="i-lucide-heart-pulse"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>

        <div class="flex justify-center mt-6 mb-2">
          <UButton
            color="primary"
            size="xl"
            class="justify-center items-center rounded-xl w-[70%] text-center cursor-pointer"
            type="submit"
            :disabled="!isFormValid"
          >
            Complete Profile
          </UButton>
        </div>
      </UForm>
    </div>
  </UPageSection>
</template>

<style scoped></style>
