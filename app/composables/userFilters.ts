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

  const selectedUsersLength = computed(() => {
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

  const totalUsers = computed<number>(() => {
    const tableApi = safeTableApi();
    return tableApi?.getPreFilteredRowModel().rows.length ?? (data.value?.users?.length ?? 0);
  });

  const updatePage = (p: number) => {
    try {
      safeTableApi()?.setPageIndex?.(p - 1);
    }
    catch (e) {
      console.warn("updatePage skipped:", e);
    }
  };

  const currentUserShowing = computed(() => {
    const tableApi = safeTableApi();
    if (!tableApi)
      return 0;

    try {
      const state = tableApi.getState?.().pagination ?? tableApi.getState().pagination;
      const pageIndex = typeof state?.pageIndex === "number" ? state.pageIndex : 0;
      const pageSize = typeof state?.pageSize === "number" ? state.pageSize : 10;

      const filteredCount = tableApi.getFilteredRowModel().rows.length;
      return pageIndex * pageSize + (filteredCount > 0 ? 1 : 0); ;
    }
    catch {
      return 0;
    }
  });

  const lastUserShowing = computed(() => {
    const tableApi = safeTableApi();
    if (!tableApi)
      return 0;

    try {
      const state = tableApi.getState?.().pagination ?? tableApi.getState().pagination;
      const pageIndex = typeof state?.pageIndex === "number" ? state.pageIndex : 0;
      const pageSize = typeof state?.pageSize === "number" ? state.pageSize : 10;

      const filteredCount = tableApi.getFilteredRowModel().rows.length;
      return Math.min((pageIndex + 1) * pageSize, filteredCount);
    }
    catch {
      return tableApi.getFilteredRowModel().rows.length;
    }
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
