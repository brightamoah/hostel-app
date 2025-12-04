import type { Table } from "@tanstack/vue-table";
import type { ShallowRef, ShallowUnwrapRef } from "vue";

import { upperFirst } from "scule";

type TableType<T> = Readonly<ShallowRef<ShallowUnwrapRef<{
  tableRef: Ref<HTMLTableElement | null, HTMLTableElement | null>;
  tableApi: Table<T>;
}> | null>>;

type DataType<T> = Ref<{ [key: string]: T[] | any } | null | undefined>;

/**
 * A generic composable to handle common TanStack Table state and actions.
 * @param table The table instance ref from useVueTable.
 * @param data The raw data ref from a useFetch call.
 * @param dataKey The key in the data object that holds the array of items (e.g., 'visitors', 'rooms').
 */
export function useTableFilters<T extends { id: number }>(
  table: TableType<T>,
  data: DataType<T>,
  dataKey: keyof NonNullable<DataType<T>["value"]>,
) {
  const safeTableApi = () => {
    try {
      return table?.value?.tableApi ?? null;
    }
    catch {
      return null;
    }
  };

  const tableState = computed(() => safeTableApi()?.getState());

  const selectedItemsLength = computed<number>(() => {
    return safeTableApi()?.getFilteredSelectedRowModel?.().rows.length ?? 0;
  });

  const defaultPage = computed<number>(() => {
    const pageIndex = tableState.value?.pagination?.pageIndex;
    return (typeof pageIndex === "number" ? pageIndex : 0) + 1;
  });

  const totalItems = computed<number>(() => {
    const tableApi = safeTableApi();
    const tableCount = tableApi?.getFilteredRowModel?.().rows.length ?? 0;
    const dataItems = data.value?.[dataKey] as T[] | undefined;
    const dataCount = dataItems?.length ?? 0;

    return tableCount > 0 ? tableCount : dataCount;
  });

  const updatePage = (p: number) => {
    try {
      safeTableApi()?.setPageIndex?.(p - 1);
    }
    catch (e) {
      console.warn("updatePage skipped:", e);
    }
  };

  const itemsPerPage = computed<number>(() => {
    const pageSize = tableState.value?.pagination?.pageSize;
    return typeof pageSize === "number" ? pageSize : 10;
  });

  const currentItemShowing = computed(() => {
    const state = tableState.value?.pagination;
    if (!state) return 0;

    const pageIndex = typeof state.pageIndex === "number" ? state.pageIndex : 0;
    const pageSize = typeof state.pageSize === "number" ? state.pageSize : 10;
    const filteredCount = safeTableApi()?.getFilteredRowModel().rows.length ?? 0;

    return pageIndex * pageSize + (filteredCount > 0 ? 1 : 0);
  });

  const lastItemShowing = computed(() => {
    const state = tableState.value?.pagination;
    if (!state) return 0;

    const pageIndex = typeof state.pageIndex === "number" ? state.pageIndex : 0;
    const pageSize = typeof state.pageSize === "number" ? state.pageSize : 10;
    const filteredCount = safeTableApi()?.getFilteredRowModel().rows.length ?? 0;

    return Math.min((pageIndex + 1) * pageSize, filteredCount);
  });

  const selectedIds = computed(() => {
    const tableApi = safeTableApi();
    return { ids: tableApi?.getFilteredSelectedRowModel().rows.map(r => r.original.id) ?? [] };
  });

  const itemsToDisplay = computed(() => {
    const tableApi = safeTableApi();
    return tableApi?.getAllColumns().filter(column => column.getCanHide()).map(column => ({
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
  });

  watch(() => [data.value?.[dataKey]?.length, totalItems.value], () => {
    nextTick(() => {
      const tableApi = safeTableApi();
      const pageSize = tableState.value?.pagination.pageSize || 10;
      if (tableApi) tableApi.setPageIndex(0);
      tableApi?.setPageSize(pageSize);
    });
  });

  return {
    tableState,
    selectedItemsLength,
    defaultPage,
    totalItems,
    currentItemShowing,
    lastItemShowing,
    selectedIds,
    itemsToDisplay,
    itemsPerPage,
    updatePage,
    safeTableApi,
  };
}
