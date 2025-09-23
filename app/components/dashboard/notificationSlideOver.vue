<script setup lang="ts">
import { formatTimeAgo } from "@vueuse/core";
import { randomUUID } from "uncrypto";

import type { Notification } from "~/types";

const { isNotificationsSlideoverOpen } = useDashboard();
const { userInitials } = useUseUserItems();
const { user } = useUserSession();

// const { data: notifications } = await useFetch<Notification[]>("");
const notifications = ref<Notification[]>([
  {
    id: randomUUID(),
    sender: {
      ...user.value!,
    },
    date: "2022-01-01",
    unread: true,
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: randomUUID(),
    sender: {
      ...user.value!,
    },
    date: "2025-01-01",
    unread: true,
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
]);
</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Notifications"
    description="Recent notifications"
    :ui="{
      close: 'cursor-pointer',
    }"
  >
    <template #body>
      <NuxtLink
        v-for="notification in notifications"
        :key="notification.id"
        :to="{ name: 'admin-announcements', query: { id: notification.id } }"
        class="relative flex items-center gap-3 hover:bg-elevated/50 -mx-3 first:-mt-3 last:-mb-3 px-3 py-2.5 rounded-md"
      >
        <UChip
          color="error"
          :show="!!notification.unread"
          inset
        >
          <UAvatar
            :src="notification.sender.image!"
            :text="userInitials"
            :alt="notification.sender.name"
            size="md"
          />
        </UChip>

        <div class="flex-1 text-sm">
          <p class="flex justify-between items-center">
            <span class="font-medium text-highlighted">{{ notification.sender.name }}</span>

            <time
              :datetime="notification.date"
              class="text-muted text-xs"
              v-text="formatTimeAgo(new Date(notification.date))"
            />
          </p>

          <p class="text-dimmed">
            {{ notification.body }}
          </p>
          <USeparator class="my-2" />
        </div>
      </NuxtLink>
    </template>
  </USlideover>
</template>
