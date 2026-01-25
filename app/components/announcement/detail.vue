<script setup lang="ts">
import { useDateFormat } from "@vueuse/core";

const { announcement } = defineProps<{
  announcement: Announcement;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const { user } = useUserSession();

const isAdmin = computed(() => user.value?.role === "admin");
// const isStudent = computed(() => user.value?.role === "student");

const overlay = useOverlay();
const EditAnnouncementModal = defineAsyncComponent(() => import("./edit.vue"));

const isMobile = inject("isMobile") as ComputedRef<boolean>;

const { updateReadStatus } = useAnnouncementData();

function markAsUnread() {
  updateReadStatus(announcement.id, { action: "unread" });
  emit("close", false);
}

function openEditModal(announcementId: number) {
  const modal = overlay.create(EditAnnouncementModal);
  const close = modal.close;

  modal.open({
    announcementId,
    "open": true,
    "onUpdate:open": (val: boolean) => {
      if (!val) close();
    },
  });
}
</script>

<template>
  <UDashboardPanel id="announcement-detail">
    <UDashboardNavbar
      :title="announcement.title"
      :toggle="false"
    >
      <template #leading>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="-ms-1.5 cursor-pointer"
          @click="emit('close', false)"
        />
      </template>

      <template #title>
        <div class="flex gap-2 text-lg truncate">
          {{ announcement.title }}

          <UBadge
            variant="subtle"
            size="md"
            :label="announcement.priority"
            :color="priorityColorMap[announcement.priority]"
          />
        </div>
      </template>

      <template
        v-if="isAdmin"
        #right
      >
        <UTooltip text="Edit Announcement">
          <UButton
            icon="i-lucide-notebook-pen"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
            @click="openEditModal(announcement.id)"
          />
        </UTooltip>

        <UTooltip text="Mark as unread">
          <UButton
            icon="i-lucide-message-square-dot"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
            @click="markAsUnread"
          />
        </UTooltip>
      </template>
    </UDashboardNavbar>

    <div class="flex sm:flex-row flex-col justify-between gap-1 p-4 sm:px-6 border-default border-b">
      <div class="flex items-start gap-4 sm:my-1.5">
        <UAvatar
          :src="announcement.postedByAdmin.user.image!"
          :text="generateInitials(announcement.postedByAdmin.user.name)"
          :alt="announcement.postedByAdmin.user.name"
          :style="`background-color: ${generateUserColor(announcement.postedByAdmin.user.id)}`"
          :ui="{ fallback: 'text-white' }"
          size="xl"
        />

        <div class="min-w-0">
          <p class="font-semibold text-highlighted">
            {{ announcement.postedByAdmin.user.name }}
          </p>

          <p class="text-muted">
            {{ announcement.postedByAdmin.user.email }}
          </p>
        </div>
      </div>

      <p class="sm:mt-2 max-sm:pl-16 text-muted text-sm">
        {{ useDateFormat(announcement.postedAt, isMobile ? 'ddd Do MMM, YY HH:mm' : "dddd Do MMMM, YYYY HH:mm") }}
      </p>
    </div>

    <div class="flex-1 p-4 sm:p-6 overflow-y-auto">
      <p
        class="dark:prose-invert max-w-none whitespace-pre-wrap prose"
        v-html="announcement.content"
      />
    </div>

    <LazyAnnouncementCreateNew v-if="isAdmin" />
  </UDashboardPanel>
</template>

<style scoped>

</style>
