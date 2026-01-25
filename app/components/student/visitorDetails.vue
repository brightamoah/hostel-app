<script setup lang="ts">
import type { TableColumn, TabsItem } from "@nuxt/ui";

import { useDateFormat } from "@vueuse/core";

const { visitor } = defineProps<{
  visitor: StudentVisitor;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const UButton = resolveComponent("UButton");

const isMobile = inject("isMobile", computed(() => false)) as ComputedRef<boolean>;

const visitorInitials = computed(() => generateInitials(visitor.name));
const avatarBgColor = computed(() => generateUserColor(visitor.id));

const visitorBadgeColor = computed<ColorType>(() => {
  return visitorStatusColorMap[visitor.status];
});

const items = computed<TabsItem[]>(() => [
  {
    label: isMobile.value ? "Visitor" : "Visitor Info",
    icon: "i-lucide-user",
    slot: "visitor" as const,
  },
  {
    label: isMobile.value ? "History" : "Visit History",
    icon: "i-lucide-history",
    slot: "history" as const,
  },
]);

const visitorItems = computed(() => [
  {
    label: "Phone Number",
    value: visitor.phoneNumber,
    icon: "i-lucide-phone-call",
  },
  {
    label: "Email Address",
    value: visitor.email,
    icon: "i-lucide-mail",
  },
  {
    label: "Purpose of Visit",
    value: visitor.purpose,
    icon: "i-lucide-clipboard-list",
  },
  {
    label: "Visit Date",
    value: useDateFormat(visitor.visitDate, "dddd Do MMMM, YYYY").value,
    icon: "i-lucide-calendar-days",
  },
  {
    label: "Date Registered",
    value: useDateFormat(visitor.createdAt, "dddd Do MMMM, YYYY").value,
    icon: "i-lucide-calendar-plus",
  },
]);

type HistoryItem = {
  checkIn: string;
  checkOut: string;
  performedBy: string;
  duration: string;
};

const historyColumns = ref<TableColumn<HistoryItem>[]>([
  {
    id: "checkIn",
    header: createSortableHeader("Check-In Time", UButton),
    accessorKey: "checkIn",
  },
  {
    id: "checkOut",
    header: createSortableHeader("Check-Out Time", UButton),
    accessorKey: "checkOut",
  },
  {
    id: "performedBy",
    header: "Performed By",
    accessorKey: "performedBy",
  },
  {
    id: "duration",
    header: createSortableHeader("Duration", UButton),
    accessorKey: "duration",
  },

]);

const visitHistory = computed(() => {
  const visitLogs = visitor.visitorLogs ?? [];
  if (!visitLogs.length) return [];

  const formatTimestamp = (timestamp: string | Date) => useDateFormat(timestamp, "ddd Do MMM, YYYY HH:mm:ss").value;

  const duration = (checkinTime: string | Date, checkoutTime: string | Date) => {
    const diff = +new Date(checkoutTime) - +new Date(checkinTime);
    if (diff <= 0) return "-";

    const minutes = Math.round(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return minutes < 60
      ? `${minutes}m`
      : remainingMinutes
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
  };

  const rows: { checkIn: string; checkOut: string; performedBy: string; duration: string }[] = [];
  const stack: typeof visitLogs = [];

  for (const log of [...visitLogs].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))) {
    const adminName = log.admin?.user?.name ?? "-";

    if (log.action === "check_in") {
      stack.push(log);
    }

    else if (log.action === "check_out") {
      const checkinLog = stack.pop();
      const performer = adminName !== "-" ? adminName : checkinLog?.admin?.user?.name ?? "-";
      rows.push({
        checkIn: checkinLog ? formatTimestamp(checkinLog.timestamp) : "-",
        checkOut: formatTimestamp(log.timestamp),
        performedBy: performer,
        duration: checkinLog ? duration(checkinLog.timestamp, log.timestamp) : "-",
      });
    }
  }

  for (const checkinLog of stack) {
    rows.push({
      checkIn: formatTimestamp(checkinLog.timestamp),
      checkOut: "-",
      performedBy: checkinLog.admin?.user?.name ?? "-",
      duration: "-",
    });
  }

  return rows.reverse();
});
</script>

<template>
  <UModal
    title="Visitor Details"
    description="Detailed information about the selected visitor."
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
      <div class="flex justify-between mb-8 w-full">
        <UUser
          :name="visitor.name"
          :description="visitor?.email"
          size="2xl"
          :avatar="{
            text: visitorInitials,
            style: `background-color: ${avatarBgColor}`,
            ui: { fallback: 'text-white' },
          }"
        >
          <template #description>
            <div class="flex items-center gap-2">
              <p>{{ visitor.relationship }}</p>

              <USeparator
                orientation="vertical"

                class="h-5"
                size="sm"
                :ui="{
                  border: 'border-accented',
                }"
              />

              <UBadge
                :label="visitor?.status"
                :color="visitorBadgeColor"
                variant="subtle"
                class="justify-center mt-1 text-center"
              />
            </div>

            <p class="flex text-sm item-center">
              <UIcon
                name="i-lucide-id-card"
                class="mr-1 size-5 text-primary"
              />
              ID: {{ visitor.id }}
            </p>
          </template>
        </UUser>

        <div
          v-if="visitor.status === 'denied' || visitor.status === 'cancelled'"
          class="flex items-center text-sm text-end"
        >
          No actions available
        </div>

        <div
          v-else
          class="flex items-center text-sm text-end"
        >
          Check-in available on {{ useDateFormat(visitor.visitDate, "dddd Do MMMM, YYYY").value }}
        </div>
      </div>

      <UTabs
        :items
        color="primary"
        class="w-full"
      >
        <template #visitor>
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2 w-full">
            <DashboardDetailItem
              v-for="item in visitorItems"
              :key="item.label"
              :label="item.label"
            >
              <template #default>
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="item.icon"
                    class="size-5 text-primary"
                  />

                  <p>{{ item.value }}</p>
                </div>
              </template>
            </DashboardDetailItem>
          </div>
        </template>

        <template #history>
          <UTable
            :columns="historyColumns"
            :data="visitHistory"
            class="flex-1"
          />
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

<style scoped></style>
