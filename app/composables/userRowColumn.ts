import type { TableColumn } from "@nuxt/ui";
import type { Column, Row } from "@tanstack/table-core";

import type { Component, UserType } from "~/types";

export function useUserRowColumn(
  UAvatar: Component,
  UButton: Component,
  UBadge: Component,
  UDropdownMenu: Component,
  UCheckbox: Component,
  UIcon: Component,
  UTooltip: Component,
) {
  const getRowItems = (row: Row<UserType>) => {
    const roleChangeLabels = computed<string>(() => row.original.role === "admin" ? "Demote to Student" : "Promote to Admin");

    return [
      {
        type: "label",
        label: "Actions",
      },
      {
        label: "View user details",
        icon: "i-lucide-eye",
        onSelect: () => {},
      },
      {
        label: roleChangeLabels.value,
        icon: "i-lucide-refresh-cw",
        onSelect: () => {},
      },
      {
        label: "Delete user",
        icon: "i-lucide-trash",
        color: "error",
        onSelect: () => {},
      },
    ];
  };

  type Student = NonNullable<UserType["student"]>;

  const statusColorMap: Record<Student["residencyStatus"], string> = {
    "active": "success",
    "graduated": "info",
    "inactive": "error",
    "suspended": "warning",
    "withdrawn": "neutral",
    "N/A": "neutral",
  };

  const userIcon = (userRole?: UserType["role"]) =>
    userRole === "admin" ? "i-lucide-monitor" : "i-lucide-graduation-cap";

  const createSortableHeader = (label: string) => {
    return ({ column }: { column: Column<UserType, unknown> }) => {
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

  const columns = ref<TableColumn<UserType>[]>([
    {
      accessorKey: "name",
      header: createSortableHeader("User"),
      cell: ({ row }) => {
        return h("div", { class: "flex items-center gap-3" }, [
          h(UAvatar, {
            src: row.original.image,
            text: generateInitials(row.original.name),
            alt: row.original.name,
            class: "w-8 h-8 rounded-full object-cover",
            size: "lg",
            style: `background-color: ${generateUserColor(row.original.id)}`,
            ui: { fallback: "text-white" },
          }),
          h("div", undefined, [
            h("p", { class: "font-medium text-highlighted" }, row.original.name),
            h("p", { class: "" }, `${row.original.email}`),
          ]),
        ]);
      },
    },
    {
      accessorKey: "role",
      header: createSortableHeader("Role"),
      cell: ({ row }) => {
        return h("div", { class: "flex items-center gap-3" }, [
          h(UIcon, {
            name: `${userIcon(row.original.role)}`,
            class: row.original.role === "admin" ? "text-error size-6" : "text-success size-7",
          }),
          h("span", { class: "capitalize font-medium text-highlighted" }, row.original.role),
        ]);
      },
    },
    {
      accessorKey: "residencyStatus",
      header: createSortableHeader("Residency Status"),
      cell: ({ row }) => {
        const residencyStatus = row.original.role === "admin" ? "N/A" : row.original.student?.residencyStatus ?? "active";
        return h(UBadge, {
          label: residencyStatus,
          color: statusColorMap[residencyStatus],
          variant: "soft",
          size: "lg",
          class: "capitalize",
        });
      },
    },
    {
      accessorKey: "email",
      header: createSortableHeader("Email"),
      cell: ({ row }) => {
        return h("p", { class: "font-medium" }, row.original.email)
        ;
      },
    },
    {
      accessorKey: "emailVerified",
      header: createSortableHeader("Email verification Status"),
      cell: ({ row }) => {
        return row.original.isEmailVerified
          ? h(UBadge, {
              label: "Verified",
              color: "success",
              variant: "soft",
              size: "lg",
            })
          : h(UBadge, {
              label: "Unverified",
              color: "warning",
              variant: "soft",
              size: "lg",
            });
      },
    },
  ]);

  return {
    getRowItems,
    columns,
  };
}
