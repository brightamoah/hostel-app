import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";

import { useDateFormat } from "@vueuse/core";

import type { RowActionItem } from "~/types/rowAction";

const ComplaintDetailModal = defineAsyncComponent(() => import("~/components/complaint/details.vue"));

const ComplaintStatusResponseModal = defineAsyncComponent(() => import("~/components/complaint/statusResponse.vue"));

const EditComplaintModal = defineAsyncComponent(() => import("~/components/complaint/edit.vue"));

export function useComplaintRowColumn(
  UButton: ComponentType,
  UBadge: ComponentType,
  UDropdownMenu: ComponentType,
  UCheckbox: ComponentType,
  UIcon: ComponentType,
) {
  const overlay = useOverlay();
  const { user } = useUserSession();

  const complaintStore = useComplaintStore();

  const {
    complaintStatusResponseState,
    isLoading,
    editComplaintState,
  } = storeToRefs(complaintStore);

  const {
    initEditSession,
    editComplaint,
    handleFormError,
    clearState,
  } = complaintStore;

  const openComplaintDetailModal = (complaint: Complaint) => {
    const modal = overlay.create(ComplaintDetailModal);

    modal.open({
      complaint,
    });
  };

  const openStatusResponseModal = (complaint: Complaint, action: ComplaintAction) => {
    const modal = overlay.create(ComplaintStatusResponseModal);
    const close = modal.close;

    modal.open({
      complaint,
      action,
      isLoading,
      update: async () => {
        await complaintStore.updateStatusAndAddResponse({
          complaintId: complaint.id,
          status: complaintStatusResponseState.value.status,
          responseText: complaintStatusResponseState.value.responseText,
        });
        close();
      },
      addResponse: async () => {
        await complaintStore.addComplaintResponse({
          complaintId: complaint.id,
          responseText: complaintStatusResponseState.value.responseText,
        });
        close();
      },
    });
  };

  const openEditComplaintModal = (complaint: Complaint) => {
    initEditSession(complaint);
    const modal = overlay.create(EditComplaintModal);

    modal.open({
      editComplaintState: editComplaintState.value,
      isLoading,
      editComplaint,
      handleFormError,
      clearState,
    });
  };

  const getRowItems = (row: Row<Complaint>) => {
    const complaint = row.original;

    const actions: RowActionItem[] = [
      {
        type: "label",
        label: "Actions",
      },
      {
        label: "View Details",
        icon: "i-lucide-eye",
        onSelect: () => openComplaintDetailModal(complaint),
      },
    ];

    if (user.value?.role === "admin") {
      actions.push(
        {
          label: "Update Status",
          icon: "i-lucide-notebook-pen",
          onSelect: () => openStatusResponseModal(complaint, "change-status"),
        },
        {
          label: "Add Response",
          icon: "i-lucide-message-circle-plus",
          onSelect: () => openStatusResponseModal(complaint, "add-response"),
        },
      );
    }

    if (user.value?.role === "student") {
      actions.push(

        {
          label: "Follow Up",
          icon: "i-lucide-message-circle-plus",
          onSelect: () => openStatusResponseModal(complaint, "add-response"),
        },
      );
    }

    if (user.value?.role === "student" && complaint.status === "pending") {
      actions.push(
        {
          label: "Edit Complaint",
          icon: "i-lucide-notebook-pen",
          onSelect: () => openEditComplaintModal(complaint),
        },
        {
          label: "Delete Complaint",
          icon: "i-lucide-trash-2",
          color: "error",
          onSelect: () => {},
        },
      );
    }

    return actions;
  };

  const columns = ref<TableColumn<Complaint>[]>([
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
      id: "student",
      accessorFn: (row) => {
        const student = row.student;
        if (!student) return "N/A";
        return `${student.user.name} ${student.user.email}`;
      },
      header: createSortableHeader("Student", UButton),
      cell: ({ row }) => {
        const student = row.original.student;

        if (!student) return h("span", "N/A");

        return h("div", { class: "flex flex-col" }, [
          h("p", { class: "font-medium text-highlighted" }, student.user.name),
          h("p", { class: "text-xs" }, `${student.user.email}`),
        ]);
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: createSortableHeader("Type", UButton),
      cell: ({ row }) => {
        return h("div", { class: "flex items-center gap-3" }, [
          h(UIcon, {
            name: complaintTypeIconMap[row.original.type],
            class: "text-primary size-7",
          }),
          h("span", { class: "capitalize font-medium text-highlighted" }, row.original.type),
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
          color: complaintStatusColorMap[row.original.status],
          variant: "subtle",
          class: "capitalize",
        });
      },
    },
    {
      accessorKey: "createdAt",
      header: createSortableHeader("Date Submitted", UButton),
      cell: ({ row }) => {
        return h("span", { class: "font-medium text-default" }, useDateFormat(row.original.createdAt, "ddd DD-MM-YYYY").value);
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
