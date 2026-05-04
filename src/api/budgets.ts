import { api } from "@/api/client"
import type { ApiEnvelope, Budget, CreateBudgetPayload } from "@/types/api"

export async function listBudgets(month: string): Promise<Budget[]> {
  const { data } = await api.get<ApiEnvelope<Budget[]>>("/api/budgets", {
    params: { month },
  })
  return data.data
}

export async function createBudget(payload: CreateBudgetPayload): Promise<Budget> {
  const { data } = await api.post<ApiEnvelope<Budget>>("/api/budgets", payload)
  return data.data
}

export async function updateBudget(
  id: number,
  payload: CreateBudgetPayload,
): Promise<Budget> {
  const { data } = await api.put<ApiEnvelope<Budget>>(`/api/budgets/${id}`, payload)
  return data.data
}

export async function deleteBudget(id: number): Promise<void> {
  await api.delete(`/api/budgets/${id}`)
}
