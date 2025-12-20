<script setup lang="ts">
const roommates = inject<Roommate[]>("roommates", []);
</script>

<template>
  <UModal
    title="Roommates"
    description="List of your current roommates"
    :ui="{
      close: 'cursor-pointer',
    }"
  >
    <UButton
      icon="i-lucide-users"
      label="View Roommates"
      class="cursor-pointer"
      :ui="{
        base: 'text-center flex items-center justify-center gap-2',
      }"
    />

    <template #body>
      <UEmpty
        v-if="roommates.length === 0"
        class="flex flex-1 justify-center items-center"
        variant="naked"
        icon="i-lucide-users"
        title="No roommates found"
        description="You currently have no roommates"
        size="xl"
      />

      <UPageList v-else>
        <UUser
          v-for="roommate in roommates"
          :key="roommate.id"
          name="Bright Amoah"
          size="lg"
          class="mb-4 divide-accented"
          :avatar="{
            text: generateInitials(roommate?.user.name),
            src: roommate?.user?.image ?? undefined,
            style: `background-color: ${generateUserColor(roommate.user.id)}`,
            ui: { fallback: 'text-white' },
          }"
        >
          <template #description>
            <div class="flex flex-col gap-0.5 text-muted text-sm italic leading-tight">
              <span class="font-medium">{{ roommate.user.email }}</span>

              <span>{{ roommate.phoneNumber }}</span>
            </div>
          </template>
        </UUser>
      </UPageList>
    </template>
  </UModal>
</template>

<style scoped>

</style>
