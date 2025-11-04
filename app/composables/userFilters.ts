import type { FilterOption, UserDataResponse, UserTableType, UserType } from "~/types";

type DataType = globalThis.Ref<UserDataResponse, UserDataResponse>;

export function useUserFilters(table: UserTableType, data: DataType) {
  const statusFilter = ref("");

  const statusFilterOptions = ref<FilterOption[]>([
    {
      label: "All Statuses",
      value: "all",
    },
    {
      label: "Active",
      value: "active",
    },
    {
      label: "Inactive",
      value: "inactive",
    },
    {
      label: "Suspended",
      value: "suspended",
    },
    { label: "Graduated", value: "graduated" },
    { label: "Withdrawn", value: "withdrawn" },
    {
      label: "N/A",
      value: "N/A",
    },
  ]);

  const roleFilter = ref("");

  const roleFilterOptions = ref<FilterOption[]>([
    {
      label: "All Roles",
      value: "all",
    },
    {
      label: "Admin",
      value: "admin",
    },
    {
      label: "Student",
      value: "student",
    },
  ]);

  const {
    safeTableApi,
    updatePage,
    selectedItemsLength: selectedUsersLength,
    totalItems: totalUsers,
    currentItemShowing: currentUserShowing,
    lastItemShowing: lastUserShowing,
    selectedIds: selectedUserIds,
    itemsToDisplay,
    tableState,
    itemsPerPage,
    defaultPage,
  } = useTableFilters<UserType>(table, data, "users");

  watch(
    () => [data.value?.users?.length, totalUsers.value],
    () => {
      nextTick(() => {
        const tableApi = safeTableApi();
        const pageSize = tableState.value?.pagination.pageSize || 10;
        if (tableApi)
          tableApi.setPageIndex(0);
        tableApi?.setPageSize(pageSize);
      });
    },
  );

  watch(() => [statusFilter.value, roleFilter.value], async ([newStatus, newRole]) => {
    await nextTick();
    const tableApi = safeTableApi();
    if (!tableApi)
      return;

    const statusColumn = tableApi.getColumn?.("residencyStatus");

    if (!statusColumn)
      return;

    if (newStatus === "all") {
      statusColumn.setFilterValue(undefined);
    }
    else {
      statusColumn.setFilterValue(newStatus);
    }

    const roleColumn = tableApi.getColumn?.("role");

    if (!roleColumn)
      return;

    if (newRole === "all") {
      roleColumn.setFilterValue(undefined);
    }
    else {
      roleColumn.setFilterValue(newRole);
    }
  }, { immediate: true });

  return {
    statusFilter,
    roleFilter,
    roleFilterOptions,
    statusFilterOptions,
    defaultPage,
    itemsPerPage,
    lastUserShowing,
    currentUserShowing,
    selectedUserIds,
    selectedUsersLength,
    totalUsers,
    itemsToDisplay,
    updatePage,
  };
}
