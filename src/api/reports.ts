import { api } from "@/api/client"
import type {
  ApiEnvelope,
  CategoryReportItem,
  MonthlyReportItem,
  YearlyReportItem,
} from "@/types/api"

export async function getMonthlyReport(year: number): Promise<MonthlyReportItem[]> {
  const { data } = await api.get<ApiEnvelope<MonthlyReportItem[]>>(
    "/api/reports/monthly",
    { params: { year } },
  )
  return data.data
}

export async function getYearlyReport(): Promise<YearlyReportItem[]> {
  const { data } = await api.get<ApiEnvelope<YearlyReportItem[]>>(
    "/api/reports/yearly",
  )
  return data.data
}

export async function getCategoryReport(month: string): Promise<CategoryReportItem[]> {
  const { data } = await api.get<ApiEnvelope<CategoryReportItem[]>>(
    "/api/reports/by-category",
    { params: { month } },
  )
  return data.data
}
