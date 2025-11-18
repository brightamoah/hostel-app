import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";

import { useDateFormat } from "@vueuse/core";

import type { RowActionItem } from "~/types/rowAction";

export function useMaintenanceRowColumn(
  UAvatar: ComponentType,
  UButton: ComponentType,
  UBadge: ComponentType,
  UDropdownMenu: ComponentType,
  UCheckbox: ComponentType,
  UIcon: ComponentType,
) {
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
        onSelect: () => console.log(maintenance),
      },
      {
        label: "Change Status",
        icon: "i-lucide-refresh-cw",
        onSelect: () => {},
      },
      {
        label: "Add Response",
        icon: "i-lucide-message-circle-plus",
        onSelect: () => {},
      },
    ];

    return actions;
  };

  const priorityColorMap: Record<MaintenanceType["priority"], ColorType> = {
    low: "success",
    medium: "info",
    high: "warning",
    emergency: "error",
  };

  const statusColorMap: Record<MaintenanceType["status"], ColorType> = {
    "in-progress": "secondary",
    "assigned": "info",
    "completed": "success",
    "pending": "warning",
    "rejected": "error",
  };

  const typeIconMap: Record<MaintenanceType["issueType"], string> = {
    "plumbing": "i-lucide-shower-head",
    "electrical": "i-lucide-plug-zap",
    "furniture": "i-lucide-sofa",
    "cleaning": "i-lucide-brush-cleaning",
    "appliance": "i-lucide-air-vent",
    "structural": "i-lucide-house",
    "pest control": "i-lucide-bug",
    "internet/Wi-Fi": "i-lucide-wifi",
    "other": "i-lucide-wrench",
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
      accessorKey: "student",
      header: createSortableHeader("Student", UButton),
      cell: ({ row },
      ) => {
        const student = row.original.student;

        if (!student) {
          return h("span", "N/A");
        }

        return h("div", { class: "flex flex-col" }, [
          h("p", { class: "font-medium text-highlighted" }, student.user.name),
          h("p", { class: "text-xs" }, `${student.user.email}`),
        ]);
      },
    },
    {
      accessorKey: "room",
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
            name: typeIconMap[row.original.issueType],
            class: "text-primary size-6",
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
          color: statusColorMap[row.original.status],
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
