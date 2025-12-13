import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";

const UserDetailsModal = defineAsyncComponent(() => import("~/components/user/detailsModal.vue"));

const ConfirmationModal = defineAsyncComponent(() => import("~/components/dashboard/confirmationModal.vue"));

const PromoteUserModal = defineAsyncComponent(() => import("~/components/user/promoteUserModal.vue"));

export function useUserRowColumn(
  UAvatar: ComponentType,
  UButton: ComponentType,
  UBadge: ComponentType,
  UDropdownMenu: ComponentType,
  UCheckbox: ComponentType,
  UIcon: ComponentType,
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
    if (user.role === "admin" && user.admin?.status === "active") {
      const modal = overlay.create(ConfirmationModal);
      const close = modal.close;

      modal.open({
        title: "Demote User",
        description: `This action will demote ${user.name} from admin to student.`,
        confirmLabel: "Demote User",
        confirmColor: "warning",
        isLoading,
        renderTrigger: false,
        body: `Are you sure you want to demote ${user.name} from admin to student? Their admin privileges will be revoked. This action cannot be undone.`,
        onConfirm: async () => {
          try {
            await userStore.promoteOrDemoteUser({
              userId: user.id,
              action: "demote",
            });
            close();
          }
          catch (error) {
            console.warn("Role change failed:", error);
          }
        },
      });
    }
    else if (user.role === "student" && user.admin && user.admin.id) {
      const modal = overlay.create(ConfirmationModal);
      const close = modal.close;

      modal.open({
        title: "Re-activate Admin Role",
        description: `Do you want to re-activate ${user.name}'s previous admin role? `,
        confirmLabel: "Re-activate",
        confirmColor: "primary",
        isLoading,
        renderTrigger: false,
        body: `Are you sure you want to re-activate ${user.name}'s admin role? Their saved settings and privileges will be restored. `,
        onConfirm: async () => {
          await userStore.promoteOrDemoteUser({
            userId: user.id,
            action: "promote",
          });
          close();
        },
      });
    }
    else {
      const modal = overlay.create(PromoteUserModal);
      const close = modal.close;

      modal.open({
        user,
        isLoading,
        onConfirm: async (payload: PromoteDemoteSchema) => {
          try {
            await userStore.promoteOrDemoteUser(payload);
            close();
          }
          catch (error) {
            console.warn("Promote failed:", error);
          }
        },
      });
    }
  };

  const getRowItems = (row: Row<UserType>) => {
    const user = row.original;
    const roleChangeLabel = computed(() => {
      if (user.role === "admin") return "Demote to Student";
      if (user.admin?.id) return "Re-activate Admin Role";
      return "Promote to Admin";
    });

    return [
      {
        type: "label",
        label: "Actions",
      },
      {
        label: "View user details",
        icon: "i-lucide-eye",
        onSelect: () => openDetailsModal(user),
      },
      {
        label: roleChangeLabel.value,
        icon: "i-lucide-refresh-cw",
        onSelect: () => openPromoteDemoteUserModal(user),
      },
      {
        label: "Delete user",
        icon: "i-lucide-trash-2",
        color: "error",
        onSelect: () => openDeleteUserModal(user.id, user.name),

      },
    ];
  };

  type Student = NonNullable<UserType["student"]>;

  const statusColorMap: Record<Student["residencyStatus"], ColorType> = {
    "active": "success",
    "graduated": "info",
    "inactive": "error",
    "suspended": "warning",
    "withdrawn": "neutral",
    "N/A": "neutral",
  };

  const userIcon = (userRole?: UserType["role"]) =>
    userRole === "admin" ? "i-lucide-monitor" : "i-lucide-graduation-cap";

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
      id: "name",
      accessorFn: row => `${row.name} ${row.email}`,
      header: createSortableHeader("User", UButton),
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
      header: createSortableHeader("Role", UButton),
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
      header: createSortableHeader("Residency Status", UButton),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
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
      header: createSortableHeader("Phone Number", UButton),
      cell: ({ row }) => {
        const phoneNumber = row.original.role === "admin" ? row.original.admin?.phoneNumber : row.original.student?.phoneNumber;
        return phoneNumber || "N/A";
      },
    },
    {
      accessorKey: "emailVerified",
      header: createSortableHeader("Email Status", UButton),
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
