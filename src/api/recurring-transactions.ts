import { api } from "@/api/client"
import type {
  ApiEnvelope,
  CreateRecurringTransactionPayload,
  RecurringTransaction,
} from "@/types/api"

// O backend pagina a listagem (default size=10). Recorrentes são poucas por
// usuário, então pedimos uma página grande e exibimos tudo num grid, sem UI de
// paginação (mesma estratégia simples da tela de Metas).
export async function listRecurringTransactions(): Promise<
  RecurringTransaction[]
> {
  const { data } = await api.get<ApiEnvelope<RecurringTransaction[]>>(
    "/api/recurring-transactions",
    { params: { page: 0, size: 200, sort: "id" } },
  )
  return data.data
}

export async function createRecurringTransaction(
  payload: CreateRecurringTransactionPayload,
): Promise<RecurringTransaction> {
  const { data } = await api.post<ApiEnvelope<RecurringTransaction>>(
    "/api/recurring-transactions",
    payload,
  )
  return data.data
}

export async function updateRecurringTransaction(
  id: number,
  payload: CreateRecurringTransactionPayload,
): Promise<RecurringTransaction> {
  const { data } = await api.put<ApiEnvelope<RecurringTransaction>>(
    `/api/recurring-transactions/${id}`,
    payload,
  )
  return data.data
}

export async function deleteRecurringTransaction(id: number): Promise<void> {
  await api.delete(`/api/recurring-transactions/${id}`)
}
