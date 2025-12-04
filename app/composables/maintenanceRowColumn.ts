import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";

import { useDateFormat } from "@vueuse/core";

import type { RowActionItem } from "~/types/rowAction";

const MaintenanceDetailModal = defineAsyncComponent(() => import("~/components/maintenance/details.vue"));

const MaintenanceStatusResponseModal = defineAsyncComponent(() => import("~/components/maintenance/statusChange.vue"));

export function useMaintenanceRowColumn(
  UButton: ComponentType,
  UBadge: ComponentType,
  UDropdownMenu: ComponentType,
  UCheckbox: ComponentType,
  UIcon: ComponentType,
) {
  const overlay = useOverlay();
  const maintenanceStore = useMaintenanceStore();
  const { isLoading, maintenanceStatusResponseState } = storeToRefs(maintenanceStore);
  const { updateStatusAndAddResponse, addMaintenanceResponse } = maintenanceStore;

  const openMaintenanceDetailModal = (maintenance: MaintenanceType) => {
    const modal = overlay.create(MaintenanceDetailModal);

    modal.open({
      maintenance,
    });
  };

  const openStatusResponseModal = (maintenance: MaintenanceType, action: MaintenanceAction) => {
    const modal = overlay.create(MaintenanceStatusResponseModal);
    const close = modal.close;

    modal.open({
      maintenance,
      action,
      isLoading,
      update: async () => {
        await updateStatusAndAddResponse({
          maintenanceId: maintenance.id,
          status: maintenanceStatusResponseState.value.status,
          responseText: maintenanceStatusResponseState.value.responseText,
        });
        close();
      },
      addResponse: async () => {
        await addMaintenanceResponse({
          maintenanceId: maintenance.id,
          responseText: maintenanceStatusResponseState.value.responseText,
        });
        close();
      },
    });
  };

  const getRowItems = (row: Row<MaintenanceType>) => {
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
      {
        label: "Change Status",
        icon: "i-lucide-refresh-cw",
        onSelect: () => openStatusResponseModal(maintenance, "change-status"),
      },
      {
        label: "Add Response",
        icon: "i-lucide-message-circle-plus",
        onSelect: () => openStatusResponseModal(maintenance, "add-response"),
      },
    ];

    return actions;
  };

  const columns = ref<TableColumn<MaintenanceType>[]>([
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
      cell: ({ row },
      ) => {
        const student = row.original.student;

        if (!student) return h("span", "N/A");

        return h("div", { class: "flex flex-col" }, [
          h("p", { class: "font-medium text-highlighted" }, student.user.name),
          h("p", { class: "text-xs" }, `${student.user.email}`),
        ]);
      },
    },
    {
      id: "room",
      accessorFn: row => row.room ? `${row.room.roomNumber} ${row.hostel.name}` : "N/A",
      header: createSortableHeader("Room", UButton),
      filterFn: (row, columnId, filterValue) => {
        const room = row.original.room;
        const hostel = row.original.hostel;
        const searchText = `${room.roomNumber} ${hostel.name}`.toLowerCase();
        return searchText.includes(filterValue.toLowerCase());
      },
      cell: ({ row }) => {
        const room = row.original.room;
        const hostel = row.original.hostel;

        return h("div", { class: "flex flex-col" }, [
          h("p", { class: "font-medium text-highlighted" }, room.roomNumber),
          h("p", { class: "text-sm" }, `${hostel.name}`),
        ]);
      },
    },
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

  return {
    getRowItems,
    columns,
  };
}
