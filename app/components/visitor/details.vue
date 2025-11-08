<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import type { Visitor } from "~~/server/db/queries/visitor";

import { useDateFormat } from "@vueuse/core";

import type { ColorType } from "~/types";

import { sampleVisitor } from "~/lib/dummy";

const visitor = ref(sampleVisitor);

const visitorInitials = generateInitials(visitor.value.name);
const avatarBgColor = generateUserColor(visitor.value.name);

const statusColorMap: Record<Visitor["status"], ColorType> = {
  "pending": "warning",
  "approved": "info",
  "checked-in": "success",
  "checked-out": "neutral",
  "cancelled": "error",
  "denied": "error",
};
const visitorBadgeColor = computed<ColorType>(() => {
  return statusColorMap[visitor.value.status];
});

const items = ref<TabsItem[]>([
  {
    label: "Visitor Info",
    icon: "i-lucide-user",
    slot: "visitor" as const,
  },
  {
    label: "Student Info",
    icon: "i-lucide-graduation-cap",
    slot: "student" as const,
  },
  {
    label: "Visit History",
    icon: "i-lucide-history",
    slot: "history" as const,
  },
]);

const visitorItems = ref([
  {
    label: "Phone Number",
    value: visitor.value.phoneNumber,
    icon: "i-lucide-phone-call",
  },
  {
    label: "Email Address",
    value: visitor.value.email,
    icon: "i-lucide-mail",
  },
  {
    label: "Purpose of Visit",
    value: visitor.value.purpose,
    icon: "i-lucide-clipboard-list",
  },
  {
    label: "Visit Date",
    value: useDateFormat(visitor.value.visitDate, "Do MMMM, YYYY").value,
    icon: "i-lucide-calendar-days",
  },
]);
</script>

<template>
  <UModal
    title="Visitor Details"
    description="Detailed information about the selected visitor."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-3xl h-auto rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      description: 'text-base text-muted',
      close: 'cursor-pointer',
    }"
  >
    <UButton
      label="Open Visitor Modal"
      icon="i-lucide-user-check"
      variant="subtle"
      color="primary"
      size="lg"
      class="justify-center w-full sm:w-auto cursor-pointer"
    />

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
                size="sm"
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

        <div class="flex items-center gap-3">
          <UButton
            label="Approve"
            icon="i-lucide-check-circle"
            variant="subtle"
            color="success"
            size="lg"
            class="justify-center w-full sm:w-auto cursor-pointer"
          />

          <UButton
            label="Deny"
            icon="i-lucide-x-circle"
            variant="subtle"
            color="error"
            size="lg"
            class="justify-center cursor-pointer"
          />
        </div>
      </div>

      <UTabs
        :items
        color="primary"
        class="w-full"
      >
        <template #visitor>
          <div class="flex justify-between">
            <div class="flex flex-col gap-4">
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

            <div class="flex flex-col gap-4">
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
          </div>
        </template>

        <template #student="{ item }">
          <div class="p-4">
            <pre>{{ item }}</pre>
          </div>
        </template>

        <template #history="{ item }">
          <div class="p-4">
            <pre>{{ item }}</pre>
          </div>
        </template>
      </UTabs>
    </template>
  </UModal>
</template>

<style scoped>

</style>
