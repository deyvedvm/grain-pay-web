import { useQuery } from "@tanstack/react-query"
import * as reportsApi from "@/api/reports"

export const reportsKeys = {
  all: ["reports"] as const,
  monthly: (year: number) => [...reportsKeys.all, "monthly", year] as const,
  yearly: () => [...reportsKeys.all, "yearly"] as const,
  byCategory: (month: string) => [...reportsKeys.all, "by-category", month] as const,
}

export function useMonthlyReport(year: number) {
  return useQuery({
    queryKey: reportsKeys.monthly(year),
    queryFn: () => reportsApi.getMonthlyReport(year),
  })
}

export function useYearlyReport() {
  return useQuery({
    queryKey: reportsKeys.yearly(),
    queryFn: () => reportsApi.getYearlyReport(),
  })
}

export function useCategoryReport(month: string) {
  return useQuery({
    queryKey: reportsKeys.byCategory(month),
    queryFn: () => reportsApi.getCategoryReport(month),
  })
}
