import type { TableColumn } from "@nuxt/ui";
import type { Column, Row } from "@tanstack/table-core";

import type { Component, UserType } from "~/types";

const UserDetailsModal = defineAsyncComponent(() => import("~/components/user/detailsModal.vue"));

const ConfirmationModal = defineAsyncComponent(() => import("~/components/dashboard/confirmationModal.vue"));

export function useUserRowColumn(
  UAvatar: Component,
  UButton: Component,
  UBadge: Component,
  UDropdownMenu: Component,
  UCheckbox: Component,
  UIcon: Component,
  // UTooltip: Component,
) {
  const overlay = useOverlay();
  const userStore = useUserStore();
  const { isLoading } = storeToRefs(userStore);

  const openDetailsModal = (user: UserType) => {
    overlay.create(UserDetailsModal).open({
      user,
    });
  };

  const openDeleteUserModal = (userId: number, userName: string) => {
    const modal = overlay.create(ConfirmationModal);
    const close = modal.close;
    modal.open({
      title: `Delete User`,
      confirmLabel: "Delete User",
      isLoading,
      description: `This action will delete user with Name ${userName} and ID ${userId}.`,
      renderTrigger: false,
      body: `Are you sure you want to delete user with name ${userName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await userStore.deleteUser({ ids: [userId] });
          close();
        }
        catch (error) {
          console.warn("Delete failed:", error);
          close();
        }
      },
    });
  };

  const openPromoteDemoteUserModal = (user: UserType) => {
    const modal = overlay.create(ConfirmationModal);
    const close = modal.close;

    const assignRoleChangeLabel = computed<string>(() =>
      user.role === "admin" ? "Demote User" : "Promote User",
    );
    const newRole = computed(() => user.role === "admin" ? "student" : "admin");

    modal.open({
      title: `${assignRoleChangeLabel.value}`,
      description: `This action will ${assignRoleChangeLabel.value.toLocaleLowerCase()} with name ${user.name} and ID ${user.id}.`,
      confirmLabel: `${assignRoleChangeLabel.value}`,
      isLoading,
      renderTrigger: false,
      body: `Are you sure you want to ${assignRoleChangeLabel.value.toLocaleLowerCase()} with name ${user.name} from ${user.role} to ${newRole.value}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await userStore.promoteOrDemoteUser({
            userId: user.id,
            action: user.role === "admin" ? "demote" : "promote",
          });
          close();
        }
        catch (error) {
          console.warn("Role change failed:", error);
          close();
        }
      },
    });
  };

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
        onSelect: () => openDetailsModal(row.original),
      },
      {
        label: roleChangeLabels.value,
        icon: "i-lucide-refresh-cw",
        onSelect: () => openPromoteDemoteUserModal(row.original),
      },
      {
        label: "Delete user",
        icon: "i-lucide-trash-2",
        color: "error",
        onSelect: () => {
          openDeleteUserModal(row.original.id, row.original.name);
        },
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
      id: "residencyStatus",
      accessorFn: row => row.student?.residencyStatus ?? "N/A",
      header: createSortableHeader("Residency Status"),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all")
          return true;
        return row.getValue(columnId) === filterValue;
      },
      cell: ({ row }) => {
        const residencyStatus = row.original.role === "admin" ? "N/A" : row.original.student?.residencyStatus ?? "N/A";
        return h(UBadge, {
          label: residencyStatus,
          color: statusColorMap[residencyStatus],
          variant: "subtle",
          class: "capitalize",
        });
      },
    },
    {
      id: "phoneNumber",
      accessorFn: row => row.student?.phoneNumber ?? row.admin?.phoneNumber ?? "",
      header: createSortableHeader("Phone Number"),
      cell: ({ row }) => {
        const phoneNumber = row.original.role === "admin" ? row.original.admin?.phoneNumber : row.original.student?.phoneNumber;
        return phoneNumber || "N/A";
      },
    },
    {
      accessorKey: "emailVerified",
      header: createSortableHeader("Email Status"),
      cell: ({ row }) => {
        return row.original.isEmailVerified
          ? h(UBadge, {
              label: "Verified",
              color: "success",
              variant: "subtle",
            })
          : h(UBadge, {
              label: "Unverified",
              color: "warning",
              variant: "subtle",
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
