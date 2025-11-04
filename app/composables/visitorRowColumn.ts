import type { TableColumn } from "@nuxt/ui";
import type { Column, Row } from "@tanstack/table-core";
import type { Visitor } from "~~/server/db/queries/visitor";

export function useVisitorRowColumn(
  UAvatar: Component,
  UButton: Component,
  UBadge: Component,
  UDropdownMenu: Component,
  UCheckbox: Component,
  UIcon: Component,
) {
  const getRowItems = (row: Row<Visitor>) => {
    return [
      {
        type: "label",
        label: "Actions",
      },
      {
        label: "View Visitor Details",
        icon: "i-lucide-eye",
        onselect: () => {},
      },
      {
        label: "Check In Visitor",
        icon: "i-lucide-log-in",
        onselect: () => {},
      },
      {
        label: "Check Out Visitor",
        icon: "i-lucide-log-out",
        onselect: () => {},
      },
      {
        label: "Delete Visitor",
        icon: "i-lucide-trash-2",
        variant: "error",
        onselect: () => {},
      },
    ];
  };

  const statusColorMap: Record<Visitor["status"], string> = {
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
        if (!studentUser) {
          return h("span", "N/A"); 
        }

        return h("div", { class: "flex items-center gap-3" }, [
          h("p", {class: "font-medium text-highlighted"}, studentUser.name),
        ])
      }
    }
  ]);

  return {
    getRowItems,
    columns,
  };
}
