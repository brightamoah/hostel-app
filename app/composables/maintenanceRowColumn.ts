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
        const studentHostel = { ...row.original.room, ...row.original.hostel };

        if (!student) {
          return h("span", "N/A");
        }

        return h("div", { class: "flex flex-col" }, [
          h("p", { class: "font-medium text-highlighted" }, student.user.name),
          h("p", { class: "text-sm" }, `${student.user.email}`),
          studentHostel && h("p", { class: "text-sm text-muted" }, `Room: ${studentHostel.roomNumber} (${studentHostel.name})`,
          ),
        ]);
      },
    },
    {
      accessorKey: "issueType",
      header: createSortableHeader("Type", UButton),
      cell: ({ row }) => {
        return h("span", { class: "capitalize font-medium text-default" }, row.original.issueType);
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
