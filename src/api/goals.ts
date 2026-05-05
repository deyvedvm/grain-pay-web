import { api } from "@/api/client"
import type {
  ApiEnvelope,
  CreateGoalPayload,
  Goal,
  UpdateGoalPayload,
} from "@/types/api"

export async function listGoals(): Promise<Goal[]> {
  const { data } = await api.get<ApiEnvelope<Goal[]>>("/api/goals")
  return data.data
}

export async function createGoal(payload: CreateGoalPayload): Promise<Goal> {
  const { data } = await api.post<ApiEnvelope<Goal>>("/api/goals", payload)
  return data.data
}

export async function updateGoal(
  id: number,
  payload: UpdateGoalPayload,
): Promise<Goal> {
  const { data } = await api.put<ApiEnvelope<Goal>>(`/api/goals/${id}`, payload)
  return data.data
}

export async function deleteGoal(id: number): Promise<void> {
  await api.delete(`/api/goals/${id}`)
}
