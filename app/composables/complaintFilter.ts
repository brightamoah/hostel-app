export function useComplaintFilter(
  table: TableType<Complaint>,
  data: DataType<ComplaintDataResponse>,
) {
  const typeFilter = ref("");
  const typeFilterOptions = ref<FilterOption[]>([
    {
      label: "All Types",
      value: "all",
    },
    {
      label: "Room Condition",
      value: "room condition",
    },
    {
      label: "Staff Behavior",
      value: " staff behavior",
    },
    {
      label: "Amenities",
      value: "amenities",
    },
    {
      label: "Noise",
      value: "noise",
    },
    {
      label: "Security",
      value: "security",
    },
    {
      label: "Billing Issue",
      value: "billing issue",
    },
    {
      label: "Other",
      value: "other",
    },
  ]);

  const priorityFilter = ref("");
  const priorityFilterOptions = ref<FilterOption[]>([
    {
      label: "All Priorities",
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
      label: "In-Progress",
      value: "in-progress",
    },
    {
      label: "Resolved",
      value: "resolved",
    },
    {
      label: "Rejected",
      value: "rejected",
    },
  ]);

  const { users } = useFetchUserData();

  const studentFilter = ref("");
  const studentFilterOptions = computed<FilterOption[]>(() => {
    const students = users.value.filter(user => user.role === "student");

    const filter = students.map(student => ({
      label: student.name,
      value: student.name,
    }));
    return [
      {
        label: "All Students",
        value: "all",
      },
      ...filter,
    ];
  });

  const {
    safeTableApi,
    updatePage,
    selectedItemsLength: selectedComplaintLength,
    totalItems: totalComplaints,
    currentItemShowing: currentComplaintShowing,
    lastItemShowing: lastComplaintShowing,
    selectedIds: selectedComplaintIds,
    defaultPage,
    itemsToDisplay,
    itemsPerPage,
    tableState,
  } = useTableFilters<Complaint>(table, data, "complaint");

  watch(() =>
    [typeFilter.value, priorityFilter.value, statusFilter.value, studentFilter.value], async ([newType, newPriority, newStatus, newStudent]) => {
    await nextTick();

    const tableApi = safeTableApi();
    if (!tableApi) return;

    const typeColumn = tableApi.getColumn("type");

    if (!typeColumn) return;

    if (newType === "all") typeColumn.setFilterValue(undefined);

    else typeColumn.setFilterValue(newType);

    const priorityColumn = tableApi.getColumn("priority");
    if (!priorityColumn) return;

    if (newPriority === "all") priorityColumn.setFilterValue(undefined);

    else priorityColumn.setFilterValue(newPriority);

    const statusColumn = tableApi.getColumn("status");
    if (!statusColumn) return;

    if (newStatus === "all") statusColumn.setFilterValue(undefined);

    else statusColumn.setFilterValue(newStatus);

    const studentColumn = tableApi.getColumn("student");

    if (!studentColumn) return;

    if (newStudent === "all") studentColumn.setFilterValue(undefined);

    else studentColumn.setFilterValue(newStudent);
  });

  return {
    typeFilter,
    typeFilterOptions,
    priorityFilter,
    priorityFilterOptions,
    statusFilter,
    statusFilterOptions,
    studentFilter,
    studentFilterOptions,
    defaultPage,
    itemsToDisplay,
    itemsPerPage,
    tableState,
    selectedComplaintLength,
    totalComplaints,
    currentComplaintShowing,
    lastComplaintShowing,
    selectedComplaintIds,
    updatePage,
  };
}
