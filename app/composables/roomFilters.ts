import { upperFirst } from "scule";

import type { RoomDataResponse, RoomTableType } from "~/types";

type DataType = globalThis.Ref<RoomDataResponse, RoomDataResponse>;

export function useRoomFilters(table: RoomTableType, data: DataType) {
  const statusFilter = ref("");

  const statusFilterOptions = ref([
    {
      label: "All Statuses",
      value: "all",
    },
    {
      label: "Partially Occupied",
      value: "partially occupied",
    },
    {
      label: "Fully Occupied",
      value: "fully occupied",
    },
    {
      label: "Under Maintenance",
      value: "under maintenance",
    },
    {
      label: "Vacant",
      value: "vacant",
    },
    {
      label: "Reserved",
      value: "reserved",
    },
  ]);

  const buildingFilter = ref("");

  const buildingFilterOptions = computed(() => {
    const raw = (data.value?.buildings.map(
      b => b.building,
    ) ?? []) as string[];

    const options = raw.map(name => ({
      label: name,
      value: name,
    }));
    return [{ label: "All Buildings", value: "all" }, ...options];
  });

  const floorFilter = ref<string | number>("");

  const floorFilterOptions = ref([
    { label: "All Floors", value: "all" },
    ...Array.from({ length: 5 }, (_, i) => ({
      label: `Floor ${i + 1}`,
      value: i + 1,
    })),
  ]);

  const safeTableApi = () => {
    try {
      return table?.value?.tableApi ?? null;
    }
    catch {
      return null;
    }
  };

  const selectedRoomsLength = computed<number>(() => {
    const tableApi = safeTableApi();
    return tableApi?.getFilteredSelectedRowModel?.().rows.length ?? 0;
  });

  const defaultPage = computed<number>(() => {
    const tableApi = safeTableApi();
    const pageIndex = tableApi?.getState?.().pagination?.pageIndex;
    return (typeof pageIndex === "number" ? pageIndex : 0) + 1;
  });

  const itemsPerPage = computed<number>(() => {
    const tableApi = safeTableApi();
    const pageSize = tableApi?.getState?.().pagination?.pageSize;
    return typeof pageSize === "number" ? pageSize : 10;
  });

  const totalRooms = computed<number>(() => {
    const tableApi = safeTableApi();
    return tableApi?.getPreFilteredRowModel().rows.length ?? (data.value?.rooms?.length ?? 0);
  });

  const updatePage = (p: number) => {
    try {
      safeTableApi()?.setPageIndex?.(p - 1);
    }
    catch (e) {
      console.warn("updatePage skipped:", e);
    }
  };

  const currentRoomsShowing = computed(() => {
    const tableApi = safeTableApi();
    if (!tableApi)
      return 0;

    try {
      const state = tableApi.getState?.().pagination ?? tableApi.getState().pagination;
      const pageIndex = typeof state?.pageIndex === "number" ? state.pageIndex : 0;
      const pageSize = typeof state?.pageSize === "number" ? state.pageSize : 10;

      return pageIndex * pageSize + (totalRooms.value > 0 ? 1 : 0);
    }
    catch {
      return 0;
    }
  });

  const lastRoomShowing = computed(() => {
    const tableApi = safeTableApi();
    if (!tableApi)
      return 0;
    try {
      const state = tableApi.getState?.().pagination ?? tableApi.getState().pagination;
      const pageIndex = typeof state?.pageIndex === "number" ? state.pageIndex : 0;
      const pageSize = typeof state?.pageSize === "number" ? state.pageSize : 10;

      return Math.min((pageIndex + 1) * pageSize, totalRooms.value);
    }
    catch {
      return totalRooms.value;
    }
  });

  const selectedRoomIds = computed(() => {
    const tableApi = safeTableApi();
    return { ids: tableApi?.getFilteredSelectedRowModel().rows.map(r => r.original.id) ?? [] };
  });

  const itemsToDisplay = computed(() => {
    const tableApi = safeTableApi();
    const items = tableApi?.getAllColumns().filter((column: any) => column.getCanHide()).map((column: any) => ({
      label: upperFirst(column.id),
      type: "checkbox" as const,
      checked: column.getIsVisible(),
      onUpdateChecked(checked: boolean) {
        tableApi?.getColumn(column.id)?.toggleVisibility(!!checked);
      },
      onSelect(e?: Event) {
        e?.preventDefault();
      },
    }));

    return items;
  });

  watch(() => [statusFilter.value, buildingFilter.value, floorFilter.value], async ([newStatus, newBuilding, newFloor]) => {
    await nextTick();
    const tableApi = safeTableApi();
    if (!tableApi)
      return;

    const statusColumn = tableApi.getColumn?.("status");

    if (!statusColumn)
      return;

    if (newStatus === "all") {
      statusColumn.setFilterValue(undefined);
    }
    else {
      statusColumn.setFilterValue(newStatus);
    }

    const buildingColumn = tableApi.getColumn?.("building");
    if (buildingColumn) {
      if (!newBuilding || newBuilding === "all") {
        buildingColumn.setFilterValue(undefined);
      }
      else {
        buildingColumn.setFilterValue(newBuilding);
      }
    }

    const floorColumn = tableApi.getColumn?.("floor");
    if (floorColumn) {
      if (!newFloor || newFloor === "all") {
        floorColumn.setFilterValue(undefined);
      }
      else {
        const floorValue = Number(newFloor);
        floorColumn.setFilterValue(floorValue);
      }
    }
  }, { immediate: true });

  return {
    statusFilter,
    statusFilterOptions,
    buildingFilter,
    buildingFilterOptions,
    floorFilter,
    floorFilterOptions,
    selectedRoomsLength,
    defaultPage,
    itemsPerPage,
    totalRooms,
    currentRoomsShowing,
    lastRoomShowing,
    selectedRoomIds,
    updatePage,
    itemsToDisplay,
  };
}
