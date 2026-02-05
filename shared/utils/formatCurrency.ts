export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    notation: "standard",
    localeMatcher: "best fit",
    currencySign: "accounting",
  }).format(amount);
}

export function getCurrencySymbol(currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency })
    .formatToParts(1)
    .find(x => x.type === "currency")
    ?.value;
}
