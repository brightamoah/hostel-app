export function getAcademicPeriod(allocationDate: Date, allocationEndDate: Date) {
  const start = new Date(allocationDate);
  const end = new Date(allocationEndDate);
  const startMonth = start.getMonth();

  const monthsDiff = (end.getMonth() - startMonth)
    + (12 * (end.getFullYear() - start.getFullYear()));

  if (monthsDiff >= 7) return "entire year";

  if (startMonth >= 4 && startMonth <= 7) return "second semester";

  return "first semester";
}
