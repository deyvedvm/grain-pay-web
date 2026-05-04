import { api } from "@/api/client"
import type { Account, ApiEnvelope, CreateAccountPayload } from "@/types/api"

export async function listAccounts(): Promise<Account[]> {
  const { data } = await api.get<ApiEnvelope<Account[]>>("/api/accounts", {
    params: { page: 0, size: 100, sort: "name" },
  })
  return data.data
}

export async function createAccount(
  payload: CreateAccountPayload,
): Promise<Account> {
  const { data } = await api.post<ApiEnvelope<Account>>("/api/accounts", payload)
  return data.data
}

export async function updateAccount(
  id: number,
  payload: CreateAccountPayload,
): Promise<Account> {
  const { data } = await api.put<ApiEnvelope<Account>>(`/api/accounts/${id}`, payload)
  return data.data
}

export async function deleteAccount(id: number): Promise<void> {
  await api.delete(`/api/accounts/${id}`)
}
