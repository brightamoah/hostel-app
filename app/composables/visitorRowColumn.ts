import type { TableColumn } from "@nuxt/ui";
import type { Column, Row } from "@tanstack/table-core";
import type { Visitor } from "~~/server/db/queries/visitor";

import type { ColorType, Component } from "~/types";
import type { RowActionItem } from "~/types/rowAction";

export function useVisitorRowColumn(
  UAvatar: Component,
  UButton: Component,
  UBadge: Component,
  UDropdownMenu: Component,
  UCheckbox: Component,
  // UIcon: Component,
) {
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
          onSelect: () => { },
        },
        {
          label: "Deny Visitor",
          icon: "i-lucide-x-circle",
          color: "error",
          onSelect: () => { },
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
        onSelect: () => {
          console.table(visitor);
        },
      },
      {
        label: "Check In Visitor",
        icon: "i-lucide-log-in",
        onSelect: () => { },
      },
      {
        label: "Check Out Visitor",
        icon: "i-lucide-log-out",
        onSelect: () => { },
      },
      {
        label: "Delete Visitor",
        icon: "i-lucide-trash-2",
        color: "error",
        onSelect: () => { },
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
      cell: ({ row }) => {
        return h("span", { class: "font-medium text-default" }, new Date(row.original.visitDate).toLocaleDateString());
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
        return h("span", { class: "font-medium text-default" }, new Date(lastLog.timestamp).toLocaleString());
      },
    },
    {
      id: "checkOut",
      header: createSortableHeader("Last Check-Out"),
      cell: ({ row }) => {
        const lastLog = row.original.visitorLogs.find(log => log.action === "check_out");
        if (!lastLog) {
          return h("span", "N/A");
        }
        return h("span", { class: "font-medium text-default" }, new Date(lastLog.timestamp).toLocaleString());
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
