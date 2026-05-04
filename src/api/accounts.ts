import { api } from "@/api/client"
import type { Account, ApiEnvelope } from "@/types/api"

export async function listAccounts(): Promise<Account[]> {
  const { data } = await api.get<ApiEnvelope<Account[]>>("/api/accounts", {
    params: { page: 0, size: 100, sort: "name" },
  })
  return data.data
}
