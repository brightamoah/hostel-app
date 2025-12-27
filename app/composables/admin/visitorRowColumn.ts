import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";

import { useDateFormat } from "@vueuse/core";

import type { RowActionItem } from "~/types/rowAction";

const VisitorDetailsModal = defineAsyncComponent(() => import("~/components/visitor/details.vue"));

const ConfirmationModal = defineAsyncComponent(() => import("~/components/dashboard/confirmationModal.vue"));

const EditVisitorModal = defineAsyncComponent(() => import("~/components/visitor/edit.vue"));

export function useVisitorRowColumn(
  UAvatar: ComponentType,
  UButton: ComponentType,
  UBadge: ComponentType,
  UDropdownMenu: ComponentType,
  UCheckbox: ComponentType,
  // UIcon: Component,
) {
  const { user } = useUserSession();
  const isAdmin = computed<boolean>(() => user.value?.role === "admin");
  const toast = useToast();
  const overlay = useOverlay();
  const visitorStore = useVisitorStore();
  const { isLoading } = storeToRefs(visitorStore);
  const { approveDenyVisitor, checkInCheckOutVisitor, deleteVisitors } = visitorStore;

  const openApproveDenyModal = (visitor: VisitorType, status: "approved" | "denied") => {
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
          await approveDenyVisitor({
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

  const openVisitorDetailsModal = (visitor: VisitorType) => {
    const modal = overlay.create(VisitorDetailsModal);
    const close = modal.close;

    modal.open({
      visitor,
      isAdmin,
      approve: () => {
        openApproveDenyModal(visitor, "approved");
        close();
      },
      deny: () => {
        openApproveDenyModal(visitor, "denied");
        close();
      },

    });
  };

  const openCheckInCheckOutModal = (visitor: VisitorType, action: LogActionSchema["action"]) => {
    const checksPassed = checkInCheckOutChecks(visitor, action);
    if (!checksPassed) return;

    const modal = overlay.create(ConfirmationModal);
    const close = modal.close;

    modal.open({
      title: action === "check_in"
        ? "Check In Visitor"
        : "Check Out Visitor",

      description: `This action will ${action === "check_in"
        ? "check in"
        : "check out"} the visitor.`,

      confirmLabel: action === "check_in"
        ? "Check In Visitor"
        : "Check Out Visitor",

      renderTrigger: false,
      confirmColor: "primary",
      isLoading,
      body: `Are you sure you want to ${action === "check_in"
        ? "check in"
        : "check out"} visitor with name ${visitor.name}?`,

      onConfirm: async () => {
        try {
          await checkInCheckOutVisitor({
            visitorId: visitor.id,
            action,
          });
          close();
        }
        catch (error) {
          console.warn(`Failed to ${action === "check_in"
            ? "check in"
            : "check out"} visitor`, error);
        }
      },
    });
  };

  const openDeleteVisitorModal = (visitor: VisitorType) => {
    const modal = overlay.create(ConfirmationModal);
    const close = modal.close;
    modal.open({
      title: `Delete Visitor`,
      confirmLabel: "Delete Visitor",
      isLoading,
      description: `This action will delete visitor with Name ${visitor.name} and ID ${visitor.id}.`,
      renderTrigger: false,
      body: `Are you sure you want to delete visitor with name ${visitor.name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const notDeletable = visitor.status !== "pending" && visitor.status !== "cancelled";
          if (notDeletable) {
            toast.add({
              title: `Failed to Delete Visitor`,
              description: `Action denied: Visitor "${visitor.name}" cannot be deleted due to its status: ${visitor.status}`,
              color: "error",
              icon: "i-lucide-alert-circle",
              duration: 8000,
            });
            close();
            return;
          }
          await deleteVisitors({ ids: [visitor.id] });
          close();
        }
        catch (error) {
          console.warn("Delete failed:", error);
          close();
        }
      },
    });
  };

  const openEditVisitorModal = (visitor: VisitorType) => {
    const modal = overlay.create(EditVisitorModal);
    // const close = modal.close;

    modal.open({
      visitor,
      isLoading,
    });
  };

  const getRowItems = (row: Row<VisitorType>) => {
    const visitor = row.original;
    const today = new Date().toISOString().split("T")[0];

    const actions: RowActionItem[] = [
      {
        type: "label",
        label: "Actions",
      },
      {
        label: "View Visitor Details",
        icon: "i-lucide-eye",
        onSelect: () => openVisitorDetailsModal(visitor),
      },
    ];

    if (isAdmin.value && visitor.status === "pending") {
      actions.push(
        {
          type: "separator",
        },
        {
          label: "Approve Visitor",
          icon: "i-lucide-check-circle",
          color: "success",
          disabled: isLoading.value,
          onSelect: () => openApproveDenyModal(visitor, "approved"),
        },
        {
          label: "Deny Visitor",
          icon: "i-lucide-x-circle",
          color: "error",
          disabled: isLoading.value,
          onSelect: () => openApproveDenyModal(visitor, "denied"),
        },
      );
    }

    if (isAdmin.value && (visitor.status === "approved" || visitor.status === "checked-out") && visitor.visitDate === today) {
      actions.push(
        {
          label: "Check In Visitor",
          icon: "i-lucide-log-in",
          disabled: isLoading.value || (visitor.status !== "approved" && visitor.status !== "checked-out"),
          onSelect: () => openCheckInCheckOutModal(visitor, "check_in"),
        },
      );
    }

    if (isAdmin.value && visitor.status === "checked-in" && visitor.visitDate === today) {
      actions.push(
        {
          label: "Check Out Visitor",
          icon: "i-lucide-log-out",
          disabled: isLoading.value || visitor.status !== "checked-in",
          onSelect: () => openCheckInCheckOutModal(visitor, "check_out"),
        },
      );
    }

    if (!isAdmin.value && visitor.status === "pending") {
      actions.push({
        label: "Edit Visitor",
        icon: "i-lucide-notebook-pen",
        onSelect: () => openEditVisitorModal(visitor),
      });
    }

    actions.push(
      {
        type: "separator",
      },
      {
        label: "Delete Visitor",
        icon: "i-lucide-trash-2",
        color: "error",
        onSelect: () => openDeleteVisitorModal(visitor),
      },
    );

    return actions;
  };

  const statusColorMap: Record<VisitorType["status"], ColorType> = {
    "pending": "warning",
    "approved": "info",
    "checked-in": "success",
    "checked-out": "neutral",
    "cancelled": "error",
    "denied": "error",
  };

  const columns = ref<TableColumn<VisitorType>[]>([
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
      id: "name",
      accessorFn: row => `${row.name} ${row.phoneNumber}`,
      header: createSortableHeader("Visitor", UButton),
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
      accessorFn: (row) => {
        const student = row.student;
        if (!student) return "N/A";
        return `${student.user.name} ${student.user.email} ${student.allocation?.room.roomNumber} (${student.allocation?.room?.hostel?.name})`;
      },
      header: createSortableHeader("Student", UButton),
      cell: ({ row }) => {
        const studentUser = row.original.student?.user;
        const studentAllocation = row.original.student?.allocation;

        if (!studentUser) return h("span", "N/A");

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
      header: createSortableHeader("Relationship", UButton),
      cell: ({ row }) => {
        return h("span", { class: "capitalize font-medium text-default" }, row.original.relationship);
      },
    },
    {
      accessorKey: "visitDate",
      header: createSortableHeader("Visit Date", UButton),
      filterFn: (row, columnId: string, filterValue: string) => {
        return dateFilter<VisitorType>(row, columnId, filterValue);
      },
      cell: ({ row }) => {
        return h("span", { class: "font-medium text-default" }, useDateFormat(row.original.visitDate, "ddd DD-MM-YYYY").value);
      },
    },
    {
      id: "checkIn",
      header: createSortableHeader("Last Check-In", UButton),
      cell: ({ row }) => {
        const lastLog = row.original.visitorLogs.find(log => log.action === "check_in");
        if (!lastLog) return h("span", "N/A");

        return h("span", { class: "font-medium text-default" }, useDateFormat(lastLog.timestamp, "HH:mm:ss").value);
      },
    },
    {
      id: "checkOut",
      header: createSortableHeader("Last Check-Out", UButton),
      cell: ({ row }) => {
        const lastLog = row.original.visitorLogs[0];

        if (lastLog && lastLog.action === "check_out") return h("span", { class: "font-medium text-default" }, useDateFormat(lastLog.timestamp, "HH:mm:ss").value);

        return h("span", "N/A");
      },
    },
    {
      accessorKey: "status",
      header: createSortableHeader("Status", UButton),
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
    isAdmin,
  };
}
