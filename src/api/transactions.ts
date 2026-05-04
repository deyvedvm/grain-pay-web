import { api } from "@/api/client"
import type {
  ApiEnvelope,
  CreateTransactionPayload,
  Transaction,
  TransactionFilters,
} from "@/types/api"

export type ListTransactionsParams = {
  page: number
  size: number
  sort?: string
} & TransactionFilters

export async function listTransactions(
  params: ListTransactionsParams,
): Promise<Transaction[]> {
  const { data } = await api.get<ApiEnvelope<Transaction[]>>("/api/transactions", {
    params,
  })
  return data.data
}

export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<Transaction | Transaction[]> {
  const { data } = await api.post<ApiEnvelope<Transaction | Transaction[]>>(
    "/api/transactions",
    payload,
  )
  return data.data
}

export async function updateTransaction(
  id: number,
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  const { data } = await api.put<ApiEnvelope<Transaction>>(
    `/api/transactions/${id}`,
    payload,
  )
  return data.data
}

export async function deleteTransaction(id: number): Promise<void> {
  await api.delete(`/api/transactions/${id}`)
}
