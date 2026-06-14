import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import * as recurringApi from "@/api/recurring-transactions"
import type { CreateRecurringTransactionPayload } from "@/types/api"

export const recurringKeys = {
  all: ["recurring-transactions"] as const,
}

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

export function useRecurringList() {
  return useQuery({
    queryKey: recurringKeys.all,
    queryFn: recurringApi.listRecurringTransactions,
  })
}

export function useCreateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRecurringTransactionPayload) =>
      recurringApi.createRecurringTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recurringKeys.all })
      toast.success("Recorrência criada")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao criar recorrência")),
  })
}

export function useUpdateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: CreateRecurringTransactionPayload
    }) => recurringApi.updateRecurringTransaction(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recurringKeys.all })
      toast.success("Recorrência atualizada")
    },
    onError: (e) =>
      toast.error(extractMessage(e, "Falha ao atualizar recorrência")),
  })
}

export function useDeleteRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => recurringApi.deleteRecurringTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: recurringKeys.all })
      toast.success("Recorrência excluída")
    },
    onError: (e) =>
      toast.error(extractMessage(e, "Falha ao excluir recorrência")),
  })
}
