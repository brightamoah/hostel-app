import { useDateFormat } from "@vueuse/core";

function formatMoney(amount: number | string) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    currencyDisplay: "code",
  }).format(Number(amount));
}

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return useDateFormat(date, "dddd, Do MMMM, YYYY").value;
}
export { formatDate, formatMoney };
