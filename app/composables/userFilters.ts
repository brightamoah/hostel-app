import { upperFirst } from "scule";

import type { FilterOption, UserDataResponse, UserTableType } from "~/types";

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

  const safeTableApi = () => {
    try {
      return table?.value?.tableApi ?? null;
    }
    catch {
      return null;
    }
  };

  const currentPage = ref(0);

  const tableState = computed(() => safeTableApi()?.getState());

  const selectedUsersLength = computed(() => {
    if (!tableState.value)
      return 0;
    const tableApi = safeTableApi();
    return tableApi?.getFilteredSelectedRowModel?.().rows.length ?? 0;
  });

  const itemsPerPage = computed<number>(() => {
    const pageSize = tableState.value?.pagination?.pageSize;
    return typeof pageSize === "number" ? pageSize : 10;
  });

  const totalUsers = computed<number>(() => {
    if (!tableState.value)
      return data.value?.users?.length ?? 0;
    const tableApi = safeTableApi();
    return tableApi?.getFilteredRowModel().rows.length ?? 0;
  });

  const updatePage = (p: number) => {
    try {
      currentPage.value = p;
      safeTableApi()?.setPageIndex?.(p - 1);
    }
    catch (e) {
      console.warn("updatePage skipped:", e);
    }
  };

  const currentUserShowing = computed(() => {
    const state = tableState.value?.pagination;
    if (!state)
      return 0;

    const pageIndex = typeof state.pageIndex === "number" ? state.pageIndex : 0;
    const pageSize = typeof state.pageSize === "number" ? state.pageSize : 10;
    const filteredCount = safeTableApi()?.getFilteredRowModel().rows.length ?? 0;

    return pageIndex * pageSize + (filteredCount > 0 ? 1 : 0);
  });

  const lastUserShowing = computed(() => {
    const state = tableState.value?.pagination;
    if (!state)
      return 0;

    const pageIndex = typeof state.pageIndex === "number" ? state.pageIndex : 0;
    const pageSize = typeof state.pageSize === "number" ? state.pageSize : 10;
    const filteredCount = safeTableApi()?.getFilteredRowModel().rows.length ?? 0;

    return Math.min((pageIndex + 1) * pageSize, filteredCount);
  });

  const selectedUserIds = computed(() => {
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

  watch(() => tableState.value?.pagination?.pageIndex, (newIndex) => {
    if (typeof newIndex === "number") {
      currentPage.value = newIndex + 1;
    }
  });

  watch(
    () => data.value?.users?.length,
    () => {
      nextTick(() => {
        const tableApi = safeTableApi();
        if (tableApi)
          tableApi.setPageIndex(0);
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
    currentPage,
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
