<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";

import type { UserType } from "~/types";

defineProps<{
  user: UserType;
  isLoading: boolean;
}>();

defineEmits<{
  (e: "confirm", payload: Record<string, PromoteDemoteSchema>): void;
}>();

const { user: currentUser } = useUserSession();
const open = defineModel<boolean>("open");
const isMobile = useMediaQuery("(max-width: 640px)");

const accessLevels = computed(() => {
  const levels: PromoteDemoteSchema["accessLevel"][] = ["regular", "support"];
  if (currentUser.value?.adminData?.accessLevel === "super") {
    levels.push("super");
  }
  return levels;
});
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
      <UForm>
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
              class="w-full"
              :size="isMobile ? 'lg' : 'xl'"
            />
          </UFormField>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<style scoped>

</style>
