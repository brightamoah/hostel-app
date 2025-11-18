export function useMaintenanceFilter(table: TableType<MaintenanceType>, data: DataType<MaintenanceDataResponse>) {
  const statusFilter = ref("");
  const statusFilterOptions = ref<FilterOption[]>([
    {
      label: "All Statuses",
      value: "all",
    },
    {
      label: "Pending",
      value: "pending",
    },
    {
      label: "Assigned",
      value: "assigned",
    },
    {
      label: "In-Progress",
      value: "in-progress",
    },
    {
      label: "Completed",
      value: "completed",
    },
    {
      label: "Rejected",
      value: "rejected",
    },
  ]);

  const priorityFilter = ref("");
  const priorityFilterOptions = ref<FilterOption[]>([
    {
      label: "All Priority",
      value: "all",
    },
    {
      label: "Low",
      value: "low",
    },
    {
      label: "Medium",
      value: "medium",
    },
    {
      label: "High",
      value: "high",
    },
    {
      label: "Emergency",
      value: "emergency",
    },
  ]);

  const typeFilter = ref("");
  const typeFilterOptions = ref<FilterOption[]>([
    {
      label: "All Type",
      value: "all",
    },
    {
      label: "Plumbing",
      value: "plumbing",
    },
    {
      label: "Electrical",
      value: "electrical",
    },
    {
      label: "Furniture",
      value: "furniture",
    },
    {
      label: "Cleaning",
      value: "cleaning",
    },
    {
      label: "Appliance",
      value: "appliance",
    },
    {
      label: "Structural",
      value: "structural",
    },
    {
      label: "Pest Control",
      value: "pest control",
    },
    {
      label: "Internet/Wi-Fi",
      value: "internet/Wi-Fi",
    },
    {
      label: "Other",
      value: "other",
    },
  ]);

  const {
    safeTableApi,
    updatePage,
    selectedItemsLength: selectedMaintenanceLength,
    totalItems: totalMaintenance,
    currentItemShowing: currentMaintenanceShowing,
    lastItemShowing: lastMaintenanceShowing,
    selectedIds: selectedMaintenanceIds,
    defaultPage,
    itemsToDisplay,
    tableState,
    itemsPerPage,
  } = useTableFilters<MaintenanceType>(table, data, "maintenance");

  watch(() => [statusFilter.value, priorityFilter.value, typeFilter.value], async ([newStatus, newPriority, newType]) => {
    await nextTick();

    const tableApi = safeTableApi();
    if (!tableApi)
      return;

    const statusColumn = tableApi.getColumn("status");
    if (!statusColumn)
      return;

    if (newStatus === "all") {
      statusColumn.setFilterValue(undefined);
    }
    else {
      statusColumn.setFilterValue(newStatus);
    }

    const priorityColumn = tableApi.getColumn("priority");
    if (!priorityColumn)
      return;

    if (newPriority === "all") {
      priorityColumn.setFilterValue(undefined);
    }
    else {
      priorityColumn.setFilterValue(newPriority);
    }

    const typeColumn = tableApi.getColumn("issueType");
    if (!typeColumn)
      return;

    if (newType === "all") {
      typeColumn.setFilterValue(undefined);
    }
    else {
      typeColumn.setFilterValue(newType);
    }
  }, { immediate: true });

  return {
    statusFilter,
    statusFilterOptions,
    priorityFilter,
    priorityFilterOptions,
    typeFilter,
    typeFilterOptions,
    selectedMaintenanceLength,
    totalMaintenance,
    currentMaintenanceShowing,
    lastMaintenanceShowing,
    selectedMaintenanceIds,
    defaultPage,
    itemsPerPage,
    tableState,
    itemsToDisplay,
    updatePage,
  };
}
