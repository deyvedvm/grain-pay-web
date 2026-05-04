import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import * as accountsApi from "@/api/accounts"
import type { CreateAccountPayload } from "@/types/api"

const ACCOUNTS_KEY = ["accounts"] as const

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

export function useAccountsList() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: accountsApi.listAccounts,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => accountsApi.createAccount(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      toast.success("Conta criada")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao criar conta")),
  })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateAccountPayload }) =>
      accountsApi.updateAccount(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      toast.success("Conta atualizada")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao atualizar conta")),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => accountsApi.deleteAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      qc.invalidateQueries({ queryKey: ["transactions"] })
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
      toast.success("Conta excluída")
    },
    onError: (e) => toast.error(extractMessage(e, "Falha ao excluir conta")),
  })
}
