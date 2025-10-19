<script setup lang="ts">
import type { UserType } from "~/types";

const { user } = defineProps<{
  user: UserType;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const userDetails = ref(flattenUserDetails(user));
</script>

<template>
  <UModal
    :title="user.role === 'admin' ? `Admin Details` : `User Details`"
    description="Detailed information about the selected user."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-4xl h-auto rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      description: 'text-base text-muted',
      close: 'cursor-pointer',
    }"
  >
    <template #body>
      <div class="gap-y-4 grid w-full">
        <div
          v-for="item in userDetails"
          :key="item.key"
          class="flex items-center pb-2 border-muted border-b last:border-b-0"
        >
          <div class="w-1/3 font-medium text-white text-base">
            {{ item.key }}
          </div>

          <div class="w-2/5 text-white text-base">
            {{ item.value }}
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        color="primary"
        variant="solid"
        class="cursor-pointer"
        @click="emit('close', false)"
      >
        Close
      </UButton>
    </template>
  </UModal>
</template>

<style scoped>

</style>
