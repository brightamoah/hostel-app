export function useStudentRoomFilters(table: TableType<Room>, data: DataType<StudentRoomData>) {
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
      label: "Vacant",
      value: "vacant",
    },
  ]);

  const hostelFilter = ref("");

  const hostelFilterOptions = computed(() => {
    const raw = (data.value?.hostels.map(
      hostel => hostel.name,
    ) ?? []) as string[];

    const options = raw.map(name => ({
      label: name,
      value: name,
    }));
    return [{ label: "All Hostels", value: "all" }, ...options];
  });

  const floorFilter = ref<string | number>("");

  const floorFilterOptions = ref([
    { label: "All Floors", value: "all" },
    ...Array.from({ length: 5 }, (_, i) => ({
      label: `Floor ${i + 1}`,
      value: i + 1,
    })),
  ]);

  const {
    safeTableApi,
    updatePage,
    selectedItemsLength: selectedRoomsLength,
    totalItems: totalRooms,
    currentItemShowing: currentRoomsShowing,
    lastItemShowing: lastRoomShowing,
    selectedIds: selectedRoomIds,
    defaultPage,
    itemsToDisplay,
    itemsPerPage,
  } = useTableFilters<Room>(table, data, "rooms");

  watch(() => [statusFilter.value, hostelFilter.value, floorFilter.value], async ([newStatus, newHostel, newFloor]) => {
    await nextTick();
    const tableApi = safeTableApi();
    if (!tableApi) return;

    const statusColumn = tableApi.getColumn?.("status");

    if (!statusColumn) return;

    if (newStatus === "all") statusColumn.setFilterValue(undefined);

    else statusColumn.setFilterValue(newStatus);

    const hostelColumn = tableApi.getColumn?.("hostel");
    if (hostelColumn) {
      if (!newHostel || newHostel === "all") hostelColumn.setFilterValue(undefined);

      else hostelColumn.setFilterValue(newHostel);
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
    hostelFilter,
    hostelFilterOptions,
    floorFilter,
    floorFilterOptions,
    selectedRoomsLength,
    defaultPage,
    itemsPerPage,
    totalRooms,
    currentRoomsShowing,
    lastRoomShowing,
    selectedRoomIds,
    itemsToDisplay,
    updatePage,
  };
}
