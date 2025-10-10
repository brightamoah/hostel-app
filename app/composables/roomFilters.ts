import type { RoomDataResponse, TableType } from "~/types";

type DataType = globalThis.Ref<RoomDataResponse, RoomDataResponse>;

export function useRoomFilters(table: TableType, data: DataType) {
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

  watch(() => [statusFilter.value, buildingFilter.value, floorFilter.value], ([newStatus, newBuilding, newFloor]) => {
    if (!table?.value?.tableApi)
      return;

    const statusColumn = table.value.tableApi.getColumn("status");
    if (!statusColumn)
      return;

    if (newStatus === "all") {
      statusColumn.setFilterValue(undefined);
    }
    else {
      statusColumn.setFilterValue(newStatus);
    }

    const buildingColumn = table.value.tableApi.getColumn("building");
    if (buildingColumn) {
      if (!newBuilding || newBuilding === "all") {
        buildingColumn.setFilterValue(undefined);
      }
      else {
        buildingColumn.setFilterValue(newBuilding);
      }
    }

    const floorColumn = table.value.tableApi.getColumn("floor");
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
  };
}
