// Türkçe locale formatters. Single source for client+server.
//
// formatTR  : short date (DD.MM.YYYY via toLocaleDateString("tr-TR")).
// formatMoney: Intl.NumberFormat tr-TR currency, with raw-code fallback
//              for unknown currencies.

export function formatTR(value: Date | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

export function formatMoney(value: number, currency: string = "TRY"): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;
  }
}
