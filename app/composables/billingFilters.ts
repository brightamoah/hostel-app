import { capitalize } from "vue";

export function useBillingFilters(
  table: TableType<Billing>,
  data: DataType<BillingResponse>,
) {
  const statusFilter = ref("");
  const statusFilterOptions = computed(() => billingStatusSchema.options.map(status => ({
    label: capitalize(status),
    value: status,
  })));

  const {
    studentFilter,
    studentFilterOptions,
    hostelFilter,
    hostelFilterOptions,
    isHostelLoading,
    isStudentLoading,
  } = useGetSharedFilterOptions();

  const {
    safeTableApi,
    updatePage,
    selectedItemsLength: selectedBillingsLength,
    totalItems: totalBillings,
    currentItemShowing: currentBillingShowing,
    lastItemShowing: lastBillingShowing,
    selectedIds: selectedBillingIds,
    defaultPage,
    itemsToDisplay,
    itemsPerPage,
    tableState,
  } = useTableFilters<Billing>(table, data, "complaint");

  watch([
    statusFilter,
    studentFilter,
    hostelFilter,
  ], async ([
    newStatus,
    newStudent,
    newHostel,
  ]) => {
    await nextTick();

    const tableApi = safeTableApi();

    if (!tableApi) return;

    const statusColumn = tableApi.getColumn("status");

    if (!statusColumn) return;

    if (newStatus === "all") statusColumn.setFilterValue(undefined);
    else statusColumn.setFilterValue(newStatus);

    const studentColumn = tableApi.getColumn("student");

    if (!studentColumn) return;

    if (newStudent === "all") studentColumn.setFilterValue(undefined);
    else studentColumn.setFilterValue(newStudent);

    const hostelColumn = tableApi.getColumn?.("hostel.name");
    if (hostelColumn) {
      if (!newHostel || newHostel === "all") hostelColumn.setFilterValue(undefined);

      else hostelColumn.setFilterValue(newHostel);
    }
  });

  return {
    statusFilterOptions,
    statusFilter,
    studentFilter,
    studentFilterOptions,
    hostelFilter,
    hostelFilterOptions,
    isHostelLoading,
    isStudentLoading,
    selectedBillingIds,
    lastBillingShowing,
    selectedBillingsLength,
    currentBillingShowing,
    totalBillings,
    defaultPage,
    itemsToDisplay,
    itemsPerPage,
    tableState,
    updatePage,
  };
}
