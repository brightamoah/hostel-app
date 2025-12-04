import type { Row } from "@tanstack/table-core";

export function dateFilter<T>(row: Row<T>, columnId: string, filterValue?: string) {
  if (!filterValue || filterValue === "all-dates") return true;

  const rowDate = row.getValue<string | Date>(columnId);
  if (!rowDate) return false;

  const toLocalDate = (d: string | Date) => {
    const date = new Date(d);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };

  const today = toLocalDate(new Date());
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  const rowDateTimestamp = toLocalDate(rowDate);

  const startOfWeek = (dateTs: number) => {
    const date = new Date(dateTs);
    const day = date.getDay(); // 0 (Sun) - 6
    const daysUntilMonday = date.getDate() - day + (day === 0 ? -6 : 1); // make Monday start

    const monday = new Date(date.setDate(daysUntilMonday));
    return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate()).getTime();
  };

  const endOfWeek = (startTs: number) => startTs + (6 * oneDayInMilliseconds);

  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();

  switch (filterValue) {
    case "today":
      return rowDateTimestamp === today;
    case "tomorrow":
      return rowDateTimestamp === (today + oneDayInMilliseconds);
    case "this-week": {
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(weekStart);
      return rowDateTimestamp >= weekStart && rowDateTimestamp <= weekEnd;
    }
    case "next-week": {
      const thisWeekStart = startOfWeek(today);
      const nextWeekStart = thisWeekStart + 7 * oneDayInMilliseconds;
      const nextWeekEnd = endOfWeek(nextWeekStart);
      return rowDateTimestamp >= nextWeekStart && rowDateTimestamp <= nextWeekEnd;
    }
    case "this-month": {
      const start = startOfMonth(new Date(today));
      const end = endOfMonth(new Date(today));
      return rowDateTimestamp >= start && rowDateTimestamp <= end;
    }
    case "next-month": {
      const d = new Date(today);
      const nextMonthStart = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
      const nextMonthEnd = new Date(d.getFullYear(), d.getMonth() + 2, 0).getTime();
      return rowDateTimestamp >= nextMonthStart && rowDateTimestamp <= nextMonthEnd;
    }
    case "past-visits":
      return rowDateTimestamp < today;
    case "future-visits":
      return rowDateTimestamp > today;
    default:
      return true;
  }
}
