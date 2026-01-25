<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

import { useDateFormat } from "@vueuse/core";
import { capitalize } from "vue";

const { complaint } = defineProps<{
  complaint: Complaint;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const { user } = useUserSession();

const isMobile = inject("isMobile") as ComputedRef<boolean>;

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
    value: complaint.student.user.name,
    icon: "i-lucide-user",
  },
  {
    label: "Student Email",
    value: complaint.student.user.email,
    icon: "i-lucide-mail",
  },
  {
    label: "Hostel",
    value: complaint.hostel.name,
    icon: "i-lucide-map-pinned",
  },
  {
    label: "Room Number",
    value: complaint?.room?.roomNumber ?? "N/A",
    icon: "i-lucide-door-open",
  },
  {
    label: "Complaint Type",
    value: complaint.type,
    icon: complaintTypeIconMap[complaint.type],
  },
  {
    label: "Priority",
    value: complaint.priority,
    badge: priorityColorMap[complaint.priority],
  },
  {
    label: "Status",
    value: complaint.status,
    badge: complaintStatusColorMap[complaint.status],
  },
  {
    label: "Date Submitted",
    value: useDateFormat(complaint.createdAt, "dddd Do MMMM, YYYY").value,
    icon: "i-lucide-calendar-days",
  },
]);

const responseItems = computed(() => complaint.responses ?? []);

interface MessageMetadata {
  id: number;
  senderName: string;
  senderRole: string;
  email: string;
  date: string;
  timeAgo: string;
}

const messages = computed(() => {
  const isAdmin = user.value?.role === "admin";

  const allMessages = [
    {
      id: complaint.id.toString(),
      role: "system" as const,
      parts: [
        {
          type: "text" as const,
          text: "Request Submitted",
        },
      ],
      metadata: {
        id: complaint.id,
        senderName: "System",
        senderRole: "System",
        email: "",
        date: complaint.createdAt,
        timeAgo: useFormattedTimeAgo(complaint.createdAt, isMobile).value,
      },
    },
    ...responseItems.value.map((response) => {
      const responderInfo = response.responder;
      const isStudent = responderInfo.role === "student";

      let messageRole: "user" | "assistant";
      if (isAdmin) messageRole = isStudent ? "assistant" : "user";

      else messageRole = isStudent ? "user" : "assistant";

      return {
        id: response.id.toString(),
        role: messageRole,
        parts: [
          {
            type: "text",
            text: response.response,
            id: response.id.toString(),
          },
        ],
        metadata: {
          id: response.responder.id,
          senderName: responderInfo.name,
          senderRole: isStudent ? "Student" : "Admin",
          email: responderInfo.email,
          date: response.responseDate,
          timeAgo: useFormattedTimeAgo(response.responseDate, isMobile).value,
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
    title="Complaint Details"
    description="Detailed information about the selected complaint."
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
      <p>
        Request ID: {{ complaint.id }}
      </p>

      <p class="mb-2">
        Submitted {{ useFormattedTimeAgo(complaint.createdAt, isMobile) }}
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

            <UCard
              variant="subtle"
              class="w-full"
            >
              {{ complaint.description }}
            </UCard>
          </div>
        </template>

        <template #responses>
          <UEmpty
            v-if="!responseItems.length"
            icon="i-lucide-folder-open"
            title="No Responses Yet"
            description="There are currently no responses for this complaint request."
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
                    <p class="font-semibold truncate">
                      {{ (message.metadata as MessageMetadata).senderName }}
                    </p>

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
