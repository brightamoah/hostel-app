import type { Column } from "@tanstack/table-core";

export function createSortableHeader<T>(label: Capitalize<string>, UButton: ComponentType) {
  return ({ column }: { column: Column<T> }) => {
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
}
