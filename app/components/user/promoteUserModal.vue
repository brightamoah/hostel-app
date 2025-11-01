<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

import { useMediaQuery } from "@vueuse/core";

import type { UserType } from "~/types";

const { user, isLoading } = defineProps<{
  user: UserType;
  isLoading: boolean | Ref<boolean>;
}>();

const emit = defineEmits<{
  (e: "confirm", payload: PromoteDemoteSchema): void;
}>();

const { user: currentUser } = useUserSession();
const open = defineModel<boolean>("open");
const isMobile = useMediaQuery("(max-width: 640px)");
const promoteFormRef = useTemplateRef("promoteFormRef");

const accessLevels = computed(() => {
  const levels: Exclude<PromoteDemoteSchema["accessLevel"], undefined>[] = ["regular", "support"];
  if (currentUser.value?.adminData?.accessLevel === "super") {
    levels.push("super");
  }
  return levels;
});

const isLoadingValue = computed(() => unref(isLoading));

const promoteUserState = ref<Omit<PromoteDemoteSchema, "userId" | "action">>(
  {
    phoneNumber: "",
    accessLevel: "regular",
    department: "",
    hostelId: currentUser.value?.adminData?.accessLevel === "super"
      ? null
      : currentUser.value?.adminData?.hostelId ?? null,
  },
);

const isFormValid = computed(() => {
  return (
    (promoteUserState.value.phoneNumber?.trim().length ?? 0) > 0
    && (promoteUserState.value.department?.trim().length ?? 0) > 0
    && (promoteUserState.value.accessLevel?.trim().length ?? 0) > 0
  );
});

function onPromoteSubmit(event: FormSubmitEvent<Omit<PromoteDemoteSchema, "userId" | "action">>) {
  emit("confirm", {
    ...event.data,
    userId: user.id,
    action: "promote",
  });

  if (!isLoading) {
    open.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :dismissible="!isLoading"
    :title="`Promote ${user.name} to Admin`"
    :description="`This action will promote user with name ${user.name} and ID ${user.id} to admin.`"
    :ui="{
      footer: 'justify-end',
      content: 'w-[70%] max-w-3xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <template #body>
      <UForm
        ref="promoteFormRef"
        :state="promoteUserState"
        :schema="promoteDemoteSchema.pick({ accessLevel: true, phoneNumber: true, department: true })"
        @submit="onPromoteSubmit"
      >
        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Phone Number"
            name="phoneNumber"
            class="w-full"
          >
            <UInput
              v-model="promoteUserState.phoneNumber"
              placeholder="Enter Phone Number"
              class="w-full"
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
              v-model="promoteUserState.department"
              placeholder="Enter Department"
              class="w-full"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>

        <div class="flex md:flex-row flex-col justify-between gap-5 mb-4 px-4">
          <UFormField
            required
            label="Access Level"
            name="accessLevel"
            class="w-full"
          >
            <USelectMenu
              v-model="promoteUserState.accessLevel"
              :items="accessLevels"
              placeholder="Select Admin Access Level"
              class="w-full cursor-pointer"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>
      </UForm>
    </template>

    <template #footer="{ close }">
      <div class="flex gap-2.5">
        <UButton
          label="Cancel"
          color="error"
          variant="outline"
          class="cursor-pointer"
          :disabled="isLoadingValue"
          @click="close"
        />

        <UButton
          color="primary"
          icon="i-lucide-send"
          class="cursor-pointer"
          :label=" isLoadingValue ? '' : 'Promote User'"
          :loading="isLoadingValue"
          :disabled="!isFormValid"
          @click="promoteFormRef?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>
