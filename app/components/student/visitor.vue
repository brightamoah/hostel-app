<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";

import { useDateFormat } from "@vueuse/core";

import type { RowActionItem } from "~/types/rowAction";

const { visitors: AllVisitors } = useFetchStudentVisitorData();

const today = useDateFormat(new Date(), "YYYY-MM-DD").value;
const visitors = computed<VisitorType[]>(() => AllVisitors.value.filter(visitor => visitor.visitDate === today) ?? []);

const UButton = resolveComponent("UButton");
const UAvatar = resolveComponent("UAvatar");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const overlay = useOverlay();

const VisitorDetailsModal = defineAsyncComponent(() => import("~/components/student/visitorDetails.vue"));
const EditVisitorModal = defineAsyncComponent(() => import("~/components/visitor/edit.vue"));

const visitorStore = useVisitorStore();
const {
  isLoading,
  editVisitorState,
  editingId,
} = storeToRefs(visitorStore);

const {
  initEditSession,
  editVisitor,
  handleFormError,
  clearState,
} = visitorStore;

function openDetailsModal(visitor: VisitorType) {
  overlay.create(VisitorDetailsModal).open({
    visitor,
  });
}

function openEditModal(visitor: VisitorType) {
  initEditSession(visitor);

  const modal = overlay.create(EditVisitorModal);
  const close = modal.close;

  modal.open({
    isLoading,
    editVisitorState: editVisitorState.value as EditVisitor["data"],
    handleFormError,
    clearState,
    editVisitor: async () => {
      await editVisitor();

      if (!editingId.value) close();
    },
  });
}

function getRowItems(row: Row<VisitorType>) {
  const visitor = row.original;

  const actions: RowActionItem[] = [
    {
      type: "label",
      label: "Actions",
    },
    {
      label: "View Details",
      icon: "i-lucide-eye",
      onSelect: () => openDetailsModal(visitor),
    },
  ];

  if (visitor.status === "pending") {
    actions.push(
      {
        label: "Edit Visitor",
        icon: "i-lucide-notebook-pen",
        onSelect: () => openEditModal(visitor),
      },
    );
  }

  if (visitor.status === "cancelled") {
    actions.push(
      {
        type: "separator",
      },
      {
        label: "Delete Visitor",
        icon: "i-lucide-trash-2",
        color: "error",
        onSelect: () => {},
      },
    );
  }

  return actions;
}

const columns = ref<TableColumn<VisitorType>[]>([
  {
    id: "name",
    header: createSortableHeader("Name", UButton),
    accessorKey: "name",
    cell: ({ row }) => {
      return h("div", { class: "flex items-center gap-3" }, [
        h(UAvatar, {
          text: generateInitials(row.original.name),
          alt: row.original.name,
          class: "w-8 h-8 rounded-full object-cover",
          size: "lg",
          style: `background-color: ${generateUserColor(row.original.id)}`,
          ui: { fallback: "text-white" },
        }),
        h("div", undefined, [
          h("p", { class: "font-medium text-highlighted" }, row.original.name),
          h("p", { class: "" }, `${row.original.phoneNumber}`),
        ]),
      ]);
    },
  },
  {
    id: "visitDate",
    header: createSortableHeader("Visit Date", UButton),
    accessorKey: "visitDate",
    cell: ({ row }) => {
      return h("span", { class: "font-medium text-default" }, useDateFormat(row.original.visitDate, "ddd DD-MM-YYYY").value);
    },
  },
  {
    id: "relationship",
    header: createSortableHeader("Relationship", UButton),
    accessorKey: "relationship",
    cell: ({ row }) => {
      return h("span", { class: "capitalize font-medium text-default" }, row.original.relationship);
    },
  },
  {
    id: "status",
    header: createSortableHeader("Status", UButton),
    accessorKey: "status",
    cell: ({ row }) => {
      return h(UBadge, {
        label: row.original.status.replace("-", " "),
        color: visitorStatusColorMap[row.original.status],
        variant: "subtle",
        class: "capitalize",
      });
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
    <div v-if="visitors.length">
      <UTable
        :columns
        :data="visitors"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-1 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
        }"
        class="-mt-5 max-w-[95dvw] md:max-w-full shrink-0"
      />
    </div>

    <UEmpty
      v-else
      variant="naked"
      icon="i-lucide-users-round"
      title="No Visitors"
      description="You have no visitors scheduled for today"
      size="xl"
      class="flex flex-1 justify-center items-center"
    />
  </div>
</template>

<style scoped>

</style>
