import { api } from "@/api/client"
import type { ApiEnvelope, Category, CreateCategoryPayload } from "@/types/api"

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiEnvelope<Category[]>>("/api/categories", {
    params: { page: 0, size: 100, sort: "name" },
  })
  return data.data
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<Category> {
  const { data } = await api.post<ApiEnvelope<Category>>("/api/categories", payload)
  return data.data
}

export async function updateCategory(
  id: number,
  payload: CreateCategoryPayload,
): Promise<Category> {
  const { data } = await api.put<ApiEnvelope<Category>>(
    `/api/categories/${id}`,
    payload,
  )
  return data.data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/api/categories/${id}`)
}
