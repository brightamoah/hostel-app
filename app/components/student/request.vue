<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";

import { useDateFormat } from "@vueuse/core";

import type { RowActionItem } from "~/types/rowAction";

const overlay = useOverlay();
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UIcon = resolveComponent("UIcon");
const tableRef = useTemplateRef("tableRef");

const {
  maintenanceRequests,
} = useFetchMaintenance();

const data = computed(() => maintenanceRequests.value.filter(req => req.status === "pending" || req.status === "in-progress").slice(0, 5));

const MaintenanceDetailModal = defineAsyncComponent(() => import("~/components/maintenance/details.vue"));

function openMaintenanceDetailModal(maintenance: MaintenanceType) {
  const modal = overlay.create(MaintenanceDetailModal);

  modal.open({
    maintenance,
  });
}

function getRowItems(row: Row<MaintenanceType>) {
  const maintenance = row.original;

  const actions: RowActionItem[] = [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "View Details",
      icon: "i-lucide-eye",
      onSelect: () => openMaintenanceDetailModal(maintenance),
    },
  ];

  if (maintenance.status === "pending") {
    actions.push(
      {
        label: "Edit Request",
        icon: "i-lucide-notebook-pen",
        onSelect: () => {},
      },
    );
  }

  return actions;
}

const columns = ref<TableColumn<MaintenanceType>[]>([
  {
    accessorKey: "issueType",
    header: createSortableHeader("Type", UButton),
    cell: ({ row }) => {
      return h("div", { class: "flex items-center gap-3" }, [
        h(UIcon, {
          name: maintenanceTypeIconMap[row.original.issueType],
          class: "text-primary size-7",
        }),
        h("span", { class: "capitalize font-medium text-highlighted" }, row.original.issueType),
      ]);
    },
  },
  {
    accessorKey: "priority",
    header: createSortableHeader("Priority", UButton),
    cell: ({ row }) => {
      return h(UBadge, {
        label: row.original.priority.replace("-", " "),
        color: priorityColorMap[row.original.priority],
        variant: "subtle",
        class: "capitalize",
      });
    },
  },
  {
    accessorKey: "status",
    header: createSortableHeader("Status", UButton),
    cell: ({ row }) => {
      return h(UBadge, {
        label: row.original.status.replace("-", " "),
        color: maintenanceStatusColorMap[row.original.status],
        variant: "subtle",
        class: "capitalize",
      });
    },
  },
  {
    accessorKey: "requestDate",
    header: createSortableHeader("Date Submitted", UButton),
    cell: ({ row }) => {
      return h("span", { class: "font-medium text-default" }, useDateFormat(row.original.requestDate, "ddd DD-MM-YYYY").value);
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-center" },
        [
          h(UDropdownMenu, {
            arrow: true,
            content: {
              align: "center",
            },
            items: getRowItems(row),
            ui: {
              item: "cursor-pointer rounded",
            },
          }, () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              class: "ml-auto cursor-pointer",
            })),
        ],
      ),
  },
]);
</script>

<template>
  <div>
    <UTable
      v-if="data.length"
      ref="tableRef"
      :columns
      :data
      :get-row-items
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-1 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
      }"
      class="-mt-5 max-w-[95dvw] md:max-w-full shrink-0"
    />

    <UEmpty
      v-else
      variant="naked"
      icon="i-lucide-wrench"
      title="No Maintenance Requests"
      description="You have not made any maintenance requests yet."
      size="xl"
      class="flex flex-1 justify-center items-center"
    />
  </div>
</template>

<style scoped>

</style>
