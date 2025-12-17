import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";

export function useStudentRoomRowColumn(
  UButton: ComponentType,
  UBadge: ComponentType,
  UDropdownMenu: ComponentType,
  UTooltip: ComponentType,
) {
  const toast = useToast();

  const openDetailsModal = (room: Room) => {
    toast.add({
      title: `Room Details: ${room.roomNumber}`,
      description: `Details for room ${room.roomNumber} would be shown here.`,
      color: "info",
    });
  };

  const getRowItems = (row: Row<Room>) => {
    const room = row.original;
    return [
      {
        type: "label",
        label: "Actions",
      },
      {
        label: "View Details",
        icon: "i-lucide-eye",
        onSelect: () => openDetailsModal(room),
      },
      {
        label: "Edit Room",
        icon: "i-lucide-notebook-pen",
        onSelect: () => { },
      },
      {
        label: "Delete Room",
        icon: "i-lucide-trash-2",
        color: "error",
        onSelect: () => { },
      },
    ];
  };

  const columns = computed<TableColumn<Room>[]>(() => [
    {
      accessorKey: "roomNumber",
      header: createSortableHeader("Room #", UButton),
      cell: ({ row }) => {
        return h("p", { class: "font-medium" }, row.original.roomNumber);
      },
    },
    {
      id: "hostel",
      accessorFn: row => row.hostel?.name ?? "N/A",
      header: createSortableHeader("Hostel", UButton),
      cell: ({ row }) => {
        return h("p", { class: "font-medium" }, row.original.hostel?.name ?? "N/A");
      },
    },
    {
      accessorKey: "floor",
      filterFn: "equals",
      header: createSortableHeader("Floor", UButton),
      cell: ({ row }) => {
        return h("p", { class: "font-medium" }, row.original.floor);
      },
    },
    {
      accessorKey: "roomType",
      header: createSortableHeader("Room Type", UButton),
      cell: ({ row }) => {
        return h("p", { class: "font-medium capitalize" }, row.original.roomType);
      },
    },
    {
      accessorKey: "status",
      header: createSortableHeader("Status", UButton),
      cell: ({ row }) => {
        const statusColor = roomStatusColorMap[row.original.status];
        return h(UBadge, {
          class: "capitalize",
          variant: "subtle",
          color: statusColor,
        }, () => row.original.status);
      },
    },
    {
      accessorKey: "capacity",
      header: createSortableHeader("Capacity", UButton),
      cell: ({ row }) => {
        const statusColor = roomStatusColorMap[row.original.status];

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
                {
                  class: "font-medium capitalize",
                  variant: "subtle",
                  color: statusColor,
                },
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
        if (capacity === 0) vacancyPhrase = "Capacity not specified.";

        else if (remaining <= 0) vacancyPhrase = "This room is fully occupied.";

        else if (remaining === capacity) vacancyPhrase = "This room is completely vacant";

        else if (remaining === 1) vacancyPhrase = "1 space available.";

        else vacancyPhrase = `${remaining} spaces available.`;

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
      header: createSortableHeader("Amount", UButton),
      cell: ({ row }) => {
        return h("p", { class: "font-medium" }, `${formatCurrency(Number(row.original.amountPerYear))}`);
      },
    },
    {
      id: "actions",
      header: () => h("div", { class: "text-center" }, "Amount"),
      cell: ({ row }) =>
        h(
          "div",
          { class: "flex items-center gap-2" },
          [
            h(
              UButton,
              {
                variant: "subtle",
                size: "sm",
                label: "Book Room",
                icon: "i-lucide-calendar",
                color: "primary",
                class: "cursor-pointer",
                onClick: () => console.log(row.original.roomNumber),

              },
            ),
            h(UButton, {
              variant: "ghost",
              size: "lg",
              icon: "i-lucide-eye",
              color: "neutral",
              class: "cursor-pointer",
              onClick: () => openDetailsModal(row.original),
            }),
          ],
        ),
    },
  ]);

  return {
    getRowItems,
    columns,
  };
}
