import type { TableColumn } from "@nuxt/ui";
import type { Column, Row } from "@tanstack/table-core";
import type { Visitor } from "~~/server/db/queries/visitor";

import { useDateFormat } from "@vueuse/core";

import type { RowActionItem } from "~/types/rowAction";

const VisitorDetailsModal = defineAsyncComponent(() => import("~/components/visitor/details.vue"));

const ConfirmationModal = defineAsyncComponent(() => import("~/components/dashboard/confirmationModal.vue"));

export function useVisitorRowColumn(
  UAvatar: ComponentType,
  UButton: ComponentType,
  UBadge: ComponentType,
  UDropdownMenu: ComponentType,
  UCheckbox: ComponentType,
  // UIcon: Component,
) {
  const overlay = useOverlay();
  const visitorStore = useVisitorStore();
  const { isLoading } = storeToRefs(visitorStore);

  const openApproveDemoteModal = (visitor: Visitor, status: "approved" | "denied") => {
    const modal = overlay.create(ConfirmationModal);
    const close = modal.close;

    modal.open({
      title: status === "approved" ? "Approve Visitor" : "Deny Visitor",
      description: `This action will change the status of the visitor to "${status}"`,
      confirmLabel: status === "approved" ? "Approve Visitor" : "Deny Visitor",
      renderTrigger: false,
      confirmColor: status === "approved" ? "success" : "error",
      isLoading,
      body: `Are you sure you want to ${status === "approved" ? "approve" : "deny"} visitor with name ${visitor.name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await visitorStore.approveDenyVisitor({
            visitorId: visitor.id,
            status,
          });
          close();
        }
        catch (error) {
          console.warn(`Failed to change status to ${status}`, error);
        }
      },
    });
  };

  const openVisitorDetailsModal = (visitor: Visitor) => {
    const modal = overlay.create(VisitorDetailsModal);
    const close = modal.close;

    modal.open({
      visitor,
      approve: () => {
        openApproveDemoteModal(visitor, "approved");
        close();
      },
      deny: () => {
        openApproveDemoteModal(visitor, "denied");
        close();
      },

    });
  };

  const openCheckInCheckOutModal = (visitor: Visitor, action: LogActionSchema["action"]) => {
    const modal = overlay.create(ConfirmationModal);
    const close = modal.close;

    modal.open({
      title: action === "check_in" ? "Check In Visitor" : "Check Out Visitor",
      description: `This action will ${action === "check_in" ? "check in" : "check out"} the visitor.`,
      confirmLabel: action === "check_in" ? "Check In Visitor" : "Check Out Visitor",
      renderTrigger: false,
      confirmColor: "primary",
      isLoading,
      body: `Are you sure you want to ${action === "check_in" ? "check in" : "check out"} visitor with name ${visitor.name}?`,
      onConfirm: async () => {
        try {
          await visitorStore.checkInCheckOutVisitor({
            visitorId: visitor.id,
            action,
          });
          close();
        }
        catch (error) {
          console.warn(`Failed to ${action === "check_in" ? "check in" : "check out"} visitor`, error);
        }
      },
    });
  };

  const getRowItems = (row: Row<Visitor>) => {
    const visitor = row.original;

    const actions: RowActionItem[] = [
      {
        type: "label",
        label: "Actions",
      },
    ];

    if (visitor.status === "pending") {
      actions.push(
        {
          label: "Approve Visitor",
          icon: "i-lucide-check-circle",
          color: "success",
          disabled: isLoading.value,
          onSelect: () => openApproveDemoteModal(visitor, "approved"),
        },
        {
          label: "Deny Visitor",
          icon: "i-lucide-x-circle",
          color: "error",
          disabled: isLoading.value,
          onSelect: () => openApproveDemoteModal(visitor, "denied"),
        },
        {
          type: "separator",
        },
      );
    }

    actions.push(
      {
        label: "View Visitor Details",
        icon: "i-lucide-eye",
        onSelect: () => openVisitorDetailsModal(visitor),
      },
      {
        label: "Check In Visitor",
        icon: "i-lucide-log-in",
        disabled: isLoading.value || (visitor.status !== "approved" && visitor.status !== "checked-out"),
        onSelect: () => openCheckInCheckOutModal(visitor, "check_in"),
      },
      {
        label: "Check Out Visitor",
        icon: "i-lucide-log-out",
        disabled: isLoading.value || visitor.status !== "checked-in",
        onSelect: () => openCheckInCheckOutModal(visitor, "check_out"),
      },
      {
        type: "separator",
      },
      {
        label: "Delete Visitor",
        icon: "i-lucide-trash-2",
        color: "error",
        onSelect: () => { /* TODO: Implement delete confirmation */ },
      },
    );

    return actions;
  };

  const statusColorMap: Record<Visitor["status"], ColorType> = {
    "pending": "warning",
    "approved": "info",
    "checked-in": "success",
    "checked-out": "neutral",
    "cancelled": "error",
    "denied": "error",
  };

  const createSortableHeader = (label: string) => {
    return ({ column }: { column: Column<Visitor, unknown> }) => {
      const isSorted = column.getIsSorted();
      return h(UButton, {
        color: "neutral",
        variant: "ghost",
        label,
        icon: isSorted
          ? isSorted === "asc"
            ? "i-lucide-arrow-up-narrow-wide"
            : "i-lucide-arrow-down-wide-narrow"
          : "i-lucide-arrow-up-down",
        class: "-mx-2.5 cursor-pointer",
        ui: {
          leadingIcon: "size-4 opacity-25",
        },
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      });
    };
  };

  const columns = ref<TableColumn<Visitor>[]>([
    {
      id: "select",
      header: ({ table }) =>
        h(UCheckbox, {
          "modelValue": table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : table.getIsAllPageRowsSelected(),
          "onUpdate:modelValue": (value: boolean | "indeterminate") =>
            table.toggleAllPageRowsSelected(!!value),
          "ariaLabel": "Select all",
        }),
      cell: ({ row }) =>
        h(UCheckbox, {
          "modelValue": row.getIsSelected(),
          "onUpdate:modelValue": (value: boolean | "indeterminate") => row.toggleSelected(!!value),
          "ariaLabel": "Select row",
        }),
    },
    {
      accessorKey: "name",
      header: createSortableHeader("Visitor"),
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
      id: "student",
      header: createSortableHeader("Student"),
      cell: ({ row }) => {
        const studentUser = row.original.student?.user;
        const studentAllocation = row.original.student?.allocations[0];

        if (!studentUser) {
          return h("span", "N/A");
        }

        return h("div", { class: "flex flex-col" }, [
          h("p", { class: "font-medium text-highlighted" }, studentUser.name),
          h("p", { class: "text-sm" }, `${studentUser.email}`),
          studentAllocation && h("p", { class: "text-sm text-muted" }, `Room: ${studentAllocation.room.roomNumber} (${studentAllocation.room?.hostel?.name})`,
          ),
        ]);
      },
    },
    {
      accessorKey: "relationship",
      header: createSortableHeader("Relationship"),
      cell: ({ row }) => {
        return h("span", { class: "capitalize font-medium text-default" }, row.original.relationship);
      },
    },
    {
      accessorKey: "visitDate",
      header: createSortableHeader("Visit Date"),
      filterFn: (row, columnId: string, filterValue: string) => {
        return dateFilter<Visitor>(row, columnId, filterValue);
      },
      cell: ({ row }) => {
        return h("span", { class: "font-medium text-default" }, useDateFormat(row.original.visitDate, "ddd DD-MM-YYYY").value);
      },
    },
    {
      id: "checkIn",
      header: createSortableHeader("Last Check-In"),
      cell: ({ row }) => {
        const lastLog = row.original.visitorLogs.find(log => log.action === "check_in");
        if (!lastLog) {
          return h("span", "N/A");
        }
        return h("span", { class: "font-medium text-default" }, useDateFormat(lastLog.timestamp, "HH:mm:ss").value);
      },
    },
    {
      id: "checkOut",
      header: createSortableHeader("Last Check-Out"),
      cell: ({ row }) => {
        const lastLog = row.original.visitorLogs[0];

        if (lastLog && lastLog.action === "check_out") {
          return h("span", { class: "font-medium text-default" }, useDateFormat(lastLog.timestamp, "HH:mm:ss").value);
        }

        return h("span", "N/A");
      },
    },
    {
      accessorKey: "status",
      header: createSortableHeader("Status"),
      cell: ({ row }) => {
        return h(UBadge, {
          label: row.original.status.replace("-", " "),
          color: statusColorMap[row.original.status],
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

  return {
    getRowItems,
    columns,
  };
}
