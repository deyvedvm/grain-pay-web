import { api } from "@/api/client"
import type { ApiEnvelope, DashboardSummary } from "@/types/api"

export async function getDashboardSummary(month: string): Promise<DashboardSummary> {
  const { data } = await api.get<ApiEnvelope<DashboardSummary>>("/api/dashboard/summary", {
    params: { month },
  })
  return data.data
}
