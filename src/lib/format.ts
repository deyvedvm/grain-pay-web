export function formatCurrency(value: number, currency = "BRL", locale = "pt-BR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value)
}

export function formatDate(date: string | Date, locale = "pt-BR") {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d)
}

export function formatPercent(value: number, fractionDigits = 0) {
  return `${value.toFixed(fractionDigits)}%`
}
