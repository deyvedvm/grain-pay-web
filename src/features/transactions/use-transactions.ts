import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import * as transactionsApi from "@/api/transactions"
import { listCategories } from "@/api/categories"
import { listAccounts } from "@/api/accounts"
import type {
  CreateTransactionPayload,
  TransactionFilters,
} from "@/types/api"

export const transactionsKeys = {
  all: ["transactions"] as const,
  list: (params: object) => [...transactionsKeys.all, "list", params] as const,
}

export const PAGE_SIZE = 20

export function useTransactionsList(filters: TransactionFilters, page: number) {
  return useQuery({
    queryKey: transactionsKeys.list({ ...filters, page, size: PAGE_SIZE }),
    queryFn: () =>
      transactionsApi.listTransactions({ ...filters, page, size: PAGE_SIZE }),
    placeholderData: (prev) => prev,
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAccountsQuery() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: listAccounts,
    staleTime: 5 * 60 * 1000,
  })
}

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      transactionsApi.createTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionsKeys.all })
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
      toast.success("Transação criada")
    },
    onError: (error) => toast.error(extractMessage(error, "Falha ao criar transação")),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateTransactionPayload }) =>
      transactionsApi.updateTransaction(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionsKeys.all })
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
      toast.success("Transação atualizada")
    },
    onError: (error) => toast.error(extractMessage(error, "Falha ao atualizar transação")),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => transactionsApi.deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionsKeys.all })
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
      toast.success("Transação excluída")
    },
    onError: (error) => toast.error(extractMessage(error, "Falha ao excluir transação")),
  })
}
