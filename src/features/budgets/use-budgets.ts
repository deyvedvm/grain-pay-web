import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import * as budgetsApi from "@/api/budgets"
import type { CreateBudgetPayload } from "@/types/api"

export const budgetsKeys = {
  all: ["budgets"] as const,
  byMonth: (month: string) => [...budgetsKeys.all, month] as const,
}

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

export function useBudgetsList(month: string) {
  return useQuery({
    queryKey: budgetsKeys.byMonth(month),
    queryFn: () => budgetsApi.listBudgets(month),
  })
}

export function useCreateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) => budgetsApi.createBudget(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetsKeys.all })
      toast.success("Orçamento criado")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao criar orçamento")),
  })
}

export function useUpdateBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateBudgetPayload }) =>
      budgetsApi.updateBudget(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetsKeys.all })
      toast.success("Orçamento atualizado")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao atualizar orçamento")),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => budgetsApi.deleteBudget(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: budgetsKeys.all })
      toast.success("Orçamento excluído")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao excluir orçamento")),
  })
}
