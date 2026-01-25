<script setup lang="ts">
const { user } = defineProps<{
  user: UserWithRelations;
}>();

const emit = defineEmits<{
  close: [boolean];
}>();

const userDetails = ref(flattenUserDetails(user));

const { hostelItem } = useFetchRoomData();
const assignedHostel = ref<string | null>(null);
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
      overlay: 'backdrop-blur-sm',
    }"
  >
    <template #body>
      <div class="gap-y-4 grid w-full">
        <div
          v-for="item in userDetails"
          :key="item.key"
          class="flex items-center pb-2 border-muted border-b last:border-b-0"
        >
          <div class="w-1/3 font-medium text-base">
            {{ item.key }}
          </div>

          <div class="w-2/5 text-base">
            {{ item.value }}
          </div>
        </div>
      </div>

      <div
        v-if="user.role === 'admin' && user.admin && !user.admin.hostel?.name"
        class="flex items-center gap-4 mt-5 w-full"
      >
        <USelectMenu
          v-model="assignedHostel"
          :items="hostelItem"
          class="w-2/3 cursor-pointer"
          size="lg"
          placeholder="Select Hostel To Assign"
          clear
        />

        <UButton
          color="primary"
          variant="solid"
          class="cursor-pointer"
          label="Assign Hostel"
          @click="console.log(assignedHostel)"
        />
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
