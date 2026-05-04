import { api } from "@/api/client"
import type { ApiEnvelope, Category } from "@/types/api"

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiEnvelope<Category[]>>("/api/categories", {
    params: { page: 0, size: 100, sort: "name" },
  })
  return data.data
}
