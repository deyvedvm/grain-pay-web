import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import * as categoriesApi from "@/api/categories"
import type { CreateCategoryPayload } from "@/types/api"

const CATEGORIES_KEY = ["categories"] as const

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

export function useCategoriesList() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: categoriesApi.listCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesApi.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast.success("Categoria criada")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao criar categoria")),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateCategoryPayload }) =>
      categoriesApi.updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast.success("Categoria atualizada")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao atualizar categoria")),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      qc.invalidateQueries({ queryKey: ["transactions"] })
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
      toast.success("Categoria excluída")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao excluir categoria")),
  })
}
