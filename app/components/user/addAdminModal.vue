<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";

import { useMediaQuery } from "@vueuse/core";

import type { AdminUser } from "~/types";

const { user } = useUserSession();
const admin = user.value?.adminData;

const isMobile = useMediaQuery("(max-width: 640px)");

const addAdminFormRef = useTemplateRef("addAdminFormRef");

const userStore = useUserStore();
const {
  adminState,
  isLoading,
  isFormValid,
  addModalOpen,
} = storeToRefs(userStore);

const accessLevel = ref<AdminUser["accessLevel"][]>([
  "regular",
  "super",
  "support",
]);

const { hostels, isLoading: isHostelsLoading, handleRefresh } = useFetchRoomData();
const hostelItem = computed<SelectMenuItem[]>(() =>
  hostels.value.map(h => ({ label: h.name, value: h.id })));

watch(
  () => addModalOpen.value,
  async (open) => {
    if (!open) {
      userStore.resetAddAdminState();
    }

    if (open && hostels.value.length === 0) {
      try {
        await handleRefresh();
      }
      catch (error) {
        console.error("Failed to fetch hostels:", error);
      }
    }
  },
  { immediate: true },
);
</script>

<template>
  <UModal
    v-model:open="addModalOpen"
    title="Add New Admin"
    description="Fill in the details below to add a new admin to the system."
    class="w-[70%]"
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[70%] max-w-3xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <UButton
      label="Add New Admin"
      icon="i-lucide-user-plus"
      size="lg"
      class="justify-center items-center w-full sm:w-auto cursor-pointer"
    />

    <template #body>
      <UForm
        ref="addAdminFormRef"
        :state="adminState"
        :schema="addAdminSchema"
        @submit.prevent="userStore.addNewAdmin"
      >
        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Full Name"
            name="name"
            class="w-full"
          >
            <UInput
              v-model="adminState.name"
              placeholder="Enter Full Name"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            required
            label="Email"
            name="email"
            class="w-full"
          >
            <UInput
              v-model="adminState.email"
              placeholder="Enter Email Address"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>

        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Role"
            name="role"
            class="w-full"
          >
            <UInput
              v-model="adminState.role"
              readonly
              placeholder="Enter Access Role"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            required
            label="Access Level"
            name="accessLevel"
            class="w-full"
          >
            <USelectMenu
              v-model="adminState.accessLevel"
              :items="accessLevel"
              placeholder="Select Admin Access Level"
              class="w-[100%] cursor-pointer"
              :size="isMobile ? 'lg' : 'xl'"
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
              v-model="adminState.phoneNumber"
              placeholder="Enter Phone Number"
              class="w-[100%]"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>

          <UFormField
            required
            label="Department"
            name="department"
            class="w-full"
          >
            <UInput
              v-model="adminState.department"
              placeholder="Enter Department"
              class="w-[100%] cursor-pointer"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>

        <UFormField
          v-if="admin && admin.accessLevel === 'super'"
          required
          label="Hostels"
          name="hostelId"
          class="px-4 w-full"
        >
          <USelectMenu
            v-model="adminState.hostelId"
            placeholder="Select Hostel"
            class="w-[100%] cursor-pointer"
            :items="hostelItem"
            :loading="isHostelsLoading"
            :size="isMobile ? 'lg' : 'xl'"
            value-key="value"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <div class="flex gap-2.5">
        <UButton
          label="Cancel"
          color="error"
          variant="outline"
          class="cursor-pointer"
          @click="close"
        />

        <UButton
          color="primary"
          icon="i-lucide-send"
          class="cursor-pointer"
          :label=" isLoading ? 'Submitting...' : 'Add Admin'"
          :loading="isLoading"
          :disabled="!isFormValid"
          @click="addAdminFormRef?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>
