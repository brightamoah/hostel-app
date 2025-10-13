import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";
import type { ComputedOptions, ConcreteComponent, MethodOptions } from "vue";

import type { Room } from "~/types";

import ConfirmationModal from "~/components/dashboard/confirmationModal.vue";
import DetailsModal from "~/components/room/detailsModal.vue";

type Toast = ReturnType<typeof useToast>;
// eslint-disable-next-line ts/no-empty-object-type
type Component = string | ConcreteComponent<{}, any, any, ComputedOptions, MethodOptions, {}, any>;

export function useRoomRowColumn(
  toast: Toast,
  UButton: Component,
  UBadge: Component,
  UDropdownMenu: Component,
  UCheckbox: Component,
  UTooltip: Component,
) {
  const overlay = useOverlay();
  const roomStore = useRoomStore();
  const { isLoading } = storeToRefs(roomStore);

  const openDetailsModal = (roomId: number) => {
    overlay.create(DetailsModal).open({
      roomId,
    });
  };

  const openDeleteModal = (roomId: number, roomNumber: string) => {
    const modal = overlay.create(ConfirmationModal);
    const close = modal.close;
    modal.open({
      title: `Delete Room ${roomNumber}`,
      confirmLabel: "Delete Room",
      isLoading,
      description: `This will delete room ${roomNumber}.`,
      renderTrigger: false,
      body: `Are you sure you want to delete room ${roomNumber}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await roomStore.deleteRoom({ ids: [roomId] });
          close();
        }
        catch (error) {
          console.warn("Delete failed:", error);
          close();
        }
      },
    });
  };

  function getRowItems(row: Row<Room>) {
    return [
      {
        type: "label",
        label: "Actions",
      },
      {
        label: "Copy customer ID",
        icon: "i-lucide-copy",
        onSelect() {
          navigator.clipboard.writeText(row.original.id.toString());
          toast.add({
            title: "Copied to clipboard",
            description: "Customer ID copied to clipboard",
          });
        },
      },
      {
        label: "View Details",
        icon: "i-lucide-eye",
        onSelect() {
          openDetailsModal(row.original.id);
        },
      },
      {
        label: "Edit Room",
        icon: "i-heroicons-pencil-square",
        // to: `/admin/rooms/${row.original.id}/edit`
      },
      {
        label: "Delete Room",
        icon: "i-lucide-trash-2",
        color: "error",
        onSelect() {
          openDeleteModal(row.original.id, row.original.roomNumber);
        },
      },
    ];
  }

  const statusColorMap: Record<Room["status"], string> = {
    "vacant": "success",
    "partially occupied": "info",
    "fully occupied": "error",
    "under maintenance": "warning",
    "reserved": "neutral",
  };

  const columns: TableColumn<Room>[] = [
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
      accessorKey: "roomNumber",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Room #",
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
      },
      cell: ({ row }) => {
        return h("p", { class: "font-medium" }, row.original.roomNumber)
        ;
      },
    },
    {
      accessorKey: "building",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Building",
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
      },
      cell: ({ row }) => {
        return h("p", { class: "font-medium" }, row.original.building)
        ;
      },
    },
    {
      accessorKey: "floor",
      filterFn: "equals",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Floor",
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
      },
      cell: ({ row }) => {
        return h("p", { class: "font-medium" }, row.original.floor);
      },
    },
    {
      accessorKey: "roomType",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Room Type",
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
      },
      cell: ({ row }) => {
        return h("p", { class: "font-medium capitalize" }, row.original.roomType)
        ;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Status",
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
      },
      cell: ({ row }) => {
        const statusColor = statusColorMap[row.original.status] ?? "neutral";
        return h(UBadge, { class: "capitalize", variant: "subtle", color: statusColor }, () => row.original.status);
      },
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Availability",
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
      },
      cell: ({ row }) => {
        const statusColor = statusColorMap[row.original.status] ?? "neutral";

        // If the room is under maintenance, do NOT present it as available
        const isMaintenance = row.original.status === "under maintenance";
        if (isMaintenance) {
          const tooltipText = "Room is under maintenance and not available.";
          return h(
            UTooltip,
            { text: tooltipText },
            () =>
              h(
                UBadge,
                { class: "font-medium capitalize", variant: "subtle", color: statusColor },
                () =>
                  "Maintenance",
              ),
          );
        }

        const capacity = Number(row.original.capacity ?? 0);
        const currentOccupancy = Number(row.original.currentOccupancy ?? 0);
        const remaining = Math.max(0, capacity - currentOccupancy);

        // Build vacancy phrase without referencing status
        let vacancyPhrase: string;
        if (capacity === 0) {
          vacancyPhrase = "Capacity not specified.";
        }
        else if (remaining <= 0) {
          vacancyPhrase = "This room is fully occupied.";
        }
        else if (remaining === capacity) {
          vacancyPhrase = "This room is completely vacant";
        }
        else if (remaining === 1) {
          vacancyPhrase = "1 space available.";
        }
        else {
          vacancyPhrase = `${remaining} spaces available.`;
        }

        const tooltipText = `${remaining} spaces available out of ${capacity} total capacity. ${vacancyPhrase}`;

        return h(
          UTooltip,
          {
            text: tooltipText,
          },
          () =>
            h(
              UBadge,
              {
                class: "font-medium",
                variant: "subtle",
                color: statusColor,
              },
              () =>
                `${remaining} / ${capacity}`,
            ),
        );
      },
    },
    {
      accessorKey: "amountPerYear",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return h(UButton, {
          color: "neutral",
          variant: "ghost",
          label: "Amount",
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
      },
      cell: ({ row }) => {
        return h("p", { class: "font-medium" }, `${formatCurrency(Number(row.original.amountPerYear))}`)
        ;
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
  ];

  const columnsRef = ref<TableColumn<Room>[]>(columns);

  return {
    columns: columnsRef,
    getRowItems,
  };
}
