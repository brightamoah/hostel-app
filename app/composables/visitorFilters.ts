export function useVisitorFilters(table: TableType<VisitorType>, data: DataType<VisitorDataResponse>) {
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
      label: "Approved",
      value: "approved",
    },
    {
      label: "Checked In",
      value: "checked-in",
    },
    {
      label: "Checked Out",
      value: "checked-out",
    },
    {
      label: "Cancelled",
      value: "cancelled",
    },
    {
      label: "Denied",
      value: "denied",
    },
  ]);

  const dateFilter = ref("");

  const dateFilterOptions = ref<FilterOption[]>([
    {
      label: "All Dates",
      value: "all-dates",
    },
    {
      label: "Today",
      value: "today",
    },
    {
      label: "Tomorrow",
      value: "tomorrow",
    },
    {
      label: "This week",
      value: "this-week",
    },
    {
      label: "Next week",
      value: "next-week",
    },
    {
      label: "This month",
      value: "this-month",
    },
    {
      label: "Next month",
      value: "next-month",
    },
    {
      label: "Past Visits",
      value: "past-visits",
    },
    {
      label: "Future Visits",
      value: "future-visits",
    },
  ]);

  const {
    safeTableApi,
    updatePage,
    selectedItemsLength: selectedVisitorsLength,
    totalItems: totalVisitors,
    currentItemShowing: currentVisitorShowing,
    lastItemShowing: lastVisitorShowing,
    selectedIds: selectedVisitorIds,
    defaultPage,
    itemsToDisplay,
    tableState,
    itemsPerPage,
  } = useTableFilters<VisitorType>(table, data, "visitors");

  watch(() => [statusFilter.value, dateFilter.value], async ([newStatus, newDate]) => {
    await nextTick();
    const tableApi = safeTableApi();
    if (!tableApi)
      return;

    const statusColumn = tableApi.getColumn("status");
    if (!statusColumn)
      return;

    if (newStatus === "all")
      statusColumn.setFilterValue(undefined);

    else statusColumn.setFilterValue(newStatus);

    const dateColumn = tableApi.getColumn("visitDate");
    if (!dateColumn)
      return;

    if (newDate === "all-dates")
      dateColumn.setFilterValue(undefined);

    else dateColumn.setFilterValue(newDate);
  }, { immediate: true });

  return {
    statusFilter,
    statusFilterOptions,
    dateFilter,
    dateFilterOptions,
    tableState,
    selectedVisitorsLength,
    defaultPage,
    itemsPerPage,
    totalVisitors,
    currentVisitorShowing,
    lastVisitorShowing,
    selectedVisitorIds,
    itemsToDisplay,
    updatePage,
  };
}
