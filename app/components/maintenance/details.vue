<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

import { useDateFormat, useTimeAgo } from "@vueuse/core";
import { capitalize } from "vue";

const { maintenance } = defineProps<{
  maintenance: MaintenanceType;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const timeAgo = useTimeAgo(maintenance.requestDate).value;

const items = computed<TabsItem[]>(() => [
  {
    label: "Details",
    icon: "i-lucide-badge-info",
    slot: "details" as const,
  },
  {
    label: "Responses",
    icon: "i-lucide-message-square-text",
    slot: "responses" as const,
  },
]);

const detailItems = computed(() => [
  {
    label: "Student Name",
    value: maintenance.student.user.name,
    icon: "i-lucide-user",
  },
  {
    label: "Student Email",
    value: maintenance.student.user.email,
    icon: "i-lucide-mail",
  },
  {
    label: "Building/Hostel",
    value: maintenance.room.building,
    icon: "i-lucide-map-pinned",
  },
  {
    label: "Room Number",
    value: maintenance.room.roomNumber,
    icon: "i-lucide-door-open",
  },
  {
    label: "Maintenance Type",
    value: maintenance.issueType,
    icon: maintenanceTypeIconMap[maintenance.issueType],
  },
  {
    label: "Priority",
    value: maintenance.priority,
    badge: maintenancePriorityColorMap[maintenance.priority],
  },
  {
    label: "Status",
    value: maintenance.status,
    badge: maintenanceStatusColorMap[maintenance.status],
  },
  {
    label: "Date Submitted",
    value: useDateFormat(maintenance.requestDate, "dddd Do MMMM, YYYY").value,
    icon: "i-lucide-calendar-days",
  },
]);

const responseItems = computed(() => maintenance.responses ?? []);

interface MessageMetadata {
  id: number;
  senderName: string;
  senderRole: string;
  email: string;
  date: string;
  timeAgo: string;
}

const messages = computed(() => {
  const allMessages = [
    {
      id: maintenance.id.toString(),
      role: "system",
      parts: [
        {
          type: "text",
          text: "Request Submitted",
        },
      ],
      metadata: {
        id: maintenance.id,
        senderName: "System",
        senderRole: "System",
        email: "",
        date: maintenance.requestDate,
        timeAgo: useTimeAgo(new Date(maintenance.requestDate)).value,
      },
    },
    ...responseItems.value.map((response) => {
      const responderInfo = response.responder;
      const isStudent = responderInfo.role === "student";

      return {
        id: response.id.toString(),
        role: isStudent ? "user" : "assistant",
        parts: [
          {
            type: "text",
            text: response.responseText,
            id: response.id.toString(),
          },
        ],
        metadata: {
          id: response.responder.id,
          senderName: responderInfo.name,
          senderRole: isStudent ? "Student" : "Admin",
          email: responderInfo.email,
          date: response.responseDate,
          timeAgo: useTimeAgo(new Date(response.responseDate)).value,
        },

      };
    }),
  ];

  return allMessages.sort((a, b) => {
    const dateA = new Date(a.metadata.date).getTime();
    const dateB = new Date(b.metadata.date).getTime();
    return dateA - dateB;
  });
});
</script>

<template>
  <UModal
    title="Maintenance Request Details"
    description="Detailed information about the selected maintenance request."
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
      <p>
        Request ID: {{ maintenance.id }}
      </p>

      <p class="mb-2">
        Submitted {{ capitalize(timeAgo) }}
      </p>

      <UTabs
        :items
        color="primary"
        class="w-full"
      >
        <template #details>
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2 w-full">
            <DashboardDetailItem
              v-for="item in detailItems"
              :key="item.label"
              :label="item.label"
            >
              <template #default>
                <div class="flex items-center gap-2">
                  <UIcon
                    v-if="item.icon"
                    :name="item.icon"
                    class="size-5 text-primary"
                  />

                  <p v-if="!item.badge">
                    {{ capitalize(item.value) }}
                  </p>

                  <UBadge
                    v-if="item.badge"
                    :label="capitalize(item.value)"
                    :color="item.badge"
                    variant="subtle"
                    class="justify-center mt-1 text-center"
                  />
                </div>
              </template>
            </DashboardDetailItem>
          </div>

          <div class="mt-6">
            <p class="flex items-center pb-2 font-medium text-muted text-base">
              <UIcon
                name="i-lucide-file-text"
                class="mr-1 size-6 text-primary"
              />
              Description
            </p>

            <UCard class="w-full">
              {{ maintenance.description }}
            </UCard>
          </div>
        </template>

        <template #responses>
          <UEmpty
            v-if="!responseItems.length"
            icon="i-lucide-folder-open"
            title="No Responses Yet"
            description="There are currently no responses for this maintenance request."
            class="mt-2"
          />

          <div
            v-else
            class="flex flex-col h-full"
          >
            <UChatMessages
              :messages="messages"
              :user="{
                side: 'right',
                variant: 'subtle',
              }"
              :assistant="{
                side: 'left',
                variant: 'outline',
              }"
            >
              <template #leading="{ message, avatar }">
                <UAvatar
                  v-bind="avatar"
                  :text="generateInitials((message.metadata as MessageMetadata).senderName)"
                  size="sm"
                  :style="{ backgroundColor: generateUserColor((message.metadata as MessageMetadata).id) }"
                  :ui="{ fallback: 'text-white' }"
                />
              </template>

              <template #content="{ message }">
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-xs">
                    <span class="font-semibold">{{ (message.metadata as MessageMetadata).senderName }}</span>

                    <UBadge
                      :label="(message.metadata as MessageMetadata).senderRole"
                      size="xs"
                      :color="message.role === 'user' ? 'primary' : message.role === 'system' ? 'info' : 'neutral'"
                    />

                    <span>•</span>

                    <span>{{ (message.metadata as MessageMetadata).timeAgo }}</span>
                  </div>

                  <!-- Message text -->
                  <div
                    class="text-sm"
                    :class="[
                      message.role === 'system' ? 'text-center italic text-muted' : '',
                    ]"
                  >
                    {{ message.parts[0].text }}
                  </div>
                </div>
              </template>
            </UChatMessages>
          </div>
        </template>
      </UTabs>
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
